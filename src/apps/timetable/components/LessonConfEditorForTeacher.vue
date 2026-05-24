<template>
  <div>
    <!-- 선생님 시수표 -->        
    <div class="table-title">
      <template v-if="selectedTeacher">
        {{ selectedTeacher.teacherName }} 선생님({{ selectedTeacherTotalPeriod }}) 시수표
      </template>
      <template v-else>
        선생님을 선택하세요
      </template>
      <button class="btn btn-link txt-primary btn-lg"
        :disabled="!selectedTeacher"
        @click="handleClickAddLessonConfItem">
        + 행추가
      </button>
    </div>
    <div class="table-content table-form sticky-wrap teacher-period-table table-box">
      <table>
        <caption>선생님 시수표</caption>        
        <colgroup>
          <col style="width: 128px;">
          <col style="width: 128px;">
          <col style="width: 80px;" v-for="hdClsItem in headClassItems"
            :key="`cls-head-${hdClsItem.classIndex}-${hdClsItem.isVirtual}`">
          <col style="width: 60px;">
        </colgroup>
        <thead>            
          <tr>
            <th scope="col" class="sticky-top">과목명</th>
            <th scope="col" class="sticky-top">학년 선택</th>
            <th scope="col" class="sticky-top"
              v-for="hdClsItem in headClassItems"
              :key="`cls-head-title-${hdClsItem.classIndex}-${hdClsItem.isVirtual}`"
            >            
              {{ hdClsItem.isVirtual ? '가상' : '' }}{{ hdClsItem.classIndex + 1 }}
            </th>
            <th scope="col" class="sticky-top">삭제</th>
          </tr>              
        </thead>
        <tbody>
          <tr v-for="(item, rowIdx) in lessonConfItems" :key="`${rowIdx}-${selectedTeacher?.teacherId}`" >
            <td>
              <AutocompleteInput
                v-model="item.currentCourseName"
                :options="courseBaseOptions"                
                :on-focus="() => handleFocusCourseBaseInput(item)"                
                :on-keydown="e => handleKeyDownCourseBaseInput(item, e)"
                :on-blur="() => handleBlurCourseBaseInput(item)"
                :disabled="!selectedTeacher"
                placeholder="과목명 선택"
                :ref="setCourseBaseInputRef(rowIdx)"
                :class="{ 'opt-top': rowIdx >= 3 }"
              />
            </td>
            <td>
              <div class="input-wrap" 
                :class="selectedTeacher && item.courseBase ? 'hided-empty-grade-cover' : 'empty-grade-cover'"
                @click="() => handleClickEmptyGradeWithoutCourse(rowIdx)" 
              ></div><!-- 과목 선택이 안된 경우 셀렉트 박스를 가리기 위함 -->
              <HiSelectBox          
                class="selectbox-wrap sm"                
                :class="{ 'opt-top': rowIdx >= 3 }"
                :value="item.grade"
                @update:value="handleSelectGrade(item, $event)"
                :items="gradeOptions"
                placeholder="학년 선택"                
                emptyTitle="선택"                
                :ref="setGradeSelectRef(rowIdx)"                
              />              
            </td>
            <td v-for="hdClassItem, idx in headClassItems" :key="`cls-head-periods-${hdClassItem.classIndex}-${hdClassItem.isVirtual}`"
                class="btn-cell"
                :class="{
                  empty: item.grade && !isClassOfSelectedGrade(hdClassItem, item.grade),
                  clickable: item.grade && isClassOfSelectedGrade(hdClassItem, item.grade)
                }"                
              >              
                <HiTooltip v-if="selectedTeacher && isClassOfSelectedGrade(hdClassItem, item.grade)" class="hi-tooltip-wrap" ico="none" :titleHtml="formatClassTooltip(item.grade, hdClassItem)"  position="top">
                  <div slot="button">
                    <div class="input-wrap" >
                      <input
                        type="text"
                        class="period-input"
                        @blur="() => handleBlurPeriod(item, idx)"
                        @keydown.enter="() => handleEnterPeriod(item)"
                        v-model="item.classIndexItems[idx].period"
                        @input="e => restrictNameInput(e, item, idx)"
                        :disabled="!item.courseBase || !item.grade || !isClassOfSelectedGrade(hdClassItem, item.grade)"
                      />
                    </div>
                  </div>
                </HiTooltip>
                <div v-else class="input-wrap" @click="() => handleClickEmptyPeriodWithoutGrade(hdClassItem, item.grade)"></div>
              </td>
            <td>
              <!-- 탭등으로 포커스가 되지 않도록 tabIndex를 -1로 설정 !!중요!! -->
              <button 
                type="button"
                tabindex="-1" 
                @click="() => handleClickRemoveLessonConfItem(item)">
                <span class="sr-only">행 삭제</span>
                <i class="ico ico-trash ico-size-20 ico-gray"></i>
              </button>
            </td>
          </tr>
          <tr>
            <td :colspan="headClassItems.length + 3" class="tfoot">ENTER 키로 다음 칸으로 이동하세요.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>

