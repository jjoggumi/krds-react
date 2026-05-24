<template>
  <div>
  <div class="type-teacher">
    <!-- 교사별 시간표 좌측 탭 -->
    <div class="teacher-lnb">
      <div class="tab-nav">
        <button :class="{'active' : lnbTab==='teacher-list'}" class="btn btn-lg" @click="lnbTab='teacher-list'">교사목록</button>
        <button :class="{'active' : lnbTab==='generate'}" class="btn btn-lg" @click="lnbTab='generate'">자동생성 결과</button>
      </div> 
      <!-- 교사목록 -->
      <template v-if="lnbTab==='teacher-list'">
        <!-- 검색 -->
        <div class="filter-section">
          <button type="button" class="btn btn-tertiary btn-sm" @click="handleClickAllTeachers">전체</button>
          <input type="text" class="sm" placeholder="이름, 과목명" v-model="searchTeacherListKeyword" spellcheck="false" maxlength="20" />
          <i
            v-if="searchTeacherListKeyword"
            class="ico ico-close-circle-fill ico-size-24 ico-gray"
            @click="searchTeacherListKeyword = ''"
          />
          <i class="ico ico-search"/>
        </div>
        <!-- 교사목록 테이블 -->
        <div class="table-content basic-table sticky-wrap">
          <timetable-generate-teachers 
            :teacher-table-items="teacherList"
            :selected-teacher="selectedTeacher"
            :on-select-teacher="handleClickTeacherListItem"
            :search-keyword="searchTeacherListKeyword"
          />
        </div>
        <div class="btns">
          <button type="button" @click="isCourseEditModal=true" class="btn btn-primary btn-lg w100 pr-40">수업 수정</button> 
          <!-- 수업 수정 도움말 버튼: helpOn 값과 비교하여 활성화 표시, 클릭 시 부모에 openHelp 이벤트 전달 -->
          <!-- <button
            type="button"
            class="btn btn-link btn-help"
            :class="{ 'help-on': helpOn === '수업수정' }"
            @click.stop="openHelp('수업수정')"
          >
            <span class="sr-only">도움말</span>
          </button> -->
          
          <HelpButton 
            :id="'수업수정'"
            :active="helpOn === '수업수정'"
            class="btn-help-w"
          />
        </div>            
      </template>    
      <!-- 자동생성 결과 -->   
      <template v-if="lnbTab==='generate'">       
        <ul class="generate-list custom-scr" :key="`assign-result-${lessonsLength}`">
          <li class="tit">
            배정 : <span class="ml-05 mr-05">{{ assignedLessonCount }}</span> <i class="divider" /> 미배정 : <span class="txt-warning ml-05 mr-05"> {{ remainingLessonCount }}</span>
          </li>
          <li v-for="vKey in validateStatusTypeKeys" 
            :class="[{'disabled': timetableStatus[vKey] === 0}, {'selected': selectedKey === vKey} ]"     
            @click="() => handleClickStatus(vKey)"
            :key="`timetable-status-${vKey}-${timetableStatus[vKey]}`">
            {{ VALID_STATUS_COUNT_TYPE_TITLE[vKey] }}
            <span class="count">{{ timetableStatus[vKey] }}</span>
          </li>
        </ul>  
        <div class="btns">
          <button type="button" @click="isTotalPeriodModal=true" class="btn btn-primary btn-lg w100">전체 시수표 보기</button>   
        </div>
      </template>       
    </div>
    <!-- 교사별 시간표 컨텐츠 -->
    <div ref="teacherContentRef"
      class="teacher-content" >
      <!-- 교사별 시간표 리스트 -->
      <div class="tb-row" v-if="showType === ShowType.List"> <!-- teacher-view : 수정 없는 테이블 뷰-->              
        <div class="tb-col" v-for="item in filteredTeacherList" :key="`${item.id}`">
          <div class="table-content time-table">
            <div class="h4-tit">
              <h4> 
                <button type="button" class="btn btn-link btn-teacher" @click="() => handleClickTeacherListItem(item.entity)" >
                  {{ item.title + ` 선생님`}} {{ item.className ? ` (담임 ${item.className})` : '' }}
                </button>
                <button type="button" class="btn btn-link btn-edit ml-05"  @click.stop="toggleEdit(item.id)">
                  <i class="ico ico-pen ico-gray ico-size-20 " />
                </button>
                <div class="edit-area" v-if="editOpen[item.id]">
                  <input type="text" v-model="item.editTeacherName" spellcheck="false"/>
                  <HiSelectBox                    
                    :value="item.editClassName"
                    :items="classNameOptions"
                    @update:value="($event) => handleUpdateEditClassName($event, item)"                    
                    :empty-title="item.editClassName || '학반 선택'"
                  />
                  <button class="btn btn-tertiary-blue" type="button" @click="() => handleConfirmEdit(item)">확인</button>
                </div>
              </h4>
              <div class="course-info">
                <!--
                <p> 미배정 <span class="txt-warning">2</span></p>
                <i  class="divider"></i>
                -->
                <p class="txt-primary"> {{ item.subtitle }}</p>
              </div>
            </div>
            <table class="teacher-view">
              <caption>시간표</caption>
              <colgroup>
                <col style="width: 5%;" />
                <col v-for="dayIdx in activatedClassDaysCount" :key="`day-col-${dayIdx}-${item.id}`" :style="`width: ${activatedClassDaysWidthPercent};`" />
              </colgroup>
              <thead>
                <tr>
                  <th></th>
                  <th v-for="day in activatedClassDays"
                    :key="`day-header-${item.id}-${day.dayOfWeek}`">{{ day.title }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="period in maxPeriod" :key="`period-${item.id}-${period}`">
                  <td class="th">{{ adjustDisplayedPeriod(period) }}</td>
                  <td v-for="day in activatedClassDays"
                    :key="`lesson-cell-${item.id}-${day.dayOfWeek}-${period}-${lessonsLength}-${genreateCount}-${timetableUpdatedAt}`">
                    <timetable-teacher-lesson-cell
                      :day-of-week="day.dayOfWeek"
                      :period="period"
                      :teacher-id="item.id"
                      :lesson="getLessonByTeacherAndPeriod(item.id, day.dayOfWeek, period)"
                     />
                  </td>
                </tr>                
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 교사 선택 수동 배정 -->
      <timetable-generate-edit
        v-if="showType === ShowType.Edit"
        :selected-teacher="selectedTeacher"
        :help-on="helpOn"
        :key="`${selectedTeacher?.teacherId}`"
      />
      
    </div>
  </div>
  
  <!-- 전체 시수표 보기 모달 -->
  <total-period-dialog
    v-if="isTotalPeriodModal"
    :on-close="handleCloseTotalPeriodDialog"
  />

  <!-- 수업 변경(1:1교환) 모달 -->
  <direct-exchange-lesson-dialog
    v-if="false"
  />
  
  <!-- 수업 수정 모달 -->
  <edit-lesson-dialog 
    v-if="isCourseEditModal"
    @close="closeCourseEditModal"
  />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, nextTick, watch, getCurrentInstance } from 'vue';
