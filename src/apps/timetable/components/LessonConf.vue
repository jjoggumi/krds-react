<template>
  <div class="lesson-conf">
    <div class="type-teacher">
      <!-- 교사별 시간표 좌측 탭 -->
      <lesson-conf-target-items 
        :on-select-teacher="handleSelectTeacher"
        :on-select-course-base="handleSelectCourseBase"
        :current-edit-status="currentEditStatus"
        :selected-course-base="selectedCourseBase"
      />

      <div class="teacher-content">
        <!-- 선생님 시수표 -->
        <lesson-conf-editor-for-teacher
          v-if="!selectedCourseBase"
          :selected-teacher="selectedTeacher"
          :selected-course-base="selectedCourseBase"
          :on-select-course-base="handleSelectCourseBase"
        />
        
        <!-- 선생님 시수표 -->
        <lesson-conf-editor-for-course-base
          v-if="selectedCourseBase"
          :selected-teacher="selectedTeacher"
          :selected-course-base="selectedCourseBase"
          :on-select-course-base="handleSelectCourseBase"
        />

        <lesson-conf-course-contents
          :on-select-course-base="handleSelectCourseBase"
        />
      </div>

    </div>
    
    <!-- 시수표 유효성 결과 확인 모달 -->
    <TimeTableModal v-if="isperiodValidation" size="xs" @close="isperiodValidation = false" class="period-validation-modal">
      <template v-slot:heading>
        시수표 유효성 검사 결과 확인
        <p class="smr">
          유효성 결과 확인 파업에대한 서브카피 노출
        </p>
      </template>
      <template v-slot:content>
        <ul class="check-list">
          <li class="total">총 등록 수 <span class="count">72건</span></li>
          <li :class="{'error' : true}">교사 명단 이상 - 등록된 교사 명단과 다름 <span class="count">3건</span></li>
          <li>시수표 작성이 완료되지 않았습니다.<span class="count">3건</span></li>
          <li>시수표 작성이 완료되었습니다.<span class="count">0건</span></li>
        </ul>
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary-blue btn-xl ml-10" @click="isperiodValidation = false">유효성 결과 다운로드</button>
        <button type="button" class="btn btn-primary btn-xl">수정 파일 다시 등록하기</button>
      </template>
    </TimeTableModal>

    <!-- 시수표 작성 요청 모달 -->
    <TimeTableModal class="period-writing-modal" v-if="isperiodWriting" size="lg" @close="isperiodWriting = false" >
      <template v-slot:heading>
        시수표 작성 요청
        <p class="smr">선택한 선생님께 시수표 작성 요청을 발송합니다. 앱 푸시 및 문자로 발송 요청을 하며, 별도 회원가입 없이 입력 가능합니다.</p>
      </template>
      <template v-slot:content>
        <div>
          <div class="table-head type01">
            <div class="search-area">
              <input type="text" v-model="searchKeyword" placeholder="교사명" spellcheck="false"/>
              <button type="button" class="btn btn-tertiary ml-10" > 검색 </button>
              <i v-if="searchKeyword" class="ico ico-close-circle-fill ico-size-24 ico-gray" @click="searchKeyword = ''"></i>
            </div>
            <div class="btn-area">
              <button type="button" class="btn btn-primary ml-10" :disabled="!hasChecked" >
                선택 발송
              </button>
            </div>
          </div>
          <p class="total-count">
            총 <strong class="txt-primary">0</strong>명 선택
          </p>
          <div class="table-content sticky-wrap table-box sm">
            <table :class="filteredTeacherList.length === 0 ? 'h100' : null">            
              <caption>교사 명단 리스트</caption>
              <colgroup>
                <col style="width:5%">
                <col style="width:21%">
                <col style="width:21%">
                <col style="width:32%">
                <col style="width:21%">
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" class="sticky-top">
                    <div class="form-check">
                      <input type="checkbox" id="allChecked" v-model="allChecked" @change="toggleAllChecked" />
                      <label for="allChecked"></label>
                    </div>
                  </th>
                  <th scope="col" class="sticky-top">
                    교사명
                    <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
                  </th>
                  <th scope="col" class="sticky-top">
                    연락처
                    <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
                  </th>
                  <th scope="col" class="sticky-top">
                    비고
                    <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
                  </th>
                  <th scope="col" class="sticky-top">
                    가입 여부
                    <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(crs, index) in filteredTeacherList" :key="index">
                  <td>
                    <div class="form-check">
                      <input 
                        type="checkbox" 
                        v-model="crs.checked" 
                        :id="'filteredTeacherList-' + index" />
                      <label :for="'filteredTeacherList-' + index"></label>
                    </div>
                  </td>
                  <td>
                    {{crs.teacher}}
                  </td>                
                  <td>
                    {{crs.phone}}
                  </td>                
                  <td>
                    {{crs.etc}}
                  </td>                
                  <td>
                      <span :class="crs.registered === '가입1' ? 'registered-type01' : crs.registered === '가입2' ? 'registered-type02' : 'registered'">
                      {{crs.registered === '가입1' || crs.registered === '가입2' ? '가입' : '미가입'}}
                      </span>
                  </td> 
                </tr>
                <tr v-if="filteredTeacherList.length === 0">
                  <td colspan="5" >
                    <div class="hi-nodata">
                      <p>등록된 교직원이 없습니다.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>       
      </template>
    </TimeTableModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import LessonConfTargetItems from '@/apps/timetable/components/LessonConfTargetItems.vue';
