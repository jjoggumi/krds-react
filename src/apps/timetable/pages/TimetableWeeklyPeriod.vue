<template>
  <section class="tt-weekly-period">
    <div class="table-head sticky">
      <div class="btn-area">
        <button type="button" class="btn btn-tertiary-blue" @click="handleClickShowDailyTimeSchedule">
          일과 시간 변경
        </button>
      </div>
      <div class="btn-area">
        <button type="button"
          class="btn btn-primary"
          :disabled="!isPeriodsSelected"
          @click="handleClickAddFreePeriods">수업 없음 설정
        </button>
        <button type="button" 
          class="btn btn-primary" 
          :disabled="!isPeriodsSelected" 
          @click="handleClickShowUnifiedCourse">공통 과목 배정 
            <HelpButton 
              :id="'공통과목 배정'"
              :active="helpOn === '공통과목 배정'"
              class="btn-help-w"
            />
        </button>
      </div>
    </div>
    <div class="tb-row">
      <div class="tb-col" v-for="(grade, grIndex) in grades" :key="`grade-${grIndex}`">
        <div class="table-content time-table">
          <div class="h4-tit">
            <h4>{{ grade.gradeName }}학년<i class="divider" /> {{ grade.maxClassCount }}학급 (가상:{{ grade.maxVirtualClassCount }})</h4>
            <p class="period"><i class="ico ico-clock ico-primary ico-size-20" />시수 {{ gradeExtendedByGrade[grIndex]?.totalPeriods }}</p>
          </div>
          <table>
            <caption>시수 조정 시간표</caption>
            <colgroup>
              <col style="width:15%;min-width:120px">
              <col
                v-for="(_, dIndex) in activatedClassDays"
                :key="dIndex"
                :style="{ width: 'calc(85% / ' + activatedClassDays.length + ')' }"
              >
            </colgroup>
            <thead>
              <tr>
                <th scope="col">교시</th>
                <th scope="col"
                  v-for="day in activatedClassDays"
                  :key="`day-header-${grade.grade}-${day.dayOfWeek}`">{{ day.title }}</th>
              </tr>
            </thead>
            <tbody
              is="draggable"              
              v-bind="dragOptions"
              handle=".drag-handle"
              tag="tbody"
              :group="{'name': 'table-grade-' + grade.grade}"
              @start="handleDragStart($event, grade)"
              @end="handleDragEnd($event, grade)"
              > 
              <template v-for="(period, pIndex) in gradeExtendedByGrade[grIndex]?.periodRows">
                <tr :key="`class-period-${grade.grade}-${pIndex}`">
                  <!-- 교시 정보 -->
                  <td class="th" scope="row" >
                    {{ period.periodTitle }}{{ isDisplayDailyScheduleTime ? ` (${period.time})` : '' }}
                  </td>
                  <!-- 요일별 버튼 -->
                  <td v-for="(day, dIndex) in activatedClassDays" :key="dIndex">
                    <weekly-period-timetable-cell
                      :period="pIndex + 1"
                      :day-of-week="day.dayOfWeek"
                      :is-free-period="checkGradeFreePeriods(day.dayOfWeek, pIndex + 1, grade.grade)"
                      :is-selected-cell="checkSelectedPeriod(day.dayOfWeek, pIndex + 1, grade.grade)"
                      :course="getFixedUnfiedCourse(day.dayOfWeek, pIndex + 1, grade.grade)" 
                      :on-click="() => handleClickCell(day.dayOfWeek, pIndex + 1, grade.grade)"
                      :disabled="isFinished"
                    />
                  </td>
                </tr>
                <tr v-if="isDisplayLunchTime && grade.timetableStructure?.beforeLunchPeriod === pIndex + 1" :key="`lunch-${grade.grade}-${pIndex}`">
                  <!-- 점심시간이면 colspan 처리 -->
                  <td :colspan="activatedClassDays.length + 1" class="lunch-time">
                    <div class="drag-handle">
                      <span class="sr-only">드래그핸들</span>
                    </div>
                    <span>{{ `점심` }}</span>
                    <!-- <button type="button" class="btn btn-link btn-help" :class="{ 'help-on': helpOn === '점심시간 조정' }" @click.stop="openHelp('점심시간 조정')">
                      <span class="sr-only">도움말</span>
                    </button> -->
                    <HelpButton 
                      :id="'점심시간 조정'"
                      :active="helpOn === '점심시간 조정'"
                    />
                    <span class="time" v-if="isDisplayDailyScheduleTime"> ({{ gradeExtendedByGrade[grIndex].lunchTime }})</span>
                  </td>
                </tr>
              
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- 공통과목 등록 모달 -->
    <unified-course-dialog
      v-if="isShowUnifiedCourse"
      :on-submit="handleSubmitUnifiedCourse"
      @close="closeUnifiedCourseDialog"
    />
    
    <!-- 일과 시간 변경 모달 -->
    <daily-time-schedule-edit-dialog
      v-if="isShowDailyTimeScheduleEdit"
      :daily-time-schedule="dailyTimeSchedule"
      :on-submit="handleSubmitDailyTimeSchedule"
      @close="closeDailyTimeSchedule"
      />

    <DataEntryNoticeModal 
      v-if="isShowDataEntryNoticeModal" 
      :noticeType="noticeType" 
      @close="handleCloseDataEntryNoticeModal"
    />
  </section>
