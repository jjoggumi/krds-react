<template>
  <div class="time-table-wrap" :class="{ 'help-open': isHelpOpen, 'none-header': noneHeader }">
    <LayoutHeader :user="user" :selectedSchool="selectedSchool" @close="handleClickClose" />

    <main ref="scrollArea" class="container">
      <StepProgress ref="stepProgressRef" :currentStep="currentStep" @step-clicked="isHelpOpen = false" />
      <div class="time-table-noti" v-if="isFinished">
        <i class="ico ico-info-warning ico-size-24 ico-warning"></i> 일부 데이터는 시간표에서 공통으로 사용되는 항목이기 때문에 수정이 제한되어 있습니다. 비활성화된 항목은 변경할 수 없으며, 변경이 필요한 경우 전체시간표를 새로 생성해 주세요.
      </div>
      <PageTitle
        ref="pageTitleRef"
        :currentStep="currentStep"
        :pageRef="pageRef"
        :stepProgressRef="stepProgressRef"
        :helpOn="helpOn"
        @openHelp="openHelp"
      />

      <div class="content">
        <router-view ref="pageRef" :helpOn="helpOn" @openHelp="openHelp" />
      </div>
    </main>

    <HelpPanel
      :helpOn="helpOn"
      :currentStep="currentStep"
      :isOpen="isHelpOpen"
      @toggle-help="isHelpOpen = !isHelpOpen"
      @close-help="isHelpOpen = false"
      @update-help-on="openHelp($event)"
    />

    <ToTopBtn :targetRef="scrollArea"></ToTopBtn>

    <!-- 로딩 <div class="loading-wrap">
      <lottie :options="Loading" class="loading"/>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import '@/assets/css/timetable/common.scss'; // 공통 스타일
import { provide, reactive, onMounted, onUnmounted, ref, getCurrentInstance, computed } from 'vue';

// context provider
import {
  ContextKeys,
  TimetableCourseContext,
  TimetableTeacherContext,
  TeacherCourseContext,
  ConcurrentConfContext,
  ConsecutiveConfContext,
  LessonConfContext,
  SpecialtyRoomConfContext,
  SpecialtyRoomContext,
  TimetableGradeContext,
  TimetableClassContext,
  FixedConfContext,
  LessonContext,
  SimilarCourseConfContext,
  TimetableCourseBaseContext,
  TeacherCourseBaseContext,
  TimetableProgressContext,
  SimilarCourseContext,
} from '../contexts';

import { useEducationLetterApis } from '../composables/educationLetterApis';
import { useUserApis } from '../composables/userApis';
import { useDialog } from '@/apps/timetable/composables/dialog';
const { fetchUserInfo } = useUserApis();
const { fetchSchools } = useEducationLetterApis();

const stepProgressRef = ref();
const pageTitleRef = ref();
const pageRef = ref();
const scrollArea = ref<HTMLElement | null>(null);
const noneHeader = ref(false);
const selectedSchool = ref({});
const user = ref({});
const dialog = useDialog();

const { proxy } = getCurrentInstance() as any;

// 전체(window) 스크롤이 10px을 넘으면 고정 클래스 적용
const handleScroll = () => {
  const pos = window.scrollY || window.pageYOffset || 0;
  noneHeader.value = pos > 10;
};

import LayoutHeader from '@/apps/timetable/layout/LayoutHeader.vue';
import StepProgress from '@/apps/timetable/layout/StepProgress.vue';
import PageTitle from '@/apps/timetable/layout/PageTitle.vue';
import HelpPanel from '@/apps/timetable/layout/HelpPanel.vue';
import ToTopBtn from '@/apps/timetable/layout/ToTopBtn.vue';
import timeLoading from '@/apps/timetable/resources/timetable-loading.json';
import { open, watch } from 'fs';

const Loading = { animationData: timeLoading, loop: true, autoplay: true };

const courseContext = reactive(TimetableCourseContext.getInstance());
provide(ContextKeys.Course, courseContext);

const courseBaseContext = reactive(TimetableCourseBaseContext.getInstance());
provide(ContextKeys.CourseBase, courseBaseContext);

const teacherContext = reactive(TimetableTeacherContext.getInstance());
provide(ContextKeys.Teacher, teacherContext);

const teacherCourseContext = reactive(TeacherCourseContext.getInstance());
provide(ContextKeys.TeacherCourse, teacherCourseContext);

const teacherCourseBaseContext = reactive(TeacherCourseBaseContext.getInstance());
provide(ContextKeys.TeacherCourseBase, teacherCourseBaseContext);

