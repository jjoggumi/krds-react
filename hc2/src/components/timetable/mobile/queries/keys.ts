
export const dailyLessonKeys = {
  all: ['dailyLessons'],
  searchBetweenDates: (timetableId: string, startDate: number, endDate: number) => [...dailyLessonKeys.all, 'searchBetweenDates', timetableId, startDate, endDate],
}

export const lessonChangeHistoryKeys = {
  all: ['lessonChangeHistory'],
  list: (timetableId: string, status: string) => [...lessonChangeHistoryKeys.all, 'list', timetableId, status],
}