import { computed, inject, nextTick, onMounted, ref, watch } from 'vue';
import AutocompleteInput from '@/apps/timetable/components/AutocompleteInput.vue';
import AutocompleteInputWithValue from '@/apps/timetable/components/AutocompleteInputWithValue.vue';
import HiSelectBox from '@/components/Form/HiSelectBox.vue';

import {
  Class,
  Course,
  CourseBase,
  CourseBaseOfTeacher,
  LessonConf,
  Teacher,
  TeacherCourse,
  TeacherCourseBase,
  TimetableConfig,
  TimetableGrade,
} from '@/apps/timetable/core/types';

import {
  ContextKeys,
  TimetableGradeContext,
  TimetableCourseContext,
  TimetableClassContext,
  TeacherCourseContext,
  LessonConfContext,
  TimetableCourseBaseContext,
  TeacherCourseBaseContext,
  TimetableProgressContext,
  LessonContext,
} from '../contexts';
import { isEqual } from 'lodash';
import { TimetableDisplayUtils } from '../common/utils';
import { useDialog } from '../composables/dialog';

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const courseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const teacherCourseBaseContext = inject(ContextKeys.TeacherCourseBase) as TeacherCourseBaseContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;

const classes = computed(() => classContext.classes as Class[]);
const courseBases = computed(() => courseBaseContext.courseBases as CourseBase[]);
const courseBaseMap = computed(() => courseBaseContext.courseBaseMap as Record<string, CourseBase>);
const courseMap = computed(() => courseContext.courseMap as Record<string, Course>);
const teacherCourseBases = computed(() => teacherCourseBaseContext.teacherCourseBases as TeacherCourseBase[]);
const timetableConfig = computed(() => gradeContext.timetableConfig as TimetableConfig);
const gradeMap = computed(() => gradeContext.gradeMap as Record<number, TimetableGrade>);
const classesByGrade = computed(() => classContext.classesByGrade as Record<number, Class[]>);
const virtualClassesByGrade = computed(() => classContext.virtualClassesByGrade as Record<number, Class[]>);

const props = defineProps<{
  selectedTeacher: Teacher | null,
  onSelectCourseBase: (courseBase: CourseBase | null) => void,
}>();

interface ClassIndexItem {
  classIndex: number;
  isVirtual: boolean;
  period?: number | null;
  lessonConfId?: string | null;
}

interface ClassPeriodItem {
  class: Class;
  course: Course;
  period: number | null;
}

interface LessonConfItem {
  courseBase: CourseBase | null;
  grade: number | null;
  beforeGrade: number | null;
  classPeriods: ClassPeriodItem[];
  currentCourseName: string;
  classIndexItems: ClassIndexItem[];
}

const dialog = useDialog();

const lessonConfItems = ref<LessonConfItem[]>([]);
const beforeEditedLessonConfItem = ref<LessonConfItem|null>(null);
const courseMapByCourseBaseId = ref<Record<string, Course[]>>({});
const lessonConfsOfSelectedTeacher = ref<LessonConf[]>([]);
const courseBaseInputs = ref<any[]>([]);
const gradeSelects = ref<any[]>([]);

const selectedTeacher = computed(() => props.selectedTeacher);
const courses = computed(() => courseContext.courses as Course[]);

const setCourseBaseInputRef = (rowIdx: number) => (el: any | null) => {
  courseBaseInputs.value[rowIdx] = el ?? null;
};

const setGradeSelectRef = (rowIdx: number) => (el: any | null) => {
  gradeSelects.value[rowIdx] = el ?? null;
};

const assignedClassLessonCount = computed(() => progressContext?.assignedClassLessonCount || 0);

const lessonConfsMapByTeacher = computed(() => lessonConfContext.lessonConfsMapByTeacher as Record<string, LessonConf[]>);
const maxClassCount = computed(() => {
  return Math.max(...timetableConfig.value.grades.map(g => g.maxClassCount));
});
const maxVirtualClassCount = computed(() => {
  return Math.max(...timetableConfig.value.grades.map(g => g.maxVirtualClassCount));
});

const courseBaseOptions = computed(() => {
  return courseBases.value.map(cb => ({ 
    value: cb.courseBaseId, 
    text: getCourseBaseKeyText(cb)
  }));
});

const courseBaseOptionMap = computed(() => {
  return courseBases.value.reduce((map, cb) => {
    const keyText = getCourseBaseKeyText(cb);
    map[keyText] = cb;
    return map;
  }, {} as Record<string, CourseBase>);
});


