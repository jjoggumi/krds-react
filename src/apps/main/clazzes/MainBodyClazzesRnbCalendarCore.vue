<template>
  <div :class="calendarClass" v-if="isShowCalendar" style="display: block">
    <div class="calendar-title-wrap" v-if="isPopupCalendar !== undefined && isPopupCalendar">
      <button class="arr-btn prev-btn" @click="showPrev('month')"></button>
      <div class="calendar-wrap">{{ calendarYear }}년 {{ calendarMonth + 1 }}월</div>
      <button class="arr-btn next-btn" @click="showNext('month')"></button>
      <button class="today-btn" @click="setToday">오늘</button>
    </div>
    <div class="calendar-title-wrap" v-else>
      <button class="prev-btn" @click="showPrev('month')"></button>
      <div class="ym-wrap" @click="isShowMonth = true">{{ calendarYear }}년 {{ calendarMonth + 1 }}월</div>
      <button class="next-btn" @click="showNext('month')"></button>
    </div>
    <div class="calendar-table-wrap">
      <!-- have-schedule : class="have-schedule" -->
      <table>
        <thead>
          <tr>
            <th v-for="item in calendarTableHeadList" :key="item.currentId">
              {{ item }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in visibleRows" :key="i">
            <template v-for="j in 7">
              <template v-if="getDate(i, j) !== '' && getDate(i, j) <= daysInMonth">
                <td
                  :key="(i + 1) * j"
                  :class="{
                    today: isCurMonth(calendarYear, calendarMonth) && getDate(i, j) === today.date,
                    selected: selectedDate === getSelectedDate(getDate(i, j)),
                    empty: getDate(i, j) === '',
                    'have-schedule': isHaveSchedule(calendarYear, calendarMonth, getDate(i, j)),
                    'holy-day': j === 1 || j === 7 || isHolyday(calendarYear, calendarMonth, getDate(i, j)),
                  }"
                  @click="
                    setSelectedDate(getDate(i, j));
                    onClickDate(getDate(i, j));
                  "
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
    <transition name="fade">
      <div v-if="isShowMonth" class="calendar-select-month-wrap" style="display: block">
        <div class="calendar-title-wrap">
          <button class="prev-btn" @click="showPrev('year')"></button>
          <div class="ym-wrap" @click="isShowMonth = false">{{ calendarYear }}년 {{ calendarMonth + 1 }}월</div>
          <button class="next-btn" @click="showNext('year')"></button>
        </div>
        <div class="month-wrap">
          <table>
            <tbody>
              <tr v-for="item in calendarTableMonthList" :key="item.currentId">
                <td v-for="month in item" :key="month.currentId" @click="showCalendar(calendarYear, month - 1, true)">{{ month }}월</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { eventBus } from '@/main';

