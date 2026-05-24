import { v4 as uuidv4 } from 'uuid';
import {
  ASSIGN_RESULT,
  AssignResult,
  ConsecutiveCourseExchangeInfo,
  ConcurrentCourseExchangeInfo,
  Lesson,
  LessonConf,
  PeriodTuple,
  Teacher,
  TimetablePeriod,
} from '../types';
import { TimetableDataContext } from './timetable-data-context';
import ConcurrentLessonManager from './concurrent-lesson-manager';
import CommonLessonManager from './common-lesson-manager';
import ConsecutiveLessonManager from './consecutive-lesson-manager';
import TimetableValidator from './timetable-validator';
import { assign } from 'lodash';

// ---------------------------
// 클래스로 전환
export default class TimetableManager {
  private _context: TimetableDataContext;
  private _concurrentLessonManager: ConcurrentLessonManager;
  private _consecutiveLessonManager: ConsecutiveLessonManager;
  private _commonLessonManager: CommonLessonManager;
  private _timetableValidator: TimetableValidator;

  constructor(context: TimetableDataContext) {
    this._context = context;
    this._concurrentLessonManager = new ConcurrentLessonManager(context);
    this._consecutiveLessonManager = new ConsecutiveLessonManager(context);
    this._commonLessonManager = new CommonLessonManager(context);

    this._timetableValidator = new TimetableValidator(context);
  }

  get timetableStatus() {
    return this._timetableValidator.timetableStatus;
  }

  get timetableTeacherStatus() {
    return this._timetableValidator.timetableTeacherStatus;
  }

  get timetableStatusLessonIds() {
    return this._timetableValidator.timetableStatusLessonIds;
  }

  get teacherStatusMap() {
    return this._timetableValidator.teacherStatusMap;
  }

  assignLessonConfManually(
    timetablePeriod: TimetablePeriod,
    lessonConf: LessonConf,
    consecutivePeriod: number | undefined
  ) {
    const consecutiveCount = consecutivePeriod || 1;
    const consecutiveGroupId = consecutiveCount > 1 ? uuidv4() : '';
    const assignedLessons: Lesson[] = [];

    for (let i = 0; i < consecutiveCount; i++) {
      const assignPeriod = [
        timetablePeriod.dayOfWeek,
        timetablePeriod.period + i,
      ] as PeriodTuple;

      const assignResult = this._commonLessonManager.assignLessonConf(
        assignPeriod,
        lessonConf,
        consecutiveGroupId,
        true
      );

      const { result, lessons } = assignResult;
      if (result === ASSIGN_RESULT.SUCCESS && lessons) {
        assignedLessons.push(...lessons);
      }
    }

    return assignedLessons;
  }

  // 교사의 수업 가능 시간 제거
  removeTeacherRemainingLessonPeriod(
    teacherId: string,
    dayOfWeek: number,
    period: number
  ) {
    const { remainingLessonPeriods } =
      this._context.teacherPeriodOverviewMap[teacherId];

    if (!remainingLessonPeriods) {
      return;
    }

    // 남은 수업 시수에 해당하는 시간이 있는지 확인
    const index = remainingLessonPeriods.findIndex(
      (p) => p[0] === dayOfWeek && p[1] === period
    );

    if (index === -1) {
      return;
    }

    // 남은 수업 시수에서 제거
    remainingLessonPeriods.splice(index, 1);
  }

  // 교사의 수업 가능시간 추가
  addToTeacherRemainingLessonPeriod(
    teacherId: string,
    dayOfWeek: number,
    period: number
  ) {
    const { remainingLessonPeriods } =
      this._context.teacherPeriodOverviewMap[teacherId];

    if (!remainingLessonPeriods) {
      return;
    }

    // 남은 수업 시수에 해당하는 시간이 있는지 확인
    const index = remainingLessonPeriods.findIndex(
      (p) => p[0] === dayOfWeek && p[1] === period
    );

    if (index !== -1) {
      return;
    }

    // 남은 수업 시수에 추가
    remainingLessonPeriods.push([dayOfWeek, period]);
  }

  addListToTeacherRemainingLessonPeriod(
    teacherId: string,
    periods: PeriodTuple[]
  ) {
    const { remainingLessonPeriods } =
      this._context.teacherPeriodOverviewMap[teacherId];

    if (!remainingLessonPeriods) {
      return;
    }

    // 남은 수업 시수에 있는지 확인
    const addPeriods = periods.filter((period) => {
      const [dayOfWeek, periodOfDay] = period;

      // 남은 수업 시수에 해당하는 시간이 있는지 확인
      const index = remainingLessonPeriods.findIndex(
        (p) => p[0] === dayOfWeek && p[1] === periodOfDay
      );

      if (index !== -1) {
        return false;
      }

      return true;
    });

    // 남은 수업 시수에 추가
    remainingLessonPeriods.push(...addPeriods);
  }

