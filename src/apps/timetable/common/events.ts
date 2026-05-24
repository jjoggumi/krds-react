export const TIMETABLE_EVENTS = {
  LESSON_CHANGE_REQUEST_COUNT_REFRESH: 'hc2:timetable-lesson-change-request-count-refresh',
} as const;

export const dispatchLessonChangeRequestCountRefresh = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(TIMETABLE_EVENTS.LESSON_CHANGE_REQUEST_COUNT_REFRESH)
  );
};
