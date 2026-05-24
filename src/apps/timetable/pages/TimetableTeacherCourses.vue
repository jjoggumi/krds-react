<template>
  <section class="tt-teacher-courses">
    <div class="table-head sticky">
      <div class="search-area">
        <input type="text" v-model="searchKeyword" placeholder="교사명" spellcheck="false" maxlength="17"/>
        <button type="button" class="btn btn-tertiary ml-10">검색</button>
        <i v-if="searchKeyword" class="ico ico-close-circle-fill ico-size-24 ico-gray" @click="searchKeyword = ''"></i>
      </div>
      <div class="btn-area">
        <button type="button" class="btn btn-tertiary" @click="handleClickDeleteChecked" :disabled="!hasChecked">선택 삭제하기</button>
        <button type="button" class="btn btn-tertiary-blue ml-10" @click="handleClickAddTeacher">교사 추가</button>
        <button type="button" class="btn btn-tertiary-blue ml-10" @click="isOpenTeacherList = true">교사 명단 불러오기</button>
      </div>
    </div>
    <div class="table-content table-form sticky-wrap table-box">
      <table>
        <caption>
          과목 등록
        </caption>
        <colgroup>
          <col style="width: 10%" />
          <col style="width: 50%" />
          <col style="width: 20%" />
          <col style="width: 20%" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" class="sticky-top">
              <div class="form-check">
                <input type="checkbox" id="allChecked" v-model="allChecked" @change="toggleAllChecked" />
                <label for="allChecked"></label>
              </div>
            </th>
            <th scope="col" class="sticky-top">
              이름
              <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
            </th>
            <!-- <th scope="col">
              과목 등록 
              <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
            </th> -->
            <th scope="col" class="sticky-top">
              담당학급
              <!-- <button type="button" class="btn btn-link btn-help" :class="{ 'help-on': helpOn === '담당학급' }" @click="openHelp('담당학급')">
                <span class="sr-only">도움말</span>
              </button> -->
              <HelpButton 
                :id="'담당학급'"
                :active="helpOn === '담당학급'"
              />
            </th>
            <th scope="col" class="sticky-top">삭제</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(teacher, index) in teachers" :key="teacher.tempKey">
            <td>
              <div class="form-check">
                <input type="checkbox" v-model="teacher.checked" :id="`filteredTeacherCourses-${index}`" @click="handleClickChecked(teacher)" />
                <label :for="`filteredTeacherCourses-${index}`"></label>
              </div>
            </td>
            <td :class="{ error: false }">
              <div class="input-wrap">
                <input
                  :ref="(el) => (teacherNameRefs[index] = el)"
                  type="text"
                  v-model="teacher.teacherName"
                  placeholder="교사명"
                  :class="{ error: false }"
                  @keydown="handleKeydownTeacherName(teacher, index, $event)"
                  @focus="handleFocusTeacherName(teacher, index)"
                  @blur="handleBlurTeacherName(teacher, index)"
                  spellcheck="false"
                />
              </div>
            </td>
            <!-- <td>                          
              <CourseSelect
                :index="index"
                :tags="courses"
                :selectedTags="teacherCourseMap[teacher.teacherId] || []"
                :placeholder="!teacherCourseMap[teacher.teacherId] || teacherCourseMap[teacher.teacherId].length === 0 ? '과목명 입력' : ''"
                :is-error="false" 
                @add:tags="(course) => handleClickAddCourse(course, teacher, index)"
                @remove:tags="(course) => handleClickRemoveCourse(course, teacher, index)"
                @click.stop
                :disabled="!teacher.teacherId"
              /> 
            </td> -->
            <td>
              <AutocompleteInputWithValue
                v-model="teacher.className"
                :options="classNameItems"
                placeholder="연결"
                nodata="일치하는 학급이 없습니다."
                :on-remove-value="() => handleRemoveTeacherClass(teacher)"
                :on-update="(classId) => handleUpdateTeacherClass(teacher, classId)"
                :is-error="false"
                :disabled="!teacher.teacherId"
                :class="{ 'opt-top': index > 5 }"
              />
            </td>
            <td>
              <button type="button" @click="handleClickDeleteTeacher(teacher)">
                <i class="ico ico-trash ico-size-20 ico-gray"></i>
              </button>
            </td>
          </tr>
          <tr v-if="teachers.length === 0">
            <td colspan="4">
              <div class="hi-nodata sm">
                <p>검색결과가 없습니다.</p>
              </div>
            </td>
          </tr>
          <tr v-if="!searchKeyword">
            <td colspan="4" class="tfoot">ENTER 키로 다음 칸으로 이동하세요.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <TimetableTeacherList v-if="isOpenTeacherList" @close="isOpenTeacherList = false" />
  </section>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import { inject, ref, computed, onMounted, watch, ComponentPublicInstance, nextTick, readonly, getCurrentInstance } from 'vue';
