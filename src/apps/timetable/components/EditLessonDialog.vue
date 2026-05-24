<template>
  <TimeTableModal size="md" class="course-edit-modal" @close="handleClickClose">
    <template v-slot:heading>
      수업 수정
      <p class="smr">
        교사의 수업을 변경합니다. 변경된 교사의 전체 시수 및 시수표가 변경됩니다. 
      </p>
    </template>
    <template v-slot:content>       
      <div class="gray-box mt-00">
        <div class="form-check-inline">
          <input type="radio" name="exchange" id="swap" value="swap" v-model="courseEditType"/>
          <label for="swap" class="mr-40"><span>맞교환</span></label>
        </div>
        <div class="form-check-inline">
          <input type="radio" name="exchange" id="toss" value="toss" v-model="courseEditType" />
          <label for="toss"><span>넘기기</span></label>
        </div>
      </div>
      <div class="course-edit direct">
        <div class="left-area">
          <div class="form-group-inline">
            <label>담당교사</label>
            <AutocompleteInputForConcurrentCourse
              v-model="sourceTarget[SourceTargetType.SOURCE].teacherName"
              :options="teacherOptions"
              placeholder="선택"
              :on-blur="() => sourceTarget[SourceTargetType.SOURCE].teacherName = sourceTarget[SourceTargetType.SOURCE].teacherNameBeforeEdit"
              nodata="일치하는 교사가 없습니다."
              @select="(item) => handleClickSelectTeacher(item, SourceTargetType.SOURCE)" 
            >
              <template #custom-option="{ items, selectItem }">
                <div class="item"
                  v-for="(item, idx) in items"
                  :key="idx"
                  @mousedown.prevent="selectItem(item)"
                >
                  {{ item.value.teacherName }} 
                </div>
                <div v-if="items.length === 0" class="hi-nodata sm p-00">
                  <p>검색 결과가 없습니다.</p>
                </div>
              </template>
            </AutocompleteInputForConcurrentCourse>  
          </div>
          <div class="form-group-inline">    
            <label for="course-name">과목명</label>
            <AutocompleteInputForConcurrentCourse
              v-model="sourceTarget[SourceTargetType.SOURCE].courseName"
              :options="getCourseOptionsByTeacherId(sourceTarget[SourceTargetType.SOURCE].teacherId)"
              placeholder="선택"
              :on-blur="() => sourceTarget[SourceTargetType.SOURCE].courseName = sourceTarget[SourceTargetType.SOURCE].courseNameBeforeEdit"
              @select="(item) => handleClickSelectCourse(SourceTargetType.SOURCE, item)"
            >
              <template #custom-option="{ items, selectItem }">
                <div class="item"
                  v-for="(item, idx) in items"
                  :key="idx"
                  @mousedown.prevent="selectItem(item)"
                >
                  {{ item.value.standardCourseTitle }} ({{ item.value.displayedTitle }}) 
                  <span class="txt-primary">({{ item.periodCount }})</span>
                </div>
                <div v-if="items.length === 0" class="hi-nodata sm p-00">
                  <p>일치하는 과목이 없습니다.</p>
                </div>
              </template>
            </AutocompleteInputForConcurrentCourse>
          </div>
          <div class="form-group-inline">
            <label for="class-group">학반</label>
            <HiSelectBox :value="sourceTarget[SourceTargetType.SOURCE].classIds" class="type01" @update:value="() => handleClickSelectClasses(SourceTargetType.SOURCE)" @openSelectBox="openClassOption(SourceTargetType.SOURCE)">
              <template #btnType>
                <div v-if="sourceTarget[SourceTargetType.SOURCE].classIds.length > 0">{{ sourceTarget[SourceTargetType.SOURCE].classNames }}</div>
                <div v-else>선택</div>
              </template>
              <template #custom-option="{ selectItem }" >
                <div class="option-list " :class="{ 'is-footer': getClassOptionsByTeacherAndCourse(SourceTargetType.SOURCE).length !== 0 }">
                  <template v-if="getClassOptionsByTeacherAndCourse(SourceTargetType.SOURCE).length > 0">
                    <div v-for="option in getClassOptionsByTeacherAndCourse(SourceTargetType.SOURCE)" :key="option.key" class="item" >
                      <label class="form-check-inline">
                        <input type="checkbox" :id="option.key" :value="option.key" v-model="checkedClassOptionIds"/>
                        <label :for="option.key">
                          <span>{{ option.value.className }}</span>
                        </label>
                      </label>
                    </div>
                  </template>
                  <div v-else class="hi-nodata">
                    <p>배정가능한 학반이 없습니다.</p>
                  </div>
                </div>
                <div v-if="getClassOptionsByTeacherAndCourse(SourceTargetType.SOURCE).length !== 0" class="option-footer p-10">
                  <button type="button" class="btn btn-primary btn-sm w100" @click="selectItem(SourceTargetType.SOURCE)">
                    등록
                  </button>
                </div>
              </template>
            </HiSelectBox>
            <!-- <div class="sm opt-top hi-selectbox">
              <button type="button" class="selected" @click="openClassOption(SourceTargetType.SOURCE)">
                <div v-if="sourceTarget[SourceTargetType.SOURCE].classIds.length > 0">{{ sourceTarget[SourceTargetType.SOURCE].classNames }}</div>
                <div v-else>선택</div>
              </button>
              <div v-if="sourceTarget[SourceTargetType.SOURCE].showClassOption" v-click-outside="() => closeClassOption(SourceTargetType.SOURCE)" class="option-list-wrap" >
                <div class="option-list is-footer">
                  <template v-if="getClassOptionsByTeacherAndCourse(SourceTargetType.SOURCE).length > 0">
                    <div v-for="option in getClassOptionsByTeacherAndCourse(SourceTargetType.SOURCE)" :key="option.key" class="item">
                      <div class="form-check-inline">
                        <input type="checkbox" :id="option.key" :value="option.key" v-model="checkedClassOptionIds">
                        <label :for="option.key">
                          <span>{{ option.value.className }}</span>
                        </label>
                      </div>
                    </div>
                  </template>
                  <div v-else class="hi-nodata">
                    <p>배정가능한 학반이 없습니다.</p>
                  </div>
                </div>
                <div class="option-footer p-10">
                  <button type="button" class="btn btn-primary btn-sm w100" @click="handleClickSelectClasses(sourceTarget[SourceTargetType.SOURCE])">등록</button>
                </div>
              </div>
            </div> -->
          </div>
          <div class="form-group-inline">
            <label>기존 / 변경시수              
              <HiTooltip 
                class="hi-tooltip-wrap" ico="help" 
                :title-html="`기존 담당하는 전체 시수 / 맞교환 또는 넘기기 시 담당하는 전체 시수`"
              />
            </label>
            <span>
             {{ calculatePeriodCountOnSelected(SourceTargetType.SOURCE) }}
            </span>
          </div>
        </div>
        <i class="change" :class="{chain: courseEditType === CourseEditType.TOSS}" ></i>
        <div class="right-area" v-if="courseEditType === CourseEditType.SWAP">
          <div class="form-group-inline">
            <label>담당교사</label>
            <AutocompleteInputForConcurrentCourse
              v-model="sourceTarget[SourceTargetType.TARGET].teacherName"
              :options="teacherOptions.filter((t) => t.key !== sourceTarget[SourceTargetType.SOURCE].teacherId)"
              placeholder="선택"
              nodata="일치하는 교사가 없습니다."
              :on-blur="() => sourceTarget[SourceTargetType.TARGET].teacherName = sourceTarget[SourceTargetType.TARGET].teacherNameBeforeEdit"
              @select="(item) => handleClickSelectTeacher(item, SourceTargetType.TARGET)"
              :disabled="isDisabled"
            >
              <template #custom-option="{ items, selectItem }">
                <div class="item"
                  v-for="(item, idx) in items"
                  :key="idx"
                  @mousedown.prevent="selectItem(item)"
                >
                  {{ item.value.teacherName }} 
                </div>
                <div v-if="items.length === 0" class="hi-nodata sm p-00">
                  <p>검색 결과가 없습니다.</p>
                </div>
              </template>
            </AutocompleteInputForConcurrentCourse>
          </div>
          <div class="form-group-inline">    
            <label for="course-name">과목명</label>
            <AutocompleteInputForConcurrentCourse
              v-model="sourceTarget[SourceTargetType.TARGET].courseName"
              :options="getCourseOptionsByTeacherId(sourceTarget[SourceTargetType.TARGET].teacherId)"
              placeholder="선택"
              :disabled="isDisabled"
              :on-blur="() => sourceTarget[SourceTargetType.TARGET].courseName = sourceTarget[SourceTargetType.TARGET].courseNameBeforeEdit"
              @select="(item) => handleClickSelectCourse(SourceTargetType.TARGET, item)"
            >
              <template #custom-option="{ items, selectItem }">
                <div class="item"
                  v-for="(item, idx) in items"
                  :key="idx"
                  @mousedown.prevent="selectItem(item)"
                >
                  {{ item.value.standardCourseTitle }} ({{ item.value.displayedTitle }}) 
                  <span class="txt-primary">({{ item.periodCount }})</span>
                </div>
                <div v-if="items.length === 0" class="hi-nodata sm p-00">
                  <p>일치하는 과목이 없습니다.</p>
                </div>
              </template>
            </AutocompleteInputForConcurrentCourse>
          </div>
          <div class="form-group-inline">
            <label for="class-group">학반</label>
            <HiSelectBox :value="sourceTarget[SourceTargetType.TARGET].classIds" class="type01" :disabled="isDisabled" @update:value="() => handleClickSelectClasses(SourceTargetType.TARGET)" @openSelectBox="openClassOption(SourceTargetType.TARGET)">
              <template #btnType>
                <div v-if="sourceTarget[SourceTargetType.TARGET].classIds.length > 0">{{ sourceTarget[SourceTargetType.TARGET].classNames }}</div>
                <div v-else>선택</div>
              </template>
              <template #custom-option="{ selectItem }">
                <div class="option-list"
                :class="{ 'is-footer': getClassOptionsByTeacherAndCourse(SourceTargetType.TARGET).length !== 0 }"
                >
                  <template v-if="getClassOptionsByTeacherAndCourse(SourceTargetType.TARGET).length > 0">
                    <div v-for="option in getClassOptionsByTeacherAndCourse(SourceTargetType.TARGET)" :key="option.key" class="item">
                      <div class="form-check-inline">
                        <input type="checkbox" :id="option.key" :value="option.key" v-model="checkedClassOptionIds" :disabled="option.disabled">
                        <label :for="option.key">
                          <span>{{ option.value.className }}</span>
                        </label>
                      </div>
                    </div>
                  </template>
                  <div v-else class="hi-nodata">
                    <p>배정가능한 학반이 없습니다.</p>
                  </div>
                </div>
                <div v-if="getClassOptionsByTeacherAndCourse(SourceTargetType.TARGET).length !== 0" class="option-footer p-10">
                  <button type="button" class="btn btn-primary btn-sm w100" @click="selectItem(SourceTargetType.TARGET)"                  >
                    등록
                  </button>
                </div>
              </template>
            </HiSelectBox>
            <!-- <div class="sm opt-top hi-selectbox">
              <button type="button" class="selected" @click="openClassOption(SourceTargetType.TARGET)">
                <div v-if="sourceTarget[SourceTargetType.TARGET].classIds.length > 0">{{ sourceTarget[SourceTargetType.TARGET].classNames }}</div>
                <div v-else>선택</div>
              </button>
              <div v-if="sourceTarget[SourceTargetType.TARGET].showClassOption" v-click-outside="() => closeClassOption(SourceTargetType.TARGET)" class="option-list-wrap" >
                <div class="option-list is-footer">
                  <template v-if="getClassOptionsByTeacherAndCourse(SourceTargetType.TARGET).length > 0">
                    <div v-for="option in getClassOptionsByTeacherAndCourse(SourceTargetType.TARGET)" :key="option.key" class="item">
                      <div class="form-check-inline">
                        <input type="checkbox" :id="option.key" :value="option.key" v-model="checkedClassOptionIds">
                        <label :for="option.key">
                          <span>{{ option.value.className }}</span>
                        </label>
                      </div>
                    </div>
                  </template>
                  <div v-else class="hi-nodata">
                    <p>배정가능한 학반이 없습니다.</p>
                  </div>
                </div>
                <div class="option-footer p-10">
                  <button type="button" class="btn btn-primary btn-sm w100" @click="handleClickSelectClasses(sourceTarget[SourceTargetType.TARGET])">등록</button>
                </div>
              </div>
            </div> -->
          </div>
          <div class="form-group-inline">
            <label>기존 / 변경시수              
              <HiTooltip 
                class="hi-tooltip-wrap" ico="help" 
                :title-html="`기존 담당하는 전체 시수 / 맞교환 또는 넘기기 시 담당하는 전체 시수`"
              />
            </label>
            <span>
              {{ calculatePeriodCountOnSelected(SourceTargetType.TARGET) }}
            </span>
          </div>
        </div>
        <div class="right-area j-between" v-else>
          <div class="form-group-inline">
            <label>담당교사</label>
            <AutocompleteInputForConcurrentCourse
              ref="autocompleteTeacherInput"
              class="custom-option"
              v-model="sourceTarget[SourceTargetType.TARGET].teacherName"
              :options="teacherOptionsForToss"
              placeholder="선택"
              nodata="일치하는 교사가 없습니다."
              :disabled="isDisabled"
              :hasAddedOption="true"
              :on-blur="() => handleSafeBlur(sourceTarget[SourceTargetType.TARGET])"
              @select="(item) => handleClickSelectTeacher(item, SourceTargetType.TARGET)"
            >
              <template #custom-option="{ items, selectItem }">
                <div class="autocomplete-list-inner" :class="{'is-add-footer' : true}">
                  
                  <div class="item" 
                    v-for="(item, index) in items" 
                    :key="index"
                    :class="{'input-wrap': item.isEditing}"
                    @mousedown.prevent="!item.isEditing && selectItem(item)"
                  >
                    <template v-if="item.isEditing">
                      <input class="sm" type="text"
                        :ref="el => teacherNameRefs[index] = el"
                        :value="item.value.teacherName"
                        @keyup.enter="e => e.target.blur()"
                        @blur="e => handleFinishEditTeacherName(item, e.target.value)"
                        @click.stop
                        @mousedown.stop
                        spellcheck="false"
                      />
                    </template>

                    <template v-else>
                      {{ item.value.teacherName }}
                      <span v-if="isAddedTeacher(item)" class="ml-5 flex-center">
                        <button type="button" @mousedown.prevent.stop="handleClickEditTeacherName(item, index)" class="btn-edit">
                          <i class="ico ico-pen ico-size-20 ico-gray"></i>
                        </button>
                      </span>
                    </template>
                  </div>

                  <div v-if="items.length === 0" class="hi-nodata sm p-00">
                    <p>일치하는 교사가 없습니다.</p>
                  </div>
                </div>

                <div class="add-footer">
                  <button @mousedown.prevent="handleClickAddTeacher" type="button">
                    <i class="ico ico-plus ico-primary ico-size-20"></i>
                    교사추가
                  </button>
                </div>
              </template> 
            </AutocompleteInputForConcurrentCourse>
          </div>
          <div class="form-group-inline">
            <label>기존 / 변경시수
              <HiTooltip 
                class="hi-tooltip-wrap" ico="help" 
                :title-html="`기존 담당하는 전체 시수 / 맞교환 또는 넘기기 시 담당하는 전체 시수`"
              />
              </label>
            {{ calculatePeriodCountOnSelected(SourceTargetType.TARGET) }}
          </div>
        </div>
      </div>     
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="handleClickClose">취소</button>
      <button type="button" class="btn btn-primary btn-lg" @click="handleClickSubmit">변경</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance, inject, onMounted, watch, nextTick, ComponentPublicInstance } from 'vue';
