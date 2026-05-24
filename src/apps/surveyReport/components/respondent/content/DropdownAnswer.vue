<template>
  <div>
    <survey-report-question-label
      :question="question"
      :has-question-user-answer="hasQuestionUserAnswer"
      :is-respondent-answer="true"
    >
    </survey-report-question-label>
    <survey-report-question-title :question="question"></survey-report-question-title>

    <div class="dropdown__list">
      <div
        class="dropdown__item"
        v-for="dropdownGroup in dropdownGroups"
        :key="`dropDownAnswer-${dropdownGroup.itemGroupId}`"
      >
        <strong class="text-notice">{{ dropdownGroup.itemGroupName }}</strong>
        <div class="hi-selectbox">
          <button class="selected">{{ hasQuestionUserAnswer ? selectedItem(dropdownGroup) : '선택' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";

export default {
  name: "dropdown-answer",
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
    dropdownGroups() {
      return this.question.itemGroups
    },
    // TODO 응답조회 api에 groupId 추가되면 수정
    selectedItem() {
      return (dropdownGroup) => {
        const selectItemId = this.questionUserAnswer.find(userAnswer => {
          return dropdownGroup.items.find(item => item.itemId === userAnswer.itemId)
        }).itemId

        return dropdownGroup.items.find(item => item.itemId === selectItemId).itemTitle
      }
    }
  }
}
</script>

<style scoped>

</style>