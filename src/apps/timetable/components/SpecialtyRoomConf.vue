<template>
  <div class="specialty-room-conf mt-20">
    <div v-if="!specialtyRooms.length" class="no-data">
      <div>
        특별실을 만들고 수업을 등록하세요.
      </div>
      <div class="btn-area">
        <button type="button" class="btn btn-primary btn-ico-left btn-lg" @click="isShowSpecialtyRoomDialog = true">
          <i class="ico ico-plus ico-size-20 mr-05"></i> 특별실 만들기
        </button>
      </div>
    </div>
    <div v-else>
      <div class="table-head sticky">
        <div class="search-area form-group-inline">
          <label>특별실 명</label>
          <div class="form-ctr">            
            <HiSelectBox
              v-model="selectedRoomId"
              :items="roomOptions"
              class="type01"
              @update:value="handleChangeRoom($event)"
              @clickOutside="() => editRoomIdx = -1"
            >
              <template #btnType="{ value }">
                {{ value ? findRoomName(value) : '선택' }}
              </template>

              <template #custom-option="{ items, selectItem }">
                <div class="option-list is-footer">
                  <div
                    v-for="(item, itemIdx) in items"
                    :key="item.value"
                    class="item"
                    :class="{ 'is-selected': item.value === selectedRoomId, 'is-edit':editRoomIdx === itemIdx }"
                  >
                    <div class="option-item" v-if="editRoomIdx !== itemIdx" @click="selectItem(item)">{{ item.title }}</div>
                    <div class="input-wrap" v-if="editRoomIdx === itemIdx">
                      <input
                        type="text"
                        v-model="item.title"
                        maxlength="10"
                        placeholder="특별실 이름을 입력하세요."
                        @input="e => restrictNameInput(e, item)"
                        @keyup.enter="handleSubmitUpdateRoomName(item)"
                        @blur="handleSubmitUpdateRoomName(item)" spellcheck="false"
                      />
                    </div>
                    <div class="btns">                      
                      <button type="button" @click="handleClickChangeEditMode(item, itemIdx)" class="btn-edit" v-if="editRoomIdx !== itemIdx">
                        <i class="ico ico-pen ico-size-20 ico-gray"></i>
                      </button>
                      <!-- <button type="button" @click="handleClickDeleteSpecialtyRoom(item)" class="btn-del ml-10 " v-if="!isFinished && editRoomIdx !== itemIdx">
                        <i class="ico ico-trash ico-size-20 ico-gray"></i>
                      </button> -->
                    </div>
                  </div>
                </div>
                <div class="option-footer">
                  <button class="list-add" @click="isShowSpecialtyRoomDialog = true">
                    <i class="ico ico-plus ico-size-20 ico-primary"></i> 특별실 만들기
                  </button>
                </div>
              </template>
            </HiSelectBox>
          </div>
          <label class="ml-30">최대 배정 학급 수</label>
          <div class="form-ctr">
            <HiSelectBox 
              :value="specialtyRoomMap[selectedRoomId]?.maxClass || 1"
              :items="maxClassOptions"
              @update:value="handleClickUpdateMaxClasses($event)"
              :disabled="isFinished"
            />
          </div>
        </div>
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
            수업 추가하기
          </button>
        </div>
      </div>
      <p class="total-count">
        총 시수 : <strong class="txt-warning">{{ totalPeriodCountOnSelectedRoom }}</strong>
      </p>
      <div class="table-content table-form">
        <table>
          <colgroup>
            <col style="width: 8%" />
            <col style="width: 15%" />
            <col style="width: 15%" />
            <col style="width: 38%" />
            <col style="width: 8%" />
            <col style="width: 8%" />
            <col style="width: 8%" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">
                <div class="form-check">
                  <input
                    type="checkbox"
                    id="specialtyRoomConfAllChecked"
                    v-model="isSelectedAllRows"
                    @change="toggleAllChecked"
                  />
                  <label for="specialtyRoomConfAllChecked"></label>
                </div>
              </th>
              <th scope="col">과목명</th>
              <th scope="col">교사명</th>
              <th scope="col">학급</th>
              <!--<th scope="col">수업시수</th>-->
              <th scope="col">연속시수</th>
              <th scope="col">비고</th>
              <th scope="col">삭제</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, idx) in specialtyRoomConfItems"
              :key="item.specialtyRoomConfId || idx"
            >
              <td>
                <input
                  type="checkbox"
                  v-model="item.isCheck"
                  :id="`filteredSpecialtyRoomConfs-${idx}`"
                  @click="handleClickChecked(item)"
                />
                <label :for="`filteredSpecialtyRoomConfs-${idx}`" />
              </td>
              <td>
                <span class="badge concurrent" v-if="!!item.concurrentCourseId">동시</span> 
                <span class="badge fixed" v-if="false">고정</span> 
                <span class="badge consecutive" v-if="item.isConsecutiveCourse">연속</span> 
                <span class="badge joint" v-if="false">합반</span> 
                {{ item.displayedTitle }}                
              </td>
              <td>{{ item.teacherName }}</td>
              <td class="txt-left p-15">
                <div class="form-check-inline" v-for="(lesConf, index) in item.classLessonConfs" :key="`${lesConf.lessonConfId}-${index}-${lesConf.isCheck ? 'checked' : 'unchecked'}`">
                  <input type="checkbox" :id="`course_${idx}_class_${index}`" v-model="lesConf.isCheck" @change="handleClickOnClass(item.specialtyRoomConfId, lesConf, item)" />
                  <label :for="`course_${idx}_class_${index}`">
                    <span>
                      {{ getClassNameByLessonConf(lesConf) }}
                    </span>
                  </label>
                </div>
              </td>
              <td v-if="false">
                <!-- 2025.10.27 수업 시수 조정 기능 보류: 1차 오픈 이후 고려 -->
                <HiSelectBox
                  class="selectbox-wrap"
                  :class="{'has-selected': item.specialtyRoomPeriodCount }"
                  :value="item.specialtyRoomPeriodCount"
                  emptyTitle="선택"
                  :items="Array.from({ length: Number(item.coursePeriodCount) }, (_, i) => ({
                    value: i + 1,
                    title: `${i + 1}`
                  }))"
                  @update:value="updatePeriodCount(item, $event)"
                />                
              </td>
              <td>
                <consecutive-select
                  :periodCount="item.coursePeriodCount ? item.coursePeriodCount : 1"
                  :init-value="item.consecutivePeriod || ''"
                  :onChange="(val) => handleChangeConsecutivePeriod(item, val)"
                  :disabled="!!item.concurrentCourseId"
                />
              </td>
              <td>
                {{ !!item.concurrentCourseId ? '동시' : '' }}
              </td>
              <td>
                <button type="button" @click="handleClickDeleteSpecialtyRoomConf(item)">
                  <i class="ico ico-trash ico-size-20 ico-gray"></i>
                </button>
              </td>
            </tr>
            <tr v-if="specialtyRoomConfItems.length === 0">
              <td class="form-check"></td>
              <td @click="openDialog" style="cursor: pointer;" class="text-gray">선택</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  
    <specialty-room-dialog
      v-if="isShowSpecialtyRoomDialog"
      :on-submit="handleSubmitSpecialtyRoom"
      @close="closeSpecialtyRoomDialog"
    />

    <specialty-room-conf-dialog
      v-if="isShowSpecialtyRoomConfDialog"
      :on-submit="handleClickSubmitDialog"
      @close="handleClickCancelDialog"
    />
  </div>
