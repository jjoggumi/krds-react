<template>
  <div
    v-if="$route.query.uuid"
    class="m-wrap"
  >
    <div class="m-container">
      <iframe
        ref="iframeContent"
        id="iframeContent"
        :src="iframe.src"
        :width="width"
        :height="height"
        @load="iframeLoaded"
        style="border: 0;"
      ></iframe>
    </div>

  </div>

  <div v-else></div>
</template>

<script>
import MobileDetect from "mobile-detect";
import {mapActions} from "vuex";

export default {
  name: 'MobileAlarmPlus',
  components: {},
  data() {
    return {
      iframe: {
        src: process.env.VUE_APP_BASE_ALARM_PLUS_URI,
        width: '99vw',
        height: '95vh'
      },
      width: 400,
      height: 300
    }
  },
  /*watch: {
    $route() {
      this.setComponent()
    }
  },*/
  methods: {
    ...mapActions({
      openTermsView: "openTermsView",
    }),
    setQuery(keys) {
      for (const key of keys) {
        if (this.$route.query[key] !== undefined)
          localStorage.setItem(key, this.$route.query[key])
      }
    },
    // setComponent() {
    //   let id = this.$route.params.id
    //   this.curForm = id.replace(/^./, id[0].toUpperCase())
    //   document.title = 'MobileHelp-' + this.curForm
    // }
    iframeLoaded() {
      const queryParam = this.$authentication.load()
      const loginInfoJson = {
        uuid: queryParam.uuid,
        idToken: queryParam.idToken,
        refreshToken: queryParam.refreshToken
      }
      this.$refs.iframeContent.contentWindow.postMessage(loginInfoJson, '*')
    },
    clickFooterItem(name) {
      if (name === 'terms') {
        this.openTermsView({ layerType: 'terms' })
      } else if (name === 'privacyPolicy') {
        this.openTermsView({ layerType: 'privacyPolicy' })
      }
      /*else if (name === 'contactus') {
        this.$router.push('/help/contactus', () => {})
      }*/
    },
    goto(name) {
      if (name === 'home') {
        // this.$router.push('/')
        // TODO: 앱 웹뷰에서 네이티브 메인페이지로 이동할 인터페이스가 필요함

        const userAgent = navigator.userAgent
        const md = new MobileDetect(userAgent)
        // const routePath = '/'

        try {
          if (md.mobile()) {
            if (md.os() === 'AndroidOS') {
              // ex)
              // AOSHandler.redirect(routepath)

            } else if (md.os() === 'iOS') {

              // ex)
              // const message = {
              //   functionname: 'redirect',
              //   routePath
              // }
              // window.webkit.messageHandlers.iOSHandler.postMessage(message);

            } else {
              alert('지원하지 않는 기기입니다.')
            }

          } else {
            alert('지원하지 않는 기기입니다.')
          }

        } catch (error) {
          alert('요청에 실패했습니다.')
        }

      }
    },
    handleIframeTask(e) {
      // if (e.origin !== 'http://1.209.6.154:8080') {
      //   return
      // }
      if (e.data !== undefined && e.data !== null && e.data !== '') {
        if (
          e.data === 'clickFooterItem|terms' ||
          e.data === 'clickFooterItem|privacyPolicy' ||
          e.data === 'clickFooterItem|contactus' ||
          e.data === 'goto|home'
        ) {
          const taskName = this.$comn.split(e.data, '|')
          const functionName = this.$comn.split(e.data, '|', 0)
          this[functionName](taskName)
        }
      }
    }
  },
  created() {
    const keys = ['uuid', 'idToken', 'refreshToken', 'userType']
    this.setQuery(keys)
    // this.setComponent()
  },
  mounted() {
    this.width = window.innerWidth
    this.height = window.innerHeight

    window.addEventListener('message', this.handleIframeTask)
  },
  destroyed() {
    this.$authentication.clear()

    window.removeEventListener('message', this.handleIframeTask)
  }
}
</script>

<!--<style scoped src="../../../assets/css/m-customer.css" />-->
