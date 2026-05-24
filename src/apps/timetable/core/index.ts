import TimetableManager from './mod/timetable-manager';
import { TimetableDataContext } from './mod/timetable-data-context';
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
  ChainExchangeable,
  ConcurrentCourseExchangeInfo,
  SpecialtyRoomFreeStatus,
  ConsecutiveCourseExchangeInfo,
} from './types';
import TimetableDataFinder from './mod/timetable-data-finder';
import TimetableUtils, { LocalStorage } from './mod/utils';
import TeachersManager from './mod/teachers-manager';

class TimetableFacade {
  static instance: TimetableFacade;

  private _context!: TimetableDataContext;
  private _manager!: TimetableManager;
  private _finder!: TimetableDataFinder;
  private _teachersManager!: TeachersManager;

  private _generateCounter: number = 1;
  private _updatedAt: number = 0;

  constructor() {
    if (TimetableFacade.instance) {
      return TimetableFacade.instance;
    }

    this._context = TimetableDataContext.getInstance();
    this._manager = new TimetableManager(this._context);
    this._finder = new TimetableDataFinder(this._context);
    this._teachersManager = new TeachersManager(this._context);

    TimetableFacade.instance = this;

    return this;
  }

  get updatedAt(): number {
    return this._updatedAt;
  }

  get generateCounter(): number {
    return this._generateCounter;
  }

  set generateCounter(value: number) {
    this._generateCounter = value;
  }

  get timetableStatus() {
    // return this._manager.timetableStatus;
    return this._manager.timetableTeacherStatus;
    // 교사 기준으로 상태 반환
  }

  get teacherStatusMap() {
    return this._manager.teacherStatusMap;
  }

  get timetableStatusLessonIds() {
    return this._manager.timetableStatusLessonIds;
  }

  increaseGenerateCounter(): void {
    this._generateCounter += 1;
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

  initWithPresetedLessons(presetLessons: Lesson[]): Lesson[] {
    const lessons = this._manager.initWithPresetedLessons(presetLessons);
    this.refreshUpdatedAt();
    return lessons;
  }

  async generateFixedLessons(): Promise<Lesson[]> {
    return await this._manager.generateAllFixedLessons();
  }

  async generate(presetLessons: Lesson[], isSilent: boolean = false): Promise<Lesson[]> {
    this._generateCounter += 1;
    return this._manager.autoAssign(presetLessons, isSilent);
  }

  resetAssignedLesson(lesson: Lesson): Lesson[] {
    return this._manager.resetAssignedLesson(lesson);
  }

  findOneToOneExchangeableLessons(lesson: Lesson): Lesson[] {
    return this._finder.findOneToOneExchangeableLessons(lesson);
  }

  findChainExchangeableLessons(
    lesson: Lesson,
    maxChainExchangeCount: number = 3
  ): ChainExchangeable[] {
    return this._finder.findChainExchangeableLessons(
      lesson,
      maxChainExchangeCount
    );
  }

  findConcurrentCourseExchangeableLessons(
    lesson: Lesson,
    maxChainExchangeCount: number = 3
  ): ConcurrentCourseExchangeInfo[] | null {

    if (!lesson.concurrentCourseId) {
      return [];
    }

    return this._finder.findChainExchangeableLessonsWithConcurrent(
        lesson,
        maxChainExchangeCount
      );
  }

  findConsecutiveCourseExchangeableLessons(
    lesson: Lesson,
    maxChainExchangeCount: number = 3
  ): ConcurrentCourseExchangeInfo[] | null {

    if (!lesson.concurrentCourseId) {
      return [];
    }

    return this._finder.findChainExchangeableLessonsWithConcurrent(
        lesson,
        maxChainExchangeCount
      );
  }
  
  chainExchangeLessons(lessons: Lesson[]): Lesson[] {
    return this._manager.chainExchangeLessons(lessons);
  }

  exchangeConcurrentCourseLessons(concurrentCourseExchangeInfo: ConcurrentCourseExchangeInfo): Lesson[] {
    return this._manager.exchangeConcurrentCourseLessons(concurrentCourseExchangeInfo);
  }

  exchangeConsecutiveCourseLessons(consecutiveCourseExchangeInfo: ConsecutiveCourseExchangeInfo): Lesson[] {
    return this._manager.exchangeConsecutiveCourseLessons(consecutiveCourseExchangeInfo);
  }

  storeCurrentState(): void {
    this._context.storeCurrentState();
    LocalStorage.printStorageSize();
  }

  restoreState(): Lesson[] {
    this._context.restoreState();
    LocalStorage.printStorageSize();

    return this._context.currentAssignedLessons();
  }

  getTeacherOverview(teacherId: string): TeacherPeriodOverview {
    return (
      this._context.teacherPeriodOverviewMap[teacherId] ||
      ({
        remainingLessonPeriods: [] as PeriodTuple[],
        assignedLessons: [] as Lesson[],
        remainingLessonConfs: [] as LessonConf[],
        assignedLessonConfs: [] as LessonConf[],
      } as TeacherPeriodOverview)
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
    this._updatedAt = Date.now();
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

  isFullSpecialtyRoomPeriod(
    specialtyRoomId: string,
    dayOfWeek: number,
    period: number
  ): boolean {
    return this._manager.isFullSpecialtyRoomPeriod(
      specialtyRoomId,
      dayOfWeek,
      period
    );
  }

  refreshUpdatedAt(): void {
    this._updatedAt = Date.now();
  }

  replaceLessonIdWithLessons(lessons: Lesson[]): void {
    this._manager.replaceLessonIdWithLessons(lessons);
  }

  currentAssignedLessonsWithRefreshValidator(): Lesson[] {
    // this._manager.refreshTimetableValidator();
    return this._manager.currentAssignedLessonsWithRefreshValidator();
  }

  /* 교사 데이터 수정 끝 */
  get currentAssignedLessons(): Lesson[] {
    return this._context.currentAssignedLessons();
  }
  
  get countCurrentUnassigned(): number {
    const unassignedConfs = this._context.currentUnassignedLessonConfs();

    // 복수 교사 과목은 하나의 수업으로 간주, 복수 교사 수업이 아니면 교사별로 수업 시수 카운트
    const uniqueConfs = new Set<string>();
    unassignedConfs.forEach((conf) => {
      const course = this._context.courseMap[conf.courseId];
      const key = `${conf.classId}-${conf.courseId}-${conf.periodIndex || 0}${!course?.isDoubleTeacher ? `-${conf.teacherId}` : ''}`;
      uniqueConfs.add(key);
    });

    return uniqueConfs?.size || 0;
  }

  get specialtyRoomFreeStatus(): Record<string, SpecialtyRoomFreeStatus> {
    return this._context.specialtyRoomFreeStatus
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

  set specialtyRoomConfs(specialtyRoomConfs: any[]) {
    this._context.specialtyRoomConfs = specialtyRoomConfs;
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

  get context(): TimetableDataContext {
    return this._context;
  }
}

const Timetable = new TimetableFacade();

export default Timetable;
