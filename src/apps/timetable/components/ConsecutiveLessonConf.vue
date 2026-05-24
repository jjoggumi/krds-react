<template>
  <section>
    <div class="consecutive-lesson-conf mt-20">
      <div class="table-head j-right sticky">
        <div class="btn-area">
          <button
            type="button"
            class="btn btn-tertiary"
            @click="handleClickDeleteSelectedConfs"
            :disabled="!hasChecked"
          >
            선택 삭제하기
          </button>
          <button type="button" class="btn btn-primary"
            @click="openDialog">
            연속 수업 등록
          </button>
        </div>
      </div>
      <div class="table-content table-form">
        <table>
          <colgroup>
            <col style="width: 10%" />
            <col style="width: 15%" />
            <col style="width: 20%" />
            <col style="width: 15%" />
            <col style="width: 15%" />
            <col style="width: 15%" />
            <col style="width: 10%" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">
                <div class="form-check">
                  <input
                    type="checkbox"
                    id="consecutiveConfAllChecked"
                    v-model="isSelectedAllRows"
                    @change="toggleAllChecked"
                  />
                  <label for="consecutiveConfAllChecked"></label>
                </div>
              </th>
              <th>과목명</th>
              <th>교사명</th>
              <th>학년</th>
              <th>시수</th>
              <th>연속 시수</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in consecutiveConfItems"
              :key="item.consecutiveConfId || index"
            >
              <td>
                <input
                  type="checkbox"
                  v-model="item.isChecked"
                  :id="`consecutiveCourses-${index}`"
                  @click="handleClickChecked(item)"
                />
                <label :for="`consecutiveCourses-${index}`"></label>
              </td>
              <td>{{ item.displayedTitle }}</td>
              <td>{{ item.teacherName }}</td>
              <td>{{ item.grade }}</td>
              <td>
                {{ item.periodCount }}
              </td>
              <td>
                <consecutive-select
                  :periodCount="item.periodCount ? item.periodCount : 1"
                  :init-value="item.consecutivePeriod"
                  :isConsecutiveTab="true"
                  :onChange="(val) => handleChangeConsecutivePeriod(item, val)"
                />
              </td>
              <td>
                <button type="button" @click="handleClickDelete(item)">
                  <i class="ico ico-trash ico-size-20 ico-gray"></i>
                </button>
              </td>
            </tr>
            <tr v-if="consecutiveConfItems.length === 0">
              <td></td>
              <td>
                <button type="button" class="btn-table-cell" @click="openDialog">선택</button>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <consecutive-lesson-confs-dialog
        :show-dialog="showConsecutiveLessonConfsDialog"
        :on-cancel="handleClickCancelDialog"
        :on-submit="handleClickSubmitDialog"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  ContextKeys,
  ConsecutiveConfContext,
  LessonConfContext,
  TimetableCourseContext,
  TimetableProgressContext,
  LessonContext
} from '../contexts';

import { computed, onMounted, ref, inject } from 'vue';
import {
  ConsecutiveConf,
  Course
} from '@/apps/timetable/core/types';
import ConsecutiveSelect from '@/apps/timetable/components/ConsecutiveSelect.vue';
import ConsecutiveLessonConfsDialog from '@/apps/timetable/components/ConsecutiveLessonConfsDialog.vue';
import { useDialog } from '@/apps/timetable/composables/dialog';

// defineOptions({  name: 'ConsecutiveLessonConf',});

interface ConsecutiveConfItem extends ConsecutiveConf, Course {
  isChecked: boolean;
}

const dialog = useDialog();
const showConsecutiveLessonConfsDialog = ref(false);
const isSelectedAllRows = ref(false);
const hasChecked = ref(false);

const consecutiveConfContext = inject(ContextKeys.ConsecutiveConf) as ConsecutiveConfContext;
const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;

const assignedClassLessonCount = computed(() => progressContext?.assignedClassLessonCount || 0);

const consecutiveConfItems = computed<Array<ConsecutiveConfItem>>(() => {
  return consecutiveConfContext.consecutiveConfs.map((conf) => {
    const course = courseContext.courses.find(
      (c: Course) => c.courseId === conf.courseId
    ) || {} as Course;

    return {
      ...conf,
      ...course,
      isChecked: false,
    };
  });
});

onMounted(async () => {
  await initData();
});

const initData = async () => {
  await lessonConfContext.load();
  await consecutiveConfContext.load();
  // await initCourses();
  // await initTeachers();
  // await initCourseTeachers();
  // await initConsecutiveConfs();
};

const openDialog = async() => {
  if(await confirmLessonDelete(undefined, '수업을 추가하시겠습니까?') === false) {
    return;
  }

  showConsecutiveLessonConfsDialog.value = true;
};

