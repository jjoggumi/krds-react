import {
  PeriodTuple,
  Lesson,
  LessonConf,
  LessonTeacher,
  ClassPeriodOverview,
  TeacherPeriodOverview,
  PeriodOverview,
  ASSIGN_RESULT,
  AssignPeriodResult,
} from '../types';
import { TimetableDataContext } from './timetable-data-context';
import TimetableUtils, { CommonUtils } from './utils';
import TimetableAssignManager from './timetable-assign-manager';

/*
 * 연속 수업 배정을 관리한다
 */
export default class ConsecutiveLessonManager extends TimetableAssignManager {
  constructor(context: TimetableDataContext) {
    super(context);
  }

  getUnassignedLessonConfs(): LessonConf[] {
    const unassignedLessonConfs =
      this.currentUnassignedConsecutiveLessonConfs();

    if (unassignedLessonConfs.length === 0) {
      return [];
    }

    // <연속 시수 여부/연속 시수 크기> 가 가장 큰 값을 가진 연속 수업을 찾는다.
    const lessonConf = unassignedLessonConfs.reduce((bestConf, currentConf) => {
      const bestConsecutivePeriod = bestConf.consecutivePeriod || '';
      const currentConsecutivePeriod = currentConf.consecutivePeriod || '';

      const bestMax = Math.max(...bestConsecutivePeriod.split(',').map(Number));

      const currentMax = Math.max(
        ...currentConsecutivePeriod.split(',').map(Number)
      );

      return currentMax > bestMax ? currentConf : bestConf;
    });

    return lessonConf ? [lessonConf] : [];
  }

  findAssignPeriodsWithLessonConfs(
    lessonConfs: LessonConf[]
  ): AssignPeriodResult {
    if (lessonConfs.length === 0) {
      return { assignPeriods: [] };
    }

    // 배정 가능한 수업 시간을 찾기 위해,
    // 수업에 속한 학급의 remainingLessonPeriods와 교사의 remainingLessonPeriods의 합집합을 구한다.
    const classIdSet = new Set<string>();
    const teacherIdSet = new Set<string>();
    const specialtyRoomIdSet = new Set<string>();

    lessonConfs.forEach((conf) => {
      classIdSet.add(conf.classId);
      teacherIdSet.add(conf.teacherId);
      if (conf.specialtyRoomId) {
        specialtyRoomIdSet.add(conf.specialtyRoomId);
      }
    });

    // 학급과 교사의 배정 가능한 시간을 찾는다.
    const remainingPeriods = this.getRemainingPeriodsByClassAndTeacherAndSpecialtyRoom(
      classIdSet,
      teacherIdSet,
      specialtyRoomIdSet
    );

    if (!remainingPeriods || remainingPeriods.length === 0) {
      // 배정 가능한 시간이 없는 경우
      return { assignPeriods: [] };
    }

    // 동일한 수업이 이미 배정되어있는 시간을 찾는다.
    const lessonConf = lessonConfs[0];

    const classId = lessonConf.classId;
    const courseId = lessonConf.courseId;
    const { classPeriodOverviewMap: periodOverviewMap } = this._context;
    const sameCourseAssignedPeriods = periodOverviewMap[classId].assignedLessons
      .filter((lesson) => {
        return lesson.courseId === courseId;
      })
      .map((lesson) => [lesson.dayOfWeek, lesson.period] as PeriodTuple);

    const consecutivePeriod = lessonConf.consecutivePeriod || '';
    return this.findAssignPeriods(
      sameCourseAssignedPeriods,
      remainingPeriods,
      consecutivePeriod
    );
  }

  currentUnassignedConsecutiveLessonConfs(): LessonConf[] {
    // 연속수업 시간표에 배정되지 않은 수업 목록
    const { classPeriodOverviews: periodOvervew } = this._context;

    return periodOvervew.flatMap((overview) =>
      overview.remainingLessonConfs.filter((conf) => {
        // 특별실 연속수업 셋팅
        const { specialtyRoomId, courseId, teacherId, consecutivePeriod } = conf;
        if (CommonUtils.isNotEmptyString(specialtyRoomId)) {
          const specialtyRoomConsecutivePeriod = this.getConsecutivePeriodIfSpecialtyRoom(
            specialtyRoomId!,
            courseId,
            teacherId
          );
          conf.consecutivePeriod = specialtyRoomConsecutivePeriod || consecutivePeriod;
        }

        return CommonUtils.isNotEmptyString(conf.consecutivePeriod)
      })
    );
  }

  getConsecutivePeriodIfSpecialtyRoom(specialtyRoomId: string, courseId: string, teacherId: string): string | undefined  {
    const specialtyRoomConf = this._context.specialtyRoomConfs.find(
      (conf) => conf.specialtyRoomId === specialtyRoomId && conf.courseId === courseId && conf.teacherId === teacherId
    );

    return specialtyRoomConf?.consecutivePeriod;
  }

  // 전제 리셋
  resetAllAssignments(): void {
    const { classPeriodOverviews: periodOvervews } = this._context;
    
    // 고정 수업과 수동 배정 수업을 제외한 수업 목록
    const exceptedLessonSets = periodOvervews
      .flatMap((overview) =>
        overview.assignedLessons.filter(
          (lesson) => lesson.isFixedCourse || lesson.isManuallyAssigned
        )
      )
      .map((lesson) => {
        const { dayOfWeek, period, classId } = lesson;
        return `${classId}_${dayOfWeek}_${period}`;
      });

    const resetLessonConfs = periodOvervews.flatMap((overview) => {
      // lessonConf에 consecutivePeriod가 없는 경우가 있으므로 (특별실)
      // lesson에 consecutiveGroupId가 있는 교시를 찾는다.
      const assignedKeys = overview.assignedLessons.filter((lesson) => {
        if (CommonUtils.isEmptyString(lesson.consecutiveGroupId)) {
          return false;
        }

        const key = `${lesson.classId}_${lesson.dayOfWeek}_${lesson.period}`;
        return !exceptedLessonSets.includes(key);
      }).map((lesson) => {
        const { dayOfWeek, period, classId } = lesson;
        return `${classId}_${dayOfWeek}_${period}`;
      });

      return overview.remainingLessonConfs.filter((conf) => {
        const key = `${conf.classId}_${conf.dayOfWeek}_${conf.period}`;
        return assignedKeys.includes(key);
      });
    });

    resetLessonConfs.forEach((conf) => {
      const classPeriodOverview =
        this._context.classPeriodOverviewMap[conf.classId];
      this.resetAssignedLessonConf(conf, classPeriodOverview);

      const teacherPeriodOverview =
        this._context.teacherPeriodOverviewMap[conf.teacherId];
      this.resetAssignedLessonConf(conf, teacherPeriodOverview);

      // 특별실 복구 처리, LessonConf로 처리
      this.increaseSpecialtyRoomFreePeriodByLessonConf(conf);
    });
  }
}
