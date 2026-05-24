<template>
  <div>
    <button v-if="lesson" type="button" :class="itemClass"><!-- 고정수업 class -->
      <div class="badges">
        <span v-if="isConcurrentCourse" class="badge concurrent">동시</span>
        <span v-if="isFixedCourse" class="badge fixed">고정</span>
        <span v-if="false && isCombinedClass" class="badge joint">합반</span><!-- 2025.11.20, notbadlife: 오픈범위에서 미노출 처리 -->
      </div>
      <div v-if="isTeacherCell" class="class-name">{{ className }}</div>
       <div :class="isFixedCourse ? 'teacher-name' : 'course-name'">
        {{ courseName }}
      </div>
      <div v-if="isClassCell" class="teacher-name">{{ teacherNames }}</div>
    </button>
    <button v-if="isGradeFreePeriod" type="button" class="btn-table-cell no-course">                    
      <div class="teacher-name">수업없음</div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, inject, onMounted, ref, watch } from 'vue';
import { ConcurrentConfContext, ContextKeys, LessonContext, SpecialtyRoomContext, TimetableClassContext, TimetableCourseContext, TimetableGradeContext, TimetableTeacherContext } from '../contexts';
import { CellLesson, CellLessonType } from '../common/types';
import { TimetableDisplayUtils } from '../common/utils';

const props = defineProps<{
  dayOfWeek: number; // 요일
  period: number; // 시간
  teacherId?: string; // 교사 ID
  cellLesson: CellLesson | undefined; // Lesson 타입의 수업 정보
  highlight?: boolean; // 강조 표시 여부
}>();

const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const concurrentConContext = inject(ContextKeys.ConcurrentConf) as ConcurrentConfContext;
const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;
const specialtyRoomContext = inject(ContextKeys.SpecialtyRoom) as SpecialtyRoomContext;

const courseMap = computed(() => courseContext.courseMap);
const classMap = computed(() => classContext.classMap);
const teacherMap = computed(() => teacherContext.teacherMap);
const concurrentConfMap = computed(() => concurrentConContext.concurrentConfMap);
const specialtyRoomMap = computed(() => specialtyRoomContext.specialtyRoomMap);
const lesson = computed(() => props.cellLesson?.lesson);
const isGradeFreePeriod = computed(() => props.cellLesson?.isGradeFreePeriod || false);

// const course = ref<Course>();
// const concurrentCourse = ref<Course>();
// const cls = ref<Class>();

const isFirstConsecutiveLesson = ref(false);

const isHighlighted = computed(() => props.highlight || false);

const isClassCell = computed(() => {
  return props.cellLesson?.cellLessonType === CellLessonType.CLASS;
});

const isTeacherCell = computed(() => {
  return props.cellLesson?.cellLessonType === CellLessonType.TEACHER;
});

const course = computed(() => {
  if (!props.cellLesson?.lesson?.courseId) {
    return undefined;
  }

  return courseMap.value[props.cellLesson?.lesson?.courseId]
});

const cls = computed(() => {
  if (!props.cellLesson?.lesson?.classId) {
    return undefined;
  }

  return classMap.value[props.cellLesson?.lesson?.classId];
});

const concurrentCourse = computed(() => {
  if (!props.cellLesson?.lesson?.concurrentCourseId) {
    return undefined;
  }

  return courseMap.value[props.cellLesson?.lesson?.concurrentCourseId];
});

const teacherNames = computed(() => {
  // console.log('props.classCellLesson', props.classCellLesson);
  if (!props.cellLesson?.lesson) {
    return '';
  }

  const lessonTeachers = props.cellLesson.lesson.lessonTeachers || [];
  return lessonTeachers.map(({ teacherId }) => teacherMap.value[teacherId]?.teacherName).join(',');
});

const itemClass = computed(() => {
  return {
    'btn-table-cell': true,
    'assign-complete': isHighlighted.value,
    'consecutive-course': isConsecutiveGroup.value,
    'fst': isFirstConsecutiveLesson.value,
  };
});

onMounted(() => {
  initData();
});

watch(
  () => props.cellLesson,
  (newLesson) => {
    if (newLesson) {
      initData();
    }
});

const initData = () => {
  isFirstConsecutiveLesson.value = checkIsFirstConsecutiveLesson();
};

const checkIsFirstConsecutiveLesson = () => {
  if(!lesson.value?.consecutiveGroupId || !lesson.value?.lessonTeachers || lesson.value.lessonTeachers.length === 0) {
      return false;
  }

  const consecutiveGroupId = lesson.value.consecutiveGroupId;
  const firstPeriod = lessonContext.firstPeriodOfConsecutiveLessons[consecutiveGroupId];

  if (!firstPeriod) {
    return false;
  }

  return firstPeriod === lesson.value.period;
};

const isFixedCourse = computed(() => {
  return lesson.value?.isFixedCourse || false;
});

const isConcurrentCourse = computed(() => {
  return lesson.value?.concurrentCourseId || false;
});

const isConsecutiveGroup = computed(() => {
  return lesson.value?.consecutiveGroupId || false;
});

const isCombinedClass = computed(() => {
  if(!lesson.value?.concurrentCourseId) {
    return false;
  }

  return lesson.value?.lessonClasses && lesson.value.lessonClasses.length > 1;
  // const concurrentConf = concurrentConfMap.value[lesson.value?.concurrentCourseId] || {};
  // return concurrentConf?.isCombinedClass || false;
});

const courseName = computed(() => {  
  const { displayedTitle: concurrentCourseTitle } = concurrentCourse.value || {};
  const { displayedTitle } = course.value || {};
  
  const roomName = lesson.value?.specialtyRoomId ? (` (${specialtyRoomMap.value[lesson.value?.specialtyRoomId]?.roomName})` || '') : '';

  if (concurrentCourseTitle) {
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
.btn-table-cell{    
  pointer-events: none !important;
}
</style>