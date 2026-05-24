<template>
  <div class="survey-create__box">
    <survey-report-question-label :question="question"></survey-report-question-label>
    <survey-report-question-title :question="question"></survey-report-question-title>
    <survey-report-question-description
      v-if="question.questionDescription"
      :question-description="question.questionDescription"
    >
    </survey-report-question-description>
    <div class="survey__stats">
      <template v-if="!isMobile">
        <div class="group-btn position-counsel">
          <button class="btn-download" @click="excelDownload">다운로드</button>
        </div>
      </template>
      <p class="guide__text" v-if="surveys.surveyStatus === 'DOING'">달력의 ① 상담 신청 내역을 선택 후에 ② 응답초기화 (신청 취소)를 할 수 있습니다.</p>
      <p class="counsel__text">{{ consultationPeriod }} </p>

      <consultation-calendar
        v-if="isShowCalendar"
        :isCreate="false"
        :surveys-consultation-calendar="surveysConsultationCalendar"
        :consultation-setting="consultationSetting"
        :statistics-consultations="statisticsConsultations"
        :question="question"
        :is-mobile="isMobile"
        @set-active-date="setActiveDate"
        @go-to-prev-month="goToPrevMonth"
        @go-to-next-month="goToNextMonth"
      />

      <template v-if="isMobile && activeDate.length > 0">
        <mobile-consultation-booking-list
          :question="question"
          :active-date="activeDate"
        >
        </mobile-consultation-booking-list>
      </template>
    </div>
  </div>
</template>

<script>
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";
import {mapActions, mapState} from "vuex";
import {  getClassGrade, getRespondentNameWithUserType, replaceMobile, getConsultType } from '@/plugins/utils'
import XLSX from "xlsx";
import ConsultationCalendar from "@/components/Calendar/ConsultationCalendar.vue";
import MobileConsultationBookingList from "@/apps/mobile/surveyReport/statistics/chart/MobileConsultationBookingList";
import SurveyReportQuestionDescription from "@/apps/surveyReport/components/common/SurveyReportQuestionDescription";
import {eventBus} from "@/main";

