<template>
  <div class="teacher-lnb">
    <div class="filter-section">
      <div>
        <div class="form-check-inline ml-8 mr-24 lg">
          <input type="radio" name="searchType" id="teacher" :value="LessonConfEditType.Teacher" v-model="searchTargetType" />
          <label for="teacher"><span>교사명</span></label>
        </div>
        <div class="form-check-inline lg">
          <input type="radio" name="searchType" id="class" :value="LessonConfEditType.Course" v-model="searchTargetType" />
          <label for="class"><span>과목명</span></label>
        </div>
      </div>
      <HiSelectBox class="w-full type01 sm"
        :value="selectedOptionIds"
        :items="searchOptions"
        @update:value="selectedOptionIds = $event"
        :empty-title="getSelectedText()"
      >
        <template #btnType>
          <span :class="selectedOptionIds.length === 0 ? 'txt-gray' : 'txt-primary'">
            {{ getSelectedText() }}
          </span>
        </template>
        <template #custom-option="{ items }">
          <ul class="option-list">
            <li class="item">
              <input
                type="checkbox"
                id="check-all"
                :checked="isAllChecked"
                @change="toggleSelectAll($event)"
              />
              <label for="check-all">
                <span>전체</span>
              </label>
            </li>
            <li
              v-for="(item, idx) in items"
              :key="`${item.value}-${idx}-crs-opt`"
              class="item"
            >
              <input
                type="checkbox"
                :id="`check-${item.value}`"
                :value="item.value"
                v-model="selectedOptionIds"
              />
              <label :for="`check-${item.value}`">
                <span>
                  {{ item.title }}
                </span>
              </label>
            </li>
          </ul>
        </template>
      </HiSelectBox> 
    </div> 
    <!-- 교사, 과목 목록 테이블 -->
    <div class="table-content basic-table sticky-wrap">
      <table class="table" v-if="searchTargetType == LessonConfEditType.Teacher">
        <caption>교사목록</caption>
        <colgroup>
          <col style="width: 42%;" />
          <col style="width: 58%;" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" class="sticky-top pr-00" @click="handleClickOrderBy('teacherName')">
              <span>교사명(시수)</span>
              <i
                class="btn btn-link btn-sort"
                :class="{
                  'asc': orderBy === 'teacherName-asc',
                  'desc': orderBy === 'teacherName-desc'
                }"
              />
            </th>
            <th scope="col" class="sticky-top" @click="handleClickOrderBy('courseName')"
            >
              <span>과목명</span>
              <i
                class="btn btn-link btn-sort"
                :class="{
                  'asc': orderBy === 'courseName-asc',
                  'desc': orderBy === 'courseName-desc'
                }"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, idx) in filteredListItems"
            :key="`${item.id}-${idx}-teacher`"
            :class="{ active: selectedTargetId === item.id }"
            @click="() => handleClick(item)"
            style="cursor:pointer;"
          >
            <td ref="teacherCells" class="txt-left">
              {{ item.title }}({{ item.totalAccumulated ?? 0 }})
            </td>
            <td class="txt-left" :key="`${item.id}-courses-${item.courses.length}`">
              <template v-if="item.courses.length">
              {{ item.courses.map(c => c.displayedTitle).join(', ') }}
              </template>
              <template v-else>
              -
              </template>
            </td>
          </tr>
        </tbody>
      </table>
      <table class="table" v-else-if="searchTargetType === LessonConfEditType.Course">
        <caption>과목목록</caption>
        <colgroup>
          <col style="width: 100%;" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" class="sticky-top" @click="handleClickOrderBy('courseName')">
              <span>과목명</span>
              <i
                class="btn btn-link btn-sort"
                :class="{
                  'asc': orderBy === 'courseName-asc',
                  'desc': orderBy === 'courseName-desc'
                }"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, idx) in filteredListItems"
            :key="`${item.id}-${idx}-course`"
            :class="{ active: selectedTargetId === item.id }"
            @click="() => handleClick(item)"
            style="cursor:pointer;"
          >
            <td class="txt-left">
              {{ item.title }}
            </td>
          </tr>
        </tbody>

      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue';

import {
  Class,
  Course,
  CourseBase,
  LessonConf,
  Teacher,
  TeacherCourseBase,
  TimetableConfig,
} from '@/apps/timetable/core/types';

