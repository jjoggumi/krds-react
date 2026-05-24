<template>
  <div
      class="note-calendar-popup note-resev-pop"
      style="display: block;"
      v-click-outside="closePopupCalendar"
  >
    <div class="popup-calendar-wrap">
      <div class="calendar-title-wrap">
        <button class="arr-btn prev-btn" @click="changeCalenderMonth(-1)"/>
        <div class="calendar-wrap">
          {{ `${calendar.year}년 ${calendar.month + 1}월` }}
        </div>
        <button class="arr-btn next-btn" @click="changeCalenderMonth(1)"/>
        <button class="today-btn" @click="setGoToday">오늘</button>
      </div>
      <div class="calendar-table-wrap">
        <table>
          <thead>
            <tr>
              <th>S</th>
              <th>M</th>
              <th>T</th>
              <th>W</th>
              <th>T</th>
              <th>F</th>
              <th>S</th>
            </tr>
          </thead>
          <tbody>
          <tr v-for="i in visibleRows" :key="i">
            <!-- 높이 자동 높이 -->
            <template v-for="j in 7">
              <template v-if="getDate(i, j) <= calendar.daysInMonth">
                <td
                    :key="(i + 1) * j" @click="selectDay(getDate(i, j))"
                    :class="{
                      'today': today.year === calendar.year &&
                      today.month === calendar.month &&
                      today.day === getDate(i, j),
                      'selected': calendar.year === selected.year &&
                      calendar.month === selected.month &&
                      getDate(i, j) === selected.day
                    }"
                >
                  {{ getDate(i, j) }}
                </td>
              </template>
              <template v-else>
                <td class="empty" :key="(i + 1) * j"></td>
              </template>
            </template>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="note-resev-opt">
      <div class="input-box-wrap readonly">
        <input
            type="text"
            :value="`${selected.year}년 ${selected.month + 1}월 ${selected.day}일`"
        >
      </div>
      <div
          class="border-selectbox-wrap custom-select-box-wrap"
          :class="{'selected': showHourOption}"
      >
        <div
            class="selected-option"
            id="selectedOptionHour"
            @click="toggleHourOption"
            v-click-outside="toggleHourOption"
        >
          <div class="option-val">{{ `${selected.hour}시` }}</div>
        </div>
        <div class="option-list-wrap">
          <div>
            <ul>
              <li
                  id="hour-option-0"
                  @click="selectHour(0)"
                  :class="{'selected': selected.hour === 0}"
              >
                <div class="option-item">0시</div>
              </li>
              <li
                  :id="`hour-option-${h}`"
                  v-for="h of 23"
                  :key="`calendar-hour-option-${h}`"
                  @click="selectHour(h)"
                  :class="{'selected': selected.hour === h}"
              >
                <div class="option-item">{{ `${h}시` }}</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div
          class="border-selectbox-wrap custom-select-box-wrap"
          :class="{'selected': showMinOption}"
      >
        <div
            class="selected-option"
            id="selectedOptionMin"
            @click="toggleMinOption"
            v-click-outside="toggleMinOption"
        >
          <div class="option-val">{{ `${selected.minute}분` }}</div>
        </div>
        <div class="option-list-wrap">
          <div>
            <ul>
              <li
                  id="min-option-0"
                  @click="selectMin(0)"
                  :class="{'selected': selected.minute === 0}"
              >
                <div class="option-item">0분</div>
              </li>
              <li
                  :id="`min-option-${m}`"
                  v-for="m of 59"
                  :key="`calendar-min-option-${m}`"
                  @click="selectMin(m)"
                  :class="{'selected': selected.minute === m}"
              >
                <div class="option-item">{{ `${m}분` }}</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="btn-wrap">
      <button
          class="btn-bg-w2 modal-close-btn"
          @click="closePopupCalendar(false)"
      >
        취소
      </button>
      <button
          class="btn-bg-c"
          @click="closePopupCalendar(true)"
      >
        완료
      </button>
    </div>
  </div>
</template>

<script>
import moment from 'moment-timezone'
import {mapActions} from "vuex";

