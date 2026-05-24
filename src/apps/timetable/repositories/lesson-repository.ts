import { Lesson } from '@/apps/timetable/core/types';
import { BaseRespository } from '.';

export const LessonRepository = {
  key: 'lessons',

  getLessons: async (): Promise<Lesson[]> => {
    return BaseRespository.get(LessonRepository.key);
  },

  setLessons: async (lessons: Lesson[]) => {
    await BaseRespository.set(LessonRepository.key, lessons);
  },
};