  // 수업 삭제
  resetAssignedLesson(lesson: Lesson): Lesson[] {
    this._commonLessonManager.resetAssignedLesson(lesson);
    return this.currentAssignedLessonsWithRefreshValidator();
  }

  chainExchangeLessons(lessons: Lesson[]): Lesson[] {
    // 구현
    if (lessons.length < 2) {
      return [];
    }
    this._commonLessonManager.chainExchangeLessons(lessons);
    // 결과 반환
    return this.currentAssignedLessonsWithRefreshValidator();
  }


  exchangeConcurrentCourseLessons(concurrentCourseExchangeInfo: ConcurrentCourseExchangeInfo): Lesson[] {
    if (!concurrentCourseExchangeInfo) {
      return [];
    }
    
    const { 
      dayOfWeek, 
      period, 
      pathMap 
    } = concurrentCourseExchangeInfo;

    const sourceConcurrentLessons = Object.values(pathMap).map((path) => path[0]) as Lesson[];
    const { 
      concurrentCourseId,
      dayOfWeek: sourceDayOfWeek,
      period: sourcePeriod
    } = sourceConcurrentLessons[0];
    
    if (!concurrentCourseId) {
      console.error('동시 수업이 아닙니다.');
      return [];
    }
    
    // 1. 기존의 동시 수업을 먼저 배정 제거
    sourceConcurrentLessons.forEach((lesson) => {
      // 수업 데이터 삭제      
      this._commonLessonManager.resetAssignedLesson(lesson);
    });

    // 2. 동시 수업의 시간으로 이동할 수업 부터 순차적으로 재배정    
    const emptyPeriod = {
      dayOfWeek: sourceDayOfWeek,
      period: sourcePeriod,
    } as TimetablePeriod;
    
    Object.values(pathMap).forEach((path) => {
      const [_, ...lessonsToShift] = path; // 첫번째 수업을 제외한 나머지 수업들
      this._commonLessonManager.shiftLessonsToLeft(emptyPeriod, lessonsToShift);
    });

    // 3. 동시 수업을 이동할 시간으로 배정
    const concurrentLessonConfs = this._context.lessonConfsByConcurrentCourse[concurrentCourseId];
    const targetPeriod = { dayOfWeek, period } as TimetablePeriod;

    concurrentLessonConfs.forEach((conf) => {
      this.assignLessonConfManually(targetPeriod, conf, undefined);
    });

    return this.currentAssignedLessonsWithRefreshValidator();
  }

  exchangeConsecutiveCourseLessons(consecutiveCourseExchangeInfo: ConsecutiveCourseExchangeInfo): Lesson[] {
    if (!consecutiveCourseExchangeInfo) {
      return [];
    }

    const { dayOfWeek, periods, sourceLessons, targetLessonMoveInfos } = consecutiveCourseExchangeInfo;
    const targetMoveInfo = targetLessonMoveInfos && targetLessonMoveInfos[0];

    if (!targetMoveInfo || !sourceLessons || sourceLessons.length === 0) {
      console.error('연속 수업 정보가 없습니다.');
      return [];
    }

    // 연속 수업이 이동할 위치
    const periodsForSource = periods.map(p => ({ dayOfWeek, period: p })).sort((a, b) => a.period - b.period);

    const targetLessons = targetMoveInfo.map(info => info.sourceLesson);
    // 기존 수업 삭제
    [...sourceLessons, ...targetLessons].forEach(lesson => {
      if(!lesson) {
        return;
      }
      this._commonLessonManager.resetAssignedLesson(lesson);
    });

    // 타겟 수업을 소스 위치로 이동
    targetMoveInfo.forEach(info => {
      const { sourceLesson, targetPeriod } = info;
      if(!sourceLesson || !targetPeriod) {
        return null;
      }

      sourceLesson.dayOfWeek = targetPeriod.dayOfWeek;
      sourceLesson.period = targetPeriod.period;
      
      this._commonLessonManager.assignLesson(sourceLesson);
    });

    // 연속 수업 재배정, 연속 그룹 아이디는 기존 아이디를 유지하나 비어있다면 새롭게 부여
    const consecutiveGroupId = sourceLessons[0].consecutiveGroupId || uuidv4();
    periodsForSource.forEach(({dayOfWeek, period}, index) => {
      const sourceLesson = sourceLessons[index];
      if(!sourceLesson) {
        return;
      }

      sourceLesson.dayOfWeek = dayOfWeek;
      sourceLesson.period = period;
      sourceLesson.consecutiveGroupId = consecutiveGroupId;

      this._commonLessonManager.assignLesson(sourceLesson);
    });

    return this.currentAssignedLessonsWithRefreshValidator();    
  }
  
