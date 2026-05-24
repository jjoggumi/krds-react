<template>
  <div
    v-if="curForm === 'ALARM_PLUS'"
    class="selete-view-style-wrap select-note-view-style">
    <button
      :class="{
        on: alarmPlusQuery.reply === null
      }"
      class="style-all"
      @click="onClickTab(null)"
    >
      <span>전체</span>
    </button>

    <div class="bar"></div>

    <button
      :class="{
        on: alarmPlusQuery.reply === false
      }"
      @click="onClickTab(false)"
    >
      <span>미회신</span>
    </button>

    <div class="bar"></div>

    <button
      :class="{
        on: alarmPlusQuery.reply === true
      }"
      @click="onClickTab(true)"
    >
      <span>회신완료</span>
    </button>
  </div>
</template>

<script>
import { eventBus } from "@/main";

export default {
  name: 'main-body-schools-body-top',
  components: {},
  props: {
    curForm: {
      type: String
    },
    alarmPlusQuery: {
      type: Object
    }
  },
  data() {
    return {}
  },
  computed: {},
  methods: {
    onClickTab(replyValue) {
      this.alarmPlusQuery.reply = replyValue

      eventBus.$emit('schools-init-infinity-scroll', null)
      eventBus.$emit('schools-do-board-search')
    }
  },
  created() {
    this.alarmPlusQuery.reply = null
  },
  beforeDestroy() {
    this.alarmPlusQuery.reply = null
  }
}
</script>
