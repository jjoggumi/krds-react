import { v4 as uuidv4 } from 'uuid';

import {
  PeriodTuple,
  Lesson,
  LessonConf,
  LessonTeacher,
  TeacherPeriodOverview,
  PeriodOverview,
  ASSIGN_RESULT,
  AssignPeriodResult,
  LessonMoveInfo,
  AssignResult,
  TimetablePeriod,
} from '../types';
import { TimetableDataContext } from './timetable-data-context';
import TimetableUtils, { CommonUtils } from './utils';

export interface InitAssignmentOption {
  autoAssign: boolean;
  fixedConcurrent: boolean;
  manualAssign: boolean;
  teacherFreePeriods: boolean;
}

export default abstract class TimetableAssignManager {
  protected _totalRetryCount = 0;
  protected _context: TimetableDataContext;

  constructor(context: TimetableDataContext) {
    this._context = context;
  }

  get totalRetryCount(): number {
    return this._totalRetryCount;
  }

  // 1턴에 배정할 수업을 가져온다.
  abstract getUnassignedLessonConfs(): LessonConf[];

  // 1턴에 수업을 배정할 시간을 찾는다.
  abstract findAssignPeriodsWithLessonConfs(
    lessonConfs: LessonConf[]
  ): AssignPeriodResult;

  abstract resetAllAssignments(): void;

