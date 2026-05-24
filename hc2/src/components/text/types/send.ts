import { WeblinkFile } from '@/components/text/types/weblink';

export class SendValidationError extends Error {
  errorCode: SendValidationCode;
  errorData: Record<string, any>;

  constructor(errorCode: SendValidationCode, errorData: Record<string, any> = {}) {
    super();
    this.errorCode = errorCode;
    this.errorData = errorData;
    this.name = 'SendValidationError';
  }
}

export enum MsgType {
  SMS = 'SMS',
  LMS = 'LMS',
  LMS_WEB_LINK = 'LMS_WEB_LINK',
}

export enum SendType {
  IMMEDIATE = 'IMMEDIATE',
  RESERVED = 'RESERVED'
}

export enum SendValidationCode {
  EMPTY_TITLE = 'EMPTY_TITLE',
  EMPTY_CONTENT = 'EMPTY_CONTENT',
  EMPTY_SENDER_NUMBER = 'EMPTY_SENDER_NUMBER',
  EMPTY_SEND_TYPE = 'EMPTY_SEND_TYPE',
  EMPTY_TARGETS = 'EMPTY_TARGETS',
  INVALID_PHONE_NUMBERS = 'INVALID_PHONE_NUMBERS',
  INCLUDES_EMOJI = 'INCLUDES_EMOJI',
  OVER_BYTE = 'OVER_BYTE',
  INVALID_RESERVED_TIME = 'INVALID_RESERVED_TIME',
  IN_RESTRICTED_TIME = 'IN_RESTRICTED_TIME',
  POINT_LACK = 'POINT_LACK',
  OVER_SEND_LIMIT = 'OVER_SEND_LIMIT',
  EMPTY_WEBLINK_FILES = 'EMPTY_WEBLINK_FILES'
}

export interface SendNumbersResponse {
  _embedded: {
    numbers: SenderNumber[];
  }
}

export interface SenderNumber {
  senderNumberName: string;
  senderNumber: string;
}

export interface SendInfo {
  point: number;
  schoolId: string;
  senderNumbers: { senderNumberName: string, senderNumberId: string, senderNumber: string }[];
  totalPoint: number;
}

export interface SendRequest {
  msgType: MsgType;
  title?: string;
  content: string;
  senderNumberId: string;
  sendType: SendType;
  reservedTimestamp?: number | null;
  isDeduplication: boolean; // true: 중복 제외, false: 중복 유지
  targets: SendTargetWithValidation[];
  reason?: string;
  isWeblink: boolean;
  weblinkId?: string | null;
  weblinkFiles?: WeblinkFile[];
}

export enum SendTargetType {
  STUDENT = 'STUDENT',
  PARENTS_1 = 'PARENTS_1',
  PARENTS_2 = 'PARENTS_2'
}

export interface SendTarget {
  contactId?: string;
  phoneNumber: string;
  contactName: string;
  depth1?: string;
  depth2?: string;
  field1?: string;
  field2?: string;
  field3?: string;
  field4?: string;
  field5?: string;
  field6?: string;
  field7?: string;
  field8?: string;
  sendTargetType?: SendTargetType | string;
}

export interface SendTargetWithValidation extends SendTarget {
  valid?: {
    phoneNumber: boolean;
  };
  isDuplication?: boolean;
}