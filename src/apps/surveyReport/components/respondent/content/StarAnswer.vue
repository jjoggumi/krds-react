<template>
  <div>
    <survey-report-question-label
      :question="question"
      :has-question-user-answer="hasQuestionUserAnswer"
      :is-respondent-answer="true"
    >
    </survey-report-question-label>
    <survey-report-question-title :question="question"></survey-report-question-title>
    <div class="starbox">
      <div class="star-rating">
        <div class="score">
          <span class="num">{{
              Object.keys(selectedStar).length > 0 ?
                selectedStar.itemWeight :
                '0.0'
            }}</span>
          <span>점</span>
        </div>
        <div class="stars">
          <i
            :class="fillStar(count)"
            v-for="count in starCount"
            :key="`${question.questionId}-starAnswer-${count}`"
          >
          </i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";

export default {
  name: "star-answer",
  props: {
    question: Object,
    questionUserAnswer: Array
  },
  components: {
    SurveyReportQuestionLabel,
    SurveyReportQuestionTitle
  },
  computed: {
    hasQuestionUserAnswer() {
      return this.questionUserAnswer.length > 0 &&
        this.questionUserAnswer.some(answer => answer.answerType === 'ANSWER')
    },
    starCount() {
      return Math.ceil(this.question.items[this.question.items.length - 1].itemWeight)
    },
    selectedStar() {
      return this.hasQuestionUserAnswer ? this.question.items.find(item => item.itemId === this.questionUserAnswer[0].itemId) : {}
    },
    fillStar() {
      return (count) => {
        if (!this.hasQuestionUserAnswer) {
          return 'icon-star'
        }

        let selectedStarWeight = Math.round(this.selectedStar.itemWeight)

        if (selectedStarWeight >= count) {
          return this.selectedStar.itemWeight > count ? 'icon-star full' : 'icon-star half'
        } else {
          return 'icon-star'
        }
      }
    }
  }
}
</script>

<style scoped>

</style>