<template>
  <div>

    <!-- 교사선택  -->        
    <div class="form-group-inline">
      <label class="sm">교사 선택</label>                       
      <AutocompleteInput
        v-model="selectedTeacher"
        :options="teacherList"
        placeholder="선택"
        nodata="일치하는 교사가 없습니다."    
        class="sm"
      />
    </div>
    <!-- 교사 미선택 nodata --> 
    <div class="hi-nodata" v-if="false">
      <p>교사를 선택하세요.</p>
    </div>


    <!-- 복수교사 배정 -->
    <div class="co-teacher">
      <!-- 선택 교사 시간표 -->
      <div class="table-content sm time-table mt-20">
        <table>
          <caption>시간표</caption>
          <colgroup>
            <col style="width: 2.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th>3/4(월)</th>
              <th>3/5(화)</th>
              <th>3/6(수)</th>
              <th>3/7(목)</th>
              <th>3/8(금)</th>
              <th>3/11(월)</th>
              <th>3/12(화)</th>
              <th>3/13(수)</th>
              <th>3/14(목)</th>
              <th>3/15(금)</th>
              <th>3/18(월)</th>
              <th>3/19(화)</th>
              <th>3/20(수)</th>
              <th>3/21(목)</th>
              <th>3/22(금)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="th">1</td>
              <td>
                <button type="button" class="btn-table-cell">
                  <div class="class-name">2-3</div>
                  <div class="course-name">사문탐</div>
                </button>
              </td>
              <td>
                <button type="button" class="btn-table-cell">
                  <div class="class-name"><span class="badge change">교체</span>2-3</div>
                  <div class="course-name">사문탐</div>
                </button>
              </td>
              <td>
                <button type="button" class="btn-table-cell">
                  <div class="badges">
                    <span class="badge concurrent">동시</span>
                  </div>
                  <div class="class-name">2-1</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td>
                <button type="button" 
                  data-consecutive-id="group1"
                  @mouseenter="hoveredId = 'group1'"
                  @mouseleave="hoveredId = null"
                  :class="{ hovered: hoveredId === 'group1'}"
                  class="btn-table-cell consecutive-course fst"
                >
                  <div class="badges">
                    <span class="badge concurrent">동시</span>
                    <span class="badge fixed">고정</span>
                  </div>
                  <div class="class-name">2-4</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td></td>
              <td>
                <button type="button" class="btn-table-cell selected">
                  <div class="class-name">2-3</div>
                  <div class="course-name">사문탐</div>
                </button>
              </td>
              <td>
                <button type="button" class="btn-table-cell selected">
                  <div class="class-name"><span class="badge change">교체</span>2-3</div>
                  <div class="course-name">사문탐</div>
                </button>
              </td>
              <td>
                <button type="button" class="btn-table-cell selected">
                  <div class="badges">
                    <span class="badge concurrent">동시</span>
                  </div>
                  <div class="class-name">2-1</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td>
                <button type="button" class="btn-table-cell consecutive-course fst selected">
                  <div class="badges">
                    <span class="badge concurrent">동시</span>
                    <span class="badge fixed">고정</span>
                  </div>
                  <div class="class-name">2-4</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td class="th">2</td>
              <td></td>
              <td></td>
              <td></td>
              <td>                    
                <button type="button" 
                  data-consecutive-id="group1"
                  @mouseenter="hoveredId = 'group1'"
                  @mouseleave="hoveredId = null"
                  :class="{ hovered: hoveredId === 'group1'}"
                  class="btn-table-cell consecutive-course"
                >
                  <div class="class-name">2-4</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>                    
                <button type="button" class="btn-table-cell consecutive-course selected">
                  <div class="class-name">2-4</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div> 
      <!-- 학급 선택, 장소 선택 -->  
      <div class="gray-box mt-20">
        <div class="tb-row">
          <div class="tb-col">
            <div class="h5-tit mb-10">
              <h5><p class="txt-primary mr-05">(필수)</p> 복수교사로 배정할 교사를 선택하세요.</h5>
            </div> 
            <div class="option-list custom-scr">
              <div class="item" v-for="item in coTeacherList" :key="item.id">
                <div class="form-ctr">
                  <input type="checkbox" :id="item.id" :value="item.id" v-model="selectedCoTeacherList" >
                  <label :for="item.id">
                    <span>{{ item.name }}</span>
                  </label>    
                </div>                    
              </div>             
              <div class="item hi-nodata" v-if="coTeacherList.length === 0">
                <p>복수교사로 배정할 교사를 선택하세요.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
        
    <!-- 변경 사유 -->
    <div class="form-group-inline mt-20">
      <label  class="sm">변경 사유</label>   
      <input type="text" class="sm w100" disabled placeholder="선택사항 (최대 50자)" spellcheck="false" />           
    </div>   

  </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
