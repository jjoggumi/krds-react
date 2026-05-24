<template>
  <div class="survey__heading">
    <strong :class="questionTitleClassStyle">{{ questionTitle }}</strong>
  </div>
</template>

<script>
export default {
  name: "survey-report-question-title",
  props: {
    question: Object
  },
  computed: {
    questionTitleClassStyle() {
      return this.question.isDel ? 'heading-sub deleted' : 'heading-sub'
    },
    questionTitle() {
      return this.question.isDel ? `(삭제된 질문) ${this.question.questionTitle}` : this.question.questionTitle
    }
  }
}
</script>

<style scoped>

</style>