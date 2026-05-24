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
} from '../../types';
import TimetableUtils, { CommonUtils } from '../utils';
import DailyTimetableAssignManager from './assign-manager';
import { DailyTimetableDataContext } from './data-context';

/*
 * 연속 수업 배정을 관리한다
 */
export default class ConsecutiveLessonManager extends DailyTimetableAssignManager {
  constructor(context: DailyTimetableDataContext) {
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

    lessonConfs.forEach((conf) => {
      classIdSet.add(conf.classId);
      teacherIdSet.add(conf.teacherId);
    });

    // 학급과 교사의 배정 가능한 시간을 찾는다.
    const remainingPeriods = this.getRemainingPeriodsByClassAndTeacher(
      classIdSet,
      teacherIdSet
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
      overview.remainingLessonConfs.filter((conf) =>
        CommonUtils.isNotEmptyString(conf.consecutivePeriod)
      )
    );
  }

  // 전제 리셋
  resetAllAssignments(): void {
    // @TODO: implement
  }
}
