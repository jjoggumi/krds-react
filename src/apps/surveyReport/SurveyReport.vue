<template>
  <div id="wrap" class="l-page-survey-stats" v-if="isShow">
    <survey-report-header :doNotGoBack='propsSurveyId !== null' @close="$emit('close')"></survey-report-header>
    <component
      v-if="curSurveyId"
      :is="tab"
      :cur-survey-id="curSurveyId"
      :is-anonymous="isAnonymous"
      :is-used-url="isUsedUrl"
    >
    </component>
    <!--    TODO 2순위: 엑셀 다운로드, 3순위: PDF 다운로드, 인쇄 -->
    <survey-report-statistics-floating-button
      v-if="currentTab === 'STATISTICS'"
    />

    <!-- <init-answer-confirm-modal v-if="isShowInitAnswerModal"/> -->
  </div>
</template>

<script>
import SurveyReportHeader from "@/apps/surveyReport/components/common/SurveyReportHeader";
import SurveyReportStatistics from "@/apps/surveyReport/components/statistics/SurveyReportStatistics";
import SurveyReportAnswerData from "@/apps/surveyReport/components/answerData/SurveyReportAnswerData";
import SurveyReportRespondent from "@/apps/surveyReport/components/respondent/SurveyReportRespondent";
import SurveyReportStatisticsFloatingButton from "@/apps/surveyReport/components/statistics/SurveyReportStatisticsFloatingButton";
// import InitAnswerConfirmModal from "@/apps/surveyReport/components/respondent/modal/InitAnswerConfirmModal";
import {mapActions, mapState} from "vuex";

export default {
  name: "survey-report",
  data() {
    return {
      isShow: false,
      user: [],
      popStateConsumer: () => this.$emit('close')
    }
  },
  props: {
    propsSurveyId: {
      type: String,
      default: null
    }
  },
  components: {
    SurveyReportHeader,
    SurveyReportStatistics,
    SurveyReportAnswerData,
    SurveyReportRespondent,
    SurveyReportStatisticsFloatingButton,
    // InitAnswerConfirmModal
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport'
    }),
    curSurveyId() {
      return this.surveyReport.curSurveyId
    },
    currentTab() {
      return this.surveyReport.currentTab
    },
    isAnonymous() {
      return this.surveyReport.curSurveyReportInfo.anonymous
    },
    isUsedUrl() {
      return this.surveyReport.curSurveyReportInfo.usedUrl
    },
    tab() {
      switch (this.currentTab) {
        case "STATISTICS":
          return 'SurveyReportStatistics'
        case "ANSWERDATA":
            return 'SurveyReportReplyData'
        case "RESPONDENT":
          return 'SurveyReportRespondent'
        default:
          return 'SurveyReportStatistics'
      }
    },
    // isShowInitAnswerModal() {
    //   return this.surveyReport.respondent.initAnswerModalIsOpen
    // }
  },
  methods: {
    ...mapActions({
      initInfiniteScroll: 'initInfiniteScroll'
    }),
    ...mapActions('storeSurvey', {
      clearSurveyReport: 'clearSurveyReport',
      getCurSurveyReportInfo: 'getCurSurveyReportInfo',
      updateSurveyReport: 'updateSurveyReport',
      getSurveys: 'getSurveys',
      clearSurveys: 'clearSurveys'
    }),
    loginCheck() {
      const uuid = localStorage.getItem('uuid')

      if (uuid === undefined || uuid === null) {
        return false
      }

      this.$axios({
        method: 'get',
        url: '/users/' + uuid
      }).then(res => {
        const userInfo = res.data
        if (userInfo.userStatus === 'ACTIVATE') {
          this.setUser(userInfo)
        }
      })
    },
    setUser(user) {
      const userUri = user._links.self.href
      const userType = user.userType

      // 회원정보 local 저장
      user.userUri = userUri

      // 회원정보 갱신 시 반응형 데이터 유지
      if (this.user.currentId) {
        for (const key of Object.keys(this.user))
          this.user[key] = user[key]
      } else {
        this.user = user
      }

      // 회원정보 store 저장
      this.$store.commit('setUserUri', userUri)
      this.$store.commit('setUserType', userType)
      this.$store.commit('setUser', user)
    },
  },
  created() {
    this.loginCheck()

    const surveyId = this.propsSurveyId || this.$route.params.surveyId
    const payload = {
      surveyId: surveyId
    }
    this.updateSurveyReport(payload).then(res => {
      this.getCurSurveyReportInfo(payload)
        .then(res => {
          this.getSurveys({surveyId: surveyId})
          this.isShow = true
        })
        .catch(err => this.isShow = false)
    }).catch(err => {
      console.error('getCurSurveyReportInfo error', err)
    })
    this.initInfiniteScroll()

  },
  mounted() {
    history.pushState(null, null, location.href)
    window.addEventListener('popstate', this.popStateConsumer, {once: true})
  },
  unmounted() {
    window.removeEventListener('popstate', this.popStateConsumer)
  },
  beforeDestroy() {
    this.clearSurveyReport()
    this.clearSurveys()
  }
}
</script>

<style scoped>

</style>