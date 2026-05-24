
// [dayOfWeek, period]
export type PeriodTuple = [number, number];

// [lessonDate, period, dayOfWeek]
export type DailyPeriodTuple = [number, number, number];

export type TimetablePeriod = {
  dayOfWeek: number;
  period: number;
};

export type DailyTimetablePeriod = {
  lessonDate: number;  
  period: number;
  dayOfWeek: number;
};

export interface DatePeriod {
  startDate: number;
  endDate: number;
};

export interface LessonTeacher {
  teacherId: string;
  lessonConfId?: string;
}

export interface TimetableConfig {
  maxGrade: number;
  classDays: number[];
  maxPeriod: number;
  startPeriod?: number;  
  grades: TimetableGrade[];
  isDisplayDailyScheduleTime?: boolean;
  isDisplayLunchTime?: boolean;
  operationStartDate?: number | null; // YYYYMMDD 형식
  operationEndDate?: number | null; // YYYYMMDD 형식
}

export interface TimetableGrade {
  grade: number;
  gradeName?: string;
  maxClassCount: number;
  maxVirtualClassCount: number;
  timetableStructure?: TimetableStructure;
}

export interface TimetableStructure {
  startTime?: string | null;
  freePeriods?: TimetablePeriod[] | null;
  beforeLunchPeriod?: number | null;
  classDuration?: number | null;
  breakDuration?: number | null;
  lunchDuration?: number | null;
}

export interface Class {
  classId: string;
  className: string;
  grade: number;
  classNumber: number;
  isVirtual: boolean;
  // API에서 내려주는 경우만 사용
  gradeName?: string;
  homeroomTeacherName?: string;
}

export interface CourseBase {
  courseBaseId: string;
  standardCourseId: string | null;
  standardCourseTitle?: string | null;
  displayedTitle: string;
  sortNo: number;
  isDoubleTeacher: boolean;
  countTeacher: number;
  similarCourseConfId?: string;
}

export interface Course {
  courseId: string;
  standardCourseTitle?: string | null;
  courseBaseId: string;
  displayedTitle: string;
  periodCount?: number | null;
  sortNo: number;
  isDoubleTeacher: boolean;
  countTeacher: number;
  isUnified: boolean;
  isConcurrent: boolean;
  similarCourseConfId?: string;
}

export interface Teacher {
  teacherId: string;
  teacherName: string;
  freePeriods?: TimetablePeriod[];
  courses?: Course[];
  classId?: string;
  // 프론트에서 반응형으로 사용하기 위한 속성
  className?: string;
  // 학급 담임의 수업 없음을 처리하기 위한 속성
  gradeFreePeriods?: TimetablePeriod[];
}

export interface TeacherCourse {
  teacherId: string;
  courseId: string;
  coursePeriod: number;
  sortNo: number;
  templateId?: string;
}

export interface TeacherCourseBase {
  teacherId: string;
  courseBaseId: string;
  sortNo: number;
  templateId?: string;
}

export interface CourseOfTeacher extends Course {
  teacherId: string;
  sortNoOfTeacher: number;
}

export interface CourseBaseOfTeacher extends CourseBase {
  teacherId: string;
  sortNoOfTeacher: number;
}

export interface SpecialtyRoom {
  specialtyRoomId: string;
  roomName: string;
  maxClass?: number;
  isAfterBasic?: boolean;
}

/*
  2025.11.25, notbadlife !!! IMPORTANT !!! -> combineConfId
  - 동시수업 합반을 위한 필드, 1차에는 정식으로 미구현 되어있으나 합반의 구현을 위해 추후 사용될 예정
  - 현재는 front or core에서 필요에 따라 임의로 구성하여 사용한다. 정식 구현시 대체할 것!!!
 */
