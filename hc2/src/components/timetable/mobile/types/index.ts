export * from '../../common/types';
export * as Core from '../../core/types';
export { DailyTimetable } from '../../core';

export interface TimetableMobileProps {
  teacherId?: string;
  lessonDate?: number;
  timetableId?: string;
  className?: string;
}

export type WeekRange = {
  startDate: number;  // 주 시작 날짜 (예: 20240506)
  endDate: number;    // 주 끝 날짜 (예: 20240510)
}

export const withWeekRange =(range: WeekRange) => {
  return {
    ...range,
    empty() {
      return this.startDate === 0 || this.endDate === 0;
    },
    contain(date: number) {
      return date >= range.startDate && date <= range.endDate;
    }
  }
}