
<template>
  <q-dialog v-model="isShowModal" @hide="handleHideDialog">
    <q-card class="column full-width q-pa-lg">
      <q-card-section>
        <div class="text-h5 text-bold">동시수업 수업 수정</div>
        <div class="text-subtitle2 q-mt-md">
          동시수업의 배정 불가인 교사의 수업을 맞교환하거나 넘깁니다. 변경된
          교사의 전체 시수 및 시수표가 변경됩니다.
        </div>
      </q-card-section>

      <q-card-section class="col q-pt-none">
        <div class="row">
          <div class="col-5">
            <div class="row q-mt-md">
              <div class="col-4 text-subtitle1 text-weight-bold text-label">
                담당교사
              </div>
              <div class="col-8 q-px-md">
                <q-input
                  dense
                  borderless
                  v-model="selectedTeacherName"
                  class="bg-grey-3 q-px-sm selected-input"
                  readonly
                />
              </div>
            </div>
            <div class="row q-mt-md">
              <div class="col-4 text-subtitle1 text-weight-bold text-label">
                과목명
              </div>
              <div class="col-8 q-px-md">
                <q-input
                  dense
                  borderless
                  v-model="selectedCourseName"
                  class="bg-grey-3 q-px-sm selected-input"
                  readonly
                />
              </div>
            </div>
            <div class="row q-mt-md">
              <div class="col-4 text-subtitle1 text-weight-bold text-label">
                학급
              </div>
              <div class="col-8 q-px-md">
                <q-input
                  dense
                  borderless
                  v-model="selectedClassName"
                  class="bg-grey-3 q-px-sm selected-input"
                  readonly
                />
              </div>
            </div>
          </div>
          <div class="col-2 flex flex-center" v-if="isTargetExchange">
            <q-icon name="swap_horiz" size="50px" class="text-teal q-mt-md" />
          </div>
          <div class="col-2 flex flex-center" v-else>
            <q-icon
              name="arrow_back"
              v-if="!isTargetExchange"
              size="50px"
              class="text-teal q-mt-md rotate-180"
            />
          </div>
          <div class="col-5 justify-center">
            <div class="row q-mt-md">
              <div class="col-4 text-subtitle1 text-weight-bold text-label">
                담당교사
              </div>
              <div class="col-8 q-px-md">
                
                <q-select
                  dense
                  v-model="targetTeacherId"
                  :options="targetTeacherOptions"
                  :option-value="(opt) => opt.teacherId"
                  :option-label="(opt) => opt.teacherName"
                  map-options
                  emit-value
                  class="q-px-sm targeted-input"
                />
              </div>
            </div>
            <div v-if="isTargetExchange" class="row q-mt-md">
              <div class="col-4 text-subtitle1 text-weight-bold text-label">
                과목명
              </div>
              <div class="col-8 q-px-md">
                
                <q-select
                  dense
                  v-model="targetCourseId"
                  :options="targetCourseOptions"
                  :option-value="(opt) => opt.courseId"
                  :option-label="(opt) => opt.displayedTitle"
                  map-options
                  emit-value
                  class="q-px-sm targeted-input"
                />
              </div>
            </div>
            <div v-if="isTargetExchange" class="row q-mt-md">
              <div class="col-4 text-subtitle1 text-weight-bold text-label">
                학급
              </div>
              <div class="col-8 q-px-md">
                <q-select
                  dense
                  v-model="targetClassId"
                  :options="targetClassOptions"
                  :option-value="(opt) => opt.classId"
                  :option-label="(opt) => `${opt.grade}-${opt.classNumber}`"
                  map-options
                  emit-value
                  class="q-px-sm targeted-input"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <q-card-section horizontal class="q-pt-md col flex flex-center">
            <div class="q-gutter-sm q-mt-md">
              <q-radio
                v-model="isTargetExchange"
                :val="true"
                label="맞교환"
                class="q-mr-xl text-subtitle1"
              />
              <q-radio
                v-model="isTargetExchange"
                :val="false"
                label="넘김"
                class="text-subtitle1"
              />
            </div>
          </q-card-section>
        </div>
      </q-card-section>
      <q-card-section class="q-mt-lg q-pl-lg">
        <div class="text-subtitle1"></div>
      </q-card-section>
      <q-card-actions align="center" class="q-pb-md">
        <q-btn
          flat
          size="md"
          label="취 소"
          class="bg-white text-grey q-mr-lg text-subtitle1"
          @click="handleClose"
        />
        <q-btn
          flat
          label="변경하기"
          class="bg-white text-teal text-subtitle1"
          @click="handleClickSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>


<script setup lang="ts">
// quasar 를 흉내낸 임시 컴포넌트 -->
import QCard from '@/apps/timetable/q-temp/QCard.vue';
import QCardSection from '@/apps/timetable/q-temp/QCardSection.vue';
import QCardActions from '@/apps/timetable/q-temp/QCardActions.vue';
import QBtn from '@/apps/timetable/q-temp/QBtn.vue';
import QInput from '@/apps/timetable/q-temp/QInput.vue';
import QDialog from '@/apps/timetable/q-temp/QDialog.vue';
import QIcon from '@/apps/timetable/q-temp/QIcon.vue';
import QSelect from '@/apps/timetable/q-temp/QSelect.vue';
import QRadio from '@/apps/timetable/q-temp/QRadio.vue';
// <-- quasar 를 흉내낸 임시 컴포넌트


