<template>
  <div class="tt-generate">
    <!-- 상단 버튼 영역 -->
    <div class="tab-nav type01">
      <button
        type="button"
        :class="{ active: isShowTypeTeacher }"
        @click="showType = ShowType.Teacher"
      >교사별 시간표</button>
      <button
        type="button"
        :class="{ active: isShowTypeClass }"
        @click="showType = ShowType.Class"
      >학급별 시간표</button>
      <div class="tab-btn-area">
        <button type="button" @click="() => handleClickReset()" class="btn btn-line-warning">시간표 초기화</button>
        <button type="button" @click="handleClickHistory" class="btn btn-tertiary-blue">작업 내역 확인</button>
        <button type="button" @click="isSaveDraftModal=true" class="btn btn-tertiary-blue">작업 내역 저장</button>
        <!-- <button type="button" @click="" class="btn btn-tertiary-blue">동시수업 배정</button> -->
        <button type="button" @click="handleClickBtnGenerate" class="btn btn-primary">시간표 자동 배정</button>
      </div>
    </div>

    <!-- 탭 컨텐츠 영역 (TimetableLessonConfig.vue 와 동일한 구조) -->
    <div class="tab-con mt-20">
      <teacher-timetable-generate
        v-if="isShowTypeTeacher"
        :timetable-status="timetableStatus"
        :help-on="helpOn"
        @openHelp="openHelp"
      />
      <class-timetable-generate
        v-else-if="isShowTypeClass"
      />
    </div>
    
    <!-- 시간표 생성중 모달 -->
    <TimeTableModal size="xs" closeSkip v-if="isGeneratingTimetableModal" @close="isGeneratingTimetableModal=false" class="generating-timetable-modal">
      <template v-slot:content>        
        <p class="loading-ani">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </p>
        <div class="tit">
          시간표 생성중 ({{ Timetable.generateCounter }}차)
        </div>
        <div class="desc">
          잠시만 기다려 주세요. 최적의 조건을 찾기 위해<br>수 분의 시간이 걸릴 수 있습니다.
        </div>
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary ml-10" @click="handleClickCancelGenerate">취소</button>
      </template>
    </TimeTableModal>

    <!-- 시간표 생성 완료 모달 -->
    <TimeTableModal size="xs" closeSkip v-if="isGeneratedTimetableModal" @close="isGeneratedTimetableModal=false" class="generated-timetable-modal">
      <template v-slot:content>  
        <lottie :options="Loading" :height="86" :width="86" class="timetable-generated" />
        <div class="tit mt-15">
          시간표 배정이 완료되었습니다.
        </div>
        <div class="desc">
          자동 생성 결과를 확인해주세요.
          <br>생성된 시간표는 작업 내역에 자동 저장됩니다.
        </div>
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-primary ml-10" @click="isGeneratedTimetableModal=false">확인</button>
      </template>
    </TimeTableModal>
    
    <!-- 시간표 초기화 모달 --> 
    <reset-assigned-lesson-dialog
      ref="resetAssignedLessonDialog"
    />

    <!-- 작업 내역 확인 모달 -->
    <lesson-history-dialog
      v-if="isHistoryModal"
      :on-submit="handleSubmitHistory"
      :on-cancel="handleCloseHistory"
      @close="isHistoryModal=false"
    />

    <!-- 임시 저장하기 모달 -->
     <save-lesson-history-dialog
      v-if="isSaveDraftModal"
      :on-cancel="() => isSaveDraftModal=false"
      :on-submit="() => isSaveDraftModal=false"
    />
    
    <concurrent-course-assign-dialog
      v-if="isConcurrentCourseModalOpened"
      :timetableConfig="gradeContext.timetableConfig"
      @close="handleCloseConcurrentCourseAssignDialog"
    />

    <!-- 기초 시간표 수정완료 -->
    <TimeTableModal size="sm" v-if="false" class="timeTable-complete-modal">
      <template v-slot:heading>
        기초 시간표 수정 완료
        <p class="smr">
          기초시간표 수정 완료하여 전체시간표에 적용합니다.
        </p>
      </template>
      <template v-slot:content>   
        <div class="gray-box">
          <div class="form-group-inline">
            <label>1. 시간표 명</label>
            <div class="form-ctr">            
              <HiSelectBox      
                :value="timetableName"
                :items="[
                  { value: '1교시', title: '1교시' },
                  { value: '2교시', title: '2교시' },
                  { value: '3교시', title: '3교시' },
                  { value: '4교시', title: '4교시' }
                ]"
                @update:value="timetableName = $event"
                :empty-title="timetableName || '선택'"
              /> 
            </div>
          </div>
        </div>
        <div class="gray-box">
          <div class="form-group">
            <label>2. 시간표 운영 기간을 등록해 주세요.</label>
            <div class="desc">시간표가 운영될 한 학기 동안의 시작일과 종료일을 설정하세요.</div>
            <div class="form-ctr mt-20">
              <!-- 시작일 -->
              <div class="input-wrap">
                <input
                  type="text"
                  :value="startDate"
                  placeholder="시작일"
                  @click="isStartCalendarOpen = true"
                  spellcheck="false"
                />
                <i class="ico ico-calendar" @click="isStartCalendarOpen = true"></i>
                <CalendarMonthly
                  v-if="isStartCalendarOpen"
                  v-click-outside="closeStartCalendar"
                />
              </div>
              <span class="m-05"> ~ </span>
              <!-- 종료일 -->
              <div class="input-wrap">
                <input
                  type="text"
                  :value="endDate"
                  placeholder="종료일"
                  @click="isEndCalendarOpen = true"
                  spellcheck="false"
                />
                <i class="ico ico-calendar" @click="isStartCalendarOpen = true"></i>
                <CalendarMonthly
                  v-if="isEndCalendarOpen"
                  v-click-outside="closeEndCalendar"
                />
              </div>
            </div>
          </div>
        </div>     
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary ml-10" @click="isCourseEditModal=false">취소</button>
  <button type="button" class="btn btn-primary" @click="() => {}">반영하기</button>
      </template>
    </TimeTableModal>
  </div>
</template>

<script setup lang="ts">
import ExcelJS from 'exceljs';
import Lottie from 'vue-lottie';

import { ref, computed, inject, onMounted, nextTick, onUnmounted, getCurrentInstance, watch } from 'vue';

import Timetable from '@/apps/timetable/core';
import TeacherTimetableGenerate from '@/apps/timetable/components/TeacherTimetableGenerate.vue';
import ConcurrentCourseAssignDialog from '@/apps/timetable/components/ConcurrentCourseFixDialog.vue';
import ResetAssignedLessonDialog from '@/apps/timetable/components/ResetAssignedLessonDialog.vue';
import LessonHistoryDialog from '@/apps/timetable/components/LessonHistoryDialog.vue';
import SaveLessonHistoryDialog from '@/apps/timetable/components/SaveLessonHistoryDialog.vue';
import ClassTimetableGenerate from '@/apps/timetable/components/ClassTimetableGenerate.vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';

import { TimetablePeriod, TimetableStatus, ExcelExportSortType } from '../core/types';

import HiSelectBox from '@/components/Form/HiSelectBox.vue';
import CalendarMonthly from '@/components/Calendar/CalendarMonthly.vue';
import { ConcurrentConfContext, ContextKeys, FixedConfContext, LessonConfContext, LessonContext, SpecialtyRoomConfContext, SpecialtyRoomContext, TeacherCourseBaseContext, TeacherCourseContext, TimetableClassContext, TimetableCourseBaseContext, TimetableCourseContext, TimetableGradeContext, TimetableProgressContext, TimetableTeacherContext } from '../contexts';
import { InitializeOption, Lesson, PeriodTuple, ValidStatusCountTypeMap } from '../core/types';
import { useDialog } from '../composables/dialog';
import { ActivateWeekday, DownloadType, TimetableViewType } from '../common/types';
import { TimetableDisplayUtils, TimeUtils } from '../common/utils';
import { ClassDayStatus, DAYS_OF_WEEK } from '../common/constants';
import { ExcelCellHelper, ExcelJsUtils } from '../common/exceljs-utils';
// @ts-ignore
import Worker from 'worker-loader!@/apps/timetable/workers/timetable-generator-worker.ts';
import { Timetables } from '@/apis/Timetables';
import { useEducationLetterApis } from '../composables/educationLetterApis';
import timetableGeneratedLottie from '@/apps/timetable/resources/timetable-generated-lottie.json';
import TimetableUtils from '../core/mod/utils';

const { proxy } = getCurrentInstance() as any;

const Loading = {animationData: timetableGeneratedLottie, loop: true, autoplay: true};

const props = defineProps({
  helpOn: {
    type: String,
    default: 0,
  },
});

const emit = defineEmits(['openHelp']);

// 도움말 열기
function openHelp(index: string) {
  emit('openHelp', index);
}

enum ShowType {
  Class = 'class',
  Teacher = 'teacher',
}

const showType = ref(ShowType.Teacher);
const resetAssignedLessonDialog = ref(null);
const isHistoryModal = ref(false);
const isSaveDraftModal = ref(false);
const isGeneratingTimetableModal = ref(false);
const isGeneratedTimetableModal = ref(false);
const isConcurrentCourseModalOpened = ref<boolean>(false);
const generatorWorker = ref<Worker | null>(null);
const timetableStatus = ref<ValidStatusCountTypeMap>({} as ValidStatusCountTypeMap);

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const courseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const teacherCourseBaseContext = inject(ContextKeys.TeacherCourseBase) as TeacherCourseBaseContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const fixedConfContext = inject(ContextKeys.FixedConf) as FixedConfContext;
const concurrentConfContext = inject(ContextKeys.ConcurrentConf) as ConcurrentConfContext;
const specialtyRoomContext = inject(ContextKeys.SpecialtyRoom) as SpecialtyRoomContext;
const specialtyRoomConfContext = inject(ContextKeys.SpecialtyRoomConf) as SpecialtyRoomConfContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;
const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;

