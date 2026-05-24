<!--
@File(Method): CommentMore.vue
@Author: -
@Date Created: -
@Description: 클래스 > 게시판 > 리스트 내 코멘트 > 캐밥 메뉴 
@Modified: 2024-11-12 - #69464 캐밥 메뉴 디자인 시스템 적용
-->

<template>
<!-- #69464 캐밥 메뉴 디자인 시스템 적용 -->
<HiKebab v-if="isView">
  <button v-if="isUpdate" class="btn-edit" @click="commentUpdate">
    수정하기
  </button>
  <button v-if="isReport" class="btn-report" @click="commentReport">
    신고하기
  </button>
  <button v-if="isDelete" class="btn-delete" @click="commentDelete">
    삭제하기
  </button>
</HiKebab>
</template>

<script>
import {mapState} from "vuex";
import HiKebab from "@/components/Kebab/HiKebab.vue";

export default {
  name: 'comment-more',
  components: {HiKebab},
  props: {
    comment: {
      type: Object,
      required: true
    },
    isManager: {
      type: Boolean,
      default() {
        return false
      }
    },
    isReportUse: {
      type: Boolean,
      default() {
        return true
      }
    },
    isClassPost: Boolean
  },
  data: () => ({
    isMore: false
  }),
  computed: {
    ...mapState({
      user: 'user',
    }),
    commentInsertedUserid() {
      return this.comment.writeUser ? this.comment.writeUser.userId : ''
    },
    adminInserted() {
      return this.comment.writeUser.userType === "ADMIN" ? true : false
    },
    isReport() {
      return this.isReportUse && this.commentInsertedUserid !== this.user.currentId && !this.adminInserted && this.isClassPost === false
    },
    isUpdate() {
      return this.commentInsertedUserid === this.user.currentId
    },
    isDelete() {
      return this.isManager || this.commentInsertedUserid === this.user.currentId
    },
    isSecretDeny() {
      return this.comment.secretDeny || false
    },
    isView() {
      if(this.isUpdate === false && this.isReport === false && this.isDelete === false) {
        return false
      } else {
        return !this.isSecretDeny
          && (this.isManager || this.isReportUse || this.commentInsertedUserid === this.user.currentId)
      }
    }
  },
  mounted() {},
  methods: {
    // #69464 캐밥 메뉴 디자인 시스템 적용
    // toggleMore() {
    //   this.isMore = !this.isMore
    // },
    // closeMore() {
    //   this.isMore = false
    // },
    commentDelete() {      
      // #69464 캐밥 메뉴 디자인 시스템 적용
      //this.isMore = false
      this.$emit('is-delete', this.comment)
    },
    commentReport() {      
      // #69464 캐밥 메뉴 디자인 시스템 적용
      //this.isMore = false
      this.$emit('is-report', this.comment)
    },
    commentUpdate() {
      // #69464 캐밥 메뉴 디자인 시스템 적용
      //this.isMore = false
      this.$emit('is-update', this.comment)
    },
  }
}
</script>

<style scoped></style>
