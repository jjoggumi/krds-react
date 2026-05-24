
import {
  PeriodTuple,
  Class,
  Course,
  Lesson,
  LessonConf,
  Teacher,
  TimetableGrade,
  TimetableConfig,
  SpecialtyRoom,
  FixedConf,
  ConcurrentConf,
  TeacherCourse,
  TeacherPeriodOverview,
  TimetablePeriod,
  DailyLesson,
  DailyChainExchangeable,
  DailyConcurrentCourseExchangeInfo,
  TeacherDailyPeriodOverview,
  DatePeriod,
  LessonDay,
  DailyPeriodTuple,
} from './types';
import TimetableUtils, { LocalStorage } from './mod/utils';
import { DailyTimetableDataContext } from './mod/daily-timetable/data-context';
import DailyTimetableManager from './mod/daily-timetable/daily-timetable-manager';
import DailyTimetableDataFinder from './mod/daily-timetable/data-finder';
import DailyTimetableTeachersManager from './mod/daily-timetable/teachers-manager';

class DailyTimetableFacade {
  static instance: DailyTimetableFacade;

  private _context!: DailyTimetableDataContext;
  private _manager!: DailyTimetableManager;
  private _finder!: DailyTimetableDataFinder;
  private _teachersManager!: DailyTimetableTeachersManager;


  constructor() {
    if (DailyTimetableFacade.instance) {
      return DailyTimetableFacade.instance;
    }

    this._context = DailyTimetableDataContext.getInstance();
    this._manager = new DailyTimetableManager(this._context);
    this._finder = new DailyTimetableDataFinder(this._context);

    this._teachersManager = new DailyTimetableTeachersManager(this._context);

    DailyTimetableFacade.instance = this;

    return this;
  }
  
  assignLessonConfManually(
    timetablePeriod: TimetablePeriod,
    lessonConf: LessonConf,
    consecutivePeriod: number | undefined = undefined
  ) {
    return this._manager.assignLessonConfManually(
      timetablePeriod,
      lessonConf,
      consecutivePeriod
    );
  }

  // initWithPresetedLessons(presetLessons: DailyLesson[], datePeriod: DatePeriod): DailyLesson[] {
  initWithPresetedLessons(presetLessons: DailyLesson[], lessonDays: LessonDay[]): DailyLesson[] {
    return this._manager.initWithPresetedLessons(presetLessons, lessonDays);
  }

  /*
  async generateFixedLessons(): Promise<Lesson[]> {
    return await this._manager.generateAllFixedLessons();
  }
  */


  /*
  async generate(presetLessons: Lesson[]): Promise<Lesson[]> {
    return this._manager.autoAssign(presetLessons);
  }
  */

  resetAssignedLesson(lesson: DailyLesson): DailyLesson[] {
    return this._manager.resetAssignedLesson(lesson);
  }

  findOneToOneExchangeableLessons(lesson: DailyLesson): DailyLesson[] {
    return this._finder.findOneToOneExchangeableLessons(lesson);
  }

  /**
   * 연쇄 교환 가능 수업 경로 검색
   * 
   * 2025.09.29, notbadlife
   * - 연쇄 교환 가능 수업 경로를 찾는다. minChaninExchangeCount 부터 시작
   * - 검색 결과가 없으면 maxChaninExchangeCount 까지 늘려가며 검색
   * 
   * @param lesson 
   * @param minChainExchangeCount 연쇄 교환 최소 수 (기본값: 3)
   * @param maxChainExchangeCount 연쇄 교환 최대 수 (기본값: 5)
   * @returns 
   */
  findChainExchangeableLessons(
    lesson: DailyLesson,
    minChainExchangeCount: number = 3,
    maxChainExchangeCount: number = 5,
  ): DailyChainExchangeable[] {
  
    let exchangeCount = minChainExchangeCount;

    do {
      // console.log(`Trying to find chain exchangeable lessons with count: ${exchangeCount}`);

      const results = this._finder.findChainExchangeableLessons(lesson, exchangeCount);
      if (results && results.length > 0) {
        return results;
      }
      exchangeCount++;
    } while (exchangeCount <= maxChainExchangeCount);

    return [];
  }

  findConcurrentCourseExchangeableLessons(
    lesson: DailyLesson,
    maxChainExchangeCount: number = 3
  ): DailyConcurrentCourseExchangeInfo[] | null {

    if (!lesson.concurrentCourseId) {
      return [];
    }

    return this._finder.findChainExchangeableLessonsWithConcurrent(
        lesson,
        maxChainExchangeCount
      );
  }

  findConsecutiveCourseExchangeableLessons(
    lesson: DailyLesson,
    maxChainExchangeCount: number = 3
  ): DailyConcurrentCourseExchangeInfo[] | null {

    if (!lesson.concurrentCourseId) {
      return [];
    }

    return this._finder.findChainExchangeableLessonsWithConcurrent(
        lesson,
        maxChainExchangeCount
      );
  }
  
