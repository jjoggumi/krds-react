<template>
  <q-dialog v-model="isShowModal" @hide="handleHideDialog" persistent>
    <q-card class="column full-width">
      <q-card-section>
        <div class="text-h5 text-bold">동시 수업 고정 시간표</div>
      </q-card-section>
      <q-card-section horizontal class="q-pl-lg row">
        <div class="select-field-label col-3">학년 선택</div>
        <q-card-section horizontal class="q-pt-md col">
          <div class="q-gutter-sm">
            <q-radio
              v-for="gr in timetableConfig.grades"
              v-model="grade"
              :val="gr.grade"
              :label="`${gr.grade}학년`"
              :key="`sel-grade-${gr.grade}`"
            />
          </div>
        </q-card-section>
      </q-card-section>
      <q-card-section class="q-pa-lg timetable-contents-section">
        <div class="timetable-head-row">
          <div class="timetable-no">교시</div>
          <div class="timetable-col col-weekday">월</div>
          <div class="timetable-col col-weekday">화</div>
          <div class="timetable-col col-weekday">수</div>
          <div class="timetable-col col-weekday">목</div>
          <div class="timetable-col col-weekday">금</div>
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
            :key="`p-${period}-day-${dayOfWeek}`"
            
          >
            <fixed-conf-course-cell
              :item="fixedCourseByPeriod(dayOfWeek, period)"
              :is-free-period="checkFreePeriods(dayOfWeek, period)"
              :on-click-delete-button="
                () => {
                  handleClickDeleteFixcedConf(dayOfWeek, period);
                }"
                
              :on-click-empty-cell="
                (event) => {
                   handleClickEmptyCell(dayOfWeek, period, event)
                }"
            />
          </div>
        </div>
      </q-card-section>
      <q-menu
        v-model="menuShow"
        anchor="bottom left"
        self="top left"
        :target="menuTarget"
        @hide="handleHideMenu"
      >
        <div class="menu-content">
          <q-list>
            <q-item
              v-for="(menuItem, idx) in selectableCourses"
              clickable
              close-popup
              @click="() => handleClickFixedMenuItem(menuItem)"
              @close-popup="handleHideMenu"
              :key="`mn-${idx}`"
            >
              <q-item-section>{{
                `${menuItem.displayedTitle}`
              }}</q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-menu>

      <q-card-actions align="center" class="q-pb-md">
        <!--
        <q-btn
          flat
          size="md"
          label="취 소"
          class="bg-white text-grey q-mr-lg"
          @click="handleClose"
        />
        -->
        <q-btn
          flat
          label="확 인"
          class="bg-white text-teal"
          @click="handleClickSubmit"
        />
      </q-card-actions>
    </q-card>

    <q-dialog v-model="isShowSelectConsecutive" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="q-pb-sm">
          <div
            class="text-subtitle1 q-mt-md q-ml-sm q-mr-sm text-center text-bold"
          >
            고정으로 등록할 수업 시수를 선택하세요.
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none q-mt-none">
          <div class="row">
            <div class="offset-4 col-4">
              <q-select
                v-model="selectedConsecutive"
                :options="consecutivePeriodOptions"
                :option-label="(opt) => `${opt}시간`"
                borderless
                dense
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn
            flat
            label="취 소"
            @click="handleClickCancelSelectConsecutive"
          />
          <q-btn
            flat
            label="확 인"
            @click="handleClickSubmitSelectConsecutive"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup lang="ts">
// quasar 를 흉내낸 임시 컴포넌트 -->
import QDialog from '@/apps/timetable/q-temp/QDialog.vue';
import QCard from '@/apps/timetable/q-temp/QCard.vue';
import QCardSection from '@/apps/timetable/q-temp/QCardSection.vue';
import QBtn from '@/apps/timetable/q-temp/QBtn.vue';
import QSelect from '@/apps/timetable/q-temp/QSelect.vue';
import QMenu from '@/apps/timetable/q-temp/QMenu.vue';
import QList from '@/apps/timetable/q-temp/QList.vue';
import QItem from '@/apps/timetable/q-temp/QItem.vue';
import QItemSection from '@/apps/timetable/q-temp/QItemSection.vue';
import QRadio from '@/apps/timetable/q-temp/QRadio.vue';
import QCardActions from '@/apps/timetable/q-temp/QCardActions.vue';
// <-- quasar 를 흉내낸 임시 컴포넌트

