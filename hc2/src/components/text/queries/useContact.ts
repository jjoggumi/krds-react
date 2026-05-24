import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from '@/utils/validate';
import {
  createContactGroup,
  createContactsAll,
  createContactsAllAdd,
  deleteContactGroup,
  getContactGroups,
  updateContactGroupName,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  createContactDownloadReason,
  getContactChangeHistory, updateContactGroupOrder, getContactGroupsForSend, getContactForSend,
} from '@/components/text/api';
import { phoneNumberFields } from '@/components/text/constants/contacts';
import {
  ContactCreateRequest,
  ContactDeleteRequest,
  ContactDownloadReasonRequest,
  ContactGroupCreateRequest, ContactGroupDepthType, ContactGroups,
  ContactGroupUpdateOrderRequest,
  ContactGroupUpdateRequest,
  ContactSearchRequest,
  ContactSearchResponse,
  ContactsRequest,
  ContactUpdateRequest,
  UpdateChangeType,
} from '@/components/text/types/contact';
import { contactKeys } from '@/components/text/queries/keys';

interface CreateContactsParams {
  schoolId: string;
  contacts: ContactsRequest;
}

interface CreateGroupParams {
  schoolId: string;
  group: ContactGroupCreateRequest;
}

interface UpdateGroupParams {
  schoolId: string;
  group: ContactGroupUpdateRequest;
  parentGroupId: string | null;
}

export const useBatchCreateContact = () => {
  const { isPending: createContactsAllPending, mutateAsync: createContactsAllMutateAsync } = useMutation({
    mutationFn: ({ schoolId, contacts }: CreateContactsParams) => createContactsAll(schoolId, contacts)
  });

  const { isPending: createContactsAllAddPending, mutateAsync: createContactsAllAddMutateAsync } = useMutation({
    mutationFn: ({ schoolId, contacts }: CreateContactsParams) => createContactsAllAdd(schoolId, contacts)
  });

  return {
    createContactsAllPending,
    createContactsAllMutateAsync,
    createContactsAllAddPending,
    createContactsAllAddMutateAsync,
  };
};

export const useContactGroup = (schoolId: string, isPermissionRequired: boolean) => {
  const { data, isError, error, isPending, isLoading } = useQuery({
    queryKey: isPermissionRequired ?
      contactKeys.groups(schoolId) :
      contactKeys.groupsForSend(schoolId),
    queryFn: () => (
      isPermissionRequired ?
        getContactGroups(schoolId) :
        getContactGroupsForSend(schoolId)
    ),
    retry: 0,
    staleTime: 1000 * 60 * 10,
    refetchOnMount: 'always'
  });

  return { groups: data?.groups || [], totalCount: data?.totalCount || 0, isError, error, isPending, isLoading };
};

export const useContactGroupMutation = () => {
  const queryClient = useQueryClient();

  const { isPending: createGroupPending, mutateAsync: createGroupMutateAsync } = useMutation({
    mutationFn: ({ schoolId, group }: CreateGroupParams) => createContactGroup(schoolId, group),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.groups(schoolId) }).then();
    },
  });

  const { isPending: updateGroupPending, mutateAsync: updateGroupMutateAsync } = useMutation({
    mutationFn: ({ schoolId, group, parentGroupId }: UpdateGroupParams) => updateContactGroupName(schoolId, group),
    onSuccess: (_, { schoolId, group, parentGroupId }) => {
      queryClient.setQueriesData(
        { queryKey: contactKeys.groups(schoolId) },
        (old: ContactGroups) => updateContactGroupNameCache(old, { parentGroupId, ...group })
      );
      queryClient.invalidateQueries({ queryKey: contactKeys.searchBase(schoolId) }).then();
    },
  });

  const { isPending: deleteGroupPending, mutateAsync: deleteGroupMutateAsync } = useMutation({
    mutationFn: ({ schoolId, groupId }: { schoolId: string; groupId: string }) => deleteContactGroup(schoolId, groupId),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.groups(schoolId) }).then();
      queryClient.invalidateQueries({ queryKey: contactKeys.searchBase(schoolId) }).then();
    },
  });

  const { isPending: updateGroupOrderPending, mutateAsync: updateGroupOrderMutateAsync } = useMutation({
    mutationFn: ({ schoolId, orderItems }: { schoolId: string; orderItems: ContactGroupUpdateOrderRequest }) => updateContactGroupOrder(schoolId, orderItems),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.groups(schoolId) }).then();
    }
  })

  return {
    createGroupPending,
    createGroupMutateAsync,
    updateGroupPending,
    updateGroupMutateAsync,
    deleteGroupPending,
    deleteGroupMutateAsync,
    updateGroupOrderPending,
    updateGroupOrderMutateAsync
  };
};

