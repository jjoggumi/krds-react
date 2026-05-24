<template>
  <div>
    <div class="row full-width">
      <q-btn
        label="수업 빼기"
        outline
        color="primary"
        class="q-mr-md q-ml-md"
        :class="classAssignTeacherFreeTime"
        @click="handleClickAssignTeacherFreeTime"
      />
    </div>
    <div class="row full-width q-pa-md">
      <q-card class="timetable-frame no-shadow full-width">
        <q-card-section class="no-padding">
          <div class="timetable-head-row">
            <div class="timetable-no"></div>
            <div class="timetable-col">월</div>
            <div class="timetable-col">화</div>
            <div class="timetable-col">수</div>
            <div class="timetable-col">목</div>
            <div class="timetable-col">금</div>
          </div>
          <div
            v-for="period in timetableConfig.maxPeriod"
            class="timetable-row"
            :key="period"
          >
            <div class="timetable-no">{{ period }}</div>
            <div v-for="dayOfWeek in 5" class="timetable-col" :key="dayOfWeek">
              <!-- 편집 상태: 없음 -->
              <teacher-timetable-editor-cell
                :day-of-week="dayOfWeek"
                :period="period"
                :timetable-edit-state="currentEditState"
                :editor-cell-lesson="
                  getEditorCellLessonByPeriod(dayOfWeek, period)
                "
                :selected-teacher-id="selectedTeacherId"
                :selected-lesson="selectedLesson"
                :on-click="handleClickEditorCell"
                :on-click-delete-button="handleClickDeleteButton"
                :free-periods-count="teacherFreePeriodsCount"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="row q-pa-md full-width">
      <q-card class="my-card full-width bg-grey-2" flat>
        <q-card-section class="row">
          <div class="col text-subtitle1 text-left">
            <span class="text-weight-bold">{{ selectedTeacherName }}</span>
            <span class="q-ml-sm text-weight-regular">선생님</span>
            <span class="q-ml-md q-mr-md text-weight-regular">|</span>
            <span v-for="courseName in teacherCourseNames" :key="courseName" class="text-weight-light q-mr-xs">{{ courseName }}</span>
          </div>
          <div class="col text-subtitle1 text-right">
            시수 -
            {{ assignPeriodInfo.total }}
            (배정 {{ assignPeriodInfo.assigned }} / 미배정
            <span
              :class="[{ 'remaining-period': assignPeriodInfo.remaining !== 0 }]"
            >
              {{ assignPeriodInfo.remaining }}
            </span>
            )
          </div>
        </q-card-section>

        <table class="teacher-lesson-conf-table">
          <thead>
            <tr>
              <th class="text-center no-border">
                <span class="text-weight-bold text-subtitle2">학급</span>
              </th>
              <th class="text-center no-border">
                <span class="text-weight-bold text-subtitle2">과목명</span>
              </th>
              <th class="text-center no-border">
                <span class="text-weight-bold text-subtitle2">비고</span>
              </th>
              <th class="text-center no-border">
                <span class="text-weight-bold text-subtitle2">미배정/시수</span>
              </th>
              <th class="text-center no-border">
                <span class="text-weight-bold text-subtitle2">배정</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in teacherPeriodList"
              :key="`${item.lessonConfId}.${item.classId}`"
              :class="{
                'bg-amber-1':
                  selectedTeacherPeriodItem &&
                  selectedTeacherPeriodItem.classId === item.classId &&
                  selectedTeacherPeriodItem.lessonConfId === item.lessonConfId,
              }"
            >
              <td class="text-center no-border">
                {{ TimetableDataUtils.className(item.class) }}
              </td>
              <td class="text-center no-border">
                {{ item.course.displayedTitle }}
                {{
                  item.concurrentCourseTitle && ` (${item.concurrentCourseTitle})`
                }}
              </td>
              <td class="text-center no-border">
                {{ getExtraInfoText(item.lessonConf) }}
              </td>
              <td class="text-center no-border">
                {{ item.remainingCount }} /
                {{ item.course.periodCount }}
              </td>
              <td class="text-center no-border">
                <q-btn
                  color="text-grey-7"
                  size="sm"
                  class="bg-white"
                  :class="{
                    'bg-amber-3':
                      selectedTeacherPeriodItem &&
                      selectedTeacherPeriodItem.classId === item.classId &&
                      selectedTeacherPeriodItem.lessonConfId ===
                        item.lessonConfId,
                  }"
                  outline
                  rounded
                  :disabled="item.remainingCount === 0"
                  @click="() => item.remainingCount !== 0 && handleClickAssigLesson(item)"
                  >배정</q-btn
                >
              </td>
            </tr>
          </tbody>
        </table>
      </q-card>

      
    </div>
    <exchange-lesson-dialog
      :show-exchange-dialog="showExchangeDialog"
      :chain-exchangeable-result="selectedChainExchangeable"
      :on-cancel="handleCancelExchangeDialog"
      :on-submit="handleSubmitExchangeDialog"
    />
  </div>
