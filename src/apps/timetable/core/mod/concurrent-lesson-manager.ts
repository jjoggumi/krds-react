import { v4 as uuidv4 } from 'uuid';
import {
  PeriodTuple,
  LessonConf,
  ASSIGN_RESULT,
  AssignPeriodResult,
  AssignResult,
} from '../types';
import { TimetableDataContext } from './timetable-data-context';
import TimetableUtils, { CommonUtils } from './utils';
import TimetableAssignManager from './timetable-assign-manager';

// 동시 수업 점유 시수 계산 로직을 동일하게 적용
// @TODO: 효과 검증 후 ConcurrentCourseConf와 통합 필요
// -->

// 동시 수업 충돌을 비교하기 위한 데이터
interface CombinedIdsAndPeriodOfConcurrentCourse {
  concurrentCourseId: string;
  periodCount: number;
  classIdSet: Set<string>;
  teacherIdSet: Set<string>;
}

type CombinedConcurrentCourses = CombinedIdsAndPeriodOfConcurrentCourse[];

// 그룹 내부의 누적 tIds와 cIds를 관리하기 위한 인터페이스
interface CombinedConcurrentCourseGroup {
  courses: CombinedConcurrentCourses;
  unionTeacherIds: Set<string>;
  unionClassIds: Set<string>;
}
// <-- 동시 수업 점유 시수 계산 로직을 동일하게 적용

/*
 * 동시 수업 배정을 관리한다
 */
export default class ConcurrentLessonManager extends TimetableAssignManager {
  private _maxTryCount = 50;

  constructor(context: TimetableDataContext) {
    super(context);
  }

  // 동시 수업 점유 시수 계산 로직을 동일하게 적용
  // @TODO: 효과 검증 후 ConcurrentCourseConf와 통합 필요
  // -->

  buildOccurrences(
    courses: CombinedIdsAndPeriodOfConcurrentCourse[]
  ): CombinedIdsAndPeriodOfConcurrentCourse[] {
    const occurrences: CombinedIdsAndPeriodOfConcurrentCourse[] = [];
    for (const course of courses) {
      for (let i = 0; i < course.periodCount; i++) {
        occurrences.push({
          concurrentCourseId: course.concurrentCourseId,
          periodCount: course.periodCount,
          // 복제 시 원본의 Set을 그대로 사용하되, 이후 변경 시 깊은 복사를 고려해야 함
          classIdSet: new Set(course.classIdSet),
          teacherIdSet: new Set(course.teacherIdSet),
        });
      }
    }
    return occurrences;
  }

  getUnassignedWithGreedyGroup(): CombinedConcurrentCourseGroup[] {
    const unassignedConcurrentCourseIds = this.getUnassignedConcurrentCourseIdsNotConsecutive();
      // this.getUnassignedConcurrentCourseIds();

    // 배정되지 않은 동시 수업의 과목id
    // const concurrentCourseIds = Object.keys(unassignedLessonConfs);
    if (
      !unassignedConcurrentCourseIds ||
      unassignedConcurrentCourseIds.length === 0
    ) {
      return [];
    }

    // 충돌을 조회하기 위한 데이터 생성
    const conflictData: Record<string, CombinedIdsAndPeriodOfConcurrentCourse> =
      {};

    const courses: CombinedIdsAndPeriodOfConcurrentCourse[] = [];
    unassignedConcurrentCourseIds.forEach((courseId: string) => {
      const conflictTeacherIdSet = new Set<string>();
      const conflictClassIdSet = new Set<string>();

      const periodCount = this._context.courseMap[courseId].periodCount || 0;
      //const consecutivePeriod = this._context.concurrentCourseConfMap[courseId].consecutivePeriod;

      this._context.lessonConfsByConcurrentCourse[courseId].forEach((conf) => {
        conflictTeacherIdSet.add(conf.teacherId);
        conflictClassIdSet.add(conf.classId);
      });

      conflictData[courseId] = {
        concurrentCourseId: courseId,
        classIdSet: conflictClassIdSet,
        teacherIdSet: conflictTeacherIdSet,
        periodCount: periodCount || 0,
      };

      courses.push(conflictData[courseId]);
    });

    const occurrences = this.buildOccurrences(courses);
    const greedyGroups = this.greedyGroup(
      occurrences
    ) as CombinedConcurrentCourseGroup[];

    // courses가 큰 것이 우선
    greedyGroups.sort((a, b) => {
      const aSize = a.courses.length;
      const bSize = b.courses.length;
      return bSize - aSize;
    });

    return greedyGroups;
  }


