<template>
  <div class="chatting-msg-wrap">
    <div class="ejection">{{ noticeMessage }}</div>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "MessageEjection",
  props: {
    message: Object
  },
  computed: {
    noticeMessage: function () {
      return this.message.noticeMessage;
    },
  }
}
</script>

<style scoped>

</style>