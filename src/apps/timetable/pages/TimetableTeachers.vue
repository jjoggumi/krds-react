<template>
  <section class="tt-teacher-courses">
    <TimetableTip class="mb-20">
      <template #header>
        <div>
          <span class="badge tip mr-05">TIP!</span> 복사/붙여넣기로 교사명을 한번에 등록할 수 있어요!
        </div>
      </template>
      <template #content>
        <div class="tip-guide">
          <ol>
            <li>
              엑셀, 한글, 구글 시트에서 예시와 동일한 형식으로 교사명을 입력한 뒤 복사 (Ctrl+C) 하세요.              
              <ul>
                <li>
                  <span class="txt-warning">동명이인인 경우, 이름을 구분</span>하여 작성해주세요. (홍길동A, 홍길동B)
                </li>
              </ul>
              <div class="table-content sm-radius mt-15">
                <table>
                  <thead>
                    <tr>
                      <th>이름</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>홍길동A</td></tr>
                    <tr><td>홍길동B</td></tr>
                    <tr><td>김하이</td></tr>
                    <tr><td>김나나</td></tr>
                  </tbody>
                </table>
              </div>
            </li>
            <li class="divider"></li>
            <li>
              붙여넣기할 셀을 선택하고 붙여넣기 (Ctrl+V)하면 교사명이 추가됩니다.
              <ul>
                <li>기존 입력된 교사명은 덮어쓰지 않고 <span class="txt-warning">추가 등록</span>됩니다.</li>
                <li><span class="txt-warning">담당학급은 교사명 복붙 후 직접 선택</span>하여 등록해야 합니다. (복사/붙여넣기 불가)</li>
              </ul>
            </li>
          </ol>
        </div>
      </template>
    </TimetableTip>
    <div class="table-head sticky">
      <HiSearchBox
        v-model="searchKeyword"
        :auto-search="true"
        placeholder="교사명 검색"
        :maxlength="17"
      />
      <div class="btn-area">
        <button type="button" class="btn btn-tertiary" @click="handleClickDeleteChecked" :disabled="!hasChecked">선택 삭제하기</button>
        <!-- <button type="button" class="btn btn-tertiary-blue" @click="showComingSoon">엑셀 양식 다운로드</button>
        <button type="button" class="btn btn-tertiary-blue" @click="showComingSoon">일괄 업로드</button>
        <button type="button" class="btn btn-tertiary-blue" @click="showComingSoon">교사 명단 불러오기</button> -->
        <button type="button" class="btn btn-primary" @click="handleClickAddTeacher">교사 추가</button>
      </div>
    </div>
    <div class="table-content table-form sticky-wrap table-box">
      <table>
        <caption>
          과목 등록
        </caption>
        <colgroup>
          <col style="width: 10%" />
          <col style="width: 40%" />
          <col style="width: 40%" />
          <col style="width: 10%" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" class="sticky-top">
              <div class="form-check">
                <input
                  type="checkbox"
                  id="allChecked"
                  v-model="allChecked"
                  @change="toggleAllChecked" 
                  :disabled="isDisabledAllChedkbox" />
                <label for="allChecked"></label>
              </div>
            </th>
            <th scope="col" class="sticky-top">
              교사 이름 ({{ countResultTeachers }})
              <button type="button" 
                class="btn btn-link btn-sort"
                :class="{
                  'asc': orderBy !== ListOrder.NAME_DESC,
                  'desc': orderBy === ListOrder.NAME_DESC
                }"
                @click="handleClickTeacherNameHeader"
                ><span class="sr-only">정렬</span></button>
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
          <tr v-for="(teacher, index) in searchedEditableTeachers" :key="`${teacher.tempKey}-${teacher.teacherId}`" :class="{ error: isDuplicate(teacher.teacherName, teacher.tempKey) }">
            <td>
              <div class="form-check">
                <input type="checkbox"
                  v-if="!isUndeletable"
                  v-model="teacher.checked"
                  :id="`filteredTeacherCourses-${index}`"
                  @click="handleClickChecked(teacher)"
                  :disabled="isFinished && initialzedTeacherIds.has(teacher.teacherId)"
                />
                <label :for="`filteredTeacherCourses-${index}`"></label>
              </div>
            </td>
            <td>               
              <div class="input-wrap">
                <HiTooltip v-if="isDuplicate(teacher.teacherName, teacher.tempKey)" class="hi-tooltip-wrap w-full h-full" ico="none" titleHtml="동일한 교사명이 있습니다" position="top">
                  <div slot="button" class="w-full h-full">
                    <input
                      :ref="(el) => (teacherNameRefs[index] = el)"
                      type="text"
                      v-model="teacher.teacherName"
                      placeholder="교사명"
                      :class="{ error: isDuplicate(teacher.teacherName, teacher.tempKey) }"
                      @keydown="handleKeydownTeacherName(teacher, index, $event)"
                      @focus="handleFocusTeacherName(teacher, index)"
                      @blur="handleBlurTeacherName(teacher, index)"
                      @paste="handlePaste($event, index)"
                      spellcheck="false"
                    />
                  </div>
                </HiTooltip>
                <input
                  v-else
                  :ref="(el) => (teacherNameRefs[index] = el)"
                  type="text"
                  v-model="teacher.teacherName"
                  placeholder="교사명"
                  :class="{ error: isDuplicate(teacher.teacherName, teacher.tempKey)}"
                  @keydown="handleKeydownTeacherName(teacher, index, $event)"
                  @focus="handleFocusTeacherName(teacher, index)"
                  @blur="handleBlurTeacherName(teacher, index)"
                  @paste="handlePaste($event, index)"
                  spellcheck="false"
                />
              </div>
            </td>
            <td>              
              <AutocompleteInputWithValue
                :ref="(el) => (teacherClassRefMap[teacher.tempKey] = el)"
                v-model="teacher.className"
                :options="classNameItems"
                placeholder="학급 선택"
                nodata="일치하는 학급이 없습니다."
                :on-remove-value="() => handleRemoveTeacherClass(teacher)"
                :on-update="(classId) => handleUpdateTeacherClass(teacher, classId)"
                :on-blur="($event) => handleBlurTeacherClass(teacher, index, $event)"
                :is-error="isDuplicate(teacher.teacherName, teacher.tempKey)"
                :disabled="!teacher.teacherId"
                :class="{ 'opt-top': index > 5 }"
                v-if="teacher.teacherId"
              />
              <div class="input-wrap empty-class-cover error" 
                v-else
                @click="() => handleClickEmptyClassWithoutTeacher(index)" 
              >학급 선택</div>
            </td>
            <td>
              <!-- <button type="button"
                v-if="!(isFinished && initialzedTeacherIds.has(teacher.teacherId)) && !isUndeletable"
                class="btn btn-ghost"
                @click="handleClickDeleteTeacher(teacher)"
                >
                <i class="ico ico-trash ico-size-20 ico-gray"></i>
              </button> -->
            </td>
          </tr>
          <tr v-if="editableTeachers.length === 0">
            <td colspan="4">
              <div class="hi-nodata sm">
                <p>목록이 없습니다.</p>
              </div>
            </td>
          </tr>
          <tr  v-if="!searchKeyword && editableTeachers.length > 0" >
            <td colspan="4" class="tfoot">ENTER 키로 다음 칸으로 이동하세요.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <TimetableTeacherList v-if="isOpenTeacherList" @close="isOpenTeacherList = false" />

    <DataEntryNoticeModal 
      v-if="isShowDataEntryNoticeModal" 
      :noticeType="noticeType" 
      @close="handleCloseDataEntryNoticeModal"
    />
  </section>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import { inject, ref, computed, onMounted, watch, ComponentPublicInstance, nextTick, getCurrentInstance } from 'vue';