const classMap = computed(() => classContext.classMap);
const gradeMap = computed(() => gradeContext.gradeMap);
const startPeriod = computed(() => gradeContext.timetableConfig.startPeriod);

const isShowTypeTeacher = computed(() => showType.value === ShowType.Teacher);
const isShowTypeClass = computed(() => showType.value === ShowType.Class);

const dialog = useDialog();
const educationLetterApis = useEducationLetterApis();

const lessons = computed({
  get() { 
    return lessonContext.lessons as Lesson[]; 
  },
  set(value: Lesson[]) {
    lessonContext.lessons = value;
  }
});

onUnmounted (() => {
  // 워커 종료
  terminateGeneratorWorker();
});

onMounted(async () => {
  await progressContext.reload();

  if (!progressContext.checkAccessible(TimetableStatus.Generate)) {
    proxy.$router.replace({ name: 'TimetableBasicInfo' });
    return;
  }

  // 초기 데이터 로드
  await courseContext.reload();
  await courseBaseContext.reload();
  await teacherContext.reload();
  await teacherCourseContext.reload();
  await teacherCourseBaseContext.reload();
  await lessonConfContext.reload();
  await gradeContext.reload();
  await classContext.reload();
  await fixedConfContext.reload();
  await concurrentConfContext.reload();
  await specialtyRoomContext.reload();
  await specialtyRoomConfContext.reload();
  await lessonContext.reload();

  await initClassTeachersGradeFreePeriod();

  await initTimetableCoreWithContext();
  await fetchSchools();
});

const fetchSchools = async () => {
  schools.value = await educationLetterApis.fetchSchools();
};

const schools = ref<Array<any>>([]);

const schoolName = computed(() => {
  const schoolId = progressContext.schoolId;
  const school = schools.value.find(s => s.schoolId === schoolId);
  return school ? school.schoolName : '';
});

const adjustDisplayedPeriod = (period: number) => {
  return period + (startPeriod.value - 1);
};

const terminateGeneratorWorker = () => {
  if(generatorWorker.value) {
    generatorWorker.value.terminate();
    generatorWorker.value = null;
  }
}

const initTimetableCoreWithContext = async () => {
  const { maxGrade, classDays, maxPeriod, grades } = gradeContext.timetableConfig;

  // TimetablGenerator에 데이터 설정
  Timetable.timetableConfig = {
    classDays,
    maxPeriod,
    maxGrade,
    grades,
  };

  // Timetable core 초기화
  Timetable.classes = classContext.classes;
  Timetable.courses = courseContext.courses;
  Timetable.teachers = teacherContext.teachers;
  Timetable.teacherCourses = teacherCourseContext.teacherCourses;
  Timetable.specialtyRooms = specialtyRoomContext.specialtyRooms;
  Timetable.lessonConfs = lessonConfContext.lessonConfs;
  Timetable.fixedConfs = fixedConfContext.fixedConfs;
  Timetable.concurrentCourseConfs = concurrentConfContext.concurrentConfs;
  Timetable.specialtyRoomConfs = specialtyRoomConfContext.specialtyRoomConfs;
  
  // 이전에 셋팅된 수업 목록을 가져옴
  let presetedLessons = lessonContext.lessons as Lesson[];
  
  // 수업 목록이 있는 경우, 해당 목록을 셋팅
  Timetable.initWithPresetedLessons(presetedLessons);
  timetableStatus.value = Timetable.timetableStatus;
  // lessons.value = presetedLessons;

  await fetchAutoGenerateCount();
};

interface TimetableTemplateResponse {
  autoGenerateCount: number;
  timetableId: string;
  templateId: string;
}

const initClassTeachersGradeFreePeriod = async () => {
  const gradeFreePeriodMap: Record<number, TimetablePeriod[]> = {};

  Object.values(gradeMap.value).forEach(grd => {
    gradeFreePeriodMap[grd.grade] = grd.timetableStructure?.freePeriods ? grd.timetableStructure.freePeriods : [];
  });
  
  teacherContext.teachers.filter(teacher => teacher.classId)
    .forEach(teacher => {
    const { classId } = teacher;

    if(!classId || !classMap.value[classId]) {
      return;
    }
    const { grade } = classMap.value[classId];
    const gradeFreePeriods = gradeFreePeriodMap[grade] || [];
    teacher.gradeFreePeriods = TimetableUtils.deepCopyTimetablePeriods(gradeFreePeriods);
  });
}

const fetchAutoGenerateCount = async () => {
  const api = new Timetables();
  const timetableId = classContext.timetableId;
  const templateId = classContext.templateId || '';
  const { getTimetableBasicTemplateAutoGenerateCountAutogeneratecount: getAutoGenerateCount } = api;
  
  try {
    const result = await getAutoGenerateCount(timetableId, { templateId  });
    const { autoGenerateCount } = result?.data as TimetableTemplateResponse || { autoGenerateCount: 0 };
    Timetable.generateCounter = autoGenerateCount;

  }
  catch (error) {
    console.error('Error fetching auto generate count:', error);
  }
};

const updateAutoGenerateCount = async () => {
  const api = new Timetables();
  const timetableId = classContext.timetableId
  const templateId = classContext.templateId || '';
  const { updateTimetableBasicTemplateAutoGenerateCountAutogeneratecount: updateAutoGenerateCount } = api;

  try {
    await updateAutoGenerateCount(timetableId, {
      autoGenerateCount: Timetable.generateCounter,
      templateId,
    });
  } catch (error) {
    console.error('Error updating auto generate count:', error);
  }
};

const handleClickReset = async () => {
  if (isGenerating.value) {
    return;
  }

  // @ts-ignore
  const result = await resetAssignedLessonDialog.value?.open();

  if(!result || result.length === 0) {
    return;
  }

  await lessonContext.initializeLessons(result);

  // core context를 초기화
  Timetable.initWithPresetedLessons(lessonContext.lessons as Lesson[]);
  timetableStatus.value = Timetable.timetableStatus;

  if(result.includes(InitializeOption.TeacherFreeTime)) {
    // 교사 수업 빼기 초기화된 경우
    await teacherContext.reload();

    // core context도 반드시 업데이트
    Timetable.context.teachers = teacherContext.teachers;
  }

  showAutoSaveToast();
};

const isGenerating = ref(false);

const handleClickCancelGenerate = () => {
  // console.log('Cancel generating timetable');

  terminateGeneratorWorker();

  isGenerating.value = false;
  isGeneratingTimetableModal.value = false;
};

const handleClickBtnGenerate = async () => {
  const msg = `시간표 자동 배정을 진행하시겠습니까?<br/>자동 배정을 실행하면 기존 시간표 배정이 변경됩니다.`;
  if(!await dialog.confirmSimple(msg)) {
    return;
  }

  if (isGenerating.value) {
    return;
  }

  const fixedLessons = await Timetable.generateFixedLessons();
  startGeneratorWorker(fixedLessons);
};

const showGenerationComplete = () => {
  isGeneratedTimetableModal.value = true;
}

const startGeneratorWorker = (fixedLessons: Lesson[]) => {
  terminateGeneratorWorker();
  
  isGenerating.value = true;
  isGeneratingTimetableModal.value = true;

  Timetable.increaseGenerateCounter();
  updateAutoGenerateCount(); // 비동기로 업데이트

  // 개별 교사 수동 배정
  const manualLessons = lessons.value.filter((lesson) => {
    return lesson.isManuallyAssigned;
  });
  const presetLessons = [...fixedLessons, ...manualLessons] as Lesson[];

  const {
    timetableConfig,
    classes,
    courses,
    teachers,
    teacherCourses,
    specialtyRooms,
    lessonConfs,
    fixedConfs,
    concurrentCourseConfs,
    specialtyRoomConfs
  } = Timetable.context;

  const payload = {
    timetableConfig,
    presetLessons,
    classes,
    courses,
    teachers,
    teacherCourses,
    specialtyRooms,
    lessonConfs,
    fixedConfs,
    concurrentCourseConfs,
    specialtyRoomConfs
  }

  generatorWorker.value = new Worker();
  generatorWorker.value.postMessage({
    type: "GENERATE_TIMETABLE",
    payload
  });

  generatorWorker.value.onmessage = async (event: any) => {
    const { success, payload } = event.data;
    const { 
      generatedLessons,
     } = payload;

    
    if (!success) {      
      // 실패
      terminateGeneratorWorker();
      isGenerating.value = false;
      isGeneratingTimetableModal.value = false;
      
      dialog.alertSimple(
        '시간표 생성 중 오류가 발생했습니다.',
      );

      return;
    }

    try {
      const historyMemo = `(자동) 시간표 생성하기 (${Timetable.generateCounter}차)`;
      lessons.value = await lessonContext.saveLessonsWithReplace(generatedLessons, historyMemo);
      Timetable.initWithPresetedLessons(lessons.value);
      timetableStatus.value = Timetable.timetableStatus;

      // showAutoSaveToast();
    }
    catch (error) {
      console.error('Error saving generated lessons:', error);
      dialog.alertSimple(
        '시간표 생성 중 오류가 발생했습니다.',
      );
    }
    finally {
      terminateGeneratorWorker();

      if(success) {
        setTimeout(() => {
          isGenerating.value = false;
          isGeneratingTimetableModal.value = false;

          // 생성 완료 창의 부드러운 애니메이션을 위해 약간의 딜레이를 줌
          showGenerationComplete();

          progressContext.increaseTick();
        }, 500);
      }
      else {
        isGenerating.value = false;
        isGeneratingTimetableModal.value = false;

        progressContext.increaseTick();
      }

    }
  };
}

const showAutoSaveToast = () => {  
  dialog.toast('변경사항이 자동 저장 되었습니다.');
};

const handleClickHistory = () => {
  isHistoryModal.value = true;
};

const handleCloseConcurrentCourseAssignDialog = () => {
  isConcurrentCourseModalOpened.value = false;
};

