<template>
  <!--
  type01: 출결알리기
  type02: 미사용
  type03: 행동기록
  -->
  <div
    class="calendar__layer"
    :class="{
      type01: calendarType === 'type01',
      type02: calendarType === 'type02',
      type03: calendarType === 'type03',
    }"
  >
    <div class="calendar__top">
      <div class="heading">{{ calendarYear }}년 {{ calendarMonth + 1 }}월</div>
      <button v-if="isShowPrev" class="btn-prev" :class="{ 'sr-only': hidePrevBtn && isHidePrev() }" @click="showPrev('month')"></button>
      <button v-if="isShowNext" class="btn-next" :class="{ 'sr-only': hideNextBtn && isHideNext() }" @click="showNext('month')"></button>
      <button v-if="isNoPreSelect" class="btn-today" @click="changeCalender">월</button>
      <button v-else class="btn-today" @click="isTodayHoliday ? disabledClick() : setToday()">오늘</button>
    </div>
    <div class="calendar__table">
      <table class="calendar">
        <thead>
          <tr>
            <th v-for="(item, index) of calendarTableHeadList" :key="`${item}-${index}`">
              {{ item }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="i of 6" :key="i">
            <template v-for="j of 7">
              <template v-if="getDate(i, j) !== '' && getDate(i, j) <= daysInMonth">
                <td
                  :key="(i + 1) * j"
                  :class="{
                    empty: getDate(i, j) === '',
                    today: isCurMonth(calendarYear, calendarMonth) && getDate(i, j) === today.date,
                    'is-selected': selectedDate === getSelectedDate(getDate(i, j)),
                    'holy-day': shouldAddClassHoliday(i, j, calendarYear, calendarMonth),
                    'selectable-holi-day': shouldAddClassSelectableHoliday(i, j, calendarYear, calendarMonth),
                    disabled: isDisabled(calendarYear, calendarMonth, getDate(i, j)),
                    'is-other-selected': isOtherSelected(calendarYear, calendarMonth, getDate(i, j)),
                  }"
                  :data-timestamp="getCurDateTimestamp(getDate(i, j))"
                  @click="clickDate($event, i, j)"
                  @mouseover="onMouseOverDate"
                >
                  {{ getDate(i, j) }}
                </td>
              </template>
              <template v-else>
                <td :key="(i + 1) * j" class="blank" style="cursor: default"></td>
              </template>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'calendar-monthly',
  props: {
    setting: {
      attendanceHolidayUsed: Boolean,
    },
    isNoPreSelect: {
      type: Boolean,
      default() {
        return false;
      },
    },
    timestamp: {
      type: Number,
    },
    valueGoe: {
      type: [Number, null],
    },
    valueLoe: {
      type: [Number, null],
    },
    messageGoe: {
      type: String,
      default() {
        return '현재 시간 이후로 선택해주세요.';
      },
    },
    shouldSetValue: {
      type: Boolean,
      default() {
        return true;
      },
    },
    isBoardUse: {
      type: Boolean,
      default() {
        return false;
      },
    },
    isTeacher: {
      type: Boolean,
      default() {
        return true;
      },
    },
    selectedDates: {
      type: Array,
      default() {
        return [];
      },
    },
    isSearchPosts: {
      type: Boolean,
      default() {
        return false;
      },
    },
    calendarType: {
      type: String,
      default() {
        return '';
      },
    },
    hidePrevBtn: {
      type: Boolean,
      default() {
        return false;
      },
    },
    showBeforeMonth: {
      type: Number,
      default() {
        return 0;
      },
    },
    hideNextBtn: {
      type: Boolean,
      default() {
        return false;
      },
    },
    showAfterMonth: {
      type: Number,
      default() {
        return 0;
      },
    },
    minDate: {
      type: String,
      default() {
        return '';
      },
    },
    maxDate: {
      type: String,
      default() {
        return '';
      },
    },
  },
  data() {
    return {
      calendarTableHeadList: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      calendarYear: '',
      calendarMonth: '',
      today: {
        year: '',
        month: '',
        date: '',
      },
      selectedDate: '',
      enableDays: [],
    };
  },
  computed: {
    firstDay() {
      return new Date(this.calendarYear, this.calendarMonth).getDay();
    },
    daysInMonth() {
      let calenderHolidays = localStorage.getItem('calenderHolidays');
      if (calenderHolidays === undefined || calenderHolidays === null) {
        this.getCalenderHolidays({ year: this.calendarYear });
      } else {
        try {
          let list = JSON.parse(calenderHolidays);
          // prevYear 공휴일 정보가 없는 경우
          if (list[0].year !== this.calendarYear - 1) this.getCalenderHolidays({ year: this.calendarYear });
        } catch (error) {
          this.$log.warn('daysInMonth => ', error);
          this.getCalenderHolidays({ year: this.calendarYear });
        }
      }
      return 32 - new Date(this.calendarYear, this.calendarMonth, 32).getDate();
    },
    isTodayHoliday() {
      let calenderHolidays = localStorage.getItem('calenderHolidays');
      calenderHolidays = JSON.parse(calenderHolidays);
      const todayString = this.$moment().format('YYYYMMDD');
      let filteredList = calenderHolidays.filter((item) => {
        return todayString === item.yyyymmdd;
      });

      return this.calendarType === 'type01' ? filteredList.length > 0 : false;
    },
    isShowPrev() {
      if (this.minDate === '') return true;
      const minYear = parseInt(this.minDate.split('-')[0]);
      const minMonth = parseInt(this.minDate.split('-')[1]);
      return (
        this.$moment({ year: this.calendarYear, month: this.calendarMonth }).valueOf() >
        this.$moment({ year: minYear, month: minMonth - 1 }).valueOf()
      );
    },
    isShowNext() {
      if (this.maxDate === '') return true;
      const maxYear = parseInt(this.maxDate.split('-')[0]);
      const maxMonth = parseInt(this.maxDate.split('-')[1]);
      return (
        this.$moment({ year: this.calendarYear, month: this.calendarMonth }).valueOf() <
        this.$moment({ year: maxYear, month: maxMonth - 1 }).valueOf()
      );
    },
  },
  beforeMount() {
    this.init();
  },
  mounted() {},
  created() {
    let today = this.$moment();
    let calenderHolidays = localStorage.getItem('calenderHolidays');
    calenderHolidays = JSON.parse(calenderHolidays);

    let maxEnableDayCount = 15;
    if (this.isHolidayOptionEnabledForParent() == true) {
      maxEnableDayCount = 21;
    } else {
      maxEnableDayCount = 15;
    }

    while (this.enableDays.length < maxEnableDayCount) {
      let filteredList = calenderHolidays.filter((item) => {
        return today.format('YYYYMMDD') === item.yyyymmdd;
      });
      if (this.isHolidayOptionEnabledForParent() == true) {
        this.enableDays.push(today.format('YYYYMMDD'));
      } else {
        if (today.day() !== 0 && today.day() !== 6 && filteredList.length === 0) {
          this.enableDays.push(today.format('YYYYMMDD'));
        }
      }
      today.add(1, 'days');
    }
  },
  methods: {
    ...mapActions({
      getCalenderHolidays: 'getCalenderHolidays',
    }),
    changeCalender: function () {
      this.$emit('changeCalendar', 'month');
    },
    init() {
      if (!this.timestamp) {
        this.setToday();
      }

      if (this.timestamp) {
        const selected = this.$moment(this.timestamp);
        const selectedYear = selected.year();
        const selectedMonth = selected.month();
        const selectedDate = selected.date();

        this.calendarYear = selectedYear;
        this.calendarMonth = selectedMonth;
        this.setSelectedDate(selectedDate, 'init');
        this.showCalendar(selectedYear, selectedMonth);
      } else {
        this.selectedDate = null;
      }
      if (this.calendarType === 'type01') {
        this.getCalenderHolidays({});
      }
    },
    // check how many days in a month
    showCalendar(year, month, isSelectedMonth) {
      this.calendarYear = year;
      this.calendarMonth = month;
      if (isSelectedMonth !== undefined && isSelectedMonth === true) {
        this.isShowMonth = false;
        // this.setMonthlyPosts('change')
      }
    },
    showPrev(param) {
      if (param === 'month') {
        if (this.calendarMonth - 1 < 0) {
          this.calendarYear = this.calendarYear - 1;
          this.calendarMonth = 11;
        } else {
          this.calendarMonth = this.calendarMonth - 1;
        }
      } else if (param === 'year') {
        this.calendarYear = this.calendarYear - 1;
      }
      // this.setMonthlyPosts('change')
    },
    showNext(param) {
      if (param === 'month') {
        if (this.calendarMonth + 2 > 12) {
          this.calendarYear = this.calendarYear + 1;
          this.calendarMonth = 0;
        } else {
          this.calendarMonth = this.calendarMonth + 1;
        }
      } else if (param === 'year') {
        this.calendarYear = this.calendarYear + 1;
      }
      // this.setMonthlyPosts('change')
    },
    getTodayJson() {
      const d = new Date();
      return {
        year: d.getFullYear(), // yyyy
        month: d.getMonth(), // MM
        date: d.getDate(), // dd
      };
    },
    getDate(i, j) {
      const date = (i - 1) * 7 + j;
      if (date > this.firstDay) {
        return date - this.firstDay;
      }
      return '';
    },
    getSelectedDate(date) {
      if (date === '') return '';
      else {
        let month = this.calendarMonth;
        return '' + this.calendarYear + month + date;
      }
    },
    setSelectedDate(date, type, event) {
      if (this.$comn.isEmpty(date)) {
        return false;
      }
      const selectProc = () => {
        this.selectedDate = this.getSelectedDate(date);
        this.calendarDay = date;
      };
      const emitSelectedDate = () => {
        this.$emit('selectedDate', {
          year: this.calendarYear,
          month: this.calendarMonth,
          date: date,
        });
      };

      if (type === 'select') {
        this.$toasted.clear();
        const dateTimestamp = event.target.getAttribute('data-timestamp');

        if (this.valueGoe && dateTimestamp < this.valueGoe) {
          return false;
        }

        if (this.valueLoe && dateTimestamp > this.valueLoe) {
          return false;
        }

        selectProc();
        emitSelectedDate();
        if (this.calendarType === 'type01' || this.isBoardUse) {
          this.$emit('close');
        }
      } else {
        selectProc();
        if (!this.isNoPreSelect && this.shouldSetValue) {
          emitSelectedDate();
        }
      }
    },
    getCurDateTimestamp(date) {
      if (this.$comn.isEmpty(date)) return 0;

      const dateTime = `${this.calendarYear}-${this.calendarMonth + 1}-${date}`;
      return this.$moment(dateTime).valueOf();
    },
    setToday() {
      const d = this.getTodayJson();
      this.today = {
        year: d.year,
        month: d.month,
        date: d.date,
      };
      this.calendarYear = d.year;
      this.calendarMonth = d.month;
      if (!this.isSearchPosts && this.calendarType !== 'type01') {
        this.setSelectedDate(d.date, 'init');
      }
      this.showCalendar(d.year, d.month);
    },
    isCurMonth(year, month) {
      return year === this.today.year && month === this.today.month;
    },
    disabledClick() {
      this.$toasted.clear();
      if (this.isHolidayOptionEnabled() == true) {
        if (this.isTeacher == false) {
          this.$toasted.show('오늘부터 3주 이내까지만 가능합니다', { duration: 2000 });
        }
      } else {
        this.$toasted.show(this.isTeacher ? '평일만 선택 가능합니다. (토/일, 공휴일 선택불가)' : '오늘부터 평일 15일 이내까지만 가능합니다.', {
          duration: 2000,
        });
      }
    },
    isHoliday(year, month, date) {
      const curDate = date !== '' ? this.$moment({ year: year, month: month, day: date }).format('YYYYMMDD') : '';

      let calenderHolidays = localStorage.getItem('calenderHolidays');
      if (calenderHolidays === undefined || calenderHolidays === null || calenderHolidays === '') return false;

      try {
        calenderHolidays = JSON.parse(calenderHolidays);
        let filteredList = calenderHolidays.filter((item) => {
          return curDate === item.yyyymmdd;
        });
        return filteredList.length > 0;
      } catch (error) {
        this.$log.warn('isHoliday => ', error);
        return false;
      }
    },
    onMouseOverDate(event) {
      const dateTimestamp = event.target.getAttribute('data-timestamp');

      if (this.valueGoe && this.valueLoe) {
        event.target.style.cursor = dateTimestamp < this.valueGoe || dateTimestamp > this.valueLoe ? 'default' : 'pointer';
        return;
      }

      if (this.valueGoe) {
        event.target.style.cursor = dateTimestamp < this.valueGoe ? 'default' : 'pointer';
      }

      if (this.valueLoe) {
        event.target.style.cursor = dateTimestamp > this.valueLoe ? 'default' : 'pointer';
      }
    },
    isDisabled(year, month, date) {
      if (this.calendarType === 'type02') return false;

      const curTimestamp = this.$moment({ year: year, month: month, day: date }).valueOf();
      if (this.calendarType === 'type03') {
        return this.maxDate === '' ? false : curTimestamp > this.$moment(this.maxDate, 'YYYY-MM-DD').valueOf();
      }

      if (this.isTeacher) {
        return false;
      } else {
        const curDate = this.$moment(curTimestamp).format('YYYYMMDD');
        return !this.enableDays.includes(curDate);
      }
    },
    isOtherSelected(year, month, date) {
      if (this.calendarType !== 'type01') return false;
      const curTimestamp = this.$moment({ year: year, month: month, day: date }).valueOf();
      return this.selectedDates.find((date) => date === curTimestamp);
    },
    clickDate(event, i, j) {
      const date = this.getDate(i, j);
      if (this.isBoardUse === true || this.calendarType !== 'type01') {
        if (this.calendarType === 'type03') {
          const isDisabled = this.isDisabled(this.calendarYear, this.calendarMonth, date);
          if (isDisabled) return;
        }
        this.setSelectedDate(date, 'select', event);
      } else {
        const isDisabled = this.isDisabled(this.calendarYear, this.calendarMonth, date);
        const isOtherSelected = this.isOtherSelected(this.calendarYear, this.calendarMonth, date);
        if (this.calendarType === 'type01' && this.setting.attendanceHolidayUsed) {
          if (isDisabled || isOtherSelected) {
            if (isOtherSelected) return;
            this.disabledClick();
          } else {
            this.setSelectedDate(date, 'select', event);
          }
        } else {
          const isHoliday = this.isHoliday(this.calendarYear, this.calendarMonth, date);
          if (j === 1 || j === 7 || isHoliday || isDisabled || isOtherSelected) {
            if (isOtherSelected) return;
            this.disabledClick();
          } else {
            this.setSelectedDate(date, 'select', event);
          }
        }
      }
    },
    // 달력의 월이 '현재 날짜' 기준으로 특정 개월 수 이전이면 true 반환
    isHidePrev() {
      let targetMonth = this.today.month - this.showBeforeMonth;
      let targetYear = this.today.year;

      if (targetMonth < 0) {
        targetMonth = 12 + targetMonth;
        targetYear -= 1;
      }

      return this.calendarYear < targetYear || (this.calendarYear === targetYear && this.calendarMonth <= targetMonth);
    },
    // 달력의 월이 '현재 날짜' 기준으로 특정 개월 수 이후이면 true 반환
    isHideNext() {
      let targetMonth = this.today.month + this.showAfterMonth;
      let targetYear = this.today.year;

      if (targetMonth > 11) {
        targetMonth = targetMonth - 12;
        targetYear += 1;
      }

      return this.calendarYear > targetYear || (this.calendarYear === targetYear && this.calendarMonth >= targetMonth);
    },

    isHolidayOptionEnabledForParent() {
      return this.isHolidayOptionEnabled() == true && this.isTeacher === false;
    },

    isHolidayOptionEnabled() {
      return this.calendarType === 'type01' && this.setting.attendanceHolidayUsed;
    },

    shouldAddClassHoliday(i, j, calendarYear, calendarMonth) {
      if (this.isHolidayOptionEnabled() == true) {
        return false;
      } else {
        return j === 1 || j === 7 || this.isHoliday(calendarYear, calendarMonth, this.getDate(i, j));
      }
    },

    shouldAddClassSelectableHoliday(i, j, calendarYear, calendarMonth) {
      if (this.isHolidayOptionEnabled() == true) {
        if (j === 1 || j === 7 || this.isHoliday(calendarYear, calendarMonth, this.getDate(i, j))) {
          if (
            this.isDisabled(calendarYear, calendarMonth, this.getDate(i, j)) ||
            this.isOtherSelected(calendarYear, calendarMonth, this.getDate(i, j))
          ) {
            return false;
          } else {
            return true;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.calendar__layer {
  display: block;
  .calendar__table {
    .calendar {
      td{
        &.blank {
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
}
.type01 {
  width: 340px;
  top: auto;
  left: auto;
  .today {
    color: #222 !important;
  }
  .holy-day,
  .disabled,
  .is-other-selected {
    color: #888 !important;
  }
  .selectable-holi-day {
    color: #222 !important;
  }
}
.type03 {
  .disabled {
    color: #888 !important;
  }
}
.holy-day {
  color: #ff4e4e;
}
</style>