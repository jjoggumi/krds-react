<template>
  <div class="tt-lesson-config">
    <div class="tab-nav type01">
      <button
        v-for="(item, menuIdx) in menuItems"
        :key="`menu-${menuIdx}`"
        :class="{ active: subMenu === item.name }"
        @click="clickSubMenu(item)"
      >
        {{ item.label }}
      </button>      
      <div class="tab-btn-area" v-if="subMenu === SubMenu.LessonConfig">
        <button type="button" @click="showComingSoon" class="btn btn-tertiary btn-md">시수표 작성 요청
          <HelpButton 
            :id="'시수표 작성 요청'"
            :active="helpOn === '시수표 작성 요청'"             
          />
        </button> 
        <button type="button"  @click="showComingSoon" class="btn btn-tertiary btn-md">교사별 시수표 작성 확인
          <HelpButton 
            :id="'교사별 시수표 작성 확인'"
            :active="helpOn === '교사별 시수표 작성 확인'"             
          />
        </button>
        <!-- 실제 개발될 시수표 다운로드 선택박스 
         <HiSelectBox 
          empty-title="Default Type"  
          class="dropdown md"      
          >
          <template #btnType>
            시수표 다운로드 
          </template>
          <template #custom-option>
            <button class="option" type="button" @click="showComingSoon">전체 시수표</button>
            <button class="option" type="button" @click="showComingSoon">선택 시수표</button>
          </template>
        </HiSelectBox> -->
        <button type="button" @click="showComingSoon" class="btn btn-tertiary-blue btn-md" v-if="false">
          시수표 다운로드
        </button>
        <button type="button" @click="showComingSoon" class="btn btn-tertiary-blue btn-md" v-if="false">
          파일 업로드
        </button>
      </div> 
    </div>
    <div class="tab-con mt-20">
      <lesson-conf-by-teacher v-if="subMenu === SubMenu.LessonConfig" />
      <lesson-conf-by-class
        v-else-if="subMenu === SubMenu.LessonPeriodByClass"
      />
    </div>

    <DataEntryNoticeModal 
      v-if="isShowDataEntryNoticeModal" 
      :noticeType="noticeType" 
      @close="handleCloseDataEntryNoticeModal"
    />

  </div>
</template>

<script setup lang="ts">

import { computed, inject, onMounted, ref, getCurrentInstance } from 'vue';

import DataEntryNoticeModal from '../components/DataEntryNoticeModal.vue';
import { NoticeType } from '../common/types';

import LessonConfByTeacher from '@/apps/timetable/components/LessonConf.vue';
import LessonConfByClass from '@/apps/timetable/components/LessonConfByClass.vue';

import { Menu } from '@/apps/timetable/common/types';
import { useDialog } from '../composables/dialog';
import HelpButton from '@/apps/timetable/components/HelpButton.vue';

import {
  Class,
  Course,
  CourseBase,
  FixedConf,
  LessonConf,
  TimetableConfig,
  TimetableStatus,
} from '@/apps/timetable/core/types';

import {
  ContextKeys,
  TimetableGradeContext,
  TimetableCourseContext,
  TimetableTeacherContext,
  TimetableClassContext,
  TeacherCourseContext,
  LessonConfContext,
  FixedConfContext,
  TimetableCourseBaseContext,
  TimetableProgressContext,
  TeacherCourseBaseContext,
} from '../contexts';
import { TimetableDisplayUtils } from '../common/utils';

const { proxy } = getCurrentInstance() as any;

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const courseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const teacherCourseBaseContext = inject(ContextKeys.TeacherCourseBase) as TeacherCourseBaseContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const fixedConfContext = inject(ContextKeys.FixedConf) as FixedConfContext;
const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;

const classes = computed(() => classContext.classes as Class[]);
const courses = computed(() => courseContext.courses as Course[]);
const courseBases = computed(() => courseBaseContext.courseBases as CourseBase[]);
const courseBaseMap = computed(() => courseBaseContext.courseBaseMap as Record<string, CourseBase>);
const courseMap = computed(() => courseContext.courseMap as Record<string, Course>);
const lessonConfs = computed(() => lessonConfContext.lessonConfs as LessonConf[]);
const lessonConfMap = computed(() => lessonConfContext.lessonConfMap as Record<string, LessonConf>);
const timetableConfig = computed(() => gradeContext.timetableConfig as TimetableConfig);
const fixedConfs = computed(() => fixedConfContext.fixedConfs as FixedConf[]);

const props = defineProps({
  helpOn: {
    type: String,
    default: 0,
  },
});

// 데이터 수정 관련 안내 팝업  상태
const noticeType = ref<NoticeType>(NoticeType.None);
const isShowDataEntryNoticeModal = ref(false);
const handleCloseDataEntryNoticeModal = () => {
  isShowDataEntryNoticeModal.value = false;
};

const fromNextStep = computed(() => proxy.$route && proxy.$route.params && proxy.$route.params?.moveType === 'prev');

enum SubMenu {
  LessonConfig = 'LessonConfig',
  LessonPeriodByClass = 'LessonPeriodByClass',
}

const showNoticeIfNotSeen = (key: NoticeType) => {
  if (!sessionStorage.getItem(key)) {
    noticeType.value = key;
    isShowDataEntryNoticeModal.value = true;
    sessionStorage.setItem(key, 'true');
  }
};

