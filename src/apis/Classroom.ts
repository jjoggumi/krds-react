/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import {
  ChangeStudentHiddenRequestDto,
  ChangeStudentSeatFixRequestDto,
  ChangeStudentSeatRequestDto,
  ClassroomChecklistCreateDto,
  ClassroomChecklistSearchRequestDto,
  ClassroomChecklistStudentUpdateCheckDto,
  ClassroomChecklistStudentUpdateDto,
  ClassroomChecklistStudentUpdateMemoDto,
  ClassroomChecklistUpdateDateDto,
  ClassroomChecklistUpdateDto,
  ClassroomChecklistUpdateItemDto,
  ClassroomChecklistUpdateTitleDto,
  ClassroomESSearchRequestDto,
  ClassroomGroupSaveDto,
  ClassroomGroupSearchRequestDto,
  ClassroomMemberSearchRequestDto,
  ClassroomPointCreateDto,
  ClassroomPointReportPointTotalRequestDto,
  ClassroomPointReportRewardRequestDto,
  ClassroomPointReportStudentTotalRequestDto,
  ClassroomPointReportTotalRequestDto,
  ClassroomPointSearchRequestDto,
  ClassroomPointSortDto,
  ClassroomPointUpdateDto,
  ClassroomRecordBookmarkMemoSaveDto,
  ClassroomRecordBookmarkSaveDto,
  ClassroomRecordContentSaveDto,
  ClassroomRecordFileInsertDto,
  ClassroomRecordReportStudentTotalRequestDto,
  ClassroomRecordSaveDto,
  ClassroomRecordSearchRequestDto,
  ClassroomRecordSTTSaveDto,
  ClassroomRecordSTTsSaveDto,
  ClassroomRecordStyleSaveDto,
  ClassroomRecordTargetSaveDto,
  ClassroomRewardDeleteRequestDto,
  ClassroomRewardMemoDto,
  ClassroomRewardRequestDto,
  ClassroomRewardResetDto,
  ClassroomStudentBulkInsertDto,
  ClassroomStudentInsertDto,
  ClassroomStudentSearchRequestDto,
  ClassroomStudentUpdateDto,
  ClassroomTagCreateDto,
  ClassroomTagSearchRequestDto,
  ClassroomTagUpdateDto,
  ClassroomUpdateDto,
  Pageable,
  PostReadUserSearchRequestDto,
  SeatPlanRequestDto,
  SeatPlanUpdateRequestDto,
  SeatSectionRenameRequestDto,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Classroom<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name SearchStudents
   * @request GET:/classroom/{classroomId}/students
   * @secure
   */
  searchStudents = (
    classroomId: string,
    query: {
      request: ClassroomStudentSearchRequestDto;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/students`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name InsertStudents
   * @request PUT:/classroom/{classroomId}/students
   * @secure
   */
  insertStudents = (classroomId: string, data: ClassroomStudentInsertDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/students`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name BulkInsertStudents
   * @request POST:/classroom/{classroomId}/students
   * @secure
   */
  bulkInsertStudents = (classroomId: string, data: ClassroomStudentBulkInsertDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/students`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags seat-plan-controller
   * @name GetSeatPlanDetailSeatPlanSeatPlanId
   * @request GET:/classroom/{classroomId}/seatPlan/{seatPlanId}
   * @secure
   */
  getSeatPlanDetailSeatPlanSeatPlanId = (
    classroomId: string,
    seatPlanId: string,
    query: {
      /** @format int32 */
      version: number;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/seatPlan/${seatPlanId}`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags seat-plan-controller
   * @name InitSeatPlanSeatPlanId
   * @request PUT:/classroom/{classroomId}/seatPlan/{seatPlanId}
   * @secure
   */
  initSeatPlanSeatPlanId = (
    classroomId: string,
    seatPlanId: string,
    query: {
      /** @format int32 */
      version: number;
    },
    data: SeatPlanRequestDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/seatPlan/${seatPlanId}`,
      method: 'PUT',
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags seat-plan-controller
   * @name DeleteSeatPlanSeatPlanId
   * @request DELETE:/classroom/{classroomId}/seatPlan/{seatPlanId}
   * @secure
   */
  deleteSeatPlanSeatPlanId = (
    classroomId: string,
    seatPlanId: string,
    query: {
      /** @format int32 */
      version: number;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/seatPlan/${seatPlanId}`,
      method: 'DELETE',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags seat-plan-controller
   * @name UpdateSeatPlanSeatPlanId
   * @request PATCH:/classroom/{classroomId}/seatPlan/{seatPlanId}
   * @secure
   */
  updateSeatPlanSeatPlanId = (
    classroomId: string,
    seatPlanId: string,
    query: {
      /** @format int32 */
      version: number;
    },
    data: SeatPlanUpdateRequestDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/seatPlan/${seatPlanId}`,
      method: 'PATCH',
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags seat-plan-controller
   * @name ChangeStudentSeatStudents
   * @request PUT:/classroom/{classroomId}/seatPlan/{seatPlanId}/students
   * @secure
   */
  changeStudentSeatStudents = (
    classroomId: string,
    seatPlanId: string,
    query: {
      /** @format int32 */
      version: number;
    },
    data: ChangeStudentSeatRequestDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/seatPlan/${seatPlanId}/students`,
      method: 'PUT',
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name DeleteRecordDelete
   * @request PUT:/classroom/{classroomId}/records/delete
   * @secure
   */
  deleteRecordDelete = (classroomId: string, data: ClassroomRecordSaveDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/records/delete`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name GetRecordTargetsTargets
   * @request GET:/classroom/{classroomId}/record/{recordId}/targets
   * @secure
   */
  getRecordTargetsTargets = (classroomId: string, recordId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/targets`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name InsertRecordTargetsTargets
   * @request PUT:/classroom/{classroomId}/record/{recordId}/targets
   * @secure
   */
  insertRecordTargetsTargets = (classroomId: string, recordId: string, data: ClassroomRecordTargetSaveDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/targets`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name DeleteRecordTargetsTargets
   * @request DELETE:/classroom/{classroomId}/record/{recordId}/targets
   * @secure
   */
  deleteRecordTargetsTargets = (classroomId: string, recordId: string, data: ClassroomRecordTargetSaveDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/targets`,
      method: 'DELETE',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name UpdateRecordTargetsTargets
   * @request PATCH:/classroom/{classroomId}/record/{recordId}/targets
   * @secure
   */
  updateRecordTargetsTargets = (classroomId: string, recordId: string, data: ClassroomRecordTargetSaveDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/targets`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name AddRecordFilesFiles
   * @request PUT:/classroom/{classroomId}/record/{recordId}/files
   * @secure
   */
  addRecordFilesFiles = (classroomId: string, recordId: string, data: ClassroomRecordFileInsertDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/files`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-group-controller
   * @name SearchGroups
   * @request GET:/classroom/{classroomId}/groups
   * @secure
   */
  searchGroups = (
    classroomId: string,
    query: {
      request: ClassroomGroupSearchRequestDto;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/groups`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-group-controller
   * @name CreateGroups
   * @request PUT:/classroom/{classroomId}/groups
   * @secure
   */
  createGroups = (classroomId: string, data: ClassroomGroupSaveDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/groups`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-student-controller
   * @name SearchStudentsStudents
   * @request GET:/classroom/{classroomId}/checklist/{checklistId}/students
   * @secure
   */
  searchStudentsStudents = (
    classroomId: string,
    checklistId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/students`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-student-controller
   * @name AddStudentsStudents
   * @request PUT:/classroom/{classroomId}/checklist/{checklistId}/students
   * @secure
   */
  addStudentsStudents = (classroomId: string, checklistId: string, data: ClassroomChecklistStudentUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/students`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-student-controller
   * @name DeleteStudentsStudents
   * @request DELETE:/classroom/{classroomId}/checklist/{checklistId}/students
   * @secure
   */
  deleteStudentsStudents = (classroomId: string, checklistId: string, data: ClassroomChecklistStudentUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/students`,
      method: 'DELETE',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-controller
   * @name CopyCopy
   * @request PUT:/classroom/{classroomId}/checklist/{checklistId}/copy
   * @secure
   */
  copyCopy = (
    classroomId: string,
    checklistId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/copy`,
      method: 'PUT',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-search-controller
   * @name SearchContentRecords
   * @request POST:/classroom/{classroomId}/report/records
   * @secure
   */
  searchContentRecords = (
    classroomId: string,
    query: {
      pageable: Pageable;
    },
    data: ClassroomESSearchRequestDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/report/records`,
      method: 'POST',
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-search-controller
   * @name SearchContentSearch
   * @request POST:/classroom/{classroomId}/report/records/search
   * @secure
   */
  searchContentSearch = (
    classroomId: string,
    query: {
      pageable: Pageable;
    },
    data: ClassroomESSearchRequestDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/report/records/search`,
      method: 'POST',
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-search-controller
   * @name SearchContentSearch
   * @request POST:/classroom/{classroomId}/records/search
   * @secure
   */
  searchContentSearch = (
    classroomId: string,
    query: {
      pageable: Pageable;
    },
    data: ClassroomESSearchRequestDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/records/search`,
      method: 'POST',
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-tag-controller
   * @name SearchTags
   * @request GET:/classroom/{classroomId}/tags
   * @secure
   */
  searchTags = (
    classroomId: string,
    query: {
      request: ClassroomTagSearchRequestDto;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/tags`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-tag-controller
   * @name CreateTags
   * @request POST:/classroom/{classroomId}/tags
   * @secure
   */
  createTags = (classroomId: string, data: ClassroomTagCreateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/tags`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags seat-plan-controller
   * @name GetSeatPlansSeatPlan
   * @request GET:/classroom/{classroomId}/seatPlan
   * @secure
   */
  getSeatPlansSeatPlan = (classroomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/seatPlan`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags seat-plan-controller
   * @name CreateSeatPlan
   * @request POST:/classroom/{classroomId}/seatPlan
   * @secure
   */
  createSeatPlan = (classroomId: string, data: SeatPlanRequestDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/seatPlan`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-reward-controller
   * @name RewardsRewards
   * @request POST:/classroom/{classroomId}/rewards
   * @secure
   */
  rewardsRewards = (classroomId: string, data: ClassroomRewardRequestDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/rewards`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-reward-controller
   * @name DeleteRewards
   * @request DELETE:/classroom/{classroomId}/rewards
   * @secure
   */
  deleteRewards = (classroomId: string, data: ClassroomRewardDeleteRequestDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/rewards`,
      method: 'DELETE',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-search-controller
   * @name SearchRewardSearch
   * @request POST:/classroom/{classroomId}/report/rewards/search
   * @secure
   */
  searchRewardSearch = (
    classroomId: string,
    query: {
      pageable: Pageable;
    },
    data: ClassroomESSearchRequestDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/report/rewards/search`,
      method: 'POST',
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name CreateRecordRecord
   * @request POST:/classroom/{classroomId}/record
   * @secure
   */
  createRecordRecord = (classroomId: string, data: ClassroomRecordSaveDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-search-controller
   * @name GetRecordFilesFiles
   * @request POST:/classroom/{classroomId}/records/files
   * @secure
   */
  getRecordFilesFiles = (
    classroomId: string,
    query: {
      pageable: Pageable;
    },
    data: ClassroomESSearchRequestDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/records/files`,
      method: 'POST',
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-search-controller
   * @name ExcelExcel
   * @request POST:/classroom/{classroomId}/records/excel
   * @secure
   */
  excelExcel = (classroomId: string, data: ClassroomESSearchRequestDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/records/excel`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-bookmark-controller
   * @name GetRecordBookmarkBookmarks
   * @request GET:/classroom/{classroomId}/record/{recordId}/bookmarks
   * @secure
   */
  getRecordBookmarkBookmarks = (classroomId: string, recordId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/bookmarks`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-bookmark-controller
   * @name CreateRecordBookmarkBookmarks
   * @request POST:/classroom/{classroomId}/record/{recordId}/bookmarks
   * @secure
   */
  createRecordBookmarkBookmarks = (classroomId: string, recordId: string, data: ClassroomRecordBookmarkSaveDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/bookmarks`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-point-controller
   * @name SearchPoints
   * @request GET:/classroom/{classroomId}/points
   * @secure
   */
  searchPoints = (
    classroomId: string,
    query: {
      request: ClassroomPointSearchRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/points`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-point-controller
   * @name CreatePoints
   * @request POST:/classroom/{classroomId}/points
   * @secure
   */
  createPoints = (classroomId: string, data: ClassroomPointCreateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/points`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-controller
   * @name SearchChecklists
   * @request GET:/classroom/{classroomId}/checklists
   * @secure
   */
  searchChecklists = (
    classroomId: string,
    query: {
      request: ClassroomChecklistSearchRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklists`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-controller
   * @name CreateChecklists
   * @request POST:/classroom/{classroomId}/checklists
   * @secure
   */
  createChecklists = (classroomId: string, data: ClassroomChecklistCreateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklists`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-search-controller
   * @name SearchContentChecklistSearch
   * @request POST:/classroom/{classroomId}/checklists/search
   * @secure
   */
  searchContentChecklistSearch = (
    classroomId: string,
    query: {
      pageable: Pageable;
    },
    data: ClassroomESSearchRequestDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklists/search`,
      method: 'POST',
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-student-controller
   * @name UpdateUnCheckUncheck
   * @request PATCH:/classroom/{classroomId}/checklist/{checklistId}/uncheck
   * @secure
   */
  updateUnCheckUncheck = (classroomId: string, checklistId: string, data: ClassroomChecklistStudentUpdateCheckDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/uncheck`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-student-controller
   * @name UpdateUnCheckUncheckStudentId
   * @request PATCH:/classroom/{classroomId}/checklist/{checklistId}/uncheck/{studentId}
   * @secure
   */
  updateUnCheckUncheckStudentId = (
    classroomId: string,
    checklistId: string,
    studentId: string,
    data: ClassroomChecklistStudentUpdateCheckDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/uncheck/${studentId}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-student-controller
   * @name UpdateCheckCheck
   * @request PATCH:/classroom/{classroomId}/checklist/{checklistId}/check
   * @secure
   */
  updateCheckCheck = (classroomId: string, checklistId: string, data: ClassroomChecklistStudentUpdateCheckDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/check`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-student-controller
   * @name UpdateCheckCheckStudentId
   * @request PATCH:/classroom/{classroomId}/checklist/{checklistId}/check/{studentId}
   * @secure
   */
  updateCheckCheckStudentId = (
    classroomId: string,
    checklistId: string,
    studentId: string,
    data: ClassroomChecklistStudentUpdateCheckDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/check/${studentId}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-controller
   * @name GetClassroomClassroomId
   * @request GET:/classroom/{classroomId}
   * @secure
   */
  getClassroomClassroomId = (
    classroomId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-controller
   * @name DeleteClassroomClassroomId
   * @request DELETE:/classroom/{classroomId}
   * @secure
   */
  deleteClassroomClassroomId = (
    classroomId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}`,
      method: 'DELETE',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-controller
   * @name UpdateClassroomClassroomId
   * @request PATCH:/classroom/{classroomId}
   * @secure
   */
  updateClassroomClassroomId = (classroomId: string, data: ClassroomUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-controller
   * @name UpdateViewTypesViewtypes
   * @request PATCH:/classroom/{classroomId}/view-types
   * @secure
   */
  updateViewTypesViewtypes = (classroomId: string, data: ClassroomUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/view-types`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-controller
   * @name UsedUsed
   * @request PATCH:/classroom/{classroomId}/used
   * @secure
   */
  usedUsed = (
    classroomId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/used`,
      method: 'PATCH',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-tag-controller
   * @name DeleteTagTagId
   * @request DELETE:/classroom/{classroomId}/tag/{tagId}
   * @secure
   */
  deleteTagTagId = (
    classroomId: string,
    tagId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/tag/${tagId}`,
      method: 'DELETE',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-tag-controller
   * @name UpdateTagTagId
   * @request PATCH:/classroom/{classroomId}/tag/{tagId}
   * @secure
   */
  updateTagTagId = (classroomId: string, tagId: string, data: ClassroomTagUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/tag/${tagId}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name NotLoadClassStudentNotload
   * @request PATCH:/classroom/{classroomId}/students/class-student/not-load
   * @secure
   */
  notLoadClassStudentNotload = (
    classroomId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/students/class-student/not-load`,
      method: 'PATCH',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name LoadClassStudentLoad
   * @request PATCH:/classroom/{classroomId}/students/class-student/load
   * @secure
   */
  loadClassStudentLoad = (
    classroomId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/students/class-student/load`,
      method: 'PATCH',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name GetStudentStudentId
   * @request GET:/classroom/{classroomId}/student/{studentId}
   * @secure
   */
  getStudentStudentId = (
    classroomId: string,
    studentId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/student/${studentId}`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name DeleteStudentStudentId
   * @request DELETE:/classroom/{classroomId}/student/{studentId}
   * @secure
   */
  deleteStudentStudentId = (
    classroomId: string,
    studentId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/student/${studentId}`,
      method: 'DELETE',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name UpdateStudentStudentId
   * @request PATCH:/classroom/{classroomId}/student/{studentId}
   * @secure
   */
  updateStudentStudentId = (classroomId: string, studentId: string, data: ClassroomStudentUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/student/${studentId}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name ShowShow
   * @request PATCH:/classroom/{classroomId}/student/{studentId}/show
   * @secure
   */
  showShow = (
    classroomId: string,
    studentId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/student/${studentId}/show`,
      method: 'PATCH',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name UpdateNoNo
   * @request PATCH:/classroom/{classroomId}/student/{studentId}/no
   * @secure
   */
  updateNoNo = (classroomId: string, studentId: string, data: ClassroomStudentUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/student/${studentId}/no`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name UpdateNameName
   * @request PATCH:/classroom/{classroomId}/student/{studentId}/name
   * @secure
   */
  updateNameName = (classroomId: string, studentId: string, data: ClassroomStudentUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/student/${studentId}/name`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name UpdateNameNoNameandno
   * @request PATCH:/classroom/{classroomId}/student/{studentId}/name-and-no
   * @secure
   */
  updateNameNoNameandno = (classroomId: string, studentId: string, data: ClassroomStudentUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/student/${studentId}/name-and-no`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name UpdateMemoMemo
   * @request PATCH:/classroom/{classroomId}/student/{studentId}/memo
   * @secure
   */
  updateMemoMemo = (classroomId: string, studentId: string, data: ClassroomStudentUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/student/${studentId}/memo`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name HideHide
   * @request PATCH:/classroom/{classroomId}/student/{studentId}/hide
   * @secure
   */
  hideHide = (
    classroomId: string,
    studentId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/student/${studentId}/hide`,
      method: 'PATCH',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name UpdateGenderGender
   * @request PATCH:/classroom/{classroomId}/student/{studentId}/gender
   * @secure
   */
  updateGenderGender = (classroomId: string, studentId: string, data: ClassroomStudentUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/student/${studentId}/gender`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name UpdateCharacterCharacter
   * @request PATCH:/classroom/{classroomId}/student/{studentId}/character
   * @secure
   */
  updateCharacterCharacter = (classroomId: string, studentId: string, data: ClassroomStudentUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/student/${studentId}/character`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-student-controller
   * @name UpdateBirthdayBirthday
   * @request PATCH:/classroom/{classroomId}/student/{studentId}/birthday
   * @secure
   */
  updateBirthdayBirthday = (classroomId: string, studentId: string, data: ClassroomStudentUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/student/${studentId}/birthday`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags seat-plan-controller
   * @name ChangeStudentHiddenHidden
   * @request PATCH:/classroom/{classroomId}/seatPlan/{seatPlanId}/students/hidden
   * @secure
   */
  changeStudentHiddenHidden = (
    classroomId: string,
    seatPlanId: string,
    query: {
      /** @format int32 */
      version: number;
    },
    data: ChangeStudentHiddenRequestDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/seatPlan/${seatPlanId}/students/hidden`,
      method: 'PATCH',
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags seat-plan-controller
   * @name ChangeStudentSeatFixFix
   * @request PATCH:/classroom/{classroomId}/seatPlan/{seatPlanId}/students/fix
   * @secure
   */
  changeStudentSeatFixFix = (
    classroomId: string,
    seatPlanId: string,
    query: {
      /** @format int32 */
      version: number;
    },
    data: ChangeStudentSeatFixRequestDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/seatPlan/${seatPlanId}/students/fix`,
      method: 'PATCH',
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags seat-plan-controller
   * @name SectionRenameRename
   * @request PATCH:/classroom/{classroomId}/seatPlan/{seatPlanId}/section/{sectionId}/rename
   * @secure
   */
  sectionRenameRename = (
    classroomId: string,
    seatPlanId: string,
    sectionId: string,
    query: {
      /** @format int32 */
      version: number;
    },
    data: SeatSectionRenameRequestDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/seatPlan/${seatPlanId}/section/${sectionId}/rename`,
      method: 'PATCH',
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-reward-controller
   * @name ResetReset
   * @request PATCH:/classroom/{classroomId}/rewards/reset
   * @secure
   */
  resetReset = (classroomId: string, data: ClassroomRewardResetDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/rewards/reset`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-reward-controller
   * @name ResetAllAll
   * @request PATCH:/classroom/{classroomId}/rewards/reset/all
   * @secure
   */
  resetAllAll = (classroomId: string, data: ClassroomRewardResetDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/rewards/reset/all`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-reward-controller
   * @name UpdateMemoMemo
   * @request PATCH:/classroom/{classroomId}/reward/{rewardId}/{pointId}/{studentId}/memo
   * @secure
   */
  updateMemoMemo = (
    classroomId: string,
    rewardId: string,
    pointId: string,
    studentId: string,
    data: ClassroomRewardMemoDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/reward/${rewardId}/${pointId}/${studentId}/memo`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name BulkBulk
   * @request PATCH:/classroom/{classroomId}/records/bulk
   * @secure
   */
  bulkBulk = (classroomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/records/bulk`,
      method: 'PATCH',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name GetRecordRecordRecordId
   * @request GET:/classroom/{classroomId}/record/{recordId}
   * @secure
   */
  getRecordRecordRecordId = (
    classroomId: string,
    recordId: string,
    query?: {
      /** @default false */
      isIncludeTargets?: boolean;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name DeleteRecordRecordRecordId
   * @request DELETE:/classroom/{classroomId}/record/{recordId}
   * @secure
   */
  deleteRecordRecordRecordId = (classroomId: string, recordId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}`,
      method: 'DELETE',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name UpdateRecordRecordRecordId
   * @request PATCH:/classroom/{classroomId}/record/{recordId}
   * @secure
   */
  updateRecordRecordRecordId = (classroomId: string, recordId: string, data: ClassroomRecordSaveDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name UpdateRecordStyleStyle
   * @request PATCH:/classroom/{classroomId}/record/{recordId}/style
   * @secure
   */
  updateRecordStyleStyle = (classroomId: string, recordId: string, data: ClassroomRecordStyleSaveDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/style`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-stt-controller
   * @name UpdateRecordStTsStts
   * @request PATCH:/classroom/{classroomId}/record/{recordId}/stts
   * @secure
   */
  updateRecordStTsStts = (classroomId: string, recordId: string, data: ClassroomRecordSTTsSaveDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/stts`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-stt-controller
   * @name UpdateRecordSttSttSttId
   * @request PATCH:/classroom/{classroomId}/record/{recordId}/stt/{sttId}
   * @secure
   */
  updateRecordSttSttSttId = (classroomId: string, recordId: string, sttId: string, data: ClassroomRecordSTTSaveDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/stt/${sttId}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name DeleteRecordDescriptionDescription
   * @request DELETE:/classroom/{classroomId}/record/{recordId}/description
   * @secure
   */
  deleteRecordDescriptionDescription = (classroomId: string, recordId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/description`,
      method: 'DELETE',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name UpdateRecordDescriptionDescription
   * @request PATCH:/classroom/{classroomId}/record/{recordId}/description
   * @secure
   */
  updateRecordDescriptionDescription = (classroomId: string, recordId: string, data: ClassroomRecordContentSaveDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/description`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-bookmark-controller
   * @name DeleteRecordBookmarkBookmarkBookmarkId
   * @request DELETE:/classroom/{classroomId}/record/{recordId}/bookmark/{bookmarkId}
   * @secure
   */
  deleteRecordBookmarkBookmarkBookmarkId = (classroomId: string, recordId: string, bookmarkId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/bookmark/${bookmarkId}`,
      method: 'DELETE',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-bookmark-controller
   * @name UpdateRecordBookmarkBookmarkBookmarkId
   * @request PATCH:/classroom/{classroomId}/record/{recordId}/bookmark/{bookmarkId}
   * @secure
   */
  updateRecordBookmarkBookmarkBookmarkId = (
    classroomId: string,
    recordId: string,
    bookmarkId: string,
    data: ClassroomRecordBookmarkSaveDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/bookmark/${bookmarkId}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-bookmark-controller
   * @name UpdateRecordBookmarkMemoMemo
   * @request PATCH:/classroom/{classroomId}/record/{recordId}/bookmark/{bookmarkId}/memo
   * @secure
   */
  updateRecordBookmarkMemoMemo = (
    classroomId: string,
    recordId: string,
    bookmarkId: string,
    data: ClassroomRecordBookmarkMemoSaveDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/bookmark/${bookmarkId}/memo`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-point-controller
   * @name GetPointPointId
   * @request GET:/classroom/{classroomId}/point/{pointId}
   * @secure
   */
  getPointPointId = (
    classroomId: string,
    pointId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/point/${pointId}`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-point-controller
   * @name DeletePointPointId
   * @request DELETE:/classroom/{classroomId}/point/{pointId}
   * @secure
   */
  deletePointPointId = (
    classroomId: string,
    pointId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/point/${pointId}`,
      method: 'DELETE',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-point-controller
   * @name UpdatePointPointId
   * @request PATCH:/classroom/{classroomId}/point/{pointId}
   * @secure
   */
  updatePointPointId = (classroomId: string, pointId: string, data: ClassroomPointUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/point/${pointId}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-point-controller
   * @name SortingSorting
   * @request PATCH:/classroom/{classroomId}/point/sorting
   * @secure
   */
  sortingSorting = (classroomId: string, data: ClassroomPointSortDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/point/sorting`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-controller
   * @name NotUsedNotused
   * @request PATCH:/classroom/{classroomId}/not-used
   * @secure
   */
  notUsedNotused = (
    classroomId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/not-used`,
      method: 'PATCH',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-controller
   * @name UpdateNameName
   * @request PATCH:/classroom/{classroomId}/name
   * @secure
   */
  updateNameName = (classroomId: string, data: ClassroomUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/name`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-group-controller
   * @name GetGroupGroupId
   * @request GET:/classroom/{classroomId}/group/{groupId}
   * @secure
   */
  getGroupGroupId = (
    classroomId: string,
    groupId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/group/${groupId}`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-group-controller
   * @name DeleteGroupGroupId
   * @request DELETE:/classroom/{classroomId}/group/{groupId}
   * @secure
   */
  deleteGroupGroupId = (
    classroomId: string,
    groupId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/group/${groupId}`,
      method: 'DELETE',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-group-controller
   * @name UpdateGroupGroupId
   * @request PATCH:/classroom/{classroomId}/group/{groupId}
   * @secure
   */
  updateGroupGroupId = (classroomId: string, groupId: string, data: ClassroomGroupSaveDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/group/${groupId}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-group-controller
   * @name UpdateStudentsStudents
   * @request PATCH:/classroom/{classroomId}/group/{groupId}/students
   * @secure
   */
  updateStudentsStudents = (classroomId: string, groupId: string, data: ClassroomGroupSaveDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/group/${groupId}/students`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-group-controller
   * @name ShowShow
   * @request PATCH:/classroom/{classroomId}/group/{groupId}/show
   * @secure
   */
  showShow = (
    classroomId: string,
    groupId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/group/${groupId}/show`,
      method: 'PATCH',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-group-controller
   * @name UpdateNameName
   * @request PATCH:/classroom/{classroomId}/group/{groupId}/name
   * @secure
   */
  updateNameName = (classroomId: string, groupId: string, data: ClassroomGroupSaveDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/group/${groupId}/name`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-group-controller
   * @name HideHide
   * @request PATCH:/classroom/{classroomId}/group/{groupId}/hide
   * @secure
   */
  hideHide = (
    classroomId: string,
    groupId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/group/${groupId}/hide`,
      method: 'PATCH',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-controller
   * @name BulkBulk
   * @request PATCH:/classroom/{classroomId}/checklists/bulk
   * @secure
   */
  bulkBulk = (classroomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklists/bulk`,
      method: 'PATCH',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-controller
   * @name GetChecklistChecklistId
   * @request GET:/classroom/{classroomId}/checklist/{checklistId}
   * @secure
   */
  getChecklistChecklistId = (
    classroomId: string,
    checklistId: string,
    query: {
      /** @format uuid */
      userId: string;
      isIncludeStudents: boolean;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-controller
   * @name DeleteChecklistChecklistId
   * @request DELETE:/classroom/{classroomId}/checklist/{checklistId}
   * @secure
   */
  deleteChecklistChecklistId = (
    classroomId: string,
    checklistId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}`,
      method: 'DELETE',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-controller
   * @name UpdateChecklistChecklistId
   * @request PATCH:/classroom/{classroomId}/checklist/{checklistId}
   * @secure
   */
  updateChecklistChecklistId = (classroomId: string, checklistId: string, data: ClassroomChecklistUpdateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-controller
   * @name UnpinUnpin
   * @request PATCH:/classroom/{classroomId}/checklist/{checklistId}/unpin
   * @secure
   */
  unpinUnpin = (
    classroomId: string,
    checklistId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/unpin`,
      method: 'PATCH',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-controller
   * @name UpdateTitleTitle
   * @request PATCH:/classroom/{classroomId}/checklist/{checklistId}/title
   * @secure
   */
  updateTitleTitle = (classroomId: string, checklistId: string, data: ClassroomChecklistUpdateTitleDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/title`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-student-controller
   * @name ResetMemoMemo
   * @request PATCH:/classroom/{classroomId}/checklist/{checklistId}/reset/memo
   * @secure
   */
  resetMemoMemo = (
    classroomId: string,
    checklistId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/reset/memo`,
      method: 'PATCH',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-student-controller
   * @name ResetAllAll
   * @request PATCH:/classroom/{classroomId}/checklist/{checklistId}/reset/all
   * @secure
   */
  resetAllAll = (
    classroomId: string,
    checklistId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/reset/all`,
      method: 'PATCH',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-controller
   * @name PinPin
   * @request PATCH:/classroom/{classroomId}/checklist/{checklistId}/pin
   * @secure
   */
  pinPin = (
    classroomId: string,
    checklistId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/pin`,
      method: 'PATCH',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-student-controller
   * @name UpdateMemoMemoStudentId
   * @request PATCH:/classroom/{classroomId}/checklist/{checklistId}/memo/{studentId}
   * @secure
   */
  updateMemoMemoStudentId = (
    classroomId: string,
    checklistId: string,
    studentId: string,
    data: ClassroomChecklistStudentUpdateMemoDto,
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/memo/${studentId}`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-controller
   * @name UpdateItemsItems
   * @request PATCH:/classroom/{classroomId}/checklist/{checklistId}/items
   * @secure
   */
  updateItemsItems = (classroomId: string, checklistId: string, data: ClassroomChecklistUpdateItemDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/items`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-controller
   * @name InProgressInprogress
   * @request PATCH:/classroom/{classroomId}/checklist/{checklistId}/in-progress
   * @secure
   */
  inProgressInprogress = (
    classroomId: string,
    checklistId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/in-progress`,
      method: 'PATCH',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-controller
   * @name UpdateDateDate
   * @request PATCH:/classroom/{classroomId}/checklist/{checklistId}/date
   * @secure
   */
  updateDateDate = (classroomId: string, checklistId: string, data: ClassroomChecklistUpdateDateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/date`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-controller
   * @name CompleteComplete
   * @request PATCH:/classroom/{classroomId}/checklist/{checklistId}/complete
   * @secure
   */
  completeComplete = (
    classroomId: string,
    checklistId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/complete`,
      method: 'PATCH',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags seat-plan-controller
   * @name GetSectionsSections
   * @request GET:/classroom/{classroomId}/seatPlan/{seatPlanId}/sections
   * @secure
   */
  getSectionsSections = (
    classroomId: string,
    seatPlanId: string,
    query: {
      /** @format int32 */
      version: number;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/seatPlan/${seatPlanId}/sections`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-reward-controller
   * @name GetPointIdStudentId
   * @request GET:/classroom/{classroomId}/reward/{rewardId}/{pointId}/{studentId}
   * @secure
   */
  getPointIdStudentId = (
    classroomId: string,
    rewardId: string,
    pointId: string,
    studentId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/reward/${rewardId}/${pointId}/${studentId}`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-report-controller
   * @name TotalRecordsPerStudentStudents
   * @request GET:/classroom/{classroomId}/report/record/total/students
   * @secure
   */
  totalRecordsPerStudentStudents = (
    classroomId: string,
    query: {
      request: ClassroomRecordReportStudentTotalRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/report/record/total/students`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-point-report-controller
   * @name TotalTotal
   * @request GET:/classroom/{classroomId}/report/point/total
   * @secure
   */
  totalTotal = (
    classroomId: string,
    query: {
      request: ClassroomPointReportTotalRequestDto;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/report/point/total`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-point-report-controller
   * @name TotalPointsPerStudentStudents
   * @request GET:/classroom/{classroomId}/report/point/total/students
   * @secure
   */
  totalPointsPerStudentStudents = (
    classroomId: string,
    query: {
      request: ClassroomPointReportStudentTotalRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/report/point/total/students`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-point-report-controller
   * @name TotalPointsPerPointPoints
   * @request GET:/classroom/{classroomId}/report/point/total/points
   * @secure
   */
  totalPointsPerPointPoints = (
    classroomId: string,
    query: {
      request: ClassroomPointReportPointTotalRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/report/point/total/points`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-point-report-controller
   * @name RewardsRewards
   * @request GET:/classroom/{classroomId}/report/point/rewards
   * @secure
   */
  rewardsRewards = (
    classroomId: string,
    query: {
      request: ClassroomPointReportRewardRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/report/point/rewards`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-point-report-controller
   * @name StudentRewardsStudentStudentId
   * @request GET:/classroom/{classroomId}/report/point/reward/student/{studentId}
   * @secure
   */
  studentRewardsStudentStudentId = (
    classroomId: string,
    studentId: string,
    query: {
      request: ClassroomPointReportRewardRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/report/point/reward/student/${studentId}`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name SearchRecords
   * @request GET:/classroom/{classroomId}/records
   * @secure
   */
  searchRecords = (
    classroomId: string,
    query: {
      request: ClassroomRecordSearchRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/records`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name GetRecordSummarySummary
   * @request GET:/classroom/{classroomId}/records/summary
   * @secure
   */
  getRecordSummarySummary = (classroomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/records/summary`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-stt-controller
   * @name GetRecordSttStt
   * @request GET:/classroom/{classroomId}/record/{recordId}/stt
   * @secure
   */
  getRecordSttStt = (classroomId: string, recordId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/stt`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-stt-controller
   * @name GetRecordSttStatusStatus
   * @request GET:/classroom/{classroomId}/record/{recordId}/stt/status
   * @secure
   */
  getRecordSttStatusStatus = (classroomId: string, recordId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/stt/status`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-member-controller
   * @name SearchMembers
   * @request GET:/classroom/{classroomId}/members
   * @secure
   */
  searchMembers = (
    classroomId: string,
    query: {
      request: ClassroomMemberSearchRequestDto;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/members`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-checklist-student-controller
   * @name GetExcludeStudentsExcludestudents
   * @request GET:/classroom/{classroomId}/checklist/{checklistId}/exclude-students
   * @secure
   */
  getExcludeStudentsExcludestudents = (
    classroomId: string,
    checklistId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/checklist/${checklistId}/exclude-students`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-reward-controller
   * @name ClearStudentStudentStudentId
   * @request DELETE:/classroom/{classroomId}/rewards/student/{studentId}
   * @secure
   */
  clearStudentStudentStudentId = (
    classroomId: string,
    studentId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/rewards/student/${studentId}`,
      method: 'DELETE',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-reward-controller
   * @name ClearAll
   * @request DELETE:/classroom/{classroomId}/rewards/all
   * @secure
   */
  clearAll = (
    classroomId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/rewards/all`,
      method: 'DELETE',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-record-controller
   * @name DeleteRecordFileFileFileId
   * @request DELETE:/classroom/{classroomId}/record/{recordId}/file/{fileId}
   * @secure
   */
  deleteRecordFileFileFileId = (classroomId: string, recordId: string, fileId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classroom/${classroomId}/record/${recordId}/file/${fileId}`,
      method: 'DELETE',
      secure: true,
      format: 'json',
      ...params,
    });
}
