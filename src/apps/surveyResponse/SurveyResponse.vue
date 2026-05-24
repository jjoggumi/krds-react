<template>
  <survey-response-loading-body v-if="isLoading"/>
  <div id="wrap" class="l-page-survey-responsive" v-else>
    <!-- APP화면 미리보기 -->
    <div class="hi-modal-common modal-app-preview" v-if="appView" style="display: block;">
      <div class="modal__dim"></div>
      <div class="modal__top">
        <button class="btn-close" @click="onClickAppView"></button>
      </div>
      <div class="modal__app">
        <div class="app__content">
          <survey-response-header />

          <survey-response-body v-if="hasSurveys"/>
        </div>
      </div>
    </div>
    <!--     //APP화면 미리보기 -->
    <survey-response-header v-if="!appView" :doNotGoBack='propsSurveyId !== null' @close="$emit('close')"/>

    <survey-response-body v-if="hasSurveys && !appView"/>

    <div
      class="survey__floating is-fixed"
      v-if="surveyResponseBodyName === 'INTRO' && isSimulation"
    >
      <div class="floating__inner">
        <div class="group-btn" v-if="!appView">
          <button class="btn-app" @click="onClickAppView">APP 화면<br>미리보기</button>
        </div>
      </div>
    </div>
    <survey-answer-complete-modal :survey-id="surveyId" v-if="$store.state.storeSurvey.completePopup.flag" />
  </div>

</template>

<script>
import SurveyResponseHeader from "@/apps/surveyResponse/SurveyResponseHeader";
import SurveyResponseBody from "@/apps/surveyResponse/SurveyResponseBody";
import SurveyAnswerCompleteModal from "@/components/Modal/SurveyAnswerCompleteModal";
import SurveyResponseLoadingBody from "@/apps/surveyResponse/SurveyResponseLoadingBody";

import {mapActions, mapMutations, mapState} from "vuex";
export default {
  name: "survey-response",
  components: {SurveyResponseLoadingBody, SurveyResponseBody, SurveyResponseHeader, SurveyAnswerCompleteModal},
  props: {
    propsSurveyId: {
      type: String,
      default: null
    },
    propsPreview: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      user: [],
      surveyId: '',
      isLoading: true
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveys: 'surveys',
      surveyResponseBodyName: 'surveyResponseBodyName',
      isSimulation: 'isSimulation',
      appView: 'appView'
    }),
    hasSurveys() {
      return Object.keys(this.surveys).length > 1 // surveyId 1개만 존재하도 true
    }
  },
  created() {
    if(!this.$route.path.includes('sru')) {
      this.isLoading = false
      this.loginCheck()
    } else {
      const deviceType = navigator.userAgent.toLowerCase()
      if (deviceType.includes('android')) {
        window.location.href = `hiclassapp://hiclass.net${window.location.pathname}`
      }
      setTimeout(() => {
        this.isLoading = false
      }, 500)
    }
  },
  async mounted() {
    this.clearCurSurveyAnswer()
    this.surveyId = this.propsSurveyId || this.$route.params.surveyId
    await this.getSurveys({surveyId: this.surveyId})
    this.initSurveyResponse()
    if (this.propsIsPreview) {
      this.setIsSimulation(true)
    }
  },
  beforeDestroy() {
    setTimeout(() => {
      this.initSurveyResponse()
      this.clearSurveys()
      this.clearSurveysRespondentInfo()
      this.clearIsReject()
      this.initIsSimulation()
      this.initSurveyContents()
    }, 100)
  },
  methods: {
    ...mapActions('storeSurvey', {
      getSurveys: 'getSurveys',
      initSurveyResponse: 'initSurveyResponse',
      clearSurveys: 'clearSurveys',
      clearCurSurveyAnswer: 'clearCurSurveyAnswer',
      clearSurveysRespondentInfo: 'clearSurveysRespondentInfo',
      clearIsReject: 'clearIsReject',
      initIsSimulation: 'initIsSimulation',
      initSurveyContents: 'initSurveyContents'
    }),

    ...mapMutations('storeSurvey', {
      setAppView: 'setAppView',
      setSurveys: 'setSurveys',
      setIsSimulation: 'setIsSimulation'
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
    onClickAppView() {
      this.setAppView()
      if(!this.appView){
        this.initSurveyResponse()
      }
    }
  },
}
</script>

<style scoped>

</style>