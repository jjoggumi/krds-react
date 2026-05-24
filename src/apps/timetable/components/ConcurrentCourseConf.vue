<template>
  <div class="concurrent-course-conf mt-20">
    <div class="table-head sticky">
      <div class="search-area">      
        <HiSelectBox  
          :value="selectedGrade"
          :items="gradeOptions"
          :empty-title="getSelectedGradeTitle()"
          @update:value="handleChangeSelectedGrade"
        />
      </div>
      <div class="btn-area">
        <button type="button" class="btn btn-tertiary" @click="handleClickDeleteSelectedConfs" :disabled="!hasChecked">선택 삭제하기</button>
        <!-- <button type="button" @click="handleClickOpenFixedConfDialog" class="btn btn-tertiary-blue">동시수업 고정</button> -->
        <button type="button" class="btn btn-primary" @click="handleClickAddEmptyRecord">수업 추가</button>
      </div>
    </div>

    <div class="table-content table-form table-box sticky-wrap">
      <table>
        <caption>시간표 정보 입력</caption>
        <colgroup>
          <col style="width: 60px;" />
          <col style="width: 90px;" />
          <col style="width: 100px;" />
          <col style="width: 90px;" />
          <col style="width: 90px;" />
          <col style="min-width: 100px; width: auto;" v-for="(_, index) in maxClassCount + maxVirtualClassCount" :key="index" />
          <!-- <col style="width: 100px;" /> -->
          <col style="width: 150px;" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">
              <div class="form-check">
                <input type="checkbox" id="allChecked" v-model="isCheckedAll" @change="toggleAllChecked" />
                <label for="allChecked"></label>
              </div>
            </th>
            <th scope="col">
              학년        
              <HelpButton 
                :id="'학년'"
                :active="helpOn === '학년'"             
              />              
            </th>
            <th scope="col">
              그룹명
                <button type="button" class="btn btn-link btn-sort" :class="{'desc': ['courseTitle-desc', 'desc'].includes(orderBy), 'asc': orderBy === 'courseTitle-asc'}" @click="handleClickOrderBy('courseTitle')">
                  <span class="sr-only">정렬</span>
                </button>
              <HelpButton 
                :id="'그룹명'"
                :active="helpOn === '그룹명'"             
              /> 
            </th>
            <th scope="col">
              시수
              <HelpButton 
                :id="'시수'"
                :active="helpOn === '시수'"             
              /> 
            </th>
            <th scope="col">
              연속
              <HelpButton 
                :id="'연속'"
                :active="helpOn === '연속'"             
              /> 
            </th>
            <th v-for="(_, index) in maxClassCount" :key="`class-${index}`">
              {{ `${index+1}반` }}
            </th>
            <th v-for="(_, index) in maxVirtualClassCount" :key="`virtual-class-${index}`">
              {{ `가상${index+1}반` }}
            </th>
            <!-- <th scope="col">수업고정</th> -->
            <th scope="col">비고</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, rowIndex) in concurrentConfsByGrade" :key="rowIndex" :class="{'error': row.warningSignOnRow}">
            <td>
              <div class="form-check">
                <input 
                  :id="'row-check-' + row.courseId"
                  type="checkbox"
                  v-model="row.isCheck"
                  @click="handleClickChecked(row)"
                />
                <label :for="'row-check-' + row.courseId"></label>
              </div>
            </td>
            <td>
              <HiSelectBox
                class="selectbox-wrap sm "
                :class="{ 
                  'has-selected': row.grade, 
                  'opt-top': concurrentConfsByGrade.length > 3 && rowIndex === concurrentConfsByGrade.length - 1 
                }"
                :value="Number(row.grade)"
                :items="gradeOptions.slice(1)"
                :empty-title="row.grade ? `${row.grade}` : '선택'"
                @update:value="($event) => handleChangeGradeOnRow(row, Number($event))"
              />
            </td>
            <td>
              <div class="input-wrap">
                <input
                  class="sm"
                  :disabled="!gradeOptions.some(grade => grade.value === row.grade?.toString())"
                  type="text"
                  placeholder="그룹명"
                  maxlength="5"
                  v-model="row.displayedTitleBeforeEdit"
                  @input="e => restrictName(e, row)"
                  @blur="handleBlurCourseName(row)"
                  @keydown.enter="e => handleEnterCourseName(e, row)"
                  spellcheck="false"
                />
              </div>
            </td>

            <td>
              <HiSelectBox
                class="selectbox-wrap sm"
                :class="{ 
                  'has-selected': row.periodCount, 
                  'opt-top': concurrentConfsByGrade.length > 3 && rowIndex === concurrentConfsByGrade.length - 1 
                }"
                :value="row.periodCount"
                :disabled="!row.courseId || row.courseId === ''"
                :items="!!row && !!row.grade ? (periodOptionsByGrade[row?.grade] || []) : []"
                :empty-title="row.periodCount ? `${row.periodCount}` : '선택'"
                @update:value="($event) => handleChangePeriodCount(row, Number($event))"
              />
            </td>

            <td>
              <consecutive-select
                :class="{'opt-top': concurrentConfsByGrade.length > 3 && rowIndex === concurrentConfsByGrade.length - 1}"
                :periodCount="row.periodCount ? row.periodCount : 1"
                :init-value="row.consecutivePeriod || ''"
                :disabled="!row.periodCount"
                :onChange="(val) => handleChangeConsecutivePeriod(row, val)"
              />
            </td>

            <td
              v-for="(classNum) in maxClassCount"
              :key="`${classNum}-normal-class`" :class="{'error': (row.lessonConfByNormalClass[classNum] || {}).isWarningRelatedPeriod, 'empty': !row.lessonConfByNormalClass[classNum]}"
            >
              <button
                v-if="(row.lessonConfByNormalClass[classNum] || {}).lessonConf"
                @click="handleClickOpenSwapDialog(row.courseId, row.lessonConfByNormalClass[classNum].lessonConf)"
                class="btn-table-cell additional"
                :class="{
                  'joint': isJointClass(row, classNum, ClassType.Normal)
                }"
              >
                <div class="course-name">{{ getClassNameByLessonConf(row.lessonConfByNormalClass[classNum].lessonConf)  }}</div>
                <div class="course-name">{{ row.lessonConfByNormalClass[classNum].courseName }}</div>
                <div class="course-name">{{ row.lessonConfByNormalClass[classNum].teacherName }}</div>
                <i @click.stop="handleClickDetachConcurrentCourse(row.courseId, row.lessonConfByNormalClass[classNum])"/>
              </button>

              <AutocompleteInputForConcurrentCourse
                :class="{'opt-top': concurrentConfsByGrade.length > 3 && rowIndex === concurrentConfsByGrade.length - 1}"                
                v-else-if="row.lessonConfByNormalClass[classNum] && !row.lessonConfByNormalClass[classNum].lessonConf"
                v-model="row.lessonConfByNormalClass[classNum].courseName"
                :options="getMenuItems(row, `${classNum}-normal`)"
                placeholder="과목선택"
                :disabled="!row.periodCount"
                :on-blur="() => row.lessonConfByNormalClass[classNum].courseName = ''"
                @select="(item) => handleClickAttachConcurrentCourse(row, row.lessonConfByNormalClass[classNum], item)"
              >
                <template #custom-option="{ items, selectItem }">
                  <div class="item"
                    v-for="(item, idx) in items"
                    :key="idx"
                    @mousedown.prevent="selectItem(item)"
                  >
                    {{ item.value.standardCourseTitle }} ({{ item.value.displayedTitle }}) 
                    <span class="txt-primary">({{ item.periodCount }})</span>
                  </div>
                  <div v-if="items.length === 0" class="hi-nodata sm p-00">
                    <p>검색 결과가 없습니다.</p>
                  </div>
                </template>
              </AutocompleteInputForConcurrentCourse>
            </td>

            <td
              v-for="(classNum) in maxVirtualClassCount"
              :key="`${classNum}-virtual-class`" :class="{'error': (row.lessonConfByVirtualClass[classNum] || {}).isWarningRelatedPeriod, 'empty': !row.lessonConfByVirtualClass[classNum]}"
            >
              <button
                v-if="(row.lessonConfByVirtualClass[classNum] || {}).lessonConf"
                @click="handleClickOpenSwapDialog(row.courseId, row.lessonConfByVirtualClass[classNum].lessonConf)"
                class="btn-table-cell additional"
                :class="{
                  'joint': isJointClass(row, classNum, ClassType.Virtual)
                }"
              >
                <div class="course-name">{{ getClassNameByLessonConf(row.lessonConfByVirtualClass[classNum].lessonConf) }}</div>
                <div class="course-name">{{ row.lessonConfByVirtualClass[classNum].courseName }}</div>
                <div class="course-name">{{ row.lessonConfByVirtualClass[classNum].teacherName }}</div>
                <i @click.stop="handleClickDetachConcurrentCourse(row.courseId, row.lessonConfByVirtualClass[classNum])" />
              </button>

              <AutocompleteInputForConcurrentCourse
                :class="{'opt-top': concurrentConfsByGrade.length > 3 && rowIndex === concurrentConfsByGrade.length - 1}"   
                v-else-if="row.lessonConfByVirtualClass[classNum] && !row.lessonConfByVirtualClass[classNum].lessonConf"
                v-model="row.lessonConfByVirtualClass[classNum].courseName"
                :options="getMenuItems(row, `${classNum}-virtual`)"
                placeholder="과목선택"
                :disabled="!row.periodCount"
                :on-blur="() => row.lessonConfByVirtualClass[classNum].courseName = ''"
                @select="(item) => handleClickAttachConcurrentCourse(row, row.lessonConfByVirtualClass[classNum], item)"
              >
                <template #custom-option="{ items, selectItem }">
                  <div class="item"
                    v-for="(item, idx) in items"
                    :key="idx"
                    @mousedown.prevent="selectItem(item)"
                  >
                    {{ item.value.standardCourseTitle }} ({{ item.value.displayedTitle }}) 
                    <span class="txt-primary">({{ item.periodCount }})</span>
                  </div>
                  <div v-if="items.length === 0" class="hi-nodata sm p-00">
                    <p>선택 가능한 과목이 없습니다.</p>
                  </div>
                </template>
              </AutocompleteInputForConcurrentCourse>
            </td>
            <!-- <td>
              <button class="btn-table-cell additional fixed" @click="handleClickOpenFixedConfDialog">수업고정</button>
            </td> -->
            <td>
              <span v-if="row.isCombinedClass" class="txt-warning">
                합반
              </span>
            </td>
          </tr>
          <tr>
            <td :colspan="maxClassCount + maxVirtualClassCount + 6" class="tfoot">ENTER 키로 다음 칸으로 이동하세요.</td>
          </tr>
        </tbody>

      </table>
    </div>

    <ConcurrentCourseExchangeDialog
      v-if="isExchangeDialogOpened"
      :selectedCell="selectedCell"
      @swap="(sourceTarget) => handleSubmitSwapConfs(sourceTarget)"
      @toss="(sourceTarget) => handleSubmitTossConfs(sourceTarget)"
      @close="handleCloseSwapDialog"
    />

    <!-- <ConcurrentCourseFixDialog
      v-if="isFixedConfDialogOpened"
      :timetableConfig="timetableConfig"
      :concurrentConfMapByGrade="concurrentConfMapByGrade"
      @close="handleCloseFixedConfDialog"
    /> -->

    <DataEntryNoticeModal 
      v-if="isShowDataEntryNoticeModal"
      :noticeType="noticeType"
      @close="handleCloseDataEntryNoticeModal"
    />

  </div>

