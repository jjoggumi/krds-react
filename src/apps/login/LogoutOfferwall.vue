<template>
  <main-loading-new-tab />
</template>

<script>
import MainLoadingNewTab from '../main/MainLoadingNewTab.vue'
import axios from "axios";

export default {
  name: 'logoutOfferwall',
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
      // 2차 인증을 삭제한다.
      this.clear2fa();
      window.location.href =
          process.env.VUE_APP_BASE_HICLASS_OAUTH2_LOGOUT_URI +
          process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
          this.callbackUrl
    },
    setCallbackUrl() {
      this.callbackUrl = window.location.origin + process.env.VUE_APP_BASE_LOGOUT_OFFERWALL_CALLBACK_PARAMETER_SUFFIX
      this.logout()
    },
    clear2fa() {
      const authInfo = this.$authentication.load();

      if (authInfo && authInfo.idToken) {
        axios.delete(`${this.$apiUrl}/advertiser/2fa`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authInfo.idToken}`
          },
          data: null
        });
      }
    },
  },
  created() {
    this.setCallbackUrl()
  }
}
</script>

<style scoped></style>