</template>

<script setup lang="ts">
import SpecialtyRoomDialog from '@/apps/timetable/components/SpecialtyRoomDialog.vue';
import SpecialtyRoomConfDialog from '@/apps/timetable/components/SpecialtyRoomConfDialog.vue';
import ConsecutiveSelect from '@/apps/timetable/components/ConsecutiveSelect.vue';
import {computed, inject, onMounted, ref, nextTick, reactive} from 'vue';
import {Class, Course, LessonConf, SpecialtyRoom, SpecialtyRoomConf, TimetableStatus,} from '@/apps/timetable/core/types';
import {
  ConcurrentConfContext,
  ConsecutiveConfContext,
  ContextKeys,
  LessonConfContext,
  SpecialtyRoomConfContext,
  SpecialtyRoomContext,
  TeacherCourseContext,
  TimetableClassContext,
  TimetableCourseContext,
  TimetableCourseBaseContext,
  TimetableTeacherContext,
  TimetableProgressContext,
  LessonContext,
} from '../contexts';

import {useDialog} from '@/apps/timetable/composables/dialog';
import HiSelectBox from "@/components/Form/HiSelectBox.vue";
import {createSpecialtyRoomConfService} from '@/apps/timetable/services/specialty-room-conf-service';
import { TimetableDisplayUtils } from '../common/utils';

