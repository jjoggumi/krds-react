import {GroupMission} from "../classroom";
import {UUID} from "../common";

export type GroupMissionCreateRequest = Pick<GroupMission, 'name' | 'goal'>
export type GroupMissionUpdateRequest = Pick<GroupMission, 'name' | 'goal' | 'templateId'>

export interface GroupMissionSortingRequest {
  groupMissions: { id: UUID; sortNo: number; }[]
}

export interface GroupMissionRewardRequest {
  point: number;
  isNegative: boolean;
  stage: number;
}

export interface ClassroomReportsStudentsRequest {
  sort: string;
  userId: string;
}

export interface ClassroomReportStudentsRequest {
  reportName: string;
  studentIds: string[];
  month: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  userId: string;
}

export interface PatchClassroomReportStudentsRequest {
  userId: string;
  reportName: string;
  reportMemo: string | null;
}

export interface PutClassroomReportStudentsRequest {
  userId: string;
  reportIds: string[];
}

export interface PostClassroomReportPointRewardsExcelRequest {
  studentIds: string[] | null, 
  sort: string, 
  month: string | null, 
  dateStart: string | null, 
  dateEnd: string | null
}