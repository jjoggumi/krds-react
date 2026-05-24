<template>
  <div
    :class="itemClass"
    @click="handleClick"
    class="relative-position"
  >
    <div v-if="isTargeted" class="absolute-right">
      <q-btn
        flat
        dense
        round
        color="white"
        text-color="gray"
        icon="change_circle"
        @click="(event) => handleClickTargeted(event)"
      />
    </div>

    <div :class="courseNameClass">{{ courseName }}</div>
    <div :class="subTitleClass" v-if="showType == ShowType.Teacher">
      {{ className }}
    </div>
    <div :class="subTitleClass" v-if="showType == ShowType.Class">
      {{ teacherNames }}
    </div>
  </div>
</template>

<script setup lang="ts">
// quasar 를 흉내낸 임시 컴포넌트 -->
import QBtn from '@/apps/timetable/q-temp/QBtn.vue';
// <-- quasar 를 흉내낸 임시 컴포넌트

import { Lesson } from '@/apps/timetable/core/types';
import { computed, inject } from 'vue';
import { ContextKeys, TimetableClassContext, TimetableCourseContext, TimetableTeacherContext } from '../contexts';

enum ShowType {
  Class = 'class',
  Teacher = 'teacher',
  Detail = 'detail',
}


const props = defineProps<{
  lesson: Lesson | undefined;
  showType: ShowType | undefined;
  isTargeted: boolean | undefined;
  onClick: (lesson: Lesson) => void;
  onClickTargeted: (lesson: Lesson) => void;
}>();

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;

const courseMap = computed(() => courseContext.courseMap);
const classMap = computed(() => classContext.classMap);
const teacherMap = computed(() => teacherContext.teacherMap);

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

const teachers = computed(() => {
  if (!props.lesson) {
    return [];
  }

  const { lessonTeachers } = props.lesson;
  return (
    lessonTeachers?.map(
      ({ teacherId }) => teacherMap.value[teacherId]
    ) || []
  );
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

const teacherNames = computed(() => {
  return teachers.value.map((teacher) => teacher.teacherName).join(',');
});

const itemClass = computed(() => {
  const { concurrentCourseId } = props.lesson || {};
  return {
    'timetable-lesson-item': true,
    'concurrent-course': concurrentCourseId,
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

const handleClick = (event: Event): void => {
  if (!props.lesson) {
    return;
  }

  props.onClick(props.lesson);
  event.stopPropagation();
};

// const handleClickTargeted = (lesson: Lesson, event: Event): void => {
const handleClickTargeted = (event: Event): void => {
  if (!props.lesson) {
    return;
  }

  props.onClickTargeted(props.lesson);
  event.stopPropagation();
};
</script>

<style scoped>
.timetable-lesson-item {
  padding: 5px;
  font-size: 0.875rem;
  color: #2c3e50;
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
</style>
