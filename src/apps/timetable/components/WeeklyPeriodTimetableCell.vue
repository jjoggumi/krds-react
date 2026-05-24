<template>
  <button
    type="button"
    class="btn-table-cell"
    :class="{
      'no-course': props.isFreePeriod,
      'common-subject': isUnifiedCourse,
      'selected': isSelectedCell,
      'blocked': isDisabled
    }"
    @click="handleClick"
  >
    <span>{{ text }}</span>
    <!--
    <span v-if="timeTableCell === ''" class="sr-only">시수</span>
    <span v-else>{{ timeTableCell}}</span>
    -->
    <!-- 주간 시수 조정에서 수업 없음 x 버튼 삭제 <i v-if="!isDisabled && isFreePeriod"></i> -->
  </button>      
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { Course } from '../core/types';

const props = defineProps<{
  period: number;
  dayOfWeek: number;  
  isFreePeriod: boolean;
  isSelectedCell: boolean
  course?: Course;
  onClick: () => void;
  disabled?: boolean;
}>();

const text = computed(() => {
  if(props.isFreePeriod) {
    return '수업없음';
  }

  if(props.course) {
    return props.course.displayedTitle;
  }

  return '';
});

const isUnifiedCourse = computed(() => {
  return !props.course ? false : props.course.isUnified;
});

const isDisabled = computed(() => {
  return props.disabled || false;
});

const isFreePeriod = computed(() => {
  return props.isFreePeriod;
});

const handleClick = () => {
  if (isDisabled.value) {
    return;
  }

  // 셀 클릭 이벤트 처리
  props.onClick && props.onClick();
};

</script>


<style lang="scss" scoped> 
.blocked {
  pointer-events: none;
}

.blocked::after {
  content: none !important;
}
</style>