import CourseSelect from '@/apps/timetable/components/CourseSelect.vue';
import TimetableTeacherList from '@/apps/timetable/components/TimetableTeacherList.vue';
import AutocompleteInputWithValue from '@/apps/timetable/components/AutocompleteInputWithValue.vue';
import AutocompleteInput from '@/apps/timetable/components/AutocompleteInput.vue';

import { Class, Course, CourseOfTeacher, Teacher, TeacherCourse } from '@/apps/timetable/core/types';
import {
  ContextKeys,
  TeacherCourseContext,
  TimetableClassContext,
  TimetableCourseContext,
  TimetableGradeContext,
  TimetableTeacherContext,
} from '../contexts';
import { useDialog } from '../composables/dialog';
import { TeacherForAdd, TeacherForUpdate } from '../contexts/timetable-teacher-context';

import HelpButton from '@/apps/timetable/components/HelpButton.vue';

interface EditableTeacher extends Teacher {
  checked: boolean;
  showList: boolean;
  className?: string;
  tempKey: string; // 임시 키
}

//@ts-ignore
const { proxy } = getCurrentInstance();

const dialog = useDialog();

const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;

const props = defineProps({
  helpOn: {
    type: String,
    default: 0,
  },
});

const searchKeyword = ref('');
const allChecked = ref(false);
const hasChecked = ref(false);
const isOpenTeacherList = ref(false);
const teacherNameRefs = ref<(Element | null | ComponentPublicInstance)[]>([]);

// const isExistEmptyTeacher = computed(() => {
//   return teacherContext.teachers.some((teacher) => !teacher.teacherId);
// });

const courses = computed(() => {
  return courseContext.courses.filter((course: Course) => !(course.isConcurrent || course.isUnified)) as Course[];
});

const courseMap = computed(() => {
  return (
    courses.value.reduce((acc: Record<string, Course>, course: Course) => {
      acc[course.courseId] = course;
      return acc;
    }, {} as Record<string, Course>) || ({} as Record<string, Course>)
  );
});

const gradeNameMap = computed(() => {
  return (
    gradeContext.timetableConfig.grades.reduce((acc: Record<number, string>, grade) => {
      acc[grade.grade] = grade.gradeName || `${grade.grade} -`;
      return acc;
    }, {} as Record<number, string>) || ({} as Record<number, string>)
  );
});

// const classes = computed(() => classContext.classes as Class[]);
const classMap = computed(() => classContext.classMap as Record<string, Class>);

const classNameItems = computed(() => {
  const assignedClasses = teacherContext.teachers.filter((teacher) => teacher.classId).map((teacher) => teacher.classId);

  return classContext.classes
    .filter((cls) => !cls.isVirtual)
    .map((cls) => {
      const className = classMap.value[cls.classId]?.className || `${cls.classNumber}`;
      const disabled = assignedClasses.includes(cls.classId);
      return {
        value: cls.classId,
        text: `${gradeNameMap.value[cls.grade]} ${className}`,
        options: {
          disabled,
        },
      };
    });
});

