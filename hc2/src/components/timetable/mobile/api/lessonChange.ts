import { Hc2Timetables } from "."
import { Core } from "../types";


const api = new Hc2Timetables();

export const requestExchangeForTeacher = async (timetableId: string, exchangeDailyLessons: Core.DailyLesson[], reason: string) => {
  const result = await api.requestExchangeForTeacherExchangerequests(timetableId, {
    timetableId,
    reason,
    exchangeDailyLessons,
    status: undefined,
  });

  return result.data;
}

export const requestAdjustmentForTeacher = async (timetableId: string, sourceLesson: Core.DailyLesson, targetTeacherId: string, reason: string) => {
  return await api.requestAdjustmentForTeacherAdjustmentrequests(timetableId, {
    reason,
    sourceLesson,
    targetTeacherId,
    status: undefined,
  });  
}

export const requestReplacementForTeacher = async (timetableId: string, sourceLesson: Core.DailyLesson, targetLesson: Core.DailyLesson, reason: string) => {
  return await api.requestReplacementForTeacherReplacementrequests(timetableId, {
    reason,
    sourceLesson,
    targetLesson,
    status: undefined,
  });  
}

export const requestAdditionForTeacher = async (timetableId: string, targetLesson: Core.DailyLesson, reason: string) => {
  return await api.requestAdditionForTeacherAdditionrequests(timetableId, {
    reason,
    targetLesson,
    status: undefined,
  });  
}