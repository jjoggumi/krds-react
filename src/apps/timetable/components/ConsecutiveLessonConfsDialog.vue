<template>
  <TimeTableModal size="lg" v-if="isShowModal" @close="handleClickCancel" class="concurrent-fixed-modal">
    <template v-slot:heading>
      연속 수업 등록
      <p class="smr">
        연속 수업으로 등록을 할 과목과 교사를 선택하세요. 
        <span class="txt-warning">동시수업, 특별실에 등록된 수업의 경우 연속수업으로 등록할 수 없습니다.</span>
      </p>
    </template>
    <template v-slot:content>
      <div class="gray-box mt-00 mb-15">
        <HiSelectBox 
          class="mr-10"
          :value="searchType"
          :items="[
            { value: SearchType.Course, title: '과목명' },
            { value: SearchType.Teacher, title: '교사명' }
          ]"
          @update:value="(e) => handleChangeSearchType(e)"
          :empty-title="!searchType ? '선택' : searchType"
        />
        <HiSelectBox class="mr-10 type01"
          :value="searchKeywords"
          :items="searchOptions"
          @update:value="searchKeywords = $event"
          :empty-title="'선택'"
          :disabled="!searchType"
        >
          <template #custom-option="{ items }">
            <ul class="option-list">
              <li class="item">
                <input
                  type="checkbox"
                  id="check-all"
                  :checked="isAllChecked"
                  @change="toggleSelectAll"
                />
                <label for="check-all">
                  <span>전체</span>
                </label>
              </li>
              <li
                v-for="item in items"
                :key="item.value"
                class="item"
              >
                <input
                  type="checkbox"
                  :id="`check-${item.value}`"
                  :value="item.value"
                  v-model="searchKeywords"
                />
                <label :for="`check-${item.value}`">
                  <span>
                    {{ item.title }}
                    <span class="period" v-if="searchType === SearchType.Course"> ({{ item.period }})</span>
                  </span>
                </label>
              </li>
            </ul>
          </template>
        </HiSelectBox>
      </div>      

      <div class="table-content table-form sticky-wrap table-box">
        <table>
          <colgroup>
            <col style="width: 10%" />
            <col style="width: 18%" />
            <col style="width: 18%" />
            <col style="width: 18%" />
            <col style="width: 18%" />
            <col style="width: 18%" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" class="sticky-top">
                <div class="form-check">
                  <input
                    type="checkbox"
                    id="allCheckedDialog"
                    v-model="isCheckedAllRows"
                    :disabled="sortedResults.length === 0"
                  />
                  <label for="allCheckedDialog"></label>
                </div>
              </th>
              <th scope="col" class="sticky-top">
                과목명                
                <button type="button" class="btn btn-link btn-sort" :class="{'desc': orderBy === 'courseTitle-desc', 'asc': orderBy === 'courseTitle-asc'}" @click="handleClickOrderBy('courseTitle')">
                  <span class="sr-only">정렬</span>
                </button>
              </th>
              <th scope="col" class="sticky-top">
                교사명
                <button type="button" class="btn btn-link btn-sort" :class="{'desc': orderBy === 'teacherName-desc', 'asc': orderBy === 'teacherName-asc'}" @click="handleClickOrderBy('teacherName')">
                  <span class="sr-only">정렬</span>
                </button> 
              </th>
              <th scope="col" class="sticky-top">
                학년                
                <button type="button" class="btn btn-link btn-sort" :class="{'desc': orderBy === 'grade-desc', 'asc': orderBy === 'grade-asc'}" @click="handleClickOrderBy('grade')">
                  <span class="sr-only">정렬</span>
                </button>
              </th>
              <th scope="col" class="sticky-top">
                시수                
                <button type="button" class="btn btn-link btn-sort" :class="{'asc': orderBy === 'coursePeriod-desc', 'desc': orderBy === 'coursePeriod-asc'}" @click="handleClickOrderBy('coursePeriod')">
                  <span class="sr-only">정렬</span>
                </button> 
              </th>
              <th class="sticky-top">비고</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entity, idx) in sortedResults"
              :class="itemClass(entity)"
              :key="`sel-${idx}`"
            >
              <td>
                <input
                  type="checkbox"
                  v-model="entity.isCheck"
                  :id="`filteredLessonConfs-${idx}`"
                  @click="handleClickChecked(entity)"
                  :disabled="entity.isConcurrent || entity.isConsecutive || !!entity.roomId"
                />
                <label :for="`filteredLessonConfs-${idx}`" />
              </td>
              <td>
                {{ entity.courseTitle }}
              </td>
              <td>
                {{
                  entity.teachers
                    .map(({ teacherName }) => teacherName)
                    .join(', ')
                }}
              </td>
              <td>{{ entity.grade }}</td>
              <td>
                {{ entity.coursePeriod }}
              </td>
              <td>
                {{ getNote(entity) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="handleClickCancel">취소</button>
      <button type="button" class="btn btn-primary btn-lg" :disabled="!hasChecked" @click="handleClickSubmit">등록</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';

import {
  ContextKeys,
  ConsecutiveConfContext,
  LessonConfContext,
  TeacherCourseContext,
  TimetableClassContext,
  TimetableCourseContext,
  TimetableTeacherContext,
  SpecialtyRoomContext,
  SpecialtyRoomConfContext,
  TimetableCourseBaseContext
} from '../contexts';

import { computed, onMounted, ref, watch, inject } from 'vue';
import { createConsecutiveConfService } from '@/apps/timetable/services/consecutive-conf-service';
import { ConsecutiveConf, SpecialtyRoom } from '@/apps/timetable/core/types';
import { ConsecutiveConfEntity } from '@/apps/timetable/common/types';

// defineOptions({  name: 'ConsecutiveLessonConfsDialog',});

enum SearchType {
  Course = '과목명',
  Teacher = '교사명',
}

const props = defineProps<{
  showDialog: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}>();

const orderBy = ref<string>('default');
const isShowModal = ref(false);
const searchType = ref<SearchType>(SearchType.Course);
const searchKeywords = ref<string[]>([]);
//const searchKeyword = ref('');
const consecutiveConfEntites = ref<ConsecutiveConfEntity[]>([]);

watch(
  () => props.showDialog,
  (value) => {
    isShowModal.value = value;

    if (value) {
      initList();
      return;
    }

    consecutiveConfEntites.value = [];
  }
);

const consecutiveConfContext = inject(ContextKeys.ConsecutiveConf) as ConsecutiveConfContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const timetableClassContext = inject(ContextKeys.Class) as TimetableClassContext;
const timetableCourseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const timetableCourseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext;
const timetableTeacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const specialtyRoomContext = inject(ContextKeys.SpecialtyRoom) as SpecialtyRoomContext;
const specialtyRoomConfContext = inject(ContextKeys.SpecialtyRoomConf) as SpecialtyRoomConfContext;

const ConsecutiveConfService = createConsecutiveConfService(
  consecutiveConfContext,
  lessonConfContext,
  teacherCourseContext,
  timetableClassContext,
  timetableCourseContext,
  timetableCourseBaseContext,
  timetableTeacherContext,
  specialtyRoomConfContext
);

onMounted(async () => {
  await initList();
  searchKeywords.value = getCourseOptions().map((item) => item.value);
});

const hasChecked = computed(() => sortedResults.value.some((entity) => !entity.isConcurrent && !entity.isConsecutive && !entity.roomId && entity.isCheck));

watch(
    () => [
      searchKeywords.value,
    ],
    async () => await initList()
);

const initList = async () => {
  consecutiveConfEntites.value = (
    await ConsecutiveConfService.getListForSelect()
  ).sort((a, b) =>
      a.courseTitle.localeCompare(b.courseTitle));
};
/*
const searchResults = computed(() => {
  return consecutiveConfEntites.value.filter((entity) => {
    if (!searchKeyword.value) {
      return true;
    }

    return (
      entity.courseTitle.includes(searchKeyword.value) ||
      entity.teachers.some(({ teacherName }) =>
        teacherName.includes(searchKeyword.value)
      )
    );
  });
});
 */

const isCheckedAllRows = computed({
  get: () => {
    const filtered = sortedResults.value.filter((entity) => !(entity.isConcurrent || entity.isConsecutive || !!entity.roomId));
    return filtered.length > 0 && filtered.every((entity) => entity.isCheck)
  },
  set: (value: boolean) => {
    sortedResults.value.forEach((entity) => {
      if (!(entity.isConcurrent || entity.isConsecutive || !!entity.roomId)) { entity.isCheck = value }
    });
  }
});

const specialtyRoomMap = computed(() => specialtyRoomContext.specialtyRoomMap as Record<string, SpecialtyRoom>);

// 기존 검색 결과 수정 
const searchResults = computed(() => {
  if (!searchKeywords.value.length) return [];

  return consecutiveConfEntites.value.filter((entity) => {
    if (searchType.value === SearchType.Course) {
      return searchKeywords.value.includes(entity.courseTitle);
    }

    if (searchType.value === SearchType.Teacher) {
      return entity.teachers.some((teacher) =>
        searchKeywords.value.includes(teacher.teacherName)
      );
    }

    return true;
  });
});

const sortedResults = computed(() =>  {
  const items = [...searchResults.value];
  const [field, direction] = orderBy.value.split('-');

  if (field === 'default') return items;

  items.sort((a, b) => {
    if (field === 'courseTitle') {
      return direction === 'asc'
        ? a.courseTitle.localeCompare(b.courseTitle)
        : b.courseTitle.localeCompare(a.courseTitle);
    } else if (field === 'teacherName') {
      const aTeachers = a.teachers.map(t => t.teacherName).join(', ');
      const bTeachers = b.teachers.map(t => t.teacherName).join(', ');
      return direction === 'asc'
        ? aTeachers.localeCompare(bTeachers)
        : bTeachers.localeCompare(aTeachers);
    } else if (field === 'grade') {
      return direction === 'asc' ? a.grade - b.grade : b.grade - a.grade;
    } else if (field === 'coursePeriod') {
      const aPeriod = a.coursePeriod || 0;
      const bPeriod = b.coursePeriod || 0;
      return direction === 'asc' ? aPeriod - bPeriod : bPeriod - aPeriod;
    }
    return 0;
  });

  return items;
})

// 전체 선택 여부 판단
const isAllChecked = computed(() => {
  return searchOptions.value.length > 0 &&
    searchKeywords.value.length === searchOptions.value.length;
});

// 전체 선택 또는 해제 토글
const toggleSelectAll = () => {
  if (isAllChecked.value) {
    searchKeywords.value = [];
  } else {
    searchKeywords.value = searchOptions.value.map((item) => item.value);
  }
};
// 검색 조건에 따라 드롭다운 옵션을 동적으로 생성
const searchOptions = computed(() => {
  return searchType.value === SearchType.Course ? getCourseOptions() : getTeacherOptions();
});

const getCourseOptions = () => {
  const courseMap = new Map<string, { title: string; value: string; period: number }>();

  consecutiveConfEntites.value.forEach((entity) => {
    if (!courseMap.has(entity.courseTitle)) {
      courseMap.set(entity.courseTitle, {
        title: entity.courseTitle,
        value: entity.courseTitle,
        period: entity.coursePeriod!,
      });
    }
  });

  return Array.from(courseMap.values());
}

const getTeacherOptions = () => {
  const teacherSet = new Set(
      consecutiveConfEntites.value.flatMap((entity) =>
          entity.teachers.map((t) => t.teacherName)
      )
  );
  return Array.from(teacherSet).map((name) => ({
    value: name,
    title: name,
  }));
}

const itemClass = (entity: ConsecutiveConfEntity) => {
  return {
    'text-grey-6 bg-grey-1': entity.isConcurrent,
  };
};

const handleChangeSearchType = (value: SearchType) => {
  searchType.value = value;
  searchKeywords.value = searchType.value === SearchType.Course
      ? getCourseOptions().map((item) => item.value)
      : getTeacherOptions().map((item) => item.value);
};

const handleClickOrderBy = (field: string) => {
  const currentField = orderBy.value.split('-')[0];

  if (currentField === field) {
    orderBy.value = orderBy.value.endsWith('asc') ? `${field}-desc` : `${field}-asc`;
  } else {
    orderBy.value = `${field}-desc`;
  }
};

const toggleAllChecked = () => {
  consecutiveConfEntites.value.forEach((item) => {
    if (!(item.isConcurrent || item.isConsecutive)) { item.isCheck = isCheckedAllRows.value }
  });
};

const handleClickChecked = (entity: ConsecutiveConfEntity) => {
  entity.isCheck = !entity.isCheck;
};

const handleClickCancel = () => {
  // 모든 체크박스 해제 (행 선택 + 전체 선택)
  consecutiveConfEntites.value.forEach((item) => {
    item.isCheck = false;
  });
  isCheckedAllRows.value = false;
  isShowModal.value = false;

  resetSelections();

  props.onCancel();
};

const getRoomName = (roomId: string) => {
  if (!roomId) return '';
  const room = specialtyRoomMap.value[roomId];
  return room ? room.roomName : '';
};

const getNote = (entity: ConsecutiveConfEntity) => {
  const notes = [];
  if (entity.isConcurrent) notes.push('동시');
  if (entity.isConsecutive) notes.push('연속');
  if (entity.roomId) notes.push(getRoomName(entity.roomId));
  return notes.join(', ');
};

const handleClickSubmit = async () => {
  const checkedItems = consecutiveConfEntites.value.filter(
    (entity) => !entity.isConcurrent && !entity.isConsecutive && !entity.roomId && entity.isCheck
  );

  // 추가 처리: 체크된 것 중 기존 연속 수업 설정에 없는 것
  const addedConfs = checkedItems
    .map((item) => {
      return {
        consecutiveConfId: '',
        courseId: item.courseId,
        grade: item.grade,
        teacherId: item.teachers[0].teacherId, // 복수교사의 경우 대표 교사로 저장: 추후 필요에 따라 수정
        consecutivePeriod: '',
        teacherName: item.teachers
                      .map(({ teacherName }) => teacherName)
                      .join(', ')
      };
    }) as ConsecutiveConf[];

  // 추가 처리
  if (addedConfs.length > 0) {
    await consecutiveConfContext.createConsecutiveConfs(addedConfs);
  }

  /*
  // 삭제 처리: 해당 설정의 '과목-학년-(교사 - 복수교사)'의 lessonConf에 적용된 연속 시수도 제거한다.
  const deletedConfs = consecutiveConfs.filter(
    (conf) =>
      !checkedItems.some(
        (item) =>
          item.grade === conf.grade &&
          item.courseId === conf.courseId &&
          item.teachers.some(({ teacherId }) => teacherId === conf.teacherId)
      )
  );
  if (deletedConfs.length > 0) {
    await ConsecutiveConfService.deleteConsecutiveConfs(deletedConfs);
  }
  */

  isShowModal.value = false;

  // reset selections
  resetSelections();

  props.onSubmit();
};

const resetSelections = () => {
  handleChangeSearchType(SearchType.Course);
};
</script>

<style scoped lang="scss">
.timetable-modal-common{
  ::v-deep .modal__layer{
    height: 100%;
    .modal__content{
      display: flex;
      flex-flow: column;
    }
  }
}
.gray-box {
  .hi-selectbox {
    width: 160px;
    margin-right: 10px;
    + .hi-selectbox {
      width: 260px;
    }
    .option-list{
      .item {
        label {
          width: 100%;
          display: flex;
          > span{
            display: flex;
            flex-grow: 1;
            justify-content: space-between;
            .period{
              color: var(--primary);
            }
          }
        }
      }
    }   
  }
  input[type=checkbox] + label span{
    font-weight: 400;
  }
}
</style>
