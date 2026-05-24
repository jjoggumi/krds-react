<template>
  <tbody>
  <tr
    v-for="(week, weekIndex) of computedWeeks"
    :key="weekIndex"
  >
    <template v-if="isCreate">
      <consultation-calendar-body-day
        v-for="(day, dayIndex) of week"
        :key="`${day.date}-${dayIndex}`"
        :prop-day="day"
      />
    </template>
    <template v-else>
      <statistics-consultation-calendar-body-day
        v-for="(day, dayIndex) of week"
        :key="`${day.date}-${dayIndex}`"
        :prop-day="day"
        :booking-item="getBookingItem(day)"
        :question="question"
        :consultation-date-list="getConsultationDateList"
        :is-mobile="isMobile"
        @set-active-date="setActiveDate"
      />
    </template>
  </tr>
  </tbody>

</template>

<script>
import ConsultationCalendarBodyDay from "@/components/Calendar/ConsultationCalendarBodyDay.vue";
import StatisticsConsultationCalendarBodyDay
  from "@/apps/surveyReport/components/statistics/chart/StatisticsConsultationCalendarBodyDay";
import {mapState} from "vuex";

export default {
  name: "consultation-calendar-body",
  components: {
    StatisticsConsultationCalendarBodyDay,
    ConsultationCalendarBodyDay
  },
  props: {
    propCalendarItemDates: {
      type: Array
    },
    // 설문 작성하기인지 통계인지
    isCreate: {
      type: Boolean
    },
    // 통계 학부모상담 신청내역
    statisticsConsultations: {
      type: Array,
      required: false
    },
    // 통계 질문정보
    question: {
      type: Object,
      required: false
    },
    // 통계 웹뷰인지
    isMobile: {
      type: Boolean
    },
    dayGroupTimes : {
      type: Object
    }
  },
  data() {
    return {

    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyEditQuestions: 'surveyEditQuestions',
    }),
    computedWeeks() {
      const weeks = []
      const days = []
      const totalCount = this.propCalendarItemDates.length
      const lastItemIndex = totalCount -1

      switch (this.propCalendarItemDates[0].week) {
        case '월': {
          break
        }
        case '화': {
          days.push({})
          break
        }
        case '수': {
          days.push({})
          days.push({})
          break
        }
        case '목': {
          days.push({})
          days.push({})
          days.push({})
          break
        }
        case '금': {
          days.push({})
          days.push({})
          days.push({})
          days.push({})
          break
        }
      }

      for (let i = 0; i < this.propCalendarItemDates.length; i++) {
        const item = this.propCalendarItemDates[i]

        const isLastItem = totalCount === (i + 1)

        days.push({
          ...item,
          dayTimes: !this.dayGroupTimes[item.date] ? [] : this.dayGroupTimes[item.date]
        })

        if (item.week === '금' || isLastItem) {
          weeks.push(_.cloneDeep(days))
          days.splice(0)
        }
      }

      switch (this.propCalendarItemDates[lastItemIndex].week) {
        case '월': {
          days.push({})
          days.push({})
          days.push({})
          days.push({})
          break
        }
        case '화': {
          days.push({})
          days.push({})
          days.push({})
          break
        }
        case '수': {
          days.push({})
          days.push({})
          break
        }
        case '목': {
          days.push({})
          break
        }
        case '금': {
          break
        }
      }
      if (days.length > 0) {
        weeks[weeks.length -1].push(...days)
      }
      
      return weeks
    },
    // 통계 일자별 상담내역 모달에 필요한 신청내역 존재하는 날짜 리스트
    getConsultationDateList() {
      return this.statisticsConsultations ?
        this.statisticsConsultations.map(consultation => consultation.itemDate) :
        []
    },
    // 통계 일자별 상담신청 item
    getBookingItem() {
      return (day) => {
        return this.statisticsConsultations ?
          this.statisticsConsultations.find(consultation => consultation.itemDate === day.date) :
          {}
      }
    },
  },
  methods: {
    // 통계 웹뷰에서 현재 클릭한 날짜 설정
    setActiveDate(date) {
      this.$emit('set-active-date', date)
    }
  }
}
</script>

<style scoped>

</style>