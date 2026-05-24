<template>
  <div class="concurrent-course-conf  mt-40">
    <div class="table-head">
      <div class="search-area">      
        <HiSelectBox  
          :value="selectedGrade"
          :items="[
            { value: 'all', title: '전체 학년' },
            { value: '1', title: '1학년' },
            { value: '2', title: '2학년' },
            { value: '3', title: '3학년' },]"
          :empty-title="selectedGrade || '학년 선택'"
          @update:value="selectedGrade = $event"
        />
      </div>
      <div class="btn-area">
        <button type="button" disabled class="btn btn-tertiary btn-lg mr-10">선택 삭제하기</button>
        <button type="button" class="btn btn-tertiary-blue btn-lg mr-10">수업 추가</button>
        <button type="button" @click="isconcurrentFixedModal=true" class="btn btn-tertiary-blue btn-lg mr-10">동시수업 고정</button>
      </div>
    </div>
    <div class="table-content table-form">
      <table>
        <caption>시간표 정보 입력</caption>
        <colgroup>
          <col style="width: 64px;" />
          <col style="width: 88px;" />
          <col style="width: 120px;" />
          <col style="width: 88px;" />
          <col style="width: 88px;" />
          <col style="width: 110px;" 
          v-for="(classItem, index) in maxClassList.length" :key="index" />
          <col style="width: 110px;" />
          <col style="width: 110px;" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">
              <div class="form-check">
                <input type="checkbox" id="allChecked" />
                <label for="allChecked"></label>
              </div>
            </th>
            <th scope="col">
              학년
            </th>
            <th scope="col">
              그룹명
              <button type="button" class="btn btn-link btn-help" :class="{'help-on' : helpOn === '그룹명'}" @click="openHelp('그룹명')"><span class="sr-only">도움말</span></button>
            </th>
            <th scope="col">시수</th>
            <th scope="col">
              연속
              <button type="button" class="btn btn-link btn-help" :class="{'help-on' : helpOn === '연속'}" @click="openHelp('연속')"><span class="sr-only">도움말</span></button>
            </th>
            <th v-for="(classItem, index) in maxClassList" :key="index">
              {{ classItem.className }}
            </th>
            <th scope="col">수업고정</th>
            <th scope="col">비고</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="rowIndex" :class="{'error': false}">
            <td>
              <div class="form-check">
                <input :id="'row-check-' + row.id" type="checkbox" />
                <label :for="'row-check-' + row.id"></label>
              </div>
            </td>
            <td>
              <HiSelectBox
                class="selectbox-wrap"
                :class="{ 'has-selected': row.grade }"
                :value="row.grade"
                :items="[
                  { value: '1', title: '1' },
                  { value: '2', title: '2' },
                  { value: '3', title: '3' },
                ]"
                :empty-title="row.grade || '선택'"
                @update:value="row.grade = $event"
              />
            </td>

            <td>
              <div class="input-wrap">
                <input type="text" placeholder="그룹명" v-model="row.groupName" />
              </div>
            </td>

            <td>
              <HiSelectBox
                class="selectbox-wrap"
                :class="{ 'has-selected': row.period }"
                :value="row.period"
                :items="[
                  { value: '1', title: '1' },
                  { value: '2', title: '2' },
                  { value: '3', title: '3' },
                  { value: '4', title: '4' },
                ]"
                :empty-title="row.period || '선택'"
                @update:value="row.period = $event"
              />
            </td>

            <td>
              <HiSelectBox
                class="selectbox-wrap"
                :class="{ 'has-selected': row.continuous }"
                :value="row.continuous"
                :items="[
                  { value: '1', title: '1' },
                  { value: '2', title: '2' },
                  { value: '3', title: '3' },
                  { value: '4', title: '4' },
                ]"
                :empty-title="row.continuous || '선택'"
                @update:value="row.continuous = $event"
              />
            </td>

            <td
              v-for="(classItem, idx) in row.classList"
              :key="`class-${idx}`" :class="{'error': false}"
            >
              <button
                v-if="classItem.selectedSubject && !classItem.isOpen"
                @click=""
                class="btn-table-cell additional"
                :class="{
                  'joint': isContinuous(row, idx)
                }"

              >
                <div class="course-name">{{ row.grade }}-{{classItem.className}}</div>
                <div class="course-name">{{classItem.selectedSubject}}</div>
                <div class="course-name">{{ findSubject(classItem.selectedSubject)?.teacherName }}</div>
                <i class="ico ico-close ico-size-16" @click.stop="classItem.selectedSubject = ''" />
              </button>
              <AutocompleteInput
                v-else
                v-model="classItem.selectedSubject"
                :options="courseList.map(item => item.officialCourse)"
                placeholder="과목선택"
                @list-open="classItem.isOpen = true"
                @list-close="classItem.isOpen = false"
              >
                <template #custom-option="{ items, selectItem }">
                  <div class="item"
                    v-for="(item, idx) in displayList(items)"
                    :key="idx"
                    @mousedown.prevent="selectItem(item.officialCourse)"
                  >
                    {{ item.officialCourse }} ({{ item.displayCourse }}) 
                    <span class="txt-primary">({{ item.periodCount }})</span>
                  </div>
                  <div v-if="items.length === 0" class="hi-nodata sm p-00">
                    <p>검색 결과가 없습니다.</p>
                  </div>
                </template>
              </AutocompleteInput>
            </td>

            <!-- 부족한 칸만큼 빈 td 채우기 -->
            <td
              v-for="n in maxClassList.length - row.classList.length"
              :key="`empty-${n}`"
              class="empty"
            ></td>
            <td>
              <button class="btn-table-cell additional fixed">수업고정</button>
            </td>
            
            <td>
              <span v-if="row.classList.some((_, idx) => isContinuous(row, idx))" class="txt-warning">
                합반
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- 수업 수정 모달 -->
    <TimeTableModal size="md" v-if="isCourseEditModal" @close="isCourseEditModal=false" class="course-edit-modal">
      <template v-slot:heading>
        동시수업 수업 수정
        <p class="smr">
          동시수업의 배정 불가인 교사의 수업을 교체합니다. 변경된 교사의 전체 시수 및 시수표가 변경됩니다.
        </p>
      </template>
      <template v-slot:content>       
        <div class="gray-box">
          <div class="form-check-inline">
            <input type="radio" name="exchange" id="exchange-direct" value="exchange-direct" v-model="courseEditType"/>
            <label for="exchange-direct"><span>맞교환</span></label>
          </div>
          <div class="form-check-inline">
            <input type="radio" name="exchange" id="exchange-chain" value="exchange-chain" v-model="courseEditType" />
            <label for="exchange-chain"><span>넘기기</span></label>
          </div>
        </div>
        <div class="course-edit direct" v-if="courseEditType === 'exchange-direct'">
          <div class="left-area">
            <div class="form-group-inline">
              <label>담당교사</label>
              <div class="form-ctr">            
                <AutocompleteInput
                  v-model="teacherNameBefore"
                  :options="teacherList"
                  placeholder="선택"
                  nodata="일치하는 교사가 없습니다."                  
                />
              </div>
            </div>
            <div class="form-group-inline">    
              <label for="course-name">과목명</label>                          
              <AutocompleteInput
                v-model="courseNameBefore"
                :options="courseList.map(item => item.officialCourse)"
                placeholder="선택"
                disabled
                >
                <template #custom-option="{ items, selectItem }">
                  <div class="item"
                    v-for="(item, idx) in displayList(items)"
                    :key="idx"
                    @mousedown.prevent="selectItem(item.officialCourse)"
                  >
                    {{ item.officialCourse }} ({{ item.displayCourse }}) 
                    <span class="txt-primary">({{ item.periodCount }})</span>
                  </div>
                  <div v-if="items.length === 0" class="hi-nodata sm p-00">
                    <p>일치하는 과목이 없습니다.</p>
                  </div>
                </template>
              </AutocompleteInput>
            </div>
            <div class="form-group-inline">
              <label for="class-group">학반</label>              
              <HiSelectBox           
                class="sm opt-top"
                :value="classNameBefore"
                :items="classList"
                @update:value="classNameBefore = $event"
                :empty-title="classNameBefore || '선택'"
                disabled
              /> 
            </div>
            <div class="form-group-inline">
              <label>시수</label>
              18
            </div>
          </div>
          <i class="change"></i>
          <div class="right-area">
            <div class="form-group-inline">
              <label>담당교사</label>
              <div class="form-ctr">            
                <AutocompleteInput
                  v-model="teacherNameAfter"
                  :options="teacherList"
                  placeholder="선택"
                  nodata="일치하는 교사가 없습니다."                  
                />
              </div>
            </div>
            <div class="form-group-inline">    
              <label for="course-name">과목명</label>
              <AutocompleteInput
                v-model="courseNameAfter"
                :options="courseList.map(item => item.officialCourse)"
                placeholder="선택"                
              >
                <template #custom-option="{ items, selectItem }">
                  <div class="item"
                    v-for="(item, idx) in displayList(items)"
                    :key="idx"
                    @mousedown.prevent="selectItem(item.officialCourse)"
                  >
                    {{ item.officialCourse }} ({{ item.displayCourse }}) 
                    <span class="txt-primary">({{ item.periodCount }})</span>
                  </div>
                  <div v-if="items.length === 0" class="hi-nodata sm p-00">
                    <p>일치하는 과목이 없습니다.</p>
                  </div>
                </template>
              </AutocompleteInput>
            </div>
            <div class="form-group-inline">
              <label for="class-group">학반</label>         
              <HiSelectBox           
                class="sm opt-top"
                :value="classNameAfter"
                :items="classList"
                @update:value="classNameAfter = $event"
                :empty-title="classNameAfter || '선택'"
              /> 
            </div>
            <div class="form-group-inline">
              <label>시수</label>
              -
            </div>
          </div>
        </div>     
        <div class="course-edit chain" v-else>
          <div class="left-area">
            <div class="form-group-inline">
              <label>담당교사</label>
              <div class="form-ctr">            
                <AutocompleteInput
                  v-model="teacherNameBefore"
                  :options="teacherList"
                  placeholder="선택"
                  nodata="일치하는 교사가 없습니다."                  
                />
              </div>
            </div>
            <div class="form-group-inline">    
              <label for="course-name">과목명</label>                          
              <AutocompleteInput
                v-model="courseNameBefore"
                :options="courseList.map(item => item.officialCourse)"
                placeholder="선택"
                disabled
              >
                <template #custom-option="{ items, selectItem }">
                  <div class="item"
                    v-for="(item, idx) in displayList(items)"
                    :key="idx"
                    @mousedown.prevent="selectItem(item.officialCourse)"
                  >
                    {{ item.officialCourse }} ({{ item.displayCourse }}) 
                    <span class="txt-primary">({{ item.periodCount }})</span>
                  </div>
                  <div v-if="items.length === 0" class="hi-nodata sm p-00">
                    <p>일치하는 과목이 없습니다.</p>
                  </div>
                </template>
              </AutocompleteInput>
            </div>
            <div class="form-group-inline">
              <label for="class-group">학반</label>              
              <HiSelectBox           
                class="sm opt-top"
                :value="classNameBefore"
                :items="classList"
                @update:value="classNameBefore = $event"
                :empty-title="classNameBefore || '선택'"
                disabled
              /> 
            </div>
            <div class="form-group-inline">
              <label>시수</label>
              18
            </div>
          </div>
          <i class="change"></i>
          <div class="right-area">
            <div class="form-group-inline">
              <label>담당교사</label>
              <div class="form-ctr">            
                <AutocompleteInput
                  v-model="teacherNameAfter"
                  :options="teacherList"
                  placeholder="선택"
                  nodata="일치하는 교사가 없습니다."                  
                />
              </div>
            </div>
            <div class="form-group-inline">    
              <label for="course-name">과목명</label>
              <AutocompleteInput
                v-model="courseNameAfter"
                :options="courseList.map(item => item.officialCourse)"
                placeholder="선택"
                disabled                  
              >
                <template #custom-option="{ items, selectItem }">
                  <div class="item"
                    v-for="(item, idx) in displayList(items)"
                    :key="idx"
                    @mousedown.prevent="selectItem(item.officialCourse)"
                  >
                    {{ item.officialCourse }} ({{ item.displayCourse }}) 
                    <span class="txt-primary">({{ item.periodCount }})</span>
                  </div>
                  <div v-if="items.length === 0" class="hi-nodata sm p-00">
                    <p>일치하는 과목이 없습니다.</p>
                  </div>
                </template>
              </AutocompleteInput>
            </div>
            <div class="form-group-inline">
              <label for="class-group">학반</label>         
              <HiSelectBox           
                class="sm opt-top"
                :value="classNameAfter"
                :items="classList"
                @update:value="classNameAfter = $event"
                :empty-title="classNameAfter || '선택'"
                disabled
              /> 
            </div>
            <div class="form-group-inline">
              <label>시수</label>
              -
            </div>
          </div>
        </div>     
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="isCourseEditModal=false">취소</button>
        <button type="button" class="btn btn-primary btn-lg" @click="">변경</button>
      </template>
    </TimeTableModal>

    <!-- 동시수업 고정 모달 -->
    <TimeTableModal size="xl" v-if="isconcurrentFixedModal" @close="isconcurrentFixedModal=false" class="concurrent-fixed-modal">
      <template v-slot:heading>
        동시수업 고정
        <p class="smr">
          동시수업을 시간표 자동 배정시 우선 배치하여 고정합니다.
        </p>
      </template>
      <template v-slot:content>
        <div class="gray-box txt-right">
          <button type="button" class="btn btn-tertiary btn-lg txt-warning mr-10" @click="">전체 초기화</button>
          <button type="button" class="btn btn-tertiary btn-lg" @click="">동시수업 자동배치</button>
        </div>
        <div class="tb-row">
          <div class="tb-col-3">
            <div class="table-content time-table">
              <div class="h4-tit">
                <h4>1학년</h4>
              </div>
              <table>
                <caption>시간표</caption>
                <colgroup>
                  <col style="width: 10%;" />
                  <col style="width: 18%;" />
                  <col style="width: 18%;" />
                  <col style="width: 18%;" />
                  <col style="width: 18%;" />
                  <col style="width: 18%;" />
                </colgroup>
                <thead>
                  <tr>
                    <th></th>
                    <th>월</th>
                    <th>화</th>
                    <th>수</th>
                    <th>목</th>
                    <th>금</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="th">1</td>
                    <td>
                      <button type="button" class="btn-table-cell course-select selected"><!-- 선택완료 class 지정-->
                        <div class="course-name">A</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell course-select">
                        <div class="course-name">수업선택</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell course-select">
                        <div class="course-name">수업선택</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell course-select">
                        <div class="course-name">수업선택</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell course-select selecting"> <!-- 선택중 class 지정-->
                        <div class="course-name">수업선택</div>
                      </button>
                      
                      <div class="option-list-wrap"> <!-- 옵션 리스트의 오른쪽이 짤려보이는 수업(예를 들어 세번째 시간표 금요일 수업)은 class에 opt-right 추가-->
                        <div class="option-list is-footer">
                          <div class="item">
                            <div class="form-check-inline">
                              <input type="checkbox"  id="1" value="1">
                              <label for="1">
                                <span>G(1시간)</span>
                              </label>
                            </div>
                          </div>                          
                          <div class="item">
                            <div class="form-check-inline">
                              <input type="checkbox"  id="2" value="2">
                              <label for="2">
                                <span>K(2시간 연속)</span>
                              </label>
                            </div>
                          </div>                          
                          <div class="item">
                            <div class="form-check-inline">
                              <input type="checkbox"  id="3" value="3">
                              <label for="3">
                                <span>A</span>
                              </label>
                            </div>
                          </div>                          
                          <div v-if="false" class="hi-nodata">
                            <p>배정가능한 수업이 없습니다.</p>
                          </div>
                        </div>
                        <div class="option-footer">
                          <button type="button" class="btn btn-primary btn-md w100">등록</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="th">2</td>
                    <td>
                      <button type="button" class="btn-table-cell course-select">
                        <div class="course-name">수업선택</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell course-select">
                        <div class="course-name">수업선택</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell course-select">
                        <div class="course-name">수업선택</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell course-select">
                        <div class="course-name">수업선택</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell course-select">
                        <div class="course-name">수업선택</div>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="th">3</td>
                    <td>
                      <button type="button" class="btn-table-cell fixed-course">
                        <div class="course-name">창체</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell fixed-course">
                        <div class="course-name">수업없음</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell course-select">
                        <div class="course-name">수업선택</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell fixed-course">
                        <div class="course-name">수업없음</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell course-select">
                        <div class="course-name">수업선택</div>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div> 
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="">취소</button>
        <button type="button" class="btn btn-primary btn-lg" @click="">저장</button>
      </template>
    </TimeTableModal>

  </div>
