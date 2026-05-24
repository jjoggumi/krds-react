import { Links, Page, UUID } from './common'
import { SchoolStatus, SchoolType } from './school'
import { UserType } from './user'

/**
 * 클래스 상태 ENUM
 */
export enum ClassStatus {
  /** 활성화 */
  ACTIVATE = 'ACTIVATE',
  /** 비활성화 */
  DEACTIVATE = 'DEACTIVATE',
  /** 폐쇄중 */
  CLOSING = 'CLOSING',
  /** 폐쇄 */
  CLOSED = 'CLOSED',
}

/**
 * 클래스 학년 코드 ENUM
 */
export enum ClassGradeCode {
  /** 초등학교 1학년 */
  E1 = 'E1',
  /** 초등학교 2학년 */
  E2 = 'E2',
  /** 초등학교 3학년 */
  E3 = 'E3',
  /** 초등학교 4학년 */
  E4 = 'E4',
  /** 초등학교 5학년 */
  E5 = 'E5',
  /** 초등학교 6학년 */
  E6 = 'E6',

  /** 중학교 1학년 */
  M1 = 'M1',
  /** 중학교 2학년 */
  M2 = 'M2',
  /** 중학교 3학년 */
  M3 = 'M3',

  /** 고등학교 1학년 */
  H1 = 'H1',
  /** 고등학교 2학년 */
  H2 = 'H2',
  /** 고등학교 3학년 */
  H3 = 'H3',

  /** 대학교 1학년 */
  U1 = 'U1',
  /** 대학교 2학년 */
  U2 = 'U2',
  /** 대학교 3학년 */
  U3 = 'U3',
  /** 대학교 4학년 */
  U4 = 'U4',
  /** 대학교 5학년 */
  U5 = 'U5',
  /** 대학교 6학년 */
  U6 = 'U6',

  /** 학년 무관 */
  NONE = 'NONE',
}

/**
 * 멤버 역할 ENUM
 */
export enum MemberRole {
    /** 소유자 */
    OWNER = 'OWNER',
    /** 관리자 */
    MANAGER = 'MANAGER',
    /** 멤버 */
    MEMBER = 'MEMBER',
  }
  
  export enum MemberStatus {
    /** 신청 */
    APPLY = 'APPLY',
    /** 수락 */
    ACCEPT = 'ACCEPT',
    /** 거절 */
    DENIAL = 'DENIAL',
  }

/**
 * 클래스 구독 정보 인터페이스
 */
export interface ClazzSubscribeView {
  /**
   * 자녀 이름
   */
  memberChildName: string
  /**
   * 학급 번호
   */
  memberClassNumber: number
  /**
   * 멤버 상태 (ACCEPT: 수락)
   */
  memberStatus: MemberStatus
  /**
   * 멤버 역할 (OWNER: 소유자)
   */
  memberRole: MemberRole
  /**
   * 사용자 유형 (TEACHER: 교사)
   */
  userType: UserType
  /**
   * 정렬 순서
   */
  sortNo: number
  /**
   * 등록 타임스탬프
   */
  insertedTimestamp: number
  /**
   * 사용자 ID
   */
  userId: UUID
  /**
   * 사용자 이름
   */
  userName: string
  /**
   * 사용자 프로필 사진 경로
   */
  userPhoto: string
  /**
   * 사용자 SNS 유형 (hiClass 등)
   */
  userSns: string
  /**
   * 사용자 휴대폰 번호
   */
  userMobile: string
  /**
   * 등록한 사용자 ID
   */
  insertedUserId: UUID | null
  /**
   * 로그인 ID
   */
  loginId: string
  /**
   * 클래스 ID
   */
  classId: UUID
  /**
   * 클래스 이름
   */
  className: string
  /**
   * 클래스 이미지 경로
   */
  classImagePath: string
  /**
   * 클래스 소속 학교 ID
   */
  classSchoolId: UUID
  /**
   * 클래스 상태 (ACTIVATE: 활성화, DEACTIVATE: 비활성화, CLOSING: 폐쇄중, CLOSED: 폐쇄)
   */
  classStatus: ClassStatus
  /**
   * 클래스 년도
   */
  classYear: string
  /**
   * 클래스 학년
   */
  classGrade: "1" | "2" | "3" | "4" | "5" | "6" | "ANY"
  /**
   * 클래스 반
   */
  classBan: string
  /**
   * 클래스 소유자 ID
   */
  classOwnerId: UUID
  /**
   * 클래스 소유자 이름
   */
  classOwnerName: string
  /**
   * 클래스 신청 사용 여부
   */
  classApplyUsed: boolean
  /**
   * 출석부 사용 여부
   */
  attendanceUsed: boolean
  /**
   * 학교 유형 (ELEMENTARY: 초등학교)
   */
  schoolType: SchoolType
  /**
   * 학교 이름
   */
  schoolName: string
  /**
   * 학교 상태 (ACTIVATE: 활성)
   */
  schoolStatus: SchoolStatus
  /**
   * 프로필 ID
   */
  profileId: UUID | null
  /**
   * 현재 ID
   */
  currentId: UUID
  /**
   * API 링크 정보
   */
  _links: Links
}