// defineOptions({  name: 'SpecialtyRoomConf',});

interface SpecialtyRoomClassLessonConf extends LessonConf, Class {
  isCheck: boolean;
}

interface SpecialtyRoomConfItem extends Omit<SpecialtyRoomConf, 'periodCount'>, Omit<Course, 'periodCount'> {
  coursePeriodCount: Course['periodCount'];
  specialtyRoomPeriodCount: SpecialtyRoomConf['periodCount'];
  isCheck: boolean;
  classLessonConfs: SpecialtyRoomClassLessonConf[];
  isConsecutiveCourse?: boolean;
}

const dialog = useDialog();
const selectedRoomId = ref<string>('');
const isShowSpecialtyRoomDialog = ref<boolean>(false);
const selectedMaxClasses = ref<number>(1);
const isShowSpecialtyRoomConfDialog = ref<boolean>(false);
const roomOptions = ref<Array<{ title: string; value: string }>>([]);

const isSelectedAllRows = ref(false);
const hasChecked = ref(false);
const editRoomIdx = ref<number>(-1);

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const consecutiveConfContext = inject(ContextKeys.ConsecutiveConf) as ConsecutiveConfContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const timetableClassContext = inject(ContextKeys.Class) as TimetableClassContext;
const timetableCourseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext;
const timetableCourseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const timetableTeacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const concurrentConfContext = inject(ContextKeys.ConcurrentConf) as ConcurrentConfContext;
const specialtyRoomContext = inject(ContextKeys.SpecialtyRoom) as SpecialtyRoomContext;
const specialtyRoomConfContext = inject(ContextKeys.SpecialtyRoomConf) as SpecialtyRoomConfContext;
const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;

const specialtyRoomConfService = createSpecialtyRoomConfService(
  consecutiveConfContext,
  concurrentConfContext,
  lessonConfContext,
  specialtyRoomContext,
  specialtyRoomConfContext,
  teacherCourseContext,
  timetableClassContext,
  timetableCourseContext,
  timetableCourseBaseContext,
  timetableTeacherContext
);

const assignedClassLessonCount = computed(() => progressContext?.assignedClassLessonCount || 0);

const classMap = computed(() => classContext.classMap as Record<string, Class>);
const lessonConfs = computed(() => lessonConfContext.lessonConfs as Array<LessonConf>);
const courseMap = computed(() => courseContext.courseMap as Record<string, Course>);
const specialtyRooms = computed(() => specialtyRoomContext.specialtyRooms as Array<SpecialtyRoom>);
const specialtyRoomMap = computed(() => specialtyRoomContext.specialtyRoomMap as Record<string, SpecialtyRoom>);

const isFinished = computed(() => progressContext.status === TimetableStatus.Finish);

const totalPeriodCountOnSelectedRoom = computed(() => {
  return specialtyRoomConfItems.value.reduce((total, item) => {
    const periodCountOnItem = item.specialtyRoomPeriodCount * item.classLessonConfs.filter(lesConf => lesConf.isCheck).length;
    total += periodCountOnItem;
    return total;
  }, 0);
})

