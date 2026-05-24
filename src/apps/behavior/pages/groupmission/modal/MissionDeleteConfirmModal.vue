<template>
  <!-- 미션 삭제 확인 모달 -->
  <Modal
    v-show="true"
    description="미션을 삭제하시겠습니까?"
    cancelText="취소"
    confirmText="확인"
    @confirm="deleteMission"
    @close="$emit('closeDeleteConfirm')"
    size="small"
  >
    <template #content>
      <div class="delete-confirm-content">
        <!-- 내용이 필요하면 추가 -->
      </div>
    </template>
  </Modal>
</template>

<script lang="js">
import Modal from '@/apps/behavior/components/common/Modal.vue';
import { deleteGroupMission } from '@hiclass/core';
import { mapState } from 'vuex';

export default {
  name: 'MissionDeleteConfirmModal',
  components: { Modal },
  props: {
    templateId: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom']),
  },
  methods: {
    async deleteMission() {
      try {
        await deleteGroupMission(this.curClassroom.classroomId, this.templateId);
        this.$emit('deleteMission', this.templateId);
        this.$emit('closeDeleteConfirm');
      } catch (e) {
        console.error('미션 삭제 실패했습니다.', e);
        this.$hiClass.alert('데이터 요청중 에러가 발생했습니다.<br>잠시 후 다시 시도해 주세요.');
      }
    },
  },
};
</script>

<style scoped></style>
