<template>
  <div @mouseover="$emit('offVco')" @mouseleave="$emit('onVco')">
    <div class="note-resev-opt">
      <div class="input-box-wrap readonly">
        <input type="text" :value="reservDate" />
      </div>
      <!-- hour select box -->
      <note-board-calendar-reserve-select-box
        mode="HOUR"
        :value.sync="option.selectedTime.hour"
      />

      <!-- minute select box -->
      <note-board-calendar-reserve-select-box
        mode="MINUTE"
        :value.sync="option.selectedTime.minute"
      />
    </div>
    <div class="btn-wrap">
      <button
        class="btn-bg-w2 modal-close-btn"
        @click="$emit('closeCalendar')"
      >
        취소
      </button>
      <button
        class="btn-bg-c"
        @click="confirm"
      >
        완료
      </button>
    </div>
  </div>
</template>

<script>
import NoteBoardCalendarReserveSelectBox from './NoteBoardCalendarReserveSelectBox'
import {eventBus} from "@/main";

export default {
  name: 'note-board-calendar-reserve',
  components: {
    NoteBoardCalendarReserveSelectBox
  },
  props: {
    option: {
      type: Object,
      required: true
    },
    optionMode: {
      type: String
    },
    isReserve: {
      type: Boolean,
      required: true
    },
    isTimestampEnd: {
      type: Boolean
    }
  },
  computed: {
    reservDate() {
      return this.$moment(this.option.curDate).format('YYYY년 M월 D일')
    }
  },
  created() {},
  mounted() {
    eventBus.$on('note-board-confirm', () => {
      this.newConfirm()
      setTimeout(()=>{
        eventBus.$emit('note-board-set-is-selected-reserve', false)
      })
    })
    if (!this.isReserve && !this.isTimestampEnd) {
      this.setDefaultTime()
    }
    this.$emit('setOptionMode', 'RESERVE')
  },
  beforeDestroy() {
    eventBus.$off('note-board-confirm')
    this.$emit('setOptionMode', '')
    this.$nextTick(() => {
      setTimeout(() => {
        this.$emit('onVco')
      }, 100)
    })
  },
  methods: {
    setDefaultTime() {
      const curTime = this.$moment()
      const reserveDateTime = curTime.add(10, 'minutes')

      let hour = reserveDateTime.hour()
      let minute = reserveDateTime.minute()

      this.option.selectedTime = {
        hour,
        minute
      }
    },
    getReserveTimestamp() {
      // 예약일에 예약시간 추가
      const reserveTimestamp = this.$moment(this.option.curDate)
        .add(this.option.selectedTime.hour, 'hour')
        .add(this.option.selectedTime.minute, 'minutes')
        .valueOf()

      this.$log.warn(`getReserveTimestamp => `, reserveTimestamp)
      return reserveTimestamp
    },
    newConfirm() {
      let model = {}
      const timestamp = this.$moment(this.option.curDate).add(this.option.selectedTime.hour, 'hour')
        .add(this.option.selectedTime.minute - 10, 'minutes').valueOf()
      const isBefore = this.$moment(this.$moment(this.option.curDate)).isBefore(this.$moment())

      model = {
        postStatus: isBefore ? '' : 'RESERVE',
        posted: timestamp
      }
      if (this.isTimestampEnd) {
        model = {
          timestampEnd: timestamp
        }
      }
      this.$emit('setModel', model)
      this.$emit('closeCalendar')
    },
    confirm() {
      let model = {}
      const reserveTimestamp = this.getReserveTimestamp()
      const curTimestamp = this.$moment()
        .add(9 , 'minutes') // 예약 시간은 10분 후 이상만 지정 가능
        .valueOf()
      if (reserveTimestamp <= curTimestamp) {
        alert('선택할 수 없는 예약 시간입니다.')
        return false
      }
      model = {
        postStatus: 'RESERVE',
        posted: reserveTimestamp
      }
      if (this.isTimestampEnd) {
        model = {
          timestampEnd: this.getReserveTimestamp()
        }
      }
      this.$emit('setModel', model)
      this.$emit('closeCalendar')
    }
  }
}
</script>

<style scoped></style>
