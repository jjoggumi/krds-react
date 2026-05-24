import {
  DrawResponse,
  GroupDrawResult,
  GroupMissionCreateRequest,
  GroupMissionUpdateRequest,
  GroupMissionResponse,
  GroupMissionRewardRequest,
  GroupMissionRewardsResponse,
  GroupMissionSortingRequest,
  GroupMissionsResponse,
  GroupMissionStorageCharacterResponse,
  GroupMissionStorageResponse,
  GroupMissionInProgressResponse,
  RandomInGroupDrawResult,
  SeatPlanSectionsResponse,
  ClassroomReportsStudentsRequest,
  UUID,
  ClassroomReportsStudentsResponse,
  ClassroomReportStudentsResponse,
  ClassroomReportStudentsRequest,
  PatchClassroomReportStudentsRequest,
  PutClassroomReportStudentsRequest,
  PostClassroomReportPointRewardsExcelResponse,
  PostClassroomReportPointRewardsExcelRequest,
} from '../types';

import {
  PutClassRoomExcludeStudentRequest,
} from '../types/requset';

import { Get, Post, Put, Delete, Patch } from './index';

export const getGroupDraw = async (seatPlanId: string, version: number) => {
  const response = await Post<DrawResponse<GroupDrawResult>>(`classrooms/draw/group/${seatPlanId}`, { params: { version } });
  return response.data;
};

export const getSeatPlanSections = async (classroomId: string, seatPlanId: string, version: number) => {
  const response = await Get<SeatPlanSectionsResponse>(`classroom/${classroomId}/seatPlan/${seatPlanId}/sections`, { params: { version } });
  return response.data;
};

export const getDrawInGroup = async (seatPlanId: string, version: number) => {
  const response = await Post<DrawResponse<RandomInGroupDrawResult>>(`classrooms/draw/group/${seatPlanId}/random`, { params: { version } });
  return response.data;
};

export const putClassRoomExcludeStudents = async (classroomId: string, data: PutClassRoomExcludeStudentRequest) => {
  try {
    const response  = await Put<void>(`classroom/${classroomId}/student/exclude`, data);
    return response.data;
  } catch (e) {
    throw e
  }
}

export const createGroupMission = async (classroomId: UUID, mission: GroupMissionCreateRequest) => {
  const response = await Post<GroupMissionResponse>(`/classroom/${classroomId}/group-missions`, mission);
  return response.data;
};

export const updateGroupMission = async (classroomId: UUID, templateId: UUID, mission: GroupMissionUpdateRequest) => {
  await Put(`/classroom/${classroomId}/group-missions/${templateId}`, mission);
};

export const deleteGroupMission = async (classroomId: UUID, templateId: UUID) => {
  await Delete(`/classroom/${classroomId}/group-missions/${templateId}`);
};

export const startGroupMission = async (classroomId: UUID, templateId: UUID) => {
  const response = await Post<GroupMissionResponse>(`/classroom/${classroomId}/group-missions/${templateId}/start`);
  return response.data;
};

export const getGroupMissions = async (classroomId: UUID) => {
  return await Get<GroupMissionsResponse>(`/classroom/${classroomId}/group-missions`);
};

export const getGroupMissionInfo = async (classroomId: UUID) => {
  const response = await Get<GroupMissionInProgressResponse>(`/classroom/${classroomId}/group-missions/info`);
  return response.data;
};

export const updateGroupMissionsSorting = async (classroomId: UUID, groupMissions: GroupMissionSortingRequest) => {
  await Put<GroupMissionsResponse>(`/classroom/${classroomId}/group-missions/sorting`, groupMissions);
};

export const rewardGroupMission = async (classroomId: UUID, missionId: UUID, reward: GroupMissionRewardRequest) => {
  const response = await Put<GroupMissionInProgressResponse>(`/classroom/${classroomId}/group-missions/${missionId}/reward`, reward);
  return response.data;
};

export const getGroupMissionRewards = async (classroomId: UUID, missionId: UUID) => {
  const response = await Get<GroupMissionRewardsResponse>(`/classroom/${classroomId}/group-missions/${missionId}/rewards`);
  return response.data;
};

export const getGroupMissionStorage = async (classroomId: UUID) => {
  const response = await Get<GroupMissionStorageResponse>(`/classroom/${classroomId}/group-missions/storage`);
  return response.data;
};

export const getGroupMissionStorageCharacter = async (classroomId: UUID, characterId: UUID) => {
  const response = await Get<GroupMissionStorageCharacterResponse>(`/classroom/${classroomId}/group-missions/storage/${characterId}`);
  return response.data;
};

export const postClassroomReportsStudents = async (classroomId: UUID, page: number, request: ClassroomReportsStudentsRequest ) => {
  const cleanRequest = Object.fromEntries(
    Object.entries(request).filter(([_, v]) => v !== null && v !== undefined && v !== "")
  );
  const response = await Post<ClassroomReportsStudentsResponse>(`/v2/classroom/${classroomId}/reports/students`, cleanRequest, { params: { page: page, size: 20 } });
  return response.data;
};

export const getClassroomReportStudents = async (classroomId: UUID, reportId: string, userId: string) => {
  const response = await Get<ClassroomReportStudentsResponse>(`/v2/classroom/${classroomId}/report/students/${reportId}`,  { params: { userId: userId }});
  return response.data;
};

export const postClassroomReportStudents = async (classroomId: UUID, request: ClassroomReportStudentsRequest ) => {
  const cleanRequest = Object.fromEntries(
    Object.entries(request).filter(([_, v]) => v !== null && v !== undefined && v !== "")
  );
  try {
    const response = await Post<ClassroomReportsStudentsResponse>(`/v2/classroom/${classroomId}/report/students`, cleanRequest);
    return response.data;
  } catch(e) {
    throw e;
  }
};

export const deleteClassroomReportStudents = async (classroomId: UUID, reportId: string) => {
  try {
    await Delete(`/v2/classroom/${classroomId}/report/students/${reportId}`);
  } catch(e) {
    throw e;
  }
};

export const patchClassroomReportStudents = async (classroomId: UUID, reportId: string, request: PatchClassroomReportStudentsRequest) => {
  try {
    await Patch(`/v2/classroom/${classroomId}/report/students/${reportId}`, request);
  } catch(e) {
    throw e;
  }
};

export const putClassroomReportStudents = async (classroomId: UUID, request: PutClassroomReportStudentsRequest) => {
  try {
    await Put(`/v2/classroom/${classroomId}/report/students`, request);
  } catch(e) {
    throw e;
  }
};

export const postClassroomReportPointRewardsExcel = async (classroomId: UUID, request: PostClassroomReportPointRewardsExcelRequest) => {
  try {
    const cleanRequest = Object.fromEntries(
      Object.entries(request).filter(([_, v]) => v !== null && v !== undefined && v !== "")
    );

    const response = await Post<PostClassroomReportPointRewardsExcelResponse>(`/v2/classroom/${classroomId}/report/point/rewards/excel`, cleanRequest);
    return response.data;
  } catch(e) {
    throw e;
  }
};