  greedyGroup(
    occurrences: CombinedIdsAndPeriodOfConcurrentCourse[]
  ): CombinedConcurrentCourseGroup[] {
    // 동시 수업의 점유 시수를 구한다.
    const groups: CombinedConcurrentCourseGroup[] = [];

    // occurrences를 충돌 가능성이 큰 순서대로 정렬 (tIds와 cIds 개수 합 내림차순)
    const sortedOccurrences = [...occurrences].sort((a, b) => {
      const aScore = a.teacherIdSet.size + a.classIdSet.size;
      const bScore = b.teacherIdSet.size + b.classIdSet.size;
      return bScore - aScore;
    });

    for (const occ of sortedOccurrences) {
      let placed = false;
      for (const group of groups) {
        if (
          !TimetableUtils.hasIntersectionWithStringSets(
            group.unionTeacherIds,
            occ.teacherIdSet
          ) &&
          !TimetableUtils.hasIntersectionWithStringSets(
            group.unionClassIds,
            occ.classIdSet
          )
        ) {
          // courses는 perdiodCount 의 내림차순으로 정렬
          group.courses.push(occ);
          group.courses.sort((a, b) => {
            const aSize = a.periodCount;
            const bSize = b.periodCount;
            return bSize - aSize;
          });

          occ.teacherIdSet.forEach((tid) => group.unionTeacherIds.add(tid));
          occ.classIdSet.forEach((cid) => group.unionClassIds.add(cid));
          placed = true;
          break;
        }
      }

      if (!placed) {
        groups.push({
          courses: [occ],
          unionTeacherIds: new Set(occ.teacherIdSet),
          unionClassIds: new Set(occ.classIdSet),
        });
      }
    }

    // courses가 작은 것이 우선
    return groups.sort((a, b) => {
      const aSize = a.courses.length;
      const bSize = b.courses.length;
      return aSize - bSize;
    });
  }

  // <-- 동시 수업 점유 시수 계산 로직을 동일하게 적용

  // 미배정 수업을 한번에 가져오는 로직으로 변경하기 위해 오버라이드
  autoAssignLessons(): AssignResult {
    // return this.autoAssignLessonsWithGreedy();
    this._totalRetryCount = 0;

    // 동시/연속 수업 인 수업 부터 배정
    const assignResult = this.autuAssignConsecutiveConcurrentLessons();

    if (assignResult.result === ASSIGN_RESULT.FAIL) {
      return assignResult;
    }

    return this.autoAssignLessonsWithGreedyGroups();
  }


  autuAssignConsecutiveConcurrentLessons(): AssignResult {
    let assignResult = { result: ASSIGN_RESULT.FAIL };

    do {
      const lessonConfs = this.getUnassignedConsecutiveLessonConfs();

      if (lessonConfs.length === 0) {
        return { result: ASSIGN_RESULT.EMPTY };
      }

      assignResult = this.autoAssignWithLessonConfs(lessonConfs);
    } while (
      assignResult.result === ASSIGN_RESULT.SUCCESS ||
      assignResult.result === ASSIGN_RESULT.RETRY
    );
    
    return assignResult;
  }


