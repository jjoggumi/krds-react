<template>
  <HiModal type="type01" size="sm" closeSkip class="export-noti" @close="closeModal('exportNoti')">
    <template v-slot:content>
      <div class="swal2-icon swal2-warning swal2-icon-show"><div class="swal2-icon-content">!</div></div>
      <div class="tit">
        내보내기가 완료되지 않은 클래스/게시판이 있습니다.
        <p class="smr">다시 시도 하시겠습니까?</p>
      </div>
      <div class="textbox">
        <ul>
          <li v-for="(failedClassBoardName, idx) of failedClassBoardNameList" :key="`failedClassBoardName-${idx}`">
            {{ failedClassBoardName }}
          </li>
        </ul>
      </div>
    </template>
    <template v-slot:footer>
      <HiButton color="line-light-primary" size="lg" @click="cancel">취소</HiButton>
      <HiButton color="primary" size="lg" @click="exportPost">재시도</HiButton>
    </template>
  </HiModal>
</template>

<script>
import HiModal from '@/components/Modal/HiModal';
import HiButton from '@/components/Button/HiButton';
export default {
  name: 'export-retry-confirm-modal',
  components: { HiButton, HiModal },
  props: {
    classes: {
      type: Array,
    },
    exportSuccessCount: {
      type: Number,
    },
    exportFailClassBoards: {
      type: Array,
    },
  },
  computed: {
    failedClassBoardNameList() {
      return this.exportFailClassBoards.map((classBoard) => {
        const classItem = this.classes.find((classItem) => classItem.classId === classBoard.classId);
        const board = classItem.boardList.find((board) => board.boardId === classBoard.boardId);
        const folder = board.folderList.find((folder) => folder.folderId === classBoard.folderId);

        return `${classItem.className} ${board.boardName} ${folder.folderName}`;
      });
    },
  },
  methods: {
    closeModal(modalName) {
      this.$emit('closeModal', modalName);
    },
    cancel() {
      if (this.exportSuccessCount > 0) {
        this.$toasted.show('게시글 내보내기가 완료되었습니다.', {
          duration: 2000,
          className: 'type01',
          position: 'bottom-center',
        });
      }

      this.$emit('closeExportModal');
    },
    exportPost() {
      this.$emit('closeModal', 'exportNoti');
      this.$emit('exportPost', true);
    },
  },
};
</script>

<style lang="scss" scoped>
//내보내기 미완료 노티 모달
.export-noti::v-deep {
  .modal__layer {
    max-width: 420px;
    .swal2-icon {
      display: flex;
      margin: -20px auto 30px;
    }
    .textbox {
      padding-right: 1px;
      ul {
        height: 103px;
        overflow-y: scroll;
        li {
          text-align: left;
          font-size: 14px;
          color: #616161;
          font-weight: var(--font-normal);
          line-height: 1.5;
        }
      }
    }
  }
}
</style>