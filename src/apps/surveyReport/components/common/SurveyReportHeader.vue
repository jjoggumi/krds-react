<template>
  <div class="survey__header is-fixed">
    <div class="header__inner">
      <survey-report-tab></survey-report-tab>
      <button class="btn-close" @click="closeSurveyReport"></button>
    </div>
  </div>
</template>

<script>
import SurveyReportTab from "@/apps/surveyReport/components/common/SurveyReportTab";

export default {
  name: "survey-report-header",
  components: {
    SurveyReportTab
  },
  props: {
    doNotGoBack: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    closeSurveyReport() {
      this.$emit('close')
      if(!this.doNotGoBack) this.$router.go(-1)
    }
  },
}
</script>

<style scoped>

</style>