  // 일반적인 동시 수업 배정
  autoAssignRemainedConcurrentLessons(): AssignResult {
    let assignResult = { result: ASSIGN_RESULT.FAIL };

    do {
      const lessonConfs = this.getUnassignedRemainedLessonConfs();

      if (lessonConfs.length === 0) {
        return { result: ASSIGN_RESULT.EMPTY };
      }

      assignResult = this.autoAssignWithLessonConfs(lessonConfs);

    } while (
      assignResult.result === ASSIGN_RESULT.SUCCESS ||
      assignResult.result === ASSIGN_RESULT.RETRY
    );
    
    return assignResult;
  }


  autoAssignLessonsWithGreedyGroups(): AssignResult {
    let assignResult = { result: ASSIGN_RESULT.SUCCESS };

    do {
      const groups = this.getUnassignedWithGreedyGroup();


      if (groups.length === 0) {
        return assignResult;
      }

      // 첫번째 그룹의 동시 수업 아이디 목록을 가져온다. (동시 진행 가능 수업)
      const concurrentCourseIds = groups[0].courses.map(
        (course) => course.concurrentCourseId
      );

      // 동시 수업의 시수 목록을 가져온다. 동시 배정이 가능한 하나 이상의 동시 수업일 수 있다.
      const lessonConfs = concurrentCourseIds.flatMap((courseId) => {
        return this._context.lessonConfsByConcurrentCourse[courseId] || [];
      });


      if (lessonConfs.length === 0) {
        return { result: ASSIGN_RESULT.EMPTY };
      }

      assignResult = this.autoAssignWithLessonConfs(lessonConfs, true);

    } while (
      assignResult.result === ASSIGN_RESULT.SUCCESS ||
      assignResult.result === ASSIGN_RESULT.RETRY
    );

    return assignResult;
  }

  
  autoAssignWithLessonConfs(lessonConfs: LessonConf[], isIgnoreConsecutivePeriod = false): AssignResult {
    // 수업을 배정할 시간을 찾는다.
    const { assignPeriods, consecutiveGroupId } =
      this.findAssignPeriodsWithLessonConfs(lessonConfs, isIgnoreConsecutivePeriod);

      

    if (assignPeriods.length === 0) {
      if (this._totalRetryCount > this._maxTryCount) {
        this._context.printLog(
          `<동시수업> 최대 시도 횟수(${this._totalRetryCount}회) 초과 [${this.constructor.name}]`
        );

        return { result: ASSIGN_RESULT.FAIL };
      }

      this._totalRetryCount += 1;
      this.resetAllAssignments(isIgnoreConsecutivePeriod);

      this._context.printLog(
        '<동시수업> 배정 가능한 시간이 없습니다.',
        `${this._totalRetryCount}회 시도 [${this.constructor.name}]`
      );

      return { result: ASSIGN_RESULT.RETRY };
    }

    // assignPeriods 만큼 수업을 배정한다.
    const results = [] as ASSIGN_RESULT[];

    // 동시 수업 별 consecutiveGroupId를 별도로 관리하기 위함
    const groupIdMapByCourse = new Map<string, string>();
    if (consecutiveGroupId) { // 동시 수업의 연속 시수 그룹 아이디가 있는 경우. 별도 과목 별로 생성
      lessonConfs.forEach((conf) => {
        const courseKey = `${conf.courseId}:${conf.classId}`;
        if(groupIdMapByCourse.has(courseKey)) {
          return;
        }
        groupIdMapByCourse.set(courseKey, uuidv4());
      });
    }
    
    lessonConfs.map((conf) => {      
      const courseKey = `${conf.courseId}:${conf.classId}`;
      const groupId = groupIdMapByCourse.get(courseKey) || consecutiveGroupId;

      assignPeriods.forEach((assignPeriod) => {
        const assignResult = this.assignLessonConf(assignPeriod, conf, groupId)
        results.push(assignResult.result);
      });
    });

    // results 중 하나라도 성공이 아닌경우 실패로 처리
    if (results.some((result) => result !== ASSIGN_RESULT.SUCCESS)) {
      this._context.printLog('수업 배정 실패 ---', results);
      return { result: ASSIGN_RESULT.FAIL };
    }

    return { result: ASSIGN_RESULT.SUCCESS };
  }

