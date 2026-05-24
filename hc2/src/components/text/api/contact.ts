import { apiCall } from '@/apis/request';
import {
  ContactChangeHistoryResponse,
  ContactCreateRequest,
  ContactDeleteRequest,
  ContactDownloadReasonRequest,
  ContactDownloadReasonResponse,
  ContactGroupCreateRequest,
  ContactGroups,
  ContactGroupUpdateOrderRequest,
  ContactGroupUpdateRequest, ContactSearchRequest, ContactSearchResponse,
  ContactsRequest, ContactUpdateRequest,
  CreateContactGroupResponse,
  EducationLetterContactResponse,
} from '@/components/text/types/contact';

export const getTextEletter = async (schoolId: string) => {
  const { _embedded }: EducationLetterContactResponse = await apiCall(`GET /schools/${schoolId}/text/eletter`);
  return _embedded?.lists || [];
};

export const createContactsAll = async (schoolId: string, contacts: ContactsRequest) => {
  const { totalCnt }: { totalCnt: number } = await apiCall(`POST /schools/${schoolId}/text/contact/all`, { body: contacts });
  return totalCnt;
};

export const createContactsAllAdd = async (schoolId: string, contacts: ContactsRequest) => {
  const { totalCnt }: { totalCnt: number } = await apiCall(`POST /schools/${schoolId}/text/contact/all/add`, { body: contacts });
  return totalCnt;
};

export const getContactGroups = async (schoolId: string) => {
  const { groups, totalCount }: ContactGroups = await apiCall(`GET /schools/${schoolId}/text/contact/groups`);
  return { groups, totalCount };
};

export const getContactGroupsForSend = async (schoolId: string) => {
  const { groups, totalCount }: ContactGroups = await apiCall(`GET /schools/${schoolId}/text/send/contact/groups`);
  return { groups, totalCount };
};

export const createContactGroup = async (schoolId: string, group: ContactGroupCreateRequest) => {
  const { groupId }: CreateContactGroupResponse = await apiCall(`POST /schools/${schoolId}/text/contact/groups`, { body: group });
  return { groupId };
};

export const updateContactGroupName = async (schoolId: string, group: ContactGroupUpdateRequest) => {
  return await apiCall(`PATCH /schools/${schoolId}/text/contact/groups/name`, { body: group });
};

export const deleteContactGroup = async (schoolId: string, groupId: string) => {
  return await apiCall(`DELETE /schools/${schoolId}/text/contact/groups/${groupId}`);
};

export const updateContactGroupOrder = async (schoolId: string, orderItems: ContactGroupUpdateOrderRequest) => {
  return await apiCall(`PATCH /schools/${schoolId}/text/contact/groups/move`, { body: orderItems });
};

export const getContact = async (schoolId: string, searchGroup: ContactSearchRequest) => {
  const res: ContactSearchResponse = await apiCall(`POST /schools/${schoolId}/text/contact/search`, { body: searchGroup });
  return res;
};

export const getContactForSend = async (schoolId: string, searchGroup: ContactSearchRequest) => {
  const res: ContactSearchResponse = await apiCall(`POST /schools/${schoolId}/text/send/contact/search`, { body: searchGroup });
  return res;
};

export const createContact = async (schoolId: string, contactForCreate: ContactCreateRequest) => {
  return await apiCall(`POST /schools/${schoolId}/text/contact/add`, { body: contactForCreate });
};

export const updateContact = async (schoolId: string, contactForUpdate: ContactUpdateRequest) => {
  const { _embedded } = await apiCall(`PATCH /schools/${schoolId}/text/contact/add`, { body: contactForUpdate });
  return _embedded?.contacts || [];
};

export const deleteContact = async (schoolId: string, contactForDelete: ContactDeleteRequest) => {
  return await apiCall(`PATCH /schools/${schoolId}/text/contact/remove`, { body: contactForDelete });
};

export const createContactDownloadReason = async (schoolId: string, reasonItem: ContactDownloadReasonRequest) => {
  const { _embedded }: ContactDownloadReasonResponse =
    await apiCall(`POST /schools/${schoolId}/text/contact/download`, { body: reasonItem });
  return _embedded?.contacts || [];
};

export const getContactChangeHistory = async (schoolId: string, groupId: string, page: number) => {
  const { _embedded, page: pageResponse }: ContactChangeHistoryResponse = await apiCall(`POST /schools/${schoolId}/text/contact/change-history`, {
    query: { page },
    body: { groupId },
  });
  return { changeHistories: _embedded?.list || [], page: pageResponse }
};
