<template>
  <TimeTableModal size="md" @close="handleCloseDialog" class="course-edit-modal">
    <template v-slot:heading>
      동시수업 수업 수정
      <p class="smr">
        동시수업의 배정 불가인 교사의 수업을 교체합니다. 변경된 교사의 전체 시수 및 시수표가 변경됩니다.
      </p>
    </template>
    <template v-slot:content>       
      <div class="gray-box">
        <div class="form-check-inline">
          <input type="radio" name="exchange" id="swap" value="swap" v-model="courseEditType"/>
          <label for="swap" class="mr-40"><span>맞교환</span></label>
        </div>
        <div class="form-check-inline">
          <input type="radio" name="exchange" id="toss" value="toss" v-model="courseEditType" />
          <label for="toss"><span>넘기기</span></label>
        </div>
      </div>
      <div class="course-edit direct" v-if="courseEditType === 'swap'">
        <div class="left-area">
          <div class="form-group-inline">
            <label>담당교사</label>
            <div class="form-ctr">    
              <input type="text"
                v-model="source.teacherName"
                readonly
                spellcheck="false">        
              <!-- <AutocompleteInputForConcurrentCourse
                v-model="source.teacherName"
                disabled
                class="lg"
              /> -->
            </div>
          </div>
          <div class="form-group-inline">    
            <label for="course-name">과목명</label>              
            <input type="text"
              v-model="source.courseName"
              readonly
              spellcheck="false">                      
            <!-- <AutocompleteInputForConcurrentCourse
              :value="source.courseName"
              disabled
              class="lg"
            /> -->
          </div>
          <div class="form-group-inline">
            <label for="class-group">학반</label>               
            <input type="text"
              v-model="source.gradeClass"
              readonly
              spellcheck="false">      
            <!-- <HiSelectBox           
              class="opt-top lg"
              :value="source.gradeClass"
              :items="[source.gradeClass]"
              :empty-title="source.gradeClass"
              disabled
            />  -->
          </div>
          <div class="form-group-inline">
            <label>시수</label>
            {{ calculatePeriodCountOnTeacher(source.teacherId) }}
          </div>
        </div>
        <i class="change"></i>
        <div class="right-area">
          <div class="form-group-inline">
            <label>담당교사</label>
            <div class="form-ctr">            
              <AutocompleteInputForConcurrentCourse
                v-model="target.teacherName"
                :options="teacherOptions"
                placeholder="선택"
                nodata="일치하는 교사가 없습니다."
                @select="(item) => handleClickSelectTeacher(item)"     
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
          </div>
          <div class="form-group-inline">    
            <label for="course-name">과목명</label>
            <AutocompleteInputForConcurrentCourse
              v-model="target.courseName"
              :options="courseOptions"
              placeholder="선택"
              :on-blur="() => target.courseName = target.courseNameBeforeEdit"
              @select="(item) => handleClickSelectCourse(item)"
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
            <HiSelectBox           
              class="opt-top"
              :value="target.classId"
              :items="classOptions"
              @update:value="handleClickSelectClass"
              :empty-title="target.classId ? `${target.gradeClass}` : '선택'"
              :disabled="!target.teacherId || !target.courseId"
            >
            </HiSelectBox> 
          </div>
          <div class="form-group-inline">
            <label>시수</label>
            {{ calculatePeriodCountOnTeacher(target.teacherId) }}
          </div>
        </div>
      </div>  

      <div class="course-edit chain" v-else>
        <div class="left-area">
          <div class="form-group-inline">
            <label>담당교사</label>
            <div class="form-ctr">
              <input type="text"
                v-model="source.teacherName"
                readonly
                spellcheck="false"> 
                <!-- <AutocompleteInputForConcurrentCourse
                v-model="source.teacherName"
                disabled   
                class="lg"                 
              /> -->
            </div>
          </div>
          <div class="form-group-inline">    
            <label for="course-name">과목명</label>            
            <input type="text"
              v-model="source.courseName"
              readonly
              spellcheck="false">                        
            <!-- <AutocompleteInputForConcurrentCourse
              :value="source.courseName"
              disabled
              class="lg"  
            /> -->
          </div>
          <div class="form-group-inline">
            <label for="class-group">학반</label>                     
            <input type="text"
              v-model="source.gradeClass"
              readonly
              spellcheck="false"> 
            <!-- <HiSelectBox           
              class="opt-top lg"
              :value="source.gradeClass"
              :items="[source.gradeClass]"
              :empty-title="source.gradeClass"
              disabled
            />  -->
          </div>
          <div class="form-group-inline">
            <label>시수</label>
            {{ calculatePeriodCountOnTeacher(source.teacherId) }}
          </div>
        </div>
        <i class="change"></i>
        <div class="right-area">
          <div class="form-group-inline">
            <label>담당교사</label>
            <div class="form-ctr">            
              <AutocompleteInputForConcurrentCourse
                v-model="target.teacherName"
                :options="teacherOptions"
                placeholder="선택"
                nodata="일치하는 교사가 없습니다."
                @select="(item) => handleClickSelectTeacher(item)"         
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
          </div>
          <div class="form-group-inline">    
            <label for="course-name">과목명</label> 
            <input type="text"
              v-model="source.courseName"
              readonly
              spellcheck="false">                          
            <!-- <AutocompleteInputForConcurrentCourse
              :value="source.courseName"
              disabled
              class="lg"  
            /> -->
          </div>
          <div class="form-group-inline">
            <label for="class-group">학반</label>             
            <input type="text"
              v-model="source.gradeClass"
              readonly
              spellcheck="false">        
            <!-- <HiSelectBox           
              class="opt-top lg"
              :value="source.gradeClass"
              :items="[source.gradeClass]"
              :empty-title="source.gradeClass"
              disabled
            />  -->
          </div>
          <div class="form-group-inline">
            <label>시수</label>
            {{ calculatePeriodCountOnTeacher(target.teacherId) }}
          </div>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="handleCloseDialog">취소</button>
      <button type="button" class="btn btn-primary btn-lg" @click="handleClickSubmitSourceTarget" :disabled="isSubmitDisabled">변경</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed, watch } from 'vue';
