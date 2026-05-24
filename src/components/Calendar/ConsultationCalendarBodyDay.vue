<template>
  <td>

    <template v-if="date">

      <div class="top">
        <span class="day">{{ dayStr }}</span>
        <div class="hi-switch">
          <input
            type="checkbox"
            :id="checkBoxUniqueId"
            :checked="cModel"
            @click.prevent.stop="onClickSwitch"
          >
          <label
            :for="checkBoxUniqueId"
            @click.prevent.stop="onClickSwitch"
          >
            <span class="track"></span>
          </label>
        </div>
      </div>

      <div class="bottom">
        <p
          v-if="!cModel"
          class="nodata"
        >
          상담없음
        </p>

        <template
          v-if="cModel"
        >
          <ul class="booking__list">
            <consultation-calendar-body-day-item
              v-for="(itemsDate, timeIndex) of itemsDates"
              :key="`${itemsDate.itemTimeStart}-${itemsDate.itemTimeEnd}-${timeIndex}`"
              :prop-items-date="itemsDate"
              :prop-items-dates="itemsDates"
              @do-delete-item="doDeleteItem"
              @do-update-item="doUpdateItem"
            />
          </ul>
          <button
            class="btn-add"
            @click="onClickAddTime"
          >
            상담 추가
          </button>

        </template>

      </div>

    </template>

  </td>

</template>

<script>
import {mapActions, mapState} from "vuex";
import {v4 as uuidv4} from "uuid";
import { getTimeToMinute } from "@/plugins/utils";
import ConsultationCalendarBodyDayItem from "@/components/Calendar/ConsultationCalendarBodyDayItem.vue";