import {
  ContextKeys,
  TimetableGradeContext,
  TimetableCourseContext,
  TimetableTeacherContext,
  TimetableClassContext,
  LessonConfContext,
  TeacherCourseBaseContext,
  TimetableCourseBaseContext,
} from '../contexts';
import { LessonConfEditStatus, LessonConfEditType } from '../common/types';

const teacherCells = ref<HTMLElement[]>([]);

const props = defineProps<{
  // selectedTeacher: Teacher | null,
  onSelectTeacher: (teacher: Teacher) => void,
  onSelectCourseBase: (courseBase: CourseBase) => void,
  selectedCourseBase?: CourseBase | null,
  currentEditStatus: LessonConfEditStatus,
}>();

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const courseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
// const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const teacherCourseBaseContext = inject(ContextKeys.TeacherCourseBase) as TeacherCourseBaseContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
// const fixedConfContext = inject(ContextKeys.FixedConf) as FixedConfContext;

const classes = computed(() => classContext.classes as Class[]);
const courseMap = computed(() => courseContext.courseMap as Record<string, Course>);
const courseBases = computed(() => courseBaseContext.courseBases as CourseBase[]);
const courseBaseMap = computed(() => courseBaseContext.courseBaseMap as Record<string, CourseBase>);
// const teacherCourses = computed(() => teacherCourseContext.teacherCourses as TeacherCourse[]);
const teacherCourseBases = computed(() => teacherCourseBaseContext.teacherCourseBases as TeacherCourseBase[]);
const teacherCourseBaseMap = computed(() => teacherCourseBaseContext.teacherCourseBaseMap as Record<string, TeacherCourseBase[]>);
const teachers = computed(() => teacherContext.teachers as Teacher[]);
const teacherMap = computed(() => teacherContext.teacherMap as Record<string, Teacher>);
const lessonConfs = computed(() => lessonConfContext.lessonConfs as LessonConf[]);
const lessonConfMap = computed(() => lessonConfContext.lessonConfMap as Record<string, LessonConf>);
const timetableConfig = computed(() => gradeContext.timetableConfig as TimetableConfig);
// const fixedConfs = computed(() => fixedConfContext.fixedConfs as FixedConf[]);
const lessonConfsMapByTeacher = computed(() => lessonConfContext.lessonConfsMapByTeacher as Record<string, LessonConf[]>);

const orderBy = ref<string>('default');
const searchTargetType = ref<LessonConfEditType>(LessonConfEditType.Teacher);
const selectedOptionIds = ref<string[]>([]);
const selectedTargetId = ref<string | null>(null);
const filteredListItems = ref<any[]>([]);

// function alignTeacherCounts() {
//   nextTick(() => {
//     // 가장 긴 시수 span의 width 계산
//     let maxWidth = 0;
//     teacherCells.value.forEach(cell => {
//       const countSpan = cell.querySelector('.teacher-count') as HTMLElement;
//       if (!countSpan) return;
//       const width = countSpan.offsetWidth;
//       if (width > maxWidth) maxWidth = width;
//     });

//     // 모든 시수 span에 width 적용 (고정 너비)
//     teacherCells.value.forEach(cell => {
//       const countSpan = cell.querySelector('.teacher-count') as HTMLElement;
//       if (!countSpan) return;
//       countSpan.style.width = `${maxWidth}px`;
//       countSpan.style.display = 'inline-block';
//       countSpan.style.textAlign = 'right';
//     });    
//   });
// }

onMounted(async () => {
  await initData();
  //alignTeacherCounts();
  selectTeacherWithFirstItem();
  console.log('LessonConfTargetItems mounted');
});



const initData = async () => {
  await gradeContext.load();
  await classContext.load();
  await teacherContext.load();
  await courseBaseContext.load();
  await teacherCourseBaseContext.load();
  await lessonConfContext.load();
  // await fixedConfContext.load();
};

// 검색 타입에 따른 옵션 목록 조회
const searchOptions = computed(() => {
  if(searchTargetType.value === LessonConfEditType.Course) {
    return courseBaseOptions.value;
  } 
  
  if(searchTargetType.value === LessonConfEditType.Teacher) {
    return teacherOptions.value;
  }

  // if (searchType.value === '교사명') return teacherOptions.value;
  // else if (searchType.value === '과목명') return courseBaseOptions.value;
  
  return [];
});

/*
watch(
  searchType,
  () => { searchKeywords.value = []; }
)
*/

