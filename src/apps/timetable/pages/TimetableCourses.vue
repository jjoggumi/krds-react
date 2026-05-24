<template>
  <section class="tt-courses">
    <TimetableTip class="mb-20">
      <template #header>
        <div>
          <span class="badge tip mr-05">TIP!</span> 복사/붙여넣기로 과목명을 한번에 등록할 수 있어요!
        </div>
      </template>
      <template #content>
        <div class="tip-guide">
          <ol>
            <li>
              엑셀, 한글, 구글 시트에서 예시와 동일한 형식으로 정식 과목명 / 표기 과목명을 입력한 뒤 복사 (Ctrl+C) 하세요.              
              <ul>
                <li>
                  정식 과목명만 있는 경우, 정식 과목명만 복사해주세요.</li>
                <li> <span class="txt-warning">표기 과목명은 중복되지 않도록</span> 구분하여 작성해주세요.</li>
              </ul>
              <div class="table-content sm-radius mt-15">
                <table>
                  <thead>
                    <tr>
                      <th>정식 과목명</th>
                      <th>표기 과목명</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>국어</td><td>국어</td></tr>
                    <tr><td>수학</td><td>수학</td></tr>
                    <tr><td>영어</td><td>영어</td></tr>
                    <tr><td>영어</td><td>영B</td></tr>
                  </tbody>
                </table>
              </div>
            </li>
            <li class="divider"></li>
            <li>
              붙여넣기할 셀을 선택하고 붙여넣기 (Ctrl+V)하면 과목이 추가됩니다.
              <ul>
                <li>기존 입력된 과목명은 덮어쓰지 않고 <span class="txt-warning">추가 등록</span>됩니다.</li>
                <li>정식 과목명만 붙여넣은 경우, 표기 과목명은 자동으로 2차 입력됩니다.</li>
                <li>표기 과목명만 단독으로 붙여넣기는 불가합니다.</li>
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
        placeholder="과목명 검색"
        :maxlength="17"
      />
      <div class="btn-area">
        <button type="button" class="btn btn-tertiary" @click="handleClickDeleteCheckedCourseBases" :disabled="!hasChecked">선택 삭제하기</button>
        <!-- <button type="button" class="btn btn-tertiary-blue" @click="showComingSoon">엑셀 양식 다운로드</button>
        <button type="button" class="btn btn-tertiary-blue" @click="showComingSoon">일괄 업로드</button> -->
        <button type="button" class="btn btn-primary pr-35" @click="addEmptyCourseBase">과목 추가하기</button>
        <HelpButton 
          :id="'과목 추가하기'"
          :active="helpOn === '과목 추가하기'"      
          class="btn-help-w"
        />
      </div>
    </div>
    <div class="table-content table-form sticky-wrap table-box">
      <table>
        <caption>
          시간표 정보 입력
        </caption>
        <colgroup>
          <col style="width: 14%" />
          <col style="width: 24%" />
          <col style="width: 24%" />
          <col style="width: 24%" />
          <col style="width: 14%" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" class="sticky-top">
              <div class="form-check">
                <input type="checkbox" id="allChecked" v-model="allChecked" @change="toggleAllChecked" 
                :disabled="isDisabledAllChedkbox"/>
                <label for="allChecked"></label>
              </div>
            </th>
            <th scope="col" class="sticky-top">
              정식 과목명({{ countStandardCourses }})
              <!-- <button type="button" class="btn btn-link btn-help" :class="{ 'help-on': helpOn === '정식 과목명' }" @click="openHelp('정식 과목명')">
                <span class="sr-only">도움말</span>
              </button>               -->
              <HelpButton 
                :id="'정식 과목명'"
                :active="helpOn === '정식 과목명'"
              />
              <button type="button" 
                class="btn btn-link btn-sort"
                :class="{
                  'asc': orderBy !== ListOrder.StandardDesc,
                  'desc': orderBy === ListOrder.StandardDesc
                }"
                @click="handleClickStandardCourseOrder"><span class="sr-only">정렬</span></button>
              <!-- 오름차순 'asc', 내림차순 'desc' class 추가 -->
            </th>
            <th scope="col" class="sticky-top">
              표기 과목명
              <!-- <button type="button" class="btn btn-link btn-help" :class="{ 'help-on': helpOn === '표기 과목명' }" @click="openHelp('표기 과목명')">
                <span class="sr-only">도움말</span>
              </button> -->              
              <HelpButton 
                :id="'표기 과목명'"
                :active="helpOn === '표기 과목명'"
              />
              <button type="button" 
                class="btn btn-link btn-sort"
                :class="{
                  'asc': orderBy !== ListOrder.DisplayedDesc,
                  'desc': orderBy === ListOrder.DisplayedDesc
                }"
                @click="handleClickDisplayedCourseOrder"><span class="sr-only">정렬</span></button>
            </th>
            <!-- <th scope="col" class="sticky-top">시수</th> -->
            <th scope="col" class="sticky-top">
              복수 교사
              <!-- <button type="button" class="btn btn-link btn-help" :class="{ 'help-on': helpOn === '복수 교사' }" @click="openHelp('복수 교사')">
                <span class="sr-only">도움말</span>
              </button> -->                         
              <HelpButton 
                :id="'복수 교사'"
                :active="helpOn === '복수 교사'"
              />
              <button type="button" 
                class="btn btn-link btn-sort"
                :class="{
                  'asc': orderBy !== ListOrder.DoubleTeacherDesc,
                  'desc': orderBy === ListOrder.DoubleTeacherDesc
                }"
                @click="handleClickDoubleTeacherOrder"><span class="sr-only">정렬</span></button>
            </th>
            <th scope="col" class="sticky-top">삭제</th>
          </tr>
        </thead>
        <tbody
          is="draggable"
          v-bind="dragOptions"
          handle=".drag-handle"
          tag="tbody"
          @start="handleDragStart"
          @end="handleDragEnd"
        >
          <tr v-for="(crs, index) in sortedCourseBases" :key="crs.tempKey" :class="{ 'error': crs.isDuplicated }">
            <td :class="{ 'drag-handle': true }">
              <div class="form-check">
                <input
                  type="checkbox"
                  v-if="sortedCourseBases.length > 1"
                  v-model="crs.checked"
                  :id="`sortedCourses-${index}`"
                  @click="handleClickChecked(crs)"
                  :disabled="isFinished && initialzedCourseBaseIds.has(crs.courseBaseId)"
                 />
                <label :for="`sortedCourses-${index}`"></label>
              </div>
            </td>

            <!-- 자동완성 입력 -->
            <td>
              <AutocompleteInput
                :ref="(el) => (standardCourseRefs[index] = el)"
                v-model="crs.standardCourseTitle"
                :options="searchedStandardCourseNames"
                placeholder="과목명 입력"
                nodata="일치하는 과목이 없습니다."
                :is-error="crs.isDuplicated"
                :is-error-type-border="activeStandardCourseInputIndex === index ? false : !isCourseTitleInMatches(crs)"
                :has-paste-handler="true"
                :on-focus="() => handleFocusStandardCourse(crs, index)"
                :on-blur="() => handleBlurStandardCourseTitle(crs)"
                :on-keydown="(event) => handleKeydownStandardCourseTitle(crs, index, event)"
                :on-paste="(event) => handlePaste(event, index)"
                :on-value-updated="(val) => handleUpdatedStandardCourseTitle(val, crs)"
                :class="{ 'opt-top': index > 5 }"
              >              
                <!--
                <template #custom-option="{ items, selectItem }">
                  <div v-for="(item, index) in items" :key="index" class="item">
                    <span @click="selectItem(item)">{{ item }}</span>
                    <button type="button" @click.stop="deleteItem(item)">
                      <i class="ico ico-trash ico-size-20 ico-gray"></i>
                      <span class="sr-only">삭제</span>
                    </button>
                  </div>
                </template>
                -->
              </AutocompleteInput>
              <HiTooltip
                  v-if="activeStandardCourseInputIndex === index ? false : !isCourseTitleInMatches(crs)"
                  class="hi-tooltip-wrap info bottom txt-left"
                  ico="info"
                  position="top"
                  :title-html="`정식 과목명이 NEIS에서 사용하는 과목명과 일치하는지 확인하세요.`"
              />
            </td>
            <td>
              <div class="input-wrap">
                <input
                  type="text"
                  v-model="crs.displayedTitle"
                  :ref="(el) => (displayedTitleRefs[index] = el)"
                  placeholder="과목명 입력"
                  :class="{ error: crs.isDuplicated }"
                  @focus="handleFocusInput(crs)"
                  @blur="handleBlurInput(crs)"
                  @keydown="handleKeydownDisplayedTitle(crs, index, $event)"
                  @paste="handlePaste($event, index)"
                  :disabled="!crs.standardCourseTitle && !crs.displayedTitle"
                  spellcheck="false"
                />
              </div>
              <!-- 과목명과 시수가 동일할때 에러 처리 -->
              <HiTooltip
                v-if="crs.isDuplicated"
                class="hi-tooltip-wrap info bottom txt-left"
                ico="info"
                position="top"
                :title-html="`동일한 과목명이 있습니다.`"
              />
            </td>
            <td :class="{ 'drag-handle': true }">
              <div class="form-check">
                <input
                  type="checkbox"
                  :id="`double-teacher${index}`"
                  v-model="crs.isDoubleTeacher"
                  @change="handleChangeDoubleTeacher(crs)"
                  :disabled="(isFinished && initialzedCourseBaseIds.has(crs.courseBaseId)) || !crs.standardCourseTitle || !crs.displayedTitle"
                />
                <label :for="`double-teacher${index}`"></label>
              </div>
            </td>
            <td :class="{ 'drag-handle': true }">
              <button type="button" 
                class="btn btn-ghost"
                v-if="!(isFinished && initialzedCourseBaseIds.has(crs.courseBaseId)) && sortedCourseBases.length > 1"
                @click="handleClickDeleteCourseBase(crs)"
                ><i class="ico ico-trash ico-size-20 ico-gray"></i></button>
            </td>
          </tr>
          <tr v-if="sortedCourseBases.length === 0">
            <td colspan="5">
              <div class="hi-nodata">
                <p>목록이 없습니다</p>
              </div>
            </td>
          </tr>
          <tr v-if="!searchKeyword && sortedCourseBases.length > 0">
            <td colspan="5" class="tfoot">ENTER 키로 다음 칸으로 이동하세요.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <DataEntryNoticeModal 
      v-if="isShowDataEntryNoticeModal" 
      :noticeType="noticeType" 
      @close="handleCloseDataEntryNoticeModal"
    />
  </section>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import AutocompleteInput from '@/apps/timetable/components/AutocompleteInput.vue';