  getUnassignedConsecutiveLessonConfs(): LessonConf[] {
    const concurrentLessonConfMap =
      this.currentUnassignedConcurrentLessonConfMap();

    // 배정되지 않은 동시 수업의 과목id
    const concurrentCourseIds = Object.keys(concurrentLessonConfMap);
    if (!concurrentCourseIds || concurrentCourseIds.length === 0) {
      return [];
    }

    // <연속 시수 여부/연속 시수 크기> 가 가장 큰 값을 가진 동시 수업을 찾는다.
    const { concurrentCourseConfMap: confMap } = this._context;

    const consecutiveConcurrentCourseIds = concurrentCourseIds.filter( id => confMap[id].consecutivePeriod );
    if (consecutiveConcurrentCourseIds.length === 0) {
      return [];
    }

    const ccId = consecutiveConcurrentCourseIds.reduce((bestId, currentId) => {
        const bestMax = Math.max(
          ...confMap[bestId].consecutivePeriod
            .split(',')
            .map(Number)
        );

        const currentMax = Math.max(
          ...confMap[currentId].consecutivePeriod
            .split(',')
            .map(Number)
        );

        // console.log('Comparing consecutive periods:', bestMax, currentMax);

        return currentMax > bestMax ? currentId : bestId;
      });

    // 시수에 따라 동일한 lessonConf가 여러번 포함될 수 있으므로 중복을 제거한다.
    const lessonConfs = this.uniqueLesssonConfsFrom(
      concurrentLessonConfMap[ccId]
    );

    return lessonConfs;
  }
  
  /*
   * 동시 수업 배정을 위한 수업 목록을 반환한다
   * - 1턴의 배정에 여러 수업이 포함된다.
   */
  getUnassignedLessonConfs(): LessonConf[] {
    const concurrentLessonConfMap =
      this.currentUnassignedConcurrentLessonConfMap();

    // 배정되지 않은 동시 수업의 과목id
    const concurrentCourseIds = Object.keys(concurrentLessonConfMap);
    if (!concurrentCourseIds || concurrentCourseIds.length === 0) {
      return [];
    }

    // <연속 시수 여부/연속 시수 크기> 가 가장 큰 값을 가진 동시 수업을 찾는다.
    const { concurrentCourseConfMap } = this._context;
    const ccId = concurrentCourseIds.reduce((bestId, currentId) => {
      const bestMax = Math.max(
        ...concurrentCourseConfMap[bestId].consecutivePeriod
          .split(',')
          .map(Number)
      );

      const currentMax = Math.max(
        ...concurrentCourseConfMap[currentId].consecutivePeriod
          .split(',')
          .map(Number)
      );

      return currentMax > bestMax ? currentId : bestId;
    });

    // 시수에 따라 동일한 lessonConf가 여러번 포함될 수 있으므로 중복을 제거한다.
    const lessonConfs = this.uniqueLesssonConfsFrom(
      concurrentLessonConfMap[ccId]
    );

    return lessonConfs;
  }

  getUnassignedRemainedLessonConfs(): LessonConf[] {
    const concurrentLessonConfMap =
      this.currentUnassignedConcurrentLessonConfMap();

    // 배정되지 않은 동시 수업의 과목id
    const concurrentCourseIds = Object.keys(concurrentLessonConfMap);
    if (!concurrentCourseIds || concurrentCourseIds.length === 0) {
      return [];
    }

    // <연속 시수 여부/연속 시수 크기> 가 가장 큰 값을 가진 동시 수업을 찾는다.    
    /*
    const { concurrentCourseConfMap } = this._context;
    const ccId = concurrentCourseIds.reduce((bestId, currentId) => {
      const bestMax = Math.max(
        ...concurrentCourseConfMap[bestId].consecutivePeriod
          .split(',')
          .map(Number)
      );

      const currentMax = Math.max(
        ...concurrentCourseConfMap[currentId].consecutivePeriod
          .split(',')
          .map(Number)
      );

      return currentMax > bestMax ? currentId : bestId;
    });
    */

    const ccId = concurrentCourseIds[0];

    // 시수에 따라 동일한 lessonConf가 여러번 포함될 수 있으므로 중복을 제거한다.
    const lessonConfs = this.uniqueLesssonConfsFrom(
      concurrentLessonConfMap[ccId]
    );

    return lessonConfs;
  }