export interface LessonConf {
  lessonConfId: string;
  courseId: string;
  classId: string;
  teacherId: string;
  specialtyRoomId?: string;
  grade: number;
  concurrentCourseId?: string;
  consecutivePeriod?: string;
  combineConfId?: string; 
  templateId?: string;
  // 실제 데이터에서는 없지만, 배정-삭제 시 사용을 위한 정보
  dayOfWeek?: number;
  period?: number;
  periodCount?: number;
  periodIndex?: number;
}

export interface ConcurrentConf {
  courseId: string;
  grade: number;
  consecutivePeriod: string;
  isCombinedClass?: boolean;
  sortNo?: number;
}

export interface FixedConf {
  fixedConfId: string;
  courseId: string;
  grade: number;
  dayOfWeek: number;
  period: number;
  consecutiveGroupId?: string;
}

export interface ConsecutiveConf {
  consecutiveConfId: string;
  courseId: string;
  teacherId: string;
  consecutivePeriod: string;
  grade: number;
  teacherName?: string;
}

export interface SpecialtyRoomConf {
  specialtyRoomConfId: string;
  specialtyRoomId: string;
  courseId: string;
  teacherId: string;
  concurrentCourseId?: string;
  grade: number;
  periodCount: number;
  teacherName?: string;
  consecutivePeriod?: string;
}

export interface SimilarCourseConf {
  similarCourseConfId: string;
  similarCourseName: string;
  sortNo: number;
}

export interface SimilarCourse {
  similarCourseConfId: string;
  courseBaseId: string;
}

/*
  2025.11.25, notbadlife !!! IMPORTANT !!! -> combineConfId
  - 동시수업 합반을 위한 필드, 1차에는 정식으로 미구현 되어있으나 합반의 구현을 위해 추후 사용될 예정
  - 현재는 front or core에서 필요에 따라 임의로 구성하여 사용한다. 정식 구현시 대체할 것!!!
 */
interface LessonBase {
  classId: string;
  courseId: string;
  specialtyRoomId?: string;
  dayOfWeek: number;
  period: number;
  concurrentCourseId?: string;
  concurrentCourseTitle?: string;
  consecutiveGroupId?: string;
  combineConfId?: string; 
  courseName?: string;
  teacherNames?: string[];
}

export interface Lesson extends LessonBase {
  lessonId: string;
  isFixedCourse: boolean;
  isManuallyAssigned: boolean;
  lessonTeachers?: LessonTeacher[];
  lessonClasses?: string[]; // 합반인 경우만, 교사의 시간표에서 사용하기 위한 필드
}

export interface DailyLesson extends LessonBase {
  dailyLessonId: string;
  lessonType: TimetableDailyLessonType;
  lessonTeacherIds?: string[];
  lessonDate: number;
  changeType: TimetableDailyLessonChangeType;
  isRemoved: boolean;
  isMoved: boolean;
  className: string;
  roomName?: string;
  combinedGroupId?: string;
  lessonChangeId?: string; // 결/보강 중첩 처리를 위한 lessonChangeId 저장
  isVirtualClass?: boolean; // 가상학급 여부 (가상학급의 경우 true, 일반학급은 false 또는 undefined)
  isFixedCourse?: boolean; // 고정과목 여부 (고정과목의 경우 true, 일반과목은 false 또는 undefined)
}

export interface CoreData {
  classes?: Class[];
  courses?: Course[];
  teachers?: Teacher[];
  specialtyRooms?: SpecialtyRoom[];
}

export interface ConfigData {
  lessonConfs?: LessonConf[];
  concurrentCourseConfs?: ConcurrentConf[];
  fixedConfs?: FixedConf[];
}

export interface PeriodOverview {
  remainingLessonPeriods: PeriodTuple[];
  assignedLessons: Lesson[];
  remainingLessonConfs: LessonConf[];
  assignedLessonConfs: LessonConf[];
}

export interface ClassPeriodOverview extends PeriodOverview {
  cls: Class;
}

export interface TeacherPeriodOverview extends PeriodOverview {
  teacher: Teacher;
}

