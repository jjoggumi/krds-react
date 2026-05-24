<template>
  <div>
    <!-- logon -->
    <MainLoadingNewTab v-if="isMainLoadingNewTab"></MainLoadingNewTab>
  </div>
</template>

<script>
import MainLoadingNewTab from '../main/MainLoadingNewTab.vue'
import jwt_decode from "jwt-decode";

export default {
  name: 'login-iscream-callback-1',
  components: {
    MainLoadingNewTab
  },
  data: () => ({
    isMainLoadingNewTab: true,
    callbackUrl: ''
  }),
  created() {
    this.$log.debug(this.$options.name, 'iscream login! 1')

    if (this.getUserSns().toLowerCase() === 'iscreammedia') {
      this.$log.debug(this.$options.name, 'userSns iscreammedia login !')
      this.$router.replace({
        path: '/login/callback',
        query: this.$route.query
      }, () => {})

    } else {
      this.$log.debug(this.$options.name, 'userSns iscream login !')

      this.setCallbackUrl()
      this.$nextTick(() => {
        this.socialButtonClick()
      })
    }
  },
  methods: {
    socialButtonClick() {
      this.$log.debug('this.$route.query => ', this.$route.query)
      const queryParam = this.$route.query
      this.$authentication.save(queryParam)

      const routePath =
        process.env.VUE_APP_BASE_ISCREAM_OAUTH2_URI +
        process.env.VUE_APP_BASE_LOGIN_ISCREAM_SSO_LOGIN_PATH +
        this.callbackUrl
      this.$log.debug('routePath => ', routePath)
      window.location.href = routePath
    },
    setCallbackUrl() {
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      const port = this.$comn.getLocationPort()
      const domainUrl = protocol + '//' + hostname + port

      this.callbackUrl =
        process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
        domainUrl +
        process.env.VUE_APP_BASE_LOGIN_ISCREAM_CALLBACK_PARAMETER_SUFFIX_2
    },
    getUserSns() {
      const idToken = this.$route.query.idToken || ''
      const clientRegistrationId = this.$route.query.clientRegistrationId || ''

      let decoded = {}
      try {
        decoded = jwt_decode(idToken)
      } catch (e) {
        this.$log.warn(e)
      }
      return decoded.ocrId || clientRegistrationId
    }
  },
}
</script>

<style scoped></style>
