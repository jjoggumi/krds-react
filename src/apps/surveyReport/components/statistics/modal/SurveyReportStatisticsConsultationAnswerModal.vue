<!--
@File(Method): SurveyReportStatisticsConsultationAnswerModal.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 설문·투표(상담신청)> 통계 및 개별 조회 > 통계 탭 > 상세 모달
@Modified: 2025-02-24 - #71977 학교양식신청서 및 설문 > 학반(태그) 추가
-->
<template>
  <div>
    <div class="hi-modal-common modal-survey-stats" style="display: block;" id="modal08">
      <div class="modal__dim" @click="closeConsultationModal"></div>
      <div class="modal__layer">
        <div class="modal__header">
          <button class="btn-close" @click="closeConsultationModal"></button>
        </div>
        <div class="modal__content">
          <div class="fcfs__calendar">
            <div class="calendar__top">
              <div class="heading"><em>{{ consultationDate }}</em> 상담 신청 내역</div>
              <button class="btn-prev" @click="goToPrev"></button>
              <button class="btn-next" @click="goToNext"></button>
            </div>
          </div>
          <div class="scrollbox">
            <table class="hi-tbl">
              <colgroup>
                <col style="width: 120px;">
                <col style="width: 90px;">
                <col style="width: 60px;">
                <col style="width: 120px;">
                <col style="width: 100px;">
                <col style="width: 130px;">
                <col style="width: auto;">
                <col style="width: 250px;">
              </colgroup>
              <thead>
              <tr>
                <th>상담시간</th>
                <th>학년</th><!-- #71977 학년/반 >> 학년 으로 변경 -->
                <th>번호</th>
                <th>신청자명</th>
                <th>학생명</th>
                <th>전화번호</th>
                <th>상담유형</th>
                <th>신청일시</th>
              </tr>
              </thead>
              <tbody>
              <tr
                v-for="respondent of consultationAnswers"
                :key="respondent.answerId"
              >
                <template v-if="respondent.isDel">
                  <td>
                    <span class="deleted">
                      {{ getConsultationTime(respondent.isDel, respondent.itemTimeStart, respondent.itemTimeEnd) }}
                    </span>
                  </td>
                </template>
                <template v-else>
                  <td>{{ getConsultationTime(respondent.isDel, respondent.itemTimeStart, respondent.itemTimeEnd) }}</td>
                </template>

                <template v-if="isRespondentVisible(respondent)">
                  <td>{{ getGrade(respondent.classGrade) }}</td>
                  <td>{{ respondent.classNumber || (respondent.answerId ? '-' : '') }}</td>
                  <td>{{ getName(respondent.respondentName, respondent.userType) }}</td>
                  <td>{{ respondent.subjectName || (respondent.answerId ? '-' : '') }}</td>
                  <td>{{ respondent.answerId ? getReplaceMobile(respondent.respondentPhone) : '' }}</td>
                  <td>{{ getConsultType(respondent.consultType) }}</td>
                  <td>
                    {{getAnsweredTimestamp(respondent.answeredTimestamp)}}
                    <button
                        class="hi-btn btn-black btn-sm"
                        v-if="respondent.answerId && isShowInitAnswerBtn"
                        @click="initAnswer(respondent)"
                    >
                      응답 초기화
                    </button>
                  </td>
                </template>
                <template v-else>
                  <td v-for="i of 7" :key="i"></td>
                </template>

              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <init-answer-confirm-modal v-if="isShowInitAnswerModal"/>
  </div>
</template>

<script>
import {
  getRespondentNameWithUserType,
  replaceMobile,
  timestampToDateTime,
  getClassGrade,
  getConsultType
} from '@/plugins/utils'
import {mapActions, mapMutations, mapState} from "vuex";
import InitAnswerConfirmModal from "@/apps/surveyReport/components/respondent/modal/InitAnswerConfirmModal";

