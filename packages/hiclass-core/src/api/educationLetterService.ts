import {Get} from './index'
import {
  EducationLetterManagerResponse,
  EducationLetterSchoolResponse,
} from '../types/response/educationLettersResponse';

/**
 * 학교알리미 관리자 여부 조회
 */
export const getIsEducationLetterManager = async (): Promise<EducationLetterManagerResponse> => {
    const response  = await Get<EducationLetterManagerResponse>(`educationLetters/isManager`);
    return response.data;
};

export const getIsEducationLetterSchools = async (): Promise<EducationLetterSchoolResponse> => {
  const response = await Get<EducationLetterSchoolResponse>(`educationLetters/schools`);
  return response.data;
};