const concurrentConfContext = reactive(ConcurrentConfContext.getInstance());
provide(ContextKeys.ConcurrentConf, concurrentConfContext);

const consecutiveConfContext = reactive(ConsecutiveConfContext.getInstance());
provide(ContextKeys.ConsecutiveConf, consecutiveConfContext);

const lessonConfContext = reactive(LessonConfContext.getInstance());
provide(ContextKeys.LessonConf, lessonConfContext);

const specialtyRoomConfContext = reactive(SpecialtyRoomConfContext.getInstance());
provide(ContextKeys.SpecialtyRoomConf, specialtyRoomConfContext);

const specialtyRoomContext = reactive(SpecialtyRoomContext.getInstance());
provide(ContextKeys.SpecialtyRoom, specialtyRoomContext);

const timetableGradeContext = reactive(TimetableGradeContext.getInstance());
provide(ContextKeys.Grade, timetableGradeContext);

const timetableClassContext = reactive(TimetableClassContext.getInstance());
provide(ContextKeys.Class, timetableClassContext);

const fixedConfContext = reactive(FixedConfContext.getInstance());
provide(ContextKeys.FixedConf, fixedConfContext);

const lessonContext = reactive(LessonContext.getInstance());
provide(ContextKeys.Lesson, lessonContext);

const similarCourseConfContext = reactive(SimilarCourseConfContext.getInstance());
provide(ContextKeys.SimilarCourseConf, similarCourseConfContext);

const similarCourseContext = reactive(SimilarCourseContext.getInstance());
provide(ContextKeys.SimilarCourse, similarCourseContext);

const progressContext = reactive(TimetableProgressContext.getInstance());
provide(ContextKeys.TimetableProgress, progressContext);



const isFinished = computed(() => {
  return progressContext.isFinished;
});

const isHelpOpen = ref(false); // / 도움말 패널 열기 여부
const currentStep = ref(1); // 현재 단계
const helpOn = ref<string>(''); // ⓘ 도움말 클릭시 패널에서 활성화
const openHelp = (index: string) => {
  if (!index) {
    helpOn.value = '';
    isHelpOpen.value = false;
    return;
  }

  helpOn.value = index;
  isHelpOpen.value = true;
};
const closeHelp = () => {
  helpOn.value = '';
  isHelpOpen.value = false;
};
// 버튼 활성화만 제거 (패널은 유지)
const deactivateHelp = (id: string) => {
  if (helpOn.value === id) {
    helpOn.value = '';
  }
};
provide('openHelp', openHelp);
provide('closeHelp', closeHelp);
provide('deactivateHelp', deactivateHelp);

// 화면 높이 설정
const setFullHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

const getUserInfo = async () => {
  await getSelectedSchool();
  await getUser();
};

const getSelectedSchool = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const schoolId = urlParams.get('schoolId');
  if (schoolId) {
    const schools = await fetchSchools();
    selectedSchool.value = schools.find((school: any) => school.schoolId === schoolId) || {};
  }
};

const getUser = async () => {
  const userId = localStorage.getItem('uuid');
  if (!!userId) user.value = await fetchUserInfo(userId);
};

const handleClickClose = async (currentIdx: number) => {
  const res =
    currentIdx === 0
      ? true
      : await dialog.confirm('기초 시간표 생성을 종료하시겠습니까?<br/>작성 중인 내용은 임시 저장됩니다.', null, {
          customClass: {
            popup: 'timetable-confirm',
          },
          confirmButtonText: '나가기',
        });
  if (res) window.close();
};

onMounted(async () => {
  setFullHeight();
  window.addEventListener('resize', setFullHeight);
  window.addEventListener('scroll', handleScroll, { passive: true });
  // 초기 상태 반영
  handleScroll();
  await getUserInfo();
});

onUnmounted(() => {
  window.removeEventListener('resize', setFullHeight);
  window.removeEventListener('scroll', handleScroll);
});
</script>
<style scoped lang="scss">
.loading-wrap {
  z-index: 10001;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;

  .loading {
    width: 280px;
    height: 280px;
    max-width: 280px;
    max-height: 280px;
  }
}

.time-table-noti{    
  display: flex;
  align-items: center;
  gap: 4px;
  background: #FDEDEE;
  padding: 12px 30px;
  border-bottom: 1px solid var(--Line-Gray-06);
  color:var(--warning);
  font-size: 13px;
  line-height: 150%;
  font-weight: 500;
}
</style>