const handleCloseHistory = () => {
  isHistoryModal.value = false;
};

const handleSubmitHistory = async (lessonHistoryId: string) => {
  isHistoryModal.value = false;

  if (!lessonHistoryId) {
    return;
  }

  // 복구 요청
  await lessonContext.restoreLessonHistory(lessonHistoryId);

  // 복구된 데이터만 초기화 (core context도 반드시 연결)
  await teacherContext.reload();
  await lessonConfContext.reload();
  await lessonContext.reload();

  Timetable.context.teachers = teacherContext.teachers;
  Timetable.context.lessonConfs = lessonConfContext.lessonConfs;
  Timetable.initWithPresetedLessons(lessonContext.lessons as Lesson[]);
  timetableStatus.value = Timetable.timetableStatus;
  progressContext.increaseTick();

  lessons.value = lessonContext.lessons as Lesson[];
  
  dialog.alertSimple('선택한 작업 내역이 복구되었습니다.');
};

watch(
  () => lessonContext.lessons,
  async () => {
    await nextTick();
    timetableStatus.value = Timetable.timetableStatus;
    progressContext.increaseTick();  
  },
  { deep: true }
)


// 엑셀 출력
interface TimetableLessonForPrint {
  teacherName: string;
  gradeClassName: string;
  courseName: string;
  specialtyRoomName: string;
  isConcurrent: boolean;
  dayOfWeek: number;
  period: number;  
  isUnified: boolean;
}

interface TimetableViewTypeAllData {
  teacherName: string;
  teacherTotalPeriod: number;
  lessons: (TimetableLessonForPrint | null)[];
}

interface TimetableViewTypeTeacherData {
  teacherName: string;
  teacherTotalPeriod: number;
  lessonMap: Record<string, TimetableLessonForPrint>;
}

interface TimetableViewTypeClassData {
  gradeClassName: string;  
  lessonMap: Record<string, TimetableLessonForPrint>;
}

interface TimetableViewTypeSpecialtyRoomData {
  roomName: string;
  lessonMap: Record<string, TimetableLessonForPrint[]>;
}

interface TimetableBasicPeriodInfo {
  maxPeriod: number;
  activedClassDays: ActivateWeekday[];
  lessonPeriods: PeriodTuple[];
}

const createForTimetableBasicPeriodInfo = (): TimetableBasicPeriodInfo => {
  const maxPeriod = gradeContext.timetableConfig.maxPeriod;
  const activedClassDays = gradeContext.timetableConfig.classDays.map((isActive, index) => {
    return {
      dayOfWeek: index,
      title: DAYS_OF_WEEK.find(day => day.index === index)?.title,
      isActive: isActive === ClassDayStatus.ACTIVATED,
    } as ActivateWeekday;
  }).filter(day => day.isActive);
  
  const lessonPeriods = activedClassDays.map(day => {
    return Array.from({ length: maxPeriod }, (_, i) => i + 1)
      .map(period => [day.dayOfWeek, period] as PeriodTuple);
  }).flat();

  return {
    maxPeriod,
    activedClassDays,
    lessonPeriods,
  };
}


const createTeacherTotalPeriodMap = () : Record<string, number> => {
  const teachers = [ ...teacherContext.teachers ];
  const courseMap = courseContext.courseMap;

  // 교사별 시수를 계산한다.
  const lessonConfsMapByTeacher = lessonConfContext.lessonConfsMapByTeacher;
  const teacherTotalPeriodMap: Record<string, number> = {};
  teachers.forEach(({ teacherId }) => {
    const teacherLessonConfs = lessonConfsMapByTeacher[teacherId] || [];
    const totalPeriod = teacherLessonConfs.reduce((sum, conf) => {
      const crs = courseMap[conf.courseId];
      if (!crs) {
        return sum;
      }

      return sum + (crs.periodCount || 0);
    }, 0);        
    teacherTotalPeriodMap[teacherId] = totalPeriod;
  });

  return teacherTotalPeriodMap;
}

const lessonToDataForPrint = (lesson: Lesson, teacherName: string, useDisplayedTitle: boolean = true, useConcurrentDisplayedTitle: boolean = true): TimetableLessonForPrint => {
  const courseMap = courseContext.courseMap;
  const specialtyRoomMap = specialtyRoomContext.specialtyRoomMap;

  const classInfo = classContext.classMap[lesson.classId];
  const courseInfo = courseMap[lesson.courseId];
  const specialtyRoomInfo = lesson?.specialtyRoomId ? specialtyRoomMap[lesson?.specialtyRoomId] : null;

  let courseName = courseInfo ? (useDisplayedTitle ? courseInfo.displayedTitle : courseInfo.standardCourseTitle || '') : '';
  if(lesson.concurrentCourseId && useConcurrentDisplayedTitle) {
    const concurrentCourseInfo = courseMap[lesson.concurrentCourseId];
    courseName = concurrentCourseInfo ? `${concurrentCourseInfo.displayedTitle}_${courseName}` : courseName;
  }

  const gradeClassName = classInfo ? TimetableDisplayUtils.formatFullClassName(classInfo) : '';
  const specialtyRoomName = specialtyRoomInfo ? specialtyRoomInfo.roomName : '';

  return {
    gradeClassName,
    courseName,
    specialtyRoomName,
    isConcurrent: !!lesson.concurrentCourseId,
    dayOfWeek: lesson.dayOfWeek,
    period: lesson.period,
    teacherName,
    isUnified: courseInfo ? courseInfo.isUnified : false,
  };
}

const createForTimetableViewTypeClass = (viewType: TimetableViewType) : TimetableViewTypeClassData[] => {
  const isTypeClass = viewType === TimetableViewType.Class;
  const classes = [ ...classContext.classes ]
  .filter(cls => isTypeClass ? !cls.isVirtual : true)  // 가상학급 제외
  .sort((a, b) => {
    if (a.grade !== b.grade) {
      return a.grade - b.grade;
    }
    return a.classNumber - b.classNumber;
  });

  // 학급 별로 Lesson을 가져온다.
  const lessonsByClass = lessonContext.lessons.reduce((map, lesson) => {
    if (!map[lesson.classId]) {
      map[lesson.classId] = [];
    }
    map[lesson.classId].push(lesson);
    return map;
  }, {} as Record<string, Lesson[]>);

  return classes.map((cls) => {
    const { classId } = cls;
    const gradeClassName = TimetableDisplayUtils.formatFullClassName(cls);

    const row = {
      gradeClassName,
      lessonMap: {} as Record<string, TimetableLessonForPrint>,
    } as TimetableViewTypeClassData;    

    // dayOfWeek_period 의 맵으로 변환
    (lessonsByClass[classId] || []).forEach((lesson) => {
      const teacherName = (lesson.lessonTeachers || []).map(lt => {
        const teacher = teacherContext.teacherMap[lt.teacherId];
        return teacher ? teacher.teacherName : '';
      })
      .filter(name => name !== '')
      .join(', ');

      const key = `${lesson.dayOfWeek}_${lesson.period}`;
      row.lessonMap[key] = lessonToDataForPrint(lesson, teacherName, isTypeClass, isTypeClass);
    });

    if (viewType === TimetableViewType.Neis) {
      createForTimetableViewTypeNeis(row, gradeClassName);
    }

    return row;
  });
}

const createForTimetableViewTypeTeacher = () : TimetableViewTypeTeacherData[] => {
  const teachers = [ ...teacherContext.teachers ];

  // 교사별 총 시수 맵 생성
  const teacherTotalPeriodMap = createTeacherTotalPeriodMap();
  
  // 교사 별로 Lesson을 가져온다.
  const lessonsByTeacher = lessonContext.lessonsByTeacher;

  return teachers.map(({ teacherId, teacherName }) => {
    const row = {
      teacherName,
      teacherTotalPeriod: teacherTotalPeriodMap[teacherId] || 0,      
      lessonMap: {} as Record<string, TimetableLessonForPrint>,
    } as TimetableViewTypeTeacherData;    

    // dayOfWeek_period 의 맵으로 변환
    (lessonsByTeacher[teacherId] || []).forEach((lesson) => {
      const key = `${lesson.dayOfWeek}_${lesson.period}`;
      row.lessonMap[key] = lessonToDataForPrint(lesson, teacherName);
    });

    return row;
  });
}

const createForTimetableViewTypeNeis = (row: TimetableViewTypeClassData, gradeClassName: string)  => {
  const tMap = Object.keys(row.lessonMap).reduce((map, key) => {
    const [dayOfWeek, period] = key.split('_').map(token => parseInt(token));
    if (!map[dayOfWeek]) {
      map[dayOfWeek] = [];
    }
    map[dayOfWeek].push(period);
    return map;
  }, {} as Record<number, number[]>);

  Object.entries(tMap).forEach(([dayOfWeek, periods]) => {
    for (let i = 1; i < gradeContext.timetableConfig.maxPeriod + 1; i++) {
      if (!periods.includes(i)) {
        const key = `${dayOfWeek}_${i}`;
        row.lessonMap[key] = {
          gradeClassName,
          courseName: '',
          teacherName: '',
          specialtyRoomName: '',
          isConcurrent: false,
          dayOfWeek: parseInt(dayOfWeek),
          isUnified: false,
          period: i
        }
      }
    }
  })
}

