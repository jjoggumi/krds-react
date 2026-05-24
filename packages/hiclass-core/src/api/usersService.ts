import { AxiosRequestConfig } from "axios";
import { Get, Post, Put } from "./axios-client";
import {
  UserConsentAgreementResponse,
  UserConsentInfoResponse,
  UserConsentSensitivesResponse,
} from '../types/response';
import { UserConsentAgreementRequest } from "../types/requset";

export const postUsersGeneralConsents = async () => {
   await Post(`/users/generalConsents`);
};

export const getUserConsentsInfo = async (config?: AxiosRequestConfig): Promise<UserConsentInfoResponse> => {
   const response = await Get<UserConsentInfoResponse>(`/users/consents/info`, config);
   return response.data;
};

export const postUserConsentsAgreement = async (params: UserConsentAgreementRequest, config?: AxiosRequestConfig) => {
   const response = await Post(`/users/consents/agreement`, params, config);
   return response.data;
};

export const getUserConsentsAgreement = async (config?: AxiosRequestConfig) => {
   const response = await Get<UserConsentAgreementResponse>(`/users/consents/agreement`, config);
   return response.data.isAgreed;
}

export const getUserConsentsSensitives = async (config?: AxiosRequestConfig) => {
  const response = await Get<UserConsentSensitivesResponse>(`/users/consents/sensitives`, config);
  return response.data._embedded;
}

export const updateUserConsentsAgreement = async (consentType: string, requestBody: { isAgreed: boolean }) => {
  const response = await Put(`/users/consents/agreement/${consentType}`, requestBody);
  return response.data
};