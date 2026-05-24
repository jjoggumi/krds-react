import {ConcurrentConf, Course, LessonConf, TeacherCourse, TeacherCourseBase} from '@/apps/timetable/core/types';

import {
  ConcurrentConfContext,
  FixedConfContext,
  LessonConfContext,
  TeacherCourseContext,
  TimetableCourseContext,
  TeacherCourseBaseContext
} from '../contexts';

// export interface ConcurrentConfCourse extends ConcurrentConf, Omit<Course, 'sortNo'> {}

export interface ConcurrentConfCourse {
  conf: Omit<ConcurrentConf, 'sortNo'>;
  course: Course;
}

export interface LessonConfExchangeResponse {
  lessonConfs: Array<LessonConf>;
  teacherCourseConfs: Array<TeacherCourse>;
  teacherCourseBaseConfs: Array<TeacherCourseBase>;
}

export interface entitiesRelatedOnConcurrentCourse {
  concurrentConf: ConcurrentConf;
  course: Course;
  lessonConfs: Array<LessonConf>;
  deletedFixedConfIds: Array<string>;
}

export const getConcurrentConfService = (
  concurrentConfContext: ConcurrentConfContext,
  courseContext: TimetableCourseContext,
  lessonConfContext: LessonConfContext,
  fixedConfContext: FixedConfContext,
  teacherCourseContext: TeacherCourseContext,
  teacherCourseBaseContext: TeacherCourseBaseContext
) => {

  const ConcurrentConfService = {

    getTimetableId: () => {
      return concurrentConfContext.timetableId;
    },

    getTemplateId: () => {
      return concurrentConfContext.templateId;
    },

    createConcurrentCourse: async (requestConf: { grade: number, displayedTitle: string }) => {
      try {
        const timetableId = ConcurrentConfService.getTimetableId();
        const templateId = ConcurrentConfService.getTemplateId();
        const res = await concurrentConfContext.createConcurrentCourse(timetableId, { ...requestConf, templateId });

        if (res.status !== 200) {
          throw new Error('Failed to create concurrent conf');
        }

        const { conf, course } = res.data as ConcurrentConfCourse;
        concurrentConfContext.addItem(conf);
        courseContext.addItem(course);
        return { conf, course };
      }
      catch (error) {
        console.error('Error creating concurrent conf:', error);
        throw new Error('Failed to create concurrent conf');
      }
    },

    deleteConcurrentCourse: async (concurrentCourseIds: Array<string>) => {
      try {
        const timetableId = ConcurrentConfService.getTimetableId();
        const templateId = ConcurrentConfService.getTemplateId();
        const res = await concurrentConfContext.deleteConcurrentCourses(timetableId, { concurrentCourseIds, templateId });

        if (res.status !== 200) {
          throw new Error('Failed to delete concurrent conf');
        }

        const { lessonConfs, deletedFixedConfIds } = res.data as entitiesRelatedOnConcurrentCourse;
        courseContext.removeByIds(concurrentCourseIds);
        concurrentConfContext.removeByIds(concurrentCourseIds);
        lessonConfContext.replace(lessonConfs);
        fixedConfContext.removeByIds(deletedFixedConfIds);
      } catch (error) {
        console.error('Error deleting concurrent conf:', error);
        throw new Error('Failed to delete concurrent conf');
      }
    },

    updateConcurrentCourse: async (
      concurrentConfId: string,
      grade: number,
      displayedTitle: string,
      periodCount: number | null,
      consecutivePeriod: string | null
    ) => {
      try {
        const timetableId = ConcurrentConfService.getTimetableId();
        const templateId = ConcurrentConfService.getTemplateId();

        const res = await concurrentConfContext.updateConcurrentConf(timetableId, concurrentConfId, { grade, displayedTitle, periodCount, consecutivePeriod, templateId });

        if (res.status !== 200) {
          throw new Error('Failed to update concurrent conf');
        }

        const { concurrentConf, course, lessonConfs, deletedFixedConfIds } = res.data as entitiesRelatedOnConcurrentCourse;
      
        courseContext.replace([course]);
        concurrentConfContext.replace([concurrentConf]);
        if (!!lessonConfs && lessonConfs.length > 0) { lessonConfContext.replace(lessonConfs); }
        if (!!deletedFixedConfIds && deletedFixedConfIds.length > 0) { fixedConfContext.removeByIds(deletedFixedConfIds); }

      } catch (error) {
        console.error('Error updating concurrent conf:', error);
        throw new Error('Failed to update concurrent conf');
      }
    },

    attachConcurrentCourseIdOnLessonConf: async (
      concurrentCourseId: string,
      classId: string,
      courseId: string
    ) => {
      try {
        const timetableId = ConcurrentConfService.getTimetableId();
        const templateId = ConcurrentConfService.getTemplateId();
        const res = await lessonConfContext.attachConcurrentCourse(
          timetableId,
          concurrentCourseId,
          { classId, courseId, templateId }
        );

        if (res.status !== 200) {
          throw new Error('Failed to attach concurrent course ID to lesson conf');
        }

        const { concurrentConf, lessonConfs } = res.data as entitiesRelatedOnConcurrentCourse;

        concurrentConfContext.replace([concurrentConf]);
        lessonConfContext.replace(lessonConfs);

      } catch (error) {
        console.error('Error attaching concurrent course ID to lesson conf:', error);
        throw new Error('Failed to attach concurrent course ID to lesson conf');
      }
    },

    detachConcurrentCourseIdOnLessonConf: async (
      concurrentCourseId: string,
      classId: string,
      courseId: string
    ) => {
      try {
        const timetableId = ConcurrentConfService.getTimetableId();
        const templateId = ConcurrentConfService.getTemplateId();
        const res = await lessonConfContext.detachConcurrentCourse(
          timetableId,
          concurrentCourseId,
          { classId, courseId, templateId }
        );

        if (res.status !== 200) {
          throw new Error('Failed to detach concurrent course ID from lesson conf');
        }

        const { concurrentConf, lessonConfs } = res.data as entitiesRelatedOnConcurrentCourse;

        concurrentConfContext.replace([concurrentConf]);
        lessonConfContext.replace(lessonConfs);
      } catch (error) {
        console.error('Error detaching concurrent course ID from lesson conf:', error);
        throw new Error('Failed to detach concurrent course ID from lesson conf');
      }
    },

    swapLessonConfs: async (
      sourceId: string,
      targetId: string,
    ) => {
      try {
        const timetableId = ConcurrentConfService.getTimetableId();
        const templateId = ConcurrentConfService.getTemplateId();
        const res = await lessonConfContext.swapLessonConfs(timetableId, { sourceId, targetId, templateId });

        if (res.status !== 200) {
          throw new Error('Failed to swap lesson confs');
        }

        const { lessonConfs, teacherCourseConfs, teacherCourseBaseConfs } = res.data as LessonConfExchangeResponse;

        lessonConfContext.replace(lessonConfs);
        teacherCourseContext.replace(teacherCourseConfs);
        teacherCourseBaseContext.replace(teacherCourseBaseConfs);
      } catch (error) {
        console.error('Error swapping lesson confs:', error);
        throw new Error('Failed to swap lesson confs');
      }
    },

    tossLessonConfs: async (
      sourceId: string,
      targetTeacherId: string
    ) => {
      try {
        const timetableId = ConcurrentConfService.getTimetableId();
        const templateId = ConcurrentConfService.getTemplateId();
        const res = await lessonConfContext.tossLessonConf(timetableId, { sourceId, targetTeacherId, templateId });

        if (res.status !== 200) {
          throw new Error('Failed to toss lesson confs');
        }

        const { lessonConfs, teacherCourseConfs } = res.data as LessonConfExchangeResponse;

        lessonConfContext.replace(lessonConfs);
        teacherCourseContext.replace(teacherCourseConfs);
      } catch (error) {
        console.error('Error tossing lesson confs:', error);
        throw new Error('Failed to toss lesson confs');
      }
    }

  }

  return ConcurrentConfService;

}

