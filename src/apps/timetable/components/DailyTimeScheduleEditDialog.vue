<template>
  <TimeTableModal size="sm" class="time-editor-modal" @close="handleCloseDialog">
    <template v-slot:heading>
      일과 시간 변경
      <p class="smr">
        시간표에 표기되는 일과시간을 수정할 수 있습니다. 일과시간 표기를 사용하지 않으실 경우 체크를 해제해 주세요.
      </p>
    </template>
    <template v-slot:content>
      <div class="gray-box">
        <div class="form-group-inline mb-20">
          <div class="form-ctr">
            <input type="checkbox" id="check-daily-time-schedule" v-model="isDisplayDailyScheduleTime" />
            <label for="check-daily-time-schedule">
              <span>
                일과 설정
              </span>
            </label>
            <p class="desc">시간표에 일과시간을 표기합니다. 표기를 원하지 않으시면 체크를 해제해 주세요.</p>
          </div>
        </div>
        <div class="hi-row ml-10 mr-05 mb-20 sub">
          <div class="form-group-inline col-sm-12">
            <label class="sm">수업 시작</label>
            <div class="form-ctr">
              <HiSelectBox
                class="w-xs"
                :value="startTime"
                :items="startTimeOptions"
                @update:value="startTime = $event"
                :disabled="!isDisplayDailyScheduleTime"
              /> 
              <span class="divider">:</span> 
              <HiSelectBox                
                class="w-xs"
                :value="startMinute"
                :items="startMinuteOptions"
                @update:value="startMinute = $event"
                :disabled="!isDisplayDailyScheduleTime"
              />
            </div> 
          </div>
          <div class="form-group-inline col-sm-6">
            <label class="sm">수업 시간</label>
            <div class="form-ctr">
              <HiSelectBox                
                class="w-sm"
                :value="lessonTime"
                :items="lessonTimeOptions"
                @update:value="lessonTime = $event"
                :disabled="!isDisplayDailyScheduleTime"
              /> 
            </div> 
          </div>
          <div class="form-group-inline col-sm-6">
            <label class="sm">쉬는 시간</label>
            <div class="form-ctr">
              <HiSelectBox           
                class="w-sm"
                :value="breakTime"
                :items="breakTimeOptions"
                @update:value="breakTime = $event"
                :disabled="!isDisplayDailyScheduleTime"
              /> 
            </div> 
          </div>          
        </div>          
      </div>
      <div class="gray-box">
        <div class="form-group-inline">
          <div class="label">
            <input type="checkbox" id="check-lunch-duration" v-model="isDisplayLunchTime" />
            <label for="check-lunch-duration">
              <span>
                점심시간
              </span>
            </label>
          </div>
          <div class="form-ctr">
            <HiSelectBox           
              class="w-sm opt-top"
              :value="lunchTime"
              :items="lunchTimeOptions"
              @update:value="lunchTime = $event"
              :disabled="!isDisplayLunchTime"
            /> 
          </div> 
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary ml-10" @click="handleClickClose">취소</button>
      <button type="button" class="btn btn-primary" @click="handleClickSubmit">저장</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import HiSelectBox from '@/components/Form/HiSelectBox.vue';
import { isEqual } from 'lodash';
import { DailyTimeSchedule } from '../common/types';
import { DAILY_SCHEDULE_DEFAULTS } from '../common/constants';

const props = defineProps<{
  dailyTimeSchedule: DailyTimeSchedule;
  onSubmit: (value: DailyTimeSchedule | null) => void;
}>();

const emit = defineEmits(['close']);

const defaultStartTimeHour = DAILY_SCHEDULE_DEFAULTS.startTime.slice(0, 2);
const defaultStartTimeMinute = DAILY_SCHEDULE_DEFAULTS.startTime.slice(2, 4);

const startPeriod = ref(`${DAILY_SCHEDULE_DEFAULTS.startPeriod}교시`);
const startTime = ref('09');
const startMinute = ref('00');
const lessonTime = ref(DAILY_SCHEDULE_DEFAULTS.classDuration.toString());
const breakTime = ref(DAILY_SCHEDULE_DEFAULTS.breakDuration.toString());
const lunchTime = ref(DAILY_SCHEDULE_DEFAULTS.lunchDuration.toString());
const isDisplayDailyScheduleTime = ref(DAILY_SCHEDULE_DEFAULTS.isDisplayDailyScheduleTime);
const isDisplayLunchTime = ref(DAILY_SCHEDULE_DEFAULTS.isDisplayLunchTime);

onMounted(() => {
  initData();
});

