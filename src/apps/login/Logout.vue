<template>
  <main-loading-new-tab />
</template>

<script>
import MainLoadingNewTab from '../main/MainLoadingNewTab.vue'
import jwt_decode from "jwt-decode";

export default {
  name: 'logout',
  components: {
    MainLoadingNewTab
  },
  data() {
    return {
      callbackUrl: ''
    }
  },
  methods: {
    logout() {
      let decoded = {}
      try {
        decoded = jwt_decode(localStorage.getItem('idToken'))
      } catch (e) {
        this.$log.warn(e)
      }
      const userSns = decoded.ocrId || localStorage.getItem('clientRegistrationId')

      if (userSns !== undefined && userSns !== null)
        this.logoutSns(userSns.toLowerCase())
      else
        this.routeIndex()
    },
    logoutSns(snsType) {
      let routePath = ''

      switch (snsType) {
        case 'iscream':
          routePath =
            process.env.VUE_APP_BASE_ISCREAM_OAUTH2_URI +
            process.env.VUE_APP_BASE_LOGIN_ISCREAM_SSO_LOGOUT_PATH +
            process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
            encodeURIComponent(this.callbackUrl)
          break

        case 'iscreammedia':
          routePath =
            process.env.VUE_APP_BASE_ISCREAMMEDIA_OAUTH2_URI +
            process.env.VUE_APP_BASE_LOGIN_ISCREAMMEDIA_LOGOUT_PATH +
            process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
            encodeURIComponent(this.callbackUrl)
          break

        case 'hiclass':
          routePath =
            process.env.VUE_APP_BASE_HICLASS_OAUTH2_LOGOUT_URI +
            process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
            encodeURIComponent(this.callbackUrl)
          break

        case 'kakao':
          if (window.location.origin === process.env.VUE_APP_BASE_UI_URI) {
            routePath = `${process.env.VUE_APP_KAKAO_ACCOUNT_URI}/logout?continue=` +
              encodeURIComponent(
                `${process.env.VUE_APP_KAKAO_OAUTH2_URI}/logout/callback` +
                `?logout_redirect_uri=${this.callbackUrl}` +
                `&client_id=${process.env.VUE_APP_KAKAO_OAUTH2_CLIENT_ID}`
              )
          }
          break
      }
      routePath ? window.location.href = routePath : this.routeIndex()
    },
    setCallbackUrl() {
      this.callbackUrl = window.location.origin + process.env.VUE_APP_BASE_LOGOUT_CALLBACK_PARAMETER_SUFFIX
      this.logout()
    },
    routeIndex() {
      this.$authentication.clear()
      this.$router.push('/', () => {})
    }
  },
  created() {
    this.setCallbackUrl()
  }
}
</script>

<style scoped></style>
