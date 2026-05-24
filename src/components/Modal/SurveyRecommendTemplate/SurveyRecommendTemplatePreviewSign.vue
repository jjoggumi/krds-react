<template>
  <div>
    <survey-report-question-label :question="question"></survey-report-question-label>
    <survey-report-question-title :question="question"></survey-report-question-title>
    <div class="esignbox">
      <div class="esign">
        <div>
          <img :src="signImagePath" alt="">
        </div>
      </div>
    </div>
    <span v-if="this.index !== this.questions.length-1" class="groupbar"></span>
  </div>
</template>

<script>
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";

export default {
  name: "survey-recommend-template-preview-sign",
  components: {
    SurveyReportQuestionLabel,
    SurveyReportQuestionTitle
  },
  props: {
    question: {
      type: Object,
      required: true
    },
    questions: {
      type: Array,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    isRecommendTemplate: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    signImagePath() {
      return '/files/img/icon/esign.png'
    }
  }
}
</script>

<style scoped>

</style>