// 선생님 시수표 테이블 : 학년 선택 옵션
const gradeOptions = computed(() => {
  return timetableConfig.value.grades.map(grd => ({
    value: grd.grade, // number로 유지
    title: TimetableDisplayUtils.formatGradeName(grd),
  }));
});

const teacherCourseBaseMap = computed(() => {
  return teacherCourseBases.value.reduce((acc: Record<string, CourseBaseOfTeacher[]>, teacherCourseBase: TeacherCourseBase) => {
      if (!acc[teacherCourseBase.teacherId]) {
        acc[teacherCourseBase.teacherId] = [];
      }

      acc[teacherCourseBase.teacherId].push({
        ...courseBaseMap.value[teacherCourseBase.courseBaseId],
        sortNoOfTeacher: teacherCourseBase.sortNo,
        teacherId: teacherCourseBase.teacherId,
      } as CourseBaseOfTeacher);

      acc[teacherCourseBase.teacherId].sort((a, b) => a.sortNoOfTeacher - b.sortNoOfTeacher);

      return acc;
    }, {} as Record<string, CourseBaseOfTeacher[]>) || ({} as Record<string, CourseBaseOfTeacher[]>);
});


const getCourseBaseKeyText = (courseBase: CourseBase) => {
  return `${courseBase.displayedTitle}${courseBase.standardCourseTitle ? ` (${courseBase.standardCourseTitle})` : ''}`;
};

const headClassItems = computed(() => {
  return createClassIndexItems();  
});


// 선생님 시수표 테이블 : 선택된 교사의 총 시수
const selectedTeacherTotalPeriod = computed(() => {
  if (!selectedTeacher.value) return 0;

  const { teacherId } = selectedTeacher.value;
  const teacherLessonConfs = lessonConfsMapByTeacher.value[teacherId] || [];

  return teacherLessonConfs.reduce((sum, lc) => {
    const course = courseMap.value[lc.courseId];
    if (!course) return sum;

    return sum + (course.periodCount || 0);
  }, 0);
});

const doAfterModify = async () => {
  if(assignedClassLessonCount.value > 0) {
    // 시수표 수정으로 7단계 데이터가 삭제 되었을 수 있으므로 리로드
    // 0보다 크지 않은 경우는 삭제된 데이터가 없으므로 리로드 불필요
    await progressContext.reload();
    await lessonContext.reload();
  }
};

const createClassIndexItems = (): ClassIndexItem[] => {
  const items: ClassIndexItem[] = [];
  for (let i = 0; i < maxClassCount.value; i++) {
    items.push({ classIndex: i, isVirtual: false, period: null, lessonConfId: null });
  }
  for (let i = 0; i < maxVirtualClassCount.value; i++) {
    items.push({ classIndex: i, isVirtual: true, period: null, lessonConfId: null });
  }

  return items;  
};


const checkAddEmptyLessonConfItem = (): boolean => {
  if(lessonConfItems.value.length === 0) {
    return true;
  }

  // 마지막 목록의 교사와 학년이 모두 선택된 경우에만 추가
  const lastItem = lessonConfItems.value[lessonConfItems.value.length - 1];

  // if (lastItem && !(lastItem.courseBase && lastItem.grade)) {
  if (lastItem && !lastItem.courseBase) {
    return false;
  }

  return true;
};


const addEmptyLessonConfItemIfLastIndex = (item: LessonConfItem) => {
  // 마지막 줄인지 확인
  const lastIndex = lessonConfItems.value.length - 1;
  const currentIndex = lessonConfItems.value.indexOf(item);
  if(currentIndex !== lastIndex) {
    return;    
  }

  addEmptyLessonConfItem();
}

const addEmptyLessonConfItem = async () => {
  /*
  // 마지막 목록의 교사와 학년이 모두 선택된 경우에만 추가
  if (!checkAddEmptyLessonConfItem()) {
    return;
  }
  */

  addLessonConfItems({
    courseBase: null,
    grade: null,
    beforeGrade: null,
    classPeriods: [],
    currentCourseName: '',
    classIndexItems: createClassIndexItems(),    
  });

  await nextTick();

  // 추가된 행의 과목 입력란에 포커스 이동
  const lastIndex = lessonConfItems.value.length - 1;
  if(lastIndex < 0) {
    return;
  }

  const lastCourseBaseInput = courseBaseInputs.value[lastIndex];
  lastCourseBaseInput && lastCourseBaseInput.focus();
};


const resetTeacherContent = () => {
  lessonConfItems.value = [];
  resetBeforeEditedTeacherLessonConfItem();
};

const resetBeforeEditedTeacherLessonConfItem = () => {
  beforeEditedLessonConfItem.value = null;
};

// 선생님 시수표 테이블 : 행(입력 row) 추가
const addLessonConfItems = (item: LessonConfItem) => {
  lessonConfItems.value.push(item);
}