</template>

<script setup lang="ts">
// quasar 를 흉내낸 임시 컴포넌트 -->
import QCard from '@/apps/timetable/q-temp/QCard.vue';
import QCardSection from '@/apps/timetable/q-temp/QCardSection.vue';
import QBtn from '@/apps/timetable/q-temp/QBtn.vue';
// <-- quasar 를 흉내낸 임시 컴포넌트

import TeacherTimetableEditorCell from '@/apps/timetable/components/TeacherTimetableEditorCell.vue';
import ExchangeLessonDialog from '@/apps/timetable/components/ExchangeLessonDialog.vue';
import Timetable from '@/apps/timetable/core';
import { EditorCellLesson } from '@/apps/timetable/common/types';

import {
  Class,
  Course,
  Lesson,
  LessonConf,
  Teacher,
  TimetableConfig,
  TimetableEditState,
  TimetablePeriod,
  ChainExchangeable,
} from '@/apps/timetable/core/types';

import { useDialog } from '@/apps/timetable/composables/dialog';
import {
  ConcurrentConfContext,
  ContextKeys,
  FixedConfContext,
  LessonConfContext,
  LessonContext,
  SpecialtyRoomContext,
  TeacherCourseContext,
  TimetableClassContext,
  TimetableCourseContext,
  TimetableGradeContext,
  TimetableTeacherContext
} from '../contexts';

import { CommonUtils, TimetableDataUtils } from '@/apps/timetable/core/mod/utils';
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';

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
}

interface AssignPeriodInfo {
  total: number;
  assigned: number;
  remaining: number;
}

// defineOptions({  name: 'TeacherTimetableEditor',});

const props = defineProps<{
  selectedTeacher: Teacher | null; 
  assignedLessons: Lesson[];
  onChangeLesson: () => void;
}>();

const dialog = useDialog();

const showExchangeDialog = ref(false);
const currentEditState = ref(TimetableEditState.None);
const teacherPeriodList = ref([] as TeacherPeriodListItem[]);
const selectedLesson = ref<Lesson | null>(null);
const targetLessons = ref([] as Lesson[]);
const teacherFreePeriods = ref([] as TimetablePeriod[]);
const teacherFreePeriodsCount = ref(0);
const selectedTeacherPeriodItem = ref(null as TeacherPeriodListItem | null);
const chainExchangeableResults = ref([] as ChainExchangeable[]);
const selectedChainExchangeable = ref(null as ChainExchangeable | null);

const assignPeriodInfo = reactive({
  total: 0,
  assigned: 0,
  remaining: 0,
} as AssignPeriodInfo);

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;

const timetableConfig = computed(() => gradeContext.timetableConfig as TimetableConfig);
const targetedClass = computed(() => selectedTeacherPeriodItem.value?.class || null);
const targetedGradeNumber = computed(() => targetedClass.value?.grade);
const teacher = computed(() => props.selectedTeacher);

// const lessons = computed(() => props.assignedLessons);
const lessons = computed(() => lessonContext.lessons);
const courseMap = computed(() => courseContext.courseMap);
const classMap = computed(() => classContext.classMap);
const teacherCourseMap = computed(() => teacherCourseContext.teacherCourseMap);
const lessonConfs = computed(() => lessonConfContext.lessonConfs);
const lessonConfsMapByTeacher = computed(() => lessonConfContext.lessonConfsMapByTeacher);
const lessonConfsMapByConcurrentCourse = computed(() => lessonConfContext.lessonConfsMapByConcurrentCourse);

const selectedTeacherId = computed(() => teacher.value?.teacherId || '');
const selectedTeacherName = computed(() => teacher.value?.teacherName || '');

