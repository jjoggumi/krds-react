<template>
  <div
    v-if="isCurClassActivated && itemWriteUsed()"
    class="group-btn"
  >
    <button v-if="isPopupNote" class="btn-write-blackboard" @click="openNoteBoardWindow">
      <span>판서로 쓰기</span>
    </button>
    <button class="btn-write" @click="openBoardWriteLayer">
      <span>게시글 쓰기</span>
    </button>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";

export default {
  name: "main-body-clazzes-rnb-board-write",
  props: {},
  computed: {
    ...mapState({
      user: 'user',
      curClassItem: 'curClassItem',
      postVersionDefault: 'postVersionDefault',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      isCurClassActivated: 'isCurClassActivated',
      isCurClassOwnerOrManager: 'isCurClassOwnerOrManager',
      getPostTypeNameByCode: 'getPostTypeNameByCode',
    }),
    ...mapGetters('storeBoard', {
      curBoard: 'curBoard'
    }),
    isPopupNote() {
      return this.postTypeName === '알림장'
    },
    postType() {
      return this.$route.params.board.toUpperCase()
    },
    postTypeName() {
      const schoolType = this.curClassItem.school.schoolType
      const params = this.postType === 'NOTE'
        ? { code: this.postType, type: schoolType }
        : { code: this.postType }

      return this.getPostTypeNameByCode(params)
    },
  },
  methods: {
    ...mapActions([
      'triggerAnalyticsLogEvent',
      'openCurPostEditByCreate',
    ]),
    openNoteBoardWindow() {
      this.triggerAnalyticsLogEvent({ code: `analytics.class.click.button.${this.postType.toLowerCase()}.post` })
      const param = {
        userUUID: this.user.currentId,
        classUUID: this.curClassItem.currentId,
        type: 'c',
        version: this.postVersionDefault
      }
      const folderId = this.$store.state.storeBoard.curBoardFolderId
      if(folderId) param.folderId = folderId
      const url = '/main/clazzes/note/newboard'.concat(this.$comn.jsonToQueryString(param))
      const height = screen.availHeight - this.$store.state.TASKBAR_HEIGHT
      const width = screen.availWidth - this.$store.state.NOTEBOARD_MARGIN_WIDTH

      window.open(
        url,
        'createNote',
        `height=${height},width=${width},top=0,left=0,resizable,scrollbars=1`
      )
    },
    openBoardWriteLayer() {
      if (this.postVersionDefault === this.CONSTANTS.POST_VERSION.V1) {
        this.$hiClass.alert('V1 게시글 작성은 지원 종료되었습니다.', 'info')
        return false
      }

      const postTypeLowerCase = this.postType.toLowerCase()
      this.triggerAnalyticsLogEvent({ code: `analytics.class.click.button.${postTypeLowerCase}.post.modalEditor` })

      this.openCurPostEditByCreate({
        isManager: this.isCurClassOwnerOrManager,
        classId: this.curClassItem.currentId,
        postType: this.postType,
        schoolType: this.curClassItem.school.schoolType,
        curClassItem: this.curClassItem,
        postVersion: this.postVersionDefault,
        create: true
      })
      this.triggerAnalyticsLogEvent({ code: `analytics.class.click.button.${postTypeLowerCase}.post` })
    },
    itemWriteUsed() {
      const postType = this.postType
      const board = this.curBoard
      const isManager = this.isCurClassOwnerOrManager

      return this.$hiClass.itemWriteUsed(postType, board, isManager) || false
    }
  }
}
</script>

<style scoped>

</style>