  autoAssignLessons(): AssignResult {
    let assignResult = { result: ASSIGN_RESULT.SUCCESS };
    this._totalRetryCount = 0;

    do {
      // 현재 배정되지 않은 시수표를 가져온다. { courseId: [LessonConf] }
      const lessonConfs = this.getUnassignedLessonConfs();

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

  autoAssignWithLessonConfs(lessonConfs: LessonConf[]): AssignResult {
    const { assignPeriods, consecutiveGroupId } =
      this.findAssignPeriodsWithLessonConfs(lessonConfs);

    if (assignPeriods.length === 0) {
      this._context.printLog(
        `[${this.constructor.name}] 배정 가능한 시간이 없습니다.`
      );
      return { result: ASSIGN_RESULT.FAIL };
    }

    // assignPeriods 만큼 수업을 배정한다.
    const results = [] as ASSIGN_RESULT[];
    lessonConfs.map((conf) => {
      assignPeriods.forEach((assignPeriod) => {
        const assignResult = this.assignLessonConf(assignPeriod, conf, consecutiveGroupId)
        results.push(assignResult.result);
      });
    });

    // results 중 하나라도 성공이 아닌경우 실패로 처리
    if (results.some((result) => result !== ASSIGN_RESULT.SUCCESS)) {
      this._context.printLog(`[${this.constructor.name}]  수업 배정 실패`);
      return { result: ASSIGN_RESULT.FAIL };
    }

    return { result: ASSIGN_RESULT.SUCCESS };
  }


  findAssignPeriods(
    sameCourseAssignedPeriods: PeriodTuple[],
    remainingPeriods: PeriodTuple[],
    consecutivePeriod = '',
    teacherIdSet: Set<string> = new Set<string>()
  ): AssignPeriodResult {
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

    const assignPeriod = TimetableUtils.selectNewTime(
      sameCourseAssignedPeriods,
      remainingPeriods
    );

    const consecutiveGroupId = '';
    return {
      assignPeriods: [assignPeriod],
      consecutiveGroupId,
    };
  }

  findConsecutiveAssignPeriods(
    remainingPeriods: PeriodTuple[],
    assignPeriodCount: number
  ): AssignPeriodResult {
    const consecutiveGroupId = uuidv4();

    // 배정 가능한 연속된 시간을 찾는다.
    const firstPeriods = TimetableUtils.getFirstPeriodsOfContinuousPeriods(
      remainingPeriods,
      assignPeriodCount
    );

    if (!firstPeriods || firstPeriods.length === 0) {
      return {
        assignPeriods: [],
        consecutiveGroupId,
      };
    }

    const rndIdx = Math.floor(Math.random() * firstPeriods.length);
    const randomPeriod = firstPeriods[rndIdx];
    const assignPeriods = [] as PeriodTuple[];
    // 연속된 시간을 할당한다.
    for (let i = 0; i < assignPeriodCount; i++) {
      assignPeriods.push([randomPeriod[0], randomPeriod[1] + i]);
    }

    return { assignPeriods, consecutiveGroupId };
  }

  assignLessonConf(
    assignPeriod: PeriodTuple,
    lessonConf: LessonConf,
    consecutiveGroupId = '',
    isManuallyAssigned = false
  ): AssignResult {
    const { classPeriodOverviewMap, teacherPeriodOverviewMap } = this._context;

    // 학급 배정 정보 처리
    const assignedLesson = this.assignLessonConfToPeriodOverview(
      assignPeriod,
      lessonConf,
      classPeriodOverviewMap[lessonConf.classId],
      consecutiveGroupId,
      isManuallyAssigned
    );

    if(!assignedLesson) {
      return { result: ASSIGN_RESULT.FAIL };
    }

    // 교사 배정 정보 처리
    this.assignLessonConfToPeriodOverview(
      assignPeriod,
      lessonConf,
      teacherPeriodOverviewMap[lessonConf.teacherId],
      consecutiveGroupId,
      isManuallyAssigned
    );

    // 복수 교사인 경우 다른 교사의 수업도 배정
    if(assignedLesson?.lessonTeachers && assignedLesson.lessonTeachers.length > 1) {
      const partnerTeacherLessonConfs = assignedLesson.lessonTeachers.filter(
        (lt) => lt.teacherId !== lessonConf.teacherId
      ).map(lt => {
        return this._context.lessonConfsByClass[lessonConf.classId]?.find(
          (conf) => conf.courseId === lessonConf.courseId && conf.teacherId === lt.teacherId
        );
      }).filter(conf => conf !== undefined) as LessonConf[];

      partnerTeacherLessonConfs.forEach((conf) => {
        // 교사의 overview에서는 수업을 배정
        const teacherPeriodOverview = teacherPeriodOverviewMap[conf.teacherId];
        this.assignLessonToPeriodOverview(assignedLesson, teacherPeriodOverview);

        // 학급의 overview에서는 복수교사의 lessonConf를 이동 시켜야 함.
        this.moveRemainingLessonConfToAssignedForPeriodOverview(assignPeriod, conf, classPeriodOverviewMap[conf.classId]);
      });
    }
    
    if(!assignedLesson) {
      console.error('!! Lesson assignment failed !!', assignPeriod, lessonConf, assignedLesson);
    }

    // 특별실 차감 처리
    this.decreaseSpecialtyRoomFreePeriodByLesson(assignedLesson as Lesson);

    

    return {
      result: ASSIGN_RESULT.SUCCESS,
      lessons: [ assignedLesson ] as Lesson[]
     };
  }

  decreaseSpecialtyRoomFreePeriodByLesson(
    lesson: Lesson,
  ): void {
    if(!lesson) {
      console.error('!! decreaseSpecialtyRoomFreePeriodByLesson: lesson is undefined !!', lesson);
      console.trace();
    }


    if (!lesson.specialtyRoomId) {
      return;
    }

    const lessonPeriod = [lesson.dayOfWeek, lesson.period] as PeriodTuple;

    this.decreaseSpecialtyRoomFreePeriod(
      lessonPeriod,
      lesson.specialtyRoomId
    );
    
  }

  decreaseSpecialtyRoomFreePeriod(
    lessonPeriod: PeriodTuple,
    specialtyRoomId: string,
  ): void {
    const roomStatus = this._context.specialtyRoomFreeStatus[specialtyRoomId];
    const periodKey = this._context.getPeriodTupleKey(lessonPeriod);

    if (!roomStatus || roomStatus.counterMap[periodKey] === undefined) {
      return;
    }
    
    roomStatus.counterMap[periodKey] -= 1;
    
    // count가 0이 된 경우 freePeriods에서 제거
    if (roomStatus.counterMap[periodKey] === 0) {
      // delete periodTuple from freePeriods
      roomStatus.freePeriods = roomStatus.freePeriods.filter((period) => {
        return !(period[0] === lessonPeriod[0] && period[1] === lessonPeriod[1]);
      });
    }
  }

  increaseSpecialtyRoomFreePeriodByLesson(
    lesson: Lesson,
  ): void {
    if (!lesson.specialtyRoomId) {
      return;
    }

    const lessonPeriod = [lesson.dayOfWeek, lesson.period] as PeriodTuple;
    
    this.increaseSpecialtyRoomFreePeriod(
      lessonPeriod,
      lesson.specialtyRoomId
    );
  }
  
  increaseSpecialtyRoomFreePeriodByLessonConf(
    conf: LessonConf,
  ): void {
    if (!conf.specialtyRoomId || conf.dayOfWeek === undefined || conf.period === undefined) {
      return;
    }

    const lessonPeriod = [conf.dayOfWeek, conf.period] as PeriodTuple;
    
    this.increaseSpecialtyRoomFreePeriod(
      lessonPeriod,
      conf.specialtyRoomId
    );
  }

  increaseSpecialtyRoomFreePeriod(
    lessonPeriod: PeriodTuple,
    specialtyRoomId: string,
  ): void {
    const roomStatus = this._context.specialtyRoomFreeStatus[specialtyRoomId];
    const periodKey = this._context.getPeriodTupleKey(lessonPeriod);

    if (!roomStatus || roomStatus.counterMap[periodKey] === undefined) {
      return;
    }

    // count가 0이었던 경우 freePeriods에 추가
    if (roomStatus.counterMap[periodKey] === 0) {
      roomStatus.freePeriods.push(lessonPeriod)
      roomStatus.freePeriods.sort((a, b) => {
        if (a[0] === b[0]) {
          return a[1] - b[1];
        }
        return a[0] - b[0];
      });
    }

    roomStatus.counterMap[periodKey] += 1;
  }

  

  assignLessonConfToPeriodOverview(
    lessonPeriod: PeriodTuple,
    lessonConf: LessonConf,
    periodOvervew: PeriodOverview,
    consecutiveGroupId = '',
    isManuallyAssigned = false
  ): Lesson | undefined {
    if (!periodOvervew || !lessonConf) {
      return;
    }

    const {
      courseId,
      classId,
      teacherId,
      specialtyRoomId,
      concurrentCourseId,
      combineConfId,
    } = lessonConf;

    const concurrentCourseTitle = concurrentCourseId
      ? this._context.courseMap[concurrentCourseId]?.displayedTitle
      : '';

    const course = this._context.courseMap[courseId];

    const lesson = {
      lessonId: '',
      classId,
      courseId,
      lessonTeachers: [],
      specialtyRoomId,
      dayOfWeek: lessonPeriod[0],
      period: lessonPeriod[1],
      isFixedCourse: false,
      isManuallyAssigned,
      concurrentCourseId,
      concurrentCourseTitle,
      consecutiveGroupId,
      courseName: course?.displayedTitle || '',
      combineConfId
    } as Lesson;

    const lessonConfId = lessonConf.lessonConfId || '';
    lesson.lessonTeachers?.push({ teacherId, lessonConfId } as LessonTeacher);

    // 복수 교사이고, 이미 다른 교사의 수업이 이미 배정되어 있는 경우의 처리도 필요함.
    if (course.isDoubleTeacher) {
      const partnerTeacherLessonConfs = (this._context.lessonConfsByClass[classId] || []).filter(
        (conf) => conf.courseId === courseId && 
        conf.lessonConfId !== lessonConfId && 
        conf.teacherId !== teacherId
      );

      partnerTeacherLessonConfs.forEach((conf) => {
        lesson.lessonTeachers?.push({ teacherId: conf.teacherId, lessonConfId: conf.lessonConfId } as LessonTeacher);
      });
    }

    lesson.teacherNames = lesson.lessonTeachers?.map(({ teacherId }) =>
      (this._context.teacherMap[teacherId]?.teacherName || '')
    );

    const { remainingLessonPeriods, remainingLessonConfs, assignedLessons } =
      periodOvervew;

    const findedLesson = remainingLessonPeriods.findIndex(
      (period) => period[0] === lessonPeriod[0] && period[1] === lessonPeriod[1]
    );

    if (!combineConfId && findedLesson < 0) {
      return;
    }

    const findedLessonConf = remainingLessonConfs.findIndex(
      (conf) =>
        conf.classId === classId &&
        conf.courseId === courseId &&
        conf.teacherId === teacherId
    );

    const cls = this._context.classMap[classId];

    if (findedLessonConf < 0 && !course?.isUnified && !cls?.isVirtual) {      
      return;
    }


    (findedLesson > -1) && remainingLessonPeriods.splice(findedLesson, 1); // combineConfId 있는 경우는 lessonPeriod 제거 안함 (합반)
    assignedLessons.push(lesson);

    if (findedLessonConf < 0) {
      return;
    }

    const [assigned] = remainingLessonConfs.splice(findedLessonConf, 1);

    assigned.dayOfWeek = lesson.dayOfWeek;
    assigned.period = lesson.period;

    periodOvervew.assignedLessonConfs.push(assigned);

    return lesson;
  }

  /* !! 매우 중요 !!
   * 2025.10.25, notbadlife
   * Overview에서 Lesson 관련 데이터는 수정하지 않고 LessonConf 만 Remianing -> Assigned로 이동시키는 함수
   * - 복수 수업의 경우, 학급 기준 Lesson은 하나지만, LessonConf는 교사 수만큼 존재
   * - 따라서, 수업 배정시 첫번째 교사의 LessonConf로 Lesson을 생성하게되고,
   *   다른 교사의 LessonConf는 별도로 처리해줘야함.
   * - moveRemainingLessonConfToAssignedForPeriodOverview 함수가 그 역할을 수행함.
   */
  moveRemainingLessonConfToAssignedForPeriodOverview(
    lessonPeriod: PeriodTuple,
    lessonConf: LessonConf,
    periodOvervew: PeriodOverview,
  )  {
    if (!periodOvervew || !lessonConf) {
      return;
    }

    const {
      courseId,
      classId,
      teacherId,      
    } = lessonConf;
    
    const course = this._context.courseMap[courseId];
    if (!course.isDoubleTeacher) {
      return;
    }

    const { assignedLessonConfs, remainingLessonConfs } = periodOvervew;

    // 이미 배정된 수업이면 무시
    const findedAssignedConf = assignedLessonConfs.findIndex(
      (conf) =>
        conf.classId === classId &&
        conf.courseId === courseId &&
        conf.teacherId === teacherId &&
        conf.dayOfWeek === lessonPeriod[0] &&
        conf.period === lessonPeriod[1]
    );

    if (findedAssignedConf !== -1) {
      return;
    }

    const findedLessonConf = remainingLessonConfs.findIndex(
      (conf) =>
        conf.classId === classId &&
        conf.courseId === courseId &&
        conf.teacherId === teacherId
    );

    const cls = this._context.classMap[classId];
    if (findedLessonConf < 0 && !course?.isUnified && !cls?.isVirtual) {
      return;
    }
    
    const [assigned] = remainingLessonConfs.splice(findedLessonConf, 1);
    assigned.dayOfWeek = lessonPeriod[0];
    assigned.period = lessonPeriod[1];

    periodOvervew.assignedLessonConfs.push(assigned);

    return ;
  }


  assignLesson(lesson: Lesson): void {
    // 이미 배정된 수업 시간인지 확인 단계 필요

    // 학급 배정 정보 처리
    const { classPeriodOverviewMap, teacherPeriodOverviewMap } = this._context;

    const classPeriodOverview = classPeriodOverviewMap[lesson.classId];
    this.assignLessonToPeriodOverview(
      lesson,
      classPeriodOverview
    );

    // 교사 배정 정보 처리
    const classLessonConfs = this._context.lessonConfsByClass[lesson.classId];
    const lessonPeriod = [lesson.dayOfWeek, lesson.period] as PeriodTuple;
    lesson.lessonTeachers?.forEach(({ teacherId, lessonConfId }) => {
      const teacherPeriodOverview: TeacherPeriodOverview = teacherPeriodOverviewMap[teacherId];
      this.assignLessonToPeriodOverview(lesson, teacherPeriodOverview);

      // 복수 교사 인 경우, 학급의 overview에서는 lessonConf를 이동 시켜야 함.
      const lessonConf = classLessonConfs.find((conf) => conf.lessonConfId === lessonConfId);
      if (lessonConf) {
        this.moveRemainingLessonConfToAssignedForPeriodOverview(lessonPeriod, lessonConf, classPeriodOverview); 
      }
    });

    if(!lesson) {
      console.error('!! Lesson assignment failed !!', lesson);
    }

    // 특별실 차감 처리
    this.decreaseSpecialtyRoomFreePeriodByLesson(lesson);
  }

  assignLessonToPeriodOverview(
    lesson: Lesson,
    periodOvervew: PeriodOverview
  ): void {
    if (!periodOvervew || !lesson) {
      return;
    }

    const { dayOfWeek, period, courseId, classId } = lesson;

    const course = this._context.courseMap[courseId];
    const cls = this._context.classMap[classId];

    const lessonPeriod = [dayOfWeek, period] as PeriodTuple;

    const {
      remainingLessonPeriods,
      remainingLessonConfs,
      assignedLessons,
      assignedLessonConfs,
    } = periodOvervew;

    const findedLesson = remainingLessonPeriods.findIndex(
      (period) => period[0] === lessonPeriod[0] && period[1] === lessonPeriod[1]
    );

    const alreadyAssignedLessonConf = assignedLessonConfs.find(
      (conf) =>
        conf.dayOfWeek === dayOfWeek &&
        conf.period === period
    );

    if (!alreadyAssignedLessonConf?.combineConfId && findedLesson < 0) {
      this._context.printLog('LESSON_PERIOD NOT FOUND');
      return;
    }

    (findedLesson > -1) && remainingLessonPeriods.splice(findedLesson, 1);
    assignedLessons.push(lesson);

    lesson.lessonTeachers?.forEach(({ teacherId }) => {
      const findedLessonConf = remainingLessonConfs.findIndex((lessonConf) => {
        const res =
          lessonConf.classId === classId &&
          lessonConf.courseId === courseId &&
          lessonConf.teacherId === teacherId;
          // lesson.lessonTeachers?.some((lt) => lt.teacherId === lessonConf.teacherId);
        return res;
      });

      if (findedLessonConf < 0 && !course?.isUnified && !cls?.isVirtual) {
        // this._context.printLog('LESSON_CONF NOT FOUND', lesson, periodOvervew);
        return;
      }

      if (findedLessonConf >= 0) {
        const [assigned] = remainingLessonConfs.splice(findedLessonConf, 1);

        assigned.dayOfWeek = lesson.dayOfWeek;
        assigned.period = lesson.period;
        assignedLessonConfs.push(assigned);
      }
    });

  }

  getAssignPeriodCount(
    assignedPeriods: PeriodTuple[],
    consecutivePeriod = ''
  ): number {
    if (!consecutivePeriod || consecutivePeriod === '') {
      return 1;
    }
    // 연속 수업인 경우 처리
    const consecutivePeriods = consecutivePeriod.split(',').map(Number);

    // 이미 배정된 수업 중 연속된 수업이 있는지 확인
    const continuousPeriods =
      TimetableUtils.getContinuousPeriods(assignedPeriods);

    // 배정할 연속수업에서 이미 배정된 연속수업을 제외하고 가장 큰 값으로 셋팅
    const allowedContinuous = TimetableUtils.subtractArraysAllowDuplicates(
      consecutivePeriods,
      continuousPeriods
    );

    return allowedContinuous.length > 0 ? allowedContinuous[0] : 1;
  }

  getRemainingPeriodsByClassAndTeacher(
    classIdSet: Set<string>,
    teacherIdSet: Set<string>
  ): PeriodTuple[] {
    const { classPeriodOverviewMap, teacherPeriodOverviewMap } = this._context;
    const periodTuples: PeriodTuple[][] = [];
    classIdSet.forEach((classId) => {
      periodTuples.push(classPeriodOverviewMap[classId].remainingLessonPeriods);
    });

    teacherIdSet.forEach((teacherId) => {
      periodTuples.push(
        teacherPeriodOverviewMap[teacherId].remainingLessonPeriods
      );
    });

    // 학급의 remainingLessonPeriods와 교사의 remainingLessonPeriods의 교집합
    const periods = TimetableUtils.intersectPeriodTuples(...periodTuples);

    return periods;
  }

  getRemainingPeriodsByClassAndTeacherAndSpecialtyRoom(
    classIdSet: Set<string>,
    teacherIdSet: Set<string>,
    specialtyRoomIdSet: Set<string>
  ): PeriodTuple[] {
    const { classPeriodOverviewMap, teacherPeriodOverviewMap } = this._context;
    const periodTuples: PeriodTuple[][] = [];
    classIdSet.forEach((classId) => {
      periodTuples.push(classPeriodOverviewMap[classId].remainingLessonPeriods);
    });

    teacherIdSet.forEach((teacherId) => {
      periodTuples.push(
        teacherPeriodOverviewMap[teacherId].remainingLessonPeriods
      );
    });

    if( specialtyRoomIdSet.size > 0) {
      specialtyRoomIdSet.forEach((specialtyRoomId) => {
        const roomStatus = this._context.specialtyRoomFreeStatus[specialtyRoomId];
        if( roomStatus ) {
          periodTuples.push(
            roomStatus.freePeriods
          );
        }
      });
    }

    // 학급의 remainingLessonPeriods와 교사의 remainingLessonPeriods의 교집합
    const periods = TimetableUtils.intersectPeriodTuples(...periodTuples);

    return periods;
  }

  getRemainingPeriodsByClassAndTeacherForPrint(
    classIdSet: Set<string>,
    teacherIdSet: Set<string>
  ): PeriodTuple[] {
    const { classPeriodOverviewMap, teacherPeriodOverviewMap } = this._context;
    const periodTuples: PeriodTuple[][] = [];

    // 출력을 위함
    const classPeriodTuples: PeriodTuple[][] = [];
    const teacherPeriodTuples: PeriodTuple[][] = [];

    classIdSet.forEach((classId) => {
      periodTuples.push(classPeriodOverviewMap[classId].remainingLessonPeriods);
      classPeriodTuples.push(
        classPeriodOverviewMap[classId].remainingLessonPeriods
      );
    });

    teacherIdSet.forEach((teacherId) => {
      this._context.printLog(
        'teacherId',
        teacherId,
        this._context.teacherMap[teacherId].teacherName
      );

      periodTuples.push(
        teacherPeriodOverviewMap[teacherId].remainingLessonPeriods
      );

      teacherPeriodTuples.push(
        teacherPeriodOverviewMap[teacherId].remainingLessonPeriods
      );
    });

    // 출력
    const teacherIntersectPeriods = TimetableUtils.intersectPeriodTuples(
      ...teacherPeriodTuples
    );
    const classIntersectPeriods = TimetableUtils.intersectPeriodTuples(
      ...classPeriodTuples
    );

    this._context.printLog(
      '>>>>> teacherIntersectPeriods',
      teacherIntersectPeriods
    );
    this._context.printLog(
      '>>>>> classIntersectPeriods',
      classIntersectPeriods
    );

    teacherPeriodTuples.forEach((perds, idx) => {
      this._context.printLog('>>>>> perds', idx);
      // 교사 별 배정 가능한 시간
      const resultPeriod = TimetableUtils.intersectPeriodTuples(
        perds,
        ...classPeriodTuples
      );
      this._context.printLog('>>>>> resultPeriod', resultPeriod);
    });

    //

    // 학급의 remainingLessonPeriods와 교사의 remainingLessonPeriods의 교집합
    const periods = TimetableUtils.intersectPeriodTuples(...periodTuples);

    return periods;
  }

  uniqueLesssonConfsFrom(lessonConfs: LessonConf[]): LessonConf[] {
    const filterIdSet = new Set<string>();
    return lessonConfs.filter((conf) => {
      const key = `${conf.classId}${conf.teacherId}${conf.courseId}`;
      if (filterIdSet.has(key)) {
        return false;
      }

      filterIdSet.add(key);
      return true;
    });
  }

  resetAssignmentsByClass(classId: string): void {
    // 동시 수업과 공통 수업, 연속수업, 수동배정을 제외한 수업 시간을 초기화
    const { classPeriodOverviewMap, teacherPeriodOverviewMap } = this._context;
    const classPeriodOverview = classPeriodOverviewMap[classId];

    if (!classPeriodOverview) {
      return;
    }

    const exceptedLessonSets = classPeriodOverview.assignedLessons
      .filter((lesson) => lesson.isFixedCourse || lesson.isManuallyAssigned)
      .map((lesson) => {
        const { dayOfWeek, period } = lesson;
        return `${lesson.classId}_${dayOfWeek}_${period}`;
      });

    const resetLessonConfs = classPeriodOverview.assignedLessonConfs.filter(
      (conf) => {
        const { concurrentCourseId, consecutivePeriod } = conf;
        const { isUnified } = this._context.courseMap[conf.courseId];

        if (
          isUnified ||
          CommonUtils.isNotEmptyString(concurrentCourseId) ||
          CommonUtils.isNotEmptyString(consecutivePeriod)
        ) {
          // 동시 수업, 연속 수업, 공통 수업은 제외
          return false;
        }

        const { dayOfWeek, period } = conf;
        const key = `${conf.classId}_${dayOfWeek}_${period}`;

        return !exceptedLessonSets.includes(key);
      }
    );

    // class
    resetLessonConfs.forEach((conf) => {
      this.resetAssignedLessonConf(conf, classPeriodOverview);

      const teacherPeriodOverview = teacherPeriodOverviewMap[conf.teacherId];
      this.resetAssignedLessonConf(conf, teacherPeriodOverview);

      // 특별실 복구 처리, LessonConf로 처리
      this.increaseSpecialtyRoomFreePeriodByLessonConf(conf);
    });
  }

  resetAssignedLessonConf(
    lessonConf: LessonConf,
    periodOverview: PeriodOverview
  ) {
    if (!lessonConf || !periodOverview) {
      /*
      console.log(
        'RESET ASSIGNED LESSON CONF FAILED',
        lessonConf,
        periodOverview
      );
      */
      return;
    }

    const { courseId, classId, teacherId, dayOfWeek, period } = lessonConf;
    const {
      assignedLessons,
      assignedLessonConfs,
      remainingLessonConfs,
      remainingLessonPeriods,
    } = periodOverview;

    const lessonIdx = assignedLessons.findIndex(
      (lesson) =>
        lesson.courseId === courseId &&
        lesson.classId === classId &&
        lesson.lessonTeachers?.some((lt) => lt.teacherId === teacherId) &&
        lesson.dayOfWeek === dayOfWeek &&
        lesson.period === period
    );

    if (lessonIdx !== -1) {
      const [lesson] = assignedLessons.splice(lessonIdx, 1);
      remainingLessonPeriods.push([lesson.dayOfWeek, lesson.period]);
    }

    const confIdx = assignedLessonConfs.findIndex(
      (conf) =>
        conf.courseId === courseId &&
        conf.classId === classId &&
        conf.teacherId === teacherId &&
        conf.dayOfWeek === dayOfWeek &&
        conf.period === period
    );

    if (confIdx !== -1) {
      const [conf] = assignedLessonConfs.splice(confIdx, 1);
      remainingLessonConfs.push(conf);
    }
  }

  resetLessonToPeriodOverview(lesson: Lesson, periodOverview: PeriodOverview) {
    if (!lesson || !periodOverview) {
      return;
    }

    const { dayOfWeek, period } = lesson;
    const lessonPeriod = [dayOfWeek, period] as PeriodTuple;

    const {
      remainingLessonPeriods,
      remainingLessonConfs,
      assignedLessons,
      assignedLessonConfs,
    } = periodOverview;

    const findedLesson = assignedLessons.findIndex(
      (lsn) =>
        lsn.courseId === lesson.courseId &&
        lsn.classId === lesson.classId &&
        lsn.dayOfWeek === lesson.dayOfWeek &&
        lsn.period === lesson.period
    );

    if (findedLesson < 0) {
      return;
    }

    const [assignedLesson] = assignedLessons.splice(findedLesson, 1);

    // 합반인 경우, 동일 시수에 여러 수업이 있을 수 있으므로 lessonPeriod는 한 번만 추가
    const isPeriodAlreadyExists = remainingLessonPeriods.some(
      (period) => period[0] === lessonPeriod[0] && period[1] === lessonPeriod[1]
    );

    if (!isPeriodAlreadyExists) {
      remainingLessonPeriods.push(lessonPeriod);
    }
    else {
      this._context.printLog('--- resetLessonToPeriodOverview: period already exists ---', lessonPeriod, periodOverview);
    }
    
    // 복수 교사인 경우를 위해 lessonTeachers 기준으로 처리
    lesson.lessonTeachers?.forEach(({ teacherId }) => {
      const findedLessonConf = assignedLessonConfs.findIndex(
        (conf) =>
          conf.courseId === lesson.courseId &&
          conf.classId === lesson.classId &&
          conf.dayOfWeek === lesson.dayOfWeek &&
          conf.period === lesson.period &&
          conf.teacherId === teacherId
          // lesson.lessonTeachers?.some((lt) => lt.teacherId === conf.teacherId)
      );

      if (findedLessonConf < 0) {
        return;
      }
      
      const [assignedLessonConf] = assignedLessonConfs.splice(findedLessonConf, 1);

      assignedLessonConf.dayOfWeek = undefined;
      assignedLessonConf.period = undefined;

      remainingLessonConfs.push(assignedLessonConf);      
    });

  }

  resetAssignedLesson(lesson: Lesson) {
    const { classPeriodOverviewMap, teacherPeriodOverviewMap } = this._context;
    const classPeriodOverview = classPeriodOverviewMap[lesson.classId];

    this.resetLessonToPeriodOverview(lesson, classPeriodOverview);

    lesson.lessonTeachers?.forEach(({ teacherId }) => {
      const teacherPeriodOverview = teacherPeriodOverviewMap[teacherId];
      this.resetLessonToPeriodOverview(lesson, teacherPeriodOverview);
    });

    this.increaseSpecialtyRoomFreePeriodByLesson(lesson);
  }

  chainExchangeLessons(lessons: Lesson[]): void {
    // 파라미터 검증: 수업 중 동시, 연속 수업 등이 있으면 이동 불가
    const isNotValidLessons = lessons.some(
      (lesson) => lesson.concurrentCourseId || lesson.consecutiveGroupId
    );
    if (isNotValidLessons) {
      return;
    }

    // 어느 수업을 어느 시수로 옮길지 정보 저장
    const moveInfos = lessons.map((sourceLesson, index) => {
      const targetIndex = index > 0 ? index - 1 : lessons.length - 1;
      const targetLesson = lessons[targetIndex];

      return {
        sourceLesson,
        targetPeriod: {
          dayOfWeek: targetLesson.dayOfWeek,
          period: targetLesson.period,
        },
      } as LessonMoveInfo;
    });

    // 해당 수업 제거
    lessons.forEach((lesson) => this.resetAssignedLesson(lesson));

    // 수업 재배치
    moveInfos.forEach(({ sourceLesson, targetPeriod }) => {
      if (!sourceLesson || !targetPeriod) {
        return;
      }

      sourceLesson.dayOfWeek = targetPeriod.dayOfWeek;
      sourceLesson.period = targetPeriod.period;
      this.assignLesson(sourceLesson);
    });
  }


  /*
   * 연쇄와 달리 단순히 수업을 왼쪽으로 이동시키는 함수
   * 예를 들어, [{emptyPeriod}, A, B] -> [A, B]
   * @param emptyPeriod - 가장 왼쪽의 빈 시수
   * @param lessons - 이동할 수업 목록
   */
  shiftLessonsToLeft(emptyPeriod: TimetablePeriod, lessons: Lesson[]): void {
    // 파라미터 검증: 수업 중 동시, 연속 수업 등이 있으면 이동 불가
    const isNotValidLessons = lessons.some(
      (lesson) => lesson.concurrentCourseId || lesson.consecutiveGroupId
    );

    if (isNotValidLessons) {
      return;
    }
    
    // 어느 수업을 어느 시수로 옮길지 정보 저장
    const moveInfos = lessons.map((sourceLesson, index) => {
      const targetPeriod = {} as TimetablePeriod;
      if (index === 0) {
        // 첫 번째 수업은 빈 시수로 이동
        targetPeriod.dayOfWeek = emptyPeriod.dayOfWeek;
        targetPeriod.period = emptyPeriod.period;
      } else {
        // 나머지 수업은 이전 수업의 시수로 이동
        const targetIndex = index - 1;
        const targetLesson = lessons[targetIndex];
        targetPeriod.dayOfWeek = targetLesson.dayOfWeek;
        targetPeriod.period = targetLesson.period;
      }
      
      return {
        sourceLesson,
        targetPeriod,
      } as LessonMoveInfo;
    });

    // 해당 수업 제거
    lessons.forEach((lesson) => this.resetAssignedLesson(lesson));
    
    // 수업 재배치
    moveInfos.forEach(({ sourceLesson, targetPeriod }) => {
      if (!sourceLesson || !targetPeriod) {
        return;
      }
      sourceLesson.dayOfWeek = targetPeriod.dayOfWeek;
      sourceLesson.period = targetPeriod.period;
      this.assignLesson(sourceLesson);
    });
  }

  // @Deprecated: chainExchangeLessons로 대체
  /*
  oneToOneExchangeLessons(
    sourceLesson: Lesson,
    destinationLesson: Lesson
  ): void {
    // 동시 수업이 있는 경우 교체 불가
    if (
      sourceLesson.concurrentCourseId ||
      destinationLesson.concurrentCourseId
    ) {
      return;
    }

    const sourcePeriod = [sourceLesson.dayOfWeek, sourceLesson.period];
    const targetPeriod = [
      destinationLesson.dayOfWeek,
      destinationLesson.period,
    ];

    // 목적하는 수업을 리셋하고 해당 수업의 lessonConf를 가져온다.
    this.resetAssignedLesson(destinationLesson);
    this.resetAssignedLesson(sourceLesson);

    // 수업을 교체한다.
    sourceLesson.dayOfWeek = targetPeriod[0];
    sourceLesson.period = targetPeriod[1];
    this.assignLesson(sourceLesson);

    destinationLesson.dayOfWeek = sourcePeriod[0];
    destinationLesson.period = sourcePeriod[1];
    this.assignLesson(destinationLesson);
  }
    */
}