const createForTimetableViewTypeSpecialtyRoom = () : TimetableViewTypeSpecialtyRoomData[] => {  
  const rooms = [ ...specialtyRoomContext.specialtyRooms ];

  // 학급 별로 Lesson을 가져온다.
  const lessonsByClass = lessonContext.lessons
  .reduce((map, lesson) => {
    if(!lesson.specialtyRoomId) {
      return map;
    }

    if (!map[lesson.specialtyRoomId]) {
      map[lesson.specialtyRoomId] = [];
    }

    map[lesson.specialtyRoomId].push(lesson);
    return map;
  }, {} as Record<string, Lesson[]>);

  return rooms.map((room) => {
    const { specialtyRoomId, roomName } = room;
    const row = {
      roomName,
      lessonMap: {} as Record<string, TimetableLessonForPrint[]>,
    } as TimetableViewTypeSpecialtyRoomData;    

    // dayOfWeek_period 의 맵으로 변환
    (lessonsByClass[specialtyRoomId] || []).forEach((lesson) => {
      const teacherName = (lesson.lessonTeachers || []).map(lt => {
        const teacher = teacherContext.teacherMap[lt.teacherId];
        return teacher ? teacher.teacherName : '';
      })
      .filter(name => name !== '')
      .join(', ');

      const key = `${lesson.dayOfWeek}_${lesson.period}`;
      if(!row.lessonMap[key]) {
        row.lessonMap[key] = [];
      }
      row.lessonMap[key].push(lessonToDataForPrint(lesson, teacherName));
    });

    return row;
  });
}


const createForTimetableViewTypeAll = () : TimetableViewTypeAllData[] => {
  const teachers = [ ...teacherContext.teachers ];

  // 교사별 총 시수 맵 생성
  const teacherTotalPeriodMap = createTeacherTotalPeriodMap();

  // 시간표의 편성 정보를 가져와 시수 컬럼 배열을 생성
  const { lessonPeriods } = createForTimetableBasicPeriodInfo();
  
  // 교사 별로 Lesson을 가져온다.
  const lessonsByTeacher = lessonContext.lessonsByTeacher;

  return teachers.map(({ teacherId, teacherName }) => {
    const row = {
      teacherName,
      teacherTotalPeriod: teacherTotalPeriodMap[teacherId] || 0,      
      lessons: [] as (TimetableLessonForPrint | null)[],
    } as TimetableViewTypeAllData;    

    // dayOfWeek_period 의 맵으로 변환
    const teacherLessonMap : Record<string, Lesson> = {};
    (lessonsByTeacher[teacherId] || []).forEach((lesson) => {
      const key = `${lesson.dayOfWeek}_${lesson.period}`;
      teacherLessonMap[key] = lesson;
    });

    row.lessons = lessonPeriods.map((lessonPeriod: PeriodTuple) => {
      const key = `${lessonPeriod[0]}_${lessonPeriod[1]}`;
      const lesson = teacherLessonMap[key];

      if(!lesson) { // 해당 시수에 수업이 없으면 null로 채움
        return null;
      }

      return lessonToDataForPrint(lesson, teacherName);
    });

    return row;
  });
}


const convertViewTypeSpecialtyRoomDataToWorkbook = async (data: TimetableViewTypeSpecialtyRoomData[], title: string = ''): Promise<ExcelJS.Workbook> => {
  const sheetName = title;  // TODO: 연도 정보 추가 고려

  // workbook 및 worksheet 생성
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  const c2L = ExcelJsUtils.columnIndexToLetter; // 줄여쓰기 위해 대입
  const cellHelper = new ExcelCellHelper(worksheet);

  const { maxPeriod, activedClassDays } = createForTimetableBasicPeriodInfo();
  
  // 특별실 시간표는 교시당 수업이 여러개일 수 있어 행 높이가 불규칙함.
  // - ExcelTableDrawSettings을 사용할 수 없음.
  const titleRowHeight = 50;
  const dayRowHeight = 30;
  const countPerHorizontal = 1;
  const timetableRowsGap = 1;
  const timetableColsGap = 1;
  const leftFixedCols = 1;
  const topFixedRows = 2;
  const rowsPerLessonCell = 2;
  const classDaysLength = activedClassDays.length;
  const timetableTotalCols = leftFixedCols + (classDaysLength); // 교시열 + 요일열
  const periodList = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  let currentRowIdx = 1;
  let rowIndexForPage = 0;

  const bottomThinCells = [] as ExcelJS.Cell[];
  const bottomThickCells = [] as ExcelJS.Cell[];
  const rightThinCells = [] as ExcelJS.Cell[];
  const rightThickCells = [] as ExcelJS.Cell[];
  const leftThickCells = [] as ExcelJS.Cell[];
  
  data.forEach((roomData, dataIndex) => {
    const isNotFirstCol = dataIndex % countPerHorizontal !== 0;
    const topRowIdx = currentRowIdx;
    const leftColIdx = ((dataIndex % countPerHorizontal) * timetableColsGap) + (isNotFirstCol ? timetableColsGap : 0) + 1;

    if(dataIndex > 0 && rowIndexForPage !== topRowIdx) {
      // 다음 페이지로 넘어가는 경우
      const prevPageRow = worksheet.getRow(topRowIdx - 1);
      prevPageRow.addPageBreak();
    }

    rowIndexForPage = topRowIdx;

    // 타이틀 행
    const titleStartCol = c2L(leftColIdx);
    const titleEndCol = c2L(leftColIdx + timetableTotalCols - 1);
    worksheet.mergeCells(`${titleStartCol}${topRowIdx}:${titleEndCol}${topRowIdx}`);

    const title = `${roomData.roomName} 시간표`;
    const titleCell = ExcelJsUtils.cellWithDefault(title, `${c2L(leftColIdx)}${topRowIdx}`, worksheet, 16, "바탕체");
    titleCell.font.bold = true;
    worksheet.getRow(topRowIdx).height = titleRowHeight;
    bottomThickCells.push(titleCell);
    
    // 요일 헤더 행
    currentRowIdx = topRowIdx + (topFixedRows - 1);
    const dayHeaderCell = cellHelper.defaultStyleAndLineCell("교시", `${c2L(leftColIdx)}${currentRowIdx}`);
    worksheet.getRow(currentRowIdx).height = dayRowHeight;
    bottomThickCells.push(dayHeaderCell);
    leftThickCells.push(dayHeaderCell);
    rightThickCells.push(dayHeaderCell);

    
    activedClassDays.forEach((day, dayIndex) => {
      const colIdx = leftColIdx + dayIndex + 1;
      const cell = cellHelper.defaultStyleAndLineCell(day.title, `${c2L(colIdx)}${currentRowIdx}`);
      
      bottomThickCells.push(cell);
      dayIndex === 0 && leftThickCells.push(cell);
      dayIndex === classDaysLength - 1 && rightThickCells.push(cell);
    });

    const maxLessonCountMap = periodList.reduce((map, period) => {
      if(!map[period]) {
        map[period] = 1;
      }

      map[period] = activedClassDays.map((day) => {
        const key = `${day.dayOfWeek}_${period}`;
        const lessons = roomData.lessonMap[key];

        if(!lessons || lessons.length === 0) {
          return 1;
        }

        return lessons.length;
      })
      .reduce((a, b) => Math.max(a, b));

      return map;
    }, {} as Record<number, number>);
    
    // 수업
    currentRowIdx += 1;
    periodList.forEach((period) => {
      // 수업 정보
      const maxLessonCountPerPeriod = maxLessonCountMap[period] || 1;
      const rowsOfPeriod = (maxLessonCountPerPeriod * (rowsPerLessonCell + 1)) - 1;

      activedClassDays.forEach((day, dayIndex) => {
        let periodRowIdx = currentRowIdx;
        
        const colIdx = leftColIdx + dayIndex + 1;
        
        // 해당 교시의 수업 정보가 있는지 확인
        const key = `${day.dayOfWeek}_${period}`;
        const lessons = roomData.lessonMap[key];
        
        if (!lessons || lessons.length === 0) {
          worksheet.mergeCells(`${c2L(colIdx)}${periodRowIdx}:${c2L(colIdx)}${periodRowIdx + rowsOfPeriod - 1}`);
          cellHelper.defaultStyleAndLineCell("", `${c2L(colIdx)}${periodRowIdx}`);
          return;
        }

        const lessonCount = lessons.length;
        lessons.forEach((lesson, lessonIndex) => {
          cellHelper.defaultStyleCell(lesson.gradeClassName, `${c2L(colIdx)}${periodRowIdx}`);
          cellHelper.defaultStyleCell(lesson.courseName, `${c2L(colIdx)}${periodRowIdx + 1}`);

          periodRowIdx += rowsPerLessonCell;

          if(lessonCount - 1 > lessonIndex) {
            periodRowIdx += 1; // 마지막 수업이 아니면 한 줄 띄우기
          }          
        });
      });

      
      const lastRowIdx = currentRowIdx + rowsOfPeriod - 1;

      worksheet.mergeCells(`${c2L(leftColIdx)}${currentRowIdx}:${c2L(leftColIdx)}${lastRowIdx}`);
      const periodText = adjustDisplayedPeriod(period);
      const periodCell = cellHelper.defaultStyleAndLineCell(periodText, `${c2L(leftColIdx)}${currentRowIdx}`);

      leftThickCells.push(periodCell);
      rightThickCells.push(periodCell);
      period === maxPeriod && bottomThickCells.push(periodCell);

      currentRowIdx += rowsOfPeriod;
    });

    // draw line
    const lessonCellStartRowIdx = topRowIdx + topFixedRows;
    const lessonCellStartColIdx = leftColIdx + leftFixedCols;
    const maxPeriodRows = Object.values(maxLessonCountMap).reduce((sum, count) => {
      return sum + ((count * (rowsPerLessonCell + 1)) - 1);
    }, 0);

    const periodRowNums = Array.from({length: maxPeriodRows}, (_, i) => i + lessonCellStartRowIdx);
    const periodColNums = Array.from({length: classDaysLength}, (_, i) => c2L(i + lessonCellStartColIdx));

    // 수업 셀간 가로줄
    const periodCells = periodRowNums.map(rowIdx => {
      return periodColNums.map(colLetter => {
        return worksheet.getCell(`${colLetter}${rowIdx}`);
      });
    }).flat();
    rightThinCells.push(...periodCells);

    // 오른쪽 굵은 테두리
    const rightMostColLetter = periodColNums[periodColNums.length - 1];
    const rightThickBorderCells = periodRowNums.map(rowIdx => {
      return worksheet.getCell(`${rightMostColLetter}${rowIdx}`);
    });
    rightThickCells.push(...rightThickBorderCells);

    // 하단 굵은 테두리
    const bottommostRowIdx = periodRowNums[periodRowNums.length - 1];
    const bottomThickBorderCells = periodColNums.map(colLetter => {
      return worksheet.getCell(`${colLetter}${bottommostRowIdx}`);
    });
    bottomThickCells.push(...bottomThickBorderCells);
    
    // 교시 간 가로 줄
    let rowIdx = 0;
    const periodBttomRowIdxs=  Object.values(maxLessonCountMap).map((count) => {
      rowIdx += (count * (rowsPerLessonCell + 1)) - 1;
      return periodRowNums[rowIdx - 1];
    });
    const bottomThinBorderCells = periodBttomRowIdxs.map(rowIdx => {
      if(rowIdx === bottommostRowIdx) {
        return []; // 이미 굵은 테두리로 처리됨
      }

      return periodColNums.map(colLetter => {
        return worksheet.getCell(`${colLetter}${rowIdx}`);
      });
    }).flat();
    bottomThinCells.push(...bottomThinBorderCells);
    
    // console.log('Period Bottom Row Idxs: ', periodBttomRowIdxs);

    // Next timetable
    currentRowIdx += timetableRowsGap;
  });

  // 일반 테두리 설정
  ExcelJsUtils.setBorderBottomThinByCells(bottomThinCells);
  ExcelJsUtils.setBorderRightThinByCells(rightThinCells);

  // 굵은 테두리 설정
  // ExcelJsUtils.setBorderTopThickByCells(topThickCells);
  ExcelJsUtils.setBorderBottomThickByCells(bottomThickCells);
  ExcelJsUtils.setBorderLeftThickByCells(leftThickCells);
  ExcelJsUtils.setBorderRightThickByCells(rightThickCells);
  
  return workbook;
}


