<template>
  <div class="step-progress">
    <ul>
      <li v-for="(menu, index) in menuSteps" :key="`index-${index}-${timetableStatus}`" :class="getStepClass(index)">
        <div>
          <span>{{ index + 1 }}단계</span> {{ menu.label }}
        </div>
        <i />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted } from 'vue';
import { useMenuManager, MenuStep } from '../composables/menuManager';
import { ContextKeys, TimetableProgressContext } from '../contexts';
import { TimetableStatusIndexMap } from '@/apps/timetable/common/constants';
import { TimetableStatus } from '../core/types';

const emit = defineEmits(['step-clicked']);

/*
const TimetableStatusIndexMap: Record<TimetableStatus, number> = {
  [TimetableStatus.Init]: 0,
  [TimetableStatus.WeeklyPeriod]: 1,
  [TimetableStatus.CourseBase]: 2,
  [TimetableStatus.Teacher]: 3,
  [TimetableStatus.LessonConfig]: 4,
  [TimetableStatus.AdditionalWork]: 5,
  [TimetableStatus.Generate]: 6,
  [TimetableStatus.Finish]: 7,
  [TimetableStatus.Edit]: 5,
};
*/

const menuManager = useMenuManager();
const menuSteps = menuManager.getMenuSteps();

const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;

onMounted(async () => {
  await progressContext.load();
});

const timetableStatus = computed(() => progressContext.status);
const currentTimetableStatusIndex = computed(() => {
  return TimetableStatusIndexMap[timetableStatus.value];
});

const onStep = (menu: MenuStep) => {
  if (menu.timetableStatus === undefined) {
    return;
  }

  const timetableStatusIdx = currentTimetableStatusIndex.value;
  const statusIndexForMenu = TimetableStatusIndexMap[menu.timetableStatus];

  // 7단계(Generate)는 임시로 클릭 허용
  // if (statusIndexForMenu > timetableStatusIdx && statusIndexForMenu !== 5) {
  //   return;
  // }

  emit('step-clicked');
  if (menu && typeof menu.handleClick === 'function') {
    menu.handleClick();
  }
};

const getStepClass = (stepIndex: number) => {
  const currentStepIndex = menuManager.getCurrentMenuIndex();
  const timetableStatusIdx = currentTimetableStatusIndex.value;

  /*
  // 7단계(Generate) 임시 오픈
  if (stepIndex === 6) {
    return 'ing'; // 또는 "warning", "completion" 등 원하는 상태
  }
  */

  if (stepIndex === currentStepIndex) return 'ing';
  if (stepIndex < currentStepIndex) return 'completion';
  if (stepIndex <= timetableStatusIdx) return 'warning';

  return '';
};
</script>

<style scoped lang="scss">
.step-progress {
  position: sticky;
  top: 0;
  z-index: 12;
  height: 72px;
  border-bottom: 1px solid var(--Line-Gray-06);
  transition: 0.3s ease-in-out;
  background: #fff;
  ul {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding-bottom: 20px;
  }
  li {
    width: 14.2%;
    max-width: 150px;
    position: relative;
    height: 1px;
    text-align: right;
    background: var(--gray-06);
    div {
      font-weight: bold;
      color: var(--gray-07);
      line-height: 160%;
      font-size: 13px;
      text-align: center;
      display: inline-block;
      position: absolute;
      transform: translateX(-50%);
      min-width: 135px;
      margin-top: 10px;
      z-index: 1;
      span {
        font-size: 12px;
        line-height: 150%;
        font-weight: normal;
        color: var(--gray-07);
      }
    }
    i {
      display: block;
      position: absolute;
      z-index: 1;
      top: -7px;
      right: -7px;
      width: 14px;
      height: 14px;
      transition: 0.1s ease-in-out;
      background: #fff url(~@/assets/img/timetable/state-default.svg) no-repeat;
      background-size: cover;
    }
    &.completion i {
      background-image: url(~@/assets/img/timetable/state-completion.svg);
    }
    &.warning i {
      background-image: url(~@/assets/img/timetable/state-warning.svg);
    }
    &.ing i {
      background-image: url(~@/assets/img/timetable/state-ing.svg);
    }
    &.completion,
    &.warning,
    &.ing {
      div {
        color: #1d1d1d;
        span {
          color: #616161;
        }
      }
      &::before {
        background: var(--success);
        width: 100%;
      }
    }
    &::before {
      display: block;
      content: '';
      position: absolute;
      width: 0%;
      height: 2px;
      transition: 0.3s ease-in-out;
    }
    &:first-child {
      width: auto;
    }
    &:first-child div::before {
      display: none;
    }
  }
}
</style>