const maxClassOptions = Array.from({ length: 5 }, (_, i) => ({
  value: i + 1,
  title: `${i + 1}`,
}));

const specialtyRoomConfItems = computed<Array<SpecialtyRoomConfItem>>(() => {

  return specialtyRoomConfContext.specialtyRoomConfs
    .filter((conf) => conf.specialtyRoomId === selectedRoomId.value)
    .map((conf) => {
      const course = courseMap.value[conf.courseId] || {} as Course;

      const includedLessonConfs = lessonConfs.value.filter((lessonConf) => {
        return (
          lessonConf.courseId === conf.courseId && 
          lessonConf.teacherId === conf.teacherId &&
          lessonConf.grade === conf.grade
        );
      });

      const lessonConfsByClassOnEachRow = includedLessonConfs.map((lessonConf) => {
        const clazz = classMap.value[lessonConf.classId];
        const isCheck = lessonConf.specialtyRoomId === conf.specialtyRoomId;

        return {
          ...lessonConf,
          ...clazz,
          isCheck,
        } as SpecialtyRoomClassLessonConf;
      });

      lessonConfsByClassOnEachRow.sort((a, b) => {
        if (a.grade === b.grade) {
          return a.classNumber - b.classNumber;
        }
        return a.grade - b.grade;
      });

      return reactive({
        ...conf,
        ...course,
        coursePeriodCount: course.periodCount,
        specialtyRoomPeriodCount: conf.periodCount ? conf.periodCount : course.periodCount,
        isCheck: false,
        classLessonConfs: lessonConfsByClassOnEachRow,
        isConsecutiveCourse: lessonConfsByClassOnEachRow.some((lessonConf) => !!lessonConf.consecutivePeriod)
      }) as SpecialtyRoomConfItem;
    });
});

// const totalPeriodCountOnSelectedRoom = computed(() => {});

onMounted(async () => {
  await initData();
});

const initData = async () => {
  await specialtyRoomContext.load();
  await specialtyRoomConfContext.load();
  reloadRoomOptions();
  if (specialtyRooms.value.length > 0) {
    selectedRoomId.value = specialtyRooms.value[0].specialtyRoomId;
    selectedMaxClasses.value = specialtyRooms.value[0].maxClass || 1;
  }
};

const reloadRoomOptions = () => {
  roomOptions.value = specialtyRooms.value.map(r => ({
    title: r.roomName,
    value: r.specialtyRoomId
  }));
};

const handleChangeRoom = (specialtyRoomId: string) => {
  selectedRoomId.value = specialtyRoomId;
};

const handleClickUpdateMaxClasses = async (maxClass: number) => {
  if(await confirmLessonDelete(undefined, '최대 학급 배정 수를 변경하시겠습니까?') === false) {
    return;
  }

  await specialtyRoomContext.updateMaxClassOnSpecialtyRoom(selectedRoomId.value, maxClass);

  await doAfterModify();
}

const toggleAllChecked = () => {
  specialtyRoomConfItems.value.forEach((item) => item.isCheck = isSelectedAllRows.value );
  hasChecked.value = isSelectedAllRows.value;
};

const handleClickChecked = (item: SpecialtyRoomConfItem) => {
  item.isCheck = !item.isCheck;
  hasChecked.value = specialtyRoomConfItems.value.some((item) => item.isCheck);
  isSelectedAllRows.value = specialtyRoomConfItems.value.every((item) => item.isCheck);
};

const findRoomName = (specialtyRoomId: string) => {
  return specialtyRooms.value.find(r => r.specialtyRoomId === specialtyRoomId)?.roomName || '';
}

const updatePeriodCount = async (item: SpecialtyRoomConfItem, periodCount: number) => {
  const { consecutivePeriod } = item;
  await specialtyRoomConfContext.updateSpecialtyRoomConf( item.specialtyRoomConfId, { 
    periodCount, 
    consecutivePeriod: consecutivePeriod || null
  });  
  item.specialtyRoomPeriodCount = periodCount;
};

