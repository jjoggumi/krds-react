import { TimetableStatus, ValidStatusType } from "../core/types";

export const DAILY_SCHEDULE_DEFAULTS:  {
  startPeriod: number;
  maxPeriod: number;
  startTime: string;
  classDuration: number;
  breakDuration: number;
  lunchDuration: number;
  isDisplayDailyScheduleTime: boolean;
  isDisplayLunchTime: boolean;
} = {
  startPeriod: 1,
  maxPeriod: 8,
  startTime: "0900",
  classDuration: 45,
  breakDuration: 10,
  lunchDuration: 60,
  isDisplayDailyScheduleTime: true,
  isDisplayLunchTime: true,
} as const;

export enum ClassDayStatus {
  ACTIVATED = 1,
  DEACTIVATED = 0,
}

export const DAYS_OF_WEEK = [
  { index: 1, title: '월' },
  { index: 2, title: '화' },
  { index: 3, title: '수' },
  { index: 4, title: '목' },
  { index: 5, title: '금' },
  { index: 6, title: '토' },
  { index: 0, title: '일' },
] as const;

export const VALID_STATUS_COUNT_TYPE_TITLE = {
  [ValidStatusType.SameTeacherSameCourse]: '같은교사 같은과목 중복',
  [ValidStatusType.DifferentTeacherSameCourse]: '같은과목 다른교사 중복',
  [ValidStatusType.SameTeacherDifferentCourse]: '다른과목 같은교사 중복',  
  [ValidStatusType.OverloadedTeacher]: '1일 5시간 이상 배정 교사',
  [ValidStatusType.MissingDayAssigned]: '1일 0시간 배정 교사',
  [ValidStatusType.SameDayThreeCourse]: '같은요일 3개 과목 배정 교사',
  [ValidStatusType.BalancedCourseAssignment]: '교과별 순배 확인 필요',
  [ValidStatusType.ConsecutiveHourLimitExceed]: '연속 3시간 이상 배정',
  [ValidStatusType.LunchBreakOverlap]: '점심시간 전후 연속 배정',
  [ValidStatusType.FirstPeriodExceed]: '1교시 3회 이상 교사',
  [ValidStatusType.RepeatedFirstPeriod]: '1교시 연속 2회 이상 교사',
  [ValidStatusType.amPmConflictCount]: '학급별 오전 오후 균형 확인',
};


export const TimetableStatusIndexMap: Record<TimetableStatus, number> = {
  [TimetableStatus.Init]: 0,
  [TimetableStatus.WeeklyPeriod]: 1,
  [TimetableStatus.CourseBase]: 2,
  [TimetableStatus.Teacher]: 3,
  [TimetableStatus.LessonConfig]: 4,
  [TimetableStatus.AdditionalWork]: 5,
  [TimetableStatus.Generate]: 6,
  [TimetableStatus.Finish]: 7,
  [TimetableStatus.Edit]: 5,
};
