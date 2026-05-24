<template>
  <section class="timetable-basicinfo">
    <div class="hi-row no-gutters">
      <div class="col-sm-12">
        <div class="h3-tit mt-00">
          <h3>수업 요일</h3>
          <p class="smr">수업 요일을 선택해 주세요.</p>
        </div>
        <div class="con">
          <div class="days">
            <div v-for="d of daysOfWeek" :key="`weekday-${d.index}`">
              <input
                type="checkbox"
                :id="`weekday-check-${d.index}`"
                name="radio1"
                class="btn-type rounded"
                :checked="classDays[d.index] == 1"
                @change="($event) => handleChangeWeekday($event, d.index)"
                :disabled="isFinished"
              />
              <label :for="`weekday-check-${d.index}`"
                ><span>{{ d.title }}</span></label
              >
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-12 col-xxl-6">
        <div class="h3-tit">
          <h3>
            최대 교시 수
            <!-- <button type="button" class="btn btn-link btn-help" :class="{'help-on' : helpOn === '최대 교시'}" @click="openHelp('최대 교시')"><span class="sr-only">도움말</span></button> -->
            <HelpButton :id="'최대 교시 수'" :active="helpOn === '최대 교시 수'" />
          </h3>
          <p class="smr">주간 수업 중 최대 교시 수를 선택해 주세요.</p>
        </div>
        <div class="con hi-row no-gutters">
          <HiSelectBox
            class="col-lg-6"
            :value="maxPeriodSelected"
            :items="maxPeriodItems"
            @update:value="maxPeriodSelected = $event"
            :empty-title="maxPeriodEmptyTitle"
            :disabled="isFinished"
          />
          <p class="smr col-lg-6">(예: 시작 교시 0, 운영 교시 수 7 선택 시 0~6교시 생성)</p>
        </div>
      </div>
      <div class="col-lg-12 col-xxl-6">
        <div class="h3-tit">
          <h3>
            시작 교시
            <!-- <button type="button" class="btn btn-link btn-help" :class="{'help-on' : helpOn === '시작 교시'}" @click="openHelp('시작 교시')"><span class="sr-only">도움말</span></button> -->
            <HelpButton :id="'시작 교시'" :active="helpOn === '시작 교시'" />
          </h3>
          <p class="smr">선택한 시작 교시부터 최대 교시 수만큼 교시가 생성됩니다.</p>
        </div>
        <div class="con">
          <HiSelectBox
            :value="startPeriodSelected"
            :items="startPeriodItems"
            @update:value="startPeriodSelected = $event"
            :empty-title="startPeriodEmptyTitle"
          />
        </div>
      </div>
      <div class="col-sm-12">
        <div class="h3-tit">
          <h3>학년/반 설정</h3>
          <p class="smr">우리 학교의 학년/반을 설정해 주세요.</p>
        </div>
        <div class="con">
          <HiSelectBox 
            :value="gradeSelected"
            :items="gradeItems"
            @update:value="gradeSelected = $event"
            :empty-title="gradeSelectedEmptyTitle"
            :disabled="isFinished" />
          <button class="btn btn-tertiary-blue ml-10" @click="handleClickOpenClassNameDlg">학년/반 이름 변경</button>
        </div>
      </div>
      <div class="grade-count">
        <div class="hi-row" v-for="(grade, idx) in grades" :key="`grade-${idx}`">
          <div class="col-md-6 col-lg-4 form-group mb-25">
            <label>{{ grade.gradeName ? grade.gradeName : `${grade.grade}` }}학년</label>
            <div class="form-ctr">
              <input
                class="sm"
                type="text"
                v-model="grade.maxClassCountValue"
                placeholder="학급수 등록 (숫자만 입력)"
                :class="{ error: grade.isStartEditing && !grade.maxClassCountValue }"
                @input="($event) => handleInputMaxClassCount($event, grade)"
                @blur="($event) => handleBlurMaxClassCount($event, grade)"
                min="0"
                max="99"
                spellcheck="false"
                :disabled="isFinished"
              />
            </div>
            <small
              class="txt-warning"
              v-if="grade.isStartEditing && !grade.maxClassCount"
              :key="`error-maxclass-${grade.grade}-${grade.isStartEditing}`"
              >학급 수를 입력하세요.</small
            >
          </div>
          <div class="col-md-6 col-lg-4 form-group mb-25">
            <label
              >가상학급
              <!-- <button type="button" class="btn btn-link btn-help" :class="{'help-on' : helpOn === '가상학급'}" @click="openHelp('가상학급')"><span class="sr-only">도움말</span></button> -->
              <HelpButton :id="'가상학급'" :active="helpOn === '가상학급'" />
            </label>
            <div class="form-ctr">
              <input
                class="sm"
                type="text"
                v-model="grade.maxVirtualClassCountValue"
                placeholder="선택사항(숫자만 입력)"
                :class="{ error: isErrorMaxVirtualClassCount(grade.grade) }"
                min="0"
                max="99"
                @input="($event) => handleInputMaxVirtualClassCount($event, grade)"
                @blur="($event) => handleBlurMaxVirtualClassCount($event, grade)"
                spellcheck="false"
                :disabled="isFinished"
              />
            </div>
            <small class="txt-warning" v-if="isErrorMaxVirtualClassCount(grade.grade)">학급 수를 입력하세요.</small>
          </div>
        </div>
      </div>
    </div>
    <TimeTableModal size="lg" @close="handleClickCloseClassNameDlg" v-if="isShowClassNameDlg">
      <template v-slot:heading>
        학년/반 이름 변경
        <p class="smr">
          시간표에 표기되는 학년/반 명 수정을 할 수 있습니다. 최대 5자까지 입력 가능합니다.<br />
          학년/반은 자동으로 표기되므로 실제 사용할 명칭만 입력하세요. (예: [입력]예비 → [표기]예비학년 / [입력]관광경영 → [표기]관광경영반)
        </p>
      </template>

      <template v-slot:content>
        <div class="table-content table-form sticky-wrap table-box">
          <table>
            <caption>
              학년 반 리스트
            </caption>
            <colgroup>
              <col style="width: 102px" />
              <col v-for="n in peakClassCount" :key="`col-class-${n}`" style="width: 104px" />
              <col v-for="n in peakVirtualClassCount" :key="`col-virtual-${n}`" style="width: 104px" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" class="sticky-top sticky-left">학년</th>
                <th v-for="n in peakClassCount" :key="`class-header-${n}`" class="sticky-top">학급명({{ n }})</th>
                <th v-for="n in peakVirtualClassCount" :key="`virtual-header-${n}`" class="sticky-top">가상학급({{ n }})</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(grade, gIdx) in grades" :key="'row-' + gIdx">
                <td class="sticky-left">
                  <div class="input-wrap">
                    <input
                      type="text"
                      v-model="grade.gradeName"
                      @input="($event) => handleInputGradeName($event, grade)"
                      @compositionstart="handleGradeNameCompositionstart"
                      @compositionend="($event) => handleGradeNameCompositionend($event, grade)"
                      @focus="($event) => handleFocusGradeClassName($event)"
                      @blur="($event) => handleBlurGradeName($event, grade)"
                    />
                  </div>
                </td>

                <!-- 실제 학급 -->
                <td v-for="n in peakClassCount" :key="'class-' + grade.grade + '-' + n">
                  <div class="input-wrap">
                    <input
                      type="text"
                      :value="`${getClassNameInitValue(grade, n)}`"
                      :placeholder="n <= grade.maxClassCount ? n : ''"
                      :disabled="n > grade.maxClassCount"
                      @input="($event) => updateClassName($event, grade.grade, n - 1)"
                      @focus="($event) => handleFocusGradeClassName($event)"
                      @blur="($event) => handleBlurClassName($event, grade.grade, n - 1)"
                      @compositionstart="handleClassNameCompositionstart"
                      @compositionend="($event) => handleClassNameCompositionend($event, grade.grade, n - 1)"
                      spellcheck="false"
                    />
                  </div>
                </td>

                <!-- 가상 학급 -->
                <td v-for="n in peakVirtualClassCount" :key="'virtual-' + grade.grade + '-' + n">
                  <div class="input-wrap">
                    <input
                      type="text"
                      :value="`${getClassNameInitValue(grade, n, true)}`"
                      :placeholder="n <= virtualClassesByGrade[grade.grade].length ? n : ''"
                      :disabled="n > virtualClassesByGrade[grade.grade].length"
                      @input="updateClassName($event, grade.grade, n - 1, true)"
                      @focus="($event) => handleFocusGradeClassName($event)"
                      @blur="($event) => handleBlurClassName($event, grade.grade, n - 1, true)"
                      @compositionstart="handleClassNameCompositionstart"
                      @compositionend="($event) => handleClassNameCompositionend($event, grade.grade, n - 1, true)"
                      spellcheck="false"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </TimeTableModal>

    <DataEntryNoticeModal v-if="isShowDataEntryNoticeModal" :noticeType="noticeType" @close="handleCloseDataEntryNoticeModal" />
  </section>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, nextTick, getCurrentInstance } from 'vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import DataEntryNoticeModal from '../components/DataEntryNoticeModal.vue';