</template>

<script setup lang="ts">
// import ConcurrentCourseFixDialog from '@/apps/timetable/components/ConcurrentCourseFixDialog.vue';
import ConcurrentCourseExchangeDialog from '@/apps/timetable/components/ConcurrentCourseExchangeDialog.vue';
import ConsecutiveSelect from '@/apps/timetable/components/ConsecutiveSelect.vue';
import HiSelectBox from '@/components/Form/HiSelectBox.vue';
import AutocompleteInputForConcurrentCourse from '@/apps/timetable/components/AutocompleteInputForConcurrentCourse.vue';
import { useDialog } from '@/apps/timetable/composables/dialog';
import { SetUtils, TimetableDisplayUtils } from '@/apps/timetable/common/utils';
import { getConcurrentConfService } from '@/apps/timetable/services/concurrent-conf-service'
import HelpButton from '@/apps/timetable/components/HelpButton.vue';

import DataEntryNoticeModal from '../components/DataEntryNoticeModal.vue';
import { NoticeType } from '../common/types';

import {
  Class,
  ConcurrentConf,
  Course,
  FixedConf,
  LessonConf,
  Teacher,
  TimetableConfig,
  ConcurrentConfCourse,
  TimetableGrade,
  ConsecutiveConf,
  SpecialtyRoomConf
} from '@/apps/timetable/core/types';

import {
  ContextKeys,
  TimetableGradeContext,
  TimetableCourseContext,
  TimetableTeacherContext,
  TimetableClassContext,
  LessonConfContext,
  FixedConfContext,
  ConcurrentConfContext,
  TeacherCourseContext,
  ConsecutiveConfContext,
  TeacherCourseBaseContext,
  SpecialtyRoomConfContext,
  TimetableProgressContext,
  LessonContext
} from '../contexts';

import { computed, inject, onMounted, ref, watch, defineExpose } from 'vue';
import { has } from 'lodash';

const props = defineProps({
  helpOn: {
    type: String,
    default: 0,
  },
});

interface ConcurrentConfCourseItem extends Omit<ConcurrentConfCourse, 'grade'> {
  displayedTitleBeforeEdit: string;
  isCheck: boolean;
  grade?: number;
  lessonConfByNormalClass: Record<string, LessonConfOption>;
  lessonConfByVirtualClass: Record<string, LessonConfOption>;
  isFixed: boolean;
  warningSignOnRow: boolean;
}

interface LessonConfOption {
  lessonConf: LessonConf | null;
  courseName: string;
  teacherName: string;
  periodCount: number | null;
  isWarningRelatedPeriod: boolean;
}

// 동시 수업 충돌을 비교하기 위한 데이터
interface CombinedIdsAndPeriodOfConcurrentCourse {
  concurrentCourseId: string;
  periodCount: number;
  classIdSet: Set<string>;
  teacherIdSet: Set<string>;
}

type CombinedConcurrentCourses = CombinedIdsAndPeriodOfConcurrentCourse[];

// 그룹 내부의 누적 tIds와 cIds를 관리하기 위한 인터페이스
interface CombinedConcurrentCourseGroup {
  courses: CombinedConcurrentCourses;
  unionTeacherIds: Set<string>;
  unionClassIds: Set<string>;
}

interface RelatedPeriod {
  concurrentCourseId: string;
  relatedPeriodCount: number;
  gradePeriodCount: number;
  teacherDeductionImpactMap: Record<string, number>;
}

