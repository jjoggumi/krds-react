<!--
@File(Method): GroupDeleteModal.vue
@Date Created: 2024.10.30
@Description: 게시글 내보내기 모달 (그룹 삭제 모달)
-->
<template>
  <HiModal type="type01" size="xs" closeSkip @close="closeModal('groupDel')">
    <template v-slot:heading>내보내기 그룹을 삭제하시겠습니까?</template>
    <template v-slot:content>삭제된 그룹은 복구되지 않습니다.</template>
    <template v-slot:footer>
      <HiButton color="line-light-primary" size="lg" @click="closeModal('groupDel')">취소</HiButton>
      <HiButton color="noti" size="lg" @click="deleteGroup(groupEditInfo.groupId)">삭제</HiButton>
    </template>
  </HiModal>
</template>

<script>
import HiModal from "@/components/Modal/HiModal";
import HiButton from "@/components/Button/HiButton";
import {mapState} from "vuex";

export default {
  name: "group-delete-modal",
  components: {HiButton, HiModal},  
  props: {
    groupEditInfo: {
      type: Object
    },
  },
  computed: {
    ...mapState({
      user: 'user'
    })
  },
  methods: {
    closeModal(modalName) {
      this.$emit('closeModal', modalName)
    },

    //삭제
    async deleteGroup() {
      try {
        const response = await this.$axios({
          method: 'DELETE',
          url: `/users/${this.user.currentId}/boards/groups/${this.groupEditInfo.groupId}`     
        })      
        this.closeModal('groupDel')
      } catch (error) {
        this.$log.debug('API 호출 실패:', error);
      }
    },
  }
}
</script>

<style scoped>

</style>