// 교사 목록을 선택 박스의 옵션 형태로 변환
const teacherOptions = computed(() => {
  return teachers.value.map(teacher => ({
    value: teacher.teacherId,
    title: teacher.teacherName,
  }));
});

const courseBaseOptions = computed(() => {
  return courseBases.value.map(courseBase => ({
    value: courseBase.courseBaseId,
    title: `${courseBase.displayedTitle}` + (courseBase.standardCourseTitle ? ` (${courseBase.standardCourseTitle})` : ''),
  }));
});

/*
const teacherOptions = computed(() => {
  return Object.values(teacherMap.value)
    .map(teacher => { return { value: teacher.teacherId, title: teacher.teacherName } });
});

// 과목 선택 드롭다운에 표시할 과목 목록을 계산
const courseBaseOptions = computed(() => {
  return Object.values(courseBaseMap.value)
    .map(courseBase => { return { 
      value: courseBase.courseBaseId,
      title: courseBase.displayedTitle,
    }});
});
*/

// 전체 체크 상태 판단
const isAllChecked = computed(() => {
  const options = searchOptions.value as Array<{ value: string; title: string }>;
  return (
    options.length > 0 &&
    options.every((opt) => selectedOptionIds.value.includes(opt.value))
  );
});

watch(
  () => searchTargetType.value,
  (newType, oldType) => {
    // 검색 타입 변경 시 선택된 옵션 초기화
    if(newType === oldType) {
      return;
    }
    
    selectedOptionIds.value = [];
    orderBy.value = 'default';
  }
);

/*
watch(
  () => [filteredListItems.value, searchTargetType.value, orderBy.value, selectedOptionIds.value],
  () => {
    if (searchTargetType.value === LessonConfEditType.Teacher) {
      alignTeacherCounts();
    }
  }
);
*/

watch(
  () => [teachers.value, orderBy.value, selectedOptionIds.value, teacherCourseBaseMap.value, courseBaseMap.value, lessonConfs.value, searchTargetType.value],
  () => {
    // console.log('Recomputing filteredListItems...');

    if(searchTargetType.value === LessonConfEditType.Course) {
      filteredListItems.value = courseBases.value.filter(cb => {
        if (selectedOptionIds.value.length === 0) {
          return true;
        }

        // 교사명 검색: 선택된 교사만
        return selectedOptionIds.value.includes(cb.courseBaseId);
      })
      .map(cb => ({
        id: cb.courseBaseId,
        title: `${cb.displayedTitle}${cb.standardCourseTitle ? ` (${cb.standardCourseTitle})` : ''}`,
        sortNo: cb.sortNo,
      }))
     .sort((a, b) => { 
        if(orderBy.value === 'courseName-asc') return a.title.localeCompare(b.title);
        if(orderBy.value === 'courseName-desc') return b.title.localeCompare(a.title);      
        return a.sortNo - b.sortNo
     });
      return;
    }


    filteredListItems.value = teachers.value.filter(teacher => {
      if (selectedOptionIds.value.length === 0) {
        return true;
      }

      if(teacher.teacherId == null || teacher.teacherName === '') {
        return false;
      }

      // 교사명 검색: 선택된 교사만
      return selectedOptionIds.value.includes(teacher.teacherId);
    })
    .map(teacher => {
      // 해당 교사에게 배정된 과목들
      const teacherCourseBase = (teacherCourseBaseMap.value[teacher.teacherId] || []) as TeacherCourseBase[];
      const courseBaseItems = teacherCourseBase.map(cb => courseBaseMap.value[cb.courseBaseId] || {});

      // 총 누계(시수) 합산
      const teacherLessonConfs = lessonConfsMapByTeacher.value[teacher.teacherId] || [];
      const totalAccumulated = teacherLessonConfs.reduce((sum, lc) => {
        const course = courseMap.value[lc.courseId];
        if (!course) return sum;

        return sum + (course.periodCount || 0);
      }, 0);

      return {
        id: teacher.teacherId,
        title: teacher.teacherName,
        totalAccumulated,
        courses: courseBaseItems
      };
    })
    .sort((a, b) => { 
      if(orderBy.value === 'teacherName-asc') return a.title.localeCompare(b.title);
      if(orderBy.value === 'teacherName-desc') return b.title.localeCompare(a.title);      
      if(orderBy.value === 'courseName-asc') return a.courses[0]?.displayedTitle?.localeCompare(b.courses[0]?.displayedTitle) || 0;
      if(orderBy.value === 'courseName-desc') return b.courses[0]?.displayedTitle?.localeCompare(a.courses[0]?.displayedTitle) || 0;
      return 0
    });
    
  },
  { immediate: true }
);