interface SelectedCell {
  concurrentCourseId: string;
  lessonConfId: string;
}

enum ClassType {
  Normal = 'NORMAL',
  Virtual = 'VIRTUAL',
}

const dialog = useDialog();

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const teacherCourseBaseContext = inject(ContextKeys.TeacherCourseBase) as TeacherCourseBaseContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const fixedConfContext = inject(ContextKeys.FixedConf) as FixedConfContext;
const concurrentConfContext = inject(ContextKeys.ConcurrentConf) as ConcurrentConfContext;
const consecutiveConfContext = inject(ContextKeys.ConsecutiveConf) as ConsecutiveConfContext;
const specialtyRoomConfContext = inject(ContextKeys.SpecialtyRoomConf) as SpecialtyRoomConfContext;
const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;

const concurrentConfService = getConcurrentConfService(
  concurrentConfContext,
  courseContext,
  lessonConfContext,
  fixedConfContext,
  teacherCourseContext,
  teacherCourseBaseContext
);

const orderBy = ref<string>('default');
const periodOptions = ref(Array.from({ length: 6 }, (_, i) => { return { value: i+1, title: `${i+1}` } }));
// const isFixedConfDialogOpened = ref<boolean>(false);
const isExchangeDialogOpened = ref<boolean>(false);
const selectedCell = ref<SelectedCell>({  concurrentCourseId: '', lessonConfId: '' });
const gradeOptions = computed(() => {
  const { grades } = timetableConfig.value;
  const options = grades.map((grade) => ({
    value: grade.grade.toString(),
    title: `${grade.grade}학년`,
  }));
  options.unshift({ value: 'all', title: '전체 학년' });
  return options;
});

const assignedClassLessonCount = computed(() => progressContext?.assignedClassLessonCount || 0);

const timetableConfig = computed(() => {
  gradeContext.timetableConfig.grades.forEach((grade) => {

    maxClassCount.value = Math.max(
      maxClassCount.value,
      grade.maxClassCount || 0
    );
    maxVirtualClassCount.value = Math.max(
      maxVirtualClassCount.value,
      grade.maxVirtualClassCount || 0
    );
  })

  return gradeContext.timetableConfig as TimetableConfig
});
const classes = computed(() => classContext.classes as Class[]);
const classMap = computed(() => classContext.classMap as Record<string, Class>);
const gradeMap = computed(() => gradeContext.gradeMap as Record<number, TimetableGrade>);
const courses = computed(() => courseContext.courses as Course[]);
const courseMap = computed(() => courseContext.courseMap as Record<string, Course>);
const teacherMap = computed(() => teacherContext.teacherMap as Record<string, Teacher>);
const lessonConfs = computed(() => lessonConfContext.lessonConfs as LessonConf[]);
const fixedConfs = computed(() => fixedConfContext.fixedConfs as FixedConf[]);
const concurrentConfs = computed(() => concurrentConfContext.concurrentConfs as ConcurrentConf[]);
const consecutiveConfs = computed(() => consecutiveConfContext.consecutiveConfs as ConsecutiveConf[]);
const specialtyRoomConfs = computed(() => specialtyRoomConfContext.specialtyRoomConfs as SpecialtyRoomConf[]);
const gradeTotalPeriod = computed(() => {
  const { classDays, maxPeriod, grades } = timetableConfig.value;

  return grades.map((grd) => {
    // classDays 의 숫자를 더한다
    const classDayCount = classDays.reduce((acc, day) => acc + day, 0);
    const allPeriod = classDayCount * maxPeriod;
    const gradeFreePeriodCount =
      grd.timetableStructure && grd.timetableStructure.freePeriods
        ? grd.timetableStructure.freePeriods.length : 0;

    const gradeFixedCoursesCount = fixedUnifiedCourseGroupByGrade.value[
      grd.grade
    ]
      ? fixedUnifiedCourseGroupByGrade.value[grd.grade].length
      : 0;

    const totalPeriod =
      allPeriod - gradeFreePeriodCount - gradeFixedCoursesCount;

    return totalPeriod;
  }) as number[];
});

const lessonConfsByConcurrentCourse = computed(() => {
  return lessonConfs.value.reduce((acc, conf) => {
    if (!conf.concurrentCourseId) {
      return acc;
    }

    if (!acc[conf.concurrentCourseId]) {
      acc[conf.concurrentCourseId] = [];
    }
    acc[conf.concurrentCourseId].push(conf);
    return acc;
  }, {} as Record<string, LessonConf[]>);
});

const periodOptionsByGrade = computed(() => {
  const lessonConfsByGrade = lessonConfs.value.reduce((acc, conf) => {
    (acc[conf.grade] = acc[conf.grade] || []).push(conf);
    return acc;
  }, {} as Record<number, LessonConf[]>);
  return Object.entries(lessonConfsByGrade).reduce((acc, [grade, lesConfs]) => {
    const periodSet = new Set<number>();
    lesConfs.forEach((lesConf) => {
      const course = courseMap.value[lesConf.courseId];
      if (course && course.periodCount) {
        periodSet.add(course.periodCount);
      }
    });
    acc[Number(grade)] = Array.from(periodSet).sort((a, b) => a - b).map((period) => ({
      value: period,
      title: `${period}`,
    }));
    return acc;
  }, {} as Record<number, { value: number; title: string }[]>) || {};
});

const classMapByGradeAndClassNumAndType = computed(() => {
  return classes.value.reduce((acc, clz) => {
    const key = `${clz.grade}-${clz.classNumber}-${clz.isVirtual ? 'virtual' : 'normal'}`;
    acc[key] = clz;
    return acc;
  }, {} as Record<string, Class>);
});

const concurrentCourseToAdd = ref<ConcurrentConfCourseItem | null>(null);

const isCheckedAll = ref<boolean>(false);
// const hasChecked = ref(false);
const selectedGrade = ref<string>('all');

// 동시 수업 배정 오류 알럿
const noticeType = ref<NoticeType>(NoticeType.None);
const isShowDataEntryNoticeModal = ref(false);
const handleCloseDataEntryNoticeModal = () => {
  isShowDataEntryNoticeModal.value = false;
};

const maxClassCount = ref<number>(0);
const maxVirtualClassCount = ref<number>(0);

const concurrentConfsByGrade = ref<ConcurrentConfCourseItem[]>([]);
const relatedPeriodMap = ref<Record<string, RelatedPeriod>>({}); // courseId -> RelatedPeriod
const nonAssignableConcurrentCourses = ref<Record<string, RelatedPeriod>>({}); // courseId -> RelatedPeriod

const hasChecked = computed(() => concurrentConfsByGrade.value.some((conf) => conf.isCheck));

// 각 학년별 공통 수업의 시수합 > 공통 수업은 주간시수에서 제외하기 위함
const fixedUnifiedCourseGroupByGrade = computed(() => {
  return fixedConfs.value
    .filter(
      (conf) => courseMap.value[conf.courseId] && courseMap.value[conf.courseId].isUnified
    )
    .reduce((acc, conf) => {
      if (!acc[conf.grade]) {
        acc[conf.grade] = [];
      }

      acc[conf.grade].push(conf);
      return acc;
    }, {} as { [key: number]: FixedConf[] });
});

const hasWarningSignOnRow = computed(() => {
  return Object.values(nonAssignableConcurrentCourses.value).some(
    (item) => Object.keys(item.teacherDeductionImpactMap).length > 0
  );
});

watch(
  () => [
    selectedGrade.value,
    concurrentConfs.value,
  ],
  () => {
    initRelatedPeriodMap();
    getGradeConcurrentConfs();
  }
);

