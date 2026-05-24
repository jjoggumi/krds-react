import { Course, TeacherCourse } from '@/apps/timetable/core/types';
import { BaseRespository } from '.';
import { TimetableCourseRepository } from './timetable-course-repository';
import { Timetables } from '@/apis/Timetables';
import { EmbeddedListResponse } from '../common/types';

export const TeacherCourseRepository = {
  key: 'teacherCourses',

  _api: new Timetables(),

  get: async (timetableId: string) => {
    try {
      const { getTeacherCourseConfsAllByTimetableId } = TeacherCourseRepository._api;
      const res = await getTeacherCourseConfsAllByTimetableId(timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch courses');
      }

      const { timetableTeacherCourseConfs } = (res.data as EmbeddedListResponse<TeacherCourse>)._embedded;
      return timetableTeacherCourseConfs;
    }
    catch (error) {
      console.error('Error fetching teacherCourse:', error);
      throw new Error('Failed to fetch teacherCourse');
    }
    // return BaseRespository.get(TeacherCourseRepository.key);
  },

  set: async (teacherCourses: TeacherCourse[]) => {
    return BaseRespository.set(TeacherCourseRepository.key, teacherCourses);
  },

  updateCourseIdByTeacherCourse: async (
    teacherCourse: TeacherCourse,
    newCourseId: string
  ) => {
    const teacherCourses = await TeacherCourseRepository.get('TIMETABLE_ID');
    const updatedTeacherCourses = teacherCourses.map((tc: TeacherCourse) => {
      if (
        tc.teacherId === teacherCourse.teacherId &&
        tc.courseId === teacherCourse.courseId
      ) {
        tc.courseId = newCourseId;
      }
      return tc;
    });
    await TeacherCourseRepository.set(updatedTeacherCourses);
    return updatedTeacherCourses;
  },

  addCourseToTeacher: async (teacherId: string, courseId: string) => {
    // 교사에게 과목을 추가한다. (이미 등록된 과목은 제외)
    const teacherCourses =
      (await TeacherCourseRepository.get('TIMETABLE_ID')) as TeacherCourse[];

    const teacherCoursesByTeacherId = teacherCourses
      .filter((tc: TeacherCourse) => tc.teacherId === teacherId)
      .sort((a, b) => {
        // sortNo를 기준으로 정렬한다.
        return b.sortNo - a.sortNo;
      });

    const isExistCourse = teacherCoursesByTeacherId.some(
      (tc: TeacherCourse) => {
        return tc.teacherId === teacherId && tc.courseId === courseId;
      }
    );

    if (isExistCourse) {
      // 이미 등록된 과목인 경우
      return teacherCourses;
    }

    const courseMap =
      (await TimetableCourseRepository.getCourseMap('TIMETABLE_ID')) as Record<
        string,
        Course
      >;

    const course = courseMap[courseId];
    const sortNo = Math.max(
      ...teacherCoursesByTeacherId.map((tc: TeacherCourse) => tc.sortNo)
    );

    // 새로운 과목을 추가한다.
    const newTeacherCourse: TeacherCourse = {
      teacherId: teacherId,
      courseId: courseId,
      coursePeriod: course.periodCount || 0,
      sortNo,
    };

    teacherCourses.push(newTeacherCourse);
    await TeacherCourseRepository.set(teacherCourses);
    return teacherCourses;
  },
};
