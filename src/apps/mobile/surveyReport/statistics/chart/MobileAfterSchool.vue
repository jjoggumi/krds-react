<template>
  <div class="survey-create__box">
    <survey-report-question-label :question="question"></survey-report-question-label>
    <survey-report-question-title :question="question"></survey-report-question-title>
    <survey-report-question-description
      v-if="question.questionDescription"
      :question-description="question.questionDescription"
    />

    <div class="fcfs__list">
      <after-school-item
        v-for="item of itemList"
        :key="item.itemId"
        :after-school-item="item"
        :is-mobile="isMobile"
        :question="question"
        :cur-survey-id="curSurveyId"
      >
      </after-school-item>
    </div>
  </div>
</template>

<script>
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";
import SurveyReportQuestionDescription from "@/apps/surveyReport/components/common/SurveyReportQuestionDescription";
import AfterSchoolItem from "@/apps/surveyReport/components/statistics/chart/AfterSchoolItem";

export default {
  name: "MobileAfterSchool",
  components: {
    SurveyReportQuestionLabel,
    SurveyReportQuestionTitle,
    SurveyReportQuestionDescription,
    AfterSchoolItem
  },
  props: {
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
    },
    curSurveyId: {
      type: String
    }
  },
  computed: {
    itemList() {
      return this.question.itemList
    }
  },
}
</script>

<style scoped>

</style>