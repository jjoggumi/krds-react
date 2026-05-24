<template>
  <td :class="{'is-disabled': !hasConsultation}" @click="setActiveDate">

    <template v-if="date">

      <div class="top">
        <span class="day" :class="{'today': isToday}">{{ dayStr }}</span>
      </div>

      <div class="bottom">
        <p
          v-if="!hasConsultation"
          class="nodata"
        >
          상담없음
        </p>

        <template
          v-if="hasConsultation"
        >
          <ul class="booking__list">
            <li
              class="booking__item"
              v-for="(item, idx) of bookingItem.consultationDetails"
              :key="`${item.itemDate}-${idx}`"
            >
              <span
                class="label"
                :class="{'delete': item.isDel}"
                v-if="isShowRespondent(item) && item.consultType"
              >
                {{ getConsultType(item.consultType) }}
              </span>
              <span
                class="time"
                :class="{'deleted': item.isDel}"
                role="button"
                @click="openConsultationModal(item)"
              >
                {{ getBookingTimeWithName(item) }}
              </span>
            </li>
          </ul>
        </template>

      </div>

    </template>

  </td>
</template>

<script>
import {getConsultType} from "@/plugins/utils";
import {mapActions, mapState} from "vuex";

export default {
  name: "statistics-consultation-calendar-body-day",
  props: {
    propDay: {
      type: Object,
      required: true
    },
    bookingItem: {
      type: Object
    },
    question: {
      type: Object
    },
    consultationDateList: {
      type: Array
    },
    isMobile: {
      type: Boolean
    }
  },
  data() {
    return {
      itemsDates: [],
    }
  },
  computed: {
    ...mapState('storeSurvey', ['surveyReport']),
    hasConsultation() {
      return this.bookingItem !== undefined
    },
    date() {
      return this.propDay.date
    },
    dayStr() {
      return this.$moment(this.date).date()
    },
    isToday() {
      return this.$moment().format('YYYY-MM-DD') === this.date
    },
    activeTagIds() {
      return this.surveyReport.statistics.activeTagIds
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      getSurveyReportConsultationAnswers: 'getSurveyReportConsultationAnswers',
      openModal: 'openConsultationModal'
    }),
    getBookingTimeWithName(item) {
      const startTime = item.itemTimeStart
      const EndTime = item.itemTimeEnd
      const respondentName = item.respondentName
      const subjectName = item.subjectName
      const tags = item.tags

      if (!respondentName) return `${startTime} ~ ${EndTime}`
      if (this.activeTagIds.length === 0) {
        return subjectName ? `${startTime} ${respondentName}(${subjectName})` : `${startTime} ${respondentName}`
      }
      return tags && tags.some(tag => this.activeTagIds.includes(tag.tagId)) ? `${startTime} ${respondentName}(${subjectName})` : `${startTime} ~ ${EndTime}`
    },
    isShowRespondent(item) {
      if (this.activeTagIds.length === 0) {
        return true
      } else {
        return item.tags && item.tags.some(tag => this.activeTagIds.includes(tag.tagId))
      }
    },
    getConsultType(consultType) {
      return getConsultType(consultType)
    },
    openConsultationModal(item) {
      if (item.respondentName === null) {
        return false
      }
      if (!this.isShowRespondent(item)) {
        return false
      }

      const payload = {
        selectedDate: this.date,
        questionId: this.question.questionId,
        consultationDateList: this.consultationDateList
      }
      // 학부모상담 일별 신청 내역
      this.getSurveyReportConsultationAnswers(payload)
        .then(res => {
          this.openModal(payload)
        })
    },
    // 통계 웹뷰에서 현재 클릭한 날짜 설정
    setActiveDate() {
      if (!this.isMobile || !this.hasConsultation) {
        return false
      }
      this.$emit('set-active-date', this.date)
    }
  }
}
</script>

<style scoped>

</style>