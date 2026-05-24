<!--
@File(Method): SurveyReportRespondentInfo.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 설문·투표 > 설문목록 > 통계 및 개별 조회 > 응답자 개별 조회 탭 >  응답자 현황 상세 > 기본 정보
@Modified: 2024-11-07 - #69524 설문 선착순/추첨 추가 : 진행 상태
-->
<template>
  <div class="respondent__info">
    <div class="info">
      <span class="image">
        <img v-if="!isAnonymous" :src="respondentImage" alt="">
      </span>
      <template v-if="isAnonymous">
        <span class="name">익명 설문입니다.</span>
        <span class="date">익명 설문은 응답자 정보를 제공하지 않습니다.</span>
      </template>
      <template v-else>
        <span class="num" v-if="hasClassNumber">{{ classNumber }}</span>
        <span class="name">{{ respondentName }}</span>
        <div>
          <span class="date complete">{{ answeredTimestamp }}</span>
          <span v-if="isFcfsComplete"> (당첨)</span>
          <span v-if="isFcfsWait"> (대기)</span>
<!--          <button class="btn-print">인쇄</button>-->

        </div>
      </template>
    </div>
    <div class="group-btn">
      <button class="hi-btn btn-md btn-black" v-if="isShowInitAnswerBtn" @click="initAnswer">
        <span>응답 초기화</span>
        <div class="hi-tooltip"><span>응답자가 처음부터 다시 설문이 가능합니다.</span></div>
      </button>
    </div>
    <init-answer-confirm-modal v-if="isShowInitAnswerModal"/>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {getClassGradeBan, getRespondentNameWithUserType} from "@/plugins/utils";
import InitAnswerConfirmModal from "@/apps/surveyReport/components/respondent/modal/InitAnswerConfirmModal";
export default {
  name: "survey-report-respondent-info",
  components: {
    InitAnswerConfirmModal
  },
  props: {
    isAnonymous: {
      type: Boolean
    },
    isComplete: {
      type: Boolean
    },
    isReject: {
      type: Boolean
    },
    isTemporary: {
      type: Boolean
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport',
      surveys: 'surveys'
    }),
    respondentInfo() {
      return this.surveyReport.respondent.curSurveySelectedRespondent
    },
    hasClassNumber() {
      return this.respondentInfo.classNumber
    },
    respondentImage() {
      return this.respondentInfo.userPhoto ? this.respondentInfo.userPhoto : ''
    },
    respondentName() {
      const respondentName = getRespondentNameWithUserType(this.respondentInfo.respondentName, this.respondentInfo.userType)
      const subjectName = this.respondentInfo.subjectName
      const classGradeBan = getClassGradeBan(this.respondentInfo.classGrade, this.respondentInfo.classBan)

      return subjectName ?
        `${classGradeBan} ${respondentName} (${subjectName})` :
        `${classGradeBan} ${respondentName}`
    },
    classNumber() {
      return this.respondentInfo.classNumber
    },
    answeredTimestamp() {
      if (this.isComplete || this.isReject) {
        return `${this.timestampToDateTime(this.respondentInfo.answeredTimestamp)} 제출`
      } else if (this.isTemporary) {
        return '제출안함'
      } else {
        return ''
      }
    },
    isShowInitAnswerBtn() {
      return this.surveys.surveyStatus === 'DOING' &&
        (this.respondentInfo.answerStatus === 'REJECT' ||
          this.respondentInfo.answerStatus === 'TEMPORARY' ||
          this.respondentInfo.answerStatus === 'COMPLETE')

    },    
    isInitAnswerDone() {
      return this.surveyReport.respondent.isInitAnswerDone
    },
    isFcfsComplete() {
      return this.surveyReport.respondent.curSurveySelectedRespondent.waitStatus === 'COMPLETE'
    },
    isFcfsWait() {
      return this.surveyReport.respondent.curSurveySelectedRespondent.waitStatus === 'WAIT'
    },
    isShowInitAnswerModal() {
      return this.surveyReport.respondent.initAnswerModalIsOpen
    },
  },
  methods: {
    ...mapActions('storeSurvey', {
      openInitAnswerConfirmModal: 'openInitAnswerConfirmModal',
      getSurveyReportRespondentList: 'getSurveyReportRespondentList'
    }),
    ...mapMutations('storeSurvey', {
      setCurSurveySelectedRespondent: 'setCurSurveySelectedRespondent',
      setIsInitAnswerDone: 'setIsInitAnswerDone'
    }),
    timestampToDateTime(timestamp) {
      return this.$moment(timestamp).format('YY.MM.DD HH:mm:ss')
    },
    initAnswer() {
      this.openInitAnswerConfirmModal({respondentId: this.respondentInfo.respondentId})
    }
  },
  watch: {
    isInitAnswerDone: {
      handler: function (newVal) {
        if (newVal) {
          this.setCurSurveySelectedRespondent({})
          this.$hiClass.alert('응답 초기화를 완료하였습니다.', 'success')
              .then(() => {
                this.getSurveyReportRespondentList(this.surveyReport.curSurveyId)
                this.setIsInitAnswerDone(false)
              })
        }
      }
    }
  }
}
</script>

<style scoped>

</style>