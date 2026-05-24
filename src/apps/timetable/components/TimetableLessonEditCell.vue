<template>
  <div>
    <button type="button" v-if="isFreePeriod" class="btn-table-cell remove-course">
      <div class="course-name">수업빼기</div>
      <i class="ico ico-close ico-size-14" @click.stop="handleClickDeleteButton" v-if="isShowDeleteButton" />
    </button>
    <button type="button" v-if="isGradeFreePeriod" class="btn-table-cell assign-unavailable">
      <div class="course-name">배정불가</div>
    </button>
    <button v-if="lesson" type="button" :class="itemClass" 
      @click="handleClick"
      :data-consecutive-id="`${lesson.consecutiveGroupId && `group-${lesson.consecutiveGroupId}` || ''}`">
      <div class="badges">
        <span v-if="!isReadOnly && isConcurrentCourse" class="badge concurrent">동시</span>
        <span v-if="!isReadOnly && isFixedCourse" class="badge fixed">고정</span>
        <span v-if="false && !isReadOnly && isCombinedClass" class="badge joint">합반</span><!-- 2025.11.20, notbadlife: 오픈범위에서 미노출 처리 -->
      </div>
      <div class="class-name">{{ className }}</div>
      <div class="course-name">{{ title }}</div>
      <i
        class="ico ico-close ico-size-14"
        v-if="isShowDeleteButton && (!isConsecutiveGroup || isFirstConsecutiveLesson)"
        @click.stop="handleClickDeleteButton"
      />
    </button>
    <button v-if="isChainExchangeable" type="button" class="exchange-chain" @click="handleClick"> <!-- 연쇄 교환 -->
      <span>연쇄 교환</span>
    </button>
    <button v-if="isOneToOneExchangeable" type="button" class="exchange-direct" @click="handleClick"> <!-- 1:1교환 -->
      <span>1:1 교환</span>
    </button>
    <button v-if="isConcurrentCourseExchangeable || isConsecutiveExchangeableHead" type="button" class="exchangeable" @click="handleClick"> <!-- 연쇄 교환 -->
      <span>변경 가능</span>
    </button>
    <button v-if="isConsecutiveExchangeableTail" type="button" class="btn-table-cell" /><!-- 자동생성 배정불가 class -->    
    <button v-else-if="isUnavailable" type="button" class="btn-table-cell generate-unavailable" /><!-- 자동생성 배정불가 class -->    
    <button v-else-if="isSelectableEmptyCell" type="button" :class="itemClass" @click="handleClick" />    
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, inject, onMounted, ref, watch } from 'vue';
import { Class, Course, Lesson, TimetableEditState } from '../core/types';
import { ConcurrentConfContext, ContextKeys, LessonContext, SpecialtyRoomContext, TimetableClassContext, TimetableCourseContext, TimetableGradeContext, TimetableTeacherContext } from '../contexts';
import { EditorCellLesson } from '../common/types';
import { TimetableDataUtils } from '../core/mod/utils';
import { TimetableDisplayUtils } from '../common/utils';

const props = defineProps<{
  dayOfWeek: number; // 요일
  period: number; // 시간
  teacherId?: string; // 교사 ID
  editorCellLesson?: EditorCellLesson;
  selectedLesson?: Lesson | null; // 선택된 수업
  timetableEditState?: TimetableEditState; // 편집 상태
  onClick: (
    dayOfWeek: number,
    period: number,
    editorCellLesson?: EditorCellLesson
  ) => void;
  onDelete?: (
    dayOfWeek: number,
    period: number,
    editorCellLesson?: EditorCellLesson
  ) => void;
  onClickDeleteFreePeriod?: (dayOfWeek: number, period: number) => void;
  onClickPeriod?: (
    dayOfWeek: number | undefined,
    period: number | undefined
  ) => void;

  // lesson?: Lesson; // Lesson 타입의 수업 정보
}>();

const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const concurrentConContext = inject(ContextKeys.ConcurrentConf) as ConcurrentConfContext;
const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;
const specialtyRoomContext = inject(ContextKeys.SpecialtyRoom) as SpecialtyRoomContext

const classMap = computed(() => classContext.classMap);
const courseMap = computed(() => courseContext.courseMap);
const concurrentConfMap = computed(() => concurrentConContext.concurrentConfMap);
const teacherMap = computed(() => teacherContext.teacherMap);
const course = computed(() => {
  if (!props.editorCellLesson?.lesson?.courseId) {
    return undefined;
  }

  return courseMap.value[props.editorCellLesson?.lesson?.courseId]
});
const specialtyRoomMap = computed(() => specialtyRoomContext.specialtyRoomMap);