const freePeriodsOfTargetedGrade = computed(
  (): TimetablePeriod[] | undefined => {
    // const grades = Timetable.grades;
    const { grades } = timetableConfig.value;
    
    if (
      !targetedGradeNumber.value ||
      targetedGradeNumber.value > grades.length
    ) {
      return [];
    }

    const grade = grades[targetedGradeNumber.value - 1];
    if (!grade.timetableStructure || !grade.timetableStructure.freePeriods) {
      return [];
    }

    return grade.timetableStructure.freePeriods;
  }
);

const classAssignTeacherFreeTime = computed(() => {
  return {
    'assign-teacher-free-time-on':
      currentEditState.value === TimetableEditState.AssignTeacherFreeTime,
  };
});


const teacherCourseNames = computed(() => {
  if (!teacher.value) {
    return [];
  }

  const courses = (teacherCourseMap.value[teacher.value.teacherId] || []).map(
    ({ courseId }) => courseMap.value[courseId]
  ) as Course[];

  return TimetableDataUtils.courseNames(courses);
});

watch(
  () => props.selectedTeacher,
  () => {
    checkTeacherTotalPeriods(props.selectedTeacher?.teacherId || '');
  }
);

// 교사 총 시수를 계산하기 위한 테스트 코드
// 동시 수업 가능 여부를 판단하기 위함
const checkTeacherTotalPeriods = (teacherId: string) => {
  // console.log('===== checkTeacherTotalPeriods =====');
  // console.log('selectedTeacher changed', props.selectedTeacher);

  // 교사의 모든 수업
  const teacherLessonConfs = lessonConfsMapByTeacher.value[teacherId];

  const teacherConcurrentCourseIds = new Set<string>();
  teacherLessonConfs.forEach((conf) => {
    if (!conf.concurrentCourseId) {
      return;
    }

    // 동시 수업인 경우
    teacherConcurrentCourseIds.add(conf.concurrentCourseId);
  });

  // 동시 수업에 함께 속한 교사들

  teacherConcurrentCourseIds.forEach((concurrentCourseId) => {
    // 각 동시 수업 별로 확인:
    //   동시 수업에 속한 교사들의 수업 중 겹치는 것들을 제외한 시수 합이
    //   시간표 총 시수합을 넘으면 수업 배정이 불가하다.
    checkTeacherConcurrenCourseAvailable(teacherId, concurrentCourseId);
  });
};

const checkTeacherConcurrenCourseAvailable = (
  teacherId: string,
  concurrentCourseId: string
) => {
  const teacherLessonConfs = lessonConfsMapByTeacher.value[teacherId];

  const teacherConcurrentCourseIds = new Set<string>();
  teacherLessonConfs.forEach((conf) => {
    if (!conf.concurrentCourseId) {
      return;
    }

    // 동시 수업인 경우
    teacherConcurrentCourseIds.add(conf.concurrentCourseId);
  });

  const concurrentLessonConfs = lessonConfsMapByConcurrentCourse.value[concurrentCourseId];
  
  const thisConCourse = courseMap.value[concurrentCourseId];
  const thisCourseName = thisConCourse.displayedTitle;
  const thisCoursePeriods = thisConCourse.periodCount || 0;

  const conCourseTeacherIds = new Set<string>();
  concurrentLessonConfs.forEach((conf) => {
    if (conf.teacherId == teacherId) {
      return;
    }

    conCourseTeacherIds.add(conf.teacherId);
  });

  // 교사들의 수업 설정: 나와 함께 속한 동시 수업은 제외, 겹치는 동시수업은 하나로 처리
  const otherTeacherConcurrentCourseIds = new Set<string>();
  const otherTeacherLessonConf = lessonConfs.value.filter((conf) =>
    conCourseTeacherIds.has(conf.teacherId)
  );

  otherTeacherLessonConf.forEach((conf) => {
    if (
      conf.concurrentCourseId &&
      !teacherConcurrentCourseIds.has(conf.concurrentCourseId)
    ) {
      otherTeacherConcurrentCourseIds.add(conf.concurrentCourseId);
    }
  });

  const otherTeacherConcurrentPeriods = [
    ...otherTeacherConcurrentCourseIds,
  ].reduce((acc, concurrentCourseId) => {
    const course = courseMap.value[concurrentCourseId];
    return acc + (course.periodCount || 0);
  }, 0);

  /*
  console.log(
    `--- ${thisCourseName} (${
      thisCoursePeriods + otherTeacherConcurrentPeriods
    }), Other Periods: ${otherTeacherConcurrentPeriods} ---`
  );

  console.log(
    'Concurrent Courses: ',
    [...otherTeacherConcurrentCourseIds]
      .map((concurrentCourseId) => {
        const conCourse = courseMap.value[concurrentCourseId];
        return `${conCourse.displayedTitle} ${conCourse.periodCount || 0}`;
      })
      .sort()
  );
  */

  return thisCoursePeriods + otherTeacherConcurrentPeriods;
};

