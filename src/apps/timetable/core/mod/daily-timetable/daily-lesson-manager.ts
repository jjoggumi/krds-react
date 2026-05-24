import {
  PeriodTuple,
  LessonConf,
  ASSIGN_RESULT,
  AssignPeriodResult,
  AssignResult,
  Lesson,
} from '../../types';

import TimetableUtils from '../utils';
import DailyTimetableAssignManager from './assign-manager';
import { DailyTimetableDataContext } from './data-context';

export interface InitAssignmentOption {
  autoAssign: boolean;
  fixedConcurrent: boolean;
  manualAssign: boolean;
  teacherFreePeriods: boolean;
}

/*
 * 수업 배정시 피해야 할 상황
 *   - 동일 학급에 동일 교사가 하루에 두번 이상 수업을 하지 않도록 한다.
 *     - 동일 교사/동일 과목의 수업이 두 번 이상 배정되는 경우
 *     - 동일 교사/다른 과목의 수업이 두 번 이상 배정되는 경우
 *   - 유사과목 같은 요일 중복
 *   - 교사가 하루에 5시간 이상 수업을 배정 받음
 *   - 교과별 순배. 각 반의 시수가 동일하게 진행되도록 배정
 *   - 연속 3시간 이상 배정.
 *  - 점심시간 전후 연속 수업 배정
 *  - 1교시만 3회 이상 배정
 *  - 1교시 연속 2회 이상 배정
 *  - 동일 과목은 학급별 오전/오후 고르게 배정
 */

/*
 * 수업 배정을 관리한다
 */
export default class DailyLessonManager extends DailyTimetableAssignManager {
  private _currentClassId = '';
  private _maxTryClassCount = 100;

  classResetCount: Record<string, number> = {};

  constructor(context: DailyTimetableDataContext) {
    super(context);
  }

  /*
  autoAssignWithLessonConfs(lessonConfs: LessonConf[]): AssignResult {
    if (this._currentClassId !== lessonConfs[0].classId) {
      this._currentClassId = lessonConfs[0].classId;
      this.classResetCount = {};
    }

    // 수업을 배정할 시간을 찾는다.
    const { assignPeriods, consecutiveGroupId } =
      this.findAssignPeriodsWithLessonConfs(lessonConfs);

    // 배정 가능한 시간이 없는 경우
    if (assignPeriods.length === 0) {
      const classId = lessonConfs[0].classId;
      const retryClassCount = this.classResetCount[classId] || 0;

      if (retryClassCount >= this._maxTryClassCount) {
        const cls = this._context.classMap[classId];
        this._context.printLog(
          `[${this.constructor.name}]`,
          `배정 가능한 시간이 없습니다. (${cls.grade}0${cls.classNumber})`
        );
        return { result: ASSIGN_RESULT.FAIL };
      }

      // 리셋 후 재시도
      this.classResetCount[classId] = retryClassCount + 1;
      this._totalRetryCount += 1;

      this.resetAssignmentsByClass(lessonConfs[0].classId);

      return { result: ASSIGN_RESULT.RETRY };
    }

    // assignPeriods 만큼 수업을 배정한다.
    const assignedLessons = [] as Lesson[];
    const results = [] as ASSIGN_RESULT[];
    lessonConfs.map((conf) => {
      assignPeriods.forEach((assignPeriod) => {
        const assignResult = this.assignLessonConf(assignPeriod, conf, consecutiveGroupId);
        const { result, lessons } = assignResult;
        results.push(result);
        if( lessons && lessons.length > 0 ) {
          assignedLessons.push(...lessons);
        }        
      });
    });

    // results 중 하나라도 성공이 아닌경우 실패로 처리
    if (results.some((result) => result !== ASSIGN_RESULT.SUCCESS)) {
      this._context.printLog('수업 배정 실패 ---', results);
      return { result: ASSIGN_RESULT.FAIL };
    }

    return { 
      result: ASSIGN_RESULT.SUCCESS,
      lessons: assignedLessons
    };
  }
  */

