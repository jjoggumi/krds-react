import { getCurrentInstance } from 'vue';
import { TimetableStatus } from '../core/types';

enum TimetableRouterName {
  TimetableCreate = "TimetableCreate",
  timetableBasicInfoWithId = "timetableBasicInfoWithId",
  TimetableBasicInfo = "TimetableBasicInfo",
  TimetableCourses = "TimetableCourses",
  TimetableTeachers = "TimetableTeachers",
  TimetableWeeklyPeriod = "TimetableWeeklyPeriod",
  TimetableLessonConfig = "TimetableLessonConfig",
  TimetableAdditionalWork = "TimetableAdditionalWork",
  TimetableGenerate = "TimetableGenerate",
  TimetableFinalCheck = "TimetableFinalCheck",
}

enum MoveType {
  Next = "next",
  Prev = "prev",
}

interface MenuStep {
  label: string;
  name: TimetableRouterName;
  handleClick: (moveType?: MoveType, templateId?: string) => void;
  desc: string;
  timetableStatus?: TimetableStatus;
}

const useMenuManager = () => {
  // @ts-ignore
  const { proxy } = getCurrentInstance();

  const menuSteps = [
    { 
      label: "시작하기", 
      name: TimetableRouterName.TimetableBasicInfo,
      handleClick: (moveType?: MoveType, templateId?: string) => timetableBasicInfo(moveType, templateId),
      desc: "기초 시간표 템플릿을 만드는 화면입니다. 학교의 정보를 스텝별로 작성해주세요.<br /><span class=\'txt-warning\'>* 정보를 수정할 경우 작성해 놓은 정보가 초기화 될 수 있습니다.</span> ",
      timetableStatus: TimetableStatus.Init,
    },
    { 
      label: "주간 시수 조정",
      name: TimetableRouterName.TimetableWeeklyPeriod,
      handleClick: (moveType?: MoveType, templateId?: string) => timetableWeeklyPeriod(moveType, templateId),
      desc: '각 학년 별 주간 시수를 조정해 주세요. <br /><span class=\"txt-warning\">* 수업 없음 및 공통과목을 배정하실 수 있습니다.</span>',
      timetableStatus: TimetableStatus.WeeklyPeriod,
    },
    { 
      label: "과목명 등록",
      name: TimetableRouterName.TimetableCourses,
      handleClick: (moveType?: MoveType, templateId?: string) => timetableCourses(moveType, templateId),
      desc: '과목 목록을 등록합니다. 나이스에 등록되는 정식과목명 및 시간표에서 구분할 표기과목명을 입력하세요.<br /><span class=\"txt-warning\">* 각 학년별로 동일한 과목이라도 동시수업 그룹이 다를 경우,구분된 표기 과목명으로 입력해 주세요. (예 : 수학1, 수학2)</span>',
      timetableStatus: TimetableStatus.CourseBase,
    },
    { 
      label: "교사명 등록",
      name: TimetableRouterName.TimetableTeachers,
      handleClick: (moveType?: MoveType, templateId?: string) => timetableTeachers(moveType, templateId),
      desc: '우리학교의 교사 명단을 입력해 주세요.<br /><span class=\"txt-warning\">* 동명이인인 경우, 이름을 구분하여 작성해주세요. (홍길동A, 홍길동B) </span>',
      timetableStatus: TimetableStatus.Teacher,
    },
    { 
      label: "시수표 등록",
      name: TimetableRouterName.TimetableLessonConfig,
      handleClick: (moveType?: MoveType, templateId?: string) => timetableLessonConfig(moveType, templateId),
      desc: '셀을 클릭하여 시수표를 작성하거나, 엑셀로 다운로드하여 작성 후 업로드하세요. <br /><span class=\"txt-warning\">* 엑셀 업로드 시 교사, 과목, 학급 등 기초 정보를 수정하실 경우 오류가 발생하여 업로드가 되지 않습니다.</span>',
      timetableStatus: TimetableStatus.LessonConfig,
    },
    { 
      label: "부가 작업 등록",
      name: TimetableRouterName.TimetableAdditionalWork,
      handleClick: (moveType?: MoveType, templateId?: string) => timetableAdditionalWork(moveType, templateId),
      desc: '동시수업, 연속수업 등 기초작업 외 부가작업을 등록하는 화면입니다. <br /><span class=\"txt-warning\">* 고교학점제, 동시수업 등록 시 그룹 등록하여 이용해 주세요.</span>',
      timetableStatus: TimetableStatus.AdditionalWork,
    },
    { 
      label: "시간표 자동 생성",
      name: TimetableRouterName.TimetableGenerate,
      handleClick: (moveType?: MoveType, templateId?: string) => timetableGenerate(moveType, templateId),
      desc: '1~6단계 까지의 정보를 바탕으로 기초 시간표를 생성합니다. <br /><span class=\"txt-warning\">* 교사 목록을 선택하여 개별 선생님의 시간표를 수동 배정 할 수 있습니다.</span>',
      timetableStatus: TimetableStatus.Generate,
    },
  ] as MenuStep[];
  
  function getTimetableParams(moveType?: MoveType, argTemplateId?: string) {
    const { timetableId, templateId } = proxy.$route.params;

    const paramTemplateId = templateId || argTemplateId || null;

    const params = {
      timetableId,
      templateId: paramTemplateId,
      moveType,
    };

    return params;
  }

  // router.beforeEach(doBeforeRouteChange);
  function timetableCreate() {
    const router = proxy.$router;
    router.push({ name: TimetableRouterName.TimetableCreate });
  }

  function timetableBasicInfoWithId(timetableId: string, templateId?: string) {
    const router = proxy.$router;
    const params = { timetableId };
    router.push({ name: TimetableRouterName.TimetableBasicInfo, params });
  }

  function timetableBasicInfo(moveType?: MoveType, templateId?: string) {
    const router = proxy.$router;
    const params = getTimetableParams(moveType, templateId);
    router.push({ name: TimetableRouterName.TimetableBasicInfo, params });
  }

  function timetableCourses(moveType?: MoveType, templateId?: string) {
    doBeforeRouteChange();
    const router = proxy.$router;
    const params = getTimetableParams(moveType, templateId);
    router.push({ name: TimetableRouterName.TimetableCourses, params });
  }

  function timetableTeachers(moveType?: MoveType, templateId?: string) {
    doBeforeRouteChange();
    const router = proxy.$router;
    const params = getTimetableParams(moveType, templateId);
    router.push({ name: TimetableRouterName.TimetableTeachers, params });
  }

  function timetableWeeklyPeriod(moveType?: MoveType, templateId?: string) {
    const router = proxy.$router;
    const params = getTimetableParams(moveType, templateId);
    router.push({ name: TimetableRouterName.TimetableWeeklyPeriod, params });
  }

  // 아직 페이지 없음
  function timetableLessonConfig(moveType?: MoveType, templateId?: string) {
    const router = proxy.$router;
    const params = getTimetableParams(moveType, templateId);
    router.push({ name: TimetableRouterName.TimetableLessonConfig, params });
  }

  function timetableAdditionalWork(moveType?: MoveType, templateId?: string) {
    const router = proxy.$router;
    const params = getTimetableParams(moveType, templateId);
    router.push({ name: TimetableRouterName.TimetableAdditionalWork, params });
  }

  function timetableGenerate(moveType?: MoveType, templateId?: string) {
    const router = proxy.$router;
    const params = getTimetableParams(moveType, templateId);
    router.push({ name: TimetableRouterName.TimetableGenerate, params });
  }

  function timetableFinalCheck(moveType?: MoveType, templateId?: string) {
    const router = proxy.$router;
    const params = getTimetableParams(moveType, templateId);
    router.push({ name: TimetableRouterName.TimetableFinalCheck, params });
  }

  function doBeforeRouteChange() {
    scrollToTop();
  }

  function getMenuSteps() {
    return menuSteps;
  }

  function getCurrentMenuIndex() {
    const { name } = proxy.$route;
    const index = menuSteps.findIndex((step) => step.name === name);
    return index;
  }

  function goNextStep(templateId?: string) {
    const currentIndex = getCurrentMenuIndex();
    const nextIndex = currentIndex + 1;
    if (nextIndex < menuSteps.length) {
      const nextStep = menuSteps[nextIndex];
      nextStep.handleClick(MoveType.Next, templateId);
    }
  }

  function goPrevStep(templateId?: string) {
    const currentIndex = getCurrentMenuIndex();
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      const prevStep = menuSteps[prevIndex];
      prevStep.handleClick(MoveType.Prev, templateId);
    }
  }

  function scrollToTop() {
    window.scrollTo(0, 0);
  }

  return {
    timetableBasicInfoWithId,
    timetableBasicInfo,
    timetableCourses,
    timetableTeachers,    
    timetableWeeklyPeriod,
    timetableLessonConfig,
    timetableAdditionalWork,
    timetableGenerate,
    timetableFinalCheck,
    getMenuSteps,
    getCurrentMenuIndex,
    goNextStep,
    goPrevStep,
  };
};

export { useMenuManager, MenuStep };