import Timetable from '@/apps/timetable/core';
import HiSelectBox from '@/components/Form/HiSelectBox.vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import AutocompleteInputForConcurrentCourse from '@/apps/timetable/components/AutocompleteInputForConcurrentCourse.vue';
import { useDialog } from '@/apps/timetable/composables/dialog';

import { TimetablePeriod } from '@/apps/timetable/core/types';

import {
  Class,
  Course,
  LessonConf,
  Teacher,
  Lesson
} from '@/apps/timetable/core/types';

import {
  ContextKeys,
  TimetableCourseContext,
  TimetableTeacherContext,
  TimetableClassContext,
  LessonConfContext,
  LessonContext,
  TeacherCourseContext,
  TeacherCourseBaseContext
} from '@/apps/timetable/contexts';
import { getLessonService } from '@/apps/timetable/services/lesson-service';
import { add, trim } from 'lodash';
import { TimetableDisplayUtils } from '../common/utils';
import { TeacherForAdd, TeacherForUpdate } from '../contexts/timetable-teacher-context';

interface LessonConfSimple {
  // lessonConfId: string;
  courseId: string;
  courseName: string;
  classIds: Array<string>;
  classNames: string;
  teacherId: string;
  teacherName: string;
  // gradeClass: string;
  teacherNameBeforeEdit: string;
  courseNameBeforeEdit: string;
  // assignedPeriods: Array<Array<number>>;
  // assignablePeriods: Array<Array<number>>;
};

