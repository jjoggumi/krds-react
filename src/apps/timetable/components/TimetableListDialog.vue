<template>
  <TimeTableModal size="lg" @close="handleClose" class="history-modal">
    <template v-slot:heading>
      시간표 생성 / 수정 (임시)
      <p class="smr">시간표 목록 임시 구현.</p>
    </template>
    <template v-slot:content>     
      <div class="table-content sticky-wrap" >
        <table>
          <caption>작업 내역</caption>
          <colgroup>
            <col style="width:68px">
            <col style="width:auto">
            <col style="width:auto">
            <col style="width:auto">
            <col style="width:auto">
            <col style="width:198px">            
          </colgroup>
          <thead>
            <tr>
              <th scope="col" class="sticky-top">NO</th>
              <th scope="col" class="sticky-top">시간표</th>
              <th scope="col" class="sticky-top">작성자</th>
              <th scope="col" class="sticky-top">작성일</th>
              <th scope="col" class="sticky-top">최종수정</th>
              <th scope="col" class="sticky-top">최종수정일</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in list"
              :class="{selected: selectedTimetableId === item.timetableId}"
              class="cursor-pointer"
              @click="() => handleClickItem(item)"
              :key="`${index}-${item.timetableId}`">
              <td>{{ index + 1 }}</td>
              <td>{{ item.timetableName }}</td>
              <td>{{ item.insertedUserName }}</td>
              <td>{{ item.insertedTimestamp ? TimeUtils.formatTimestamp(parseInt(item.insertedTimestamp)) : '-' }}</td>
              <td>{{ item.updatedUserName }}</td>
              <td>{{ item.updatedTimestamp ? TimeUtils.formatTimestamp(parseInt(item.updatedTimestamp)) : '-' }}</td>
            </tr>
            <!--
            <tr>
              <td>1</td>
              <td>(자동) [김하이] 시간표 수정(수3→화2)</td>
              <td>2025-05-13 14:43:08</td>
            </tr>              
            <tr class="selected">
              <td>2</td>
              <td>이건 수동 임시 저장임</td>
              <td>2025-05-13 14:43:08</td>
            </tr>              
            <tr class="edited">
              <td>3</td> 
              <td>
                <input type="text" value="시간표 생성하기 (3차)">
                <span>25/100</span>
              </td>
              <td>2025-05-13 14:43:08</td>
            </tr>              
            -->
          </tbody>
        </table>
      </div>
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="handleClose">취소</button>
      <button type="button" class="btn btn-primary btn-lg"
        :disabled="!selectedTimetableId"
        @click="handleClickMove">이동하기</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import { ContextKeys, LessonContext, TimetableGradeContext } from '../contexts';
import { LessonHistoryItem, PageResponse } from '../common/types';
import { TimeUtils } from '../common/utils';
import { Timetables } from '@/apis/Timetables';

interface TimetableSummary {
  timetableId: string;
  timetableName: string;
  insertedUserName: string;
  insertedTimestamp: number;
  updatedUserName: string;
  updatedTimestamp: number;
}

const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;

const props = defineProps<{
  onCancel: () => void;
  onSubmit: (id: string) => void;
}>();

const selectedTimetableId = ref(''); // 선택된 아이디
const api = new Timetables();
const list = ref([] as TimetableSummary[]); // 기초 시간표 목록

const fetchTimetableList = async() => {
  // 기초 시간표 목록을 반환하는 로직
  // return lessonContext.getBasicTemplateList();
  const schoolId = '0aaa2672-d43a-11e9-86da-98be94437cd2'; // 임시

  const { getTimetableListTimetables } = api;
  const res = await getTimetableListTimetables({
    schoolId, 
    pageable: {size: 1000, page: 0}
  });

  // console.log('기초 시간표 목록:', res);
  
  const { timetableSummary } = (res.data as PageResponse<TimetableSummary>)._embedded;
  list.value = (timetableSummary) .sort((a, b) => {
    return b.insertedTimestamp - a.insertedTimestamp;
  });
};


onMounted(async () => {
  await fetchTimetableList();
});


const handleClickItem = (item: any) => {
  if(selectedTimetableId.value === item.timetableId) {
    selectedTimetableId.value = '';
    return;
  }

  // 작업 내역 아이템 클릭 핸들러
  selectedTimetableId.value = item.timetableId;
};

const handleClickMove = () => {
  // console.log('선택된 시간표 아이디:', selectedTimetableId.value);
  
  if(!selectedTimetableId.value) {
    props.onCancel();
  }

  props.onSubmit(selectedTimetableId.value);
};

const handleClose = () => {
  props.onCancel();
};
</script>

<style scoped lang="scss">
// 작업 내역 확인 모달
.history-modal{
  .table-content{
    height: 608px;
    tr:hover td,
    tr.edited td{
      background: #F8FAFF;
      input{
        padding-right: 60px;
      }
      input + span{
        position: absolute;
        right: 30px;
        top: 26px;
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
}

.cursor-pointer {
  cursor: pointer;
}
</style>