import TimetableGenerateTeachers from '@/apps/timetable/components/TimetableGenerateTeachers.vue';
import TimetableTeacherLessonCell from '@/apps/timetable/components/TimetableTeacherLessonCell.vue';
import TimetableGenerateEdit from '@/apps/timetable/components/TimetableGenerateEdit.vue';
import TotalPeriodDialog from '@/apps/timetable/components/TotalPeriodDialog.vue';
import DirectExchangeLessonDialog from '@/apps/timetable/components/DirectExchangeLessonDialog.vue';
import EditLessonDialog from '@/apps/timetable/components/EditLessonDialog.vue';
import { ContextKeys, LessonConfContext, LessonContext, TeacherCourseBaseContext, TeacherCourseContext, TimetableClassContext, TimetableCourseBaseContext, TimetableCourseContext, TimetableGradeContext, TimetableProgressContext, TimetableTeacherContext } from '../contexts';
import { Class, Course, CourseBase, Lesson, LessonConf, Teacher, TeacherCourse, TeacherCourseBase, TimetablePeriod, ValidStatusCountTypeMap, ValidStatusType } from '../core/types';
import { TimetableDataUtils } from '../core/mod/utils';
import { ActivateWeekday, LessonCell, TeacherTableItem } from '../common/types';
import { ClassDayStatus, DAILY_SCHEDULE_DEFAULTS, DAYS_OF_WEEK, VALID_STATUS_COUNT_TYPE_TITLE } from '../common/constants';
import Timetable from '../core';
import { TimetableDisplayUtils } from '../common/utils';
import TeachersManager from '../core/mod/teachers-manager';
import { TeacherForUpdate } from '../contexts/timetable-teacher-context';
import HelpButton from '@/apps/timetable/components/HelpButton.vue';

