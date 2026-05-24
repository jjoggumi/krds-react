/**
 * 학교 상태 ENUM
 */
export enum SchoolStatus {
    /** 활성화 */
    ACTIVATE = 'ACTIVATE',
    /** 비활성화 */
    DEACTIVATE = 'DEACTIVATE',
    /** 폐쇄중 */
    CLOSING = 'CLOSING',
}

/**
 * 학교 유형 ENUM
 */
export enum SchoolType {
    /** 없음: 예전 테스트 데이터에는 있는 타입이지만 사용에 ACTIVATE된 클래스는 없다고 답변 받음 */
    NONE = 'NONE',
    /** 유치원 */
    KINDERGARTEN = 'KINDERGARTEN',
    /** 초등학교 */
    ELEMENTARY = 'ELEMENTARY',
    /** 중학교 */
    MIDDLE = 'MIDDLE',
    /** 고등학교 */
    HIGH = 'HIGH',
    /** 특수학교 */
    SPECIAL = 'SPECIAL',
    /** 대학교 */
    UNIVERSITY = 'UNIVERSITY',
    /** 단체 */
    GROUP = 'GROUP',
}