import LessonConfEditorForTeacher from '@/apps/timetable/components/LessonConfEditorForTeacher.vue';
import LessonConfEditorForCourseBase from '@/apps/timetable/components/LessonConfEditorForCourseBase.vue';
import LessonConfCourseContents from '@/apps/timetable/components/LessonConfCourseContents.vue';

import {
  CourseBase,
  Teacher,
  
} from '@/apps/timetable/core/types';

import { LessonConfEditStatus, LessonConfEditType } from '../common/types';

const currentEditStatus = ref<LessonConfEditStatus>({ 
  type: LessonConfEditType.Teacher,
  targetId: null
});

const isperiodValidation = ref<boolean>(false);
const selectedTeacher = ref<Teacher | null>(null);
const selectedCourseBase = ref<CourseBase | null>(null);

const handleSelectTeacher = (teacher: Teacher) => {
  selectedTeacher.value = teacher;

  currentEditStatus.value.type = LessonConfEditType.Teacher;
  currentEditStatus.value.targetId = teacher.teacherId;

  if (teacher) {
    selectedCourseBase.value = null;
  }
  
};

const handleSelectCourseBase = (courseBase: CourseBase | null) => {  
  selectedCourseBase.value = courseBase;

  currentEditStatus.value.type = LessonConfEditType.Course;
  currentEditStatus.value.targetId = courseBase?.courseBaseId || null;

  if (courseBase) {
    selectedTeacher.value = null;
  }
};

// 시수표 작성 요청 임의 데이터 
const isperiodWriting = ref<boolean>(false);
type ModalTeacherRow = {
  teacher: string;
  phone: string;
  etc: string;
  registered: string; // '가입1' | '가입2' | '미가입'
  checked: boolean;
};
const searchKeyword = ref<string>('');
const teacherlist = ref<ModalTeacherRow[]>([
  { teacher: '박선생', phone: '010-1234-5678', etc: '교무부장', registered: '가입1', checked: false },
  { teacher: '최선생', phone: '010-2345-6789', etc: '국어선생님', registered: '미가입', checked: false },
  { teacher: '김선생', phone: '010-3456-7890', etc: '수학선생님', registered: '가입2', checked: false },
  { teacher: '이선생', phone: '010-4567-8901', etc: '영어선생님', registered: '가입2', checked: false },
  { teacher: '정선생', phone: '010-5678-9012', etc: '과학선생님', registered: '가입1', checked: false },
  { teacher: '홍선생', phone: '010-6789-0123', etc: '사회선생님', registered: '미가입', checked: false },
  { teacher: '홍선생', phone: '010-6789-0123', etc: '사회선생님', registered: '미가입', checked: false },
  { teacher: '홍선생', phone: '010-6789-0123', etc: '사회선생님', registered: '미가입', checked: false },
  { teacher: '홍선생', phone: '010-6789-0123', etc: '사회선생님', registered: '미가입', checked: false },
  { teacher: '홍선생', phone: '010-6789-0123', etc: '사회선생님', registered: '미가입', checked: false },
  { teacher: '홍선생', phone: '010-6789-0123', etc: '사회선생님', registered: '미가입', checked: false },
  { teacher: '홍선생', phone: '010-6789-0123', etc: '사회선생님', registered: '미가입', checked: false },
  { teacher: '홍선생', phone: '010-6789-0123', etc: '사회선생님', registered: '미가입', checked: false },
  { teacher: '홍선생', phone: '010-6789-0123', etc: '사회선생님', registered: '미가입', checked: false },
  { teacher: '홍선생', phone: '010-6789-0123', etc: '사회선생님', registered: '미가입', checked: false },
  { teacher: '홍선생', phone: '010-6789-0123', etc: '사회선생님', registered: '미가입', checked: false },
]);