enum ShowType {
  Generate = 'generate',
  List = 'list',
  Edit = 'edit',
}

const props = defineProps<{
  timetableStatus: ValidStatusCountTypeMap;
  helpOn?: string; // 현재 활성화된 도움말 키
}>();

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const courseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext;
const teacherCourseBaseContext = inject(ContextKeys.TeacherCourseBase) as TeacherCourseBaseContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;
const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;

const genreateCount = ref(0);
const selectedTeacher = ref<Teacher | null>(null);
const showType = ref<ShowType>(ShowType.List);
const lnbTab = ref('teacher-list');
// const timetableStatus = ref<ValidStatusCountTypeMap>({} as ValidStatusCountTypeMap);
const filteredTeacherIds = ref<string[]>([]);
const isTotalPeriodModal = ref(false);
const isCourseEditModal = ref(false);
const searchTeacherListKeyword = ref('');
const remainingLessonCount = ref(0);
const assignedLessonCount = ref(0);
const selectedKey = ref<ValidStatusType | null>(null)

const teacherContentRef = ref<HTMLElement | null>(null);
const editOpen = ref<Record<string, boolean>>({});
const teachers = computed(() => teacherContext.teachers || ([] as Teacher[]));
const teacherMap = computed(() => teacherContext.teacherMap || ({} as Record<string, Teacher>));
const gradeFreePeriodsMap = computed(() => {
  const map: Record<number, TimetablePeriod[]> = {};
  Object.values(gradeContext.gradeMap).forEach(grd => {
    map[grd.grade] = grd.timetableStructure?.freePeriods ? grd.timetableStructure.freePeriods : [];
  });
  return map;
});
const classIdSetOfTeacher = computed(() => {
  const set = new Set<string>();
  teachers.value.forEach(teacher => {
    if(teacher.classId) {
      set.add(teacher.classId);
    }
  });
  return set;
});

const toggleEdit = (id: string) => {
  const cur = !!editOpen.value[id];

  if(!cur) {
    editOpen.value = {};

    // 초기값 설정
    const item = teacherList.value.find(t => t.id === id);
    if(item) {
      item.editTeacherName = item.title;
      item.editClassName = item.className || null;
    }
  }

  editOpen.value = { ...editOpen.value, [id]: !cur };
};

const handleUpdateEditClassName = (value: string , item: TeacherTableItem ) => {
  const foundedItem = teacherList.value.find(t => t.id === item.id);
  if(foundedItem) {
    foundedItem.editClassName = value;
  }

};

const handleConfirmEdit = async (item: TeacherTableItem) => {
  await updateTeacherIfChanged(item);
  editOpen.value = { ...editOpen.value, [item.id]: false };
};

const updateTeacherIfChanged = async (item: TeacherTableItem) => {
  const newTeacherName = item.editTeacherName && item.editTeacherName.trim();
  const newClassName = (item.editClassName && item.editClassName.trim()) || null;

  const entity = teacherMap.value[item.id];

  const oldTeacherName = entity.teacherName;
  const oldClassName = entity.classId && classContext.classMap[entity.classId]
    ? TimetableDisplayUtils.formatFullClassName(classContext.classMap[entity.classId])
    : null;
  
  if(newTeacherName !== oldTeacherName && newTeacherName) {
    const teacherForUpdate: TeacherForUpdate = {
      teacherId: entity.teacherId,
      teacherName: newTeacherName,
      classId: entity.classId,
    };

    try {
      await teacherContext.updateTeacherName(teacherForUpdate);
    } catch (error) {
      console.error('Failed to update teacher name:', error);
      return;
    }    
  }

  // 학반이 제거된 경우
  if(newClassName !== oldClassName && newClassName === null) {
    try {
      await teacherContext.removeTeacherClass(entity.teacherId);
    } catch (error) {
      console.error('Failed to update teacher class:', error);
      return;
    }
  }

  // 학반이 추가/변경된 경우
  if(newClassName !== oldClassName && newClassName !== null) {
    // 새로운 학반 이름에 해당하는 classId 찾기
    const foundClass = Object.values(classContext.classMap).find(cls => {
      return TimetableDisplayUtils.formatFullClassName(cls) === newClassName;
    });

    if(!foundClass) {
      console.error('Failed to find class for name:', newClassName);
      return;
    }

    const { classId } = foundClass;
    const { grade } = classContext.classMap[classId];
    const gradeFreePeriods = gradeFreePeriodsMap.value[grade] || [];

    const teacherForUpdate: TeacherForUpdate = {
      teacherId: entity.teacherId,
      teacherName: entity.teacherName,
      classId: foundClass.classId,
      gradeFreePeriods: gradeFreePeriods,
    };

    try {
      await teacherContext.updateTeacherClass(teacherForUpdate);
    } catch (error) {
      console.error('Failed to update teacher class:', error);
      return;
    }
  }
}

