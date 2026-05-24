<template>
  <div v-if="isError" :key="src"></div>
  <div v-else :key="src" class="emoticon">
    <img :src="src" alt="" @error="onError" />
  </div>
</template>

<script>
export default {
  name: 'sticker-wrap',
  components: {},
  data() {
    return {
      isError: false
    }
  },
  props: {
    src: {
      type: String,
      require: true,
      default() {
        return ''
      }
    },
  },
  methods: {
    onError() {
      this.isError = true
    }
  }
}
</script>

<style></style>
