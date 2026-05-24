import {
  DrawType,
  Gender,
  GroupMission,
  GroupMissionReward, GroupMissionCharacter,
  GroupMissionInProgress,
  SeatPlanSections, GroupMissionStorageCharacter,
  ReportStudent, ReportData,
} from "../classroom";
import {UUID, Page} from "../common";

/**
 * 추첨 결과 응답 인터페이스
 * @description 학급 내 추첨 기능의 결과를 담는 응답 객체입니다.
 * drawType에 따라 다른 응답 구조를 가집니다.
 */
export interface DrawResponse<T extends RandomDrawResult | GroupDrawResult | RandomInGroupDrawResult> {
    drawResult: T;
}

/**
 * 랜덤 추첨 결과
 */
export interface RandomDrawResult {
    /** 뽑기 유형 - 랜덤 */
    drawType: DrawType.RANDOM;
    /** 선정 대상 성별 */
    gender: Gender;
    /** 선정 대상 수 */
    targetNum: number;
    /** 선정된 학생수 */
    selectedNum: number;
    /** 선정된 학생 아이디 배열 */
    studentIds: string[];
}

/**
 * 그룹 추첨 결과  
 */
export interface GroupDrawResult {
    /** 뽑기 유형 - 그룹 */
    drawType: DrawType.GROUP;
    /** 선정 대상 성별 */
    gender: Gender;
    /** 선정 대상 수 */
    targetNum: number;
    /** 선정된 그룹수 */
    selectedNum: number;
    /** 선정된 그룹(섹션) 아이디 */
    groupId: string;
}

/**
 * 그룹 내 랜덤 추첨 결과
 */
export interface RandomInGroupDrawResult {
    /** 뽑기 유형 - 그룹내뽑기 */
    drawType: DrawType.RANDOM_IN_GROUP;
    /** 선정 대상 성별 */
    gender: Gender;
    /** 선정 대상 수 */
    targetNum: number;
    /** 선정된 학생수 */
    selectedNum: number;
    /** 선정된 학생 Id - RANDOM_IN_GROUP에서만 존재 */
    studentId: string;
    /** 선정된 그룹(섹션) 아이디 */
    groupId: string;
}

/**
 * 자리배치(seat plan) 응답 인터페이스
 * @description 자리배치 분단/모둠(seat section) 조회 응답 객체입니다.
 * @interface SeatPlanSectionsResponse
 * @example
 * ```typescript
 * const response: SeatPlanSectionsResponse = {
 *   seatPlanId: "68942bea-d97a-46d5-ae87-7ef1a2d50f8d",
 *   classroomId: "d978b585-2603-49d0-8b78-62601666d904",
 *   seatPlanName: "testplan",
 *   seatPlanType: SeatPlanType.DIVISION,
 *   sectionType: SectionType.DOUBLE_COLUMN,
 *   sectionCount: 2,
 *   version: 1,
 *   pairingType: PairingType.GENDER_DIFFERENT,
 *   avoidPreviousPartner: true,
 *   isMergeRemaining: true,
 *   viewMode: ViewMode.SINGLE_VIEW,
 *   isStudentHidden: false,
 *   seatSections: [{
 *     sectionId: "1fa81709-7f08-47dd-be3b-e30ef7f619c1",
 *     seatPlanId: "68942bea-d97a-46d5-ae87-7ef1a2d50f8d",
 *     sectionName: "모둠1",
 *     sectionNo: 1,
 *     seatCount: 2,
 *     version: 1,
 *     seats: [{
 *       seatId: "cf1a4a8e-281c-4008-95a6-d4bb18ffcf7e",
 *       seatPlanId: "68942bea-d97a-46d5-ae87-7ef1a2d50f8d",
 *       sectionId: "1fa81709-7f08-47dd-be3b-e30ef7f619c1",
 *       student: {
 *         studentId: "1958b935-eada-4576-92a5-a5694dccfe9a",
 *         studentName: "이름1",
 *         studentNo: 1,
 *         character: "hc0009",
 *         point: 0
 *       },
 *       version: 1,
 *       seatRow: 1,
 *       seatColumn: 1,
 *       isActive: true,
 *       isFixed: false
 *     }]
 *   }]
 * };
 * ```
 */
export interface SeatPlanSectionsResponse extends SeatPlanSections {}

export interface GroupMissionResponse extends GroupMission {}

export interface GroupMissionsResponse {
  _embedded: {
    missions: GroupMission[];
  }
}

export interface GroupMissionInProgressResponse extends GroupMissionInProgress {}

export interface GroupMissionRewardsResponse {
  increaseCount: number;
  decreaseCount: number;
  rewards: GroupMissionReward[];
}

export interface GroupMissionStorageResponse {
  rewardCharacters: GroupMissionStorageCharacter[];
  hiddenCharacters: GroupMissionStorageCharacter[];
}

export interface GroupMissionStorageCharacterResponse extends GroupMissionCharacter {}

export interface ClassroomReportsStudentsResponse {
  _embedded: {
    reports: ReportStudent[];
  },
  page: Page;
}
export interface ClassroomReportStudentsResponse {
  reportId: string;
  reportName: string;
  dateStartTimestamp: number;
  dateEndTimestamp: number;
  reportData: ReportData;
  reportMemo: string|null;
  insertedUserId: string
}

export interface PostClassroomReportPointRewardsExcelResponse {
  _embedded: {
    points: ClassroomReportPointRewardsExcel[];
  },
}
export interface ClassroomReportPointRewardsExcel {
  rewardTimestamp: number;
  studentName: string;
  isNegative: boolean;
  point: number;
  pointName: string;
  memo: string;
}