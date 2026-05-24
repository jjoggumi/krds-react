<template>
  <div class="time-table-wrap">
    <div>전체 시간표</div> 
    <button @click="showLessonChangeLayer = true">수업변경 모달 열기</button> 
    
    <!-- 수업변경 -->
    <SideModal
      :isOpen="showLessonChangeLayer"
      @close="close"
      min-width="1000"
      size="xl"
      class="course-change-side-modal"
    >
      <template v-slot:heading>수업 변경</template>
      <template v-slot:desc>전체 시간표에서 선생님의 일정을 변경합니다.</template>
      <template v-slot:content> 
        <!-- 수업 변경 선택 -->
        <div class="form-group-inline mt-20 mb-20">
          <label class="sm">수업 변경 선택</label>
          <div class="form-ctr" v-for="item in LessonChangeList" :key="item.lessonChangeType">
            <input 
              type="radio"
              name="courseChange"
              :id="item.lessonChangeType"
              :value="item.lessonChangeType"
              v-model="selectedLessonChangeType" 
            />
            <label :for="item.lessonChangeType">
              <span>{{ item.label }}</span>
            </label>
          </div>          
        </div>        
        
        <!-- 수업교체 -->
        <change-lesson-exchange v-if="selectedLessonChangeType === TimetableDailyLessonChangeType.Exchange" />

        <!-- 결, 보강 -->
        <change-lesson-adjustment v-if="selectedLessonChangeType === TimetableDailyLessonChangeType.Adjustment" />

        <!-- 수업 변경 -->
        <change-lesson-replacement 
          v-if="selectedLessonChangeType === TimetableDailyLessonChangeType.Replacement"
          :timetable-id="selectedTimetableId"
        />

        <!-- 수업 추가 -->
        <change-lesson-addition v-if="selectedLessonChangeType === TimetableDailyLessonChangeType.Addition" />

        <!-- 합반 배정 -->
        <change-lesson-combination v-if="selectedLessonChangeType === TimetableDailyLessonChangeType.Combination" />

        <!-- 복수교사 배정 -->
        <change-lesson-multiple v-if="selectedLessonChangeType === TimetableDailyLessonChangeType.Multiple" />

      </template>
      <template v-slot:footer>          
        <button class="btn btn-tertiary btn-md" @click="close">취소</button>
        <button class="btn btn-primary btn-md" >변경하기</button>
      </template> 
    </SideModal>     
  </div>  
</template>

<script lang="ts" setup>
import { ref, provide, reactive, onMounted } from 'vue';
import "@/assets/css/timetable/common.scss"; // 공통 스타일
import SideModal from '@/components/Modal/SideModal.vue';
import ChangeLessonExchange from "@/apps/timetable/components/ChangeLessonExchange.vue";
import ChangeLessonAdjustment from "@/apps/timetable/components/ChangeLessonAdjustment.vue";
import ChangeLessonReplacement from "@/apps/timetable/components/ChangeLessonReplacement.vue";
import ChangeLessonAddition from "@/apps/timetable/components/ChangeLessonAddition.vue";
import ChangeLessonCombination from "@/apps/timetable/components/ChangeLessonCombination.vue";
import ChangeLessonMultiple from "@/apps/timetable/components/ChangeLessonMultiple.vue";
import {
  ContextKeys,
  TimetableCourseContext,
  TimetableTeacherContext,
  TeacherCourseContext,
  ConcurrentConfContext,
  SpecialtyRoomContext,
  TimetableGradeContext,
  TimetableClassContext,
} from "../contexts";
import { TimeUtils } from '../common/utils';
import { Timetables } from '@/apis/Timetables';
import { TimetableDailyLessonChangeType } from '../core/types';


const courseContext = reactive(TimetableCourseContext.getInstance());
provide(ContextKeys.Course, courseContext);

const teacherContext = reactive(TimetableTeacherContext.getInstance());
provide(ContextKeys.Teacher, teacherContext);

const teacherCourseContext = reactive(TeacherCourseContext.getInstance());
provide(ContextKeys.TeacherCourse, teacherCourseContext);

const concurrentConfContext = reactive(ConcurrentConfContext.getInstance());
provide(ContextKeys.ConcurrentConf, concurrentConfContext);

const specialtyRoomContext = reactive(SpecialtyRoomContext.getInstance());
provide(ContextKeys.SpecialtyRoom, specialtyRoomContext);

const timetableGradeContext = reactive(TimetableGradeContext.getInstance());
provide(ContextKeys.Grade, timetableGradeContext);

const timetableClassContext = reactive(TimetableClassContext.getInstance());
provide(ContextKeys.Class, timetableClassContext);

interface LessonChangeTypeOption {
  lessonChangeType: TimetableDailyLessonChangeType;
  label: string;
}