const classNameMap = computed(() => {
  return (
    classContext.classes.reduce((acc: Record<string, string>, cls: Class) => {
      const className = `${gradeNameMap.value[cls.grade]} ${cls.className || cls.classNumber}`;
      acc[cls.classId] = className;
      return acc;
    }, {} as Record<string, string>) || ({} as Record<string, string>)
  );
});

const teachers = computed(() => {

  return teacherContext.teachers
    .filter((teacher) => {
      if (!searchKeyword.value) {
        return true;
      }

      const courseOfTeacher = teacherCourseMap.value[teacher.teacherId];
      if (!courseOfTeacher || courseOfTeacher.length === 0) {
        return false;
      }

      return (courseOfTeacher.some((course) => {
          return course.displayedTitle.includes(searchKeyword.value) || course.standardCourseTitle?.includes(searchKeyword.value);
        })
      );
    })
    .map((teacher) => {
      (teacher as EditableTeacher).checked = false;
      (teacher as EditableTeacher).showList = false;
      (teacher as EditableTeacher).tempKey = uuidv4(); // 임시 키 생성

      if (teacher.classId) {
        const className = classNameMap.value[teacher.classId] || '';
        teacher.className = className;
      }

      return teacher as EditableTeacher;
    }) as EditableTeacher[];
});

const teacherCourseMap = computed(() => {
  return (
    teacherCourseContext.teacherCourses.reduce((acc: Record<string, CourseOfTeacher[]>, teacherCourse: TeacherCourse) => {
      if (!acc[teacherCourse.teacherId]) {
        acc[teacherCourse.teacherId] = [];
      }

      acc[teacherCourse.teacherId].push({
        ...courseMap.value[teacherCourse.courseId],
        sortNoOfTeacher: teacherCourse.sortNo,
        teacherId: teacherCourse.teacherId,
      } as CourseOfTeacher);

      acc[teacherCourse.teacherId].sort((a, b) => a.sortNoOfTeacher - b.sortNoOfTeacher);

      return acc;
    }, {} as Record<string, CourseOfTeacher[]>) || ({} as Record<string, CourseOfTeacher[]>)
  );
});

const handleClickDeleteTeacher = async (teacher: EditableTeacher) => {
  const confirmed = await dialog.confirmSimple('이 교사를 삭제하시겠습니까?');
  if (!confirmed) return;
  removeTeacherFromList(teacher);
  if (teacher.teacherId) {
    await teacherContext.deleteWithIds([teacher.teacherId]);
  }
};

onMounted(async () => {
  initData();
});

const initData = async () => {
  searchKeyword.value = '';

  await gradeContext.reload();
  await teacherCourseContext.reload();
  await classContext.reload();
  await courseContext.reload();
  await teacherContext.reload();

  if (teachers.value.length === 0) {
    addEmptyTeacher();
  }
};

const addEmptyTeacher = async () => {
  searchKeyword.value = '';
  teacherContext.teachers.push({
    teacherId: '',
    teacherName: '',
    classId: '',
  } as Teacher);

  await nextTick();

  const lastTeacherIndex = teachers.value.length - 1;
  const lastTeacherNameRef = teacherNameRefs.value[lastTeacherIndex];
  if (lastTeacherNameRef && 'focus' in lastTeacherNameRef) {
    (lastTeacherNameRef as HTMLInputElement).focus();
  }
};

const beforeEditedTeacherName = ref('');

const backupPreviousTeacherName = (teacher: Teacher) => {
  beforeEditedTeacherName.value = teacher.teacherName.trim();
};

const resetBackupPreviousTeacherName = () => {
  beforeEditedTeacherName.value = '';
};

const handleFocusTeacherName = (teacher: Teacher, index: number) => {
  // beforeEditedTeacherName.value = teacher.teacherName.trim();
  backupPreviousTeacherName(teacher);
};

