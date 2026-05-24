import { UUID } from './common';

/**
 * 학급에서 사용되는 추첨 관련 타입 정의
 * @fileoverview 그룹 뽑기, 랜덤 추첨 등 학급 내 추첨 기능을 위한 타입 정의
 */

/**
 * 뽑기 유형을 정의하는 Enum
 * @description 학급에서 학생을 뽑기하는 다양한 방식을 정의합니다.
 */
export enum DrawType {
    /** 랜덤 */
    RANDOM = 'RANDOM',
    /** 그룹 */
    GROUP = 'GROUP',
    /** 그룹내뽑기 */
    RANDOM_IN_GROUP = 'RANDOM_IN_GROUP',
}

/**
 * 성별 타입 Enum
 * @description 추첨 시 성별 조건을 설정하기 위한 Enum입니다.
 * @example
 * ```typescript
 * const targetGender: Gender = Gender.MALE;
 * ```
 */
export enum Gender {
    /** 전체 */
    ALL = 'ALL',
    /** 남 */
    MALE = 'MALE',
    /** 여 */
    FEMALE = 'FEMALE',
}

/**
 * 자리 배치 타입 열거형
 * @description 자리 배치의 유형을 정의합니다.
 */
export enum SeatPlanType {
    /** 분단 */
    DIVISION = 'DIVISION',
    /** 모둠 */
    GROUP = 'GROUP',
    /** 자유 */
    FREE = 'FREE',
}

/**
 * 섹션 타입 열거형
 * @description 분단/모둠의 배치 형태를 정의합니다.
 */
export enum SectionType {
    /** 1열 */
    SINGLE_COLUMN = 'SINGLE_COLUMN',
    /** 2열 */
    DOUBLE_COLUMN = 'DOUBLE_COLUMN',
    /** 3인 모둠 */
    GROUP_THREE_PERSON = 'GROUP_THREE_PERSON',
    /** 4인 모둠 */
    GROUP_FOUR_PERSON = 'GROUP_FOUR_PERSON',
    /** 5인 모둠 */
    GROUP_FIVE_PERSON = 'GROUP_FIVE_PERSON',
    /** 6인 모둠 */
    GROUP_SIX_PERSON = 'GROUP_SIX_PERSON',
    /** 자유형 */
    FREE_LAYOUT = 'FREE_LAYOUT',
}

/**
 * 짝궁 설정 유형 열거형
 * @description 자리 배치 시 짝궁을 설정하는 방식을 정의합니다.
 */
export enum PairingType {
    /** 랜덤 */
    RANDOM = 'RANDOM',
    /** 같은 성별 */
    GENDER_SAME = 'GENDER_SAME',
    /** 다른 성별 */
    GENDER_DIFFERENT = 'GENDER_DIFFERENT',
}

/**
 * 자리 변경 표현 모드 열거형
 * @description 변경된 자리를 표현하는 효과를 정의합니다.
 */
export enum ViewMode {
    /** 한명씩보기 */
    SINGLE_VIEW = 'SINGLE_VIEW',
    /** 한번에보기 */
    FULL_VIEW = 'FULL_VIEW',
}

/**
 * 자리 섹션 인터페이스
 * @description 분단 또는 모둠의 정보를 나타냅니다.
 */
export interface SeatSection {
    /** seat section 아이디 */
    sectionId: UUID;

    /** seat plan 아이디 */
    seatPlanId: UUID;

    /** section 이름 */
    sectionName: string;
    
    /** section 순서 (1 ~ 65,535) */
    sectionNo: number;
    
    /** section 내 seat 갯수 (1 ~ 65,535) */
    seatCount: number;
    
    /** seat plan 버전 */
    version: number;
    
    /** 좌석(seat) 정보 배열 */
    seats: Seat[];
}

/**
 * 좌석 인터페이스
 * @description 개별 좌석의 정보를 나타냅니다.
 */
export interface Seat {
    /** seat 아이디 */
    seatId: UUID;

    /** seat plan 아이디 */
    seatPlanId: UUID;

    /** seat section 아이디 */
    sectionId: UUID;

    /** 학생 정보 (비어있는 좌석의 경우 null) */
    student: SeatStudent | null;
    
