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
  ClazzBoardManageRequestDto,
  ClazzBoardMenuRequestDto,
  ClazzConsentRequestDto,
  ClazzConsentSaveDto,
  ClazzInviteUserCountRequestDto,
  ClazzInviteUserSendDto,
  ClazzInviteUserSendSmsDto,
  ClazzMemberNumberDto,
  ClazzMemberRequestDto,
  ClazzMemberTagBatchDto,
  ClazzMemberTagDto,
  ClazzPostManageDeleteRequestDto,
  ClazzPostManagePatchRequestDto,
  ClazzPostManageSearchRequestDto,
  ClazzProfileImageDto,
  ClazzReportDto,
  ClazzRequestBody,
  ClazzRequestDto,
  ClazzTagDto,
  ClazzTagReorderDto,
  ClazzUncheckPostRequest,
  ClazzUpdateRequestDto,
  ClazzUpdateSchoolDto,
  CollectionModelEntityModelObject,
  EntityModelClazz,
  Pageable,
  PostReadUserSearchRequestDto,
  UserImageDto,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Clazzes<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description create-clazz
   *
   * @tags clazz-entity-controller
   * @name PostCollectionResourceClazzPostClazzes
   * @request POST:/clazzes
   * @secure
   */
  postCollectionResourceClazzPostClazzes = (
    data: ClazzRequestBody,
    params: RequestParams = {},
  ) =>
    this.request<EntityModelClazz, any>({
      path: `/clazzes`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description update-clazz
   *
   * @tags clazz-entity-controller
   * @name PutItemResourceClazzPutClazzesId
   * @request PUT:/clazzes/{id}
   * @secure
   */
  putItemResourceClazzPutClazzesId = (
    id: string,
    data: ClazzRequestBody,
    params: RequestParams = {},
  ) =>
    this.request<EntityModelClazz, any>({
      path: `/clazzes/${id}`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description delete-clazz
   *
   * @tags clazz-entity-controller
   * @name DeleteItemResourceClazzDeleteClazzesId
   * @request DELETE:/clazzes/{id}
   * @secure
   */
  deleteItemResourceClazzDeleteClazzesId = (
    id: string,
    params: RequestParams = {},
  ) =>
    this.request<void, void>({
      path: `/clazzes/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * @description patch-clazz
   *
   * @tags clazz-entity-controller
   * @name PatchItemResourceClazzPatchClazzesId
   * @request PATCH:/clazzes/{id}
   * @secure
   */
  patchItemResourceClazzPatchClazzesId = (
    id: string,
    data: ClazzRequestBody,
    params: RequestParams = {},
  ) =>
    this.request<EntityModelClazz, any>({
      path: `/clazzes/${id}`,
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
   * @tags clazz-controller
   * @name GetReportReports
   * @request GET:/clazzes/reports
   * @secure
   */
  getReportReports = (
    query: {
      /** @format uri */
      _clazz: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<ClazzReportDto, PostReadUserSearchRequestDto>({
      path: `/clazzes/reports`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-controller
   * @name GetReportReports
   * @request POST:/clazzes/reports
   * @secure
   */
  getReportReports = (
    query: {
      /** @format uri */
      _clazz: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<ClazzReportDto, PostReadUserSearchRequestDto>({
      path: `/clazzes/reports`,
      method: "POST",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-tag-controller
   * @name GetClazzTagsAllTags
   * @request GET:/clazzes/{classId}/tags
   * @secure
   */
  getClazzTagsAllTags = (
    classId: string,
    query?: {
      isUsedClazzStudents?: boolean;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/tags`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-tag-controller
   * @name AddClazzTagTags
   * @request POST:/clazzes/{classId}/tags
   * @secure
   */
  addClazzTagTags = (
    classId: string,
    data: ClazzTagDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/tags`,
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
   * @tags clazz-member-controller
   * @name AddClazzMemberTagTag
   * @request POST:/clazzes/{classId}/members/{memberId}/tag
   * @secure
   */
  addClazzMemberTagTag = (
    classId: string,
    memberId: string,
    data: ClazzMemberTagDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/members/${memberId}/tag`,
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
   * @tags clazz-member-controller
   * @name DeleteClazzMemberTagTag
   * @request DELETE:/clazzes/{classId}/members/{memberId}/tag
   * @secure
   */
  deleteClazzMemberTagTag = (
    classId: string,
    memberId: string,
    data: ClazzMemberTagDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/members/${memberId}/tag`,
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
   * @tags clazz-member-controller
   * @name ReplaceClazzMemberTagAllReplace
   * @request POST:/clazzes/{classId}/members/tag/replace
   * @secure
   */
  replaceClazzMemberTagAllReplace = (
    classId: string,
    data: ClazzMemberTagBatchDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/members/tag/replace`,
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
   * @tags clazz-member-controller
   * @name UpdateClazzMemberTagAllAdd
   * @request POST:/clazzes/{classId}/members/tag/add
   * @secure
   */
  updateClazzMemberTagAllAdd = (
    classId: string,
    data: ClazzMemberTagBatchDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/members/tag/add`,
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
   * @tags clazz-member-controller
   * @name DeleteClazzMembersRemove
   * @request POST:/clazzes/{classId}/members/remove
   * @secure
   */
  deleteClazzMembersRemove = (
    classId: string,
    data: ClazzMemberRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/members/remove`,
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
   * @tags clazz-invite-user-controller
   * @name SendInvitecards
   * @request POST:/clazzes/{classId}/invite-cards
   * @secure
   */
  sendInvitecards = (
    classId: string,
    data: ClazzInviteUserSendDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/invite-cards`,
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
   * @tags clazz-invite-user-controller
   * @name SendSmsSms
   * @request POST:/clazzes/{classId}/invite-cards/sms
   * @secure
   */
  sendSmsSms = (
    classId: string,
    data: ClazzInviteUserSendSmsDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/invite-cards/sms`,
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
   * @tags clazz-invite-user-controller
   * @name ExistsNonSubscribersExistsNonSubscribers
   * @request POST:/clazzes/{classId}/invite-cards/existsNonSubscribers
   * @secure
   */
  existsNonSubscribersExistsNonSubscribers = (
    classId: string,
    data: ClazzInviteUserCountRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/invite-cards/existsNonSubscribers`,
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
   * @tags clazz-consent-controller
   * @name GetConsents
   * @request GET:/clazzes/{classId}/consents
   * @secure
   */
  getConsents = (
    classId: string,
    query: {
      requestDto: ClazzConsentRequestDto;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/consents`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-consent-controller
   * @name SaveConsents
   * @request POST:/clazzes/{classId}/consents
   * @secure
   */
  saveConsents = (
    classId: string,
    data: ClazzConsentSaveDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/consents`,
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
   * @tags clazz-controller
   * @name Search
   * @request POST:/clazzes/!q
   * @secure
   */
  search = (
    query: {
      requestDto: ClazzRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/clazzes/!q`,
      method: "POST",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-controller
   * @name GetClazzClazzesClassId
   * @request GET:/clazzes/{classId}
   * @secure
   */
  getClazzClazzesClassId = (classId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/clazzes/${classId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-controller
   * @name SaveClazzesClassId
   * @request PATCH:/clazzes/{classId}
   * @secure
   */
  saveClazzesClassId = (
    classId: string,
    data: ClazzUpdateRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/clazzes/${classId}`,
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
   * @tags clazz-tag-controller
   * @name UpdateClazzTagNameName
   * @request PATCH:/clazzes/{classId}/tags/{tagId}/name
   * @secure
   */
  updateClazzTagNameName = (
    classId: string,
    tagId: string,
    data: ClazzTagDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/tags/${tagId}/name`,
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
   * @tags clazz-tag-controller
   * @name UpdateClazzTagSortingSorting
   * @request PATCH:/clazzes/{classId}/tags/sorting
   * @secure
   */
  updateClazzTagSortingSorting = (
    classId: string,
    data: ClazzTagReorderDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/tags/sorting`,
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
   * @tags clazz-controller
   * @name PatchSchoolSchool
   * @request PATCH:/clazzes/{classId}/school
   * @secure
   */
  patchSchoolSchool = (
    classId: string,
    data: ClazzUpdateSchoolDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/school`,
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
   * @tags clazz-controller
   * @name GetProfileImageProfileimage
   * @request GET:/clazzes/{classId}/profileimage
   * @secure
   */
  getProfileImageProfileimage = (classId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/clazzes/${classId}/profileimage`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-controller
   * @name PatchProfileImageProfileimage
   * @request PATCH:/clazzes/{classId}/profileimage
   * @secure
   */
  patchProfileImageProfileimage = (
    classId: string,
    data: ClazzProfileImageDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/clazzes/${classId}/profileimage`,
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
   * @tags clazz-member-controller
   * @name GetUserPhotoInfoPhotoinfo
   * @request GET:/clazzes/{classId}/members/{memberId}/photoinfo
   * @secure
   */
  getUserPhotoInfoPhotoinfo = (
    classId: string,
    memberId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/members/${memberId}/photoinfo`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-member-controller
   * @name PatchUserPhotoInfoPhotoinfo
   * @request PATCH:/clazzes/{classId}/members/{memberId}/photoinfo
   * @secure
   */
  patchUserPhotoInfoPhotoinfo = (
    classId: string,
    memberId: string,
    data: UserImageDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/members/${memberId}/photoinfo`,
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
   * @tags clazz-member-controller
   * @name UpdateClazzMemberNumberNumber
   * @request PATCH:/clazzes/{classId}/members/{memberId}/number
   * @secure
   */
  updateClazzMemberNumberNumber = (
    classId: string,
    memberId: string,
    data: ClazzMemberNumberDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/members/${memberId}/number`,
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
   * @tags clazz-post-manage-controller
   * @name SearchClassBoardFolderPostManagePostmanage
   * @request GET:/clazzes/{classId}/boardFolders/post-manage
   * @secure
   */
  searchClassBoardFolderPostManagePostmanage = (
    classId: string,
    query: {
      requestDto: ClazzPostManageSearchRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/clazzes/${classId}/boardFolders/post-manage`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-post-manage-controller
   * @name DeleteClassBoardFolderPostManagePostmanage
   * @request DELETE:/clazzes/{classId}/boardFolders/post-manage
   * @secure
   */
  deleteClassBoardFolderPostManagePostmanage = (
    classId: string,
    data: ClazzPostManageDeleteRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/boardFolders/post-manage`,
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
   * @tags clazz-post-manage-controller
   * @name PatchClassBoardFolderPostManagePostmanage
   * @request PATCH:/clazzes/{classId}/boardFolders/post-manage
   * @secure
   */
  patchClassBoardFolderPostManagePostmanage = (
    classId: string,
    data: ClazzPostManagePatchRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/boardFolders/post-manage`,
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
   * @tags clazz-controller
   * @name BulkPostEs
   * @request PATCH:/clazzes/bulk/es
   * @secure
   */
  bulkPostEs = (params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/bulk/es`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-tag-controller
   * @name GetClazzTagLastUpdateTimestampLastupdatedtime
   * @request GET:/clazzes/{classId}/tags/lastupdatedtime
   * @secure
   */
  getClazzTagLastUpdateTimestampLastupdatedtime = (
    classId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/tags/lastupdatedtime`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags post-read-user-controller
   * @name SearchReadUsers
   * @request GET:/clazzes/{classId}/post/{postId}/readUsers
   * @secure
   */
  searchReadUsers = (
    classId: string,
    postId: string,
    query: {
      request: PostReadUserSearchRequestDto;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/post/${postId}/readUsers`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-member-controller
   * @name GetMembersMembers
   * @request GET:/clazzes/{classId}/members
   * @secure
   */
  getMembersMembers = (
    classId: string,
    query: {
      requestDto: ClazzMemberRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/members`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-member-controller
   * @name GetMemberMembersMemberId
   * @request GET:/clazzes/{classId}/members/{memberId}
   * @secure
   */
  getMemberMembersMemberId = (
    classId: string,
    memberId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/members/${memberId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-subscribe-controller
   * @name GetMembersTearch
   * @request GET:/clazzes/{classId}/members/tearch
   * @secure
   */
  getMembersTearch = (classId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/clazzes/${classId}/members/tearch`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-member-controller
   * @name GetMemberTeacherTeacher
   * @request GET:/clazzes/{classId}/members/teacher
   * @secure
   */
  getMemberTeacherTeacher = (
    classId: string,
    query: {
      requestDto: ClazzMemberRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/members/teacher`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-member-controller
   * @name GetMemberStudentStudent
   * @request GET:/clazzes/{classId}/members/student
   * @secure
   */
  getMemberStudentStudent = (
    classId: string,
    query: {
      requestDto: ClazzMemberRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/members/student`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-member-controller
   * @name GetMemberParentsParents
   * @request GET:/clazzes/{classId}/members/parents
   * @secure
   */
  getMemberParentsParents = (
    classId: string,
    query: {
      requestDto: ClazzMemberRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/members/parents`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-member-controller
   * @name GetMemberCountsCount
   * @request GET:/clazzes/{classId}/members/count
   * @secure
   */
  getMemberCountsCount = (classId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/members/count`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-invite-user-controller
   * @name GetStudentsInvitestudents
   * @request GET:/clazzes/{classId}/invite-students
   * @secure
   */
  getStudentsInvitestudents = (
    classId: string,
    query: {
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/invite-students`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-board-controller
   * @name GetReadableBoardsBoard
   * @request GET:/clazzes/{classId}/board
   * @secure
   */
  getReadableBoardsBoard = (
    classId: string,
    query: {
      requestDto: ClazzBoardMenuRequestDto;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/board`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-uncheck-post-controller
   * @name UncheckBoardPostListUncheckTimestamp
   * @request GET:/clazzes/{classId}/boards/post/uncheck/{timestamp}
   * @secure
   */
  uncheckBoardPostListUncheckTimestamp = (
    classId: string,
    timestamp: string,
    query: {
      request: ClazzUncheckPostRequest;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/boards/post/uncheck/${timestamp}`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-uncheck-post-controller
   * @name UncheckBoardFolderPostListUncheckTimestamp
   * @request GET:/clazzes/{classId}/boardFolders/post/uncheck/{timestamp}
   * @secure
   */
  uncheckBoardFolderPostListUncheckTimestamp = (
    classId: string,
    timestamp: string,
    query: {
      request: ClazzUncheckPostRequest;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/boardFolders/post/uncheck/${timestamp}`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-board-controller
   * @name GetsBoardsManagelist
   * @request GET:/clazzes/{classId}/board/manage-list
   * @secure
   */
  getsBoardsManagelist = (
    classId: string,
    query: {
      requestDto: ClazzBoardManageRequestDto;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/board/manage-list`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-controller
   * @name GetYearYears
   * @request GET:/clazzes/years
   * @secure
   */
  getYearYears = (params: RequestParams = {}) =>
    this.request<
      CollectionModelEntityModelObject,
      PostReadUserSearchRequestDto
    >({
      path: `/clazzes/years`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags clazz-tag-controller
   * @name DeleteClazzTagTagsTagId
   * @request DELETE:/clazzes/{classId}/tags/{tagId}
   * @secure
   */
  deleteClazzTagTagsTagId = (
    classId: string,
    tagId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/clazzes/${classId}/tags/${tagId}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
}
