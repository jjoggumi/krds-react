
export interface PermissionSort {
   sort: PermissionSortType
   direction: PermissionSortDirection
}

export enum PermissionSortType {
   NAME = 'name',
}

export enum PermissionSortDirection {
   ASC = 'ASC',
   DESC = 'DESC'
}

export enum PermissionRole {
   MANAGER = 'MANAGER',
   OWNER = 'OWNER',
}

export enum PermissionFeatureType {
  CONTACT = 'CONTACT',
  SEND_MESSAGE = 'SEND_MESSAGE',
}

export enum PermissionActionType {
  ALL = 'ALL',
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  SEND = 'SEND'
}

export interface PostTextManagersSearchResponse {
   _embedded: {
      lists: TextManagerSearch[];
   },
}

export interface TextManagerSearch {
   userId: string;
   userName: string;
   role: PermissionRole;
   permissions: Permission[];
}

export interface Permission {
   featureType: PermissionFeatureType;
   actionType: string;
   scopeType: string;
   isAllowed: boolean;
}

export interface PostEletterResponse {
   _embedded: {
      lists: Eltter[];
   },
}

export interface Eltter {
   userId: string;
   userName: string;
   etc?: string;
}