interface DayPeriod { dayOfWeek: number, period: number, consecutivePeriod: number };
interface TeacherOption { key: string, value: { teacherName: string }, isEditing: boolean };

enum SourceTargetType {
  SOURCE = 'source',
  TARGET = 'target'
};

enum CourseEditType {
  SWAP = 'swap',
  TOSS = 'toss'
};

type SourceTarget = {
  [key in SourceTargetType]: ReturnType<typeof defaultLessonConfSimple>
};

const emit = defineEmits(['close']);
const defaultLessonConfSimple = () => ({
  // lessonConfId: '',
  classIds: [],
  classNames: '',
  courseId: '',
  courseName: '',
  courseNameBeforeEdit: '',
  teacherId: '',
  teacherName: '',
  teacherNameBeforeEdit: '',
  // gradeClass: '',
  // concurrentCourseId: '',
  // assignedPeriods: [],
  // assignablePeriods: []
} as LessonConfSimple);

const dialog = useDialog();
const courseEditType = ref<CourseEditType>(CourseEditType.SWAP);
const sourceTarget = ref<SourceTarget>({
  [SourceTargetType.SOURCE]: defaultLessonConfSimple(),
  [SourceTargetType.TARGET]: defaultLessonConfSimple()
});

const isInlineEditing = ref(false); // 인라인 편집 중인지 여부 (Blur 제어용)

const checkedClassOptionIds = ref<Array<string>>([]);
const addedTeachers = ref<Array<TeacherOption>>([]);
const teacherNameRefs = ref<(Element | null | ComponentPublicInstance)[]>([]);
const autocompleteTeacherInput = ref(null);

const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
const teacherCourseBaseContext = inject(ContextKeys.TeacherCourseBase) as TeacherCourseBaseContext;

const lessonService = getLessonService(
  lessonContext,
  lessonConfContext,
  teacherCourseContext,
  teacherContext,
  teacherCourseBaseContext
);

const lessons = computed({
  get: () => { return lessonContext.lessons; },
  set: (value) => { lessonContext.lessons = value; }
});
const courseMap = computed(() => courseContext.courseMap as Record<string, Course>);
const teachers = computed(() => teacherContext.teachers as Array<Teacher>);
const lessonConfsMapByTeacher = computed(() => lessonConfContext.lessonConfsMapByTeacher);
const teacherMap = computed(() => teacherContext.teacherMap as Record<string, Teacher>);
const classMap = computed(() => classContext.classMap as Record<string, Class>);
const isDisabled = computed(() => {
  const source = sourceTarget.value[SourceTargetType.SOURCE];
  return !source.teacherId || !source.courseId || source.classIds.length === 0;
})

const lessonConfs = computed(() => lessonConfContext.lessonConfs as LessonConf[]);
const teacherOptions = computed(() => {
  return teachers.value
    .filter(t => {
      const added = addedTeachers.value.find(at => at.key === t.teacherId);
      if (added) return false;

      const lessonConfs = lessonConfsMapByTeacher.value[t.teacherId];
      if (!lessonConfs) return true;

      return lessonConfs.some(lc => !lc.concurrentCourseId);
    })
    .map(lc => {
      const teacher = teacherMap.value[lc.teacherId];
      return { key: teacher.teacherId, value: { teacherName: teacher.teacherName }, isEditing: false };
    })
    .concat(addedTeachers.value);
});

