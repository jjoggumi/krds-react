<template>
  <!-- 학부모 상담 달력 영역 -->
  <div class="fcfs__calendar">
    <button
      v-if="isCreate"
      class="hi-btn btn-md btn-add-calendar"
      @click="onClickAddButton"
    >
      상담 기간 추가
    </button>

    <div class="calendar__top">
      <div class="heading">{{ curMonthToFormat }}</div>
      <button
        v-if="!isFirstMonth"
        class="btn-prev"
        @click="onClickPrevButton"
      ></button>
      <button
        v-if="!isLastMonth"
        class="btn-next"
        @click="onClickNextButton"
      ></button>
    </div>

    <table
      v-for="(calendarItem, index) of surveysConsultationCalendar"
      :key="`${calendarItem.month}-${index}`"
      class="calendar__tbl"
      :class="{
        'is-hidden': isHiddenCalendar(calendarItem)
      }"
    >
      <caption></caption>

      <colgroup>
        <col>
        <col>
        <col>
        <col>
        <col>
      </colgroup>

      <thead>
      <tr>
        <th scope="col">월</th>
        <th scope="col">화</th>
        <th scope="col">수</th>
        <th scope="col">목</th>
        <th scope="col">금</th>
      </tr>
      </thead>

      <consultation-calendar-body
        :prop-calendar-item-dates="calendarItem.dates"
        :is-create="isCreate"
        :statistics-consultations="statisticsConsultations"
        :question="question"
        :is-mobile="isMobile"
        :day-group-times="dayGroupTimes"
        @set-active-date="setActiveDate"
      />

    </table>

  </div>

</template>

<script>
import ConsultationCalendarBody from "@/components/Calendar/ConsultationCalendarBody.vue";
import {mapState, mapActions} from "vuex";
import _ from 'lodash'