</template>

<script setup lang="ts">
import Vue, { ref, inject, onMounted, computed, getCurrentInstance } from 'vue';
import draggable from 'vuedraggable';
import WeeklyPeriodTimetableCell from '@/apps/timetable/components/WeeklyPeriodTimetableCell.vue';
import DailyTimeScheduleEditDialog from '../components/DailyTimeScheduleEditDialog.vue';
import UnifiedCourseDialog from '../components/UnifiedCourseDialog.vue';

import DataEntryNoticeModal from '../components/DataEntryNoticeModal.vue';
import { NoticeType } from '../common/types';

import { ContextKeys, FixedConfContext, TimetableCourseContext, TimetableGradeContext, TimetableProgressContext } from '../contexts';
import { ActivateWeekday, DailyTimeSchedule } from '../common/types';
import { Course, FixedConf, TimetableGrade, TimetablePeriod, TimetableStatus, TimetableStructure } from '../core/types';
import { TimeUtils } from '../common/utils';
import { ClassDayStatus, DAILY_SCHEDULE_DEFAULTS, DAYS_OF_WEEK } from '../common/constants';
import { useDialog } from '../composables/dialog';
import HelpButton from '@/apps/timetable/components/HelpButton.vue';

Vue.component('draggable', draggable);

const { proxy } = getCurrentInstance() as any;

const props = defineProps<{ helpOn: String }>();

const dragOptions = {
  animation: 200,
  group: 'table',
  disabled: false,
  ghostClass: 'sortable-ghost',
  dragClass: 'sortable-drag'
};

interface GradePeriod extends TimetablePeriod {
  grade: number;
}

interface PeriodRow {
  time: string;
  periodTitle: string;
}

interface TimetableGradeExtended extends TimetableGrade {
  lunchTime?: string;
  periodRows?: PeriodRow[];  
  totalPeriods?: number;
}

const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const fixedConfContext = inject(ContextKeys.FixedConf) as FixedConfContext;
const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;

const dialog = useDialog();

const selectedPeriods = ref<GradePeriod[]>([]);
const gradeExtendedByGrade = ref<TimetableGradeExtended[]>([]);
const isShowUnifiedCourse = ref(false);
const isShowDailyTimeScheduleEdit = ref(false);

// 데이터 수정 관련 안내 팝업  상태
const noticeType = ref<NoticeType>(NoticeType.None);
const isShowDataEntryNoticeModal = ref(false);
const handleCloseDataEntryNoticeModal = () => {
  isShowDataEntryNoticeModal.value = false;
};

