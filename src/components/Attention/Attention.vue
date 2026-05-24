<template>
  <div
    class="right-menu-popup"
    :class="{
      on: isShowSlb
    }"
  >
    <!-- iframe -->
    <iframe
      :src="iframeSrc"
      frameborder="0"
      width="200px"
      height="200px"
    ></iframe>
  </div>
</template>

<script>
export default {
  name: "Attention",
  props: {
    isShowSlb: {
      type: Boolean
    }
  },
  data() {
    return {
      iframeSrc: '/module/attension/index.html'
    }
  },
  computed: {},
  created() {},
  mounted() {
    window.addEventListener('message', this.handleIframeTask)
  },
  destroyed() {
    window.removeEventListener('message', this.handleIframeTask)
  },
  methods: {
    clickItem(name) {
      if (name === 'close') {
        this.$emit('close-attension')
      }
    },

    handleIframeTask(e) {
      // if (e.origin !== 'http://1.209.6.154:8080') {
      //   return
      // }
      if (e.data !== undefined && e.data !== null && e.data !== '') {
        if (
          e.data === 'clickItem|close'
        ) {
          const taskName = this.$comn.split(e.data, '|')
          this.clickItem(taskName)
        }
      }
    }

  }
}
</script>

<style scoped></style>