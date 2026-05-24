<template>
  <TimeTableModal size="lg" class="specialty-room-conf-dialog" @close="handleCloseDialog">
    <template v-slot:heading>
      특별실 등록
      <p class="smr">
        특별실에서 수업할 과목을 선택하세요.
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
          @update:value="searchType = $event"
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
                  <span>{{ item.title }} <span class="period" v-if="searchType === SearchType.Course"> ({{ item.period }})</span></span>                  
                </label>
              </li>
            </ul>
          </template>
        </HiSelectBox>
      </div>  
      <div class="table-content sticky-wrap table-box">
        <table>
          <colgroup>
            <col style="width: 10%" />
            <col style="width: 20%" />
            <col style="width: 20%" />
            <col style="width: 15%" />
            <col style="width: 15%" />
            <col style="width: 20%" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" class="sticky-top">
                  <input
                    type="checkbox"
                    id="allCheckedDialog"
                    v-model="isCheckedAllRows"
                    :disabled="sortedResults.length === 0"
                  />
                  <label for="allCheckedDialog"></label>
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
              <th scope="col" class="sticky-top">비고</th>
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
                  :disabled="!!entity.assignedRoom || entity.isConsecutive"
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
      <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="handleCloseDialog">취소</button>
      <button type="button" class="btn btn-primary btn-lg" :disabled="!hasChecked" @click="handleClickSubmit">등록</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';

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
  TimetableTeacherContext,
  TimetableCourseBaseContext
} from '../contexts';
import {SpecialtyRoomConf, SpecialtyRoom} from '../core/types';
import {SpecialtyRoomConfEntity} from '@/apps/timetable/common/types';
import {createSpecialtyRoomConfService} from '@/apps/timetable/services/specialty-room-conf-service';
import {computed, inject, onMounted, ref, watch} from 'vue';
import { get } from 'lodash';

enum SearchType {
  Course = '과목명',
  Teacher = '교사명',
}

const consecutiveConfContext = inject(ContextKeys.ConsecutiveConf) as ConsecutiveConfContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const timetableCourseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext;
const timetableClassContext = inject(ContextKeys.Class) as TimetableClassContext;
const timetableCourseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const timetableTeacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const concurrentConfContext = inject(ContextKeys.ConcurrentConf) as ConcurrentConfContext;
const specialtyRoomContext = inject(ContextKeys.SpecialtyRoom) as SpecialtyRoomContext;
const specialtyRoomConfContext = inject(ContextKeys.SpecialtyRoomConf) as SpecialtyRoomConfContext;

const specialtyRoomMap = computed(() => specialtyRoomContext.specialtyRoomMap as Record<string, SpecialtyRoom> || {});

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

const props = defineProps<{ onSubmit: (addedConfs: Array<SpecialtyRoomConf>) => void }>();
const emit = defineEmits(['close']);

const orderBy = ref<string>('default');
const specialtyRoomConfEntities = ref<SpecialtyRoomConfEntity[]>([]);
const isCheckedAllRows = computed({
  get: () => {
    const filtered = sortedResults.value.filter((entity) => !(!!entity.assignedRoom || entity.isConsecutive));
    return filtered.length > 0 && filtered.every((entity) => entity.isCheck)
  },
  set: (value: boolean) => {
    sortedResults.value.forEach((entity) => {
      if (!(!!entity.assignedRoom || entity.isConsecutive)) { entity.isCheck = value }
    });
  }
});

const searchType = ref<SearchType>(SearchType.Course);
const searchKeywords = ref<string[]>([]);

onMounted(async () => {
  await initList();
  searchKeywords.value = getCourseOptions().map((item) => item.value);
});

const hasChecked = computed(() => sortedResults.value.some((entity) => !entity.assignedRoom && entity.isCheck));

