import {Lesson, Teacher, LessonConf, TeacherCourse} from '@/apps/timetable/core/types';
import { LessonSwapResponse, LessonTossResponse} from '@/apps/timetable/common/types';
import {
  LessonContext,
  LessonConfContext,
  TeacherCourseContext,
  TimetableTeacherContext,
  TeacherCourseBaseContext
} from '@/apps/timetable/contexts';
import { template } from 'lodash';

export const getLessonService = (
  lessonContext: LessonContext,
  lessonConfContext: LessonConfContext,
  teacherCourseContext: TeacherCourseContext,
  teacherContext: TimetableTeacherContext,
  teacherCourseBaseContext: TeacherCourseBaseContext,
) => {

  const lessonService = {
    getTimetableId: () => {
      return lessonContext.timetableId;
    },

    swap: async (request: {
      lessonIdsToDelete: string[],
      lessonsToAdd: Lesson[],
      sourceConfIds: string[],
      targetConfIds: string[] 
    }) => {
      try {
        const timetableId = lessonService.getTimetableId();
        const { lessonIdsToDelete, lessonsToAdd, sourceConfIds, targetConfIds } = request;
        const res = await lessonContext.swapCourses(timetableId, {
          lessonIdsToDelete,
          lessonsToAdd,
          sourceConfIds,
          targetConfIds,
          templateId: lessonContext.templateId
        });

        if (res.status !== 200) {
          throw new Error("Failed to swap courses");
        }

        const { lessons, deletedLessonIds, lessonConfs, teacherCourseConfs, teacherCourseBaseConfs } = (res.data as LessonSwapResponse) || {};

        if (!!lessons && lessons.length > 0) { await lessonContext.patchLessonsToModel(lessons); }
        if (!!lessonConfs && lessonConfs.length > 0) { lessonConfContext.replace(lessonConfs); }
        if (!!teacherCourseConfs && teacherCourseConfs.length > 0) { teacherCourseContext.replace(teacherCourseConfs); }
        if (!!teacherCourseBaseConfs && teacherCourseBaseConfs.length > 0) { teacherCourseBaseContext.replace(teacherCourseBaseConfs); }

      } catch (error) {
        console.error("Error swapping lessons:", error);
        throw error;
      }
    },
    toss: async (
      request: {
        lessonIdsToUpdate: string[],
        sourceConfIds: string[],
        sourceTeacher: { teacherId: string, teacherName: string },
        targetTeacher: { teacherId: string, teacherName: string }
      }
    ) => {
      try {
        const timetableId = lessonService.getTimetableId();
        const { lessonIdsToUpdate, sourceConfIds, sourceTeacher, targetTeacher } = request;
        const res = await lessonContext.tossCourses(timetableId, {
          lessonIdsToUpdate,
          sourceConfIds,
          sourceTeacher,
          targetTeacher,
          templateId: lessonContext.templateId
        });

        if (res.status !== 200) {
          throw new Error("Failed to toss courses");
        }

        const { lessons, lessonConfs, teacherCourseConfs, teacherCourseBaseConfs, teacher } = (res.data as LessonTossResponse) || {};

        if (!!lessons && lessons.length > 0) { await lessonContext.patchLessonsToModel(lessons); }
        if (!!lessonConfs && lessonConfs.length > 0) { lessonConfContext.replace(lessonConfs); }
        if (!!teacherCourseConfs && teacherCourseConfs.length > 0) { teacherCourseContext.replace(teacherCourseConfs); }
        if (!!teacherCourseBaseConfs && teacherCourseBaseConfs.length > 0) { teacherCourseBaseContext.replace(teacherCourseBaseConfs); }
        if (!!teacher) { teacherContext.replace([teacher]); }

      } catch (error) {
        console.error("Error tossing lessons:", error);
        throw error;
      }
    }
  }

  return lessonService;
}