import { useQuery } from "@tanstack/react-query"
import { dailyLessonKeys } from "./keys"
import { getDailyLessonsBetweenDates } from "../api"

export const useDailyLessonsBetweenDates = (timetableId: string, startDate: number, endDate: number) => {
  const { data, isError, isPending, isLoading } = useQuery({
    queryKey: dailyLessonKeys.searchBetweenDates(timetableId, startDate, endDate),
    queryFn: () => getDailyLessonsBetweenDates(timetableId, startDate, endDate),
    retry: 1,
    staleTime: 0,
    refetchOnMount: true,
  });

  return { data, isError, isPending, isLoading };
}