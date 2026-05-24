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
  AccountInfoDto,
  AdminOfferwallBannerCreateDto,
  AdminOfferwallBannerUpdateDto,
  AdminOfferwallGroupBannersUpdateRequestDto,
  AdminOfferwallGroupUpdateRequestDto,
  AdminOfferwallSequenceUpdateRequestDto,
  ChangePasswordDto,
  ChatMessageDto,
  ClassroomBulkRewardRequestDto,
  ClassroomPointReportRewardRequestDto,
  ClassroomRewardDeleteRequestDto,
  ClassroomRewardMemoDto,
  ClazzPostTopRequest,
  ExcelStudent,
  File,
  HiTalkBatchRequestDto,
  HiTalkLimitTimestampUpdateDto,
  HiTalkRoomNameUpdateDto,
  Pageable,
  PostHomeworkUserRequestDto,
  PostReadUserSearchRequestDto,
  PostRequestDto,
  PostTranslateRequest,
  Student,
  TempStudentDto,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class V2<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name PutItemResourceChatRoom
   * @request PUT:/v2/chat/{room}
   * @secure
   */
  putItemResourceChatRoom = (
    room: string,
    data: ChatMessageDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/chat/${room}`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags student-controller
   * @name SaveStudentDirectlyStudents
   * @request POST:/v2/students
   * @deprecated
   * @secure
   */
  saveStudentDirectlyStudents = (data: Student, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/v2/students`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags student-controller
   * @name PatchVStudentStudents
   * @request PATCH:/v2/students
   * @deprecated
   * @secure
   */
  patchVStudentStudents = (data: Student, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/students`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags student-controller
   * @name SaveTempStudentsWhoPassedValidationTemp
   * @request POST:/v2/students/temp
   * @deprecated
   * @secure
   */
  saveTempStudentsWhoPassedValidationTemp = (
    data: TempStudentDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/students/temp`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags student-controller
   * @name ScanBeforePatchPasswordPassword
   * @request POST:/v2/students/password
   * @deprecated
   * @secure
   */
  scanBeforePatchPasswordPassword = (
    data: ChangePasswordDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/students/password`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags student-controller
   * @name PatchNewPasswordPassword
   * @request PATCH:/v2/students/password
   * @deprecated
   * @secure
   */
  patchNewPasswordPassword = (
    data: ChangePasswordDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/students/password`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags student-controller
   * @name CheckNewPasswordValidation
   * @request POST:/v2/students/newPassword/validation
   * @deprecated
   * @secure
   */
  checkNewPasswordValidation = (
    data: AccountInfoDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/students/newPassword/validation`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags student-controller
   * @name CheckCurrentPasswordMatching
   * @request POST:/v2/students/insertedCurrentPassword/matching
   * @deprecated
   * @secure
   */
  checkCurrentPasswordMatching = (
    data: Record<string, string>,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/students/insertedCurrentPassword/matching`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags post-homework-user-search-controller
   * @name SearchPostHomeworkUsers
   * @request POST:/v2/postHomeworkUsers/!q
   * @secure
   */
  searchPostHomeworkUsers = (
    query: {
      requestDto: PostHomeworkUserRequestDto;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/postHomeworkUsers/!q`,
      method: "POST",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-offerwall-group-controller
   * @name CreateBanners
   * @request POST:/v2/offerwall/banners
   * @secure
   */
  createBanners = (
    data: AdminOfferwallBannerCreateDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/offerwall/banners`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name CreateBatchBatch
   * @request POST:/v2/hitalks/batch
   * @secure
   */
  createBatchBatch = (
    data: HiTalkBatchRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/hitalks/batch`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags excel-controller
   * @name OneTempStudentUploadTempStudent
   * @request POST:/v2/excels/tempStudent
   * @secure
   */
  oneTempStudentUploadTempStudent = (
    data: ExcelStudent,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/v2/excels/tempStudent`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags excel-controller
   * @name TempStudentUploadTempStudents
   * @request POST:/v2/excels/tempStudents
   * @secure
   */
  tempStudentUploadTempStudents = (
    data: {
      /** @format binary */
      file: File;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/v2/excels/tempStudents`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-reward-controller
   * @name BulkRewardsRewards
   * @request POST:/v2/classroom/{classroomId}/rewards
   * @secure
   */
  bulkRewardsRewards = (
    classroomId: string,
    data: ClassroomBulkRewardRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/classroom/${classroomId}/rewards`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-reward-controller
   * @name DeleteVRewards
   * @request DELETE:/v2/classroom/{classroomId}/rewards
   * @secure
   */
  deleteVRewards = (
    classroomId: string,
    data: ClassroomRewardDeleteRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/classroom/${classroomId}/rewards`,
      method: "DELETE",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name PostCollectionResourceChat
   * @request POST:/v2/chat
   * @secure
   */
  postCollectionResourceChat = (
    data: ChatMessageDto,
    query?: {
      memberType?: string;
      roomType?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/chat`,
      method: "POST",
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name SetWebTokenChatWebTokenUserId
   * @request POST:/v2/chatWebToken/{userId}
   * @secure
   */
  setWebTokenChatWebTokenUserId = (
    userId: string,
    query?: {
      token?: string;
      info?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/chatWebToken/${userId}`,
      method: "POST",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name DelWebTokenChatWebTokenUserId
   * @request DELETE:/v2/chatWebToken/{userId}
   * @secure
   */
  delWebTokenChatWebTokenUserId = (
    userId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/chatWebToken/${userId}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name UpdateGroupRoomNameRoomName
   * @request PATCH:/v2/hitalks/{roomId}/roomName
   * @secure
   */
  updateGroupRoomNameRoomName = (
    roomId: string,
    data: HiTalkRoomNameUpdateDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/hitalks/${roomId}/roomName`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name UpdateGroupRoomNameRoomName
   * @request PATCH:/v2/hiTalks/{roomId}/roomName
   * @secure
   */
  updateGroupRoomNameRoomName = (
    roomId: string,
    data: HiTalkRoomNameUpdateDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/hiTalks/${roomId}/roomName`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name UpdateGroupRoomLimitTimestampLimit
   * @request PATCH:/v2/hitalks/{roomId}/room/groups/limit
   * @secure
   */
  updateGroupRoomLimitTimestampLimit = (
    roomId: string,
    data: HiTalkLimitTimestampUpdateDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/hitalks/${roomId}/room/groups/limit`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name UpdateGroupRoomLimitTimestampLimit
   * @request PATCH:/v2/hiTalks/{roomId}/room/groups/limit
   * @secure
   */
  updateGroupRoomLimitTimestampLimit = (
    roomId: string,
    data: HiTalkLimitTimestampUpdateDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/hiTalks/${roomId}/room/groups/limit`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name DeleteChatRoomPinPin
   * @request DELETE:/v2/hitalks/{roomId}/pin
   * @secure
   */
  deleteChatRoomPinPin = (roomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/hitalks/${roomId}/pin`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name UpdateChatRoomPinPin
   * @request PATCH:/v2/hitalks/{roomId}/pin
   * @secure
   */
  updateChatRoomPinPin = (roomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/hitalks/${roomId}/pin`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name DeleteChatRoomPinPin
   * @request DELETE:/v2/hiTalks/{roomId}/pin
   * @secure
   */
  deleteChatRoomPinPin = (roomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/hiTalks/${roomId}/pin`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name UpdateChatRoomPinPin
   * @request PATCH:/v2/hiTalks/{roomId}/pin
   * @secure
   */
  updateChatRoomPinPin = (roomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/hiTalks/${roomId}/pin`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-offerwall-group-controller
   * @name GetBannersBannerId
   * @request GET:/v2/offerwall/banners/{bannerId}
   * @secure
   */
  getBannersBannerId = (bannerId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/offerwall/banners/${bannerId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-offerwall-group-controller
   * @name UpdateBannersBannerId
   * @request PATCH:/v2/offerwall/banners/{bannerId}
   * @secure
   */
  updateBannersBannerId = (
    bannerId: string,
    data: AdminOfferwallBannerUpdateDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/offerwall/banners/${bannerId}`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-reward-controller
   * @name UpdateMemoVMemo
   * @request PATCH:/v2/classroom/{classroomId}/reward/{rewardId}/{pointId}/{sortNo}/{studentId}/memo
   * @secure
   */
  updateMemoVMemo = (
    classroomId: string,
    rewardId: string,
    pointId: string,
    sortNo: number,
    studentId: string,
    data: ClassroomRewardMemoDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/classroom/${classroomId}/reward/${rewardId}/${pointId}/${sortNo}/${studentId}/memo`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-offerwall-group-controller
   * @name UpdateGroupsGroups
   * @request PATCH:/v2/admin/offerwall/groups
   * @secure
   */
  updateGroupsGroups = (
    data: AdminOfferwallGroupUpdateRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/admin/offerwall/groups`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-offerwall-group-controller
   * @name UpdateOfferwallGroupBannersBanners
   * @request PATCH:/v2/admin/offerwall/groups/{groupId}/banners
   * @secure
   */
  updateOfferwallGroupBannersBanners = (
    groupId: string,
    data: AdminOfferwallGroupBannersUpdateRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/admin/offerwall/groups/${groupId}/banners`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-offerwall-group-controller
   * @name SearchSequenceSequences
   * @request GET:/v2/admin/offerwall/groups/sequences
   * @secure
   */
  searchSequenceSequences = (params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/admin/offerwall/groups/sequences`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-offerwall-group-controller
   * @name UpdateSequenceSequences
   * @request PATCH:/v2/admin/offerwall/groups/sequences
   * @secure
   */
  updateSequenceSequences = (
    data: AdminOfferwallSequenceUpdateRequestDto[],
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/admin/offerwall/groups/sequences`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-offerwall-group-controller
   * @name ChangeSequenceChange
   * @request PATCH:/v2/admin/offerwall/groups/sequences/change
   * @secure
   */
  changeSequenceChange = (
    data: AdminOfferwallSequenceUpdateRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/admin/offerwall/groups/sequences/change`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name GetRoomRoom
   * @request GET:/v2/hitalks/{roomId}/room
   * @secure
   */
  getRoomRoom = (roomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/hitalks/${roomId}/room`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name GetRoomRoom
   * @request GET:/v2/hiTalks/{roomId}/room
   * @secure
   */
  getRoomRoom = (roomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/hiTalks/${roomId}/room`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name GetMembersMembers
   * @request GET:/v2/hitalks/{roomId}/members
   * @secure
   */
  getMembersMembers = (roomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/hitalks/${roomId}/members`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name GetMembersMembers
   * @request GET:/v2/hiTalks/{roomId}/members
   * @secure
   */
  getMembersMembers = (roomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/hiTalks/${roomId}/members`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name DownloadChatMessageDownload
   * @request GET:/v2/hitalks/{roomId}/download
   * @secure
   */
  downloadChatMessageDownload = (
    roomId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/v2/hitalks/${roomId}/download`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name DownloadChatMessageDownload
   * @request GET:/v2/hiTalks/{roomId}/download
   * @secure
   */
  downloadChatMessageDownload = (
    roomId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/v2/hiTalks/${roomId}/download`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags post-content-controller
   * @name GePostContentVPostIdContentType
   * @request GET:/v2/posts/{postId}/{contentType}
   * @secure
   */
  gePostContentVPostIdContentType = (
    postId: string,
    contentType: "education" | "html" | "content" | "nohtml",
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/posts/${postId}/${contentType}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags post-content-controller
   * @name GetEventVEvent
   * @request GET:/v2/posts/{postId}/event
   * @secure
   */
  getEventVEvent = (postId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/v2/posts/${postId}/event`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags post-content-controller
   * @name GetTranslatedPostContentVPostIdContentType
   * @request GET:/v2/postTranslates/{postId}/{contentType}
   * @secure
   */
  getTranslatedPostContentVPostIdContentType = (
    postId: string,
    contentType: "education" | "html" | "content" | "nohtml",
    query: {
      postTranslateRequest: PostTranslateRequest;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/postTranslates/${postId}/${contentType}`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags notification-user-setting-controller
   * @name GetSettingsByClassIdClazzesClassId
   * @request GET:/v2/notificationUserSettings/clazzes/{classId}
   * @secure
   */
  getSettingsByClassIdClazzesClassId = (
    classId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/notificationUserSettings/clazzes/${classId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-post-controller
   * @name SearchClassFileVClassIdMode
   * @request GET:/v2/clazzes/{classId}/{mode}
   * @secure
   */
  searchClassFileVClassIdMode = (
    classId: string,
    mode: string,
    query: {
      requestDto: PostRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/clazzes/${classId}/${mode}`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-post-controller
   * @name SearchClassPostVPost
   * @request GET:/v2/clazzes/{classId}/post
   * @secure
   */
  searchClassPostVPost = (
    classId: string,
    query: {
      requestDto: PostRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/v2/clazzes/${classId}/post`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-post-top-controller
   * @name GetClazzPostTopVTop
   * @request GET:/v2/clazzes/{classId}/post/{postType}/top
   * @secure
   */
  getClazzPostTopVTop = (
    classId: string,
    postType: string,
    query: {
      request: ClazzPostTopRequest;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/v2/clazzes/${classId}/post/${postType}/top`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-reward-controller
   * @name GetVStudentIdSortNo
   * @request GET:/v2/classroom/{classroomId}/reward/{rewardId}/{pointId}/{studentId}/{sortNo}
   * @secure
   */
  getVStudentIdSortNo = (
    classroomId: string,
    rewardId: string,
    pointId: string,
    studentId: string,
    sortNo: number,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/classroom/${classroomId}/reward/${rewardId}/${pointId}/${studentId}/${sortNo}`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-point-report-controller
   * @name RewardsVRewards
   * @request GET:/v2/classroom/{classroomId}/report/point/rewards
   * @secure
   */
  rewardsVRewards = (
    classroomId: string,
    query: {
      request: ClassroomPointReportRewardRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/classroom/${classroomId}/report/point/rewards`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-point-report-controller
   * @name StudentRewardsVStudentStudentId
   * @request GET:/v2/classroom/{classroomId}/report/point/reward/student/{studentId}
   * @secure
   */
  studentRewardsVStudentStudentId = (
    classroomId: string,
    studentId: string,
    query: {
      request: ClassroomPointReportRewardRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/classroom/${classroomId}/report/point/reward/student/${studentId}`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name GetChatUserChatUsers
   * @request GET:/v2/chatUsers
   * @secure
   */
  getChatUserChatUsers = (
    query: {
      /** @format uuid */
      userId: string;
      keyword?: string;
      /** @format uuid */
      classId?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/chatUsers`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name ChatUserMessageCountChatUserMsgCntUserId
   * @request GET:/v2/chatUserMsgCnt/{userId}
   * @secure
   */
  chatUserMessageCountChatUserMsgCntUserId = (
    userId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/chatUserMsgCnt/${userId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name GetUserIsChatChatUserInfoUserId
   * @request GET:/v2/chatUserInfo/{userId}
   * @secure
   */
  getUserIsChatChatUserInfoUserId = (
    userId: string,
    query?: {
      /** @format uuid */
      classId?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/chatUserInfo/${userId}`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name GetChatRoomsChatRooms
   * @request GET:/v2/chatRooms
   * @secure
   */
  getChatRoomsChatRooms = (
    query: {
      /** @format uuid */
      userId: string;
      /** @format uuid */
      classId?: string;
      /** @format uuid */
      roomId?: string;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/chatRooms`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name GetChatMessageIsNewMessageIdUpdatedTimestamp
   * @request GET:/v2/chatMessages/{room}/{messageId}/{updatedTimestamp}
   * @secure
   */
  getChatMessageIsNewMessageIdUpdatedTimestamp = (
    room: string,
    messageId: string,
    updatedTimestamp: number,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/chatMessages/${room}/${messageId}/${updatedTimestamp}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name GetRoomMessagesChatMessagesRoomId
   * @request GET:/v2/chatMessages/{roomId}
   * @secure
   */
  getRoomMessagesChatMessagesRoomId = (
    roomId: string,
    query: {
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/chatMessages/${roomId}`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-controller
   * @name GetChatMessageMessage
   * @request GET:/v2/chatMessages/{messageId}/message
   * @secure
   */
  getChatMessageMessage = (
    messageId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/chatMessages/${messageId}/message`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags benefit-controller
   * @name GetOfferwallVOfferwalls
   * @request GET:/v2/benefits/{deviceType}/offerwalls
   * @secure
   */
  getOfferwallVOfferwalls = (
    deviceType: "APP" | "AOS" | "IOS",
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/benefits/${deviceType}/offerwalls`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags benefit-controller
   * @name GetOfferwallVByGroupOfferwallsGroupId
   * @request GET:/v2/benefits/{deviceType}/offerwalls/{groupId}
   * @secure
   */
  getOfferwallVByGroupOfferwallsGroupId = (
    deviceType: "APP" | "AOS" | "IOS",
    groupId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/benefits/${deviceType}/offerwalls/${groupId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags benefit-controller
   * @name GetOfferwallTitleVTitle
   * @request GET:/v2/benefits/offerwalls/title
   * @secure
   */
  getOfferwallTitleVTitle = (params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/benefits/offerwalls/title`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-offerwall-group-controller
   * @name SearchGroupsGroupsOfferwallType
   * @request GET:/v2/admin/offerwall/groups/{offerwallType}
   * @secure
   */
  searchGroupsGroupsOfferwallType = (
    offerwallType: "A" | "B",
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/admin/offerwall/groups/${offerwallType}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-offerwall-group-controller
   * @name SearchBannersBanners
   * @request GET:/v2/admin/offerwall/groups/banners
   * @secure
   */
  searchBannersBanners = (params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/v2/admin/offerwall/groups/banners`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
