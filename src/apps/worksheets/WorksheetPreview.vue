<template>
  <iframe
    ref="worksheetPreviewPage"
    :src="iframeSrc"
    @load="onLoadIframe"
    style="border: 0;"
    :style="iframeStyle"
  ></iframe>
</template>

<script>
import {mapFields} from "vuex-map-fields";
import {mapActions} from "vuex";

export default {
  name: "worksheet-preview",
  props: {
    worksheetId: {
      type: String,
      required: true
    },
    isVisibleHeader: {
      type: Boolean
    }
  },
  computed: {
    ...mapFields('storeWorksheet', {
      // iframeWorksheetPreviewPage: 'iframe.worksheetPreviewPage'
    }),
    iframeSrc() {
      const params = {
        quizIdx: this.worksheetId,
        idToken: this.$authentication.load().idToken,
        hideMakeHeader: this.$route.params.hideMakeHeader || false
      }
      return '/module/worksheet/make/quizWorksheetPreviewPage.html' + '?' + this.$qs.stringify(params)
    },
    iframeStyle() {
      const style = {}

      if (!this.isVisibleHeader) {
        style['height'] = 'calc(100vh)'
      }

      return style
    }
  },
  methods: {
    ...mapActions('storeWorksheet', {
      loadedWorksheetIframe: 'loadedWorksheetIframe',
      initIframes: 'initIframes',
    }),
    onLoadIframe() {
      const name = 'worksheetPreviewPage'
      const payload = {
        name,
        data: this.$refs[name],
        authentication: this.$authentication.load()
      }
      this.loadedWorksheetIframe(payload)
    },
  },
  created() {
  },
  mounted() {
  },
  destroyed() {
    this.initIframes()
  }
}
</script>

<style scoped>

</style>