onMounted(async() => {
  await progressContext.reload();

  if (!progressContext.checkAccessible(TimetableStatus.LessonConfig)) {
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

  await courseContext.reload();
  await courseBaseContext.reload();
  await teacherContext.reload();
  await teacherCourseContext.reload();
  await teacherCourseBaseContext.reload();
  await lessonConfContext.reload();
  await gradeContext.reload();
  await classContext.reload();
  await fixedConfContext.reload();
});

const dialog = useDialog();

// 각 학년별 공통 수업의 시수합 > 공통 수업은 주간시수에서 제외하기 위함
const fixedUnifiedCourseGroupByGrade = computed(() => {
  return fixedConfs.value
    .filter(
      (conf) => courseMap.value[conf.courseId] && courseMap.value[conf.courseId].isUnified
    )
    .reduce((acc, conf) => {
      (acc[conf.grade] ||= []).push(conf);
      return acc;
    }, {} as { [key: number]: FixedConf[] });
});

const lessonConfsByClassId = computed(() =>
  lessonConfs.value.reduce((map, conf) => {
    (map[conf.classId] ||= []).push(conf);
    return map;
  }, {} as Record<string, LessonConf[]>)
);

const lessonConfsByCourseId = computed(() =>
  lessonConfs.value.reduce((map, conf) => {
    (map[conf.courseId] ||= []).push(conf);
    return map;
  }, {} as Record<string, LessonConf[]>)
);

const gradeClassItems = computed(() => {
  const grades = Object.keys(gradeContext.gradeTotalPeriodMap).map(Number);
  const gradeTotalPeriod = grades.map(grade => 
    gradeContext.gradeTotalPeriodMap[grade] - (fixedUnifiedCourseGroupByGrade.value[grade]?.length || 0)
  );

  return classes.value
    .map((cls) => {
      const classLessonConfs = lessonConfsByClassId.value[cls.classId] || [];

      const accumulatedDoubleTeacherCourseSet = new Set<string>();
      const accumulated = classLessonConfs.reduce((acc, conf) => {
        const course = courseMap.value[conf.courseId];
        let addedPeriodCount = course.periodCount || 0;

        // 복수 교사 과목인 경우, 한 번만 시수 합산
        if (course.isDoubleTeacher) {
          addedPeriodCount = !accumulatedDoubleTeacherCourseSet.has(conf.courseId) ? addedPeriodCount : 0;
          accumulatedDoubleTeacherCourseSet.add(conf.courseId);
        }

        return acc + addedPeriodCount;
      }, 0);

      return {
        ...cls,
        totalPeriod: gradeTotalPeriod[cls.grade - 1],
        accumulated,
      };
    })
    .sort((a, b) => {
      if (a.grade === b.grade) {
        if (a.isVirtual != b.isVirtual) {
          return a.isVirtual ? 1 : -1;
        }

        return a.classNumber - b.classNumber;
      }
      return a.grade - b.grade;
    });
});


const menuItems = ref<Menu[]>([
  {
    name: SubMenu.LessonConfig,
    label: '교사별 시수표',
  },
  {
    name: SubMenu.LessonPeriodByClass,
    label: '학급별 시수표',
  },
]);

const subMenu = ref<SubMenu>(SubMenu.LessonConfig);

const clickSubMenu = (item: Menu) => {
  subMenu.value = item.name as SubMenu;
};

const checkClassPeriodValid = () => {
  for (const cls of gradeClassItems.value) {
    if (cls.accumulated != cls.totalPeriod && !cls.isVirtual) {
      // 가상 학급이면서 시수가 맞지 않는 경우
      // console.log('cls.accumulated', cls.accumulated, 'cls.totalPeriod', cls.totalPeriod, cls);
      return false;
    }
  }
  return true;
};

const checkDoubleTeacherCourseValid = async () => {
  const multiTeacherCourseBaseIdSet = courseBases.value
    .filter((cb) => cb.isDoubleTeacher)
    .map((cb) => cb.courseBaseId)
    .reduce((set, id) => set.add(id), new Set<string>());

  const classCourseCountMap = new Map<string, number>();
  const keySeperator = '||';

  for (const conf of lessonConfs.value) {
    const crs = courseMap.value[conf.courseId];
    if (!multiTeacherCourseBaseIdSet.has(crs.courseBaseId)) {
      continue;
    }

    const key = `${conf.classId}${keySeperator}${crs.courseId}`;
    classCourseCountMap.set(key, (classCourseCountMap.get(key) || 0) + 1);
  }

  for (const [key, count] of classCourseCountMap.entries()) {
    if (count > 1) {
      continue;
    }

    const [_, courseId] = key.split(keySeperator);
    const crs = courseMap.value[courseId];
    const msg = `(복) ${TimetableDisplayUtils.formatCourseTitle(crs)}에 복수교사가 등록되지 않았습니다.<br/>확인해 주세요.`;
    await dialog.alertSimple(msg);
    return false;
  }
  
  return true;
};

const checkBeforeMove = async () => {
  if (!checkClassPeriodValid()) {
    await dialog.alertSimple('시수 현황에 오류가 있습니다.<br /> 확인해 주세요.');
    return false;
  }

  if(!await checkDoubleTeacherCourseValid()) {
    return false;
  }

  const nextStatus = TimetableStatus.AdditionalWork;
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

// 추후 업데이트 알림 공통 핸들러
const showComingSoon = async () => {
  await dialog.alertSimple('추후 업데이트 예정입니다.');
};
</script>

<style scoped lang="scss">
.tt-lesson-config{  
  .hi-selectbox{
    ::v-deep .selected{
      border: 1px solid #4778DE ;
      background-color: #fff;
      color: #4778DE;
      i:after{background-color: #4778DE;}
      
      &:hover{
        border: 1px solid #4778DE;
        background-color: rgba(71, 120, 222, 0.16);
      }
      &:focus{
      border: 1px solid #4778DE;
      background-color: rgba(71, 120, 222, 0.16);
      }
    }
  }
}
</style>