export interface DailyPeriodOverview {
  remainingLessonPeriods: DailyPeriodTuple[];
  assignedLessons: DailyLesson[];

  // TODO: Daily...Overview에서는 LessonConf이 불필요. 추후 제거 필요
  remainingLessonConfs: LessonConf[];
  assignedLessonConfs: LessonConf[];
}

export interface ClassDailyPeriodOverview extends DailyPeriodOverview {
  cls: Class;
}

export interface TeacherDailyPeriodOverview extends DailyPeriodOverview {
  teacher: Teacher;
}


export type AssignPeriodResult = {
  assignPeriods: PeriodTuple[];
  consecutiveGroupId?: string;
};

export enum ASSIGN_RESULT {
  SUCCESS = 'SUCCESS',
  NOT_FOUND = 'NOT_FOUND',
  FAIL = 'FAIL',
  EMPTY = 'EMPTY',
  RETRY = 'RETRY',
}

export enum TimetableEditState {
  AssignTeacherFreeTime = 'ASSIGN_TEACHER_FREE_TIME',
  AssignLesson = 'ASSIGN_LESSON',
  MoveLesson = 'MOVE_LESSON',
  None = 'NONE',
}

export enum InitializeOption {
  AutoAssigned = 'AUTO_ASSIGNED',
  // FixedConcurrentCourse = 'FIXED_CONCURRENT_COURSE', 보류
  ManuallyAssigned = 'MANUALLY_ASSIGNED',
  TeacherFreeTime = 'TEACHER_FREE_TIME',
}

export interface ChainExchangeable {
  targetLesson: Lesson;
  paths: Lesson[][];
}

export interface DailyChainExchangeable {
  targetLesson: DailyLesson;
  paths: DailyLesson[][];
}

export interface ConcurrentCourseExchangeInfo {
  dayOfWeek: number;
  period: number;
  lesson?: Lesson;
  pathMap: Record<string, Lesson[]>;
}

export interface ConsecutiveCourseExchangeInfo {
  dayOfWeek: number;
  periods: number[];
  sourceLessons?: Lesson[];
  targetLessonMoveInfos?: LessonMoveInfo[][]; // 경로가 여러개 일 수 있으므로 2차원 배열
}

export interface DailyConcurrentCourseExchangeInfo {
  dayOfWeek: number;
  period: number;
  lesson?: DailyLesson;
  pathMap: Record<string, DailyLesson[]>;
}

export interface LessonMoveInfo {
  sourceLesson?: Lesson;
  targetPeriod?: TimetablePeriod;
}

export interface DailyLessonMoveInfo {
  sourceLesson?: DailyLesson;
  targetPeriod?: DailyTimetablePeriod;
}

export interface ConsecutivePeriodOption {
  label: string;
  value: string;
  numbers: number[];
}

export interface LessonConfItem {
  lessonConf: LessonConf;
  courseName: string;
  teacherName: string;
  isWarningRelatedPeriod?: boolean;
}

export interface ConcurrentConfCourse extends ConcurrentConf, Omit<Course, 'sortNo'> {}

export enum ValidStatusType {
  SameTeacherSameCourse = 'SAME_TEACHER_SAME_COURSE', // 같은 교사 같은 과목  
  DifferentTeacherSameCourse = 'DIFFERENT_TEACHER_SAME_COURSE', // 같은 과목 다른 교사 
  SameTeacherDifferentCourse = 'SAME_TEACHER_DIFFERENT_COURSE', // 다른 과목 같은 교사 
  OverloadedTeacher = 'OVERLOADED_TEACHER',
  MissingDayAssigned = 'MISSING_DAY_ASSIGNED',
  SameDayThreeCourse = 'SAME_DAY_THREE_COURSE',
  BalancedCourseAssignment = 'BALANCED_COURSE_ASSIGNMENT',
  ConsecutiveHourLimitExceed = 'CONSECUTIVE_HOUR_LIMIT_EXCEED',
  LunchBreakOverlap = 'LUNCH_BREAK_OVERLAP',
  FirstPeriodExceed = 'FIRST_PERIOD_EXCEED',
  RepeatedFirstPeriod = 'REPEATED_FIRST_PERIOD',
  amPmConflictCount = 'AM_PM_CONFLICT_COUNT',
}

