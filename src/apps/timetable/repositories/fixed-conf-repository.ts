import { FixedConf } from '@/apps/timetable/core/types';
import { BaseRespository } from '.';

export const FixedConfRepository = {
  key: 'fixedConfs',

  set: async (value: any) => {
    await BaseRespository.set(FixedConfRepository.key, value);
  },

  getFixedConfs: async () => {
    return BaseRespository.get(FixedConfRepository.key);
  },

  deleteWithCourseIds: async (courseIds: string[]) => {
    const fixedConfs = await FixedConfRepository.getFixedConfs();

    const updatedFixedConfs = fixedConfs.filter(
      (conf: FixedConf) => !courseIds.includes(conf.courseId)
    );

    await BaseRespository.set(FixedConfRepository.key, updatedFixedConfs);
  },

  delete: async (fixedConf: FixedConf) => {
    const fixedConfs = await FixedConfRepository.getFixedConfs();
    const updatedFixedConfs = fixedConfs.filter(
      (conf: FixedConf) =>
        !(
          conf.courseId === fixedConf.courseId &&
          conf.period === fixedConf.period &&
          conf.dayOfWeek === fixedConf.dayOfWeek
        )
    );

    await BaseRespository.set(FixedConfRepository.key, updatedFixedConfs);
  },

  deleteWithConsecutiveGroupId: async (consecutiveGroupId: string) => {
    const fixedConfs = await FixedConfRepository.getFixedConfs();

    const updatedFixedConfs = fixedConfs.filter(
      (conf: FixedConf) => conf.consecutiveGroupId !== consecutiveGroupId
    );

    await BaseRespository.set(FixedConfRepository.key, updatedFixedConfs);
  },

  deleteWithArray: async (fixedConfs: FixedConf[]) => {
    const fixedConfsData = await FixedConfRepository.getFixedConfs();

    const updatedFixedConfs = fixedConfsData.filter(
      (conf: FixedConf) =>
        !fixedConfs.some(
          (fixedConf: FixedConf) =>
            fixedConf.courseId === conf.courseId &&
            fixedConf.period === conf.period &&
            fixedConf.dayOfWeek === conf.dayOfWeek
        )
    );

    await BaseRespository.set(FixedConfRepository.key, updatedFixedConfs);
  },

  createWithArray: async (fixedConfs: FixedConf[]) => {
    const fixedConfsData = await FixedConfRepository.getFixedConfs();

    const updatedFixedConfs = [...fixedConfsData, ...fixedConfs];

    await BaseRespository.set(FixedConfRepository.key, updatedFixedConfs);
  },

  generateConsecutiveGroupId: (): string => {
    return BaseRespository.generateId();
  },
};
