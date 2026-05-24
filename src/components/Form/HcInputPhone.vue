<template>
  <input
    type="text"
    v-model="val"
    maxlength="13"
    placeholder="숫자만 입력해 주세요."
    @keyup="handleChange"
    @blur="handleBlur"
    @keydown.enter.prevent.stop
  />
</template>

<script>
export default {
  name: 'HcInputPhone',
  props: {
    value: String
  },
  data() {
    return {
      val: this.value && this.value.replace(/[^\d]/g, '').replace(/^(\d{3})-?(\d+)-?(\d{4})$/, '$1-$2-$3')
    }
  },
  watch: {
    value(val) {
      this.val = val && val.replace(/[^\d]/g, '').replace(/^(\d{3})-?(\d+)-?(\d{4})$/, '$1-$2-$3')
    }
  },
  methods: {
    handleChange() {
      const digit = this.val.replace(/[^\d]/g, '').substring(0, 11)
      this.val = digit.replace(/^(\d{3})-?(\d+)-?(\d{4})$/, '$1-$2-$3')
    },
    handleBlur() {
      this.val = this.val && this.val.replace(/[^\d]/g, '').substring(0, 11)
      this.$emit('input', this.val)
      this.val = this.val && this.val.replace(/^(\d{3})-?(\d+)-?(\d{4})$/, '$1-$2-$3')
    }
  }
}
</script>

<style scoped>
</style>
