import { Class } from '@/apps/timetable/core/types';
import { Timetables } from '@/apis/Timetables';
import { EmbeddedListResponse } from '../common/types';

export const TimetableClassRepository = {
  key: 'classes',

  _api: new Timetables(),

  getClasses: async (timetableId: string) => {
    try {
      const { getTimetableClasses } = TimetableClassRepository._api;
      const res = await getTimetableClasses(timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch courses');
      }

      const { classes } = (res.data as EmbeddedListResponse<Class>)._embedded;
      return classes;
    }
    catch (error) {
      console.error('Error fetching classes:', error);
      throw new Error('Failed to fetch classes');
    }

    // return BaseRespository.get(TimetableClassRepository.key);
  },

  getClassMap: async (timetableId: string) => {
    console.log("!!! DEPRECATED: TimetableClassRepository.getClassMap -> use TimettableClassContext.getClassMap");

    const classes = (await TimetableClassRepository.getClasses(timetableId)) as Class[];
    return (
      classes.reduce((acc, classInfo) => {
        acc[classInfo.classId] = classInfo;
        return acc;
      }, {} as Record<string, Class>) || ({} as Record<string, Class>)
    );
  },
};
