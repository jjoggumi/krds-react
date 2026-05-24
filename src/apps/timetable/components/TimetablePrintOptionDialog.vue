<template>
  <TimeTableModal size="xs" @close="handleClickCancel" class="save-draft-modal">
    <template v-slot:heading>
      시간표 인쇄하기
      <p class="smr">
        인쇄할 파일의 정렬 기준을 선택해주세요.
      </p>
    </template>
    <template v-slot:content>
      <div class="form-group-inline">
        <div class="form-ctr">
          <input
            type="radio"
            name="sort-teacher-reg"
            id="sort-teacher-reg"
            :value="ExcelExportSortType.TEACHER_REG"
            v-model="selectedSort"
          />
          <label for="sort-teacher-reg"><span>교사 등록순</span></label>
        </div>
        <div class="form-ctr">
          <input
            type="radio"
            name="sort-teacher-name"
            id="sort-teacher-name"
            :value="ExcelExportSortType.TEACHER_NAME"
            v-model="selectedSort"
          />
          <label for="sort-teacher-name"><span>교사 이름순</span></label>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary ml-10" @click="handleClickCancel">취소</button>
      <button type="button" class="btn btn-primary" @click="handleClickOk">확인</button>
    </template>
  </TimeTableModal>
</template>

<script lang="ts" setup>
import { ref  } from 'vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import { ExcelExportSortType } from '@/apps/timetable/core/types';

const emit = defineEmits(['confirm', 'close']);

const selectedSort = ref(ExcelExportSortType.TEACHER_REG);

const handleClickCancel = () => {
  emit('close');
}

const handleClickOk = () => {
  emit('confirm', { sortType: selectedSort.value });
}
</script>