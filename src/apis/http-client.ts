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

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from 'axios';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

// JWT 토큰 관련 인터페이스
interface JWTDecoded {
  uuid: string;
  exp: number;
}

interface TokenResponse {
  idToken: string;
  refreshToken: string;
  expiresAt: string;
}

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, 'data' | 'params' | 'url' | 'responseType'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, 'data' | 'cancelToken'> {
  securityWorker?: (securityData: SecurityDataType | null) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

// 토큰 갱신 함수
const refreshToken = async (): Promise<TokenResponse> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken || refreshToken === 'undefined') {
    throw new Error('Refresh token not available');
  }

  const response = await axios.post(
    `${process.env.VUE_APP_BASE_LOGIN_URI}/oauth/token`,
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    }
  );

  return response.data;
};

// 토큰 유효성 검사 함수
const isTokenValid = (): boolean => {
  const idToken = localStorage.getItem('idToken');
  if (!idToken) return false;

  try {
    const decoded: JWTDecoded = jwt_decode(idToken);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// 토큰이 곧 만료되는지 확인 (24시간 전)
const isTokenExpiringSoon = (): boolean => {
  const idToken = localStorage.getItem('idToken');
  if (!idToken) return false;

  try {
    const decoded: JWTDecoded = jwt_decode(idToken);
    const currentTime = Math.floor(Date.now() / 1000);
    const twentyFourHoursFromNow = currentTime + (60 * 60 * 24); // 24시간
    return decoded.exp <= twentyFourHoursFromNow;
  } catch (error) {
    console.error('Token expiry check error:', error);
    return false;
  }
};

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || process.env.VUE_APP_BASE_API_URI });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === 'object' && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    // 토큰이 곧 만료되거나 유효하지 않은 경우 갱신 시도
    if (!isTokenValid() || isTokenExpiringSoon()) {
      try {
        const tokenData = await refreshToken();
        localStorage.setItem('idToken', tokenData.idToken);
        localStorage.setItem('refreshToken', tokenData.refreshToken);
        localStorage.setItem('idTokenExpiresTimestamp', new Date(tokenData.expiresAt).getTime().toString());
      } catch (error) {
        console.error('Token refresh failed:', error);
        // 토큰 갱신 실패 시 로그아웃 처리
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('idTokenExpiresTimestamp');
        window.location.href = '/logout';
        throw error;
      }
    }

    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.secure) && this.securityWorker && (await this.securityWorker(this.securityData))) || {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === 'object') {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== 'string') {
      body = JSON.stringify(body);
    }

    const idToken = localStorage.getItem('idToken');

    try {
      return await this.instance.request({
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type ? { 'Content-Type': type } : {}),
          Authorization: `Bearer ${idToken}`,
        },
        params: query,
        responseType: responseFormat,
        data: body,
        url: path,
      });
    } catch (error: any) {
      // 401 에러인 경우 토큰 갱신 후 재시도
      if (error.response?.status === 401) {
        try {
          const tokenData = await refreshToken();
          localStorage.setItem('idToken', tokenData.idToken);
          localStorage.setItem('refreshToken', tokenData.refreshToken);
          localStorage.setItem('idTokenExpiresTimestamp', new Date(tokenData.expiresAt).getTime().toString());

          // 새 토큰으로 원래 요청 재시도
          return await this.instance.request({
            ...requestParams,
            headers: {
              ...(requestParams.headers || {}),
              ...(type ? { 'Content-Type': type } : {}),
              Authorization: `Bearer ${tokenData.idToken}`,
            },
            params: query,
            responseType: responseFormat,
            data: body,
            url: path,
          });
        } catch (refreshError) {
          console.error('Token refresh failed on 401:', refreshError);
          // 토큰 갱신 실패 시 로그아웃 처리
          localStorage.removeItem('idToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('idTokenExpiresTimestamp');
          window.location.href = '/logout';
          throw refreshError;
        }
      }
      throw error;
    }
  };
}
