/**
 * 사용자 관련 타입 정의
 * @fileoverview 사용자 정보, 상태 등 사용자 관련 데이터를 위한 타입 정의
 */

import { Links, UUID } from './common'

/**
 * 사용자 유형 ENUM
 */
export enum UserType {
  /** 학생 */
  STUDENT = 'STUDENT',
  /** 교사 */
  TEACHER = 'TEACHER',
  /** 학부모 */
  PARENT = 'PARENT',
}

export enum UserSNS {
  /** 구글 */
  GOOGLE = 'google',
  /** 네이버 */
  NAVER = 'naver',
  /** 카카오 */
  KAKAO = 'kakao',
  /** iScream */
  ISCREAM = 'iScream',
  /** hiClass */
  HICLASS = 'hiClass',
}

export enum UserStatus {
  /** 활성 */
  ACTIVE = 'ACTIVE',
  /** 비활성 */
  DEACTIVATE = 'DEACTIVATE',
}

/**
 * 생성/수정자 정보를 담는 공통 인터페이스
 */
export interface EmbeddedUser {
  /**
   * 사용자 유형
   */
  userType: UserType
  /**
   * 사용자 이름
   */
  userName: string
  /**
   * 대표 이미지 경로
   */
  userPhoto: string | null
  /**
   * 모바일 번호
   */
  userMobile: string
  /**
   * SNS 유형 (google, naver, kakao, iScream, hiClass)
   */
  userSns: UserSNS
  /**
   * 아이디
   */
  loginId: UUID
  /**
   * 채팅 대화 가능 요일 (SUN:0, MON:1, TUE:2, WED:3, THU:4, FRI:5, SAT:6) (ex. "1,2,3,4,5")
   */
  userChatDay: string
  /**
   * 채팅 대화 가능 시작 시간 (ex. "0800")
   */
  userChatStartTime: string
  /**
   * 채팅 대화 가능 종료 시간 (ex. "1630")
   */
  userChatEndTime: string
  /**
   * 회원 상태
   */
  userStatus: UserStatus
  /**
   * 푸시 수신 여부
   */
  userPushUsed: boolean
  /**
   * 현재 ID
   */
  currentId: UUID
  /**
   * API 링크 정보
   */
  _links?: Links
}

/**
 * 사용자 정보 인터페이스
 */
export interface User {
  /**
   * 사용자 유형
   */
  userType: UserType
  /**
   * SNS 유형 (google, naver, kakao, iScream, hiClass)
   */
  userSns: string
  /**
   * 사용자 이름
   */
  userName: string
  /**
   * 대표 이미지 경로
   */
  userPhoto: string | null
  /**
   * 아이디
   */
  loginId: string
  /**
   * 성별
   */
  userGender: string | null
  /**
   * 번호
   */
  userNumber: number | null
  /**
   * 생일
   */
  userBirthday: string | null
  /**
   * 전화번호
   */
  userTel: string | null
  /**
   * 모바일 번호
   */
  userMobile: string
  /**
   * 이메일
   */
  userEmail: string
  /**
   * 우편번호
   */
  userAddressZipcode: string | null
  /**
   * 주소1
   */
  userAddress1: string | null
  /**
   * 주소2
   */
  userAddress2: string | null
  /**
   * 마케팅 수신 여부
   */
  userMarketingUsed: boolean
  /**
   * 마케팅 수신 동의일
   */
  userMarketingTimestamp: number
  /**
   * 푸시 수신 여부
   */
  userPushUsed: boolean
  /**
   * 푸시 수신 동의일
   */
  userPushTimestamp: number
  /**
   * 최근 마케팅 안내 고지 발송일자
   */
  consentNotificationTimestamp: number | null
  /**
   * 댓글 차단 시작일
   */
  userBlockStart: string | null
  /**
   * 댓글 차단 종료일
   */
  userBlockEnd: string | null
  /**
   * 회원 상태
   */
  userStatus: UserStatus
  /**
   * 교사 인증 여부
   */
  userTeacherAuth: string
  /**
   * 채팅 대화 가능 요일 (SUN:0, MON:1, TUE:2, WED:3, THU:4, FRI:5, SAT:6) (ex. "1,2,3,4,5")
   */
  userChatDay: string
  /**
   * 채팅 대화 가능 시작 시간 (ex. "0800")
   */
  userChatStartTime: string
  /**
   * 채팅 대화 가능 종료 시간 (ex. "1630")
   */
  userChatEndTime: string
  /**
   * 학생 만료일
   */
  expiredTimestamp: number | null
  /**
   * 서명 이미지 경로
   */
  userSignImagePath: string | null
  /**
   * 서명 등록일
   */
  userSignTimestamp: number | null
  /**
   * 결재 서명 이미지 경로
   */
  userApprovalSignImagePath: string | null
  /**
   * 결재 서명 등록일
   */
  userApprovalSignTimestamp: number | null
  /**
   * 생성자
   */
  insertedUser: EmbeddedUser | null
  /**
   * 생성 시간
   */
  insertedTimestamp: number | null
  /**
   * 수정자 정보
   */
  updatedUser: EmbeddedUser | null
  /**
   * 수정 시간
   */
  updatedTimestamp: number
  /**
   * 현재 ID
   */
  currentId: UUID
  /**
   * 채팅 가능 여부
   */
  isChat: boolean
  /**
   * API 링크 정보
   */
  _links?: Links
}