import { Lesson, Teacher, LessonConf, SpecialtyRoom, TeacherCourse, TeacherCourseBase, SpecialtyRoomConf } from "@/apps/timetable/core/types";

export interface Menu {
  name: string;
  label: string;
  callback?: () => void;
}

export interface TeacherRow {
  id: string;
  title: string;
  subtitle: string | undefined;
}

export interface LessonCell extends Lesson {
  isHighlighted?: boolean;
}

export interface EditorCellLesson {
  lesson?: Lesson;
  isReadOnly?: boolean;
  isFreePeriod?: boolean;
  isGradeFreePeriod?: boolean;
  isOneToOneExchangeable?: boolean;
  isChainExchangeable?: boolean;
  isConcurrentCourseExchangeable?: boolean; // 동시수업 연쇄 교환 가능 여부
  chainExchangeableCount?: number;
  isConcurrentTeacherLesson?: boolean; // 선택한 과목의 동시수업에 속한 교사의 수업이 있음
  isPartnerTeacherLesson?: boolean; // 선택한 과목의 복수 교사에 속한 교사의 수업이 있음
  isFullSpecialtyRoom?: boolean; // 선택한 과목의 특별실 수업이 가득 참
  isConsecutiveExchangeableHead?: boolean; // 연속수업 교환 가능 여부
  isConsecutiveExchangeableTail?: boolean; // 연속수업 교환 가능 여부
  isHighlighted?: boolean;
}

export interface CellLesson {  
  lesson?: Lesson;
  isGradeFreePeriod?: boolean;
  cellLessonType: CellLessonType;
}

export enum CellLessonType {
  TEACHER = 'teacher',
  CLASS = 'class',
}  

export interface TeacherCourseClassForSwap {
  teacherId: string;
  courseId: string;
  classId: string;
}

export interface EmbeddedListResponse<T> {
  _embedded: {
    [key: string]: T[];
  }
}

export interface ErrorCodeResponse {
  error: string | null;
  message: string | null;
  cause: string | null;
}

export interface PageResponse<T> {
  _embedded: {
    [key: string]: T[];
  },
  page: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: 0;
    }
}

export interface ActivateWeekday {
  title: string;
  dayOfWeek: number;
  isActive: boolean;
}

export interface DailyTimeSchedule {
  startPeriod: number;
  startTime?: string | null;
  classDuration?: number | null;
  breakDuration?: number | null;
  lunchDuration?: number | null;
  isDisplayDailyScheduleTime?: boolean;
  isDisplayLunchTime?: boolean;
}

export interface TeacherTableItem {
  id: string;
  title: string;
  subtitle?: string;
  entity: Teacher;
  className?: string;
  periodCount?: number;
  editTeacherName?: string;
  editClassName?: string | null;
}

export interface LessonHistoryItem {
  lessonHistoryId: string;
  timetableId: string;
  templateId: string;
  memo: string;
  insertedTimestamp: string;
  isRestorable: boolean;
}

export interface ConsecutiveConfEntity {
  courseId: string;
  courseTitle: string;
  // courseDisplayTitle: string;
  coursePeriod?: number | null;
  grade: number;
  isConsecutive: boolean;
  isConcurrent: boolean;
  roomId?: string | null;
  teachers: Teacher[];
  isCheck?: boolean;
}

export interface SpecialtyRoomConfEntity {
  courseId: string;
  courseTitle: string;
  coursePeriod?: number | null;
  grade: number;
  isConsecutive: boolean;
  isConcurrent: boolean;
  concurrentCourseId?: string;
  assignedRoom: SpecialtyRoomConf | null;
  lessonConfs: LessonConf[];
  representative: string;
  teachers: Teacher[];
  isVirtual: Boolean;
  isCheck?: boolean;
  // isDoubleTeacher?: boolean;
  // standardCourseTitle?: string;
}

export interface SpecialtyRoomDeleteResponse {
  specialtyRoom: SpecialtyRoom;
  lessonConfs: LessonConf[];
  specialtyRoomConfIds: string[];
}

export interface UpdatedLessonResponse {
  lessons: Lesson[];
  deletedLessonIds: string[];
}

export interface LessonSwapResponse {
  deletedLessonIds: string[];
  lessons: Lesson[];
  lessonConfs: LessonConf[];
  teacherCourseConfs: TeacherCourse[];
  teacherCourseBaseConfs: TeacherCourseBase[];
}

export interface LessonTossResponse {
  lessons: Lesson[];
  lessonConfs: LessonConf[];
  teacherCourseConfs: TeacherCourse[];
  teacherCourseBaseConfs: TeacherCourseBase[];
  teacher: Teacher;
}

export interface TimetableIndexDto {
  timetableId: string;
  timetableName: string;
  operationStartDate: number;
  operationEndDate: number;
}

export interface LessonDay {
  lessonDate: number;
  dayOfWeek: number;
}


export enum LessonConfEditType {
  Teacher = 'TEACHER',
  Course = 'COURSE',
}

export interface LessonConfEditStatus {
  type: LessonConfEditType;
  targetId?: string | null;
}

export interface SpecialtyRoomConfRequest {
  periodCount: number;
  consecutivePeriod: string |  null;
}

export enum DownloadType {
  Excel = 'EXCEL',
  Hwp = 'HWP',
}

export enum TimetableViewType {
  Class = 'CLASS',
  Teacher = 'TEACHER',
  SpecialtyRoom = 'SPECIALTY_ROOM',
  All = 'ALL',
  Neis = 'NEIS',
}

export enum NoticeType {
  DataEditNotice = 'DATA_EDIT_NOTICE',
  ConcurrentConfNotice = 'CONCURRENT_CONF_NOTICE',
  ConcurrentConfError = 'CONCURRENT_CONF_ERROR',
  None = 'NONE',
}

export enum DateType {
  All = 'all',
  Range = 'range',
}

export interface CourseBaseTitle {
  displayedTitle: string;
  standardCourseTitle: string;
}