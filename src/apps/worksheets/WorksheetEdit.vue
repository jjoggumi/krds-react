<template>
  <iframe
    ref="worksheetEditPage"
    :src="iframeSrc"
    @load="onLoadIframe"
    :style="worksheetEditPageStyle"
  ></iframe>
</template>

<script>
import {mapFields} from "vuex-map-fields";
import {mapActions} from "vuex";

export default {
  name: "worksheet-edit",
  props: {
    worksheetId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      height: null,
      worksheetEditPageStyle: {
        border: 0,
        zoom: 1.0,
        transform: 'scale(1.0)',
        '-moz-transform': 'scale(1.0)',
        '-moz-transform-origin': '0 0',
        '-o-transform': 'scale(1.0)',
        '-o-transform-origin': '0 0',
        '-webkit-transform': 'scale(1.0)',
        '-webkit-transform-origin': '0 0'
      }
    }
  },
  computed: {
    ...mapFields('storeWorksheet', {
      isInvisibleLoading: 'isInvisibleLoading'
    }),
    iframeSrc() {
      const params = {
        quizIdx: this.worksheetId,
        idToken: this.$authentication.load().idToken
      }
      return '/module/worksheet/make/quizWorksheetEditPage.html' + '?' + this.$qs.stringify(params)
    }
  },
  created() {
  },
  mounted() {
    window.addEventListener('message', this.handleIframeTask)
  },
  beforeDestroy() {
    this.initIframes()

    this.isInvisibleLoading = false
  },
  destroyed() {
    window.removeEventListener('message', this.handleIframeTask)
  },
  methods: {
    ...mapActions('storeWorksheet', {
      loadedWorksheetIframe: 'loadedWorksheetIframe',
      initIframes: 'initIframes',
    }),
    onLoadIframe() {
      const name = 'worksheetEditPage'
      const payload = {
        name,
        data: this.$refs[name],
        authentication: this.$authentication.load()
      }
      this.loadedWorksheetIframe(payload)
    },
    goto(name) {
      if (name === 'home')
        this.$router.push('/')
      else if (name === 'back')
        this.$router.go(-1)
      else if (name === 'clazzesFormSheetList') {
        const classId = this.$route.params.parentId
        this.$router.replace(`/main/clazzes/${classId}/form/sheetList`)
      }
    },
    open(name) {
      if (name === 'userSign')
        this.$hiClass.changeUserSign()
    },
    handleIframeTask(e) {
      // if (e.origin !== 'http://1.209.6.154:8080') {
      //   return
      // }

      try {
        if (e.data !== null && e.data !== undefined && e.data !== '') {

          // iframe 내 첨부파일 뷰어
          if (
            e.data.command === 'open-attach-file'&&
            e.data.file &&
            e.data.file.fileOriginalPath
          ) {
            this.$hiClass.openAttachFile(e.data.file)
            return
          }

          // iframe 에서 alert 메시지 전달
          if (
            e.data.command === 'alert' &&
            e.data.msgData &&
            e.data.msgData.message
          ) {
            this.$hiClass.alert(e.data.msgData.message, e.data.msgData.icon)
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
                  case 'goto|clazzesFormSheetList': {
                    this.goto('clazzesFormSheetList')
                    break
                  }
                  default:
                }
              })
            return
          }

          // iframe 에서 confirm 메시지 전달
          if (
            e.data.command === 'confirm' &&
            e.data.msgData &&
            e.data.msgData.message
          ) {
            this.$hiClass.confirm(e.data.msgData.message, e.data.msgData.icon)
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
                  case 'goto|clazzesFormSheetList': {
                    this.goto('clazzesFormSheetList')
                    break
                  }
                  default:
                }
              })
            return
          }

          // toggle invisible loading
          if (e.data.command === 'toggle-invisible-loading') {
            this.isInvisibleLoading = e.data.value
            return
          }

          if (e.data.command === 'set-iframe-transform-value') {
            const transformValue = e.data.value
            const height = e.data.height || null
            this.worksheetEditPageStyle['height'] = height
            this.worksheetEditPageStyle['transform'] = `scale(${transformValue})`
            this.worksheetEditPageStyle['-moz-transform'] = `scale(${transformValue})`
            this.worksheetEditPageStyle['-o-transform'] = `scale(${transformValue})`
            this.worksheetEditPageStyle['-webkit-transform'] = `scale(${transformValue})`
            return
          }

          // old command
          if (
            e.data === 'clickFooterItem|terms' ||
            e.data === 'clickFooterItem|privacyPolicy' ||
            e.data === 'clickFooterItem|contactus' ||
            e.data === 'goto|home' ||
            e.data === 'goto|back' ||
            e.data === 'goto|clazzesFormSheetList' ||
            e.data === 'open|userSign'
          ) {
            const taskName = this.$comn.split(e.data, '|')
            const functionName = this.$comn.split(e.data, '|', 0)
            this[functionName](taskName)
          }
        }

      } catch (e) {
        this.$log.debug(e)
      }

    },
    sendMessageToChildFrame(to, message) {
      // const childFrame = this.$refs.worksheetEditPage
      to.contentWindow.postMessage(message, '*')
    }

  },
}
</script>

<style scoped>

</style>