<template>
  <div></div>
</template>

<script>
import {eventBus} from "@/main";
import {mapMutations, mapState} from "vuex";

export default {
  name: "html-print",
  components: {},
  props: {
    content: {
      type: HTMLDivElement
    }
  },
  data() {
    return {
      printCss: ``,
      printDiv: null,
      printStyle: null,
      mQuery: null
    }
  },
  computed: {
    ...mapState({
      htmlPrint: 'htmlPrint'
    }),
  },
  mounted() {
    window.scrollTo(0, 0)

    window.onbeforeprint = () => {
      this.beforePrint()
    }

    // on afterprint cross browsing
    if (window.matchMedia) {
      this.mQuery = window.matchMedia('print')
      this.mQuery.addListener(mql => {
        if (!mql.matches) {
          this.afterPrint()
        }
      })
    }

    window.print();
  },
  beforeDestroy() {
    this.mQuery = null
  },
  destroyed() {
    this.$store.commit('setIsLoading', false)
  },
  methods: {
    ...mapMutations({
      setHtmlPrint: 'setHtmlPrint'
    }),
    close() {
      this.setHtmlPrint({
        content: null,
        isOpen: false
      })
      eventBus.$emit('clazz-application-form-pdf-download-complete')
    },
    beforePrint() {
      this.printDiv = document.createElement('div')
      this.printDiv.className = 'print-div'

      this.printStyle = document.createElement('style')
      this.printStyle.textContent = this.printCss

      document.body.appendChild(this.printDiv)
      document.body.appendChild(this.printStyle)
      this.printDiv.appendChild(this.content)
    },
    afterPrint() {
      this.printDiv ? this.printDiv.remove() : false
      this.printStyle ? this.printStyle.remove() : false

      this.close()
    }
  }
}
</script>

<style lang="scss">
@media print {
  .medication-wrap { page-break-inside:avoid; page-break-after:auto }
}
</style>