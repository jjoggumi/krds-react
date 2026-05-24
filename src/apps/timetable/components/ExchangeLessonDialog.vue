<template>
  <q-dialog
    v-model="isShowModal"
    :custom-class="'exchange-q-dialog'"
    @hide="handleHideDialog"
  >
    <q-card class="column full-height full-width">
      <q-card-section>
        <div class="text-h5 text-bold">시간표 변경</div>
      </q-card-section>

      <q-card-section class="col q-pt-none scroll-y">
        <div
          v-for="(timetableReaderInfo, readInfoIdx) in timetableReaderInfos"
          class="timetables-row"
          :key="`reader-info-${readInfoIdx}`"
        >
          <div class="row q-pt-md flex-1 text-bold text-subtitle1 contents-row">
            <q-radio
              size="md"
              v-model="selectedPathIndex"
              :val="readInfoIdx"
              :label="`${
                timetableReaderInfo.length > 2 ? '연쇄 이동' : '맞교환'
              } ${readInfoIdx + 1}`"
            />
            <span></span>
          </div>
          <div class="row flex-1 text-center contents-row">
            <teacher-timetable-reader
              v-for="(info, idx) in timetableReaderInfo"
              :teacher-id="info.teacherId"
              :lessons="info.lessons"
              :lesson-move-info="info.lessonMoveInfo"
              :key="`${info.teacherId}-${readInfoIdx}-${idx}`"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-section class="q-mt-lg q-pl-lg">
        <div class="text-subtitle1 text-weight-bold">
          선택하신 시간으로 이동 시 위와 같이 시간표가 변경됩니다.
        </div>
      </q-card-section>
      <q-card-actions align="center" class="q-pb-md">
        <q-btn
          flat
          size="md"
          label="취 소"
          class="bg-white text-grey q-mr-lg"
          @click="handleClose"
        />
        <q-btn
          flat
          label="변경하기"
          class="bg-white text-teal"
          @click="handleClickSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// quasar 를 흉내낸 임시 컴포넌트 -->
import QBtn from '@/apps/timetable/q-temp/QBtn.vue';
import QDialog from '@/apps/timetable/q-temp/QDialog.vue';
import QCard from '@/apps/timetable/q-temp/QCard.vue';
import QCardSection from '@/apps/timetable/q-temp/QCardSection.vue';
import QCardActions from '@/apps/timetable/q-temp/QCardActions.vue';
import QRadio from '@/apps/timetable/q-temp/QRadio.vue';
// <-- quasar 를 흉내낸 임시 컴포넌트

import TeacherTimetableReader from '@/apps/timetable/components/TeacherTimetableReader.vue';
import {
  ChainExchangeable,
  Lesson,
  LessonMoveInfo,
} from '@/apps/timetable/core/types';
import { computed, inject, ref, watch } from 'vue';
import { ContextKeys, LessonContext } from '../contexts';

const props = defineProps<{
  showExchangeDialog: boolean;
  chainExchangeableResult: ChainExchangeable | null;
  onCancel: () => void;
  onSubmit: (selectedPathIndex: number) => void;
}>();

const isShowModal = ref(false);
const selectedPathIndex = ref(0);

const lessonContext = inject(ContextKeys.Lesson) as LessonContext;
const lessonsByTeacher = computed(() => lessonContext.lessonsByTeacher);

watch(
  () => props.showExchangeDialog,
  (value) => {
    isShowModal.value = value;
  }
);

watch(
  () => isShowModal.value,
  (value) => {
    isShowModal.value = value;
  }
);

const countPaths = computed(() => {
  if (!props.chainExchangeableResult) {
    return 0;
  }

  return props.chainExchangeableResult.paths.length;
});

const paths = computed(() => {
  if (!props.chainExchangeableResult) {
    return [];
  }

  return props.chainExchangeableResult.paths;
});

const moveInfos = computed(() => {
  return paths.value.map((path, index) => {
    const targetIndex = paths.value.length > index ? index + 1 : 0;
    const targetLesson = path[targetIndex];

    return {
      sourceLesson: path[0],
      targetPeriod: {
        dayOfWeek: targetLesson.dayOfWeek,
        period: targetLesson.period,
      },
    } as LessonMoveInfo;
  });
});

interface TimetableReaderInfo {
  teacherId?: string;
  lessons?: Lesson[];
  lessonMoveInfo?: LessonMoveInfo;
}

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

const handleClickSubmit = () => {
  props.onSubmit && props.onSubmit(selectedPathIndex.value);
};

const handleClose = () => {
  props.onCancel && props.onCancel();
};

const handleHideDialog = () => {
  props.onCancel && props.onCancel();
};
</script>

<style scoped>
.exchange-q-dialog {
  width: 80%;
  height: 80%;
}

.timetables-row {
  margin-top: 10px;
  padding-bottom: 10px;
}
</style>

<style>
.exchange-q-dialog {
  width: 95% !important;
  height: 95% !important;
}
</style>