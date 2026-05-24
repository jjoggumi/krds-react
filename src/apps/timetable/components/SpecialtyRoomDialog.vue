<template>
  <TimeTableModal @close="handleCloseDialog" class="modal-xs">
    <template v-slot:heading>
      특별실 등록
      <p class="smr">
        특별실 명을 입력해주세요.
      </p>
    </template>
    <template v-slot:content>
      <div class="gray-box">
        <div class="form-group-inline">
          <label class="sm">특별실 명</label>
          <div class="form-ctr w100">            
            <div class="input-wrap">
              <input
                type="text"
                v-model="roomName"
                maxlength="10"
                @input="e => restrictNameInput(e)"
                placeholder="예) 체육관"
                :class="{'error' : showDuplicatedError || showEmptyError}"
                spellcheck="false"
              />
            </div>
          </div>
        </div>        
        <small class="txt-warning ml-50 pl-20 mt-10 d-block" v-if="showDuplicatedError"> 동일한 특별실 명이 있습니다.</small>
        <small class="txt-warning ml-50 pl-20 mt-10 d-block" v-else-if="showEmptyError"> 특별실 명을 입력해주세요.</small>
      </div>
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary ml-10" @click="handleClickClose">취소</button>
      <button type="button" class="btn btn-primary" @click="handleClickSubmit">확인</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import { computed, inject, onMounted, ref } from 'vue';
import { ContextKeys, SpecialtyRoomContext } from '../contexts';
import { SpecialtyRoom } from '../core/types';

const emit = defineEmits(['close']);

const props = defineProps<{
  onSubmit: (roomName: string) => void;
}>();

const specialtyRoomContext = inject(ContextKeys.SpecialtyRoom) as SpecialtyRoomContext;

const roomName = ref<string>('');
const specialtyRooms = ref<SpecialtyRoom[]>([]);
const touchedSubmit = ref(false);

const specialtyRoomNames = computed(() => {
  return specialtyRooms.value.map((room: SpecialtyRoom) => room.roomName);
});
const isEmpty = computed(() => roomName.value.trim() === '');
const isDup   = computed(() =>
  !isEmpty.value && specialtyRoomNames.value.includes(roomName.value.trim())
);

const showEmptyError = computed(() => touchedSubmit.value && isEmpty.value);

const showDuplicatedError = computed(() => touchedSubmit.value && isDup.value);

onMounted(() => {
  // 초기화 시 특별실 목록 가져옴
  specialtyRooms.value = specialtyRoomContext.specialtyRooms.filter(room => room.roomName);
});

const handleClickSubmit = () => {
  touchedSubmit.value = true;

  const trimmedRoomName = roomName.value.trim();
  if (isEmpty.value || isDup.value) {
    return;
  }
  
  props.onSubmit && props.onSubmit(trimmedRoomName);  
}

const handleClickClose = () => {
  emit('close');
};

const handleCloseDialog = () => {
  emit('close');
};

const restrictNameInput = (e: Event) => {
  const allowedRegex = /[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9]/g;

  const source = (e.target as HTMLInputElement).value;
  const cleanedName = source.replace(allowedRegex, '');

  (e.target as HTMLInputElement).value = cleanedName;

  roomName.value = cleanedName;
}

</script>

<style lang="scss" scoped>
  .common-subject-modal{
    ::v-deep .modal__content{
      height: 220px;
      .form-ctr{
        width: 100%;
        .autocomplete-list{
          max-height: 150px;
        }
      }
    }
  }
  
  .modal-xs {
    ::v-deep .modal__content {
      height: 224px;
    }
  }
</style>