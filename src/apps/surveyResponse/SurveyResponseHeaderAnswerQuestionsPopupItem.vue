<template>
  <div
    class="pagination__item"
    role="button"
    @click="onClickItem"
  >
    <span
      class="status"
      :class="{
        complete: question.answerType === 'ANSWER' ? true : '',
        // reconfirm: true
      }"
    >
      {{ question.answerType === 'ANSWER' ? '응답완료' : '' }}
    </span>
    <p class="question">
      {{ titlePrefix }} {{ questionTitle }}
    </p>
  </div>
</template>
<!-- TODO: 헤더탭으로 이동시 임시저장  This may cause an update error에러 해결-->
<script>
import {mapActions} from "vuex";

export default {
  name: "survey-response-header-answer-questions-popup-item",
  props: {
    question: {
      type: Object
    }
  },
  computed: {
    isRequired() {
      return this.question.isRequired
    },
    titlePrefix() {
      return this.isRequired
        ? '필수) '
        : '선택) '
    },
    questionTitle() {
      return this.question.questionTitle
    },
  },
  methods: {
    ...mapActions('storeSurvey', {
      goAnswerPageByPageId: 'goAnswerPageByPageId',
      checkValidation: 'checkValidation'
    }),
    onClickItem() {
      const payload = {
        type: 'pageId',
        pageId: this.question.pageId,
        isValidateIgnore: true
      }
      this.checkValidation(payload)
      this.$emit('popup-close')
    }
  }
}
</script>

<style scoped>

</style>