const handleBlurTeacherName = async (teacher: Teacher, index: number) => {
  // const { teacher } = teacherCourseMatch;
  if (teacher.teacherName.trim() === '') {
    return;
  }

  if (beforeEditedTeacherName.value === teacher.teacherName.trim()) {
    return;
  }

  resetBackupPreviousTeacherName();

  if (teacher.teacherId) {
    // 기존 교사 이름이 변경된 경우
    await teacherContext.updateTeacherName({
      teacherId: teacher.teacherId,
      teacherName: teacher.teacherName.trim(),
      classId: teacher.classId || '',
    } as TeacherForUpdate);
    return;
  }

  // 새 교사 추가
  const added = await teacherContext.add({
    teacherName: teacher.teacherName.trim(),
    teacherId: '',
  } as TeacherForAdd);

  if (added) {
    teacher.teacherId = added.teacherId;
  }
};

const handleKeydownTeacherName = async (teacher: EditableTeacher, index: number, event: KeyboardEvent) => {
  if (event.key === 'Enter' && index === teachers.value.length - 1) {
    if (teacher.teacherName.trim() === '') {
      await dialog.alertSimple('교사를 등록해주세요.');
      return;
    }

    addEmptyTeacher();
  }
};

const handleClickAddTeacher = async () => {
  // 교사 추가 버튼 클릭
  await addEmptyTeacher();
};

const handleClickAddCourse = async (course: Course, teacher: Teacher, index: number) => {
  const maxCourseCount = 10; // 최대 과목 수
  const teacherCourses = teacherCourseMap.value[teacher.teacherId] || [];

  if (teacherCourses.some((t) => t.courseId === course.courseId)) {
    // 이미 등록된 과목
    return;
  }

  if (teacherCourses.length >= maxCourseCount) {
    await dialog.alertSimple(`과목은 최대 ${maxCourseCount}개까지 등록 가능합니다.`);
    return;
  }

  const { teacherId } = teacher;
  const { courseId } = course;

  const addedTeacherCourse = await teacherCourseContext.addCourseToTeacher(teacherId, courseId);

  if (!addedTeacherCourse) {
    console.error('Failed to add teacher course:', teacherId, courseId);
    return;
  }
};

const handleClickRemoveCourse = async (course: Course, teacher: Teacher, index: number) => {
  if (!(await confirmDeleteTeacherCourse())) {
    return;
  }

  const { teacherId } = teacher;
  const { courseId } = course;

  await teacherCourseContext.deleteCourseFromTeacher(teacherId, courseId);
};

const handleUpdateTeacherClass = async (teacher: EditableTeacher, classId: string | null) => {
  await teacherContext.updateTeacherClass({
    teacherId: teacher.teacherId,
    teacherName: teacher.teacherName.trim(),
    classId: classId || '',
  });
};

const handleRemoveTeacherClass = async (teacher: EditableTeacher) => {
  await teacherContext.removeTeacherClass(teacher.teacherId);
};

const handleClickChecked = (teacher: EditableTeacher) => {
  teacher.checked = !teacher.checked;

  toggleAllCheckeWithTeacherChecks();
  toggleHasChecked();
};

const toggleAllCheckeWithTeacherChecks = () => {
  allChecked.value = teachers.value.every((teacher) => teacher.checked);
};

const toggleHasChecked = () => {
  hasChecked.value = teachers.value.some((teacher) => teacher.checked);
};

const toggleAllChecked = () => {
  teachers.value.forEach((teacher) => (teacher.checked = allChecked.value));
  hasChecked.value = allChecked.value;
};