const teacherOptionsForToss = computed(() => {
  if (courseEditType.value !== CourseEditType.TOSS || isDisabled.value) return [];
  
  // 1. Toss 가능한 기존 교사 목록 가져오기
  const baseOptions = getTeacherOptionsForToss();

  // 2. 추가된 교사(addedTeachers) 중 baseOptions에 없는 것만 병합
  // (이미 baseOptions에 있다면 검색 등에서 중복 노출 방지)
  const uniqueAdded = addedTeachers.value.filter(added => 
    !baseOptions.some(base => base.key === added.key)
  );

  return [...baseOptions, ...uniqueAdded];
});

watch(
  () => [courseEditType.value], 
  async () => {
    await nextTick();
    sourceTarget.value[SourceTargetType.TARGET] = defaultLessonConfSimple();
  }
);

const handleSafeBlur = (target: any) => {
  // 인라인 편집 중(버튼 클릭 직후, 인풋 포커스 등)이면 무시
  if (isInlineEditing.value) return; 
  
  // 현재 배열 내에 편집 중인 항목이 하나라도 있으면 무시 (Blur 이벤트 충돌 방지)
  const isAnyEditing = addedTeachers.value.some(t => t.isEditing);
  if (isAnyEditing) return;

  // 인풋 값 리셋 (선택되지 않은 텍스트 타이핑 취소)
  target.teacherName = target.teacherNameBeforeEdit;
};

const handleClickClose = () => {
  emit('close');
};

const showAutoSaveToast = () => {  
  dialog.toast('변경사항이 자동 저장 되었습니다.');
};

const getCourseOptionsByTeacherId = (teacherId: string) => {
  if (!teacherId) return [];

  const base = lessonConfs.value
    .filter((lessonConf) =>
      lessonConf.teacherId === teacherId &&
      !lessonConf.concurrentCourseId
    );

  const seen: Record<string, boolean> = {};
  return base
    .filter((lessonConf) => {
      const course = courseMap.value[lessonConf.courseId];
      if (!course || seen[course.courseId]) return false;
      seen[course.courseId] = true;
      return true;
    })
    .map((lessonConf) => {
      const course = courseMap.value[lessonConf.courseId];
      return {
        key: course.courseId,
        periodCount: course.periodCount,
        value: {
          standardCourseTitle: course.standardCourseTitle,
          displayedTitle: course.displayedTitle
        }
      };
    });
};

const getTeacherOptionsForToss = () => {
  if ( courseEditType.value !== CourseEditType.TOSS || isDisabled.value ) return [];
  
  const source = sourceTarget.value[SourceTargetType.SOURCE];
  const sourceOverview = Timetable.getTeacherOverview(source.teacherId);

  const sourceLessons = sourceOverview.assignedLessons.filter(
    l => l.courseId === source.courseId && source.classIds.includes(l.classId) && !l.concurrentCourseId
  );
  const sourcePeriods = sourceLessons.map(l => [l.dayOfWeek, l.period]);

  return teacherOptions.value
    .filter(option => option.key !== source.teacherId)
    .filter(option => {
      const targetOverview = Timetable.getTeacherOverview(option.key);
      const canTargetReceiveSource = sourcePeriods.every(period => {
        return targetOverview.remainingLessonPeriods.some(p => p[0] === period[0] && p[1] === period[1]);
      });
      return canTargetReceiveSource;
    });
}

const getClassOptionsByTeacherAndCourse = (type: SourceTargetType) => {
  const { teacherId, courseId } = sourceTarget.value[type];
  if (!teacherId || !courseId) return [];

  // 기본적으로 필터링된 lessonConfs
  const baseFilteredLessonConfs = lessonConfs.value.filter(
    (lessonConf) =>
      lessonConf.teacherId === teacherId &&
      lessonConf.courseId === courseId &&
      !lessonConf.concurrentCourseId
  );

  // SWAP이 아니거나 SOURCE 타입일 경우 (기존 로직 기반, checked 상태 추가)
  if (courseEditType.value !== CourseEditType.SWAP || type !== SourceTargetType.TARGET) { 
    return createBaseClassOptions(baseFilteredLessonConfs); 
  }
  
  // 맞교환 (SWAP) 타입이고 타겟(TARGET)일 경우

  // 소스와 타겟 정보
  const source = sourceTarget.value[SourceTargetType.SOURCE];
  const target = sourceTarget.value[SourceTargetType.TARGET];
  const sourceOverview = Timetable.getTeacherOverview(source.teacherId);
  const targetOverview = Timetable.getTeacherOverview(target.teacherId);

  // 소스에서 교환할 레슨
  const sourceLessons = sourceOverview.assignedLessons.filter(
    l => l.courseId === source.courseId && source.classIds.includes(l.classId) && !l.concurrentCourseId
  );
  const sourcePeriods = sourceLessons.map(l => [l.dayOfWeek, l.period]);

  // 타겟에서 교환할 레슨
  const targetLessons = targetOverview.assignedLessons.filter(
    l => l.courseId === target.courseId && !l.concurrentCourseId
  );
  const targetPeriods = targetLessons.map(l => [l.dayOfWeek, l.period]);

  // 타겟이 소스 레슨을 받을 수 있는지 확인
  const targetAvailablePeriods = [...targetOverview.remainingLessonPeriods, ...targetPeriods];
  const canTargetReceiveSource = sourceLessons.every(
    l => targetAvailablePeriods.some(p => p[0] === l.dayOfWeek && p[1] === l.period)
  );
  if (!canTargetReceiveSource) return [];

  // 타겟 레슨 시간표를 학반별로 그룹화
  const targetLessonPeriodsByClassId = targetLessons.reduce((acc, l) => {
    acc[l.classId] ||= [];
    acc[l.classId].push([l.dayOfWeek, l.period]);
    return acc;
  }, {} as Record<string, Array<Array<number>>>);

  // 소스 레슨과 시간대가 겹치는 타겟 레슨들을 찾고, 해당 학반 ID들을 추출
  const overlappedLessons = Object.keys(targetLessonPeriodsByClassId)
    .filter(classId => targetLessonPeriodsByClassId[classId].some(period => sourcePeriods.some(p => p[0] === period[0] && p[1] === period[1])))
    .flatMap(classId => targetLessons.filter(l => l.classId === classId));
  const overlappedClassIds = Array.from(new Set(overlappedLessons.map(l => l.classId)));

  // 소스가 겹치는 타겟 레슨을 받을 수 있는지 확인
  const sourceAvailablePeriods = [...sourceOverview.remainingLessonPeriods, ...sourcePeriods];
  const canSourceReceiveTarget = overlappedLessons.every(
    l => sourceAvailablePeriods.some(p => p[0] === l.dayOfWeek && p[1] === l.period)
  );
  if (!canSourceReceiveTarget) return [];

  // 타겟에서 중복되지 않은 학반 중 소스가 받을 수 있는 학반 (후보군)
  const candidateClassPeriods = targetLessons
    .filter(l => !overlappedClassIds.includes(l.classId))
    .reduce((acc, l) => {
      acc[l.classId] ||= [];
      acc[l.classId].push([l.dayOfWeek, l.period]);
      return acc;
    }, {} as Record<string, Array<Array<number>>>);

  const exchangeableClassIds = Object.keys(candidateClassPeriods).filter(
    classId => candidateClassPeriods[classId].every(period => sourceAvailablePeriods.some(p => p[0] === period[0] && p[1] === period[1]))
  );

  // 실제 변경에 참여할 수 있는 학반 ID들 (겹치거나 교환 가능한)
  const involvedClassIds = Array.from(new Set([...overlappedClassIds, ...exchangeableClassIds]));

  // 타겟의 미배정 lessonConf 중, 아직 involvedClassIds에 포함되지 않은 학반
  const unassignedRemainingClassIds = targetOverview.remainingLessonConfs
    .filter(lessonConf =>
      lessonConf.courseId === target.courseId &&
      !lessonConf.concurrentCourseId &&
      !involvedClassIds.includes(lessonConf.classId) && // 이미 involved에 포함된 것은 제외
      !targetOverview.assignedLessonConfs.some(assigned => assigned.lessonConfId === lessonConf.lessonConfId)
    )
    .map(lessonConf => lessonConf.classId);

  // 선택 가능한 학반 ID: 교환 가능한 학반 + 미배정 학반 (중복 제거)
  const selectableClassIds = Array.from(new Set([...exchangeableClassIds, ...unassignedRemainingClassIds]));

  // 최종적으로 반환할 학반 옵션 목록
  return baseFilteredLessonConfs
    .map(lessonConf => {
      const clazz = classMap.value[lessonConf.classId];
      /*
      const className = clazz.isVirtual
        ? `${clazz.grade}-가상${clazz.classNumber}`
        : `${clazz.grade}-${clazz.classNumber}`;
      */
      const className = TimetableDisplayUtils.formatFullClassName(clazz);
      const checked = overlappedClassIds.includes(clazz.classId);
      const disabled = !selectableClassIds.includes(clazz.classId) || overlappedClassIds.includes(clazz.classId);
      return {
        key: clazz.classId,
        checked,
        disabled,
        value: { className }
      };
    })
    .sort((a, b) => {
      // 체크된 항목 우선 정렬, 그 다음 학년/반 순서
      if (!a || !b) return 0;
      if (a.checked && !b.checked) return -1;
      if (!a.checked && b.checked) return 1;

      const classA = classMap.value[a.key];
      const classB = classMap.value[b.key];
      if (!classA || !classB) return 0;
      return (classA.grade - classB.grade) || (classA.classNumber - classB.classNumber);
    })
    // overlap되는 학반을 제외하고, 선택이 불가능한 학반 필터
    .filter(option => !option.disabled || option.checked);
};

