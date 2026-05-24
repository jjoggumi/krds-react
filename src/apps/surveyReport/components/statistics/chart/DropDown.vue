<template>
  <div class="survey-create__box">
    <survey-report-question-label :question="question"></survey-report-question-label>
    <survey-report-question-title :question="question"></survey-report-question-title>
    <div class="survey__stats">
      <div class="statsbox barchart">
        <template v-for="questionItem in questionItemList">
          <strong class="text-notice" :key="`dropDown-${questionItem.itemGroupId}`">{{ questionItem.itemGroupTitle }}</strong>
          <bar-graph
            :key="`dropDown-barGraph-${questionItem.itemGroupId}`"
            :question="question"
            :question-item-list="questionItem.itemList"
            :question-type="questionType"
            :is-anonymous="isAnonymous"
            :is-mobile="isMobile"
          >
          </bar-graph>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import BarGraph from "@/apps/surveyReport/components/statistics/chart/BarGraph";
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";

export default {
  name: "drop-down",
  components: {
    BarGraph,
    SurveyReportQuestionLabel,
    SurveyReportQuestionTitle
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