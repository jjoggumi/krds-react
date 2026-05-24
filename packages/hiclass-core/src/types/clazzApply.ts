import {UUID} from "./common";

/**
 * 신청자 정보
 */
export interface ApplyUser {
  /** 사용자 ID */
  userId: UUID
  /** 사용자 서명 이미지 경로 */
  userSignImagePath: string | null
  /** 신청자 유형 */
  applyUserType: string
}

/**
 * 승인자 정보
 */
export interface ApprovalUser {
  /** 사용자 ID */
  userId: UUID | null
  /** 사용자 결재 서명 이미지 경로 */
  userApprovalSignImagePath: string | null
}

/**
 * 태그 정보
 */
export interface Tag {
  /** 태그 ID */
  tagId: UUID
  /** 태그 이름 */
  tagName: string
}

/**
 * 파일 정보
 */
export interface ApplyFile {
  /** 파일 시퀀스 */
  seq: number
  /** 파일 플래그 */
  fileFlag: 'FILE' | string
  /** 파일 이름 */
  fileName: string
  /** 파일 크기 */
  fileSize: string
  /** 파일 콘텐츠 유형 */
  fileContentType: string
  /** 파일 썸네일 경로 */
  fileThumbnailPath: string | null
  /** 파일 원본 경로 */
  fileOriginalPath: string
  /** 파일 변환 경로 */
  fileConvertPath: string | null
  /** 파일 트랜스코딩 경로 */
  fileTranscodePath: string | null
  /** 등록 타임스탬프 */
  insertedTimestamp: number
  /** 작업 ID */
  workId: string
}

/**
 * 신청서 유형
 */
export enum ClazzApplyType {
  /** 결석계 */
  ABSENT = 'ABSENT',
  /** 체험학습 */
  FIELD_STUDY = 'FIELD_STUDY',
  /** 투약의뢰서 */
  MEDICATION_ORDER = 'MEDICATION_ORDER',
  /** 기타 */
  ETC = 'ETC',
}

/**
 * 학교양식신청서 결제 상태 ENUM
 */
export enum ClazzApplyStatus {
    /**
     * 완료
     */
    COMPLETE = 'COMPLETE',
    /**
     * 반려
     */
    REJECT = 'REJECT',
    /**
     * 미확인
     */
    UNIDENTIFIED = 'UNIDENTIFIED',
    /**
     * 임시저장
     */
    TEMP = 'TEMP'
}
/**
 * 가족 관계 유형
 */
export enum FamilyRelationshipType {
    /** 어머니 */
    MOTHER = 'MOTHER',
    /** 아버지 */
    FATHER = 'FATHER',
    /** 조부모 */
    GRANDPARENTS = 'GRANDPARENTS',
    /** 친인척 */
    COUSIN = 'COUSIN',
    /** 직접입력 */
    ETC = 'ETC',
}

/**
 * 결석 구분
 */
export enum AbsentType {
    /** 병결(질병) */
    SICKNESS = 'SICKNESS',
    /** 미인정 */
    UNRECOGNIZED = 'UNRECOGNIZED',
    /** 출석인정(법정전염병, 경조사) */
    RECOGNITION = 'RECOGNITION',
    /** 기타 */
    ETC = 'ETC',
}

/**
 * 학습 형태
 */
export enum StudyType {
    /** 가족여행 */
    TRAVEL = 'TRAVEL',
    /** 친인척방문 */
    VISITING = 'VISITING',
    /** 견학활동 */
    TOUR = 'TOUR',
    /** 체험활동 */
    EXPERIENCE = 'EXPERIENCE',
    /** 가정학습 */
    HOME = 'HOME',
}

/**
 * 신청 상태
 */
export enum ApplyStatus {
    /** 임시저장 */
    TEMP = 'TEMP',
    /** 미확인 */
    UNIDENTIFIED = 'UNIDENTIFIED',
    /** 완료 */
    COMPLETE = 'COMPLETE',
    /** 반려 */
    REJECT = 'REJECT',
}

/**
 * 시트 유형
 */
export enum SheetType {
    /** 하이클래스 */
    HICLASS = 'H',
    /** 워크시트 */
    WORKSHEET = 'W',
}

/**
 * 체험학습 신청서 정보
 */
export interface ClazzApply {
    /** ID */
    id: UUID
    /** 신청서 유형 */
    applyType: ClazzApplyType
    /** 학생명 */
    studentName: string
    /** 보호자명 */
    parentName: string
    /** 보호자 유형 */
    parentType: FamilyRelationshipType
    /** 보호자 유형명 */
    parentTypeName: string
    /** 보호자 연락처(비상연락처) */
    parentPhone: string
    /** 인솔자명 */
    leaderName: string
    /** 인솔자 유형 */
    leaderType: FamilyRelationshipType
    /** 인솔자 유형명(직접입력) */
    leaderTypeName: string
    /** 인솔자 연락처 */
    leaderPhone: string
    /** 신청 시작일 */
    timestampStart: number
    /** 신청 종료일 */
    timestampEnd: number
    /** 결석 구분 */
    absentType: AbsentType | null
    /** 학습형태 */
    studyType: StudyType | null
    /** 체험장소 */
    studyPlace: string | null
    /** 숙박장소 */
    accommodationPlace: string | null
    /** (결석사유서) 결석 사유 / (투약의뢰서) 증상 */
    reason: string | null
    /** 체험목적 */
    purpose: string | null
    /** 체험계획 */
    plan: string | null
    /** 신청 상태 */
    applyStatus: ApplyStatus
    /** 사용자 아이디 */
    userId: UUID
    /** (결석계, 체험학습) 신청 일수 */
    applyDays: number
    /** (결석계, 체험학습) 반일 신청 시작일 */
    halfDayStart: number | null
    /** (결석계, 체험학습) 반일 신청 종료일 */
    halfDayEnd: number | null
    /** (결석계, 체험학습) 반일 신청 시간 */
    halfDayHours: string | null
    /** 신청서 내역 개수 */
    applyCounts: number | null
    /** 제출일 */
    applyTimestamp: number
    /** 클래스 아이디 */
    classId: UUID
    /** 학년 코드 */
    classGrade: string
    /** 반 */
    classBan: string
    /** 등록자 아이디 */
    insertedUserId: string
    /** 신청자정보 */
    applyUser: ApplyUser
    /** 승인자정보 */
    approvalUser: ApprovalUser
    /** 시트 유형 */
    sheetType: SheetType
    /** 워크시트 아이디 */
    sheetId: UUID
    /** 제목 */
    title: string
    /** 삭제 여부 (true:삭제됨, false:삭제안됨) */
    del: boolean
    /** 등록된 반려 사유 존재 여부 */
    isExistReject: boolean
    /** 태그 정보 */
    tags: Tag[]
    /** 약물 정보 */
    medications: unknown | null
    /** 투약 보고서 */
    medicationReport: unknown | null
    /** 파일정보 */
    files: ApplyFile[]
    /** 워크시트 응답 정보 */
    sheetResponses: unknown[]
    /** 현재 ID */
    currentId: UUID
    /** 링크 정보 */
    _links: {
        self: {
            href: string
        }
        clazzApply: {
            href: string
        }
    }
}