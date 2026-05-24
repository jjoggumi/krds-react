<template>
  <iframe
      v-iframe-resize="{ log: false, checkOrigin: false, heightCalculationMethod: 'lowestElement' }"
      ref="parentToTeacher"
      :srcdoc="eventHtml"
      class="event-temp-same-iframe"
      frameborder="0"
      framespacing="0"
      marginheight="0"
      marginwidth="0"
      scrolling="no"
      vspace="0"
      id="eventIframe"
  />
</template>

<script>
import iFrameResize from 'iframe-resizer/js/iframeResizer'

export default {
  name: "parent-to-teacher-detail",
  directives: {
    'iframe-resize': {
      bind(el, binding) {
        iFrameResize(binding.value, el)
      }
    }
  },
  props: {
    postId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      eventHtml: ''
    }
  },
  created() {
  },
  mounted() {
    window.addEventListener('message', this.handleIframeTask)
    this.getEventWebViewHtml()
  },
  destroyed() {
    window.removeEventListener('message', this.handleIframeTask)
  },
  methods: {
    getEventWebViewHtml() {
      let token = this.$authentication.load().idToken;

      this.$axios({
        method: 'get',
        url: `${this.$apiUrl}/v2/posts/${this.postId}/event`,
        headers: token === undefined ? {} : { Authorization: 'Bearer ' + token }
      })
          .then(r => {
            const domParser = new DOMParser()
            const doc = domParser.parseFromString(r.data, 'text/html')

            const script = doc.createElement('script')
            script.src = 'https://download.hiclass.net/static/assets/js/iframe-resizer/iframeResizer.contentWindow.min.js'
            doc.body.appendChild(script)

            const style = doc.createElement('style')
            style.innerHTML = `.event-temp-same-iframe-wrap { height: min-content !important }`
            doc.head.appendChild(style)

            this.eventHtml = doc.documentElement.innerHTML

            this.$nextTick(() => {
              // eslint-disable-next-line no-undef
              srcDoc.set(this.$refs.recommendCode)
            })
          })
    },

    /**
     * 웹뷰 iframe에서 전달받은 공유할 메시지 클립보드 복사
     * @param e
     */
    handleIframeTask(e) {
      try {
        if (e.data !== null && e.data !== undefined && e.data !== '') {
          if (
              e.data.command === 'shareMessage' &&
              e.data.message
          ) {
            this.copyToClipboard(e.data.message)
            this.$toasted.show('추천코드가 복사되었습니다.')
          }
        }

      } catch (e) {
        this.$log.debug(e)
      }
    },

    /**
     * 클립보드 복사
     * @param message
     */
    copyToClipboard(message) {
      let dummy = document.createElement('textarea')
      document.body.appendChild(dummy)
      dummy.value = message
      dummy.select()
      document.execCommand('copy')
      document.body.removeChild(dummy)
    }
  }
}
</script>

<style scoped>

</style>