const initData = () => {
  console.log('props.dailyTimeSchedule', props.dailyTimeSchedule);

  const { 
    startPeriod: initStartPeriod,
    startTime: initStartTime,
    classDuration: initClassDuration,
    breakDuration: initBreakDuration,
    lunchDuration: initLunchDuration,
    isDisplayDailyScheduleTime: initIsDisplayDailyScheduleTime,
    isDisplayLunchTime: initIsDisplayLunchTime
  } = props.dailyTimeSchedule;

  const startTimeHour = initStartTime ? initStartTime.slice(0, 2) : defaultStartTimeHour;
  const startTimeMinute = initStartTime ? initStartTime.slice(2, 4) : defaultStartTimeMinute;
  
  startPeriod.value = initStartPeriod !== null || initStartPeriod !== undefined ? `${initStartPeriod}교시` :`${DAILY_SCHEDULE_DEFAULTS.startPeriod}교시`;
  startTime.value = startTimeHour ? startTimeHour : `${defaultStartTimeHour}`
  startMinute.value = startTimeMinute ? startTimeMinute : `${defaultStartTimeMinute}`;
  lessonTime.value = initClassDuration ? String(initClassDuration) : 
    DAILY_SCHEDULE_DEFAULTS.classDuration.toString();
  breakTime.value = initBreakDuration ? String(initBreakDuration) : DAILY_SCHEDULE_DEFAULTS.breakDuration.toString();
  lunchTime.value = initLunchDuration ? String(initLunchDuration) : 
    DAILY_SCHEDULE_DEFAULTS.lunchDuration.toString();
  isDisplayDailyScheduleTime.value = initIsDisplayDailyScheduleTime !== undefined ? initIsDisplayDailyScheduleTime : DAILY_SCHEDULE_DEFAULTS.isDisplayDailyScheduleTime;
  isDisplayLunchTime.value = initIsDisplayLunchTime !== undefined ? initIsDisplayLunchTime : DAILY_SCHEDULE_DEFAULTS.isDisplayLunchTime;
};

const startPeriodOptions = [
  { value: '0교시', title: '0교시' },
  { value: '1교시', title: '1교시' }
];

// 00 ~ 23 시
const startTimeOptions = Array.from({ length: 24 }, (_, i) => {
  const value = String(i).padStart(2, '0');
  return { value, title: value };
});

const startMinuteOptions = Array.from({ length: 60 }, (_, i) => {
  const value = String(i).padStart(2, '0');
  return { value, title: value };
});

// Default: 45분 (10분~120분까지 5분 단위로 설정 할 수 있도록 함)
const lessonTimeOptions = Array.from({ length: 23 }, (_, i) => {
  const value = String((i * 5) + 10);
  return { value, title: `${value}분` };
});

// Default: 10분 (0~60까지 5분 단위로 세팅)
const breakTimeOptions = Array.from({ length: 12 }, (_, i) => {
  const value = String((i * 5) + 5);
  return { value, title: `${value}분` };
});

//  Default : 50분 (0~60까지 5분 단위로 세팅) ==> 기본 4교시 후에 세팅됨 
const lunchTimeOptions = Array.from({ length: 24 }, (_, i) => {
  const value = String((i * 5) + 5);
  return { value, title: `${value}분` };
});

const handleClickSubmit = () => {
  const startPeriodValue = parseInt(startPeriod.value.replace('교시', ''));
  const startTimeValue = `${startTime.value}${startMinute.value}`;

  const dailyTimeSchedule: DailyTimeSchedule = {
    startPeriod: startPeriodValue,
    startTime: startTimeValue,
    classDuration: parseInt(lessonTime.value),
    breakDuration: parseInt(breakTime.value),
    lunchDuration: parseInt(lunchTime.value),
    isDisplayDailyScheduleTime: isDisplayDailyScheduleTime.value,
    isDisplayLunchTime: isDisplayLunchTime.value,
  };

  if(isEqual(props.dailyTimeSchedule, dailyTimeSchedule)) {
    props.onSubmit && props.onSubmit(null);
    return;
  }
  
  props.onSubmit && props.onSubmit(dailyTimeSchedule);
};

const handleClickClose = () => {
  emit('close');
};

const handleCloseDialog = () => {
  emit('close');
};

</script>

<style scoped lang="scss">
.time-editor-modal {
  ::v-deep{
    .modal__layer{
      height: 530px;
    }
  }
  input[type=checkbox] + label span{
    font-size: 15px;
    font-weight: 600;
  }
  .gray-box{
    margin: 2px 0 0 0;
    + .gray-box{
      margin-top: 12px;
    }
  }
  .hi-selectbox{
    ::v-deep{
      .option__layer{
        max-height: 136px;
      }
      & + .divider{
        background: none;
        width: 2px;
      }
    } 
    &.w-xs{
      ::v-deep .selected{
        width:100px;
      }
    }
    &.w-sm{
      ::v-deep .selected{
        width:160px;
      }
    }
  }
}
</style>