import {
  ConcurrentConf,
  Course,
  FixedConf,
  TimetableConfig,
} from '@/apps/timetable/core/types';
import { computed, onMounted, reactive, ref, watch, defineProps, inject } from 'vue';

import FixedConfCourseCell from '@/apps/timetable/components/FixedConfCourseCell.vue';
import { useDialog } from '@/apps/timetable/composables/dialog';
import { ArrayUtils } from '@/apps/timetable/common/utils';
import { ConcurrentConfContext, ContextKeys, FixedConfContext, TimetableCourseContext } from '../contexts';

// defineOptions({  name: 'FixedConfDialog',});

const props = defineProps<{
  // showFixedConfDialog?: boolean;
  timetableConfig: TimetableConfig;
  selectedGrade: number;
  onCancel: () => void;
  onSubmit: () => void;
}>();

const dialog = useDialog();

const clickTest = () => {
  // console.log('!!!! clickTest !!!!');
};

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const concurrentConfContext = inject(ContextKeys.ConcurrentConf) as ConcurrentConfContext;
const fixedConfContext = inject(ContextKeys.FixedConf) as FixedConfContext;

// const courses = ref([] as Course[]);
// const concurrentConfs = ref([] as ConcurrentConf[]);
// const fixedConfs = ref([] as FixedConf[] | null);
const courses = computed(() => courseContext.courses as Course[]);
const concurrentConfs = computed(() => concurrentConfContext.concurrentConfs as ConcurrentConf[]);
const fixedConfs = computed(() => fixedConfContext.fixedConfs as FixedConf[] | null);


const grade = ref(1);
// const isShowModal = ref(false);
const isShowModal = ref(true);

const _menuShow = ref(false);
const menuTarget = ref<Element | undefined>(undefined);
const isShowSelectConsecutive = ref(false);
const selectableCourses = ref([] as Course[]);

// 고정 할당 데이터
interface FixedConfProcessData {
  dayOfWeek: number;
  period: number;
  courseId: string;
  consecutivePeriod: number;
}

const fixedConfProcessData = reactive<FixedConfProcessData>({
  dayOfWeek: -1,
  period: -1,
  courseId: '',
  consecutivePeriod: 0,
});

const consecutivePeriodOptions = ref([] as number[]);

// const selectedPeriod = ref<PeriodTuple | null>(null);
const selectedConsecutive = ref(1);
// const fixedConfProcessData = ref<FixedConfProcessData | null>(null);

const resetFixedConfProcessData = () => {
  fixedConfProcessData.dayOfWeek = -1;
  fixedConfProcessData.period = -1;
  fixedConfProcessData.courseId = '';
  fixedConfProcessData.consecutivePeriod = 0;
};

watch(
  () => props.selectedGrade,
  (value) => {
    grade.value = value;
  }
);

// q-menu 가 다른 곳을 클릭하여도 열리는 문제를 해결하기 위해,
// click 이벤트가 아닌 다른 곳에서 menuShow를 변경하는 경우, target의 유무를 판단하여 menuShow를 변경한다.
const menuShow = computed({
  get: () => _menuShow.value,
  set: (val) => {
    if (val === true && !menuTarget.value) {
      _menuShow.value = false;
      return;
    }
    else if(val === false && menuTarget.value) {
      menuTarget.value = undefined;
    }

    _menuShow.value = val;
  },
});

const courseMap = computed(() => {
  return courses.value.reduce((acc, course) => {
    acc[course.courseId] = course;
    return acc;
  }, {} as Record<string, Course>);
});

const concuurentCourseGradeMap = computed(() => {
  if (!concurrentConfs.value) {
    return {};
  }

  return concurrentConfs.value.reduce((acc, conf) => {
    if (!acc[conf.grade]) {
      acc[conf.grade] = [];
    }

    const crs = courseMap.value[conf.courseId];
    acc[conf.grade].push([conf, crs]);

    return acc;
  }, {} as Record<number, [ConcurrentConf, Course][]>);
});

const fixedConfCourseGradeMap = computed(() => {
  if (!fixedConfs.value) {
    return {};
  }

  return fixedConfs.value.reduce((acc, conf) => {
    if (!acc[conf.grade]) {
      acc[conf.grade] = [];
    }

    const crs = courseMap.value[conf.courseId];
    acc[conf.grade].push([conf, crs]);

    return acc;
  }, {} as Record<number, [FixedConf, Course][]>);
});

