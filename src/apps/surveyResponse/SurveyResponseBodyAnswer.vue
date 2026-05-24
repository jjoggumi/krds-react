<template>
  <div
    v-if="isShowSurveyQuestion"
    class="survey__content"
  >
    <div class="column-content">
      <div class="survey-view__content">
        <div class="survey-create__box">
          <component
            v-for="(question, index) of questions"
            :is="question.questionType"
            :key="`${question.questionId}-${index}`"
            :index="index"
            :question="question"
            :questions="questions"
          ></component>
        </div>
      </div>
    </div>

    <survey-response-body-answer-navigation />
  </div>

  <main-loading-new-tab-dim
    v-else
  />
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";

import MainLoadingNewTabDim from "@/apps/main/MainLoadingNewTabDim";
import SurveyResponseBodyAnswerNavigation from "@/apps/surveyResponse/SurveyResponseBodyAnswerNavigation";

import CHOICE from "@/apps/surveyResponse/questionType/Choice";
import SUBJECTIVE from "@/apps/surveyResponse/questionType/Subjective";
import SIGN from "@/apps/surveyResponse/questionType/Sign";
import CONSULTATION from "@/apps/surveyResponse/questionType/Consultation";
import AFTER_SCHOOL from "@/apps/surveyResponse/questionType/AfterSchool";

import {isEmpty} from "lodash";

export default {
  name: "survey-response-body-answer",
  components: {
    SurveyResponseBodyAnswerNavigation,
    MainLoadingNewTabDim,
    CHOICE,
    SUBJECTIVE,
    SIGN,
    CONSULTATION,
    AFTER_SCHOOL
  },
  computed: {
    ...mapState('storeSurvey', {
      surveys: 'surveys',
      surveyContents: 'surveyContents',
      isSimulation: 'isSimulation'
    }),
    ...mapGetters('storeSurvey', {
      curQuestionsByPageId: 'curQuestionsByPageId'
    }),
    isShowSurveyQuestion() {
      return this.questions.length > 0
    },
    questions() {
      return this.curQuestionsByPageId || []
    }
  },
  async mounted() {
    const mode = this.$route.query.mode ? this.$route.query.mode : null
    //linkPage 초기화
    this.setLinkPageId('')
    // 설문 전체 내용 조회
    const params = { surveyId: this.surveys.surveyId }
    if (this.$route.query.surveyStatus) {
      params.surveyStatus = this.$route.query.surveyStatus
    } else if (this.$route.query.isEditData) {
      // 설문 편집 데이터 요청
      params.isEditData = this.$route.query.isEditData
    }
    const resource = await this.getSurveyContents(params)

    // 응답 전체 목록 최초 가져오기
    if (!this.isSimulation) {
      try {
        await this.getSurveyAnswer()
        if (this.$store.state.storeSurvey.curSurveyAnswer.answerStatus === 'COMPLETE'
          && this.$route.query.bodyName !== 'ANSWER'
          && !mode) {
          this.changeSurveyResponseBody('COMPLETE')
          const routeObj = {
            path: this.$route.path
          }
          routeObj.query = {respondentId: this.$store.state.storeSurvey.respondentId}
          this.$router.push(routeObj, () => {
          })
          return
        }
      }  catch (e) {
        this.$log.debug(error)
      }
    }
    this.$route.query.mode = ''
    this.setPage(resource)
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setSurveyAnswerPageId: 'setSurveyAnswerPageId',
      setLinkPageId: 'setLinkPageId'
    }),
    ...mapActions('storeSurvey', {
      clearCurSurveyAnswer: 'clearCurSurveyAnswer',
      getSurveyContents: 'getSurveyContents',
      getSurveyAnswer: 'getSurveyAnswer',
      changeSurveyResponseBody: 'changeSurveyResponseBody',
      deleteSurveyAnswer: 'deleteSurveyAnswer'
    }),
    ...mapGetters('storeSurvey', {
      curSurveyPageQuestionNumber: 'curSurveyPageQuestionNumber',
      curSurveyAnswer: 'curSurveyAnswer',
      curAnswerPageIndex: 'curAnswerPageIndex'
    }),
    setPage(contents) {
      let pages = []
      // 첫 페이지 세팅
      let pageId = contents['pages'][0].pageId
      if (!isEmpty(this.curSurveyAnswer().answers) && !this.$store.state.storeSurvey.isSimulation) {
        if(this.curSurveyAnswer().answers[0].editedTimestamp !== contents.editedTimestamp) {
          const surveyType = this.$store.state.storeSurvey.surveyContents.surveyType
          // if(surveyType !== "CONSULTATION" && surveyType !== "AFTER_SCHOOL") {
          //   this.clearCurSurveyAnswer()
          // }

          const message = surveyType === "AFTER_SCHOOL" ? `설문이 변경되었습니다.<br>다시 응답해주세요.` : `설문이 변경되었습니다.<br>처음부터 다시 응답해주세요.`
          // #54486 [WEB] 응답 중 > 설문 수정되었을 때 노출되는 알럿 수정
          this.$hiClass.alert(message)
            .then(() => {
              if (surveyType !== "CONSULTATION" && surveyType !== "AFTER_SCHOOL") {
                this.clearCurSurveyAnswer()
                this.deleteSurveyAnswer().then(() => {
                  this.setSurveyAnswerPageId(contents['pages'][0].pageId)
                })
              } else {
                this.getSurveyAnswer().then(() => {
                  this.setSurveyAnswerPageId(contents['pages'][0].pageId)
                })
              }
            })
        } else {
          pages = contents.pages
          const questionId = this.curSurveyAnswer().answers[this.curSurveyAnswer().answers.length - 1].questionId
          const surveyType = this.$store.state.storeSurvey.surveys.surveyType
          pages.forEach((item) => {
            item.questions.forEach((question) => {
              if (questionId === question.questionId) {
                pageId = question.pageId
              }
            })
          })
          this.setSurveyAnswerPageId(pageId)
          const confirmMessage = '진행중인 설문이 있습니다.<br>이어서 계속 합니다.'
          // 진행중 설문 = 임시저장일때랑 , 문제가 2개이상일때 
          if (contents['pages'].length > 1 && this.curSurveyAnswer().answerStatus === 'TEMPORARY') {
            const opts = {
              reverseButtons: true,
              cancelButtonText: '1번째 문제로 이동'
            }
            this.$hiClass.confirm(confirmMessage, null, opts)
              .catch(err => {
                if (err.dismiss === 'cancel') {
                  this.setSurveyAnswerPageId(contents['pages'][0].pageId)
                }
              })
          }
        }
      }
      this.setSurveyAnswerPageId(pageId)
    }
  }
}
</script>

<style scoped>

</style>