import { ContextKeys, TimetableClassContext, TimetableGradeContext, TimetableProgressContext } from '../contexts';
import { Class, TimetableConfig, TimetableGrade, TimetableStatus } from '../core/types';
import { TIMETABLE_CONFIG_INITIAL_STATE, TimetableCreateRequest } from '../contexts/timetable-grade-context';
import { useDialog } from '../composables/dialog';
import { DAYS_OF_WEEK } from '../common/constants';
import { get } from 'lodash';
import { NoticeType } from '../common/types';
import { TimetableDisplayUtils } from '../common/utils';
import HelpButton from '@/apps/timetable/components/HelpButton.vue';

const { proxy } = getCurrentInstance() as any;

const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;

interface EditableTimetableGrade extends TimetableGrade {
  maxClassCountValue: number | null;
  maxVirtualClassCountValue: number | null;
  isStartEditing: boolean;
}

interface EditableTimetableConfig extends TimetableConfig {
  grades: EditableTimetableGrade[];
}

// const editableTimetableConfig = ref<TimetableConfig>({ ...TIMETABLE_CONFIG_INITIAL_STATE });
const editableTimetableConfig = ref<EditableTimetableConfig>({ ...TIMETABLE_CONFIG_INITIAL_STATE } as EditableTimetableConfig);
const editableClasses = ref<Class[]>([]);
const isShowClassNameDlg = ref(false);
const prevGradeClassName = ref<string>('');
const isComposing = ref<boolean>(false);

