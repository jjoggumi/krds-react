<template>
  <section class="tt-courses">
    <div class="table-head">
      <div class="search-area">
        <input type="text" v-model="searchKeyword" placeholder="과목명" />
        <button type="button" class="btn btn-tertiary btn-lg ml-10" > 검색 </button>
      </div>
      <div class="btn-area">
        <button type="button" class="btn btn-tertiary btn-lg" @click="deleteSelected" :disabled="!hasChecked">선택 삭제하기</button>
        <button type="button" class="btn btn-tertiary-blue btn-lg ml-10 pr-40" @click="addCourse">
          과목 추가하기
        </button>
        <button type="button" class="btn btn-link btn-help" :class="{'help-on' : helpOn === 1}" @click="openHelp(1)"><span class="sr-only">도움말</span></button>
      </div>
    </div>
    <div class="table-content table-form">
      <table>
        <caption>시간표 정보 입력</caption>
        <colgroup>
          <col style="width:10%">
          <col style="width:20%">
          <col style="width:20%">
          <col style="width:20%">
          <col style="width:20%">
          <col style="width:10%">
        </colgroup>
        <thead>
          <tr>
            <th scope="col">
              <div class="form-check">
                <input type="checkbox" id="allChecked" v-model="allChecked" @change="toggleAllChecked" />
                <label for="allChecked"></label>
              </div>
            </th>
            <th scope="col">정식 과목명(0) 
              <button type="button" class="btn btn-link btn-help" :class="{'help-on' : helpOn === 2}" @click="openHelp(2)"><span class="sr-only">도움말</span></button>
              <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
            </th>
            <th scope="col">표기 과목명              
              <button type="button" class="btn btn-link btn-help" :class="{'help-on' : helpOn === 3}" @click="openHelp(3)"><span class="sr-only">도움말</span></button>
              <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
            </th>
            <th scope="col">시수</th>
            <th scope="col">복수 교사
              <button type="button" class="btn btn-link btn-help" :class="{'help-on' : helpOn === 4}" @click="openHelp(4)"><span class="sr-only">도움말</span></button>
              <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
            </th>
            <th scope="col">삭제</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(crs, index) in filteredCourses" :key="index" >
            <td>
              <div class="form-check">
                <input 
                  type="checkbox" 
                  v-model="crs.checked" 
                  :id="'filteredCourses-' + index" />
                <label :for="'filteredCourses-' + index"></label>
              </div>
            </td>

            <!-- 자동완성 입력 -->
            <td :class="{ 'error': false }">
              <AutocompleteInput
                v-model="crs.officialCourse"
                :options="subjectList"
                placeholder="과목명 입력"
                nodata="일치하는 과목이 없습니다."
              />
            </td>
            <td >                      
              <div class="input-wrap">
                <input type="text" v-model="crs.displayCourse" placeholder="과목명 입력" :class="{ 'error': false }"/>   
              </div>
              <!-- 과목명과 시수가 동일할때 에러 처리 -->           
              <HiTooltip v-if="false"  
                class="hi-tooltip-wrap info bottom txt-left" ico="info" position="top" isActive
                :title-html="`과목명과 시수가 동일한 과목이 있습니다.`"
              />         
            </td>
            <td>              
              <div class="input-wrap">
                <input type="text" v-model="crs.periodCount" placeholder="1~9까지의 숫자 입력" :class="{ 'error': true }"
                @keydown.enter="handleKeyDown($event, index)"/>
              </div>
            </td>
            <td>
              <div class="form-check">
                <input type="checkbox" :id="'double-teacher' + index" v-model="crs.isDoubleTeacher" />
                <label :for="'double-teacher' + index"></label>
              </div>
            </td>
            <td>
              <button type="button" @click="deleteOne(index)"             
              ><i class="ico ico-trash ico-size-20 ico-gray"></i></button>
            </td>
          </tr>
          <tr>
            <td colspan="6" class="tfoot">ENTER 키로 다음 칸으로 이동하세요.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import AutocompleteInput from '@/apps/timetable/components/AutocompleteInput.vue';
export default {
  data() {
    return {
      searchKeyword: '',
      subjectList: ['국어', '수학', '영어', '과학', '사회', '음악', '체육', '미술', '기술', '도덕', '과학탐구'],
      courses: [
        { officialCourse: '국어', displayCourse: '', periodCount: 5, isDoubleTeacher: false, checked: false, showList: false },
        { officialCourse: '수학', displayCourse: '', periodCount: 6, isDoubleTeacher: false, checked: false, showList: false },
        { officialCourse: '영어', displayCourse: '', periodCount: 4, isDoubleTeacher: false, checked: false, showList: false },
        { officialCourse: '과학', displayCourse: '', periodCount: 3, isDoubleTeacher: true, checked: false, showList: false },
      ],
      allChecked: false,
    };
  },
  props: {
    helpOn: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    // 정제된 리스트
    filteredCourses() {
      if (!this.searchKeyword) return this.courses;
      return this.courses.filter((crs) => crs.officialCourse.includes(this.searchKeyword));
    },
    // checked가 존재하는 경우 (선택 삭제하기 버튼 활성화 용도)
    hasChecked() {
      return this.courses.some((crs) => crs.checked);
    },
  },
  mounted() {
    // 페이지 로드 시 알림창 표시
    this.noti();
  },
  components: {
    AutocompleteInput
  },
  methods: {
    // 전체 선택
    toggleAllChecked() {
      this.courses.forEach((crs) => {
        crs.checked = this.allChecked;
      });
    },
    // 아이템 삭제
    deleteOne(index) {
      this.courses.splice(index, 1);
    },
    // 선택 아이템 삭제
    deleteSelected() {
      this.courses = this.courses.filter((crs) => !crs.checked);
      this.allChecked = false;
    },
    // 아이템 추가
    addCourse() {
      this.courses.push({
        officialCourse: '',
        displayCourse: '',
        periodCount: '',
        isDoubleTeacher: false,
        checked: false,
        showList: false,
      });
    },
    // enter 키로 다음 칸으로 이동
    handleKeyDown(event, index) {
      if (event.key === 'Enter' && index === this.courses.length - 1) {
        this.addCourse();
      }
    },
    
    // 도움말 열기
    openHelp(index) {
      this.$emit('openHelp', index);
    },

    // 기본 알림창
    noti(){
      this.$hiClass.confirm('과목 등록은 100개까지 가능합니다.', null, {
        title: '확인',
        showCancelButton: false,
        customClass: 'timetable-confirm',
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },
    // 알림창 - 버튼 색상이 다른경우
    noti1(){
      this.$hiClass.confirm('동일한 과목이 있습니다. <br>과목명과 시수를 확인해주세요.', null, {
        title: '확인',
        customClass: {
          popup:  'timetable-confirm',
          confirmButton: 'btn-warning',
        },
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },
  },
};
</script>
<style scoped lang="scss">
.tt-courses {
  .hi-tooltip-wrap{
    position: absolute;
    right: calc(50% - 8px);
    top: 15px;
    &::before{
      display: none;
    }
  }
  .table-head .btn-area{
    position: relative;
    .btn-help{
      position: absolute;
      right: 20px;
    }
  } 
  .autocomplete-wrap{
    ::v-deep .autocomplete-list{
        min-width: 200px;
        top: calc(100% - 6px);
        left: 50%;
        transform: translateX(-50%);
      }
  }
}
</style>