import TimetableTip from '@/apps/timetable/components/TimetableTip.vue';
import DataEntryNoticeModal from '../components/DataEntryNoticeModal.vue';
import { CourseBaseTitle, NoticeType } from '../common/types';

import draggable from 'vuedraggable';
import Vue, { computed, inject, nextTick, onMounted, ref, watch, getCurrentInstance, ComponentPublicInstance } from 'vue';
import { useDialog } from '../composables/dialog';
import { CourseBase, TimetableStatus } from '@/apps/timetable/core/types';
import { ContextKeys, TimetableCourseContext, TimetableCourseBaseContext, TimetableProgressContext, LessonConfContext } from '../contexts';
import { isEqual } from 'lodash';
import { Timetables } from '@/apis/Timetables';
import { EmbeddedListResponse } from '../common/types';
import HelpButton from '@/apps/timetable/components/HelpButton.vue';

Vue.component('draggable', draggable);

const { proxy } = getCurrentInstance() as any;

interface EditableCourseBase extends CourseBase {
  checked: boolean;
  showList: boolean;
  isDuplicated: boolean; // 중복 과목 여부
  tempKey: string; // 임시 키, 필요시 사용
}

interface StandardCourseSimple {
  standardCourseId: string;
  courseName: string;
}

interface CourseBaseTitleWithIndex extends CourseBaseTitle {
  sortNo?: number; // 일괄 붙여넣기 시 중복과목 순서 맞추기 위해 사용하는 값
}

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const courseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext;
const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;