import TimetableTeacherList from '@/apps/timetable/components/TimetableTeacherList.vue';
import AutocompleteInputWithValue from '@/apps/timetable/components/AutocompleteInputWithValue.vue';
import TimetableTip from '@/apps/timetable/components/TimetableTip.vue';
import DataEntryNoticeModal from '../components/DataEntryNoticeModal.vue';
import {CourseBaseTitle, NoticeType} from '../common/types';

import {Class, CourseBase, Teacher, TimetableStatus} from '@/apps/timetable/core/types';
import {
  ContextKeys,
  TimetableClassContext,
  TimetableGradeContext,
  TimetableProgressContext,
  TimetableTeacherContext,
  LessonConfContext,
} from '../contexts';
import { useDialog } from '../composables/dialog';
import { TeacherForAdd, TeacherForUpdate } from '../contexts/timetable-teacher-context';
import { TimetableDisplayUtils } from '../common/utils';
import HelpButton from '@/apps/timetable/components/HelpButton.vue';

const { proxy } = getCurrentInstance() as any;

interface EditableTeacher extends Teacher {
  checked: boolean;
  showList: boolean;
  className?: string;
  tempKey: string; // 임시 키
  orderNo: number; // 현재 목록에서의 정렬 순서
}

//@ts-ignore
const dialog = useDialog();

