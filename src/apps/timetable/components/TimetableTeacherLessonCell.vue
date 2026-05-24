<template>
  <button v-if="lesson" type="button" :class="itemClass"><!-- 고정수업 class -->
    <div class="badges">
      <span v-if="isConcurrentCourse" class="badge concurrent">동시</span>
      <span v-if="isFixedCourse" class="badge fixed">고정</span>
      <span v-if="false && isCombinedClass" class="badge joint">합반</span><!-- 2025.11.20, notbadlife: 오픈범위에서 미노출 처리 -->
    </div>
    <div class="class-name">{{ className }}</div>
    <div class="course-name">{{ courseName }}</div>
  </button>
</template>

<script setup lang="ts">
import { computed, defineProps, inject, onMounted, ref } from 'vue';
import { Class, Course, Lesson, ValidStatusType } from '../core/types';
import { ConcurrentConfContext, ContextKeys, LessonContext, SpecialtyRoomContext, TimetableClassContext, TimetableCourseContext, TimetableGradeContext } from '../contexts';
import { TimetableDisplayUtils } from '../common/utils';
import Timetable from '../core';
import { LessonCell } from '../common/types';

const props = defineProps<{
  dayOfWeek: number; // 요일
  period: number; // 시간
  teacherId?: string; // 교사 ID
  // lesson?: Lesson; // Lesson 타입의 수업 정보
  lesson?: LessonCell; // Lesson 타입의 수업 정보
  isExchangeSource?: boolean; // 교환 수업 여부
  isExchangeTarget?: boolean; // 교환 대상 수업 여부
}>();

const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const concurrentConContext = inject(ContextKeys.ConcurrentConf) as ConcurrentConfContext;
const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;
const specialtyRoomContext = inject(ContextKeys.SpecialtyRoom) as SpecialtyRoomContext

const classMap = computed(() => classContext.classMap);
const courseMap = computed(() => courseContext.courseMap);
const concurrentConfMap = computed(() => concurrentConContext.concurrentConfMap);
const specialtyRoomMap = computed(() => specialtyRoomContext.specialtyRoomMap);
const lesson = computed(() => props.lesson);

const course = ref<Course>();
const concurrentCourse = ref<Course>();
const cls = ref<Class>();
// const consecutiveGroupLessons = ref<Record<string, Lesson[]>>({});
const isFirstConsecutiveLesson = ref(false);

const itemClass = computed(() => {
  return {
    'btn-table-cell': true,
    'fixed-course': isFixedCourse.value,
    'consecutive-course': isConsecutiveGroup.value,
    'fst': isFirstConsecutiveLesson.value, // 연속 그룹의 첫번째 수업만 'fst' 추가
    'assign-before': props.isExchangeSource,
    'assign-after': props.isExchangeTarget,
    'assign-complete no-pointer-events': isHighlighted.value
  };
});

onMounted(() => {
  if (props.lesson) {
    course.value = courseMap.value[props.lesson.courseId];
  }

  if(props.lesson?.concurrentCourseId) {
    concurrentCourse.value = courseMap.value[props.lesson.concurrentCourseId];
  }

  if (props.lesson?.classId) {
    cls.value = classContext.classMap[props.lesson.classId];
  }

  isFirstConsecutiveLesson.value = checkIsFirstConsecutiveLesson();
});

const checkIsFirstConsecutiveLesson = () => {
  if(!props.lesson?.consecutiveGroupId || !props.lesson?.lessonTeachers || props.lesson.lessonTeachers.length === 0) {
      return false;
  }

  const consecutiveGroupId = props.lesson.consecutiveGroupId;
  const firstPeriod = lessonContext.firstPeriodOfConsecutiveLessons[consecutiveGroupId];

  if (!firstPeriod) {
    return false;
  }

  return firstPeriod === props.lesson.period;
};

const isHighlighted = computed(() => props.lesson?.isHighlighted || false);

const isFixedCourse = computed(() => {
  return props.lesson?.isFixedCourse || false;
});

const isConcurrentCourse = computed(() => {
  return props.lesson?.concurrentCourseId || false;
});

const isConsecutiveGroup = computed(() => {
  return props.lesson?.consecutiveGroupId || false;
});

const isCombinedClass = computed(() => {
  if(!props.lesson?.concurrentCourseId) {
    return false;
  }
  const concurrentConf = concurrentConfMap.value[props.lesson?.concurrentCourseId] || {};
  return concurrentConf?.isCombinedClass || false;
});

const courseName = computed(() => {
  const { displayedTitle: concurrentCourseTitle } = concurrentCourse.value || {};
  const { displayedTitle } = course.value || {};

  const roomName = lesson.value?.specialtyRoomId ? (` (${specialtyRoomMap.value[lesson.value?.specialtyRoomId]?.roomName})` || '') : '';  
  
  if (concurrentCourseTitle) {
    const { displayedTitle: concurrentCourseTitle } = concurrentCourse.value || {};
    return `${concurrentCourseTitle} ${displayedTitle}${roomName}`;
  }

  return `${displayedTitle}${roomName}` || '';
});

const className = computed(() => {
  // 합반 수업인 경우, 모든 반 이름을 표시
  if(lesson.value?.lessonClasses && lesson.value.lessonClasses.length > 1) {
    // lessonClasses가 2개 이상 전달된 경우를 합반으로 본다
    return lesson.value.lessonClasses.map(classId => {
      return classMap.value[classId];      
    })
    .sort((a, b) => {
      //학년, 반 순으로 정렬
      if(a.grade !== b.grade) {
        return a.grade - b.grade;
      }
      return a.classNumber - b.classNumber;
    })
    .map(cls => TimetableDisplayUtils.formatFullClassName(cls))
    .join(', ');
  }

  if (!cls.value) {
    return '';
  }
  
  return TimetableDisplayUtils.formatFullClassName(cls.value);
});


</script>

<style lang="scss" scoped>
.no-pointer-events {
  pointer-events: none;
}
</style>