export default {
  name: "consultation-calendar-body-day",
  components: {
    ConsultationCalendarBodyDayItem,
  },
  props: {
    propDay: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      componentUUID: null,
      itemsDates: [],
      cModel: false,
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyEditQuestions: 'surveyEditQuestions',
    }),
    surveyEditQuestionsItems: {
      get() {
        return this.surveyEditQuestions.items
      },
      set(val) {
        if (Array.isArray(val)) {
          this.surveyEditQuestions.items.push(...val)
        } else {
          this.surveyEditQuestions.items = val
        }
      }
    },
    consultationSetting() {
      return this.surveyEditQuestions.consultationSetting
    },
    date() {
      return this.propDay.date
    },
    // times() {
    //   return this.propDay.times
    // },
    week() {
      return this.propDay.week
    },
    dayStr() {
      return this.$moment(this.date).date()
    },

    filteredItemsDates() {
      return this.surveyEditQuestionsItems.filter(item => item.itemDate === this.date)
    },
    existsItemsDate() {
      return this.filteredItemsDates.length > 0
    },
    includesConsultationSettingDate() {
      return this.$moment(this.date).isBetween(
        this.consultationSetting.dateStart,
        this.consultationSetting.dateEnd,
        undefined,
        '[]'
      )
    },
    checkBoxUniqueId() {
      return `consultation-calendar-body-day-check-box-${this.componentUUID}`
    },
    isReadyMadeCalendar() {
      return this.surveyEditQuestionsItems.find(item => item.itemId)
    },
  },
  watch: {
    async cModel(val) {
      // console.log("cModel => ", val)
      // if (val && this.itemsDates.length === 0) {
      //   this.initNewItemsDates()
      // }
      // if (this.itemsDates.length > 0) {
      //   // this.filteredItemsDates.map(item => { item.isDel = !this.cModel })
      //   console.log("this.itemsDates => ", this.itemsDates)
      //   this.itemsDates.map(item => { item.isDel = !this.cModel })
      //   console.log("this.surveyEditQuestions.items => ", this.surveyEditQuestions.items)
      //   await this.sortingSurveyEditQuestionConsultationItems({
      //     items: this.surveyEditQuestions.items
      //   })
      //   // 삭제 예정인 item 제외
      //   const filteredItems = this.surveyEditQuestionsItems.filter(item => !item.isDel)
      //   console.log("filteredItems => ", filteredItems)
      //   if (filteredItems.length > 0) {
      //     const firstItemDate = filteredItems[0].itemDate
      //     const lastItemDate = filteredItems[filteredItems.length -1].itemDate

      //     this.consultationSetting.dateStart = firstItemDate
      //     this.consultationSetting.dateEnd = lastItemDate
      //   }
      // }
    }
  },
  created() {
    this.componentUUID = uuidv4()
  },
  mounted() {
    if(this.propDay.date) {
      this.itemsDates = this.propDay.dayTimes
    }

    // 저장한 상담 시간 아이템이 있는 경우
    // if (this.existsItemsDate) {
    //   this.itemsDates = this.filteredItemsDates
    // }

    // // 신규 캘린더이고, 설정한 상담 기간에 현재 캘린더 요일이 포함된 경우 상담 초기값 추가
    // if (!this.isReadyMadeCalendar && this.includesConsultationSettingDate) {
    //   this.initNewItemsDates()
    // }

    // 토글 스위치 on
    if (this.itemsDates.length > 0) {
      this.cModel = true
    }
  },
  methods: {
    ...mapActions({
      arrayInObjectSort: 'arrayInObjectSort'
    }),
    ...mapActions('storeSurvey', {
      sortingSurveyEditQuestionConsultationItems: 'sortingSurveyEditQuestionConsultationItems'
    }),
    initNewItemsDates() {
      const itemsDates = []
      let sortNo = 0

      const orgKeys = this.surveyEditQuestionsItems.map(o => `${o.itemDate}${o.itemTimeStart}${o.itemTimeEnd}`)
      if (Array.isArray(this.propDay.times)) {
        this.propDay.times.map(time => {
          const itemsDate = {
            sortNo: ++sortNo,
            itemDate: this.date,
            itemTimeStart: time.timeStart,
            itemTimeEnd: time.timeEnd,

            // item 저장 시 필수값
            isEtcAnswer: false,
            isAddedAnswer: false,
            isLimitedTotal: false,
            isLimitedWait: false,
            isWeekTime: false,
            isCanceled: false,
          }
          if(!orgKeys.includes(`${itemsDate.itemDate}${itemsDate.itemTimeStart}${itemsDate.itemTimeEnd}`)) {
            itemsDates.push(itemsDate)
          }
        })
        // 신규 time 을 items 에 포함
        this.surveyEditQuestionsItems = itemsDates
        this.itemsDates = this.filteredItemsDates
      }
    },
    onClickAddTime() {
      const foundIndex1 = this.itemsDates.findIndex(item => item.isAddItem)
      const foundIndex2 = this.surveyEditQuestionsItems.findIndex(item => item.isAddItem)
      if (foundIndex1 > -1) {
        this.itemsDates.splice(foundIndex1, 1)
      }
      if (foundIndex2 > -1) {
        this.surveyEditQuestionsItems.splice(foundIndex2, 1)
      }

      let itemTimeStart
      let itemTimeEnd

      try {
        const prevItemTimeEnd = this.itemsDates[this.itemsDates.length -1].itemTimeEnd
        const prevMinute = getTimeToMinute(prevItemTimeEnd)
        const newTimeStartMinute = prevMinute + (Number.isNaN(this.consultationSetting.timeRecess) ? 0 : this.consultationSetting.timeRecess)
        const newTimeEndMinute = newTimeStartMinute + (Number.isNaN(this.consultationSetting.timeConsultation) ? 0 : this.consultationSetting.timeConsultation)

        const newTimeStart = this.$moment.utc().startOf('day')
          .add(newTimeStartMinute, 'minutes')
          .format('HH:mm')
        const newTimeEnd = this.$moment.utc().startOf('day')
          .add(newTimeEndMinute, 'minutes')
          .format('HH:mm')

        itemTimeStart = newTimeStart
        itemTimeEnd = newTimeEnd

      } catch (e) {
        this.$log.warn(e)
        const timeConsultation = Number.isNaN(this.consultationSetting.timeConsultation) ? 0 : this.consultationSetting.timeConsultation

        itemTimeStart = this.consultationSetting.timeStart
        const itemTimeEndMinute = getTimeToMinute(itemTimeStart) + timeConsultation
        itemTimeEnd = this.$moment.utc().startOf('day')
          .add(itemTimeEndMinute, 'minutes')
          .format('HH:mm')
      }

      const newItemsDate = {
        sortNo: 1,
        itemDate: this.date,
        itemTimeStart: itemTimeStart,
        itemTimeEnd: itemTimeEnd,
        isAddItem: true,

        // item 저장 시 필수값
        isEtcAnswer: false,
        isAddedAnswer: false,
        isLimitedTotal: false,
        isLimitedWait: false,
        isWeekTime: false,
        isCanceled: false,
      }
      this.itemsDates.push(newItemsDate)
      this.surveyEditQuestionsItems.push(newItemsDate)
    },
    doDeleteItem(paramItem) {
      const foundIndex = this.itemsDates.findIndex(d => d === paramItem)
      const foundIndex2 = this.surveyEditQuestionsItems.findIndex(d => (d.itemDate === paramItem.itemDate && d.itemTimeStart === paramItem.itemTimeStart && d.itemTimeEnd === paramItem.itemTimeEnd))

      if (foundIndex > -1) {
        this.itemsDates.splice(foundIndex, 1)
      }
      if (foundIndex2 > -1) {
        this.surveyEditQuestionsItems.splice(foundIndex2, 1)
      }
    },
    doUpdateItem(paramItem, copyItem) {
      const foundIndex = this.itemsDates.findIndex(d => d === paramItem)
      const storeFoundIndex = this.surveyEditQuestionsItems.findIndex(d => (d.itemDate === copyItem.itemDate && d.itemTimeStart === copyItem.itemTimeStart && d.itemTimeEnd === copyItem.itemTimeEnd))
      const foundIndex2 = storeFoundIndex > -1 ? storeFoundIndex : this.surveyEditQuestionsItems.findIndex(d => d === paramItem)

      if (foundIndex > -1) {
        this.itemsDates[foundIndex] = paramItem
      }
      if (foundIndex2 > -1) {
        this.surveyEditQuestionsItems.splice(foundIndex2, 1, paramItem)
      } 
      
      this.arrayInObjectSort({
        array: this.itemsDates,
        sortingTargets: ['itemTimeStart']
      })
    },
    onClickSwitch() {
      // 상담 시작일은 오늘부터 설정 가능
      if (!this.cModel) {
        const todayDate = this.$moment().format('YYYY-MM-DD')
        const isBefore = this.$moment(this.date).isBefore(todayDate)
        if (isBefore) {
          this.$toasted.clear()
          this.$toasted.show('지난 요일은 상담 시간을 추가할 수 없습니다.')
          return false
        }
      }

      if (this.cModel) {
        const foundIsUsedResponse = this.itemsDates.find(item => item.isUsedResponse)
        if (foundIsUsedResponse) {
          this.$toasted.clear()
          this.$toasted.show('신청 내역이 존재하여  변경이 불가합니다.')
          return false
        } else {
          this.cModel = !this.cModel
        }
      } else {
        this.cModel = !this.cModel
      }
      this.onClickSwitchChange()
    },
    async onClickSwitchChange() {
      if (this.cModel && this.itemsDates.length === 0) {
        this.initNewItemsDates()
      }

      if (this.itemsDates.length > 0) {
        this.filteredItemsDates.map(item => { item.isDel = !this.cModel })
        this.itemsDates.map(item => { item.isDel = !this.cModel })
        
        await this.sortingSurveyEditQuestionConsultationItems({
          items: this.surveyEditQuestions.items
        })

        // 삭제 예정인 item 제외
        const filteredItems = this.surveyEditQuestionsItems.filter(item => !item.isDel)
        if (filteredItems.length > 0) {
          const firstItemDate = filteredItems[0].itemDate
          const lastItemDate = filteredItems[filteredItems.length -1].itemDate

          this.consultationSetting.dateStart = firstItemDate
          this.consultationSetting.dateEnd = lastItemDate
        }
      }
    }
  }
}
</script>

<style scoped>

</style>