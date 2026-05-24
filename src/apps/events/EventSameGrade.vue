<template>
  <iframe
      v-iframe-resize="{ log: false, checkOrigin: false, heightCalculationMethod: 'lowestElement' }"
      ref="eventSameGrade"
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
  name: "EventSameGrade",
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
          srcDoc.set(this.$refs.eventSameGrade)
        })
      })
    },

    handleIframeTask(e) {
      try {
        if (e.data !== null && e.data !== undefined && e.data !== '') {
          // iframe 에서 alert 메시지 전달
          if (
              e.data.command === 'alert' &&
              e.data.msgData &&
              e.data.msgData.message
          ) {
            this.$hiClass.alert(e.data.msgData.message, e.data.msgData.icon, false)
                .then(() => {
                  switch (e.data.additionalProcess) {
                    case 'goto|back': {
                      this.goto('back')
                      break
                    }
                    case 'goto|home': {
                      this.goto('home')
                      break
                    }
                    case 'fail': {
                      this.$refs.eventSameGrade.contentWindow.postMessage({ "result" : "fail" }, '*');
                      break
                    }
                    default:
                      this.$refs.eventSameGrade.contentWindow.postMessage({ "result" : "ok" }, '*');
                  }
                })
            return false
          }

          // iframe 에서 confirm 메시지 전달
          if (
              e.data.command === 'confirm' &&
              e.data.msgData &&
              e.data.msgData.message
          ) {
            this.$hiClass.confirm(e.data.msgData.message, e.data.msgData.icon)
                .then(async () => {
                  switch (e.data.additionalProcess) {
                    case 'goto|back': {
                      this.goto('back')
                      break
                    }
                    case 'goto|home': {
                      this.goto('home')
                      break
                    }
                    case 'checkJoin': {
                      if (e.data.canJoin) {
                        this.$hiClass.events.play(e.data.eventId, e.data.data)
                            .then(async r => {
                              this.$set(e.data.data, 'currentClassCount', r.data.currentClassCount);
                              const message = {
                                eventSameGrade: e.data.data,
                                result: "callSubmitSuccessAlert",
                                sameGradeId: r.data.sameGradeId
                              };
                              this.$refs.eventSameGrade.contentWindow.postMessage(message, '*');
                            })
                            .catch(r => {
                              this.$log.debug("EventSameGrade - play => ", r);
                              this.$hiClass.alert('이벤트 응모 도중 오류가 발생했습니다.', 'warning', true)
                            });
                      } else {
                        this.$hiClass.alert('이미 참여한 내역이 있습니다.', e.data.msgData.icon, false);
                      }
                      break
                    }
                    case 'cancelJoin': {
                      if (e.data.sameGradeId) {
                        try {
                          const res = await this.$axios({
                            method: 'DELETE',
                            url: `/eventSameGrades/${e.data.sameGradeId}`
                          })
                          const message = {
                            result: "callCancelJoinSuccessAlert"
                          };
                          this.$refs.eventSameGrade.contentWindow.postMessage(message, '*');
                          this.$hiClass.alert('이벤트 취소가 완료되었습니다.', 'info', false)
                        } catch (e) {
                          this.$log.debug("EventSameGrade - cancelJoin => ", e);
                          this.$hiClass.alert('이벤트 취소 도중 오류가 발생했습니다.', 'warning', true)
                        }
                      }
                      break
                    }
                  }
                })
            return false
          }
        }

      } catch (e) {
        this.$log.debug(e)
      }
    },
  }
}
</script>

<style scoped>
iframe.event-temp-same-iframe {
  min-height: 800px;
}
</style>