const cls = computed(() => {
  if (!props.editorCellLesson?.lesson?.classId) {
    return undefined;
  }

  return classMap.value[props.editorCellLesson?.lesson?.classId];
});

const concurrentCourse = computed(() => {
  if (!props.editorCellLesson?.lesson?.concurrentCourseId) {
    return undefined;
  }

  return courseMap.value[props.editorCellLesson?.lesson?.concurrentCourseId];
});

const teacherNames = computed(() => {
  if (!props.editorCellLesson?.lesson) {
    return '';
  }

  const lessonTeachers = props.editorCellLesson.lesson.lessonTeachers || [];
  return lessonTeachers.map(({ teacherId }) => teacherMap.value[teacherId]?.teacherName).join(',');
});

const isFirstConsecutiveLesson = ref(false);

onMounted(() => { 
  initData();
});

const resetData = () => {
  isFirstConsecutiveLesson.value = false;
};

const initData = () => {
  resetData();
  isFirstConsecutiveLesson.value = checkIsFirstConsecutiveLesson();
};

const lesson = computed(() => {
  return props.editorCellLesson?.lesson;
});

const isSelected = computed(() => {
  const { dayOfWeek, period } = props;

  if (!props.selectedLesson || !props.editorCellLesson?.lesson) {
    return false;
  }

  const { consecutiveGroupId: selectedConsecutiveGroupId } = props.selectedLesson;
  const { consecutiveGroupId: editorConsecutiveGroupId } = props.editorCellLesson.lesson;
  
  if (selectedConsecutiveGroupId && selectedConsecutiveGroupId === editorConsecutiveGroupId) {
    return true;
  }

  return TimetableDataUtils.checkSameLessons(
    props.selectedLesson,
    props.editorCellLesson.lesson
  );
});

const isSelectableEmptyCell = computed(() => {  
  if(isConsecutiveExchangeableHead.value || isConsecutiveExchangeableTail.value) {
    return false;    
  }
  
  if (isFreePeriod.value || isGradeFreePeriod.value) {
    return false;
  }

  if(props.timetableEditState === TimetableEditState.None && lesson.value) {
    // 편집상태가 아니고, 수업이 있는 경우
    return false;
  }

  if(props.timetableEditState === TimetableEditState.AssignLesson && lesson.value) {
    // 수업 배정 상태인데, 수업이 있는 경우
    return false;
  }

  if(props.timetableEditState === TimetableEditState.MoveLesson && lesson.value) {
      return false;
  }

  return true;
});

const isUnavailable = computed(() => {
  if(props.timetableEditState === TimetableEditState.MoveLesson && isExchangeableTarget.value) {
    return false;
  }

  return props.timetableEditState === TimetableEditState.MoveLesson && !lesson.value && !isFreePeriod.value && !isGradeFreePeriod.value;
});

const isFreePeriod = computed(() => props.editorCellLesson?.isFreePeriod || false);
const isGradeFreePeriod = computed(() => props.editorCellLesson?.isGradeFreePeriod || false);
const isReadOnly = computed(() => props.editorCellLesson?.isReadOnly || false);
const isHighlighted = computed(() => props.editorCellLesson?.isHighlighted || false);
const isFullSpecialtyRoom = computed(() => props.editorCellLesson?.isFullSpecialtyRoom || false);
const isOneToOneExchangeable = computed(() => props.editorCellLesson?.isOneToOneExchangeable || false);
const isChainExchangeable = computed(() => props.editorCellLesson?.isChainExchangeable || false);
const isConcurrentCourseExchangeable = computed(() => props.editorCellLesson?.isConcurrentCourseExchangeable || false);
const isConsecutiveExchangeableHead = computed(() => props.editorCellLesson?.isConsecutiveExchangeableHead || false);
const isConsecutiveExchangeableTail = computed(() => props.editorCellLesson?.isConsecutiveExchangeableTail || false);

const isExchangeableTarget = computed(() => {
  return isOneToOneExchangeable.value || isChainExchangeable.value || isConcurrentCourseExchangeable.value || isConsecutiveExchangeableHead.value;
});


