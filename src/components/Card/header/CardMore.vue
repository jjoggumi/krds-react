<!--
@File(Method): CardMore.vue
@Author: -
@Date Created: -
@Description: 클래스 > 게시판 > 리스트 > 캐밥 메뉴 
@Modified: 2024-11-12 - #69464 캐밥 메뉴 디자인 시스템 적용
-->
<template>
<div> 
    <!-- #69464 캐밥 메뉴 디자인 시스템 적용-->
    <HiKebab>
      <button
        v-for="button of buttons"
        :key="button.btnType"
        :class="button.btnClass"
        @click="onClickButtons(button.btnType)"
      >
        <span>{{ button.btnTitle }}</span>
      </button>
    </HiKebab> 
    <MoveBoardModal v-if="isOpenSelectBoardModal === 'move' || isOpenSelectBoardModal === 'copy'"
      :postId="postId"
      :postStatus="postStatus"
      :folder="getFolder"
      :board="board"
      :boardModalType="boardModalType"
      :isParentDeactivated="isParentDeactivated"
      @movePost="movePost"
      @deletePost="deletePost"
      @copyPost="copyPost"
      @close="closeSelectBoardModal"
    />
    
    <!-- #69118 내보내기 추가 -->
    <post-export-modal
        v-if="isOpenSelectBoardModal === 'export'"
        :postId="postId"
        :postTypeName="postTypeName"
        @deletePost="deletePost"
        @close="closeSelectBoardModal"
    />
  </div>
</template>

<script>
import {eventBus} from "@/main";
import {mapGetters, mapState} from 'vuex'
import MoveBoardModal from '@/components/MoveBoard/MoveBoardModal.vue'
import HiKebab from "@/components/Kebab/HiKebab.vue";
import PostExportModal from "@/components/PostExport/ExportModal"

