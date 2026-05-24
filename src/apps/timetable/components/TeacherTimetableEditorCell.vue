<template>
  <div :class="itemClass" @click="handleClick" class="relative-position">
    <template v-if="isGradeFreePeriod">
      <div class="grade-free-period-contents">수업 없음</div>
    </template>

    <div class="absolute-right">
      <q-btn
        v-if="isShowDeleteButton"
        flat
        dense
        round
        color="white"
        text-color="grey-9"
        size="sm"
        label="X"
        icon="clear"
        @click="(event) => handleClickDeleteButton(event)"
      />
    </div>
    <div :class="titleClass">
      {{ title }}
    </div>
    <div :class="subTitleClass">
      {{ subTitle }}
    </div>
    <div v-if="isFreePeriod" class="free-period-title">수업 빼기</div>
  </div>
</template>

<script setup lang="ts">
// quasar 를 흉내낸 임시 컴포넌트 -->
import QBtn from '@/apps/timetable/q-temp/QBtn.vue';
// <-- quasar 를 흉내낸 임시 컴포넌트

import { computed, inject } from 'vue';

import { Lesson, TimetableEditState } from '@/apps/timetable/core/types';
// import Timetable from '@/apps/timetable/core';
import { TimetableDataUtils } from '@/apps/timetable/core/mod/utils';
import { EditorCellLesson } from '@/apps/timetable/common/types';
import { ContextKeys, TimetableClassContext, TimetableCourseContext, TimetableTeacherContext } from '../contexts';
// defineOptions({  name: 'TeacherTimetableEditorCell',});


/*
 * 2025.01.31, hyunkyung.kim,
 * - 상태관리가 추가된 경우, 해당 props 중 상태로 변경 가능한 것들을 추릴것.
 * - 현재 빠른 구현을 위해 상태 관리를 따로두지 않아 props가 과다해짐...
 */
const props = defineProps<{
  dayOfWeek?: number;
  period?: number;
  editorCellLesson?: EditorCellLesson;
  selectedLesson?: Lesson | null;
  selectedTeacherId?: string;

  timetableEditState?: TimetableEditState;
  onClick: (
    dayOfWeek: number,
    period: number,
    editorCellLesson?: EditorCellLesson
  ) => void;
  onClickDeleteButton?: (
    dayOfWeek: number,
    period: number,
    editorCellLesson?: EditorCellLesson
  ) => void;
  onClickDeleteFreePeriod?: (dayOfWeek: number, period: number) => void;
  onClickPeriod?: (
    dayOfWeek: number | undefined,
    period: number | undefined
  ) => void;
  freePeriodsCount?: number; // rendering을 위한 값: 사용되지는 않음
}>();

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;;

const courseMap = computed(() => courseContext.courseMap);
const classMap = computed(() => classContext.classMap);
const teacherMap = computed(() => teacherContext.teacherMap);

const periodLesson = computed(() => {
  return props.editorCellLesson?.lesson;
});

const isFreePeriod = computed(() => {
  return props.editorCellLesson?.isFreePeriod || false;
});

const isGradeFreePeriod = computed(() => {
  return props.editorCellLesson?.isGradeFreePeriod || false;
});

const isReadOnly = computed(() => {
  return props.editorCellLesson?.isReadOnly || false;
});

const isOneToOneExchangeable = computed(() => {
  return props.editorCellLesson?.isOneToOneExchangeable || false;
});

const isChainExchangeable = computed(() => {
  return props.editorCellLesson?.isChainExchangeable || false;
});

const isShowDeleteButton = computed(() => {
  if (
    props.timetableEditState !== TimetableEditState.None
    // || periodLesson.value?.concurrentCourseId
  ) {
    // 편집 상태가 아니거나, 동시 수업인 경우
    return false;
  }

  // 수업 빼기 상태인 경우, 삭제 버튼을 보여줌
  if (isFreePeriod.value) {
    return true;
  }

  // 수업이 있는 경우, 삭제 버튼을 보여줌
  return (
    periodLesson.value && !isReadOnly.value && !isOneToOneExchangeable?.value
  );
});

const isLessonOfSelectedTeacher = computed(() => {
  if (!periodLesson.value || !props.selectedTeacherId) {
    return false;
  }

  const lessonTeachers = periodLesson.value.lessonTeachers || [];
  return lessonTeachers.some(
    ({ teacherId }) => teacherId === props.selectedTeacherId
  );
});

const isAssignableTeacherFreeTime = computed(() => {
  if (periodLesson.value) {
    return false;
  }

  return props.timetableEditState === TimetableEditState.AssignTeacherFreeTime;
});

const isLessonAssignable = computed(() => {
  if (isFreePeriod.value || isGradeFreePeriod.value) {
    return false;
  }

  /* 수업이 배정 가능한 셀(시수) 인지 확인 */
  return (
    props.timetableEditState === TimetableEditState.AssignLesson &&
    !periodLesson.value
  );
});

