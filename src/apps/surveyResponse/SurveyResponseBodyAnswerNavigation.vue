<template>
  <div class="column-bottom">
    <div v-if="!afterSchoolStatus && !consultationStatus" class="group-btn txt-right">
      <button
        v-if="prevAnswerPageId"
        class="hi-btn btn-prev"
        @click="movePage('prev')"
      >
        이전
      </button>
      <button
        v-if="nextAnswerPageId && !surveyAnswerFinish"
        class="hi-btn btn-next"
        @click="movePage"
      >
        다음
      </button>
      <button
        v-if="!nextAnswerPageId || surveyAnswerFinish"
        class="hi-btn btn-submit"
        @click="onSubmit"
      >
        {{ isSimulation ? '종료하기' : '제출하기' }}
      </button> <!-- 마지막 문항에 노출 -->
    </div>
    <!-- 학부모 상담 -->
    <div v-if="consultationStatus" class="group-btn txt-right">
      <button
        v-if="prevAnswerPageId || consultationStatus === 'resultPage'"
        class="hi-btn btn-prev"
        @click="consultationPrevPage"
      >
        이전
      </button>
      <button
        v-if="consultationStatus === 'resultPage'"
        class="hi-btn btn-next"
        @click="consultationClose"
      >
        {{
          isSimulation ? '종료하기' : '확인'
        }}
      </button>
      <button
        v-if="consultationStatus === 'submitPage'"
        class="hi-btn btn-submit"
        @click="updateConsultation"
      >
        {{
          surveyStatus === 'COMPLETE' ? '신청변경' : '신청'
        }}
      </button> <!-- 마지막 문항에 노출 -->
    </div>
    <!-- 방과후 학습신청 -->
    <div v-if="afterSchoolStatus" class="group-btn txt-right">
      <button
        v-if="prevAnswerPageId || afterSchoolStatus === 'finish'"
        class="hi-btn btn-prev"
        @click="afterSchoolPrevPage"
      >
        이전
      </button>
      <button
        v-if="afterSchoolStatus === 'next'"
        class="hi-btn btn-next"
        @click="afterSchoolMovePage"
      >
        다음
      </button>
      <button
        v-if="afterSchoolStatus === 'finish'"
        class="hi-btn btn-next"
        @click="afterSchoolMovePage"
      >
        {{ isSimulation ? '종료하기' : '확인' }}
      </button>
    </div>
  </div>

</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {isEmpty} from "lodash";
import {eventBus} from "@/main";