const handleClickDeleteChecked = async () => {
  try {
    const selectedTeachers = teachers.value.filter((teacher) => teacher.checked);
    if (selectedTeachers.length === 0) {
      return;
    }

    if (!(await confirmDeleteTeacher())) {
      return;
    }

    // 목록에서 삭제
    selectedTeachers.forEach((teacher) => {
      removeTeacherFromList(teacher);
    });

    const teacherIds = selectedTeachers.filter((teacher) => teacher.teacherId).map((teacher) => teacher.teacherId);
    if (teacherIds.length > 0) {
      await teacherContext.deleteWithIds(teacherIds);
    }

    allChecked.value = false;
    toggleHasChecked();
  } catch (error) {
    console.error('Error deleting checked teachers:', error);
  }
};

const removeTeacherFromList = async (teacher: EditableTeacher) => {
  const index = teachers.value.findIndex((t) => t.tempKey === teacher.tempKey);
  if (index === -1) {
    return;
  }
  teacherContext.teachers.splice(index, 1);
};

const confirmDeleteTeacher = async () => {
  return await dialog.confirmSimple('선택하신 교사를 삭제하시겠습니까?');
};

const confirmDeleteTeacherCourse = async () => {
  return await dialog.confirmSimple('선택하신 과목을 삭제하시겠습니까?');
};

const confirm = async (message: string) => {
  const confirmed = await dialog.confirm?.(message, null, {
    customClass: {
      popup: 'timetable-confirm',
      confirmButton: 'btn-warning',
    },
    showCloseButton: true,
  });

  return confirmed;
};

const findTeachersWithoutCourses = () => {
  return teachers.value.filter((teacher) => {
    // 등록된 교사 중 과목이 없는 경우
    if (!teacher.teacherId) {
      return false; // 교사 ID가 없는 경우는 제외
    }

    return !teacherCourseMap.value[teacher.teacherId] || teacherCourseMap.value[teacher.teacherId].length === 0;
  });
};

const findMultiTeacherCoursesWithoutTeachers = () => {
  // 복수 교사가 체크된 과목 중 교사가 2명 이상 등록되지 않은 경우
  const multiTeacherCourses = courses.value.filter((course) => {
    return course.isDoubleTeacher;
  });

  return multiTeacherCourses.filter((course) => {
    return teacherCourseContext.teacherCourses.filter((tc) => tc.courseId === course.courseId).length < 2;
  });
};

const findUnregisteredClasses = () => {
  // 담당 학급이 등록되지 않은 교사 확인
  const registeredClassesIds = teachers.value
    .filter((teacher) => {
      return teacher.classId;
    })
    .map((teacher) => teacher.classId);

  return classContext.classes.filter((cls) => {
    return !cls.isVirtual && !registeredClassesIds.includes(cls.classId);
  });
};

// PageTitle Component의 "다음" 버튼 클릭에 의해 호출됨
const checkBeforeMove = async () => {

  // 과목 미등록 교사 확인
  if (findTeachersWithoutCourses().length > 0) {
    await dialog.alertSimple('과목이 등록되지 않은 교사가 있습니다.');
    return false;
  }

  // 복수 교사가 과목 확인
  if (findMultiTeacherCoursesWithoutTeachers().length > 0) {
    await dialog.alertSimple('복수 교사가 체크된 과목은 2명 이상의 교사가 등록되어야 합니다.');
    return false;
  }

  if (findUnregisteredClasses().length > 0) {
    await dialog.confirmSimple(`
      등록되지 않은 담당 학급이 있습니다. <br>다음으로 넘어가시겠습니까?
      <div class="blue-box"> 
        <i class="hi-ico ico-primary ico-warning-circle-fill ico-size-18"></i>
        담당학급이 입력된 경우 해당 학급 종료 시간<br>이후에 수업이 배정되지 않습니다.
      </div>`);
    return false;
  }

  return true;
};

defineExpose({
  checkBeforeMove,
});

