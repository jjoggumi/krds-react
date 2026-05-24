<template>
  <q-page>
    <div class="row button-row">
      <div class="col q-pt-md q-pl-md text-left q-gutter-xs">
        <q-btn-dropdown
          flat
          class="text-grey-10 q-ml-md"
          :label="showTypeTitle"
        >
          <q-list>
            <q-item
              v-for="item in [
                ShowType.Class,
                ShowType.Teacher,
                ShowType.Detail,
              ]"
              clickable
              close-popup
              @click="() => handleClickShowType(item)"
              :key="item"
            >
              <q-item-section>
                <q-item-label>{{ getTitleByShowType(item) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn
          v-if="!isShowDetailType"
          flat
          class="q-ml-md"
          label="선택 초기화"
          @click="handleClickResetSelected"
        />
      </div>

      <div class="col q-pt-md q-pr-md text-right q-gutter-xs">
        <q-btn
          class="q-mr-xs q-ml-xs q-pa-sm"
          unelevated
          color="grey-4 text-grey-8"
          label="초기화"
          @click="handleClickInitLessons"
        />
        <q-btn
          class="q-mr-xs q-ml-xs q-pa-sm"
          unelevated
          color="grey-4 text-grey-8"
          label="시간표 생성하기"
          :disable="isGenerating"
          @click="handleClickBtnGenerate"
        />
        <q-btn
          unelevated
          color="grey-4 text-grey-8"
          label="불러오기"
          class="q-mr-xs q-ml-xs q-pa-sm"
          @click="handleClickRestore"
        />
        <q-btn
          unelevated
          label="저 장"
          class="q-mr-xs q-ml-xs q-pa-sm"
          color="grey-4 text-grey-8"
          @click="handleClickStoreCurrentState"
        />
      </div>
    </div>

    <div
      class="row q-pt-md flex-1 text-center contents-row custom-scroll"
      v-if="!isShowDetailType"
    >
      <q-card
        bordered
        class="timetable-frame no-shadow"
        v-for="tableItem in tableItemList"
        :key="tableItem.id"
      >
        <q-card-section>
          <div class="text-left">
            <span class="text-subtitle1">{{ tableItem.title }}</span>
            <span class="text-subtitle1 text-grey-8 q-mr-md q-ml-md">|</span>
            <span class="text-subtitle2 text-grey-8">{{
              tableItem && tableItem ? tableItem.subtitle : ''
            }}</span>
          </div>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
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
            <div
              v-for="dayOfWeek in 5"
              class="timetable-col"
              :key="`${tableItem.id}.${period}.${dayOfWeek}`"
            >
              <timetable-lesson-item
                :class="
                  lessonItemClass(
                    lessonByTableItemAndPeriod(tableItem, dayOfWeek, period)
                  )
                "
                :show-type="showType"
                :lesson="
                  lessonByTableItemAndPeriod(tableItem, dayOfWeek, period)
                "
                :is-targeted="
                  isExchangeable(
                    lessonByTableItemAndPeriod(tableItem, dayOfWeek, period)
                  )
                "
                :on-click="handleClickLessonItem"
                :on-click-targeted="handleClickTargeted"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div
      class="row q-pt-md flex-1 text-center contents-row custom-scroll"
      v-if="isShowDetailType"
    >
      <div class="col q-pl-lg teachers-col custom-scroll">
        <teachers-table
          :teachers="teacherTableRows"
          :on-click="handleClickTeacher"
        />
      </div>
      <div class="col teacher-detail-col">
        <teacher-timetable-editor
          :selected-teacher="selectedTeacher"
          :timetable-config="timetableConfig"
          :assigned-lessons="lessons"
          :on-change-lesson="handleChangeLesson"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// This section is Typescript login only (no CSS)

// quasar 를 흉내낸 임시 컴포넌트 -->
import QPage from '@/apps/timetable/q-temp/QPage.vue';
import QBtnDropdown from '@/apps/timetable/q-temp/QBtnDropdown.vue';
import QList from '@/apps/timetable/q-temp/QList.vue';
import QItem from '@/apps/timetable/q-temp/QItem.vue';
import QItemSection from '@/apps/timetable/q-temp/QItemSection.vue';
import QItemLabel from '@/apps/timetable/q-temp/QItemLabel.vue';
import QCard from '@/apps/timetable/q-temp/QCard.vue';
import QCardSection from '@/apps/timetable/q-temp/QCardSection.vue';
import QBtn from '@/apps/timetable/q-temp/QBtn.vue';
import QSeparator from '@/apps/timetable/q-temp/QSeparator.vue';
// <-- quasar 를 흉내낸 임시 컴포넌트

import { computed, inject, onMounted, reactive, ref, watch } from 'vue';

import Timetable from '@/apps/timetable/core';
import {
  TimetableConfig,
  Lesson,
  Course,
  Class,
  Teacher,
  TeacherCourse,
  InitializeOption,
} from '@/apps/timetable/core/types';
import { TimetableDataUtils } from '@/apps/timetable/core/mod/utils';
import { useDialog } from '@/apps/timetable/composables/dialog';
import { LessonRepository } from '@/apps/timetable/repositories/lesson-repository';

import TimetableLessonItem from '@/apps/timetable/components/TimetableLessonItem.vue';
import TeacherTimetableEditor from '@/apps/timetable/components/TeacherTimetableEditor.vue';
import TeachersTable from '@/apps/timetable/components/TeachersTable.vue';
import { TeacherRow } from '@/apps/timetable/common/types';
import { ConcurrentConfContext, ContextKeys, FixedConfContext, LessonConfContext, LessonContext, SpecialtyRoomContext, TeacherCourseContext, TimetableClassContext, TimetableCourseContext, TimetableGradeContext, TimetableTeacherContext } from '../contexts';

enum ShowType {
  Class = 'class',
  Teacher = 'teacher',
  Detail = 'detail',
}

enum ShowTypeTitle {
  Class = '반별 시간표',
  Teacher = '교사 시간표',
  Detail = '상세 설정',
}

interface TableItem {
  id: string;
  title: string;
  subtitle?: string;
  entity: Class | Teacher;
}

const dialog = useDialog();

const showType = ref(ShowType.Detail);
const selectedLesson = ref<Lesson | null>(null);
const targetLessons = ref([] as Lesson[]);
const isGenerating = ref(false);

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const fixedConfContext = inject(ContextKeys.FixedConf) as FixedConfContext;
const concurrentConfContext = inject(ContextKeys.ConcurrentConf) as ConcurrentConfContext;
const specialtyRoomContext = inject(ContextKeys.SpecialtyRoom) as SpecialtyRoomContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;


/*
const timetableConfig = reactive({} as TimetableConfig);
const classes = ref([] as Class[]);
const courseMap = ref({} as Record<string, Course>);
const teachers = ref([] as Teacher[]);
const teacherCoursesMap = ref({} as Record<string, TeacherCourse[]>);
const lessons = ref([] as Lesson[]);
*/

const timetableConfig = computed(() => gradeContext.timetableConfig as TimetableConfig);
const classes = computed(() => classContext.classes as Class[]);
const courseMap = computed(() => courseContext.courseMap as Record<string, Course>);
// const teachers = computed(() => teacherContext.teachers as Teacher[]);
const teacherCourseMap = computed(() => teacherCourseContext.teacherCourseMap as Record<string, TeacherCourse[]>);
const lessons = computed({
  get() { 
    return lessonContext.lessons as Lesson[]; 
  },
  set(value: Lesson[]) {
    lessonContext.lessons = value;
  }
});

const teachers = ref([] as Teacher[]);

// lifecycle -------------------------
onMounted(async () => {
  // 테스트를 위함
  // restoreFromStorage();
  await initData();
});

const initData = async () => {
  // restoreFromStorage();
  await initTimeTableConfig();
  await initClasses();
  await initCourses();
  await initTeachers();
  await initTeacherCourses();
  await initSpecialtyRooms();
  await initLessonConfs();
  await initFixedConfs();
  await initConcurrentCourseConfs();

  await initTimetableGenerator();

  await initSelectedTeacher();
};

const showLoadingGenerate = async () => {
  // $q.loading.show({    message: '시간표 생성 중...',  });
};

const hideLoading = () => {
  // $q.loading.hide();
};

const initTimeTableConfig = async () => {
  /*
  const { maxGrade, classDays, maxPeriod, grades } = await TimetableGradeRepository.getTimetableConfig();

  timetableConfig.maxGrade = maxGrade;
  timetableConfig.classDays = classDays;
  timetableConfig.maxPeriod = maxPeriod;
  timetableConfig.grades = grades;

  // TimetablGenerator에 데이터 설정
  Timetable.timetableConfig = {
    classDays,
    maxPeriod,
    maxGrade,
    grades,
  };
  */

  await gradeContext.reload();
  const { maxGrade, classDays, maxPeriod, grades } = gradeContext.timetableConfig;

  // TimetablGenerator에 데이터 설정
  Timetable.timetableConfig = {
    classDays,
    maxPeriod,
    maxGrade,
    grades,
  };
};

const initClasses = async () => {
  await classContext.reload();
  Timetable.context.classes = classContext.classes;
};

const initCourses = async () => {
  await courseContext.reload();
  Timetable.courses = courseContext.courses;
};

const initTeachers = async () => {
  await teacherContext.reload();
  Timetable.teachers = teacherContext.teachers;
};

const initTeacherCourses = async () => {
  await teacherCourseContext.reload();
  Timetable.teacherCourses = teacherCourseContext.teacherCourses;
};

const initSpecialtyRooms = async () => {
  await specialtyRoomContext.reload();
  Timetable.specialtyRooms = specialtyRoomContext.specialtyRooms;
};

const initLessonConfs = async () => {
  await lessonConfContext.reload();
  Timetable.lessonConfs = lessonConfContext.lessonConfs;
};

const initFixedConfs = async () => {
  await fixedConfContext.reload();
  Timetable.fixedConfs = fixedConfContext.fixedConfs;
};

const initConcurrentCourseConfs = async () => {
  await concurrentConfContext.reload();
  Timetable.concurrentCourseConfs = concurrentConfContext.concurrentConfs;
};

const initTimetableGenerator = async () => {
  // 생성되어있는 수업 목록이 없는 경우, 고정 수업등을 생성할 것인지 확인
  await lessonContext.reload();
  let presetedLessons = lessonContext.lessons as Lesson[];

  if (presetedLessons.length === 0) {
    presetedLessons = await Timetable.generateFixedLessons();
  }

  // 수업 목록이 있는 경우, 해당 목록을 셋팅
  Timetable.initWithPresetedLessons(presetedLessons);
  lessons.value = presetedLessons;
};

// computed values -------------------------
const showTypeTitle = computed(() => {
  return getTitleByShowType(showType.value);
});

const isShowClassType = computed(() => {
  return showType.value === ShowType.Class;
});

const isShowDetailType = computed(() => {
  return showType.value === ShowType.Detail;
});

const tableItemList = computed(() => {
  return isShowClassType.value ? classList.value : teacherList.value;
});

const teacherList = computed(() => {
  const isEmpty =
    Object.keys(teacherCourseMap.value).length === 0 ||
    Object.keys(courseMap.value).length === 0;
  if (isEmpty) {
    return [];
  }

  return teacherContext.teachers.map((teacher) => {

    const courses = (teacherCourseMap.value[teacher.teacherId] || []).map(
      ({ courseId }) => courseMap.value[courseId]
    ) as Course[];

    const courseNames = TimetableDataUtils.courseNames(courses)
      .sort()
      .join(', ');

    return {
      id: teacher.teacherId,
      title: `${teacher.teacherName} 선생님`,
      subtitle: courseNames,
      entity: { ...teacher, courses },
    } as TableItem;
  });
});

const classList = computed(() => {
  return classes.value
    .filter((cls) => {
      return cls.isVirtual === false;
    })
    .map((cls) => {
      return {
        id: cls.classId,
        title: `${cls.grade}학년 ${cls.classNumber}반`,
        entity: cls,
      } as TableItem;
    });
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

const lessonByTeacher = computed(() => {
  return lessons.value.reduce((acc, lesson) => {
    if (!lesson.lessonTeachers) {
      return acc;
    }

    lesson.lessonTeachers.forEach(({ teacherId }) => {
      if (!acc[teacherId]) {
        acc[teacherId] = [];
      }
      acc[teacherId].push(lesson);
    });

    return acc;
  }, {} as Record<string, Lesson[]>);
});

// methods -------------------------
const initSelectedTeacher = async () => {
  // teacherName으로 정렬
  selectedTeacher.value = teacherContext.teachers[0];
  /*
  const sortedTeachers = teacherContext.teachers.sort((a, b) => {
    return a.teacherName.localeCompare(b.teacherName);
  });

  selectedTeacher.value = sortedTeachers[0] || null;  
  */
};

const isExchangeable = (lesson?: Lesson) => {
  if (!lesson || !selectedLesson.value) {
    return false;
  }

  const isTargeted = targetLessons.value.some(
    (target) =>
      target.classId === lesson.classId &&
      target.dayOfWeek === lesson.dayOfWeek &&
      target.period === lesson.period
  );

  return isTargeted;
};

const lessonItemClass = (lesson?: Lesson) => {
  if (!lesson || !selectedLesson.value) {
    return {};
  }

  const {
    classId: selClassId,
    dayOfWeek: selDayOfWeek,
    period: selPeriod,
  } = selectedLesson.value;

  const {
    classId: lessonClassId,
    dayOfWeek: lessonDayOfWeek,
    period: lessonPeriod,
  } = lesson;

  const isTargeted = targetLessons.value.some(
    (target) =>
      target.classId === lesson.classId &&
      target.dayOfWeek === lesson.dayOfWeek &&
      target.period === lesson.period
  );

  const isSelected =
    selClassId === lessonClassId &&
    selDayOfWeek === lessonDayOfWeek &&
    selPeriod === lessonPeriod;

  return {
    'selected-lesson': isSelected,
    'targeted-lesson': isTargeted,
  };
};

const getTitleByShowType = (type: ShowType) => {
  switch (type) {
    case ShowType.Class:
      return ShowTypeTitle.Class;
    case ShowType.Teacher:
      return ShowTypeTitle.Teacher;
    case ShowType.Detail:
      return ShowTypeTitle.Detail;
  }
};

const lessonByTableItemAndPeriod = (
  tableItem: TableItem,
  dayOfWeek: number,
  period: number
) => {
  if (isShowClassType.value) {
    return lessonByClassAndPeriod(tableItem.id, dayOfWeek, period);
  }

  return lessonByTeacherAndPeriod(tableItem.id, dayOfWeek, period);
};

const lessonByTeacherAndPeriod = (
  teacherId: string | undefined,
  dayOfWeek: number,
  period: number
) => {
  if (!teacherId) {
    return undefined;
  }

  const lessons = lessonByTeacher.value[teacherId];
  if (!lessons) {
    return undefined;
  }

  const lesson = lessons.find(
    (lesson) => lesson.dayOfWeek === dayOfWeek && lesson.period === period
  );

  return lesson;
};

const lessonByClassAndPeriod = (
  classId: string,
  dayOfWeek: number,
  period: number
) => {
  const lesson = getLessonInfoByClass(classId, dayOfWeek, period);
  if (!lesson) {
    return undefined;
  }

  return lesson;
};

const getLessonInfoByClass = (
  classId: string,
  dayOfWeek: number,
  period: number
): Lesson | null => {
  const info = lessonByClass.value[classId];
  if (!info) {
    return null;
  }

  const subKey = `${dayOfWeek}-${period}`;
  const lesson = info[subKey];

  if (!lesson) {
    return null;
  }

  const course = Timetable.context.courseMap[lesson.courseId];
  if (!course) {
    return null;
  }

  return {
    ...lesson,
    courseName: course.displayedTitle,
  } as Lesson;
};

const resetSelectedAndTargeted = () => {
  selectedLesson.value = null;
  targetLessons.value = [];
};

const processGenerate = async () => {
  // 고정 수업 목록은 서버에서 불러와야 하나,테스트를 위해 프론트에서 미리 생성

  isGenerating.value = true;
  showLoadingGenerate();

  requestIdleCallback(
    async () => {
      // 고정 수업
      const fixedLessons = await Timetable.generateFixedLessons();

      // 개별 교사 수동 배정
      const manualLessons = lessons.value.filter((lesson) => {
        return lesson.isManuallyAssigned;
      });

      // 고정 수업과 수동 배정된 수업은 유지한다.
      const presetLessons = [...fixedLessons, ...manualLessons] as Lesson[];

      lessons.value = await Timetable.generate(presetLessons);
      isGenerating.value = false;
      hideLoading();
    },
    { timeout: 1000 }
  );
};

const handleClickInitLessons = async () => {
  console.log('handleInitLessons');

  try {
    const data = await dialog.qDialog({
      title: '초기화',
      message: '초기화 할 항목을 선택한 후 버튼을 눌러주세요.',
      ok: '선택사항으로 초기화',
      cancel: '취 소',
      options: {
        type: 'checkbox',
        model: [InitializeOption.AutoAssigned],
        items: [
          { label: '자동 배정', value: InitializeOption.AutoAssigned },
          { label: '동시 수업 고정', value: InitializeOption.FixedConcurrentCourse },
          { label: '개별 교사 수동 배정', value: InitializeOption.ManuallyAssigned },
          { label: '개별 교사 수업 빼기', value: InitializeOption.TeacherFreeTime }
        ]
      }
    }) as InitializeOption[];

    console.log('OK', data);
    initializeLessonsWithOptions(data);
  } catch (reason) {
    if (reason === 'cancel') {
      console.log('Cancel');
    } else if (reason === 'dismiss') {
      console.log('Dismiss');
    }
  }

  /*
  $q.dialog({
    title: '초기화',
    message: '초기화 할 항목을 선택한 후 버튼을 눌러주세요.?',
    ok: '선택사항으로 초기화',
    cancel: '취 소',
    options: {
      type: 'checkbox',
      model: [InitializeOption.AutoAssigned],
      items: [
        { label: '자동 배정', value: InitializeOption.AutoAssigned },
        {
          label: '동시 수업 고정',
          value: InitializeOption.FixedConcurrentCourse,
        },
        {
          label: '개별 교사 수동 배정',
          value: InitializeOption.ManuallyAssigned,
        },
        {
          label: '개별 교사 수업 빼기',
          value: InitializeOption.TeacherFreeTime,
        },
      ],
    },
  })
    .onOk((data) => {
      console.log('OK', data);
      initializeLessonsWithOptions(data);
    })
    .onCancel(() => {
      console.log('Cancel');
    })
    .onDismiss(() => {
      console.log('Dismiss');
    });
  */
};

const initializeLessonsWithOptions = async (options: InitializeOption[]) => {
  const initializedLessons = lessons.value.filter((lesson) => {
    if (
      options.includes(InitializeOption.ManuallyAssigned) &&
      lesson.isManuallyAssigned
    ) {
      // 개별 교사 수동 배정
      return false;
    }

    if (
      options.includes(InitializeOption.FixedConcurrentCourse) &&
      lesson.concurrentCourseId &&
      lesson.isFixedCourse
    ) {
      // 동시 수업 고정
      return false;
    }

    if (
      options.includes(InitializeOption.AutoAssigned) &&
      !lesson.isManuallyAssigned &&
      !lesson.isFixedCourse
    ) {
      // 자동 배정
      return false;
    }

    return true;
  });

  // 동시 수업 고정 해제
  if (options.includes(InitializeOption.FixedConcurrentCourse)) {
    const concurrentCourseConfs = Timetable.context.concurrentCourseConfs;
    const conscurrentCourseIds = concurrentCourseConfs.map(
      (conf) => conf.courseId
    );

    if (conscurrentCourseIds.length > 0) {
      // await FixedConfService.deleteByIds(conscurrentCourseIds);
      // await initFixedConfs();
      fixedConfContext.deleteByIds(conscurrentCourseIds);
      fixedConfContext.reload();
    }
  }

  // 교사 수업 빼기 초기화
  if (options.includes(InitializeOption.TeacherFreeTime)) {
    Timetable.resetAllTeacherFreePeriods();
  }

  Timetable.initWithPresetedLessons(initializedLessons);
  lessons.value = initializedLessons;
};

const handleClickBtnGenerate = async () => {
  if (isGenerating.value) {
    console.log('!!!!!!!!!!!! IS GENERATING !!!!!!!!!!!!');
    return;
  }

  // 필요시 조건 검사
  await processGenerate();

  console.log('After process ===========================');
};

const handleClickLessonItem = (lesson: Lesson) => {
  if (!lesson && selectedLesson.value) {
    resetSelectedAndTargeted();
    return;
  }

  if (!lesson) {
    return;
  }

  selectedLesson.value = lesson;
  targetLessons.value = Timetable.findOneToOneExchangeableLessons(lesson);
};

const handleClickTargeted = (lesson: Lesson) => {
  /*
  lessons.value = Timetable.exchageOneToOneLessons(
    selectedLesson.value!,
    lesson
  );
  */

  if (!selectedLesson.value) {
    return;
  }

  lessons.value = Timetable.chainExchangeLessons([
    selectedLesson.value,
    lesson,
  ]);
  resetSelectedAndTargeted();
};

const handleClickShowType = (type: ShowType) => {
  resetSelectedAndTargeted();
  showType.value = type;
};


const handleClickResetSelected = () => {
  selectedLesson.value = null;
  targetLessons.value = [];
};

const handleClickStoreCurrentState = async () => {
  const msg = '배정된 수업을 브라우저에 저장합니다.';
  const result = await dialog._confirm(msg);

  if (!result) {
    return;
  }

  await LessonRepository.setLessons(lessons.value);

  // Timetable.storeCurrentState();
};

const handleClickRestore = async () => {
  const msg = '브라우저에서 이전에 저장된 배정 수업을 불러옵니다.';
  const result = await dialog._confirm(msg);

  if (!result) {
    return;
  }

  const presetedLessons = await LessonRepository.getLessons();
  if (!presetedLessons || presetedLessons.length === 0) {
    dialog.alertSimple('저장된 수업이 없습니다.');
    return;
  }

  // 수업 목록이 있는 경우, 해당 목록을 셋팅
  Timetable.initWithPresetedLessons(presetedLessons);
  lessons.value = presetedLessons;

  // restoreFromStorage();
};

/* 여기서 부터 - Deail 설정 에서 사용하는 요소들 */
const selectedTeacher = ref<Teacher | null>(null);

const teacherTableRows = computed(() => {
  return teacherList.value.map((item) => {
    return {
      id: item.id,
      title: (item.entity as Teacher).teacherName,
      subtitle: item.subtitle,
    } as TeacherRow;
  });
});

const handleClickTeacher = (teacherRow: TeacherRow) => {
  if (!teacherRow) {
    return;
  }

  const teacher = teachers.value.find((t) => t.teacherId === teacherRow.id);
  if (!teacher) {
    return;
  }

  resetSelectedAndTargeted();

  selectedTeacher.value = teacher;
};

const handleChangeLesson = () => {
  lessons.value = Timetable.currentAssignedLessons;
};


/* old code
const handleClickBtnClassTimetable = () => {
  showType.value = ShowType.Class;
};

const handleClickBtnTeacherTimetable = () => {
  showType.value = ShowType.Teacher;
};

const restoreFromStorage = () => {
  const reloadedLessons = Timetable.restoreState();

  const { classDays, maxPeriod, maxGrade, grades } =
    Timetable.context.timetableConfig;

  timetableConfig.classDays = classDays;
  timetableConfig.maxPeriod = maxPeriod;
  timetableConfig.maxGrade = maxGrade;
  timetableConfig.grades = grades;

  classes.value = Timetable.context.classes;
  teachers.value = Timetable.context.teachers;

  lessons.value = reloadedLessons;

  console.log('timetable:', Timetable.context);

  initSelectedTeacher();
};


const loadFromJson = () => {
  const { classDays, maxPeriod, maxGrade, grades } = timetableGrade;

  timetableConfig.classDays = classDays;
  timetableConfig.maxPeriod = maxPeriod;
  timetableConfig.maxGrade = maxGrade;
  timetableConfig.grades = grades;

  // Generator에 데이터 설정
  Timetable.timetableConfig = {
    classDays,
    maxPeriod,
    maxGrade,
    grades,
  };

  Timetable.classes = classesFromJson;
  Timetable.courses = coursedFromJson;
  Timetable.teachers = teachersFromJson;
  Timetable.specialtyRooms = specialtyRoomsFromJson;

  Timetable.teacherCourses = teacherCoursesFromJson;
  Timetable.lessonConfs = lessonConfsFromJson;
  Timetable.fixedConfs = fixedConfsFromJson;
  Timetable.concurrentCourseConfs = concurrentCourseConfsFromJson;

  classes.value = Timetable.context.classes;
  teachers.value = Timetable.context.teachers;

  // selectedTeacher.value = teachers.value[0] || null;
  initSelectedTeacher();
};
*/

</script>

<style scoped>
.button-row {
  flex: 0;
  max-height: 75px;
}

.contents-row {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: auto;
}

.teachers-col {
  max-width: 450px;
  flex: 1;
  overflow: auto;
  height: 100%;
}

.teacher-detail-col {
  flex: 1;
  overflow: auto;
  margin-left: 20px;
  padding: 20px;
  background-color: #ffffff;
}

.timetable-frame {
  width: 100%;
  max-width: 600px;
  margin: 5px 10px;
}

.detail-timetable-frame {
  width: 100%;
  margin: 5px 10px;
}

.timetable-row {
  display: flex;
}

.timetable-head-row {
  display: flex;
  font-weight: bold;
}

.timetable-no {
  width: 10%;
  padding: 5px 5px;
  border-bottom: 1px solid #ccc;
  border-right: 1px solid #ccc;
}

.timetable-col {
  width: 18%;
  min-height: 36px;
  /* padding: 5px 5px; */
  border-bottom: 1px solid #ccc;
  border-right: 1px solid #ccc;
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


.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #ddd #f1f1f1;
}

.custom-scroll::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
