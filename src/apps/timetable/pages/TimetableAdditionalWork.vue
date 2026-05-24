<template>
  <div class="tt-additional-work">
    <div class="tab-nav type01">
      <button
        v-for="(item, menuIdx) in menuItems"
        :key="`menu-${menuIdx}`"
        :class="{ active: subMenu === item.name }"
        @click="clickSubMenu(item)"
      >
        {{ item.label }}
        <HelpButton 
          :id="item.label"
          :active="helpOn === item.label"             
        />
      </button>
    </div>
    <div class="tab-con">
      <concurrent-course-conf ref="concurrentConfRef" @openHelp="(val) => $emit('openHelp', val)" :helpOn="helpOn" v-show="subMenu === SubMenu.ConcurrentCourses" />

      <template v-if="subMenu !== SubMenu.ConcurrentCourses">
        <consecutive-lesson-conf v-if="subMenu === SubMenu.ConsecutiveLessons" />
        <specialty-room-conf v-else-if="subMenu === SubMenu.SpecialtyRoom" />
        <similar-course-conf v-else-if="subMenu === SubMenu.SimilarCourses" />
      </template>
    </div>

    <DataEntryNoticeModal 
      v-if="isShowDataEntryNoticeModal"
      :noticeType="noticeType"
      @close="handleCloseDataEntryNoticeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, computed, getCurrentInstance } from 'vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import ConcurrentCourseConf from '@/apps/timetable/components/ConcurrentCourseConf.vue';
import ConsecutiveLessonConf from '@/apps/timetable/components/ConsecutiveLessonConf.vue';
import SpecialtyRoomConf from '@/apps/timetable/components/SpecialtyRoomConf.vue';
import SimilarCourseConf from '@/apps/timetable/components/SimilarCourseConf.vue';
import HelpButton from '@/apps/timetable/components/HelpButton.vue';

import DataEntryNoticeModal from '../components/DataEntryNoticeModal.vue';
import { NoticeType } from '../common/types';

import { Menu } from '@/apps/timetable/common/types';
import { ContextKeys, TimetableCourseBaseContext, TimetableProgressContext, ConsecutiveConfContext, SpecialtyRoomConfContext, SimilarCourseConfContext, ConcurrentConfContext, SimilarCourseContext } from '../contexts';
import { ConsecutiveConf, TimetableStatus } from '../core/types';
import { useDialog } from '../composables/dialog';

const { proxy } = getCurrentInstance() as any;
const concurrentConfRef = ref<InstanceType<typeof ConcurrentCourseConf> | null>(null);

enum SubMenu {
  ConcurrentCourses = 'ConcurrentCourses',
  ConsecutiveLessons = 'ConsecutiveLessons',
  SpecialtyRoom = 'SpecialtyRoom',
  SimilarCourses = 'SimilarCourses',
}

// defineOptions({  name: 'TimetableAdditionalWork', });
const props = defineProps({
  helpOn: {
    type: String,
    default: 0,
  },
});

const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;
const consecutiveConfContext = inject(ContextKeys.ConsecutiveConf) as ConsecutiveConfContext;
const specialtyRoomConfContext = inject(ContextKeys.SpecialtyRoomConf) as SpecialtyRoomConfContext;
const similarCourseConfContext = inject(ContextKeys.SimilarCourseConf) as SimilarCourseConfContext;
const concurrentConfContext = inject(ContextKeys.ConcurrentConf) as ConcurrentConfContext;
const timetableCourseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext;
const similarCourseContext = inject(ContextKeys.SimilarCourse) as SimilarCourseContext

const consecutiveConfs = computed(() => consecutiveConfContext.consecutiveConfs as ConsecutiveConf[] || []);
const fromNextStep = computed(() => proxy.$route && proxy.$route.params && proxy.$route.params?.moveType === 'prev');
const fromPrevStep = computed(() => proxy.$route && proxy.$route.params && proxy.$route.params?.moveType === 'next');