  getUnassignedLessonConfs(): LessonConf[] {
    const unassignedLessonConfs = this.currentUnassignedLessonConfs();

    if (unassignedLessonConfs.length === 0) {
      this._context.printLog('배정되지 않은 수업이 없습니다.');
      return [];
    }

    // return [unassignedLessonConfs[0]];

    // 랜덤하게 수업을 선택: 시수가 많은 순으로 하면 오히려 고르게 퍼지지 않는다. 2024.12.05, notbadlife
    const randIdx = Math.floor(Math.random() * unassignedLessonConfs.length);
    return [unassignedLessonConfs[randIdx]];
  }

  findAssignPeriodsWithLessonConfs(
    lessonConfs: LessonConf[]
  ): AssignPeriodResult {
    if (lessonConfs.length === 0) {
      return { assignPeriods: [] };
    }

    const lessonConf = lessonConfs[0];

    const classId = lessonConf.classId;
    const courseId = lessonConf.courseId;

    // 배정 가능한 수업 시간을 찾기 위해,
    // 수업에 속한 학급과 교사의 remainingLessonPeriods 교집합을 구한다.
    const classIdSet = new Set<string>([classId]);
    const teacherIdSet = new Set<string>();

    lessonConfs.forEach((conf) => {
      classIdSet.add(conf.classId);
      teacherIdSet.add(conf.teacherId);
    });

    // 학급과 교사의 각 remainingLessonPeriods의 교집합
    const remainingPeriods = this.getRemainingPeriodsByClassAndTeacher(
      classIdSet,
      teacherIdSet
    );

    if (!remainingPeriods || remainingPeriods.length === 0) {
      // 배정 가능한 시간이 없음
      return { assignPeriods: [] };
    }

    // 동일한 수업이 이미 배정되어있는 시간을 찾는다.
    const { classPeriodOverviewMap: periodOverviewMap } = this._context;
    const sameCourseAssignedPeriods = periodOverviewMap[classId].assignedLessons
      .filter((lesson) => {
        /* 유사 과목은 동일 수업과 별도로 처리하자.
        const lessonCourse = this._context.courseMap[lesson.courseId];
        if (
          course.similarCourseConfId &&
          lessonCourse.similarCourseConfId === course.similarCourseConfId
        ) {
          // 유사 과목 확인
          return true;
        }
        */

        return lesson.courseId === courseId;
      })
      .map((lesson) => [lesson.dayOfWeek, lesson.period] as PeriodTuple);

    // 2025.02.24, notbadlife
    // - 과목 반별 순배를 위한 로직이 필요하다.
    // - 과목의 시수로 수업 요일을 나누어, 평균 거리를 계산한다.
    const course = this._context.courseMap[courseId];    
    const periodCount = course && course.periodCount ? course.periodCount : 1;
    const classDayCount = this._context.classDayCount;
    const lastDay = sameCourseAssignedPeriods.map((p) => p[0] || 0).sort()[0];

    const daySeq = TimetableUtils.generateDaySequence(
      classDayCount,
      lastDay,
      periodCount
    );

    const consecutivePeriod = lessonConf.consecutivePeriod || '';
    const findedPeriods = this.findAssignPeriods(
      sameCourseAssignedPeriods,
      remainingPeriods,
      consecutivePeriod,
      teacherIdSet,
      daySeq
    );

    return findedPeriods;
  }