const convertViewTypeClassDataToWorkbook = async (data: TimetableViewTypeClassData[], title: string = ''): Promise<ExcelJS.Workbook> => {
  const sheetName = title || '주간시간표';  // TODO: 연도 정보 추가 고려

  // workbook 및 worksheet 생성
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  const c2L = ExcelJsUtils.columnIndexToLetter; // 줄여쓰기 위해 대입
  const cellHelper = new ExcelCellHelper(worksheet);

  const { maxPeriod, activedClassDays } = createForTimetableBasicPeriodInfo();

  const settings = new ExcelTableDrawSettings();
  settings.initializeForClassDaysAndPeriod(activedClassDays.length, maxPeriod);

  let currentRowIdx = 1;
  let rowIndexForPage = 0;
  data.forEach((clsData, dataIndex) => {
    const topRowIdx = settings.calulateTopRowIdx(dataIndex);
    const leftColIdx = settings.calulateLeftColIdx(dataIndex);

    if(dataIndex > 0 && rowIndexForPage !== topRowIdx) {
      // 다음 페이지로 넘어가는 경우
      const prevPageRow = worksheet.getRow(topRowIdx - 1);
      prevPageRow.addPageBreak();
    }

    rowIndexForPage = topRowIdx;

    // 타이틀 행
    const titleStartCol = c2L(leftColIdx);
    const titleEndCol = c2L(leftColIdx + settings.timetableTotalCols - 1);
    worksheet.mergeCells(`${titleStartCol}${topRowIdx}:${titleEndCol}${topRowIdx}`);    

    const title = `${clsData.gradeClassName} 시간표`;
    const titleCell = ExcelJsUtils.cellWithDefault(title, `${c2L(leftColIdx)}${topRowIdx}`, worksheet, 16, "바탕체");
    titleCell.font.bold = true;
    
    // 요일 헤더 행
    currentRowIdx = topRowIdx + (settings.topFixedRows - 1);
    cellHelper.defaultStyleCell("교시", `${c2L(leftColIdx)}${currentRowIdx}`);

    activedClassDays.forEach((day, dayIndex) => {
      const colIdx = leftColIdx + dayIndex + 1;
      cellHelper.defaultStyleCell(day.title, `${c2L(colIdx)}${currentRowIdx}`);
    });

    // 수업
    currentRowIdx += 1;
    settings.periodList.forEach((period) => {
      const periodRowIdx = currentRowIdx + ((period - 1) * settings.rowsPerLessonCell);
      const lastRowIdx = periodRowIdx + settings.rowsPerLessonCell - 1;

      worksheet.mergeCells(`${c2L(leftColIdx)}${periodRowIdx}:${c2L(leftColIdx)}${lastRowIdx}`);
      const periodText = adjustDisplayedPeriod(period);
      cellHelper.defaultStyleCell(periodText, `${c2L(leftColIdx)}${periodRowIdx}`);

      // 수업 정보
      activedClassDays.forEach((day, dayIndex) => {
        const colIdx = leftColIdx + dayIndex + 1;
        
        // 해당 교시의 수업 정보가 있는지 확인
        const key = `${day.dayOfWeek}_${period}`;
        const lesson = clsData.lessonMap[key];

        if (!lesson) {
          worksheet.mergeCells(`${c2L(colIdx)}${periodRowIdx}:${c2L(colIdx)}${lastRowIdx}`);
          return;
        }
        
        const courseCell = cellHelper.defaultStyleCell(lesson.courseName, `${c2L(colIdx)}${periodRowIdx}`);

        if(lesson.isUnified) { // 공통과목인 경우 셀 병합 후 종료
          worksheet.mergeCells(`${c2L(colIdx)}${periodRowIdx}:${c2L(colIdx)}${lastRowIdx}`);
          return;
        }

        const teacherCell = cellHelper.defaultStyleCell(lesson.teacherName, `${c2L(colIdx)}${periodRowIdx + 1}`);
        const roomCell = cellHelper.defaultStyleCell(lesson.specialtyRoomName || '', `${c2L(colIdx)}${periodRowIdx + 2}`);
        
        if(lesson.isConcurrent) {
          // 동시수업인 경우 셀 배경색 변경
          ExcelJsUtils.fillForConcurrentLessonByCells([courseCell, teacherCell, roomCell]);
        }
      });
    });
  });
    
  // 전체 테두리 설정
  drawLinesForTableType(data.length, settings, worksheet);
  drawSpacingForTableType(data.length, settings, worksheet);
  
  return workbook;
}

// 교사별 시간표 엑셀 변환
const convertViewTypeTeacherDataToWorkbook = async (data: TimetableViewTypeTeacherData[], title: string = '', sortType: null | ExcelExportSortType): Promise<ExcelJS.Workbook> => {
  const sheetName = `교사별주간시간표`;  // TODO: 연도 정보 추가 고려

  // workbook 및 worksheet 생성
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  const c2L = ExcelJsUtils.columnIndexToLetter; // 줄여쓰기 위해 대입
  const cellHelper = new ExcelCellHelper(worksheet);

  const { maxPeriod, activedClassDays } = createForTimetableBasicPeriodInfo();

  const settings = new ExcelTableDrawSettings();
  settings.initializeForClassDaysAndPeriod(activedClassDays.length, maxPeriod, 3);

  let currentRowIdx = 1;
  let rowIndexForPage = 0;

  if (sortType === ExcelExportSortType.TEACHER_NAME) {
    sortByTeacherNameAsc(data);
  }

  data.forEach((teacherData, dataIndex) => {
    const topRowIdx = settings.calulateTopRowIdx(dataIndex);
    const leftColIdx = settings.calulateLeftColIdx(dataIndex);

    if(dataIndex > 0 && rowIndexForPage !== topRowIdx) {
      // 다음 페이지로 넘어가는 경우
      const prevPageRow = worksheet.getRow(topRowIdx - 1);
      prevPageRow.addPageBreak();
    }

    rowIndexForPage = topRowIdx;

    // 타이틀 행
    const titleStartCol = c2L(leftColIdx);
    const titleEndCol = c2L(leftColIdx + settings.timetableTotalCols - 1);

    worksheet.mergeCells(`${titleStartCol}${topRowIdx}:${titleEndCol}${topRowIdx}`);    
    
    const titleCell = ExcelJsUtils.cellWithDefault("교사 시간표", `${c2L(leftColIdx)}${topRowIdx}`, worksheet, 16, "바탕체");
    titleCell.font.bold = true;

    // 교사명 행
    currentRowIdx = topRowIdx + (settings.isWithoutTitleRow ? 0 : 1);
    worksheet.mergeCells(`${c2L(leftColIdx)}${topRowIdx + 1}:${c2L(leftColIdx + settings.timetableTotalCols - 1)}${topRowIdx + 1}`);

    const teacherName = `교사명: ${teacherData.teacherName} (${teacherData.teacherTotalPeriod})`;
    const teacherNameCell = cellHelper.defaultStyleCell(teacherName, `${c2L(leftColIdx)}${currentRowIdx}`);
    teacherNameCell.alignment = ExcelJsUtils.middleRightAlignment();
    
    // 요일 헤더 행
    currentRowIdx = topRowIdx + (settings.topFixedRows - 1);
    cellHelper.defaultStyleCell("교시", `${c2L(leftColIdx)}${currentRowIdx}`);

    activedClassDays.forEach((day, dayIndex) => {
      const colIdx = leftColIdx + dayIndex + 1;
      cellHelper.defaultStyleCell(day.title, `${c2L(colIdx)}${currentRowIdx}`);
    });

    // 수업
    currentRowIdx += 1;
    settings.periodList.forEach((period) => {
      const periodRowIdx = currentRowIdx + ((period - 1) * settings.rowsPerLessonCell);
      const lastRowIdx = periodRowIdx + settings.rowsPerLessonCell - 1;

      worksheet.mergeCells(`${c2L(leftColIdx)}${periodRowIdx}:${c2L(leftColIdx)}${lastRowIdx}`);
      const periodText = adjustDisplayedPeriod(period);
      cellHelper.defaultStyleCell(periodText, `${c2L(leftColIdx)}${periodRowIdx}`);

      // 수업 정보
      activedClassDays.forEach((day, dayIndex) => {
        const colIdx = leftColIdx + dayIndex + 1;
        
        // 해당 교시의 수업 정보가 있는지 확인
        const key = `${day.dayOfWeek}_${period}`;
        const lesson = teacherData.lessonMap[key];

        if (!lesson) {
          worksheet.mergeCells(`${c2L(colIdx)}${periodRowIdx}:${c2L(colIdx)}${lastRowIdx}`);
          return;
        }
                
        const clsCell = cellHelper.defaultStyleCell(lesson.gradeClassName, `${c2L(colIdx)}${periodRowIdx + 1}`);
        const courseCell = cellHelper.defaultStyleCell(lesson.courseName, `${c2L(colIdx)}${periodRowIdx}`);
        const roomCell = cellHelper.defaultStyleCell(lesson.specialtyRoomName || '', `${c2L(colIdx)}${periodRowIdx + 2}`);

        if(lesson.isConcurrent) {
          // 동시수업인 경우 셀 배경색 변경
          ExcelJsUtils.fillForConcurrentLessonByCells([clsCell, courseCell, roomCell]);
        }
      });
    });
  });
    
  // 전체 테두리 설정
  drawLinesForTableType(data.length, settings, worksheet);
  drawSpacingForTableType(data.length, settings, worksheet);
  
  return workbook;
};

