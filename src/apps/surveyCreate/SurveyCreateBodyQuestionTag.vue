<template>
  <div class="group-label">
    <span
      v-if="surveyEditQuestions.isRequired"
      class="label required"
    >
      필수응답
    </span>
    <span class="label">
      {{ questionTypeName }} {{ answerLimitTitle }}
    </span>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";

export default {
  name: "survey-create-body-question-tag",
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    ...mapState('storeSurvey', {
      surveyEditQuestions: 'surveyEditQuestions'
    }),
    isVisibleAnswerLimitTitle() {
      const visibleQuestionTypes = [
        this.CONSTANTS.QUESTION_TYPE.CHOICE,
        this.CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL,
      ]
      return visibleQuestionTypes.includes(this.surveyEditQuestions.questionType)
    },
    questionTypeName() {
      return this.CONSTANTS.QUESTION_TYPE_NAME[this.surveyEditQuestions.questionType] || '?'
    },
    answerLimitTitle() {
      if (!this.isVisibleAnswerLimitTitle) {
        return ''
      }

      const isMultipleAnswer = this.surveyEditQuestions.isMultipleAnswer
      const answerLimit = this.surveyEditQuestions.answerLimit
      let title

      if (isMultipleAnswer) {
        switch (answerLimit) {
          case null:
          case undefined: {
            title = '제한없음'
            break
          }
          default: {
            title = `복수 선택 ${answerLimit}개`
          }
        }
      } else {
        title = '단일 선택'
      }

      return title
    }
  },
  mounted() {
  },
}
</script>

<style scoped>

</style>