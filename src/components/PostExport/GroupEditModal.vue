<!--
@File(Method): GroupEditModal.vue
@Date Created: 2024.10.30
@Description: 게시글 내보내기 모달 (그룹 등록/수정 모달)
-->
<template>
  <HiModal type="type01" size="sm" closeSkip @close="closeModal('groupEdit')">
    <template v-slot:heading>{{ groupEditInfo.mode === 'create' ? '그룹 저장하기' : '그룹명 수정하기' }}</template>
    <template v-slot:content>
      <template v-if="groupEditInfo.mode === 'create'">선택된 클래스와 게시판을 그룹으로 저장합니다.</template>
      <div class="input-box-wrap" :class="{'mt-30': groupEditInfo.mode === 'create'}">
        <input type="text" id="userName" @input="inputGroupName" :value="groupEditInfo.groupName" placeholder="그룹명을 입력해주세요."/>
      </div>
    </template>
    <template v-slot:footer>
      <HiButton color="line-light-primary" size="lg" @click="closeModal('groupEdit')">취소</HiButton>
      <HiButton color="primary" size="lg" :disabled="!groupEditInfo.groupName" @click="saveGroup">저장</HiButton>
    </template>
  </HiModal>
</template>

<script>
import HiModal from "@/components/Modal/HiModal";
import HiButton from "@/components/Button/HiButton";
import {mapState} from "vuex";

export default {
  name: "group-edit-modal",
  components: {HiButton, HiModal},
  props: {
    groupEditInfo: {
      type: Object
    },
    classes: {
      type: Array
    }
  },
  computed: {
    ...mapState({
      user: 'user'
    })
  },
  methods: {
    closeModal(modalName) {
      this.$emit('closeModal', modalName);
    },

    // 내보낼 게시판 목록
    getExportingClassBoardInfo() {
      const exportClasses = this.classes.filter(classItem => classItem.isExportChecked);

      // 최종적으로 내보내기 할 클래스/게시판/폴더
      let exportingClassBoardInfos = [];

      for (let exportClass of exportClasses) {
        exportClass.boardList.map(board => {
          for (let folder of board.folderList) {
            if (folder.isChecked) {
              exportingClassBoardInfos.push({
                classId: exportClass.classId,
                boardId: board.boardId,
                folderId: folder.folderId
              })
            }
          }
        })
      }

      return exportingClassBoardInfos;
    },

    // 그룹명 10자, 특수문자, 이모지 제한
    inputGroupName(event) {
      const regex = /[^\p{L}\p{N}\p{Zs}]/gu;
      this.groupEditInfo.groupName = event.target.value.replace(regex, '').substring(0, 10);
      event.target.value = this.groupEditInfo.groupName;
    },

    // 그룹 등록/수정 ===============================================================
    saveGroup() {
      if (this.groupEditInfo.mode === 'create') {
        this.createGroup();
      } else {
        this.editGroup();
      }
    },

    // 등록
    async createGroup() {
      let selectedList = this.getExportingClassBoardInfo().map(classBoardInfo => {
        return {
          groupId: null,
          ...classBoardInfo
        }
      })

      try {
        await this.$axios({
          method: 'POST',
          url: `/users/${this.user.currentId}/boards/groups`,
          data: { groupName: this.groupEditInfo.groupName, list: selectedList }
        })
        this.closeModal('groupEdit');
      } catch (error) {
        this.$log.debug('createGroup error: ', error);
      }
    },

    // 수정
    async editGroup() {
      try {
        await this.$axios({
          method: 'PATCH',
          url: `/users/${this.user.currentId}/boards/groups/${this.groupEditInfo.groupId}/name`,
          data: { groupName : this.groupEditInfo.groupName }          
        })      
        this.closeModal('groupEdit');
      } catch (error) {
        this.$log.debug('API 호출 실패:', error);
      }
    },
  }
}
</script>

<style scoped>

</style>