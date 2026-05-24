import { 
   useMutation, 
   useQuery,
   useQueryClient,
   keepPreviousData,
} from '@tanstack/react-query';
import { PermissionSort  } from '../types';
import { 
   postTextManagers, 
   patchTextManagersPermission, 
   patchTextManagersRemove, 
   postTextManagersEletter, 
   postTextManagersSearch
} from '../api';
import { SimplePermission } from '../constants';
import { toPermissions } from '../utils/permission';
import { permissionKeys } from '@/components/text/queries/keys';

export const useTextManagersSearch = (schoolId: string, sort?: PermissionSort) => {
   const { data, isError, isPending, isLoading } = useQuery({
      queryKey: permissionKeys.searchManagers(schoolId, sort),
      queryFn: () => postTextManagersSearch(schoolId, sort),
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      placeholderData: keepPreviousData,
   });

   return { data, isError, isPending, isLoading };
};

export const useTextManagersSearchInvalidate = () => {
   const queryClient = useQueryClient();

   const invalidateTextResult = (schoolId: string, sort?: PermissionSort) => {
      return queryClient.invalidateQueries({ queryKey: permissionKeys.searchManagers(schoolId, sort) });
   };

   return invalidateTextResult;
};

export const useTextManagersEletter = (schoolId: string) => {
   const { data, refetch } = useQuery({
      queryKey: permissionKeys.searchEletterManagers(schoolId),
      queryFn: () => postTextManagersEletter(schoolId),
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
   });

   return { data, refetch };
};

export const useTextManagersMutation = () => {
   const queryClient = useQueryClient();

   const { isPending: addManagersPending, mutateAsync: addManagersMutateAsync } = useMutation({
      mutationFn: ({ schoolId, userIds }: { schoolId: string; userIds: string[] }) => postTextManagers(schoolId, userIds),
      onSuccess: (_, { schoolId }) => {
         queryClient.invalidateQueries({ queryKey: permissionKeys.searchManagersBase(schoolId) }).then();
      },
   });

   const { isPending: updatePermissionPending, mutateAsync: updatePermissionMutateAsync } = useMutation({
      mutationFn: ({ schoolId, userId, permission }: { schoolId: string; userId: string, permission: SimplePermission }) => patchTextManagersPermission(schoolId, userId, toPermissions(permission)),
      onSuccess: (_, variables) => {
         const { schoolId, userId, permission } = variables;
         queryClient.setQueriesData(
            { queryKey: permissionKeys.searchManagersBase(schoolId) } , (oldData: any) => {
            const newList = oldData.lists.map((manager) => {
               if (manager.userId === userId) {
                  return {
                     ...manager,
                     permissions: toPermissions(permission), 
                  };
               }
               return manager;
            });
            return {
               lists: newList
            };
         });
      },
   });

   const { isPending: removeManagersPending, mutateAsync: removeManagersMutateAsync } = useMutation({
      mutationFn: ({ schoolId, userIds }: { schoolId: string; userIds: string[] }) => patchTextManagersRemove(schoolId, userIds),
      onSuccess: (_, { schoolId }) => {
         queryClient.invalidateQueries({ queryKey: permissionKeys.searchManagersBase(schoolId) }).then();
         queryClient.invalidateQueries({ queryKey: permissionKeys.searchEletterManagers(schoolId) }).then();
      },
   });

   return {
      addManagersMutateAsync,
      updatePermissionMutateAsync,
      removeManagersMutateAsync,
   };
};