const updateTeacherLessonConfItem = async (item: LessonConfItem | null) => {
  if(!item || !selectedTeacher.value) {
    return;
  }
  
  if(isEqual(item, beforeEditedLessonConfItem.value)) {
    // 변경사항이 없는 경우
    // console.log('No changes detected, skipping update.');
    return;
  }

  if(item.courseBase && item.courseBase.courseBaseId) { 
    teacherCourseBaseContext.addCourseBaseToTeacher(
      selectedTeacher.value!.teacherId,
      item?.courseBase?.courseBaseId || ''
    );
  }
  
  const beforeItem = beforeEditedLessonConfItem.value;
  if(beforeItem?.courseBase && beforeItem.courseBase.courseBaseId) {
    await teacherCourseBaseContext.deleteCourseBaseFromTeacher(
      selectedTeacher.value!.teacherId,
      beforeItem.courseBase.courseBaseId
    );
  }
  
}


const handleEnterPeriod = (item: LessonConfItem) => {
  addEmptyLessonConfItemIfLastIndex(item);
}

const handleFocusCourseBaseInput = (item: LessonConfItem) => {
  // 과목 선택을 클릭한 경우 > 편집 전 상태 저장
  beforeEditedLessonConfItem.value = { ...item };  
};


const handleKeyDownCourseBaseInput = async (item: LessonConfItem, evt: KeyboardEvent) => {
  // 과목 이름을 편집 혹은 선택한 경우
  // evt.preventDefault();
  // evt.stopPropagation();

  if(evt.key !== 'Enter') {
    return;
  }

  addEmptyLessonConfItemIfLastIndex(item);
};


const handleSelectCourseBase = async (item: LessonConfItem, keyText: string | null) => {
  // 과목 이름을 편집 혹은 선택한 경우
  const courseBaseMapKey = keyText || item.currentCourseName;
  const newCourseBase = courseBaseOptionMap.value[courseBaseMapKey] || null;
  
  if(item.courseBase && item.courseBase.courseBaseId === newCourseBase?.courseBaseId) {
    // 동일한 과목인 경우
    return true;
  }

  // 시수가 하나라도 셋팅되어 있는 경우
  const simpleMsg = '과목을 변경하면 설정된 시수가 모두 삭제됩니다. 과목을 변경하시겠습니까?';
  const delLessonMsg = '과목을 변경하면 7단계에 배정된 수업이 모두 초기화됩니다. 그래도 변경하시겠습니까?';

  const hasPeriodSet = item.classIndexItems.some(ci => ci.lessonConfId !== null);
  if(hasPeriodSet && await confirmDelete(simpleMsg, delLessonMsg) === false) {
    // 변경 취소
    item.currentCourseName = beforeEditedLessonConfItem.value?.courseBase ? getCourseBaseKeyText(beforeEditedLessonConfItem.value.courseBase) : '';
    return false;
  }

  if(hasPeriodSet) {
    // 기존 시수 삭제
    await removeLessonConfItem(item);
    item.classIndexItems.forEach(ci => {
      ci.period = null;
      ci.lessonConfId = null;
    });
  }
  
  item.courseBase = newCourseBase || null;
  return true;
};

const handleBlurCourseBaseInput = async (item: LessonConfItem) => {
  const result = await handleSelectCourseBase(item, null);
  if(result === false) {
    return;
  }
  
  const { courseBaseId: selectedCourseBaseId } = item.courseBase || { courseBaseId: null };
  const { courseBaseId: beforeCourseBaseId } = beforeEditedLessonConfItem.value?.courseBase || { courseBaseId: null };

  if(selectedCourseBaseId !== beforeCourseBaseId) {
    // 과목이 변경된 경우
    await updateTeacherLessonConfItem(item);
  }

  resetBeforeEditedTeacherLessonConfItem();

  return true;
};


const handleSelectGrade = async (item: LessonConfItem, grade: number | any | null) => {
  if(grade === null || grade === undefined) {
    return;
  }

  const { beforeGrade } = item || { beforeGrade: null };

  /*
  // 동시수업 시수 분기 설정 전에는 중복 학년 허용. 2025.11.13, notbadlife
  const { courseBaseId } = item.courseBase || { courseBaseId: null };
  const isExists = lessonConfItems.value.some(it => {
    return it !== item &&
      it.courseBase?.courseBaseId === courseBaseId &&
      it.grade === grade;
  });
  
  if(isExists) {
    dialog.alertSimple(`${grade}학년은 이미 등록된 학년입니다.`);
    item.grade = beforeGrade;
    return;
  }
  */

  const simpleMsg = '학년을 변경하면 설정된 시수가 모두 삭제됩니다. 학년을 변경하시겠습니까?';
  const delLessonMsg = '학년을 변경하면 7단계에 배정된 수업이 모두 초기화됩니다. 그래도 변경하시겠습니까?';
  
  const hasPeriodSet = item.classIndexItems.some(ci => ci.lessonConfId !== null);
  if( beforeGrade !== null && 
    beforeGrade !== grade && 
    hasPeriodSet && 
    await confirmDelete(simpleMsg, delLessonMsg) === false) {
    item.grade = beforeGrade;
    return;
  }

  if(beforeGrade !== grade && hasPeriodSet) {
    // 기존 시수 삭제
    await removeLessonConfItem(item);
    item.classIndexItems.forEach(ci => {
      ci.period = null;
      ci.lessonConfId = null;
    });
  }
  
  item.grade = grade;
};


