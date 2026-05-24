import { UUID } from '../common';

/**
 * 학교알리미 관리자 여부 응답 인터페이스
 */
export interface EducationLetterManagerResponse {
    /**
     * 학교 관리자 여부
     */
    isManager: boolean
}

export interface EducationLetterSchoolResponse {
  _embedded: {
    elSchools: EducationLetterSchool[]
  }
}

interface EducationLetterSchool {
  schoolId: UUID,
  schoolName: string,
  schoolImagePath: string,
  schoolType: string
}