  initWithPresetedLessons(presetLessons: Lesson[]): Lesson[] {
    // 수업 배정 데이터 초기화
    this._context.initPeriodOverviews();
    this._context.initSpecialtyRoomFreeStatus();

    // 이미 배정된 수업을 적용한다.
    const assignedLessons = [...presetLessons] as Lesson[];
    assignedLessons.forEach((lesson) => {
      this._commonLessonManager.assignLesson(lesson);
    });

    return this.currentAssignedLessonsWithRefreshValidator();
  }

  // 자동 생성
  autoAssign(presetLessons: Lesson[], isSilent: boolean = false): Lesson[] {
    this._context.isSlient = isSilent;

    // 최대 실행 횟수
    const maxTryCount = 100;

    let autoAssignResult = false;

    for (let tryCount = 0; tryCount < maxTryCount; tryCount++) {
      if (tryCount > 0) {
        this._context.printLog(
          `${tryCount}번째 수업 배정 실패. 다시 시도합니다.`
        );
      }

      // 수업 배정 데이터 초기화
      this._context.initPeriodOverviews();
      this._context.initSpecialtyRoomFreeStatus();

      // 이미 배정된 수업을 적용한다.
      const assignedLessons = [...presetLessons] as Lesson[];
      assignedLessons.forEach((lesson) => {
        this._commonLessonManager.assignLesson(lesson);
      });

      // 나머지 수업을 배정한다.
      autoAssignResult = this.autoAssignAllLessons();
      if (autoAssignResult) {
        this._context.printLog(`!!! ${tryCount}번째 수업 배정 성공 !!!`);
        break;
      }
    }

    // 초기화 후 빈 값을 반환
    if (!autoAssignResult) {
      this._context.printLog('<<<<< 수업 배정 실패 >>>>', maxTryCount);
    }

    return this.currentAssignedLessonsWithRefreshValidator();
  }

  autoAssignAllLessons(): boolean {
    // 배정되지 않은 모든 수업을 배정한다.
    // - 고정 수업은 미리 배정되어 있어야 하며, 해당 메소드 호출 시에는 아직 배정되지 않은 고정수업은 무시한다.
    // - 영향도가 큰 수업부터 배정한다.
    const {
      _concurrentLessonManager,
      _consecutiveLessonManager,
      _commonLessonManager,
    } = this;

    // 단계적 테스트를 위해 분리하여 순차 진행

    
    // 1. 연속 수업
    const consecutiveResult = _consecutiveLessonManager.autoAssignLessons();
    if (this.isAssignFailed(consecutiveResult)) {
      this._context.printLog('연속 수업 배정 실패', _consecutiveLessonManager.constructor.name);
      return false;
    }
    
    // 2. 동시 수업
    const concurrentResult = _concurrentLessonManager.autoAssignLessons();
    if (this.isAssignFailed(concurrentResult)) {
      this._context.printLog('동시 수업 배정 실패', _concurrentLessonManager.constructor.name);
      return false;
    }
    this._context.printLog('동시 수업 배정 성공', _concurrentLessonManager.constructor.name);

    // 3. 일반 수업. 수업 배정 만 반복
    const maxCommonLessonTryCount = 20;
    let tryCount = 0;
    do {
      this._commonLessonManager.resetAllAssignments();

      const commonResult = this._commonLessonManager.autoAssignLessons();
      if (!this.isAssignFailed(commonResult)) {
        return true;
      }

      tryCount++;

      this._context.printLog(`[${_commonLessonManager.constructor.name}] 수업 배정 실패. ${tryCount}회 시도`);
    } while (maxCommonLessonTryCount > tryCount);

    return false;
  }


  isAssignFailed(assignResult: AssignResult): boolean {
    // 배정 실패가 아닌 경우
    const { result } = assignResult;
    return result !== ASSIGN_RESULT.SUCCESS && result !== ASSIGN_RESULT.EMPTY;
  }


  generateFixedUnifiedLessons(): Lesson[] {
    const fixedConfs = this._context.fixedConfs;

    if (fixedConfs.length === 0) {
      return [];
    }

    // 공통 수업 고정 목록
    const unifiedLessons = [] as Lesson[];
    fixedConfs
      .filter((conf) => {
        return this._context.courseMap[conf.courseId]
          ? this._context.courseMap[conf.courseId].isUnified
          : false;
      })
      .forEach(({ courseId, grade, dayOfWeek, period, consecutiveGroupId }) => {
        const classes = this._context.classesByGrade[grade] || [];

        if (classes.length === 0) {
          return;
        }

        classes.forEach(({ classId }) => {
          const lesson: Lesson = {
            lessonId: '',
            classId,
            courseId,
            lessonTeachers: [],
            dayOfWeek,
            period,
            isFixedCourse: true,
            isManuallyAssigned: false,
            consecutiveGroupId,
          };

          unifiedLessons.push(lesson);
        });
      });

    return unifiedLessons;
  }