import "@/assets/css/timetable/common.scss"; // 공통 스타일
import HiSelectBox from '@/components/Form/HiSelectBox.vue';
import AutocompleteInput from '@/apps/timetable/components/AutocompleteInput.vue';

// @TODO: 임시 타입 - 추후 변경
interface CourseOption {
  value: string;
  title: string;
}

interface CoTeacherOption {
  id: string;
  name: string;
}


const hoveredId = ref<number | string | null>(null);
const selectedTeacher = ref<string | null>(null);
const teacherList: string[] = [
  '김선생(사문탐, 공통사회)',
  '이선생(수학)',
  '박선생(영어)',
  '최선생(체육)'
];

const selectedCourseChange = ref<string>('');
const selectedGradeCourse = ref<string>('1-2 사문탐');
const gradeCourseList: CourseOption[] = [
  { value: '1', title: '1-2 사문탐' },
  { value: '2', title: '1-3 사문탐' },
  { value: '3', title: '1-4 사문탐' },
  { value: '4', title: '1-3 공통사회' }
];

const selectedChangeTime = ref<string>(
  '이정희 (3/2(수1) 2-1 국어), 박선영 (3/2(수1) 2-1 국어)'
);
const changeTimeList: CourseOption[] = [
  { value: '1', title: '이정희 (3/2(수1) 2-1 국어), 박선영 (3/2(수1) 2-1 국어)' },
  { value: '2', title: '김민수 (3/2(수2) 2-2 수학), 이서영 (3/2(수2) 2-2 수학)' },
  { value: '3', title: '장수민 (3/2(수3) 2-3 영어), 최영호 (3/2(수3) 2-3 영어)' },
  { value: '4', title: '이상현 (3/2(수4) 2-4 과학), 박지은 (3/2(수4) 2-4 과학)' }
];

const selectedCoTeacherList = ref<string[]>([]);
const coTeacherList: CoTeacherOption[] = [
  { id: '111', name: '김창운 (음악)' },
  { id: '222', name: '무영숙 (사문탐, 공통사회)' },
  { id: '333', name: '김서연 (음악, 음3, 진로, 과목명다섯, 국사)' },
  { id: '444', name: '박민영 (수학1, 공통수학)' },
  { id: '555', name: '박민영 (수학1, 공통수학)' },
  { id: '666', name: '박민영 (수학1, 공통수학)' }
];

</script>


<style lang="scss" scoped>

// 복수교사 배정
.co-teacher{
  .tb-row{
    flex-wrap: nowrap;
    justify-content: center;
    .tb-col{
      width: 100%;
      padding: 10px 20px;
      max-width: 643px;
    }
  }     
  .option-list{
    height: 280px;
    max-height: 280px;
  }
}

.form-group-inline{
  > label.sm{
    min-width: 100px;
  }
  .hi-selectbox,
  .autocomplete-wrap{
    max-width: 320px;
    width: 100%;
  }
}
  
</style>