const showNoticeIfNotSeen = (key: NoticeType) => {
  if (!sessionStorage.getItem(key)) {
    noticeType.value = key;
    isShowDataEntryNoticeModal.value = true;
    sessionStorage.setItem(key, 'true');
  }
};

onMounted(async () => {
  await progressContext.reload();

  if (!progressContext.checkAccessible(TimetableStatus.WeeklyPeriod)) {
    proxy.$router.replace({ name: 'TimetableBasicInfo' });
    return;
  }

  /*
   * 2026.01.19, 이전 단계 이동 제한 해제
  if (progressContext.isFinished) {
    proxy.$router.replace({ name: 'TimetableGenerate' });
    return;
  }
  */

  if (fromNextStep.value) {
    showNoticeIfNotSeen(NoticeType.DataEditNotice);
  }

  await initData();  
});

const initData = async () => {
  await gradeContext.reload();
  await courseContext.reload();
  await fixedConfContext.reload();

  reloadGradeExtended();
};

const timetableStatus = computed(() => progressContext.status);
const isFirstTemplate = computed(() => progressContext.isFirstTemplate);
const isFinished = computed(() => progressContext.status === TimetableStatus.Finish);

const isNeedConfirmStatus = computed(() => {
  return isFirstTemplate.value && (timetableStatus.value === TimetableStatus.Generate ||
         timetableStatus.value === TimetableStatus.Finish);
});

const fromNextStep = computed(() => proxy.$route && proxy.$route.params && proxy.$route.params?.moveType === 'prev');

const grades = computed(() => gradeContext.timetableConfig.grades);

const dailyTimeSchedule = computed(() => {
  // const defaultTimeSchedule: DailyTimeSchedule = { ...DefaultDailyTimeSchedule };
  const { startPeriod, grades, isDisplayDailyScheduleTime, isDisplayLunchTime } = gradeContext.timetableConfig;
  
  if( !grades || grades.length === 0) {
    return { ...DAILY_SCHEDULE_DEFAULTS } as DailyTimeSchedule; // 학년 정보가 없으면 기본값 반환
  }

  const { startTime, classDuration, breakDuration, lunchDuration } = grades[0].timetableStructure || {};

  return {
    startPeriod: startPeriod === 0 ? 0 : DAILY_SCHEDULE_DEFAULTS.startPeriod,
    startTime: startTime || DAILY_SCHEDULE_DEFAULTS.startTime,
    classDuration: classDuration || DAILY_SCHEDULE_DEFAULTS.classDuration,
    breakDuration: breakDuration || DAILY_SCHEDULE_DEFAULTS.breakDuration,
    lunchDuration: lunchDuration || DAILY_SCHEDULE_DEFAULTS.lunchDuration,
    isDisplayDailyScheduleTime: isDisplayDailyScheduleTime !== undefined ? isDisplayDailyScheduleTime : DAILY_SCHEDULE_DEFAULTS.isDisplayDailyScheduleTime,
    isDisplayLunchTime: isDisplayLunchTime !== undefined ? isDisplayLunchTime : DAILY_SCHEDULE_DEFAULTS.isDisplayLunchTime,
  } as DailyTimeSchedule;    
});

const isPeriodsSelected = computed(() => {
  return selectedPeriods.value.length > 0;
});

const fixedConfsByGrade = computed(() => {
  const fixedConfsMap = fixedConfContext.fixedConfs.reduce((acc, conf) => {
    if (!acc[conf.grade]) {
      acc[conf.grade] = [];
    }
    acc[conf.grade].push(conf);
    return acc;
  }, {} as Record<string, FixedConf[]>);

  return gradeContext.timetableConfig.grades.reduce((acc, grade) => {
    acc[grade.grade] = fixedConfsMap[grade.grade] || [];
    return acc;
  }, {} as Record<string, FixedConf[]>);
});