const getCourseByCourseBaseIdAndPeriod = async (courseBaseId: string, period: number): Promise<Course|null> => {
  // 과목 등록
  const course = (courseMapByCourseBaseId.value[courseBaseId] || []).find(c => c.periodCount === period)
  if(course) {
    return course;
  }
  
  return await courseContext.add({
    courseBaseId,
    periodCount: period
  } as Course);
};

const getClassByGradeAndClassIndexAndIsVirtual = (grade: number | null, classIndex: number, isVirtual: boolean): Class | null => {
  if(grade === null || grade === undefined) {
    return null;
  }

  return classes.value.find(c => c.grade === grade && c.classNumber === classIndex + 1 && c.isVirtual === isVirtual) || null;
};

const handleClickEmptyPeriodWithoutGrade = async (classIndexItem: ClassIndexItem, inputGrade: number | null) => {
  if(inputGrade && !isClassOfSelectedGrade(classIndexItem, inputGrade)) {
    return;
  }

  
  await dialog.alertSimple('학년을 선택하세요.');
};

const handleClickEmptyGradeWithoutCourse = async (rowIdx: number) => {
  await dialog.alertSimple('과목을 선택하세요.');
  courseBaseInputs.value[rowIdx] && courseBaseInputs.value[rowIdx].focus();
};

const handleBlurPeriod = async (item: LessonConfItem, classIndex: number) => {
  const teacherId = selectedTeacher.value?.teacherId;

  if(!teacherId || !item || classIndex < 0 || !item.courseBase || item.classIndexItems.length <= classIndex || !item.grade) {
    return;
  }

  const { period, lessonConfId: prevLessonConfId } = item.classIndexItems[classIndex];

  if(!period) {
    // 시수가 0이거나 빈 값인 경우, 이전 시수 삭제
    await resetLessonConfOfClassIndexItem(item.classIndexItems[classIndex]);
    return;
  }

  // 해당 시수의 과목이 있는지 확인
  const { courseBase, classIndexItems } = item;
  const courseBaseId = courseBase.courseBaseId;

  const prevLessonConf = lessonConfsMapByTeacher.value[teacherId]?.find(conf => conf.lessonConfId === prevLessonConfId);
  const prevCourse = courseMap.value[prevLessonConf?.courseId || ''];

  if(prevCourse && prevCourse.periodCount === period) {
    // 이전 시수의 과목과 동일한 경우
    return;
  }

  if(await confirmDelete() === false) { // 7단계 데이터 삭제 경고
    item.classIndexItems[classIndex].period = prevCourse?.periodCount || null; // 변경 취소
    return;
  }


  // 과목 등록
  const course = await getCourseByCourseBaseIdAndPeriod(courseBaseId, period);

  // 교사 - 과목 등록
  course && await teacherCourseContext.add({
    teacherId,
    courseId: course.courseId
  } as TeacherCourse);

  // 시수 등록
  const cls = getClassByGradeAndClassIndexAndIsVirtual(item.grade, classIndexItems[classIndex].classIndex, classIndexItems[classIndex].isVirtual);

  if(!course || !cls) {
    return;
  }

  const existsLessonConf = lessonConfsMapByTeacher.value[teacherId]?.find(conf => conf.classId === cls.classId && conf.courseId === course.courseId);
  if(existsLessonConf && existsLessonConf.lessonConfId === prevLessonConfId) {
    return;
  }

  // item과 다른 행에서, 동일 학급-동일 과목-동일 시수가 존재하는지 확인,
  const others = lessonConfItems.value.filter(lcItem => lcItem !== item);
  const isExistsInOtherRow = others.some(lcItem => 
    lcItem.grade ===  item.grade && 
    lcItem.courseBase?.courseBaseId === item.courseBase?.courseBaseId && 
    lcItem.classIndexItems[classIndex].period === period
  );

  if(isExistsInOtherRow) {
    await dialog.alertSimple('동일 과목·동일 학년의 동일 시수는 중복으로 입력할 수 없습니다. 동일 시수를 입력하려면 3단계에서 과목을 추가해주세요.');
    classIndexItems[classIndex].period = null;
    return;
  }
  // 동일학년-동일학급-동일시수 중복 체크 끝

  const lessonConf = await lessonConfContext.create(course.courseId, teacherId, cls.classId, item.grade);  
  classIndexItems[classIndex].lessonConfId = lessonConf?.lessonConfId;

  if(prevLessonConfId && prevLessonConfId !== lessonConf?.lessonConfId) {
    // 이전 시수 삭제
    await lessonConfContext.delete({ lessonConfId: prevLessonConfId } as LessonConf);
  }

  await doAfterModify();
};

