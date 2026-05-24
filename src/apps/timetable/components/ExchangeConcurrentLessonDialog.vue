<template>
  <TimeTableModal size="xl" @close="handleClose" class="exchange-concurrent-direct-modal">
    <template v-slot:heading>
      동시수업 배정(그룹명: A)
      <p class="smr">
        <!-- 동시수업 배정에 관련된 서브카피가 노출됨 서브카피서브카피. -->
      </p>
    </template>
    <template v-slot:content>
      <div class="gray-box selected-teacher">
        <button v-for="teacher in teachers" 
          :key="`${teacher.teacherId}-btn`" 
          type="button" 
          class="btn"
          :class="[selectedTeacherId === teacher.teacherId ? 'btn-tertiary-blue' : 'btn-tertiary']"
          @click="() => handleClickTeacher(teacher.teacherId)">
          {{ teacher.teacherName || '-' }}</button>
        
      </div>

      <!-- 연쇄교환 일때 -->
      <div class="tb-row teacher-view gray-box"><!-- teacher-view : 수정 없는 테이블 뷰-->    
        <div class="tb-col" v-for="(info, idx) in timetableReaderInfo"
          :key="`${info.teacherId}-${idx}`">
          <div class="table-content time-table">
            <div class="h4-tit">
              <h4>{{ getTeacherNameById(info.teacherId) }} 선생님</h4>
              <p class="period"><i class="ico ico-list ico-primary" /> {{ getTeacherCourseNames(info.teacherId) }}</p>
            </div>
            <table>
              <caption>시간표</caption>
              <colgroup>
                <col style="width: 10%;" />
                <col v-for="dayIdx in activatedClassDaysCount" :key="`day-col-${dayIdx}-${info.teacherId}`" :style="`width: ${activatedClassDaysWidthPercent};`" />                
              </colgroup>
              <thead>
                <tr>
                  <th></th>
                  <th v-for="day in activatedClassDays"
                    :key="`day-header-${info.teacherId}-${day.dayOfWeek}`">{{ day.title }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="period in maxPeriod" :key="`period-${info.teacherId}-${period}`">
                  <td class="th">{{ adjustDisplayedPeriod(period) }}</td>
                  <td v-for="day in activatedClassDays"
                    :key="`lesson-cell-${info.teacherId}-${day.dayOfWeek}-${period}`">
                    <timetable-teacher-lesson-cell
                      :day-of-week="day.dayOfWeek"
                      :period="period"
                      :teacher-id="info.teacherId"
                      :lesson="getLessonByTeacherAndPeriod(info.teacherId, day.dayOfWeek, period, info.lessonMoveInfo)"
                      :is-exchange-source="checkExchangeSource(day.dayOfWeek, period, info.lessonMoveInfo)"
                      :is-exchange-target="checkExchangeTarget(day.dayOfWeek, period, info.lessonMoveInfo)"
                    />
                  </td>
                </tr>                
              </tbody>
            </table>
          </div>
        </div>
        5
      </div>
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="handleClose">취소</button>
      <button type="button" class="btn btn-primary btn-lg" @click="handleClickSubmit">시간표 변경</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import { onMounted, inject, computed, ref } from 'vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import TimetableTeacherLessonCell from '@/apps/timetable/components/TimetableTeacherLessonCell.vue';
import { ContextKeys, LessonConfContext, LessonContext, TeacherCourseContext, TimetableCourseBaseContext, TimetableCourseContext, TimetableGradeContext, TimetableTeacherContext } from '../contexts';
import { ConcurrentCourseExchangeInfo, Lesson, LessonMoveInfo, TeacherCourse } from '../core/types';
import { ClassDayStatus, DAILY_SCHEDULE_DEFAULTS, DAYS_OF_WEEK } from '../common/constants';
import { ActivateWeekday } from '../common/types';

interface TimetableReaderInfo {
  teacherId?: string;
  lessons?: Lesson[];
  lessonMoveInfo?: LessonMoveInfo;
}

const props = defineProps<{
  concurrentCourseExchangeInfo?: ConcurrentCourseExchangeInfo | null;
  onCancel: () => void;
  onSubmit: () => void;
}>();

const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const courseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;

const teacherMap = computed(() => teacherContext.teacherMap);
const lessonsByTeacher = computed(() => lessonContext.lessonsByTeacher);
const teacherCourseMap = computed(() => teacherCourseContext.teacherCourseMap);
const courseMap = computed(() => courseContext.courseMap);
const courseBaseMap = computed(() => courseBaseContext.courseBaseMap);
const lessonConfsMapByTeacher = computed(() => lessonConfContext.lessonConfsMapByTeacher);


const selectedTeacherId = ref<string | null>(null);

onMounted(() => {
  // console.log('Concurrent Course Exchangeable Results:', props.concurrentCourseExchangeInfo);  
  if(teachers.value.length > 0) {
    selectedTeacherId.value = teachers.value[0].teacherId; // 기본적으로 첫번째 선생님을 선택
  }  
});

const sourceLessons = computed(() => {
  if (!props.concurrentCourseExchangeInfo) {
    return [];
  }

  const { pathMap } = props.concurrentCourseExchangeInfo;
  return Object.keys(pathMap).map((lessonId) => pathMap[lessonId][0]);
});

const teachers = computed(() => {
  if (!props.concurrentCourseExchangeInfo) {
    return [];
  }

  return sourceLessons.value
    .flatMap((lesson) => lesson.lessonTeachers?.map((teacher) => teacher.teacherId) || [])
    .filter((teacherId, index, self) => self.indexOf(teacherId) === index)
    .map((teacherId) => {
      return teacherMap.value[teacherId];
    });
});

const pathByTeacher = computed(() => {
  if (!props.concurrentCourseExchangeInfo) {
    return {};
  }

  const { pathMap } = props.concurrentCourseExchangeInfo;
  const result: Record<string, any[]> = {};

  Object.keys(pathMap).forEach((lessonId) => {
    const lesson = pathMap[lessonId][0];
    
    lesson.lessonTeachers?.map((teacher) => teacher.teacherId)
      .forEach((teacherId) => {
        if (!result[teacherId]) {
          result[teacherId] = [];
        }
        result[teacherId] = pathMap[lessonId];
      });
  });

  return result;
});

const timetableReaderInfo = computed(() => {
  if (selectedTeacherId.value === null || !props.concurrentCourseExchangeInfo) {
    return [] as TimetableReaderInfo[];
  }

  const path = pathByTeacher.value[selectedTeacherId.value];

  return path.map((sourceLesson, index) => {
    // console.log('sourceLesson', sourceLesson, index);

    const teacherId =
      sourceLesson.lessonTeachers && sourceLesson.lessonTeachers[0].teacherId;

    const targetIndex = index > 0 ? index - 1 : path.length - 1;
    const targetLesson = path[targetIndex];

    return {
      teacherId,
      lessons: teacherId && lessonsByTeacher.value[teacherId],
      lessonMoveInfo: {
        sourceLesson,
        targetPeriod: {
          dayOfWeek: targetLesson.dayOfWeek,
          period: targetLesson.period,
        },
      },
    } as TimetableReaderInfo;
  }) || [];
});

const maxPeriod = computed(() => {
  return gradeContext.timetableConfig.maxPeriod || DAILY_SCHEDULE_DEFAULTS.maxPeriod;
});

const startPeriod = computed(() => {
  return gradeContext.startPeriod;
});

const adjustDisplayedPeriod = (period: number) => {
  return period + (startPeriod.value -1);
};

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

const getLessonByTeacherAndPeriod = (
  teacherId: string | undefined,
  dayOfWeek: number,
  period: number,
  lessonMoveInfo?: LessonMoveInfo
) => {
  const { sourceLesson, targetPeriod } = lessonMoveInfo || {};
  if (targetPeriod?.dayOfWeek === dayOfWeek && targetPeriod?.period === period) {
    return sourceLesson;
  }
  
  if (!teacherId) {
    return undefined;
  }

  const lessons = lessonsByTeacher.value[teacherId];
  if (!lessons) {
    return undefined;
  }

  const lesson = lessons.find(
    (lesson) => lesson.dayOfWeek === dayOfWeek && lesson.period === period
  );

  return lesson;
};

const checkExchangeSource = (dayOfWeek: number, period: number, lessonMoveInfo: LessonMoveInfo | undefined) => {
  const { sourceLesson } = lessonMoveInfo || {};
  return (sourceLesson?.dayOfWeek === dayOfWeek && sourceLesson?.period === period)
};

const checkExchangeTarget = (dayOfWeek: number, period: number, lessonMoveInfo: LessonMoveInfo | undefined) => {
  const { targetPeriod } = lessonMoveInfo || {};
  return (targetPeriod?.dayOfWeek === dayOfWeek && targetPeriod?.period === period);
};

const getTeacherNameById = (teacherId: string | undefined) => {
  if (!teacherId) {
    return '';
  }
  const teacher = teacherMap.value[teacherId];
  return teacher ? teacher.teacherName : '';
};


const getTeacherCourseNames = (teacherId: string | undefined) => {
  if (!teacherId) {
    return '';
  }

  const lessonConfs = lessonConfsMapByTeacher.value[teacherId];
  if (!lessonConfs) {
    return '';
  }
  
  const courseBaseIdSet = new Set<string>();
  lessonConfs.forEach(({courseId}) => {
    const crs = courseContext.courseMap[courseId];    
    if (crs && crs?.courseBaseId) {
      courseBaseIdSet.add(crs.courseBaseId);
    }
  });

  const courseBasesOfTeacher = Array.from(courseBaseIdSet).map(courseBaseId => {
    return courseBaseMap.value[courseBaseId];
  })
  .filter(cb => cb !== undefined)
  .sort((a, b) => (a!.displayedTitle.localeCompare(b!.displayedTitle)));
  return courseBasesOfTeacher.map(cb => cb!.displayedTitle).join(' ');
};


const handleClickTeacher = (teacherId: string) => {
  selectedTeacherId.value = teacherId;
};



const handleClickSubmit = () => {
  props.onSubmit && props.onSubmit();
};

const handleClose = () => {
  props.onCancel();
};
</script>

<style lang="scss" scoped>
// 동시수업(1:1교환) 모달
.exchange-concurrent-direct-modal{  
  ::v-deep{
    .modal__layer{
      height: calc(100% - 48px);
    }
    .modal__content{
      height: calc(100% - 165px);
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
  .selected-teacher{
    padding: 20px 24px 10px 24px;
    button{
      margin-left: 8px;
      margin-bottom: 10px;
      .btn-tertiary{ color:#616161;}
    }
  }
}
</style>