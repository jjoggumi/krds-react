import { ConsecutiveConf } from '@/apps/timetable/core/types';
import { BaseRespository } from '.';
import { set } from 'vue/types/umd';

const ConsecutiveConfRepository = {
  key: 'consecutiveConfs',

  generateId: () => {
    return BaseRespository.generateId();
  },

  set: async (value: any) => {
    await BaseRespository.set( ConsecutiveConfRepository.key, value);
  },

  getById: async (consecutiveConfId: string) => {
    const consecutiveConfs =
      await ConsecutiveConfRepository.getConsecutiveConfs();
    return consecutiveConfs.find(
      (consecutiveConf: ConsecutiveConf) =>
        consecutiveConf.consecutiveConfId === consecutiveConfId
    );
  },

  getConsecutiveConfs: async () => {
    return BaseRespository.get(ConsecutiveConfRepository.key);
  },

  createItems: async (consecutiveConfs: ConsecutiveConf[]) => {
    const currentConsecutiveConfs =
      (await ConsecutiveConfRepository.getConsecutiveConfs()) as ConsecutiveConf[];

    // 아이디 생성
    consecutiveConfs.forEach((consecutiveConf) => {
      consecutiveConf.consecutiveConfId = BaseRespository.generateId();
    });

    const newConsecutiveConfs = [
      ...currentConsecutiveConfs,
      ...consecutiveConfs,
    ];

    return BaseRespository.set(
      ConsecutiveConfRepository.key,
      newConsecutiveConfs
    );
  },

  deleteItems: async (consecutiveConfs: ConsecutiveConf[]) => {
    const currentConsecutiveConfs =
      (await ConsecutiveConfRepository.getConsecutiveConfs()) as ConsecutiveConf[];

    const newConsecutiveConfs = currentConsecutiveConfs.filter(
      (currentConsecutiveConf) =>
        !consecutiveConfs.some(
          (consecutiveConf) =>
            currentConsecutiveConf.consecutiveConfId ===
            consecutiveConf.consecutiveConfId
        )
    );

    return BaseRespository.set(
      ConsecutiveConfRepository.key,
      newConsecutiveConfs
    );
  },

  update: async (consecutiveConf: ConsecutiveConf) => {
    const currentConsecutiveConfs =
      (await ConsecutiveConfRepository.getConsecutiveConfs()) as ConsecutiveConf[];

    const updatedConsecutiveConfs = currentConsecutiveConfs.map(
      (currentConsecutiveConf) => {
        if (
          currentConsecutiveConf.consecutiveConfId ===
          consecutiveConf.consecutiveConfId
        ) {
          return consecutiveConf;
        }

        return currentConsecutiveConf;
      }
    );

    return BaseRespository.set(
      ConsecutiveConfRepository.key,
      updatedConsecutiveConfs
    );
  },
};

export { ConsecutiveConfRepository };