const isShowDeleteButton = computed(() => {
  if(props.timetableEditState === TimetableEditState.None && isFreePeriod.value ) {
    // 수업 빼기 상태인 경우, 삭제 버튼을 보여줌
    return true;
  }

  if (
    props.timetableEditState !== TimetableEditState.None || isFixedCourse.value || isGradeFreePeriod.value
  ) {
    // 편집 상태가 아니거나, 동시 수업인 경우
    return false;
  }
  
  // 수업이 있는 경우, 삭제 버튼을 보여줌
  return (
    lesson.value && !isReadOnly.value && !isOneToOneExchangeable?.value 
  );
});

const isLessonOfSelectedTeacher = computed(() => {
  if (!lesson.value || !props.teacherId) {
    return false;
  }

  const lessonTeachers = lesson.value.lessonTeachers || [];
  return lessonTeachers.some(
    ({ teacherId }) => teacherId === props.teacherId
  );
});

const isAssignableTeacherFreeTime = computed(() => {
  if (lesson.value) {
    return false;
  }

  return props.timetableEditState === TimetableEditState.AssignTeacherFreeTime;
});

const isLessonAssignable = computed(() => {
  // console.log('computed >> isLessonAssignable', props.timetableEditState, lesson.value);
  if (isFreePeriod.value || isGradeFreePeriod.value) {
    return false;
  }

  /* 수업이 배정 가능한 셀(시수) 인지 확인 */
  return (
    props.timetableEditState === TimetableEditState.AssignLesson &&
    !lesson.value
  );
});

const isClickable = computed(() => {
  if (isReadOnly.value) {
    return false;
  }

  // 편집상태가 없고, 수업이 있는 셀
  if (
    props.timetableEditState === TimetableEditState.None &&
    lesson.value
  ) {
    return true;
  }

  return (
    isOneToOneExchangeable.value ||
    isChainExchangeable.value ||
    isConcurrentCourseExchangeable.value ||
    isLessonAssignable.value
    // || isSelected.value
  );
});

const teachers = computed(() => {
  if (!lesson.value) {
    return [];
  }

  const { lessonTeachers } = lesson.value;
  return (
    lessonTeachers?.map(
      ({ teacherId }) => teacherMap.value[teacherId]
    ) || []
  );
});

const isFixedCourse = computed(() => {
  // console.log('computed >> isFixedCourse', lesson.value?.isFixedCourse);
  return lesson.value?.isFixedCourse || false;
});

const isConcurrentCourse = computed(() => {
  // console.log('computed >> isConcurrentCourse', lesson.value?.concurrentCourseId);
  return lesson.value?.concurrentCourseId || false;
});

const isConsecutiveGroup = computed(() => {
  // console.log('computed >> isConsecutiveGroup', lesson.value?.consecutiveGroupId);
  return lesson.value?.consecutiveGroupId || false;
});

const isCombinedClass = computed(() => {
  // console.log('computed >> isCombinedClass', lesson.value?.concurrentCourseId);
  if(!lesson.value?.concurrentCourseId) {
    return false;
  }
  const concurrentConf = concurrentConfMap.value[lesson.value?.concurrentCourseId] || {};
  return concurrentConf?.isCombinedClass || false;
});

const title = computed(() => {
  if (isOneToOneExchangeable.value) {
    return `맞교환 - ${teacherNames.value}`;
  }

  if (isChainExchangeable.value) {
    return '연쇄 이동';
  }

  if(isFullSpecialtyRoom.value) {
    return `특별실(${specialtyRoomName.value})`;
  }

  return `${courseName.value}`;
});


const specialtyRoomName = computed(() => {
  if(!lesson.value?.specialtyRoomId) {
    return '';
  }

  return specialtyRoomMap.value[lesson.value?.specialtyRoomId]?.roomName || '';
});


const itemClass = computed(() => {
  return {
    'btn-table-cell': true,
    'assign-resolved': !isSelected.value && isReadOnly.value, // 선택되지 않았고, 읽기전용인 경우
    'fixed-course': isFixedCourse.value,
    'consecutive-course': isConsecutiveGroup.value,
    'fst': isFirstConsecutiveLesson.value, // 연속 그룹의 첫번째 수업만 'fst' 추가
    'assign-complete': isHighlighted.value,
    'selected': isSelected.value,
  };
});

const courseName = computed(() => {
  const { displayedTitle } = course.value || {};

  const roomName = lesson.value?.specialtyRoomId ? (` (${specialtyRoomMap.value[lesson.value?.specialtyRoomId]?.roomName})` || '') : '';  
  
  if (concurrentCourse.value) {
    const { displayedTitle: concurrentCourseTitle } = concurrentCourse.value || {};
    return `${concurrentCourseTitle} ${displayedTitle}${roomName}`;
  }

  return `${displayedTitle}${roomName}` || '';
});

