<template>
  <div
    :key="surveyEditQuestions.questionId"
    class="column-content"
  >
    <consultation-guide-popup v-if="isConsultation"/>
    <component
      :is="surveyEditQuestions.questionType"
      :key="`survey-create-body-question-${surveyEditQuestions.questionType}-${componentKey}`"
    />

    <survey-create-body-question-rnb />
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";

import SurveyCreateBodyQuestionRnb from "@/apps/surveyCreate/SurveyCreateBodyQuestionRnb";
import CHOICE from "@/apps/surveyCreate/questionType/Choice";
import SUBJECTIVE from "@/apps/surveyCreate/questionType/Subjective";
import SIGN from "@/apps/surveyCreate/questionType/Sign";
import AFTER_SCHOOL from "@/apps/surveyCreate/questionType/AfterSchool.vue";
import CONSULTATION from "@/apps/surveyCreate/questionType/Consultation.vue";
import ConsultationGuidePopup from "@/apps/surveyCreate/questionType/ConsultationGuidePopup";

export default {
  name: "survey-create-body-question",
  components: {
    CONSULTATION,
    AFTER_SCHOOL,
    SIGN,
    SUBJECTIVE,
    CHOICE,
    SurveyCreateBodyQuestionRnb,
    ConsultationGuidePopup
  },
  data() {
    return {
      componentKey: 0
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyEditQuestions: 'surveyEditQuestions',
      curSurveyEdit: 'curSurveyEdit'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    isConsultation() {
      return this.curSurveyEdit.surveyType === this.CONSTANTS.SURVEY_TYPE.CONSULTATION
    }
  },
  watch: {
    'surveyEditQuestions.questionType'() {
      ++this.componentKey
    }
  },
  methods: {
  },
}
</script>

<style scoped>

</style>