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
  NotificationUserSettingClazzRequestDto,
  NotificationUserSettingIgnoreTagsDto,
  NotificationUserSettingSchoolDto,
  PostReadUserSearchRequestDto,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class NotificationUserSettings<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags notification-user-setting-controller
   * @name GetBySchoolsSchools
   * @request GET:/notificationUserSettings/schools
   * @secure
   */
  getBySchoolsSchools = (params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/notificationUserSettings/schools`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags notification-user-setting-controller
   * @name PatchBySchoolsSchools
   * @request PATCH:/notificationUserSettings/schools
   * @secure
   */
  patchBySchoolsSchools = (
    data: NotificationUserSettingSchoolDto[],
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/notificationUserSettings/schools`,
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
   * @tags notification-user-setting-controller
   * @name GetByClassIdClazzesClassId
   * @request GET:/notificationUserSettings/clazzes/{classId}
   * @secure
   */
  getByClassIdClazzesClassId = (classId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/notificationUserSettings/clazzes/${classId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags notification-user-setting-controller
   * @name PatchByClassIdClazzesClassId
   * @request PATCH:/notificationUserSettings/clazzes/{classId}
   * @secure
   */
  patchByClassIdClazzesClassId = (
    classId: string,
    data: NotificationUserSettingClazzRequestDto[],
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/notificationUserSettings/clazzes/${classId}`,
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
   * @tags notification-user-setting-controller
   * @name GetIgnoredTagsByClassIdIgnoredTags
   * @request GET:/notificationUserSettings/clazzes/{classId}/ignoredTags
   * @secure
   */
  getIgnoredTagsByClassIdIgnoredTags = (
    classId: string,
    query: {
      notificationType:
        | "NOTICE"
        | "ALARM"
        | "MEAL"
        | "COMMENT"
        | "COMMENT_NESTED"
        | "BOARD"
        | "TEACHER_ALARM"
        | "CLAZZ_APPLIES"
        | "ATTENDANCE";
    },
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/notificationUserSettings/clazzes/${classId}/ignoredTags`,
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
   * @name PatchIgnoredTagsByClassIdIgnoredTags
   * @request PATCH:/notificationUserSettings/clazzes/{classId}/ignoredTags
   * @secure
   */
  patchIgnoredTagsByClassIdIgnoredTags = (
    classId: string,
    data: NotificationUserSettingIgnoreTagsDto,
    params: RequestParams = {},
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/notificationUserSettings/clazzes/${classId}/ignoredTags`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
}