const createBaseClassOptions = (filteredConfs: LessonConf[]) => {
  const seen: Record<string, boolean> = {};
  return filteredConfs
    .filter((lessonConf) => {
      const clazz = classMap.value[lessonConf.classId];
      if (!clazz || seen[clazz.classId]) return false;
      seen[clazz.classId] = true;
      return true;
    })
    .sort((a, b) => {
      const classA = classMap.value[a.classId];
      const classB = classMap.value[b.classId];
      if (!classA || !classB) return 0;
      return (classA.grade - classB.grade) || (classA.classNumber - classB.classNumber);
    })
    .map((lessonConf) => {
      const clazz = classMap.value[lessonConf.classId];
      const className = TimetableDisplayUtils.formatFullClassName(clazz);
      return {
        key: lessonConf.classId,
        disabled: false,
        value: { className }
      };
    });
};

const openClassOption = (type: SourceTargetType) => {
  checkedClassOptionIds.value = sourceTarget.value[type].classIds.length ? 
    sourceTarget.value[type].classIds : 
    getClassOptionsByTeacherAndCourse(type)
      .filter(option => option && (option as any).checked === true)
      .map(option => option.key);
};

const resetSelectedCourse = (sourceTarget: LessonConfSimple) => {
  sourceTarget.courseId = '';
  sourceTarget.courseName = '';
  sourceTarget.courseNameBeforeEdit = '';
};

const resetSelectedClasses = (sourceTarget: LessonConfSimple) => {
  sourceTarget.classIds = [];
  sourceTarget.classNames = '';
};

const resetTarget = () => {
  sourceTarget.value[SourceTargetType.TARGET] = defaultLessonConfSimple();
};

const handleClickSelectTeacher = (item: { key: string, value: { teacherName: string } }, type: SourceTargetType) => {
  const selected = sourceTarget.value[type];

  resetSelectedCourse(selected);
  resetSelectedClasses(selected);
  if (type === SourceTargetType.SOURCE) resetTarget();
  
  selected.teacherId = item.key;
  selected.teacherName = item.value.teacherName;
  selected.teacherNameBeforeEdit = item.value.teacherName;
};

const handleClickSelectCourse = (
  type: SourceTargetType,
  courseOption: {key: string, periodCount: number, value: { displayedTitle: string}}
) => {
  const selected = sourceTarget.value[type];
  resetSelectedClasses(selected);
  if (type === SourceTargetType.SOURCE) resetTarget();

  // 선택된 과목명 표시 형식: 표시이름 (시수)
  const displayed = `${courseOption.value.displayedTitle} (${courseOption.periodCount})`;
  selected.courseName = displayed;
  selected.courseNameBeforeEdit = displayed;
  selected.courseId = courseOption.key;
};

const handleClickSelectClasses = async (type: SourceTargetType) => {
  const item = sourceTarget.value[type];
  if (type === SourceTargetType.SOURCE) resetTarget();

  item.classIds = checkedClassOptionIds.value;
  item.classNames = checkedClassOptionIds.value
    .map(id => {
      return TimetableDisplayUtils.formatFullClassName(classMap.value[id]);
      // classMap.value[id]?.grade + '-' + classMap.value[id]?.classNumber
    })
    .filter(name => !!name)
    .sort((a, b) => {
      const [gradeA, classNumberA] = a.split('-').map(Number);
      const [gradeB, classNumberB] = b.split('-').map(Number);
      return gradeA - gradeB || classNumberA - classNumberB;
    })
    .join(', ');
  checkedClassOptionIds.value = [];
};

