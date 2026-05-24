<template>
  <div class="date-wrap cursor-pointer" v-click-outside="close">
    <i class="cal" @click.stop="open($event)"></i>
    <span class="date-str" :class="{ active: isOpen }" @click.stop="open($event)">{{ dateString }}</span>
    <main-body-calendar-picker-month
      v-if="isOpen"
      style="display: block"
      :year="selected.year"
      :month="selected.month"
      :total="false"
      :isRecord="true"
      @choiceMonth="select"
    />
  </div>
</template>

<script>
import MainBodyCalendarPickerMonth from '@/apps/main/clazzes/MainBodyCalendarPickerMonth';
export default {
  name: 'report-calendar-month',
  components: { MainBodyCalendarPickerMonth },
  props: {
    isAfter: Boolean,
    selectedDate: String,
    // 'kr' => YYYY년 M월 (default), 'dot' => YYYY. M, 'dash' => YYYY-M
    dateFormat: {
      type: String,
      default: 'kr',
      validator: (v) => ['kr', 'dot', 'dash'].includes(v),
    },
  },
  data() {
    return {
      isOpen: false,
      selected: {},
    };
  },
  computed: {
    momentMonthFormat: function () {
      switch (this.dateFormat) {
        case 'dot':
          return 'YYYY. M';
        case 'dash':
          return 'YYYY-M';
        default:
          return 'YYYY년 M월';
      }
    },
    dateString: function () {
      return this.$moment(this.selectedDate).format(this.momentMonthFormat);
    },
  },
  watch: {
    selectedDate: {
      handler: function (newVal, oldVal) {
        if (newVal !== oldVal) {
          const arrDate = newVal.split('-');
          this.selected = {
            year: arrDate[0],
            month: parseInt(arrDate[1], 10),
          };
        }
      },
    },
  },
  methods: {
    select: function (dateTimeJson) {
      const date = `${dateTimeJson.year}-${`${dateTimeJson.month}`.padStart(2, '0')}`;
      this.selected = {
        year: dateTimeJson.year,
        month: dateTimeJson.month,
      };
      this.$emit('change', date);
      this.close();
    },
    open: function (e) {
      e.preventDefault();
      this.isOpen = !this.isOpen;
    },
    close: function () {
      if (this.isOpen) {
        this.isOpen = false;
      }
    },
  },
  created() {
    const arrDate = this.selectedDate.split('-');
    this.selected = {
      year: arrDate[0],
      month: parseInt(arrDate[1], 10),
    };
  },
};
</script>

<style>
</style>