export const useContact = (schoolId: string, searchGroup: ContactSearchRequest, isPermissionRequired: boolean) => {
  const { data, isError, error, isPending, isLoading } = useQuery({
    queryKey: isPermissionRequired ?
      contactKeys.search(schoolId, searchGroup.groupId, searchGroup.keyword) :
      contactKeys.searchForSend(schoolId, searchGroup.groupId, searchGroup.keyword),
    queryFn: () => (
      isPermissionRequired ?
        getContact(schoolId, searchGroup) :
        getContactForSend(schoolId, searchGroup)
    ),
    retry: 0,
    staleTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
    refetchOnMount: 'always'
  });

  return { data, isError, error, isPending, isLoading };
};

export const useContactMutation = () => {
  const queryClient = useQueryClient();

  const { isPending: createContactPending, mutateAsync: createContactMutateAsync } = useMutation({
    mutationFn: ({ schoolId, contactForCreate, parentGroupId }: { schoolId: string; contactForCreate: ContactCreateRequest, parentGroupId: string }) =>
      createContact(schoolId, contactForCreate),
    onSuccess: (data, { schoolId, contactForCreate, parentGroupId }) => {
      queryClient.setQueriesData(
        {
          queryKey: contactKeys.searchBase(schoolId),
          predicate: (query) => {
            const [_contact, _search, _schoolId, filter] = query.queryKey as any;
            return filter?.groupId === contactForCreate.groupId;
          }
        },
        (old: ContactSearchResponse) =>
          updateContactSearchCache(old, 'add', { ...contactForCreate, contactId: data.contactId })
      );

      queryClient.setQueriesData(
        { queryKey: contactKeys.groups(schoolId) },
        (old: ContactGroups) =>
          updateContactGroupCache(old, 'add', {
            parentGroupId,
            groupId: contactForCreate.groupId,
            count: 1
          })
      );

      queryClient.invalidateQueries({ queryKey: contactKeys.changeHistory(schoolId, contactForCreate.groupId) }).then();
    },
  });

  const { isPending: updateContactPending, mutateAsync: updateContactMutateAsync } = useMutation({
    mutationFn: ({ schoolId, contactForUpdate, updatedField }: { schoolId: string; contactForUpdate: ContactUpdateRequest, updatedField: string }) =>
      updateContact(schoolId, contactForUpdate),
    onSuccess: (updatedContacts, { schoolId, contactForUpdate, updatedField }) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.changeHistoryBase(schoolId) }).then();

      const queryKey = contactKeys.searchBase(schoolId);
      queryClient.setQueriesData({ queryKey }, (oldData: ContactSearchResponse) => {
        const newContacts = oldData.contacts.map((contact) => {
          const target = updatedContacts.find(c => c.contactId === contact.contactId)
          if (!target) return contact;

          const isPhoneUpdate = phoneNumberFields.includes(updatedField);
          if (contactForUpdate.updateChangeType === UpdateChangeType.BATCH && isPhoneUpdate) {
            return {
              ...contact,
              phoneNumber: !isEmpty(contact.phoneNumber) ? target.phoneNumber : contact.phoneNumber,
              phoneNumberParent1: !isEmpty(contact.phoneNumberParent1) ? target.phoneNumberParent1 : contact.phoneNumberParent1,
              phoneNumberParent2: !isEmpty(contact.phoneNumberParent2) ? target.phoneNumberParent2 : contact.phoneNumberParent2,
            };
          }

          return {
            ...contact,
            [updatedField]: target[updatedField]
          };
        });

        return {
          ...oldData,
          contacts: newContacts
        };
      });
    },
  });

  const { isPending: deleteContactPending, mutateAsync: deleteContactMutateAsync } = useMutation({
    mutationFn: ({ schoolId, contactForDelete, parentGroupId }: { schoolId: string; contactForDelete: ContactDeleteRequest, parentGroupId: string }) =>
      deleteContact(schoolId, contactForDelete),
    onSuccess: (_, { schoolId, contactForDelete, parentGroupId }) => {
      queryClient.setQueriesData(
        { queryKey: contactKeys.searchBase(schoolId) },
        (old: ContactSearchResponse) => updateContactSearchCache(old, 'delete', contactForDelete)
      );

      if (parentGroupId) {
        queryClient.setQueriesData(
          { queryKey: contactKeys.groups(schoolId) },
          (old: ContactGroups) => updateContactGroupCache(old, 'delete', {
            parentGroupId,
            groupId: contactForDelete.groupId,
            count: contactForDelete.contactIds.length
          })
        );
      } else {
        queryClient.invalidateQueries({ queryKey: contactKeys.groups(schoolId) }).then();
      }

      queryClient.invalidateQueries({ queryKey: contactKeys.changeHistoryBase(schoolId) }).then();
    },
  });

  return {
    createContactPending,
    createContactMutateAsync,
    updateContactPending,
    updateContactMutateAsync,
    deleteContactPending,
    deleteContactMutateAsync
  };
};

