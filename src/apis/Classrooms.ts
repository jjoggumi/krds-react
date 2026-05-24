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
  ClassroomCreateDto,
  ClassroomSearchRequestDto,
  ClassroomSortDto,
  DrawTrialRequestDto,
  Pageable,
  PostReadUserSearchRequestDto,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Classrooms<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags classroom-controller
   * @name SearchClassrooms
   * @request GET:/classrooms
   * @secure
   */
  searchClassrooms = (
    query: {
      request: ClassroomSearchRequestDto;
      pageable: Pageable;
    },
    params: RequestParams = {}
  ) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classrooms`,
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
   * @name CreateClassrooms
   * @request POST:/classrooms
   * @secure
   */
  createClassrooms = (data: ClassroomCreateDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classrooms`,
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
   * @tags classroom-draw-controller
   * @name SpinRandomDrawRandom
   * @request POST:/classrooms/draw/random
   * @secure
   */
  spinRandomDrawRandom = (data: DrawTrialRequestDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classrooms/draw/random`,
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
   * @tags classroom-draw-controller
   * @name SpinGroupDrawGroupClassroomId
   * @request POST:/classrooms/draw/group/{classroomId}
   * @secure
   */
  spinGroupDrawGroupClassroomId = (classroomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classrooms/draw/group/${classroomId}`,
      method: 'POST',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-draw-controller
   * @name SpinRandomGroupDrawRandomGroupId
   * @request POST:/classrooms/draw/group/random/{groupId}
   * @secure
   */
  spinRandomGroupDrawRandomGroupId = (groupId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classrooms/draw/group/random/${groupId}`,
      method: 'POST',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-controller
   * @name SortingSorting
   * @request PATCH:/classrooms/sorting
   * @secure
   */
  sortingSorting = (data: ClassroomSortDto, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classrooms/sorting`,
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
   * @tags classroom-draw-controller
   * @name ResetRandomDrawRandomClassRoomId
   * @request PATCH:/classrooms/draw/random/{classRoomId}
   * @secure
   */
  resetRandomDrawRandomClassRoomId = (classRoomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classrooms/draw/random/${classRoomId}`,
      method: 'PATCH',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-draw-controller
   * @name LatestWinnersLatestClassroomId
   * @request GET:/classrooms/draw/{drawType}/latest/{classroomId}
   * @secure
   */
  latestWinnersLatestClassroomId = (drawType: 'RANDOM' | 'GROUP' | 'RANDOM_IN_GROUP', classroomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classrooms/draw/${drawType}/latest/${classroomId}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-draw-controller
   * @name CountWinnersCountClassroomId
   * @request GET:/classrooms/draw/random/count/{classroomId}
   * @secure
   */
  countWinnersCountClassroomId = (classroomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classrooms/draw/random/count/${classroomId}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags classroom-draw-controller
   * @name AccumulatedWinnersAccumClassroomId
   * @request GET:/classrooms/draw/random/accum/{classroomId}
   * @secure
   */
  accumulatedWinnersAccumClassroomId = (classroomId: string, params: RequestParams = {}) =>
    this.request<PostReadUserSearchRequestDto, any>({
      path: `/classrooms/draw/random/accum/${classroomId}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
}