const convertViewTypeNeisDataToWorkbook = (data: TimetableViewTypeClassData[], title: string = '') => {
  let workbooks: {excelFilename: string, workbook: ExcelJS.Workbook}[] = [];
  const sheetName = title || '주간시간표';

  data.forEach((classItem) => {
    // workbook 및 worksheet 생성
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    const { gradeClassName, lessonMap } = classItem;
    worksheet.columns = [
      { header: '', key: 'id' },
      { header: '월', key: '1' },
      { header: '화', key: '2' },
      { header: '수', key: '3' },
      { header: '목', key: '4' },
      { header: '금', key: '5' },
      { header: '토', key: '6' },
      { header: '일', key: '0' }
    ];

    let lessonGroupByPeriod = _.groupBy(Object.values(lessonMap), 'period');
    const startPeriod = gradeContext.timetableConfig.startPeriod;

    for (const [period, lessons] of Object.entries(lessonGroupByPeriod)) {
      const t = [1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
        const lesson = lessons.find((lesson) => lesson.dayOfWeek === dayOfWeek);
        if (!lesson || !lesson.courseName) return [dayOfWeek, ''];
        if (!lesson.teacherName) return [dayOfWeek, lesson.courseName];
        return [dayOfWeek, `${lesson.courseName}(${lesson.teacherName})`];
      });

      worksheet.addRow({
        id: parseInt(period) + (startPeriod! - 1),
        ...Object.fromEntries(t),
      });
    }

    workbooks.push({ excelFilename: `기초시간표(${gradeClassName})`, workbook });
  });

  return workbooks;
};

const drawSpacingForTableType = (timetableCount: number, settings: ExcelTableDrawSettings, worksheet: ExcelJS.Worksheet) => {
  // 컬럼 넓이, 행 높이 재설정
  const titleRowHeight = 40;
  const dayHeaderRowHeight = 26;

  const c2L = ExcelJsUtils.columnIndexToLetter; // 줄여쓰기 위해 대입

  let currentRowIdx = 1;
  
  Array.from({length: timetableCount}, (_, i) => i).forEach((dataIndex) => {
    const topRowIdx = Math.floor(dataIndex / settings.countPerHorizontal) * (settings.timetableTotalRows + settings.timetableRowsGap) + 1;
    
    const isNotFirstCol = dataIndex % settings.countPerHorizontal !== 0;
    const leftColIdx = ((dataIndex % settings.countPerHorizontal) * settings.timetableTotalCols) + (isNotFirstCol ? settings.timetableColsGap : 0) + 1;

    // 타이틀 행
    !settings.isWithoutTitleRow && (worksheet.getRow(topRowIdx).height = titleRowHeight);

    // 요일 헤더 행 (교시)
    currentRowIdx = !settings.isWithoutTitleRow ? topRowIdx + 1 : topRowIdx;
    worksheet.getRow(currentRowIdx).height = dayHeaderRowHeight;

    if(dataIndex > settings.countPerHorizontal) {
      // 첫 번째 줄의 시간표 이후는 컬럼 넓이 설정 불필요
      return;
    }

    const periodHeaderCol = worksheet.getColumn(`${c2L(leftColIdx)}`);
    settings.periodColWidth &&  (periodHeaderCol.width = settings.periodColWidth);

    settings.classDaysIndexes.forEach((dayIndex) => {
      const colIdx = leftColIdx + dayIndex;
      const lessonInfoCol = worksheet.getColumn(`${c2L(colIdx)}`);
      settings.lessonInfoColWidth &&  (lessonInfoCol.width = settings.lessonInfoColWidth);
    });
  });
}


const drawLinesForTableType = (timetableCount: number, settings: ExcelTableDrawSettings, worksheet: ExcelJS.Worksheet) => {
  const c2L = ExcelJsUtils.columnIndexToLetter; // 줄여쓰기 위해 대입

  let currentRowIdx = 1;
  
  const topThickCells = [] as ExcelJS.Cell[];
  const bottomThickCells = [] as ExcelJS.Cell[];
  const leftThickCells = [] as ExcelJS.Cell[];
  const rightThickCells = [] as ExcelJS.Cell[];
  const bottomThinCells = [] as ExcelJS.Cell[];
  const rightThinCells = [] as ExcelJS.Cell[];
  const boldCells = [] as ExcelJS.Cell[];

  Array.from({length: timetableCount}, (_, i) => i).forEach((dataIndex) => {
    const topRowIdx = settings.calulateTopRowIdx(dataIndex);
    const leftColIdx = settings.calulateLeftColIdx(dataIndex);

    // 학급명 행
    const titleCell = worksheet.getCell(`${c2L(leftColIdx)}${topRowIdx}`);
    boldCells.push(titleCell);

    // 요일 헤더 행
    currentRowIdx = topRowIdx + (settings.topFixedRows - 1);
    const dayHeaderCell = worksheet.getCell(`${c2L(leftColIdx)}${currentRowIdx}`);
    topThickCells.push(dayHeaderCell);
    bottomThickCells.push(dayHeaderCell);
    rightThickCells.push(dayHeaderCell);
    leftThickCells.push(dayHeaderCell);
    boldCells.push(dayHeaderCell);

    settings.classDaysIndexes.forEach((dayIndex) => {
      const colIdx = leftColIdx + dayIndex;
      const cell = worksheet.getCell(`${c2L(colIdx)}${currentRowIdx}`);
      
      boldCells.push(cell);      
      topThickCells.push(cell);
      bottomThickCells.push(cell);

      dayIndex === settings.classDaysLength ? 
        rightThickCells.push(cell) : 
        rightThinCells.push(cell);
    });

    // 수업
    // currentRowIdx = topRowIdx + 2;
    currentRowIdx += 1;
    settings.periodList.forEach((period) => {
      const periodRowIdx = currentRowIdx + ((period - 1) * settings.rowsPerLessonCell);

      const periodCell = worksheet.getCell(`${c2L(leftColIdx)}${periodRowIdx}`);
      boldCells.push(periodCell);
      rightThickCells.push(periodCell);
      leftThickCells.push(periodCell);

      period === settings.maxPeriod ?
        bottomThickCells.push(periodCell) :
        bottomThinCells.push(periodCell);

      // 수업 정보
      settings.classDaysIndexes.forEach((dayIndex) => {
        const colIdx = leftColIdx + dayIndex;
        
        const courseCell = worksheet.getCell(`${c2L(colIdx)}${periodRowIdx}`);
        const teacherCell = worksheet.getCell(`${c2L(colIdx)}${periodRowIdx + 1}`);
        const roomCell = worksheet.getCell(`${c2L(colIdx)}${periodRowIdx + 2}`);

        dayIndex === settings.classDaysLength ?
          rightThickCells.push(courseCell, teacherCell, roomCell) :
          rightThinCells.push(courseCell, teacherCell, roomCell);
        

        period === settings.maxPeriod ?
          bottomThickCells.push(roomCell) :
          bottomThinCells.push(roomCell);
      });
    });
  });

  // 굵은 글씨 설정
  ExcelJsUtils.setBoldFontByCells(boldCells);

  // 일반 테두리 설정
  ExcelJsUtils.setBorderBottomThinByCells(bottomThinCells);
  ExcelJsUtils.setBorderRightThinByCells(rightThinCells);

  // 굵은 테두리 설정
  ExcelJsUtils.setBorderTopThickByCells(topThickCells);
  ExcelJsUtils.setBorderBottomThickByCells(bottomThickCells);
  ExcelJsUtils.setBorderLeftThickByCells(leftThickCells);
  ExcelJsUtils.setBorderRightThickByCells(rightThickCells);
}

