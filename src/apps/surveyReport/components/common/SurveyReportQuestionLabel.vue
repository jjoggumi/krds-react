<template>
  <div class="group-label">
    <span class="label required" v-if="isRequired">필수응답</span>
<!--    방과후, 학부모 상담이 아니면-->
    <template v-if="!(isAfterSchool && isConsultation)">
      <span class="label" v-if="isMultipleAnswerUse && !isMultipleAnswer">단일선택</span>
      <span class="label" v-if="isMultipleAnswerUse && isMultipleAnswer">{{ answerLimit }}</span>
    </template>
    <template v-if="isAfterSchool">
      <span class="label" v-if="question.answerLimit">방과후 신청 {{ question.answerLimit }}개 선택</span>
      <span class="label" v-else>방과후 신청</span>
    </template>
    <span class="label" v-if="isConsultation">학부모상담</span>
    <span class="label none" v-if="!hasQuestionUserAnswer && isRespondentAnswer">미 응답</span>
  </div>
</template>

<script>
export default {
  name: "survey-report-question-label",
  props: {
    question: Object,
    hasQuestionUserAnswer: Boolean,
    isRespondentAnswer: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isRequired() {
      return this.question.isRequired
    },
    isMultipleAnswer() {
      return this.question.isMultipleAnswer
    },
    isMultipleAnswerUse() {
      switch (this.question.questionType) {
        case 'CHOICE':
          return true
        default:
          return false
      }
    },
    isAfterSchool() {
      return this.question.questionType === 'AFTER_SCHOOL'
    },
    isConsultation() {
      return this.question.questionType === 'CONSULTATION'
    },
    answerLimit() {
      return this.question.answerLimit === null ? '제한없음' : `복수선택 ${this.question.answerLimit}개`
    }
  },
}
</script>

<style scoped>

</style>