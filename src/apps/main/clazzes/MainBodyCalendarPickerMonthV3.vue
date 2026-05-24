<template>
  <div class="picker-calendar-month">
      <p class="data-choice">
          <span class="arrow" @click="prev">&lt;</span>
          {{ this.calendarYear }}년 {{ this.calendarMonth }}월
          <span class="arrow" @click="next">&gt;</span>
          <span class="total" v-if="total === true" @click="choiceAll">전체</span>
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
  // scoped 스타일 없는 캘린더
  name: 'main-body-calendar-picker-month-v3',
  props: {
    year : Number,
    month: Number,
    total: Boolean
  }, 
  data() {
    return {
      calendarYear: null,
      calendarMonth: null
    }
  },
  methods: {
    prev() {
      this.calendarYear = parseInt(this.calendarYear) - 1
    },
    next() {
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
  created() {
    this.calendarYear = _.cloneDeep(this.year)
    this.calendarMonth = _.cloneDeep(this.month)
  }
}
</script>

<style scoped>

</style>