const convertViewTypeAllDataToWorkbook = async (data: TimetableViewTypeAllData[], title: string = '', sortType: null | ExcelExportSortType): Promise<ExcelJS.Workbook> => {
  const { maxPeriod, activedClassDays } = createForTimetableBasicPeriodInfo();

  // 기본 설정
  const leftFixedCols = 2; // 번호, 교사명/총시수
  const maxPeriodCols = maxPeriod * activedClassDays.length; // 요일/교시 컬럼 수
  const maxCols = leftFixedCols + maxPeriodCols; // number, 교사명/총시수, 시수 컬럼 수
  const numColIdx = 1; // 번호 컬럼 인덱스
  const teacheColIdx = 2; // 교사 컬럼 인덱스
  const borderRowInterval = 5; // 굵은 테두리 행 간격

  const sheetName = title || '주간시간표';  // TODO: 연도 정보 추가 고려

  // workbook 및 worksheet 생성
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  const c2L = ExcelJsUtils.columnIndexToLetter; // 줄여쓰기 위해 대입
  const cellHelper = new ExcelCellHelper(worksheet);

  // 첫 번째 행 처리: 타이틀 행
  const titleRowHeight = 50;
  worksheet.mergeCells(`${c2L(1)}1:${c2L(maxCols)}1`);
  worksheet.getRow(1).height = titleRowHeight;
  
  const titleCell = ExcelJsUtils.cellWithDefault(title || sheetName, `${c2L(1)}1`, worksheet, 20, "바탕체");
  titleCell.font.bold = true;

  // 두 번째 행 처리: 요일 헤더 행 - |빈칸|빈칸| 월 - 교시 수 만큼 merge | 화 | 수 | ...
  const dayRowNum = 2;
  const dayColIdx = leftFixedCols + 1;
  worksheet.getRow(dayRowNum).height = 30;

  // 고정 컬럼 테두리 설정
  worksheet.getCell(`${c2L(1)}${dayRowNum}`).border = { 
    top: ExcelJsUtils.borderThick(),
    left: ExcelJsUtils.borderThick()
  };
  worksheet.getCell(`${c2L(2)}${dayRowNum}`).border = { 
    top: ExcelJsUtils.borderThick(),
    right: ExcelJsUtils.borderThick()
   };
  
  activedClassDays.forEach((day, index) => {
    const startColIdx = dayColIdx + (index * maxPeriod);
    const endColIdx = startColIdx + maxPeriod - 1;

    const startCol = `${c2L(startColIdx)}${dayRowNum}`;
    const endCol = `${c2L(endColIdx)}${dayRowNum}`;

    worksheet.mergeCells(`${startCol}:${endCol}`);
    
    const cell = cellHelper.defaultStyleCell(day.title, startCol);
    cell.border = ExcelJsUtils.borderThinTBRL();
    cell.border.top = ExcelJsUtils.borderThick();
    cell.border.right = ExcelJsUtils.borderThick();
  });

  // 세 번째 행 처리: 시수 헤더 행 - |빈칸|'교사명'| 1 | 2 | ... | 1 | 2 | ...
  const periodRowNum = 3;
  const periodColIdx = leftFixedCols + 1;

  const numTitleCell = worksheet.getCell(`${c2L(numColIdx)}${periodRowNum}`);
  numTitleCell.border = ExcelJsUtils.borderThinTBRL();  
  numTitleCell.border.left = ExcelJsUtils.borderThick();
  const numTitleCol = worksheet.getColumn(c2L(numColIdx));
  numTitleCol.width = 6;

  const teacherTitleCell = cellHelper.defaultStyleAndLineCell('교사명', `${c2L(teacheColIdx)}${periodRowNum}`);
  ExcelJsUtils.setMiddleCenterAlignmentByCells([numTitleCell, teacherTitleCell]);
  ExcelJsUtils.setBorderBottomThickByCells([numTitleCell, teacherTitleCell]);
  
  activedClassDays.forEach((_, index) => {
    for (let period = 1; period <= maxPeriod; period++) {
      const colIdx = periodColIdx + (index * maxPeriod) + (period - 1);
      
      const periodText = adjustDisplayedPeriod(period);
      const cell = cellHelper.defaultStyleAndLineCell(periodText, `${c2L(colIdx)}${periodRowNum}`);
      cell.border.bottom = ExcelJsUtils.borderThick();
      const periodCol = worksheet.getColumn(c2L(colIdx));
      periodCol.width = 8;

      (period === 1) && (cell.border.left = ExcelJsUtils.borderThick());
      (period === maxPeriod) && (cell.border.right = ExcelJsUtils.borderThick());
    }
  });


  // 데이터 행 처리
  const dataStartRowNum = 4;
  const rowspanPerData = 3;
  const dataLength = data.length;

  if (sortType === ExcelExportSortType.TEACHER_NAME) {
    sortByTeacherNameAsc(data);
  }

  data.forEach((row, rowIndex) => {
    const rowNum = dataStartRowNum + (rowIndex * rowspanPerData);
    const lastRowNum = rowNum + rowspanPerData - 1;
    const isBorderRow = (rowIndex + 1) % borderRowInterval === 0 || (rowIndex === dataLength -1);

    // 번호 셀
    worksheet.mergeCells(`${c2L(numColIdx)}${rowNum}:${c2L(numColIdx)}${lastRowNum}`);
    const numCell = cellHelper.defaultStyleAndLineCell(rowIndex + 1, `${c2L(numColIdx)}${rowNum}`);
    numCell.border.left = ExcelJsUtils.borderThick();

    // 교사명/총시수 셀
    const teacherNameCell = cellHelper.defaultStyleCell(`${row.teacherName}`, `${c2L(teacheColIdx)}${rowNum}`);
    teacherNameCell.border = ExcelJsUtils.borderThinT_RL();
    
    const teacherTotalPeriodCell = cellHelper.defaultStyleCell(row.teacherTotalPeriod || 0, `${c2L(teacheColIdx)}${rowNum + 1}`);
    teacherTotalPeriodCell.border = ExcelJsUtils.borderThin__RL();

    const teacherLastCell = cellHelper.defaultStyleCell('', `${c2L(teacheColIdx)}${lastRowNum}`);
    teacherLastCell.border = {
      left: ExcelJsUtils.borderThin(),
      bottom: ExcelJsUtils.borderThin(),
    }

    ExcelJsUtils.setBorderRightThickByCells([teacherNameCell, teacherTotalPeriodCell, teacherLastCell]);
    isBorderRow && ExcelJsUtils.setBorderBottomThickByCells([numCell, teacherLastCell]);

    // 시수 셀
    row.lessons.forEach((lesson, lessonIndex) => {
      const colIdx = leftFixedCols + lessonIndex + 1;
      const isRight = (lessonIndex % maxPeriod) === maxPeriod - 1;
      
      // lesson이 없는 경우 병합한 빈 셀로 처리
      if (!lesson) {
        worksheet.mergeCells(`${c2L(colIdx)}${rowNum}:${c2L(colIdx)}${lastRowNum}`);
        
        const emptyCell = cellHelper.defaultStyleAndLineCell('', `${c2L(colIdx)}${rowNum}`);
        isRight && (emptyCell.border.right = ExcelJsUtils.borderThick());
        isBorderRow && (emptyCell.border.bottom = ExcelJsUtils.borderThick());
        return;
      }
      
      // 첫 번째 행: 학급명
      const classCell = cellHelper.defaultStyleCell(lesson.gradeClassName, `${c2L(colIdx)}${rowNum}`);
      classCell.border = ExcelJsUtils.borderThinT_RL();

      // 두번째 행: 과목명
      const courseCell = cellHelper.defaultStyleCell(lesson.courseName, `${c2L(colIdx)}${rowNum + 1}`);
      courseCell.border = ExcelJsUtils.borderThin__RL();

      // 세번째 행: 특별실 명
      const roomCell = cellHelper.defaultStyleCell(lesson.specialtyRoomName || '', `${c2L(colIdx)}${lastRowNum}`);
      roomCell.border = ExcelJsUtils.borderThin_BRL();

      lesson.isConcurrent && ExcelJsUtils.fillForConcurrentLessonByCells([classCell, courseCell, roomCell]);

      isRight && ExcelJsUtils.setBorderRightThickByCells([classCell, courseCell, roomCell]);
      isBorderRow && ExcelJsUtils.setBorderBottomThickByCells([roomCell]);
    });
  });
 
  return workbook;
}

const processExcelDownload = async (viewType: TimetableViewType, sortType: null | ExcelExportSortType) => {
  // 엑셀 다운로드 로직  
  let workbook = null;
  let workbooks: {excelFilename: string, workbook: ExcelJS.Workbook}[] = []; // 다중 파일 일괄 저장

  let sheetTitle = '';
  if(viewType === TimetableViewType.All) {
    sheetTitle = `전체주간시간표`;
    const data = createForTimetableViewTypeAll();
    workbook = await convertViewTypeAllDataToWorkbook(data, sheetTitle, sortType);
  }
  else if (viewType === TimetableViewType.Teacher) {
    sheetTitle = `교사별주간시간표`;
    const data = createForTimetableViewTypeTeacher();
    workbook = await convertViewTypeTeacherDataToWorkbook(data, sheetTitle, sortType);
  }
  else if (viewType === TimetableViewType.Class) {
    sheetTitle = `학급별주간시간표`;
    const data = createForTimetableViewTypeClass(TimetableViewType.Class);
    workbook = await convertViewTypeClassDataToWorkbook(data, sheetTitle);    
  }
  else if (viewType === TimetableViewType.SpecialtyRoom) {
    sheetTitle = `특별실별주간시간표`;
    const data = createForTimetableViewTypeSpecialtyRoom();
    workbook = await convertViewTypeSpecialtyRoomDataToWorkbook(data, sheetTitle);
  }
  else if (viewType === TimetableViewType.Neis) {
    sheetTitle = `나이스용시간표`;
    const data = createForTimetableViewTypeClass(TimetableViewType.Neis);
    workbooks = convertViewTypeNeisDataToWorkbook(data);
  }

  // {#학교명}_{#연도}학년도_{#학기}_{#시간표명}_{#다운로드 날짜}
  const dateString = TimeUtils.getTodayAsNumber();
  const titlePrefix = `${schoolName.value || '학교'}_`;
  const titleSuffix = `_${dateString}`;

  const saveName = `${titlePrefix}${sheetTitle}${titleSuffix}`;
  workbook && await ExcelJsUtils.saveWorkbookToFile(workbook, `${saveName}`);
  workbooks.length > 0 && (await ExcelJsUtils.saveWorkbooksToZipFile(workbooks, `${saveName}`, 'csv'));
};


const processHwpDownload = async (viewType: TimetableViewType) => {
  // hwp 다운로드 로직
  console.log('HWP 다운로드 클릭됨');

};

