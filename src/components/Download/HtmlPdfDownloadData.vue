<template>
  <div class="print-div">
    <div class="pdf-content"></div>
  </div>
</template>

<script>
export default {
  name: "html-pdf-download-data",
  props: ['pdfContent'],
  data() {
    return {}
  },
  mounted() {
    const dom = document.querySelector('.print-div .pdf-content')
    if (dom && this.pdfContent) {
      dom.appendChild(this.pdfContent)
    }
  },
  methods: {}
}
</script>

<style scoped>
</style>