const dialog = useDialog();
const dragOptions = {
  animation: 200,
  group: 'table',
  disabled: false,
  ghostClass: 'sortable-ghost',
  dragClass: 'sortable-drag',
};

const props = defineProps({
  helpOn: {
    type: String,
    default: 0,
  },
});

const searchKeyword = ref('');
const standardCourseRefs = ref<HTMLElement[]>([]);
const displayedTitleRefs = ref<(Element | ComponentPublicInstance | null)[]>([]);
const searchedStandardCourses = ref<StandardCourseSimple[]>([]);
const currentStandardCourseKeyword = ref('');
const isMatchedTitlesInitialized = ref(false);
const matchedCourseTitles = ref<string[]>([]);
const activeStandardCourseInputIndex = ref<null | number>(null);
const pendingSavePromises = ref(new Map<string, Promise<any>>());
const initialzedCourseBaseIds = ref<Set<string>>(new Set());

// 데이터 수정 관련 안내 팝업  상태
const noticeType = ref<NoticeType>(NoticeType.None);
const isShowDataEntryNoticeModal = ref(false);
const handleCloseDataEntryNoticeModal = () => {
  isShowDataEntryNoticeModal.value = false;
};

const isFinished = computed(() => progressContext.status === TimetableStatus.Finish);
const fromNextStep = computed(() => proxy.$route && proxy.$route.params && proxy.$route.params?.moveType === 'prev');

const courseBases = computed(() => {
  return courseBaseContext.courseBases
    .map((courseBase: CourseBase) => {
      (courseBase as EditableCourseBase).checked = false;
      (courseBase as EditableCourseBase).showList = false;
      (courseBase as EditableCourseBase).isDuplicated = false; // 중복 과목 여부 초기화
      (courseBase as EditableCourseBase).tempKey = uuidv4();
      return courseBase as EditableCourseBase;
    }) as EditableCourseBase[];
});

const isDisabledAllChedkbox = computed(() => {
  return (sortedCourseBases.value.length < 2) || (isFinished.value && sortedCourseBases.value.every(crs => initialzedCourseBaseIds.value.has(crs.courseBaseId)));
});

enum ListOrder {
  StandardAsc = 'standard-asc',
  StandardDesc = 'standard-desc',
  DisplayedAsc = 'displayed-asc',
  DisplayedDesc = 'displayed-desc',
  DoubleTeacherAsc = 'double-teacher-asc',
  DoubleTeacherDesc = 'double-teacher-desc',
  NONE = 'none',
}

const searchedStandardCourseNames = computed(() => {
  // 중복 이름 제거
  const uniqueNames = new Set<string>();
  searchedStandardCourses.value.forEach((sc) => uniqueNames.add(sc.courseName));
  return Array.from(uniqueNames);
});

const sortedCourseBases = computed(() => filteredCourseBases.value);

const countStandardCourses = computed(() => {
  const uniqueStandardCourses = new Set<string>();
  sortedCourseBases.value.forEach((crs) => {
    if (crs.standardCourseTitle) {
      uniqueStandardCourses.add(crs.standardCourseTitle);
    }
  });
  return uniqueStandardCourses.size;
});

const showNoticeIfNotSeen = (key: NoticeType) => {
  if (!sessionStorage.getItem(key)) {
    noticeType.value = key;
    isShowDataEntryNoticeModal.value = true;
    sessionStorage.setItem(key, 'true');
  }
};

