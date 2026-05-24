import { ConcurrentConf } from '@/apps/timetable/core/types';
import { BaseRespository } from '.';

const ConcurrentConfRespository = {
  key: 'concurrentCourseConfs',

  set: async (key: string, value: any) => {
    await BaseRespository.set(key, value);
  },
  
  getConcurrentConfs: async () => {
    return BaseRespository.get(ConcurrentConfRespository.key);
  },

  add: async (concurrentConf: ConcurrentConf) => {
    if (!concurrentConf.courseId) {
      throw new Error('courseId is required');
    }

    const concurrentConfs =
      await ConcurrentConfRespository.getConcurrentConfs();
    concurrentConfs.push(concurrentConf);

    await BaseRespository.set(ConcurrentConfRespository.key, concurrentConfs);
    return concurrentConf;
  },

  update: async (concurrentConf: ConcurrentConf) => {
    if (!concurrentConf.courseId) {
      throw new Error('courseId is required');
    }

    const concurrentConfs =
      await ConcurrentConfRespository.getConcurrentConfs();

    const findedConf = concurrentConfs.find(
      (conf: ConcurrentConf) => conf.courseId === concurrentConf.courseId
    );

    if (!findedConf) {
      throw new Error('concurrentConf not found');
    }

    findedConf.grade = concurrentConf.grade;
    findedConf.consecutivePeriod = concurrentConf.consecutivePeriod;
    findedConf.isCombinedClass = concurrentConf.isCombinedClass;
    findedConf.sortNo = concurrentConf.sortNo;

    await BaseRespository.set(ConcurrentConfRespository.key, concurrentConfs);

    return findedConf;
  },

  deleteWithIds: async (courseIds: string[]) => {
    const concurrentConfs =
      await ConcurrentConfRespository.getConcurrentConfs();

    const updatedConcurrentConfs = concurrentConfs.filter(
      (conf: ConcurrentConf) => !courseIds.includes(conf.courseId)
    );

    await BaseRespository.set(
      ConcurrentConfRespository.key,
      updatedConcurrentConfs
    );
  },
};

export { ConcurrentConfRespository };