watch(
  () => hasWarningSignOnRow.value,
  (newVal) => {
    const key = NoticeType.ConcurrentConfError;
    if (newVal) showNoticeIfNotSeen(key);
    else sessionStorage.removeItem(key);
  },
  { immediate: true }
)

const showNoticeIfNotSeen = (key: NoticeType) => {
  if (!sessionStorage.getItem(key)) {
    noticeType.value = key;
    isShowDataEntryNoticeModal.value = true;
    sessionStorage.setItem(key, 'true');
  }
};

onMounted(async () => {
  await initData();
});

const getSortedConcurrentConfsByGrade = () => {
  const [field, direction] = orderBy.value.split('-');

  concurrentConfsByGrade.value = field === 'default'
    ? concurrentConfsByGrade.value
    : concurrentConfsByGrade.value.slice().sort((a, b) => {
      const aEmpty = a.courseId === '';
      const bEmpty = b.courseId === '';
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;

      const compare = (a.displayedTitle || '').localeCompare(b.displayedTitle || '');
      return direction === 'asc' ? compare : -compare;
    });
};

const getGradeConcurrentConfs = () => {
  const drafts = concurrentConfsByGrade.value.filter(r => !r.courseId);
  const updated = buildRows(concurrentConfs.value, selectedGrade.value);

  // 정렬 순서 보장하기 위해
  const updatedById = new Map(updated
    .filter(r => r.courseId)
    .map(r => [r.courseId as string, r] as [string, ConcurrentConfCourseItem])
  );

  const result: ConcurrentConfCourseItem[] = [];

  for (const row of concurrentConfsByGrade.value) {
    if (!row.courseId) continue;
    const kept = updatedById.get(row.courseId);
    if (kept) {
      result.push(kept);
      updatedById.delete(row.courseId);
    }
  }

  result.push(...updatedById.values(), ...drafts);

  concurrentConfsByGrade.value = result;
};

const buildRows = (source: ConcurrentConf[], gradeFilter: string): ConcurrentConfCourseItem[] => {
  const filtered = source.filter(conf => gradeFilter === 'all' || conf.grade === Number(gradeFilter));

  const makeLessonConfMap = (conf: ConcurrentConf, maxCount: number, typeSuffix: 'normal' | 'virtual') => {
    const map = {} as Record<number, LessonConfOption>;
    for (let i = 1; i <= maxCount; i++) {
      const classKey = `${conf.grade}-${i}-${typeSuffix}`;
      const classId = classMapByGradeAndClassNumAndType.value[classKey]?.classId;
      const lesConf = lessonConfs.value.find(lc => lc.concurrentCourseId === conf.courseId && lc.classId === classId) || null;

      const nonAssignable = nonAssignableConcurrentCourses.value[conf.courseId] || null;
      const isWarningRelatedPeriod = !!(nonAssignable && lesConf && nonAssignable.teacherDeductionImpactMap[lesConf.teacherId] !== undefined);

      map[i] = {
        lessonConf: lesConf,
        courseName: lesConf ? courseMap.value[lesConf.courseId].displayedTitle : '',
        teacherName: lesConf ? teacherMap.value[lesConf.teacherId].teacherName : '',
        periodCount: lesConf ? (courseMap.value[lesConf.courseId].periodCount || null) : null,
        isWarningRelatedPeriod,
      };
    }
    return map;
  };

  return filtered.reduce<ConcurrentConfCourseItem[]>((acc, conf) => {
    const concurrentCourse = getCourseById(conf.courseId);
    if (!concurrentCourse) return acc;

    const fixedExists = fixedConfs.value.some(f => f.courseId === conf.courseId && f.grade === conf.grade);

    const gradeInfo = gradeMap.value[conf.grade];
    const normalMax = gradeInfo?.maxClassCount || 0;
    const virtualMax = gradeInfo?.maxVirtualClassCount || 0;

    const lessonConfByNormalClass = makeLessonConfMap(conf, normalMax, 'normal');
    const lessonConfByVirtualClass = makeLessonConfMap(conf, virtualMax, 'virtual');

    const warningSignOnRow =
      Object.values(lessonConfByNormalClass).some(c => c.isWarningRelatedPeriod) ||
      Object.values(lessonConfByVirtualClass).some(c => c.isWarningRelatedPeriod);

    acc.push({
      ...conf,
      ...concurrentCourse,
      lessonConfByNormalClass,
      lessonConfByVirtualClass,
      isCheck: false,
      isFixed: fixedExists,
      displayedTitleBeforeEdit: concurrentCourse.displayedTitle || '',
      warningSignOnRow,
    } as ConcurrentConfCourseItem);

    return acc;
  }, []);
};

const getSelectedGradeTitle = () => {
  if (selectedGrade.value === 'all') {
    return '전체 학년';
  }
  return `${selectedGrade.value}학년`;
};

const handleChangeSelectedGrade = (val: string) => {
  // Update selected grade
  selectedGrade.value = val;
  // Reset header checkbox state
  isCheckedAll.value = false;
  // Reset all row selection checkboxes to default (unchecked)
  concurrentConfsByGrade.value.forEach((conf) => {
    conf.isCheck = false;
  });
};

const handleClickOrderBy = async (field: string) => {
  if (document.activeElement instanceof HTMLElement) {
    await document.activeElement.blur();
  }

  await new Promise(resolve => setTimeout(resolve, 100));

  const currentField = orderBy.value.split('-')[0];

  if (currentField === field) {
    orderBy.value = orderBy.value.endsWith('asc') ? `${field}-desc` : `${field}-asc`;
  } else {
    orderBy.value = `${field}-asc`;
  }

  getSortedConcurrentConfsByGrade();
};

const initData = async () => {

  // 시간표의 데이터를 가져옴
  await gradeContext.load();
  await classContext.load();
  await courseContext.load();
  await teacherContext.load();
  await concurrentConfContext.load();
  await consecutiveConfContext.load();
  await lessonConfContext.load();
  await fixedConfContext.load();

  initRelatedPeriodMap();
  getGradeConcurrentConfs();

  if (concurrentConfsByGrade.value.length === 0) addEmptyRecord();
};

const getCourseById = (courseId: string) => {
  if (!courses.value) return null;

  return courses.value.find((course) => course.courseId === courseId);
};

const initRelatedPeriodMap = () => {
  // 동시 수업의 점유 시수를 계산한다.
  relatedPeriodMap.value = {};
  nonAssignableConcurrentCourses.value = {};

  concurrentConfs.value.forEach((conf) => {
    relatedPeriodMap.value[conf.courseId] = getRelatedPeriodByConccurentCourse(
      conf.courseId
    );
  });

  Object.values(relatedPeriodMap.value).forEach((item) => {
    // 배정 불가 동시 수업 별도 입력
    if (item.gradePeriodCount >= item.relatedPeriodCount) {
      return;
    }

    const impactedPeriod = item.relatedPeriodCount - item.gradePeriodCount;

    const teacherDeductionImpactMap = {} as Record<string, number>;
    Object.keys(item.teacherDeductionImpactMap).forEach((teacherId) => {
      if (item.teacherDeductionImpactMap[teacherId] < impactedPeriod) {
        return;
      }

      teacherDeductionImpactMap[teacherId] =
        item.teacherDeductionImpactMap[teacherId];
    });

    const nonAssignableConcurrentCourse = {
      concurrentCourseId: item.concurrentCourseId,
      relatedPeriodCount: item.relatedPeriodCount,
      gradePeriodCount: item.gradePeriodCount,
      teacherDeductionImpactMap,
    };

    nonAssignableConcurrentCourses.value[item.concurrentCourseId] =
      nonAssignableConcurrentCourse;
  });
};

