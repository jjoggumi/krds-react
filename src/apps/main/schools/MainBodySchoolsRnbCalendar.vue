<template>
  <MainBodyClazzesRnbCalendarCore
      v-if="parentUri[0].length > 0"
      :isShowCalendar="true"
      :monthlyPosts="monthlyPosts"
      :parentUri="parentUri"
      :postType="postType"
      @selectedDate="setSelectedDate"
  ></MainBodyClazzesRnbCalendarCore>
</template>

<script>
import MainBodyClazzesRnbCalendarCore from "../clazzes/MainBodyClazzesRnbCalendarCore";

export default {
  name: "mainBodySchoolsRnbCalendar",
  props: {
    clazzes: Object,
    parentUri: Array,
    monthlyPosts: Array,
    selectedDate: String
  },
  data: () => ({
    curPage: 0,
    postType: ['CALENDAR_SCHOOL']
  }),
  components: {
    MainBodyClazzesRnbCalendarCore
  },
  methods: {
    setSelectedDate(dateJson) {
      setTimeout(() => {
        this.$emit("setSelectedDate", dateJson);
      }, 50);
    },
    getDayPosts(dateJson) {
      this.$emit("getDayPosts", dateJson);
    }
  }
};
</script>

<style scoped></style>
