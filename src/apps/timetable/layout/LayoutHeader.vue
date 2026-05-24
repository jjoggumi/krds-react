<template>
  <header>
  <div class="layout-header">
    <h1 @click="handleClickShowBasicTemplateList">기초시간표 {{ createOrModify }} {{ timetableName }}</h1>
    <div class="user-info">
      {{ selectedSchool?.schoolName }} {{ user?.userName }} 선생님
      <button class="btn btn-sm" @click="emitClose()">
        <i class="ico ico-exit ico-white ico-size-20" />
        나가기
      </button>
    </div>
  </div>
  </header>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, ref } from 'vue';
import { useMenuManager } from '../composables/menuManager';
import { ContextKeys, TimetableProgressContext } from '../contexts';
import { TimetableStatus } from '../core/types';

const props = defineProps({
  user: {
    type: Object,
    required: false,
    default: () => ({})
  },
  selectedSchool: {
    type: Object,
    required: false,
    default: () => ({})
  }
});

const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;
const menuManager = useMenuManager();
const emit = defineEmits(['close']);

const isTimetableListModal = ref(false);

const createOrModify = computed(() => {
  return progressContext.status === TimetableStatus.Finish ? '수정' : '생성';
});
const timetableName = computed(() => {
  return progressContext.templateName && `[${progressContext.templateName}]` || '';
});

const handleClickShowBasicTemplateList = () => {
  isTimetableListModal.value = true;
};

const emitClose = () => {
  if (localStorage.getItem('isDoneLessonConfsUpload')) {
    localStorage.removeItem('isDoneLessonConfsUpload');
  }
  emit('close', menuManager.getCurrentMenuIndex());
};

onMounted(async () => {
  await progressContext.load();
});

</script>

<style scoped lang="scss">
header{
  width: 100%;

  .layout-header{   
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    height: 60px;
    background: var(--navy);
    color: #fff;
    z-index: 11;
    h1 {
      font-size: 18px;
      letter-spacing: -0.5px;
      line-height: 150%;
      font-weight: bold;
    }
    .user-info{
      font-size: 14px;
      font-weight: normal;
      letter-spacing: -0.5px;
      line-height: 144%;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 12px;

      button{
        background-color: transparent;
        border: 1px solid #fff;
      }
    }
  }
}
</style>