const calculatePeriodCountOnSelected = (type: SourceTargetType) => {
  const cur = sourceTarget.value[type];
  if (!cur.teacherId && !cur.teacherName) return '0/0';

  const summarize = (key: SourceTargetType) => {
    const { teacherId, courseId, classIds } = sourceTarget.value[key];
    if (!teacherId) return { current: 0, deducted: 0 };

    const allConfs = lessonConfs.value.filter(c => c.teacherId === teacherId);
    const current = allConfs.reduce((sum, conf) => sum + (courseMap.value[conf.courseId]?.periodCount || 0), 0);

    if (!courseId || classIds.length === 0) return { current, deducted: 0 };

    const overview = Timetable.getTeacherOverview(teacherId) || { assignedLessonConfs: [], remainingLessonConfs: [] };
    const assigned = overview.assignedLessonConfs || [];
    const remaining = overview.remainingLessonConfs || [];

    const deducted = [...assigned, ...remaining]
      .filter(lc => lc.courseId === courseId && classIds.includes(lc.classId))
      .length;

    return { current, deducted };
  };

  const source = summarize(SourceTargetType.SOURCE);
  const target = summarize(SourceTargetType.TARGET);

  if (
    (courseEditType.value === CourseEditType.SWAP && (sourceTarget.value[SourceTargetType.SOURCE].classIds.length === 0 || sourceTarget.value[SourceTargetType.TARGET].classIds.length === 0))
    || (courseEditType.value === CourseEditType.TOSS && !sourceTarget.value[SourceTargetType.TARGET].teacherId)
  ) {
    const v = type === SourceTargetType.SOURCE ? source.current : target.current;
    return `${v}/${v}`;
  }

  const computeAfter = (orig: { current: number, deducted: number }, other: { deducted: number }) =>
    `${orig.current}/${orig.current - orig.deducted + other.deducted}`;

  return type === SourceTargetType.SOURCE
    ? computeAfter(source, target)
    : computeAfter(target, source);
};

const handleClickSubmit = async () => {
  const result = validationCheck();
  if (!result) return;

  courseEditType.value === CourseEditType.SWAP
    ? await processToSwap()
    : await processToToss();

  emit('close');
  // console.log(Timetable.getTeacherOverview("3cc0b8c0-8de8-4b6c-bc1f-06ce36d452ea"));
};

const validationCheck = () => {
  const source = sourceTarget.value[SourceTargetType.SOURCE];
  const target = sourceTarget.value[SourceTargetType.TARGET];
  const checkCommonFields = !source.teacherId || !source.courseId || source.classIds.length === 0 || !(target.teacherId || target.teacherName);
  const isBlank = courseEditType.value === CourseEditType.SWAP ? checkCommonFields || !target.courseId || target.classIds.length === 0 : checkCommonFields;

  if (isBlank) {
    dialog.alertSimple('담당교사, 과목명, 학반을 모두 선택해주세요.');
    return false;
  }

  return true;
}

const processToSwap = async () => {
  const source = sourceTarget.value[SourceTargetType.SOURCE];
  const target = sourceTarget.value[SourceTargetType.TARGET];

  // source와 target의 lesson 정보 삭제 ( lessonId, dayOfWeek, period, consecutivePeriod )
  const sourceLessonsToDelete = Timetable.getTeacherOverview(source.teacherId).assignedLessons
    .filter(l => l.courseId === source.courseId && source.classIds.includes(l.classId) && !l.concurrentCourseId)
    .flatMap(l => 
      l.consecutiveGroupId
        ? lessons.value.filter(lesson => lesson.consecutiveGroupId === l.consecutiveGroupId)
        : [l]
    );
  const originSourcePeriod = extractOriginPeriods(sourceLessonsToDelete);
  
  const targetLessonsToDelete = Timetable.getTeacherOverview(target.teacherId).assignedLessons
    .filter(l => l.courseId === target.courseId && target.classIds.includes(l.classId) && !l.concurrentCourseId)
    .flatMap(l => 
      l.consecutiveGroupId
        ? lessons.value.filter(lesson => lesson.consecutiveGroupId === l.consecutiveGroupId)
        : [l]
    );
  const originTargetPeriod = extractOriginPeriods(targetLessonsToDelete);
  
  const lessonsToDelete = [...sourceLessonsToDelete, ...targetLessonsToDelete];
  const lessonIdsToDelete = lessonsToDelete.map(l => l.lessonId);

  lessonsToDelete.forEach(lesson => Timetable.resetAssignedLesson(lesson));
  lessons.value = lessons.value.filter(l => !lessonIdsToDelete.includes(l.lessonId));

  // source와 target의 lessonConf 정보 업데이트
  const lessonConfsToUpdate = lessonConfs.value
    .filter(lessonConf => 
      (lessonConf.teacherId === source.teacherId && lessonConf.courseId === source.courseId && source.classIds.includes(lessonConf.classId)) ||
      (lessonConf.teacherId === target.teacherId && lessonConf.courseId === target.courseId && target.classIds.includes(lessonConf.classId)))
    .reduce((acc, conf) => {
      const key = conf.teacherId;
      (acc[key] ||= []).push(conf);
      return acc;
    }, {} as Record<string, Array<LessonConf>>);
  
  if (Object.keys(lessonConfsToUpdate).length !== 2) return;

  const updatedSourceConfs = lessonConfsToUpdate[source.teacherId].map(conf => {conf.teacherId = target.teacherId; return conf;});
  const updatedTargetConfs = lessonConfsToUpdate[target.teacherId].map(conf => {conf.teacherId = source.teacherId; return conf;});
  // const updatedLessonConfs = [...updatedSourceConfs, ...updatedTargetConfs];

  // lessonConfContext.replace(updatedLessonConfs);

  refreshConfsAndLessonsWithContext();

  // 변경된 lessonConf를 기반으로 lesson 배정
  const updatedSourceLesson = assignAndCollectLessons(updatedSourceConfs, originSourcePeriod);
  const updatedTargetLesson = assignAndCollectLessons(updatedTargetConfs, originTargetPeriod);
  const lessonsToAdd = [...updatedSourceLesson, ...updatedTargetLesson];
  
  // api 콜
  const sourceConfIds = lessonConfsToUpdate[source.teacherId].map(conf => conf.lessonConfId);
  const targetConfIds = lessonConfsToUpdate[target.teacherId].map(conf => conf.lessonConfId);

  await lessonService.swap({lessonIdsToDelete, lessonsToAdd, sourceConfIds, targetConfIds})

  try {
    // 작업내역 저장: 맞교환 [홍길동] 선생님 2-1 [국어] ↔ [심청이] 선생님 2-3 [음악]
    const sourseClassNames = source.classIds
      .map(id => {
        const clazz = classMap.value[id];
        return TimetableDisplayUtils.formatFullClassName(clazz);
      })
      .join(', ');
    const targetClassNames = target.classIds
      .map(id => {
        const clazz = classMap.value[id];
        return TimetableDisplayUtils.formatFullClassName(clazz);
      })
      .join(', ');

    const historyMemo = `(자동) 맞교환 [${source.teacherName}] 선생님 ${sourseClassNames} [${source.courseName}] ↔ [${target.teacherName}] 선생님 ${targetClassNames} [${target.courseName}]`;
    const isUpdateLessonConf = true;
    await lessonContext.saveLessonHistories(historyMemo, isUpdateLessonConf);

    showAutoSaveToast();
  } catch (error) {
    console.error('임시 저장 실패:', error);
  }

  refreshLessonsWithContext();
};

