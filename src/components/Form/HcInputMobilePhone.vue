<template>
  <input
    type="text"
    ref="input"
    maxlength="11"
    :placeholder="$t('main.text.onlynum')"
    :value="val"
    @input="val = $event.target.value"
    @focus="handleInput"
    @blur="handleInput"
    @keydown.enter.prevent.stop
    @keyup="handleInput"
  />
</template>

<script>
export default {
  name: "hc-input-mobile-phone",
  props: {
    value: String
  },
  data() {
    return {
      val: this.value
    }
  },
  computed: {},
  watch: {
    val(val, oldVal) {
      if (val && !this.$validation.isRegNumber(val)) {
        if (oldVal === undefined) oldVal = null
        this.val = oldVal
        this.$refs.input.value = oldVal
      }
    }
  },
  methods: {
    handleInput(evt) {
      this.$emit('handleInput', evt)
    }
  }
}
</script>

<style scoped>

</style>