const updateConsecutivePeriod = async (item: SpecialtyRoomConfItem, consecutivePeriod: string) => {
  const { specialtyRoomPeriodCount: periodCount } = item;
  await specialtyRoomConfContext.updateSpecialtyRoomConf( item.specialtyRoomConfId, {
    periodCount,
    consecutivePeriod 
  });
  item.consecutivePeriod = consecutivePeriod;
};

const handleSubmitSpecialtyRoom = async (roomName: string) => {
  closeSpecialtyRoomDialog();
  await createSpecialtyRoom(roomName);
  reloadRoomOptions();
};

const closeSpecialtyRoomDialog = () => {
  isShowSpecialtyRoomDialog.value = false;
};

const createSpecialtyRoom = async (roomName: string) => {
  await specialtyRoomContext.createSpecialtyRoom(roomName);
  reloadRoomOptions();
  selectedRoomId.value = specialtyRooms.value.find(r => r.roomName === roomName)?.specialtyRoomId || '';
};

const handleSubmitUpdateRoomName = async (item: {title: string, value: string}) => {
  if (!item.title || item.title.trim().length === 0) {
    await dialog.alertSimple('특별실 이름을 입력해주세요.');
    return;
  }

  await specialtyRoomContext.updateSpecialtyRoomName(item.value, item.title);
  reloadRoomOptions();
  editRoomIdx.value = -1;
}

const handleClickChangeEditMode = async (item: { value: string; title: string }, idx: number) => {
  if (editRoomIdx.value === idx) {
    await handleSubmitUpdateRoomName(item);
    editRoomIdx.value = -1;
  } else {
    editRoomIdx.value = idx;
  }
};

const handleClickDeleteSpecialtyRoom = async (item: { value: string; title: string }) => {
  // if (!(await dialog.confirmSimple('선택한 특별실을 삭제하시겠습니까?'))) {
  if (!(await confirmLessonDelete('선택한 특별실을 삭제하시겠습니까?', '선택한 특별실을 삭제하시겠습니까?'))) {
    return;
  }
  await specialtyRoomConfService.deleteSpecialtyRoom(item.value);
  await doAfterModify();

  reloadRoomOptions();

  if (selectedRoomId.value === item.value) {
    selectedRoomId.value = roomOptions.value[0]?.value || '';
  }
};

const handleClickDeleteSpecialtyRoomConf = async (item: SpecialtyRoomConfItem) => {
  const existsAssignedClasses = item.classLessonConfs.some(lesConf => lesConf.isCheck);

  if (existsAssignedClasses && !(await confirmLessonDelete('선택한 수업을 삭제하시겠습니까?', '선택한 수업을 삭제하시겠습니까?'))) {
    return;
  }

  await specialtyRoomConfContext.deleteSpecialtyRoomConfs([item.specialtyRoomConfId]);
  await specialtyRoomConfContext.reload();
  await lessonConfContext.reload();
};

const handleClickDeleteSelectedConfs = async () => {
  const selectedConfIds = specialtyRoomConfItems.value
    .filter(item => item.isCheck)
    .map(item => item.specialtyRoomConfId)
    .filter(id => id && id.trim().length > 0);
  
  if (selectedConfIds.length === 0) {
    await dialog.alertSimple('삭제할 수업을 선택해주세요.');
    return;
  }

  // 선택행에 선택된 수업이 하나라도 있는지 확인
  const existsAssignedClasses = specialtyRoomConfItems.value
    .filter(item => item.isCheck)
    .some(item => item.classLessonConfs.some(lesConf => lesConf.isCheck));

  if (existsAssignedClasses && !(await confirmLessonDelete('선택한 수업을 삭제하시겠습니까?', '선택한 수업을 삭제하시겠습니까?'))) {
    return;
  }
  
  await specialtyRoomConfContext.deleteSpecialtyRoomConfs(selectedConfIds);
  await specialtyRoomConfContext.reload();
  await lessonConfContext.reload();

  // 체크박스 상태 초기화
  isSelectedAllRows.value = false;
  hasChecked.value = false;
}