export default {
  name: "survey-response-body-answer-navigation",
  computed: {
    ...mapState('storeSurvey', {
      selectedItemIds: 'selectedItemIds',
      isSimulation: 'isSimulation',
      surveyAnswerFinish: 'surveyAnswerFinish',
      afterSchoolStatus: 'afterSchoolStatus',
      consultationStatus: 'consultationStatus',
    }),
    ...mapGetters('storeSurvey', {
      curAnswerPageIndex: 'curAnswerPageIndex',
      prevAnswerPageId: 'prevAnswerPageId',
      nextAnswerPageId: 'nextAnswerPageId',
      curPageRequiredQuestionIds: 'curPageRequiredQuestionIds',
    }),
    surveys() {
      return this.$store.state.storeSurvey.surveys
    },
    surveyContents() {
      return this.$store.state.storeSurvey.surveyContents
    },
    disabledNextPage() {
      return this.selectedItemIds.length < this.curPageRequiredQuestionIds.length
    },
    surveyAnswer() {
      return this.$store.state.storeSurvey.curSurveyAnswer
    }
  },
  watch: {
    curAnswerPageIndex() {
      this.answerLinkPage = {}
      this.changeLinkPage = {}
      this.questionType = this.curQuestionsByPageId()[0].questionType
      setTimeout(() => {
        this.setLinkPage('answer')
      })
    },
    surveyAnswer(v) {
      this.surveyStatus = v.answerStatus
    },
    linkPage(v) {}
  },
  data() {
    return {
      questionType: '',
      deleteCount: 0,
      surveyStatus: '',
      subjectiveDisabled: false,
      linkPage: '',
      answerLinkPage: {},
      changeLinkPage: {}
    }
  },
  beforeDestroy() {
    this.setAfterSchoolStatus('')
  },
  mounted() {
    if (this.surveys.fromComplete) {
      this.getSurveysRespondentInfo().then((res) => {
        this.getSurveyAnswer().then(() => {
          const routeObj = {
            path: this.$route.path,
          }
          if (res.respondentId) {
            routeObj.query = {respondentId: res.respondentId}
            this.$router.push(routeObj, () => {
            })
          }
        })
      })
    }
    //학부모상담 신청은 1페이지에 1개만 들어감
    this.questionType = this.curQuestionsByPageId()[0].questionType
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setAfterSchoolStatus: 'setAfterSchoolStatus',
      setConsultationStatus: 'setConsultationStatus',
      setSurveyAnswerPageId: 'setSurveyAnswerPageId',
      setRespondentId: 'setRespondentId'
    }),
    ...mapActions('storeSurvey', {
      getSurveyAnswer: 'getSurveyAnswer',
      getCompleteAnswersList: 'getCompleteAnswersList',
      getSurveysRespondentInfo: 'getSurveysRespondentInfo',
      goRouteSurveyList: 'goRouteSurveyList',
      checkValidation: 'checkValidation',
      doSubmitAnswer: 'doSubmitAnswer',
      updateServed: 'updateServed',
      deleteSurveyAnswerPage: 'deleteSurveyAnswerPage',
      goNextAnswerPage: 'goNextAnswerPage'
    }),
    ...mapGetters('storeSurvey', {
      curQuestionsByPageId: 'curQuestionsByPageId',
      curSurveyAnswer: 'curSurveyAnswer',
      curAnswerPage: 'curAnswerPage',
      curQuestionsList: 'curQuestionsList',
      curAllQuestions: 'curAllQuestions'
    }),
    getPrevPageId() {
      const pageId = this.curAnswerPage().pageId
      const pageIdList = this.curQuestionsList().pageId
      const pageIndex = pageIdList.findIndex(list => {
        return list === pageId
      })
      return pageIdList[pageIndex - 1]
    },
    movePage(type = '') {
      const params = {
        disabled: this.disabledNextPage,
        type
      }
      if (type === 'prev') {
        params.type = 'pageId'
        params.pageId = this.getPrevPageId()
      } else {
        this.setLinkPage('change')
        if(this.changeLinkPage.linkPageId) {
          params.linkPageId = this.changeLinkPage.linkPageId
        }
        if(this.answerLinkPage.linkPageId && this.answerLinkPage.linkPageId !== this.changeLinkPage.linkPageId) {
          //기존 링크페이지응답값 변경시 설문응답한 뒷페이지 삭제
          params.resetPageId = this.changeLinkPage.pageId
        }
      }
      this.checkValidation(params)
    },
    setLinkPage(type) {
      if(this.curAnswerPage()) {
        const pageLinkPageId = this.curAnswerPage().linkPageId
        const pageObj = {
          linkPageId: pageLinkPageId,
          pageId: this.curAnswerPage().pageId
        }
        if (pageLinkPageId && type === 'change') {
          this.changeLinkPage = pageObj
        }

        this.curQuestionsByPageId().forEach((question) => {
          if (!isEmpty(question.selected) && question.selected.length === 1 && question.selected[0].linkPageId) {
            let obj = {linkPageId: question.selected[0].linkPageId, pageId: question.pageId}
            type === 'change' ? this.changeLinkPage = obj : this.answerLinkPage = obj
          }
        })
      }
    },
    onSubmit() {
      this.movePage('submit')
    },
    consultationPrevPage() {
      this.setConsultationStatus('submitPage')
      setTimeout(() => {
        if (this.consultationStatus === 'submitPage') {
          this.setSurveyAnswerPageId(this.getPrevPageId())
        } else {
          this.setConsultationStatus('submitPage')
        }
      })
    },
    updateConsultation() {
      if (this.isSimulation) {
        this.setConsultationStatus('resultPage')
      } else {
        this.updateServed({}).then((res) => {
          if(res.data.errorCode) {
            this.$hiClass.alert('신청이 불가능한 시간입니다. 다시 선택해주세요.')
          } else {
            this.setRespondentId(res.data.respondentId)
            this.onSubmit()
          }
        })
      }
    },
    afterSchoolPrevPage() {
      if (this.afterSchoolStatus === 'next') {
        this.setSurveyAnswerPageId(this.getPrevPageId())
      } else {
        this.setAfterSchoolStatus('next')
      }
    },
    consultationClose() {
      if (this.isSimulation) {
        this.onSubmit()
      } else {
        this.doSubmitAnswer()
      }
    },
    afterSchoolMovePage() {
      if (this.isSimulation) {
        this.onSubmit()
      } else {
        const params = {
          respondentId: this.$route.query.respondentId,
          questionType: 'after-school-answers'
        }
        this.getCompleteAnswersList(params).then((res) => {
          if (isEmpty(res)) {
            this.$hiClass.confirm(`방과후 신청 내역이 없습니다.<br>설문을 종료하시겠습니까?`)
              .then(() => {
                this.goRouteSurveyList()
              })
              .catch(() => {})
          } else {
            this.doSubmitAnswer()
          }
        })
      }
    }
  }
}
</script>