const noticeType = ref<NoticeType>(NoticeType.None);
// 데이터 수정 관련 안내 팝업  상태
const isShowDataEntryNoticeModal = ref(false);
const handleCloseDataEntryNoticeModal = () => {
  isShowDataEntryNoticeModal.value = false;
};

const showNoticeIfNotSeen = (key: NoticeType) => {
  if (!sessionStorage.getItem(key)) {
    noticeType.value = key;
    isShowDataEntryNoticeModal.value = true;
    sessionStorage.setItem(key, 'true');
  }
};

onMounted(async () => {
  await progressContext.reload();

  if (!progressContext.checkAccessible(TimetableStatus.AdditionalWork)) {
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
  } else if (fromPrevStep.value) {
    showNoticeIfNotSeen(NoticeType.ConcurrentConfNotice);
  }

  await concurrentConfContext.reload();
  await consecutiveConfContext.reload();
  await specialtyRoomConfContext.reload();
  await similarCourseConfContext.reload();
  await timetableCourseBaseContext.reload();
  await similarCourseContext.reload();
});

const menuItems = ref<Menu[]>([
  {
    name: SubMenu.ConcurrentCourses,
    label: '동시수업',
  },
  {
    name: SubMenu.ConsecutiveLessons,
    label: '연속수업',
  },
  {
    name: SubMenu.SpecialtyRoom,
    label: '특별실',
  },
  {
    name: SubMenu.SimilarCourses,
    label: '유사과목 지정',
  },
]);

const dialog = useDialog();

const subMenu = ref<SubMenu>(SubMenu.ConcurrentCourses);

const clickSubMenu = (item: Menu) => {
  subMenu.value = item.name as SubMenu;
};

const checkBeforeMove = async () => {

  // 동시 수업 탭 검증
  if (concurrentConfRef.value?.hasWarningSignOnRow) {
    subMenu.value = subMenu.value !== SubMenu.ConcurrentCourses ? SubMenu.ConcurrentCourses : subMenu.value;
    noticeType.value = NoticeType.ConcurrentConfError;
    isShowDataEntryNoticeModal.value = true;
    return false;
  }

  // 연속 수업 탭 검증
  if (consecutiveConfs.value.length > 0) {
    const isValid = consecutiveConfs.value.every(conf => conf.consecutivePeriod !== null && conf.consecutivePeriod !== '');
    if (!isValid) {
      subMenu.value = subMenu.value !== SubMenu.ConsecutiveLessons ? SubMenu.ConsecutiveLessons : subMenu.value;
      await dialog.alertSimple('연속 수업 탭에서 연속 시수를 선택해주세요.');
      return false;
    }
  }

  // 상태 업데이트 검증
  const nextStatus = TimetableStatus.Generate;
  const isStatusUpdated = await progressContext.updateStatus(nextStatus);

  if (!isStatusUpdated) {
    await dialog.alertSimple('다음 단계로 이동할 수 없습니다.');
    return false;
  }

  return true; // TODO: 시수표 유효성 검사 로직 구현
}

defineExpose({
  checkBeforeMove,
});

</script>

<style lang="scss" scoped>
.tt-additional-work {
  .tab-nav {
    .btn {
      &[class*=btn-help] {
        margin: 0 2px;
      }      
    }
  }

// 데이터 수정 관련 안내 팝업
  // .data-entry-notice-modal{
  //   ::v-deep{
  //     .heading{
  //       span{
  //         display: flex;
  //         align-items: center;
  //         gap: 0px;
  //       }
  //     }
  //   }
  //   .gray-box {
  //     font-size: 16px;
  //     font-style: normal;
  //     font-weight: 400;
  //     line-height: 27px; /* 168.75% */
  //     letter-spacing: -0.2px;
  //     margin:0;
  //     .txt-warning{
  //       font-weight: 700;
  //     }
  //   }
  // }
}
</style>