const assignAndCollectLessons = (confs: LessonConf[], originPeriods: Record<string, DayPeriod[]>) => {
  let lessonsToSave: Lesson[] = [];
  confs.forEach(conf => {
    (originPeriods[conf.classId] || []).forEach(({ consecutivePeriod, ...timetablePeriod }) => {
      Timetable.assignLessonConfManually(timetablePeriod, conf, consecutivePeriod);
      const assigned = Timetable.currentAssignedLessons.filter(l =>
        l.classId === conf.classId &&
        l.courseId === conf.courseId &&
        l.dayOfWeek === timetablePeriod.dayOfWeek &&
        (consecutivePeriod
          ? l.period >= timetablePeriod.period && l.period < timetablePeriod.period + consecutivePeriod
          : l.period === timetablePeriod.period)
      );
      lessonsToSave.push(...assigned);
    });
  });
  return lessonsToSave;
};

const extractOriginPeriods = (lessonsToDelete: Lesson[]) => {
  return Object.entries(
    lessonsToDelete
      .reduce((acc, l) => {
        const key = l.consecutiveGroupId 
          ? `G_${l.classId}_${l.dayOfWeek}_${l.consecutiveGroupId}`
          : `S_${l.classId}_${l.dayOfWeek}_${l.period}`;
        (acc[key] ||= []).push({ dayOfWeek: l.dayOfWeek, period: l.period });
        return acc;
      }, {} as Record<string, TimetablePeriod[]>)
  ).reduce((acc, [key, periods]) => {
    const [ type, classId, dayOfWeek, option ] = key.split('_');
    const consecutivePeriod = type === 'G' ? periods.length : 1;
    periods.sort((a, b) => a.period - b.period);
    (acc[classId] ||= []).push({ dayOfWeek: Number(dayOfWeek), period: periods[0].period, consecutivePeriod });
    return acc;
  }, {} as Record<string, DayPeriod[]>
  );
};

const processToToss = async () => {
  const source = sourceTarget.value[SourceTargetType.SOURCE];
  const target = sourceTarget.value[SourceTargetType.TARGET];

  // source의 lesson 정보 삭제 ( lessonId, dayOfWeek, period, consecutivePeriod )
  const sourceLessonsToUpdate = Timetable.getTeacherOverview(source.teacherId).assignedLessons
    .filter(l => l.courseId === source.courseId && source.classIds.includes(l.classId) && !l.concurrentCourseId)
    .flatMap(l => 
      l.consecutiveGroupId
        ? lessons.value.filter(lesson => lesson.consecutiveGroupId === l.consecutiveGroupId)
        : [l]
    );

  const lessonIdsToUpdate = sourceLessonsToUpdate.map(l => l.lessonId);
  lessons.value = lessons.value.filter(l => !lessonIdsToUpdate.includes(l.lessonId));

  // source의 lessonConf 정보 업데이트
  const lessonConfsToUpdate = lessonConfs.value.filter(lessonConf => 
    (lessonConf.teacherId === source.teacherId && lessonConf.courseId === source.courseId && source.classIds.includes(lessonConf.classId))
  );
  const updatedSourceConfs = lessonConfsToUpdate.map(conf => {conf.teacherId = target.teacherId; return conf;});

  // api 콜
  const sourceConfIds = updatedSourceConfs.map(conf => conf.lessonConfId);
  await lessonService.toss({
    lessonIdsToUpdate,
    sourceConfIds,
    sourceTeacher: { teacherId: source.teacherId, teacherName: source.teacherName },
    targetTeacher: { teacherId: target.teacherId, teacherName: target.teacherName }
  });

  try {
    // 작업내역 저장: 넘기기 [홍길동] 선생님 2-1 [국어] → [심청이] 선생님
    const sourseClassNames = source.classIds
      .map(id => {
        const clazz = classMap.value[id];
        return TimetableDisplayUtils.formatFullClassName(clazz);
      })
      .join(', ');

    const historyMemo = `(자동) 넘기기 [${source.teacherName}] 선생님 ${sourseClassNames} [${source.courseName}] → [${target.teacherName}] 선생님`;
    const isUpdateLessonConf = true;
    await lessonContext.saveLessonHistories(historyMemo, isUpdateLessonConf);

    showAutoSaveToast()
  } catch (error) {
    console.error('임시 저장 실패:', error);
  }

  refreshConfsAndLessonsWithContext();
};

const refreshLessonsWithContext = () => {
  Timetable.initWithPresetedLessons(lessons.value);
}

const refreshConfsAndLessonsWithContext = () => {
  Timetable.context.lessonConfs = lessonConfContext.lessonConfs;
  refreshLessonsWithContext();
}

// 교사 추가
const handleClickAddTeacher = async () => {
  const target = sourceTarget.value[SourceTargetType.TARGET];
  const inputKeyword = (target.teacherName || '').trim();

  // --- Case 1: 검색어(키워드)가 있는 경우 -> 즉시 추가 및 선택 ---
  if (inputKeyword) {
    // 이미 존재하는 이름인지 중복 체크
    const isExactDuplicated = teachers.value.some(t => t.teacherName === inputKeyword) || 
                              addedTeachers.value.some(t => t.value.teacherName === inputKeyword);

    if (isExactDuplicated) {
      dialog.alertSimple('이미 존재하는 교사 이름입니다. 목록에서 선택해주세요.');
      return;
    }

    try {
      // API 호출하여 교사 생성
      const added = await teacherContext.add({
        teacherName: inputKeyword,
        teacherId: ''
      } as TeacherForAdd);

      if (added) {
        // 로컬 목록에 추가 (수정 가능 상태 false)
        const newOption: TeacherOption = {
          key: added.teacherId,
          value: { teacherName: inputKeyword },
          isEditing: false
        };
        addedTeachers.value.push(newOption);

        // 즉시 선택 처리
        handleClickSelectTeacher(newOption, SourceTargetType.TARGET);

        await nextTick();
        (autocompleteTeacherInput.value as any)?.focus?.() || (autocompleteTeacherInput.value as any)?.$el?.querySelector('input')?.focus();
      }
    } catch (e) {
      console.error(e);
      dialog.alertSimple('교사 추가 중 오류가 발생했습니다.');
    }
    return;
  }

  // --- Case 2: 검색어가 없는 경우 (빈 값) -> 인라인 입력창 생성 ---
  
  // 블러 이벤트로 닫히지 않도록 플래그 설정
  isInlineEditing.value = true;

  // 빈 객체 추가
  addedTeachers.value.push({
    key: '',
    value: { teacherName: '' },
    isEditing: true
  });

  await nextTick();
  
  // 생성된 마지막 인풋에 포커스
  // teacherOptionsForToss는 computed이므로 렌더링 된 마지막 인덱스를 찾아야 함
  const index = teacherOptionsForToss.value.length - 1;
  const lastInput = teacherNameRefs.value[index];
  
  if (lastInput && 'focus' in lastInput) {
    (lastInput as HTMLInputElement).focus();
  }

  setTimeout(() => {
    isInlineEditing.value = false;
  }, 200);
};

const isAddedTeacher = (option: TeacherOption) => {
  return addedTeachers.value.some(added => added.key === option.key);
};

