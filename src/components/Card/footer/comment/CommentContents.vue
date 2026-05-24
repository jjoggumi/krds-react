<!--
@File(Method): CommentContents.vue
@Author: -
@Date Created: -
@Description: 게시판 게시글 > 댓글 영역 > 텍스트 영역
@Modified: 2024-08-28 - #68211 secret class 설정 삭제
-->

<template>
  <div
    class="text" 
  >
    <pre
      :key="`comment-contents-${componentKey}`"
      v-autolinker:[$className]="commentContents"
    ></pre>
  </div>
</template>

<script>
import { mapState } from "vuex"

export default {
  name: "comment-contents",
  props: [
    "comment",
    "secretDeny",
    "isChanged",
    "isClassPost"
  ],
  data() {
    return {
      isMore: true,
      componentKey: 0
    }
  },
  computed: {
    ...mapState({
      curClassSearchQuery: 'curClassSearchQuery',
    }),
    commentHtml() {
      let comment = this.comment ? this.comment.replaceAll('>', '&gt;').replaceAll('<', '&lt;') : this.comment
      if (this.isChanged)
        comment += ' <span class="text-edited">(수정됨)</span>'

      return comment
    },
    secretComment() {
      return this.secretDeny ? this.isClassPost ? "작성자와 선생님만 확인 가능합니다." : "운영자와 선생님만 확인 가능합니다." : ''
    },
    commentContents() {
      if(this.secretDeny) {
        return this.secretComment
      } else {
        let commentContent = ""
        if(this.curClassSearchQuery.keyword) {
          const regex = new RegExp(`(${this.curClassSearchQuery.keyword})(?![^<]*>)(?![^&amp;|&nbsp;|&lt;|&gt;|&quot;|&ndash;|&mdash;|&copy;|&reg;|&trade;|&asymp;|&ne;|&pound;|&euro;|&deg;]*;)`, "gi")
          commentContent = this.commentHtml.replace(regex, "<span class='highlight'>" + this.curClassSearchQuery.keyword + "</span>")
        } else {
          commentContent = this.commentHtml
        }

        return commentContent
      }
    }
  },
  methods: {
  }
};
</script>

<style scoped>
.cont-wrap pre {
  line-height: inherit;
}
</style>
