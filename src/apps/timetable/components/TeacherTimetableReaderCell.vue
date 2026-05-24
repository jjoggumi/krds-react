<template>
  <div :class="itemClass" class="relative-position">
    <div :class="courseNameClass">{{ courseName }}</div>
    <div :class="subTitleClass">
      {{ className }}
    </div>

    <div v-if="isTeacherFreePeriod" class="free-period-title">수업 빼기</div>
  </div>
</template>

<script setup lang="ts">
import { Lesson } from '@/apps/timetable/core/types';
import { computed, inject } from 'vue';

import { 
  ContextKeys,
  TimetableClassContext,
  TimetableCourseContext,
} from '../contexts';


const props = defineProps<{
  lesson: Lesson | undefined;
  isTeacherFreePeriod: boolean;
}>();


const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;

const courseMap = computed(() => courseContext.courseMap);
const classMap = computed(() => classContext.classMap);

const course = computed(() => {
  if (!props.lesson) {
    return null;
  }

  return courseMap.value[props.lesson.courseId];
});

const cls = computed(() => {
  if (!props.lesson) {
    return null;
  }

  return classMap.value[props.lesson.classId];
});

const courseName = computed(() => {
  const { concurrentCourseId } = props.lesson || {};
  const { displayedTitle, isConcurrent } = course.value || {};

  if (concurrentCourseId) {
    const concurrentCourse = courseMap.value[concurrentCourseId];
    return `${displayedTitle} (${concurrentCourse.displayedTitle})`;
  }

  return displayedTitle;
});

const className = computed(() => {
  if (!cls.value) {
    return '';
  }

  const { grade, classNumber, isVirtual } = cls.value;
  const classType = isVirtual ? '가상 ' : '';

  return `${classType}${grade}0${classNumber}`;
});

const itemClass = computed(() => {
  const { concurrentCourseId } = props.lesson || {};
  return {
    'timetable-lesson-item': true,
    'concurrent-course': concurrentCourseId,
    'free-period': props.isTeacherFreePeriod,
  };
});

const courseNameClass = computed(() => {
  const { consecutiveGroupId } = props.lesson || {};
  return {
    'course-name': true,
    'consecutive-course-name': consecutiveGroupId,
  };
});

const subTitleClass = computed(() => {
  return {
    'sub-title': true,
  };
});
</script>

<style scoped>
.timetable-lesson-item {
  padding: 5px;
  font-size: 0.75rem;
  color: #2c3e50;
  height: 100%;
}

.concurrent-course {
  background-color: #fefcee;
  /* background-color: #fcf3cf; */
}

.course-name {
  font-size: 0.75rem;
  font-weight: bold;
}

.sub-title {
  font-size: 0.625rem;
  color: #34495e;
}

.consecutive-course-name {
  color: #cd5c5c;
}

.free-period {
  background-color: #e0e0e0 !important;
  height: 100%;
}

.free-period-title {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #333333 !important;
  font-weight: bold;
}
</style>