const resetLessonConfOfClassIndexItem = async (item: ClassIndexItem) => {
  const { lessonConfId, period } = item;

  if(lessonConfId === null && !period) {
    // 등록된 시수가 없고, 입력된 시수도 없는 경우
    return;
  }

  if(await confirmDelete() === false) {
    const teacherId = selectedTeacher.value?.teacherId || '';
    const prevLessonConf = lessonConfsMapByTeacher.value[teacherId]?.find(conf => conf.lessonConfId === item.lessonConfId);
    const crs = courseMap.value[prevLessonConf?.courseId || ''];

    item.period = crs?.periodCount || null;

    return;
  }
  
  // 시수가 0이거나 빈 값인 경우, 이전 시수 삭제
  lessonConfId && await lessonConfContext.delete({ lessonConfId } as LessonConf);
  item.lessonConfId = null;

  await doAfterModify();
};


const handleClickAddLessonConfItem = () => {  
  addEmptyLessonConfItem();
};


const confirmDelete = async (simpleMsg?: string, delLessonMsg?: string) => {
  if(assignedClassLessonCount.value === 0) {
    return simpleMsg ? await dialog.confirmSimple(simpleMsg) : true;
  }
  
  delLessonMsg = !delLessonMsg ? `등록된 시수를 변경하면 7단계에 배정된 수업이 모두 초기화됩니다. 그래도 변경하시겠습니까?` : delLessonMsg;

  return await dialog.confirm(`
    ${delLessonMsg}
    <div class="blue-box"> 
      <i class="hi-ico ico-primary ico-warning-circle-fill ico-size-18"></i>
      시수표가 변경될 경우 <strong>7단계에서 작성한 데이터</strong>가 삭제될 수 있습니다.
    </div>      
    `, null, {
      customClass: 'timetable-confirm',
      showCloseButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소'
  });

};


const handleClickRemoveLessonConfItem = async (item: LessonConfItem) => {
 if(!item) {
    return;
  }

  const { classIndexItems, courseBase } = item;
  const isExists = (courseBase || classIndexItems.find(it => it.lessonConfId));
  
  if(isExists && await confirmDelete('선택하신 목록을 삭제하시겠습니까?') === false) {
    return;
  }

  await removeLessonConfItem(item);

  // 동일한 courseBaseId + 다른 grade 행이 있는지 확인
  const sameCourseBaseItems = lessonConfItems.value.filter(it => {
    return it.courseBase?.courseBaseId === item.courseBase?.courseBaseId;
  }) || [];

  // 하나 밖에 없다면, 기준과목-교사 배정에서 제거
  if(sameCourseBaseItems.length === 1 && item.courseBase && selectedTeacher.value) {
    await teacherCourseBaseContext.deleteCourseBaseFromTeacher(
      selectedTeacher.value!.teacherId,
      item.courseBase.courseBaseId
    );
  }

  lessonConfItems.value = lessonConfItems.value.filter(it => it !== item);

  lessonConfItems.value.length === 0 && addEmptyLessonConfItem();
}

const removeLessonConfItem = async (item: LessonConfItem) => {  
  if(!item) {
    return;
  }

  const { classIndexItems } = item;

  const deleteLessonConfIds: string[] = [];

  classIndexItems.forEach(it => {
    it.lessonConfId && deleteLessonConfIds.push(it.lessonConfId);
    it.lessonConfId = null;
  });

  deleteLessonConfIds.length > 0 && await lessonConfContext.deleteByIds(deleteLessonConfIds);  
};

const restrictNameInput = (e: Event, item: LessonConfItem, idx: number) => {
  const allowedRegex = /[^0-9]/g;
  let value = (e.target as HTMLInputElement).value;
  value = value.length > 1 ? value.slice(0, 1) : value;
  const periodValue = parseInt(value.replace(allowedRegex, '') || '0', 10);

  const maxPeriod = 9;
  const period = Number(periodValue) > maxPeriod ? maxPeriod : Number(periodValue);

  (e.target as HTMLInputElement).value = period.toString();
  item.classIndexItems[idx].period = period ? period : null;
};

