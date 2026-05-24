<template>
  <component
    :is="curForm"
    :is-anonymous="isAnonymous"
    v-if="isShow"
  >
  </component>
</template>

<script>
import Statistics from "@/apps/mobile/surveyReport/statistics/MobileSurveyReportStatistics";
import StatisticsRespondent from "@/apps/mobile/surveyReport/statistics/MobileSurveyReportStatisticsRespondent";
import AfterSchoolApplicant from "@/apps/mobile/surveyReport/statistics/chart/MobileAfterSchoolApplicantList";
import {mapActions, mapState} from "vuex";

export default {
  name: "mobile-survey-report",
  components: {
    Statistics,
    StatisticsRespondent,
    AfterSchoolApplicant
  },
  data() {
    return {
      curForm: '',
      isShow: false
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport',
    }),
    isAnonymous() {
      return this.surveyReport.curSurveyReportInfo.anonymous
    }
  },
  watch: {
    $route() {
      this.setComponent();
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      getCurSurveyReportInfo: 'getCurSurveyReportInfo',
      updateSurveyReport: 'updateSurveyReport'
    }),
    setQuery(keys) {
      for (const key of keys) {
        if (this.$route.query[key] !== undefined)
          localStorage.setItem(key, this.$route.query[key])
      }
    },
    setComponent() {
      const questionId = this.$route.params.questionId;
      const type = this.$route.query.type;

      if (questionId === undefined) {
        this.curForm = 'Statistics'
      } else {
        if (type === 'respondent') {
          this.curForm = 'StatisticsRespondent'
        } else if (type === 'afterSchool') {
          this.curForm = 'AfterSchoolApplicant'
        }

      }

      document.title = "MobileSurveyReport-" + this.curForm
    }
  },
  created() {
    const keys = ['uuid', 'idToken']
    this.setQuery(keys)

    const surveyId = this.$route.params.surveyId
    const payload = {
      surveyId: surveyId
    }

    this.updateSurveyReport(payload).then(res => {
      this.getCurSurveyReportInfo(payload)
        .then(res => this.isShow = true)
        .catch(err => this.isShow = false)
    }).catch(err => {
      console.error('getCurSurveyReportInfo error', err)
    })
    this.setComponent()
  }
}
</script>

<style scoped>

</style>