export default {
  name: 'main-body-clazzes-rnb-calendar-core',
  props: {
    isPopupCalendar: {
      type: Boolean,
    },
    isShowCalendar: {
      type: Boolean,
    },
    isReserveMode: {
      type: Boolean,
    },
    isTimestampEnd: {
      type: Boolean,
    },
    prevSelectedDate: {
      type: String,
    },
    monthlyPosts: {
      type: Array,
    },
    parentUri: {
      type: Array,
    },
    postType: {
      type: Array,
    },
    dayPosts: Array,
  },
  data() {
    return {
      isShowMonth: false,
      selectedDate: '',
      calendarTableHeadList: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      calendarTableMonthList: [
        ['1', '2', '3', '4'],
        ['5', '6', '7', '8'],
        ['9', '10', '11', '12'],
      ],
      calendarYear: '',
      calendarMonth: '',
      calendarDay: '',
      today: {
        year: '',
        month: '',
        date: '',
      },
      prevSelectedDateLocal: '',
      postExists: [],
    };
  },
  components: {},
  computed: {
    firstDay() {
      return new Date(this.calendarYear, this.calendarMonth).getDay();
    },
    calendarClass() {
      if (this.isPopupCalendar !== undefined && this.isPopupCalendar) return 'popup-calendar-wrap';
      else return 'calendar-wrap';
    },
    daysInMonth() {
      let calenderHolidays = localStorage.getItem('calenderHolidays');
      if (calenderHolidays === undefined || calenderHolidays === null) {
        this.getCalenderHolidays({ year: this.calendarYear });
      } else {
        try {
          let list = JSON.parse(calenderHolidays);
          // prevYear 공휴일 정보가 없는 경우
          if (list[0].year !== this.calendarYear - 1) {
            this.getCalenderHolidays({ year: this.calendarYear });
          }
        } catch (error) {
          this.$log.warn('daysInMonth => ', error);
          this.getCalenderHolidays({ year: this.calendarYear });
        }
      }
      return 32 - new Date(this.calendarYear, this.calendarMonth, 32).getDate();
    },
    visibleRows() {
      return Array.from({ length: 6 }, (_, k) => k + 1).filter((i) => this.hasRowDate(i));
    },
  },
  watch: {
    $route() {
      this.initPrevSelectedDateLocal('reset');
    },
    // 저장 후 부모가 전달하는 일자별 게시글 목록이 바뀌면 즉시 점 상태를 동기화
    dayPosts() {
      this.getPostExists();
    },
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
      getCalenderHolidays: 'getCalenderHolidays',
    }),
    init() {
      const d = this.getTodayJson();
      this.today = {
        year: d.year,
        month: d.month,
        date: d.date,
      };
      if (this.prevSelectedDateLocal !== undefined && this.prevSelectedDateLocal !== '') {
        const p = this.getDayJson(this.prevSelectedDateLocal);
        this.calendarYear = p.year;
        this.calendarMonth = p.month;
        this.setSelectedDate(p.date);
        this.showCalendar(p.year, p.month);
      } else {
        this.calendarYear = d.year;
        this.calendarMonth = d.month;
        this.setSelectedDate(d.date);
        this.showCalendar(d.year, d.month);
      }
    },
    isCurMonth(year, month) {
      return year === this.today.year && month === this.today.month;
    },
    isHaveSchedule(year, month, date) {
      if (date && this.postExists.length > 0) {
        const timestamp = this.$moment({ year: year, month: month, date: date }).valueOf();

        const target = this.postExists.find((postExist) => {
          return postExist.timestamp === timestamp;
        });

        return target ? target.isPosted : false;
      } else {
        return false;
      }
    },
    isHolyday(year, month, date) {
      const curTimestamp = new Date(year, month, date).getTime();
      const curDate = this.$moment(curTimestamp).format('YYYYMMDD');

      let calenderHolidays = localStorage.getItem('calenderHolidays');
      if (calenderHolidays === undefined || calenderHolidays === null || calenderHolidays === '') return false;

      try {
        calenderHolidays = JSON.parse(calenderHolidays);
        let filteredList = calenderHolidays.filter((item) => {
          return curDate === item.yyyymmdd;
        });
        return filteredList.length > 0;
      } catch (error) {
        this.$log.warn('isHolyday => ', error);
        return false;
      }
    },
    // check how many days in a month
    showCalendar(year, month, isSelectedMonth) {
      this.calendarYear = year;
      this.calendarMonth = month;
      if (isSelectedMonth !== undefined && isSelectedMonth === true) {
        this.isShowMonth = false;
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
      this.getPostExists();
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
      this.getPostExists();
    },
    getTodayJson() {
      const d = new Date();
      return {
        year: d.getFullYear(), // yyyy
        month: d.getMonth(), // MM
        date: d.getDate(), // dd
      };
    },
    getDayJson(dateFormat) {
      //const d = new Date(dateFormat);
      const d = this.$moment(dateFormat, 'YYYY-MM-DD').toDate();
      this.$log.debug(d.getFullYear(), d.getMonth(), d.getDate());
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
    hasRowDate(i) {
      for (let j = 1; j <= 7; j++) {
        const d = this.getDate(i, j);
        if (d !== '' && d <= this.daysInMonth) return true;
      }
      return false;
    },
    getSelectedDate(date) {
      if (date === '') return '';
      else {
        let month = this.calendarMonth;
        // if (month < 10) month = "0" + (month + 1);
        // if (date < 10) date = "0" + date;
        return '' + this.calendarYear + month + date;
      }
    },
    setToday() {
      // TODO => 확인해볼 필요는 있음.
      //this.prevSelectedDate = "";
      //this.init();

      // TODO: 20200404 props error fixed
      // this.prevSelectedDate = "";

      const d = this.getTodayJson();
      this.today = {
        year: d.year,
        month: d.month,
        date: d.date,
      };
      this.calendarYear = d.year;
      this.calendarMonth = d.month;
      this.setSelectedDate(d.date);
      this.showCalendar(d.year, d.month);
    },
    setSelectedDate(date) {
      if (this.$comn.isEmpty(date)) return false;

      this.selectedDate = this.getSelectedDate(date);
      // this.$emit(
      //   "selectedDate",
      //   `${this.calendarYear},${this.calendarMonth + 1},${date}`
      // );
      this.calendarDay = date;

      this.$emit('selectedDate', {
        year: this.calendarYear,
        month: this.calendarMonth,
        date: date,
      });
    },
    onClickDate(date) {
      if (this.$comn.isEmpty(date)) return false;

      this.triggerAnalyticsLogEvent({ code: 'analytics.class.click.calendar.day' });

      this.$emit('onClickDate', {
        year: this.calendarYear,
        month: this.calendarMonth,
        date: date,
      });

      if (this.isReserveMode) this.setTodayByReserveMode(date);
    },
    setTodayByReserveMode(date) {
      // 선택일
      const selectedDate = this.$moment(`${this.calendarYear}-${this.calendarMonth + 1}-${date}`);

      // today
      const today = this.$moment();

      // 선택일이 today보다 이전이면 today로 변경
      if (selectedDate.valueOf() <= today.valueOf()) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.setToday();
          }, 100);
        });
      }
    },
    initPrevSelectedDateLocal(param) {
      const calendarClassPosted = this.$route.query.calendarClassPosted;
      if (calendarClassPosted !== undefined) {
        this.$log.warn('calendarClassPosted => ', calendarClassPosted);
        const d = this.$moment(calendarClassPosted).toDate();
        // this.$log.debug(d.getFullYear(), d.getMonth() + 1, d.getDate());

        this.prevSelectedDateLocal = d.getFullYear() + ',' + (d.getMonth() + 1) + ',' + d.getDate();
        // alert(this.prevSelectedDateLocal);

        if (this.prevSelectedDateLocal !== undefined && param === 'reset') {
          this.init();
        }
      }
    },

    getPostExists() {
      if (this.isPopupCalendar && (this.isReserveMode || this.isTimestampEnd)) {
        return false;
      }

      const startDate = this.$moment({ year: this.calendarYear, month: this.calendarMonth, date: 1 }).valueOf();
      const endDate = this.$moment({
        year: this.calendarYear,
        month: this.calendarMonth,
        date: this.daysInMonth,
        hour: 23,
        minute: 59,
        second: 59,
      }).valueOf();

      let requestParams = {};
      requestParams._posted = [];
      requestParams._posted.push(startDate);
      requestParams._posted.push(endDate);

      if (this.postType) {
        requestParams._postType = [];
        this.postType.forEach((type) => requestParams._postType.push(type));
      }

      if (this.parentUri) {
        requestParams._parentUri = [];
        this.parentUri.forEach((type) => requestParams._parentUri.push(type));
      }

      this.$hiClass.postExists
        .search(requestParams)
        .then((res) => {
          this.postExists = res.data._embedded.postExists;
        })
        .catch((err) => {
          this.$log.debug(this.$options.name + ' getPostExists() err : ', err);
        });
    },

    setClazzesScheduleDot(target) {
      // 저장 직후에는 일자가 변경되었을 수 있으므로 월별 캐시를 새로 가져와 UI를 정확히 반영
      // 네트워크 비용은 있지만 가장 확실한 방법
      this.getPostExists();
    },
  },
  /** lifeCycle */
  created: function () {
    this.prevSelectedDateLocal = this.prevSelectedDate;
    this.initPrevSelectedDateLocal();
    eventBus.$on(`set-clazzes-schedule-dot-${this.isPopupCalendar}`, (target) => {
      this.setClazzesScheduleDot(target);
    });
  },
  mounted() {
    this.init();
    this.getPostExists();
  },
  beforeDestroy() {
    eventBus.$off(`set-clazzes-schedule-dot-${this.isPopupCalendar}`);
  },
  /** lifeCycle */
};
</script>

<style lang="scss" scoped>
.fade-enter-active {
  transition: opacity 0.3s;
}
.fade-leave-active {
  transition: opacity 0.1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.school-class-cont-right-wrap .popup-calendar-wrap .calendar-wrap {
  margin: 0 0 0 0;
}

/* 빈 날짜 셀을 시각적으로 숨김 */
.note-calendar-popup {
  .popup-calendar-wrap {
    .calendar-table-wrap {
      table {
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
}
</style>
