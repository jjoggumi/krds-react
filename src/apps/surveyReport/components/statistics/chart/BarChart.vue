<template>
  <div class="survey-create__box">
    <survey-report-question-label :question="question"></survey-report-question-label>
    <survey-report-question-title :question="question"></survey-report-question-title>
    <survey-report-question-description
      v-if="question.questionDescription"
      :question-description="question.questionDescription"
    >
    </survey-report-question-description>
    <div class="survey__stats">
      <div class="statsbox barchart">
        <bar-graph
            :question="question"
            :question-item-list="questionItemList"
            :question-type="questionType"
            :is-anonymous="isAnonymous"
            :is-mobile="isMobile"
            :cur-survey-id="curSurveyId"
        >
        </bar-graph>
      </div>
    </div>
  </div>
</template>

<script>
import BarGraph from "@/apps/surveyReport/components/statistics/chart/BarGraph";
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";
import SurveyReportQuestionDescription from "@/apps/surveyReport/components/common/SurveyReportQuestionDescription";

export default {
  name: "bar-chart",
  components: {
    BarGraph,
    SurveyReportQuestionLabel,
    SurveyReportQuestionTitle,
    SurveyReportQuestionDescription
  },
  props: {
    curSurveyId: {
      type: String
    },
    question: {
      type: Object
    },
    questionType: {
      type: String
    },
    isAnonymous: {
      type: Boolean
    },
    isUsedUrl: {
      type: Boolean
    },
    isMobile: {
      type: Boolean
    }
  },
  computed: {
    questionItemList() {
      return this.question.itemList
    }
  }
}
</script>

<style scoped>

</style>