  chainExchangeLessons(lessons: DailyLesson[]): DailyLesson[] {
    return this._manager.chainExchangeLessons(lessons);
  }

  exchangeConcurrentCourseLessons(concurrentCourseExchangeInfo: DailyConcurrentCourseExchangeInfo): DailyLesson[] {
    return this._manager.exchangeConcurrentCourseLessons(concurrentCourseExchangeInfo);
  }

  /*
  storeCurrentState(): void {
    this._context.storeCurrentState();
    LocalStorage.printStorageSize();
  }

  restoreState(): DailyLesson[] {
    this._context.restoreState();
    LocalStorage.printStorageSize();

    return this._context.currentAssignedLessons();
  }
  */

  getTeacherOverview(teacherId: string): TeacherDailyPeriodOverview {
    return (
      this._context.teacherPeriodOverviewMap[teacherId] ||
      ({
        remainingLessonPeriods: [] as DailyPeriodTuple[],
        assignedLessons: [] as DailyLesson[],
        remainingLessonConfs: [] as LessonConf[],
        assignedLessonConfs: [] as LessonConf[],
      } as TeacherDailyPeriodOverview)
    );
  }

  /*
   * 2025.01.23, notbadlife
   * 데이터 수정 함수들이 늘어날 경우 별도의 클래스 등을 추출할 것인지 고민할 것
   */

  /* 교사 데이터 수정 시작 */
  addTeacherFreePeriod(
    teacherId: string,
    dayOfWeek: number,
    period: number
  ): void {
    // 교사의 남은 수업 가능 시수에서 제거
    this._manager.removeTeacherRemainingLessonPeriod(
      teacherId,
      dayOfWeek,
      period
    );

    // 교사의 자유시간 추가
    this._teachersManager.addFreePeriod(teacherId, dayOfWeek, period);
  }

  removeTeacherFreePeriod(
    teacherId: string,
    dayOfWeek: number,
    period: number
  ): void {
    // 교사의 남은 수업 가능 시수 추가
    this._manager.addToTeacherRemainingLessonPeriod(
      teacherId,
      dayOfWeek,
      period
    );

    // 교사의 자유시간에서 제거
    this._teachersManager.removeFreePeriod(teacherId, dayOfWeek, period);
  }

  resetTeacherFreePeriods(teacherId: string): void {
    const freePeriods = this._teachersManager.getFreePeriods(teacherId);

    // 교사의 남은 수업 가능 시수 추가
    this._manager.addListToTeacherRemainingLessonPeriod(
      teacherId,
      TimetableUtils.timetablePeriodsToPeriodTuples(freePeriods)
    );

    // 교사의 자유시간 초기화
    this._teachersManager.resetFreePeriods(teacherId);
  }

  resetAllTeacherFreePeriods(): void {
    const teacherIds = this._context.teachers.map(
      (teacher) => teacher.teacherId
    );

    teacherIds.forEach((teacherId) => {
      this.resetTeacherFreePeriods(teacherId);
    });
  }

  /* 교사 데이터 수정 끝 */

  get currentAssignedLessons(): DailyLesson[] {
    return this._context.currentAssignedLessons();
  }
  
  get countCurrentUnassigned(): number {
    const unassignedConfs = this._context.currentUnassignedLessonConfs();
    return unassignedConfs ? unassignedConfs.length : 0;
  }

  set classes(classes: Class[]) {
    this._context.classes = classes;
  }

  set courses(courses: Course[]) {
    this._context.courses = courses;
  }

  set teachers(teachers: Teacher[]) {
    this._context.teachers = teachers;
  }

  set specialtyRooms(specialtyRooms: SpecialtyRoom[]) {
    this._context.specialtyRooms = specialtyRooms;
  }

  set teacherCourses(teacherCourses: TeacherCourse[]) {
    this._context.teacherCourses = teacherCourses;
  }

  set lessonConfs(lessonConfs: LessonConf[]) {
    this._context.lessonConfs = lessonConfs;
  }

  set fixedConfs(fixedConfs: FixedConf[]) {
    this._context.fixedConfs = fixedConfs;
  }

  set concurrentCourseConfs(concurrentCourseConfs: ConcurrentConf[]) {
    this._context.concurrentCourseConfs = concurrentCourseConfs;
  }

  set timetableConfig(timetableConfig: TimetableConfig) {
    this._context.timetableConfig = timetableConfig;
  }

  get grades(): TimetableGrade[] {
    return this._context.timetableConfig.grades;
  }

  // Getter
  get classes(): Class[] {
    return this._context.classes;
  }

  get context(): DailyTimetableDataContext {
    return this._context;
  }
}

const DailyTimetable = new DailyTimetableFacade();

export default DailyTimetable;
