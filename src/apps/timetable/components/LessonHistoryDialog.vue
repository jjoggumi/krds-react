<template>
  <TimeTableModal size="md" @close="handleClose" class="history-modal">
    <template v-slot:heading>
      작업 내역 확인
      <p class="smr">작업에 대한 내용 확인 및 백업 리스트 입니다. 선택 하신 버전으로 이동 가능합니다.</p>
    </template>
    <template v-slot:content>     
      <div class="table-content sticky-wrap table-box" >
        <table :style="list.length === 0 ? 'height:100%;' : ''">
          <caption>작업 내역</caption>
          <colgroup>
            <col style="width:68px">
            <col style="width:auto">
            <col style="width:198px">
          </colgroup>
          <thead>
            <tr>
              <th scope="col" class="sticky-top">NO</th>
              <th scope="col" class="sticky-top">작업내용</th>
              <th scope="col" class="sticky-top">작업일시</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in list"
              :class="{ selected: selectedLessonHistoryId === item.lessonHistoryId, edited: editingId === item.lessonHistoryId, 'disabled-row': !item.isRestorable }"
              class="cursor-pointer"
              @click="() => handleClickItem(item)"
              :key="`${index}-${item.lessonHistoryId}`">
              <td :class="{'disabled-col': !item.isRestorable}">{{ index + 1 }}</td>
              <td class="txt-left"  :class="{'disabled-col': !item.isRestorable}">
                <template v-if="editingId === item.lessonHistoryId">
                  <input
                    type="text"
                    v-model="editingText"
                    :maxlength="100"
                    spellcheck="false"
                    :ref="(el) => (inputRefs[index] = el)"
                    @click.stop
                    @blur="() => handleEditInputStop(index, item)"
                    @keyup.enter.stop="() => handleEditInputStop(index, item)"
                    :disabled="!item.isRestorable"
                  />
                  <span>{{ editingText.length }}/100</span>
                </template>
                <template v-else>
                  <div class="d-flex a-middle j-between history-txt">
                    {{ item.memo }} 
                    <button type="button" class="btn-edit" @click.stop="() => handleClickEdit(index, item)" v-if="item.isRestorable">
                      <i class="ico ico-pen ico-size-20 ico-gray"></i>
                    </button>
                  </div>
                </template>
              </td>
              <td :class="{'disabled-col': !item.isRestorable}">{{ TimeUtils.formatTimestamp(parseInt(item.insertedTimestamp)) }}</td>
            </tr>
            <tr v-if="list.length === 0">
              <td colspan="3">
                <div class="hi-nodata">
                  <p>내역이 없습니다.</p>
                </div>
              </td>
            </tr>            
          </tbody>
        </table>
      </div>
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="handleClose">취소</button>
      <button type="button" class="btn btn-primary btn-lg"
        :disabled="!selectedLessonHistoryId"
        @click="handleClickMove">이동하기</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, nextTick } from 'vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import { ContextKeys, LessonContext } from '../contexts';
import { LessonHistoryItem } from '../common/types';
import { TimeUtils } from '../common/utils';
import { useDialog } from '../composables/dialog';
import Item from '@/components/Profile/List/Item.vue';
import { ComponentPublicInstance } from 'vue';

const lessonContext = inject(ContextKeys.Lesson) as LessonContext;

const dialog = useDialog();

const props = defineProps<{
  onCancel: () => void;
  onSubmit: (id: string) => void;
}>();

const selectedLessonHistoryId = ref(''); // 선택된 작업 내역 아이디
const list = ref([] as LessonHistoryItem[]); // 작업 내역 아이템들 
const inputRefs = ref<Array<Element | ComponentPublicInstance | null>>([]);

// 인라인 메모 수정 상태
const editingId = ref('');
const editingText = ref('');
// const editInputRef = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  await initData()  
});

const initData = async () => {
  // 초기 데이터 로딩 로직
  const histories = await lessonContext.getLessonHistories();

  if (!histories || histories.length === 0) {
    console.warn('작업 내역이 없습니다.');
    return;
  }

  list.value = histories;
};

const handleClickItem = (item: LessonHistoryItem) => {
  if(!item.isRestorable) {
    // dialog.alertSimple('복원 불가능한 작업 내역입니다.');
    dialog.toast('복원 불가능한 작업 내역입니다.', { type: 'warning' });
    return;
  }

  if(selectedLessonHistoryId.value === item.lessonHistoryId) {
    selectedLessonHistoryId.value = '';
    return;
  }

  // 작업 내역 아이템 클릭 핸들러
  selectedLessonHistoryId.value = item.lessonHistoryId;
};

// 메모 편집 시작 (펜 버튼 클릭)
const handleClickEdit = (index: number, item: LessonHistoryItem) => {
  editingId.value = item.lessonHistoryId;
  editingText.value = item.memo || '';
  nextTick(() => {
    const el = inputRefs.value[index] as HTMLInputElement | null;
    if (el) {
      el.focus();
      const len = el.value.length;
      try { el.setSelectionRange(len, len); } catch (e) { /* no-op */ }
    }
  });
};

// 입력창 포커스 아웃/Enter 시 저장 후 종료
const handleEditInputStop = async (index: number, item: LessonHistoryItem) => {

  /*
  const idx = list.value.findIndex(h => h.lessonHistoryId === item.lessonHistoryId);
  
  if (idx !== -1) {
    list.value[idx] = { ...list.value[idx], memo: editingText.value };
  }
  
  editingId.value = '';
  editingText.value = '';
  */

  console.log('handleEditInputStop', editingText.value);

  if(editingText.value.trim() === '') {
    return;
  }

  item.memo = editingText.value.trim();
  await lessonContext.updateTimetableLessonHistoryMemo(item.lessonHistoryId, item.memo);

  editingText.value = '';
  editingId.value = '';
};

const handleClickMove = () => {
  if(!selectedLessonHistoryId.value) {
    props.onCancel();
  }

  props.onSubmit(selectedLessonHistoryId.value);
};

const handleClose = () => {
  props.onCancel();
};
</script>

<style scoped lang="scss">
// 작업 내역 확인 모달
.history-modal{
  .table-content{
    overflow: hidden;
    overflow-y: auto;
    height:100%;
    tr:not(:has(.hi-nodata)):hover td,
    tr.edited td{
      background: #F8FAFF;
      input{
        padding-right: 60px;
      }
      input + span{
        position: absolute;
        right: 30px;
        top: 20px;
        font-size: 12px;
        color: var(--gray-07);
        font-weight: 400;
        line-height: 150%;
      }
    }
    tr.selected td{
      background: #F8FAFF;
      &::before{
        display: block;
        content: '';
        border: 1px solid #8EA4D1;
        border-left: 0;
        border-right: 0;
        margin: -1px;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 0;        
      }      
      &:first-child::before{ border-left: 1px solid #8EA4D1;}
      &:last-child::before{border-right: 1px solid #8EA4D1; }
    }
  }
  .history-txt{
    word-break: break-all;
    line-height: 1.4;
  }
}

.cursor-pointer {
  cursor: pointer;
}

.disabled-row {
  color: #BDBDBD;
  background-color: #EEEEEE;
  cursor: not-allowed;
  .btn-edit {
    pointer-events: none;
    opacity: 0.5;
  }
  &:hover {
    background-color: var(--gray-01);
  }
}

.disabled-col {
  color: #BDBDBD;
  background-color: #EEEEEE;
  cursor: not-allowed;
  .btn-edit {
    pointer-events: none;
    opacity: 0.5;
  }
}
</style>