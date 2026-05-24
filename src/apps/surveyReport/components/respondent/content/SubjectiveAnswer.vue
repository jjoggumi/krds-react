<template>
  <div>
    <survey-report-question-label
      :question="question"
      :has-question-user-answer="hasQuestionUserAnswer"
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

    <textarea
        class="textareabox subjective"
        placeholder="내용을 입력해주세요."
        readonly
        v-model="subjectiveAnswer"
    >
    </textarea>
  </div>
</template>

<script>
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";
import SurveyReportQuestionDescription from "@/apps/surveyReport/components/common/SurveyReportQuestionDescription";
import SurveyReportQuestionImage from "@/apps/surveyReport/components/common/SurveyReportQuestionImage";

export default {
  name: "subjective-answer",
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
    subjectiveAnswer() {
      return this.hasQuestionUserAnswer ? this.questionUserAnswer[0].answerText : ''
    }
  }
}
</script>

<style scoped>

</style>