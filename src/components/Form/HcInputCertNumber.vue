<template>
  <input
    type="text"
    ref="input"
    maxlength="6"
    :placeholder="$t('main.text.req6lennum')"
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
  name: "hc-input-cert-number",
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