const handleFinishEditTeacherName = async (item: TeacherOption, inputValue: string) => {
  const trimmedName = inputValue.trim();

  // 1. 이름이 비어있을 때
  if (!trimmedName) {
    // 신규 추가 중이었다면(key가 없음) 목록에서 삭제 (취소 처리)
    if (!item.key) {
      addedTeachers.value = addedTeachers.value.filter(t => t !== item);
    } else {
      // 기존 항목 수정 중 비웠다면 -> 원래 이름으로 복구하거나, 수정 모드만 종료
      // 여기서는 원래 이름 유지하고 모드 종료로 처리
      item.isEditing = false;
    }
    return;
  }

  // 2. 변경 사항이 없을 때
  if (trimmedName === item.value.teacherName) {
    item.isEditing = false;
    return;
  }

  // 3. 중복 체크 (자기 자신 제외)
  const isDuplicated = teacherOptions.value.some(option =>
    option.value.teacherName === trimmedName && option !== item
  );

  if (isDuplicated) {
    dialog.alertSimple('이미 존재하는 교사 이름입니다.');
    return; 
  }

  try {
    // API 호출 분기
    if (item.key) {
      // [Update] 기존 교사 이름 수정
      await teacherContext.updateTeacherName({
        teacherId: item.key,
        teacherName: trimmedName,
        classId: ''
      } as TeacherForUpdate);
      
      // 로컬 값 업데이트
      item.value.teacherName = trimmedName;

      // 만약 현재 선택된 교사의 이름을 수정했다면, 상단 SelectBox(Input)의 표시 이름도 갱신
      const target = sourceTarget.value[SourceTargetType.TARGET];
      if (target.teacherId === item.key) {
        target.teacherName = trimmedName;
        target.teacherNameBeforeEdit = trimmedName;
      }

    } else {
      // [Create] 인라인 입력으로 신규 교사 추가
      const added = await teacherContext.add({
        teacherName: trimmedName,
        teacherId: ''
      } as TeacherForAdd);
      
      if (added) {
        item.key = added.teacherId;
        item.value.teacherName = trimmedName;
        
        // 신규 추가 후 바로 선택 처리
        handleClickSelectTeacher(item, SourceTargetType.TARGET);
      }
    }
  } catch (e) {
    console.error(e);
    dialog.alertSimple('저장 중 오류가 발생했습니다.');
  } finally {
    item.isEditing = false;

    // 메인 인풋으로 포커스 이동
    await nextTick();
    (autocompleteTeacherInput.value as any)?.focus?.() || (autocompleteTeacherInput.value as any)?.$el?.querySelector('input')?.focus();
  }
};

const handleClickEditTeacherName = async (item: TeacherOption, index: number) => {
  // Autocomplete이 닫히지 않도록 함
  isInlineEditing.value = true;
  
  // 수정 모드 전환
  item.isEditing = true;

  await nextTick();

  // 해당 Input 포커스
  const targetInput = teacherNameRefs.value[index];
  if (targetInput && 'focus' in targetInput) {
    (targetInput as HTMLInputElement).focus();
  }

  setTimeout(() => {
    isInlineEditing.value = false;
  }, 200);
};

///////////////////////////////////////////////////////////////////
////////////// 삭제할 코드 영역 (아래)
///////////////////////////////////////////////////////////////////

// // 변경 전/후
// const teacherNameBefore = ref<string | null>(null);
// const courseNameBefore = ref<string | null>(null);
// const classNameBefore = ref<string | null>(null);
// const teacherNameAfter = ref<string | null>(null);
// const courseNameAfter = ref<string | null>(null);
// const classNameAfter = ref<string | null>(null);

// const courseList = ref([
//   { officialCourse: '과학', displayCourse: '과학2', periodCount: 3 },
//   { officialCourse: '영어', displayCourse: '영어1', periodCount: 3 },
//   { officialCourse: '수학', displayCourse: '수학2', periodCount: 3 },
//   { officialCourse: '체육', displayCourse: '체육2', periodCount: 3 }
// ]);

// const teacherList = ref([
//   { name: '홍길동', isNew: false },
//   { name: '김영희', isNew: false },
//   { name: '이선생', isNew: false },
//   { name: '최선생', isNew: false },
// ]);

// const classList = [
//   { value: '1-1', title: '1-1' },
//   { value: '2-1', title: '2-1' },
//   { value: '3-1', title: '3-1' },
//   { value: '4-1', title: '4-1' },
//   { value: '5-1', title: '5-1' },
//   { value: '6-1', title: '6-1' }
// ];

// // 교사 추가
// function addTeacher(name: string) {
//   if (!name.trim()) return;
//   teacherList.value.push({
//     name,
//     isNew: true
//   });
//   teacherNameAfter.value = '';
// }

// // 추가된 교사인지 확인
// function isNewTeacher(name: string) {
//   const found = teacherList.value.find(t => t.name === name);
//   return found?.isNew === true;
// }

// function getTeacherObject(name: string) {
//   return teacherList.value.find(t => t.name === name) || {};
// }

// // autocomplete 리스트에 있는 과목명으로 필터링
// function displayList(filteredStrings: string[]) {
//   return courseList.value.filter(item =>
//     filteredStrings.includes(item.officialCourse)
//   );
// }

// // autocomplete 과목명으로 과목 찾기
// function findSubject(courseName: string) {
//   return courseList.value.find(item => item.officialCourse === courseName);
// }

</script>


<style scoped lang="scss">
// 수업 수정 모달
.course-edit-modal{
  ::v-deep {
    .modal__layer,
    .modal__content{
      overflow: visible;
    }
  }
  .gray-box{
    border-radius: 12px;
    .form-check-inline {
      line-height: 24px;
    }
  }
  .course-edit{
    display: flex;
    margin-top: 16px;
    > div{
      border-radius: 12px;
      border: 1px solid #BDBDBD;
      padding: 32px;
      width: calc(50% - 44px);
      display: flex;
      flex-flow: column;
      .form-group-inline {
        min-height: 48px;
        label {
          min-width: 90px;
          margin-right: 16px;
        }
      }
      label{
        min-width: 90px;
        margin-right: 16px;
      }
    }
    .change{    
      display: inline-block;  
      width:56px;
      background: var(--primary);
      mask-size: 100%;
      margin: 16px;
      mask-image: url(~@/assets/img/timetable/ico-exchange-direct.svg);
      mask-repeat: no-repeat;
      mask-position: center;
      &.chain{
        mask-image: url(~@/assets/img/timetable/ico-exchange-chain.svg);
      }
    }
  }
  // 교사 추가 autocomplete
  .autocomplete-wrap{    
    width: 215px;
    height: auto;
    ::v-deep{
      .autocomplete-list-inner{
        max-height: 195px;
      }
    }
    .custom-scr {
      height: 200px;
    }
  }  
  .hi-selectbox{
    width: 215px !important;
    // ::v-deep{
    //   .option__layer{
    //     max-height: 140px;
    //   }
    // }
  }

  .option-list-wrap{    
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;   
    position: absolute;
    left: 0px;
    transform: translateX(0);
    z-index: 1;
  }
  .hi-nodata{
    padding: 0 0;
  }

}
</style>