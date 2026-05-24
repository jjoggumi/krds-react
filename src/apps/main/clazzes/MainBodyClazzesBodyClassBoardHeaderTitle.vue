<!--
@File(Method):MainBodyClazzesBodyClassBoardHeaderTitle.vue 
@Description: 클래스 > 게시판 > 게시판 헤더 타이틀
@Modified: 2025-03-06 - #72670 비밀게시판 명칭 변경 > 그룹게시판
-->

<template>
  <div class="page-sub-heading">
    <h3 class="heading">
      <HiIcon name="ico-group-fill" color="gray" size="24" class="board-type-group" v-if="curBoard.boardType === 'SECRET'" /> {{ title }}
    </h3>
    <!-- 
    <h3 class="heading" :class="{'secret': curBoard.boardType === 'SECRET'}">{{ title }}</h3>
    -->
    <button
      v-if="isCurClassManager"
      class="btn-setting"
      @click="goRoutePermission"
    >
      <div class="tooltip">
        <span>{{ description }}</span>
      </div>
    </button>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";

export default {
  name: "main-body-clazzes-body-class-board-header-title",
  props: {
    postType: {
      type: String,
      default() {
        return ''
      }
    }
  },
  computed: {
    ...mapState({
      curClassItem: 'curClassItem',
      isCurClassManager: 'isCurClassManager',
    }),
    ...mapGetters({
      getPostTypeNameByCode: 'getPostTypeNameByCode',
    }),
    ...mapGetters('storeBoard', {
      curBoard: 'curBoard',
    }),

    // 사용 여부
    isUsedComment() { return this.curBoard.isUsedComment },
    isUsedLike() { return this.curBoard.isUsedLike },
    isUsedFolder() { return this.curBoard.isUsedFolder },

    // 읽기 권한
    isReadParents() { return this.curBoard.isReadParents },
    isReadStudent() { return this.curBoard.isReadStudent },

    // 쓰기 권한
    isWriteParents() { return this.curBoard.isWriteParents },
    isWriteStudent() { return this.curBoard.isWriteStudent },

    // 댓글 권한
    isCommentParents() { return this.curBoard.isCommentParents },
    isCommentStudent() { return this.curBoard.isCommentStudent },

    boardDescription() {
      const boardDescriptions = []
      const reads = []
      const writes = []
      const comments = []
      const parentsName = this.$constants.USER_TYPE.find(u => u.code === 'PARENTS').name
      const studentName = this.$constants.USER_TYPE.find(u => u.code === 'STUDENT').name

      if (this.isReadParents) reads.push(parentsName)
      if (this.isReadStudent) reads.push(studentName)
      if (reads.length > 0) boardDescriptions.push(`읽기 (${reads.join(', ')})`)

      if (this.isWriteParents) writes.push(parentsName)
      if (this.isWriteStudent) writes.push(studentName)
      if (writes.length > 0) boardDescriptions.push(`쓰기 (${writes.join(', ')})`)

      if (this.isUsedComment) {
        if (this.isCommentParents) comments.push(parentsName)
        if (this.isCommentStudent) comments.push(studentName)
        if (comments.length > 0) boardDescriptions.push(`댓글 (${comments.join(', ')})`)
      }

      return boardDescriptions.join(', ')
    },
    boardAllDescription() {
      return '중요한 상단고정 게시글과 최근 게시글을 확인하세요.'
    },
    postTypeName() {
      if (this.postType === 'ALL') return '최근 게시글'

      const params = this.postType === 'NOTE'
        ? { code: this.postType, type: this.curClassItem.school.schoolType }
        : { code: this.postType }

      return this.getPostTypeNameByCode(params)
    },
    title() {
      if (this.postType === 'ALL') return this.postTypeName

      let title = this.curBoard.boardName
      if (this.isUsedFolder) {
        const folderId = this.$route.params.folderId
        const foundFolder = this.curBoard.folderList.find(folder => folder.folderId === folderId)
        if (foundFolder) {
          title += ' > ' + foundFolder.folderName
        }
      }
      return title || this.postTypeName
    },
    secretBoardDescription() {
      return `읽기 (${(this.curBoard.boardPermission || {}).readCount}명)`
    },
    description() {
      if (this.postType === 'ALL') return this.boardAllDescription
      else if (this.curBoard.boardType === 'SECRET') return this.secretBoardDescription
      else if (this.postType) return this.boardDescription
      else return ''
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    goRoutePermission() {
      const path = `/main/clazzes/${this.curClassItem.currentId}/permission`
      const query = {}
      if (this.curBoard.boardId) {
        query.boardId = this.curBoard.boardId
      }
      this.$router.push({ path, query }, () => {})
    }
  },
}
</script>

<style scoped>

</style>