export default {
  name: 'card-more',
  components: {
    MoveBoardModal, HiKebab, PostExportModal
  },
  props: {
    isManager: {
      type: Boolean,
      required: true
    },
    postId: {
      type: String,
      required: true
    },
    postType: {
      type: String,
      required: true
    },
    postTypeName: {
      type: String,
      required: true
    },
    postPin: {
      type: Boolean,
      required: true
    },
    postStatus: {
      type: String,
      required: true
    },
    isParentDeactivated: {
      type: Boolean,
      default: false
    },
    schoolType: {
      type: String,
      required: true
    },
    writeUser: {
      type: Object,
      required: true
    },
    version: {
      type: [String, null]
    },
    board: {
      type: Object
    },
    folder: {
      type: Object
    },
    isDetail: {
      type: Boolean
    },
    postItem: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // isMore: false, // #69464 캐밥 메뉴 디자인 시스템 적용
      disabled: {
        postPinBtn: true
      },
      isOpenSelectBoardModal: null,
      isShowMoveCopyBtn: true,
      boardModalType: 'move'
    }
  },
  computed: {
    ...mapState({
      user: 'user'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    postPinTitle() { return this.postPin ? '공지취소' : '공지하기' },
    isPostStatusComplete() { return this.postStatus === 'COMPLETE' },
    isShowPostPinBtn() {
      return !this.disabled.postPinBtn && this.isManager && this.isPostStatusComplete
    },
    isShowPostUpdateBtn() {
      if (this.isManager && this.isWriteUserTeacher)
        return true

      return this.writeUser.userId
        && this.writeUser.userId === this.user.currentId
    },
    isWriteUserTeacher() {
      return this.writeUser && this.writeUser.userType === this.CONSTANTS.USER_TYPE.TEACHER
    },
    isNote() { return this.postType === 'NOTE' },
    isUseBlackboard() {
      return this.isNote
        && this.version === 'V2'
        && this.$constants.SCHOOL_TYPE.blackBoard.includes(this.schoolType)
    },
    isPostVersionV1() { return this.version === this.CONSTANTS.POST_VERSION.V1 },
    updateNoteButtonTitle() { return '판서로 수정' },
    updateButtonTitle() { return this.isUseBlackboard ? '게시글로 수정' : '수정' },
    deleteButtonTitle() { return '삭제' },
    moveButtonTitle() { return '이동' },
    copyButtonTitle() { return '복사' },
    exportButtonTitle() { return '내보내기' }, // #69118 내보내기 추가
    buttons() {
      let buttons = []      

      if (this.isShowPostPinBtn && !this.isParentDeactivated) {
        buttons.push({
          btnClass: this.postPin ? 'btn-notice-off' : 'btn-notice',
          btnTitle: this.postPinTitle,
          btnType: 'togglePinPost',
        })
      }

      if (this.isUseBlackboard && this.isShowPostUpdateBtn && !this.isParentDeactivated && this.isManager) {
        buttons.push({
          btnClass: 'btn-blackbd-modify',
          btnTitle: this.updateNoteButtonTitle,
          btnType: 'editPostNote',
        })
      }

      if (this.isShowPostUpdateBtn && !this.isParentDeactivated) {
        const PostUpdateBtnObj = {
          btnClass: 'btn-modify',
          btnTitle: this.updateButtonTitle,
          btnType: 'editPost',
        }
        if (this.isNote && this.isPostVersionV1)
          PostUpdateBtnObj.btnType = 'editPostNote'

        buttons.push(PostUpdateBtnObj)
      }

      if (this.isManager && this.isShowMoveCopyBtn) {
        buttons.push({
          btnClass: 'btn-copy',
          btnTitle: this.copyButtonTitle,
          btnType: 'copyPost',
        })

        if (this.postStatus === 'COMPLETE'
          && !this.isParentDeactivated
          && !this.isSecretBoard) {
          buttons.push({
            btnClass: 'btn-export',
            btnTitle: this.exportButtonTitle,
            btnType: 'exportPost',
          })
        }

        if (!this.isParentDeactivated && !this.isSecretBoard) {
          buttons.push({
            btnClass: 'btn-move',
            btnTitle: this.moveButtonTitle,
            btnType: 'movePost',
          })
        }
      }

      if (!this.isParentDeactivated) {
        buttons.push({
          btnClass: 'btn-delete',
          btnTitle: this.deleteButtonTitle,
          btnType: 'deletePost',
        })
      }

      return buttons
    },
    getFolder() {
      return !this.board.isUsedFolder ? null : this.folder
    },
    isSecretBoard() {
      return this.board && this.board.boardType === 'SECRET'
    }
  },
  created() {
    if (this.$route.path && this.$route.path.includes('/clazzes/')) {
      this.disabled.postPinBtn = false
    }

    if((this.$route.path.includes('/main/mypage/scrap') || this.$route.path.includes('/main/myboard/news')) && !this.isDetail) {
      this.isShowMoveCopyBtn = false
    }

  },

  methods: {
    // #69464 캐밥 메뉴 디자인 시스템 적용
    // closeMore() {
    //   this.isMore = false
    // },
    deletePost(postId = false) {
      this.$emit('is-delete', postId)
      // this.closeMore()
    },
    editPost(type) {
      this.$emit('is-post', type)
      //this.closeMore()
    },
    togglePostPin() {
      const payload = {
        postId: this.postId,
        postPin: !this.postPin
      }
      eventBus.$emit('update-post-pin', payload)
      //this.closeMore()
    },
    openSelectBoardModal(type) {
      this.isOpenSelectBoardModal = type
      this.boardModalType = type
      //this.closeMore()
    },
    closeSelectBoardModal() {
      this.isOpenSelectBoardModal = null
      this.$emit("movePostClose")
    },
    onClickButtons(btnType) {
      switch (btnType) {
        case 'editPostNote': {
          this.editPost('BLACKBOARD_UPDATE')
          break
        }
        case 'editPost': {
          this.editPost()
          break
        }
        case 'deletePost': {
          this.deletePost()
          break
        }
        case 'togglePinPost': {
          this.togglePostPin()
          break
        }
        case 'movePost': {
          this.openSelectBoardModal('move')
          break
        }
        case 'copyPost': {
          this.openSelectBoardModal('copy')
          break
        }
        // #69118 내보내기 추가
        case 'exportPost': {
          this.openSelectBoardModal('export')
        }
      }
    },
    movePost(post) {
      this.$emit("movePost", post)
      this.closeSelectBoardModal()
    },
    copyPost(post) {
      this.$emit('copyPost', post)
      this.closeSelectBoardModal()
    },
    // #69118 내보내기 추가
    exportPost() {
      this.closeSelectBoardModal()
    }
  },
}
</script>

<style scoped></style>