const openDialog = () => {
  if(selectedRoomId.value === '') {
    dialog.alertSimple('수업을 배정할 특별실을 선택해주세요.');
    return;
  }

  isShowSpecialtyRoomConfDialog.value = true;
};

const handleClickSubmitDialog = async (addedConfs: Array<SpecialtyRoomConf>) => {
  if (addedConfs.length > 0) {
    await specialtyRoomConfContext.createSpecialtyRoomConfs(selectedRoomId.value, addedConfs);
    await specialtyRoomConfContext.reload();
  }
  handleClickCancelDialog();
};

const handleClickCancelDialog = () => {
  isShowSpecialtyRoomConfDialog.value = false;
};

const handleClickOnClass = async (specialtyRoomConfId: string, lesConf: SpecialtyRoomClassLessonConf, item: SpecialtyRoomConfItem) => {
  if(await confirmLessonDelete(undefined, '특별실 사용 학급을 변경시겠습니까?') === false) {
    lesConf.isCheck = !lesConf.isCheck;
    return;
  }

  if (lesConf.isCheck) {
    await lessonConfContext.attachSpecialtyRoomConfOnLessonConf(
      specialtyRoomConfId,
      lesConf.lessonConfId
    );

    await doAfterModify();
    return;
  }
  
  await lessonConfContext.detachSpecialtyRoomConfOnLessonConf(
    specialtyRoomConfId,
    lesConf.lessonConfId
  );  
  await doAfterModify();
};

const handleChangeConsecutivePeriod = async (
  conf: SpecialtyRoomConfItem,
  consecutivePeriod: string
) => {

  if(!(await confirmLessonDelete(undefined, '연속 시수를 변경하시겠습니까?'))) {
    return;
  }

  await updateConsecutivePeriod(conf, consecutivePeriod);
  await doAfterModify();

  // conf.consecutivePeriod = consecutivePeriod;

  /*
  const consecutiveConf = itemToConsecutiveConf(conf) as ConsecutiveConf;
  await consecutiveConfContext.updateConsecutivePeriodToConf(
    consecutiveConf.consecutiveConfId, consecutiveConf.consecutivePeriod
  );
  */
};

const restrictNameInput = (e: Event, item: {title: string, value: string}) => {
  const allowedRegex = /[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9]/g;

  const roomName = (e.target as HTMLInputElement).value;
  const cleanedName = roomName.replace(allowedRegex, '');
  (e.target as HTMLInputElement).value = cleanedName;

  // const room = specialtyRooms.value.find(r => r.specialtyRoomId === item.value);
  // if (!room) return;

  item.title = cleanedName;
}

const getClassNameByLessonConf = (lessonConf: LessonConf | null) => {
  if (!lessonConf) {
    return '';
  }

  const cls = classMap.value[lessonConf.classId];
  return cls && TimetableDisplayUtils.formatFullClassName(cls) || '';
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
.specialty-room-conf{  
  .no-data {
    font-size: 16px;
    color: var(--gray-09);
    height: 280px;
    width: 100%;
    border: 1px solid var(--gray-07);
    border-radius: 16px;
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    .btn-area {
      .btn {
        font-weight: 400;
        font-size: 14px;
        &.btn-ico-left {
          &::after {
            width: 0;
          }
        }
      }
    }
  }
  .table-head{
    margin-bottom: 24px;
    padding-top: 20px;
    .hi-selectbox {
      width: 250px;
      .option-list {        
        .item.is-edit {
          padding: 0px 0px; 
          .input-wrap {
            width: 100%;
            input {
              width: 100%;
              height: 40px;
            };
          }
        }
      }
      .btns{
        button:hover i::after{
          background-color: var(--gray-09) !important;
        }
      }
    }
    .btn-area {
      gap: 8px;
    }
  }
  .table-form {
    .text-gray {
      color: var(--gray-07);
    }
  }
  .badge{
    display: inline-block;
    padding: 6px 0;
    + .badge{
      margin-left: 4px;
    }
  }
}
</style>