// export const ConcurrentConfService = {
//   getConcurrentConfs: async () => {
//     return ConcurrentConfRespository.getConcurrentConfs();
//   },

//   addWithConcurrentConfCourse: async (
//     concurrentConfCourse: ConcurrentConfCourse
//   ) => {
//     const courseToAdd =
//       ConcurrentConfService.concurrentConfCourseToCourse(concurrentConfCourse);

//     const course = await TimetableCourseRepository.addConcurrentCourse(
//       courseToAdd
//     );

//     const concurrentConfToAdd =
//       ConcurrentConfService.concurrentConfCourseToConcurrentConf(
//         concurrentConfCourse
//       );

//     concurrentConfToAdd.courseId = course.courseId;

//     const courseConf = await ConcurrentConfRespository.add(concurrentConfToAdd);

//     const result = {
//       ...course,
//       ...courseConf,
//     } as ConcurrentConfCourse;

//     return result;
//   },

//   updateWithConcurrentConfCourse: async (
//     concurrentConfCourse: ConcurrentConfCourse
//   ) => {
//     // update ConcurrentConf
//     const concurrentConfToUpdate =
//       ConcurrentConfService.concurrentConfCourseToConcurrentConf(
//         concurrentConfCourse
//       );

//     const courseConf = await ConcurrentConfRespository.update(
//       concurrentConfToUpdate
//     );

//     // update Course
//     const courseToUpdate =
//       ConcurrentConfService.concurrentConfCourseToCourse(concurrentConfCourse);

//     const course = await TimetableCourseRepository.update(courseToUpdate);

//     return {
//       ...course,
//       ...courseConf,
//     } as ConcurrentConfCourse;
//   },

//   deleteWithConcurrentCourseIds: async (courseIds: string[]) => {
//     // 배정된 수업 제거
//     await LessonConfService.deleteConcurrentCourseByConcurrentCourseIds(
//       courseIds
//     );

//     // 수업 고정 제거
//     await FixedConfRepository.deleteWithCourseIds(courseIds);

//     // ConcurrentConf 제거
//     await ConcurrentConfRespository.deleteWithIds(courseIds);

//     // Course 제거
//     await TimetableCourseRepository.deleteWithIds(courseIds);
//   },

//   concurrentConfCourseToCourse: (
//     concurrentConfCourse: ConcurrentConfCourse
//   ) => {
//     const {
//       courseId,
//       displayedTitle,
//       periodCount,
//       isDoubleTeacher,
//       countTeacher,
//       isUnified,
//       isConcurrent,
//       similarCourseConfId,
//     } = concurrentConfCourse;

//     const course = {
//       courseId,
//       displayedTitle,
//       periodCount,
//       isDoubleTeacher,
//       countTeacher,
//       isUnified,
//       isConcurrent,
//       similarCourseConfId,
//     } as Course;

//     return course;
//   },

//   concurrentConfCourseToConcurrentConf: (
//     concurrentConfCourse: ConcurrentConfCourse
//   ) => {
//     const { courseId, grade, consecutivePeriod, isCombinedClass, sortNo } =
//       concurrentConfCourse;

//     const concurrentConf = {
//       courseId,
//       grade,
//       consecutivePeriod,
//       isCombinedClass,
//       sortNo,
//     } as ConcurrentConf;

//     return concurrentConf;
//   },
// };
