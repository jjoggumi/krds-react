import { Permission, PermissionRole } from '@/components/text/types/permission';

export * from './contact';
export * from './send';
export * from './sendResult';
export * from './permission';
export * from './weblink';

export interface CurrentRoute {
  menu?: string,
  schoolId?: string,
  query?: Record<string, any>,
  routePath?: string,
  reloadAuthorities?: boolean
}

export interface TextAuthoritiesResponse {
  _embedded: {
    lists: TextAuthority[];
  }
}

export interface TextAuthority {
  schoolId: string;
  schoolName: string;
  schoolImagePath: string | null;
  role: PermissionRole;
  point: number;
  totalPoint: number;
  managerName: string;
  permissions: Permission[];
}