export default {
  name: "consultation",
  data() {
    return {
      consultationInfo: {},
      curYear: 0,
      curMonth: 0,
      isShowCalendar: false,
      activeDate: '',
      consultationSetting: {},
      surveysConsultationCalendar: []
    }
  },
  props: {
    curSurveyId: {
      type: String
    },
    question: {
      type: Object
    },
    questionType: {
      type: String
    },
    isAnonymous: {
      type: Boolean
    },
    isUsedUrl: {
      type: Boolean
    },
    isMobile: {
      type: Boolean
    }
  },
  components: {
    MobileConsultationBookingList,
    SurveyReportQuestionLabel,
    SurveyReportQuestionTitle,
    ConsultationCalendar,
    SurveyReportQuestionDescription
  },
  computed: {
    ...mapState('storeSurvey', {
      surveys: 'surveys',
      surveyReport: 'surveyReport'
    }),
    statisticsConsultations() {
      return this.consultationInfo.consultations
    },
    consultationPeriod() {
      let dateStart = this.consultationInfo.dateStart
        ? this.$moment(this.consultationInfo.dateStart).format('MM월 DD일')
        : '?'
      let dateEnd = this.consultationInfo.dateEnd
        ? this.$moment(this.consultationInfo.dateEnd).format('MM월 DD일')
        : '?'
      return `상담기간 : ${dateStart} ~ ${dateEnd}`
    },
    activeTagIds() {
      return this.surveyReport.statistics.activeTagIds
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      getSurveyReportConsultationList: 'getSurveyReportConsultationList',
      getSurveyReportConsultationExcelData: 'getSurveyReportConsultationExcelData',
      getConsultationSettingInfo: 'getConsultationSettingInfo',
      getSurveysConsultationCalendar: 'getSurveysConsultationCalendar',
    }),
    excelDownload() {
      const payload = {
        questionId: this.question.questionId
      }
      this.getSurveyReportConsultationExcelData(payload)
        .then(res => {
          let excelData = []
          res.data.forEach(item => {
            let row = {}

            const isTagSelected = this.activeTagIds.length > 0
            const hasSelectedTag = item.tags && item.tags.some(tag => this.activeTagIds.includes(tag.tagId))
            if (
                item.respondentName && (!isTagSelected || (isTagSelected && hasSelectedTag))
            ) {
              row = {
                '신청날짜': item.itemDate,
                '상담시간': `${item.itemTimeStart} ~ ${item.itemTimeEnd}`,
                '학년': getClassGrade(item.classGrade),
                '클래스명': item.classBan,
                '번호': item.classNumber ? item.classNumber : '-',
                '학반(태그)': (item.tags || []).map(t => t.tagName).join(', '),
                '신청자명': getRespondentNameWithUserType(item.respondentName, item.userType),
                '학생명': item.subjectName ? item.subjectName : '-',
                '전화번호': item.respondentPhone ? replaceMobile(item.respondentPhone) : '-',
                '신청일시': item.answeredTime,
                '상담방법': getConsultType(item.consultType),
              }
            } else {
              row = {
                '신청날짜': item.itemDate,
                '상담시간': `${item.itemTimeStart} ~ ${item.itemTimeEnd}`,
                '학년': '',
                '클래스명': '',
                '번호': '',
                '학반(태그)': '',
                '신청자명': '',
                '학생명': '',
                '전화번호': '',
                '신청일시': '',
                '상담방법': '',
              }
            }

            excelData.push(row)
          })

          const workSheet = XLSX.utils.json_to_sheet(excelData)
          const workBook = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(workBook, workSheet)
          XLSX.writeFile(workBook, '응답 내용.xlsx')
        })
    },
    goToPrevMonth() {
      if (this.curMonth === '01') {
        const year = parseInt(this.curYear) - 1
        this.curYear = year.toString()
        this.curMonth = '12'
      } else {
        const month = parseInt(this.curMonth) - 1
        this.curMonth = month > 9 ? month.toString() : `0${month.toString()}`
      }
    },
    goToNextMonth() {
      if (this.curMonth === '12') {
        const year = parseInt(this.curYear) + 1
        this.curYear = year.toString()
        this.curMonth = '01'
      } else {
        const month = parseInt(this.curMonth) + 1
        this.curMonth = month > 9 ? month.toString() : `0${month.toString()}`
      }
    },
    getConsultationList() {
      const month = Number.isInteger(this.curMonth) && this.curMonth < 10
        ? `0${this.curMonth}`
        : this.curMonth
      const yearMonth = `${this.curYear}-${month}`
      const payload = {
        curMonth: yearMonth,
        questionId: this.question.questionId
      }
      return this.getSurveyReportConsultationList(payload)
        .then(res => {
          if (res.data.consultations) {
            this.consultationInfo = res.data
          }
          return true
        })
    },
    setActiveDate(date) {
      this.activeDate = date
    },
    // 신청내역 모달에서 삭제되면 달력에서도 안보이게 처리
    deleteConsultationItem(deleteItem) {
      const item = this.consultationInfo.consultations
        .find(consultation => {
          return consultation.itemDate === deleteItem.itemDate // 삭제된 신청내역과 같은 일자의 상담과
        }).consultationDetails
        .find(detailItem => {
          return detailItem.itemTimeStart === deleteItem.itemTimeStart && // 시작시간과 종료시간이 같은 item
            detailItem.itemTimeEnd === deleteItem.itemTimeEnd
        })

      // 기존에 존재하던 신청내역 정보를 삭제
      item.classBan = null
      item.classGrade = null
      item.classNumber = null
      item.consultType = null
      item.respondentName = null
      item.subjectName = null
    }
  },
  created() {
    this.getConsultationSettingInfo({questionId: this.question.questionId})
      .then(res => {
        this.consultationSetting = res.data
        const calendarRequest = {
          isHoliday: false,
          startDate: res.data.dateStart,
          endDate: res.data.dateEnd,
          startTime: res.data.timeStart,
          endTime: res.data.timeEnd,
          consultTime: res.data.timeConsultation,
          recessTime: res.data.timeRecess,
        }
        this.getSurveysConsultationCalendar(calendarRequest)
          .then(res => {
            this.surveysConsultationCalendar = res

            this.curYear = this.$moment(res[0].month).format('YYYY')
            this.curMonth = this.$moment(res[0].month).format('MM')

            this.isShowCalendar = true
          })
      })
  },
  mounted() {
    // 상담신청 모달에서 취소시에 이벤트 동작 store.survey의 deleteConsultation
    eventBus.$on('delete-statistics-consultation-item', itemId => this.deleteConsultationItem(itemId))
  },
  destroyed() {
    eventBus.$off('delete-statistics-consultation-item')
  },
  watch: {
    curMonth: {
      handler: function () {
        this.getConsultationList()
      }
    }
  }
}
</script>

<style scoped>

</style>