const handleCloseTotalPeriodDialog = (teacherId: string | null = null) => {
  isTotalPeriodModal.value = false;

  if (teacherId && teacherMap.value[teacherId]) {
    const teacher = teacherMap.value[teacherId];
    teacher && showTeacherDetailView(teacher);
  }
};

const timetableStatus = computed(() => {
  return props.timetableStatus;
});

const validateStatusTypeKeys = ref(Object.keys(VALID_STATUS_COUNT_TYPE_TITLE) as ValidStatusType[]);

const resetSelectedStatusKey = () => {
  selectedKey.value = null;
};

const handleClickStatus = (status: ValidStatusType) => {
  const value = timetableStatus.value[status];
  if (value === 0) {
    return;
  }

  teacherContentRef.value?.scrollTo({ top: 0, behavior: 'smooth' });

  const teacherIds = Object.keys(Timetable.teacherStatusMap)
      .filter(teacherId => (Timetable.teacherStatusMap[teacherId][status] || 0) > 0);
    
  filteredTeacherIds.value = teacherIds;

  showType.value = ShowType.List;  
  selectedKey.value = status;
};

const timetableUpdatedAt = computed(() => {
  // return Timetable.updatedAt || 0;
  return lessonContext.updatedAt;
});

const maxPeriod = computed(() => {
  return gradeContext.timetableConfig.maxPeriod || DAILY_SCHEDULE_DEFAULTS.maxPeriod;
});

const startPeriod = computed(() => {
  return gradeContext.startPeriod;
});

const classMap = computed(() => classContext.classMap || ({} as Record<string, Class>));
const courseMap = computed(() => courseContext.courseMap || ({} as Record<string, Course>));
const courseBaseMap = computed(() => courseBaseContext.courseBaseMap || ({} as Record<string, CourseBase>));
const gradeNameMap = computed(() => gradeContext.gradeNameMap || ({} as Record<number, string>));
const teacherCourseMap = computed(() => {
  return teacherCourseContext.teacherCourseMap || ({} as Record<string, TeacherCourse[]>);
});
const teacherCourseBaseMap = computed(() => {
  return teacherCourseBaseContext.teacherCourseBaseMap || ({} as Record<string, TeacherCourseBase[]>);
});

const lessonConfsMapByTeacher = computed(() => {
  return lessonConfContext.lessonConfsMapByTeacher || ({} as Record<string, LessonConf[]>);
});

// 학반 선택 드롭다운 아이템: 실제 학급(가상학급 제외)을 학년/반 순으로 정렬하여 전체 목록 제공
const classNameOptions = computed(() => {
  const list = Object.values(classContext.classMap || {})
    .filter(cls => !cls.isVirtual && !classIdSetOfTeacher.value.has(cls.classId))
    .sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      return a.classNumber - b.classNumber;
    })
    .map(cls => {
      const clsFullName = TimetableDisplayUtils.formatFullClassName(cls);
      return { value: clsFullName, title: clsFullName };
    });

  list.unshift({ value: '', title: '없음' });
  return list;
});

const lessonsByTeacher = computed(() => lessonContext.lessonsByTeacher || ({} as Record<string, Lesson[]>));

// 수업 목록이 갱신된 경우 시간표를 다시 그리기 위해 key에 사용
const lessonsLength = computed(() => lessonContext.lessons.length || 0);

