<template>
  <div class="counsel__list">
    <strong class="counsel__date">{{ getConsultationDate() }}</strong>
    <div
      class="counsel__item"
      :class="{'deleted': answer.isDel}"
      v-for="answer of consultationAnswers"
      :key="answer.answerId"
    >
      <span class="time">{{ `${answer.itemTimeStart} ~ ${answer.itemTimeEnd}` }}</span>
      <span class="info" v-if="answer.respondentName && isRespondentVisible(answer)">
        <span class="name">{{ getRespondentInfo(answer) }}</span>
        <span class="type">{{ getConsultType(answer.consultType) }}</span>
        <span>{{ getMobile(answer.respondentPhone) }}</span>
      </span>
    </div>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";
import {
  getRespondentNameWithUserType,
  replaceMobile,
  getClassGradeBan,
  getConsultType
} from '@/plugins/utils'

export default {
  name: "mobile-consultation-booking-list",
  data() {
    return {
      consultationAnswers: []
    }
  },
  props: {
    question: {
      type: Object
    },
    activeDate: {
      type: String
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport'
    }),
    activeTagIds() {
      return this.surveyReport.statistics.activeTagIds
    }
  },
  mounted() {
    this.getConsultationAnswers()
  },
  methods: {
    ...mapActions('storeSurvey', {
      getSurveyReportConsultationAnswers: 'getSurveyReportConsultationAnswers'
    }),
    getConsultationAnswers() {
      const payload = {
        selectedDate: this.activeDate,
        questionId: this.question.questionId,
      }
      // 학부모상담 일별 신청 내역
      this.getSurveyReportConsultationAnswers(payload)
        .then(res => {
          if (res.data) {
            this.consultationAnswers = res.data
          }
        })
    },
    getConsultationDate() {
      const day = this.$moment(this.activeDate).day()
      let formatDay = ''
      switch (day) {
        case 0:
          formatDay = '일요일'
          break
        case 1:
          formatDay = '월요일'
          break
        case 2:
          formatDay = '화요일'
          break
        case 3:
          formatDay = '수요일'
          break
        case 4:
          formatDay = '목요일'
          break
        case 5:
          formatDay = '금요일'
          break
        case 6:
          formatDay = '토요일'
          break

      }
      return this.$moment(this.activeDate).format(`M월 DD일 ${formatDay}`)
    },
    getRespondentInfo(answerInfo) {
      const classGradeBan = getClassGradeBan(answerInfo.classGrade,  answerInfo.classBan)
      const classNumber = answerInfo.classNumber ? `${answerInfo.classNumber}번` : ''
      const respondentName = getRespondentNameWithUserType(answerInfo.respondentName, answerInfo.userType)
      const subjectName = answerInfo.subjectName ? `(${answerInfo.subjectName})` : ''

      return `${classGradeBan} ${classNumber} ${respondentName} ${subjectName}`
    },
    getConsultType(consultType) {
      return getConsultType(consultType)
    },
    getMobile(mobile) {
      return replaceMobile(mobile)
    },
    isRespondentVisible(respondent) {
      return this.activeTagIds.length > 0 ?
          respondent.tags && respondent.tags.some(tag => this.activeTagIds.includes(tag.tagId)) :
          true
    }
  },
  watch: {
    activeDate: {
      handler: function () {
        this.getConsultationAnswers()
      }
    }
  }
}
</script>

<style scoped>

</style>