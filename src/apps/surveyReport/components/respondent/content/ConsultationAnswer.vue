<template>
  <div>
    <survey-report-question-label
      :question="question"
      :has-question-user-answer="hasQuestionUserAnswer"
      :is-respondent-answer="true"
    />
    <survey-report-question-title :question="question"/>
    <survey-report-question-description
      v-if="question.questionDescription"
      :question-description="question.questionDescription"
    />
    <survey-report-question-image
      v-if="question.files.length > 0"
      :question-files="question.files"
    />

    <p class="counsel__text">{{ consultationPeriod }}</p>
    <template v-if="questionUserAnswer.length > 0">
      <div
        class="counsel__details"
        v-for="answer of questionUserAnswer"
        :key="answer.answerId"
      >
        <span class="type" :class="getConsultTypeClass(answer.consultType)">
          {{ getConsultType(answer.consultType) }}
        </span>
        <div class="info">
          <strong class="schedule">{{ getConsultationDate(answer) }}</strong>
          <span class="class">{{ respondentName }}</span>
        </div>
      </div>
    </template>

    <div class="survey__result" v-else>
      <div class="result">
        <span class="text-answer">신청 내역이 없습니다.</span>
      </div>
    </div>
  </div>
</template>

<script>
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";
import SurveyReportQuestionDescription from "@/apps/surveyReport/components/common/SurveyReportQuestionDescription";
import SurveyReportQuestionImage from "@/apps/surveyReport/components/common/SurveyReportQuestionImage";
import {
  getRespondentNameWithUserType,
  getConsultType
} from '@/plugins/utils'
import {mapState} from "vuex";

export default {
  name: "consultation-answer",
  props: {
    question: Object,
    questionUserAnswer: Array
  },
  components: {
    SurveyReportQuestionLabel,
    SurveyReportQuestionTitle,
    SurveyReportQuestionDescription,
    SurveyReportQuestionImage
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport'
    }),
    respondentInfo() {
      return this.surveyReport.respondent.curSurveySelectedRespondent
    },
    respondentName() {
      const respondentName = getRespondentNameWithUserType(this.respondentInfo.respondentName, this.respondentInfo.userType)
      const subjectName = this.respondentInfo.subjectName

      return subjectName ? `${respondentName} (${subjectName})` : respondentName
    },
    hasQuestionUserAnswer() {
      return this.questionUserAnswer.length > 0 &&
        this.questionUserAnswer.some(answer => answer.answerType === 'ANSWER')
    },
    consultation() {
      return this.question.consultation
    },
    consultationItems() {
      return this.question.consultation.items
    },
    consultationPeriod() {
      const start = this.$moment(this.consultation.dateStart).format('YYYY년 MM월 DD일')
      const end = this.$moment(this.consultation.dateEnd).format('YYYY년 MM월 DD일')
      return `상담 기간 : ${start}~${end}`
    }
  },
  methods: {
    getConsultTypeClass(consultType) {
      switch (consultType) {
        case 'VISIT':
          return 'visit'
        case 'PHONE':
          return 'call'
        case 'REMOTE':
          return 'remote'
      }
    },
    getConsultType(consultType) {
      return getConsultType(consultType)
    },
    getConsultationDate(answer) {
      let consultationItem = {}
      let consultationYMD = ''
      let consultationWeekDay = ''
      for (const key in this.consultationItems) {
        if (this.consultationItems[key].find(item => item.itemId === answer.itemId)) {
          consultationYMD = this.$moment(key).format('M월 DD일')
          consultationWeekDay = this.getWeekDay(this.$moment(key))
          consultationItem = this.consultationItems[key].find(item => item.itemId === answer.itemId)
        }
      }
      return `${consultationYMD} ${consultationWeekDay} ${consultationItem.itemTimeStart}~${consultationItem.itemTimeEnd}`

    },
    getWeekDay(day) {
      let formatDay = ''
      switch (this.$moment(day).day()) {
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
      return formatDay
    },
  }
}
</script>

<style scoped>

</style>