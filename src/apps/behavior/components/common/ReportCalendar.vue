<template>
  <div class="date-wrap cursor-pointer" v-click-outside="close">
    <span v-if="isAfter" class="separator">-</span>
    <i v-if="isCalendar" class="cal" @click="open($event)"></i>
    <span class="date-str" :class="{ active: isOpen }" @click="open($event)">{{ dateString }}</span>
    <span v-if="isWeek" class="separator">-</span>
    <span v-if="isWeek" class="date-str" @click="open($event)">{{ $moment(choice.dateEnd, 'YYYY-MM-DD', true).format(momentFormat) }}</span>
    <calendar-monthly
      v-if="isOpen"
      :timestamp="selected"
      :value-goe="null"
      :isBoardUse="true"
      calendarType="type03"
      @selectedDate="select"
      @close="close"
    />
  </div>
</template>

<script>
import CalendarMonthly from '@/components/Calendar/CalendarMonthly';
export default {
  name: 'report-calendar',
  components: { CalendarMonthly },
  props: {
    isAfter: Boolean,
    isCalendar: {
      type: Boolean,
      default: true,
    },
    choice: Object,
    selectedDateType: String,
    // 'kr' => YYYY년 M월 D일 (default), 'dot' => YYYY. M. D, 'dash' => YYYY-M-D
    dateFormat: {
      type: String,
      default: 'kr',
      validator: (v) => ['kr', 'dot', 'dash'].includes(v),
    },
  },
  data() {
    return {
      isOpen: false,
      selected: null,
    };
  },
  computed: {
    momentFormat: function () {
      switch (this.dateFormat) {
        case 'dot':
          return 'YYYY. M. D';
        case 'dash':
          return 'YYYY-M-D';
        default:
          return 'YYYY년 M월 D일';
      }
    },
    dateString: function () {
      return this.$moment(this.selected).format(this.momentFormat);
    },
    isNotValidate: function () {
      return ['day', 'week'].includes(this.selectedDateType);
    },
    isWeek: function () {
      return this.selectedDateType === 'week';
    },
  },
  watch: {
    choice: {
      handler: function (newVal, oldVal) {
        if (newVal) {
          const date = this.isAfter ? newVal.dateEnd : newVal.dateStart;
          this.selected = this.$moment(date, 'YYYY-MM-DD', true).valueOf();
        }
      },
    },
  },
  methods: {
    select: function (dateTimeJson) {
      const choiceDate = `${dateTimeJson.year}-${`${dateTimeJson.month + 1}`.padStart(2, '0')}-${`${dateTimeJson.date}`.padStart(2, '0')}`;
      const compareDate = !this.isAfter ? this.choice.dateEnd : this.choice.dateStart;

      if (this.isAfter) {
        if (this.$moment(choiceDate, 'YYYY-MM-DD').isBefore(compareDate)) {
          this.$hiClass.alert('종료일을 시작일보다 빠르게 선택할 수 없습니다.');
          return;
        }
      } else {
        if (this.$moment(choiceDate, 'YYYY-MM-DD').isAfter(compareDate) && !this.isNotValidate) {
          this.$hiClass.alert('시작일을 종료일보다 늦게 선택할 수 없습니다.');
          return;
        }
      }
      this.selected = this.$moment(choiceDate, 'YYYY-MM-DD', true).valueOf();
    },
    open: function (e) {
      e.preventDefault();
      this.isOpen = !this.isOpen;
    },
    close: function () {
      if (this.isOpen) {
        const choiceDate = this.$moment(this.selected).format('YYYY-MM-DD');
        const date = this.isAfter ? this.choice.dateEnd : this.choice.dateStart;
        if (date !== choiceDate) {
          this.$emit('change', this.isAfter, this.$moment(this.selected).format('YYYY-MM-DD'));
        }

        this.isOpen = false;
      }
    },
  },
  created() {
    const date = this.isAfter ? this.choice.dateEnd : this.choice.dateStart;
    this.selected = this.$moment(date, 'YYYY-MM-DD', true).valueOf();
  },
};
</script>

<style scoped>
.date-wrap .calendar__layer {
  z-index: 2;
}
</style>