const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;

const props = defineProps({
  helpOn: {
    type: String,
    default: 0,
  },
});

enum ListOrder {
  NAME_ASC,
  NAME_DESC,
}

const orderBy = ref<ListOrder|null>(null);
const searchKeyword = ref('');
const allChecked = ref(false);
const hasChecked = ref(false);
const isOpenTeacherList = ref(false);
const teacherNameRefs = ref<(Element | null | ComponentPublicInstance)[]>([]);
const editableTeachers = ref<EditableTeacher[]>([]);
const teacherClassRefMap = ref<Record<string, Element | null | ComponentPublicInstance>>({});
const initialzedTeacherIds = ref<Set<string>>(new Set());

// 데이터 수정 관련 안내 팝업  상태
const noticeType = ref<NoticeType>(NoticeType.None);
const isShowDataEntryNoticeModal = ref(false);
const handleCloseDataEntryNoticeModal = () => {
  isShowDataEntryNoticeModal.value = false;
};

const isFinished = computed(() => progressContext.status === TimetableStatus.Finish);
const fromNextStep = computed(() => proxy.$route && proxy.$route.params && proxy.$route.params?.moveType === 'prev');

const isDisabledAllChedkbox = computed(() => {
  return searchedEditableTeachers.value.length < 2 || (isFinished.value && searchedEditableTeachers.value.every(teacher => initialzedTeacherIds.value.has(teacher.teacherId)));
});


const isUndeletable = computed(() => {
  return editableTeachers.value.length < 2;
});

const countResultTeachers = computed(() => {
  return searchedEditableTeachers.value.filter((teacher) => teacher.teacherId && teacher.teacherName.trim() !== '').length || 0
  // return searchedEditableTeachers.value.length || 0;
});

const classNameItems = ref<Array<{ value: string; text: string; options?: { disabled: boolean } }>>([]);

const refreshClassNameItems = async () =>{
  classNameItems.value = [];
  
  // const assignedClasses = teacherContext.teachers.filter((teacher) => teacher.classId).map((teacher) => teacher.classId);
  const assignedClasses = editableTeachers.value.filter((teacher) => teacher.classId).map((teacher) => teacher.classId);
  
  const items = classContext.classes
    .filter((cls) => !cls.isVirtual)
    .map((cls) => {
      const className = TimetableDisplayUtils.formatFullClassName(cls);
      const disabled = assignedClasses.includes(cls.classId);
      return {
        value: cls.classId,
        text: className,
        options: {
          disabled,
        },
      };
    });

  const abledItems = items.filter((item) => !item.options?.disabled);
  if(abledItems.length === 0) {
  items.push({
      value: '',
      text: '배정할 학급이 없습니다.',
      options: {
        disabled: false,
      },
    });
  }

  classNameItems.value = items;
}

watch(
  () => [classContext.classes, editableTeachers.value],
  async ([newClasses, newTeachers]) => {
    await nextTick();
    await refreshClassNameItems();    
  },
  { immediate: true }
);

