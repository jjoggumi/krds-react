<template>
  <div class="calendar-detail-info-wrap" v-if="isShowCalendarInfo">
    <ul>
      <li v-for="item in calendarSchools" :key="item.currentId">
        <div class="title">학사일정</div>
        <p>{{ item.postContent }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "mainBodySchoolsRnbCalendarInfo",
  props: {
    selectedDate: String,
    dayPosts: Array,
    monthlyPosts: Array
  },
  data: () => ({
    isChangeMonth: false,
    oldSelectedDate: "",
    postTypes: {
      CALENDAR_SCHOOL: "CALENDAR_SCHOOL"
    }
  }),
  components: {},
  watch: {
    selectedDate(val, oldVal) {
      if (oldVal === undefined && oldVal !== null && oldVal !== "") {
        if (this.isDiffMonth(val, oldVal)) {
          // this.$log.debug(val + "<>" + oldVal);
          this.isChangeMonth = false;
          this.oldSelectedDate = oldVal;
        } else this.isChangeMonth = true;
      } else this.isChangeMonth = false;
    }
  },
  computed: {
    isShowCalendarInfo() {
      if (this.dayPosts.length > 0 && !this.isChangeMonth) {
        return true;
      } else return false;
    },
    calendarSchools() {
      if (this.dayPosts.length > 0) {
        const compareType = this.postTypes.CALENDAR_SCHOOL;
        return this.dayPosts.filter(function(item) {
          return item.postType === compareType;
        });
      } else return [];
    }
  },
  methods: {
    isDiffMonth(newSelectedDate, oldSelectedDate) {
      let newJsons = newSelectedDate.split(",");
      let oldJsons = oldSelectedDate.split(",");

      let newMonthStr = newJsons[0] + "" + newJsons[1] - 1;
      let oldMonthStr = oldJsons[0] + "" + oldJsons[1] - 1;

      if (newMonthStr === oldMonthStr) return true;
      else return false;
    }
  },
  created: function() {}
};
</script>

<style scoped></style>