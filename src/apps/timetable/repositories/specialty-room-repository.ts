import { BaseRespository } from '.';

export const SpecialtyRoomRepository = {
  key: 'specialtyRooms',

  getSpecialtyRooms: async () => {
    return BaseRespository.get(SpecialtyRoomRepository.key);
  },
};