    /** plan 버전 (1 ~ 65,535) */
    version: number;
    
    /** seat의 위치 행 번호 (1 ~ 65,535) */
    seatRow: number;
    
    /** seat의 위치 열 번호 (1 ~ 65,535) */
    seatColumn: number;
    
    /** 자리 활성화 여부 */
    isActive: boolean;
    
    /** 학생 자리 고정 여부 */
    isFixed: boolean;
}

/**
 * 학생 정보 인터페이스
 * @description 좌석에 배정된 학생의 정보를 나타냅니다.
 */
export interface SeatStudent {
    /** 학생 아이디 */
    studentId: UUID;

    /** 학생 이름 */
    studentName: string;

    /** 학생 반 번호 */
    studentNo: number;

    /** 학생 캐릭터 */
    character: string;

    /** 학생 포인트 */
    point: number;

    /** 학생 사진 */
    studentPhoto: string | null
}

/**
 * 자리배치도
 * @description 자리배치도의 정보를 나타냅니다.
 */
export interface SeatPlanSections {
    /** seat plan 아이디 */
    seatPlanId: UUID;

    /** classroom 아이디 */
    classroomId: UUID;

    /** seat plan 이름 */
    seatPlanName: string;

    /** plan 타입 (DIVISION: 분단, GROUP: 모둠, FREE: 자유형) */
    seatPlanType: SeatPlanType;

    /** section 타입 (SINGLE_COLUMN: 1열, DOUBLE_COLUMN: 2열, GROUP_THREE_PERSON: 3인 모둠, GROUP_FOUR_PERSON: 4인 모둠, GROUP_FIVE_PERSON: 5인 모둠, GROUP_SIX_PERSON: 6인 모둠, FREE_LAYOUT: 자유형) */
    sectionType: SectionType;

    /** section 갯수 (1 ~ 65,535) */
    sectionCount: number;

    /** plan 버전 (1 ~ 65,535) */
    version: number;

    /** 짝궁 설정 유형 (RANDOM: 랜덤, GENDER_SAME: 같은 성별, GENDER_DIFFERENT: 다른 성별) - 선택적 */
    pairingType?: PairingType;

    /** 이전 짝궁이랑 안앉기 여부 */
    avoidPreviousPartner: boolean;

    /** 좌석 배치 못받은 학생 모둠에 합하기 여부 */
    isMergeRemaining: boolean;

    /** 변경된 자리 표현 효과 (SINGLE_VIEW: 한명씩보기, FULL_VIEW: 한번에보기) */
    viewMode: ViewMode;

    /** 학생 이름 표시 여부 */
    isStudentHidden: boolean;

    /** 분단/모둠(seat section) 정보 배열 */
    seatSections: SeatSection[];
}

export interface GroupMission {
  id: UUID;
  name: string;
  goal: number;
  stage: number;
  templateId: UUID;
}

export interface GroupMissionInProgress extends GroupMission {
  point: number;
}

export interface GroupMissionReward {
  point: number;
  isNegative: boolean;
  rewardTimestamp: number;
}

export interface GroupMissionCharacter {
  characterId: UUID;
  characterName: string;
  characterCode: string;
  goalPoint: number;
  characterMessage: string;
  logs: GroupMissionCharacterLog[];
}

export interface GroupMissionCharacterLog {
  missionGoal: number;
  missionName: string;
  insertedTimestamp: number;
}

export type GroupMissionStorageCharacter = Pick<GroupMissionCharacter, 'characterId' | 'characterName' | 'characterCode' | 'goalPoint'>


export interface ReportStudent {
  reportName: string;
  reportId: string;
  insertedTimestamp: number;
  studentNo: number | null;
  studentName: string;
  dateStartTimestamp: number;
  dateEndTimestamp: number;
}

export interface ReportData {
  studentId: string;
  studentName: string;
  studentPhoto: string | null;
  studentNo: number | null;
  points: Point[]
}

export interface Point{
  pointId: string;
  pointName: string;
  point: number;
  isNegative: boolean;
  pointImage: string;
  pointColor: string;
  totalPoint: number;
}