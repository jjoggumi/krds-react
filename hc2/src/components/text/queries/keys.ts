import { PermissionSort, ResultType, SendResultSort } from '@/components/text/types';

export const contactKeys = {
  all: ['contact'],
  searchBase: (schoolId: string) => [...contactKeys.all, 'search', schoolId],
  search: (schoolId: string, groupId?: string, keyword?: string) =>
    [...contactKeys.searchBase(schoolId), { groupId, keyword }],
  searchForSendBase: (schoolId: string) => [...contactKeys.all, 'searchForSend', schoolId],
  searchForSend: (schoolId: string, groupId?: string, keyword?: string) =>
    [...contactKeys.searchForSendBase(schoolId), { groupId, keyword }],
  groups: (schoolId: string) => [...contactKeys.all, 'groups', schoolId],
  groupsForSend: (schoolId: string) => [...contactKeys.all, 'groupsForSend', schoolId],
  changeHistoryBase: (schoolId: string) => [...contactKeys.all, 'changeHistory', schoolId],
  changeHistory: (schoolId: string, groupId?: string) =>
    [...contactKeys.changeHistoryBase(schoolId), { groupId }]
}

export const permissionKeys = {
  all: ['permission'],
  searchManagersBase: (schoolId: string) => [...permissionKeys.all, 'searchManagers', schoolId],
  searchManagers: (schoolId: string, sort?: PermissionSort)=>
    [...permissionKeys.searchManagersBase(schoolId), { sort }],
  searchEletterManagers: (schoolId: string) => [...permissionKeys.all, 'searchEletterManagers', schoolId]
}

export const sendKeys = {
  all: ['send'],
  senderNumber: (schoolId: string) => [...sendKeys.all, 'senderNumber', schoolId],
  info: (schoolId: string) => [...sendKeys.all, 'Info', schoolId]
}

export const sendResultKeys = {
  all: ['sendResult'],
  searchBase: (schoolId: string) => [...sendResultKeys.all, 'search', schoolId],
  search: (schoolId: string, sort?: SendResultSort) => [...sendResultKeys.searchBase(schoolId), { sort }],
  detail: (schoolId: string, messageId: string) => [...sendResultKeys.all, 'detail', schoolId, messageId],
  detailResultType: (schoolId: string, messageId: string, resultType: ResultType) =>
    [...sendResultKeys.all, 'detailResultType', schoolId, messageId, resultType]
}

export const weblinkKeys = {
  detail: (code: string, targetCode?: string) => ['detail', code, targetCode]
}