const LessonChangeList: LessonChangeTypeOption[] = [
  { lessonChangeType: TimetableDailyLessonChangeType.Exchange, label: '수업 교체' },
  { lessonChangeType: TimetableDailyLessonChangeType.Adjustment, label: '결, 보강' },
  { lessonChangeType: TimetableDailyLessonChangeType.Replacement, label: '수업 변경' },
  { lessonChangeType: TimetableDailyLessonChangeType.Addition, label: '수업 추가' },
  { lessonChangeType: TimetableDailyLessonChangeType.Combination, label: '합반 배정' },
  { lessonChangeType: TimetableDailyLessonChangeType.Multiple, label: '복수교사 배정' }
];

const selectedLessonChangeType = ref<TimetableDailyLessonChangeType>(TimetableDailyLessonChangeType.Exchange);
const showLessonChangeLayer = ref<boolean>(false);

const close = () => {
  showLessonChangeLayer.value = false;
  selectedLessonChangeType.value = TimetableDailyLessonChangeType.Exchange; // 초기화
}

const selectedTimetableId = ref<string | null>(null);
const schoolId = ref<string>('0aaa2672-d43a-11e9-86da-98be94437cd2');

onMounted(async () => {
  await initialize();

  // 개발 관련 초기화: 수업변경(변경) 개발중
  showLessonChangeLayer.value = true;
  selectedLessonChangeType.value = TimetableDailyLessonChangeType.Replacement;
});

const initialize = async () => {
  // 현재 날짜 기준 주간 날짜를 가져온다. (일 ~ 토)
  const currentDate = TimeUtils.getTodayAsNumber();
  const [startDate, endDate] = TimeUtils.getWeekRange(currentDate);

  // console.log('[오늘]', currentDate, '주간 날짜 범위:', startDate, endDate);

  await getTimetableInfoByActiveDate();
};

const getTimetableInfoByActiveDate = async () => {
  // 현재 날짜에 활성화된 시간표 정보를 가져온다.
  const currentDate = TimeUtils.getTodayAsNumber();
  const api = new Timetables();
  const { data } = await api.getActiveTimetableByDateActivebydateDate(currentDate, { schoolId: schoolId.value });
  
  // console.log('현재 날짜에 활성화된 시간표 정보:', data);

  const { isActivated, timetableId } = data  as { isActivated: boolean; timetableId: string | null };

  if(isActivated !== true || timetableId === null) {
    // 활성화된 시간표 정보가 있는 경우
    console.warn('현재 날짜에 활성화된 시간표 정보가 없습니다.');
    return;  
  }
  
  selectedTimetableId.value = timetableId;
  await reloadContextAllWithTimetableId(timetableId);
};

const reloadContextAllWithTimetableId = async (timetableId: string) => {

  // 시간표 ID로 모든 컨텍스트를 리로드한다.
  await timetableGradeContext.reloadWithTimetableId(timetableId);
  await courseContext.reloadWithTimetableId(timetableId);
  await courseBaseContext.reloadWithTimetableId(timetableId);
  await teacherContext.reloadWithTimetableId(timetableId);
  await teacherCourseContext.reloadWithTimetableId(timetableId);
  await concurrentConfContext.reloadWithTimetableId(timetableId);
  await specialtyRoomContext.reloadWithTimetableId(timetableId);
  await timetableClassContext.reloadWithTimetableId(timetableId);
};

