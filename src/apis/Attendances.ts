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
  AttendanceFileSaveRequestDto,
  AttendanceMonthRequestDto,
  AttendanceMultipleConfirm,
  AttendanceRequestDto,
  AttendanceSaveMultipleDatesRequestDto,
  AttendanceSaveRequestDto,
  AttendanceStatsRequestDto,
  Pageable,
  PostReadUserSearchRequestDto,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Attendances<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags attendance-controller
   * @name GetFilesFilesAttendanceId
   * @request GET:/attendances/files/{attendanceId}
   * @secure
   */
  getFilesFilesAttendanceId = (
    attendanceId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/attendances/files/${attendanceId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags attendance-controller
   * @name AddFilesFilesAttendanceId
   * @request PUT:/attendances/files/{attendanceId}
   * @secure
   */
  addFilesFilesAttendanceId = (
    attendanceId: string,
    data: AttendanceFileSaveRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/attendances/files/${attendanceId}`,
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
   * @tags attendance-controller
   * @name UpdateFilesFilesAttendanceId
   * @request PATCH:/attendances/files/{attendanceId}
   * @secure
   */
  updateFilesFilesAttendanceId = (
    attendanceId: string,
    data: AttendanceFileSaveRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/attendances/files/${attendanceId}`,
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
   * @tags attendance-controller
   * @name SearchAttendances
   * @request GET:/attendances
   * @secure
   */
  searchAttendances = (
    query: {
      request: AttendanceRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/attendances`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags attendance-controller
   * @name CreateAttendances
   * @request POST:/attendances
   * @deprecated
   * @secure
   */
  createAttendances = (
    data: AttendanceSaveRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/attendances`,
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
   * @tags attendance-controller
   * @name CreateWithMultipleDatesMultipledates
   * @request POST:/attendances/multiple-dates
   * @secure
   */
  createWithMultipleDatesMultipledates = (
    data: AttendanceSaveMultipleDatesRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/attendances/multiple-dates`,
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
   * @tags attendance-controller
   * @name GetAttendancesAttendanceId
   * @request GET:/attendances/{attendanceId}
   * @secure
   */
  getAttendancesAttendanceId = (
    attendanceId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/attendances/${attendanceId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags attendance-controller
   * @name DeleteAttendancesAttendanceId
   * @request DELETE:/attendances/{attendanceId}
   * @secure
   */
  deleteAttendancesAttendanceId = (
    attendanceId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/attendances/${attendanceId}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags attendance-controller
   * @name UpdateAttendancesAttendanceId
   * @request PATCH:/attendances/{attendanceId}
   * @secure
   */
  updateAttendancesAttendanceId = (
    attendanceId: string,
    data: AttendanceSaveRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/attendances/${attendanceId}`,
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
   * @tags attendance-controller
   * @name MultipleConfirmMultipleconfirm
   * @request PATCH:/attendances/multiple-confirm
   * @secure
   */
  multipleConfirmMultipleconfirm = (
    query: {
      searchRequest: AttendanceRequestDto;
      pageable: Pageable;
    },
    data: AttendanceMultipleConfirm,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/attendances/multiple-confirm`,
      method: "PATCH",
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
   * @tags attendance-controller
   * @name UnconfirmedUnconfirmedClassId
   * @request GET:/attendances/unconfirmed/{classId}
   * @secure
   */
  unconfirmedUnconfirmedClassId = (
    classId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/attendances/unconfirmed/${classId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags attendance-controller
   * @name GetSubmitMembersSubmitMembersClassId
   * @request GET:/attendances/submitMembers/{classId}
   * @secure
   */
  getSubmitMembersSubmitMembersClassId = (
    classId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/attendances/submitMembers/${classId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags attendance-controller
   * @name GetSubmitCountSubmitcountStudentId
   * @request GET:/attendances/submit-count/{studentId}
   * @secure
   */
  getSubmitCountSubmitcountStudentId = (
    studentId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/attendances/submit-count/${studentId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags attendance-controller
   * @name GetSubmitCountDetailsDetails
   * @request GET:/attendances/submit-count/{studentId}/details
   * @secure
   */
  getSubmitCountDetailsDetails = (
    studentId: string,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/attendances/submit-count/${studentId}/details`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags attendance-controller
   * @name StatsByStudentStatsClassId
   * @request GET:/attendances/stats/{classId}
   * @secure
   */
  statsByStudentStatsClassId = (
    classId: string,
    query: {
      request: AttendanceStatsRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/attendances/stats/${classId}`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags attendance-controller
   * @name GetSettingSettingClassId
   * @request GET:/attendances/setting/{classId}
   * @secure
   */
  getSettingSettingClassId = (classId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/attendances/setting/${classId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags attendance-controller
   * @name MonthClassIdYyyyMm
   * @request GET:/attendances/month/{classId}/{yyyy-MM}
   * @secure
   */
  monthClassIdYyyyMM = (
    classId: string,
    yyyyMm: string,
    query: {
      request: AttendanceMonthRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, PostReadUserSearchRequestDto>({
      path: `/attendances/month/${classId}/${yyyyMm}`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
}