const classNameMap = computed(() => {
  return (
    classContext.classes.reduce((acc: Record<string, string>, cls: Class) => {
      const className = TimetableDisplayUtils.formatFullClassName(cls);
      acc[cls.classId] = className;
      return acc;
    }, {} as Record<string, string>) || ({} as Record<string, string>)
  );
});

const confirmDelete = async (teacherIds: string[] | undefined = undefined) => {
  const isInUseTeacher = teacherIds && teacherIds.find((id) => checkInUseTeacher(id)) !== undefined;
  if (progressContext.isFirstTemplate && isInUseTeacher) {
    return await dialog.confirm(`
    5단계 시수표에 등록된 교사가 포함되어 있습니다.<br/>그래도 삭제하시겠습니까?
    <div class="blue-box"> 
      <i class="hi-ico ico-primary ico-warning-circle-fill ico-size-18"></i>
      교사 삭제로 인해 시수표가 변경될 경우 <strong>7단계에서 작성한 데이터</strong>가 삭제될 수 있습니다.
    </div>      
    `, null, {
      customClass: 'timetable-confirm',
      showCloseButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소'
    });
  }

  return await dialog.confirmSimple('선택하신 교사를 삭제하시겠습니까?');
};

const deleteTeacherWithIds = async (teacherIds: string[]) => {
  const isInUseTeacher = checkInUseTeacher(teacherIds[0]);
  await teacherContext.deleteWithIds(teacherIds);

  if(isInUseTeacher) {
    await lessonConfContext.reload();
    await initTeacherIdsInUse();
  }
};

const handleClickDeleteTeacher = async (teacher: EditableTeacher) => {
  const { classId, teacherId, teacherName } = teacher;
  
  if(!classId && !teacherId && !teacherName) {
    // 빈 항목인 경우 바로 삭제
    await removeTeacherFromList(teacher);
    return;
  }

  if (!(await confirmDelete([teacherId]))) {
    return;
  }

  await removeTeacherFromList(teacher);
  if (teacher.teacherId) {
    await deleteTeacherWithIds([teacher.teacherId]);
  }

  editableTeachers.value = editableTeachers.value.filter((t) => t.tempKey !== teacher.tempKey);
  
  await nextTick();
  await refreshClassNameItems();
};

const handleClickTeacherNameHeader = () => {
  if (orderBy.value === ListOrder.NAME_ASC) {
    orderBy.value = ListOrder.NAME_DESC;
    return;
  }
  
  orderBy.value = ListOrder.NAME_ASC;
};

const showNoticeIfNotSeen = (key: NoticeType) => {
  if (!sessionStorage.getItem(key)) {
    noticeType.value = key;
    isShowDataEntryNoticeModal.value = true;
    sessionStorage.setItem(key, 'true');
  }
};

onMounted(async () => {
  console.log('>>> TimetableTeachers onMounted');
  
  await progressContext.reload();

  if (!progressContext.checkAccessible(TimetableStatus.Teacher)) {
    proxy.$router.replace({ name: 'TimetableBasicInfo' });
    return;
  }

  /*
   * 2026.01.19, 이전 단계 이동 제한 해제
  if (progressContext.isFinished) {
    proxy.$router.replace({ name: 'TimetableGenerate' });
    return;
  }
  */

  if (fromNextStep.value) {
    showNoticeIfNotSeen(NoticeType.DataEditNotice);
  }

  initData();
});

const initData = async () => {
  searchKeyword.value = '';

  await gradeContext.reload();
  await classContext.reload();
  await teacherContext.reload();  

  await lessonConfContext.reload();
  await initTeacherIdsInUse();

  editableTeachers.value = teacherContext.teachers.map((teacher, index) => {
    const editableTeacher: EditableTeacher = {
      ...teacher,
      checked: false,
      showList: false,
      className: teacher.classId ? (classNameMap.value[teacher.classId] || '') : '',
      tempKey: uuidv4(),
      orderNo: index + 1,
    };
    return editableTeacher;
  });

  if (editableTeachers.value.length === 0) {
    addEmptyTeacher();
  }

  // 현재 단계에서 추가된 항목인지를 확인하기 위해 초기 데이터만 저장
  initialzedTeacherIds.value = new Set(
    teacherContext.teachers.map((teacher) => teacher.teacherId)
  );
};

