<template>
  <Modal
    v-show="true"
    description="이슬을 먼저 지급해주세요."
    confirmText="확인"
    :hideCancel="true"
    @close="closePermissionModal"
    @confirm="closePermissionModal"
    size="small"
  >
    <template #content>
      <div class="permission-modal-content"></div>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/apps/behavior/components/common/Modal.vue';

export default {
  name: 'MissionPermissionModal',
  components: {
    Modal,
  },
  methods: {
    closePermissionModal() {
      this.$emit('closePermissionModal');
    },
  },
};
</script>

<style lang="scss" scoped>
.permission-modal-content {
  color: #333;
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
}
</style>
