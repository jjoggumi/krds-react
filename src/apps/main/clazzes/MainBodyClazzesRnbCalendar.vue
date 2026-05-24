<template>
  <component
    :is="curForm"
    :isShowCalendar="true"
    :monthlyPosts="monthlyPosts"
    :parentUri="parentUri"
    :postType="postType"
    :dayPosts="dayPosts"
    @selectedDate="setSelectedDate"
    @onClickDate="onClickDate"
  ></component>
</template>

<script>
import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";

const CalendarCore = () => ({
  component: import("./MainBodyClazzesRnbCalendarCore.vue"),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: "mainBodyClazzesRnbCalendar",
  props: {
    clazzes: Object,
    monthlyPosts: Array,
    selectedDate: String,
    parentUri: Array,
    dayPosts: Array
  },
  data: () => ({
    curPage: 0,
    curForm: "",
    postType: ['CALENDAR_CLASS', 'CALENDAR_SCHOOL']
  }),
  components: {
    CalendarCore,
  },
  watch: {
    "clazzes.currentId": function(val) {
      this.curForm = ""
      if (val !== undefined) this.curForm = "CalendarCore"
    }
  },
  methods: {
    setSelectedDate(dateJson) {
      this.$emit("setSelectedDate", dateJson);
    },
    onClickDate(dateJson) {
      this.$emit("onClickDate", dateJson);
    },
    getDayPosts(dateJson) {
      this.$emit("getDayPosts", dateJson);
    },
  },
  // created: function() {
  //   if (this.clazzes.currentId !== undefined)
  //     this.curForm = "CalendarCore";
  // },
  mounted: function() {
    this.curForm = ""
    if (this.clazzes.currentId !== undefined)
      this.curForm = "CalendarCore";
  }
};
</script>

<style scoped></style>
