import { useInfiniteQuery } from '@tanstack/react-query';
import { getChangeHistoryCancelledData, getChangeHistoryCompletedData, getChangeHistoryPendingData } from '../api';
import { lessonChangeHistoryKeys } from './keys';

export const useLessonPendingChangeHistory = (timetableId: string) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: lessonChangeHistoryKeys.list(timetableId, 'pending'),
    queryFn: ({ pageParam }) => {
      return getChangeHistoryPendingData(timetableId, pageParam);
    },
    staleTime: 1000 * 60 * 10,
    initialPageParam: 0,
    getNextPageParam: (last) => {
      const { number, totalPages } = last.page;
      if (number + 1 < totalPages) {
        return number + 1;
      }
      return undefined;
    },
  });

  return { pages: data?.pages, fetchNextPage, hasNextPage, isFetchingNextPage, refetch };
};

export const useLessonCompletedChangeHistory = (timetableId: string) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: lessonChangeHistoryKeys.list(timetableId, 'completed'),
    queryFn: ({ pageParam }) => {
      return getChangeHistoryCompletedData(timetableId, pageParam);
    },
    staleTime: 1000 * 60 * 10,
    initialPageParam: 0,
    getNextPageParam: (last) => {
      const { number, totalPages } = last.page;
      if (number + 1 < totalPages) {
        return number + 1;
      }
      return undefined;
    },
  });

  return { pages: data?.pages, fetchNextPage, hasNextPage, isFetchingNextPage, refetch };
};

export const useLessonCancelledChangeHistory = (timetableId: string) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: lessonChangeHistoryKeys.list(timetableId, 'cancelled'),
    queryFn: ({ pageParam }) => {
      return getChangeHistoryCancelledData(timetableId, pageParam);
    },
    staleTime: 1000 * 60 * 10,
    initialPageParam: 0,
    getNextPageParam: (last) => {
      const { number, totalPages } = last.page;
      if (number + 1 < totalPages) {
        return number + 1;
      }
      return undefined;
    },
  });

  return { pages: data?.pages, fetchNextPage, hasNextPage, isFetchingNextPage, refetch };
};