export default {
  name: "calendar-popup",
  data() {
    return{
      calendar: {
        year: 0,
        month: 0,
        day: 0,
        daysInMonth: 0
      },
      today: {
        year: 0,
        month: 0,
        day: 0
      },
      selected: {
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0
      },
      showHourOption: false,
      showMinOption: false
    }
  },
  props: {
    defaultSelectedDate: {
      type: Object
    },
    minutePadding: {
      type: Number,
      default: 9
    },
    notForReservation: {
      type: Boolean,
      default: false
    },
    defaultPaddingMinutes: {
      type: Number,
      default: 10
    },
    maxDateTimestamp: {
      type: Number,
      default: 0
    }
  },
  computed: {
    visibleRows() {
      return Array.from({ length: 6 }, (_, k) => k + 1).filter((i) => this.hasRowDate(i));
    }
  },
  methods: {
    ...mapActions({
      getCalenderHolidays: 'getCalenderHolidays'
    }),
    /**
     * 달력 열렸을때 날짜 data 설정
     */
    initDate() {
      this.today.year = parseInt(moment().tz('Asia/Seoul').format('YYYY'))
      this.today.month = parseInt(moment().tz('Asia/Seoul').format('M')) - 1
      this.today.day = parseInt(moment().tz('Asia/Seoul').format('DD'))

      // props로 넘어온 날짜데이터가 있으면
      for (const [key, value] of Object.entries(this.defaultSelectedDate)) {
        this.selected[key] = value
        this.calendar[key] = value
      }
    },

    /**
     * 이번달의 일수 구하기
     */
    getDaysInMonth() {
      let calenderHolidays = localStorage.getItem('calenderHolidays')
      if (calenderHolidays === undefined || calenderHolidays === null) {
        this.getCalenderHolidays({ year: this.calendar.year })
      } else {
        try {
          let list = JSON.parse(calenderHolidays)
          // prevYear 공휴일 정보가 없는 경우
          if (list[0].year !== this.calendar.year - 1)
            this.getCalenderHolidays({ year: this.calendar.year })
        } catch (error) {
          this.getCalenderHolidays({ year: this.calendar.year })
        }
      }
      this.calendar.daysInMonth = new Date(this.calendar.year, this.calendar.month + 1, 0).getDate()
    },

    /**
     * 날짜 구하기
     * @param i
     * @param j
     * @returns {string|number}
     */
    getDate(i, j) {
      const firstDay = new Date(this.calendar.year, this.calendar.month).getDay()
      const date = (i - 1) * 7 + j
      if (date > firstDay) {
        return date - firstDay
      }
      return ''
    },

    hasRowDate(i) {
      for (let j = 1; j <= 7; j++) {
        const d = this.getDate(i, j)
        if (d !== '' && d <= this.calendar.daysInMonth) return true
      }
      return false
    },

    /**
     * 시 선택창 열기
     */
    toggleHourOption(e) {
      if (e.currentTarget.id === 'selectedOptionHour') {
        this.showHourOption = !this.showHourOption
        if (this.showHourOption) {
          this._doFocus(`hour-option-${this.selected.hour}`)
        }
      } else { // 외부 클릭시
        this.showHourOption = false
      }
    },

    /**
     * 분 선택창 열기
     */
    toggleMinOption(e) {
      if (e.currentTarget.id === 'selectedOptionMin') {
        this.showMinOption = !this.showMinOption
        if (this.showMinOption) {
          this._doFocus(`min-option-${this.selected.minute}`)
        }
      } else { // 외부 클릭시
        this.showMinOption = false
      }
    },

    /**
     * 선택창 열었을때 선택된 아이템으로 포커싱
     * @param id
     * @private
     */
    _doFocus(id) {
      this.$nextTick(() => {
        document.getElementById(id).scrollIntoView()
      })
    },

    isOverMaxDate(date) {
      if (this.maxDateTimestamp === 0) return false
      const selectedTimestamp = new Date(moment({ year: this.calendar.year, month: this.calendar.month, day: date}).format()).getTime()
      return selectedTimestamp > this.maxDateTimestamp
    },
    
    /**
     * 날짜 선택
     * @param date
     * @returns {boolean}
     */
    selectDay(date) {
      if (date === '' || this.isOverMaxDate(date)) {
        return false
      }

      const selectedTimestamp = new Date(moment({ year: this.calendar.year, month: this.calendar.month, day: date}).format()).getTime()
      const todayTimestamp = new Date(moment({ year: this.today.year, month: this.today.month, day: this.today.day}).format()).getTime()

      // 예약일이 오늘보다 이전이면
      if (selectedTimestamp < todayTimestamp) {
        return false
      }
      this.selected.year = this.calendar.year
      this.selected.month = this.calendar.month
      this.selected.day = date

      if (selectedTimestamp === todayTimestamp) {
        const nowTimestamp = new Date(moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm')).getTime() + this.defaultPaddingMinutes * 60000
        this.selected = this._getDateObj(nowTimestamp)
      }
    },

    /**
     * 달력을 오늘로 이동
     */
    setGoToday() {
      this.calendar.year = this.today.year
      this.calendar.month = this.today.month
      this.calendar.day = this.today.day

      const nowTimestamp = new Date(moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm')).getTime() + this.defaultPaddingMinutes * 60000
      this.selected = this._getDateObj(nowTimestamp)
    },

    /**
     * 시 선택
     * @param hour
     */
    selectHour(hour) {
      
    
      const cloneSelected = _.cloneDeep(this.selected)
      cloneSelected.hour = hour

      // 이전시간 선택 불가
      const nowTimestamp = new Date(moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm')).getTime() + this.minutePadding * 60 * 1000
      if (this._getTimestamp(cloneSelected) <= nowTimestamp) {
        this.$hiClass.alert(`선택할 수 없는${this.notForReservation ? '' : ' 예약'} 시간입니다.`)
        return false
      }

      this.selected.hour = hour
      this.showHourOption = false
    },

    /**
     * 분 선택
     * @param minute
     */
    selectMin(minute) {
      const cloneSelected = _.cloneDeep(this.selected)
      cloneSelected.minute = minute

      // 이전시간 선택 불가
      const nowTimestamp = new Date(moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm')).getTime() + this.minutePadding * 60 * 1000
      if (this._getTimestamp(cloneSelected) <= nowTimestamp) {
        this.$hiClass.alert(`선택할 수 없는${this.notForReservation ? '' : ' 예약'} 시간입니다.`)
        return false
      }

      this.selected.minute = minute
      this.showMinOption = false
    },

    isOnMaxDate() {
      if (this.maxDateTimestamp === 0) return false
      const lastDayOfMonth = moment({
        year: this.calendar.year,
        month: this.calendar.month,
        day: this.calendar.daysInMonth,
        hour: 23,
        minute: 59,
        second: 59
      }).valueOf();
      return lastDayOfMonth >= this.maxDateTimestamp;
    },

    /**
     * 달력 월 변경
     * @param move
     */
    changeCalenderMonth(move) {
      if (move > 0 && this.isOnMaxDate()) return;
      if (this.calendar.month === 0 && move === -1) { // 현재가 1월일때 이전월로 이동
        this.calendar.year = this.calendar.year - 1
        this.calendar.month = 11
      } else if (this.calendar.month === 11 && move === 1) { // 현재가 12월일때 다음월로 이동
        this.calendar.year = this.calendar.year + 1
        this.calendar.month = 0
      } else {
        this.calendar.month = this.calendar.month + move
      }
      this.getDaysInMonth()
    },

    /**
     * 달력 닫기
     * @param eventTarget
     */
    closePopupCalendar(eventTarget) {
      // 선택 불가 시간 선택시 노출되는 알럿 버튼이 외부 클릭으로 인식됨 방지
      if (eventTarget.target !== undefined && eventTarget.target.className.includes('swal2')) {
        return false
      }

      if (eventTarget.type !== undefined) {
        eventTarget = false
      }
      this.$emit('closePopupCalendar', eventTarget ? this.selected : null)
    },

    /**
     * timestamp 구하기
     * @param dateObj
     * @returns {number}
     * @private
     */
    _getTimestamp(dateObj) {
      return new Date(moment(dateObj).format()).getTime()
    },

    /**
     * date 객체 구하기
     * @param timestamp
     * @returns {{month: number, hour: number, year: number, day: number, minute: number}}
     * @private
     */
    _getDateObj(timestamp) {
      return {
        year: parseInt(moment(timestamp).format('YYYY')),
        month: parseInt(moment(timestamp).format('M')) - 1,
        day: parseInt(moment(timestamp).format('DD')),
        hour: parseInt(moment(timestamp).format('HH')),
        minute: parseInt(moment(timestamp).format('mm'))
      }
    }
  },
  async created() {
    await this.initDate()
    await this.getDaysInMonth()
  }
}
</script>

<style scoped lang="scss">
.note-calendar-popup {
    z-index: 3;
    position: absolute;
    top: calc(100% + 4px);
    right: -15%;
    background-color: #fff;
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.16);
    border-radius: 0 0 4px 4px;
    .popup-calendar-wrap {
      box-shadow: none;
      .calendar-table-wrap {
        table {
          td.empty {
            padding: 0;
            min-width: 0;
            height: 0;
            line-height: 0;
            cursor: default;
            pointer-events: none;
          }
        }
      }
    }
    .note-resev-opt{
      padding-bottom: 0;
      display: flex;
      gap: 8px;
    }
}
</style>