// 데이터 수정 관련 안내 팝업  상태
const noticeType = ref<NoticeType>(NoticeType.None);
const isShowDataEntryNoticeModal = ref(false);
const handleCloseDataEntryNoticeModal = () => {
  isShowDataEntryNoticeModal.value = false;
};

const maxPeriodItems = Array.from({ length: 10 }, (_, i) => ({ value: i + 1, title: `${i + 1}` }));
const startPeriodItems = Array.from({ length: 2 }, (_, i) => ({ value: i, title: `${i}교시` }));
const gradeItems = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, title: `${i + 1}학년` }));
const daysOfWeek = [...DAYS_OF_WEEK];

const dialog = useDialog();

const classDays = computed(() => editableTimetableConfig.value.classDays || [0, 0, 0, 0, 0, 0, 0]);
const maxPeriodEmptyTitle = computed(() => (maxPeriodSelected.value ? `${maxPeriodSelected.value}교시` : '선택'));
const gradeSelectedEmptyTitle = computed(() => `${gradeSelected.value}학년`);
const grades = computed(() => editableTimetableConfig.value.grades || []);
const startPeriodEmptyTitle = computed(() => (startPeriodSelected.value ? `${startPeriodSelected.value}교시` : '선택'));
const classMap = computed(() => (classContext.classMap as Record<string, Class>) || {});
const gradeMap = computed(() => (gradeContext.gradeMap as Record<number, TimetableGrade>) || {});
const isFinished = computed(() => progressContext.status === TimetableStatus.Finish);

const maxPeriodSelected = computed({
  get() {
    return editableTimetableConfig.value.maxPeriod;
  },
  set(value) {
    editableTimetableConfig.value.maxPeriod = value;
  },
});

const startPeriodSelected = computed({
  get() {
    return editableTimetableConfig.value.startPeriod;
  },
  set(value) {
    editableTimetableConfig.value.startPeriod = value;
  },
});

const gradeSelected = computed({
  get() {
    return editableTimetableConfig.value.maxGrade || 3;
  },
  set(value) {
    editableTimetableConfig.value.maxGrade = value;
    // 학년 수에 따라 학급 수를 조정
    adjustGradesToMaxGrade(value);
  },
});

const classesByGrade = computed(() => {
  const listMapByGrade = editableClasses.value.filter((classItem) => !classItem.isVirtual).reduce(classReducerByGrade, {} as Record<number, Class[]>);

  return grades.value.reduce((acc, grade) => {
    acc[grade.grade] = listMapByGrade[grade.grade] || [];
    return acc;
  }, {} as Record<string, Class[]>);
});

