<template>
  <TimeTableModal size="xl" @close="handleClose" class="exchange-consecutive-modal">
    <template v-slot:heading>
      수업 변경 (연속수업)
      <p class="smr">
        선택한 수업을 교환합니다
      </p>
    </template>
    <template v-slot:content>
      <div v-for="(info, infoIdx) in exchangeInfos" :key="`consecutive-exchange-info-${infoIdx}`" class="exchange-consecutive-table">
        <div v-if="exchangeInfos.length > 1" class="form-ctr">
          <input type="radio"
            v-model="selectedIndex"
            :id="`info-radio-${infoIdx}`"
            :name="`info-radio-${infoIdx}`"
            :value="infoIdx" />
          <label :for="`info-radio-${infoIdx}`">
            <span>연속 수업 맞교환 {{ infoIdx + 1 }}</span>
          </label>
        </div>
        <div class="tb-row teacher-view gray-box"><!-- teacher-view : 수정 없는 테이블 뷰-->              
          <div class="tb-col">
            <div class="table-content time-table">
              <div class="h4-tit">
                <h4>{{ getTeacherNamesOfLesson(info.sourceLessons && info.sourceLessons[0] || undefined).join(', ') }} 선생님</h4>
                <p class="period">{{ getTeacherCourseNamesOfLesson(info.sourceLessons && info.sourceLessons[0] || undefined)  }}</p>
              </div>
              <table>
                <caption>시간표</caption>
                <colgroup>
                  <col style="width: 10%;" />
                <col v-for="dayIdx in activatedClassDaysCount" :key="`day-col-${dayIdx}-${infoIdx}-source`" :style="`width: ${activatedClassDaysWidthPercent};`" />
                </colgroup>
                <thead>
                  <tr>
                    <th></th>
                    <th v-for="day in activatedClassDays"
                      :key="`day-header-${startLesson?.lessonId}-${day.dayOfWeek}`">{{ day.title }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="period in maxPeriod" :key="`period-${startLesson?.lessonId}-${period}`">
                    <td class="th">{{ adjustDisplayedPeriod(period) }}</td>
                    <td v-for="day in activatedClassDays"
                      :key="`lesson-cell-${day.dayOfWeek}-${period}`">
                      <timetable-teacher-lesson-cell
                        :day-of-week="day.dayOfWeek"
                        :period="period"
                        :lesson="getLessonOfSource(day.dayOfWeek, period, info)"
                        :is-exchange-source="checkExchangeSourceOfSourceLesson(day.dayOfWeek, period, info)"
                        :is-exchange-target="checkExchangeTargetOfSourceLesson(day.dayOfWeek, period, info)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-for="(targetMoveInfo, targetIdx) in (info.targetLessonMoveInfos && info.targetLessonMoveInfos[0])" class="tb-col" :key="`target-col-${infoIdx}-${targetIdx}`">
            <div class="table-content time-table">
              <div class="h4-tit">
                <h4>{{ getTeacherNamesOfLesson(targetMoveInfo.sourceLesson).join(', ') }} 선생님</h4>
                <p class="period"> {{ getTeacherCourseNamesOfLesson(targetMoveInfo.sourceLesson) }}</p>
              </div>
              <table>
                <caption>시간표</caption>
                <colgroup>
                  <col style="width: 10%;" />
                <col v-for="dayIdx in activatedClassDaysCount" :key="`day-col-${dayIdx}-${infoIdx}-${targetIdx}-target`" :style="`width: ${activatedClassDaysWidthPercent};`" />
                </colgroup>
                <thead>
                  <tr>
                    <th></th>
                    <th v-for="day in activatedClassDays"
                      :key="`day-header-${infoIdx}-${targetIdx}-${day.dayOfWeek}`">{{ day.title }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="period in maxPeriod" :key="`period-${infoIdx}-${targetIdx}-${period}`">
                    <td class="th">{{ adjustDisplayedPeriod(period) }}</td>
                    <td v-for="day in activatedClassDays"
                      :key="`lesson-cell-${infoIdx}-${targetIdx}-${day.dayOfWeek}-${period}`">
                      <timetable-teacher-lesson-cell
                        :day-of-week="day.dayOfWeek"
                        :period="period"
                        :lesson="getLessonByTeacherAndPeriod(day.dayOfWeek, period, targetMoveInfo)"
                        :is-exchange-source="checkExchangeSource(day.dayOfWeek, period, targetMoveInfo)"
                        :is-exchange-target="checkExchangeTarget(day.dayOfWeek, period, targetMoveInfo)"
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
import { ContextKeys, LessonConfContext, LessonContext, TeacherCourseContext, TimetableCourseContext, TimetableGradeContext, TimetableTeacherContext } from '../contexts';
import { ConsecutiveCourseExchangeInfo, Course, Lesson, LessonMoveInfo, PeriodTuple, TeacherCourse } from '../core/types';
import { ClassDayStatus, DAILY_SCHEDULE_DEFAULTS, DAYS_OF_WEEK } from '../common/constants';
import { ActivateWeekday } from '../common/types';


const props = defineProps<{
  consecutiveCourseExchangeInfo: ConsecutiveCourseExchangeInfo | null;
  onCancel: () => void;
  onSubmit: (selectedIndex: number) => void;
}>();

const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;

const teacherMap = computed(() => teacherContext.teacherMap);
const lessonsByTeacher = computed(() => lessonContext.lessonsByTeacher);
const teacherCourseMap = computed(() => teacherCourseContext.teacherCourseMap);
const courseMap = computed(() => courseContext.courseMap);
const lessonConfCourseIdsByTeacher = computed(() => lessonConfContext.lessonConfCourseIdsByTeacher);

const selectedIndex = ref(0);

const sourceLessons = computed(() => {
  if (!props.consecutiveCourseExchangeInfo) {
    return [];
  }
  return props.consecutiveCourseExchangeInfo.sourceLessons || [];
});

const startLesson = computed(() => {
  return sourceLessons.value.length > 0 ? sourceLessons.value[0] : null;
});

const maxPeriod = computed(() => {
  return gradeContext.timetableConfig.maxPeriod || DAILY_SCHEDULE_DEFAULTS.maxPeriod;
});

const startPeriod = computed(() => {
  return gradeContext.startPeriod;
});

// 각 타겟 케이스 별로 분리
const exchangeInfos = computed(() => {
  if (!props.consecutiveCourseExchangeInfo) {
    return [];
  }

  const { dayOfWeek, periods, sourceLessons } = props.consecutiveCourseExchangeInfo;
  return props.consecutiveCourseExchangeInfo.targetLessonMoveInfos?.map((info => {
    return {
      dayOfWeek,
      periods,
      sourceLessons,
      targetLessonMoveInfos: [info],
    } as ConsecutiveCourseExchangeInfo;
  })) || [];
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

const getLessonOfSource = (
  dayOfWeek: number,
  period: number,
  info: ConsecutiveCourseExchangeInfo
) => {
  const { sourceLessons } = info;
  const targetTuples= info.periods.map(p => [info.dayOfWeek, p] as PeriodTuple);

  const teacherId = startLesson.value?.lessonTeachers && startLesson.value.lessonTeachers[0].teacherId;

  if(targetTuples.some(t => t[0] === dayOfWeek && t[1] === period)) {
    const idx = info.periods.findIndex(p => p === period);
    return sourceLessons && sourceLessons[idx] || undefined;
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

const checkExchangeSourceOfSourceLesson = (
  dayOfWeek: number,
  period: number,
  info: ConsecutiveCourseExchangeInfo,
) => {
  const sourceTuples = info.sourceLessons?.map((lesson) => [lesson.dayOfWeek, lesson.period] as PeriodTuple) || [];
  return sourceTuples.some(t => t[0] === dayOfWeek && t[1] === period)
};

const checkExchangeTargetOfSourceLesson = (
  dayOfWeek: number,
  period: number,
  info: ConsecutiveCourseExchangeInfo,
) => {
  const targetTuples= info.periods.map(p => [info.dayOfWeek, p] as PeriodTuple);
  return targetTuples.some(t => t[0] === dayOfWeek && t[1] === period)
};

const getTeacherNamesOfLesson = (
  lesson: Lesson | undefined
) => {
  if(!lesson || !lesson.lessonTeachers) {
    return [];
  }

  return lesson.lessonTeachers.map(({ teacherId }) => {
    return teacherId ? teacherMap.value[teacherId].teacherName : null;
  })
  .filter(t => t !== null) as string[];
};

const getTeacherCourseNamesOfLesson = (
  lesson: Lesson | undefined
) => {
  if(!lesson || !lesson.lessonTeachers) {
    return '';
  }

  const courseNames = lesson.lessonTeachers.map(({ teacherId }) => {
    return getTeacherCourseNames(teacherId).join(', ');
  })
  .filter(t => t !== '');

  return courseNames.join(' ');
};

const getTeacherCourseNames = (teacherId: string | undefined) => {
  if (!teacherId) {
    return [];
  }

  const courses = lessonConfCourseIdsByTeacher.value[teacherId].map((courseId) => {
    return courseMap.value[courseId] as Course | undefined;
  })
  .filter((c: Course | undefined) => c !== undefined);

  // 중복되는 courseName을 제거하고 반환
  const uniqueCourseNames = Array.from(new Set(courses.map(course => course.displayedTitle)));
  return uniqueCourseNames;
};

const getLessonByTeacherAndPeriod = (
  dayOfWeek: number,
  period: number,
  lessonMoveInfo?: LessonMoveInfo
) => {
  const { sourceLesson, targetPeriod } = lessonMoveInfo || {};
  if (targetPeriod?.dayOfWeek === dayOfWeek && targetPeriod?.period === period) {
    return sourceLesson;
  }

  const teacherId = sourceLesson?.lessonTeachers && sourceLesson.lessonTeachers[0].teacherId;
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


onMounted(() => {
  // console.log('Concurrent Course Exchangeable Results:', exchangeInfos.value);  
});


const handleClickSubmit = () => {
  props.onSubmit && props.onSubmit(selectedIndex.value);
};

const handleClose = () => {
  props.onCancel();
};
</script>

<style scoped lang="scss">
.exchange-consecutive-table + .exchange-consecutive-table{margin-top: 20px ;}
input[type=radio] + label span {
  font-size: 16px;
  font-weight: 600;
}
</style>