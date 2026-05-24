import { Course } from '@/apps/timetable/core/types';
import { BaseRespository } from '.';
import { Timetables } from '@/apis/Timetables';
import { EmbeddedListResponse } from '../common/types';

export const TimetableCourseRepository = {
  key: 'courses',

  _api: new Timetables(),
  
  getCourses: async (timetableId: string) => {
    try {
      const { getTimetableCourses } = TimetableCourseRepository._api;
      const res = await getTimetableCourses(timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch courses');
      }

      const { courses } = (res.data as EmbeddedListResponse<Course>)._embedded;
      console.log('courses', courses);
      return courses;
    }
    catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }
  },

  getCourseMap: async (timetableId: string) => {
    const course = (await TimetableCourseRepository.getCourses(timetableId));
    return (
      course.reduce((acc, course) => {
        acc[course.courseId] = course;
        return acc;
      }, {} as Record<string, Course>) || ({} as Record<string, Course>)
    );
  },

  addConcurrentCourse: async (course: Course) => {
    course.isConcurrent = true;
    course.isUnified = false;
    course.isDoubleTeacher = false;
    course.similarCourseConfId = '';

    return await TimetableCourseRepository.add(course);
  },

  add: async (course: Course) => {
    // id는 새로 생성한다.
    course.courseId = BaseRespository.generateId();

    const courses = await TimetableCourseRepository.getCourses('TIMETABLE_ID');
    courses.push(course);

    await BaseRespository.set(TimetableCourseRepository.key, courses);
    return course;
  },

  update: async (course: Course) => {
    const courses = await TimetableCourseRepository.getCourses('TIMETABLE_ID');

    const findedCourse = courses.find(
      (c: Course) => c.courseId === course.courseId
    );

    if (!findedCourse) {
      throw new Error('course not found');
    }

    findedCourse.displayedTitle = course.displayedTitle;
    findedCourse.periodCount = course.periodCount;
    findedCourse.isDoubleTeacher = course.isDoubleTeacher;
    findedCourse.countTeacher = course.countTeacher;
    findedCourse.isUnified = course.isUnified;
    findedCourse.isConcurrent = course.isConcurrent;
    findedCourse.similarCourseConfId = course.similarCourseConfId;

    await BaseRespository.set(TimetableCourseRepository.key, courses);

    return findedCourse;
  },

  deleteWithIds: async (courseIds: string[]) => {
    const courses = await TimetableCourseRepository.getCourses('TIMETABLE_ID');

    const updatedCourses = courses.filter(
      (c: Course) => !courseIds.includes(c.courseId)
    );

    await BaseRespository.set(TimetableCourseRepository.key, updatedCourses);
  },
};
