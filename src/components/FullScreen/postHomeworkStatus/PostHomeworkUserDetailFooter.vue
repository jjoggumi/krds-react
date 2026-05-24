<template>
  <div class="board__footer">
<!--
    :key="postId"
    :count.sync="postItem.commentCount"
    :is-show-comment="isShowComment"
    :is-manager="isManager"
-->
    <comment
      v-if="isShowComment"
      :is-show-comment="isShowComment"
      :is-read-only="false"
      :post-item="postHomeworkUser.post"
      :post-item-type="'POST_HOMEWORK_USERS'"
      :post-homework-user="postHomeworkUser"
      :content-type="'postHomework'"
    />

    <!-- 코멘트 컴포넌트 S-->
<!--    <comment
      v-if="isShowComment"
      :postItem="data"
      :count.sync="commentListLeng"
      :isManager="isManager"
      :isReadOnly="false"
      :isReplyUse="false"
      :isReportUse="false"
      :isUseFileUpload="false"
      :contentType="`postHomework`"
    />-->
    <!-- 코멘트 컴포넌트 E-->


  </div>
</template>

<script>
import Comment from "@/components/Card/footer/comment/Comment";

export default {
  name: "post-homework-user-detail-footer",
  components: {Comment},
  props: {
    postHomeworkUser: {
      type: Object,
      required: true
    }
  },
  computed: {
    isShowComment() {
      return !!this.postHomeworkUser.currentId
    }
  },
}
</script>

<style scoped>

</style>