import { apiCall } from '@/apis/request';
import { EducationLetterSchoolsResponse } from '@/types/educationLetter';

export const getElSchools = async () => {
  const { _embedded }: EducationLetterSchoolsResponse = await apiCall(`GET /educationLetters/schools`);
  return _embedded?.elSchools;
};