onMounted(async () => {
  await progressContext.reload();

  if (!progressContext.checkAccessible(TimetableStatus.CourseBase)) {
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

  await initData();

  if (localStorage.getItem('isDoneLessonConfsUpload')) {
    matchedCourseTitles.value.push(
      ...courseBases.value
        .filter(c => c.standardCourseId !== null && c.standardCourseTitle !== undefined && c.standardCourseTitle !== null)
        .map(c => c.standardCourseTitle!)
    );
    localStorage.removeItem('isDoneLessonConfsUpload');
  } else {
    courseBases.value.forEach(crs => {
      if (crs.standardCourseTitle && !matchedCourseTitles.value.includes(crs.standardCourseTitle)) {
        matchedCourseTitles.value.push(crs.standardCourseTitle)
      }
    })
  }

  isMatchedTitlesInitialized.value = true;
});

const initData = async () => {
  searchKeyword.value = '';
  await courseBaseContext.reload();
  await courseContext.reload();
  await lessonConfContext.reload();
  await initCourseBaseIdsInUse();

  if (courseBases.value.length === 0) {
    addEmptyCourseBase();
  }

  // 현재 단계에서 추가된 항목인지를 확인하기 위해 초기 데이터만 저장
  initialzedCourseBaseIds.value = new Set(
    courseBaseContext.courseBases.map((courseBase) => courseBase.courseBaseId)
  );
};

const courseBaseIdsInUse = ref<string[]>([]);

const initCourseBaseIdsInUse = async () => {
  const lessonConfCourseIdSet = new Set<string>();
  lessonConfContext.lessonConfs.forEach((conf) => {
    if (conf.courseId) {
      lessonConfCourseIdSet.add(conf.courseId);
    }
  });
  courseBaseIdsInUse.value = Array.from(lessonConfCourseIdSet).map((courseId) => {
    const course = courseContext.courses.find((crs) => crs.courseId === courseId);
    return course ? course.courseBaseId : '';
  }).filter((id) => id !== '');
};

const checkInUseCourseBase = (courseBaseId: string): boolean => {
  return courseBaseIdsInUse.value.includes(courseBaseId);
};

const getStandardCourses = async (keyword: string): Promise<StandardCourseSimple[]> => {
  const api = new Timetables();
  const res = await api.getStandardCoursesStandardcourses({
    keyword,
    timetableId: courseBaseContext.timetableId,
  });

  if (res.status !== 200) {
    throw new Error('Failed to fetch courseBases');
  }

  const { standardCourses } = (res.data as EmbeddedListResponse<StandardCourseSimple>)._embedded;
  return standardCourses;
};

// 선택된 항목 존재 여부
const allChecked = ref(false);
const hasChecked = ref(false);
const orderBy = ref<ListOrder | null>(null);

const filteredCourseBases = ref<EditableCourseBase[]>([]);

watch(
  () => [courseBases.value, searchKeyword.value, orderBy.value],
  () => {
    let filtered = searchKeyword.value === '' ? 
      courseBases.value : 
      courseBases.value.filter(
        (crs) => (crs.standardCourseTitle || '').includes(searchKeyword.value) || (crs.displayedTitle || '').includes(searchKeyword.value)
      );

    // 정렬    
    if (orderBy.value === ListOrder.StandardAsc) {
      filtered.sort((a, b) => (a.standardCourseTitle || '').localeCompare(b.standardCourseTitle || ''));
    } else if (orderBy.value === ListOrder.StandardDesc) {
      filtered.sort((a, b) => (b.standardCourseTitle || '').localeCompare(a.standardCourseTitle || ''));
    } else if (orderBy.value === ListOrder.DisplayedAsc) {
      filtered.sort((a, b) => (a.displayedTitle || '').localeCompare(b.displayedTitle || ''));
    } else if (orderBy.value === ListOrder.DisplayedDesc) {
      filtered.sort((a, b) => (b.displayedTitle || '').localeCompare(a.displayedTitle || ''));
    } else if (orderBy.value === ListOrder.DoubleTeacherAsc) {
      filtered.sort((a, b) => Number(a.isDoubleTeacher) - Number(b.isDoubleTeacher));
    } else if (orderBy.value === ListOrder.DoubleTeacherDesc) {
      filtered.sort((a, b) => Number(b.isDoubleTeacher) - Number(a.isDoubleTeacher));
    }

    // 비어있는 셀이 가장 뒤로 오도록 처리
    filtered.sort((a, b) => {
      const aValue = a.standardCourseTitle || a.displayedTitle || '';
      const bValue = b.standardCourseTitle || b.displayedTitle || '';

      if (aValue === '' && bValue !== '') return 1;
      if (aValue !== '' && bValue === '') return -1;
      return 0;
    });

    // 중복 체크
    filtered.map((crs) => {
      if (!crs.displayedTitle) {
        crs.isDuplicated = false;
        return;
      }
      const isDuplicated = courseBases.value.some(
        (c) => c.displayedTitle == crs.displayedTitle && c.tempKey !== crs.tempKey
      );
      crs.isDuplicated = isDuplicated;
    });

    filteredCourseBases.value = filtered;
  },
  { immediate: true }
);

const handleClickStandardCourseOrder = () => {
  if (orderBy.value === ListOrder.StandardAsc) {
    orderBy.value = ListOrder.StandardDesc;
    return;
  }

  orderBy.value = ListOrder.StandardAsc;
};

const handleClickDisplayedCourseOrder = () => {
  if (orderBy.value === ListOrder.DisplayedAsc) {
    orderBy.value = ListOrder.DisplayedDesc;
    return;
  }

  orderBy.value = ListOrder.DisplayedAsc;
};

const handleClickDoubleTeacherOrder = () => {
  if (orderBy.value === ListOrder.DoubleTeacherAsc) {
    orderBy.value = ListOrder.DoubleTeacherDesc;
    return;
  }

  orderBy.value = ListOrder.DoubleTeacherAsc;
};

const handleDragStart = (event: any) => {
  // 드래그 시작 시 처리
};

const handleDragEnd = async (event: any) => {
  const { newIndex, oldIndex } = event;
  if (newIndex === oldIndex) {
    return;
  }
  await courseBaseContext.changeSequence(sortedCourseBases.value[oldIndex].courseBaseId, newIndex + 1);
};

// 항목 추가
const addEmptyCourseBase = async () => {
  searchKeyword.value = '';
  const isOverLimit = await checkCourseLimit(courseBases.value.length);
  if (isOverLimit) return;

  courseBaseContext.courseBases.push({
    standardCourseTitle: '',
    displayedTitle: '',
    isDoubleTeacher: false,
  } as CourseBase);

  await nextTick();

  const lastIndex = filteredCourseBases.value.length - 1;
  if (lastIndex < 0) {
    return;
  }

  const lastStandardCourseRef = standardCourseRefs.value[lastIndex];
  if (lastStandardCourseRef) {
    lastStandardCourseRef.focus();
  }
};

const createCourseBase = async (courseBase: CourseBase) => {
  try {
    const newCourseBase = await courseBaseContext.add(courseBase);
    if (!newCourseBase || !newCourseBase.courseBaseId) {
      console.error('Failed to create course');
      return;
    }

    courseBase.courseBaseId = newCourseBase.courseBaseId;
    return newCourseBase;
  } catch (error) {
    console.error('Error creating course:', error);
  }
};

const deleteCourseBase = async (courseBaseId: string) => {
  try {
    await deleteCourseBases([courseBaseId]);
    
    toggleHasChecked();
    toggleAllCheckeWithCourseBaseChecks();
  } catch (error) {
    console.error('Error deleting course:', error);
  }
};

const deleteCourseBases = async (courseBaseIds: string[]) => {
  try {
    const isInUse = courseBaseIds.some(id => checkInUseCourseBase(id));

    await courseBaseContext.deleteWithIds(courseBaseIds);
    await courseContext.reload();

    if(isInUse) {
      await lessonConfContext.reload();
      await initCourseBaseIdsInUse();
    }

    toggleHasChecked();
    toggleAllCheckeWithCourseBaseChecks();
  } catch (error) {
    console.error('Error deleting course:', error);
  }
};


const beforeEditedCourseBase = ref<CourseBase | null>(null);

watch(
  () => currentStandardCourseKeyword.value,
  () => {
    searchStandaradCourses(currentStandardCourseKeyword.value);
  }
);

const searchStandaradCourses = async (keyword: string) => {
  try {
    if (!keyword || keyword.length < 1) {
      searchedStandardCourses.value = [];
      return;
    }

    const standardCourses = await getStandardCourses(keyword);

      // keyword가 앞에 오고 단어가 짧은 순으로 정렬
    searchedStandardCourses.value = standardCourses
      .sort((a, b) => {
        const indexA = a.courseName.indexOf(keyword);
        const indexB = b.courseName.indexOf(keyword);

        if (indexA !== indexB) {
          return indexA - indexB; // keyword가 앞에 오는 것이 우선
        }
        return a.courseName.length - b.courseName.length; // 단어가 짧은 것이 우선
      });
  } catch (error) {
    console.error('Error searching standard courses:', error);
    searchedStandardCourses.value = [];
  }
};

const handleFocusStandardCourse = (courseBase: CourseBase, index: number) => {
  activeStandardCourseInputIndex.value = index;
  if(courseBase.standardCourseTitle && courseBase.standardCourseTitle.length > 0) {
    currentStandardCourseKeyword.value = courseBase.standardCourseTitle;
  }

  beforeEditedCourseBase.value = { ...courseBase };
};

const handleFocusInput = (courseBase: CourseBase) => {
  beforeEditedCourseBase.value = { ...courseBase };
};


const handleUpdatedStandardCourseTitle = (val: string, courseBase: EditableCourseBase) => {
  currentStandardCourseKeyword.value = val;  
  /*
  if (courseBase.standardCourseTitle && (!courseBase.displayedTitle || courseBase.displayedTitle.length < 2)) {
    courseBase.displayedTitle = courseBase.standardCourseTitle.length > 2 ? courseBase.standardCourseTitle.substring(0, 2) : courseBase.standardCourseTitle;
  }
  */
}

const handleKeydownStandardCourseTitle = (courseBase: CourseBase, index: number, event: KeyboardEvent) => {
  // 정식 과목명 입력 필드에서 Enter 시 새 행 추가 (마지막 행일 때)
  if (event.key === 'Enter') {
    // 표기과목명으로 포커스 이동
    const nextRef = displayedTitleRefs.value[index];
    nextRef && (nextRef as HTMLElement).focus();

    /*
    if (index === courseBases.value.length - 1) {
      // 기존에는 courseBaseId가 있는 경우(저장된 과목)만 추가했는데, 신규 빈 행에서도 동작하도록 조건 완화
      addEmptyCourseBase();
    } else {
      // 마지막이 아니면 다음 행의 입력으로 포커스 이동 (UX 개선)
      const nextRef = standardCourseRefs.value[index + 1];
      nextRef && nextRef.focus();
    }
    */
  }
};

const handleKeydownDisplayedTitle = async (course: CourseBase, index: number, event: KeyboardEvent) => {
  /*
  if (event.key === 'Enter' && index === courseBases.value.length - 1) {
    await addEmptyCourseBase();
  }

  const value = (event.target as HTMLInputElement)?.value;
  if (value && value.length > 5) {
    //
  }
  */

  if (event.key === 'Enter') {
    if (index === courseBases.value.length - 1) {
      // 기존에는 courseBaseId가 있는 경우(저장된 과목)만 추가했는데, 신규 빈 행에서도 동작하도록 조건 완화
      addEmptyCourseBase();
    } else {
      // 마지막이 아니면 다음 행의 입력으로 포커스 이동 (UX 개선)
      const nextRef = standardCourseRefs.value[index + 1];
      nextRef && nextRef.focus();
    }
  }

  
};

const handleBlurStandardCourseTitle = (courseBase: EditableCourseBase) => {  
  courseBase.standardCourseTitle = courseBase.standardCourseTitle ? courseBase.standardCourseTitle.trim() : '';

  if (courseBase.standardCourseTitle && !courseBase.displayedTitle) {
    courseBase.displayedTitle = courseBase.standardCourseTitle.length > 2 ? courseBase.standardCourseTitle.substring(0, 2) : courseBase.standardCourseTitle;
  }

  doAfterBlur(courseBase);

  activeStandardCourseInputIndex.value = null;
};

const handleBlurInput = (course: EditableCourseBase) => {
  //console.log('handleBlurInput', course);

  doAfterBlur(course);
};

const doAfterBlur = async (courseBase: EditableCourseBase) => {
  const displayedTitle = courseBase.displayedTitle ? courseBase.displayedTitle.trim() : '';
  if(displayedTitle.length > 5) {
    await dialog.alertSimple('표기 과목명은 최대 5자까지 입력 가능합니다.');
    courseBase.displayedTitle = displayedTitle.substring(0, 5);
  }

  if (!isEqual(courseBase, beforeEditedCourseBase.value)) {
    filteredCourseBases.value.map((crs) => {
      if (!crs.displayedTitle) {
        crs.isDuplicated = false;
        return;
      }

      const isDuplicated = courseBases.value.some(
        (c) => c.displayedTitle == crs.displayedTitle && c.tempKey !== crs.tempKey
      );

      crs.isDuplicated = isDuplicated;
    });

    if (!courseBase.isDuplicated) {
      const savePromise = modifyCourseBase(courseBase);
      if (savePromise) {
        pendingSavePromises.value.set(courseBase.tempKey, savePromise);

        try {
          await savePromise;
        } finally {
          pendingSavePromises.value.delete(courseBase.tempKey);
        }
      }
    }

    filteredCourseBases.value = [...filteredCourseBases.value];
  }

  resetStandardCourseSearch();
  resetBeforeEditedCourseBase();
};

const resetBeforeEditedCourseBase = () => {
  beforeEditedCourseBase.value = {} as CourseBase;
};

const resetStandardCourseSearch = () => {
  currentStandardCourseKeyword.value = '';
  searchedStandardCourses.value = [];
};

const modifyCourseBase = async (courseBase: CourseBase) => {
  try {
    if (!validateCourseBase(courseBase)) {
      return;
    }

    await searchNeisCourseMatches(courseBase.standardCourseTitle!);

    if (!courseBase.courseBaseId) {
      // 신규 생성
      return await createCourseBase(courseBase);
    }

    // 기존 과목 수정
    const updatedCourseBase = await courseBaseContext.update(courseBase);
    if (!updatedCourseBase || updatedCourseBase.courseBaseId !== courseBase.courseBaseId) {
      console.error('Failed to update course');
      return;
    }

    await courseContext.reload();
    return updatedCourseBase;
  } catch (error) {
    console.error('Error updating course:', error);
  }
};


const validateCourseBase = (courseBase: CourseBase) => {
  if (!courseBase.standardCourseTitle || !courseBase.displayedTitle ) {
    // console.log('Course validation failed: Missing required fields');
    return false;
  }
  
  return true;
};

const handleChangeDoubleTeacher = async (courseBase: CourseBase) => {
  // 복수 교사 체크박스 변경 시 처리 로직
  await modifyCourseBase(courseBase);
};

const confirmInUseCourseBase = async () => {
  return await dialog.confirm(`
    5단계 시수표에 등록된 과목이 포함되어 있습니다.<br/>그래도 삭제하시겠습니까?
    <div class="blue-box"> 
      <i class="hi-ico ico-primary ico-warning-circle-fill ico-size-18"></i>
      과목 삭제로 인해 시수표가 변경될 경우 <strong>7단계에서 작성한 데이터</strong>가 삭제될 수 있습니다.
    </div>      
    `, null, {
      customClass: 'timetable-confirm',
      showCloseButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소'
    });
};

const confirmDelete = async (courseBaseIds: string[] | undefined = undefined) => {
  const isInUseCourseBase = courseBaseIds && courseBaseIds.find((id) => checkInUseCourseBase(id)) !== undefined;
  if (progressContext.isFirstTemplate && isInUseCourseBase) {
    return await confirmInUseCourseBase();
  }

  return await dialog.confirmSimple('선택하신 목록을 삭제하시겠습니까?');
};

const handleClickDeleteCourseBase = async (courseBase: CourseBase) => {
  try {
    if ((courseBase.courseBaseId || validateCourseBase(courseBase)) && !(await confirmDelete([courseBase.courseBaseId]))) {
      return;
    }

    if (courseBase.courseBaseId) {
      await deleteCourseBase(courseBase.courseBaseId);
    }

    removeCourseBaseFromList(courseBase);
    allChecked.value = false;

    if(courseBases.value.length === 0) {
      addEmptyCourseBase();
    }
    
  } catch (error) {
    console.error('Error deleting course:', error);
  }
};

const handleClickDeleteCheckedCourseBases = async () => {
  try {
    const selectedCourses = [...courseBases.value.filter((crs) => crs.checked)];
    if (selectedCourses.length === 0) {
      return;
    }

    const courseIdsToDelete = selectedCourses.map((crs) => crs.courseBaseId).filter((id) => id);
    if (courseIdsToDelete && !(await confirmDelete(courseIdsToDelete))) {
      return;
    }

    // 목록에서 삭제
    selectedCourses.forEach((course) => {
      removeCourseBaseFromList(course);
    });

    if (courseIdsToDelete.length === 0) {
      return;
    }

    await deleteCourseBases(courseIdsToDelete);
    allChecked.value = false;

    if(courseBases.value.length === 0) {
      addEmptyCourseBase();
    }
  } catch (error) {
    console.error('Error deleting course:', error);
  }
};

const removeCourseBaseFromList = (courseBase: CourseBase) => {
  const index = courseBaseContext.courseBases.findIndex((crs) => crs === courseBase);
  if (index === -1) {
    return;
  }
  courseBaseContext.courseBases.splice(index, 1);
};

const handleClickChecked = (courseBase: EditableCourseBase) => {
  courseBase.checked = !courseBase.checked;

  toggleHasChecked();
  toggleAllCheckeWithCourseBaseChecks();
};

const toggleAllCheckeWithCourseBaseChecks = () => {
  allChecked.value = courseBases.value.every((crs) => crs.checked);
};

const toggleHasChecked = () => {
  hasChecked.value = courseBases.value.some((crs) => crs.checked);
};

const toggleAllChecked = () => {
  courseBases.value
    .filter((crs) => isFinished.value ? !initialzedCourseBaseIds.value.has(crs.courseBaseId || '') : true)
    .forEach((crs) => (crs.checked = allChecked.value));
    /*
  .forEach((crs) => {
    if (isFinished && initialzedCourseBaseIds.value.has(crs.courseBaseId || '')) {
      // 전체 시간표 반영상태이고 초기 데이터인 경우 체크 변경 불가
      return;
    }
    crs.checked = allChecked.value;
  });
  */
  hasChecked.value = allChecked.value;
};

// PageTitle Component의 "다음" 버튼 클릭에 의해 호출됨
const checkBeforeMove = async () => {
  if (courseBases.value.length === 0) {
    await dialog.alertSimple('과목을 등록해주세요.');
    return false;
  }

  // 중복 과목이 있는지 확인
  const hasDuplicated = courseBases.value.some((crs) => crs.isDuplicated);

  if (hasDuplicated) {
    await dialog.alertSimple('동일한 과목이 있습니다. <br>과목명과 시수를 확인해주세요.');
    return false;
  }

  // 빈 항목 제거
  const courseBasesWithoutEmpties = courseBases.value.filter((crs) => (crs.standardCourseTitle?.trim() || crs.displayedTitle.trim() || crs.checked === true));

  // 모든 필수 항목이 입력되었는지 확인
  const hasEmptyFields = courseBasesWithoutEmpties.some((crs) => !crs.standardCourseTitle || !crs.displayedTitle);

  if (hasEmptyFields) {
    await dialog.alertSimple('모든 필수 항목을 입력해주세요.');
    return false;
  }

  // 진행 중인 저장 대기
  if (pendingSavePromises.value.size > 0) {
    await Promise.all(Array.from(pendingSavePromises.value.values()));
  }

  // 저장안된 과목 저장 요청
  const unsavedCourses = courseBases.value
      .filter((crs) => !crs.courseBaseId && crs.standardCourseTitle && crs.displayedTitle)
      .map((crs) => ({
        displayedTitle: crs.displayedTitle,
        standardCourseTitle: crs.standardCourseTitle
      } as CourseBaseTitle))

  if (unsavedCourses.length > 0) {
    saveBeforeMove(unsavedCourses).then();
  }

  const nextStatus = TimetableStatus.Teacher;
  const isStatusUpdated = await progressContext.updateStatus(nextStatus);

  if (!isStatusUpdated) {
    await dialog.alertSimple('다음 단계로 이동할 수 없습니다.');
    return false;
  }

  return true;
};

// PageTitle Component의 "이전" 버튼 클릭에 의해 호출됨
const checkBeforePrevMove = async () => {
  // 진행 중인 저장 대기
  if (pendingSavePromises.value.size > 0) {
    await Promise.all(Array.from(pendingSavePromises.value.values()));
  }

  saveBeforeMove().then();
}

// 단계 이동 전 저장안된 과목 저장 요청
const saveBeforeMove = async (coursesToSave?: CourseBaseTitle[]) => {
  let unsavedCourses = coursesToSave;
  if (!unsavedCourses) {
    unsavedCourses = courseBases.value
      .filter((crs) => !crs.courseBaseId && crs.standardCourseTitle && crs.displayedTitle)
      .map((crs) => ({
        displayedTitle: crs.displayedTitle,
        standardCourseTitle: crs.standardCourseTitle
      } as CourseBaseTitle))
  }

  const { unique } = splitUniqueAndDuplicateCourses(unsavedCourses);

  if (unique.length > 0) {
    await courseBaseContext.addWithCourseBaseTitles(unique, false);
  }
}

// 추후 업데이트 알림 공통 핸들러
// const showComingSoon = async () => {
//   await dialog.alertSimple('추후 업데이트 예정입니다.');
// };

defineExpose({
  checkBeforeMove,
  checkBeforePrevMove,
});


// 도움말 열기
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

  activeStandardCourseInputIndex.value = null;

  const textHtml = event.clipboardData?.getData('text/html');
  if (!textHtml) return;

  // 붙여넣기 데이터 가공
  let courses = extractPastedCourses(textHtml);
  if (courses.length === 0) return;

  const isPaste = await dialog.confirm('등록된 데이터가 있는 경우, 추가로 붙여넣기 됩니다.<br>실행하시겠습니까?');
  if (!isPaste) return;

  // 현재 붙여넣은 row 의 정식, 표기 과목명 모두 입력안됐으면 삭제
  const { displayedTitle, standardCourseTitle } = courseBaseContext.courseBases[index];
  if (!displayedTitle && !standardCourseTitle) {
    courseBaseContext.courseBases.splice(index, 1);
  }

  // 과목수 제한
  const isOverLimit = await checkCourseLimit(courseBases.value.length + courses.length)
  if (isOverLimit) {
    courses = courses.slice(0, 300 - courseBases.value.length);
    if (courses.length === 0) return;
  }

  // 신규, 중복 과목 분리
  const { unique, duplicated } = splitUniqueAndDuplicateCourses(courses);
  // api 저장 요청 및 과목 추가
  await applyPastedCourses(unique, duplicated);
}