  /*
   * 동시 수업 배정을 위한 수업 시간을 찾는다
   * - 동시 수업은 연속시수 설정도 있을 수 있으므로, 이를 고려하여 배정한다.
   */
  findAssignPeriodsWithLessonConfs(
    lessonConfs: LessonConf[],
    isIgnoreConsecutivePeriod = false
  ): AssignPeriodResult {
    // 배정 가능한 수업 시간을 찾기 위해,
    // 동시 수업에 속한 학급의 remainingLessonPeriods와 교사의 remainingLessonPeriods의 합집합을 구한다.
    const classIdSet = new Set<string>();
    const teacherIdSet = new Set<string>();
    const specialtyRoomIdSet = new Set<string>();

    // let ccId = '';
    const concurrentCourseIds = new Set<string>();

    lessonConfs.forEach((conf) => {
      if( conf.concurrentCourseId ) {
        concurrentCourseIds.add(conf.concurrentCourseId);
      }
      // ccId = conf.concurrentCourseId || '';
      classIdSet.add(conf.classId);
      teacherIdSet.add(conf.teacherId);
      if (conf.specialtyRoomId) {
        specialtyRoomIdSet.add(conf.specialtyRoomId);
      }
    });

    if( concurrentCourseIds.size === 0 ) {  // 동시 수업이 아닌 경우
      return { assignPeriods: [] };
    }

    /*
    if (!ccId) {
      // 동시 수업만 배정 가능
      return { assignPeriods: [] };
    }
    */

    

    // 동시 수업 내 학급과 교사의 배정 가능한 시간을 찾는다.
    const remainingPeriods = this.getRemainingPeriodsByClassAndTeacherAndSpecialtyRoom(
      classIdSet,
      teacherIdSet,
      specialtyRoomIdSet
    );

    if (!remainingPeriods || remainingPeriods.length === 0) {
      // 배정 가능한 시간이 없는 경우
      return { assignPeriods: [] };
    }
    
    const { classPeriodOverviewMap: periodOverviewMap } = this._context;
    // 동시 수업이 여러개 일수 있으므로, 모든 학급에서  동일한 수업이 배정된 시간을 찾는다.
    const sameCourseAssignedPeriodsWithAllClasses = [] as PeriodTuple[];
    classIdSet.forEach((classId) => {
      const assignedLessons =
        periodOverviewMap[classId].assignedLessons.filter((lesson) => {
          return concurrentCourseIds.has(lesson.concurrentCourseId || '');
        });

      const assignedPeriods = assignedLessons.map(
        (lesson) => [lesson.dayOfWeek, lesson.period] as PeriodTuple
      );

      sameCourseAssignedPeriodsWithAllClasses.push(...assignedPeriods);
    });

    // 중복 제거
    const uniquePeriodSet = new Set<string>();
    const sameCourseAssignedPeriods = sameCourseAssignedPeriodsWithAllClasses.filter(
      (periodTuple) => {
        const key = `${periodTuple[0]}_${periodTuple[1]}`;
        if (uniquePeriodSet.has(key)) {
          return false;
        }
        uniquePeriodSet.add(key);
        return true;
      }
    );

    /*    
    // 동일한 수업이 이미 배정되어있는 시간을 찾는다: 동시수업은 학급마다 동일한 시간에 배정되므로 첫번째 학급만 확인.
    const fstClassId = [...classIdSet][0];
    const sameCourseAssignedPeriods = periodOverviewMap[
      fstClassId
    ].assignedLessons
      .filter((lesson) => {
        // return lesson.concurrentCourseId === ccId;
        return concurrentCourseIds.has(lesson.concurrentCourseId || '');
      })
      .map((lesson) => [lesson.dayOfWeek, lesson.period] as PeriodTuple);
    */

    // 연속 수업은 분리해서 진행해야 한다. greedyGroup에서는 연속수업이 없어야 한다.
    const ccId = lessonConfs[0].concurrentCourseId || '';

    const consecutivePeriod = isIgnoreConsecutivePeriod ? '' : this._context.concurrentCourseConfMap[ccId].consecutivePeriod;

    // const { consecutivePeriod } = this._context.concurrentCourseConfMap[ccId];
    
    return this.findAssignPeriods(
      sameCourseAssignedPeriods,
      remainingPeriods,
      consecutivePeriod
    );
  }