  findAssignPeriods(
    sameCourseAssignedPeriods: PeriodTuple[],
    remainingPeriods: PeriodTuple[],
    consecutivePeriod = '',
    teacherIdSet: Set<string> = new Set<string>(),
    daySeq: number[] = []
  ): AssignPeriodResult {
    // // 배정할 시수 - 연속 시수인 경우 이미 배정된 연속 시수를 제거하고 남은 시수를 찾는다.
    const assignPeriodCount = this.getAssignPeriodCount(
      sameCourseAssignedPeriods,
      consecutivePeriod
    );

    // 연속 시수가 2이상인 경우
    if (assignPeriodCount > 1) {
      return this.findConsecutiveAssignPeriods(
        remainingPeriods,
        assignPeriodCount
      );
    }

    // 동일 요일에 배정되지 않도록, 남은 시수와 이미 배정된 시수를 비교하여 배정 가능한 시간을 찾는다.
    // @TODO: 유사과목은 별도 처리
    const assignablePeriods = TimetableUtils.periodTuplesExcludeByFirstValue(
      remainingPeriods,
      sameCourseAssignedPeriods
    );

    if (!assignablePeriods || assignablePeriods.length === 0) {
      return {
        assignPeriods: [],
        consecutiveGroupId: '',
      };
    }

    const { teacherPeriodOverviewMap, timetableConfig } = this._context;

    // remainingPeriods 중에서 요일별로 그룹화하여 가장 많은 요일을 찾는다.
    const teacherRemainingPeriods: PeriodTuple[][] = [];
    teacherIdSet.forEach((teacherId) => {
      teacherRemainingPeriods.push(
        teacherPeriodOverviewMap[teacherId].remainingLessonPeriods
      );
    });

    const teacherPeriods = TimetableUtils.removeDuplicatesWithPeriodTuples(
      teacherRemainingPeriods.flat()
    );

    const groupedByTeacherDay = teacherPeriods.reduce<Record<number, number[]>>(
      (acc, [day, period]) => {
        if (!acc[day]) acc[day] = [];
        acc[day].push(period);
        return acc;
      },
      {}
    );

    // 남은 시수 중 가장 많은 요일부터 배정하도록
    // 하루 평균 시수가 모두 차있는 경우 제거하고 시작
    const overloadedHourLimit = 3; // 교사별 일별 최대 시수 계산: 초기값은 5
    const dayKeys = Object.keys(groupedByTeacherDay).map(Number);
    const { maxPeriod } = timetableConfig;

    // 교사별 일별 시수를 최소로 유지하나, 불가능한 경우 하나씩 늘리면서 확인
    for (
      let limitPeriod = overloadedHourLimit;
      limitPeriod <= maxPeriod;
      limitPeriod++
    ) {
      // 교사별 일별 시수 최소값 이내면 제외
      const remainLimit = maxPeriod - limitPeriod;
      const assignDayKeys = dayKeys.filter((day) => {
        return groupedByTeacherDay[day].length > remainLimit;
      });

      // 순배 우선 순위 요일로 정렬
      assignDayKeys.sort((a, b) => {
        const dayA = daySeq.indexOf(a);
        const dayB = daySeq.indexOf(b);

        if (dayA === dayB) {
          return groupedByTeacherDay[b].length - groupedByTeacherDay[a].length;
        }

        return dayA - dayB;
      });

      const remainingPeriodsGroupedByDay = assignablePeriods.reduce<
        Record<number, PeriodTuple[]>
      >((acc, [day, period]) => {
        if (!acc[day]) acc[day] = [];
        acc[day].push([day, period]);
        return acc;
      }, {});

      for (const day of assignDayKeys) {
        const periods = remainingPeriodsGroupedByDay[day] || [];
        if (periods.length === 0) {
          continue;
        }

        const assignPeriod = TimetableUtils.selectNewTime(
          sameCourseAssignedPeriods,
          periods
        );

        if (assignPeriod) {
          return {
            assignPeriods: [assignPeriod],
            consecutiveGroupId: '',
          };
        }
      }
    }

    return {
      assignPeriods: [],
      consecutiveGroupId: '',
    };
  }

  // 학급별 과목 시수 순서로 배정
  currentUnassignedLessonConfs(): LessonConf[] {
    const { classPeriodOverviews: periodOvervews } = this._context;

    // remainingLessonConfs가 비어있지 않은 첫번째 학급의 remainingLessonConfs를 반환
    const overview = periodOvervews.find(
      (overview) => overview.remainingLessonConfs.length > 0
    );

    if (!overview) {
      return [];
    }

    // 과목의 시수가 큰 순서로 배정하도록 함
    return overview.remainingLessonConfs.sort((a, b) => {
      const courseA = this._context.courseMap[a.courseId];
      const courseB = this._context.courseMap[b.courseId];

      const periodCountA = courseA && courseA.periodCount ? courseA.periodCount : 0;
      const periodCountB = courseB && courseB.periodCount ? courseB.periodCount : 0;

      return periodCountB - periodCountA;
    });
  }

  resetAllAssignments(): void {
    // 전체 시간표는 리셋이 없음
  }

  /*
  // 전제 리셋
  resetAllAssignments(): void {
    const { classPeriodOverviews: periodOvervews } = this._context;
    periodOvervews.forEach((overview) => {
      if (overview.assignedLessonConfs.length > 0) {
        this.resetAssignmentsByClass(overview.cls.classId);
      }
    });
  }
  */
}