const addEmptyTeacher = async () => {
  searchKeyword.value = '';

  const maxOrderNo = editableTeachers.value.reduce((max, teacher) => {
    return teacher.orderNo > max ? teacher.orderNo : max;
  }, 0);

  editableTeachers.value.push({
    teacherId: '',
    teacherName: '',
    classId: '',
    checked: false,
    showList: false,
    tempKey: uuidv4(),
    orderNo: maxOrderNo + 1,
  } as EditableTeacher);
  
  /*
  teacherContext.teachers.push({
    teacherId: '',
    teacherName: '',
    classId: '',
  } as Teacher);
  */

  await nextTick();

  const lastTeacherIndex = editableTeachers.value.length - 1;
  const lastTeacherNameRef = teacherNameRefs.value[lastTeacherIndex];
  if (lastTeacherNameRef && 'focus' in lastTeacherNameRef) {
    (lastTeacherNameRef as HTMLInputElement).focus();
  }
};

const teacherIdsInUse = ref<string[]>([]);

const initTeacherIdsInUse = async () => {
  const teacherIdsSet = new Set<string>();
  lessonConfContext.lessonConfs.forEach((lessonConf) => {
    if (lessonConf.teacherId) {
      teacherIdsSet.add(lessonConf.teacherId);
    }
  });
  teacherIdsInUse.value = Array.from(teacherIdsSet);
};

const checkInUseTeacher = (teacherId: string) => {
  return teacherIdsInUse.value.includes(teacherId);
};

const beforeEditedTeacherName = ref('');

const backupPreviousTeacherName = (teacher: Teacher) => {
  beforeEditedTeacherName.value = teacher.teacherName.trim();
};

const resetBackupPreviousTeacherName = () => {
  beforeEditedTeacherName.value = '';
};

// Check duplicate teacher name across editableTeachers (excluding the item with the given tempKey)
const isDuplicate = (name: string, tempKey?: string) => {
  const n = (name || '').trim();
  if (!n) return false;
  const matches = editableTeachers.value.filter((t) => t.teacherName && t.teacherName.trim() === n && t.tempKey !== tempKey);
  return matches.length > 0;
};

const handleFocusTeacherName = (teacher: Teacher, index: number) => {
  // beforeEditedTeacherName.value = teacher.teacherName.trim();
  backupPreviousTeacherName(teacher);
};

const handleBlurTeacherName = async (teacher: EditableTeacher, index: number) => {
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

  const checkTeacher = editableTeachers.value.find((t) => t.tempKey === teacher.tempKey);
  if (checkTeacher) {
    // console.log('>>> checkTeacher:', checkTeacher);
  }
};

const handleEnterTeacherName = async (teacher: EditableTeacher, index: number) => {
  if(index === editableTeachers.value.length - 1) {
    addEmptyTeacher();
    return;
  }

  const teacherNameRef = teacherNameRefs.value[index + 1];
  teacherNameRef && 'focus' in teacherNameRef && (teacherNameRef as HTMLInputElement).focus();
};

const handleKeydownTeacherName = async (teacher: EditableTeacher, index: number, event: KeyboardEvent) => {
  if (event.key === 'Enter' ) {
    handleEnterTeacherName(teacher, index);
    return;
  }
};

const handleClickAddTeacher = async () => {
  // 교사 추가 버튼 클릭
  await addEmptyTeacher();
};

const handleClickEmptyClassWithoutTeacher = async (index: number) => {
  // console.log('>>> handleClickEmptyClassWithoutTeacher:', index);

  await dialog.alertSimple('교사를 등록해주세요.');

  const teacherNameRef = teacherNameRefs.value[index];
  teacherNameRef && 'focus' in teacherNameRef && (teacherNameRef as HTMLInputElement).focus();
};

