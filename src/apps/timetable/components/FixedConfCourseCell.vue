<template>
  <div v-if="isFreePeriod" class="display-center free-period">수업 없음</div>
  <div
    v-else-if="item != undefined"
    class="display-center relative-position"
    :class="itemClass"
  >
    <div class="absolute-right">
      <q-btn
        v-if="isShowDeleteButton"
        flat
        dense
        round
        color="grey-9"
        text-color="grey-9"
        size="sm"
        label="X"
        @click="handleClickDeleteButton"
      />
    </div>
    {{ courseTitle }}
  </div>
  <div v-else 
    class="display-center cursor-pointer"
    @click="(event) => { handleClickEmptyCell(event) }"
  ></div>
</template>

<script setup lang="ts">
import QBtn from '@/apps/timetable/q-temp/QBtn.vue';

import { Course, FixedConf } from '@/apps/timetable/core/types';
import { computed } from 'vue';

// defineOptions({  name: 'FixedConfCourseCell',});

/*
const props = defineProps<{
  item: [FixedConf, Course] | undefined;
  isFreePeriod: boolean;
  onClickDeleteButton?: () => void;
}>();
*/


const props = defineProps({
  item: {
    type: [Array, null],
    default: null,
  },
  isFreePeriod: {
    type: Boolean,
    default: false,
  },
  onClickDeleteButton: {
    type: Function,
    required: false,
  },
  onClickEmptyCell: {
    type: Function,
    required: false,
  },
});


const fixedConf = computed(() => (props.item ? props.item[0] : undefined));
const course = computed(() => (props.item ? props.item[1] : undefined));

const isShowDeleteButton = computed(() => {
  return course.value && !course.value.isUnified;
});

const courseTitle = computed(() => {
  return course.value ? course.value.displayedTitle : '';
});

const itemClass = computed(() => {
  return {
    'unified-course': course.value ? course.value.isUnified : false,
    'concurrent-course': course.value ? course.value.isConcurrent : false,
  };
});

const handleClickDeleteButton = (event: Event) => {
  event.stopPropagation();
  props.onClickDeleteButton && props.onClickDeleteButton();
};

const handleClickEmptyCell = (event: Event) => {
  event.stopPropagation();
  props.onClickEmptyCell && props.onClickEmptyCell(event);
};
</script>

<style scoped>
.display-center {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.unified-course {
  color: #222;
  background-color: #dae4f8;
}

.concurrent-course {
  color: #222;
  background-color: #fffdcc;
}
</style>
