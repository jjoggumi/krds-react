<template>
  <div class="teacher-assign-wrap">
    <!-- 교사 선택 수동 배정 테이블 -->
    <div class="table-content time-table teacher-assign">
      <!-- 교사 선택 수동 배정 class (teacher-assign) -->
      <div class="h4-tit">
        <h4>{{ title }} {{ className }}</h4>
        <p class="period">
          <!-- <i v-if="teacherCourseTitle" class="ico ico-list ico-primary" />  -->
          {{ teacherCourseTitle }}
        </p>
      </div>
      <table>
        <caption>
          시간표
        </caption>
        <colgroup>
          <col style="width: 10%" />
          <col v-for="dayIdx in activatedClassDaysCount" :key="`day-col-${dayIdx}-${selectedTeacher?.teacherId}`" :style="`width: ${activatedClassDaysWidthPercent};`" />
        </colgroup>
        <thead>
          <tr>
            <th></th>
            <th
              v-for="day in activatedClassDays"
              @click="handleClickOnClassDay(day)"
              :style="{ cursor: day.isActive ? 'pointer' : 'default' }"
              :key="`day-header-${selectedTeacher?.teacherId}-${day.dayOfWeek}`"
            >
              {{ day.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="period in maxPeriod" :key="`period-${selectedTeacher?.teacherId}-${period}`">
            <td class="th" @click="handleClickOnPeriod(period)" :style="{ cursor: 'pointer' }">{{ adjustDisplayedPeriod(period) }}</td>
            <td
              v-for="day in activatedClassDays"
              :key="`lesson-cell-${selectedTeacher?.teacherId}-${day.dayOfWeek}-${period}-${lessonsLength}-${timetableUpdatedAt}`"
            >
              <timetable-lesson-edit-cell
                :day-of-week="day.dayOfWeek"
                :period="period"
                :timetable-edit-state="currentEditState"
                :editor-cell-lesson="getEditorCellLessonByPeriod(day.dayOfWeek, period)"
                :selected-lesson="selectedLesson"
                :on-click="handleClickEditorCell"
                :on-delete="handleDelete"
                :free-periods-count="teacherFreePeriodsCount"
                :teacher-id="selectedTeacher?.teacherId"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--  교사 선택 수동 배정 리스트-->
    <div class="assign-list panel md">
      <div class="panel-body">
        <div class="tit">
          시수 - {{ assignPeriodInfo.total }} (배정 {{ assignPeriodInfo.assigned }} / 미배정
          <span class="txt-primary">{{ assignPeriodInfo.remaining }}</span
          >)
        </div>
        <div class="tab-nav">
          <button :class="{ active: assignTab === 'auto-assign' }" @click="assignTab = 'auto-assign'">자동 배정 결과</button>
          <button :class="{ active: assignTab === 'lesson-config' }" @click="assignTab = 'lesson-config'">시수표</button>
        </div>
        <!-- 자동 배정 결과 -->
        <div class="auto-assign" v-if="assignTab === 'auto-assign'">
          <div class="table-content basic-table sticky-wrap">
            <table>
              <caption>
                자동 배정 결과
              </caption>
              <colgroup>
                <col style="width: 80%" />
                <col style="width: 20%" />
              </colgroup>
              <thead>
                <tr>
                  <th class="sticky-top">항목명</th>
                  <th class="sticky-top">개수</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="vKey in validateStatusTypeKeys" :key="`status-type-${vKey}-${teacher?.teacherId}`" :class="{ 'selected-period' : selectedValidStatusType == vKey}">
                  <td
                    :class="teacherStatus && teacherStatus[vKey] === 0 ? 'disabled-result' : 'cursor-pointer'"
                    @click="() => handleClickValidStatusType(vKey)"
                  >
                    {{ VALID_STATUS_COUNT_TYPE_TITLE[vKey] }}
                  </td>
                  <td
                    :class="teacherStatus && teacherStatus[vKey] > 0 ? 'txt-primary cursor-pointer' : 'disabled-result'"
                    @click="() => handleClickValidStatusType(vKey)"
                  >
                    {{ (teacherStatus && teacherStatus[vKey]) || 0 }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- 시수표 -->
        <div class="lesson-config" v-if="assignTab === 'lesson-config'">
          <div class="table-content basic-table sticky-wrap">
            <table>
              <caption>
                시수표
              </caption>
              <colgroup>
                <col style="width: 10%; min-width: 47px" />
                <col style="width: 25%" />
                <col style="width: 25%" />
                <col style="width: 25%" />
                <col style="width: 15%; min-width: 72px" />
              </colgroup>
              <thead>
                <tr>
                  <th class="sticky-top"></th>
                  <th class="sticky-top">학급</th>
                  <th class="sticky-top">과목명</th>
                  <th class="sticky-top">미배정/시수</th>
                  <th class="sticky-top">배정
                    <HelpButton 
                      :id="'배정'"
                      :active="helpOn === '배정'"
                      class="btn-help"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in teacherPeriodList" :key="`${item.lessonConfId}.${item.classId}-${item.remainingCount}-${lessonsLength}`" :class="{ 'selected-period': checkIsSelectedPeriodListItem(item) }">
                  <td class="txt-center">
                    <div v-if="item.concurrentCourseTitle" class="badge concurrent">동시</div>
                    <div v-if="item.lessonConf?.consecutivePeriod" class="badge consecutive">연속</div>
                    <div v-if="false" class="badge joint">합반</div>
                    <!-- 2025.11.20, notbadlife: 오픈범위에서 미노출 처리 -->
                  </td>
                  <td class="cursor-pointer" @click="() => handleClickPeriodListItem(item)">
                    {{ item.classNames }}
                  </td>
                  <td class="cursor-pointer" @click="() => handleClickPeriodListItem(item)">
                    {{ item.concurrentCourseTitle && `${item.concurrentCourseTitle} ` }}
                    {{ item.course.displayedTitle }}
                  </td>
                  <td>{{ `${item.remainingCount}/${item.course.periodCount}` }}</td>
                  <td class="txt-center">
                    <button
                      type="button"
                      class="btn btn-xs"
                      :class="[checkIsSelectedTeacherPeriodItem(item) ? 'bg-primary' : 'btn-success']"
                      :disabled="item.remainingCount === 0"
                      @click="() => item.remainingCount !== 0 && handleClickAssigLesson(item)"
                      :key="`assign-button-${item.lessonConfId}-${item.classId}-${periodItemForAssign?.lessonConfId}`"
                    >
                      배정
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <!-- 수동배정 - 동시수업 배정 모달 -->
    <assign-concurrent-course-dialog
      v-if="isShowAssignConcurrentCourseDialog"
      :assign-info="assignConcurrentCourseInfo"
      :on-submit="handleSubmitAssignConcurrentCourse"
      :on-cancel="handleCancelAssignConcurrentCourse"
    />

    <consecutive-period-select-dialog ref="consecutivePeriodSelectDialog" :consecutive-course-items="consecutiveCourseItems" />

    <!-- 수업 변경(연쇄교환) 모달 -->
    <chain-exchange-lesson-dialog
      v-if="isShowExchangeDialog"
      :chain-exchangeable-result="selectedChainExchangeable"
      :on-cancel="handleCancelExchangeDialog"
      :on-submit="handleSubmitExchangeDialog"
    />

    <!-- 동시수업 (1:1교환 / 연쇄교환) 모달 -->
    <exchange-concurrent-lesson-dialog
      v-if="isShowExchangeConcurrentLessonDialog"
      :concurrent-course-exchange-info="selectedConcurrentCourseExchangeInfo"
      :on-cancel="handleCancelExchangeConcurrentDialog"
      :on-submit="handleSubmitExchangeConcurrentDialog"
    />

    <exchange-consecutive-lesson-dialog
      v-if="isShowExchangeConsecutiveLessonDialog"
      :consecutive-course-exchange-info="selectedConsecutiveCourseExchangeInfo"
      :on-cancel="handleCancelExchangeConsecutiveDialog"
      :on-submit="handleSubmitExchangeConsecutiveDialog"
    />
  </div>
</template>

<script lang="ts" setup>
import { v4 as uuid4 } from 'uuid';
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue';
import {
  ChainExchangeable,
  Class,
  ConsecutiveCourseExchangeInfo,
  ConcurrentCourseExchangeInfo,
  Course,
  Lesson,
  LessonConf,
  LessonMoveInfo,
  PeriodTuple,
  Teacher,
  TimetableConfig,
  TimetableEditState,
  TimetablePeriod,
  ValidStatusType,
  CourseBase,
} from '@/apps/timetable/core/types';
import {
  ConcurrentConfContext,
  ContextKeys,
  LessonConfContext,
  LessonContext,
  SpecialtyRoomConfContext,
  TeacherCourseContext,
  TimetableClassContext,
  TimetableCourseBaseContext,
  TimetableCourseContext,
  TimetableGradeContext,
  TimetableProgressContext,
  TimetableTeacherContext,
} from '@/apps/timetable/contexts';
import Timetable from '@/apps/timetable/core';
import { TimetableDataUtils } from '@/apps/timetable/core/mod/utils';
import { ClassDayStatus, DAILY_SCHEDULE_DEFAULTS, DAYS_OF_WEEK, VALID_STATUS_COUNT_TYPE_TITLE } from '../common/constants';
import { ActivateWeekday, EditorCellLesson } from '../common/types';
import TimetableLessonEditCell from '@/apps/timetable/components/TimetableLessonEditCell.vue';
import ConsecutivePeriodSelectDialog from '@/apps/timetable/components/ConsecutivePeriodSelectDialog.vue';
import ChainExchangeLessonDialog from '@/apps/timetable/components/ChainExchangeLessonDialog.vue';
import ExchangeConcurrentLessonDialog from '@/apps/timetable/components/ExchangeConcurrentLessonDialog.vue';
import ExchangeConsecutiveLessonDialog from '@/apps/timetable/components/ExchangeConsecutiveLessonDialog.vue';
import AssignConcurrentCourseDialog, { AssignConcurrentCourseInfo } from '@/apps/timetable/components/AssignConcurrentCourseDialog.vue';
import { reactive } from 'vue';
import { useDialog } from '../composables/dialog';
import { ArrayUtils, TimetableDisplayUtils } from '../common/utils';
import HelpButton from '@/apps/timetable/components/HelpButton.vue';

interface TeacherPeriodListItem {
  classId: string;
  courseId: string;
  class: Class;
  course: Course;
  remainingCount: number;
  assignedCount: number;
  lessonConfId: string;
  lessonConf: LessonConf;
  concurrentCourseTitle?: string;
  classNames?: string;
  combinedLessonConfs?: LessonConf[];
}

interface AssignPeriodInfo {
  total: number;
  assigned: number;
  remaining: number;
}

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const courseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const concurrentConfContext = inject(ContextKeys.ConcurrentConf) as ConcurrentConfContext;
const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;
const specialtyRoomConfContext = inject(ContextKeys.SpecialtyRoomConf) as SpecialtyRoomConfContext;
const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;

const props = defineProps<{
  selectedTeacher: Teacher | null;
  helpOn?: string;
}>();

const dialog = useDialog();

const title = ref('');
const className = ref('');
const teacherCourseTitle = ref('');
const selectedPeriodListItem = ref<TeacherPeriodListItem | null>(null);
const periodItemForAssign = ref(null as TeacherPeriodListItem | null);
const targetLessons = ref([] as Lesson[]);
const currentEditState = ref(TimetableEditState.None);
const teacherPeriodList = ref([] as TeacherPeriodListItem[]);
const selectedLesson = ref<Lesson | null>(null);
const teacherFreePeriodsCount = ref(0);
const chainExchangeableResults = ref([] as ChainExchangeable[]);
const selectedChainExchangeable = ref(null as ChainExchangeable | null);
const isShowAssignConcurrentCourseDialog = ref(false);
const concurrentCourseExchangeInfos = ref([] as ConcurrentCourseExchangeInfo[]);
const selectedConcurrentCourseExchangeInfo = ref(null as ConcurrentCourseExchangeInfo | null);
const consecutiveCourseExchangeInfos = ref([] as ConsecutiveCourseExchangeInfo[]);
const selectedConsecutiveCourseExchangeInfo = ref(null as ConsecutiveCourseExchangeInfo | null);
const isShowExchangeDialog = ref(false);
const isShowExchangeConcurrentLessonDialog = ref(false);
const isShowExchangeConsecutiveLessonDialog = ref(false);
const consecutiveCourseSelected = ref<string>('');
const consecutiveCourseItems = ref([] as Array<{ value: string; title: string }>);
const consecutivePeriodSelectDialog = ref(null);
const assignConcurrentCourseInfo = ref({} as AssignConcurrentCourseInfo);
const partnerTeachersLessonConfs = ref<LessonConf[]>([]); // 복수 교사인 경우 다른 교사의 수업설정
const selectedValidStatusType = ref<ValidStatusType | null>(null);

// 2025.11.28. notbadlife, 동시-연속 수업의 변경을 막는다
const isConcurrentConsecutive = computed(() => {
  if (!selectedLesson.value) {
    return false;
  }

  const { concurrentCourseId } = selectedLesson.value;
  if(!concurrentCourseId ) {
    return false;
  }

  const concurrentConf = concurrentConfContext.concurrentConfMap[concurrentCourseId];
  if(!concurrentConf || !concurrentConf.consecutivePeriod) {
    return false;
  }

  return true;
});

const assignPeriodInfo = reactive({
  total: 0,
  assigned: 0,
  remaining: 0,
} as AssignPeriodInfo);

const assignTab = ref('lesson-config');
const timetableConfig = computed(() => gradeContext.timetableConfig as TimetableConfig);
const gradeNameMap = computed(() => gradeContext.gradeNameMap);
const classMap = computed(() => classContext.classMap);
const courseMap = computed(() => courseContext.courseMap);
const courseBaseMap = computed(() => courseBaseContext.courseBaseMap);
const teacherMap = computed(() => teacherContext.teacherMap);
const teachers = computed(() => teacherContext.teachers);
const teacherCourseMap = computed(() => teacherCourseContext.teacherCourseMap);
const lessonsByTeacher = computed(() => lessonContext.lessonsByTeacher || ({} as Record<string, Lesson[]>));
const targetedClass = computed(() => periodItemForAssign.value?.class || null);
const targetedGradeNumber = computed(() => targetedClass.value?.grade);
const lessonConfsMapByTeacher = computed(() => lessonConfContext.lessonConfsMapByTeacher);
const lessonConfsMapByConcurrentCourse = computed(() => lessonConfContext.lessonConfsMapByConcurrentCourse);
const specialtyRoomConfs = computed(() => specialtyRoomConfContext.specialtyRoomConfs);
const concurrentConfMap = computed(() => concurrentConfContext.concurrentConfMap);

const lessonConfsMapByClass = computed(() =>
  lessonConfContext.lessonConfs.reduce((map, conf) => {
    if (!map[conf.classId]) {
      map[conf.classId] = [];
    }
    map[conf.classId].push(conf);
    return map;
  }, {} as Record<string, LessonConf[]>)
);

const lessonMap = computed(() =>
  lessonContext.lessons.reduce((acc, lesson) => {
    acc[lesson.lessonId] = lesson;
    return acc;
  }, {} as Record<string, Lesson>)
);

const validateStatusTypeKeys = ref(Object.keys(VALID_STATUS_COUNT_TYPE_TITLE) as ValidStatusType[]);

const teacherStatus = computed(() => {
  if (!teacher.value) {
    return;
  }

  const { teacherId } = teacher.value;
  return Timetable.teacherStatusMap[teacherId];
});

const lessons = computed({
  get: () => {
    return lessonContext.lessons;
  },
  set: (value) => {
    lessonContext.lessons = value;
  },
});

const targetedClassLessons = computed(() => {
  return !targetedClass.value ? {} : lessonByClass.value[targetedClass.value.classId];
});

const lessonByClass = computed(() => {
  return lessons.value.reduce((acc, lesson) => {
    if (!acc[lesson.classId]) {
      acc[lesson.classId] = {} as Record<string, Lesson>;
    }

    const subKey = `${lesson.dayOfWeek}-${lesson.period}`;
    acc[lesson.classId][subKey] = lesson;
    return acc;
  }, {} as Record<string, Record<string, Lesson>>);
});

onMounted(async () => {
  // 초기화 작업
  initTitle();

  teacherPeriodList.value = getCurrentTeacherPeriodList();
  refreshAssignPeriodInfo();
});

const teacher = computed(() => {
  return teacherContext.teacherMap[props.selectedTeacher?.teacherId || ''] || null;
});

const initTitle = () => {
  // 타이틀 초기화
  if (!teacher.value) {
    title.value = '';
    teacherCourseTitle.value = '';
    return;
  }

  title.value = `${teacher.value?.teacherName} 선생님`;

  className.value = '';
  if (teacher.value.classId && classMap.value[teacher.value.classId]) {
    const cls = classMap.value[teacher.value.classId];
    const gradeClassName = TimetableDisplayUtils.formatFullClassName(cls);
    // className.value = `(담임 ${gradeNameMap.value[cls.grade]} ${cls.className})`;
    className.value = `(담임 ${gradeClassName})`;
  }

  const lessonConfsOfTeacher = lessonConfsMapByTeacher.value[teacher.value.teacherId] || [];
  // 실제 시수표에 배정된 과목 기준으로 기준 과목 이름들 추출
  const courseBasesOfLessonConfs = lessonConfsOfTeacher
    .map((lc) => {
      return courseBaseMap.value[courseMap.value[lc.courseId]?.courseBaseId || ''];
    })
    .filter((cb) => cb !== undefined) as CourseBase[];

  teacherCourseTitle.value = TimetableDataUtils.courseBaseNames(courseBasesOfLessonConfs).sort().join(', ');
};

const maxPeriod = computed(() => {
  return gradeContext.timetableConfig.maxPeriod || DAILY_SCHEDULE_DEFAULTS.maxPeriod;
});

const startPeriod = computed(() => {
  return gradeContext.startPeriod;
});

const activatedClassDays = computed(() => {
  return gradeContext.timetableConfig.classDays
    .map((isActive, index) => {
      return {
        dayOfWeek: index,
        title: DAYS_OF_WEEK.find((day) => day.index === index)?.title,
        isActive: isActive === ClassDayStatus.ACTIVATED,
      } as ActivateWeekday;
    })
    .filter((day) => day.isActive);
});

const activatedClassDaysCount = computed(() => {
  return activatedClassDays.value.length;
});

const activatedClassDaysWidthPercent = computed(() => {
  const total = 100;
  const headerWidth = 10;
  const remainWidth = total - headerWidth;
  const dayWidth = Math.floor(remainWidth / activatedClassDaysCount.value);
  // const tail = remainWidth - (dayWidth * activatedClassDaysCount.value);

  return `${dayWidth}%`;
});

const refreshAssignPeriodInfo = () => {
  assignPeriodInfo.total = 0;
  assignPeriodInfo.assigned = 0;
  assignPeriodInfo.remaining = 0;

  teacherPeriodList.value.map((item) => {
    assignPeriodInfo.assigned += item.assignedCount;
    assignPeriodInfo.remaining += item.remainingCount;
  });

  assignPeriodInfo.total = assignPeriodInfo.assigned + assignPeriodInfo.remaining;
};

const reduceCountLessonConfMap = (acc: Record<string, number>, conf: LessonConf) => {
  if (!acc[conf.lessonConfId]) {
    acc[conf.lessonConfId] = 1;
  } else {
    acc[conf.lessonConfId] += 1;
  }

  return acc;
};

const checkIsSelectedTeacherPeriodItem = (item: TeacherPeriodListItem): boolean => {
  if (!periodItemForAssign.value) {
    return false;
  }

  return periodItemForAssign.value.classId === item.classId && periodItemForAssign.value.lessonConfId === item.lessonConfId;
};

const getCurrentTeacherPeriodList = (): TeacherPeriodListItem[] => {
  if (!teacher.value) {
    return [];
  }

  const overview = Timetable.getTeacherOverview(teacher.value.teacherId);

  if (!overview) {
    return [];
  }

  const remainingCountMap = overview.remainingLessonConfs?.reduce(reduceCountLessonConfMap, {} as Record<string, number>);

  const assignedCountMap = overview.assignedLessonConfs.reduce(reduceCountLessonConfMap, {} as Record<string, number>);

  const teacherLessonConfs = lessonConfsMapByTeacher.value[teacher.value.teacherId];
  if (!teacherLessonConfs) {
    return [];
  }

  // 2025.11.25, notbadlife combineConfId가 없는 상태에서 합반을 처리하기 위한 로직 추가 --->
  const concurrentAndCourseSet = new Set<string>();
  const combinedLessonConfsMap = {} as Record<string, LessonConf[]>;
  const separator = '||';
  const unqTeacherLessonConfs = [] as LessonConf[];

  teacherLessonConfs.forEach((conf) => {
    const { combineConfId, concurrentCourseId, courseId } = conf;
    if (!concurrentCourseId) {
      unqTeacherLessonConfs.push(conf);
      return;
    }

    if (!combinedLessonConfsMap[concurrentCourseId]) {
      combinedLessonConfsMap[concurrentCourseId] = [];
    }
    combinedLessonConfsMap[concurrentCourseId].push(conf);

    const key = `${concurrentCourseId}${separator}${courseId}`;
    if (concurrentAndCourseSet.has(key)) {
      return;
    }
    concurrentAndCourseSet.add(key);
    unqTeacherLessonConfs.push(conf);
  });

  // <--- 합반 정식 처리 후 수정 필요
  const result = [...unqTeacherLessonConfs].reduce((acc, conf) => {
    if (!conf.lessonConfId || acc[conf.lessonConfId]) {
      return acc;
    }

    const course = courseMap.value[conf.courseId];

    let concurrentCourseTitle = '';
    if (conf.concurrentCourseId) {
      const concurrentCourse = courseMap.value[conf.concurrentCourseId];
      concurrentCourseTitle = concurrentCourse.displayedTitle;
    }

    const remainingCount = remainingCountMap[conf.lessonConfId] ? remainingCountMap[conf.lessonConfId] : 0;

    const assignedCount = (assignedCountMap[conf.lessonConfId] ? assignedCountMap[conf.lessonConfId] : 0) as number;

    const combinedLessonConfs = (conf.concurrentCourseId && combinedLessonConfsMap[conf.concurrentCourseId]) || [];
    const classNames =
      combinedLessonConfs.length > 1
        ? combinedLessonConfs
            .map((lc) => classMap.value[lc.classId])
            .sort((a, b) => {
              if (a.grade !== b.grade) {
                return a.grade - b.grade;
              }
              return a.classNumber - b.classNumber;
            })
            .map((cls) => TimetableDisplayUtils.formatFullClassName(cls))
            .join(', ')
        : TimetableDisplayUtils.formatFullClassName(classMap.value[conf.classId]);

    acc[conf.lessonConfId] = {
      classId: conf.classId,
      courseId: conf.courseId,
      lessonConfId: conf.lessonConfId,
      class: classMap.value[conf.classId],
      course,
      lessonConf: conf,
      remainingCount,
      assignedCount,
      concurrentCourseTitle,
      classNames,
      combinedLessonConfs: combinedLessonConfs.length > 1 ? combinedLessonConfs : undefined,
    };

    return acc;
  }, {} as Record<string, TeacherPeriodListItem>);

  return Object.values(result).sort(sortTeacherPeriodList);
};

const sortTeacherPeriodList = (a: TeacherPeriodListItem, b: TeacherPeriodListItem) => {
  // sort by class.grade, class.classNum, course.displayedTitle
  const classA = a.class;
  const classB = b.class;

  if (classA.grade !== classB.grade) {
    return classA.grade - classB.grade;
  }

  if (classA.classNumber !== classB.classNumber) {
    return classA.classNumber - classB.classNumber;
  }

  const courseA = a.course;
  const courseB = b.course;

  return courseA.displayedTitle.localeCompare(courseB.displayedTitle);
};

const adjustDisplayedPeriod = (period: number) => {
  return period + (startPeriod.value - 1);
};

const periodTitle = (dayOfWeek: number, period: number) => {
  return `${DAYS_OF_WEEK.find((d) => d.index === dayOfWeek)?.title}${adjustDisplayedPeriod(period)}`;  
};

const detachTeacherFreePeriodsByDay = async (dayOfWeek: number) => {
  const freePeriodsToDetach = (teacher.value.freePeriods || []).filter((p) => p.dayOfWeek === dayOfWeek);
  if (freePeriodsToDetach.length !== 0) {
    freePeriodsToDetach.forEach((p) => Timetable.removeTeacherFreePeriod(teacher.value.teacherId, p.dayOfWeek, p.period));
    await teacherContext.updateFreePeriods(teacher.value);
  }
};

const detachTeacherFreePeriodsByPeriod = async (period: number) => {
  const freePeriodsToDetach = (teacher.value.freePeriods || []).filter((p) => p.period === period);
  if (freePeriodsToDetach.length !== 0) {
    freePeriodsToDetach.forEach((p) => Timetable.removeTeacherFreePeriod(teacher.value.teacherId, p.dayOfWeek, p.period));
    await teacherContext.updateFreePeriods(teacher.value);
  }
};

const getHistoryMemoByPeriods = (periods: { dayOfWeek: number; period: number }[]) => {
  // {#선생님명} 선생님 수업 빼기 (수1)
  const freePeriodsText = periods
  .map((p) => periodTitle(p.dayOfWeek, p.period))
    // .map((p) => `${DAYS_OF_WEEK.find((d) => d.index === p.dayOfWeek)?.title}${adjustDisplayedPeriod(p.period)}`)
    .join(', ');
  const { teacherName } = teacher.value;

  return `(자동) [${teacherName}] 선생님 수업 빼기 (${freePeriodsText})`;
};

const showAutoSaveToast = () => {
  dialog.toast('변경사항이 자동 저장 되었습니다.');
};

const attachTeacherFreePeriods = async (periods: { dayOfWeek: number; period: number }[]) => {
  periods.forEach((p) => Timetable.addTeacherFreePeriod(teacher.value.teacherId, p.dayOfWeek, p.period));

  const historyMemo = getHistoryMemoByPeriods(periods);
  await teacherContext.updateFreePeriods(teacher.value, historyMemo);

  showAutoSaveToast();
};

const handleClickOnClassDay = async (day: ActivateWeekday) => {
  if (!teacher.value || !day.isActive) return;

  const overview = Timetable.getTeacherOverview(teacher.value.teacherId);
  const periods = overview.remainingLessonPeriods
    .filter(([dayOfWeek, _]) => dayOfWeek === day.dayOfWeek)
    .map(([dayOfWeek, period]) => ({ dayOfWeek, period }));

  if (periods.length === 0) {
    await detachTeacherFreePeriodsByDay(day.dayOfWeek);
  } else if (!periods.some((p) => getLessonByTeacherAndPeriod(p.dayOfWeek, p.period))) {
    await attachTeacherFreePeriods(periods);
  }
};

const handleClickOnPeriod = async (selectedPeriod: number) => {
  if (!teacher.value) return;

  const overview = Timetable.getTeacherOverview(teacher.value.teacherId);
  const periods = overview.remainingLessonPeriods
    .filter(([_, period]) => period === selectedPeriod)
    .map(([dayOfWeek, period]) => ({ dayOfWeek, period }));

  if (periods.length === 0) {
    await detachTeacherFreePeriodsByPeriod(selectedPeriod);
  } else if (!periods.some((p) => getLessonByTeacherAndPeriod(p.dayOfWeek, p.period))) {
    await attachTeacherFreePeriods(periods);
  }
};

const getEditorCellLessonByPeriod = (dayOfWeek: number, period: number): EditorCellLesson => {
  // 교사 담당 학급 학년의 수업 없음 시간이 있는 경우
  if(checkSelectedTeacherGradeFreePeriods(dayOfWeek, period)) {
    return {
      isGradeFreePeriod: true,
    };
  }

  // 교사 수업 빼기 시간이 있는 경우
  if (checkSelectedTeacherFreeTime(dayOfWeek, period)) {
    return {
      isFreePeriod: true,
    };
  }

  // 교사의 수업이 있는 경우
  const teacherLesson = getLessonByTeacherAndPeriod(dayOfWeek, period);
  if (teacherLesson) {
    const editorCellLesson = { lesson: teacherLesson } as EditorCellLesson;

    if (selectedPeriodListItem.value) {
      // 교사의 배정 아이템이 선택된 경우
      const { courseId: selectedCourseId, classId: selectedClassId } = selectedPeriodListItem.value;

      const { courseId: teacherCourseId, classId: teacherClassId } = teacherLesson;

      const isSelectedLessonConf = selectedCourseId === teacherCourseId && selectedClassId === teacherClassId;
      if (isSelectedLessonConf) {
        editorCellLesson.isHighlighted = true;
      }
    }

    if (selectedValidStatusType.value) {
      const lessonValidStatuses = Timetable.timetableStatusLessonIds[selectedValidStatusType.value] || [];
      lessonValidStatuses.has(teacherLesson.lessonId) && (editorCellLesson.isHighlighted = true);
    }

    if (currentEditState.value === TimetableEditState.MoveLesson) {
      // 선택된 셀 이외의 교사 수업은 읽기 전용으로 설정
      editorCellLesson.isReadOnly = selectedLesson.value?.lessonId !== teacherLesson.lessonId;
    }

    return editorCellLesson;
  }

  // 맞교환 수업이 있는 경우
  const targetedLesson = oneToOneExchangeableLessonWithPeriod(dayOfWeek, period);
  if (targetedLesson) {
    return { lesson: targetedLesson, isOneToOneExchangeable: true };
  }

  // 연쇄이동 수업이 있는 경우
  const chainExchangeable = chainExchangeableWithPeriod(dayOfWeek, period);
  if (chainExchangeable) {
    return {
      lesson: chainExchangeable.targetLesson,
      isChainExchangeable: true,
      chainExchangeableCount: chainExchangeable.paths.length,
    };
  }

  const concurrentExchangeable = concurrentExchangeableWithPeriod(dayOfWeek, period);
  if (!isConcurrentConsecutive.value && concurrentExchangeable) {
    return {
      lesson: concurrentExchangeable.lesson,
      isConcurrentCourseExchangeable: true,
    };
  }

  const consecutiveExchangeable = consecutiveExchangeableWithPeriod(dayOfWeek, period);
  if (!isConcurrentConsecutive.value && consecutiveExchangeable) {
    const isHead = consecutiveExchangeable.periods[0] === period;
    const isTail = consecutiveExchangeable.periods[0] !== period;
    // const lesson = consecutiveExchangeable.sourceLessons && consecutiveExchangeable.sourceLessons[0];
    // Head가 아니면 모두 Tail로 간주
    return {
      // lesson,
      isConsecutiveExchangeableHead: isHead,
      isConsecutiveExchangeableTail: isTail,
    };
  }

  // 수업 배정 상태이고, 선택된 학급의 수업이 있는 경우
  const classLesson = getLessonByClassAndPeriod(dayOfWeek, period);
  if (classLesson) {
    return { lesson: classLesson, isReadOnly: true } as EditorCellLesson;
  }

  // 동시 수업에 속한 교사의 수업이 있는 경우 확인
  const lessonsOfConcurrentTeachers = getLessonByConcurrentCourse(dayOfWeek, period);
  if (lessonsOfConcurrentTeachers.length > 0) {
    // console.log('동시수업 교사의 수업 >>>>>', dayOfWeek, period, lessonsOfConcurrentTeachers);
    return {
      lesson: lessonsOfConcurrentTeachers[0],
      isConcurrentTeacherLesson: true,
      isReadOnly: true,
    };
  }

  // 복수 교사의 다른 수업이 있는 경우
  const lessonsOfPartnerTeachers = getLessonByPartnerTeachers(dayOfWeek, period);
  if (lessonsOfPartnerTeachers.length > 0) {
    // console.log('복수 교사 다른 수업 >>>>>', dayOfWeek, period, lessonsOfPartnerTeachers);
    return {
      lesson: lessonsOfPartnerTeachers[0],
      isPartnerTeacherLesson: true,
      isReadOnly: true,
    };
  }

  const isFullSpecialtyRoom = getIsFullSpecialtyRoomPeriod(dayOfWeek, period);
  if (isFullSpecialtyRoom) {
    const { specialtyRoomId } = periodItemForAssign.value?.lessonConf || {};
    return {
      lesson: {
        specialtyRoomId,
      } as Lesson,
      isFullSpecialtyRoom: true,
      isReadOnly: true,
    };
  }

  // 학년 수업 없음
  if (checkGradeFreePeriod(dayOfWeek, period)) {
    return {
      isGradeFreePeriod: true,
    };
  }

  return {};
};

const freePeriodsOfTargetedGrade = computed((): TimetablePeriod[] | undefined => {
  // const grades = Timetable.grades;
  const { grades } = timetableConfig.value;

  if (!targetedGradeNumber.value || targetedGradeNumber.value > grades.length) {
    return [];
  }

  const grade = grades[targetedGradeNumber.value - 1];
  if (!grade.timetableStructure || !grade.timetableStructure.freePeriods) {
    return [];
  }

  return grade.timetableStructure.freePeriods;
});

const checkLessonByTargetClassAndPeriod = (dayOfWeek: number, period: number) => {
  if (currentEditState.value !== TimetableEditState.AssignLesson) {
    return undefined;
  }
  const subKey = `${dayOfWeek}-${period}`;
  return targetedClassLessons.value?.[subKey] !== undefined;  
};

const checkLessonByClassAndPeriod = (classId: string, dayOfWeek: number, period: number): boolean => {
  if (currentEditState.value !== TimetableEditState.AssignLesson) {
    return false;
  }

  const lessonsOfClass = lessonByClass.value[classId];
  if (!lessonsOfClass) {
    return false;
  }

  const subKey = `${dayOfWeek}-${period}`;
  return lessonsOfClass[subKey] !== undefined;
};

const checkTeacherFreeTime = (teacherId: string, dayOfWeek: number, period: number): boolean => {
  const targetTeacher = teacherContext.teacherMap[teacherId];
  if (!targetTeacher || !targetTeacher.freePeriods) {
    return false;
  }

  return targetTeacher.freePeriods.some((freePeriod) => freePeriod.dayOfWeek === dayOfWeek && freePeriod.period === period);
};

const checkSelectedTeacherFreeTime = (dayOfWeek: number, period: number): boolean => {
  if (!teacher.value || !teacher.value.freePeriods) {
    return false;
  }

  const isFreeTime = teacher.value.freePeriods.some((freePeriod) => freePeriod.dayOfWeek === dayOfWeek && freePeriod.period === period);

  if (isFreeTime) {
    return true;
  }

  if (partnerTeachersLessonConfs.value.length === 0) {
    return false;
  }

  // 복수 교사인 경우 다른 교사의 교사 수업 빼기 시간도 확인
  const partnerTeachers = partnerTeachersLessonConfs.value.map((conf) => teacherContext.teacherMap[conf.teacherId]);

  return partnerTeachers.some((partnerTeacher) => {
    if (!partnerTeacher || !partnerTeacher.freePeriods) {
      return false;
    }
    return partnerTeacher.freePeriods.some((freePeriod) => freePeriod.dayOfWeek === dayOfWeek && freePeriod.period === period);
  });
};

const checkSelectedTeacherGradeFreePeriods = (dayOfWeek: number, period: number): boolean => {
  if (!teacher.value || !teacher.value.gradeFreePeriods) {
    return false;
  }

  const isFreeTime = teacher.value.gradeFreePeriods.some((freePeriod) => freePeriod.dayOfWeek === dayOfWeek && freePeriod.period === period);

  if (isFreeTime) {
    return true;
  }

  if (partnerTeachersLessonConfs.value.length === 0) {
    return false;
  }

  // 복수 교사인 경우 다른 교사의 교사 수업 빼기 시간도 확인
  const partnerTeachers = partnerTeachersLessonConfs.value.map((conf) => teacherContext.teacherMap[conf.teacherId]);

  return partnerTeachers.some((partnerTeacher) => {
    if (!partnerTeacher || !partnerTeacher.gradeFreePeriods) {
      return false;
    }
    return partnerTeacher.gradeFreePeriods.some((freePeriod) => freePeriod.dayOfWeek === dayOfWeek && freePeriod.period === period);
  });
};


const checkGradeFreePeriod = (dayOfWeek: number, period: number) => {
  if (!freePeriodsOfTargetedGrade.value) {
    return false;
  }

  return freePeriodsOfTargetedGrade.value.some((freePeriod) => freePeriod.dayOfWeek === dayOfWeek && freePeriod.period === period);
};

const checkSpecialtyRoomFullPeriod = (specialtyRoomId: string, dayOfWeek: number, period: number) => {
  if (!specialtyRoomId) {
    return false;
  }
  return Timetable.isFullSpecialtyRoomPeriod(specialtyRoomId, dayOfWeek, period);
};

const oneToOneExchangeableLessonWithPeriod = (dayOfWeek: number, period: number) => {
  return targetLessons.value.find((lesson) => lesson.dayOfWeek === dayOfWeek && lesson.period === period);
};

const chainExchangeableWithPeriod = (dayOfWeek: number, period: number) => {
  const res = chainExchangeableResults.value.find((result) => {
    const { targetLesson } = result;
    return targetLesson.dayOfWeek === dayOfWeek && targetLesson.period === period;
  });

  return res;
};

const concurrentExchangeableWithPeriod = (dayOfWeek: number, period: number) => {
  return concurrentCourseExchangeInfos.value.find((result) => {
    return result.dayOfWeek === dayOfWeek && result.period === period;
  });
};

const consecutiveExchangeableWithPeriod = (dayOfWeek: number, period: number) => {
  // 연속 수업 특성상 대상 교시의 tail이 다른 대상의 head과 겹칠 수 있으므로
  // head를 우선 리턴한다.
  const isHeadInfo = consecutiveCourseExchangeInfos.value.find((result) => {
    return result.dayOfWeek === dayOfWeek && result.periods[0] == period;
  });

  if (isHeadInfo) {
    return isHeadInfo;
  }

  return consecutiveCourseExchangeInfos.value.find((result) => {
    return result.dayOfWeek === dayOfWeek && result.periods.includes(period);
  });
};

const getLessonByTeacherAndPeriod = (dayOfWeek: number, period: number) => {
  if (!teacher.value?.teacherId) {
    return undefined;
  }

  const lessons = lessonsByTeacher.value[teacher.value.teacherId];
  if (!lessons) {
    return undefined;
  }

  const periodLessons = lessons.filter((lesson) => lesson.dayOfWeek === dayOfWeek && lesson.period === period);

  const lesson = periodLessons.length > 0 ? periodLessons[0] : undefined;

  if (!lesson) {
    return undefined;
  }

  if (periodLessons.length > 1) {
    lesson.lessonClasses = periodLessons.map((l) => l.classId) || [];
  }

  return lesson;
};

const checkLessonByTeacherAndPeriod = (teacherId: string, dayOfWeek: number, period: number): boolean => {
  return (lessonsByTeacher.value[teacherId] || []).some((l) => l.dayOfWeek === dayOfWeek && l.period === period);
};


const getLessonByClassAndPeriod = (dayOfWeek: number, period: number) => {
  if (currentEditState.value !== TimetableEditState.AssignLesson) {
    return undefined;
  }

  const subKey = `${dayOfWeek}-${period}`;

  const lesson = targetedClassLessons.value?.[subKey];
  if (!lesson) {
    return undefined;
  }

  const course = courseMap.value[lesson.courseId];
  const { displayedTitle } = course || ({} as Course);

  return {
    ...lesson,
    courseName: displayedTitle,
  } as Lesson;
};

const getLessonByConcurrentCourse = (dayOfWeek: number, period: number) => {
  const lessonConf = periodItemForAssign.value?.lessonConf;

  if (!lessonConf?.concurrentCourseId) {
    return [];
  }

  // 동시수업에 속한 교사들의 id
  const concurrentCourseId = lessonConf.concurrentCourseId;
  const teacherIds = lessonConfsMapByConcurrentCourse.value[concurrentCourseId].map((conf) => conf.teacherId);

  const lessonsOfTeachers = lessonContext.lessons.filter((lesson) => {
    return (
      lesson.dayOfWeek === dayOfWeek && lesson.period === period && lesson.lessonTeachers?.some((teacher) => teacherIds.includes(teacher.teacherId))
    );
  });

  return lessonsOfTeachers;
};

const getLessonByPartnerTeachers = (dayOfWeek: number, period: number) => {
  if (partnerTeachersLessonConfs.value.length === 0) {
    return [];
  }

  const partnerTeacherIds = partnerTeachersLessonConfs.value.map((conf) => conf.teacherId);

  const lessonsOfTeachers = lessonContext.lessons.filter((lesson) => {
    return (
      lesson.dayOfWeek === dayOfWeek &&
      lesson.period === period &&
      lesson.lessonTeachers?.some((teacher) => partnerTeacherIds.includes(teacher.teacherId))
    );
  });

  return lessonsOfTeachers;
};

const getIsFullSpecialtyRoomPeriod = (dayOfWeek: number, period: number): boolean => {
  const { specialtyRoomId } = periodItemForAssign.value?.lessonConf || {};

  if (!specialtyRoomId) {
    return false;
  }

  return Timetable.isFullSpecialtyRoomPeriod(specialtyRoomId, dayOfWeek, period);
};

// 수업 목록이 갱신된 경우 시간표를 다시 그리기 위해 key에 사용
const lessonsLength = computed(() => lessonContext.lessons.length || 0);
const timetableUpdatedAt = computed(() => lessonContext.updatedAt || 0);

const handleClickEditorCell = async (dayOfWeek: number, period: number, editorCellLesson?: EditorCellLesson) => {
  resetPeriodListItem();
  resetValidStatusType();

  // 교사 수업 빼기
  if (currentEditState.value === TimetableEditState.None && !editorCellLesson?.lesson) {
    // 교사 수업 빼기: 수업이 없는 시간만 가능
    addTeacherFreePeriod(dayOfWeek, period);
    return;
  }

  // 교사 수업 배정
  if (currentEditState.value === TimetableEditState.AssignLesson && periodItemForAssign.value) {
    assignTeacherPeriodItemManually(dayOfWeek, period);
    return;
  }

  // 이동할 수업 선택
  if (currentEditState.value === TimetableEditState.None && editorCellLesson) {
    processSelectLesson(editorCellLesson);
    return;
  }

  // 이동을 위한 대상 수업 선택
  if (currentEditState.value === TimetableEditState.MoveLesson) {
    processExchange(dayOfWeek, period, editorCellLesson);
    return;
  }
};

const processSelectLesson = (editorCellLesson: EditorCellLesson) => {
  if (!editorCellLesson || !editorCellLesson.lesson) {
    selectedLesson.value && resetSelectedAndTargeted();
    return;
  }

  if (!TimetableDataUtils.checkSameLessons(selectedLesson.value, editorCellLesson.lesson)) {
    // 1:1, 연쇄 교환 대상 수업 초기화
    targetLessons.value = [];
    chainExchangeableResults.value = [];

    // 동시 수업 교환 대상 수업 초기화
    concurrentCourseExchangeInfos.value = [];

    // 연속 수업 교환 대상 수업 초기화
    consecutiveCourseExchangeInfos.value = [];
  }

  const { lesson } = editorCellLesson;

  // 이동 상태 변경
  currentEditState.value = TimetableEditState.MoveLesson;
  selectedLesson.value = lesson;

  if (lesson.concurrentCourseId) {
    // 동시 수업인 경우 처리, 동시 수업이면서 연속 수업인 경우도 있어 우선 처리
    findConcurrentExchangeableLesson(lesson);
    return;
  }

  if (lesson.consecutiveGroupId) {
    findConsecutiveExchangeableLesson(lesson);
    return;
  }

  // 수업 이동 가능한 대상 수업 찾기
  targetLessons.value = Timetable.findOneToOneExchangeableLessons(lesson);
  chainExchangeableResults.value = Timetable.findChainExchangeableLessons(lesson);
};

const findConcurrentExchangeableLesson = async (lesson: Lesson): Promise<void> => {
  // const result = Timetable.findChainExchangeableLessons(lesson);
  const result = Timetable.findConcurrentCourseExchangeableLessons(lesson);
  concurrentCourseExchangeInfos.value =
    result?.map((r) => {
      // 선택된 lesson과 동일한 lesson의 targetLesson을 설정
      const { pathMap } = r;
      if (pathMap && pathMap[lesson.lessonId]) {
        const path = pathMap[lesson.lessonId];
        const targetLesson = path[path.length - 1];
        r.lesson = targetLesson;
      }

      return r;
    }) || [];

  return;
};

interface ConseuctiveSeeker {
  id: string;
  subId: string;
  period: PeriodTuple;
}

const findConsecutiveExchangeableLesson = async (lesson: Lesson): Promise<void> => {
  // 연속 수업 그룹의 수업을 찾기
  const consecutiveGroupLessons = lessons.value
    .filter((l) => l.consecutiveGroupId === lesson.consecutiveGroupId)
    .sort((a, b) => {
      return a.period - b.period;
    });

  const consecutivePeriod = consecutiveGroupLessons.length;

  // 2025.11.07: 연속 수업 맞교환만 구현 - 연쇄 이동은 보류
  const findedOneToOneLessons = {} as Record<string, Lesson[]>;
  consecutiveGroupLessons.forEach((sourceLesson) => {
    const exchangeableLessons = Timetable.findOneToOneExchangeableLessons(sourceLesson);
    findedOneToOneLessons[sourceLesson.lessonId] = exchangeableLessons;
  });

  const oneToOneSeekers = Object.keys(findedOneToOneLessons).map((key) => {
    return findedOneToOneLessons[key].map((l) => {
      return {
        id: key,
        subId: l.lessonId,
        period: [l.dayOfWeek, l.period] as PeriodTuple,
      } as ConseuctiveSeeker;
    });
  });

  const nonOverlappingChains = findNonOverlappingChains(oneToOneSeekers).filter((chain) => chain.length === consecutivePeriod);

  consecutiveCourseExchangeInfos.value = [];

  nonOverlappingChains.forEach((chain) => {
    const dayOfWeek = chain[0].period[0];
    const periods = chain.map((c) => c.period[1]);
    const sourceLessons = [] as Lesson[];

    const lessonMoveInfoList = chain
      .map((c) => {
        if (!lessonMap.value[c.id]) {
          return null;
        }

        const sourceLesson = lessonMap.value[c.id];
        sourceLessons.push(sourceLesson);

        // MoveInfo: 대상 수업의 이동이기 때문에 source와 target이 반대
        return {
          sourceLesson: lessonMap.value[c.subId],
          targetPeriod: { dayOfWeek: sourceLesson.dayOfWeek, period: sourceLesson.period } as TimetablePeriod,
        } as LessonMoveInfo;
      })
      .filter((info) => info !== null) as LessonMoveInfo[];

    const prevInfo = consecutiveCourseExchangeInfos.value.find((info) => {
      return info.dayOfWeek === dayOfWeek && info.periods.every((p) => periods.includes(p));
    });

    if (prevInfo) {
      prevInfo.targetLessonMoveInfos?.push(lessonMoveInfoList);
      return;
    }

    consecutiveCourseExchangeInfos.value.push({
      dayOfWeek,
      periods,
      sourceLessons,
      targetLessonMoveInfos: [lessonMoveInfoList],
    } as ConsecutiveCourseExchangeInfo);
  });

  /* 
  // 연속 수업 연쇄 이동 기능은 보류 2025.11.07.
  // - 검색 로직은 남겨둠
  // - 필요시 nonOverlappingChainExchanges에서 경로 추출 이후 처리

  const findedChainExchangeable = {} as Record<string, ChainExchangeable[]>;
  consecutiveGroupLessons.forEach((sourceLesson) => {
    const chainExchangeableLessons = Timetable.findChainExchangeableLessons(sourceLesson);
    findedChainExchangeable[sourceLesson.lessonId] = chainExchangeableLessons;
  });

  console.log('<연속> 연쇄 이동 가능', findedChainExchangeable);
  const chainSeekers = Object.keys(findedChainExchangeable).map((key) => {
    return findedChainExchangeable[key].map((chain) => {
      return {
        id: key,
        subId: chain.targetLesson.lessonId,
        period: [chain.targetLesson.dayOfWeek, chain.targetLesson.period] as PeriodTuple,
      } as ConseuctiveSeeker;
    });
  });

  console.log('<연속> 연쇄 이동 가능 탐색자', chainSeekers);
  const nonOverlappingChainExchanges = findNonOverlappingChains(chainSeekers);
  console.log('<연속> 연쇄 이동 가능 조합', nonOverlappingChainExchanges);
  */

  return;
};

const findNonOverlappingChains = (groups: ConseuctiveSeeker[][]): ConseuctiveSeeker[][] => {
  const results: ConseuctiveSeeker[][] = [];

  // 모든 그룹을 flat하여 period[0] 기준으로 묶기
  const all = groups.flat();
  const byStart = new Map<number, ConseuctiveSeeker[]>();
  for (const obj of all) {
    const [start] = obj.period;
    if (!byStart.has(start)) byStart.set(start, []);
    byStart.get(start)!.push(obj);
  }

  // 각 start 그룹별로 탐색
  for (const [start, list] of byStart.entries()) {
    // period[1] 기준 정렬
    const sorted = [...list].sort((a, b) => a.period[1] - b.period[1]);

    // DFS로 연속된 조합 탐색
    const dfs = (chain: ConseuctiveSeeker[], remaining: ConseuctiveSeeker[]) => {
      const last = chain[chain.length - 1];
      const nexts = remaining.filter((obj) => obj.period[0] === start && obj.period[1] === last.period[1] + 1);

      if (nexts.length === 0) {
        if (chain.length > 1) {
          // results.push(chain.map((c) => c.id));
          results.push([...chain]);
        }
        return;
      }

      for (const next of nexts) {
        dfs(
          [...chain, next],
          remaining.filter((r) => r.id !== next.id)
        );
      }
    };

    // 모든 시작점을 기준으로 DFS 시작
    for (const obj of sorted) {
      dfs(
        [obj],
        sorted.filter((o) => o.id !== obj.id)
      );
    }
  }

  return results;
};

const processExchange = (dayOfWeek: number, period: number, editorCellLesson?: EditorCellLesson) => {
  // 편집 상태 및 파라미터 확인
  if (currentEditState.value !== TimetableEditState.MoveLesson || !selectedLesson.value || !editorCellLesson) {
    return;
  }

  // 연속 수업의 맞교환 수업 선택: 연속 수업은 lesson을 셀데이터에 전달 안하기에 우선 처리
  if (editorCellLesson.isConsecutiveExchangeableHead) {
    selectedConsecutiveCourseExchangeInfo.value =
      consecutiveCourseExchangeInfos.value.find((result) => {
        return result.dayOfWeek === dayOfWeek && result.periods[0] === period;
      }) || null;
    isShowExchangeConsecutiveLessonDialog.value = true;
    return;
  }

  // 빈 셀을 선택했거나, 이동하려는 수업을 다시 선택한 경우: 리셋
  if (!editorCellLesson.lesson || TimetableDataUtils.checkSameLessons(selectedLesson.value, editorCellLesson.lesson)) {
    resetSelectedAndTargeted();
    resetEditState();
    return;
  }

  // 이동하려는 수업을 다른 수업으로 선택한 경우: 다시 선택
  if (checkLessonOfSelectedTeacher(editorCellLesson.lesson)) {
    processSelectLesson(editorCellLesson);
    return;
  }

  // 동시 수업의 맞교환 수업 선택
  if (editorCellLesson.isConcurrentCourseExchangeable && editorCellLesson.lesson) {
    selectedConcurrentCourseExchangeInfo.value =
      concurrentCourseExchangeInfos.value.find((result) => {
        return result.dayOfWeek === dayOfWeek && result.period === period;
      }) || null;

    isShowExchangeConcurrentLessonDialog.value = true;
    return;
  }

  // 개별 수업의 맞교환 수업 선택
  if (editorCellLesson.isOneToOneExchangeable && editorCellLesson.lesson) {
    // 연쇄 교환 형식으로 변경
    selectedChainExchangeable.value = {
      targetLesson: editorCellLesson.lesson,
      paths: [[selectedLesson.value, editorCellLesson.lesson]],
    } as ChainExchangeable;

    if (selectedChainExchangeable.value) {
      isShowExchangeDialog.value = true;
    }

    return;
  }

  // 연쇄이동 수업 선택
  if (editorCellLesson.isChainExchangeable) {
    selectedChainExchangeable.value =
      chainExchangeableResults.value.find((result) => TimetableDataUtils.checkSameLessons(result.targetLesson, editorCellLesson.lesson)) || null;

    if (selectedChainExchangeable.value) {
      isShowExchangeDialog.value = true;
    }

    return;
  }
};

const handleCancelExchangeDialog = () => {
  isShowExchangeDialog.value = false;
};

const handleSubmitExchangeDialog = (selectedPathIndex: number) => {
  processChainExchange(selectedPathIndex);
  isShowExchangeDialog.value = false;
};

const processChainExchange = async (pathIndex: number) => {
  // 연쇄이동 조건 검사
  if (!selectedChainExchangeable.value) {
    return;
  }

  const { paths, targetLesson } = selectedChainExchangeable.value;
  if (pathIndex < 0 || pathIndex >= paths.length) {
    return;
  }

  // 이동 전
  const startLesson = paths[pathIndex][0];
  const startPeriod = periodTitle(startLesson.dayOfWeek, startLesson.period);

  // 이동 수행
  Timetable.chainExchangeLessons(paths[pathIndex]);

  // 이동 후
  const endLesson = paths[pathIndex][0];
  const endPeriod = periodTitle(endLesson.dayOfWeek, endLesson.period);

  const teacherNames = endLesson.lessonTeachers?.map((t) => teacherMap.value[t.teacherId]?.teacherName || '').filter((t) => t) || [];
  const historyMemo = `(자동) [${teacherNames?.join(', ')}] 선생님 시간표 이동 (${startPeriod} → ${endPeriod})`;

  await lessonContext.saveLessonsWithReplace(Timetable.currentAssignedLessons, historyMemo);
  await refreshLessonsWithContext();

  resetEditState();
  resetRefsForEdit();

  showAutoSaveToast();
};

const handleCancelExchangeConcurrentDialog = () => {
  isShowExchangeConcurrentLessonDialog.value = false;
};

const handleSubmitExchangeConcurrentDialog = async () => {
  await processExchangeConcurrentCourse();

  isShowExchangeConcurrentLessonDialog.value = false;
};

const handleCancelExchangeConsecutiveDialog = () => {
  isShowExchangeConsecutiveLessonDialog.value = false;
};

const handleSubmitExchangeConsecutiveDialog = async (selectedIndex: number) => {
  await processExchangeConsecutiveCourse(selectedIndex);

  isShowExchangeConsecutiveLessonDialog.value = false;
};

const processExchangeConcurrentCourse = async () => {
  if (!selectedConcurrentCourseExchangeInfo.value) {
    return;
  }

  // 작업 내역 메모 생성: 동시수업 (2A) 시간표 이동 (월1 → 금3)
  const { dayOfWeek: endDayOfWeek, period: endPeriod, pathMap } = selectedConcurrentCourseExchangeInfo.value;
  const pathMapFirstLessons = pathMap ? Object.values(pathMap).map((p) => p[0]) : [];
  const startLesson = pathMapFirstLessons[0];

  const courseName = courseMap.value[startLesson.concurrentCourseId || '']?.displayedTitle || '';

  const startPeriodTitle = periodTitle(startLesson.dayOfWeek, startLesson.period);
  const endPeriodTitle = periodTitle(endDayOfWeek, endPeriod);
  // const startPeriodTitle = `${DAYS_OF_WEEK[startLesson.dayOfWeek - 1].title}${startLesson.period}`;
  // const endPeriodTitle = `${DAYS_OF_WEEK[endDayOfWeek - 1].title}${endPeriod}`;

  const resultLessons = Timetable.exchangeConcurrentCourseLessons(selectedConcurrentCourseExchangeInfo.value);

  if (!resultLessons || resultLessons.length === 0) {
    console.error('동시 수업 교환 실패');
    return;
  }
  
  const historyMemo = `(자동) 동시수업 (${courseName}) 시간표 이동 (${startPeriodTitle} → ${endPeriodTitle})`;
  await lessonContext.saveLessonsWithReplace(Timetable.currentAssignedLessons, historyMemo);
  await refreshLessonsWithContext();

  resetEditState();
  resetRefsForEdit();

  showAutoSaveToast();
};

const refreshLessonsWithCurrentAssigned = async () => {
  // const currentLessons = Timetable.currentAssignedLessons;
  const currentLessons = Timetable.currentAssignedLessonsWithRefreshValidator();
  lessons.value = currentLessons;
  teacherPeriodList.value = getCurrentTeacherPeriodList();
};

const processExchangeConsecutiveCourse = async (selectedIndex: number) => {
  if (!selectedConsecutiveCourseExchangeInfo.value) {
    return;
  }

  const { dayOfWeek, periods, sourceLessons, targetLessonMoveInfos } = selectedConsecutiveCourseExchangeInfo.value;
  if (!sourceLessons || !targetLessonMoveInfos || selectedIndex < 0 || selectedIndex >= targetLessonMoveInfos.length) {
    console.error('연속 수업 교환 실패');
    return;
  }

  const moveInfo = targetLessonMoveInfos[selectedIndex];
  if (!moveInfo || moveInfo.length !== sourceLessons.length || !moveInfo[0].targetPeriod?.dayOfWeek) {
    console.error('연속 수업 교환 실패 - 이동 정보 불일치');
    return;
  }

  const exchangeInfo = {
    dayOfWeek,
    periods,
    sourceLessons,
    targetLessonMoveInfos: [moveInfo],
  } as ConsecutiveCourseExchangeInfo;

  // console.log('선택된 이동 정보 >>> ', exchangeInfo);

  moveInfo.forEach((info) => {
    if (!info.sourceLesson || !info.targetPeriod) {
      return;
    }
    // console.log(`-> ${info.sourceLesson.courseName} ${DAYS_OF_WEEK[info.sourceLesson.dayOfWeek-1].title}${info.sourceLesson.period}  =>  ${DAYS_OF_WEEK[info.targetPeriod.dayOfWeek-1].title}${info.targetPeriod.period}`);
  });

  // 이동전에 작업 내역 메모 생성: 연속수업 (2A) 시간표 이동 (월1~2 → 금3~4)
  const sortedSrcPeriods = moveInfo
    .map(({ targetPeriod }) => targetPeriod?.period || null)
    .filter((p) => p !== null)
    .sort((a, b) => a - b); // 대상 수업의 타겟 시수가 이동하려는 수업의 시수

  const srcDayOfWeek = sourceLessons[0].dayOfWeek || dayOfWeek;
  const srcStartPeriod = sortedSrcPeriods[0] as number;
  const srcEndPeriod = sortedSrcPeriods[sortedSrcPeriods.length - 1] as number;
  const srcPeriodsText = `${periodTitle(srcDayOfWeek, srcStartPeriod)}~${adjustDisplayedPeriod(srcEndPeriod)}`;
  // const srcPeriodsText = `${DAYS_OF_WEEK[srcDayOfWeek - 1].title}${srcStartPeriod}~${srcEndPeriod}`;

  const sortedTrgPeriods = periods.sort((a, b) => a - b); // 전달 받은 시수가 이동 대상 시수
  const trgStartPeriod = sortedTrgPeriods[0];
  const trgEndPeriod = sortedTrgPeriods[sortedTrgPeriods.length - 1];
  const trgPeriodsText = `${periodTitle(dayOfWeek, trgStartPeriod)}~${adjustDisplayedPeriod(trgEndPeriod)}`;
  const teacherNames = sourceLessons[0].lessonTeachers?.map((t) => teacherMap.value[t.teacherId]?.teacherName || '').filter((t) => t) || [];
  // ---

  // 연속 수업 교환 수행
  const resultLessons = Timetable.exchangeConsecutiveCourseLessons(exchangeInfo);

  if (!resultLessons || resultLessons.length === 0) {
    console.error('연속 수업 교환 실패');
    return;
  }

  const historyMemo = `(자동) [${teacherNames?.join(', ')}] 선생님 연속수업 시간표 이동 (${srcPeriodsText} → ${trgPeriodsText})`;
  await lessonContext.saveLessonsWithReplace(Timetable.currentAssignedLessons, historyMemo);
  await refreshLessonsWithContext();

  resetEditState();
  resetRefsForEdit();

  showAutoSaveToast();
};

const refreshLessonsWithContext = async () => {
  // const currentLessons = Timetable.currentAssignedLessons;
  // lessons.value = currentLessons;

  Timetable.initWithPresetedLessons(lessons.value);
  teacherPeriodList.value = getCurrentTeacherPeriodList();
};

const assignTeacherPeriodItemManually = async (dayOfWeek: number, period: number) => {
  if (!periodItemForAssign.value) {
    return;
  }

  // 해당 시간에 이미 수업이 있거나, 학년의 수업 없음 이면 배정 불가능
  if (getLessonByTeacherAndPeriod(dayOfWeek, period) || checkSelectedTeacherFreeTime(dayOfWeek, period) || checkGradeFreePeriod(dayOfWeek, period)) {
    await dialog.alertSimple('해당 시간에 이미 수업이 있거나, 학년의 수업 없음 이면 배정 불가능합니다.');
    return;
  }

  const { concurrentCourseId } = periodItemForAssign.value?.lessonConf || {};

  // 동시 수업
  if (concurrentCourseId) {
    showManualAssignWithConcurrentCourse(dayOfWeek, period, concurrentCourseId);
    return;
  }

  // 연속 수업
  const consecutivePeriodToAssign = await getConsecutivePeriodToAssign(dayOfWeek, period);
  if (!consecutivePeriodToAssign) {
    return;
  }

  const timetablePeriod = { dayOfWeek, period } as TimetablePeriod;
  const lessonConf = periodItemForAssign.value.lessonConf;

  const assignedLessons = Timetable.assignLessonConfManually(timetablePeriod, lessonConf, consecutivePeriodToAssign);

  const teacherNames = assignedLessons[0].lessonTeachers?.map((t) => teacherMap.value[t.teacherId]?.teacherName || '').filter((t) => t) || [];
  const periodText = assignedLessons.map((l) => periodTitle(l.dayOfWeek, l.period)).join(', ');

  const historyMemo = `(자동) [${teacherNames}] 선생님 수업 배정 (${periodText})`;
  await lessonContext.saveLessons(assignedLessons, false, historyMemo);
  await refreshLessonsWithContext();

  resetEditState();
  resetRefsForEdit();

  showAutoSaveToast();
};

const selectConsecutivePeriodDialog = async(consecutivePeriod: string = '') => {
  if(!periodItemForAssign.value) {
    return;
  }

  const defaultConsecutivePeriod = 1;
  
  const { courseId, classId } = periodItemForAssign.value;

  const assignedConsecutives = getAssignedPeriodCount(courseId, classId, teacher.value?.teacherId || '');

  const sumAssigned = assignedConsecutives.reduce((acc, cur) => acc + cur, 0);

  const { periodCount: coursePeriodCount } = periodItemForAssign.value.course;
  const remainingCount = (coursePeriodCount || 0) - sumAssigned;

  if (remainingCount <= 0) {
    console.error('연속 수업 배정 불가. (배정 수업 있음)');
    return;
  }
  
  consecutiveCourseSelected.value = periodItemForAssign.value.lessonConf.lessonConfId;
  const courseConsecutives = consecutivePeriod.split(',').map((p) => parseInt(p.trim()));

  const remainConsecutives = ArrayUtils.substractNumberArrays(courseConsecutives, assignedConsecutives);

  if (remainConsecutives.length === 0) {
    console.error('연속 수업 배정 불가. (남은 시수가 없음)');
    return;
  }

  // 중복된 숫자는 제거한다
  consecutiveCourseItems.value = Array.from(new Set(remainConsecutives)).map((value) => {
    return {
      value: value.toString(),
      title: `${value}시간`,
    };
  });

  if (consecutiveCourseItems.value.length === 0) {
    console.error('연속 수업 배정 불가. (남은 시수가 없음)');
    return;
  }

  // 남은 시수가 1개인 경우 바로 배정, 아니면 선택창 띄우기
  // @ts-ignore
  const res = consecutiveCourseItems.value.length === 1 ? consecutiveCourseItems.value[0].value : await consecutivePeriodSelectDialog.value?.open();

  if (res === undefined || res === null) {
    return;
  }

  return res ? parseInt(res) : defaultConsecutivePeriod;
}

const showManualAssignWithConcurrentCourse = async (dayOfWeek: number, period: number, concurrentCourseId: string) => {
  // 동시 연속 수업인지 확인
  const consecutivePeriod = concurrentConfMap.value[concurrentCourseId]?.consecutivePeriod || '';

  let consecutivePeriodForAssign = 1;

  // 연속 수업인 경우
  if(consecutivePeriod) {
    const selectedConsecutivePeriod = await selectConsecutivePeriodDialog(consecutivePeriod);
    if(!selectedConsecutivePeriod) {
      return;
    }
    consecutivePeriodForAssign = selectedConsecutivePeriod;
  }

  const tailPeriod = period + consecutivePeriodForAssign - 1;
  if (tailPeriod > maxPeriod.value) {
    await dialog.alertSimple('등록할 수 있는 교시가 없습니다.<br />다른 교시를 선택해주세요.');
    return;
  }

  // 동시 수업에 속한 모든 교사 unique id list
  const lessonConfsOfConcurrentCourse = lessonConfsMapByConcurrentCourse.value[concurrentCourseId] || [];
  const teacherIds = Array.from(new Set(lessonConfsOfConcurrentCourse.map((conf) => conf.teacherId)));
  const classIds = Array.from(new Set(lessonConfsOfConcurrentCourse.map((conf) => conf.classId)));

  // 동시 수업에 속한 모든 특별실 unique id list
  const specialtyRoomIds = Array.from(new Set(lessonConfsOfConcurrentCourse.filter((conf) => conf.specialtyRoomId)
    .map((conf) => conf.specialtyRoomId))) || [];

  

  for (let i = 0; i < consecutivePeriodForAssign; i++) {
    const checkPeriod = period + i;

    const msgPrefix = consecutivePeriodForAssign > 1 ? 
      `선택한 연속 시수(${consecutivePeriodForAssign}시간) 중 ${i + 1}번째` :
      '선택한';

    if(checkGradeFreePeriod(dayOfWeek, checkPeriod)) {
      const msg = `${msgPrefix} 시수에 학년의 수업 없음 시간이 있습니다.`;
      await dialog.alertSimple(msg);
      return;
    }

    for(const tId of teacherIds) {
      const teacherName = teacherMap.value[tId].teacherName || '';
          
      if (checkLessonByTeacherAndPeriod(tId, dayOfWeek, checkPeriod)) {
        const msg = `${msgPrefix} 시수에 이미 ${teacherName} 선생님의 수업이 있습니다.`;
        await dialog.alertSimple(msg);
        return;
      }

      if(checkTeacherFreeTime(tId, dayOfWeek, checkPeriod)) {
        const msg = `${msgPrefix} 시수에  ${teacherName} 선생님의 교사 수업 빼기 시간이 있습니다.`;
        await dialog.alertSimple(msg);
        return;
      }
    }

    for(const srId of specialtyRoomIds) {      
      if(checkSpecialtyRoomFullPeriod(srId || '', dayOfWeek, checkPeriod)) {
        const msg = `${msgPrefix} 시수에 특별실이 이미 사용중입니다.`;
        await dialog.alertSimple(msg);
        return;
      }
    }

    for(const cId of classIds) {
      if(checkLessonByClassAndPeriod(cId, dayOfWeek, checkPeriod)) {
        const className = TimetableDisplayUtils.formatFullClassName(classMap.value[cId]);
        const msg = `${msgPrefix} 시수에 이미 ${className} 학급의 수업이 있습니다.`;
        await dialog.alertSimple(msg);
        return;
      }       
    }
  }

  assignConcurrentCourseInfo.value = {
    dayOfWeek,
    period,
    concurrentCourseId,
    consecutivePeriodLength: consecutivePeriodForAssign,
  } as AssignConcurrentCourseInfo;
  isShowAssignConcurrentCourseDialog.value = true;
};

const getConsecutivePeriodIfSpecialtyRoom = (specialtyRoomId: string, courseId: string, teacherId: string): string | undefined => {
  const specialtyRoomConf = specialtyRoomConfs.value.find(
    (conf) => conf.specialtyRoomId === specialtyRoomId && conf.courseId === courseId && conf.teacherId === teacherId
  );

  return specialtyRoomConf?.consecutivePeriod;
};

const getConsecutivePeriodToAssign = async (dayOfWeek: number, period: number): Promise<number | undefined> => {
  
  if (!periodItemForAssign.value) {
    return;
  }

  const { courseId, classId } = periodItemForAssign.value;
  const defaultConsecutivePeriod = 1;

  // 특별실 연속 수업인지 확인
  let consecutivePeriod = '';
  const { specialtyRoomId } = periodItemForAssign.value.lessonConf;
  consecutivePeriod = (specialtyRoomId && getConsecutivePeriodIfSpecialtyRoom(specialtyRoomId, courseId, teacher.value?.teacherId || '')) || '';

  // 특별실 연속시수가 우선이므로 없으면 일반 연속시수 확인
  const { consecutivePeriod: selectedConsecutivePeriod } = periodItemForAssign.value?.lessonConf || {};
  consecutivePeriod = consecutivePeriod || selectedConsecutivePeriod || '';

  if (!consecutivePeriod) {
    return defaultConsecutivePeriod;
  }

  /*
  // 연속 수업인 경우, 연속 수업 선택 모달 띄우기
  const assignedConsecutives = getAssignedPeriodCount(courseId, classId, teacher.value?.teacherId || '');

  const sumAssigned = assignedConsecutives.reduce((acc, cur) => acc + cur, 0);

  const { periodCount: coursePeriodCount } = periodItemForAssign.value.course;
  const remainingCount = (coursePeriodCount || 0) - sumAssigned;

  if (remainingCount <= 0) {
    console.error('연속 수업 배정 불가. (배정 수업 있음)');
    return;
  }

  consecutiveCourseSelected.value = periodItemForAssign.value.lessonConf.lessonConfId;
  const courseConsecutives = consecutivePeriod.split(',').map((p) => parseInt(p.trim()));

  const remainConsecutives = ArrayUtils.substractNumberArrays(courseConsecutives, assignedConsecutives);

  if (remainConsecutives.length === 0) {
    console.error('연속 수업 배정 불가. (남은 시수가 없음)');
    return;
  }

  // 중복된 숫자는 제거한다
  consecutiveCourseItems.value = Array.from(new Set(remainConsecutives)).map((value) => {
    return {
      value: value.toString(),
      title: `${value}시간`,
    };
  });

  if (consecutiveCourseItems.value.length === 0) {
    console.error('연속 수업 배정 불가. (남은 시수가 없음)');
    return;
  }

  // 남은 시수가 1개인 경우 바로 배정, 아니면 선택창 띄우기
  // @ts-ignore
  const res = consecutiveCourseItems.value.length === 1 ? consecutiveCourseItems.value[0].value : await consecutivePeriodSelectDialog.value?.open();

  if (res === undefined || res === null) {
    return;
  }

  const consecutivePeriodToAssign = res ? parseInt(res) : defaultConsecutivePeriod;
  */

  const consecutivePeriodToAssign = await selectConsecutivePeriodDialog(consecutivePeriod) || defaultConsecutivePeriod;

  const tailPeriod = period + consecutivePeriodToAssign - 1;
  if (tailPeriod > maxPeriod.value) {
    await dialog.alertSimple('등록할 수 있는 교시가 없습니다.<br />다른 교시를 선택해주세요.');
    return;
  }

  // 선택된 연속 시수 아래 중복되는 수업이 있는지 확인
  for (let i = 0; i < consecutivePeriodToAssign; i++) {
    const checkPeriod = period + i;
    if (getLessonByTeacherAndPeriod(dayOfWeek, checkPeriod)) {
      const msg = `선택한 연속 시수(${consecutivePeriodToAssign}시간) 중 ${i + 1}번째 시수에 이미 수업이 있습니다.`;
      await dialog.alertSimple(msg);
      return;
    }

    if(checkLessonByTargetClassAndPeriod(dayOfWeek, checkPeriod)) {
      const msg = `선택한 연속 시수(${consecutivePeriodToAssign}시간) 중 ${i + 1}번째 시수에 이미 해당 학급의 수업이 있습니다.`;
      await dialog.alertSimple(msg);
      return;
    }

    if(checkSelectedTeacherFreeTime(dayOfWeek, checkPeriod)) {
      const msg = `선택한 연속 시수(${consecutivePeriodToAssign}시간) 중 ${i + 1}번째 시수에 교사 수업 빼기 시간이 있습니다.`;
      await dialog.alertSimple(msg);
      return;
    }

    if(checkGradeFreePeriod(dayOfWeek, checkPeriod)) {
      const msg = `선택한 연속 시수(${consecutivePeriodToAssign}시간) 중 ${i + 1}번째 시수에 학년의 수업 없음 시간이 있습니다.`;
      await dialog.alertSimple(msg);
      return;
    }

    if(checkSpecialtyRoomFullPeriod(specialtyRoomId || '', dayOfWeek, checkPeriod)) {
      const msg = `선택한 연속 시수(${consecutivePeriodToAssign}시간) 중 ${i + 1}번째 시수에 해당 특별실이 이미 사용 중입니다.`;
      await dialog.alertSimple(msg);
      return;
    }
  }

  return consecutivePeriodToAssign;
};

/* 수업이 할당된 시수 목록을 가져옴 */
const getAssignedPeriodCount = (courseId: string, classId: string, teacherId: string) => {
  const lessons = lessonByClass.value[classId];
  if (!lessons) {
    return [];
  }

  const assignedLessonPeriods = Object.values(lessons)
    .filter((lesson) => {
      return lesson.courseId === courseId && lesson.classId === classId && lesson.lessonTeachers?.some((teacher) => teacher.teacherId === teacherId);
    })
    .map((lesson) => [lesson.dayOfWeek, lesson.period]);

  // dayOfWeek, period 으로 정렬
  assignedLessonPeriods.sort((a, b) => {
    if (a[0] !== b[0]) {
      return a[0] - b[0]; // dayOfWeek 기준 오름차순 정렬
    }
    return a[1] - b[1]; // period 기준 오름차순 정렬
  });

  // 연속 시수 배열화
  const assignedPeriods: number[] = [];
  let acc = 0;
  let lastDay = -1;
  let lastPeriod = -1;

  for (const p of assignedLessonPeriods) {
    // 시수가 연속되지 않거나 요일이 바뀐 경우 새로운 세그먼트 시작
    if (acc > 0 && (lastPeriod + 1 !== p[1] || lastDay !== p[0])) {
      assignedPeriods.push(acc);
      acc = 0;
    }

    // segment가 비어있으면 새로 생성, 그렇지 않으면 추가
    acc = acc + 1;

    lastDay = p[0];
    lastPeriod = p[1];
  }

  if (acc > 0) {
    assignedPeriods.push(acc);
  }
  // <-- 연속 시수 배열화

  return assignedPeriods;
};

const assignConcurrentCourseItemManually = async (concurrentCourseId: string, dayOfWeek: number, period: number, consecutivePeriodLength: number = 1) => {
  if (!concurrentCourseId) {
    return;
  }

  // 동시 수업에 속한 모든 수업을 가져온다.
  const concurrentLessonConfs = lessonConfsMapByConcurrentCourse.value[concurrentCourseId];
  const timetablePeriod = { dayOfWeek, period } as TimetablePeriod;

  concurrentLessonConfs.forEach((conf) => {
    Timetable.assignLessonConfManually(timetablePeriod, conf, consecutivePeriodLength);
  });

  const assignePeriods = Array.from({ length: consecutivePeriodLength }, (_, i) => period + i);
  const lessonsToSave = Timetable.currentAssignedLessons.filter((lesson) => {
    return lesson.dayOfWeek === dayOfWeek && 
      assignePeriods.includes(lesson.period) && 
      lesson.concurrentCourseId === concurrentCourseId;
  });

  // 작업 내역 메모 생성: 동시수업 (2A) 수업배정 (월1)
  const isReplaceAll = false;
  const periodText = assignePeriods.map((p) => periodTitle(dayOfWeek, p)).join(', ');
  const historyMemo = `(자동) 동시수업 (${courseMap.value[concurrentCourseId]?.displayedTitle || ''}) 수업 배정 (${periodText})`;
  const savedResult = await lessonContext.saveLessons(lessonsToSave, isReplaceAll, historyMemo);

  // api에서 전달받은 lessonId로 갱신
  Timetable.replaceLessonIdWithLessons(savedResult);

  refreshLessonsWithCurrentAssigned();

  resetEditState();
  resetRefsForEdit();

  showAutoSaveToast();
};

const handleSubmitAssignConcurrentCourse = async (assignInfo: AssignConcurrentCourseInfo) => {
  const { dayOfWeek, period, concurrentCourseId, consecutivePeriodLength } = assignInfo;

  await assignConcurrentCourseItemManually(concurrentCourseId, dayOfWeek, period, consecutivePeriodLength);

  isShowAssignConcurrentCourseDialog.value = false;
  assignConcurrentCourseInfo.value = {} as AssignConcurrentCourseInfo;
};

const handleCancelAssignConcurrentCourse = () => {
  isShowAssignConcurrentCourseDialog.value = false;
  assignConcurrentCourseInfo.value = {} as AssignConcurrentCourseInfo;
};

const addTeacherFreePeriod = async (dayOfWeek: number, period: number) => {
  if (!teacher.value) {
    return;
  }

  // 해당 시간에 이미 수업이 있으면 배정 불가능
  if (getLessonByTeacherAndPeriod(dayOfWeek, period)) {
    return;
  }

  // 교사 수업 빼기 시간
  Timetable.addTeacherFreePeriod(teacher.value.teacherId, dayOfWeek, period);

  const historyMemo = getHistoryMemoByPeriods([{ dayOfWeek, period }]);
  await teacherContext.updateFreePeriods(teacher.value, historyMemo);

  resetEditState();
  resetRefsForEdit();

  showAutoSaveToast();
};

const resetRefsForEdit = () => {
  resetSelectedAndTargeted();
  resetPeriodItemForAssign();
  resetPeriodListItem();
  resetValidStatusType();
};

const handleDelete = (dayOfWeek: number, period: number, editorCellLesson?: EditorCellLesson) => {
  if (!editorCellLesson) {
    return;
  }

  const { lesson, isFreePeriod } = editorCellLesson;
  if (isFreePeriod) {
    processDeleteFreePeriod(dayOfWeek, period);
    return;
  }

  if (lesson) {
    processDeleteLesson(lesson);
    return;
  }
};

const processDeleteLesson = async (lesson: Lesson) => {
  if (!lesson && !checkLessonOfSelectedTeacher(lesson)) {
    return;
  }

  const { lessonTeachers } = lesson;

  let confirmMessage = '선택하신 수업을 삭제하시겠습니까?';

  if (lessonTeachers && lessonTeachers.length > 1) {
    // 복수 교사 수업인 경우
    const partnerTeacherNames = lessonTeachers
      .map((conf) => {
        const teacher = teacherContext.teacherMap[conf.teacherId];
        return teacher ? `${teacher.teacherName} 선생님` : null;
      })
      .filter((name) => name !== null)
      .join(', ');

    confirmMessage = `선택하신 수업은 ${partnerTeacherNames} 과 복수 수업입니다.<br/> 삭제하시겠습니까?`;
  }

  if (!(await dialog.confirmSimple(confirmMessage))) {
    return;
  }

  const srcLessonsToDelete = [] as Lesson[];

  if (lesson.concurrentCourseId) {
    // 동시수업인 경우, 동일한 동시수업이 동일한 시간에 배정된 수업을 가져온다
    const concurrentLessons = lessons.value.filter(
      (l) => l.concurrentCourseId === lesson.concurrentCourseId && l.dayOfWeek === lesson.dayOfWeek && l.period === lesson.period
    );

    srcLessonsToDelete.push(...concurrentLessons);
  }

  if (srcLessonsToDelete.length === 0) {
    srcLessonsToDelete.push(lesson);
  }

  // 연속 시수인 경우 해당 수업 추가
  const lessonsToDelete = srcLessonsToDelete
    .map((l) => {
      if (l.consecutiveGroupId) {
        return lessons.value.filter((lesson) => lesson.consecutiveGroupId === l.consecutiveGroupId);
      }
      return l;
    })
    .flat();

  const lessonIdsToDelete = lessonsToDelete.map((l) => l.lessonId);
  const resultIds = await lessonContext.removeByIds(lessonIdsToDelete);

  let resultLessons = [] as Lesson[];
  lessonsToDelete.forEach((lesson) => {
    // 수업 데이터 삭제
    if (!resultIds.includes(lesson.lessonId)) {
      return;
    }
    resultLessons = Timetable.resetAssignedLesson(lesson);
  });

  await refreshLessonsWithCurrentAssigned();
};

const checkLessonOfSelectedTeacher = (lesson: Lesson | undefined | null): boolean => {
  if (!lesson || !lesson.lessonTeachers || !teacher.value?.teacherId) {
    return false;
  }

  return lesson.lessonTeachers.some(({ teacherId }) => teacherId === teacher.value?.teacherId);
};

const processDeleteFreePeriod = async (dayOfWeek: number, period: number) => {
  if (!teacher.value) {
    return;
  }

  Timetable.removeTeacherFreePeriod(teacher.value.teacherId, dayOfWeek, period);
  await teacherContext.updateFreePeriods(teacher.value);
};

const checkIsSelectedPeriodListItem = (item: TeacherPeriodListItem | null): boolean => {
  if (!selectedPeriodListItem.value || !item) {
    return false;
  }

  return selectedPeriodListItem.value.classId === item.classId && selectedPeriodListItem.value.lessonConfId === item.lessonConfId;
};

const handleClickPeriodListItem = (item: TeacherPeriodListItem | null) => {
  if (selectedPeriodListItem.value && item && selectedPeriodListItem.value === item) {
    // 동일 아이템 클릭 시 해제
    selectedPeriodListItem.value = null;
    return;
  }

  resetRefsForEdit();

  selectedPeriodListItem.value = item;
};

const handleClickValidStatusType = (type: ValidStatusType) => {
  resetRefsForEdit();

  if (!teacherStatus || !teacherStatus.value || teacherStatus.value[type] === 0) {
    return;
  }

  if (selectedValidStatusType.value === type) {
    selectedValidStatusType.value = null;
    return;
  }

  selectedValidStatusType.value = type;
};

const handleClickAssigLesson = async (item: TeacherPeriodListItem) => {
  // 수업 이동
  resetSelectedAndTargeted();

  const { classId, lessonConfId } = periodItemForAssign.value || {};

  if (classId === item.classId && lessonConfId === item.lessonConfId) {
    resetPeriodItemForAssign();
    resetEditState();
    return;
  }

  // 복수 교사 수업 여부
  const course = courseMap.value[item.courseId];
  if (course.isDoubleTeacher) {
    // 복수 교사 수업인 경우, 해당 수업에 속한 교사의 수업 구성 가져오기
    partnerTeachersLessonConfs.value = (lessonConfsMapByClass.value[item.classId] || []).filter(
      (conf) => conf.courseId === item.courseId && conf.lessonConfId !== item.lessonConfId && conf.teacherId !== teacher.value?.teacherId
    );

    const partnerTeacherNames = partnerTeachersLessonConfs.value
      .map((conf) => {
        const teacher = teacherContext.teacherMap[conf.teacherId];
        return teacher ? `${teacher.teacherName} 선생님` : null;
      })
      .filter((name) => name !== null)
      .join(', ');

    const message = `선택하신 수업은 ${partnerTeacherNames}과 복수 수업 과목입니다.<br/>해당 선생님들도 선택하신 시간에 수업이 배정됩니다.`;
    partnerTeachersLessonConfs.value.length > 0 && (await dialog.alertSimple(message));
  }

  periodItemForAssign.value = item;
  currentEditState.value = TimetableEditState.AssignLesson;
};

const resetSelectedAndTargeted = () => {
  selectedLesson.value = null;
  targetLessons.value = [];
  selectedChainExchangeable.value = null;
  chainExchangeableResults.value = [];
  concurrentCourseExchangeInfos.value = [];
  consecutiveCourseExchangeInfos.value = [];
  partnerTeachersLessonConfs.value = [];
};

const resetPeriodItemForAssign = () => {
  periodItemForAssign.value = null;
};

const resetPeriodListItem = () => {
  selectedPeriodListItem.value = null;
};

const resetValidStatusType = () => {
  selectedValidStatusType.value = null;
};

const resetEditState = () => {
  currentEditState.value = TimetableEditState.None;
};

watch(
  () => [lessonsByTeacher.value],
  async () => {
    //console.log('리스너: lessonsByTeacher 변경 감지');
    await nextTick();
    refreshAssignPeriodInfo();
  }
);

watch(
  () => [lessonContext.lessons, teachers.value],
  async () => {
    // console.log('리스너: lessons or teachers 변경 감지');

    await nextTick();
    teacherPeriodList.value = getCurrentTeacherPeriodList();
    refreshAssignPeriodInfo();
  }
);

const coreTick = computed(() => progressContext.tick);

watch(
  () => coreTick.value,
  async () => {
    await nextTick();

    teacherPeriodList.value = getCurrentTeacherPeriodList();

    resetEditState();
    resetRefsForEdit();
    refreshAssignPeriodInfo();
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.teacher-assign-wrap {
  display: flex;
  gap: 24px;
  .teacher-assign {
    width: 55%;
  }
  .assign-list {
    width: 45%;
    .tit {
      font-weight: 600;
      font-size: 16px;
      line-height: 144%;
      margin-bottom: 16px;
    }
    .tab-nav {
      margin-bottom: 24px;
    }
    .table-content {
      height: 264px;
      overflow-x: hidden;
      tr:hover td {
        background: #f1f4fc;
      }
      td {
        border-right: 0;
        height: 48px;
        padding: 8px 10px;
        .btn-xs {
          padding: 0 8px;
          max-width: 57px;
          width: 100%;
        }
      }
    }
    .lesson-config {
      .table-content tr {
        th,
        td {
          &:first-child {
            padding: 4px;
          }
        }
      }
    }
  }
}

.disabled-result {
  color: #9e9e9e;
}

.cursor-pointer {
  cursor: pointer;
}

.selected-period > td {
  background-color: #f1f4fc;
}
</style>