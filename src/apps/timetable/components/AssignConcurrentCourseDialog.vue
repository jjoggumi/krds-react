<template>
  <TimeTableModal size="xl" @close="handleClickCancel" class="concurrent-course-modal">      
    <template v-slot:heading>        
      동시수업 배정(그룹명: {{ concurrentCourseName }})
      <p class="smr">동시수업이 아래와 같이 배정됩니다</p>
    </template>
    <template v-slot:content>
      <div class="tb-row teacher-view"><!-- teacher-view : 수정 없는 테이블 뷰-->              
        <div class="tb-col" v-for="(item, itemIdx) in unqTeachersOfConccurentCourse" :key="`${item.teacherId}-${itemIdx}-${assignInfo.concurrentCourseId}`">
          <div class="table-content time-table">
            <div class="h4-tit">
              <h4>{{ item.teacherName }} 선생님</h4>
              <p class="period">{{  item.courseNames }}</p>
            </div>
            <table>
              <caption>시간표</caption>
              <colgroup>
                <col style="width: 10%;" />
                <col v-for="dayIdx in activatedClassDaysCount" :key="`day-col-${dayIdx}-${item.teacherId}`" :style="`width: ${activatedClassDaysWidthPercent};`" />
              </colgroup>
              <thead>
                <tr>
                  <th></th>
                  <th v-for="(day, dayIdx) in activatedClassDays"
                    :key="`day-header-${item?.teacherId}-${dayIdx}-${day.dayOfWeek}`">{{ day.title }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(period, periodIdx) in maxPeriod" :key="`period-${item.teacherId}-${periodIdx}-${period}`">
                  <td class="th">{{ adjustDisplayedPeriod(period) }}</td>
                  <td v-for="(day, dayIdx) in activatedClassDays"
                    :key="`lesson-cell-${item.teacherId}-${dayIdx}-${day.dayOfWeek}-${period}`">
                    <timetable-lesson-read-cell
                      :day-of-week="day.dayOfWeek"
                      :period="period"
                      :teacher-id="item.teacherId"
                      :cell-lesson="getLessonByTeacherAndPeriod(item.teacherId, day.dayOfWeek, period)"
                      :highlight="checkIsHighlighted(day.dayOfWeek, period)"
                      />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="handleClickCancel">취소</button>
      <button type="button" class="btn btn-primary btn-lg" @click="handleClickSubmit">시간표 배정</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import { computed, inject, watch } from 'vue';
import {
  ConcurrentConfContext,
  ContextKeys,
  FixedConfContext,
  LessonConfContext,
  LessonContext,
  SpecialtyRoomContext,
  TeacherCourseContext,
  TimetableClassContext,
  TimetableCourseBaseContext,
  TimetableCourseContext,
  TimetableGradeContext,
  TimetableTeacherContext } from '@/apps/timetable/contexts';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import TimetableLessonReadCell from '@/apps/timetable/components/TimetableLessonReadCell.vue';
import { ClassDayStatus, DAILY_SCHEDULE_DEFAULTS, DAYS_OF_WEEK } from '../common/constants';
import { ActivateWeekday, CellLesson, CellLessonType } from '../common/types';
import { CourseBase, Lesson } from '../core/types';
import { TimetableDataUtils } from '../core/mod/utils';

export interface AssignConcurrentCourseInfo {
  concurrentCourseId: string;
  dayOfWeek: number;
  period: number;
  consecutivePeriodLength?: number;
}

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const courseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const fixedConfContext = inject(ContextKeys.FixedConf) as FixedConfContext;
const concurrentConfContext = inject(ContextKeys.ConcurrentConf) as ConcurrentConfContext;
const specialtyRoomContext = inject(ContextKeys.SpecialtyRoom) as SpecialtyRoomContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;

const props = defineProps<{
  assignInfo: AssignConcurrentCourseInfo;
  onSubmit: (props: AssignConcurrentCourseInfo) => void;
  onCancel: () => void;
}>();

const courseBaseMap = computed(() => courseBaseContext.courseBaseMap);
const courseMap = computed(() => courseContext.courseMap);
const lessonConfsMapByTeacher = computed(() => lessonConfContext.lessonConfsMapByTeacher);
const consecutivePeriod = computed(() => props.assignInfo.consecutivePeriodLength || 1);
const periodsForAssign = computed(() => {
  return Array.from({ length: consecutivePeriod.value }, (_, i) => props.assignInfo.period + i);
});

const maxPeriod = computed(() => {
  return gradeContext.timetableConfig.maxPeriod || DAILY_SCHEDULE_DEFAULTS.maxPeriod;
});

const startPeriod = computed(() => {  
  return gradeContext.startPeriod;
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

const concurrentCourseName = computed(() => {
  return courseContext.courseMap[props.assignInfo.concurrentCourseId]?.displayedTitle || '';
});

const lessonConfsByConcurrentCourse = computed(() => {
  return lessonConfContext.lessonConfsMapByConcurrentCourse[props.assignInfo.concurrentCourseId] || {};
});

const teachersOfConccurentCourse = computed(() => {
  return lessonConfsByConcurrentCourse.value
    .map((lessonConf) => {
      const lessonConfsOfTeacher = lessonConfsMapByTeacher.value[lessonConf.teacherId] || [];
      // 실제 시수표에 배정된 과목 기준으로 기준 과목 이름들 추출
      const courseBasesOfLessonConfs = lessonConfsOfTeacher.map(lc => {
        return courseBaseMap.value[courseMap.value[lc.courseId]?.courseBaseId || ''];
      })
      .filter(cb => cb !== undefined) as CourseBase[];
      const courseNames = TimetableDataUtils.courseBaseNames(courseBasesOfLessonConfs)
        .sort()
        .join(', ');
      return { 
        courseNames,
        ...teacherContext.teacherMap[lessonConf.teacherId]
      };
    })
});

const unqTeachersOfConccurentCourse = computed(() => {
  // 합반인 경우, 교사를 한번만 출력하기 위해
  const uniqTeacherIds = new Set<string>();
  lessonConfsByConcurrentCourse.value.forEach((lessonConf) => {
    uniqTeacherIds.add(lessonConf.teacherId);
  });

  return Array.from(uniqTeacherIds)
    .map((tId) => {
      const lessonConfsOfTeacher = lessonConfsMapByTeacher.value[tId] || [];
      // 실제 시수표에 배정된 과목 기준으로 기준 과목 이름들 추출
      const courseBasesOfLessonConfs = lessonConfsOfTeacher.map(lc => {
        return courseBaseMap.value[courseMap.value[lc.courseId]?.courseBaseId || ''];
      })
      .filter(cb => cb !== undefined) as CourseBase[];
      const courseNames = TimetableDataUtils.courseBaseNames(courseBasesOfLessonConfs)
        .sort()
        .join(', ');
      return { 
        courseNames,
        ...teacherContext.teacherMap[tId]
      };
    })
});

const lessonsByTeacher = computed(() => lessonContext.lessonsByTeacher);

const adjustDisplayedPeriod = (period: number) => {
  return period + (startPeriod.value -1);
};

const getLessonByTeacherAndPeriod = (teacherId: string, dayOfWeek: number, period: number): CellLesson | undefined => {
  if (!teacherId) {
    return;
  }

  const result ={
    lesson: undefined,
    isGradeFreePeriod: false,
    cellLessonType: CellLessonType.TEACHER,
  } as CellLesson;

  // 배정하려는 시수와 동일한 경우, 동시수업 배정 정보로 lesson 생성
  // if(dayOfWeek == props.assignInfo.dayOfWeek && period == props.assignInfo.period) {
  if(dayOfWeek == props.assignInfo.dayOfWeek &&  periodsForAssign.value.includes(period)) {
    // 합반 수업이 있을 수도 있어 모든 lessonConf를 가져온다
    const lessonConfsOfTeacher = lessonConfsByConcurrentCourse.value.filter(
      (lessonConf) => lessonConf.teacherId === teacherId
    );

    const lessonConfOfTeacher = lessonConfsOfTeacher.length > 0 ? lessonConfsOfTeacher[0] : undefined;

    if(!lessonConfOfTeacher) {
      return result;
    }

    const { concurrentCourseId } = props.assignInfo;
    const { classId, courseId } = lessonConfOfTeacher;
    const lessonClasses = lessonConfsOfTeacher.length > 1 ? lessonConfsOfTeacher.map(lc => lc.classId) : [];

    result.lesson = {
      teacherId,
      dayOfWeek,
      period,
      concurrentCourseId,
      classId,
      courseId,
      lessonId: '',
      isFixedCourse: false,
      isManuallyAssigned: true,
      lessonClasses,
    } as Lesson;

    return result;
  }
  
  result.lesson = (lessonsByTeacher.value[teacherId] || []).find(
    (lesson) => lesson.dayOfWeek === dayOfWeek && lesson.period === period
  );

  return result;
};

const checkIsHighlighted = (dayOfWeek: number, period: number): boolean => {
  // return props.assignInfo.dayOfWeek === dayOfWeek && props.assignInfo.period === period;
  return props.assignInfo.dayOfWeek === dayOfWeek && periodsForAssign.value.includes(period);
};

const handleClickSubmit = () => {
  props.onSubmit(props.assignInfo);
};

const handleClickCancel = () => {
  props.onCancel();
};

</script>

<style lang="scss" scoped>
</style>