  getUnassignedConcurrentCourseIds(): string[] {
    // 동시수업 시간표에 배정되지 않은 수업 목록
    const { classPeriodOverviews: periodOvervews } = this._context;
    const concurrentCourseIdSet = new Set<string>(
      periodOvervews
        .flatMap((overview) =>
          overview.remainingLessonConfs.filter(
            (conf) => conf.concurrentCourseId
          )
        )
        .map((conf) => conf.concurrentCourseId) as string[]
    );

    // 동시수업 시간표에 배정되지 않은 수업 목록
    return Array.from(concurrentCourseIdSet);
  }

  getUnassignedConcurrentCourseIdsNotConsecutive(): string[] {
    // 동시수업 시간표에 배정되지 않은 수업 목록
    const { classPeriodOverviews: periodOvervews } = this._context;
    const concurrentCourseIdSet = new Set<string>(
      periodOvervews
        .flatMap((overview) =>
          overview.remainingLessonConfs.filter(
            (conf) => conf.concurrentCourseId
          )
        )
        .map((conf) => conf.concurrentCourseId)
        .filter( ccId => {
          const consecutivePeriod = this._context.concurrentCourseConfMap[ccId || '']?.consecutivePeriod;
          return !consecutivePeriod;
        }) as string[]
    );

    // 동시수업 시간표에 배정되지 않은 수업 목록
    return Array.from(concurrentCourseIdSet);
  }

  currentUnassignedConcurrentLessonConfMap(): Record<string, LessonConf[]> {
    // 동시수업 시간표에 배정되지 않은 수업 목록
    const { classPeriodOverviews: periodOvervews } = this._context;
    return periodOvervews
      .flatMap((overview) =>
        overview.remainingLessonConfs.filter((conf) => conf.concurrentCourseId)
      )
      .reduce((acc, cur) => {
        if (!cur.concurrentCourseId) {
          return acc;
        }

        (acc[cur.concurrentCourseId] ||= [] as LessonConf[]).push(cur);
        return acc;
      }, {} as Record<string, LessonConf[]>);
  }

  // 전제 리셋
  resetAllAssignments(isIgnoreConsecutive: boolean = false): void {
    const { classPeriodOverviews: periodOvervews } = this._context;

    // 고정 수업과 수동 배정 수업을 제외한 수업 목록: 조건은 추후 옵션에 따라 조정 가능하게 수정
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

    // 리셋하지 않아야 할 수업을 구분해야 한다.
    const resetLessonConfs = periodOvervews.flatMap((overview) =>
      overview.assignedLessonConfs.filter((conf) => {
        if (CommonUtils.isEmptyString(conf.concurrentCourseId)) {
          return false;
        }

        const consecutivePeriod = this._context.concurrentCourseConfMap[conf.concurrentCourseId || '']?.consecutivePeriod;
        if (isIgnoreConsecutive && consecutivePeriod) {
          return false;
        }

        const key = `${conf.classId}_${conf.dayOfWeek}_${conf.period}`;
        return !exceptedLessonSets.includes(key);
      })
    );

    // resetLessonConfs에서 exceptedAssignedLessons과 dayOfWeek, period, classId가 같은 수업을 찾아 제외한다.

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

  get retryCount(): number {
    return this._totalRetryCount;
  }
}