export const useContactDownloadReasonMutation = () => {
  const { isPending: createReasonPending, mutateAsync: createReasonMutateAsync } = useMutation({
    mutationFn: ({ schoolId, reasonItem }: { schoolId: string; reasonItem: ContactDownloadReasonRequest }) =>
      createContactDownloadReason(schoolId, reasonItem)
  });

  return { createReasonPending, createReasonMutateAsync }
}

export const useContactChangeHistory = (schoolId: string, groupId: string) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: contactKeys.changeHistory(schoolId, groupId),
    queryFn: ({ pageParam }) => {
      return getContactChangeHistory(schoolId, groupId, pageParam)
    },
    staleTime: 1000 * 60 * 10,
    initialPageParam: 0,
    getNextPageParam: (last) => {
      const { number, totalPages } = last.page;
      if (number + 1 < totalPages) return number + 1;
      return undefined;
    }
  });

  return { pages: data?.pages, fetchNextPage, hasNextPage, isFetchingNextPage };
};

const updateContactSearchCache = (
  oldData: ContactSearchResponse,
  action: 'add' | 'delete',
  payload: any
): ContactSearchResponse => {
  if (!oldData) return oldData;

  let newContacts = [...oldData.contacts];
  if (action === 'delete') {
    newContacts = newContacts.filter(c => !payload.contactIds.includes(c.contactId));
  } else {
    newContacts = [...newContacts, payload];
  }

  return {
    ...oldData,
    totalCount: newContacts.length,
    contacts: newContacts,
  };
};

const updateContactGroupCache = (
  oldData: ContactGroups,
  action: 'add' | 'delete',
  { parentGroupId, groupId, count }: { parentGroupId: string; groupId: string; count: number }
): ContactGroups => {
  if (!oldData) return oldData;

  const diff = action === 'delete' ? -count : count;

  return {
    ...oldData,
    totalCount: Math.max(oldData.totalCount + diff, 0),
    groups: oldData.groups.map(g => {
      if (g.groupId !== parentGroupId) return g;

      return {
        ...g,
        count: Math.max(g.count + diff, 0),
        children: g.children.map(c => {
          if (c.groupId !== groupId) return c;
          return { ...c, count: Math.max(c.count + diff, 0) };
        }),
      };
    }),
  };
};

const updateContactGroupNameCache = (
  oldData: ContactGroups,
  { parentGroupId, groupId, groupName, depthType }: { parentGroupId: string; groupId: string; groupName: string, depthType: ContactGroupDepthType }
): ContactGroups => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    groups: oldData.groups.map(g => {
      if (g.groupId !== parentGroupId) return g;

      return {
        ...g,
        groupName: depthType === ContactGroupDepthType.DEPTH1 ? groupName : g.groupName,
        children: g.children.map(c => {
          if (c.groupId !== groupId) return c;
          return { ...c, groupName: depthType === ContactGroupDepthType.DEPTH2 ? groupName : c.groupName };
        })
      };
    })
  };
};
