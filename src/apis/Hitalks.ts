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
  HiTalkBlockRequestDto,
  HiTalkReactionRequestDto,
  HiTalkReactionSaveRequestDto,
  HiTalkScheduleBatchTargetDto,
  HiTalkScheduleDto,
  HiTalkScheduleResendRequestDto,
  HiTalkScheduleStatusRequestDto,
  HiTalkScheduleTimeRequestDto,
  HiTalkVoteCreateDto,
  HiTalkVoteSearchRequestDto,
  HiTalkVoteUpdateAnswerDto,
  HiTalkVoteUpdateDto,
  HiTalkVoteUpdateStatusDto,
  Pageable,
  PostReadUserSearchRequestDto,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Hitalks<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags hi-talk-schedule-controller
   * @name SearchReservationStatus
   * @request GET:/hitalks/reservation/status/!q
   * @secure
   */
  searchReservationStatus = (
    query: {
      requestDto: HiTalkScheduleStatusRequestDto;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reservation/status/!q`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-schedule-controller
   * @name SearchReservationStatus
   * @request POST:/hitalks/reservation/status/!q
   * @secure
   */
  searchReservationStatus = (
    data: HiTalkScheduleStatusRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reservation/status/!q`,
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
   * @tags hi-talk-reaction-controller
   * @name ReactionReaction
   * @request PUT:/hitalks/reaction
   * @secure
   */
  reactionReaction = (
    data: HiTalkReactionSaveRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reaction`,
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
   * @tags hi-talk-vote-controller
   * @name UpdateStatusStatus
   * @request PUT:/hitalks/vote/{messageId}/status
   * @secure
   */
  updateVoteStatusStatus = (
    messageId: string,
    data: HiTalkVoteUpdateStatusDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/vote/${messageId}/status`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  updateVoteStatusWithRoom = (
    roomId: string,
    messageId: string,
    data: HiTalkVoteUpdateStatusDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/${roomId}/vote/${messageId}/status`,
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
   * @tags hi-talk-vote-controller
   * @name GetAnswerAnswer
   * @request GET:/hitalks/vote/{messageId}/answer
   * @secure
   */
  getAnswerAnswer = (messageId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/vote/${messageId}/answer`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-vote-controller
   * @name UpdateAnswerAnswer
   * @request PUT:/hitalks/vote/{messageId}/answer
   * @secure
   */
  updateAnswerAnswer = (
    messageId: string,
    data: HiTalkVoteUpdateAnswerDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/vote/${messageId}/answer`,
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
   * @tags hi-talk-vote-controller
   * @name DeleteAnswerAnswer
   * @request DELETE:/hitalks/vote/{messageId}/answer
   * @secure
   */
  deleteAnswerAnswer = (messageId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/vote/${messageId}/answer`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-schedule-controller
   * @name CreateReservationReservation
   * @request POST:/hitalks/reservation
   * @secure
   */
  createReservationReservation = (
    data: HiTalkScheduleDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reservation`,
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
   * @tags hi-talk-vote-controller
   * @name CreateVote
   * @request POST:/hitalks/vote
   * @secure
   */
  createVote = (data: HiTalkVoteCreateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/hitalks/vote`,
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
   * @tags hi-talk-vote-controller
   * @name GetAllVotesVotes
   * @request POST:/hitalks/votes
   * @secure
   */
  getAllVotesVotes = (
    query: {
      pageable: Pageable;
    },
    data: HiTalkVoteSearchRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/votes`,
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
   * @tags hi-talk-vote-controller
   * @name NonAnswerPushPush
   * @request POST:/hitalks/vote/{messageId}/nonAnswer/push
   * @secure
   */
  nonAnswerPushPush = (messageId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/vote/${messageId}/nonAnswer/push`,
      method: "POST",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-schedule-controller
   * @name PushReservationPush
   * @request POST:/hitalks/reservation/{scheduleId}/push
   * @secure
   */
  pushReservationPush = (
    scheduleId: string,
    data: Record<string, object>,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reservation/${scheduleId}/push`,
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
   * @tags hi-talk-block-controller
   * @name PostHiTalkBlockBlock
   * @request POST:/hitalks/block
   * @secure
   */
  postHiTalkBlockBlock = (
    data: HiTalkBlockRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/block`,
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
   * @tags hi-talk-block-controller
   * @name DeleteHiTalkBlockBlock
   * @request DELETE:/hitalks/block
   * @secure
   */
  deleteHiTalkBlockBlock = (
    data: HiTalkBlockRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/block`,
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
   * @tags hi-talk-schedule-controller
   * @name UpdateReservationTimeTime
   * @request PATCH:/hitalks/reservation/{scheduleId}/time
   * @secure
   */
  updateReservationTimeTime = (
    scheduleId: string,
    data: HiTalkScheduleTimeRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reservation/${scheduleId}/time`,
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
   * @tags hi-talk-schedule-controller
   * @name UpdateStatusStatus
   * @request PATCH:/hitalks/reservation/{scheduleId}/status
   * @secure
   */
  updateStatusStatus = (
    scheduleId: string,
    data: HiTalkScheduleResendRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reservation/${scheduleId}/status`,
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
   * @tags hi-talk-schedule-controller
   * @name GetReservationReservationScheduleId
   * @request GET:/hitalks/reservation/{scheduleId}
   * @secure
   */
  getReservationReservationScheduleId = (
    scheduleId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reservation/${scheduleId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-schedule-controller
   * @name DeleteReservationReservationScheduleId
   * @request DELETE:/hitalks/reservation/{scheduleId}
   * @secure
   */
  deleteReservationReservationScheduleId = (
    scheduleId: string,
    data: Record<string, string>,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reservation/${scheduleId}`,
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
   * @tags hi-talk-schedule-controller
   * @name UpdateReservationReservationScheduleId
   * @request PATCH:/hitalks/reservation/{scheduleId}
   * @secure
   */
  updateReservationReservationScheduleId = (
    scheduleId: string,
    data: HiTalkScheduleDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reservation/${scheduleId}`,
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
   * @tags hi-talk-schedule-controller
   * @name UpdateReservationBatchBatch
   * @request PATCH:/hitalks/reservation/batch
   * @secure
   */
  updateReservationBatchBatch = (
    data: HiTalkScheduleBatchTargetDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reservation/batch`,
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
   * @tags hi-talk-vote-controller
   * @name GetVoteMessageId
   * @request GET:/hitalks/vote/{messageId}
   * @secure
   */
  getVoteMessageId = (messageId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/hitalks/vote/${messageId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-vote-controller
   * @name DeleteVoteMessageId
   * @request DELETE:/hitalks/vote/{messageId}
   * @secure
   */
  deleteVoteMessageId = (messageId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/vote/${messageId}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-vote-controller
   * @name UpdateVoteMessageId
   * @request PATCH:/hitalks/vote/{messageId}
   * @secure
   */
  updateVoteMessageId = (
    messageId: string,
    data: HiTalkVoteUpdateDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/hitalks/vote/${messageId}`,
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
   * @tags hi-talk-schedule-controller
   * @name SearchReservationCountCount
   * @request GET:/hitalks/reservation/count
   * @secure
   */
  searchReservationCountCount = (
    query: {
      /** @format uuid */
      userId: string;
      /** @format uuid */
      roomId?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reservation/count`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-schedule-controller
   * @name SearchClazzSubscribeClazzSubscribeClassId
   * @request GET:/hitalks/reservation/clazzSubscribe/{classId}
   * @secure
   */
  searchClazzSubscribeClazzSubscribeClassId = (
    classId: string,
    query: {
      /** @format uuid */
      userId: string;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reservation/clazzSubscribe/${classId}`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-schedule-controller
   * @name SearchReservation
   * @request GET:/hitalks/reservation/!q
   * @secure
   */
  searchReservation = (
    query: {
      /** @format uuid */
      userId: string;
      /** @format uuid */
      roomId?: string;
      keyword?: string;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reservation/!q`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-reaction-controller
   * @name SearchReactionMessageId
   * @request GET:/hitalks/reaction/{messageId}
   * @secure
   */
  searchReactionMessageId = (
    messageId: string,
    query: {
      dto: HiTalkReactionRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reaction/${messageId}`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-reaction-controller
   * @name GetCountCountMessageId
   * @request GET:/hitalks/reaction/count/{messageId}
   * @secure
   */
  getCountCountMessageId = (
    messageId: string,
    query?: {
      /** @format uuid */
      iconId?: string;
      /** @format uuid */
      userId?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reaction/count/${messageId}`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-block-controller
   * @name GetHiTalkBlockedUsersBlockedUsers
   * @request GET:/hitalks/{userId}/blockedUsers
   * @secure
   */
  getHiTalkBlockedUsersBlockedUsers = (
    userId: string,
    query: {
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/${userId}/blockedUsers`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-block-controller
   * @name GetHiTalkBlockedIdsBlockedIds
   * @request GET:/hitalks/{userId}/blockedIds
   * @secure
   */
  getHiTalkBlockedIdsBlockedIds = (
    userId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/${userId}/blockedIds`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-block-controller
   * @name CheckHiTalkBlockedUsersBlockedBlockedUserId
   * @request GET:/hitalks/{userId}/blocked/{blockedUserId}
   * @secure
   */
  checkHiTalkBlockedUsersBlockedBlockedUserId = (
    userId: string,
    blockedUserId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/${userId}/blocked/${blockedUserId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-vote-controller
   * @name GetVotesVotes
   * @request GET:/hitalks/{roomId}/votes
   * @secure
   */
  getVotesVotes = (
    roomId: string,
    query: {
      status?: string;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/${roomId}/votes`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-vote-controller
   * @name GetReportReportsType
   * @request GET:/hitalks/vote/{messageId}/reports/{type}
   * @secure
   */
  getReportReportsType = (
    messageId: string,
    type: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/vote/${messageId}/reports/${type}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-vote-controller
   * @name GetItemMembersMembers
   * @request GET:/hitalks/vote/{messageId}/items/{itemId}/members
   * @secure
   */
  getItemMembersMembers = (
    messageId: string,
    itemId: string,
    query: {
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/vote/${messageId}/items/${itemId}/members`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags hi-talk-reaction-controller
   * @name DeleteMessageIdIconId
   * @request DELETE:/hitalks/reaction/{messageId}/{iconId}
   * @secure
   */
  deleteMessageIdIconId = (
    messageId: string,
    iconId: string,
    query: {
      /** @format uuid */
      userId: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/hitalks/reaction/${messageId}/${iconId}`,
      method: "DELETE",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
}
