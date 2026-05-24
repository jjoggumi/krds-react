import { useSyncExternalStore } from "react";

import TimetableGradeContext from "./timetableGradeContext";
import TimetableClassContext from "./timetableClassContext";
import TimetableTeacherContext from "./timetableTeacherContext";
import TeacherCourseBaseContext from "./timetableTeacherCourseBaseConfContext";
import TimetableCourseContext from "./timetableCourseContext";
import TimetableCourseBaseContext from "./timetableCourseBaseContext";
import TeacherCourseContext from "./timetableTeacherCourseContext";
import TimetableLessonConfContext from "./timetableLessonConfContext";
import DailyLessonContext from "./dailyLessonContext";
import TimetableSpecialtyRoomContext from "./timetableSpecialtyRoomContext";
import TimetableConcurrentConfContext from "./timetableConcurrentConfContext";
import TimetableOverviewContext from "./timetableOverviewContext";

import { 
  Class,
  Course,
  Teacher,
  TeacherCourse,
  TimetableConfig,
  LessonConf,
  SpecialtyRoom,
  ConcurrentConf,
  TeacherCourseBase,
  CourseBase,
  TimetableOverview } from "../core/types";

export { 
  TimetableGradeContext,
  TimetableClassContext, 
  TimetableTeacherContext,
  TimetableCourseContext,
  TimetableLessonConfContext,
  TeacherCourseContext,
  DailyLessonContext,
  TimetableSpecialtyRoomContext,
  TimetableConcurrentConfContext,
  TeacherCourseBaseContext,
  TimetableCourseBaseContext,
  TimetableOverviewContext,
};

export function useGradeContext(): TimetableConfig {
  const context = TimetableGradeContext.getInstance();
  return useSyncExternalStore(
    context.subscribe,
    context.getSnapshot,
  );
}

export function useClassContext(): Class[] {
  const context = TimetableClassContext.getInstance();
  return useSyncExternalStore(
    context.subscribe,
    context.getSnapshot,
  );
}

export function useTeacherContext(): Teacher[] {
  const context = TimetableTeacherContext.getInstance();
  return useSyncExternalStore(
    context.subscribe,
    context.getSnapshot,
  );
}

export function useCourseContext(): Course[] {
  const context = TimetableCourseContext.getInstance();
  return useSyncExternalStore(
    context.subscribe,
    context.getSnapshot,
  );
}

export function useTeacherCourseContext(): TeacherCourse[] {
  const context = TeacherCourseContext.getInstance();
  return useSyncExternalStore(
    context.subscribe,
    context.getSnapshot,
  );
}

export function useDailyLessonContext(): DailyLessonContext {
  const context = DailyLessonContext.getInstance();
  return useSyncExternalStore(
    context.subscribe,
    context.getSnapshot,
  );
}

export function useLessonConfContext(): LessonConf[] {
  const context = TimetableLessonConfContext.getInstance();
  return useSyncExternalStore(
    context.subscribe,
    context.getSnapshot,
  );
}

export function useSpecialtyRoomContext(): SpecialtyRoom[] {
  const context = TimetableSpecialtyRoomContext.getInstance();
  return useSyncExternalStore(
    context.subscribe,
    context.getSnapshot,
  );
}

export function useConcurrentConfContext(): ConcurrentConf[] {
  const context = TimetableConcurrentConfContext.getInstance();
  return useSyncExternalStore(
    context.subscribe,
    context.getSnapshot,
  );
}

export function useTeacherCourseBaseContext(): TeacherCourseBase[] {
  const context = TeacherCourseBaseContext.getInstance();
  return useSyncExternalStore(
    context.subscribe,
    context.getSnapshot,
  );
}

export function useCourseBaseContext(): CourseBase[] {
  const context = TimetableCourseBaseContext.getInstance();
  return useSyncExternalStore(
    context.subscribe,
    context.getSnapshot,
  );
}

export function useTimetableOverviewContext(): TimetableOverview {
  const context = TimetableOverviewContext.getInstance();
  return useSyncExternalStore(
    context.subscribe,
    context.getSnapshot,
  );
}