<template>
  <div class="chatting-msg-wrap">
    <div class="invite">{{ noticeMessage }}</div>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "MessageInvite",
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