const getRelatedPeriodByConccurentCourse = (concurrentCourseId: string) => {
  // 동시 수업 설정 정보 조회
  const concurrentConf = concurrentConfs.value.find(
    (conf) => conf.courseId === concurrentCourseId
  );

  if (!concurrentConf) {
    return {
      concurrentCourseId,
      relatedPeriodCount: 0,
      gradePeriodCount: 0,
      teacherDeductionImpactMap: {},
    };
  }

  // 동시 수업에 속한 교사들의 ID SET
  const teacherIdSet = new Set<string>(
    lessonConfs.value
      .filter((conf) => conf.concurrentCourseId === concurrentCourseId)
      .map((conf) => conf.teacherId)
  );

  // 동시 수업에 속한 모든 교사들의 ID SET을 이용하여 동시 수업의 점유 시수를 계산한다.
  const relatedPeriodCount =
    getTeacherConcurrentCourseRelatedPeriods(teacherIdSet);

  const teacherDeductionImpactMap: Record<string, number> = {};

  Array.from(teacherIdSet).forEach((teacherId) => {
    const teacherRelatedPeriod = getRelatedPeriodsWithExcludingTeacher(
      teacherIdSet,
      concurrentCourseId,
      teacherId
    );

    teacherDeductionImpactMap[teacherId] =
      relatedPeriodCount - teacherRelatedPeriod;
  });

  const gradePeriodCount = gradeTotalPeriod.value[concurrentConf.grade - 1];

  return {
    concurrentCourseId,
    relatedPeriodCount,
    gradePeriodCount,
    teacherDeductionImpactMap,
  };
};

const getTeacherConcurrentCourseRelatedPeriods = (
  teacherIdSet: Set<string>
) => {
  // 교사들이 속한 동시 수업 아이디 셋
  const concurrentCourseIdSet = new Set<string>(
    lessonConfs.value
      .filter(
        (conf) => teacherIdSet.has(conf.teacherId) && conf.concurrentCourseId
        // conf.concurrentCourseId !== concurrentCourseId
      )
      .map((conf) => conf.concurrentCourseId as string)
  );

  // 충돌을 조회하기 위한 데이터 생성
  const conflictData: Record<string, CombinedIdsAndPeriodOfConcurrentCourse> =
    {};

  const courses: CombinedIdsAndPeriodOfConcurrentCourse[] = [];
  concurrentCourseIdSet.forEach((courseId: string) => {
    const conflictTeacherIdSet = new Set<string>();
    const conflictClassIdSet = new Set<string>();

    const periodCount = courseMap.value[courseId].periodCount || 0;

    lessonConfsByConcurrentCourse.value[courseId].forEach((conf) => {
      conflictTeacherIdSet.add(conf.teacherId);
      conflictClassIdSet.add(conf.classId);
    });

    conflictData[courseId] = {
      concurrentCourseId: courseId,
      classIdSet: conflictClassIdSet,
      teacherIdSet: conflictTeacherIdSet,
      periodCount: periodCount || 0,
    };

    courses.push(conflictData[courseId]);
  });

  const occurrences = buildOccurrences(courses);

  return greedyGroupCount(occurrences);
};

const getRelatedPeriodsWithExcludingTeacher = (
  teacherIdSet: Set<string>,
  concurrentCourseId: string,
  excludeTeacherId: string
) => {
  // concurrentCourseId의 동시 수업에 속한 교사들을 제외했을때
  // 해당 동시 수업의 점유 시수가 얼마나 되는지 계산한다.

  // 제외할 교사의 동시 수업 내 수업 설정 정보 조회
  const excludedTeacherCourseIds = lessonConfs.value
    .filter(
      (conf) =>
        conf.concurrentCourseId === concurrentCourseId &&
        conf.teacherId === excludeTeacherId
    )
    .map((conf) => conf.courseId);

  const newTeacherIdSet = new Set<string>([...Array.from(teacherIdSet)]);
  newTeacherIdSet.delete(excludeTeacherId);

  const concurrentCourseIdSet = new Set<string>(
    lessonConfs.value
      .filter((conf) => {
        if (!conf.concurrentCourseId) {
          return false;
        }

        return newTeacherIdSet.has(conf.teacherId);
      })
      .map((conf) => conf.concurrentCourseId as string)
  );

  // 충돌을 조회하기 위한 데이터 생성
  const basicCombinedCourses: CombinedIdsAndPeriodOfConcurrentCourse[] = [];
  concurrentCourseIdSet.forEach((courseId: string) => {
    const combinedTeacherIdSet = new Set<string>();
    const combinedClassIdSet = new Set<string>();

    lessonConfsByConcurrentCourse.value[courseId].forEach((conf) => {
      combinedClassIdSet.add(conf.classId);

      if (
        conf.teacherId === excludeTeacherId &&
        excludedTeacherCourseIds.includes(conf.courseId)
      ) {
        return;
      }

      combinedTeacherIdSet.add(conf.teacherId);
    });

    const periodCount = courseMap.value[courseId].periodCount || 0;

    basicCombinedCourses.push({
      concurrentCourseId: courseId,
      classIdSet: combinedClassIdSet,
      teacherIdSet: combinedTeacherIdSet,
      periodCount,
    });
  });

  const occurrences = buildOccurrences(basicCombinedCourses);

  return greedyGroupCount(occurrences);
};

const buildOccurrences = (
  courses: CombinedIdsAndPeriodOfConcurrentCourse[]
): CombinedIdsAndPeriodOfConcurrentCourse[] => {
  const occurrences: CombinedIdsAndPeriodOfConcurrentCourse[] = [];
  for (const course of courses) {
    for (let i = 0; i < course.periodCount; i++) {
      occurrences.push({
        concurrentCourseId: course.concurrentCourseId,
        periodCount: course.periodCount,
        // 복제 시 원본의 Set을 그대로 사용하되, 이후 변경 시 깊은 복사를 고려해야 함
        classIdSet: new Set(course.classIdSet),
        teacherIdSet: new Set(course.teacherIdSet),
      });
    }
  }
  return occurrences;
};

const greedyGroupCount = (
  occurrences: CombinedIdsAndPeriodOfConcurrentCourse[]
): number => {
  // 동시 수업의 점유 시수를 구한다.
  const groups: CombinedConcurrentCourseGroup[] = [];

  // occurrences를 충돌 가능성이 큰 순서대로 정렬 (tIds와 cIds 개수 합 내림차순)
  const sortedOccurrences = [...occurrences].sort((a, b) => {
    const aScore = a.teacherIdSet.size + a.classIdSet.size;
    const bScore = b.teacherIdSet.size + b.classIdSet.size;
    return bScore - aScore;
  });

  for (const occ of sortedOccurrences) {
    let placed = false;
    for (const group of groups) {
      if (
        !SetUtils.hasIntersectionWithString(
          group.unionTeacherIds,
          occ.teacherIdSet
        ) &&
        !SetUtils.hasIntersectionWithString(group.unionClassIds, occ.classIdSet)
      ) {
        group.courses.push(occ);
        occ.teacherIdSet.forEach((tid) => group.unionTeacherIds.add(tid));
        occ.classIdSet.forEach((cid) => group.unionClassIds.add(cid));
        placed = true;
        break;
      }
    }
    if (!placed) {
      groups.push({
        courses: [occ],
        unionTeacherIds: new Set(occ.teacherIdSet),
        unionClassIds: new Set(occ.classIdSet),
      });
    }
  }

  return groups.length;
};

