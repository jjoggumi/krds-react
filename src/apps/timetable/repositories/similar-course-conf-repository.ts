import { BaseRespository } from '.';

export const SimilarCourseConfRepository = {
  key: 'similarCourseConfs',

  getSimilarCourseConfs: async () => {
    return BaseRespository.get(SimilarCourseConfRepository.key);
  },
};