const handleClickDownload = async (viewType: TimetableViewType, downloadType: DownloadType, sortType: null | ExcelExportSortType) => {
  switch(downloadType) {
    case DownloadType.Excel:
      await processExcelDownload(viewType, sortType);
      break;
    case DownloadType.Hwp:
      await processHwpDownload(viewType);
      break;
  }  
};

const sortByTeacherNameAsc = (data: TimetableViewTypeTeacherData[] |  TimetableViewTypeAllData[]) => {
  data.sort((a, b) => {
    const nameA = a.teacherName || '';
    const nameB = b.teacherName || '';
    return nameA.localeCompare(nameB, 'ko', { numeric: true, sensitivity: 'base' });
  });
}

defineExpose({
  handleClickDownload,
});


// publish ----->

// 수업수정 모달 관련
const isCourseEditModal = ref(false);

// 기초시간표 수정 완료 모달
const timetableName = ref('1교시');
const startDate = ref('2025.5.20');
const endDate = ref('2025.5.20');
const isStartCalendarOpen = ref(false);
const isEndCalendarOpen = ref(false);

// 달력 팝업 닫기
function closeStartCalendar() {
  isStartCalendarOpen.value = false;
}
function closeEndCalendar() {
  isEndCalendarOpen.value = false;
}

class ExcelTableDrawSettings {
  _countPerHorizontal: number;  // 가로 배치 개수
  _timetableRowsGap: number; // 시간표 사이 행 간격 (빈 행수)
  _timetableColsGap: number;  // 시간표 사이 열 간격 (빈 열수)
  _leftFixedCols: number; // 왼쪽 고정 열 수
  _topFixedRows: number; // 위쪽 고정 행 수
  _rowsPerLessonCell: number; // 수업 셀 당 행 수
  _classDaysLength: number; // 수업일 배열 (dayOfWeek)
  _maxPeriod: number; // 최대 교시 수

  // spacing
  _periodColWidth: number | undefined; // 교시 열 너비
  _lessonInfoColWidth: number | undefined; // 수업 정보 열 너비

  constructor(
  ) {
    // this._countPerHorizontal = 2;
    this._countPerHorizontal = 1;
    this._timetableRowsGap = 1;
    this._timetableColsGap = 1;
    this._leftFixedCols = 1;
    this._topFixedRows = 2;
    this._rowsPerLessonCell = 3;
    this._classDaysLength = 0;
    this._maxPeriod = 0;
    this._periodColWidth = 8;
  }  

  initializeForClassDaysAndPeriod(classDaysLength: number, maxPeriod: number, topFixedRows: number = 2) {
    this._classDaysLength = classDaysLength;
    this._maxPeriod = maxPeriod;
    this._topFixedRows = topFixedRows;
  }

  initializeSpacingSettings(periodColWidth: number, lessonInfoColWidth: number) {
    this._periodColWidth = periodColWidth;
    this._lessonInfoColWidth = lessonInfoColWidth;
  }

  setWithoutTitleRow() {
    this._topFixedRows = 1;
  }

  get maxPeriod() {
    return this._maxPeriod;
  }

  get countPerHorizontal() {
    return this._countPerHorizontal;
  }

  get timetableRowsGap() {
    return this._timetableRowsGap;
  }

  get timetableColsGap() {
    return this._timetableColsGap;
  }

  get leftFixedCols() {
    return this._leftFixedCols;
  }

  get topFixedRows() {
    return this._topFixedRows;
  }

  get rowsPerLessonCell() {
    return this._rowsPerLessonCell;
  }

  get classDaysLength() {
    return this._classDaysLength;
  }

  get periodColWidth() {
    return this._periodColWidth;
  }

  get lessonInfoColWidth() {
    return this._lessonInfoColWidth;
  }

  get timetableTotalCols() {
    return this._leftFixedCols + this._classDaysLength;
  }

  get timetableTotalRows() {
    return this._topFixedRows + (this._maxPeriod * this._rowsPerLessonCell);  
  }

  get periodList() {
    return Array.from({length: this._maxPeriod}, (_, i) => i + 1);
  }

  get classDaysIndexes() {
    return Array.from({length: this._classDaysLength}, (_, i) => i + 1);
  }

  get isWithoutTitleRow() {
    return this._topFixedRows === 1;
  }

  calulateTopRowIdx(dataIndex: number) {
    return Math.floor(dataIndex / this._countPerHorizontal) * (this.timetableTotalRows + this._timetableRowsGap) + 1;
  }

  calulateLeftColIdx(dataIndex: number) {
    const isNotFirstCol = dataIndex % this._countPerHorizontal !== 0;
    return ((dataIndex % this._countPerHorizontal) * this.timetableTotalCols) + (isNotFirstCol ? this._timetableColsGap : 0) + 1;
  }
}



// 2025.11.04. notbadlife, Deprecated: requestIdleCallback 방식 자동 생성. web worker 방식으로 대체
const processGenerate = async () => {
  isGenerating.value = true;
  isGeneratingTimetableModal.value = true;

  // showLoadingGenerate();

  requestIdleCallback(
    async () => {
      // 고정 수업
      const fixedLessons = await Timetable.generateFixedLessons();

      // 개별 교사 수동 배정
      const manualLessons = lessons.value.filter((lesson) => {
        return lesson.isManuallyAssigned;
      });

      // 고정 수업과 수동 배정된 수업은 유지한다.
      // @TODO: 초기화 등의 로직에 따라 수정이 필요할 수 있음
      const isSilent = true; // 디버깅용, 콘솔 출력 안함
      const presetLessons = [...fixedLessons, ...manualLessons] as Lesson[];
      const generatedLessons = await Timetable.generate(presetLessons, isSilent);

      try {
        // 생성된 수업 목록을 저장
        lessons.value = await lessonContext.saveLessonsWithReplace(generatedLessons);
        Timetable.initWithPresetedLessons(lessons.value);
        timetableStatus.value = Timetable.timetableStatus;
        
        isGenerating.value = false;
        isGeneratingTimetableModal.value = false;
      }
      catch (error) {
        isGenerating.value = false;
        isGeneratingTimetableModal.value = false;

        dialog.alertSimple(
          '시간표 생성 중 오류가 발생했습니다.',
        );
      }
    },
    { timeout: 1000 }
  );
};
</script>

<style scoped lang="scss">
.tt-generate{
  .table-head{
    input[type=radio] + label span{
      font-weight: 600;
    }
  }
}
// 시간표 생성 중 모달
.generating-timetable-modal{
  .loading-ani{
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    span{ 
      display: inline-block;
      width: 12px;
      height: 12px;     
      border-radius: 50px;
      margin: 0 4px;
      animation: loading-ani 1s ease-in-out infinite;
      &:nth-child(1){background:#10069F; animation-delay: 0.2s;}
      &:nth-child(2){background:#00B388; animation-delay: 0.4s;}
      &:nth-child(3){background:#5BC2E7; animation-delay: 0.6s;}
      &:nth-child(4){background:#FFBF3F; animation-delay: 0.8s;}
    }    
  }
  .tit{
    font-size: 20px;
    font-weight: 700;
    line-height: 140%;
    text-align: center;
    margin-bottom: 8px;
  }
  .desc{
    text-align: center;
    font-size: 15px;
    font-weight: 400;
    line-height: 160%;
    color: var(--Txt-Gray-09);
  }
}
// 시간표 생성 완료 모달
.generated-timetable-modal{  
  .tit{
    font-size: 20px;
    font-weight: 700;
    line-height: 140%;
    text-align: center;
    margin-bottom: 8px;
  }
  .desc{
    text-align: center;
    font-size: 15px;
    font-weight: 400;
    line-height: 160%;
    color: var(--Txt-Gray-09);
  }
}

// 전체 시수표 보기 모달
.total-period-modal{
  ::v-deep{
    .modal__layer{
      height: calc(100% - 48px);
    }
    .modal__content{
      height: calc(100% - 100px);
    }
  }
  .tab-nav{ 
    margin-bottom:24px;
  }
  .table-content{
    height: calc(100% - 80px);
  }
}

//시간표 초기화 모달
.timetable-reset-modal{
  .form-check{
    & + .form-check{margin-top:20px;}
    label span{
      font-weight: 400;
    }
  } 
}

// 작업 내역 확인 모달
.history-modal{  
  ::v-deep .modal__layer{
    height: 100%;
    .modal__content{
      display: flex;
      flex-flow: column;
    }
  }
  .table-content{
    height: auto;
    max-height: 100%;
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

// 수업 변경 (1:1교환) 모달
.exchange-direct-modal{
  .tb-row{
    display: flex;
    gap: 12px;
    .tb-col{
      width: calc(50% - 6px);
    }
  }
}

// 동시수업(1:1교환) 모달
.exchange-concurrent-direct-modal{  
  ::v-deep{
    .modal__layer{
      height: calc(100% - 48px);
    }
    .modal__content{
      height: calc(100% - 165px);
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
  .selected-teacher{
    padding: 20px 24px 10px 24px;
    button{
      margin-left: 8px;
      margin-bottom: 10px;
      .btn-tertiary{ color:#616161;}
    }
  }
}

// 기초 시간표 수정완료 모달
.timeTable-complete-modal{
  ::v-deep .modal__layer{
    overflow: visible;
    .modal__content{
      overflow: visible;
    }
  }
  .hi-selectbox{
    width: 200px !important;
  }
  .input-wrap {
    width: 200px;
    position: relative;
    display: inline-block;
    
    input:focus + i.ico-calendar {
      &::after {
        background-color: var(--primary) !important;
      }
    }
    i.ico-calendar {
      position: absolute;
      right: 12px;
      top: 12px;
      &::after {
        background-color: var(--gray-10) !important;
      }
    }
    .hi-selectbox{
      width: 100%;
      height: 44px;
      ::v-deep button.selected{height:100%;}
      &.err {
        ::v-deep button.selected{
            border-color: #EC1F2D;
        }
      }
    }
}
  .desc{
    color: #616161;
  }


}
</style>