import HiSelectBox from '@/components/Form/HiSelectBox.vue';
import AutocompleteInputForConcurrentCourse from '@/apps/timetable/components/AutocompleteInputForConcurrentCourse.vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import { useDialog } from '@/apps/timetable/composables/dialog';
import {
  Class,
  Course,
  LessonConf,
  Teacher
} from '@/apps/timetable/core/types';

import {
  ContextKeys,
  TimetableCourseContext,
  TimetableTeacherContext,
  TimetableClassContext,
  LessonConfContext,
  TimetableProgressContext
} from '../contexts';
import { TimetableDisplayUtils } from '../common/utils';

interface SelectedCell {
  concurrentCourseId: string;
  lessonConfId: string;
}

interface LessonConfSimple {
  lessonConfId: string;
  courseId: string;
  classId: string;
  teacherId: string;
  courseName: string;
  teacherName: string;
  gradeClass: string;
  concurrentCourseId: string;
  courseNameBeforeEdit: string;
}

interface SourceTarget {
  source: string;
  target: string;
}

const emit = defineEmits(['close', 'swap', 'toss']);
const props = defineProps<{
  selectedCell: SelectedCell;
}>();
const dialog = useDialog();

const courseEditType = ref<string>('swap'); // 'swap' or 'toss'

const source = ref<LessonConfSimple>({
  lessonConfId: '',
  courseId: '',
  classId: '',
  teacherId: '',
  courseName: '',
  teacherName: '',
  gradeClass: '',
  concurrentCourseId: '',
  courseNameBeforeEdit: ''
});
const target = ref<LessonConfSimple>({
  lessonConfId: '',
  courseId: '',
  classId: '',
  teacherId: '',
  courseName: '',
  teacherName: '',
  gradeClass: '',
  concurrentCourseId: '',
  courseNameBeforeEdit: ''
});
const targetList = ref<Array<LessonConfSimple>>([]);
const sourceTarget = ref<SourceTarget>({
  source: '',
  target: ''
});

const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext

const lessonConfs = computed(() => lessonConfContext.lessonConfs as LessonConf[]);
const courseMap = computed(() => courseContext.courseMap as Record<string, Course>);
const teacherMap = computed(() => teacherContext.teacherMap as Record<string, Teacher>);
const classMap = computed(() => classContext.classMap as Record<string, Class>);
const teachers = computed(() => teacherContext.teachers as Teacher[]);

const teacherOptions = computed(() => {
  const lessonConf = lessonConfs.value.find(lc => lc.lessonConfId === source.value.lessonConfId);
  if (!lessonConf) { return []; }

  // 현재 수업과 동시수업인 수업의 교사 제외
  const concurrentTeacherIds = lessonConfs.value
    .filter(lc => lc.concurrentCourseId === lessonConf.concurrentCourseId)
    .map(lc => lc.teacherId);

  const seen: Record<string, boolean> = {};

  // 넘기기는 전체 교사 리스트에서, 맞교환은 시수표에 있는 교사 리스트에서 선택하도록 함
  return (courseEditType.value === 'toss' ? teachers.value : targetList.value)
    .filter(t => {
      if (seen[t.teacherId] || concurrentTeacherIds.includes(t.teacherId)) return false;
      seen[t.teacherId] = true;
      return true;
    })
    .map(t => ({ key: t.teacherId, value: { teacherName: t.teacherName } }));
});

