<template>
  <div class="hitalk-share__right">
    <textarea placeholder="공유할 메시지를 입력하세요." class="hitalk-share__textarea" @input="inputHitalkShareMessage" :value="hitalkShare.message"></textarea>
    <div class="hitalk-share__box">
      <strong class="heading" :inner-html.prop="computedPostTitle"></strong>
      <span class="name" :inner-html.prop="sharePostParent"></span>
      <p v-if="postType === 'CLASS_APPLY' || postType === 'SHEET'" class="text">신청서를 확인해주세요!</p>
      <p v-else-if="postType === 'SURVEY'" class="text" id="content-text" :inner-html.prop="post.surveySimpleDescription"></p>
      <p v-else-if="postType === 'BOARD' && post.board.boardType === 'SECRET'">&nbsp;</p>
      <p v-else-if="postType === 'CLASSROOM_REPORT'">활동 내역을 확인해주세요!</p>
      <p v-else class="text" id="content-text" :inner-html.prop="post.listPostContent"></p>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "hitalk-share-message",
  data() {
    return {
      postTypeName: {
        BOARD: '자유게시판',
        NOTE: '알림장',
        ALBUM: '앨범',
        HOMEWORK: '과제',
        NOTICE: '학교공지',
        ALARM: '가정통신문',
        MEAL: '급식',
        CP_BOARD: '게시글',
        CLASS_APPLY: '학교신청서',
        SHEET: '학교신청서',
        CLASSROOM_REPORT: '학급기록 리포트', //실 사용은 CLASSROOM
      }
    }
  },
  props: {
    post: Object,
    postType: String,
    schoolType: String
  },
  computed: {
    ...mapState({
      hitalkShare: 'hitalkShare',
      curClassItem: 'curClassItem'
    }),
    sharePostParent() {
      switch (this.postType) {
        case 'BOARD':
        case 'NOTE':
        case 'ALBUM':
        case 'HOMEWORK':
          return Object.keys(this.curClassItem).length > 0 ? this.curClassItem.className : this.post.parent.className
        case 'NOTICE':
        case 'ALARM':
        case 'MEAL':
          return this.post.schoolName
        case 'CP_BOARD':
          return this.post.category.name
        case 'CLASS_APPLY':
          return this.curClassItem.className
        case 'SHEET':
          return this.curClassItem.className
        case 'SURVEY':
          return `${this.post.school.schoolName} ${this.post.clazz.classGrade !== 'ANY' ? `${this.post.clazz.classGrade}학년`: ''} ${this.post.clazz.classBan}`
        default:
          return ''
      }
    },
    isNote() {
      return this.postType === 'NOTE'
    },
    isMeal() {
      return this.postType === 'MEAL'
    },
    title() {
      let title = this.post.postTitle || ''
      let posted = null

      if (this.isNote && !title) {
        posted = this.post.posted
      } else if (this.isMeal) {
        posted = this.post.postTitle
      }

      if (this.$moment(posted).isValid())
        title = this.$moment(posted).format(`M월 D일 (ddd) ${this.postTypeName[this.postType]}`)

      return title
    },

    computedPostTitle() {
      switch (this.postType) {
        case 'NOTE':
        case 'MEAL':
          return this.title
        case 'CLASS_APPLY':
        case 'SHEET':
          return this.post.title
        case 'SURVEY':
          return this.post.surveyTitle
        case 'CLASSROOM_REPORT':
          return '학생 리포트'
        default:
          return this.post.postTitle
      }
    },
  },
  methods: {
    inputHitalkShareMessage(e) {
      let val = e.target.value
      if (e.target.value.length > 3000) {
        this.$hiClass.alert('3000자 이하로만 전송가능합니다.', 'error')
        val = val.substring(0, 3000)
        e.target.value = val
      }

      this.hitalkShare.message = val
    }
  },
  mounted() {
    if (
        (this.schoolType && !['KINDERGARTEN', 'ELEMENTARY'].includes(this.schoolType)) ||
        this.post.parent?.classSchoolType === 'GROUP' || this.curClassItem?.classSchoolType === 'GROUP'
    ) {
      this.postTypeName.NOTE = '공지'
    }
  }
}
</script>

<style scoped>

</style>