const fixedConfCourseOfSelectedGrade = computed(() => {
  if (!fixedConfCourseGradeMap.value[grade.value]) {
    return [];
  }

  return fixedConfCourseGradeMap.value[grade.value];
});

watch(
  () => isShowModal.value,
  (newVal) => {
    // console.log(">>>> isShowModal", isShowModal.value, newVal);
  },
  { immediate: true }
);

onMounted(async () => {
  isShowModal.value = true;
  grade.value = props.selectedGrade;
  await initData();
});

const initData = async () => {
  await courseContext.reload();
  await concurrentConfContext.reload();
  await fixedConfContext.reload();
};


const handleClickSubmit = () => {
  // 닫기
  // isShowModal.value = false;
  resetFixedConfProcessData();

  props.onSubmit && props.onSubmit();
};

const handleClose = () => {
  props.onCancel && props.onCancel();
};

const handleHideDialog = () => {
  props.onCancel && props.onCancel();
};

const handleHideMenu = () => {
  menuTarget.value = undefined;
  menuShow.value = false;
};

const handleClickEmptyCell = (
  dayOfWeek: number,
  period: number,
  event: Event
) => {
  event.stopPropagation();

  if (menuTarget.value) {
    // 이전 타겟이 존재하면 열린 상태로 판단. (닫기 위한 클릭)
    return;
  }

  // 빈 셀이 아닌 경우
  if (fixedCourseByPeriod(dayOfWeek, period)) {
    return;
  } else if (checkFreePeriods(dayOfWeek, period)) {
    return;
  }

  // selectedPeriod.value = [dayOfWeek, period];
  fixedConfProcessData.dayOfWeek = dayOfWeek;
  fixedConfProcessData.period = period;

  openSelectCourseMenu(event.currentTarget as Element);
  getMenuItems();
};

const handleClickFixedMenuItem = async (course: Course) => {
  const { courseId, periodCount } = course;

  if (
    fixedConfProcessData.dayOfWeek < 0 ||
    fixedConfProcessData.period < 0 ||
    !periodCount
  ) {
    console.error('데이터 오류');
    resetFixedConfProcessData();
    return;
  }

  // 고정 수업 데이터 설정
  const concurrentConf = concurrentConfs.value.find(
    (conf) => conf.courseId === courseId
  );

  if (!concurrentConf) {
    console.error('선택된 고정 수업 없음');
    resetFixedConfProcessData();
    return;
  }

  // 이미 고정 수업에 배정된 시수: 연속이 아니어도 1로 설정
  const fixedConsecutives = getFixedPeriodCounts(course);

  // 이미 고정 수업에 배정된 시수의 합계: 배정 가능 시수를 계산하기 위함
  const sumFixed = fixedConsecutives.reduce((acc, p) => acc + p, 0);

  // 남은 시수
  const remainCount = periodCount - sumFixed;
  if (remainCount <= 0) {
    dialog.alertSimple('더 이상 배정할 수 없습니다.');
    resetFixedConfProcessData();
    return;
  }

  // 할당 가능한 시수 확인
  if (concurrentConf && concurrentConf.consecutivePeriod) {
    // 선택할 수 있는 연속 시수
    const courseConsecutives = concurrentConf.consecutivePeriod
      .split(',')
      .map((p) => parseInt(p.trim()));

    const remainConsecutives = ArrayUtils.substractNumberArrays(
      courseConsecutives,
      fixedConsecutives
    );

    // 중복된 숫자는 제거한다
    consecutivePeriodOptions.value = Array.from(new Set(remainConsecutives));
  } else {
    consecutivePeriodOptions.value = [1];
  }

  fixedConfProcessData.courseId = courseId;

  // 선택 가능한 시수가 하나인 경우, 바로 할당 진행.
  if (consecutivePeriodOptions.value.length === 1) {
    fixedConfProcessData.consecutivePeriod = consecutivePeriodOptions.value[0];
    await processFixedConf(consecutivePeriodOptions.value[0]);
    return;
  }

  // 선택 가능한 시수가 여러개인 경우,  선택할 수 있도록 팝업을 띄운다. (가장 큰 수를 기본값으로)
  selectedConsecutive.value = Math.max(...consecutivePeriodOptions.value);
  openSelectConsecutive();
};

