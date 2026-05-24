<template>
  <div>
    <!-- 시수 배정 현황  -->
    <div class="table-title mt-25">
      시수 배정 현황
      <div class="form-group-inline ml-20" v-if="isShowGradesRadio">
        <div class="form-ctr">
          <div class="form-check-inline">
            <input
              type="radio"
              id="check-grd-all"
              value="all"
              v-model="selectedGradeRadio"
            />
            <label for="check-grd-all">
              <span>전체</span>
            </label>
          </div>
          <div
            class="form-check-inline"
            v-for="(grd, grdIdx) in timetableConfig.grades"
            :key="`check-grd-num-${grd.grade}${grdIdx}`"
          >
            <input
              type="radio"
              :id="`check-grd-${grd.grade}`"
              :value="grd.grade"
              v-model="selectedGradeRadio"
            />
            <label :for="`check-grd-${grd.grade}`">
              <span>{{ TimetableDisplayUtils.formatGradeName(grd) }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="table-content table-box period-table sticky-wrap">
      <table>
        <caption>시수 배정 현황</caption>        
        <colgroup>
          <col style="width: 128px;">
          <col style="width: 80px;" v-for="grdClsItem in gradeClassItems"
            :key="`cls-head-${grdClsItem.classId}`">
        </colgroup>
        <thead>
          <tr>
            <th scope="col" class="sticky-top sticky-left"></th>
            <template
              v-for="grd in timetableConfig.grades"
            >
              <th scope="col" class="sticky-top"
                :colspan="grd.maxClassCount + grd.maxVirtualClassCount"
                v-if="selectedGrade.includes(grd.grade - 1)"
                :key="`grade-header-${grd.grade}`"
              >
                <!-- 학년 반 수 만큼 colspan -->
                {{ TimetableDisplayUtils.formatGradeName(grd) }}
              </th>
            </template>
          </tr>
          <tr>
            <th scope="col" class="sticky-top sticky-left"></th>
            <th scope="col" class="sticky-top"
              v-for="grdClsItem in gradeClassItems"
              :key="`cls-head-${grdClsItem.classId}`"
            >
              {{ TimetableDisplayUtils.formatClassName(grdClsItem) }}
            </th>
          </tr>
          <tr>
            <th scope="col" class="sticky-top sticky-left"><strong>주간시수</strong></th>
            <th scope="col" class="sticky-top"
              :key="`cls-head2-${grdClsItem.classId}`"
              v-for="(grdClsItem, colIdx) in gradeClassItems"
              :class="[{ 'col-hover': hoveredStatusColIdx === colIdx },
              { 'over-period': grdClsItem.accumulated > grdClsItem.totalPeriod }]"
              @mouseenter="hoveredStatusColIdx = colIdx"
              @mouseleave="hoveredStatusColIdx = null"
            >
              {{ grdClsItem.totalPeriod }}
            </th>
          </tr>
          <tr>
            <!-- 시수 헤더 -->
            <th scope="col" class="sticky-top sticky-left"><strong>시수표(계)</strong></th>
            <th scope="col" class="sticky-top"
              v-for="(grdClsItem, colIdx) in gradeClassItems"
              :key="`cls-head2-${grdClsItem.classId}-`"
              :class="[periodItemClass(grdClsItem), { 'col-hover': hoveredStatusColIdx === colIdx }, 
              { 'over-period': grdClsItem.accumulated > grdClsItem.totalPeriod }]"              
              @mouseenter="hoveredStatusColIdx = colIdx"
              @mouseleave="hoveredStatusColIdx = null"
            >
              {{ grdClsItem.accumulated }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in courseBaseItems"
            :key="`item-${item.courseBaseId}`"
            :class="item.isDoubleTeacher ? 'double-teacher' : ''"
          >
            <td class="sticky-left txt-left" @click="() => handleClickCourseBase(item)" style="cursor: pointer;">
              {{ item.isDoubleTeacher ? '(복)' : '' }}
              {{ item.displayedTitle }}{{ item.standardCourseTitle ? ` (${item.standardCourseTitle})` : '' }}
            </td>

            <td
              v-for="(grdClsItem, colIdx) in gradeClassItems"
              :key="`cls-head-${grdClsItem.classId}`"
              :class="{
                'over-period': grdClsItem.totalPeriod < grdClsItem.accumulated,
                'double-teacher': false, // 필요시 로직 추가
                'error': duplicateCourseInClassSet.has(`${item.value}-${grdClsItem.classId}`),
                'col-hover': hoveredStatusColIdx === colIdx
              }"
              @mouseenter="hoveredStatusColIdx = colIdx"
              @mouseleave="hoveredStatusColIdx = null"
            >
              <span>
                {{ getTotalPeriodByClassIdAndCourseIds(grdClsItem.classId, item.courseIds) }}

                {{ (() => {
                  const conf = Object.values(lessonConfMap).find(lc => lc.courseId === item.value && lc.classId === grdClsItem.classId);
                  if (!conf) return '';
                  if (conf.periodCount !== undefined && conf.periodCount !== null) return conf.periodCount;
                  // fallback: courseMap에서 기본 시수
                  const courseObj = courseMap[item.value];
                  return courseObj?.periodCount ?? '';
                })() }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>        
  </div>
</template>

<script lang="ts" setup>

import { computed, inject, nextTick, onMounted, ref, watch } from 'vue';

import {
  Class,
  Course,
  CourseBase,
  FixedConf,
  LessonConf,
  TimetableConfig,
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
} from '../contexts';

import { TimetableDisplayUtils } from '../common/utils';

interface CourseBaseItem {
  courseBaseId: string;
  displayedTitle: string;
  standardCourseTitle?: string;
  isDoubleTeacher: boolean;
  sortNo: number;
  courseIds: string[];
}

interface ClassPeriodItem extends Class { 
  totalPeriod: number,
  accumulated: number,
  grade: number
}

const props = defineProps<{
  onSelectCourseBase: (courseBase: CourseBase | null) => void;
}>();


const courseBaseItems = ref<CourseBaseItem[]>([]);
const courseMapByCourseBaseId = ref<Record<string, Course[]>>({});
const selectedGrade = ref<number[]>([]);
const hoveredStatusColIdx = ref<number | null>(null);
const selectedGradeRadio = ref<'all' | number>('all');

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const courseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const fixedConfContext = inject(ContextKeys.FixedConf) as FixedConfContext;

const classes = computed(() => classContext.classes as Class[]);
const courses = computed(() => courseContext.courses as Course[]);
const courseBases = computed(() => courseBaseContext.courseBases as CourseBase[]);
const courseBaseMap = computed(() => courseBaseContext.courseBaseMap as Record<string, CourseBase>);
const courseMap = computed(() => courseContext.courseMap as Record<string, Course>);
const lessonConfs = computed(() => lessonConfContext.lessonConfs as LessonConf[]);
const lessonConfMap = computed(() => lessonConfContext.lessonConfMap as Record<string, LessonConf>);
const timetableConfig = computed(() => gradeContext.timetableConfig as TimetableConfig);
const fixedConfs = computed(() => fixedConfContext.fixedConfs as FixedConf[]);

const isShowGradesRadio = computed(() => timetableConfig.value.grades.length > 1);

const lessonConfsByClassId = computed(() =>
  lessonConfs.value.reduce((map, conf) => {
    (map[conf.classId] ||= []).push(conf);
    return map;
  }, {} as Record<string, LessonConf[]>)
);

const gradeClassItems = computed(() => {
  const grades = Object.keys(gradeContext.gradeTotalPeriodMap).map(Number);
  const gradeTotalPeriod = grades.map(grade => 
    gradeContext.gradeTotalPeriodMap[grade] - (fixedUnifiedCourseGroupByGrade.value[grade]?.length || 0)
  );

  return classes.value
    .filter((cls) => selectedGrade.value.includes(cls.grade - 1))
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


// 한 반에 동일 과목이 2번 이상 배정된 경우
const duplicateCourseInClassSet = computed(() => {
  const duplicates = new Set<string>();
  lessonConfs.value.reduce((acc, conf) => {
    if (!courseMap.value[conf.courseId]?.isDoubleTeacher) {
      const key = `${conf.courseId}-${conf.classId}`;
      acc[key] = (acc[key] || 0) + 1;
      if (acc[key] > 1) duplicates.add(key);
    }
    return acc;
  }, {} as Record<string, number>);
  return duplicates;
});

const getTotalPeriodByClassIdAndCourseIds = (classId: string, courseIds: string[]) => {
  //  복수 교사 시수가 중복되지 않도록 classId-courseId-isDoubleTeacher 기준 고유한 항목만 필터링
  const classLessonConfs = lessonConfsByClassId.value[classId] || [];
  
  /*
  const confs = Array.from(new Map(classLessonConfs.map((lc) => {
    // const key = `${lc.courseId}-${courseMap.value[lc.courseId]?.isDoubleTeacher ? 'T' : 'F'}`;
    return [lc.courseId, lc]})
  ).values())
  .filter(lc => courseIds.includes(lc.courseId));
  */

  // 복수 교사 과목인 경우, 첫 번째 항목만 시수 합산
  const multiTeacherCourseSet = new Set<string>();
  const confs = classLessonConfs.filter(lc => {
    const course = courseMap.value[lc.courseId];
    if (!course.isDoubleTeacher) {
      return courseIds.includes(lc.courseId)
      
    }

    if(multiTeacherCourseSet.has(lc.courseId)) {
      return false;
    }

    multiTeacherCourseSet.add(lc.courseId);
    return courseIds.includes(lc.courseId);
  });

  const total = confs.reduce((sum, lc) => {
    const crs = courseMap.value[lc.courseId];
    return sum + (crs.periodCount || 0);
  }, 0)
  
  return total > 0 ? total : null;
};

const handleClickCourseBase = (item: CourseBaseItem | null) => {
  const courseBase = courseBaseMap.value[item?.courseBaseId || ''] || null;
  props.onSelectCourseBase && props.onSelectCourseBase(courseBase);
};

watch(
  () => [courseBases.value, courses.value],
  () => {

    courseMapByCourseBaseId.value = courses.value.reduce((map, course) => {
      (map[course.courseBaseId] ||= []).push(course);
      return map;
    }, {} as Record<string, Course[]>);
    
    courseBaseItems.value = courseBases.value.map(cb => ({
      courseBaseId: cb.courseBaseId,
      displayedTitle: cb.displayedTitle,
      standardCourseTitle: cb?.standardCourseTitle || undefined,
      isDoubleTeacher: cb.isDoubleTeacher,
      sortNo: cb.sortNo,
      courseIds: (courseMapByCourseBaseId.value[cb.courseBaseId] || []).map(c => c.courseId),
    })).sort((a, b) => a.sortNo - b.sortNo);
      
  },
  { immediate: true }
);

watch(selectedGradeRadio, (val) => {
  if (val === 'all') {
    selectedGrade.value = Array.from({ length: timetableConfig.value.maxGrade }, (_, i) => i);
  } else {
    const idx = timetableConfig.value.grades.findIndex(g => g.grade === val);
    selectedGrade.value = idx !== -1 ? [idx] : [];
  }
});


// published -------->


onMounted(async () => {
  await initData();
});

const initData = async () => {
  await gradeContext.load();
  await classContext.load();  
  await teacherContext.load();
  await courseContext.load();
  await courseBaseContext.load();
  await teacherCourseContext.load();
  await lessonConfContext.load();
  await fixedConfContext.load();

  initSelectedGrade();
};

// 학년 선택 상태를 초기화
const initSelectedGrade = () => {
  selectedGrade.value = Array.from({ length: timetableConfig.value.maxGrade }, (_, i) => i);
};


//시수 배정 현황 테이블 : 시수표(계)행에서 누적 시수 셀에 경고색 등 스타일을 적용
const periodItemClass = (classPeriodItem: ClassPeriodItem) => {
  const isLess = classPeriodItem.accumulated < classPeriodItem.totalPeriod;
  const isOver = classPeriodItem.accumulated > classPeriodItem.totalPeriod;

  return {
    'txt-warning em': (isLess && !classPeriodItem.isVirtual) || isOver
  };
};

</script>

<style scoped lang="scss">

.teacher-content{
  width:calc(100% - 300px);  

  .period-table{
    max-height: calc(var(--vh) * 100 - 477px);
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
        tr.double-teacher td{
            background: var(--light-jungle);
        }
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
  ::v-deep .autocomplete-list{
    height: 127px;
    top: calc(100% - 4px);
  }
}

// 시수표 유효성 검사 결과 확인
.period-validation-modal.modal-xs{
  ::v-deep .modal__layer{
    max-width: 568px;
  }
}
</style>