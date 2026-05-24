import {
   useInfiniteQuery,
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from '@tanstack/react-query';
import {
   postTextSendResult,
   postTextSendResultMessage,
   patchDeleteTextSendMessage,
   patchUpdateStatusTextSendMessage,
   postTextSendResultMessageResultType,
} from '@/components/text/api';
import { ResultType, SendResultSort } from '../types';
import { sendKeys, sendResultKeys } from '@/components/text/queries/keys';
import { replaceWeblinkContent } from '../utils';

export const useTextSendResultInvalidate = () => {
   const queryClient = useQueryClient();

   const invalidateTextResult = (schoolId: string, sort?: SendResultSort) => {
      return queryClient.invalidateQueries({ queryKey: sendResultKeys.search(schoolId, sort) });
   };

   return invalidateTextResult;
};

export const useTextSendResult = (schoolId: string, sort?: SendResultSort) => {
   const {
      data,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
   } = useInfiniteQuery({
      queryKey: sendResultKeys.search(schoolId, sort),
      queryFn: ({ pageParam }) => {
         return postTextSendResult(schoolId, pageParam, sort);
      },
      staleTime: 1000 * 60 * 10,
      initialPageParam: 0,
      refetchOnMount: 'always',
      placeholderData: keepPreviousData,
      getNextPageParam: (last) => {
         const { number, totalPages } = last.page;
         if (number + 1 < totalPages) return number + 1;
         return undefined;
      }
   });

   return { pages: data?.pages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading };
};

export const useUpdateTextSendResultMessage = () => {
   const queryClient = useQueryClient();

   const { isPending: deleteMessagePending, mutateAsync: deleteTextSendResultMessageMutateAsync } = useMutation({
      mutationFn: ({ schoolId, messageIds }: { schoolId: string; messageIds: string[] }) => patchDeleteTextSendMessage(schoolId, messageIds),
      onSuccess: (_, { schoolId }) => {
         queryClient.invalidateQueries({ queryKey: sendResultKeys.searchBase(schoolId) }).then();
      },
   });

   const { isPending: updateStateMessagePending, mutateAsync: updateStateTextSendResultMessageMutateAsync } = useMutation({
      mutationFn: ({ schoolId, messageId }: { schoolId: string; messageId: string }) => patchUpdateStatusTextSendMessage(schoolId, messageId),
      onSuccess: (_, { schoolId, messageId }) => {
         queryClient.invalidateQueries({ queryKey: sendResultKeys.searchBase(schoolId) }).then();
         queryClient.invalidateQueries({ queryKey: sendKeys.info(schoolId) }).then();
         queryClient.invalidateQueries({ queryKey: sendResultKeys.detail(schoolId, messageId) }).then();
      },
   });

   return {
      deleteMessagePending,
      deleteTextSendResultMessageMutateAsync,
      updateStateMessagePending,
      updateStateTextSendResultMessageMutateAsync,
   };
};

export const useTextSendResultMessage = (schoolId: string, messageId: string, enabled: boolean) => {
   const { data, isError, isPending } = useQuery({
      queryKey: sendResultKeys.detail(schoolId, messageId),
      queryFn: () => postTextSendResultMessage(schoolId, messageId),
      retry: 1,
      refetchOnMount: 'always',
      enabled: enabled,
      select: (res) => {
         if (res?.isWeblink && res?.weblinkCode && res?.content) {
            const cleanContent = replaceWeblinkContent(res.content);
            return { ...res, content: cleanContent };
         }
         return res;
      }
   });

   return { data, isError, isPending };
};

export const useTextSendResultDetailInvalidate = () => {
   const queryClient = useQueryClient();

   const invalidateResult = (schoolId: string, messageId: string) => {
      return queryClient.invalidateQueries({
         queryKey: sendResultKeys.detail(schoolId, messageId)
      });
   };

   const invalidateResultType = (schoolId: string, messageId: string, resultType: ResultType) => {
      return queryClient.invalidateQueries({
         queryKey: sendResultKeys.detailResultType(schoolId, messageId, resultType)
      });
   };

   return {
      invalidateResult,
      invalidateResultType
   }
};

export const useTextSendResultMessageResultType = (schoolId: string, messageId: string, resultType: ResultType, isEnabled: boolean) => {
   const {
      data,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
   } = useInfiniteQuery({
      queryKey: sendResultKeys.detailResultType(schoolId, messageId, resultType),
      queryFn: ({ pageParam }) => {
         return postTextSendResultMessageResultType(pageParam, schoolId, messageId, resultType);
      },
      staleTime: 0,
      refetchOnMount: 'always',
      initialPageParam: 0,
      getNextPageParam: (last) => {
         const { number, totalPages } = last.page;
         if (number + 1 < totalPages) return number + 1;
         return undefined;
      },
      enabled: isEnabled
   });

   return { pages: data?.pages, fetchNextPage, hasNextPage, isFetchingNextPage };
};