const toggleAllChecked = () => {
  consecutiveConfItems.value.forEach((item) => item.isChecked = isSelectedAllRows.value);
  hasChecked.value = isSelectedAllRows.value;
};

const handleClickDeleteSelectedConfs = async () => {
  const selectedIndices = consecutiveConfItems.value
    .map((item, idx) => (item.isChecked ? idx : -1))
    .filter(idx => idx !== -1);

  if (selectedIndices.length === 0) {
    await dialog.alertSimple('삭제할 연속 수업을 선택해주세요.');
    return;
  }

  if (!(await confirmLessonDelete('선택한 수업을 삭제하시겠습니까?', '수업을 삭제하시겠습니까?'))) {
    return;
  }

  const idsToDelete = selectedIndices
    .map(idx => consecutiveConfItems.value[idx]?.consecutiveConfId)
    .filter(id => id && id.trim().length > 0) as string[];

  selectedIndices.sort((a, b) => b - a).forEach(idx => {
    consecutiveConfContext.consecutiveConfs.splice(idx, 1);
  });

  if (idsToDelete.length > 0) {
    await consecutiveConfContext.deleteConsecutiveConfs(idsToDelete);
  }

  isSelectedAllRows.value = false;
  hasChecked.value = false; 
  await consecutiveConfContext.reload();
  await doAfterModify();
};

const handleClickChecked = (item: ConsecutiveConfItem) => {
  item.isChecked = !item.isChecked;
  hasChecked.value = consecutiveConfItems.value.some((item) => item.isChecked);
  isSelectedAllRows.value = consecutiveConfItems.value.every((item) => item.isChecked);
};

const handleChangeConsecutivePeriod = async (
  conf: ConsecutiveConfItem,
  period: string
) => {
  if(await confirmLessonDelete(undefined, '연속 시수를 변경하시겠습니까?') === false) {
    return;
  }

  conf.consecutivePeriod = period;
  const consecutiveConf = itemToConsecutiveConf(conf) as ConsecutiveConf;

  await consecutiveConfContext.updateConsecutivePeriodToConf(
    consecutiveConf.consecutiveConfId, consecutiveConf.consecutivePeriod
  );

  await doAfterModify();
};

const itemToConsecutiveConf = (item: ConsecutiveConfItem): ConsecutiveConf => {
  return {
    consecutiveConfId: item.consecutiveConfId,
    courseId: item.courseId,
    grade: item.grade,
    teacherId: item.teacherId,
    consecutivePeriod: item.consecutivePeriod,
  };
};

const handleClickDelete = async (conf: ConsecutiveConfItem) => {
  if (!(await confirmLessonDelete('선택한 수업을 삭제하시겠습니까?', '수업을 삭제하시겠습니까?'))) {
    return;
  }

  await consecutiveConfContext.deleteConsecutiveConfs([conf.consecutiveConfId]);

  isSelectedAllRows.value = false;
  hasChecked.value = false;
  
  await doAfterModify();
};

const handleClickSubmitDialog = async () => {
  showConsecutiveLessonConfsDialog.value = false;
  await consecutiveConfContext.reload();
};

const handleClickCancelDialog = () => {
  showConsecutiveLessonConfsDialog.value = false;
};

const doAfterModify = async () => {
  if(assignedClassLessonCount.value > 0) {
    await progressContext.reload();
    await lessonContext.reload();
  }
};

const confirmLessonDelete = async (simpleMsg?: string, delLessonMsg?: string) => {
  if(assignedClassLessonCount.value === 0 ) {
    return simpleMsg ? await dialog.confirmSimple(simpleMsg) : true;
  }
  
  const msg = `${delLessonMsg}<br />7단계에 배정된 수업이 모두 초기화됩니다.`;

  return await dialog.confirm(`
    ${msg}
    <div class="blue-box"> 
      <i class="hi-ico ico-primary ico-warning-circle-fill ico-size-18"></i>
      동시, 연속, 특별실 등 부가 정보가 변경될 경우 <strong>7단계에서 작성한 데이터</strong>가 삭제될 수 있습니다.
    </div>      
    `, null, {
      customClass: 'timetable-confirm',
      showCloseButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소'
  });

};

</script>

<style scoped lang="scss">
.consecutive-lesson-conf{
  .table-head {
    &.sticky {
      padding: 20px 0 12px 0;
    }
    .btn-area {
      gap: 8px;
    }
  }
  .btn-table-cell{
    color: var(--gray-07);
    //background: #F8FAFF;
    font-size: 14px;
    &:hover{
      box-shadow: 0 0 0 1px #8EA4D1;
      background: #F8FAFF !important;
    }
  }
  // .hi-selectbox{
  //   ::v-deep .selected{
  //     padding: 11px 35px 11px 35px;
  //   }
  // }
}
</style>
