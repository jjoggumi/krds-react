<template>
  <TimeTableModal size="sm" @close="handleClose" class="time-table-modal">
    <template v-slot:heading>
      전체 시간표에 반영하기
      <p class="smr">생성한 기초시간표를 전체시간표에 반영합니다.</p>
    </template>
    <template v-slot:content>
      <div class="gray-box mt-00">
        <div class="h5-tit">
          <h5>
            1. 전체 시간표 이름 : <span class="pl-05">{{ timetableName }}</span>
          </h5>
        </div>
      </div>
      <div class="gray-box">
        <div class="h5-tit">
          <h5>2. 시간표 반영 기간을 등록해 주세요.</h5>
          <div class="smr">기초 시간표를 반영할 시작일과 종료일을 설정하세요. 전체 시간표 운영기간 내에서만 설정 가능합니다.</div>
        </div>
        <div class="datepick mt-15">
          <HiDatePicker
            placeholder="선택하세요"
            :format="'YYYY년 M월 D일'"
            :valueType="'YYYYMMDD'"
            v-model="dateStart"
            @change="handleChangeDateStart"
            :disabledDate="disableStartDate"
          />
          <span class="wave">~</span>
          <HiDatePicker
            placeholder="선택하세요"
            :format="'YYYY년 M월 D일'"
            :valueType="'YYYYMMDD'"
            v-model="dateEnd"
            @change="handleChangeDateEnd"
            :disabledDate="disableEndDate"
            :disabled="!dateStart"
          />
        </div>
      </div>
      <!-- 고정수업 추가 -->
      <!-- <div class="gray-box">
        <div class="h5-tit">
          <h5>3. 전체 시간표에 반영할 옵션을 선택해주세요.</h5>
        </div>
        <div class="mt-10">
          <div class="form-check-inline">
            <input type="radio" id="1" name="fixed"/>
            <label for="1">
              <span>고정 수업 반영</span>
            </label>
          </div>
          <div class="form-check-inline">
            <input type="radio" id="2" name="fixed" />
            <label for="2">
              <span>고정 수업 미반영</span>
            </label>
          </div>
        </div>
      </div> -->
      <!-- 수정 -->
      <div class="info-box" v-if="!isFinished">
        <i class="ico ico-info-warning ico-size-24 ico-warning"></i>
        <span>
          전체 시간표에 반영하면 <strong>1~6단계 중 일부 데이터를 수정할 수 없습니다.</strong><br />
          <strong>(학년/학급 수, 주간 시수, 과목/교사 삭제 등)</strong> 반영 전에 데이터를 최종 확인해주세요.
        </span>
      </div>
      <!-- 복사 -->
      <div class="info-box" v-else>
        <i class="ico ico-info-warning ico-size-24 ico-warning"></i>
        <span>
          기초 시간표를 수정한 내용은 전체 시간표에 반영해야 구성원에게 노출됩니다.<br />
          변경된 시간표를 반영할 기간을 선택해주세요.
        </span>
      </div>
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary ml-10" @click="handleClose">취소</button>
      <button type="button" class="btn btn-primary" @click="handleClickApply" :disabled="!isAbleSubmit || isClickedApply">반영하기</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import HiDatePicker from '@/components/DatePicker/HiDatePicker.vue';

import { computed, inject, onMounted, ref } from 'vue';
import { ContextKeys, TimetableProgressContext } from '../contexts';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import { TimeUtils } from '../common/utils';
import { Timetables } from '@/apis/Timetables';
import { useDialog } from '@/apps/timetable/composables/dialog';

const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;

const props = defineProps<{
  onCancel: () => void;
  onSubmit: () => void;
}>();

onMounted(async () => {
  await progressContext.load();
});

const dialog = useDialog();
const dateStart = ref(null);
const dateEnd = ref(null);
const isClickedApply = ref(false);

const timetableName = computed(() => progressContext.timetableName);
const operationStartDate = computed(() => progressContext.operationStartDate);
const operationEndDate = computed(() => progressContext.operationEndDate);
const isFinished = computed(() => progressContext.isFinished);
const isAbleSubmit = computed(() => {
  return dateStart.value && dateEnd.value;
});

const handleChangeDateStart = (value: any) => {
  // console.log('onChangeDateStart', value);
  dateStart.value = value;
};

const handleChangeDateEnd = (value: any) => {
  // console.log('onChangeDateEnd', value);
  dateEnd.value = value;
};

const handleClickApply = async () => {
  if (!isAbleSubmit.value || isClickedApply.value) {
    return;
  }

  isClickedApply.value = true;

  const applyStartDate = parseInt(dateStart.value || '0', 10);
  const applyEndDate = parseInt(dateEnd.value || '0', 10);

  if (applyStartDate > applyEndDate) {
    console.error('운영 시작일이 종료일보다 늦을 수 없습니다.');
    return;
  }

  try {
    const api = new Timetables();
    const { patchStatusFinishFinish } = api;
    const timetableId = progressContext.timetableId;
    const templateId = progressContext.templateId;

    const result = await patchStatusFinishFinish(timetableId, {
      applyStartDate,
      applyEndDate,
      templateId,
    });

    props.onSubmit && props.onSubmit();
    dialog.toast('전체시간표에 반영이 완료되었습니다.');
  } catch (error) {
    console.error('Error applying timetable:', error);
  }
  finally {
    isClickedApply.value = false;
  }
};

const handleClose = () => {
  props.onCancel && props.onCancel();
};

const validate = () => {};

const disableStartDate = (date: Date) => {
  const todayAsNumber = TimeUtils.getTodayAsNumber();
  // 오늘이 운영시작일 이후면 오늘 이후만 선택 가능
  const startDateNumber = todayAsNumber > operationStartDate.value ? todayAsNumber + 1 : operationStartDate.value;
  const endDateNumber = operationEndDate.value;

  const dateNumber = TimeUtils.getDateAsNumber(date);

  return dateNumber < startDateNumber || dateNumber > endDateNumber;
};

const disableEndDate = (date: Date) => {
  if (!dateStart.value) {
    return false;
  }

  // 운영 기간 이내, 시작이 이후만 선택
  const dateStartAsNumber = parseInt(dateStart.value, 10);
  const todayAsNumber = TimeUtils.getTodayAsNumber();
  const startDateNumber = dateStartAsNumber > todayAsNumber ? dateStartAsNumber : todayAsNumber + 1;
  const endDateNumber = operationEndDate.value;

  const dateNumber = TimeUtils.getDateAsNumber(date);
  return dateNumber < startDateNumber || dateNumber > endDateNumber;
};
</script>
<style scoped lang="scss">
.time-table-modal::v-deep {
  input[type='text']:read-only:not(:disabled) {
    background: #fff;
  }
  .info-box {
    display: flex;
    height: 88px;
    padding: 20px 24px;
    align-items: center;
    border-radius: 12px;
    border: 1px solid var(--warning);
    background: rgba(236, 31, 45, 0.05);
    align-items: start;
    gap: 4px;
    margin: 12px 0 0 0;
    span {
      color: var(--warning);
      font-size: 16px;
      font-weight: 400;
      line-height: 150%;
    }
  }
}
</style>