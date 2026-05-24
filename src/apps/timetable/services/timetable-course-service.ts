import { TimetableCourseRepository } from '@/apps/timetable/repositories/timetable-course-repository';
import { Course } from '@/apps/timetable/core/types';

export const TimetableCourseService = {
  getCoursesOfLesson: async () => {
    // 공통, 동시 수업등이 아닌 실제 수업과목들만 가져온다.
    return ((await TimetableCourseRepository.getCourses()) as Course[]).filter(
      (course) => !(course.isConcurrent || course.isUnified)
    );
  },
};
