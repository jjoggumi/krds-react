<template>
  <div>
    <div class="gray-box">
      <!-- 학년 선택 체크박스 그룹 (전체 선택 지원) -->
      <div class="grade-checkbox-group" v-if="grades.length">
        <div class="form-check-inline" v-if="grades.length > 1">
          <input type="checkbox" id="grade-all" :checked="isAllSelected" @change="toggleAll" />
          <label for="grade-all"><span>전체</span></label>
        </div>
        <div class="form-check-inline" v-for="grade in grades" :key="`grade-chk-${grade}`">
          <input type="checkbox" :id="`grade-${grade}`" :checked="selectedGrades.includes(grade)" @change="toggleGrade(grade)" />
          <label :for="`grade-${grade}`"><span>{{ gradeLabel(grade) }}</span></label>
        </div>
      </div>
    </div>
    <div class="tb-row mt-20 type-class">      
      <!-- 학급 기본타입 -->
      <div class="tb-col" v-for="item in displayedClassList" :key="item.id">
        <div class="table-content time-table"><!-- 학급타입 class -->
          <div class="h4-tit">
            <h4>
              <button type="button" class="btn btn-link btn-teacher">
                {{ item.title }}
              </button>
              <!-- 개발 미 구현으로 UI주석 처리 <button type="button" class="btn btn-link btn-edit ml-05" @click.stop="toggleEdit(item)">
                <i class="ico ico-pen ico-gray ico-size-20" />
              </button> -->
              <div class="edit-area" v-if="openEditClassId === item.id">
                <input
                  v-model="dummyGrade"
                  class="edit-input"
                  type="text"
                  placeholder="학년"
                />
                <input
                  v-model="dummyClassNumber"
                  class="edit-input"
                  type="text"
                  placeholder="반"
                />
                <button class="btn btn-tertiary-blue" type="button" @click="handleConfirmEdit">확인</button>

                <!-- 개발에서 실제 적용 로직/컴포넌트가 들어갈 자리(빈공간) -->
                <div v-if="showDevSpace" class="edit-dev-space" />
              </div>
            </h4>
          </div>
          <table>
            <caption>시간표</caption>
            <colgroup>
              <col style="width: 10%;" />
              <col v-for="dayIdx in activatedClassDaysCount" :key="`day-col-${dayIdx}`" :style="`width: ${activatedClassDaysWidthPercent};`" />
            </colgroup>
            <thead>
              <tr>
                <th></th>
                <th v-for="day in activatedClassDays"
                  :key="`day-header-${item.id}-${day.dayOfWeek}`">{{ day.title }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="period in maxPeriod" :key="`period-${item.id}-${period}`">
                <td class="th">{{ adjustDisplayedPeriod(period) }}</td>
                <td v-for="day in activatedClassDays"
                  :key="`lesson-cell-${item.id}-${day.dayOfWeek}-${period}-${lessonsLength}-${genreateCount}-${timetableUpdatedAt}`">
                  <timetable-lesson-read-cell
                    :day-of-week="day.dayOfWeek"
                    :period="period"
                    :teacher-id="item.id"
                    :cellLesson="getLessonByClassAndPeriod(item.id, day.dayOfWeek, period)"
                    />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  
  
</template>

<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from 'vue';
import { ConcurrentConfContext, ContextKeys, FixedConfContext, LessonConfContext, LessonContext, SpecialtyRoomContext, TeacherCourseContext, TimetableClassContext, TimetableCourseContext, TimetableGradeContext, TimetableProgressContext, TimetableTeacherContext } from '../contexts';
import { ClassDayStatus, DAILY_SCHEDULE_DEFAULTS, DAYS_OF_WEEK } from '../common/constants';
import { Class, Course, Lesson, TimetableConfig, TimetablePeriod } from '../core/types';
import { ActivateWeekday, CellLesson, CellLessonType } from '../common/types';
// @ts-ignore - vue SFC default export typing is handled by tooling
import TimetableLessonReadCell from '@/apps/timetable/components/TimetableLessonReadCell.vue';
import Timetable from '../core';
import { TimetableDisplayUtils } from '../common/utils';

interface TableItem {
  id: string;
  title: string;
  subtitle?: string;
  entity: Class;
}

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
const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;

const genreateCount = ref(0);
const timetableUpdatedAt = computed(() => lessonContext.updatedAt || 0);


watch(
  () => lessonContext.lessons,
  async (newLessons) => {
    await nextTick();
    genreateCount.value = Timetable.generateCounter;

    progressContext.assignedCount = lessonContext.lessons.length;
    progressContext.remainingCount = Timetable.countCurrentUnassigned;
  },
  { immediate: true }
);


const timetableConfig = computed(() => gradeContext.timetableConfig as TimetableConfig);
const classes = computed(() => classContext.classes as Class[]);
const classMap = computed(() => classContext.classMap || ({} as Record<string, Class>));
const courseMap = computed(() => courseContext.courseMap || ({} as Record<string, Course>));
const gradeNameMap = computed(() => gradeContext.gradeNameMap || ({} as Record<number, string>));

// 학년 라벨 헬퍼: 항상 '학년' 붙여서 표시 (이미 포함되어 있으면 중복 방지)
const gradeLabel = (grade: number) => {
  const raw = gradeNameMap.value[grade];
  if(!raw || raw.trim() === '') return `${grade}학년`;
  return raw.includes('학년') ? raw : `${raw}학년`;
};

const maxPeriod = computed(() => {
  return gradeContext.timetableConfig.maxPeriod || DAILY_SCHEDULE_DEFAULTS.maxPeriod;
});

const startPeriod = computed(() => {
  return gradeContext.startPeriod;
});

// 수업 목록이 갱신된 경우 시간표를 다시 그리기 위해 key에 사용
const lessonsLength = computed(() => lessonContext.lessons.length || 0);

const lessons = computed({
  get() { 
    return lessonContext.lessons as Lesson[]; 
  },
  set(value: Lesson[]) {
    lessonContext.lessons = value;
  }
});

const freePeriodsOfGrade = computed(
  (): Record<number, TimetablePeriod[]> | undefined => {

    // const grades = Timetable.grades;
    const { grades } = timetableConfig.value;

    if (!grades || !grades.length) {
      return {};
    }

    return grades.reduce((acc, grade) => {
      if (!grade.timetableStructure || !grade.timetableStructure.freePeriods) {
        return acc;
      }

      acc[grade.grade] = grade.timetableStructure.freePeriods;
      return acc;
    }, {} as Record<number, TimetablePeriod[]>);
  }
);


// 학년 선택 상태 (빈 배열 = 아무것도 선택되지 않음)
const selectedGrades = ref<number[]>([]);
const grades = computed(() => Object.keys(gradeNameMap.value).map(Number).sort((a,b) => a - b));

// 모든 학년이 명시적으로 선택된 경우만 전체 선택 처리
const isAllSelected = computed(() => grades.value.length > 0 && selectedGrades.value.length === grades.value.length);

const toggleAll = () => {
  if (isAllSelected.value) {
    // 전체 선택 해제 -> 모두 해제
    selectedGrades.value = [];
  } else {
    // 전체 선택
    selectedGrades.value = [...grades.value];
  }
};

const toggleGrade = (grade: number) => {
  const idx = selectedGrades.value.indexOf(grade);
  if (idx >= 0) {
    selectedGrades.value.splice(idx, 1);
  } else {
    selectedGrades.value.push(grade);
  }
};

// 학년 목록 로드 시 기본 전체 선택으로 시작 (사용자 체감상 "전체" 체크 유지)
watch(
  () => grades.value,
  (newGrades) => {
    if (newGrades.length && selectedGrades.value.length === 0) {
      selectedGrades.value = [...newGrades];
    }
  },
  { immediate: true }
);

const classList = computed(() => {
  return classes.value
    // .filter(cls => !cls.isVirtual)
    .sort((a,b) => {
      if(a.grade !== b.grade) {
        return a.grade - b.grade;
      }

      if(a.isVirtual !== b.isVirtual) {
        return a.isVirtual ? 1 : -1;
      }

      return a.classNumber - b.classNumber;
    })
    .map((cls) => {
      const className = TimetableDisplayUtils.formatFullClassName(cls);
      return { id: cls.classId, title: className, entity: cls } as TableItem;
    });
});

const displayedClassList = computed(() => {
  if (isAllSelected.value) return classList.value;
  if (selectedGrades.value.length === 0) return [];
  return classList.value.filter(c => selectedGrades.value.includes(c.entity.grade));
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

const activatedClassDays = computed(() => {  
  return gradeContext.timetableConfig.classDays.map((isActive, index) => {
    return {
      dayOfWeek: index,
      title: DAYS_OF_WEEK.find(day => day.index === index)?.title,
      isActive: isActive === ClassDayStatus.ACTIVATED,
    } as ActivateWeekday;
  }).filter(day => day.isActive);
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

const adjustDisplayedPeriod = (period: number) => {
  return period + (startPeriod.value -1);
};

// --- 헤더 편집 UI: 더미 학년/반 input (실제 적용 로직은 개발에서 진행) ---
const DEFAULT_DUMMY_GRADE = '1';
const DEFAULT_DUMMY_CLASS_NUMBER = '1';

const openEditClassId = ref<string | null>(null);
const dummyGrade = ref(DEFAULT_DUMMY_GRADE);
const dummyClassNumber = ref(DEFAULT_DUMMY_CLASS_NUMBER);
const showDevSpace = ref(false);

const toggleEdit = (item: TableItem) => {
  if (openEditClassId.value === item.id) {
    openEditClassId.value = null;
    showDevSpace.value = false;
    return;
  }

  openEditClassId.value = item.id;
  dummyGrade.value = DEFAULT_DUMMY_GRADE;
  dummyClassNumber.value = DEFAULT_DUMMY_CLASS_NUMBER;
  showDevSpace.value = false;
};

const handleConfirmEdit = () => {
  showDevSpace.value = true;
};

const getLessonByClassAndPeriod = (
  classId: string,
  dayOfWeek: number,
  period: number
): CellLesson | undefined => {

  const cls = classMap.value[classId];
  if (!cls) {
    return;
  } 
  
  // gradeFreePeriod인지 확인
  const grade = cls.grade;
  if(freePeriodsOfGrade.value && freePeriodsOfGrade.value[grade]) {
    const isGradeFreePeriod = freePeriodsOfGrade.value[grade].some(
      (freePeriod) => freePeriod.dayOfWeek === dayOfWeek && freePeriod.period === period
    );

    if(isGradeFreePeriod) {
      return {
        lesson: undefined,
        isGradeFreePeriod: true,
        cellLessonType: CellLessonType.CLASS
      } as CellLesson;
    }
  }
  
  const info = lessonByClass.value[classId];
  if (!info) {
    return;
  }

  const subKey = `${dayOfWeek}-${period}`;
  const lesson = info[subKey];

  if (!lesson) {
    return;
  }

  const course = courseMap.value[lesson.courseId];
  if (!course) {
    return;
  }
  
  return {
    lesson,
    isGradeFreePeriod: false,
    cellLessonType: CellLessonType.CLASS,
  } as CellLesson;
};
</script>

<style scoped lang="scss">
.type-class{
  ::v-deep{
    .btn-table-cell{   
      .course-name{
        font-size: 13px;
        font-weight: 400;
        line-height: 150%;
        color: #616161;
      }
      .teacher-name{    
        font-size: 14px;
        font-weight: 400;
        line-height: 160%;
        margin-top: -2px;
        color: #1d1d1d;
      }
      //수업없음
      &.no-course{
        &::after{
          display: none;
        }
      }    
    }  
  }  
    
  h4{
    position: relative;
    .btn-teacher{
      font-weight: var(--font-strong);
      font-size: 16px;
      &:hover{
        text-decoration: underline;
      }
    }
    .edit-area{
      position: absolute;
      left: 0;
      top: calc(100% + 4px);
      z-index: 20;
      display: flex;
      gap: 8px;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid var(--gray-07);
      box-shadow: 0 4px 6px -4px rgba(0, 0, 0, 0.10), 0 10px 15px -3px rgba(0, 0, 0, 0.10);
      background: #fff;

      .edit-input{
        width: 120px;
        height: 40px;
        padding: 0 10px;
        border: 1px solid var(--gray-07);
        border-radius: 8px;
        font-size: 14px;
        line-height: 40px;
        background: #fff;
      }

      .edit-dev-space{
        flex-basis: 100%;
        height: 44px;
      }
    }
  }
}
</style>
