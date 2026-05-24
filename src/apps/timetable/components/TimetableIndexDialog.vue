<template>
  <TimeTableModal v-if="isTimetable" size="sm" @close="isTimetable = false" class="time-table-modal">
    <template v-slot:heading>
      {{ isEditMode ? '시간표 수정하기' : '새 시간표 만들기' }}
      <p class="smr">
        {{ isEditMode ? '시간표 명 및 운영기간을 수정할 수 있습니다.' : '한 학기동안 운영할 시간표를 생성하고 관리하세요.' }}
      </p>
    </template>
    <template v-slot:content>
      <div class="gray-box">                    
        <div class="h5-tit">
          <h5>1. 시간표 명을 입력하세요.</h5>
          <input type="text" v-model="editableTimetableIndex.timetableName" placeholder="시간표 명 입력 (예: 하이중학교 2024년 1학기 시간표)" @blur="handleBlurCheckTimetableName" spellcheck="false">
          <span v-if="isNameDuplicated" style="color: red">동일한 시간표 명이 있습니다.</span>
        </div>
      </div>
      <div class="gray-box">
        <div class="h5-tit">
          <h5>2. 시간표 운영 기간을 등록해 주세요.</h5>
          <div class="smr">
            시간표가 운영될 한 학기 동안의 시작일과 종료일을 설정하세요.
          </div>
        </div>
        <div class="datepick">
          <HiDatePicker
            id="startDate"
            placeholder="선택하세요"
            :editable="true"
            :format="'YYYY년 M월 D일'"
            :valueType="'YYYYMMDD'"
            v-model="editableTimetableIndex.operationStartDate"
            @change="onChangeDateStart"
            :isError="isBlankOnStartDate"
            :disabled="isEditMode"
            :disabledDate="disabledDateOnStartDate"
          />
          <span class="wave">~</span>
          <HiDatePicker
            id="endDate"
            placeholder="선택하세요"
            :editable="true"
            :format="'YYYY년 M월 D일'"
            :valueType="'YYYYMMDD'"
            v-model="editableTimetableIndex.operationEndDate"
            @change="onChangeDateEnd"
            :isError="isBlankOnEndDate"
            :disabled="editableTimetableIndex.operationStartDate === null || editableTimetableIndex.operationStartDate === ''"
            :disabledDate="disabledDateOnEndDate"
          />
        </div>
      </div>        
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="isTimetable = false">취소</button>
      <button type="button" class="btn btn-primary btn-lg" @click="handleClickSaveTimetable" :disabled="!hasAllParams">확인</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import HiDatePicker from "@/components/DatePicker/HiDatePicker.vue";
import { useDialog } from '@/apps/timetable/composables/dialog';
import { TimetableIndexDto, ErrorCodeResponse } from '@/apps/timetable/common/types';
import { AxiosError } from "axios";
import { Timetables } from "@/apis/Timetables";
import { init } from '@sentry/vue';

interface EditableTiemtableIndex {
  timetableId: string;
  timetableName: string;
  operationStartDate: string | null;
  operationEndDate: string | null;
}

interface TimetableNameDuplicateResponse {
  hasSameName: boolean;
  [key: string]: any;
}

const { checkTimetableNameDuplicate, createTimetableIndex, updateTimetableIndex } = new Timetables();

const props = defineProps<{
  timetableIndex: TimetableIndexDto | null;
}>();

const dialog = useDialog();

const errorCode: { [key: string]: string } = { 
  duplicatedName: '시간표 명이 중복됩니다. 다른 시간표 명을 입력하세요.', 
  operationDateError: '운영 시작일과 종료일은 현재 날짜 이후여야 합니다.',
  overlappingPeriodError: '운영 기간이 겹치는 시간표가 있습니다.',
  unknownError: '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.'
};

const isTimetable = ref(true);

const editableTimetableIndex = ref<EditableTiemtableIndex>({
  timetableId: '',
  timetableName: '',
  operationStartDate: null,
  operationEndDate: null
});
const isBlankOnStartDate = ref<boolean>(false);
const isBlankOnEndDate = ref<boolean>(false);
const isNameDuplicated = ref<boolean>(false);

const schoolId = ref<string>('0aaa2672-d43a-11e9-86da-98be94437cd2');

const isEditMode = computed(() => {
  return !!props.timetableIndex?.timetableId;
});
const hasAllParams = computed(() => {
  return editableTimetableIndex.value.operationStartDate !== null 
    && editableTimetableIndex.value.operationEndDate !== null 
    && editableTimetableIndex.value.timetableName !== '';
});

onMounted(() => {
  if (isEditMode.value) {
    const { timetableId, timetableName, operationStartDate, operationEndDate } = props.timetableIndex!;
    editableTimetableIndex.value = {
      timetableId,
      timetableName,
      operationStartDate: operationStartDate!.toString(),
      operationEndDate: operationEndDate!.toString()
    };
  }
});

const disabledDateOnStartDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

const disabledDateOnEndDate = (date: Date) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date < today || date < convertStringToDate(editableTimetableIndex.value.operationStartDate!);
};

const convertStringToDate = (dateString: string) => {
  const date = new Date(
    parseInt(dateString.slice(0, 4), 10),
    parseInt(dateString.slice(4, 6), 10) - 1,
    parseInt(dateString.slice(6, 8), 10)

  );
  date.setHours(23, 59, 59, 999);
  return date;
}

const onChangeDateStart = (value: string) => {
  editableTimetableIndex.value.operationStartDate = value;
};

const onChangeDateEnd = (value: string) => {
  editableTimetableIndex.value.operationEndDate = value;
};

const handleBlurCheckTimetableName = async () => {
  const trimmedName = editableTimetableIndex.value.timetableName.trim();
  if (!trimmedName) {
    isNameDuplicated.value = false;
    return;
  }
  const query = {
    timetableName: trimmedName,
    schoolId: schoolId.value,
    ...(isEditMode.value && { timetableId: editableTimetableIndex.value.timetableId })
  };
  isNameDuplicated.value = await checkValidationOnName(query);

  // const timetableIndexList = await getTimetableList(schoolId.value);
  // console.log(timetableIndexList);
};

const checkValidationOnName = async (query: {timetableName: string, schoolId: string, timetableId?: string}): Promise<boolean> => {
  try {
    const res = await checkTimetableNameDuplicate(query);

    if (res.status !== 200) {
      throw new Error('Failed to check timetable name duplication');
    }

    const data = res.data as TimetableNameDuplicateResponse;
    return data.hasSameName;
  } catch (error) {
    console.error('Error checking timetable name duplication:', error);
    throw new Error('Failed to check timetable name duplication');
  }
}

// const getTimetableList = async (schoolId: string): Promise<TimetableIndexDto[]> => {
//   try {
//     const res = await getTimetableListTimetables({schoolId});
//     if (res.status !== 200) {
//       throw new Error('Failed to fetch timetable list');
//     }

//     const { timetableIndexes } = (res.data as EmbeddedListResponse<TimetableIndexDto>)._embedded;
//     return timetableIndexes
//   } catch (error) {
//     console.error('Error fetching timetable list:', error);
//     throw new Error('Failed to fetch timetable list');
//   }
// }

const handleClickSaveTimetable = async () => {
  if (!hasAllParams.value) {
    await dialog.alertSimple('모든 필드를 입력해주세요.');
    return;
  }
  
  if (isNameDuplicated.value) {
    await dialog.alertSimple('동일한 시간표 명이 있습니다.');
    return;
  }

  if (
    isEditMode.value &&
    props.timetableIndex &&
    props.timetableIndex.operationEndDate.toString() !== editableTimetableIndex.value.operationEndDate
  ) {
    const confirmed = await dialog.confirm(
      `운영 기간이 변경되었습니다. 적용하시겠습니까?
      <div class="blue-box">
        <i class="hi-ico ico-primary ico-warning-circle-fill ico-size-18"></i>
        운영 기간 변경 시 전체 시간표 및 시수 누계가 변경됩니다.
      </div>`,
      null,
      {
        customClass: 'timetable-confirm',
        showCloseButton: true,
        confirmButtonText: '예',
        cancelButtonText: '아니오'
      }
    );
    if (!confirmed) return;
  }

  const action = isEditMode.value && editableTimetableIndex.value.timetableId
    ? update
    : create;
  const result = await action();

  if (result && result.error) {
    await dialog.alertSimple(errorCode[result.error] || errorCode.unknownError);
    return;
  }
  isTimetable.value = false;
};

const create = async (): Promise<ErrorCodeResponse | null> => {
  try {
    const { timetableName, operationStartDate, operationEndDate } = editableTimetableIndex.value;
    const res = await createTimetableIndex({
      timetableName,
      operationStartDate: parseInt(operationStartDate!),
      operationEndDate: parseInt(operationEndDate!),
      schoolId: schoolId.value
    });

    if (res.status !== 200) {
      throw new Error('Failed to create timetable');
    }

    return null;
  } catch (error) {
    return ((error as AxiosError).response?.data || { error: 'unknownError' }) as ErrorCodeResponse;
  }
}

const update = async (): Promise<ErrorCodeResponse | null> => {
  try {
    const { timetableId, timetableName, operationStartDate, operationEndDate } = editableTimetableIndex.value;
    const res = await updateTimetableIndex(timetableId, {
      timetableName,
      operationStartDate: parseInt(operationStartDate!),
      operationEndDate: parseInt(operationEndDate!),
      schoolId: schoolId.value
    });

    if (res.status !== 200) {
      throw new Error('Failed to update timetable');
    }

    return null;
  } catch (error) {
    return ((error as AxiosError).response?.data || { error: 'unknownError' }) as ErrorCodeResponse;
  }
}

</script>