const virtualClassesByGrade = computed(() => {
  const listMapByGrade = editableClasses.value.filter((classItem) => classItem.isVirtual).reduce(classReducerByGrade, {} as Record<number, Class[]>);

  return grades.value.reduce((acc, grade) => {
    acc[grade.grade] = listMapByGrade[grade.grade] || [];
    return acc;
  }, {} as Record<string, Class[]>);
});

const peakClassCount = computed(() => Math.max(...grades.value.map((grade) => grade.maxClassCount)));
const peakVirtualClassCount = computed(() => Math.max(...grades.value.map((grade) => grade.maxVirtualClassCount)));

const fromNextStep = computed(() => proxy.$route && proxy.$route.params && proxy.$route.params?.moveType === 'prev');

const showNoticeIfNotSeen = (key: NoticeType) => {
  if (!sessionStorage.getItem(key)) {
    noticeType.value = key;
    isShowDataEntryNoticeModal.value = true;
    sessionStorage.setItem(key, 'true');
  }
};

onMounted(async () => {
  await progressContext.reload();

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
  await classContext.reload();

  // 수정된 값을 별도로 관리하기 위해 복사
  deepCopyEditableTimetableConfigFromContext();
  deepCopyEditableClassesFromContext();
};

const deepCopyEditableTimetableConfigFromContext = () => {
  editableTimetableConfig.value.classDays = [...gradeContext.timetableConfig.classDays];
  editableTimetableConfig.value.maxPeriod = gradeContext.timetableConfig.maxPeriod || 7;
  editableTimetableConfig.value.startPeriod = gradeContext.timetableConfig.startPeriod === 0 ? 0 : gradeContext.timetableConfig.startPeriod || 1;
  editableTimetableConfig.value.maxGrade = gradeContext.timetableConfig.maxGrade || 3;
  editableTimetableConfig.value.isDisplayDailyScheduleTime = gradeContext.timetableConfig.isDisplayDailyScheduleTime;
  editableTimetableConfig.value.isDisplayLunchTime = gradeContext.timetableConfig.isDisplayLunchTime;
  editableTimetableConfig.value.grades = [
    ...gradeContext.timetableConfig.grades.map((grade) => {
      return {
        ...grade,
        maxClassCountValue: grade.maxClassCount === 0 ? null : grade.maxClassCount,
        maxVirtualClassCountValue: grade.maxVirtualClassCount === 0 ? null : grade.maxVirtualClassCount,
      } as EditableTimetableGrade; // as TimetableGrade;
    }),
  ];
};

const deepCopyEditableClassesFromContext = () => {
  const contextClasses = classContext.classes;
  contextClasses.length
    ? contextClasses.forEach((cls) => {
        const editableClass = { ...cls };
        editableClasses.value.push(editableClass);
      })
    : setDefaultClasses();
};

const setDefaultClasses = () => {
  Array.from({ length: 3 }, (_, i) => i + 1).forEach((grade) => {
    editableClasses.value.push({ grade, classNumber: 1, className: '1', isVirtual: false } as Class);
  });
};

const handleFocusGradeClassName = (event: any) => {
  prevGradeClassName.value = event.target.value;
};

const handleBlurGradeName = (event: any, grade: EditableTimetableGrade) => {
  const newValue = event.target.value;
  const prevValue = prevGradeClassName.value;
  prevGradeClassName.value = '';

  if (newValue && newValue.trim().length > 0) {
    return;
  }

  grade.gradeName = prevValue;
  event.target.value = prevValue;
};

const getClassNameInitValue = (grade: EditableTimetableGrade, clsIdx: number, isVirtual: boolean = false) => {
  const grNum = grade.grade;
  const idx = clsIdx - 1;
  const maxCount = isVirtual ? grade.maxVirtualClassCount : grade.maxClassCount;
  const listByGrade = isVirtual ? virtualClassesByGrade.value : classesByGrade.value;
  const value = idx < maxCount ? listByGrade[grNum][idx] && listByGrade[grNum][idx].className : '';
  return value;
};

const handleBlurClassName = (event: any, grNum: number, clsIdx: number, isVirtual: boolean = false) => {
  isComposing.value = false;

  const newValue = event.target.value;
  const prevValue = prevGradeClassName.value;
  prevGradeClassName.value = '';

  if (newValue && newValue.trim().length > 0) {
    return;
  }

  const cls = isVirtual ? virtualClassesByGrade.value[grNum][clsIdx] : classesByGrade.value[grNum][clsIdx];
  cls.className = prevValue;
  event.target.value = prevValue;
};

const handleChangeWeekday = async (evt: any, index: number) => {
  const count = classDays.value.reduce((acc, val) => acc + val, 0);
  if (count === 1 && classDays.value[index] === 1) {
    // 최소 1일은 선택되어야 함
    evt.target.checked = true;
    dialog.toast('수업 요일을 최소 1개 이상 선택해 주세요.');
    return;
  }

  classDays.value[index] = classDays.value[index] === 1 ? 0 : 1;
};

const classReducerByGrade = (acc: Record<number, Class[]>, classItem: Class) => {
  const grade = classItem.grade;
  if (!acc[grade]) {
    acc[grade] = [];
  }
  classItem.className = (classItem.className || '').replace('반', '');
  acc[grade].push(classItem);
  acc[grade].sort((a, b) => {
    return a.classNumber - b.classNumber;
  });

  return acc;
};

const adjustGradesToMaxGrade = (maxGrade: number) => {
  const curEditableGrades = editableTimetableConfig.value.grades || [];
  if (maxGrade < curEditableGrades.length) {
    // 학년 수가 줄어들 경우
    editableTimetableConfig.value.grades = curEditableGrades.filter((grade) => grade.grade <= maxGrade);

    // 학급 수를 조정
    editableClasses.value = editableClasses.value.filter((cls) => cls.grade <= maxGrade);

    return;
  } else if (maxGrade > curEditableGrades.length) {
    // 학년 수가 늘어날 경우
    for (let i = curEditableGrades.length + 1; i <= maxGrade; i++) {
      editableTimetableConfig.value.grades.push({
        grade: i,
        gradeName: `${i}`,
        maxClassCount: 0,
        maxVirtualClassCount: 0,
        isStartEditing: false,
      } as EditableTimetableGrade);
      editableClasses.value.push({ grade: i, classNumber: 1, className: '1', isVirtual: false } as Class);
    }
  }
};

const handleChangeMaxClassCount = (classCount: number, grade: EditableTimetableGrade) => {
  // console.log('>>> handleChangeMaxClassCount', classCount, grade);
  grade.isStartEditing = true;

  if (classCount < 1) {
    grade.maxClassCount = 0;
    return;
  }

  const curEditableClasses = editableClasses.value.filter((c) => c.grade === grade.grade && c.isVirtual === false);

  if (classCount < curEditableClasses.length) {
    editableClasses.value = editableClasses.value.filter(
      (c) =>
        c.grade !== grade.grade ||
        (c.grade === grade.grade && c.isVirtual === true) ||
        (c.grade === grade.grade && c.classNumber <= classCount && c.isVirtual === false)
    );
  } else if (classCount > curEditableClasses.length) {
    for (let i = curEditableClasses.length + 1; i <= classCount; i++) {
      editableClasses.value.push({ grade: grade.grade, classNumber: i, className: '', isVirtual: false } as Class);
    }
  }
};

const validateClassCountInput = (value: string) => {
  const classCountMax = 99;
  value = value.length > 2 ? value.slice(0, 2) : value;
  let numValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  numValue = numValue < 1 ? 0 : numValue;
  return numValue > classCountMax ? classCountMax : numValue;
};

const handleInputMaxClassCount = (event: any, grade: EditableTimetableGrade) => {
  //const classCountValue = event.target.value.replace(/[^0-9]/g, '');
  const classCount = validateClassCountInput(event.target.value);
  event.target.value = classCount;

  grade.isStartEditing = true;

  grade.maxClassCount = classCount;
  grade.maxClassCountValue = classCount === 0 ? null : classCount;
};

const handleBlurMaxClassCount = (event: any, grade: EditableTimetableGrade) => {
  //const classCountValue = event.target.value.replace(/[^0-9]/g, '');
  const classCount = validateClassCountInput(event.target.value);
  event.target.value = classCount;

  // grade.isStartEditing = true;

  grade.maxClassCount = classCount;
  grade.maxClassCountValue = classCount === 0 ? null : classCount;

  const curEditableClasses = editableClasses.value.filter((c) => c.grade === grade.grade && c.isVirtual === false);

  if (classCount === curEditableClasses.length) {
    return;
  }

  if (classCount < curEditableClasses.length) {
    editableClasses.value = editableClasses.value.filter(
      (c) =>
        c.grade !== grade.grade ||
        (c.grade === grade.grade && c.isVirtual === true) ||
        (c.grade === grade.grade && c.classNumber <= classCount && c.isVirtual === false)
    );
    return;
  }

  for (let i = curEditableClasses.length + 1; i <= classCount; i++) {
    editableClasses.value.push({ grade: grade.grade, classNumber: i, className: `${i}`, isVirtual: false } as Class);
  }
};

const handleInputMaxVirtualClassCount = (event: any, grade: EditableTimetableGrade) => {
  // const countValue = event.target.value.replace(/[^0-9]/g, '');
  const classCount = validateClassCountInput(event.target.value);
  event.target.value = classCount;

  // const virtualClassCount = parseInt(countValue, 10) || 0;

  grade.maxVirtualClassCount = classCount;
  grade.maxVirtualClassCountValue = classCount < 1 ? null : classCount;
};

const handleBlurMaxVirtualClassCount = (event: any, grade: EditableTimetableGrade) => {
  // const countValue = event.target.value.replace(/[^0-9]/g, '');
  const classCount = validateClassCountInput(event.target.value);
  event.target.value = classCount;

  grade.maxVirtualClassCount = classCount;
  grade.maxVirtualClassCountValue = classCount < 1 ? null : classCount;

  const curEditableClasses = editableClasses.value.filter((c) => c.grade === grade.grade && c.isVirtual === true);

  if (classCount === curEditableClasses.length) {
    return;
  }

  if (classCount < curEditableClasses.length) {
    editableClasses.value = editableClasses.value.filter(
      (c) =>
        c.grade !== grade.grade ||
        (c.grade === grade.grade && c.isVirtual === false) ||
        (c.grade === grade.grade && c.classNumber <= classCount && c.isVirtual === true)
    );
    return;
  }

  for (let i = curEditableClasses.length + 1; i <= classCount; i++) {
    editableClasses.value.push({ grade: grade.grade, classNumber: i, className: `${i}`, isVirtual: true } as Class);
  }
};

const handleClickOpenClassNameDlg = async () => {
  // 학급수/가상학급수가 아직 입력되지 않은 경우
  const emptyClassGrade = editableTimetableConfig.value.grades.find((grade) => (grade.maxClassCount || 0) === 0);

  if (emptyClassGrade) {
    const gradeName = TimetableDisplayUtils.formatGradeName(emptyClassGrade);
    await dialog.confirmSimple(`${gradeName}의 학급 수를 입력해 주세요.`);
    return;
  }
  isShowClassNameDlg.value = true;
};

const handleClickCloseClassNameDlg = () => {
  isShowClassNameDlg.value = false;
};

const isErrorMaxVirtualClassCount = (grade: number) => {
  return false;
};

const handleGradeNameCompositionstart = (event: any) => {
  isComposing.value = true;
};

const handleGradeNameCompositionend = (event: any, grade: EditableTimetableGrade) => {
  isComposing.value = false;

  const targetValue = event.target.value;
  // 한글/영문/숫자 외의 문자는 제거, 최대 5자 제한
  const value = targetValue.replace(/[^가-힣a-zA-Z0-9]/g, '').slice(0, 5);
  event.target.value = value;

  grade.gradeName ||= '';
  grade.gradeName = value;
};

const handleInputGradeName = (event: any, grade: EditableTimetableGrade) => {
  const targetValue = event.target.value;
  const value = isComposing.value ? targetValue : targetValue.replace(/[^가-힣a-zA-Z0-9]/g, '').slice(0, 5);
  event.target.value = value;

  grade.gradeName ||= '';
  grade.gradeName = value;
};

const handleClassNameCompositionstart = (event: any) => {
  isComposing.value = true;
};

const handleClassNameCompositionend = (event: any, grNum: number, clsIdx: number, isVirtual: boolean = false) => {
  isComposing.value = false;

  const targetValue = event.target.value;
  // 한글/영문/숫자 외의 문자는 제거, 최대 5자 제한
  const value = targetValue.replace(/[^가-힣a-zA-Z0-9]/g, '').slice(0, 5);
  event.target.value = value;

  const cls = isVirtual ? virtualClassesByGrade.value[grNum][clsIdx] : classesByGrade.value[grNum][clsIdx];
  cls.className ||= '';
  cls.className = value;
};

const updateClassName = (event: any, grNum: number, clsIdx: number, isVirtual: boolean = false) => {
  if (isComposing.value) {
    return;
  }

  const targetValue = event.target.value;
  const value = isComposing.value ? targetValue : targetValue.replace(/[^가-힣a-zA-Z0-9]/g, '').slice(0, 5);
  event.target.value = value;

  const cls = isVirtual ? virtualClassesByGrade.value[grNum][clsIdx] : classesByGrade.value[grNum][clsIdx];
  cls.className ||= '';
  cls.className = value;
};

const confirmModified = async (): Promise<boolean> => {
  const msg = `
  학교 정보가 변경되었습니다.<br />
  학년, 학급이 줄어든 경우 관련 데이터가 삭제됩니다.<br />
  변경 내용을 적용하고 이동하시겠습니까?`;
  return gradeContext.isCreateMode
    ? true
    : await dialog?.confirm(msg, null, {
        customClass: {
          popup: 'timetable-confirm',
          confirmButton: 'btn-line-warning',
        },
        showCloseButton: true,
        confirmButtonText: '변경 내용 적용',
        cancelButtonText: '취소',
      });
};

// 메뉴 이동시 유효성 검사
const checkBeforeMove = async () => {
  return await handleUpdateTimetableConfig();
};

const handleUpdateTimetableConfig = async () => {
  checkValidation();

  const isChanged = gradeContext.hasChanged(timetableConfigFromEditable());
  // console.log('>>> isChanged', isChanged);

  const isNameChanged = checkGradeClassNamesChanged();
  const isStartPeriodChanged =
    editableTimetableConfig.value.startPeriod !==
    (gradeContext.timetableConfig.startPeriod === undefined ? 1 : gradeContext.timetableConfig.startPeriod);

  const doUpdate = async () => {
    const requestData = convertEditableItemsToRequestFormat();
    await gradeContext.updateTimetableConfig(requestData);
  };

  if (!isChanged) {
    if (isNameChanged || isStartPeriodChanged) await doUpdate();
    return true;
  }

  if (!(await confirmModified())) return false;

  await doUpdate();
  return true;
};

const timetableConfigFromEditable = (): TimetableConfig => {
  return {
    classDays: [...editableTimetableConfig.value.classDays],
    maxPeriod: editableTimetableConfig.value.maxPeriod,
    startPeriod: editableTimetableConfig.value.startPeriod,
    maxGrade: editableTimetableConfig.value.maxGrade,
    isDisplayDailyScheduleTime: editableTimetableConfig.value.isDisplayDailyScheduleTime,
    isDisplayLunchTime: editableTimetableConfig.value.isDisplayLunchTime,
    grades: editableTimetableConfig.value.grades.map((grade) => ({
      grade: grade.grade,
      gradeName: grade.gradeName,
      maxClassCount: grade.maxClassCount,
      maxVirtualClassCount: grade.maxVirtualClassCount,
    })),
  } as TimetableConfig;
};

const checkGradeClassNamesChanged = (): boolean => {
  for (const grade of editableTimetableConfig.value.grades) {
    const grNum = grade.grade;
    const contextGr = gradeMap.value[grNum];
    if (contextGr && grade.gradeName !== (contextGr.gradeName || '').replace('학년', '')) {
      return true;
    }

    const classList = classesByGrade.value[grNum] || [];
    for (let i = 0; i < classList.length; i++) {
      const cls = classList[i];
      const contextCls = classMap.value[cls.classId];
      if (contextCls && cls.className !== (contextCls.className || '').replace('반', '')) {
        return true;
      }
    }

    const virtualClassList = virtualClassesByGrade.value[grNum] || [];
    for (let i = 0; i < virtualClassList.length; i++) {
      const vcls = virtualClassList[i];
      const contextVcls = classMap.value[vcls.classId];
      if (contextVcls && vcls.className !== (contextVcls.className || '').replace('반', '')) {
        return true;
      }
    }
  }

  return false;
};

const convertEditableItemsToRequestFormat = () => {
  editableTimetableConfig.value.grades.sort((a, b) => a.grade - b.grade);
  const classNames: string[][] = editableTimetableConfig.value.grades.map((grade) =>
    (classesByGrade.value[grade.grade] || []).sort((a, b) => a.classNumber - b.classNumber).map((cls) => cls.className)
  );
  const virtualClassNames: string[][] = editableTimetableConfig.value.grades.map((grade) =>
    (virtualClassesByGrade.value[grade.grade] || []).sort((a, b) => a.classNumber - b.classNumber).map((cls) => cls.className)
  );

  return {
    maxGrade: editableTimetableConfig.value.maxGrade,
    classDays: editableTimetableConfig.value.classDays.join(''),
    startPeriod: editableTimetableConfig.value.startPeriod,
    maxPeriod: editableTimetableConfig.value.maxPeriod,
    maxClassCountList: editableTimetableConfig.value.grades.map((grade) => grade.maxClassCount),
    maxVirtualClassCountList: editableTimetableConfig.value.grades.map((grade) => grade.maxVirtualClassCount),
    gradeNames: editableTimetableConfig.value.grades.map((grade) => grade.gradeName),
    classNames,
    virtualClassNames,
  } as TimetableCreateRequest;
};

const checkValidation = () => {
  if (editableTimetableConfig.value.classDays.every((day) => day === 0)) {
    dialog.alertSimple('수업 요일을 선택해 주세요.');
    throw new Error('수업 요일을 선택해 주세요.');
  }

  if (!editableTimetableConfig.value.maxPeriod) {
    dialog.alertSimple('최대 교시를 선택해 주세요.');
    throw new Error('최대 교시를 선택해 주세요.');
  }

  if (editableTimetableConfig.value.startPeriod !== 0 && !editableTimetableConfig.value.startPeriod) {
    dialog.alertSimple('시작 교시를 선택해 주세요.');
    throw new Error('시작 교시를 선택해 주세요.');
  }

  if (!editableTimetableConfig.value.maxGrade) {
    dialog.alertSimple('학년을 선택해 주세요.');
    throw new Error('학년을 선택해 주세요.');
  }

  editableTimetableConfig.value.grades.forEach((grade) => {
    if (grade.maxClassCount < 1) {
      dialog.alertSimple(`${grade.grade}학년의 학급 수를 입력해 주세요.`);
      throw new Error(`${grade.grade}학년의 학급 수를 입력해 주세요.`);
    }
    if (grade.maxVirtualClassCount < 0) {
      dialog.alertSimple(`${grade.grade}학년의 가상 학급 수를 입력해 주세요.`);
      throw new Error(`${grade.grade}학년의 가상 학급 수를 입력해 주세요.`);
    }
  });
};

const props = defineProps({
  helpOn: {
    type: String,
    default: 0,
  },
});

// const emit = defineEmits(['openHelp', 'close-help']);

// // 도움말 열기
// function openHelp(id: string) {
//   if (!id) {
//     emit('close-help');
//     emit('openHelp', '');
//     return;
//   }
//   emit('openHelp', id);
// }

defineExpose({
  checkBeforeMove,
});
</script>

<style lang="scss" scoped>
.timetable-basicinfo {
  border: 1px solid var(--Line-Gray-07);
  border-radius: 12px;
  padding: 30px;
  align-items: flex-start;
  > .hi-row {
    align-items: flex-start;
  }
  .con {
    p.smr {
      color: var(--gray-08, #9e9e9e);
      font-size: 13px;
      font-style: normal;
      font-weight: 400;
      line-height: 130%;
      margin-left: 16px;
      position: relative;
    }
  }
  .days {
    display: flex;
    gap: 14px;
  }
  .hi-selectbox {
    max-width: 360px;
    width: 100%;
  }
  .grade-count {
    margin-top: 20px;
    border-radius: 8px;
    background: var(--gray-01);
    padding: 24px !important;
    width: 100%;
    .hi-row {
      align-items: flex-start;
    }
    .form-group {
      position: relative;
      small {
        position: absolute;
        top: calc(100% + 5px);
        font-size: 13px;
      }
      &.form-group + .form-group {
        margin-top: 0px;
      }
    }
  }
}
.timetable-modal-common {
  ::v-deep .modal__layer {
    .modal__content {
      display: flex;
      flex-flow: column;
    }
  }
}
.table-content {
  max-height: 250px;
}

@media (max-width: 990px) {
  .timetable-basicinfo .con p.smr {
    margin-left: 0px;
    margin-top: 8px;
  }
}
@media (max-width: 680px) {
  .timetable-basicinfo {
    .con {
      display: flex;
      flex-flow: column;
      gap: 8px;
      > div {
        width: 100%;
        max-width: 100%;
      }
      .btn.btn-tertiary-blue {
        margin: 0px !important;
      }
    }
  }
}
</style>