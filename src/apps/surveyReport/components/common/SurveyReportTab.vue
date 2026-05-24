<template>
  <div class="tab">
      <button :class="isActive('STATISTICS')" @click="changeTab('STATISTICS')">통계</button>
<!--      <button :class="isActive('ANSWERDATA')" @click="changeTab('ANSWERDATA')">응답 데이터</button>-->
      <button :class="isActive('RESPONDENT')" @click="changeTab('RESPONDENT')">응답자 개별 조회</button>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  name: "survey-report-tab",
  computed: {
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport'
    }),
    currentTab() {
      return this.surveyReport.currentTab
    },
    isActive() {
      return (clickTab) => {
        return clickTab === this.currentTab ? 'is-active' : ''
      }
    }
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setCurrentTab: 'setCurrentTab'
    }),
    ...mapActions('storeSurvey', {
      checkSurveyIsDel: 'checkSurveyIsDel'
    }),
    changeTab(clickTab) {
      this.checkSurveyIsDel(this.surveyReport.curSurveyId)
        .then(res => {
          this.setCurrentTab(clickTab)
        })
        .catch(err => {
          if (err.response.status === 404) {
            this.$hiClass.alert('삭제된 설문입니다.')
              .then(res => {
                this.$router.go(-1)
              })
          }
        })

    }
  }
}
</script>

<style scoped>

</style>