const handleUpdateTeacherClass = async (teacher: EditableTeacher, classId: string | null) => {
  // console.log('>>> handleUpdateTeacherClass:', teacher, classId);
  if(!teacher.teacherId || !classId) {
    return;
  }
  
  await teacherContext.updateTeacherClass({
    teacherId: teacher.teacherId,
    teacherName: teacher.teacherName.trim(),
    classId: classId || '',
  });

  teacher.classId = classId || '';
  teacher.className = classId ? (classNameMap.value[classId] || '') : '';

  refreshClassNameItems();
};

const handleRemoveTeacherClass = async (teacher: EditableTeacher) => {
  await teacherContext.removeTeacherClass(teacher.teacherId);

  editableTeachers.value = editableTeachers.value.map((t) => {
    if(t.tempKey === teacher.tempKey) {
      t.classId = '';
      t.className = '';
    }
    return t;
  });

  // await nextTick();
  // await refreshClassNameItems();
};

const handleBlurTeacherClass = async (teacher: EditableTeacher, index: number) => {
  if(teacher.classId) {
    return;
  }

  teacher.className = '';

  const ref = teacherClassRefMap.value[teacher.tempKey];
  if(ref && 'resetValue' in ref) {
    (ref as any).resetValue();
  }

  refreshClassNameItems();
};

const handleClickChecked = (teacher: EditableTeacher) => {
  teacher.checked = !teacher.checked;

  toggleAllCheckeWithTeacherChecks();
  toggleHasChecked();
};

const toggleAllCheckeWithTeacherChecks = () => {
  allChecked.value = searchedEditableTeachers.value.every((teacher) => teacher.checked);
};

const toggleHasChecked = () => {
  hasChecked.value = searchedEditableTeachers.value.some((teacher) => teacher.checked);
};

const toggleAllChecked = () => {
  
  searchedEditableTeachers.value
    .filter((teacher) => isFinished.value ? !initialzedTeacherIds.value.has(teacher.teacherId) : true)
    .forEach((teacher) => (teacher.checked = allChecked.value));
  
  hasChecked.value = allChecked.value;
};

const handleClickDeleteChecked = async () => {
  try {
    const selectedTeachers = editableTeachers.value.filter((teacher) => teacher.checked);
    if (selectedTeachers.length === 0) {
      return;
    }

    const teacherIds = selectedTeachers.filter((teacher) => teacher.teacherId).map((teacher) => teacher.teacherId);

    // 빈 항목만 선택된 경우
    if((!teacherIds || teacherIds.length === 0) && !(await confirmDeleteTeacher())) {
      return;
    }

    // 빈 항목이 아닌 항목이 포함된 경우
    if (teacherIds.length > 0 && !(await confirmDelete(teacherIds))) {
      return;
    }

    // 목록에서 삭제
    selectedTeachers.forEach((teacher) => {
      removeTeacherFromList(teacher);
    });

    
    if (teacherIds.length > 0) {
      await teacherContext.deleteWithIds(teacherIds);
    }

    allChecked.value = false;
    toggleHasChecked();

    if(teacherContext.teachers.length === 0) {
      addEmptyTeacher();
    }
    
  } catch (error) {
    console.error('Error deleting checked teachers:', error);
  }
};

const removeTeacherFromList = async (teacher: EditableTeacher) => {
  editableTeachers.value = editableTeachers.value.filter((t) => t.tempKey !== teacher.tempKey);
};

const confirmDeleteTeacher = async () => {
  return await dialog.confirmSimple('선택하신 교사를 삭제하시겠습니까?');
};

const searchedEditableTeachers = computed(() => {
  return (searchKeyword.value !== ''
    ? editableTeachers.value.filter((teacher) => {
        return teacher.teacherName.includes(searchKeyword.value);
      })
    : editableTeachers.value)
    .sort((a, b) => a.orderNo - b.orderNo);
});

