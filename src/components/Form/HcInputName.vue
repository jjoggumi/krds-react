<template>
  <input
    type="text"
    ref="input"
    maxlength="20"
    :placeholder="$t('main.text.name')"
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
  name: "hc-input-name",
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
      if (val && !this.$validation.isRegNamePattern4(val)) {
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