</template>

<script>
import HiSelectBox from '@/components/Form/HiSelectBox.vue';
import AutocompleteInput from '@/apps/timetable/components/AutocompleteInput.vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
export default {
  data() {
    return {
      selectedGrade: '',
      courseListOpen: false,
      courseList: [
        { officialCourse: '과학', displayCourse: '과학2', periodCount: 3, teacherName: '김선생'},
        { officialCourse: '영어', displayCourse: '영어1', periodCount: 3, teacherName: '이선생' },
        { officialCourse: '수학', displayCourse: '수학2', periodCount: 3, teacherName: '강선생' },
        { officialCourse: '체육', displayCourse: '체육2', periodCount: 3, teacherName: '최선생' }
      ], 
      rows: [
        {
          id: 1,
          grade: '',
          groupName: '',
          period: '',
          continuous: '',
          classList: [ 
            { className: '1', selectedSubject: '' , isOpen: false},
            { className: '2', selectedSubject: '', isOpen: false },
            { className: '3', selectedSubject: '' , isOpen: false},
            { className: '4', selectedSubject: '' , isOpen: false},
            { className: '5', selectedSubject: '', isOpen: false },
            { className: '가상1', selectedSubject: '' , isOpen: false},
          ],
          isFixed: true,        
        },
        {
          id: 2,
          grade: '1',
          groupName: '그룹명',
          period: '5',
          continuous: '',
          classList: [ 
            { className: '1', selectedSubject: '영어' , isOpen: false},
            { className: '2', selectedSubject: '수학', isOpen: false },
            { className: '3', selectedSubject: '수학' , isOpen: false},
            { className: '4', selectedSubject: '과학', isOpen: false },
          ],
          isFixed: false,
        },
        {
          id: 3,
          grade: '2',
          groupName: '그룹명',
          period: '5',
          continuous: '',
          classList: [ 
            { className: '1', selectedSubject: '영어', isOpen: false },
            { className: '2', selectedSubject: '체육' , isOpen: false},
            { className: '3', selectedSubject: '수학', isOpen: false },
            { className: '4', selectedSubject: '국어' , isOpen: false},
            { className: '5', selectedSubject: '과학' , isOpen: false},
            { className: '가상1', selectedSubject: '수학' , isOpen: false},
          ],
          isFixed: false,
        },
      ],

      //수업수정 모달
      isCourseEditModal: false, // 수업 수정 모달
      courseEditType: 'exchange-direct', // 맞교환, 넘기기
      teacherList: ['김선생', '이선생', '박선생', '최선생'], // 교사 이름 목록     
      classList: [
        { value: '1-1', title: '1-1' },
        { value: '2-1', title: '2-1' },
        { value: '3-1', title: '3-1' },
        { value: '4-1', title: '4-1' },
        { value: '5-1', title: '5-1' },
        { value: '6-1', title: '6-1' }
      ],
      
      //변경 전
      teacherNameBefore: null, // 변경 전 담당교사
      courseNameBefore: null, // 변경 전 과목명
      classNameBefore: null, // 변경 전 학반

      //변경 후
      teacherNameAfter: null, // 변경 후 담당교사
      courseNameAfter: null, // 변경 후 과목명
      classNameAfter: null, // 변경 후 학반

      //동시수업 고정
      isconcurrentFixedModal: false, // 동시수업 고정 모달
    };
  },  
  props: {
    helpOn: {
      type: String,
      default: 0,
    },
  },
  components: {
    HiSelectBox, AutocompleteInput,TimeTableModal
  },
  computed: {
    // 가장 많은 반
    maxClassList() {
      const sorted = this.rows.slice().sort((a, b) => b.classList.length - a.classList.length);
      return sorted[0]?.classList || [];
    }
  },
  methods: {    

    // autocomplete 리스트에 있는 과목명으로 필터링
    displayList(filteredStrings) {
      return this.courseList.filter(item =>
        filteredStrings.includes(item.officialCourse)
      );
    },

    // autocomplete 과목명으로 과목 찾기
    findSubject(subjectName) {
      return this.courseList.find(item => item.officialCourse === subjectName);
    },

    // 연속 수업 여부 확인
    isContinuous(row, idx) {
      const current = row.classList[idx]?.selectedSubject;
      const prev = row.classList[idx - 1]?.selectedSubject;
      const next = row.classList[idx + 1]?.selectedSubject;
      return current && (current === prev || current === next);
    },
    
    // 도움말 열기
    openHelp(index) {
      this.$emit('openHelp', index);
    },

    // 시수 등록하지 않고 과목 영역 클릭시
    noti1(){
      this.$hiClass.confirm('시수를 선택해 주세요', null, {
        customClass: {          
          popup:  'timetable-confirm',
        },
        showCancelButton: false, 
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },

    //[동시]등록한 상태에서 시수 변경 시
    noti2(){
      this.$hiClass.confirm(`시수 변경 시 등록한 과목이 전체 해제됩니다.<br>변경하시겠습니까?`, null, {
        customClass: {
          popup:  'timetable-confirm',
        },
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },

    //그룹명 입력하지 않고 다음 클릭, 다음 탭으로 이동시 
    noti3(){
      this.$hiClass.confirm('그룹명을 입력해주세요.', null, {
        customClass: {          
          popup:  'timetable-confirm',
        },
        showCancelButton: false, 
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },

    //동일 선생님 수업 선택 시 합반처리
    noti4(){
      this.$hiClass.confirm(`선택하신 수업은 동일한 선생님 수업입니다.<br>합반 처리 하시겠습니까?`, null, {
        customClass: {
          popup:  'timetable-confirm',
        },
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },

    // 동시/고정 한 상태에서 연속 수업 정보 변경된 경우
    noti5(){
      this.$hiClass.confirm(`연속 시수가 변경될 경우 고정 수업이<br>삭제됩니다. 수정하시겠습니까?`, null, {
        customClass: {
          popup:  'timetable-confirm',
        },
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },

    // 동시 수업 오류 수정하지 않고 다른 탭/버튼 클릭시
    noti6(){
      this.$hiClass.confirm(`동시수업에 오류가 있습니다.<br>확인해주세요.`, null, {
        customClass: {
          popup:  'timetable-confirm',
        },
        showCancelButton: false, 
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },

    // 맞교환, 넘기기
    noti7(modeText = '맞교환'){
      this.$hiClass.confirm(`
      3-1 문매 담당 <strong>[김하이]</strong> 선생님을 1-3 수학담당
      <br><strong>[심청이]</strong> 선생님과 ${modeText === '맞교환' ? '맞교환 하' : '넘기'}시겠습니까?
      <div class="blue-box"> 
        <i class="hi-ico ico-primary ico-warning-circle-fill ico-size-18"></i>
        변경 시 담당과목에 추가 및 시수표에 ${modeText === '맞교환' ? '맞교환한' : '넘기기'} 학반이 자동 적용됩니다.
      </div>      
      `, null, {
        customClass: 'timetable-confirm',
        showCloseButton: true,
        confirmButtonText: '예',
        cancelButtonText: '아니오'
      })
      .then(() => { })
      .catch(() => { });
    },
  }
};
</script>

<style lang="scss" scoped>
.table-head{
  .hi-selectbox{
    width: 160px;
  }
}
.table-content{
  table > tbody > tr > td{height: 96px;}

  // error 처리
  tr.error{
    td:not(.empty),
    td button,
    .hi-selectbox ::v-deep .selected,
    .autocomplete-wrap ::v-deep input,
    input{
      background-color: #faebeb !important;
    }
    td.error button > div{
      color: var(--warning);
    }
  }
}
// 과목 자동완성 리스트 
td .autocomplete-wrap ::v-deep{
  .autocomplete-list{
    width:280px;
    top: calc(100% - 6px);
    left: 4px;
    .item{
      display: flex;
    }      
  }
}

// 수업 수정 모달
.course-edit-modal{
  ::v-deep {
    .modal__layer,
    .modal__content{
      overflow: visible;
    }
  }
  .course-edit{
    display: flex;
    margin-top: 16px;
    align-items: center;
    > div{
      border-radius: 16px;
      border: 1px solid #BDBDBD;
      padding: 32px;
      width: calc(50% - 44px);
      label{
        min-width: 80px;
        margin-right: 16px;
      }
    }
    .change{    
      display: inline-block;  
      width:56px;
      height:56px;
      mask-image: url(~@/assets/img/timetable/ico-exchange-direct.svg);
      background: var(--primary);
      mask-size: 100%;
      margin: 16px;
    }
    &.chain{
      .change{
        mask-image: url(~@/assets/img/timetable/ico-exchange-chain.svg);
      }
    }
  }
  // 교사 추가 autocomplete
  .autocomplete-wrap{
    ::v-deep{
      .autocomplete-list{
        max-height: 180px;
      }
    }
  }
  
  .hi-selectbox{
    width: 100%!important;
    ::v-deep{
      .option__layer{
        max-height: 140px;
      }
    }
  }
}

// 동시수업 고정 모달
.concurrent-fixed-modal{
  ::v-deep {
    .modal__layer,
    .modal__content{
      overflow: visible;
    }
  }
  .option-list-wrap{    
    position: absolute;
    top: calc(100% - 6px);
    left: 50%;
    transform: translateX(-50%);
    width: 260px;   
    position: absolute;
    left: 8px;
    transform: translateX(0);
    z-index: 1;   
    &.opt-right{
      left: auto !important;
      right: 8px;
    }
  }

    // .option-list-wrap{    
    //   z-index: 1;    
    //   border: 1px solid #d6d6d6;
    //   border-radius: 8px;
    //   overflow: hidden;
    //   background: #fff;
    //   .option-list{        
    //     border: none;   
    //     width: 100%;
    //     max-height: 150px;
    //     overflow-y: auto;
    //   }
    // }

    
}
</style>
