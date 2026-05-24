<template>
  <TimeTableModal size="md" class="total-period-modal" @close="handleClickCancel">
    <template v-slot:heading>
      전체 시수표 보기
      <p class="smr">각 요일별 전체 배정된 시수를 한눈에 확인합니다.</p>
    </template>
    <template v-slot:content>         
      <div class="tab-nav type01">
        <button :class="{'active' : totalPeriodTab==='teacher-period'}" @click="totalPeriodTab='teacher-period'">교사별 배정 시수표</button>
        <button :class="{'active' : totalPeriodTab==='total-period'}" @click="totalPeriodTab='total-period'">전체 시수표 요약</button>
      </div>  
      <!-- 교사별 배정 시수표 -->
      <div class="table-content sticky-wrap table-box" v-if="totalPeriodTab==='teacher-period'">
        <table>
          <caption>교사별 배정 시수표</caption>
          <colgroup>
            <col style="width:10%">
            <col style="width:20%">
            <col style="width:20%">
            <col style="width:auto"  v-for="day in activatedClassDays"
                :key="`day-header-${day.dayOfWeek}`"> 
          </colgroup>
          <thead>
            <tr>
              <th scope="col" class="sticky-top"></th>
              <th scope="col" class="sticky-top">이름</th>
              <th scope="col" class="sticky-top">배정/전체</th>
              <th class="sticky-top" v-for="day in activatedClassDays"
                :key="`day-header-${day.dayOfWeek}`">{{ day.title }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in teacherPeriodItems" :key="`${item.teacherId}-${index}`">
              <td>{{ index + 1 }}</td>
              <td class="cursor-pointer" @click="() => handleClickTeacher(item.teacherId)">{{ item.teacherName }}</td>
              <td>{{ item.totalAssignedPeriods }}/{{ item.totalPeriods }}</td>
              <td v-for="day in activatedClassDays"
                :key="`day-header-${day.dayOfWeek}`">
                {{ item.classDays[day.dayOfWeek] || 0 }}
              </td>
            </tr>            
          </tbody>
        </table>
      </div>        
      <!-- 전체 시수표 요약 -->
      <div class="table-content sticky-wrap table-box" v-if="totalPeriodTab==='total-period'">
        <table>
          <caption>전체 시수표 요약</caption>
          <colgroup>
            <col style="width:35%">
            <col style="width:auto" v-for="day in activatedClassDays"
                :key="`day-header-${day.dayOfWeek}`"> 
          </colgroup>
          <thead>
            <tr>
              <th scope="col" class="sticky-top"></th>
              <th scope="col" class="sticky-top"
                v-for="day in activatedClassDays"
                :key="`day-header-${day.dayOfWeek}`">{{ day.title }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>요일별 배정 시수</td>
              <td v-for="day in activatedClassDays"
                :key="`day-total-${day.dayOfWeek}`">
                {{ totalAssignedPeriodByClassDay[day.dayOfWeek] || 0 }}
              </td>
            </tr>
            <tr>
              <td>교사별 일 평균 시수</td>
              <td v-for="day in activatedClassDays"
                :key="`day-total-${day.dayOfWeek}`">
                {{ ((totalAssignedPeriodByClassDay[day.dayOfWeek] || 0) / teacherLength).toFixed(1) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </TimeTableModal> 
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { ContextKeys, LessonConfContext, LessonContext, TimetableCourseContext, TimetableGradeContext, TimetableTeacherContext } from '../contexts';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import { ClassDayStatus, DAYS_OF_WEEK } from '../common/constants';
import { ActivateWeekday } from '../common/types';
import { Course, Lesson } from '../core/types';

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;

interface TeacherPeriodItem {
  teacherId: string;
  teacherName: string; // 교사 이름
  totalAssignedPeriods: number;
  totalPeriods: number;
  classDays: Record<number, number>; // 요일별 배정 시수
}

const props = defineProps<{
  onClose: (teacherId: string | null) => void;
}>();

const totalPeriodTab = ref<'teacher-period' | 'total-period'>('teacher-period');

const teacherLength = computed(() => teacherContext.teachers.length);

const teachers = computed(() => {
  return [...teacherContext.teachers].sort((a, b) => a.teacherName.localeCompare(b.teacherName));
});
const courseMap = computed(() => courseContext.courseMap || ({} as Record<string, Course>));
const lessonConfsMapByTeacher = computed(() => lessonConfContext.lessonConfsMapByTeacher);
const lessonsByTeacher = computed(() => lessonContext.lessonsByTeacher || ({} as Record<string, Lesson[]>));

const teacherPeriodItems = computed(() => {
  return Object.values(teacherPeriodMap.value).sort((a, b) => a.teacherName.localeCompare(b.teacherName));
});

const totalAssignedPeriodByClassDay = computed(() => {
  const classDays = gradeContext.timetableConfig.classDays;
  const items = classDays.reduce((acc, isActive, index) => {
    if (isActive === ClassDayStatus.ACTIVATED) {
      acc[index] = 0; // 요일별 배정 시수 초기화
    }
    return acc;
  }, {} as Record<number, number>);

  Object.values(teacherPeriodMap.value).forEach(t => {
    activatedClassDays.value.forEach(day => {
      if (t.classDays[day.dayOfWeek] !== undefined) {
        items[day.dayOfWeek] += t.classDays[day.dayOfWeek] || 0;
      }
    });
  });
  
  return items;
});

const teacherPeriodMap = computed(() => {
  return teachers.value.reduce((acc, teacher) => {
    const teacherPeriodItem = {
      teacherId: teacher.teacherId,
      teacherName: teacher.teacherName,
      totalAssignedPeriods: 0, // 배정된 시수
      totalPeriods: 0, // 전체 시수
      classDays: {}, // 요일별 배정 시수
    } as TeacherPeriodItem;;

    const lessonConfs = lessonConfsMapByTeacher.value[teacher.teacherId] || [];
    const totalPeriods = lessonConfs.reduce((sum, conf) => {
      const course = courseMap.value[conf.courseId];
      if (!course) return sum;
      return sum + (course.periodCount || 0);
    }, 0);

    teacherPeriodItem.totalPeriods = totalPeriods;

    const lessons = lessonsByTeacher.value[teacher.teacherId] || [];
    const classDays = gradeContext.timetableConfig.classDays;
    lessons.forEach(lesson => {
      if (lesson.classId) {
        const classDay = lesson.dayOfWeek;
        if (classDay >= 0 && classDay < classDays.length && classDays[classDay] === ClassDayStatus.ACTIVATED) {
          teacherPeriodItem.totalAssignedPeriods += 1;
          teacherPeriodItem.classDays[classDay] = (teacherPeriodItem.classDays[classDay] || 0) + 1;
        }
      }
    });

    acc[teacher.teacherId] = teacherPeriodItem;
    return acc;
  }, {} as Record<string, TeacherPeriodItem>);
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

const handleClickCancel = () => {
  // console.log('handleClickCancel');
  props.onClose && props.onClose(null);
};

const handleClickTeacher = (teacherId: string) => {
  if(!teacherId) {
    return;
  }

  props.onClose && props.onClose(teacherId);
};

</script>

<style lang="scss" scoped>
.timetable-modal-common{
  ::v-deep .modal__layer{
    height: 100%;
    .modal__content{
      display: flex;
      flex-flow: column;
      gap: 20px
    }
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>