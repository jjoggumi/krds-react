export interface EducationLetterContactResponse {
  _embedded: {
    lists: Contact[];
  };
}

export interface Contact {
  depth1GroupName: string;
  depth2GroupName: string;
  depth2GroupId?: string;
  contactName: string;
  studentNumber: number | null;
  phoneNumber: string | null;
  phoneNumberParent1: string | null;
  phoneNumberParent2: string | null;
  contactId?: string | null;
  contactParent1Id?: string;
  contactParent2Id?: string;
}

export interface ContactWithValidation extends Contact {
  tempId?: string;
  valid: ContactValidation;
}

export interface ContactValidation {
  depth1GroupName: boolean;
  depth2GroupName: boolean;
  contactName: boolean;
  studentNumber: boolean;
  phoneNumber: boolean;
  phoneNumberParent1: boolean;
  phoneNumberParent2: boolean;
}

export interface ContactsRequest {
  contacts: Contact[];
}

export interface ContactGroups {
  totalCount: number;
  groups: ContactGroup[];
}

export interface ContactGroup {
  groupId: string;
  groupName: string;
  count: number;
  sortNo: number;
  children?: ContactGroup[];
}

export interface ContactGroupCreateRequest {
  groupId: string;
  groupName: string;
  depthType: ContactGroupDepthType;
  sortNo: number;
}

export enum ContactGroupDepthType {
  DEPTH1 = 'DEPTH1',
  DEPTH2 = 'DEPTH2',
}

export interface ContactGroupUpdateRequest {
  groupId: string;
  groupName: string;
  depthType: ContactGroupDepthType;
}

export interface ContactGroupUpdateOrderRequest {
  depthType: ContactGroupDepthType;
  groups: ContactGroupUpdateOrder[];
}

export interface ContactGroupUpdateOrder {
  groupId: string;
  sortNo: number;
}

export interface ContactSearchRequest {
  groupId: string | null;
  depthType: ContactGroupDepthType;
  keyword: string | null;
}

export interface ContactSearchResponse {
  changeTimestamp: number | null;
  contacts: Contact[];
  totalCount: number;
}

export interface ContactCreateRequest {
  groupId: string;
  contactName: string | null;
  studentNumber: number | null,
  phoneNumber: string | null;
  phoneNumberParent1: string | null;
  phoneNumberParent2: string | null;
  depth1GroupName?: string; // api request 아님. front 에서 사용
  depth2GroupName?: string; // api request 아님. front 에서 사용
}

export enum UpdateChangeType {
  BATCH = 'BATCH',
  CURRENT = 'CURRENT',
}

export interface ContactUpdateRequest {
  contactId: string;
  groupId: string;
  updateChangeType?: null | UpdateChangeType;
  contactName?: string | null;
  studentNumber?: number | null,
  phoneNumber?: string | null;
  phoneNumberParent1?: string | null;
  phoneNumberParent2?: string | null;
}

export interface ContactDeleteRequest {
  groupId: string;
  contactIds: string[];
}

export interface ContactDownloadReasonRequest {
  depthType: ContactGroupDepthType;
  groupId: string;
  reason: string;
}

export interface ContactDownloadReasonResponse {
  _embedded: {
    contacts: Contact[];
  };
}

export interface ContactChangeHistoryResponse {
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  },
  _embedded: {
    list: ChangeHistory[]
  }
}

export interface ChangeHistory {
  content: string;
  userName: string;
  insertedTimestamp: number;
}

export interface CreateContactGroupResponse {
  groupId: string
}