const processFixedConf = async (consecutive: number) => {
  const periodsForFixed = Array.from(
    { length: fixedConfProcessData.consecutivePeriod },
    (_, idx) => [
      fixedConfProcessData.dayOfWeek,
      fixedConfProcessData.period + idx,
    ]
  ) as [number, number][]; // [dayOfWeek, period] 배열

  if (!(await validateFixedPeriods(periodsForFixed))) {
    resetFixedConfProcessData();
    return;
  }

  // 이미 등록된 고정 수업 삭제
  const existFixedConfs = periodsForFixed
    .map((p) => {
      const fixedCourse = fixedCourseByPeriod(p[0], p[1]);
      if (!fixedCourse || fixedCourse[1].isUnified) {
        // 공통 과목은 제외
        return;
      }
      return fixedCourse[0];
    })
    .filter((fixedCourse) => {
      return fixedCourse !== undefined;
    });

  if (existFixedConfs.length > 0) {
    await fixedConfContext.deleteItems(existFixedConfs);
  }

  // 새로운 고정 수업 등록
  const newFixedConfs = periodsForFixed.map(([dayOfWeek, period]) => {
    return {
      dayOfWeek,
      period,
      courseId: fixedConfProcessData.courseId,
      grade: grade.value,
    };
  });

  // await FixedConfService.createItems(newFixedConfs);
  await fixedConfContext.addMany(newFixedConfs);
  await fixedConfContext.reload();
  // await initFixedConfs();
};

const handleClickSubmitSelectConsecutive = async () => {
  if (selectedConsecutive.value <= 0) {
    dialog.alertSimple('선택된 시수가 올바르지 않습니다.');
    return;
  }

  fixedConfProcessData.consecutivePeriod = selectedConsecutive.value;
  await processFixedConf(selectedConsecutive.value);

  closeSelectConsecutive();
};

const handleClickCancelSelectConsecutive = () => {
  closeSelectConsecutive();
  resetFixedConfProcessData();
};

const handleClickDeleteFixcedConf = async (
  dayOfWeek: number,
  period: number
) => {
  const isConfirm = await dialog._confirm('선택하신 항목을 삭제하시겠습니까?');
  if (!isConfirm) {
    return;
  }

  const fixedCourse = fixedCourseByPeriod(dayOfWeek, period);
  if (!fixedCourse) {
    return;
  }

  // await FixedConfService.delete(fixedCourse[0]);
  // await initFixedConfs();
  await fixedConfContext.delete(fixedCourse[0]);
  await fixedConfContext.reload();
};

const getMenuItems = async () => {
  const fixedConfs = fixedConfCourseGradeMap.value[grade.value] || [];
  const fixedConfCountByCourse = fixedConfs.reduce((acc, [conf, _]) => {
    if (!acc[conf.courseId]) {
      acc[conf.courseId] = 0;
    }

    acc[conf.courseId] = acc[conf.courseId] + 1;
    return acc;
  }, {} as Record<string, number>);

  const concurrentCourses = (concuurentCourseGradeMap.value[grade.value] || [])
    .filter(([conf, crs]) => {
      // 제외 조건
      if (crs.isUnified || !crs.periodCount || !crs.displayedTitle) {
        // 공통 과목, 과목의 시수가 정해지지 않음, 과목 이름 없음
        return false;
      }

      // 이미 고정된 과목은 제외한다.
      if (fixedConfCountByCourse[crs.courseId] >= crs.periodCount) {
        return false;
      }

      return true;
    })
    .map(([conf, crs]) => {
      return crs;
    });

  selectableCourses.value = concurrentCourses;
};

/* 이미 고정 수업에 할당된 시수의 목록을 가져온다 */
const getFixedPeriodCounts = (course: Course) => {
  if (fixedConfs.value === null) {
    return [];
  }

  // 해당 과목이 할당된 고정 수업 시수를 가져와 배열로 만든다.
  const fixedPeriods = fixedConfs.value
    .filter((conf) => {
      return conf.courseId === course.courseId;
    })
    .map((conf) => {
      return [conf.dayOfWeek, conf.period];
    });

  if (fixedPeriods.length === 0) {
    return [];
  }

  // fixedPeriod를 정렬: dayOfWeek -> period
  fixedPeriods.sort((a, b) => {
    if (a[0] === b[0]) {
      return a[1] - b[1];
    }

    return a[0] - b[0];
  });

  // 연속 시수 배열화 -->
  const result: number[] = [];
  let acc = 0;
  let lastDay = -1;
  let lastPeriod = -1;

  for (const p of fixedPeriods) {
    // 시수가 연속되지 않거나 요일이 바뀐 경우 새로운 세그먼트 시작
    if (acc > 0 && (lastPeriod + 1 !== p[1] || lastDay !== p[0])) {
      result.push(acc);
      acc = 0;
    }

    // segment가 비어있으면 새로 생성, 그렇지 않으면 추가
    acc = acc + 1;

    lastDay = p[0];
    lastPeriod = p[1];
  }

  if (acc > 0) {
    result.push(acc);
  }
  // <-- 연속 시수 배열화

  return result;
};

