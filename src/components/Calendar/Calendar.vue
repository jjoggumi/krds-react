<template>
  <div class="componentCalendar">

    <div class="inputbox calendar">

      <input
        type="text"
        :value="calendarDateStr"
        readonly
        :disabled="disabled"
        @click="isPopupCalendar = true"
        placeholder="선택"
      >
      <button
        class="btn-calendar"
        :disabled="disabled"
        @click="isPopupCalendar = true"
      ></button>

      <calendar-monthly
        v-if="isPopupCalendar"
        v-click-outside="closePopupCalendar"
        :timestamp="calendarDateTimestamp"
        :value-goe="valueGoe ? $moment($moment(valueGoe).format('YYYY-MM-DD')).valueOf() : null"
        :message-goe="messageGoe"
        :should-set-value="shouldSetValue"
        @selectedDate="setCalendarDateTimestamp"
      />

    </div>

    <div class="hi-selectbox">
      <button
        class="selected"
        :disabled="disabled"
        @click="isOpenHour = true"
      >
        {{ hour === null ? '선택' : `${hour}시` }}
      </button>

      <div
        v-if="isOpenHour"
        v-click-outside="closeHour"
        class="option__layer"
        style="display: block"
      >
        <button
          v-if="defaultSelect"
          class="option"
          :class="{
            'is-selected': hour === null
          }"
          :value="null"
          @click="selectHour(null)"
        >
          선택
        </button>
        <button
          v-for="i of 24"
          :key="i"
          class="option"
          :class="{
            'is-selected': hour === i - 1
          }"
          :value="i - 1"
          @click="selectHour(i - 1)"
        >
          {{ i - 1 }}시
        </button>
      </div>
    </div>


    <div class="hi-selectbox">
      <button
        class="selected"
        :disabled="disabled"
        @click="isOpenMinute = true"
      >
        {{ minute === null ? '선택' : `${minute}분` }}
      </button>

      <div
        v-if="isOpenMinute"
        v-click-outside="closeMinute"
        class="option__layer"
        style="display: block"
      >
        <button
          v-if="defaultSelect"
          class="option"
          :class="{
            'is-selected': minute === null
          }"
          :value="null"
          @click="selectMinute(null)"
        >
          선택
        </button>
        <button
          v-for="item of minuteList"
          :key="item"
          class="option"
          :class="{
            'is-selected': minute === item
          }"
          :value="item"
          @click="selectMinute(item)"
        >
          {{ item }}분
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import CalendarMonthly from "@/components/Calendar/CalendarMonthly";
export default {
  name: "calendar",
  components: {
    CalendarMonthly
  },
  props: {
    value: {
      type: [Number, null]
    },
    valueGoe: {
      type: [Number, null]
    },
    messageGoe: {
      type: String
    },
    /**
     * init manipulate
     * method: 'add',
     * amount: 7,
     * unit: 'days'
     */
    initManipulate: {
      type: [Object, null]
    },
    disabled: {
      type: Boolean,
      default() {
        return false
      }
    },
    defaultSelect: {
      type: Boolean,
      default() {
        return true
      }
    },
    shouldSetValue: {
      type: Boolean,
      default() {
        return true
      }
    },
    initProp: {
      type: String
    }
  },
  data() {
    return {
      isPopupCalendar: false,
      isOpenHour: false,
      isOpenMinute: false,

      calendarDateTimestamp: null,

      hour: null,
      beforeHour: null,
      minute: null,
      beforeMinute: null,
      minuteList: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
    }
  },
  computed: {
    calendarDateStr() {
      return this.calendarDateTimestamp
        ? this.$moment(this.calendarDateTimestamp).format('YYYY년 M월 D일')
        : ''
    },
    computedTimestamp() {
      try {
        const array = [this.calendarDateTimestamp, this.hour, this.minute]
        const exitsValues = array.every(d => d !== null)
        if (exitsValues) {
          const dateTime = this.$moment(this.calendarDateTimestamp)
          dateTime.add(this.hour, 'hour')
          dateTime.add(this.minute, 'minute')
          return dateTime.valueOf()
        } else {
          return null
        }
      } catch (e) {
        return null
      }
    },
  },
  watch: {
    computedTimestamp(val) {
      this.$emit('update:value', val)
    }
  },
  mounted() {
    this.initCalendarTime(this.value)
    this.initCalendarDate(this.value)
    this.initSelectBox(this.value)
    if(!this.defaultSelect) {
      this.beforeHour = this.$moment(this.value).get('hour')
      this.beforeMinute = this.$moment(this.value).get('minute')
    }
    setTimeout(() => {
      this.$emit('update:value', this.computedTimestamp)
    }, 1000)
  },
  methods: {
    closePopupCalendar() {
      this.isPopupCalendar = false
    },
    closeHour() {
      this.isOpenHour = false
    },
    closeMinute() {
      this.isOpenMinute = false
    },
    initCalendarTime(value) {
      let initHour = this.$moment().hour()
      let initMinute = this.$moment().minute()

      let setHour
      let setMin

      if (initMinute < 56) {
        setHour = initHour
        setMin = Math.ceil(initMinute/5)*5
      } else {
        setHour = initHour === 23 ? 0 : initHour + 1
        setMin = 0
      }

      if (!value) {
        switch (this.initProp) {
          case 'timestampStart': {
            this.hour = 9
            this.minute = 0
            break
          }
          case 'timestampEnd': {
            this.hour = 0
            this.minute = 0
            break
          }
          default: {
            this.hour = setHour
            this.minute = setMin
          }
        }
      }
    },
    initCalendarDate(value) {
      if (!this.shouldSetValue) return
      let initTimestamp = this.$moment().valueOf()

      try {
        if (this.initManipulate) {
          const method = this.initManipulate.method
          const amount = this.initManipulate.amount
          const unit = this.initManipulate.unit
          initTimestamp = this.$moment()[method](amount, unit).valueOf()
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}

      const dateTime = new Date(value || initTimestamp)
      const dateTimeJson = {
        year: dateTime.getFullYear(),
        month: dateTime.getMonth(),
        date: dateTime.getDate()
      }
      this.setCalendarDateTimestamp(dateTimeJson)
    },
    initSelectBox(value) {
      if (value) {
        const dateTime = this.$moment(value)
        this.hour = dateTime.get('hour')
        this.minute = dateTime.get('minute')
      }
    },
    /**
     * TODO: mac safari 브라우저는 new Date 생성자가 YYYY-M-D 포맷 parse 를 지원하지 않음 -> YYYY-MM-DD 또는 YYYY/MM/DD 포맷 parse 로 변경
     * ref: https://github.com/felixge/node-dateformat/issues/73#issuecomment-371155864
     * @param dateTimeJson
     */
    setCalendarDateTimestamp(dateTimeJson) {
      const tmpYear = dateTimeJson.year
      let tmpMonth = dateTimeJson.month + 1
      if (tmpMonth.toString().length === 1) {
        tmpMonth = '0' + tmpMonth
      }
      let tmpDate = dateTimeJson.date
      if (tmpDate.toString().length === 1) {
        tmpDate = '0' + tmpDate
      }
      const dateTime = `${tmpYear}/${tmpMonth}/${tmpDate}`
      this.calendarDateTimestamp = this.$moment(dateTime, 'YYYY/MM/DD', true).valueOf()
    },
    selectHour(value) {
      this.hour = value
      this.closeHour()
      this.$toasted.clear()
      setTimeout(() => {
        if (this.valueGoe && this.value && this.value < this.valueGoe) {
          this.$toasted.show('현재 시간 이후로 선택해주세요.')
          this.isOpenHour = true
          this.hour = this.defaultSelect ? null : this.beforeHour
          return false
        } else {
          this.beforeHour = this.hour
        }
      }, 100)
    },
    selectMinute(value) {
      this.minute = value
      this.closeMinute()
      this.$toasted.clear()

      setTimeout(() => {
        if (this.valueGoe && this.value && this.value < this.valueGoe) {
          this.$toasted.show('현재 시간 이후로 선택해주세요.')
          this.isOpenMinute = true
          this.minute = this.defaultSelect ? null : this.beforeMinute
          return false
        } else {
          this.beforeMinute = this.minute
        }
      }, 100)
    },

  }
}
</script>

<style scoped>
.componentCalendar {
  display: inline-block;
}
</style>