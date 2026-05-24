import { TimetableConfig } from '@/apps/timetable/core/types';
import { BaseRespository } from '.';
import { Timetables } from '@/apis/Timetables';

export const TimetableGradeRepository = {
  key: 'timetableConfig',

  _api: new Timetables(),

  getTimetableConfig: async (timetableId: string) => {
    try {
      const { getBasicInfo } = TimetableGradeRepository._api;
      const res = await getBasicInfo(timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch timetable config');
      }

      return res.data;
      // return timetableConfig;
      // return BaseRespository.get(TimetableGradeRepository.key);
    }
    catch (error) {
      console.error('Error fetching timetable config:', error);
      throw new Error('Failed to fetch timetable config');
    }
  },

  saveTimetableConfig: async (grades: TimetableConfig) => {
    await BaseRespository.set(TimetableGradeRepository.key, grades);
  },
};