watch(
  () => [
    searchType.value,
  ],
  () => {
    searchKeywords.value = searchType.value === SearchType.Course
      ? getCourseOptions().map((item) => item.value)
      : getTeacherOptions().map((item) => item.value);
  }
);

watch(
  () => [
    searchKeywords.value,
  ],
  async () => await initList()
);

const initList = async () => {
  specialtyRoomConfEntities.value = 
    await specialtyRoomConfService.getListForSelect()
      .sort((a, b) => 
        ((b.isVirtual ? 1 : 0) - (a.isVirtual ? 1 : 0)) ||
        // 같을 때만 제목 비교
        a.courseTitle.localeCompare(b.courseTitle)
      );
};

const searchResults = computed(() => {
  if (!searchKeywords.value.length) return [];

  return specialtyRoomConfEntities.value.filter((entity) => {
    if (searchType.value === SearchType.Course) {
      return searchKeywords.value.includes(entity.courseTitle);
    }

    else if (searchType.value === SearchType.Teacher) {
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
});

const itemClass = (entity: SpecialtyRoomConfEntity) => {
  return {
    'text-grey-6 bg-grey-1': entity.isConcurrent,
  };
};

const handleClickChecked = (specialtyRoomConfEntity: SpecialtyRoomConfEntity) => {
  specialtyRoomConfEntity.isCheck = !specialtyRoomConfEntity.isCheck;
};


const handleClickOrderBy = (field: string) => {
  const currentField = orderBy.value.split('-')[0];

  if (currentField === field) {
    orderBy.value = orderBy.value.endsWith('asc') ? `${field}-desc` : `${field}-asc`;
  } else {
    orderBy.value = `${field}-desc`;
  }
}

const handleClickSubmit = () => {
  const checkedEntities = specialtyRoomConfEntities.value.filter((entity) => !entity.assignedRoom && entity.isCheck);

  const addedConfs = checkedEntities
    .map((entity) => {
      return {
        courseId: entity.courseId,
        teacherId: entity.representative,
        grade: entity.grade,
        periodCount: entity.coursePeriod,
        teacherName: entity.teachers
          .map(({ teacherName }) => teacherName)
          .join(', '),
        concurrentCourseId: entity.isConcurrent ? entity.concurrentCourseId : null,
      };
    }) as Array<SpecialtyRoomConf>;

  props.onSubmit && props.onSubmit(addedConfs);
};

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

  specialtyRoomConfEntities.value.forEach((entity) => {
    if (!courseMap.has(entity.courseTitle)) {
      courseMap.set(entity.courseTitle, {
        title: entity.courseTitle,
        value: entity.courseTitle,
        period: entity.coursePeriod!,
      });
    }
  });

  return Array.from(courseMap.values());
};

const getTeacherOptions = () => {
  const teacherSet = new Set(
    specialtyRoomConfEntities.value.flatMap((entity) =>
      entity.teachers.map((t) => t.teacherName)
    )
  );
  return Array.from(teacherSet).map((name) => ({
    value: name,
    title: name,
  }));
};

const getRoomName = (assignedRoom: SpecialtyRoomConf) => {
  if (!assignedRoom || !assignedRoom.specialtyRoomId) return '';
  const room = specialtyRoomMap.value[assignedRoom.specialtyRoomId];
  return room ? room.roomName : '';
};

const getNote = (entity: SpecialtyRoomConfEntity) => {
  const notes = [];
  if (entity.isConcurrent) notes.push('동시');
  if (entity.isVirtual) notes.push('가상');
  if (entity.isConsecutive) notes.push('연속');
  if (entity.assignedRoom) notes.push(getRoomName(entity.assignedRoom));
  return notes.join(', ');
};

const handleCloseDialog = () => {
  emit('close');
};
</script>

<style scoped lang="scss">
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
.timetable-modal-common{
  ::v-deep .modal__layer{
    height: 100%;
    .modal__content{
      display: flex;
      flex-flow: column;
    }
  }
}
</style>
