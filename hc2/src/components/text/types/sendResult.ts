import { MsgType, SendType } from "./send";

export enum DisplayStatus {
   COMPLETED = 'COMPLETED', //완료
   RESERVED = 'RESERVED', //예약 
   PENDING = 'PENDING', //대기
   SENT = 'SENT', //발송
   FAILED = 'FAILED', //실패
   CANCELED = 'CANCELED', //취소
}

export enum LanguageType {
   ORIGINAL = 'ORIGINAL',
}

export enum ResultType {
   SUCCESS = 'success',
   FAIL = 'fail',
   PENDING = 'pending',
}

export interface SendResultSort {
   sort: SortType
   direction: SortDirection
}

export enum SortType {
   NAME = 'name',
   MSGTYPE = 'msgType',
   DEFAULT = 'reserved',
}

export enum SortDirection {
   ASC = 'ASC',
   DESC = 'DESC'
}


export interface PostTextSendResultResponse {
   _embedded: {
      lists: SendResult[];
   },
   page: {
      number: number;
      size: number;
      totalElements: number;
      totalPages: number;
   },
}

export interface PostTextSendResultMessageResponse {
   messageId: string;
   reservedTimestamp: number;
   canceledTimestamp?: number;
   canceledName?: string;
   title: string;
   content: string;
   senderNumber: string;
   senderNumberName: string;
   requesterName: string;
   msgType: MsgType;
   point: number;
   languageType: LanguageType;
   targetCount: number;
   successCount: number;
   failCount: number;
   sendType: SendType;
   displayStatus: DisplayStatus;
   isRefund?: boolean;
   pointRefund?: number;
   isWeblink: boolean;
   weblinkCode?: string; 
}


export interface SendResult {
   messageId: string;
   reservedTimestamp: number;
   title: string;
   content: string;
   senderNumber: string;
   requesterName: string;
   msgType: MsgType;
   isRefund?: boolean;
   pointRefund?: number;
   point: number;
   languageType: LanguageType;
   targetCount: number;
   successCount: number;
   failCount: number;
   sendType: SendType;
   displayStatus: DisplayStatus;
   isWeblink: boolean;
}

export interface PostTextSendResultMessageResultTypeResponse {
   _embedded: {
      lists: SendResultType[];
   },
   page: {
      number: number;
      size: number;
      totalElements: number;
      totalPages: number;
   },
}

export interface SendResultType {
   targetId: string;
   sentTimestamp: number;
   receiptNumber: string;
   errorCode?: string;
   errorMessage?: string;
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
   targetCode?: string;
   contactType?: string;
   name?: string;
}