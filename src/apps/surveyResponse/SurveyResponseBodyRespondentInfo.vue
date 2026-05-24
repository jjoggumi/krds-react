<template>
  <div class="survey__content">

    <div class="column-content">
      <div class="survey-view__content">
        <div class="survey-create__box m-full">

          <div :class="headingClass">
            <div class="icon"></div>
            <strong class="heading">{{ heading }}</strong>
            <p class="desc" v-html="headingDescription"></p>
          </div>

          <component
            v-if="!isAnonymous"
            :is="currentForm"
            :agree-val="agreeVal"
            @setAgreeVal="setAgreeVal"
          />

        </div>
      </div>
    </div>

    <div class="column-bottom">
      <div class="group-btn">
        <button
          :key="`bottom-button-${isReject}`"
          class="hi-btn btn-lg"
          @click="submitRespondentInfo"
          :disabled="validationCheck"
        >
          {{ bottomButtonTitle }}
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import defaultForm from "@/apps/surveyResponse/SurveyResponseBodyRespondentInfoDefault";
import urlForm from "@/apps/surveyResponse/SurveyResponseBodyRespondentInfoUrl";
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  name: "survey-response-body-respondent-info",
  data() {
    return {
      agreeVal: false
    }
  },
  components: {
    defaultForm,
    urlForm
  },
  computed: {
    ...mapState({
      user: 'user'
    }),
    ...mapState('storeSurvey', {
      surveys: 'surveys',
      isReject: 'isReject',
      surveysRespondentInfo: 'surveysRespondentInfo',
      isSimulation: 'isSimulation'
    }),
    /**
     * 설문 URL 로 설문 시작
     * @returns {boolean}
     */
    userType() {
      return this.surveysRespondentInfo.userType
    },
    isEnteringBySurveyUrl() {
      const metaClass = this.$route.meta.class || []
      return metaClass.includes('response-type-external')
    },
    currentForm() {
      if (this.surveys.isUsedUrl && this.isEnteringBySurveyUrl) {
        return 'urlForm'
      } else {
        return 'defaultForm'
      }
    },
    isUsedUrl() {
      return this.currentForm === 'urlForm'
    },
    isAnonymous() {
      return this.surveys.isAnonymous
    },
    isMember() {
      return this.surveys.userType !== 'NONMEMBER'
    },
    heading() {
      return this.isAnonymous ? '익명 설문 입니다.' : this.$route.path.includes('sru') ? '비회원 설문하기' : '응답자 정보 확인'
    },
    headingDescription() {
      return this.isAnonymous ?
        '관리자는 응답자 정보를 제외한 응답 내용만 확인 할 수 있습니다.'
        : this.isReject ? `<p class="desc ft-blue">${this.surveys.surveyType === 'AFTER_SCHOOL' || this.surveys.surveyType === 'CONSULTATION' ? '<strong>‘신청안함’</strong>' : '<strong>‘설문안함’</strong>'}으로 선택하셨습니다.<br/>응답자 정보 입력 후 제출을 완료해주세요.</p>`
          : '설문에 참여하시는 응답자 정보를 확인해주세요.'

    },
    headingClass() {
      return this.isAnonymous ? 'answer__heading anonymous' : 'answer__heading'
    },
    bottomButtonTitle() {
      if (this.isSimulation) {
        return this.isReject ? '종료하기' : '다음'
      } else {
        return this.isReject ? `${this.surveys.surveyType === 'AFTER_SCHOOL' || this.surveys.surveyType === 'CONSULTATION' ? '신청안함' : '설문안함'}으로 제출하기` : '다음'
      }
    },
    validationCheck() {
      let flag = false
      const schoolType = this.surveysRespondentInfo.schoolType
      const classGrade = this.surveysRespondentInfo.classGrade
      const respondentName = this.surveysRespondentInfo.respondentName
      const subjectName = this.surveysRespondentInfo.subjectName
      const classNumber = this.surveysRespondentInfo.classNumber
      const respondentPhone = this.surveysRespondentInfo.respondentPhone
      const respondentPassword = this.surveysRespondentInfo.respondentPassword
      if (!this.isAnonymous) {
        switch (this.currentForm) {
          case 'urlForm': {
            if (schoolType === '') {
              flag = true
            } else if (classGrade === '') {
              flag = true
            } else if (respondentName === null || respondentName === '') {
              flag = true
            } else if (subjectName === null || subjectName === '') {
              flag = true
            } else if (classNumber !== null && isNaN(classNumber)) {
              flag = true
            } else if (!respondentPhone || (respondentPhone !== null && isNaN(respondentPhone)) || respondentPhone.length < 10) {
              flag = true
            } else if (respondentPassword === null || isNaN(respondentPassword) || respondentPassword.length < 4) {
              flag = true
            } else if (!this.agreeVal) {
              flag = true
            }
          }
            break
          case 'defaultForm': {
            if (respondentName === null || respondentName === '') {
              flag = true
            } else if (subjectName === null || subjectName === '') {
              flag = true
            }
          }
        }
      }
      return flag
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      updateSurveyRespondentInfo: 'updateSurveyRespondentInfo',
      changeSurveyResponseBody: 'changeSurveyResponseBody',
      goRouteSurveyList: 'goRouteSurveyList',
      clearCurSurveyAnswer: 'clearCurSurveyAnswer',
      initSurveyResponse: 'initSurveyResponse',
      getSurveysRespondentInfo: 'getSurveysRespondentInfo'
    }),
    ...mapMutations('storeSurvey', {
      setAppView: 'setAppView',
      setIsReject: 'setIsReject'
    }),
    ...mapMutations({
      setIsDimLoading: 'setIsDimLoading'
    }),
    async submitRespondentInfo() {
      if (this.isSimulation) {
        this.clearCurSurveyAnswer()
        // this.isReject ? this.goRouteSurveyList() : alert('설문시뮬레이션 진행')


        if (this.$store.state.storeSurvey.appView) {
          this.initSurveyResponse()
          if( this.isReject){
            this.setAppView()
            this.setIsReject(false)
          } else {
            this.changeSurveyResponseBody('ANSWER')
          }
        } else {
          this.isReject ? this.goRouteSurveyList() : this.changeSurveyResponseBody('ANSWER')
        }
        return false
      }

      try {
        // 응답자 정보 수정
        const statusCode = await this.updateSurveyRespondentInfo()
        switch (statusCode) {
          case 400:
            this.$hiClass.alert('필수항목이 누락되었습니다.')
            break
          case 404:
            this.$hiClass.alert('유효하지 않는 설문입니다.').then(() => {
              this.goRouteSurveyList()
            })
            break
          case 406:
            this.$hiClass.alert('설문 대상자가 아닙니다.').then(() => {
              this.goRouteSurveyList()
            })
            break
          case 409:
            this.$hiClass.alert('비밀번호를 다시 확인해주세요.')
            break
          case 428:
            this.$hiClass.alert('종료된 설문입니다.').then(() => {
              this.goRouteSurveyList()
            })
            break
          default: {
            // TODO: 응답 거절인 경우 '응답 완료' 컴포넌트 호출
            // 비회원 설문일 경우 406일때는 응답완료처리
            this.setIsDimLoading(true)
            setTimeout(async () => {
              const respondent = await this.getSurveysRespondentInfo()
              this.setIsDimLoading(false)
              if (this.isReject || (this.$route.path.includes('sru') && respondent === 406) || respondent.answerStatus === 'REJECT') {
                this.changeSurveyResponseBody('COMPLETE')
              } else if (respondent === 428) {
                if(this.$route.path.includes('sru')) {
                  this.$route.push('/main')
                } else {
                  this.$hiClass.alert('종료된 설문입니다.').then(() => {
                    this.goRouteSurveyList()
                  })
                }
              } else {
                // TODO: 응답 거절이 아닌 경우 '질문 응답' 컴포넌트 호출
                this.changeSurveyResponseBody('ANSWER')
                if(this.$store.state.storeSurvey.respondentId){
                  const routeObj = {
                    path: this.$route.path
                  }
                  routeObj.query = {respondentId: this.$store.state.storeSurvey.respondentId}
                  this.$router.replace(routeObj, () => {
                  })
                }
              }
            }, 1000)
          }
        }
      } catch (e) {
        this.$log.warn(e)
      }
    },
    setAgreeVal() {
      this.agreeVal = !this.agreeVal
    }
  }
}
</script>

<style scoped>

</style>