watch(
  () => searchKeyword.value,
  (newVal, oldVal) => {
    if(newVal !== oldVal) {
      // 검색어 변경시 체크박스 초기화
      allChecked.value = false;
      editableTeachers.value.forEach((teacher) => (teacher.checked = false));
    }    
  },
  { immediate: true }
);

watch(
  () => [orderBy.value],
  async () => {

    // console.log('>>> watch orderBy:', orderBy.value, ListOrder.NAME_ASC, ListOrder.NAME_DESC);
    await nextTick();

    editableTeachers.value.sort((a, b) => {
      // ListOrder 적용
      if (orderBy.value === ListOrder.NAME_ASC) {
        return a.teacherName.localeCompare(b.teacherName);
      } else if (orderBy.value === ListOrder.NAME_DESC) {
        return b.teacherName.localeCompare(a.teacherName);
      }
      return 0;      
    })
    .sort((a, b) => {
      // 빈 항목을 맨 뒤로 이동
      if (a.teacherName.trim() === '' && b.teacherName.trim() !== '') {
        return 1;
      }
      if (a.teacherName.trim() !== '' && b.teacherName.trim() === '') {
        return -1;
      }
      return 0;
    })
    .forEach((teacher, index) => {
      teacher.orderNo = index + 1;
    });
  },
  { immediate: true }
);



// PageTitle Component의 "다음" 버튼 클릭에 의해 호출됨
const checkBeforeMove = async () => {
  // console.log('>>> TimetableTeachers checkBeforeMove', teacherContext.teachers);
  // const registedTeachers = teacherContext.teachers.filter((teacher) => teacher.teacherId.trim() !== '' );
  const registedTeachers = editableTeachers.value.filter((teacher) => teacher.teacherId.trim() !== '' );
  if (registedTeachers.length === 0) {
    await dialog.alertSimple('교사를 한 명 이상 등록해주세요.');
    return false;
  }

  /*
  const findUnregisteredClasses = () => {
    // 담당 학급이 등록되지 않은 교사 확인
    const registeredClassesIds = sortedTeachers.value
      .filter((teacher) => {
        return teacher.classId;
      })
      .map((teacher) => teacher.classId);

    return classContext.classes.filter((cls) => {
      return !cls.isVirtual && !registeredClassesIds.includes(cls.classId);
    });
  };
  */

  // 담당학급이 하나도 등록되지 않았을때만 확인
  const findRegisteredClasses = () => {
    // 담당 학급이 등록된 교사 확인
    const registeredClassesIds = teacherContext.teachers
      .filter((teacher) => {
        return teacher.classId;
      })
      .map((teacher) => teacher.classId);
    return classContext.classes.filter((cls) => {
      return !cls.isVirtual && registeredClassesIds.includes(cls.classId);
    });    
  };

  if (findRegisteredClasses().length === 0) {
    const confirmed = await dialog.confirmSimple(`
      등록되지 않은 담당 학급이 있습니다. <br>다음으로 넘어가시겠습니까?
      <div class="blue-box"> 
        <i class="hi-ico ico-primary ico-warning-circle-fill ico-size-18"></i>
        담당학급이 입력된 경우 해당 학급 종료 시간<br>이후에 수업이 배정되지 않습니다.
      </div>`);
    
    if (!confirmed) {
      return false;
    }
  }

  const nextStatus = TimetableStatus.LessonConfig;
  const isStatusUpdated = await progressContext.updateStatus(nextStatus);
  if (!isStatusUpdated) {
    await dialog.alertSimple('다음 단계로 이동할 수 없습니다.');
    return false;
  }

  return true;
};

defineExpose({
  checkBeforeMove,
});

// 추후 업데이트 알림 공통 핸들러
// const showComingSoon = async () => {
//   await dialog.alertSimple('추후 업데이트 예정입니다.');
// };
// published -->

// const emit = defineEmits(['openHelp', 'close-help']);

// function openHelp(id: string) {
//   if (!id) {
//     emit('close-help');
//     emit('openHelp', '');
//     return;
//   }
//   emit('openHelp', id);
// }