const teacherList = computed(() => {
  const isEmpty =
    Object.keys(teacherCourseMap.value).length === 0 ||
    Object.keys(teacherCourseBaseMap.value).length === 0 ||
    Object.keys(courseMap.value).length === 0;
    Object.keys(courseBaseMap.value).length === 0;

  if (isEmpty) {
    return [];
  }

  return teacherContext.teachers.map((teacher) => {

    let className = '';
    if (teacher.classId && classMap.value[teacher.classId]) {
      const cls = classMap.value[teacher.classId];
      className = TimetableDisplayUtils.formatFullClassName(cls);
    }

    const courses = (teacherCourseMap.value[teacher.teacherId] || []).map(
      ({ courseId }) => courseMap.value[courseId]
    ) as Course[];

    const lessonConfsOfTeacher = lessonConfsMapByTeacher.value[teacher.teacherId] || [];

    // 실제 시수표에 배정된 과목 기준으로 기준 과목 이름들 추출
    const courseBasesOfLessonConfs = lessonConfsOfTeacher.map(lc => {
      return courseBaseMap.value[courseMap.value[lc.courseId]?.courseBaseId || ''];
    })
    .filter(cb => cb !== undefined) as CourseBase[];

    const courseBaseNames = TimetableDataUtils.courseBaseNames(courseBasesOfLessonConfs)
      .sort()
      .join(', ');

    const periodCount = lessonConfsOfTeacher.reduce((count, lessonConf) => {
      return count + (courseMap.value[lessonConf.courseId]?.periodCount || 0);
    }, 0);

    const teacherName = teacher.teacherName || null;
        
    return {
      id: teacher.teacherId,
      title: teacherName,
      className: className,
      editClassName: className || null,
      editTeacherName: teacherName || null,
      subtitle: courseBaseNames || '-',
      entity: { ...teacher, courses },
      periodCount: periodCount,
    } as TeacherTableItem;
  });
});


const filteredTeacherList = ref<TeacherTableItem[]>([]);

watch(
  () => [
    teacherList.value,
    filteredTeacherIds.value,    
  ],
  async ([teachers, filteredIds]) => {

    await nextTick();

    filteredTeacherList.value = [...teacherList.value.filter((teacher) => {
      return filteredTeacherIds.value.length === 0 || 
            filteredTeacherIds.value.includes(teacher.id);
    })].sort((a, b) => {
      // 교사명 기준으로 정렬
      return a.title.localeCompare(b.title);
    });
  },
  { immediate: true }
);


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
  const headerWidth = 5;
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
  period: number
) => {
  if (!teacherId) {
    return undefined;
  }

  const lessons = lessonsByTeacher.value[teacherId];
  if (!lessons) {
    return undefined;
  }

  const periodLessons = lessons.filter(
    (lesson) => lesson.dayOfWeek === dayOfWeek && lesson.period === period
  );
  
  const lesson = periodLessons.length > 0 ? periodLessons[0] : undefined;

  if(!lesson) {
    return undefined;
  }

  if(periodLessons.length > 1) {
    lesson.lessonClasses = periodLessons.map(l => l.classId) || [];
  }
  
  const lessonCell = {
    ...lesson,
    isHighlighted: false,
  } as LessonCell;

  if(selectedKey.value) {
    lessonCell.isHighlighted = Timetable.timetableStatusLessonIds[selectedKey.value]?.has(lesson.lessonId || '') || false;
  }
  
  return lessonCell;
};

const handleClickTeacherListItem = (teacher: Teacher) => {
  /*
  selectedTeacher.value = teacher;
  showType.value = ShowType.Edit;
  */
  showTeacherDetailView(teacher);
};

const showTeacherDetailView = (teacher: Teacher) => {
  if (!teacher) {
    return;
  }

  selectedTeacher.value = teacher;
  showType.value = ShowType.Edit;
};


const handleClickAllTeachers = () => {
  filteredTeacherIds.value = [];
  selectedTeacher.value = null;  
  showType.value = ShowType.List;
  resetSelectedStatusKey();
};

const closeCourseEditModal = () => {
  isCourseEditModal.value = false;
}

watch(
  () => [lessonContext.lessons, timetableStatus.value],
  async () => {
    genreateCount.value = Timetable.generateCounter;
    resetSelectedStatusKey();

    await nextTick();

    assignedLessonCount.value = lessonContext.lessons.length;
    remainingLessonCount.value = Timetable.countCurrentUnassigned;

    progressContext.assignedCount = assignedLessonCount.value;
    progressContext.remainingCount = remainingLessonCount.value;
  },
  { immediate: true }
);

watch(
  () => genreateCount.value,
  (newCount) => {

    if(newCount > 1 && lnbTab.value === 'teacher-list') {
      lnbTab.value = 'generate';
    }
  },
  { immediate: true }
)



