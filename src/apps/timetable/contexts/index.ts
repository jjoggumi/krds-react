import TimetableCourseContext from './timetable-course-context';
import TimetableCourseBaseContext from './timetable-course-base-context';
import TimetableTeacherContext from './timetable-teacher-context';
import TeacherCourseContext from './teacher-course-context';
import TeacherCourseBaseContext from './teacher-course-base-context';
import ConcurrentConfContext from './concurrent-conf-context';
import ConsecutiveConfContext from './consecutive-conf-context';
import LessonConfContext from './lesson-conf-context';
import SpecialtyRoomConfContext from './specialty-room-conf-context';
import SpecialtyRoomContext from './specialty-room-context';
import TimetableGradeContext from './timetable-grade-context';
import TimetableClassContext from './timetable-class-context';
import FixedConfContext from './fixed-conf-context';
import LessonContext from './lesson-context';
import SimilarCourseConfContext from './similar-course-conf-context';
import SimilarCourseContext from './similar-course-context';
import TimetableProgressContext from './timetable-progress-context';

const ContextKeys = {
  Course: Symbol(),
  CourseBase: Symbol(),
  Class: Symbol(),
  Teacher: Symbol(),
  TeacherCourse: Symbol(),
  TeacherCourseBase: Symbol(),
  Grade: Symbol(),
  SpecialtyRoom: Symbol(),
  SpecialtyRoomConf: Symbol(),
  LessonConf: Symbol(),
  ConcurrentConf: Symbol(),
  ConsecutiveConf: Symbol(),
  SimilarCourseConf: Symbol(),
  FixedConf: Symbol(),
  Lesson: Symbol(),
  SimilarCourse: Symbol(),
  TimetableProgress: Symbol(),
}

export {
  ContextKeys,
  TimetableCourseContext,
  TimetableCourseBaseContext,
  TimetableTeacherContext,
  TeacherCourseContext,
  TeacherCourseBaseContext,
  ConcurrentConfContext,
  ConsecutiveConfContext,
  LessonConfContext,
  SpecialtyRoomConfContext,
  SpecialtyRoomContext,
  TimetableGradeContext,
  TimetableClassContext,
  FixedConfContext,
  LessonContext,
  SimilarCourseConfContext,
  SimilarCourseContext,
  TimetableProgressContext,
};

/*
 * Context는 데이터를 관리하는 용도
 *  - 기본적인 CRUD 및 API(백앤드) 연동
 * 
 * 기존의 service에서, 단순 조작은 context로 이관,
 *  - 비즈니스 로직이 다소 포함된 경우는 service에서 처리함을 유지하거나 백앤드로 이관을 고려
 *  - service에서 기존의 repository 대신 context를 사용하도록 변경
 */