export type ValidStatusCountTypeMap = Record<ValidStatusType, number>;
export type ValidStatusTypeLessonSet = Record<ValidStatusType, Set<string>>;
export type ValidStatusMap = Record<string, ValidStatusCountTypeMap>;

export interface AssignResult {
  result: ASSIGN_RESULT;
  lessons?: Lesson[];
}

export enum TimetableDailyLessonType {
  Lesson = 'LESSON',
  Event = 'EVENT',
}

/*
    EXCHANGE,  // 교체
    ADJUSTMENT, // 보강
    REPLACEMENT,  // 변경
    ADDITION,  // 추가
    COMBINATION,  // 합반
    MULTIPLE,  // 복수
    EVENT,  // 행사처리
    REASSIGNMENT,  // 이동
    DUPLICATION,  // 복사
    REMOVAL,  // 삭제
    INTERNAL_SWAP,  // 교환_동일학급
    EXTERNAL_SWAP,  // 교환_다른학급
    NONE  // 없음
*/

export enum TimetableDailyLessonChangeType {
  Exchange = 'EXCHANGE',
  Adjustment = 'ADJUSTMENT',
  Replacement = 'REPLACEMENT',
  Addition = 'ADDITION',
  Combination = 'COMBINATION',
  Multiple = 'MULTIPLE',
  Event = 'EVENT',
  Reassignment = 'REASSIGNMENT',
  Duplication = 'DUPLICATION',
  Removal = 'REMOVAL',
  InternalSwap = 'INTERNAL_SWAP',
  ExternalSwap = 'EXTERNAL_SWAP',
  None = 'NONE',
}

export interface DailyLesson {
  dailyLessonId: string;
  timetableId: string;
  lessonType: TimetableDailyLessonType;
  classId: string;
  lessonDate: number; // YYYYMMDD 형식
  dayOfWeek: number;
  period: number;
  courseId: string;  
  specialtyRoomId?: string;
  changeType: TimetableDailyLessonChangeType;
  isRemoved: boolean; // 수업이 삭제된 경우 true, 원래 수업이 없던 시간은 false
  isMoved: boolean; // 수업이 이동된 경우 true, 이동되지 않은 경우 false
  className: string; // 학급명 (예: "1학년 1반")
  courseName?: string; // 과목명 (수업인 경우)
  eventName?: string; // 행사명 (행사인 경우)
  teacherName?: string; // 교사명 (복수인 경우 파이프로 구분, 예: "홍길동|김철수")
  roomName?: string; // 특별실 이름 (특별실이 없는 경우 null)
  consecutiveGroupId?: string;
  concurrentCourseId?: string;
  concurrentCourseTitle?: string;
  combinedGroupId?: string; // 합반인 경우 동일 합반의 group_id
  lessonChangeId?: string;
  lessonTeacherIds?: string[];
}

export interface LessonDay {
  lessonDate: number;
  dayOfWeek: number;
}

export enum TimetableLessonChangeStatus {
    Pending = "PENDING",   // 대기
    Completed = "COMPLETED", // 완료
    Canceled = "CANCELED",  // 취소
    Rejected = "REJECTED",  // 반려
    Ignored = "IGNORED",   // 불가
    Recovered = "RECOVERED"   // 관리자 취소
}

export interface SpecialtyRoomFreeStatus {
  specialtyRoomId: string;
  maxClass: number;
  freePeriods: PeriodTuple[];
  counterMap: Record<string, number>; // key: "dayOfWeek_period", value: count
}

export enum TimetableLessonChangeType {
  Lesson = "LESSON",
  Schedule = "SCHEDULE"
}