const selectTeacherWithFirstItem = async () => {
  if(searchTargetType.value !== LessonConfEditType.Teacher) {
    return;
  }

  if(filteredListItems.value.length === 0 || selectedTargetId.value != null) {
    return;
  }
  
  const firstItem = filteredListItems.value[0];

  if(firstItem && teacherMap.value[firstItem.id])  {
    const teacher = teacherMap.value[firstItem.id];
    selectedTargetId.value = firstItem.id;
    props.onSelectTeacher && props.onSelectTeacher(teacher);
  }
}

watch(
  () => [searchTargetType.value, filteredListItems.value, selectedTargetId.value, teacherMap.value],
  async () => { 
    await nextTick();
    selectTeacherWithFirstItem();
  }
)

watch(
  () => props.selectedCourseBase,
  (newCourseBase) => {
    if(newCourseBase) {
      searchTargetType.value = LessonConfEditType.Course;
      selectedTargetId.value = newCourseBase.courseBaseId;
    }
  },
  { immediate: true }
)


// 교사명, 과목명 선택 드롭다운 : 전체 선택 체크/해제 토글 함수
function toggleSelectAll(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  const options = searchOptions.value as Array<{ value: string; title: string }>;
  selectedOptionIds.value = checked
    ? options.map((opt) => opt.value)
    : [];
}

// 교사, 과목 목록 테이블: 선택옵션에 대한 제목을 반환하는 함수
const getSelectedText = () => {
  if (selectedOptionIds.value.length === 0) return '선택'

  const firstTitle = getTitle(selectedOptionIds.value[0])
  // const unit = searchType.value === '과목명' ? '개' : '명'
  const unit = searchTargetType.value === LessonConfEditType.Course ? '개' : '명'

  if (selectedOptionIds.value.length === 1) {
    return firstTitle
  }
  
  return `${firstTitle} 외 ${selectedOptionIds.value.length - 1}${unit}`
}

const handleClick = (item: any) => {
  if(searchTargetType.value === LessonConfEditType.Teacher) {
    const teacher = teacherMap.value[item.id];
    props.onSelectTeacher && props.onSelectTeacher(teacher);
  }
  else if(searchTargetType.value === LessonConfEditType.Course) {
    const courseBase = courseBaseMap.value[item.id];
    props.onSelectCourseBase && props.onSelectCourseBase(courseBase);
  }

  selectedTargetId.value = item.id;
};


// 과목ID로 과목명 조회
const getTitle = (value: string) => {
  if(searchTargetType.value === LessonConfEditType.Course && courseBaseMap.value[value]) {
    const found = courseBaseMap.value[value];
    return found.displayedTitle;
  }

  const found = searchOptions.value.find(opt => opt.value === value)
  return found ? found.title : value
}

//교사, 과목 목록 테이블 : 정렬
const handleClickOrderBy = (field: string) => {
  console.log('handleClickOrderBy', field);

  const currentField = orderBy.value.split('-')[0];

  if (currentField === field) {
    orderBy.value = orderBy.value.endsWith('asc') ? `${field}-desc` : `${field}-asc`;
  } else {
    orderBy.value = `${field}-desc`;
  }
};

</script>


<style lang="scss" scoped>
.teacher-lnb{
  height: calc(var(--vh, 1vh) * 100 - 190px);
  width: 280px;
  min-width: 280px;
  border: 1px solid #BDBDBD;
  border-radius: 12px;
  position: relative;   

  .filter-section{    
    padding: 16px 12px 12px 12px;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .table-content{
    th, td{
      height:32px;
      padding: 5px 10px;
    }
    td{
      padding: 5px 18px;
    }
    tr.active td,
    tr:hover td{
      background: #F1F4FC;
      cursor: pointer;
    }
    &.sticky-wrap {
      height: calc(100% - 102px);
    }
    
    table {
      td {
        border-right:1px solid #EEEEEE;
        &:last-child {
          border-right: none;
        }
        .teacher-name {
          display: inline-block;
          vertical-align: middle;
        }
        .teacher-count {
          display: inline-block;
          vertical-align: middle;
          text-align: right;
        }
      }      
    }
  }
}
</style>