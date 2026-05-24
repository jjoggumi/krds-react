<template>
  <TimeTableModal size="xs" v-if="isShow" @close="() => handleClick(false)" class="timetable-reset-modal">
    <template v-slot:heading>
      시간표 초기화
      <p class="smr">초기화 할 항목을 선택 한 후 버튼을 눌러주세요.</p>
    </template>
    <template v-slot:content>        
      <div class="gray-box">
        <!--
        <div class="form-check">
          <input type="checkbox" id="1" />
          <label for="1">
            <span>자동 배정</span>
          </label>
        </div>
        <div class="form-check">
          <input type="checkbox" id="2" />
          <label for="2">
            <span>동시수업 고정</span>
          </label>
        </div>
        <div class="form-check">
          <input type="checkbox" id="3" />
          <label for="3">
            <span>개별 교사 수동 배정</span>
          </label>
        </div>
        <div class="form-check">
          <input type="checkbox" id="4" />
          <label for="4">
            <span>개별 교사 수업 빼기</span>
          </label>
        </div>
        -->
        <div v-for="(optionKey, optIndex) in initOptionKeys"
          :key="`${optionKey}`"
          class="form-check" >
          <input type="checkbox" :id="`${optionKey}-${optIndex}`" :value="optionKey" v-model="selectedOptions"/>
          <label :for="`${optionKey}-${optIndex}`">
            <span>{{ INITIALIZE_TITLE[optionKey] }}</span>
          </label>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary ml-10" @click="handleClick(false)">취소</button>
      <button type="button" class="btn btn-warning" @click="handleClick(true)" :disabled="selectedOptions.length === 0">선택사항으로 초기화</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import { ref  } from 'vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import { InitializeOption } from '../core/types';

const INITIALIZE_TITLE = {
  [InitializeOption.AutoAssigned]: '자동 배정',
  // [InitializeOption.FixedConcurrentCourse]: '동시수업 수동 배정',
  [InitializeOption.ManuallyAssigned]: '고정 수업',
  [InitializeOption.TeacherFreeTime]: '개별 교사 수업 빼기',
}

const isShow = ref<boolean>(false);
const selectedOptions = ref<InitializeOption[]>([]); // 선택된 옵션들을 저장할 배열

let resolver: ((result: InitializeOption[] | undefined) => void) | null = null;

const initOptionKeys = ref(Object.keys(INITIALIZE_TITLE) as InitializeOption[]);

const open = () => {
  isShow.value = true;
  selectedOptions.value = [
    InitializeOption.AutoAssigned,
  ]; // 초기화 시 선택된 옵션 기본 옵션으로 설정

  return new Promise((resolve) => {
    resolver = resolve;
  });
}

const handleClick = (result: boolean) => {
  isShow.value = false;
  
  // 선택된 값이 없거나 빈 문자열인 경우 undefined로 처리
  resolver?.(!result || selectedOptions.value.length === 0 ? undefined : selectedOptions.value);
  
  resolver = null;
}

defineExpose({
  open,
});

</script>

<style lang="scss" scoped>
.gray-box{
  padding: 16px 24px;
  .form-check{
    padding: 6px 0;
  }
}
</style>