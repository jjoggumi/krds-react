<template>
  <div>
    <div class="chatting-date-wrap">
      <div class="date">{{ dateString }}</div>
    </div>
    <div v-if="isShowProtected" class="chatting-msg-wrap">
      <div class="invite">대화 시 서로 존중하는 마음으로 이용해 주세요.<br>욕설, 비방, 허위 내용 등의 불쾌감을 주거나 명예훼손의 내용은 작성할 수 없습니다.</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MessageDate",
  props: {
    message: Object,
    roomType: String
  },
  computed:{
    timestamp: function(){
      return this.message.insertedTimestamp || this.message.timestamp;
    },
    dateString : function(){
      return this.timestamp ? this.$comn.convertTimestamp2DateByFormat(this.timestamp, "-", "ko") : '';
    },
    isShowProtected: function() {
      return this.roomType !== 'GROUP' && this.timestamp
        && this.$comn.convertTimestamp2DateByFormat(this.$moment(), "-", "ko") === this.dateString;
    }
  }
}
</script>

<style scoped>

</style>