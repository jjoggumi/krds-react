import { Hc2Timetables } from "."
import { Core } from "../types";
import { EmbeddedListResponse } from "../types";

const api = new Hc2Timetables();

export const getDailyLessonsBetweenDates = async (timetableId: string, startDate: number, endDate: number) => {
  if(!timetableId || !startDate || !endDate) {
    return [];
  }
  
  const res = await api.getTimetableDailyLessonsBetweenDatesStartDateEndDate(timetableId, startDate, endDate);
  const { dailyLessons } = (res.data as EmbeddedListResponse<Core.DailyLesson>)._embedded;
  return dailyLessons || [];
}