<template>
  <q-card bordered class="timetable-frame no-shadow">
    <q-card-section class="timetable-title-section">
      <div class="text-left">
        <span class="text-weight-bold">{{ teacher?.teacherName }}</span>
        <span class="q-ml-sm text-weight-regular">선생님</span>
        <span class="q-ml-md q-mr-md text-weight-regular">|</span>
        <span v-for="courseName in teacherCourseNames"
          :key="courseName"
          class="text-weight-light q-mr-xs">{{ courseName }}</span>
      </div>
    </q-card-section>

    <q-card-section class="timetable-contents-section">
      <div class="timetable-head-row">
        <div class="timetable-no"></div>
        <div class="timetable-col col-weekday">월</div>
        <div class="timetable-col col-weekday">화</div>
        <div class="timetable-col col-weekday">수</div>
        <div class="timetable-col col-weekday">목</div>
        <div class="timetable-col col-weekday">금</div>
      </div>

      <div
        v-for="period in timetableConfig.maxPeriod"
        class="timetable-row"
        :key="period"
      >
        <div class="timetable-no">{{ period }}</div>
        <div
          v-for="dayOfWeek in 5"
          class="timetable-col"
          :key="`${dayOfWeek + 10}`"
        >
          <teacher-timetable-reader-cell
            :lesson="getLessonByPeriod(dayOfWeek, period)"
            :class="cellClass(dayOfWeek, period)"
            :is-teacher-free-period="
              checkTeacherFreePeriodByPeriod(dayOfWeek, period)
            "
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, inject, onMounted } from 'vue';

// quasar 를 흉내낸 임시 컴포넌트 -->
import QCard from '@/apps/timetable/q-temp/QCard.vue';
import QCardSection from '@/apps/timetable/q-temp/QCardSection.vue';
// <!-- quasar 를 흉내낸 임시 컴포넌트

import {
  Course,
  Lesson,
  LessonMoveInfo,
  TimetableConfig,
} from '@/apps/timetable/core/types';
import { TimetableDataUtils } from '@/apps/timetable/core/mod/utils';
import TeacherTimetableReaderCell from '@/apps/timetable/components/TeacherTimetableReaderCell.vue';
import { 
  ContextKeys,
  TeacherCourseContext,
  TimetableCourseContext,
  TimetableGradeContext,
  TimetableTeacherContext
} from '../contexts';

const props = defineProps<{
  lessons?: Lesson[];
  teacherId?: string;
  lessonMoveInfo?: LessonMoveInfo;
}>();

const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;

const timetableConfig = computed(() => gradeContext.timetableConfig as TimetableConfig);
const teacherMap = computed(() => teacherContext.teacherMap);
const courseMap = computed(() => courseContext.courseMap);
const teacherCourseMap = computed(() => teacherCourseContext.teacherCourseMap);

const checkTeacherFreePeriodByPeriod = (dayOfWeek: number, period: number) => {
  if (!teacher.value || !teacher.value.freePeriods) {
    return false;
  }

  return teacher.value.freePeriods.some(
    (freePeriod) =>
      freePeriod.dayOfWeek === dayOfWeek && freePeriod.period === period
  );
};

const getLessonByPeriod = (dayOfWeek: number, period: number) => {
  const assignedLesson = props.lessons?.find(
    (lesson) => lesson.dayOfWeek === dayOfWeek && lesson.period === period
  );

  if (assignedLesson) {
    return assignedLesson;
  }

  const { sourceLesson, targetPeriod } = props.lessonMoveInfo || {};
  if (
    targetPeriod?.dayOfWeek === dayOfWeek &&
    targetPeriod?.period === period
  ) {
    return sourceLesson;
  }
};

const teacher = computed(() => {
  if (!props.teacherId) {
    return null;
  }

  return teacherMap.value[props.teacherId];
});

const teacherCourseNames = computed(() => {
  if (!teacher.value) {
    return [];
  }

  const courses = (teacherCourseMap.value[teacher.value.teacherId] || []).map(
    ({ courseId }) => courseMap.value[courseId]
  ) as Course[];

  return TimetableDataUtils.courseNames(courses);
});

const cellClass = (dayOfWeek: number, period: number) => {
  const { sourceLesson, targetPeriod } = props.lessonMoveInfo || {};

  const isTarget =
    targetPeriod?.dayOfWeek === dayOfWeek && targetPeriod?.period === period;

  const isSource =
    sourceLesson?.dayOfWeek === dayOfWeek && sourceLesson?.period === period;

  return {
    'move-target': isTarget,
    'move-source': isSource,
  };
};
</script>

<style scoped>
.timetable-frame {
  width: 100%;
  max-width: 450px;
  margin: 5px 5px;
  border: 0px;
}

.timetable-row {
  display: flex;
}

.timetable-head-row {
  display: flex;
  font-weight: bold;
  border-top: 1px solid #ccc;
}

.timetable-no {
  width: 10%;
  padding: 5px 5px;
  border-bottom: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-left: 1px solid #ccc;
}

.timetable-col {
  width: 18%;
  min-height: 46px;
  /* padding: 5px 5px; */
  border-bottom: 1px solid #ccc;
  border-right: 1px solid #ccc;
}

.move-source {
  opacity: 0.5;
  background-color: #ffd89e;
}

.move-target {
  background-color: #bcddfc;
}

.timetable-title-section {
  padding: 10px 0px;
}

.timetable-contents-section {
  padding: 0px 0px;
}

.col-weekday {
  padding-top: 6px;
}
</style>