export default {
  name: "survey-report-statistics-consultation-answer-modal",
  components: {
    InitAnswerConfirmModal
  },
  data() {
    return {
      consultationDateList: [],
      hasPrev: true,
      hasNext: true
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport',
      surveys: 'surveys'
    }),
    questionId() {
      return this.surveyReport.statistics.consultationQuestionId
    },
    consultationAnswers() {
      return this.surveyReport.statistics.consultationAnswers
    },
    selectedDate() {
      return this.consultationAnswers[0].itemDate
    },
    selectedDateIndex() {
      return this.consultationDateList.findIndex(consultation => {
        return consultation === this.selectedDate
      })
    },
    consultationDate() {
      const date = new Date(this.selectedDate)
      return `${date.getMonth() + 1}월 ${date.getDate()}일`
    },
    currentYear() {
      return this.$moment(this.selectedDate).format('yyyy')
    },
    currentMonth() {
      return this.$moment(this.selectedDate).format('MM')
    },
    prevYearMonth() {
      // 1월이면 연도 -1
      if (this.currentMonth === '01') {
        return `${this.currentYear - 1}-12`
      } else {
        const month = parseInt(this.currentMonth) - 1
        return `${this.currentYear}-${month > 9 ? month : '0'+month}`
      }
    },
    nextYearMonth() {
      // 12월이면 연도 +1
      if (this.currentMonth === '12') {
        return `${parseInt(this.currentYear) + 1}-01`
      } else {
        const month = parseInt(this.currentMonth) + 1
        return `${this.currentYear}-${month > 9 ? month : '0'+month}`
      }
    },
    isShowInitAnswerBtn() {
      return this.surveys.surveyStatus === 'DOING'
    },
    isInitAnswerDone() {
      return this.surveyReport.respondent.isInitAnswerDone
    },
    isShowInitAnswerModal() {
      return this.surveyReport.respondent.initAnswerModalIsOpen
    },
    activeTagIds() {
      return this.surveyReport.statistics.activeTagIds
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      closeConsultationModal: 'closeConsultationModal',
      getSurveyReportConsultationAnswers: 'getSurveyReportConsultationAnswers',
      getSurveyReportConsultationList: 'getSurveyReportConsultationList',
      deleteConsultation: 'deleteConsultation',
      openInitAnswerConfirmModal: 'openInitAnswerConfirmModal'
    }),
    ...mapMutations('storeSurvey', {
      setIsInitAnswerDone: 'setIsInitAnswerDone'
    }),
    getConsultationTime(isDel, start, end) {
      if (isDel) {
        return `(삭제)${start} ~ ${end}`
      } else {
        return `${start} ~ ${end}`
      }
    },
    getName(name, type) {
      return getRespondentNameWithUserType(name, type)
    },
    getReplaceMobile(mobile) {
      return mobile ? replaceMobile(mobile) : '-'
    },
    getConsultType(consultType) {
      return getConsultType(consultType)
    },
    getAnsweredTimestamp(timestamp) {
      return timestamp ? timestampToDateTime(timestamp) : ''
    },
    getGrade(grade) {
      return getClassGrade(grade)
    },
    isRespondentVisible(respondent) {
      return this.activeTagIds.length > 0 ?
          respondent.tags && respondent.tags.some(tag => this.activeTagIds.includes(tag.tagId)) :
          true
    },
    goToPrev() {
      const payload = {
        curMonth: this.prevYearMonth,
        questionId: this.questionId
      }

      // 이전일자가 없으면 이전월 상담신청내역 조회
      if (!this.hasPrev) {
        this.getSurveyReportConsultationList(payload)
          .then(res => {
            // 이전월의 상담신청내역이 있으면 일자 리스트에 추가
            if (res.data.consultations) {
              const dateList = res.data.consultations.map(consultation => consultation.itemDate)
              this.consultationDateList.unshift(...dateList)
              this.getPrevDateAnswers(payload)
            }
          })
      } else {
        this.getPrevDateAnswers(payload)
      }
    },
    getPrevDateAnswers(payload) {
      payload.selectedDate = this.consultationDateList[this.selectedDateIndex - 1]
      this.getSurveyReportConsultationAnswers(payload)
        .then(res => {
          if (this.selectedDateIndex > 0) {
            this.hasPrev = true
          }
        })
    },
    goToNext() {
      const payload = {
        curMonth: this.nextYearMonth,
        questionId: this.questionId
      }

      // 다음일자가 없으면 다음월 상담신청내역 조회
      if (!this.hasNext) {
        this.getSurveyReportConsultationList(payload)
          .then(res => {
            // 다음월의 상담신청내역이 있으면 일자 리스트에 추가
            if (res.data.consultations) {
              const dateList = res.data.consultations.map(consultation => consultation.itemDate)
              this.consultationDateList.push(...dateList)
              this.getNextDateAnswers(payload)
            }
          })
      } else {
        this.getNextDateAnswers(payload)
      }
    },
    getNextDateAnswers(payload) {
      payload.selectedDate = this.consultationDateList[this.selectedDateIndex + 1]
      this.getSurveyReportConsultationAnswers(payload)
        .then(res => {
          if (this.selectedDateIndex < this.consultationDateList.length - 1) {
            this.hasNext = true
          }
        })
    },
    initAnswer(respondent) {
      this.openInitAnswerConfirmModal(respondent)
    }
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
    this.consultationDateList = this.surveyReport.statistics.consultationDateList
    this.hasPrev = this.selectedDateIndex > 0
    this.hasNext = this.consultationDateList.length - 1  > this.selectedDateIndex
  },
  beforeDestroy() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  watch: {
    consultationAnswers: {
      handler: function () {
        if (this.consultationDateList.length - 1 === this.selectedDateIndex) {
          this.hasNext = false
        }
        if (this.consultationDateList.length - 1 > this.selectedDateIndex) {
          this.hasNext = true
        }
        if (this.selectedDateIndex === 0) {
          this.hasPrev = false
        }
        if (this.selectedDateIndex > 0) {
          this.hasPrev = true
        }
      }
    },
    isInitAnswerDone: {
      handler: function (newVal) {
        if (newVal) {
          this.deleteConsultation()
          this.setIsInitAnswerDone(false)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>