const handleClickChecked = (row: ConcurrentConfCourseItem) => {
  row.isCheck = !row.isCheck;
  // hasChecked.value = concurrentConfsByGrade.value.some((conf) => conf.isCheck);
  isCheckedAll.value = concurrentConfsByGrade.value.every((conf) => conf.isCheck);
};

const toggleAllChecked = () => {
  concurrentConfsByGrade.value.forEach((conf) => conf.isCheck = isCheckedAll.value);
  // hasChecked.value = isCheckedAll.value;
}

const handleClickDeleteSelectedConfs = async () => {
  concurrentConfsByGrade.value = concurrentConfsByGrade.value
    .filter(conf => !!conf.courseId);

  const courseIdsToDelete = concurrentConfsByGrade.value
    .filter((conf) => conf.isCheck)
    .map((conf) => conf.courseId);

  if (courseIdsToDelete.length > 0) {
    // const confirm = await dialog.confirmSimple('선택한 동시 수업을 삭제하시겠습니까?');

    const confirm = await confirmLessonDelete(
      '선택한 동시 수업을 삭제하시겠습니까?',
      '그룹을 삭제하시겠습니까?',      
    );

    if (!confirm) return;

    // 선택된 동시 수업 삭제
    await concurrentConfService.deleteConcurrentCourse(courseIdsToDelete);
    
    // 데이터 갱신
    getGradeConcurrentConfs();
    await doAfterModify();
  }

  isCheckedAll.value = false;
};

const handleChangePeriodCount = async (
  concurrentCourseItem: ConcurrentConfCourseItem,
  periodCount: number
) => {
  if (!concurrentCourseItem.courseId || concurrentCourseItem.courseId === '') {
    return;
  } else if (
    !concurrentCourseItem.grade ||
    !concurrentCourseItem.displayedTitle ||
    concurrentCourseItem.displayedTitle === '' ||
    !periodCount
  ) {
    await dialog.confirmSimple('학년, 그룹명, 시수를 입력해 주세요.');
    return;
  }

  const hasEnrolledCourse = [concurrentCourseItem.lessonConfByNormalClass, concurrentCourseItem.lessonConfByVirtualClass].some((lessonConfByClass) =>
    Object.keys(lessonConfByClass).some((classNum) => !!lessonConfByClass[classNum].lessonConf)
  );

  const hasFixedConf = fixedConfs.value.some((fixedConf) =>
      fixedConf.courseId === concurrentCourseItem.courseId
  );

  if (hasEnrolledCourse || hasFixedConf) {
    const reply = await confirmLessonDelete(
      '시수 변경 시 등록한 과목이 전체 해제됩니다.<br>변경하시겠습니까?',
      ' 시수를 변경하시겠습니까?');
    if (!reply) {
      return;
    }
  }

  concurrentCourseItem.periodCount = periodCount;

  await concurrentConfService.updateConcurrentCourse(
    concurrentCourseItem.courseId,
    concurrentCourseItem.grade,
    concurrentCourseItem.displayedTitle,
    concurrentCourseItem.periodCount,
    concurrentCourseItem.consecutivePeriod || null
  )

  await doAfterModify();
};

const handleChangeConsecutivePeriod = async (
  concurrentCourseItem: ConcurrentConfCourseItem,
  period: string
) => {
  if (!concurrentCourseItem.grade || !concurrentCourseItem.courseId || concurrentCourseItem.courseId === '') {
    await dialog.alertSimple('학년과 그룹명을 입력해 주세요.');
    return;
  }
  
  if (!concurrentCourseItem.periodCount || concurrentCourseItem.periodCount === 0) {
    await dialog.alertSimple('시수를 입력해 주세요.');
    return;
  }
  
  const hasEnrolledCourse = [concurrentCourseItem.lessonConfByNormalClass, concurrentCourseItem.lessonConfByVirtualClass].some((lessonConfByClass) =>
    Object.keys(lessonConfByClass).some((classNum) => !!lessonConfByClass[classNum].lessonConf)
  );

  const hasFixedConf = fixedConfs.value.some((fixedConf) =>
      fixedConf.courseId === concurrentCourseItem.courseId
  );

  if (assignedClassLessonCount.value !== 0 && (hasEnrolledCourse || hasFixedConf)) {  
    const reply = await confirmLessonDelete(
      '연속 시수가 변경될 경우 고정 수업이<br>삭제됩니다. 수정하시겠습니까?',
      '연속 시수를 변경하시겠습니까?'
    );

    if (!reply) {
      return;
    }
  }

  concurrentCourseItem.consecutivePeriod = period;

  await concurrentConfService.updateConcurrentCourse(
    concurrentCourseItem.courseId,
    concurrentCourseItem.grade,
    concurrentCourseItem.displayedTitle,
    concurrentCourseItem.periodCount,
    concurrentCourseItem.consecutivePeriod
  )

  await doAfterModify();
};