const extractPastedCourses = (textHtml: string): CourseBaseTitle[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(textHtml, 'text/html');
  const table = doc.body.querySelector('table');
  if (!table) return [];

  const rows: HTMLTableRowElement[] = Array.from(table.querySelectorAll('tr'));
  if (rows.length === 1 && rows[0].querySelectorAll('td').length === 1) return [];

  return rows
      .map((row) => {
        const tds = Array.from(row.querySelectorAll('td'));
        const standardCourseTitle = tds[0]?.innerText.trim() || '';
        let displayedTitle = tds[1]?.innerText.trim().substring(0, 5) || '';

        // 표기 과목명이 비어있으면 정식 과목명의 앞 2글자를 기본값으로 사용
        if (standardCourseTitle && !displayedTitle) {
          displayedTitle = standardCourseTitle.substring(0, 2);
        }

        return { standardCourseTitle, displayedTitle };
      })
      .filter(({ standardCourseTitle, displayedTitle }) => standardCourseTitle || displayedTitle); // 둘 다 비어있는 행은 제외
};

const splitUniqueAndDuplicateCourses = (courses: CourseBaseTitleWithIndex[]) => {
  const courseLength = courseBaseContext.courseBases.length;
  const titlesForDuplicateCheck = [...courseBaseContext.courseBases.filter((crs) => crs.courseBaseId).map(({ displayedTitle }) => displayedTitle)]
  return courses.reduce(
      (acc, course, idx) => {
        const key = course.displayedTitle;
        if (acc.seen.has(key)) {
          course.sortNo = courseLength + idx
          acc.duplicated.push(course);
        } else {
          acc.seen.add(key);
          acc.unique.push(course);
        }
        return acc;
      },
      {
        seen: new Set<string>(titlesForDuplicateCheck),
        unique: [] as CourseBaseTitle[],
        duplicated: [] as CourseBaseTitleWithIndex[],
      }
  );
};

