<template>
  <TimeTableModal size="xs" @close="handleClose" class="save-draft-modal">
    <template v-slot:heading>
      작업 내역 저장하기
      <p class="smr">
        현재 작성된 시간표 내역을 임시로 저장합니다.
      </p>
    </template>
    <template v-slot:content>
      <div class="gray-box">
        <div class="form-group-inline mb-10">
          <label class="sm">제목</label>
          <input type="text" class="form-control ml-15" :class="{'error' : showWarning && memo.trim().length === 0}" maxlength="100" placeholder="작업 내용 입력" v-model="memo" spellcheck="false"/>
        </div>
        <div class="txt-warning ml-50 pl-10" style="min-height: 14px;">
          <small v-if="showWarning && memo.trim().length === 0">저장할 작업 내용을 입력하세요.</small>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary ml-10" @click="handleClose">취소</button>
      <button type="button" class="btn btn-primary" @click="handleClickSave">확인</button>
    </template>
  </TimeTableModal>
</template>

<script lang="ts" setup>
import { computed, inject, ref  } from 'vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import { ContextKeys, LessonContext } from '../contexts';

const lessonContext = inject(ContextKeys.Lesson) as LessonContext;

const props = defineProps<{
  onCancel: () => void;
  onSubmit: () => void;
}>();

const memo = ref('');
const showWarning = ref(false);

const isSaveActivated = computed(() => {
  return memo.value.trim().length > 0;
});

const handleClickSave = async () => {
  if (!isSaveActivated.value) {
    showWarning.value = true;
    return;
  }
  showWarning.value = false;
  await processSave();
  props.onSubmit();
};

const processSave = async () => {
  try {
    await lessonContext.saveLessonHistories(memo.value);
  } catch (error) {
    console.error('임시 저장 실패:', error);
  }
};

const handleClose = () => {
  props.onCancel();
};

</script>