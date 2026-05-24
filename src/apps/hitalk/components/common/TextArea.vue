<template>
  <textarea
    type="text"
    placeholder="작성된 메시지를 각 개인 1:1 채팅방에 일괄로 보냅니다."
    :value="value"
    :maxlength="maxLength"
    :disabled="disabled"
    oninput="this.parentNode.dataset.replicatedValue = this.value"
    @input="updateInput"
  />
</template>

<script>
export default {
  props: {
    value: {
      type: String,
    },
    maxLength: {
      type: Number,
      default() {
        return null
      }
    },
    disabled: {
      type: Boolean,
    }
  },
  methods: {
    updateInput: function(event) {
      this.$emit('input', event.target.value);
    }
  }
}
</script>

<style scoped>

</style>