const realoadContents = async () => {
  if(!selectedTeacher.value) {
    return;
  }

  const teacherId = selectedTeacher.value.teacherId;

  lessonConfsOfSelectedTeacher.value = lessonConfsMapByTeacher.value[teacherId] || [];

  const courseBases = teacherCourseBaseMap.value[teacherId] || [];

  if(courseBases.length === 0) {
    addEmptyLessonConfItem();
    return;
  }

  courseBases.forEach(cb => {
    const coursesOfCourseBase = courseMapByCourseBaseId.value[cb.courseBaseId] || [];

    // 선생님 시수표의 행은, (기준 과목 - 학년) 단위로 생성
    // 현재 교사에 설정된 lessonConf에서 cb.courseBaseId-courseId 가 설정된 학년을 추출
    const lessonConfsOfCourseBase = lessonConfsOfSelectedTeacher.value.filter(lc => {
      return coursesOfCourseBase.some(c => c.courseId === lc.courseId);
    });
    
    const existingGrades = [... new Set(lessonConfsOfCourseBase.map(lc => lc.grade))].sort((a, b) => a - b) as (number | null)[];
    
    if(existingGrades.length === 0) { // 설정된 학년이 없는 경우, 기본행 추가
      existingGrades.push(null);
    }

    const exstingGradePeriodsMap: Record<number, Set<number>> = {};
    existingGrades.forEach(grade => {
      if(grade === null) {
        return;
      }
      
      exstingGradePeriodsMap[grade] = new Set<number>();
      lessonConfsOfCourseBase.filter(lc => lc.grade === grade).
      forEach(lc => {
        const course = courseMap.value[lc.courseId];
        course && course.periodCount && exstingGradePeriodsMap[grade].add(course.periodCount);
      });
    });

    existingGrades.forEach(grade => {
      if(grade == null) {
        // 학년이 없는 경우, 기본 행 추가
        addLessonConfItems({
          courseBase: cb,
          grade,
          beforeGrade: grade,
          classPeriods: [],
          currentCourseName: getCourseBaseKeyText(cb),
          classIndexItems: createClassIndexItems(),
        });
        return;
      }
      
      const periods = exstingGradePeriodsMap[grade] ? Array.from(exstingGradePeriodsMap[grade]).sort() : [];

      periods.forEach(period => {
        const classIndexItems = createClassIndexItems().map(ci => {
          // 기존에 등록된 시수가 있는지 확인
          const cls = getClassByGradeAndClassIndexAndIsVirtual(grade, ci.classIndex, ci.isVirtual);
          
          const lessonConf = lessonConfsOfCourseBase.find(lc => {
            return lc.classId === cls?.classId && courseMap.value[lc.courseId]?.periodCount === period;
          });

          return {
            ...ci,
            period: lessonConf ? courseMap.value[lessonConf.courseId]?.periodCount : null,
            lessonConfId: lessonConf ? lessonConf.lessonConfId : null,
          };
        });

        addLessonConfItems({
          courseBase: cb,
          grade,
          beforeGrade: grade,
          classPeriods: [],
          currentCourseName: getCourseBaseKeyText(cb),
          classIndexItems,
        });
      });
    });
  });
};

// 선생님 시수표 테이블 : 입력행에서 선택된 학년의 반인지 확인하는 함수
const isClassOfSelectedGrade = (classIndexItem: ClassIndexItem, inputGrade: number | null): boolean => {
  if(inputGrade === null || !gradeMap.value[inputGrade]) {
    return false;
  }

  const { maxClassCount, maxVirtualClassCount } = gradeMap.value[inputGrade];

  if(classIndexItem.isVirtual) {
    return classIndexItem.classIndex < maxVirtualClassCount;
  }
  
  return classIndexItem.classIndex < maxClassCount;
}

// 툴팁용 반 이름 구성
const formatClassTooltip = (grade: number | null, classIndexItem: ClassIndexItem): string => {
  if(grade === null) {
    return '';
  }

  const cls = !classIndexItem.isVirtual ? 
    classesByGrade.value[grade].find(c => c.classNumber === classIndexItem.classIndex + 1) : 
    virtualClassesByGrade.value[grade].find(c => c.classNumber === classIndexItem.classIndex + 1);

  if(!cls) {
    return `${classIndexItem.isVirtual ? '가상' : ''}${classIndexItem.classIndex + 1}반`;
  }

  return TimetableDisplayUtils.formatClassName(cls);
};

watch(
  () => props.selectedTeacher,
  async (newTeacher, oldTeacher) => {

    if(newTeacher?.teacherId === oldTeacher?.teacherId) {
      return
    }

    resetTeacherContent();
    await nextTick();
    
    realoadContents();
  },
  { immediate: true }
)

watch(
  () => [courses.value],
  () => {
    courseMapByCourseBaseId.value = courses.value.reduce((map: Record<string, Course[]>, cb: Course) => {
      if(!cb.courseBaseId) {
        return map;
      }

      if(!map[cb.courseBaseId]) {
        map[cb.courseBaseId] = [];
      }
      
      map[cb.courseBaseId].push(cb);
      return map;
    }, {} as Record<string, Course[]>) || ({} as Record<string, Course[]>);
  },
  { immediate: true }
)