import { Class, LessonConf } from '@/apps/timetable/core/types';
import { computed, onMounted, ref, watch, inject } from 'vue';
import {
  ContextKeys,
  LessonConfContext,
  TimetableClassContext,
  TimetableCourseContext,
  TimetableTeacherContext
} from '../contexts';

const props = defineProps<{
  selectedExchangeLessonConf: LessonConf | null;
  onSubmit?: (
    teacherId: string,
    courseId: string | null,
    classId: string | null
  ) => void;
  onCancel?: () => void;
}>();

const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext
const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;

const isShowModal = ref(true);
const targetTeacherId = ref<string | null>("");
const targetCourseId = ref<string | null>("");
const targetClassId = ref<string | null>("");
const targetLessonConf = ref<LessonConf | null>(null);
const isTargetExchange = ref(true);

const teachers = computed(() => teacherContext.teachers);
const courses = computed(() => courseContext.courses);
const classMap = computed(() => classContext.classMap);
const lessonConfs = computed(() => lessonConfContext.lessonConfs);

const selectedTeacherName = computed(() => {
  const selectedTeacher = teachers.value.find((teacher) => {
    return (props.selectedExchangeLessonConf && 
      teacher.teacherId === props.selectedExchangeLessonConf.teacherId);
  });
  return selectedTeacher ? selectedTeacher.teacherName : '';
});

const selectedCourseName = computed(() => {
  if (!props.selectedExchangeLessonConf) {
    return '';
  }

  const selectedCourse = courses.value.find((course) => {
    return (props.selectedExchangeLessonConf && 
      course.courseId === props.selectedExchangeLessonConf.courseId);
  });

  return selectedCourse ? selectedCourse.displayedTitle : '';
});

const selectedClassName = computed(() => {
  if (!props.selectedExchangeLessonConf || !classMap.value) {
    return '';
  }

  const selectedClass = classMap.value[
    props.selectedExchangeLessonConf.classId
  ] as Class;

  return selectedClass
    ? `${selectedClass.grade}-${selectedClass.classNumber}`
    : '';
});

const targetTeacherOptions = computed(() => {
  return teachers.value || [];
});

const targetCourseOptions = computed(() => {
  if (!targetTeacherId.value) {
    return [];
  }

  const courseIdSet = new Set<string>(
    lessonConfs.value
      .filter((conf) => {
        return conf.teacherId === targetTeacherId.value;
      })
      .map((conf) => {
        return conf.courseId;
      })
  );

  const crs = courses.value
    .filter((course) => {
      return courseIdSet.has(course.courseId);
    })
    .sort((a, b) => {
      return a.displayedTitle.localeCompare(b.displayedTitle);
    });

  return crs;
});

const targetClassOptions = computed(() => {
  if (!targetTeacherId.value || !targetCourseId.value) {
    return [];
  }

  const classIdSet = new Set<string>(
    lessonConfs.value
      .filter((conf) => {
        return (
          conf.teacherId === targetTeacherId.value &&
          conf.courseId === targetCourseId.value
        );
      })
      .map((conf) => {
        return conf.classId;
      })
  );

  const crs = Array.from(classIdSet)
    .map((classId) => {
      return classMap.value[classId];
    })
    .sort((a, b) => {
      const classA = a as Class;
      const classB = b as Class;

      if (!classA || !classB) {
        return 0;
      }

      const classAName = `${classA.grade}-${classA.classNumber}`;
      const classBName = `${classB.grade}-${classB.classNumber}`;

      return classAName.localeCompare(classBName);
    });

  return crs;
});

/*
watch(
  () => targetTeacherId.value,
  (newVal) => {
    if (newVal) {
      console.log('targetTeacherId', newVal);
    }
  },
  { immediate: true }
);
*/

onMounted(() => {
  initData();
});

const initData = async () => {
  if (props.selectedExchangeLessonConf) {
    targetLessonConf.value = props.selectedExchangeLessonConf;
    console.log('selectedExchangeLessonConf', props.selectedExchangeLessonConf);
  }
};

const handleClickSubmit = () => {
  if (isTargetExchange.value) {
    if (
      !targetTeacherId.value ||
      !targetCourseId.value ||
      !targetClassId.value
    ) {
      return;
    }
  } else if (!targetTeacherId.value) {
    return;
  }

  props.onSubmit &&
    props.onSubmit(
      targetTeacherId.value,
      targetCourseId.value,
      targetClassId.value
    );
};

const handleClose = () => {
  props.onCancel && props.onCancel();
};

const handleHideDialog = () => {
  props.onCancel && props.onCancel();
};
</script>


<style scoped>
.text-label {
  display: flex;
  align-items: center;
  justify-content: right;
}

.selected-input {
  border-radius: 5px;
}
</style>
