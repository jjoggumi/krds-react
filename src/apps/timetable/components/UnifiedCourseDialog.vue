<template>
  <TimeTableModal @close="handleCloseDialog" class="common-subject-modal modal-xs">
    <template v-slot:heading>
      공통과목 등록
      <p class="smr">
        각 학년별 공통과목을 배정합니다. <br>교사에게 시수를 줄 수 없는 경우에만 사용합니다.
      </p>
    </template>
    <template v-slot:content>
      <div class="gray-box">
        <div class="form-group-inline">
          <label class="sm">과목명</label>
          <div class="form-ctr">            
            <AutocompleteInput
              v-model="courseName"
              :options="unifiedCourseNames"
              placeholder="창체, 자율..."
              nodata="일치하는 과목이 없습니다."
              :isError="isCourseNameError"
              :maxLength="5"
              class="md"
            />
          </div>
        </div>
        <small class="txt-warning ml-40 pl-10 mt-10 d-block" v-if="isCourseNameError">과목명을 입력해주세요.</small>
      </div>
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary ml-10" @click="handleClickClose">취소</button>
      <button type="button" class="btn btn-primary" @click="handleClickSubmit">확인</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import AutocompleteInput from '@/apps/timetable/components/AutocompleteInput.vue';
import { computed, inject, onMounted, ref, watch } from 'vue';
import { ContextKeys, TimetableCourseContext } from '../contexts';
import { Course } from '../core/types';

const emit = defineEmits(['close']);

const props = defineProps<{
  onSubmit: (unifiedCourseId: string | null) => void;
}>();

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;

const courseName = ref<string>('');
const isCourseNameError = ref<boolean>(false);
const unifiedCourse = ref<Course[]>([]);

const unifiedCourseNames = computed(() => {
  return unifiedCourse.value.map(course => course.displayedTitle);
});

onMounted(() => {
  // 초기화 시 공통과목 목록을 가져옴
  unifiedCourse.value = courseContext.courses.filter(course => course.isUnified).sort((a, b) => {
      if (a.displayedTitle < b.displayedTitle) return -1;
      if (a.displayedTitle > b.displayedTitle) return 1;
      return 0;
    });
});

const handleClickSubmit = async () => {
  if (courseName.value.trim() === '') {
    isCourseNameError.value = true;
    return;
  }

  const courseId = await getUnifiedCourseIdByName();
  if(!courseId) {
    return;
  }
  
  props.onSubmit && props.onSubmit(courseId);  
}

// 입력이 바뀌면 에러 해제
watch(courseName, (val) => {
  if (val && val.trim() !== '') {
    isCourseNameError.value = false;
  }
});

const getUnifiedCourseIdByName = async () => {
  const course = courseContext.courses.filter(course => course.isUnified).find(c => c.displayedTitle === courseName.value);  
  
  if(course) {
    return course.courseId;
  }

  // 과목이 없으면 새로 생성
  try {
    const newCourse = await courseContext.addUnifiedCourse(courseName.value);
    return newCourse.courseId;
  } catch (error) {
    console.error('Error creating unified course:', error);
    return null;
  }
};

const handleClickClose = () => {
  emit('close');
};

const handleCloseDialog = () => {
  emit('close');
};

</script>

<style lang="scss" scoped>
.common-subject-modal{
    ::v-deep .modal__content{
      height: 235px;
      .form-ctr{
        width: 100%;
        .autocomplete-list{
          max-height: 150px;
          width: 200px;
          min-width: auto;
        }
      }
    }
  }
</style>