const startPeriod = computed((): number => {  
  if(gradeContext.timetableConfig.startPeriod === undefined || gradeContext.timetableConfig.startPeriod === null) {
    return DAILY_SCHEDULE_DEFAULTS.startPeriod;
  }

  return gradeContext.timetableConfig.startPeriod;
});


const activatedClassDays = computed(() => {  
  return gradeContext.timetableConfig.classDays.map((isActive, index) => {
    return {
      dayOfWeek: index,
      title: DAYS_OF_WEEK.find(day => day.index === index)?.title,
      isActive: isActive === ClassDayStatus.ACTIVATED,
    } as ActivateWeekday;
  }).filter(day => day.isActive);
});

const isDisplayDailyScheduleTime = computed({
  get: () => gradeContext.timetableConfig.isDisplayDailyScheduleTime,
  set: (value) => {
    gradeContext.timetableConfig.isDisplayDailyScheduleTime = value;    
  }
});

const isDisplayLunchTime = computed({
  get: () => {
    return gradeContext.timetableConfig.isDisplayLunchTime;
  }, 
  set: (value) => {
    gradeContext.timetableConfig.isDisplayLunchTime = value;    
  }
});

const courseMap = computed(() => courseContext.courseMap);

const reloadGradeExtended = () => {
  const { maxPeriod } = gradeContext.timetableConfig;
  gradeExtendedByGrade.value = grades.value.map((grade) => {
    const { times, lunchTime } = calculatePeriodTimes(grade.timetableStructure);
    const periodRows: PeriodRow[] = [];    

    for (let i = 0; i < maxPeriod; i++) {
      const periodTitle = `${startPeriod.value + i}`;
      const time = times[i] || '';      
      periodRows.push({ time, periodTitle } as PeriodRow);
    }

    const fixedConfs = fixedConfsByGrade.value[grade.grade] || [];
    const freePeriods = grade.timetableStructure?.freePeriods || [];

    const totalPeriods = (activatedClassDays.value.length * maxPeriod) - (fixedConfs.length || 0) - (freePeriods.length || 0);

    return {
      ...grade,
      lunchTime,
      periodRows,
      totalPeriods,
    } as TimetableGradeExtended;
  }) as TimetableGradeExtended[];

};

const calculatePeriodTimes = (timetableStructure: TimetableStructure | undefined) => {
  if (!timetableStructure) {
    return {
      times: [] as string[],
      lunchTime: '',
    };
  }

  const { maxPeriod } = gradeContext.timetableConfig;
  const classDuration = timetableStructure.classDuration || DAILY_SCHEDULE_DEFAULTS.classDuration; // 기본값 45분
  const breakDuration = timetableStructure.breakDuration || DAILY_SCHEDULE_DEFAULTS.breakDuration; // 기본값 10분
  const lunchDuration = timetableStructure.lunchDuration || DAILY_SCHEDULE_DEFAULTS.lunchDuration; // 기본값 60분
  const beforeLunchPeriod = timetableStructure.beforeLunchPeriod || 4; // 기본값 4교시

  const result = {
    times: [] as string[],
    lunchTime: '',
  };
  

  let periodCount = 0;
  let endTime = TimeUtils.formatTimeFromDigits(timetableStructure.startTime || DAILY_SCHEDULE_DEFAULTS.startTime); // format "HHmm" to "HH:mm"
  do {
    periodCount++;
    
    let startTime = endTime;

    endTime = TimeUtils.addMinutesToTime(startTime, classDuration);
    result.times.push(formatStartAndEndTime(startTime, endTime));

    if (periodCount !== beforeLunchPeriod) {
      // 점심시간이 아니면 쉬는 시간 추가
      endTime = TimeUtils.addMinutesToTime(endTime, breakDuration);
      continue;
    }

    // 점심시간인 경우
    startTime = endTime;
    endTime = TimeUtils.addMinutesToTime(startTime, lunchDuration);
    result.lunchTime = formatStartAndEndTime(startTime, endTime);
  } while (periodCount <= maxPeriod);

  return result;
};

