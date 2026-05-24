<template>
  <div class="lesson-conf">
    <div class="hi-row">
      <div class="col-sm-4">
        <div class="panel">
          <div class="panel-head">학급별 시수</div>
          <div class="panel-body">
            <div class="table-content sticky-wrap table-box">
              <table>
                <thead>
                  <tr>
                    <th class="sticky-top">학급</th>
                    <th class="sticky-top">시수</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in gradeClassItems" :key="`class-${idx}`" @click="handleClickSelectClass(item)">
                    <td>{{ TimetableDisplayUtils.formatFullClassName(item) }}</td>
                    <td :class="{ 'txt-warning': item.accumulated !== item.totalPeriod }">{{ `${item.accumulated} / ${item.totalPeriod}` }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-8">        
        <div class="panel" v-if="teacherCourseItems.length > 0">
          <div class="panel-head">
            상세 시수표 
            <i class="divider"></i>
            <span class="middle">
              {{ selectedClass && TimetableDisplayUtils.formatFullClassName(selectedClass) }} 
            </span>
            <span>
              {{ `(${(selectedClass || {}).accumulated} / ${(selectedClass || {}).totalPeriod})` }}
            </span>
          </div>
          <div class="panel-body">
            <div class="table-content sticky-wrap table-box">
              <table>
                <colgroup>
                  <col style="width: 8%;">
                  <col style="width: 23%;">
                  <col style="width: 23%;">
                  <col style="width: 23%;">
                  <col style="width: 23%;">
                </colgroup>
                <thead>
                  <tr>
                    <th class="sticky-top">번호</th>
                    <th class="sticky-top">표기과목명</th>
                    <th class="sticky-top">정식과목명</th>
                    <th class="sticky-top">교사명</th>
                    <th class="sticky-top">시수</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in teacherCourseItems" :key="`class-${idx}`">
                    <td>{{ idx + 1 }}</td>
                    <td>{{ `${item.isDoubleTeacher ? '(복) ' : ''}${item.displayedTitle}` }}</td>
                    <td>{{ `${item.standardCourseTitle}` }}</td>                    
                    <td>{{ `${item.teacherName}` }}</td>
                    <td>{{ `${item.actualPeriodCount}` }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';

import {
  Class,
  Course,
  CourseBase,
  FixedConf,
  LessonConf,
  Teacher
} from '@/apps/timetable/core/types';

import {
  ContextKeys,
  TimetableGradeContext,
  TimetableCourseContext,
  TimetableTeacherContext,
  TimetableClassContext,
  LessonConfContext,
  FixedConfContext,
  TimetableCourseBaseContext,
} from '../contexts';
import { TimetableDisplayUtils } from '../common/utils';

interface ClassPeriodItem extends Class { totalPeriod: number, accumulated: number, grade: number }
interface TeacherCourseItem extends Teacher, Course { actualPeriodCount: number }

// const teacherCourseItems = ref<TeacherCourseItem[]>([]);
const selectedClass = ref<ClassPeriodItem>();

const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const fixedConfContext = inject(ContextKeys.FixedConf) as FixedConfContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;

const classes = computed(() => classContext.classes as Class[]);
const lessonConfs = computed(() => lessonConfContext.lessonConfs as LessonConf[]);
const courseMap = computed(() => courseContext.courseMap as Record<string, Course>);
const fixedConfs = computed(() => fixedConfContext.fixedConfs as FixedConf[]);
const teacherMap = computed(() => teacherContext.teacherMap as Record<string, Teacher>);

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

const gradeClassItems = computed(() => {
  const grades = Object.keys(gradeContext.gradeTotalPeriodMap).map(Number);
  const gradeTotalPeriod = grades.map(grade => 
    gradeContext.gradeTotalPeriodMap[grade] - (fixedUnifiedCourseGroupByGrade.value[grade]?.length || 0)
  );

  return classes.value
    .filter((cls) => !cls.isVirtual)
    .map((cls) => {
      const classLessonConfs = lessonConfs.value.filter(
        (conf) => conf.classId === cls.classId
      );

      const accumulatedDoubleTeacherCourseSet = new Set<string>();

      const accumulated = classLessonConfs.reduce((acc, conf) => {
        const course = courseMap.value[conf.courseId];
        let addedPeriodCount = course.periodCount || 0;

        // 복수 교사 과목인 경우
        if (course.isDoubleTeacher) {
          addedPeriodCount =  accumulatedDoubleTeacherCourseSet.has(conf.courseId) === false ? addedPeriodCount : 0;
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
        return a.classNumber - b.classNumber;
      }
      return a.grade - b.grade;
    });
});

const teacherCourseItems = computed(() => {
  if (!selectedClass.value?.classId) return [];

  return lessonConfs.value
    .filter((lc) => lc.classId === selectedClass.value?.classId )
    .map((lc) => {
      const course = courseMap.value[lc.courseId];
      const teacher = teacherMap.value[lc.teacherId];

      const item: TeacherCourseItem = {
        ...teacher,
        ...course,
        actualPeriodCount: course.periodCount || 0,
      };
      
      /*
      if (course.isDoubleTeacher && course.countTeacher > 1) {
        item.actualPeriodCount = item.actualPeriodCount / course.countTeacher;
      }
      */

      return item;
    });
})

onMounted(async () => {
  await initData();
});

const initData = async () => {
  await classContext.load();
  await courseContext.load();
  await lessonConfContext.load();

  if (gradeClassItems.value.length) { selectedClass.value = gradeClassItems.value[0]; }
};

const handleClickSelectClass = (item: ClassPeriodItem) => { selectedClass.value = item; }

// 시수표영역 높이 설정 
// const setFullHeight = () => {
//   const vh = window.innerHeight * 0.01;
//   document.documentElement.style.setProperty('--vh', `${vh}px`);
// };

// onMounted(() => {
//   setFullHeight();
//   window.addEventListener('resize', setFullHeight);
// });

// onUnmounted(() => {
//   window.removeEventListener('resize', setFullHeight);
// });

</script>

<style scoped lang="scss">  
.hi-row{
  align-items: stretch;
  div[class *= "col-sm"]{    
    height: calc(var(--vh) * 100 - 255px);
    overflow: hidden;
    .panel{
      height: 100%;
      display: flex;
      flex-direction: column;
      .panel-head{
        padding: 20px 20px 0 20px;
        border: 0;
        .divider {
          display: inline-block;
          width: 1px;
          height: 16px;
          background-color: var(--gray-07);
          margin: 0 8px;
          vertical-align: middle;
        }
        .middle {
          display: inline-block;
          vertical-align: middle;
        }
      }
      .panel-body{
        flex-grow: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        padding: 16px;
        padding-top: 14px;
        // .table-head{
        //   font-size: 18px;
        //   font-weight: var(--font-strong);
        //   line-height: 144%;
        //   padding: 0px 8px;
        // }
        // .table-box{
        //   flex-grow: 1;
        //   max-height: 100%;
        // }
      }
    }
  }
  // .table-content table > tbody > tr > td{
  //   padding: 0 16px 0;
  //   height: 53px;
  // }
  .col-sm-4{  
    .table-content table > tbody > tr {
      cursor: pointer;
      &:hover {
        background-color: #F1F4FC;
      }
      // > td{
      //   height: 40px;
      // }
    }
  } 
}
</style>
