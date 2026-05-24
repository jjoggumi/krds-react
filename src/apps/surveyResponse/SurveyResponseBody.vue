<template>

  <component :is="surveyResponseBodyName">
  </component>

</template>

<script>
import {mapState} from "vuex";

import INTRO from "@/apps/surveyResponse/SurveyResponseBodyIntro";
import FORM from "@/apps/surveyResponse/SurveyResponseBodyRespondentInfo";
import ANSWER from "@/apps/surveyResponse/SurveyResponseBodyAnswer";
import COMPLETE from "@/apps/surveyResponse/SurveyResponseBodyComplete";

export default {
  name: "survey-response-body",
  components: {
    INTRO,
    FORM,
    ANSWER,
    COMPLETE,
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyResponseBodyName: 'surveyResponseBodyName'
    }),
  }
}
</script>

<style scoped>

</style>