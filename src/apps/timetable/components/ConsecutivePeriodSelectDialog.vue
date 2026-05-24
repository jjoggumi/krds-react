<template>
  <!-- 수동배정 - 연속수업 등록 모달 -->
    <TimeTableModal size="xxs" v-if="isShow" @close="() => handleClick(false)" class="consecutive-course-modal">      
      <template v-slot:heading>
        연속수업 등록
        <p class="smr">고정으로 등록할 수업 시수를 선택하세요.</p>
      </template>
      <template v-slot:content>        
        <HiSelectBox  
          class="w100"
          :value="consecutiveCourseSelected"
          :items="consecutiveCourseItems"
          @update:value="consecutiveCourseSelected = $event"
          :empty-title="consecutiveCourseSelected === '' ? '선택하세요' : ''"
        />  
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary ml-10" @click="() => handleClick(false)">취소</button>
        <button type="button" class="btn btn-primary" @click="() => handleClick(true)">확인</button>
      </template>
    </TimeTableModal>
</template>

<script setup lang="ts">
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import HiSelectBox from '@/components/Form/HiSelectBox.vue';
import { ref } from 'vue';

const props = defineProps<{
  consecutiveCourseItems: Array<{ value: string; title: string }>;
}>();

const consecutiveCourseSelected = ref<string>('');
const isShow = ref<boolean>(false);
let resolver: ((result: string | undefined) => void) | null = null;

const open = () => {
  isShow.value = true;
  consecutiveCourseSelected.value = ''; // 초기화

  return new Promise((resolve) => {
    resolver = resolve;
  });
}

const handleClick = (result: boolean) => {
  isShow.value = false;

  const selectedValue = consecutiveCourseSelected.value;
  
  // 선택된 값이 없거나 빈 문자열인 경우 undefined로 처리
  resolver?.(!result || selectedValue === '' ? undefined : selectedValue);
  
  resolver = null;
}

defineExpose({
  open,
});

</script>

<style lang="scss" scoped>
.consecutive-course-modal{
  .hi-selectbox{
    margin-bottom: 100px;
    ::v-deep{
      .option__layer{
        max-height: 96px;
      }
    }
  }
}
</style>