const restrictName = (e: Event, row: ConcurrentConfCourseItem) => {
  const allowedRegex = /[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/g;

  const source = (e.target as HTMLInputElement).value;
  const cleanedName = source.replace(allowedRegex, '');
  if (cleanedName.length > 5) return;

  (e.target as HTMLInputElement).value = cleanedName;

  if (cleanedName !== row.displayedTitleBeforeEdit) row.displayedTitleBeforeEdit = cleanedName;
};

const handleEnterCourseName = async (e: KeyboardEvent, row: ConcurrentConfCourseItem) => {
  e.preventDefault();
  e.stopPropagation();

  const saved = await handleBlurCourseName(row);

  if (!!saved && saved.courseId && saved.courseId !== '' && saved.grade) {
    (e.target as HTMLInputElement).blur();
    addEmptyRecord();
  }
};

const handleBlurCourseName = async (concurrentCourseItem: ConcurrentConfCourseItem) => {
  const newTitle = (concurrentCourseItem.displayedTitleBeforeEdit || '').trim();
  const wasDraft = !concurrentCourseItem.courseId;

  // 변경없음
  if (newTitle === concurrentCourseItem.displayedTitle) return concurrentCourseItem;

  // 빈값 체크
  if (!newTitle) {
    await dialog.alertSimple('그룹명을 입력해 주세요.');
    concurrentCourseItem.displayedTitleBeforeEdit = concurrentCourseItem.displayedTitle;
    return concurrentCourseItem;
  }

  // 학년 미선택 시 처리 (원상복구)
  if (!concurrentCourseItem.grade) {
    await dialog.alertSimple('학년을 선택해 주세요.');
    concurrentCourseItem.displayedTitleBeforeEdit = concurrentCourseItem.displayedTitle;
    return concurrentCourseItem;
  }

  // 중복명 체크
  const isDuplicated = concurrentConfsByGrade.value.some(item =>
    item.displayedTitle === newTitle &&
    item.courseId !== concurrentCourseItem.courseId &&
    item.grade === concurrentCourseItem.grade
  );
  if (isDuplicated) {
    await dialog.alertSimple('동일한 그룹명이 존재합니다. 다른 이름을 입력해 주세요.');
    concurrentCourseItem.displayedTitleBeforeEdit = concurrentCourseItem.displayedTitle;
    return concurrentCourseItem;
  }

  // 적용 및 저장
  concurrentCourseItem.displayedTitle = newTitle;

  if (concurrentCourseItem.courseId) {
    await concurrentConfService.updateConcurrentCourse(
      concurrentCourseItem.courseId,
      concurrentCourseItem.grade,
      concurrentCourseItem.displayedTitle,
      concurrentCourseItem.periodCount || null,
      concurrentCourseItem.consecutivePeriod || null
    );
  } else {
    const { conf } = await concurrentConfService.createConcurrentCourse({
      grade: concurrentCourseItem.grade,
      displayedTitle: concurrentCourseItem.displayedTitle
    });
    concurrentCourseItem.courseId = conf.courseId;
    if (wasDraft) {
      getGradeConcurrentConfs();
    }
  }

  return concurrentCourseItem;
};

const handleChangeGradeOnRow = async (concurrentCourseItem: ConcurrentConfCourseItem, selectedGrade: number) => {
  const hasEnrolledCourse = [concurrentCourseItem.lessonConfByNormalClass, concurrentCourseItem.lessonConfByVirtualClass].some((lessonConfByClass) =>
    Object.keys(lessonConfByClass).some((classNum) => !!lessonConfByClass[classNum].lessonConf)
  );

  const hasFixedConf = fixedConfs.value.some((fixedConf) => {
      fixedConf.courseId === concurrentCourseItem.courseId
  });

  if (hasEnrolledCourse || hasFixedConf) {
    const reply = await confirmLessonDelete(
      '학년 변경 시 등록한 과목이 전체 해제됩니다.<br>변경하시겠습니까?',
      '학년을 변경하시겠습니까?'
    );
    
    if (!reply) {
      return;
    }
  }

  concurrentCourseItem.grade = selectedGrade;
  if (!concurrentCourseItem.courseId || concurrentCourseItem.courseId === '') { return; }

  await concurrentConfService.updateConcurrentCourse(
    concurrentCourseItem.courseId,
    concurrentCourseItem.grade,
    concurrentCourseItem.displayedTitle,
    concurrentCourseItem.periodCount || null,
    concurrentCourseItem.consecutivePeriod || null
  );
  await doAfterModify();
};

const handleClickAddEmptyRecord = async () => {
  const msg = '수업을 추가하시겠습니까?';
  if(await confirmLessonDelete(undefined, msg) === false) {
    return;
  }
  
  addEmptyRecord();
};

const addEmptyRecord = () => {

  if (concurrentConfsByGrade.value.length > 99) {
    dialog.alertSimple('동시 수업은 최대 100개까지 등록할 수 있습니다.');
    return;
  }

  const hasEmptyRecord = concurrentConfsByGrade.value.some((item) => {
    return !item.courseId || item.courseId === '';
  });

  if (hasEmptyRecord) {
    dialog.alertSimple('학년과 그룹명을 입력해 주세요.');
    return;
  }

  const lessonConfByNormalClass = Array.from({ length: maxClassCount.value }, (_, i) => i + 1)
    .reduce((acc, classNum) => {
      acc[classNum] = {
        lessonConf: null,
        courseName: '',
        teacherName: '',
        periodCount: null,
        isWarningRelatedPeriod: false
      };
      return acc;
    }, {} as Record<number, LessonConfOption>);

  const lessonConfByVirtualClass = Array.from({ length: maxVirtualClassCount.value }, (_, i) => i + 1)
    .reduce((acc, classNum) => {
      acc[classNum] = {
        lessonConf: null,
        courseName: '',
        teacherName: '',
        periodCount: null,
        isWarningRelatedPeriod: false
      };
      return acc;
    }, {} as Record<number, LessonConfOption>);

  concurrentCourseToAdd.value = {
    courseId: '',
    grade: undefined,
    consecutivePeriod: '',
    isCombinedClass: false,
    sortNo: undefined,
    displayedTitleBeforeEdit: '',
    isCheck: false,
    lessonConfByNormalClass,
    lessonConfByVirtualClass,
  } as ConcurrentConfCourseItem;

  concurrentConfsByGrade.value.push(concurrentCourseToAdd.value);

};

const doAfterModify = async () => {
  if(assignedClassLessonCount.value > 0) {
    await progressContext.reload();
    await lessonContext.reload();
  }
};

const handleClickAttachConcurrentCourse = async (
  concurrentCourseItem: ConcurrentConfCourseItem,
  confOnClass: LessonConfOption, 
  selectedOption: { lessonConf: LessonConf, displayedTitle: string, teacherName: string, periodCount: number }
) => {

  // console.log('handleClickAttachConcurrentCourse', { concurrentCourseItem, confOnClass, selectedOption });

  if (!selectedOption.lessonConf) {
    return;
  }

  if(await confirmLessonDelete(undefined, '수업을 추가하시겠습니까?') === false) {
    return;
  }

  const checkCombinedClass = [concurrentCourseItem.lessonConfByNormalClass, concurrentCourseItem.lessonConfByVirtualClass].some((lessonConfByClass) =>
    Object.keys(lessonConfByClass).some((classNum) => {
      const lessonConf = lessonConfByClass[classNum].lessonConf;
      return (
        lessonConf &&
        lessonConf.courseId === selectedOption.lessonConf.courseId &&
        lessonConf.teacherId === selectedOption.lessonConf.teacherId &&
        lessonConf.classId !== selectedOption.lessonConf.classId
      );
    })
  );

  if (checkCombinedClass) {
    const reply = await dialog.confirmSimple(
      '선택하신 수업은 동일한 선생님 수업입니다.<br>합반 처리 하시겠습니까?');
    if (!reply) {
      return;
    }
  }

  try {
    confOnClass.lessonConf = selectedOption.lessonConf;
    confOnClass.courseName = selectedOption.displayedTitle;
    confOnClass.teacherName = selectedOption.teacherName;
    confOnClass.periodCount = selectedOption.periodCount;
    
    await concurrentConfService.attachConcurrentCourseIdOnLessonConf(
      concurrentCourseItem.courseId,
      selectedOption.lessonConf.classId,
      selectedOption.lessonConf.courseId
    );

    await doAfterModify();
  } catch (error) {
    console.error('Error attaching concurrent course:', error);
  }
};

const handleClickDetachConcurrentCourse = async (
  concurrentCourseId: string,
  confOnClass: LessonConfOption
) => {
  try {
    if (!confOnClass.lessonConf) {
      console.warn('No lessonConf on this class.');
      return;
    }

    if(await confirmLessonDelete(undefined, '수업을 삭제하시겠습니까?') === false) {
      return;
    }

    await concurrentConfService.detachConcurrentCourseIdOnLessonConf(
      concurrentCourseId,
      confOnClass.lessonConf.classId,
      confOnClass.lessonConf.courseId
    );

    await doAfterModify();
  } catch (error) {
    console.error('Error attaching concurrent course:', error);
  }
}

const isJointClass = (row: ConcurrentConfCourseItem, classNum: number, classType: ClassType) => {
  const classMapByType = classType === ClassType.Normal
    ? row.lessonConfByNormalClass
    : row.lessonConfByVirtualClass;
  const currentLesConf = classMapByType[classNum].lessonConf;
  if (!currentLesConf) {
    return false;
  }
  const matches = (lesConf: LessonConf | null | undefined) =>
    !!lesConf &&
    lesConf.courseId === currentLesConf.courseId &&
    lesConf.teacherId === currentLesConf.teacherId &&
    lesConf.classId !== currentLesConf.classId;

  // 다른 일반 반(현재 반 제외) 또는 가상 반에서 동일한 교사/과목이 있는지 확인
  return (
    Object.values(row.lessonConfByNormalClass).some(opt => matches(opt.lessonConf)) ||
    Object.values(row.lessonConfByVirtualClass).some(opt => matches(opt.lessonConf))
  );
};

const getMenuItems = (
  confItem: ConcurrentConfCourseItem,
  classNumAndType: string
) => {

  const currentClass = classMapByGradeAndClassNumAndType.value[`${confItem.grade}-${classNumAndType}`];

  if (!currentClass) { return []; }

  // lessonConf 목록을 가져온다.
  // 해당 학급의 과목 중, 동시 수업 설정의 시수와 동일하고, 이미 동시 수업에 할당되지 않은 과목을 가져온다.
  const classLessonConfs = lessonConfContext.getByClassIdWithUniqueCourse(currentClass.classId);

  const assignedLesConfs = [...Object.values(confItem.lessonConfByNormalClass), ...Object.values(confItem.lessonConfByVirtualClass)]
    .flatMap((confOption) => confOption.lessonConf ? confOption.lessonConf : null)
    .filter((lesConf) => lesConf !== null);

  const seletedClass = classMap.value[currentClass.classId];

  return classLessonConfs
    .filter((conf) => {
      if (conf.concurrentCourseId !== null && conf.concurrentCourseId !== '') {
        return false;
      }

      const isConsecutive = consecutiveConfs.value.some(cc => cc.courseId === conf.courseId && cc.grade === confItem.grade && cc.teacherId === conf.teacherId);
      if (isConsecutive) {
        return false;
      }

      const cls = classMap.value[conf.classId];
      if (cls.grade !== seletedClass.grade) {
        return false;
      }

      const crs = getCourseById(conf.courseId);
      if (!crs || crs.periodCount !== confItem.periodCount || crs.isUnified || crs.isDoubleTeacher) {
        return false;
      }

      const isSpecialtyRoomConfAssigned = specialtyRoomConfs.value.some(src =>
        src.courseId === conf.courseId &&
        src.teacherId === conf.teacherId &&
        src.grade === conf.grade
      );

      if (isSpecialtyRoomConfAssigned) {
        return false;
      }

      const isExcluded = assignedLesConfs.find(assigned => {
        if (!assigned) return false;
        return assigned.courseId !== conf.courseId && assigned.teacherId === conf.teacherId;
      });
      
      if (isExcluded) {
        return false;
      }

      return true;
    })
    .map((conf) => {
      const course = getCourseById(conf.courseId);
      return {
        value: {
          standardCourseTitle: course?.standardCourseTitle || '',
          displayedTitle: course?.displayedTitle || '',
        },
        periodCount: course?.periodCount || 0,
        lessonConf: conf,
        teacherName: teacherMap.value[conf.teacherId].teacherName || '',
      };
    });
};

const handleClickOpenSwapDialog = (concurrentCourseId: string, lessonConf: LessonConf | null) => {
  if (!lessonConf) { return; }
  selectedCell.value = {
    concurrentCourseId,
    lessonConfId: lessonConf.lessonConfId
  };
  isExchangeDialogOpened.value = true;
};

const handleCloseSwapDialog = () => {
  selectedCell.value = { concurrentCourseId: '', lessonConfId: '' };
  isExchangeDialogOpened.value = false;
};

// Temporary placeholder for fixed configuration dialog button
const handleClickOpenFixedConfDialog = async () => {
  await dialog.alertSimple('추후 업데이트 예정입니다.');
};

const handleSubmitSwapConfs = async (sourceTarget: { source: string, target: string }) => {
  if(await confirmLessonDelete(undefined, '동시 수업을 수정하시겠습니까?') === false) {
    return;
  }

  await concurrentConfService.swapLessonConfs(
    sourceTarget.source,
    sourceTarget.target
  );

  await concurrentConfContext.reload();

  getGradeConcurrentConfs();
  handleCloseSwapDialog();

  await doAfterModify();
};

const handleSubmitTossConfs = async (sourceTarget: { source: string, target: string}) => {

  if(await confirmLessonDelete(undefined, '동시 수업을 수정하시겠습니까?') === false) {
    return;
  }

  await concurrentConfService.tossLessonConfs(
    sourceTarget.source,
    sourceTarget.target
  );

  await concurrentConfContext.reload();

  getGradeConcurrentConfs();
  handleCloseSwapDialog();

  await doAfterModify();
}

const getClassNameByLessonConf = (lessonConf: LessonConf | null) => {
  if (!lessonConf) {
    return '';
  }

  const cls = classMap.value[lessonConf.classId];
  return cls && TimetableDisplayUtils.formatFullClassName(cls) || '';
};


const confirmLessonDelete = async (simpleMsg?: string, delLessonMsg?: string) => {
  if(assignedClassLessonCount.value === 0 ) {
    return simpleMsg ? await dialog.confirmSimple(simpleMsg) : true;
  }
  
  const msg = `${delLessonMsg}<br />7단계에 배정된 수업이 모두 초기화됩니다.`;

  return await dialog.confirm(`
    ${msg}
    <div class="blue-box"> 
      <i class="hi-ico ico-primary ico-warning-circle-fill ico-size-18"></i>
      동시, 연속, 특별실 등 부가 정보가 변경될 경우 <strong>7단계에서 작성한 데이터</strong>가 삭제될 수 있습니다.
    </div>      
    `, null, {
      customClass: 'timetable-confirm',
      showCloseButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소'
  });

};


defineExpose({
  hasWarningSignOnRow
});

// const handleClickOpenFixedConfDialog = () => {
//   concurrentConfMapByGrade.value = concurrentConfsByGrade.value.reduce((acc, conf: ConcurrentConfCourseItem) => {
//     if (!conf.grade) return acc;
//     if (!acc[conf.grade]) acc[conf.grade] = [];

//     acc[conf.grade].push({
//       courseId: conf.courseId,
//       displayedTitle: conf.displayedTitle,
//       grade: conf.grade,
//       consecutivePeriod: conf.consecutivePeriod,
//       isFixed: conf.isFixed,
//       isEdited: false
//     });
//     return acc;
//   }, {} as Record<number, ConcurrentCourseSimple[]>);
//   isFixedConfDialogOpened.value = true;
// };

// const handleCloseFixedConfDialog = () => {
//   isFixedConfDialogOpened.value = false;
// };

</script>

<style lang="scss" scoped>
.concurrent-course-conf{
  .table-head{
    &.sticky {
      padding: 20px 0 12px 0;
    }
    .hi-selectbox{
      width: 160px;
    }
    .btn-area {
      gap: 8px;
    }
  }
  .table-content{    
    max-height: calc(var(--vh) * 100 - 320px);
    min-height: calc(var(--vh) * 100 - 375px);
    table > tbody > tr > td{
      height: 82px;
      //.course-name{font-size:16px;}  
    }
    table > tbody > tr > td.tfoot{height: 56px;}
  
    // error 처리
    tr.error{
      td:not(.empty),
      td button,
      .hi-selectbox ::v-deep .selected,
      .autocomplete-wrap ::v-deep input,
      input{
        background-color: #faebeb !important;
      }
      td.error button > div{
        color: var(--warning);
      }
    }
    .hi-selectbox ::v-deep .option__layer{
      max-width: none;
      width: auto
    }
  }
  // 과목 자동완성 리스트 
  td .autocomplete-wrap ::v-deep{
    .autocomplete-list{
      width:280px;
      top: calc(100% - 6px);
      left: 4px;
      .item{
        display: flex;
      }      
    }
  }
  .autocomplete-wrap.opt-top ::v-deep{
    .autocomplete-list{
      top: auto;
      bottom: calc(100% - 6px) !important
    }
  }
}

</style>