watch(
  () => lessonConfsMapByTeacher.value,
  (newItems, oldItems) => {
    if(isEqual(newItems, oldItems)) {
      return;
    }

    const oldItemKeys = Object.keys(oldItems);
    const newItemKeys = Object.keys(newItems);
    const teacherId = selectedTeacher.value?.teacherId;

    if(oldItemKeys.length === 0 && newItemKeys.length > 0 && teacherId) {
      // 최초 로딩. 첫번째 교사로 셋팅된 경우
      resetTeacherContent();
      realoadContents();
    }
  },
  { deep: true }
)

</script>

<style scoped lang="scss">

.teacher-content{
  width:calc(100% - 300px);

  .teacher-period-table{
    overflow: auto;
    height: 285px;
    border-radius: 0 0 15px 15px ;
    table{
      thead{
        tr:nth-child(1) th{
          background-color: var(--navy);
          height: 40px;
          color: #fff;  
        }
        tr:first-child > th:first-child,
        tr:first-child > th:last-child {
          border-radius: 0;
        }
      }  
      th,
      td{
        height: 36px;
        background: #fff ;
        &.btn-cell:not(.empty){
          cursor: pointer;
        }
        &.btn-cell{
          .hi-tooltip-wrap{
            height: 100%;
            width: 100%;
            > div{height:100%;}
            &.tooltip-top ::v-deep .hi-tooltip {
              top: auto;
              bottom: calc(100% - 2px);
            }
          }
        }
      }      
      td.tfoot{
        height: 40px;
      }
    }
  }

  .period-table{
    max-height: 500px;
    border-radius: 0 0 15px 15px ;
    table{
      thead{
        tr:nth-child(1) th{
          background-color: var(--navy);
          height: 40px;
          color: #fff;  
        }
        tr:nth-child(2) th{
          background-color: var(--primary-02); 
          height: 40px;       
        }
        tr:nth-child(3),
        tr:nth-child(4){
          th{       
            background-color: #fff;
            font-weight: var(--font-normal);
          }
        }        
      }
      th,
      td{
        height: 36px;
        background: #fff ;
        &.double-teacher {
          background-color: #EDF9F7;
        }
        &.over-period {
          background-color: #FEEDEF !important ;
        }
        &.col-hover{          
          background-color: #FFF8DF !important ;
        }
        &.error {
          background-color: #D6D6D6 ;
          .lesson-conf-cell{      
            background-color: var(--warning);
            mask-image: url('~@/assets/img/timetable/ico-info-warning-fill.svg');
            mask-size: 100%;
            width: 16px;
            height: 16px;
            border-radius: 0;
          }
        } 
        // &.conf-td{
          // cursor: pointer;  
          // position: relative;
          // text-align: center; 
        // }
      } 
      tbody{
        tr:hover{
          td{
            background: #FFF8DF;
          }
        }
      } 
      
      // 시간표 고정 
      .sticky-left {
        z-index: 1; 
      }  
      .sticky-top {
        z-index: 2;
      }      
      .sticky-left.sticky-top {
        z-index: 3;
      }
      .sticky-left {
        left:0px;   
      }    
      tr:nth-child(1){
        th{top:0px;}
      }
      tr:nth-child(2){
        th{top:40px;}
      }
      tr:nth-child(3){
        th{top:80px;}
      }
      tr:nth-child(4){
        th{top:116px;}
      }
      
      tr:nth-child(4){
        th{
          border-bottom:2px solid #d6d6d6;
        }
      }
      tr {
        th:nth-child(1),
        td:nth-child(1){
          border-right:2px solid #d6d6d6;
        }
      }
      tr:nth-child(1),
      tr:nth-child(2),
      tr:nth-child(3),
      tr:nth-child(4),        
      tr:nth-child(5){        
        th:nth-child(1){          
          z-index: 4;
        }
      }
    }
  }
}

.table-title{
  background-color: var(--primary-02);   
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;  
  font-size: var(--lg-font);
  font-weight: var(--font-strong);
  padding: 0 24px;
  border-radius: 12px 12px 0 0 ;
  border:1px solid #BDBDBD;
  border-bottom: 0;
}

.autocomplete-wrap{
  ::v-deep{
    .input-wrap input{
      text-align: left;
      padding: 0 12px;
    }
    .autocomplete-list{
      height: 127px;
      top: calc(100% - 4px);
    }
  }
}

// 시수표 유효성 검사 결과 확인
.period-validation-modal.modal-xs{
  ::v-deep .modal__layer{
    max-width: 568px;
  }
}

.empty-grade-cover {
  position: absolute;
  z-index: 9;
}

.hided-empty-grade-cover {
  display: none;
}
</style>