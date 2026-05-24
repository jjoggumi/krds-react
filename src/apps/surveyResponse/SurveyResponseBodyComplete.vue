<template>
  <div class="survey__complete">
    <div class="survey-complete__box">
      <h1 class="heading icon-check">설문 완료</h1>
      <p class="desc">설문을 완료하였습니다.<br />
        <span v-if="questionType !== 'CONSULTATION' && questionType !== 'AFTER_SCHOOL'">
          결과는 관리자에게만 제공됩니다.
        </span>
      </p>
      <!-- #57376 [설문 완료]
        (변경) 설문 완료 시 [설문내역 확인] 화면으로 이동하도록 변경하면서, 설문 완료 화면은 설문을 완료한 즉시 보는 1회성 화면임|
      -->
      <div class="group-btn">
        <button class="hi-btn btn-lg"
                @click="goRouteSurveyList">완료
        </button>
        <!-- <button class="hi-btn btn-lg"
                v-if="questionType === 'CONSULTATION' || questionType === 'AFTER_SCHOOL'"
        @click="onClickComplete">
          신청내역
        </button> -->
      </div>
      <!-- #57376 [다자녀로 설문하기]
        모든 설문 유형의 완료 화면에서 삭제
      -->
      <!-- <button class="btn-add-children" @click="routeSurveyRespondent">
        <strong>다른자녀로 설문하기</strong>
        <span>다른자녀로 동일 설문을 응답하실 수 있습니다.</span>
      </button> -->
    </div>
    <complete-modal
      v-if="completeModalFlag"
      :respondent-list="respondentList"
      @onClose="onCloseModal"
    />
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {isEmpty} from "lodash";
import completeModal from "@/apps/main/clazzes/survey/MainBodyClazzesBodySurveyContentsCompleteModal";

export default {
  name: "survey-response-body-complete",
  components: {completeModal},
  data() {
    return {
      respondentList : [],
      userType: '',
      isAnonymous: false,
      questionsPages: [],
      completePopup: false,
      questionType: '',
      completeModalFlag: false,
    }
  },
  computed: {
    /**
     * 설문 URL 로 설문 시작
     * @returns {boolean}
     */
    isEnteringBySurveyUrl() {
      const metaClass = this.$route.meta.class || []
      return metaClass.includes('response-type-external')
    },
  },
  async mounted() {
    await this.setPageData()
  },
  methods: {
    ...mapActions('storeSurvey', {
      getSurveys: 'getSurveys',
      goRouteSurveyList: 'goRouteSurveyList',
      getRespondentList: 'getRespondentList',
      initSurveyResponse: 'initSurveyResponse',
      getSurveyContents: 'getSurveyContents',
      clearSurveys: 'clearSurveys',
      clearSurveysRespondentInfo: 'clearSurveysRespondentInfo',
      clearIsReject: 'clearIsReject',
      initIsSimulation: 'initIsSimulation',
      clearCurSurveyAnswer: 'clearCurSurveyAnswer',
    }),
    ...mapState('storeSurvey', {
      surveys: 'surveys'
    }),
    ...mapMutations('storeSurvey', {
      setCompletePopup: 'setCompletePopup',
      setSurveyResponseBodyName: 'setSurveyResponseBodyName',
      setSurveys: 'setSurveys',
      setRespondentId: 'setRespondentId'
    }),
    async onClickComplete() {
      if (this.respondentList.length === 1) {
        this.onCloseModal(this.respondentList[0])
      } else if(this.respondentList.length === 0){
        this.setCompletePopup({
          flag: true,
          respondentId: '',
          questionType: this.questionType,
          item: {}
        })
      } else {
        this.completeModalFlag = true
      }
    },
    onCloseModal(item) {
      this.completeModalFlag = false
      if(item) {
        setTimeout(() => {
          this.setCompletePopup({
            flag: true,
            respondentId: item.respondentId,
            questionType: this.questionType,
            item
          }, 100)
        })
      }
    },
    async setPageData() {
      const param = {
        surveyId: this.$route.params.surveyId,
        isEnteringBySurveyUrl: this.isEnteringBySurveyUrl
      }
      if (this.isEnteringBySurveyUrl) {
        if(this.$route.query.respondentId){
          param.respondentId = this.$route.query.respondentId
          this.setRespondentId(this.$route.query.respondentId)
        } else {
          param.respondentId = this.$store.state.storeSurvey.respondentId
        }
      }
      this.respondentList = await this.getRespondentList(param)
      this.userType = this.respondentList[this.respondentList.length - 1].userType
      this.isAnonymous = this.surveys().isAnonymous

      const contents = await this.getSurveyContents(param)
      this.questionsPages = contents.pages
      if (!isEmpty(this.questionsPages)) {
        this.questionsPages.forEach(page => {
          page.questions.forEach(question => {
            if (question.questionType === "CONSULTATION" || question.questionType === "AFTER_SCHOOL") {
              this.completePopup = true
              this.questionType = question.questionType
            }
          })
        })
      }
    },
    // respondentNameHtml(item) {
    //   const subjectName = item.subjectName
    //   const respondentName = item.respondentName ? item.respondentName : '익명'
    //   let html = `${respondentName}`
    //   if(!item.respondentName) return html
    //   const type = item.userType === 'PARENTS' ? '학부모' :
    //     item.userType === 'TEACHER' ? '선생님' :
    //       item.userType === 'STUDENT' ? '학생' : null
    //
    //   if (item.userType === 'TEACHER') {
    //     html = `${html} ${type}`
    //     if (subjectName) {
    //       html = `${html} (${subjectName})`
    //     }
    //   } else {
    //     html = `${subjectName} ${type ? type : ''} (${respondentName})`
    //   }
    //   return html
    // },
    async routeSurveyRespondent() {

      this.initSurveyResponse()
      this.clearSurveys()
      this.clearSurveysRespondentInfo()
      this.clearIsReject()
      this.initIsSimulation()
      this.clearCurSurveyAnswer()

      setTimeout(()=>{
        const query = Object.assign({}, this.$route.query);
        if(!isEmpty(query)){
          delete query.respondentId
          this.$router.replace({ query })
        }

        const payload = {surveyId: this.$route.params.surveyId}
        this.getSurveys(payload).then(res => {
          res.answerStatus = "WAIT"
          res.fromComplete = true

          this.setSurveys(res)
          this.setSurveyResponseBodyName('INTRO')
        })
      })
    }
  }
}
</script>

<style scoped>

</style>