// published -->
const teacherCourse = ref([
  {
    teacher: '김선생',
    courses: [
      { courseId: 1, standardCourseTitle: '국어', displayedTitle: '국어', periodCount: 5 },
      { courseId: 2, standardCourseTitle: '수학', displayedTitle: '수학', periodCount: 5 },
      { courseId: 3, standardCourseTitle: '영어', displayedTitle: '영어', periodCount: 4 },
    ],
    clazz: '1-4',
    checked: false,
    showList: false,
  },
  {
    teacher: '이선생',
    courses: [
      { courseId: 1, standardCourseTitle: '국어', displayedTitle: '국어', periodCount: 5 },
      { courseId: 2, standardCourseTitle: '수학', displayedTitle: '수학', periodCount: 5 },
    ],
    clazz: '1-5',
    checked: false,
    showList: false,
  },
  { teacher: '박선생', courses: [], clazz: '2-1', checked: false, showList: false },
  { teacher: '최선생', courses: [], clazz: '2-2', checked: false, showList: false },
]);

// const hasChecked = computed(() => teacherCourse.value.some((crs) => crs.checked));

function addTeacher() {
  teacherCourse.value.push({
    teacher: '',
    courses: [],
    clazz: '',
    checked: false,
    showList: false,
  });
}

function hideSuggestion(index) {
  setTimeout(() => {
    teacherCourse.value[index].showList = false;
  }, 150);
}

// const emit = defineEmits(['openHelp', 'close-help']);

// function openHelp(id: string) {
//   if (!id) {
//     emit('close-help');
//     emit('openHelp', '');
//     return;
//   }
//   emit('openHelp', id);
// }
function noti() {
  dialog
    ?.confirm('과목 등록은 100개까지 가능합니다.', null, {
      showCancelButton: false,
      customClass: 'timetable-confirm',
      showCloseButton: true,
    })
    .then(() => {})
    .catch(() => {});
}

function noti1() {
  dialog
    ?.confirm('선택한 과목을 삭제하시겠습니까?', null, {
      customClass: {
        popup: 'timetable-confirm',
        confirmButton: 'btn-warning',
      },
      showCloseButton: true,
    })
    .then(() => {})
    .catch(() => {});
}

function noti2() {
  dialog
    ?.confirm('복수교사가 체크된 과목은 2명 이상 <br>교사가 등록되어야 합니다.', null, {
      showCancelButton: false,
      customClass: 'timetable-confirm',
      showCloseButton: true,
    })
    .then(() => {})
    .catch(() => {});
}

function noti3() {
  dialog
    ?.confirm(
      `
    연결되지 않은 담당학급이 있습니다. <br>담당 학급을 연경해주세요.
    <div class="blue-box"> 
      <i class="hi-ico ico-primary ico-warning-circle-fill ico-size-18"></i>
      담당학급이 다 연결되지 않은 경우<br>시간표 배정에 오류가 발생할 수 있습니다.
    </div>`,
      null,
      {
        showCancelButton: false,
        customClass: 'timetable-confirm',
        showCloseButton: true,
      }
    )
    .then(() => {})
    .catch(() => {});
}
</script>

<style lang="scss" scoped>
.tt-teacher-courses {
  .search-area {
    position: relative;
    input[type="text"] {
      padding-right: 40px;
    }
    .ico.ico-close-circle-fill {
      position: absolute;
      left: 225px;
      top: 50%;
      transform: translateY(-50%);
      &::after {
        background-color: var(--gray-08) !important;
      }
    }
  }
  .course-select {
    ::v-deep .selected-tags {
      padding: 6px;
      .autocomplete-list {
        width: 280px;
      }
    }
  }
  .autocomplete-wrap {
    ::v-deep{
      &.opt-top {
        .autocomplete-list {
          bottom: calc(100% - 6px);
        }
      }
      .autocomplete-list {
        min-width: 240px;
        top: calc(100% - 6px);
        left: 50%;
        transform: translateX(-50%);
      }
    } 
  }

  .table-content {
    max-height: calc(var(--vh) * 100 - 244px);
    min-height: 510px;
  }
}
</style>
