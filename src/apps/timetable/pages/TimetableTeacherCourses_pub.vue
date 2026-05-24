<template>
  <section class="tt-teacher-courses" >
    <div class="table-head">
      <div class="search-area">
        <input type="text" v-model="searchKeyword" placeholder="과목명" />
        <button type="button" class="btn btn-tertiary btn-lg ml-10" > 검색 </button>
      </div>
      <div class="btn-area">
        <button type="button" class="btn btn-tertiary btn-lg" @click="deleteSelected" :disabled="!hasChecked">선택 삭제하기</button>
        <button type="button" class="btn btn-tertiary-blue btn-lg ml-10" @click="addTeacher">
          교사 추가
        </button>
        <button type="button" class="btn btn-tertiary-blue btn-lg ml-10" @click="TimetableTeacherList = true">
          교사 명단 불러오기
        </button>
      </div>
    </div>
    <div class="table-content table-form">
      <table>
        <caption>과목 및 시수 등록</caption>
        <colgroup>
          <col style="width:10%">
          <col style="width:20%">
          <col style="width:50%">
          <col style="width:20%">
        </colgroup>
        <thead>
          <tr>
            <th scope="col">
              <div class="form-check">
                <input type="checkbox" id="allChecked" v-model="allChecked" @change="toggleAllChecked" />
                <label for="allChecked"></label>
              </div>
            </th>
            <th scope="col">
              이름
              <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
            </th>
            <th scope="col">
              과목 등록 
              <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
            </th>
            <th scope="col">
              담당학급 
              <button type="button" class="btn btn-link btn-help" :class="{'help-on' : helpOn === 1}" @click="openHelp(1)">
                <span class="sr-only">도움말</span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(crs, index) in filteredTeacherCourses" :key="index">
            <td>
              <div class="form-check">
                <input 
                  type="checkbox" 
                  v-model="crs.checked" 
                  :id="'filteredTeacherCourses-' + index" />
                <label :for="'filteredTeacherCourses-' + index"></label>
              </div>
            </td>
            <td>
              <div class="input-wrap">
                <input
                  type="text"
                  v-model="crs.teacher"
                  placeholder="교사명"
                  :class="{ 'error': false }"
                />
              </div>
            </td>
            <td>                          
              <CourseSelect
                :index="index"
                :tags="coursesList"
                :selectedTags="crs.courses"
                :placeholder="crs.courses.length === 0 ? '과목명 입력' : ''"
                :is-error="false" 
                @add:tags="addCourse($event, index)"
                @remove:tags="removeCourse($event, index)"
                @click.stop
              /> 
            </td>
            <td>
              <AutocompleteInput
                v-model="crs.clazz"
                :options="clazzList"
                placeholder="연결"
                nodata="일치하는 학급이 없습니다."
                :is-error="false"
              />
            </td>
          </tr>
          <tr>
            <td colspan="4" class="tfoot">ENTER 키로 다음 칸으로 이동하세요.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <TimetableTeacherList v-if="TimetableTeacherList" @close="TimetableTeacherList = false" />
  </section>
</template>

