<template>
  <div
    v-if="!isEmpty"
    class="relative-position couse-cell"
    :class="{ warning: isWarning }"
    @click="handleClickCell"
  >
    <div class="absolute-right" style="margin-right: -10px; margin-top: -10px">
      <q-btn
        flat
        dense
        round
        color="white"
        text-color="grey-9"
        size="sm"
        label="X"
        icon="clear"
        @click="handleClickDeleteButton"
      />
    </div>
    <div class="q-pl-xs q-pr-xs q-mb-xs text-weight-bold">{{ courseName }}</div>
    <div class="q-pl-xs q-pr-xs">
      {{ teacherNames }}
    </div>
  </div>
  <div v-else class="empty-cell" full-width full-height>과목 선택</div>
</template>

<script setup lang="ts">
// quasar 를 흉내낸 임시 컴포넌트 -->
import QBtn from '@/apps/timetable/q-temp/QBtn.vue';
// <-- quasar 를 흉내낸 임시 컴포넌트

import { computed } from 'vue';
// import { LessonConf } from '@/apps/timetable/core/types';
import { LessonConfItem } from '@/apps/timetable/core/types';

// defineOptions({  name: 'ConcurrentCourseClassCell',});

const props = defineProps<{
  lessonConfItems: LessonConfItem[] | undefined;
  onClickDelete?: (lessonConfItems: LessonConfItem[]) => void;
  onClickCell?: (lessonConfItems: LessonConfItem[]) => void;
}>();

const isEmpty = computed(() => {
  return !props.lessonConfItems || props.lessonConfItems.length === 0;
});

const courseName = computed(() => {
  if (!props.lessonConfItems) {
    return '';
  }
  
  return props.lessonConfItems[0].courseName;
});

const teacherNames = computed(() => {
  if (!props.lessonConfItems) {
    return '';
  }
  return props.lessonConfItems.map((item) => item.teacherName).join(', ');
});

const isWarning = computed(() => {
  if (!props.lessonConfItems) {
    return false;
  }
  return props.lessonConfItems.some((item) => item.isWarningRelatedPeriod);
  
});

const handleClickDeleteButton = (event: Event) => {
  props.onClickDelete && props.onClickDelete(props.lessonConfItems!);
  event.stopPropagation();
};

const handleClickCell = (event: Event) => {
  props.onClickCell && props.onClickCell(props.lessonConfItems!);
  event.stopPropagation();
};
</script>

<style scoped>
.empty-cell {
  font-size: 14px;
  color: #9e9e9e;
  cursor: pointer;
}

.warning {
  color: red;
}
</style>