  generateFixedConcurrentLessons(): Lesson[] {
    const fixedConfs = this._context.fixedConfs;

    if (fixedConfs.length === 0) {
      return [];
    }

    // 동시 수업 고정 목록
    const concurrentLessons = [] as Lesson[];
    fixedConfs
      .filter((conf) => {
        return this._context.courseMap[conf.courseId]
          ? this._context.courseMap[conf.courseId].isConcurrent
          : false;
      })
      .forEach(({ courseId, dayOfWeek, period, consecutiveGroupId }) => {
        // 동시 수업
        const concurrentCourseId = courseId;
        const concurrentCourse = this._context.courseMap[concurrentCourseId];
        const list =
          this._context.lessonConfsByConcurrentCourse[courseId] || [];
        
          if (list.length === 0) {
          return;
        }

        list.forEach(({ courseId, classId, specialtyRoomId }) => {          
          const course = this._context.courseMap[courseId];
          const lesson: Lesson = {
            lessonId: '',
            classId,
            courseId,
            // teacherIds: [],
            lessonTeachers: [],
            specialtyRoomId,
            dayOfWeek,
            period,
            isFixedCourse: true,
            isManuallyAssigned: false,
            concurrentCourseId,
            concurrentCourseTitle: concurrentCourse.displayedTitle,
            consecutiveGroupId,
            courseName: course?.displayedTitle || '',
          };

          concurrentLessons.push(lesson);
        });
      });

    // 동시 수업에 교사 등록: 복수 교사인 경우의 처리를 위함
    concurrentLessons.forEach((lesson) => {
      const teacherLessonConfs: {
        lessonConf: LessonConf;
        teacherName: string;
      }[] = this._context.lessonConfWithClassAndCourse(
        lesson.classId,
        lesson.courseId
      );

      // lesson.teacherIds = teacherLessonConfs.map((t) => t.teacherId);
      lesson.teacherNames = teacherLessonConfs.map((t) => t.teacherName);
      lesson.lessonTeachers = teacherLessonConfs.map((t) => ({
        teacherId: t.lessonConf.teacherId,
        lessonConfId: t.lessonConf.lessonConfId || '',
      }));
    });

    return concurrentLessons;
  }

  // 고정 수업 생성
  async generateAllFixedLessons(): Promise<Lesson[]> {
    const unifiedLessons = this.generateFixedUnifiedLessons();
    const concurrentLessons = this.generateFixedConcurrentLessons();

    return [...unifiedLessons, ...concurrentLessons];
  }

  isFullSpecialtyRoomPeriod(
    specialtyRoomId: string,
    dayOfWeek: number,
    period: number
  ): boolean {
    const specialtyRoomFreeStatus = this._context.specialtyRoomFreeStatus;
    const roomStatus = specialtyRoomFreeStatus[specialtyRoomId];

    if (!roomStatus) {
      return false;
    }

    const periodKey = this._context.getPeriodTupleKey([dayOfWeek, period] as PeriodTuple);

    if(roomStatus.counterMap[periodKey] === undefined || roomStatus.counterMap[periodKey] === null) {
      return false;
    }

    return roomStatus.counterMap[periodKey] === 0;
  }

  replaceLessonIdWithLessons(lessons: Lesson[]): void {    
    lessons.forEach((lesson) => {
      const { classId } = lesson;
      
      if(!classId) {
        return;
      }
      
      const { dayOfWeek, period, courseId, lessonId } = lesson;

      // classes
      const classOverView = this._context.classPeriodOverviewMap[classId];
      classOverView && classOverView.assignedLessons.forEach((l) => {
        if(l.dayOfWeek !== dayOfWeek || l.period !== period || l.courseId !== courseId) {
          return;
        }
        console.log('Updating lessonId for class:', classId, 'lessonId:', lessonId);
        l.lessonId = lessonId;
      })

      // teachers
      const { lessonTeachers } = lesson;      
      (lessonTeachers || []).forEach(({ teacherId }) => {
        const teacherOverview = this._context.teacherPeriodOverviewMap[teacherId];

        teacherOverview && teacherOverview.assignedLessons.forEach((l) => {
          if(l.dayOfWeek !== dayOfWeek || l.period !== period || l.courseId !== courseId) {
            return;
          }
          console.log('Updating lessonId for teacher:', teacherId, 'lessonId:', lessonId);
          l.lessonId = lessonId;
        });
      });
    });      
  }

  currentAssignedLessonsWithRefreshValidator(): Lesson[] {
    const currentAssginedLessons = this._context.currentAssignedLessons();
    this._timetableValidator.validate(currentAssginedLessons);
    
    this._context.printOverviews();
    
    return currentAssginedLessons;
  }
}
