/*
// 동시 수업 배정 불가 데이터
import classesFromJson from '@/apps/timetable/sampledata/classes.json';
import coursedFromJson from '@/apps/timetable/sampledata/courses.json';
import teachersFromJson from '@/apps/timetable/sampledata/teachers.json';
import specialtyRoomsFromJson from '@/apps/timetable/sampledata/specialty_rooms.json';
import teacherCoursesFromJson from '@/apps/timetable/sampledata/teacher_courses.json';
import lessonConfsFromJson from '@/apps/timetable/sampledata/lesson_confs.json';
import fixedConfsFromJson from '@/apps/timetable/sampledata/fixed_confs.json';
import consecutiveConfsFromJson from '@/apps/timetable/sampledata/consecutive_confs.json';
import concurrentCourseConfsFromJson from '@/apps/timetable/sampledata/concurrent_course_confs.json';
import timetableGradeFromJson from '@/apps/timetable/sampledata/timetable_grade.json';
import specialtyRoomConfsFromJson from '@/apps/timetable/sampledata/specialty_room_confs.json';
import similarCourseConfsFromJson from '@/apps/timetable/sampledata/similar_course_confs.json';
*/


// 동시 수업 배정 가능 데이터
import classesFromJson from '@/apps/timetable/sampledata/availables/classes.json';
import coursedFromJson from '@/apps/timetable/sampledata/availables/courses.json';
import teachersFromJson from '@/apps/timetable/sampledata/availables/teachers.json';
import specialtyRoomsFromJson from '@/apps/timetable/sampledata/availables/specialty_rooms.json';
import teacherCoursesFromJson from '@/apps/timetable/sampledata/availables/teacher_courses.json';
import lessonConfsFromJson from '@/apps/timetable/sampledata/availables/lesson_confs.json';
import fixedConfsFromJson from '@/apps/timetable/sampledata/availables/fixed_confs.json';
import consecutiveConfsFromJson from '@/apps/timetable/sampledata/availables/consecutive_confs.json';
import concurrentCourseConfsFromJson from '@/apps/timetable/sampledata/availables/concurrent_course_confs.json';
import timetableGradeFromJson from '@/apps/timetable/sampledata/availables/timetable_grade.json';
import specialtyRoomConfsFromJson from '@/apps/timetable/sampledata/availables/specialty_room_confs.json';
import similarCourseConfsFromJson from '@/apps/timetable/sampledata/availables/similar_course_confs.json';


const JsonData = {
  classes: classesFromJson,
  courses: coursedFromJson,
  teachers: teachersFromJson,
  specialtyRooms: specialtyRoomsFromJson,
  teacherCourses: teacherCoursesFromJson,
  lessonConfs: lessonConfsFromJson,
  fixedConfs: fixedConfsFromJson,
  consecutiveConfs: consecutiveConfsFromJson,
  concurrentCourseConfs: concurrentCourseConfsFromJson,
  specialtyRoomConfs: specialtyRoomConfsFromJson,
  similarCourseConfs: similarCourseConfsFromJson,
  timetableConfig: timetableGradeFromJson,
} as Record<string, unknown>;

export { JsonData };