/*
export default {
  components: {
    SideModal,
    AutocompleteInput,
    HiSelectBox
  },
  data() {
    return {

      //  수업변경 사이드 모달 오픈 여부
      iscourseChange: false, 

      //  선택된 수업 변경 유형   
      selectedCourseChange: '', 

      //  수업 변경 유형 옵션
      CourseChangeList: [       
        { id: '1', label: '수업 교체' },
        { id: '2', label: '결, 보강' },
        { id: '3', label: '수업 변경' },
        { id: '4', label: '수업 추가' },
        { id: '5', label: '합반 배정' },
        { id: '6', label: '복수교사 배정' },
      ],

      // 선택된 교사
      selectedTeacher: null, 

      // 교사 리스트
      teacherList: ['김선생(사문탐, 공통사회)', '이선생(수학)', '박선생(영어)', '최선생(체육)'], 

      // 연속 수업 hover된 그룹
      hoveredId: null, 


      ///////////// 수업추가 
      // 선택된 과목
      selectedGradeCourse: '1-2 사문탐', 

      // 과목 리스트
      gradeCourseList: [
        { value: "1", title: "1-2 사문탐" },
        { value: "2", title: "1-3 사문탐" },
        { value: "3", title: "1-4 사문탐" },
        { value: "4", title: "1-3 공통사회"}
      ], 



      ///////////// 수업 교체
      // 선택된 변경 가능 시간
      selectedChangeTime: '이정희 (3/2(수1) 2-1 국어), 박선영 (3/2(수1) 2-1 국어)', 
      
      // 변경 가능 시간 리스트
      changeTimeList: [  
        { value: "1", title: "이정희 (3/2(수1) 2-1 국어), 박선영 (3/2(수1) 2-1 국어)" },
        { value: "2", title: "김민수 (3/2(수2) 2-2 수학), 이서영 (3/2(수2) 2-2 수학)" },
        { value: "3", title: "장수민 (3/2(수3) 2-3 영어), 최영호 (3/2(수3) 2-3 영어)" },
        { value: "4", title: "이상현 (3/2(수4) 2-4 과학), 박지은 (3/2(수4) 2-4 과학)" }], 




      ///////////// 수업 변경
      // 선택된 수업
      selectedCourse : { gradeClass: '1-1', course: '사문탐', isOpen: false },     
    
      // 수업 리스트
      courseList: [
        { gradeClass: '1-1', course: '사문탐'},
        { gradeClass: '2-1', course: '동사'},
        { gradeClass: '2-2', course: '사문탐'},
        { gradeClass: '2-3', course: '사문탐'}
      ], 




      ///////////// 합반 배정
      // 선택된 학급 리스트
      selectedMergedClassList: [],

      // 학급 리스트
      MergedClassList: [
        { id: '11', name: '1-1 김창운 (음악)' },
        { id: '22', name: '1-2 무영숙 (사문탐, 공통사회)' },
        { id: '33', name: '1-3 김서연 (음악, 음3, 진로, 과목명다섯, 국사)' },
        { id: '44', name: '1-4 박민영 (수학1, 공통수학)' },
        { id: '55', name: '1-5 박민영 (수학1, 공통수학)' },
        { id: '66', name: '1-6 박민영 (수학1, 공통수학)' }
      ],

      // 선택된 합반 수업 장소
      selectedMergedClassPlace: null,
      // 직접입력 input 보여줄지 여부
      showCustomPlaceInput: false, 
      // 직접입력한 값 저장
      customPlaceInput: '', 

      // 합반 수업 장소 리스트
      mergedClassPlaceList: [
        { id: '1', name: '과학실' },
        { id: '2', name: '미술실' },
        { id: '3', name: '음악실' },
        { id: '4', name: '체육실' }
      ],

      // 선택된 합반 교사
      selectedMergedTeacher: null,
      mergedTeacherList: [
        { value: '김선생(사문탐, 공통사회)', title: '김선생(사문탐, 공통사회)' },
        { value: '이선생(수학)', title: '이선생(수학)' },
        { value: '박선생(영어)', title: '박선생(영어)' },
        { value: '최선생(체육)', title: '최선생(체육)' }
      ],


      ///////////// 복수교사 배정
      // 선택된 교사 리스트
      selectedCoTeacherList: [],

      // 교사 리스트
      coTeacherList: [
        { id: '111', name: '김창운 (음악)' },
        { id: '222', name: '무영숙 (사문탐, 공통사회)' },
        { id: '333', name: '김서연 (음악, 음3, 진로, 과목명다섯, 국사)' },
        { id: '444', name: '박민영 (수학1, 공통수학)' },
        { id: '555', name: '박민영 (수학1, 공통수학)' },
        { id: '666', name: '박민영 (수학1, 공통수학)' }
      ],
    }
  },
  methods: {
    openSideModal() {
      this.iscourseChange = true;
    },
    close() {
      this.iscourseChange = false;
    },
    displayList(filteredStrings) {
      return this.courseList.filter(item =>
        filteredStrings.includes(item.course)
      );
    },
    selectPlace(place) {
      this.selectedMergedClassPlace = place.name;
    },
    addCustomPlace() {
      const name = this.customPlaceInput.trim();
      if (name === '') return;

      // ID는 임시로 timestamp 사용 (중복 안 나게)
      const newPlace = {
        id: Date.now(),
        name
      };

      this.mergedClassPlaceList.push(newPlace);
      this.selectedMergedClassPlace = name;

      // 리셋
      this.customPlaceInput = '';
      this.showCustomPlaceInput = false;
    }
  }
}
*/

</script>


<style lang="scss" scoped>
.course-change-side-modal{
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
  ::v-deep .side-modal-cont{
    > .hi-nodata{
      height: 280px;
      border-radius: 12px;
      border: 1px solid var(--gray-07);
      margin: 30px 0 ;
    }
  } 
  .h4-tit{
    display: flex;
    gap: 20px;
    border-bottom: 1px solid #D6D6D6;
    padding-bottom: 20px
  }
  
  // 수업 교체
  .course-replacement{
    .h4-tit{
      .hi-selectbox{
        width: 480px;
      }
    }
  }
  
  // 결, 보강
  .course-supplement{
    .panel-body{
      .table-content{
        height: 400px;
      }
    }
  }
  
  // 수업 변경
  .course-change{
    .additional{
      background: #E9F3FF;
    }
    .autocomplete-wrap ::v-deep{
      .input-wrap{
        input{
          font-size: 14px;
          &:hover:not(:disabled){
            background-color: #FFF8DF;
            box-shadow: none;
          }
          &:focus:not(:disabled){
            background-color: #FFF8DF;
            box-shadow: 0 0 0 1px #FACE34;
          }
        }
      }
      .autocomplete-list{
        width: 200px;
        height: 192px;
      }
    }
    .tb-row{
      flex-wrap: nowrap;
      justify-content: center;
      .tb-col{
        width: 100%;
        padding: 10px 20px;
        max-width: 570px;
      }
    } 
  }

  // 수업 추가
  .course-addition{}

  // 합반 배정
  .merged-class{    
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
}
</style>