export enum TimetableLessonChangeSelectionType {
  All = "ALL",
  Grade = "GRADE",
  Class = "CLASS",
  None = "NONE"
}

export enum TimetableLessonChangeDetailType {
  Move = "MOVE",
  Add = "ADD",
  Delete = "DELETE"
}

export interface TimetableLessonChange {
  lessonChangeId: string;
  timetableId: string;
  status: TimetableLessonChangeStatus;
  selectedType: TimetableLessonChangeSelectionType;
  selectedGrades?: string[];
  selectedStartDate?: number;
  selectedEndDate?: number;
  selectedStartPeriod?: number;
  selectedEndPeriod?: number;
  targetDate?: number;
  targetStartPeriod?: number;
  selectedClassName?: string[];
  eventName?: string;
  changeType: TimetableLessonChangeType;
  lessonChangeType: TimetableDailyLessonChangeType;
  requestedUser: UserView;
  requestedUserAuth?: "MASTER" | "MANAGER";
  requestedTimestamp: number;
  approvedUser?: UserView;
  approvedTimestamp?: number;
  statusUpdatedUser?: UserView;
  statusUpdatedTimestamp?: number;
  contents?: string;
  reason?: string;
  note?: string;
}

export interface LessonChangeSimple {
  lessonChangeId: string;
  lessonChangeType: TimetableDailyLessonChangeType;
  contents?: string;
}

export interface UserView {
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  userName?: string;
  userPhoto?: string;
  userMobile?: string;
  userSns?: string;
  loginId?: string;
  userChatDay?: string;
  userChatStartTime?: string;
  userChatEndTime?: string;
  userStatus?: "ACTIVATE" | "DEACTIVATE";
  userPushUsed?: boolean;
  maskingUserName?: boolean;
  maskingUserMobile?: boolean;
  /** @format uuid */
  currentId?: string;
  isChat?: boolean;
}

export interface TimetableLessonChangeDetail {
  lessonChangeId: string;
  changeSeq: number;
  lessonChangeDetailType: TimetableLessonChangeDetailType;
  sourceDailyLessonId?: string;
  sourceClassId?: string;
  sourceSpecialtyRoomId?: string;
  sourceLessonDate?: number;
  sourcePeriod?: number;
  sourceCourseId?: string;
  sourceTeacherId?: string;
  targetDailyLessonId?: string;
  targetClassId?: string;
  targetSpecialtyRoomId?: string;
  targetLessonDate?: number;
  targetPeriod?: number;
  targetCourseId?: string;
  targetTeacherId?: string;
}

export enum TimetableStatus {
  Init = 'INIT',
  WeeklyPeriod = 'WEEKLY_PERIOD',
  CourseBase = 'COURSE_BASE',
  Teacher = 'TEACHER',
  LessonConfig = 'LESSON_CONFIG',
  AdditionalWork = 'ADDITIONAL_WORK',  
  Generate = 'GENERATE',
  Finish = 'FINISH',
  Edit = 'EDIT',
}

export interface TimetableIndex {
  timetableId: string;
  timetableName: string;
  status: TimetableStatus;
  operationStartDate: number;
  operationEndDate: number;
  dailyLessonAdjusted: boolean;
}

export interface TimetableProgress {
  status: TimetableStatus;
  assignedCount: number;
  remainingCount: number;
  isCompletable: boolean;
  timetableCoreTick: number;
  schoolId: string;
  timetableName: string;
  operationStartDate: number;
  operationEndDate: number;  
  templateId: string;
  templateName?: string;
  assignedClassLessonCount?: number;
  templateCount?: number;
}

export interface UploadLessonConf {
  standardCourseTitle: string;
  displayedTitle: string;
  teacherName: string;
  grade?: number;
  className?: string;
  periodCount?: number;
  isVirtual?: boolean;
}

export enum ExcelExportSortType {
  TEACHER_REG = 'TEACHER_REG',
  TEACHER_NAME = 'TEACHER_NAME'
}