const handlePaste = async (event: ClipboardEvent, index: number) => {
  if (!event.clipboardData) return;

  const textHtml = event.clipboardData?.getData('text/html');
  if (!textHtml) return;

  // 붙여넣기 데이터 가공
  let teacherNames = extractPastedTeacherNames(textHtml);
  if (teacherNames.length === 0) return;

  const isPaste = await dialog.confirm('등록된 데이터가 있는 경우, 추가로 붙여넣기 됩니다.<br>실행하시겠습니까?');
  if (!isPaste) return;

  // 현재 붙여넣은 row 의 정식, 표기 과목명 모두 입력안됐으면 삭제
  const { teacherName, className } = editableTeachers.value[index];
  if (!teacherName && !className) {
    editableTeachers.value.splice(index, 1);
  }

  // api 저장 요청 및 교사 이름 추가
  await applyPastedTeacherNames(teacherNames);
}

const extractPastedTeacherNames = (textHtml: string): string[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(textHtml, 'text/html');
  const table = doc.body.querySelector('table');
  if (!table) return [];

  const rows: HTMLTableRowElement[] = Array.from(table.querySelectorAll('tr'));
  if (rows.length === 1 && rows[0].querySelectorAll('td').length === 1) return [];

  return rows
      .map((row) => {
        const tds = Array.from(row.querySelectorAll('td'));
        return tds[0]?.innerText.trim() || '';
      })
      .filter(teacherName => teacherName !== '');
};

const applyPastedTeacherNames = async (teacherNames: string[]) => {
  try {
    const teachersForAdd: TeacherForAdd[] = teacherNames.map((teacherName) => ({ teacherName }))
    const result: Teacher[] = await teacherContext.addTeachers(teachersForAdd);

    result.forEach((addedTeacher) => {
      editableTeachers.value.push({
        ...addedTeacher,
        checked: false,
        showList: false,
        className: addedTeacher.classId ? (classNameMap.value[addedTeacher.classId] || '') : '',
        tempKey: uuidv4(),
        orderNo: editableTeachers.value.length + 1,
      } as EditableTeacher);
    });
  } catch (error) {
    console.error('Error apply pasted teacherNames:', error);
  }
};

</script>

<style lang="scss" scoped>
.tt-teacher-courses {  
  .tip-guide {
    display: flex;
    gap: 40px;
    border-radius: 8px;
    font-size: 13px;
    color: #222;
    line-height: 1.6;
    margin-bottom: 16px;

    ol{
      display: flex;
      gap: 60px;
      width: 100%;
      > li{
        margin-left:20px;
        flex: 1;
        list-style-type: decimal;
        line-height: 150%;
        max-width : 580px;
        width: 100%;
        ul{
          padding-top: 6px;
          li{          
            line-height: 150%;  
            &::before {
              content: '•';
              display: inline-block;
              width: 12px;
              margin-left: -12px;
            }
          }
        } 
        &.divider{
          min-width: 1px;
          max-width: 1px;
          height: 100%;
          background: var(--gray-06);
          margin: 0;
        }
      }
    }  
    .table-content{
      width: 140px;
      table{background:none;}
      th,
      td {
        font-size: 12px;
        padding: 0px 16px;
        height: 28px;
      }
      td {
        background:#fff;
        color: var(--gray-09);
      }
    }   
  }
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
  .btn-area {
    gap: 8px;
  }
  .course-select {
    ::v-deep .selected-tags {
      padding: 6px;
      .autocomplete-list {
        width: 280px;
      }
    }
  }
  .table-head + .table-content {
    max-height: calc(var(--vh) * 100 - 248px);
    min-height: calc(var(--vh) * 100 - 440px);
    tr.error{
      td{
        background: #FFF7F8;
      }
    }
    .hi-nodata {
      max-height: calc(var(--vh) * 100 - 288px);
      min-height: calc(var(--vh) * 100 - 480px);
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
}

.empty-class-cover {
  position: absolute;
  top: 0;
  color: #c1c1c1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
