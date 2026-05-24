<template>
  <div class="board__footer"> <!-- .item-btm-btn-wrap -->
    <div class="group-btn-footer">

      <like-button
        v-if="isShowLike"
        :key="`like-${postId}`"
        :isSync="true"
        :like.sync="postItem.isLike"
        :likeCount.sync="postItem.likeCount"
        :postItem="postItem"
        :isFloatingMode="false"
        :isReadOnly="!isParentActivated"
      />

      <button v-if="isShowComment" class="btn-comment">
        댓글<span>{{ postItem.commentCount }}</span>
      </button> <!-- comment-count icon -->

      <delicious-button 
        v-if="isShowDelicious" 
        :isSync="true"
        :like.sync="postItem.isLike"
        :likeCount.sync="postItem.likeCount"
        :postItem="postItem"
      />

      <scrap-button
        v-if="isShowScrap2"
        :key="`scrap-${postId}`"
        :isSync="true"
        :isFloatingMode="false"
        :isClassActivated="isParentActivated"
        :scrap.sync="postItem.isScrap"
        :postItem="postItem"
      />

      <print-button
        v-if="isPostTypeNote"
        :post-item="postItem"
        :post-item-type="postItemType"
        :post-type-name="postTypeName"
        :school-type="schoolType"
        :class-name="className"
      />

      <share-button
        v-if="isShowShareBtn"
        :isFloating="false"
        :currentId="postId"
      />

      <!-- [V2] 클래스 게시글 읽음확인 버튼 -->
      <clazz-remind-push
        v-if="isManager && isVisibleRemindPushButton(postItem)"
        :post-item="postItem"
        :post-item-type="postItemType"
        :class-subscribe-count="curClassItem.classSubscribeCount"
        :school-type="schoolType"
      />

    </div>

    <comment
      :key="postId"
      :post-item="postItem"
      :post-item-type="postItemType"
      :comments="postItem.comments"
      :count.sync="postItem.commentCount"
      :is-show-comment="isShowComment"
      :is-manager="isManager"
      :is-read-only="!isParentActivated"
    />

  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";

import ClazzRemindPush from "@/components/Button/ClazzRemindPush";
import Comment from "@/components/Card/footer/comment/Comment";
import LikeButton from "@/components/Card/footer/LikeButton";
import ScrapButton from "@/components/Card/footer/ScrapButton";
import PrintButton from "@/components/Card/footer/PrintButton";
import ShareButton from "@/components/Card/footer/ShareButton";
import DeliciousButton from "@/components/Card/footer/DeliciousButton";

export default {
  name: "card-item-footer",
  components: {
    ShareButton,
    PrintButton,
    ScrapButton,
    LikeButton,
    Comment,
    ClazzRemindPush,
    DeliciousButton
  },
  props: {
    isParentActivated: {
      type: Boolean,
      required: true
    },
    isManager: {
      type: Boolean,
      required: true
    },
    /**
     * props: post item object
     * ( post | clazzesPost | schoolsPost )
     */
    postItem: {
      type: Object,
      required: true
    },
    /**
     * props: post item type
     * ( POST | CLAZZES_POST | SCHOOLS_POST )
     */
    postItemType: {
      type: String,
      required: true
    },
    postTypeName: {
      type: String,
      required: true
    },
    schoolType: {
      type: String,
    },
    className: {
      type: String
    },
    board: {
      type: Object,
      required: false
    },
    isShowScrap: Boolean
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapState({
      user: 'user',
      curClassItem: 'curClassItem',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    /**
     * 클래스의 댓글 권한 참조
     */
    isShowComment() {
      const statusActivatePostTypes = [
        'EDUCATION',
        'EVENT',
        'HINOTICE',
        'CP_BOARD'
      ]
      // 권한별 제어를 할 수 없는 게시글의 댓글 제어 플래그
      const curPostCommentUsed = this.postItem.postCommentUsed
      const curPostType = this.postType
      let flag = false

      try {
        switch (curPostType) {
          // 클래스 게시글의 댓글 권한 확인
          case 'NOTE':
          case 'ALBUM':
          case 'BOARD':
          case 'HOMEWORK': {
            const commentUsed = this.board.isUsedComment
            const commentParentsUsed = this.isMemberParents && this.board.isCommentParents
            const commentStudentUsed = this.isMemberStudent && this.board.isCommentStudent
            flag = (
              commentUsed &&
              (this.isManager || commentParentsUsed || commentStudentUsed)
            ) || (this.board.boardPermission || {}).isCommentable
            break
          }
          default: {
            flag = curPostCommentUsed  && statusActivatePostTypes.includes(curPostType)
          }
        }
      } catch (e) {
        this.$log.error(e)
      }

      return flag
    },
    isShowLike() {
      return this.isClassPost
        ? this.itemLikeUsed
        : this.isStatusActivatePostTypeByPost
    },
    isShowDelicious() {
      return this.postType === "MEAL"
    },
    isPostTypeNote() {
      return this.postType === this.CONSTANTS.POST_TYPE.NOTE
    },
    isMemberParents() {
      return !this.isManager && (this.user.userType === 'TEACHER' || this.user.userType === 'PARENTS')
    },
    isMemberStudent() {
      return !this.isManager && this.user.userType === 'STUDENT'
    },
    isClassPost() {
      return [
        'NOTE',
        'ALBUM',
        'BOARD',
        'HOMEWORK'
      ].includes(this.postType)
    },
    postId() { return this.postItem.currentId },
    postContent() { return this.postItem.postContent },
    postType() { return this.postItem.postType || ''},
    posted() { return this.postItem.posted || null },
    postStatus() { return this.postItem.postStatus || '' },
    version() { return this.postItem.version || null },
    itemLikeUsed() { return this.board.isUsedLike },
    itemUri() { return this.postItem._links.self.href || null },

    isCpBoardPost() {
      return ['CP_BOARD'].includes(this.postType)
    },
    isShowScrap2() {
      return !(this.isCpBoardPost && (this.user.userType === 'STUDENT' || this.user.userType === 'PARENTS'))
    },

    isStatusActivatePostTypeByPost() {
      const statusActivatePostTypes = ['EDUCATION', 'EVENT', 'HINOTICE', 'CP_BOARD']
      return statusActivatePostTypes.includes(this.postType)
    },
    isShowShareBtn() {
      return this.isStatusActivatePostTypeByPost
    },
  },
  methods: {
    isVisibleRemindPushButton(post) {
      const postType = post.postType
      const writeUser = post.writeUser
      const memberRole = writeUser.memberRole
      const serviceUserType = writeUser.userType
      const forceVisiblePostTypes = ['NOTE', 'HOMEWORK']
      const isWriteUserTeacher = memberRole === 'OWNER' || memberRole === 'MANAGER' || serviceUserType === 'TEACHER'

      return post.postStatus === 'COMPLETE' // post.version === 'V2' &&
        && (forceVisiblePostTypes.includes(postType) || isWriteUserTeacher)
    },
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>