const openSelectCourseMenu = (target: Element) => {
  menuTarget.value = target;
  menuShow.value = true;
};

const openSelectConsecutive = () => {
  isShowSelectConsecutive.value = true;
};

const closeSelectConsecutive = () => {
  isShowSelectConsecutive.value = false;
};

const fixedCourseByPeriod = (
  dayOfWeek: number,
  period: number
): [FixedConf, Course] | undefined => {
  return fixedConfCourseOfSelectedGrade.value.find(
    ([conf, _]) => conf.dayOfWeek === dayOfWeek && conf.period === period
  );
};

const checkFreePeriods = (dayOfWeek: number, period: number) => {
  if (
    !props.timetableConfig.grades ||
    props.timetableConfig.grades.length < grade.value - 1
  ) {
    return false;
  }

  const checkGrade = props.timetableConfig.grades[grade.value - 1];

  if (
    !checkGrade.timetableStructure ||
    !checkGrade.timetableStructure.freePeriods ||
    checkGrade.timetableStructure.freePeriods.length === 0
  ) {
    return false;
  }

  return checkGrade.timetableStructure.freePeriods.some(
    (freePeriod) =>
      freePeriod.dayOfWeek === dayOfWeek && freePeriod.period === period
  );
};

const validateFixedPeriods = async (periodsForFixed: [number, number][]) => {
  const maxPeriodForFixed = Math.max(...periodsForFixed.map((p) => p[1]));
  const maxPeriod = props.timetableConfig.maxPeriod;

  if (maxPeriodForFixed > maxPeriod) {
    dialog.alertSimple('최대 교시를 초과합니다.');
    return false;
  }

  const existFixedCourse = [];

  for (const [dayOfWeek, period] of periodsForFixed) {
    if (checkFreePeriods(dayOfWeek, period)) {
      dialog.alertSimple('"수업 없음" 시간에 수업을 고정할 수 없습니다.');
      return false;
    }

    const exist = fixedCourseByPeriod(dayOfWeek, period);
    if (exist && exist[1].isUnified) {
      dialog.alertSimple('공통 과목 시간에 수업을 고정할 수 없습니다.');
      return false;
    }

    if (exist) {
      existFixedCourse.push(exist[1]);
    }
  }

  if (existFixedCourse.length > 0) {
    return await dialog._confirm(
      '이미 고정 수업이 등록되어 있습니다. 기존 수업을 삭제하고 등록하시겠습니까?'
    );
  }

  return true;
};
</script>

<style scoped>
.timetable-frame {
  width: 100%;
  max-width: 450px;
  margin: 5px 5px;
  border: 0px;
}

.timetable-row {
  display: flex;
}

.timetable-head-row {
  display: flex;
  font-weight: bold;
  border-top: 1px solid #ccc;
}

.timetable-no {
  width: 10%;
  padding: 5px 5px;
  border-bottom: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-left: 1px solid #ccc;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #bcbcbc;
  color: #222;
}

.timetable-col {
  width: 18%;
  border-bottom: 1px solid #ccc;
  border-right: 1px solid #ccc;
  min-height: 60px;
}

.col-weekday {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #bcbcbc;
  color: #222;
}

.move-source {
  opacity: 0.5;
  background-color: #ffd89e;
}

.move-target {
  background-color: #bcddfc;
}

.timetable-title-section {
  padding: 10px 0px;
}

.timetable-contents-section {
}

.col-weekday {
  padding-top: 6px;
}

.select-field-label {
  font-size: 14px;
  font-weight: bold;
  margin-top: 26px;
  margin-right: 20px;
}

.display-center {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.free-period {
  background-color: #efefef;
  color: #222;
}

.menu-content {
  min-width: 100px;
}
</style>