export default {
  name: "consultation-calendar",
  props: {
    surveysConsultationCalendar: {
      type: Array
    },
    consultationSetting: {
      type: Object
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
    }
  },
  components: {
    ConsultationCalendarBody
  },
  data() {
    return {
      curMonth: null,
      defaultTimes: [],
      dayGroupTimes: {}
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyEditQuestions: 'surveyEditQuestions',
    }),
    curMonthToFormat() {
      if (!this.curMonth) {
        return ''
      }
      return this.$moment(this.curMonth).format('YYYY년 M월')
    },
    isFirstMonth() {
      if (this.surveysConsultationCalendar.length === 0) {
        return false
      }
      return this.curMonth === this.surveysConsultationCalendar[0].month
    },
    isLastMonth() {
      if (this.surveysConsultationCalendar.length === 0) {
        return false
      }
      return this.curMonth === this.surveysConsultationCalendar[this.surveysConsultationCalendar.length - 1].month
    },
    prevMonth() {
      return this.$moment(this.curMonth).subtract('1', 'month').format('YYYYMM')
    },
    prevMonthDate() {
      return this.$moment(this.curMonth).subtract('1', 'month').format('YYYY-MM-DD')
    },
    nextMonth() {
      return this.$moment(this.curMonth).add('1', 'month').format('YYYYMM')
    },
    nextMonthDate() {
      return this.$moment(this.curMonth).add('1', 'month').format('YYYY-MM-DD')
    },
    lastMonth() {
      try {
        return this.surveysConsultationCalendar[this.surveysConsultationCalendar.length - 1].month
      } catch (e) {
        return null
      }
    },
    nextCreateMonth() {
      return this.$moment(this.lastMonth).add('1', 'month').format('YYYYMM')
    },
    nextCreateMonthDate() {
      if (this.nextCreateMonth) {
        return this.$moment(this.nextCreateMonth).format('YYYY-MM-DD')
      } else {
        return null
      }
    }
  },
  watch: {
    'surveysConsultationCalendar.length'() {
      if (!this.curMonth && this.surveysConsultationCalendar.length > 0) {
        this.curMonth = this.surveysConsultationCalendar[0].month
      }
    }
  },
  created() {
    if(this.isCreate) {
      if(!(this.surveyEditQuestions.items.length > 0)) {
        const itemsDates = this.surveysConsultationCalendar.map(list => {
          return list.dates.map(date => {
            // let sortNo = 0
            return date.times.map(time => {
              const itemsDate = {
                sortNo: 0,
                itemDate: date.date,
                itemTimeStart: time.timeStart,
                itemTimeEnd: time.timeEnd,

                // item 저장 시 필수값
                isEtcAnswer: false,
                isAddedAnswer: false,
                isLimitedTotal: false,
                isLimitedWait: false,
                isWeekTime: false,
                isCanceled: false,
                isDel: false
              }

              return itemsDate
            })
          }).flat(2)
        })
        .flat()
        .filter(itemsDate => {
          return (
            this.$moment(itemsDate.itemDate).isBetween(
              this.surveyEditQuestions.consultationSetting.dateStart,
              this.surveyEditQuestions.consultationSetting.dateEnd,
              undefined,
              '[]'
            )
          )
        })
        itemsDates.map((item, index) => {item.sortNo = ++index})
        this.surveyEditQuestions.items = itemsDates
      }

      this.dayGroupTimes = _.groupBy(this.surveyEditQuestions.items, 'itemDate')
    }
  },
  mounted() {
    if (this.surveysConsultationCalendar.length > 0) {
      this.curMonth = this.surveysConsultationCalendar[0].month
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      getSurveysConsultationCalendar: 'getSurveysConsultationCalendar',
      sortingSurveyEditQuestionConsultationItems: 'sortingSurveyEditQuestionConsultationItems'
    }),
    onClickPrevButton() {
      try {
        const prevMonth = this.surveysConsultationCalendar.find(c => c.month === this.prevMonth)
        if (prevMonth.month) {
          this.curMonth = prevMonth.month
        }

        // 통계일때 emit
        if (!this.isCreate) {
          this.$emit('go-to-prev-month')
        }
      } catch (e) {
        this.$log.warn(e)
      }
    },
    onClickNextButton() {
      try {
        const nextMonth = this.surveysConsultationCalendar.find(c => c.month === this.nextMonth)
        if (nextMonth.month) {
          this.curMonth = nextMonth.month
        }

        // 통계일때 emit
        if (!this.isCreate) {
          this.$emit('go-to-next-month')
        }
      } catch (e) {
        this.$log.warn(e)
      }
    },
    getLastMonthCalendar() {
      try {
        const lastMonth = this.surveysConsultationCalendar.find(c => c.month === this.lastMonth)
        if (lastMonth.month) {
          this.curMonth = lastMonth.month
        }
      } catch (e) {
        this.$log.warn(e)
      }
    },
    onClickAddButton() {
      const opts = {
        reverseButtons: true
      }
      this.$hiClass.confirm('상담 기간을 추가하시겠습니까?', null, opts)
        .then(async () => {

          const calendarRequest = {
            isHoliday: false,
            startDate: this.consultationSetting['dateStart'],
            endDate: this.nextCreateMonthDate,
            startTime: this.consultationSetting['timeStart'],
            endTime: this.consultationSetting['timeEnd'],
            consultTime: this.consultationSetting['timeConsultation'],
            recessTime: this.consultationSetting['timeRecess'],
          }
          this.$log.warn(this.$options.name, calendarRequest)
          await this.getSurveysConsultationCalendar(calendarRequest)

          this.$nextTick(() => {
            this.getLastMonthCalendar()
          })
        })
    },
    isHiddenCalendar(calendarItem) {
      return this.curMonth !== calendarItem.month
    },
    // 통계 웹뷰에서 현재 클릭한 날짜 설정
    setActiveDate(date) {
      this.$emit('set-active-date', date)
    }
  }
}
</script>

<style scoped>
.fcfs__calendar {
  display: block;
}
.calendar__tbl.is-hidden {
  display: none;
}
</style>