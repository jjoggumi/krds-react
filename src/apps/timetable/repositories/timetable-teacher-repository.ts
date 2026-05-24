import { Teacher } from '@/apps/timetable/core/types';
import { Timetables } from '@/apis/Timetables';
import { EmbeddedListResponse } from '../common/types';

export const TimetableTeacherRepository = {
  key: 'teachers',

  _api: new Timetables(),

  getTeachers: async (timetableId: string) => {
    try {
      const { getTimetableTeachers } = TimetableTeacherRepository._api;
      const res = await getTimetableTeachers(timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch courses');
      }

      const { teachers } = (res.data as EmbeddedListResponse<Teacher>)._embedded;
      return teachers;
    }
    catch (error) {
      console.error('Error fetching teachers:', error);
      throw new Error('Failed to fetch teachers');
    }

    // return BaseRespository.get(TimetableTeacherRepository.key);
  },

  getTeachersOrderByName: async (timetableId: string) => {
    const teachers =
      (await TimetableTeacherRepository.getTeachers(timetableId)) as Teacher[];
      
    return teachers.sort((a, b) => a.teacherName.localeCompare(b.teacherName));
  },


  getTeacherMap: async (timetableId: string) => {
    const teachers =
      (await TimetableTeacherRepository.getTeachers(timetableId)) as Teacher[];
    return (
      teachers.reduce((acc, teacher) => {
        acc[teacher.teacherId] = teacher;
        return acc;
      }, {} as Record<string, Teacher>) || ({} as Record<string, Teacher>)
    );
  },
};
