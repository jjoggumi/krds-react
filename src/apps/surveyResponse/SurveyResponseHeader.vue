<template>
  <component
    v-if="isVisibleHeader"
    :is="componentName"
    :doNotGoBack="doNotGoBack"
    @close="$emit('close')"
  ></component>
</template>

<script>
import {mapState} from "vuex";

import INTRO from "@/apps/surveyResponse/SurveyResponseHeaderIntro";
import FORM from "@/apps/surveyResponse/SurveyResponseHeaderAnswer";
import ANSWER from "@/apps/surveyResponse/SurveyResponseHeaderAnswer";
import COMPLETE from "@/apps/surveyResponse/SurveyResponseHeaderComplete";


export default {
  name: "survey-response-header",
  components: {
    INTRO,
    FORM,
    ANSWER,
    COMPLETE
  },
  props: {
    doNotGoBack: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyResponseBodyName: 'surveyResponseBodyName'
    }),
    isVisibleHeader() {
      return ['INTRO', 'FORM', 'ANSWER', 'COMPLETE'].includes(this.componentName)
    },
    componentName() {
      return this.surveyResponseBodyName
    }
  }
}
</script>

<style scoped>

</style>