const formatStartAndEndTime = (start: string, end: string) => {
  return `${start}~${end}`;
};

const checkGradeFreePeriods = (dayOfWeek: number, period: number, grade: number) => {
  const { timetableStructure } = grades.value.find(g => g.grade === grade) || {};
  if (!timetableStructure) {
    return false; // 해당 학년이 존재하지 않으면 false 반환
  }

  const freePeriods = timetableStructure?.freePeriods || [];
  return freePeriods.some(freePeriod => 
    freePeriod.dayOfWeek === dayOfWeek && freePeriod.period === period
  );
};

const checkSelectedPeriod = (dayOfWeek: number, period: number, grade: number) => {
  return selectedPeriods.value.some((p) => {
    return p.dayOfWeek === dayOfWeek && p.period === period && p.grade === grade;
  });
};


const getFixedUnfiedCourse = (dayOfWeek: number, period: number, gradeNumber: number): Course | undefined => {
  // 고정된 공통 과목 가져오기
  const fixedConfs = fixedConfsByGrade.value[gradeNumber] || [];
  const fixedConf = fixedConfs.find(conf => conf.dayOfWeek === dayOfWeek && conf.period === period);
  
  if( !fixedConf || !courseMap.value[fixedConf.courseId]) {
    return; // 고정된 과목이 없으면 undefined 반환
  }

  if(!courseMap.value[fixedConf.courseId].isUnified) {
    return;
  }
  
  return courseMap.value[fixedConf.courseId];
};

const updateBeforeLunchPeriodWithGradeNumber = async (grade: number, period: number) => {
  try {
    // 학년별로 점심시간 이전 교시 업데이트
    if(period <= 0) {
      period = 1;
    }

    await gradeContext.updateBeforeLunchPeriodOfGrade(grade, period);
    reloadGradeExtended();
  } catch (error) {
    console.error('Error updating before lunch period:', error);
  }
};

const updateDailyTimeSchedule = async (newValue: DailyTimeSchedule | null) => {
  try {
    if(!newValue) {
      return;
    }
    
    // 일과 시간 변경 사항 저장
    await gradeContext.updateDailyTimeSchedule(newValue);
    reloadGradeExtended();
  } catch (error) {
    console.error('Error updating daily time schedule:', error);
  }
};

const togglePeriodCell = (dayOfWeek: number, period: number, grade: number) => {
  const isSelected = selectedPeriods.value.some(
    p => p.dayOfWeek === dayOfWeek && p.period === period && p.grade === grade
  );

  
  if (!isSelected) { // 선택되지 않은 경우 추가
    selectedPeriods.value.push({ grade, dayOfWeek, period });
    return;
  }
  
  // 이미 선택된 경우 제거
  selectedPeriods.value = selectedPeriods.value.filter(
    p => !(p.dayOfWeek === dayOfWeek && p.period === period && p.grade === grade)
  );
};

const addFreePeriodsProcess = async () => {
  // 선택된 셀 정보를 grade별로  그룹화
  const groupedPeriods: Record<number, TimetablePeriod[]> = selectedPeriods.value.reduce((acc, selectedPeriod) => {
    const { grade, dayOfWeek, period } = selectedPeriod;
    if(!acc[grade]) {
      acc[grade] = [] as TimetablePeriod[];
    }
    
    acc[grade].push({
      dayOfWeek,
      period,
    } as TimetablePeriod);

    return acc;
  }, {} as Record<number, TimetablePeriod[]>);

  try {
    // 각 학년별로 수업 없음 추가
    for (const [grade, periods] of Object.entries(groupedPeriods)) {
      if (!periods || periods.length == 0) {
        continue; // 선택된 기간이 없는 경우 건너뜀
      }

      // 이미 등록된 수업 없음과 합침
      const gradeNumber = parseInt(grade);
      const existingFreePeriods = grades.value.find(g => g.grade === gradeNumber)?.timetableStructure?.freePeriods || [];
      const updatedFreePeriods = [...existingFreePeriods, ...periods].filter((period, index, self) =>
        index === self.findIndex(p => p.dayOfWeek === period.dayOfWeek && p.period === period.period)
      );

      await gradeContext.updateFreePeriodsOfGrade(gradeNumber, updatedFreePeriods);
    }    
  } catch (error) {
    console.error('Error adding free periods:', error);
  }
}