const courseOptions = computed(() => {
  if (!target.value.teacherId) { return []; }

  const filtered = targetList.value.filter(t => 
    t.teacherId === target.value.teacherId &&
    t.concurrentCourseId !== source.value.concurrentCourseId
  );

  const seenCourse: Record<string, boolean> = {};
  return filtered
    .filter(t => {
      if (seenCourse[t.courseId]) return false;
      seenCourse[t.courseId] = true;
      return true;
    })
    .map(t => {
      const course = courseMap.value[t.courseId];
      return {
        key: course.courseId,
        periodCount: course.periodCount,
        value: {
          standardCourseTitle: course.standardCourseTitle,
          displayedTitle: course.displayedTitle,
        }
      }
    })
});

const classOptions = computed(() => {
  if (!target.value.teacherId || !target.value.courseId) { return []; }

  return targetList.value
    .filter(t =>
      t.teacherId === target.value.teacherId &&
      t.courseId === target.value.courseId &&
      t.concurrentCourseId !== source.value.concurrentCourseId
    )
    .sort((a, b) => {
      const gradeA = classMap.value[a.classId].grade
      const gradeB = classMap.value[b.classId].grade
      if (gradeA !== gradeB) return gradeA - gradeB
      return classMap.value[a.classId].classNumber - classMap.value[b.classId].classNumber
    })
    .map(t => ({
      value: classMap.value[t.classId].classId,
      title: t.gradeClass
    }))
});


const isSubmitDisabled = computed(() => {
  console.log('disabled', courseEditType.value, target.value.teacherId, '>', target.value.courseId, '>', target.value.classId)

  if(courseEditType.value === 'toss') {
    return !target.value.teacherId;
  }
  
  return !target.value.teacherId || !target.value.courseId || !target.value.classId;
});

onMounted(() => {
  initData();
});

const handleCloseDialog = () => {
  source.value = reset();
  target.value = reset();
  targetList.value = [];
  emit('close');
};

const propsToSourceData = (props: { concurrentCourseId: string, lessonConfId: string }) => {
  const lessonConf = lessonConfs.value.find(lc => lc.lessonConfId === props.lessonConfId);

  if (lessonConf) {
    sourceTarget.value.source = lessonConf.lessonConfId;
    source.value = {
      lessonConfId: lessonConf.lessonConfId,
      courseId: lessonConf.courseId,
      classId: lessonConf.classId,
      teacherId: lessonConf.teacherId,
      courseName: courseMap.value[lessonConf.courseId]?.displayedTitle || '',
      teacherName: teacherMap.value[lessonConf.teacherId]?.teacherName || '',
      gradeClass: TimetableDisplayUtils.formatFullClassName(classMap.value[lessonConf.classId]),
      concurrentCourseId: props.concurrentCourseId,
      courseNameBeforeEdit: courseMap.value[lessonConf.courseId]?.displayedTitle || ''
    } as LessonConfSimple;
  } else {
    dialog.alertSimple('존재하지 않는 수업입니다.');
    handleCloseDialog();
  }
};

const initData = () => {
  propsToSourceData(props.selectedCell);

  targetList.value = lessonConfs.value.map((lessonConf) => {
    const teacher = teacherMap.value[lessonConf.teacherId];
    const course = courseMap.value[lessonConf.courseId];
    
    return {
      lessonConfId: lessonConf.lessonConfId,
      courseId: lessonConf.courseId,
      classId: lessonConf.classId,
      teacherId: lessonConf.teacherId,
      courseName: course?.displayedTitle || '',
      teacherName: teacher?.teacherName || '',
      gradeClass: TimetableDisplayUtils.formatFullClassName(classMap.value[lessonConf.classId]),
      concurrentCourseId: lessonConf.concurrentCourseId || '',
      courseNameBeforeEdit: course?.displayedTitle || ''
    } as LessonConfSimple;
  })
};

const calculatePeriodCountOnTeacher = (teacherId: string) => {
  return lessonConfs.value
    .filter(lessonConf => lessonConf.teacherId === teacherId)
    .reduce((acc, lessonConf) => {
      const periodCount = courseMap.value[lessonConf.courseId].periodCount
      if (!periodCount) { return acc; }
      return acc + periodCount;
    }, 0);
};

const handleClickSelectTeacher = (
  teacherOption: { key: string, value: { teacherName: string } }
) => {
  target.value = reset();

  target.value.teacherId = teacherOption.key;
  target.value.teacherName = teacherOption.value.teacherName;
};

const reset = (): LessonConfSimple => {
  return {
    lessonConfId: '',
    courseId: '',
    classId: '',
    teacherId: '',
    courseName: '',
    teacherName: '',
    gradeClass: '',
    concurrentCourseId: '',
    courseNameBeforeEdit: ''
  };
};

