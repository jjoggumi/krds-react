import { LessonConf } from '@/apps/timetable/core/types';
import { BaseRespository } from '.';

const LessonConfRepository = {
  key: 'lessonConfs',

  get: async () => {
    return BaseRespository.get(LessonConfRepository.key);
  },

  set: async (lessonConfs: LessonConf[]) => {
    await BaseRespository.set(LessonConfRepository.key, lessonConfs);
  },

  delete: async (lessonConf: LessonConf) => {
    const lessonConfs = await LessonConfRepository.get();
    const updatedLessonConfs = lessonConfs.filter(
      (lc: LessonConf) => lc.lessonConfId !== lessonConf.lessonConfId
    );

    await LessonConfRepository.set(updatedLessonConfs);
    return updatedLessonConfs;
  },

  add: async (lessonConf: LessonConf) => {
    if (!lessonConf.lessonConfId) {
      lessonConf.lessonConfId = BaseRespository.generateId();
    }

    const lessonConfs = await LessonConfRepository.get();
    lessonConfs.push(lessonConf);
    await LessonConfRepository.set(lessonConfs);
    return lessonConfs;
  },

  getByClassId: async (classId: string) => {
    const lessonConfs = await BaseRespository.get(LessonConfRepository.key);
    return lessonConfs.filter(
      (lessonConf: LessonConf) => lessonConf.classId === classId
    );
  },

  updateConcurrentCourseIdWithCourseAndClass: async (
    courseId: string,
    classId: string,
    concurrentCourseId: string
  ) => {
    const lessonConfs = await LessonConfRepository.get();

    const updatedLessonConfs = lessonConfs
      .filter(
        (lessonConf: LessonConf) =>
          lessonConf.courseId === courseId && lessonConf.classId === classId
      )
      .map((lessonConf: LessonConf) => {
        lessonConf.concurrentCourseId = concurrentCourseId;
        return lessonConf;
      });

    await BaseRespository.set(LessonConfRepository.key, lessonConfs);
    return updatedLessonConfs;
  },

  updateLessonConfs: async (lessonConfs: LessonConf[]) => {
    const currentLessonConfs =
      (await LessonConfRepository.get()) as LessonConf[];

    const updatedLessonConfs = currentLessonConfs.map((currentLessonConf) => {
      const lessonConf = lessonConfs.find(
        (lessonConf) =>
          lessonConf.lessonConfId === currentLessonConf.lessonConfId
      );

      if (lessonConf) {
        return lessonConf;
      }

      return currentLessonConf;
    });

    await LessonConfRepository.set(updatedLessonConfs);
    return updatedLessonConfs;
  },
};

export { LessonConfRepository };