const addFixUnifiedCourseWithSelectedPeriods = async (courseId: string) => {
  try {
    // 공통 과목 배정 처리
    if (selectedPeriods.value.length === 0 || !courseId ) {
      return; // courseId가 없는 경우 처리 중단
    }

    // 고정 수업 데이터 생성
    const fixedConfs = selectedPeriods.value.map((selectedPeriod) => {
      const { grade, dayOfWeek, period } = selectedPeriod;
      return {
        grade,
        dayOfWeek,
        period,
        courseId,
      } as FixedConf;
    });

    await fixedConfContext.addManyWithoutConsecutiveGroup(fixedConfs);

    selectedPeriods.value = [];
    reloadGradeExtended();
    await progressContext.reload();
  } catch (error) {
    console.error('Error adding unified course:', error);
  }
};

const removeFreePeriodsProcess = async (dayOfWeek: number, period: number, grade: number) => {
  // 선택된 학년의 수업 없음 목록
  const existingFreePeriods = grades.value.find(g => g.grade === grade)?.timetableStructure?.freePeriods || [];
  if (!existingFreePeriods || existingFreePeriods.length === 0) {
    return; // 수업 없음이 없는 경우 처리 중단
  }

  if(isNeedConfirmStatus.value &&
    !(await confirmModifyPeriods('[수업없음]을 삭제하시겠습니까?'))) {
    return;
  }

  await gradeContext.removeFreePeriodOfGrade(grade, {
    dayOfWeek,
    period,
  } as TimetablePeriod);
  
  reloadGradeExtended();
  await progressContext.reload();
};

const removeFixedUnifiedCourse = async (dayOfWeek: number, period: number, grade: number) => {
  // 고정된 공통 과목 제거 처리
  const fixedConfs = fixedConfsByGrade.value[grade] || [];
  const fixedConf = fixedConfs.find(conf => conf.dayOfWeek === dayOfWeek && conf.period === period);

  if (!fixedConf) {
    return; // 고정된 과목이 없는 경우 처리 중단
  }

  if(isNeedConfirmStatus.value &&
    !(await confirmModifyPeriods('공통과목을 삭제하시겠습니까?'))) {
    return;
  }

  try {
    await fixedConfContext.delete(fixedConf);
    reloadGradeExtended();
    await progressContext.reload();
  } catch (error) {
    console.error('Error removing fixed unified course:', error);
  }
};

const closeDailyTimeSchedule = () => {
  // 일과 시간 변경 모달 닫기
  isShowDailyTimeScheduleEdit.value = false;
};

const closeUnifiedCourseDialog = () => {
  isShowUnifiedCourse.value = false;
};


const handleDragStart = (event: any, grade: TimetableGrade) => {
  // 드래그 시작 시 처리  
};

const handleDragEnd = (event: any, grade: TimetableGrade) => {
  // 드래그 종료 시 처리
  const { newIndex, oldIndex } = event;

  if( newIndex === oldIndex) {  // 드래그가 이동하지 않은 경우
    return;
  }
  
  updateBeforeLunchPeriodWithGradeNumber(grade.grade, newIndex);
};

