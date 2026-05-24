<template>
  <div>
    <survey-report-question-label
      :question="question"
      :has-question-user-answer="hasFiles"
      :is-respondent-answer="true"
    />
    <survey-report-question-title :question="question"/>
    <survey-report-question-description
      v-if="question.questionDescription"
      :question-description="question.questionDescription"
    />
    <survey-report-question-image
      v-if="question.files.length > 0"
      :question-files="question.files"
    />

    <div class="esignbox">
      <div class="esign">
        <div>
          <img :src="signImagePath" alt="">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";
import SurveyReportQuestionDescription from "@/apps/surveyReport/components/common/SurveyReportQuestionDescription";
import SurveyReportQuestionImage from "@/apps/surveyReport/components/common/SurveyReportQuestionImage";

export default {
  name: "sign-answer",
  props: {
    question: Object,
    questionUserAnswer: Array
  },
  components: {
    SurveyReportQuestionLabel,
    SurveyReportQuestionTitle,
    SurveyReportQuestionDescription,
    SurveyReportQuestionImage
  },
  computed: {
    hasQuestionUserAnswer() {
      return this.questionUserAnswer.length > 0 &&
        this.questionUserAnswer.some(answer => answer.answerType === 'ANSWER')
    },
    hasFiles() {
      return this.hasQuestionUserAnswer ? this.questionUserAnswer[0].files.length > 0 : false
    },
    signImagePath() {
      return this.hasFiles
        ? this.questionUserAnswer[0].files[0].fileOriginalPath
        : '/files/img/icon/esign.png'
    }
  }
}
</script>

<style scoped>

</style>