export interface EducationLetterSchoolsResponse {
  _embedded: {
    elSchools: EducationLetterSchool[];
  }
}

export interface EducationLetterSchool {
  schoolId: string,
  schoolImagePath: string | null,
  schoolName: string,
  schoolType: string
}