const handleClickCell = (dayOfWeek: number, period: number, grade: number) => {
  // 셀 클릭 이벤트 처리
  if(checkGradeFreePeriods(dayOfWeek, period, grade)) {    
     // 수업 없음 클릭시 처리
    removeFreePeriodsProcess(dayOfWeek, period, grade);
    return;
  }

  const course = getFixedUnfiedCourse(dayOfWeek, period, grade)
  if(course) {
    // 고정된 공통 과목 클릭시 처리
    removeFixedUnifiedCourse(dayOfWeek, period, grade);
    return;
  }
  
  // 선택된 셀의 상태를 토글
  togglePeriodCell(dayOfWeek, period, grade); 
};

const confirmModifyPeriods = async (msg: string): Promise<boolean> => {
  if(!isNeedConfirmStatus.value) {
    return true;
  }

  return await dialog.confirm(`
    ${msg}
    <div class="blue-box"> 
      <i class="hi-ico ico-primary ico-warning-circle-fill ico-size-18"></i>
      주간 시수가 변경될 경우 <strong>7단계에서 작성한 데이터</strong>가 삭제될 수 있습니다.
    </div>      
    `, null, {
      customClass: 'timetable-confirm',
      showCloseButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소'
    });

};

const handleClickShowUnifiedCourse = async () => {
  if(isPeriodsSelected.value === false) {
    return;
  }

  if(isNeedConfirmStatus.value &&
    !(await confirmModifyPeriods('공통 과목을 배정하시겠습니까?'))) {
    return;
  }

  // 공통 과목 배정 버튼 클릭 처리
  isShowUnifiedCourse.value = true;
};

const handleClickAddFreePeriods = async () => {
  // 선택된 셀에 대해 수업 없음 추가 처리
  if (selectedPeriods.value.length === 0) {
    return;
  }

  if(isNeedConfirmStatus.value &&
    !(await confirmModifyPeriods('[수업없음]으로 설정하시겠습니까?'))) {
    return;
  }

  // 선택된 기간에 대해 수업 없음 추가 로직
  await addFreePeriodsProcess();
  
  // 선택된 셀 초기화
  selectedPeriods.value = [];
  reloadGradeExtended();
  await progressContext.reload();
};

const handleSubmitDailyTimeSchedule = async (newValue: DailyTimeSchedule | null) => {
  closeDailyTimeSchedule();
  await updateDailyTimeSchedule(newValue);  
};

const handleClickShowDailyTimeSchedule = () => {
  // 일과 시간 변경 모달 열기
  isShowDailyTimeScheduleEdit.value = true;
};


const handleSubmitUnifiedCourse = async (courseId: string | null) => {
  closeUnifiedCourseDialog();
  await addFixUnifiedCourseWithSelectedPeriods(courseId || '');
};


// PageTitle Component의 "다음" 버튼 클릭에 의해 호출됨
const checkBeforeMove = async () => {
  if( selectedPeriods.value.length > 0 &&
    !await dialog.confirmSimple('주간 시수 조정을 하지 않고 이동하시겠습니까?')
  ) {
    return false;
  }
  
  // 상태 업데이트 검증
  const nextStatus = TimetableStatus.CourseBase;
  const isStatusUpdated = await progressContext.updateStatus(nextStatus);

  if (!isStatusUpdated) {
    await dialog.alertSimple('다음 단계로 이동할 수 없습니다.');
    return false;
  }

  return true;
};

defineExpose({
  checkBeforeMove,
});

// 도움말 열기
// const emit = defineEmits(['openHelp', 'close-help']);

// function openHelp(id: string) {
//   if (!id) {
//     emit('close-help');
//     emit('openHelp', '');
//     return;
//   }
//   emit('openHelp', id);
// }

</script>

<style lang="scss" scoped> 
.tt-weekly-period{
  .lunch-time{
    background-color: var(--gray-01);
  }
  .sortable-chosen {  
    button,
    .time{display: none;}
  }
  .btn-area {
    gap: 8px;
  }
  .drag-handle{
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    position: absolute;
  }
  .table-content.time-table{
    table{
      table-layout: auto;
    }
  }
}
</style>