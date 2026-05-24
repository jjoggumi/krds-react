<template>
  <TimeTableModal v-if="isTimetable" size="sm" @close="isTimetable = false" class="time-table-modal">
    <template v-slot:heading>
      기초시간표 생성하기
      <p class="smr">
        학교 기초 시간표를 생성하고 관리하세요.
      </p>
    </template>
    <template v-slot:content>
      <div class="gray-box">                    
        <div class="h5-tit">
          <h5>1. 시간표 명</h5>
          <input type="text" v-model="props.timetableIndex.timetableName" disabled spellcheck="false">
        </div>
      </div>
      <div class="gray-box">
        <div class="h5-tit">
          <h5>2. 시간표 생성 방법을 선택하세요.</h5>
        </div>
        <div class="init-method">
          <span v-for="(value, key) in methodItems" :key="key">
            <input type="radio" :id="key" :name="key" :value="key" v-model="initMethod" />
            <label :for="key">
              <span>{{ value }}</span>
            </label>
          </span>
        </div>
        <div v-if="!!initMethod && [InitMethod.COPY, InitMethod.UPLOAD].includes(initMethod)">
          <div v-if="initMethod === InitMethod.COPY" class="con hi-row no-gutters">
            <HiSelectBox
              class="xl col-xxl-6"
              :value="selectedTimetableId"
              :items="timetableList"
              @update:value="selectedTimetableId = $event"
              :empty-title="'시간표를 선택해주세요.'"
            />
          </div>
          <div v-else>
            <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="">양식 다운로드</button>
            <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="">시수표 업로드</button>
            <span>{{ fileName }}</span>
          </div>
        </div>
      </div>      
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="isTimetable = false">취소</button>
      <button type="button" class="btn btn-primary btn-lg" @click="handleClickCreateTimetable">확인</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import {ContextKeys, TimetableGradeContext} from '../contexts';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import { useDialog } from '@/apps/timetable/composables/dialog';
import { EmbeddedListResponse, TimetableIndexDto } from '@/apps/timetable/common/types';
import { Timetables } from "@/apis/Timetables";
import { init } from '@sentry/vue';

enum InitMethod {
  CREATE = 'create',
  COPY = 'copy',
  UPLOAD = 'upload',
}

const methodItems: Record<InitMethod, string> = {
  [InitMethod.CREATE]: '새로만들기',
  [InitMethod.COPY]: '이전 시간표에서 기초 정보 불러오기',
  [InitMethod.UPLOAD]: '시수표 업로드'
};

const { getTimetableListTimetables, changeTimetableStatusStatus } = new Timetables();

const isTimetable = ref<boolean>(true);
const schoolId = ref<string>('0aaa2672-d43a-11e9-86da-98be94437cd2');
const emit = defineEmits(['close']);

const props = defineProps<{
  timetableIndex: TimetableIndexDto;
}>();

const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const dialog = useDialog();
const selectedTimetableId = ref<string>('');
const initMethod = ref<InitMethod | null>(null);
const timetableList = ref<{ value: string, title: string }[]>([]);
const fileName = ref<string>('시수표.xlsx');

onMounted(async () => {
  await initialize();
});

const initialize = async () => {
  const response = await getTimetableList(schoolId.value);
  timetableList.value = response
    .filter(item => item.timetableId !== props.timetableIndex.timetableId)
    .map(item => ({
      value: item.timetableId,
      title: item.timetableName
    })) as Array<{ value: string, title: string }>;
};

const getTimetableList = async (schoolId: string): Promise<TimetableIndexDto[]> => {
  try {
    const res = await getTimetableListTimetables({schoolId});
    if (res.status !== 200) {
      throw new Error('Failed to fetch timetable list');
    }

    const { timetableIndexes } = (res.data as EmbeddedListResponse<TimetableIndexDto>)._embedded;
    return timetableIndexes
  } catch (error) {
    console.error('Error fetching timetable list:', error);
    throw new Error('Failed to fetch timetable list');
  }
}

const handleClickCreateTimetable = async () => {
  const actionByMethod = {
    [InitMethod.CREATE]: createOrigin,
    [InitMethod.COPY]: createByCopy,
    [InitMethod.UPLOAD]: createByUpload
  }

  if (!initMethod.value) {
    dialog.alertSimple('시간표 생성 방법을 선택해주세요.');
    return;
  }

  await actionByMethod[initMethod.value]();
  
  isTimetable.value = false;
  emit('close');
};

const createOrigin = async () => { 
  try {
    const res = await changeTimetableStatusStatus(props.timetableIndex.timetableId);
    
    if (res.status !== 200) {
      throw new Error('Failed to change timetable status');
    }

    return true;
  } catch (error) {
    console.error('Error changing timetable status:', error);
    throw new Error('Failed to change timetable status');
  }
};

const createByCopy = async () => {}
const createByUpload = async () => {}

</script>
