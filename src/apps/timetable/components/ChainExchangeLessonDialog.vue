<template>
  <TimeTableModal size="xl" @close="handleClose" class="exchange-chain-modal">
    <template v-slot:heading>
      {{ title }}
      <p class="smr">
        {{ description }}
      </p>
    </template>
    <template v-slot:content>
      <div  v-for="(timetableReaderInfo, readInfoIdx) in timetableReaderInfos" :key="`paths-${readInfoIdx}`">
        <div  class="form-ctr" v-if="!isOneToOne">
          <input type="radio"
            v-model="selectedPathIndex"
            :id="`path-radio-${readInfoIdx}`"
            :name="`path-radio-${readInfoIdx}`"
            :value="readInfoIdx" />
          <label :for="`path-radio-${readInfoIdx}`" class="mr-10">
            <span>연쇄 교환 {{ readInfoIdx + 1 }}
            </span>
          </label>
          (<span v-for="(info, idx) in timetableReaderInfo"
          :key="`${info.teacherId}-${readInfoIdx}-${idx}`">
            {{ getTeacherNameById(info.teacherId) }}  
            <span v-if="idx < timetableReaderInfo.length - 1">></span>
          </span>)
        </div>
        <div
          class="tb-row teacher-view"
          :class="{
            'gray-box': !isOneToOne,
            'mb-30': readInfoIdx !== timetableReaderInfos.length - 1
          }"
        ><!-- teacher-view : 수정 없는 테이블 뷰-->
          <div class="tb-col" v-for="(info, idx) in timetableReaderInfo"
            :key="`${info.teacherId}-${readInfoIdx}-${idx}`">
            <div class="table-content time-table">
              <div class="h4-tit">
                <h4>{{ getTeacherNameById(info.teacherId) }} 선생님</h4>
                <p class="period"> {{ getTeacherCourseNames(info.teacherId) }}</p>
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
                      :key="`day-header-${readInfoIdx}-${info.teacherId}-${day.dayOfWeek}`">{{ day.title }}</th>
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
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import TimetableTeacherLessonCell from '@/apps/timetable/components/TimetableTeacherLessonCell.vue';
import { computed, inject, ref, watch } from 'vue';
import { ContextKeys, LessonConfContext, LessonContext, TeacherCourseContext, TimetableCourseBaseContext, TimetableCourseContext, TimetableGradeContext, TimetableTeacherContext } from '../contexts';
import { ChainExchangeable, Lesson, LessonMoveInfo } from '../core/types';
import { ActivateWeekday } from '../common/types';
import { ClassDayStatus, DAILY_SCHEDULE_DEFAULTS, DAYS_OF_WEEK } from '../common/constants';
import path from 'path';


interface TimetableReaderInfo {
  teacherId?: string;
  lessons?: Lesson[];
  lessonMoveInfo?: LessonMoveInfo;
}

const props = defineProps<{
  chainExchangeableResult: ChainExchangeable | null;
  onCancel: () => void;
  onSubmit: (selectedPathIndex: number) => void;
}>();

const selectedPathIndex = ref(0);

const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const courseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;

const teacherMap = computed(() => teacherContext.teacherMap);
const lessonsByTeacher = computed(() => lessonContext.lessonsByTeacher);
const courseBaseMap = computed(() => courseBaseContext.courseBaseMap);
const lessonConfsMapByTeacher = computed(() => lessonConfContext.lessonConfsMapByTeacher);

const isOneToOne = computed(() => {
  // 1:1 교환인 경우
  return paths.value.length === 1 && props.chainExchangeableResult?.paths[0].length === 2;
});

/*
const paths = computed(() => {
  if (!props.chainExchangeableResult) {
    return [];
  }

  return props.chainExchangeableResult.paths;
});
*/

const paths = ref<Lesson[][]>([]);

watch(
  () => props.chainExchangeableResult,
  (newVal) => {
    console.log('chainExchangeableResult changed', newVal);



    paths.value = newVal?.paths || [];
  },
  { immediate: true }
);

const title = computed(() => {
  if (isOneToOne.value) {
    return '수업 변경(1:1 교환)';
  }
  return `수업 변경(연쇄교환)`;
});

const description = computed(() => {
  if (isOneToOne.value) {
    return '선택한 수업을 교환합니다.';
  }
  return '연쇄 교환을 통해 선택한 수업을 교환합니다.';
});


/*
const timetableReaderInfos = computed(() => {

  return paths.value.map((path) => {
    return path.map((sourceLesson, index) => {
      // 2025.02.04, 현재는 복수 교사인 경우 무시, 첫번째 교사의 정보로 조회
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
    });
  });
});
*/

const timetableReaderInfos = computed(() => {

  return paths.value.map((path) => {

    const pathForSort = path.map((sourceLesson, index) => {
      // 2025.02.04, 현재는 복수 교사인 경우 무시, 첫번째 교사의 정보로 조회
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
    });

    // 역순 정렬
    if( pathForSort.length < 3){
      return pathForSort;
    }
    
    const src = pathForSort.shift();
    pathForSort.reverse();
    pathForSort.unshift(src!);

    return pathForSort;
  });
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

const adjustDisplayedPeriod = (period: number) => {
  return period + (startPeriod.value -1);
};

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

const getTeacherNameById = (teacherId: string | undefined) => {
  if (!teacherId) {
    return '';
  }
  const teacher = teacherMap.value[teacherId];
  return teacher ? teacher.teacherName : '';
};

const checkExchangeSource = (dayOfWeek: number, period: number, lessonMoveInfo: LessonMoveInfo | undefined) => {
  const { sourceLesson } = lessonMoveInfo || {};
  return (sourceLesson?.dayOfWeek === dayOfWeek && sourceLesson?.period === period)
};

const checkExchangeTarget = (dayOfWeek: number, period: number, lessonMoveInfo: LessonMoveInfo | undefined) => {
  const { targetPeriod } = lessonMoveInfo || {};
  return (targetPeriod?.dayOfWeek === dayOfWeek && targetPeriod?.period === period);
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

  /*
  const teacherCourses = teacherCourseMap.value[teacherId];
  if (!teacherCourses) {
    return '';
  }

  return teacherCourses.map(({courseId}) => {
    const course = courseContext.courseMap[courseId];
    return course ? course.displayedTitle : '';
  }).sort().join(' ');
  */
};


const handleClickSubmit = () => {
  props.onSubmit && props.onSubmit(selectedPathIndex.value);
};

const handleClose = () => {
  // console.log('handleClose');
  props.onCancel();
};
</script>
<style scoped lang="scss">
.exchange-chain-modal{
  ::v-deep .modal__content{
    margin-top: 24px;
  }
  .gray-box{
    background-color: #F8F9FC;
  }
  input[type=radio] + label span{
    font-size: 16px;
    font-weight: 600;
  }
  .form-ctr{
    font-size: 16px;
    font-weight: 600;
  }
}
</style>