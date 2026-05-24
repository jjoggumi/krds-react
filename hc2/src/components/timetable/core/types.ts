import { TimetableStatus } from '../../../../../src/apps/timetable/core/types';

export {
  ASSIGN_RESULT,
  TimetableEditState,
  InitializeOption,
  ValidStatusType,
  TimetableDailyLessonType,
  TimetableDailyLessonChangeType,
  TimetableLessonChangeStatus,
  TimetableLessonChangeType,
  TimetableLessonChangeSelectionType,
  TimetableLessonChangeDetailType,
  TimetableStatus,
} from '../../../../../src/apps/timetable/core/types';

export type {
  PeriodTuple,
  TimetablePeriod,
  AssignPeriodResult,
  ValidStatusCountTypeMap,
  ValidStatusMap,
  LessonTeacher,
  TimetableConfig,
  TimetableGrade,
  TimetableStructure,
  Class,
  Course,
  CourseBase,
  Teacher,
  TeacherCourse,
  TeacherCourseBase,
  CourseOfTeacher,
  SpecialtyRoom,
  LessonConf,
  ConcurrentConf,
  FixedConf,
  ConsecutiveConf,
  SpecialtyRoomConf,
  SimilarCourseConf,
  Lesson,
  CoreData,
  ConfigData,
  PeriodOverview,
  ClassPeriodOverview,
  TeacherPeriodOverview,
  ChainExchangeable,
  ConcurrentCourseExchangeInfo,
  LessonMoveInfo,
  ConsecutivePeriodOption,
  LessonConfItem,
  ConcurrentConfCourse,
  AssignResult,
  DailyLesson,
  DailyChainExchangeable,
  DailyLessonMoveInfo,
  LessonDay,
  TimetableLessonChangeStatus,
  TimetableLessonChange,
  TimetableLessonChangeDetail,
  TimetableIndex,
  LessonChangeSimple,
  DailyTimetablePeriod,
  UploadLessonConf,
} from '../../../../../src/apps/timetable/core/types';

/* 전체 시간표에서만 사용하는 core type 추가. */
export interface TimetableOverview {
  timetableId: string;
  timetableStatus: TimetableStatus;
  templateCount: number;
  lastestTemplateId?: string;
  lastestTemplateStatus?: TimetableStatus;
}