const allChecked = ref<boolean>(false);

const filteredTeacherList = computed(() => {
  const kw = searchKeyword.value?.trim();
  if (!kw) return teacherlist.value;
  return teacherlist.value.filter((crs) => crs.teacher.includes(kw));
});

const hasChecked = computed(() => teacherlist.value.some((crs) => crs.checked));

function toggleAllChecked() {
  teacherlist.value.forEach((crs) => {
    crs.checked = allChecked.value;
  });
}
</script>

<style lang="scss" scoped>
.lesson-conf{
  .type-teacher{
    display: flex;
    gap: 20px;
    align-items: flex-start;
    .teacher-lnb{
      height: calc(var(--vh, 1vh) * 100 - 190px);
      width: 280px;
      min-width: 280px;
      border: 1px solid #BDBDBD;
      border-radius: 12px;
      position: relative;   
      .filter-section{    
        padding: 16px 12px 12px 12px;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .table-content{
        th, td{
          height:32px;
          padding: 5px 10px;
        }
        tr.active td,
        tr:hover td{
          background: #F1F4FC;
          cursor: pointer;
        }
        &.sticky-wrap {
          height: calc(100% - 116px);
        }
      }
    }
    .teacher-content{
      width:calc(100% - 300px);
    }  
  }
  .table-title{
    background-color: var(--primary-02);   
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;  
    font-size: var(--lg-font);
    font-weight: var(--font-strong);
    padding: 0 24px;
    border-radius: 12px 12px 0 0 ;
    border:1px solid #BDBDBD;
    border-bottom: 0;
  }
  .period-table{
    max-height: calc(var(--vh) * 100 - 477px);
    border-radius: 0 0 12px 12px ;
    table{
      thead{
        tr:nth-child(1) th{
          background-color: var(--navy);
          height: 40px;
          color: #fff;  
        }
        tr:nth-child(2) th{
          background-color: var(--primary-02); 
          height: 40px;       
        }
        tr:nth-child(3),
        tr:nth-child(4){
          th{       
            background-color: #fff;
            font-weight: var(--font-normal);
          }
        }        
      }
      th,
      td{
        height: 36px;
        background: #fff ;
        &.double-teacher {
          background-color: #EDF9F7;
        }
        &.over-period {
          background-color: #FEEDEF !important ;
        }
        &.col-hover{          
          background-color: #FFF8DF !important ;
        }
        &.error {
          background-color: #D6D6D6 ;
          .lesson-conf-cell{      
            background-color: var(--warning);
            mask-image: url('~@/assets/img/timetable/ico-info-warning-fill.svg');
            mask-size: 100%;
            width: 16px;
            height: 16px;
            border-radius: 0;
          }
        } 
        // &.conf-td{
          // cursor: pointer;  
          // position: relative;
          // text-align: center; 
        // }
      } 
      tbody{
        tr:hover{
          td{
            background: #FFF8DF;
          }
        }
      } 
      
      // 시간표 고정 
      .sticky-left {
        z-index: 1; 
      }  
      .sticky-top {
        z-index: 2;
      }      
      .sticky-left.sticky-top {
        z-index: 3;
      }
      .sticky-left {
        left:0px;   
      }    
      tr:nth-child(1){
        th{top:0px;}
      }
      tr:nth-child(2){
        th{top:40px;}
      }
      tr:nth-child(3){
        th{top:80px;}
      }
      tr:nth-child(4){
        th{top:116px;}
      }
      
      tr:nth-child(4){
        th{
          border-bottom:2px solid #d6d6d6;
        }
      }
      tr {
        th:nth-child(1),
        td:nth-child(1){
          border-right:2px solid #d6d6d6;
        }
      }
      tr:nth-child(1),
      tr:nth-child(2),
      tr:nth-child(3),
      tr:nth-child(4),        
      tr:nth-child(5){        
        th:nth-child(1){          
          z-index: 4;
        }
      }
    }
  }  
  .autocomplete-wrap{
    ::v-deep .autocomplete-list{
      height: 127px;
      top: calc(100% - 4px);
    }
  }
}

// 시수표 유효성 검사 결과 확인
.period-validation-modal.modal-xs{
  ::v-deep .modal__layer{
    max-width: 568px;
  }
}
//시수표 작성 요청 모달
.period-writing-modal{ 
  ::v-deep .modal__layer{
    height: 100%;
    .modal__content{
      > div{
        height: 100%;
        display: flex;
        flex-flow: column;
        .table-content{
          flex: 1;
          overflow: auto;
        }
      }
    }
  }
}
</style>