const lessonByTeacher = computed(() => {
  return lessons.value.reduce((acc, lesson) => {
    lesson.lessonTeachers?.forEach(({ teacherId }) => {
      if (!acc[teacherId]) {
        acc[teacherId] = [];
      }
      acc[teacherId].push(lesson);
    });

    return acc;
  }, {} as Record<string, Lesson[]>);
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

const refreshAssignPeriodInfo = () => {
  assignPeriodInfo.total = 0;
  assignPeriodInfo.assigned = 0;
  assignPeriodInfo.remaining = 0;

  teacherPeriodList.value.map((item) => {
    assignPeriodInfo.assigned += item.assignedCount;
    assignPeriodInfo.remaining += item.remainingCount;
  });

  assignPeriodInfo.total =
    assignPeriodInfo.assigned + assignPeriodInfo.remaining;
};

watch(
  () => [props.selectedTeacher, props.assignedLessons],
  () => {
    teacherFreePeriods.value = teacher.value?.freePeriods || [];

    resetEditState();
    resetRefsForEdit();

    teacherPeriodList.value = getCurrentTeacherPeriodList();
    refreshAssignPeriodInfo();
  }
);

onMounted(() => {
  teacherPeriodList.value = getCurrentTeacherPeriodList();
  refreshAssignPeriodInfo();
});

const checkLessonOfSelectedTeacher = (
  lesson: Lesson | undefined | null
): boolean => {
  if (!lesson || !lesson.lessonTeachers || !selectedTeacherId.value) {
    return false;
  }

  return lesson.lessonTeachers.some(
    ({ teacherId }) => teacherId === selectedTeacherId.value
  );
};

const handleClickEditorCell = (
  dayOfWeek: number,
  period: number,
  editorCellLesson?: EditorCellLesson
) => {
  // 교사 수업 빼기
  if (
    currentEditState.value === TimetableEditState.AssignTeacherFreeTime &&
    !editorCellLesson?.lesson
  ) {
    // 교사 수업 빼기: 수업이 없는 시간만 가능
    addTeacherFreePeriod(dayOfWeek, period);
    return;
  }

  // 교사 수업 배정
  if (
    currentEditState.value === TimetableEditState.AssignLesson &&
    selectedTeacherPeriodItem.value
  ) {
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

const processExchange = (
  dayOfWeek: number,
  period: number,
  editorCellLesson?: EditorCellLesson
) => {
  // 편집 상태 및 파라미터 확인
  if (
    currentEditState.value !== TimetableEditState.MoveLesson ||
    !selectedLesson.value ||
    !editorCellLesson
  ) {
    return;
  }

  // 빈 셀을 선택했거나, 이동하려는 수업을 다시 선택한 경우: 리셋
  if (
    !editorCellLesson.lesson ||
    TimetableDataUtils.checkSameLessons(
      selectedLesson.value,
      editorCellLesson.lesson
    )
  ) {
    resetSelectedAndTargeted();
    resetEditState();
    return;
  }

  // 이동하려는 수업을 다른 수업으로 선택한 경우: 다시 선택
  if (checkLessonOfSelectedTeacher(editorCellLesson.lesson)) {
    processSelectLesson(editorCellLesson);
    return;
  }

  // 맞교환 수업 선택
  if (editorCellLesson.isOneToOneExchangeable && editorCellLesson.lesson) {
    // 연쇄 교환 형식으로 변경
    selectedChainExchangeable.value = {
      targetLesson: editorCellLesson.lesson,
      paths: [[selectedLesson.value, editorCellLesson.lesson]],
    } as ChainExchangeable;

    if (selectedChainExchangeable.value) {
      showExchangeDialog.value = true;
    }

    /* 1:1 교환 로직, 모달 띄우는 것으로 변경
    Timetable.exchageOneToOneLessons(
      selectedLesson.value,
      editorCellLesson.lesson
    );
    props.onChangeLesson && props.onChangeLesson();
    resetSelectedAndTargeted();
    */
    return;
  }

  // 연쇄이동 수업 선택
  if (editorCellLesson.isChainExchangeable) {
    selectedChainExchangeable.value =
      chainExchangeableResults.value.find((result) =>
        TimetableDataUtils.checkSameLessons(
          result.targetLesson,
          editorCellLesson.lesson
        )
      ) || null;

    if (selectedChainExchangeable.value) {
      showExchangeDialog.value = true;
    }

    return;
  }
};

const handleCancelExchangeDialog = () => {
  showExchangeDialog.value = false;
};

const handleSubmitExchangeDialog = (selectedPathIndex: number) => {
  processChainExchange(selectedPathIndex);
  showExchangeDialog.value = false;
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

  Timetable.chainExchangeLessons(paths[pathIndex]);

  props.onChangeLesson && props.onChangeLesson();
  resetSelectedAndTargeted();
};

const handleClickDeleteButton = (
  dayOfWeek: number,
  period: number,
  editorCellLesson?: EditorCellLesson
) => {
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

const handleClickAssigLesson = (item: TeacherPeriodListItem) => {
  // 수업 이동
  resetSelectedAndTargeted();

  const { classId, lessonConfId } = selectedTeacherPeriodItem.value || {};

  if (classId === item.classId && lessonConfId === item.lessonConfId) {
    resetSelectedTeacherPeriodItem();
    resetEditState();
    return;
  }

  /*
  if (item.lessonConf.concurrentCourseId) {
    console.log('동시수업', item.lessonConf.concurrentCourseId);
  }
  */

  selectedTeacherPeriodItem.value = item;
  currentEditState.value = TimetableEditState.AssignLesson;
};

const handleClickAssignTeacherFreeTime = () => {
  resetRefsForEdit();

  if (currentEditState.value === TimetableEditState.AssignTeacherFreeTime) {
    resetEditState();
    return;
  }

  currentEditState.value = TimetableEditState.AssignTeacherFreeTime;
};

const processDeleteFreePeriod = (dayOfWeek: number, period: number) => {
  if (!teacher.value) {
    return;
  }

  Timetable.removeTeacherFreePeriod(teacher.value.teacherId, dayOfWeek, period);
  refreshTeacherFreePeriodsCount();
};

const processDeleteLesson = async (lesson: Lesson) => {
  if (!lesson && !checkLessonOfSelectedTeacher(lesson)) {
    return;
  }

  const msg = '선택하신 수업을 제하시겠습니까?';
  const result = await dialog._confirm(msg);

  if (!result) {
    return;
  }

  if (lesson.concurrentCourseId) {
    // 동시수업인 경우, 동일한 동시수업이 동일한 시간에 배정된 수업을 가져온다
    const concurrentLessons = props.assignedLessons.filter(
      (l) =>
        l.concurrentCourseId === lesson.concurrentCourseId &&
        l.dayOfWeek === lesson.dayOfWeek &&
        l.period === lesson.period
    );

    concurrentLessons.forEach((l) => {
      Timetable.resetAssignedLesson(l);
    });

    props.onChangeLesson && props.onChangeLesson();
    teacherPeriodList.value = getCurrentTeacherPeriodList();

    return;
  }

  Timetable.resetAssignedLesson(lesson);
  props.onChangeLesson && props.onChangeLesson();

  teacherPeriodList.value = getCurrentTeacherPeriodList();
};

const processSelectLesson = (editorCellLesson: EditorCellLesson) => {
  if (!editorCellLesson || !editorCellLesson.lesson) {
    selectedLesson.value && resetSelectedAndTargeted();
    return;
  }

  const { lesson } = editorCellLesson;
  if (lesson.consecutiveGroupId) {
    dialog.alertSimple('연속수업은 이동할 수 없습니다.');
    return;
  }

  // 이동 상태 변경
  currentEditState.value = TimetableEditState.MoveLesson;
  selectedLesson.value = lesson;

  if (lesson.concurrentCourseId) {
    // 동시 수업인 경우 처리
    // console.log('동시 수업', lesson);
    return;
  }

  // 수업 이동 가능한 대상 수업 찾기
  targetLessons.value = Timetable.findOneToOneExchangeableLessons(lesson);
  chainExchangeableResults.value =
    Timetable.findChainExchangeableLessons(lesson);
};

const refreshTeacherFreePeriodsCount = () => {
  // 수업 빼기 추가/삭제시에 랜더링을 다시 하기 위함
  teacherFreePeriodsCount.value = teacher.value?.freePeriods?.length || 0;
};

const assignTeacherPeriodItemManually = (dayOfWeek: number, period: number) => {
  if (!selectedTeacherPeriodItem.value) {
    return;
  }

  if (selectedTeacherPeriodItem.value.lessonConf.concurrentCourseId) {
    // 동시 수업 --> 임시 구현 2025.03.18
    console.log('동시 수업', selectedTeacherPeriodItem.value);

    // 동시 수업에 속한 모든 수업을 가져온다.
    const concurrentLessonConfs = lessonConfsMapByConcurrentCourse.value[selectedTeacherPeriodItem.value.lessonConf.concurrentCourseId];

    console.log('concurrentLessonConfs', concurrentLessonConfs);

    const timetablePeriod = { dayOfWeek, period } as TimetablePeriod;
    concurrentLessonConfs.forEach((conf) => {
      Timetable.assignLessonConfManually(timetablePeriod, conf);
    });

    props.onChangeLesson && props.onChangeLesson();

    return;
  }

  // 해당 시간에 이미 수업이 있거나, 학년의 수업 없음 이면 배정 불가능
  if (
    lessonByTeacherAndPeriod(dayOfWeek, period) ||
    checkTeacherFreeTime(dayOfWeek, period) ||
    checkGradeFreePeriod(dayOfWeek, period)
  ) {
    console.log(
      '수업 배정 불가. (배정 수업 있음 or 학년 수업 없음 or 교사 수업 빼기)'
    );
    return;
  }

  const timetablePeriod = { dayOfWeek, period } as TimetablePeriod;
  const lessonConf = selectedTeacherPeriodItem.value.lessonConf;

  Timetable.assignLessonConfManually(timetablePeriod, lessonConf);

  props.onChangeLesson && props.onChangeLesson();

  resetEditState();
  resetRefsForEdit();
};

const addTeacherFreePeriod = (dayOfWeek: number, period: number) => {
  if (!teacher.value) {
    return;
  }

  // const isGradeFreePeriod = checkGradeFreePeriod(dayOfWeek, period);
  // console.log('isGradeFreePeriod', isGradeFreePeriod);

  // 해당 시간에 이미 수업이 있으면 배정 불가능
  if (lessonByTeacherAndPeriod(dayOfWeek, period)) {
    // console.log('이미 수업이 있는 시간이입니다.');
    return;
  }

  // 수업 배정
  Timetable.addTeacherFreePeriod(teacher.value.teacherId, dayOfWeek, period);
  refreshTeacherFreePeriodsCount();

  resetEditState();
  resetRefsForEdit();
};

const checkTeacherFreeTime = (dayOfWeek: number, period: number): boolean => {
  if (!teacher.value || !teacher.value.freePeriods) {
    return false;
  }

  return teacher.value.freePeriods.some(
    (freePeriod) =>
      freePeriod.dayOfWeek === dayOfWeek && freePeriod.period === period
  );
};

const resetEditState = () => {
  currentEditState.value = TimetableEditState.None;
};

const resetRefsForEdit = () => {
  resetSelectedAndTargeted();
  resetSelectedTeacherPeriodItem();
};

const targetedClassLessons = computed(() => {
  return !targetedClass.value
    ? {}
    : lessonByClass.value[targetedClass.value.classId];
});

const getEditorCellLessonByPeriod = (
  dayOfWeek: number,
  period: number
): EditorCellLesson => {
  // 교사 수업 빼기 시간이 있는 경우
  if (checkTeacherFreeTime(dayOfWeek, period)) {
    return {
      isFreePeriod: true,
    };
  }

  // 교사의 수업이 있는 경우
  const teacherLesson = lessonByTeacherAndPeriod(dayOfWeek, period);
  if (teacherLesson) {
    return { lesson: teacherLesson };
  }

  // 맞교환 수업이 있는 경우
  const targetedLesson = oneToOneExchangeableLessonWithPeriod(
    dayOfWeek,
    period
  );
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

  // 수업 배정 상태이고, 선택된 학급의 수업이 있는 경우
  const classLesson = lessonByClassAndPeriod(dayOfWeek, period);
  if (classLesson) {
    return { lesson: classLesson, isReadOnly: true };
  }

  // 동시 수업에 속한 교사의 수업이 있는 경우 확인
  const lessonsOfConcurrentTeachers = lessonByConcurrentCourse(
    dayOfWeek,
    period
  );

  if (lessonsOfConcurrentTeachers.length > 0) {
    /*
    console.log(
      '동시수업 교사의 수업 >>>>>',
      dayOfWeek,
      period,
      lessonsOfConcurrentTeachers
    );
    */

    return {
      lesson: lessonsOfConcurrentTeachers[0],
      isConcurrentTeacherLesson: true,
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

const checkGradeFreePeriod = (dayOfWeek: number, period: number) => {
  if (!freePeriodsOfTargetedGrade.value) {
    return false;
  }

  return freePeriodsOfTargetedGrade.value.some(
    (freePeriod) =>
      freePeriod.dayOfWeek === dayOfWeek && freePeriod.period === period
  );
};

const lessonByTeacherAndPeriod = (dayOfWeek: number, period: number) => {
  const teacherId = teacher.value?.teacherId;
  if (!teacherId) {
    return undefined;
  }

  const lessons = lessonByTeacher.value[teacherId];
  if (!lessons) {
    return undefined;
  }

  const periodLessons = lessons.filter(
    (lesson) => lesson.dayOfWeek === dayOfWeek && lesson.period === period
  );

  const lesson = periodLessons.length > 0 ? periodLessons[0] : undefined;

  if( !lesson) {
    return undefined;
  }

  if(periodLessons.length > 1) {
    lesson.lessonClasses = periodLessons.map(l => l.classId) || [];
  }

  return lesson;
};

const lessonByClassAndPeriod = (dayOfWeek: number, period: number) => {
  if (currentEditState.value !== TimetableEditState.AssignLesson) {
    return undefined;
  }

  const subKey = `${dayOfWeek}-${period}`;

  const lesson = targetedClassLessons.value?.[subKey];
  if (!lesson) {
    return undefined;
  }
  
  const course = courseMap.value[lesson.courseId];
  if (!course) {
    return undefined;
  }

  return {
    ...lesson,
    courseName: course.displayedTitle,
  } as Lesson;
};

// 동시 수업인 경우 동시수업에 속한 교사들의 수업
const lessonByConcurrentCourse = (dayOfWeek: number, period: number) => {
  const lessonConf = selectedTeacherPeriodItem.value?.lessonConf;

  if (!lessonConf?.concurrentCourseId) {
    return [];
  }

  // 동시수업에 속한 교사들의 id
  const concurrentCourseId = lessonConf.concurrentCourseId;
  const teacherIds = lessonConfsMapByConcurrentCourse.value[concurrentCourseId].map(
    (conf) => conf.teacherId
  );
  
  const lessonsOfTeachers = props.assignedLessons.filter((lesson) => {
    return (
      lesson.dayOfWeek === dayOfWeek &&
      lesson.period === period &&
      lesson.lessonTeachers?.some((teacher) =>
        teacherIds.includes(teacher.teacherId)
      )
    );
  });

  return lessonsOfTeachers;
};

const oneToOneExchangeableLessonWithPeriod = (
  dayOfWeek: number,
  period: number
) => {
  return targetLessons.value.find(
    (lesson) => lesson.dayOfWeek === dayOfWeek && lesson.period === period
  );
};

const chainExchangeableWithPeriod = (dayOfWeek: number, period: number) => {
  const res = chainExchangeableResults.value.find((result) => {
    const { targetLesson } = result;
    return (
      targetLesson.dayOfWeek === dayOfWeek && targetLesson.period === period
    );
  });

  return res;
};

const getCurrentTeacherPeriodList = (): TeacherPeriodListItem[] => {
  if (!teacher.value) {
    return [];
  }

  const overview = Timetable.getTeacherOverview(teacher.value.teacherId);

  if (!overview) {
    return [];
  }

  const remainingCountMap = overview.remainingLessonConfs?.reduce(
    reduceCountLessonConfMap,
    {} as Record<string, number>
  );

  const assignedCountMap = overview.assignedLessonConfs.reduce(
    reduceCountLessonConfMap,
    {} as Record<string, number>
  );

  const teacherLessonConfs = lessonConfsMapByTeacher.value[teacher.value.teacherId];

  const result = [
    ...teacherLessonConfs,
  ].reduce((acc, conf) => {
    if (!conf.lessonConfId || acc[conf.lessonConfId]) {
      return acc;
    }

    const course = courseMap.value[conf.courseId];
    
    let concurrentCourseTitle = '';
    if (conf.concurrentCourseId) {
      const concurrentCourse = courseMap.value[conf.concurrentCourseId];
      concurrentCourseTitle = concurrentCourse.displayedTitle;
    }

    const remainingCount = remainingCountMap[conf.lessonConfId]
      ? remainingCountMap[conf.lessonConfId]
      : 0;

    const assignedCount = (
      assignedCountMap[conf.lessonConfId]
        ? assignedCountMap[conf.lessonConfId]
        : course.periodCount
    ) as number;

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
    };

    return acc;
  }, {} as Record<string, TeacherPeriodListItem>);

  return Object.values(result).sort(sortTeacherPeriodList);
};


const sortTeacherPeriodList = (
  a: TeacherPeriodListItem,
  b: TeacherPeriodListItem
) => {
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

const reduceCountLessonConfMap = (
  acc: Record<string, number>,
  conf: LessonConf
) => {
  if (!acc[conf.lessonConfId]) {
    acc[conf.lessonConfId] = 1;
  } else {
    acc[conf.lessonConfId] += 1;
  }

  return acc;
};

const getExtraInfoText = (conf: LessonConf) => {
  const infos = [];

  if (CommonUtils.isNotEmptyString(conf.concurrentCourseId)) {
    infos.push('동시');
  }

  if (CommonUtils.isNotEmptyString(conf.consecutivePeriod)) {
    infos.push('연속');
  }

  if (CommonUtils.isNotEmptyString(conf?.specialtyRoomId)) {
    infos.push('특별실');
  }

  return infos.join(', ');
};

const resetSelectedAndTargeted = () => {
  selectedLesson.value = null;
  targetLessons.value = [];
  selectedChainExchangeable.value = null;
  chainExchangeableResults.value = [];
  showExchangeDialog.value = false;
};

const resetSelectedTeacherPeriodItem = () => {
  selectedTeacherPeriodItem.value = null;
};
</script>

<style scoped>
.timetable-frame {
  width: 100%;
  margin: 5px 10px;
  padding: 0px 0px !important;
}

.timetable-row {
  display: flex;
}

.timetable-head-row {
  display: flex;
  font-weight: bold;
  background-color: #d8d8d8;
}

.timetable-head-row > .timetable-col {
  display: grid;
  place-items: center;
}

.timetable-no {
  width: 10%;
  padding: 5px 5px;
  border-bottom: 1px solid #bcbcbc;
  border-right: 1px solid #bcbcbc;
  display: grid;
  place-items: center;
  background-color: #d8d8d8;
}

.timetable-col {
  width: 18%;
  min-height: 36px;
  height: 60px;
  /* padding: 5px 5px; */
  border-bottom: 1px solid #bcbcbc;
  border-right: 1px solid #bcbcbc;
}

.full-height {
  height: 100vh;
}

.full-width {
  width: 100%;
}

.selected-lesson {
  /* background-color: #5ccdcd; */
  background-color: #7efefd;
  color: #173333;
}

.targeted-lesson {
  /* background-color: #ffff56; */
  background-color: #08ff00;
}

.no-border {
  border: none;
}

.assign-teacher-free-time-on {
  /* color: red !important; */
  background-color: #7efefd !important;
}

.remaining-period {
  font-weight: bold;
  color: red;
}

.teacher-lesson-conf-table {
  width: 100%;
  border-collapse: collapse;
  /* background-color: #fff; */
}

 .q-table--horizontal-separator tbody tr:not(:last-child) > td, .q-table--cell-separator thead th, .q-table--cell-separator tbody tr:not(:last-child) > td {
    border-bottom-width: 1px;
}

.teacher-lesson-conf-table th, .teacher-lesson-conf-table td {
    padding: 7px 16px;
    background-color: inherit;
}


.teacher-lesson-conf-table thead, .teacher-lesson-conf-table tr, .teacher-lesson-conf-table th, .teacher-lesson-conf-table td {
    border-color: rgba(0, 0, 0, 0.12);
}

.teacher-lesson-conf-table thead tr, .teacher-lesson-conf-table tbody td {
    height: 48px;
}

.teacher-lesson-conf-table thead, .teacher-lesson-conf-table td, .teacher-lesson-conf-table th {
    border-style: solid;
    border-width: 0;
}
</style>