const applyPastedCourses = async (unique: CourseBaseTitle[], duplicated: CourseBaseTitleWithIndex[]) => {
  try {
    // 신규 과목들 api 등록 요청 및 일괄 추가
    if (unique.length > 0) {
      await courseBaseContext.addWithCourseBaseTitles(unique, true);
    }

    // 중복 과목들 추가
    if (duplicated.length > 0) {
      duplicated.forEach(({standardCourseTitle, displayedTitle, sortNo}) => {
        sortNo && courseBaseContext.courseBases.splice(sortNo, 0, {
          standardCourseTitle,
          displayedTitle,
          isDoubleTeacher: false,
        } as CourseBase);
      });
    }
    
    for (const crs of courseBases.value) {
      if (!crs.standardCourseTitle) continue;
      await searchNeisCourseMatches(crs.standardCourseTitle);
    }
  } catch (error) {
    console.error('Error apply pasted courses:', error);
  }
};

const checkCourseLimit = async (courseCount: number) => {
  const maxCourses = 300;
  if (courseCount >= maxCourses) {
    await dialog.alertSimple(`과목 등록은 ${maxCourses}개까지 가능합니다.`);
    return true;
  }
  return false;
}

// 나이스 과목명 일치 확인후 일치하면 matchedCourseTitles 에 추가
const searchNeisCourseMatches = async (standardCourseTitle: string) => {
  if (matchedCourseTitles.value.includes(standardCourseTitle)) return;

  const standardCourses = await getStandardCourses(standardCourseTitle);
  if (standardCourses.map(c => c.courseName).includes(standardCourseTitle)) {
    matchedCourseTitles.value.push(standardCourseTitle);
  }
}

// 나이스 과목명 일치 여부 확인
const isCourseTitleInMatches = (crs: EditableCourseBase) => {
  if (!isMatchedTitlesInitialized.value) return true;
  if (!crs.standardCourseTitle) return true;
  return matchedCourseTitles.value.includes(crs.standardCourseTitle)
}
</script>

<style scoped lang="scss">
.tt-courses {
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
      width: 280px;
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
  .hi-tooltip-wrap {
    position: absolute;
    right: calc(50% - 8px);
    top: 15px;
    &::before {
      display: none;
    }
  }
  .table-head .btn-area {
    position: relative;
    .btn-help {
      position: absolute;
      right: 12px;
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
</style>