// 도움말 열기 (부모로 이벤트 전달)
// const emit = defineEmits(['openHelp', 'close-help']);

// function openHelp(id: string) {
//   if (!id) {
//     emit('close-help');
//     emit('openHelp', '');
//     return;
//   }
//   emit('openHelp', id);
// }
</script>

<style scoped lang="scss">

// 교사별
.type-teacher{
  display: flex;
  gap: 40px;
  align-items: flex-start;

  .teacher-lnb{
    width: 280px;
    min-width: 280px;
    border: 1px solid #BDBDBD;
    border-radius: 12px;
    position: sticky;
    top: 168px;    
    height: calc(var(--vh, 1vh) * 100 - 285px);
    .tab-nav{
      padding: 12px;
      border-bottom: 1px solid #BDBDBD;
      button{ 
        padding: 0 22px;
        &.active{
          background-color: #1E3668;
          border: 1px solid #1E3668;
          color: #fff;
        }
      }
    }
    .filter-section{    
      padding: 12px;
      position: relative;
      display: flex;
      gap: 6px;
      input{padding:0 41px 0 32px;}
      .btn-tertiary{
        padding: 0 20px;
      }
      .ico-close-circle-fill{        
        position: absolute;
        right: 22px;
        top: 50%;
        transform: translateY(-50%);
      }
      .ico-search{
        position: absolute;
        left: 94px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        min-width: 16px;
        min-height: 16px;
        &::after{
          background-color: var(--default);
        }
      }
    }
    .table-content{
      &.sticky-wrap{
        height: calc(100% - 137px);
        //border-top: 1px solid #B7BFCD;        
      }
    }
    .generate-list{
      overflow: auto;
      height: calc(100% - 73px);
      li{
        border-bottom: 1px solid #EEEEEE;
        padding: 12px 16px;
        font-size: 14px;
        line-height: 160%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .count{
          color:#4778DE;
        }
        &.disabled{
          color: #9E9E9E;
          .count{
            color:#9E9E9E;
          }
        }
        &.tit{
          font-weight:700;
          justify-content: flex-start;
          gap: 0px;
          position: sticky;
          top: 0;
          background: #fff;
        }
        &:first-child,
        &:last-child{
          border-bottom: 0;
        }
        &.selected,
        &:not(.tit):not(.disabled):hover{background: #F1F4FC;}
        &:not(.tit):not(.disabled){
          cursor: pointer;
        }
      }
    }  
    .btns{
      position: absolute;
      top: 100%;
      margin-top: 10px;
      width: 100%;
      .btn-help{
        position: absolute;
        right: 94px;
        bottom: 14px;     
        border: 0px solid rgba(#fff, 0.5);
        &::after{
          background-color: #fff;
        } 
        &::before {
          background: var(--primary);
        }
        &.help-on{
            animation: helpOn-ani-w 1s ease-in-out infinite reverse;
          &::after{
            background-color: #fff;
          }
        }
      }
    }
  }
  .teacher-content{
    width:100%;
    min-height: calc(var(--vh) * 100 - 235px);
    h4{
      .btn-teacher{
        font-weight: var(--font-strong);
        font-size: 16px;
        // + .btn{
        //   display: none;
        // }
        &:hover{
          text-decoration: underline;
        }
      }
      // .btn-edit{
      //   display: none;
      // }
      // &:hover{
      //   .btn-edit{
      //     display: block;
      //   }
      // }
      position: relative;
      .edit-area{
        position: absolute;
        left: 0;
        top: calc(100% + 4px);
        z-index: 1;
        display: flex;
        gap: 8px;
        padding: 12px;
        border-radius: 10px;
        border:1px solid var(--gray-07);
        box-shadow: 0 4px 6px -4px rgba(0, 0, 0, 0.10), 0 10px 15px -3px rgba(0, 0, 0, 0.10);      
        background: #fff;
        input{width:160px;}
        .hi-selectbox{ 
          width:120px;
          ::v-deep .option__layer{
            width: max-content;
            min-width: 100%;
            max-width: 199px;
            button{
              white-space: normal;
            }
          }
        }
      }
    }
    .table-content {
      &.time-table {
        .h4-tit {
          .course-info {
            display: flex;
            align-items: center;
            font-weight: 700;
            font-size: 16px;
            .divider{margin:0 12px;}
          }          
        }
      }
    }
  } 

  .cursor-pointer {
    cursor: pointer;
  }
}
</style>