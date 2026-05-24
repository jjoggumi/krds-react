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
  IScreamEduSendMessage,
  PostReadUserSearchRequestDto,
  SendMessage,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class SendMessages<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags send-message-controller
   * @name GetCertNumberPhoneCertNumber
   * @request GET:/sendMessages/certNumber/{phone}/{certNumber}
   * @secure
   */
  getCertNumberPhoneCertNumber = (
    phone: string,
    certNumber: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/certNumber/${phone}/${certNumber}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags send-message-controller
   * @name GetCertNumberPhoneCertNumber
   * @request POST:/sendMessages/certNumber/{phone}/{certNumber}
   * @secure
   */
  getCertNumberPhoneCertNumber = (
    phone: string,
    certNumber: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/certNumber/${phone}/${certNumber}`,
      method: "POST",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags send-message-controller
   * @name GetAdvertiserCertNumberAdvertiserCertNumber
   * @request GET:/sendMessages/certNumber/advertiser/{certNumber}
   * @secure
   */
  getAdvertiserCertNumberAdvertiserCertNumber = (
    certNumber: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/certNumber/advertiser/${certNumber}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags send-message-controller
   * @name GetAdvertiserCertNumberAdvertiserCertNumber
   * @request POST:/sendMessages/certNumber/advertiser/{certNumber}
   * @secure
   */
  getAdvertiserCertNumberAdvertiserCertNumber = (
    certNumber: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/certNumber/advertiser/${certNumber}`,
      method: "POST",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags send-message-controller
   * @name SetPushSendMessages
   * @request POST:/sendMessages
   * @secure
   */
  setPushSendMessages = (
    data: IScreamEduSendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages`,
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
   * @tags send-message-controller
   * @name TeacherAlarmTeacherAlarm
   * @request POST:/sendMessages/teacherAlarm
   * @secure
   */
  teacherAlarmTeacherAlarm = (data: SendMessage, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/sendMessages/teacherAlarm`,
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
   * @tags send-message-controller
   * @name SurveyRemindSurveyRemind
   * @request POST:/sendMessages/surveyRemind
   * @secure
   */
  surveyRemindSurveyRemind = (data: SendMessage, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/surveyRemind`,
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
   * @tags send-message-controller
   * @name SurveyAfterSchoolToApplicantSurveyAfterSchoolToApplicant
   * @request POST:/sendMessages/surveyAfterSchoolToApplicant
   * @secure
   */
  surveyAfterSchoolToApplicantSurveyAfterSchoolToApplicant = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/sendMessages/surveyAfterSchoolToApplicant`,
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
   * @tags send-message-controller
   * @name PushCheckPushCheck
   * @request POST:/sendMessages/pushCheck
   * @secure
   */
  pushCheckPushCheck = (data: SendMessage, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/sendMessages/pushCheck`,
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
   * @tags send-message-controller
   * @name PostRemindNotePostRemindNote
   * @request POST:/sendMessages/postRemindNote
   * @secure
   */
  postRemindNotePostRemindNote = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/postRemindNote`,
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
   * @tags send-message-controller
   * @name PostRemindHomeworkPostRemindHomework
   * @request POST:/sendMessages/postRemindHomework
   * @secure
   */
  postRemindHomeworkPostRemindHomework = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/postRemindHomework`,
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
   * @tags send-message-controller
   * @name PostRemindBoardPostRemindBoard
   * @request POST:/sendMessages/postRemindBoard
   * @secure
   */
  postRemindBoardPostRemindBoard = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/postRemindBoard`,
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
   * @tags send-message-controller
   * @name PostRemindAlbumPostRemindAlbum
   * @request POST:/sendMessages/postRemindAlbum
   * @secure
   */
  postRemindAlbumPostRemindAlbum = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/postRemindAlbum`,
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
   * @tags send-message-controller
   * @name SetPostNoteReadPostNoteRead
   * @request POST:/sendMessages/postNoteRead
   * @secure
   */
  setPostNoteReadPostNoteRead = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/postNoteRead`,
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
   * @tags send-message-controller
   * @name SetPostNoteReadPostNoteRead24
   * @request POST:/sendMessages/postNoteRead24
   * @secure
   */
  setPostNoteReadPostNoteRead24 = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/postNoteRead24`,
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
   * @tags send-message-controller
   * @name SetPostAlarmPostAlarm
   * @request POST:/sendMessages/postAlarm
   * @secure
   */
  setPostAlarmPostAlarm = (data: SendMessage, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/postAlarm`,
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
   * @tags send-message-controller
   * @name SetPostAlarmPlusPostAlarmPlus
   * @request POST:/sendMessages/postAlarmPlus
   * @secure
   */
  setPostAlarmPlusPostAlarmPlus = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/postAlarmPlus`,
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
   * @tags send-message-controller
   * @name SetPostAlarmPlusReadPostAlarmPlusRead
   * @request POST:/sendMessages/postAlarmPlusRead
   * @secure
   */
  setPostAlarmPlusReadPostAlarmPlusRead = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/postAlarmPlusRead`,
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
   * @tags send-message-controller
   * @name SetPostAlarmPlusModifiedPostAlarmPlusModified
   * @request POST:/sendMessages/postAlarmPlusModified
   * @secure
   */
  setPostAlarmPlusModifiedPostAlarmPlusModified = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/postAlarmPlusModified`,
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
   * @tags send-message-controller
   * @name SetPostAlarmPlusConsultPostAlarmPlusConsult
   * @request POST:/sendMessages/postAlarmPlusConsult
   * @secure
   */
  setPostAlarmPlusConsultPostAlarmPlusConsult = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/postAlarmPlusConsult`,
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
   * @tags send-message-controller
   * @name SetPostAlarmPlusAfterSchoolClosedPostAlarmPlusAfterSchoolClosed
   * @request POST:/sendMessages/postAlarmPlusAfterSchoolClosed
   * @secure
   */
  setPostAlarmPlusAfterSchoolClosedPostAlarmPlusAfterSchoolClosed = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/postAlarmPlusAfterSchoolClosed`,
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
   * @tags send-message-controller
   * @name SetInviteCardInviteCard
   * @request POST:/sendMessages/inviteCard
   * @deprecated
   * @secure
   */
  setInviteCardInviteCard = (data: SendMessage, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/inviteCard`,
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
   * @tags send-message-controller
   * @name SetInviteCardELetterInviteCardLetter
   * @request POST:/sendMessages/inviteCardLetter
   * @secure
   */
  setInviteCardELetterInviteCardLetter = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/inviteCardLetter`,
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
   * @tags send-message-controller
   * @name SetHealthCheckHealthCheck
   * @request POST:/sendMessages/healthCheck
   * @secure
   */
  setHealthCheckHealthCheck = (data: SendMessage, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/healthCheck`,
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
   * @tags send-message-controller
   * @name SetCertNumberCertNumber
   * @request POST:/sendMessages/certNumber
   * @secure
   */
  setCertNumberCertNumber = (data: SendMessage, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/certNumber`,
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
   * @tags send-message-controller
   * @name SetCertNumberKakaotalkKakaotalk
   * @request POST:/sendMessages/certNumber/kakaotalk
   * @secure
   */
  setCertNumberKakaotalkKakaotalk = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/sendMessages/certNumber/kakaotalk`,
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
   * @tags send-message-controller
   * @name SetCertNumberAdvertiserAdvertiser
   * @request POST:/sendMessages/certNumber/advertiser
   * @secure
   */
  setCertNumberAdvertiserAdvertiser = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/certNumber/advertiser`,
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
   * @tags send-message-controller
   * @name SetAlarmPlusSecessionAlarmPlusSecession
   * @request POST:/sendMessages/alarmPlusSecession
   * @secure
   */
  setAlarmPlusSecessionAlarmPlusSecession = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/alarmPlusSecession`,
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
   * @tags send-message-controller
   * @name AlarmPlusManagerWaitingApprovalAlarmPlusManagerWaitingApproval
   * @request POST:/sendMessages/alarmPlusManagerWaitingApproval
   * @secure
   */
  alarmPlusManagerWaitingApprovalAlarmPlusManagerWaitingApproval = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/alarmPlusManagerWaitingApproval`,
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
   * @tags send-message-controller
   * @name AlarmPlusManagerDenialAlarmPlusManagerDenial
   * @request POST:/sendMessages/alarmPlusManagerDenial
   * @secure
   */
  alarmPlusManagerDenialAlarmPlusManagerDenial = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/alarmPlusManagerDenial`,
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
   * @tags send-message-controller
   * @name AlarmPlusManagerAcceptAlarmPlusManagerAccept
   * @request POST:/sendMessages/alarmPlusManagerAccept
   * @secure
   */
  alarmPlusManagerAcceptAlarmPlusManagerAccept = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/alarmPlusManagerAccept`,
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
   * @tags send-message-controller
   * @name SetAlarmPlusDenialAlarmPlusDenial
   * @request POST:/sendMessages/alarmPlusDenial
   * @secure
   */
  setAlarmPlusDenialAlarmPlusDenial = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/alarmPlusDenial`,
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
   * @tags send-message-controller
   * @name SetAlarmPlusAcceptAlarmPlusAccept
   * @request POST:/sendMessages/alarmPlusAccept
   * @secure
   */
  setAlarmPlusAcceptAlarmPlusAccept = (
    data: SendMessage,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/sendMessages/alarmPlusAccept`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
}
