<template>
  <div class="picker-calendar-month" :class="{record: isRecord}">
      <p class="data-choice">
          <span class="arrow" @click="prev">&lt;</span>
          {{ this.calendarYear }}년 {{ this.calendarMonth }}월
          <span class="arrow" @click="next">&gt;</span>
          <span class="total" v-if="total === true" @click="choiceAll">전체</span>
          <span class="total" v-if="change === true" @click="changeCalendar">일</span>
      </p>
      <div class="months">
          <p v-for="m in 12" :key="m" :class="{
            select : m === calendarMonth
          }" @click="choiceMonth(m)">
            {{ m }}월
          </p>
      </div>
  </div>
</template>

<script>

export default {
  name: 'main-body-calendar-picker-month',
  props: {
    // eslint-disable-next-line vue/require-prop-type-constructor
    year : Number | String,
    // eslint-disable-next-line vue/require-prop-type-constructor
    month: Number | String,
    total: Boolean,
    change: {
      type: Boolean,
      default: false
    },
    isRecord: {
      type: Boolean,
      default: false
    }
  }, 
  data() {
    return {
      calendarYear: null,
      calendarMonth: null
    }
  },
  components: {},
  computed: {}, 
  watch: {},
  methods: {
    changeCalendar: function() {
      this.$emit('changeCalendar', 'day')
    },
    prev(e) {
      e.preventDefault()
      this.calendarYear = parseInt(this.calendarYear) - 1
    },
    next(e) {
      e.preventDefault()
      this.calendarYear = parseInt(this.calendarYear) + 1
    },
    choiceMonth(m) {
      this.calendarMonth = m
      const date = {
        year : this.calendarYear,
        month : this.calendarMonth
      }
      this.$emit("choiceMonth", date)
    },
    choiceAll() {
      this.$emit("choiceAll")
    }
  },
  mounted() {
    this.calendarYear = parseInt(this.year)
    this.calendarMonth = parseInt(this.month)
  }
}
</script>

<style scoped>
.picker-calendar-month.record,
.picker-calendar-month {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 318px;
  border: 1px solid #E0E0E0;
  display: none;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0px 8px 32px 0px #00000029;
  height: fit-content;
}
.picker-calendar-month p.data-choice {
  height: 52px;
  background: var(--primary);
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
.picker-calendar-month.record p.data-choice {
  background: #FF8737;
  margin-bottom: 0;
}
.picker-calendar-month p.data-choice span.arrow {
  margin: 0 24px;
  cursor: pointer;
}
.picker-calendar-month p.data-choice span.total {
  width: 58px;
  height: 32px;
  line-height: 32px;
  border-radius: 30px;
  background: #fff;
  color: var(--primary);
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 9px;
}
.picker-calendar-month.record p.data-choice span.total {
  color: #FF8737;
}
.picker-calendar-month .months {
  display: flex; 
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px 0;
  background: #fff;
}
.picker-calendar-month .months p {
  display: flex;
  width: 88px;
  height: 47px;
  border-radius: 8px;
  background: #F8F9FC;
  margin: 4px;
  justify-content: center;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
  color: #616161;
}
.picker-calendar-month .months p:hover {
    background: #F1F5FD ;
}
.picker-calendar-month .months p.select {
    background: var(--primary);
    color: #fff;
}
.picker-calendar-month.record .months p.select {
  background: #FF8737;
}
</style>