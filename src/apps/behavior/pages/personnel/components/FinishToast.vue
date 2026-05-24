<template>
  <div :class="className" ref="finishToast">
    <p class="msg">
      <i v-if="message.kind !== 'confirmToast'" class="bh-icon-checkbox-checked-orange"></i>
        {{ message.text }}              
    </p>
    <p class="esc" @click="$emit('undo')"  v-if="message.kind === 'checkFinish'">
      <i class="bh-icon-refresh-on-20"></i>
      실행취소
    </p>
  </div>
</template>
<script>

export default {
  name: 'FinishToast',
  props: {
    className: {
      type: String,
      default: 'finish-toast'
    },
    message: {
      type: Object,
      required: true
    }
  },
  mounted() {
    this.$emit('finish-toast-ready', this.$refs.finishToast)
  },
}
</script>
<style scoped>
</style>