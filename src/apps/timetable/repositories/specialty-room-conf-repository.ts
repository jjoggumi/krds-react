import { BaseRespository } from '.';

export const SpecialtyRoomConfRepository = {
  key: 'specialtyRoomConfs',

  getSpecialtyRoomConfs: async () => {
    return BaseRespository.get(SpecialtyRoomConfRepository.key);
  },
};
