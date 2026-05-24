<template>
  <!-- 데이터 수정 관련 안내 팝업 -->
  <TimeTableModal size="xs" closeSkip @close="handleCloseDialog" class="time-table-modal data-entry-notice-modal">
    <template v-slot:heading>
      <span v-if="noticeType === NoticeType.ConcurrentConfNotice" class="txt-warning">
        <!-- 6단계 최초 진입 시 데이터 작성 안내 팝업   -->
        <i  class="hi-ico ico-warning ico-warning-circle ico-size-24"></i> 잠깐! 데이터 작성 시 유의해주세요.
      </span>
      <span v-if="noticeType === NoticeType.DataEditNotice" class="txt-warning">
        <!-- 이전으로 단계 이동하여 화면 진입 시 -->
        <i class="hi-ico ico-warning ico-warning-circle ico-size-24"></i> 잠깐! 데이터 수정 시 유의해주세요.
      </span>
      <span v-if="noticeType === NoticeType.ConcurrentConfError" class="txt-warning">
        <!-- 6단계에서 동시 수업 등록 시 배정 불가 에러로 체크된 경우 -->
        <i class="hi-ico ico-warning ico-warning-circle ico-size-24"></i> 동시수업 배정을 조정해 주세요.
      </span>
    </template>
    <template v-slot:content>
      <!-- 6단계 최초 진입 시 데이터 작성 안내 팝업  -->
      <div v-if="noticeType === NoticeType.ConcurrentConfNotice" class="gray-box">
        6단계부터는 1~5단계에서 입력된 정보를 기반으로 입력이 진행됩니다. <span class="txt-warning">이전 단계로 이동하여 데이터를 수정하면 6, 7단계의 작업 내용이 모두 삭제</span>될 수 있습니다. <br>
        이전 단계의 입력값이 정확한지 다시 한 번 확인해 주시기
        바랍니다.
      </div>
      <!-- 이전으로 단계 이동하여 화면 진입 시 -->
      <div v-if="noticeType === NoticeType.DataEditNotice" class="gray-box">
        시간표 생성은 이전 단계에서 입력한 데이터를 기반으로 진행됩니다. 따라서 <span class="txt-warning">이전 단계에서 내용을 수정하면 이후 단계에서 진행된 작업이 삭제</span>될 수 있습니다. <br>이후 단계에 영향을 미치는 항목은 가이드에서 꼭 확인해 주세요.
      </div>
      <!-- 6단계에서 동시 수업 등록 시 배정 불가 에러로 체크된 경우 -->
      <div v-if="noticeType === NoticeType.ConcurrentConfError" class="gray-box">
        현재 등록된 동시수업 그룹 구성으로는 시간표를 배정할 수 없습니다. 이 문제는 여러 학년의 동시수업을 담당하는 교사가 많을 때 주로 발생합니다.<br>시간표 배정을 위해 표시된 수업의 담당 교사를 조정해 주세요.
      </div>
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-primary btn-lg" @click="handleCloseDialog" >확인</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import { NoticeType } from '@/apps/timetable/common/types';
import { defineEmits, computed } from 'vue';

const props = withDefaults(
  defineProps<{noticeType?: NoticeType}>(),
  { noticeType: NoticeType.None }
);

const noticeType = computed(() => props.noticeType);

const emit = defineEmits(['close']);

const handleCloseDialog = () => {
  emit('close');
};
</script>

<style lang="scss" scoped>

// 데이터 수정 관련 안내 팝업
  .data-entry-notice-modal{
    ::v-deep{
      .heading{
        span{
          display: flex;
          align-items: center;
          gap: 0px;
        }
      }
    }
    .gray-box {
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 27px; /* 168.75% */
      letter-spacing: -0.2px;
      margin:0;
      .txt-warning{
        font-weight: 700;
      }
    }
  }

</style>