const combinedClassNames = computed(() => {
  // 합반 수업인 경우, 모든 반 이름을 표시
  if(!lesson.value?.lessonClasses || lesson.value.lessonClasses.length < 2) {
    return '';
  }
  
  // 합반 수업인 경우, 모든 반 이름을 표시: lessonClasses가 2개 이상 전달된 경우를 합반으로 본다
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
  
});

const className = computed(() => {
  if(isFullSpecialtyRoom.value) {
    return classNameForSpecialtyRoom.value;
  }

  if(combinedClassNames.value) {
    return combinedClassNames.value;
  }

  if (!cls.value) {
    return '';
  }

  return TimetableDisplayUtils.formatFullClassName(cls.value);
  // return `${gradeContext.gradeNameMap[cls.value.grade]} ${cls.value.className || cls.value.classNumber}`;
});

const classNameForSpecialtyRoom = computed(() => {
  const { specialtyRoomId } = lesson.value || {};
  if(!specialtyRoomId) {
    return '';
  }

  const { dayOfWeek, period } = props;

  const roomLessons = (lessonContext.specialtyRoomLessons[specialtyRoomId] || []).filter(lesson => 
    lesson.dayOfWeek === dayOfWeek && lesson.period === period
  );

  const specialtyRoomClassNames = roomLessons.map(lesson => {
    const cls = classMap.value[lesson.classId];
    if (!cls) {
      return '';
    }
    return TimetableDisplayUtils.formatFullClassName(cls);
  }).filter(name => name !== '');

  return specialtyRoomClassNames.length > 0 ? specialtyRoomClassNames.join(', ') : '';
});

const checkIsFirstConsecutiveLesson = () => {  
  const { consecutiveGroupId, lessonTeachers, period  } = props.editorCellLesson?.lesson || {};
  if(!consecutiveGroupId || !lessonTeachers || lessonTeachers.length === 0) {
      return false;
  }
  
  const firstPeriod = lessonContext.firstPeriodOfConsecutiveLessons[consecutiveGroupId];

  if (!firstPeriod) {
    return false;
  }

  return firstPeriod === period;
};

const handleClick = (event: Event): void => {
  if (isReadOnly.value) {
    return;
  }

  /*
  if(isLessonOfSelectedTeacher.value && !isFixedCourse.value) {
    // 선택된 교사의 수업인 경우, 삭제 이벤트 처리
    props.onDelete &&
      props.onDelete(props.dayOfWeek!, props.period!, props.editorCellLesson);

    event.stopPropagation();
    return;
  }
  */

  props.onClick &&
    props.onClick(props.dayOfWeek!, props.period!, props.editorCellLesson);

  event.stopPropagation();
};

const handleClickDeleteButton = (event: Event): void => {
  props.onDelete &&
    props.onDelete(props.dayOfWeek!, props.period!, props.editorCellLesson);

  event.stopPropagation();
};

watch(
  () => props.editorCellLesson,
  (newVal) => {
    initData();
  },
  { immediate: true }
);


/*
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
  
  if (concurrentCourseTitle) {
    return `${concurrentCourseTitle} ${displayedTitle}`;
  }

  return displayedTitle || '';
});

const className = computed(() => {
  if (!cls.value) {
    return '';
  }
  return `${gradeContext.gradeNameMap[cls.value.grade]} ${cls.value.className || cls.value.classNumber}`;
});
*/

</script>

<style lang="scss" scoped>

// .teacher-assign-wrap{
//   display: flex;
//   gap: 24px;
//   .teacher-assign{
//     width: 55%;
//   } 
//   .assign-list{
//     border: 1px solid #BDBDBD;
//     border-radius: 16px;
//     padding: 32px;
//     width: 45%;
//     .tit{
//       font-weight: 600;
//       font-size: 18px;
//       line-height: 144%;
//       margin-bottom: 16px;
//     }
//     .tab-nav{
//       margin-bottom: 24px;
//     }
//     .table-content{
//       height:263px;
//       td{
//         border-right:0;
//         .btn-sm{
//           padding: 0 8px;  
//         }
//       }     
//     }
//   }  
// }

.hovered {
  background-color: #FFF8DF;
}

i.ico-close {
  position: absolute;
  right: 2px;
  top: 2px;
}

i.ico-close::after {
  background-color: #9E9E9E;
}
.btn-table-cell {
  &.selected {
    z-index: 1;
  }
}
</style>