import { useMutation } from "@tanstack/react-query"
import { 
  requestExchangeForTeacher,
  requestAdjustmentForTeacher,
  requestReplacementForTeacher,
  requestAdditionForTeacher
} from "../api"
import { Core } from "../types";


export const useRequestExchangeForTeacher = () => {
  const mutation = useMutation({
    mutationFn: ({ timetableId, exchangeDailyLessons, reason, }: {
      timetableId: string;
      exchangeDailyLessons: Core.DailyLesson[];
      reason: string;
    }) => requestExchangeForTeacher(timetableId, exchangeDailyLessons, reason),
  });

  return {
    requestExchangeForTeacher: mutation.mutateAsync,
    ...mutation,
  };
}


export const useRequestAdjustmentForTeacher = () => {
  const mutation = useMutation({
    mutationFn: ({ timetableId, sourceLesson, targetTeacherId, reason }: {
      timetableId: string;
      sourceLesson: Core.DailyLesson;
      targetTeacherId: string;
      reason: string;
    }) => requestAdjustmentForTeacher(timetableId, sourceLesson, targetTeacherId, reason),
  });

  return {
    requestAdjustmentForTeacher: mutation.mutateAsync,
    ...mutation,
  };
}

export const useRequestReplacementForTeacher = () => {
  const mutation = useMutation({
    mutationFn: ({ timetableId, sourceLesson, targetLesson, reason }: {
      timetableId: string;
      sourceLesson: Core.DailyLesson;
      targetLesson: Core.DailyLesson;
      reason: string;
    }) => requestReplacementForTeacher(timetableId, sourceLesson, targetLesson, reason),
  });

  return {
    requestReplacementForTeacher: mutation.mutateAsync,
    ...mutation,
  };
}

export const useRequestAdditionForTeacher = () => {
  const mutation = useMutation({
    mutationFn: ({ timetableId, targetLesson, reason }: {
      timetableId: string;
      targetLesson: Core.DailyLesson;
      reason: string;
    }) => requestAdditionForTeacher(timetableId, targetLesson, reason),
  });

  return {
    requestAdditionForTeacher: mutation.mutateAsync,
    ...mutation,
  };
}