const isClickable = computed(() => {
  if (isReadOnly.value) {
    return false;
  }

  // 편집상태가 없고, 수업이 있는 셀
  if (
    props.timetableEditState === TimetableEditState.None &&
    periodLesson.value
  ) {
    return true;
  }

  return (
    isOneToOneExchangeable.value ||
    isChainExchangeable.value ||
    isLessonAssignable.value ||
    isSelected.value
  );
});

const isSelected = computed(() => {
  if (!props.selectedLesson || !periodLesson.value) {
    return false;
  }

  return TimetableDataUtils.checkSameLessons(
    props.selectedLesson,
    periodLesson.value
  );
});

const course = computed(() => {
  if (!periodLesson.value) {
    return null;
  }

  return courseMap.value[periodLesson.value.courseId];
});

const cls = computed(() => {
  if (!periodLesson.value) {
    return null;
  }

  return classMap.value[periodLesson.value.classId];
});

const teachers = computed(() => {
  if (!periodLesson.value) {
    return [];
  }

  const { lessonTeachers } = periodLesson.value;
  return (
    lessonTeachers?.map(
      ({ teacherId }) => teacherMap.value[teacherId]
    ) || []
  );
});

const courseName = computed(() => {
  const { concurrentCourseId } = periodLesson.value || {};
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

const teacherNames = computed(() => {
  return teachers.value.map((teacher) => teacher.teacherName).join(',');
});

const itemClass = computed(() => {
  const { concurrentCourseId } = periodLesson.value || {};
  return {
    'timetable-lesson-item': true,
    'on-lesson-assignable': isLessonAssignable.value,
    'concurrent-course': concurrentCourseId,
    'one-to-one-exchangeable': isOneToOneExchangeable.value,
    'on-assign-teacher-free-time': isAssignableTeacherFreeTime.value,
    'on-clickable': isClickable.value,
    'free-period': isFreePeriod.value,
    'read-only': isReadOnly.value,
    'grade-free-period': isGradeFreePeriod.value,
    'selected-lesson': isSelected.value,
    'on-chain-exchangeable': isChainExchangeable.value,
  };
});

const titleClass = computed(() => {
  const { consecutiveGroupId } = periodLesson.value || {};
  return {
    'course-name': true,
    'consecutive-course-name': consecutiveGroupId,
    'read-only': isReadOnly.value,
  };
});

const subTitleClass = computed(() => {
  return {
    'sub-title': true,
    'read-only': isReadOnly.value,
  };
});

const title = computed(() => {
  if (isOneToOneExchangeable.value) {
    return `맞교환 - ${teacherNames.value}`;
  }

  if (isChainExchangeable.value) {
    return '연쇄 이동';
  }

  return courseName.value;
});

const subTitle = computed(() => {
  if (isOneToOneExchangeable.value) {
    return `${courseName.value} ${className.value}`;
  }

  if (isChainExchangeable.value) {
    return `${props.editorCellLesson?.chainExchangeableCount} 건`;
  }

  if (!isLessonOfSelectedTeacher.value && teacherNames.value) {
    return `${className.value} ${teacherNames.value}`;
  }

  return className.value;
});

const handleClick = (event: Event): void => {
  if (isReadOnly.value) {
    return;
  }

  props.onClick &&
    props.onClick(props.dayOfWeek!, props.period!, props.editorCellLesson);

  event.stopPropagation();
};

const handleClickDeleteButton = (event: Event): void => {
  props.onClickDeleteButton &&
    props.onClickDeleteButton(
      props.dayOfWeek!,
      props.period!,
      props.editorCellLesson
    );

  event.stopPropagation();
};
</script>

<style scoped>
.timetable-lesson-item {
  padding: 5px;
  font-size: 0.875rem;
  color: #2c3e50;
  height: 100%;
}

.concurrent-course {
  background-color: #fefcee;
  /* background-color: #fcf3cf; */
}

.course-name {
  font-weight: bold;
}

.consecutive-course-name {
  color: #cd5c5c;
}

.sub-title {
  font-size: 0.8125rem;
  color: #34495e;
}

.sub-title span {
  color: #9f9f9f;
  font-weight: bold;
}

.one-to-one-exchangeable {
  background-color: #00c2ff;
}

.on-assign-teacher-free-time {
  /* border: 1px solid #00c2ff; */
  background-color: #dcfbfb;
  cursor: pointer;
}

.on-clickable {
  cursor: pointer;
}

.free-period {
  background-color: #e0e0e0 !important;
}

.free-period-title {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #333333 !important;
  font-weight: bold;
}

.read-only {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #9f9f9f;
}

.grade-free-period {
  background-color: #606060 !important;
  cursor: not-allowed;
  color: #9f9f9f;
}

.grade-free-period-contents {
  font-weight: bold;
  color: #cccccc;
  height: 100%;
}

.on-lesson-assignable {
  cursor: pointer;
  border: 1px solid #ffc300;
}

.on-lesson-assignable:hover {
  background-color: #f9e79f;
}

.selected-lesson {
  /* background-color: #5ccdcd; */
  background-color: #7efefd;
  color: #173333;
}

.on-chain-exchangeable {
  background-color: #05ff00;
}
</style>