const handleClickSelectCourse = (
  courseOption: {key: string, periodCount: number, value: { displayedTitle: string}}
) => {
  target.value.courseName = courseOption.value.displayedTitle;
  target.value.courseNameBeforeEdit = courseOption.value.displayedTitle;
  target.value.courseId = courseOption.key;

  target.value.classId = '';
  target.value.gradeClass = '';
  target.value.lessonConfId = '';
};

const handleClickSelectClass = async (value: string) => {
  const lessonConf = lessonConfs.value.find(lc =>
    lc.teacherId === target.value.teacherId &&
    lc.courseId === target.value.courseId &&
    lc.classId === value
  );
  if (lessonConf) {
    target.value.classId = value;
    target.value.gradeClass = `${classMap.value[value].grade}-${classMap.value[value].classNumber}`;
    target.value.lessonConfId = lessonConf.lessonConfId;
  } else {
    await dialog.alertSimple('선택한 학반에 해당하는 수업이 없습니다.');
    target.value.classId = '';
  }
};

const handleClickSubmitSourceTarget = async () => {
  if (courseEditType.value === 'swap') {
    await emitSwap();
  } else {
    await emitToss();
  }
};

const emitSwap = async () => {
  const subMsg = progressContext.assignedClassLessonCount > 0
    ? '<br>7단계에 배정된 수업이 모두 초기화됩니다.'
    : '';

  const res = await dialog.confirm(`
    ${source.value.gradeClass} ${source.value.courseName} <strong>[${source.value.teacherName}]</strong> 선생님을 ${target.value.gradeClass} ${target.value.courseName} 
    <br><strong>[${target.value.teacherName}]</strong> 선생님과 맞교환 하시겠습니까? ${subMsg}
    <div class="blue-box"> 
      <i class="hi-ico ico-primary ico-warning-circle-fill ico-size-18"></i>
      변경 시 담당과목에 추가 및 시수표에 맞교환한 학반이 자동 적용됩니다.
    </div>      
    `, null, {
      customClass: 'timetable-confirm',
      showCloseButton: true,
      confirmButtonText: '예',
      cancelButtonText: '아니오'
    }
  )

  if (!res) { return; }

  sourceTarget.value.target = target.value.lessonConfId;

  emit("swap", sourceTarget.value);
};

const emitToss = async () => {
  const subMsg = progressContext.assignedClassLessonCount > 0
    ? '<br>7단계에 배정된 수업이 모두 초기화됩니다.'
    : '';

  const res = await dialog.confirm(`
    ${source.value.gradeClass} ${source.value.courseName} 수업을 <strong>[${source.value.teacherName}]</strong> 선생님에서 
    <br><strong>[${target.value.teacherName}]</strong> 선생님으로 넘기시겠습니까? ${subMsg}
    <div class="blue-box"> 
      <i class="hi-ico ico-primary ico-warning-circle-fill ico-size-18"></i>
      변경 시 담당과목에 추가 및 시수표에 넘기기한 학반이 자동 적용됩니다.
    </div>      
    `, null, {
      customClass: 'timetable-confirm',
      showCloseButton: true,
      confirmButtonText: '예',
      cancelButtonText: '아니오'
    }
  )

  if (!res) { return; }

  sourceTarget.value.target = target.value.teacherId;

  emit("toss", sourceTarget.value)
};


watch(
  () => target.value.teacherName,
  (newName, oldName) => {
    console.log('watch Name', newName);
    console.log('old', oldName);

    if(newName === '' && oldName !== '') {
      target.value = reset();
    }
  }
);
</script>

<style lang="scss" scoped>
// 수업 수정 모달
.course-edit-modal{
  ::v-deep {
    .modal__layer,
    .modal__content{
      overflow: visible;
    }
  }
  .course-edit{
    display: flex;
    margin-top: 16px;
    > div{
      border-radius: 16px;
      border: 1px solid #BDBDBD;
      padding: 32px;
      width: calc(50% - 44px);
      display: flex;
      flex-flow: column;
      .form-group-inline{      
        min-height: 40px;  
        label{
          min-width: 80px;
          margin-right: 16px;
          + div{
            flex-grow: 1;
          }
        }
      }
    }
    .change{    
      display: inline-block;  
      width:56px;
      mask-image: url(~@/assets/img/timetable/ico-exchange-direct.svg);
      background: var(--primary);
      mask-size: 100%;
      margin: 16px;      
      mask-repeat: no-repeat;
      mask-position: center
    }
    &.chain{
      .change{
        mask-image: url(~@/assets/img/timetable/ico-exchange-chain.svg);
      }
    }
  }
  // 교사 추가 autocomplete
  .autocomplete-wrap{
    ::v-deep{
      .autocomplete-list{
        max-height: 180px;
      }
    }
  }
  
  .hi-selectbox{    
    ::v-deep{
      .option__layer{
        max-height: 140px;
      }
    }
  }
}
</style>