<script >
import CourseSelect from '@/apps/timetable/components/CourseSelect.vue';
import TimetableTeacherList from '@/apps/timetable/components/TimetableTeacherList.vue';
import AutocompleteInput from '@/apps/timetable/components/AutocompleteInput.vue';
export default {
  data() {
    return {
      searchKeyword: '',
      coursesList: [
        { id:1, officialCourse: '국어', displayCourse: '국어', periodCount: 5 },
        { id:2, officialCourse: '수학', displayCourse: '수학', periodCount: 5 },
        { id:3, officialCourse: '영어', displayCourse: '영어', periodCount: 4 },
        { id:4, officialCourse: '과학', displayCourse: '과학', periodCount: 4 },
        { id:5, officialCourse: '경제', displayCourse: '경A', periodCount: 3 },
        { id:6, officialCourse: '문학과 매체', displayCourse: '문매', periodCount: 2 },
        { id:7, officialCourse: '문학과 매체', displayCourse: '문매', periodCount: 3 },
        { id:8, officialCourse: '물리학 I', displayCourse: '물1', periodCount: 2 },
        { id:9, officialCourse: '물리학 II', displayCourse: '물2', periodCount: 2 },
        { id:10, officialCourse: '도덕', displayCourse: '도덕', periodCount: 1 },
        { id:11, officialCourse: '과학탐구', displayCourse: '과학탐구', periodCount: 3 },
      ],
      clazzList: ['1-1', '1-2', '1-3', '1-4', '1-5', '2-1', '2-2', '2-3', '2-4', '2-5'],
      teacherCourse: [
        { teacher: '김선생', 
          courses: [
            { id:1, officialCourse: '국어', displayCourse: '국어', periodCount: 5 },
            { id:2, officialCourse: '수학', displayCourse: '수학', periodCount: 5 },
            { id:3, officialCourse: '영어', displayCourse: '영어', periodCount: 4 }
          ], 
          clazz: "1-4", 
          checked: false, showList: false 
        },
        { teacher: '이선생', 
          courses: [          
            { id:1, officialCourse: '국어', displayCourse: '국어', periodCount: 5 },
            { id:2, officialCourse: '수학', displayCourse: '수학', periodCount: 5 },
          ], 
          clazz: "1-5", checked: false, showList: false  
        },
        { teacher: '박선생', courses: [], clazz: "2-1", checked: false, showList: false  },
        { teacher: '최선생', courses: [], clazz: "2-2", checked: false, showList: false  },
      ],
      allChecked: false,
      TimetableTeacherList: false,
    };
  },
  components: {
    CourseSelect,TimetableTeacherList, AutocompleteInput
  },
  props: {
    helpOn: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    // 정제된 리스트
    filteredTeacherCourses() {
      if (!this.searchKeyword) return this.teacherCourse;
      return this.teacherCourse.filter((crs) => crs.teacher.includes(this.searchKeyword));
    },
    // checked가 존재하는 경우 (선택 삭제하기 버튼 활성화 용도)
    hasChecked() {
      return this.teacherCourse.some((crs) => crs.checked);
    },
  },
  methods: {
    // 전체 선택
    toggleAllChecked() {
      this.teacherCourse.forEach((crs) => {
        crs.checked = this.allChecked;
      });
    },
    // 아이템 삭제
    deleteOne(index) {
      this.teacherCourse.splice(index, 1);
    },
    // 선택 아이템 삭제
    deleteSelected() {
      this.teacherCourse = this.teacherCourse.filter((crs) => !crs.checked);
      this.allChecked = false;
    },
    // 아이템 추가
    addTeacher() {      
      this.teacherCourse.push({
        teacher: '',
        courses: [],
        clazz: '',
        checked: false,
        showList: false,
      });
    },
    // enter 키로 다음 칸으로 이동
    handleKeyDown(event, index) {
      if (event.key === 'Enter' && index === this.teacherCourse.length - 1) {
        this.addTeacher();
      }
    },

    // 과목 추가 
    addCourse(event, index) {
      if (!this.teacherCourse[index].courses.some((t) => t.officialCourse === event.officialCourse)) {
        this.teacherCourse[index].courses.push(event); 
      }
    },
    // 과목 추가 
    removeCourse(event, index) {
      this.teacherCourse[index].courses = this.teacherCourse[index].courses.filter((t) => t.officialCourse !== event.officialCourse); 
    },

    // 도움말 열기
    openHelp(index) {
      this.$emit('openHelp', index);
    },
    
    // 기본 알림창
    noti(){
      this.$hiClass.confirm('과목 등록은 100개까지 가능합니다.', null, {
        showCancelButton: false,  // 취소버튼 숨기기
        customClass: 'timetable-confirm',
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },
    
    // 알림창 - 버튼 색상이 다른경우
    noti1(){
      this.$hiClass.confirm('선택한 과목을 삭제하시겠습니까?', null, {
        customClass: {
          popup:  'timetable-confirm',
          confirmButton: 'btn-warning',  // 버튼 색상 변경
        },
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },

    // 알림창 - 내용이 2줄인경우
    noti2(){
      this.$hiClass.confirm('복수교사가 체크된 과목은 2명 이상 <br>교사가 등록되어야 합니다.', null, {
        showCancelButton: false,  // 취소버튼 숨기기
        customClass: 'timetable-confirm',
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },

    // 알림창 - 내용에 html이 들어있는 경우
    noti3(){
      this.$hiClass.confirm(`
      연결되지 않은 담당학급이 있습니다. <br>담당 학급을 연경해주세요.
      <div class="blue-box"> 
        <i class="hi-ico ico-primary ico-warning-circle-fill ico-size-18"></i>
        담당학급이 다 연결되지 않은 경우<br>시간표 배정에 오류가 발생할 수 있습니다.
      </div>      
      `, null, {
        showCancelButton: false,  // 취소버튼 숨기기
        customClass: 'timetable-confirm',
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },
  },
};
</script>

<style lang="scss" scoped> 
.tt-teacher-courses {
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
