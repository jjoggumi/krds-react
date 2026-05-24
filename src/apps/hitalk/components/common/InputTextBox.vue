<template>
  <input type="text" :placeholder="placeholder || '이름 검색'" v-bind:value="value" v-on:input="updateInput">
</template>

<script>
export default {
  props: ['value', 'placeholder'],
  methods: {
    updateInput: function(event) {
      this.$emit('input', event.target.value);
    }
  }
}
</script>

<style scoped>

</style>