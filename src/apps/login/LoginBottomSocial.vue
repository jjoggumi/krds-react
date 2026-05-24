<template>
  <div id="loginBottom" class="login-style">
    <div
      v-for="(socialType, index) of socialTypes"
      :key="`${socialType}-${index}`"
      class="login-style"
      :class="[`type-${socialType}`]"
    >
      <button
        class="icon"
        @click="socialButtonClick(socialType)"
      >
        <span>
          {{ $t(`login.${socialType}`) }}
        </span>
      </button>
      <div
        v-if="socialType === 'apple'"
        id="appleid-signin"
        class="signin-button"
        data-type="sign in"
      ></div>
    </div>
  </div>
</template>

<script>
import {mapActions} from 'vuex'
export default {
  name: 'login-bottom-social',
  data() {
    return {
      callbackUrl: '',
      path: '',
    }
  },
  computed: {
    iscream() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_ISCREAM_PATH +
        this.callbackUrl
      )
    },
    iscreammedia() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_ISCREAMMEDIA_PATH +
        this.callbackUrl
      )
    },
    kakao() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_KAKAO_PATH +
        this.callbackUrl
      )
    },
    naver() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_NAVER_PATH +
        this.callbackUrl
      )
    },
    google() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_GOOGLE_PATH +
        this.callbackUrl
      )
    },
    apple() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_APPLE_PATH
      )
    },
    userType() {
      return this.$route.params.userType
        ? this.$route.params.userType.toUpperCase()
        : null
    },
    ignoreSocials() {
      const ignoreSocials = []
      if (this.userType === 'TEACHER')
        ignoreSocials.push(...['kakao', 'naver'])

      if (this.userType !== 'TEACHER' || this.$route.params.id !== 'v2')
        ignoreSocials.push(...['iscreammedia'])

      return ignoreSocials
    },
    socialTypes() {
      const socialTypes = [
        'iscreammedia',
        'kakao',
        'naver',
        'google',
        'apple'
      ]
      return socialTypes.filter(social => !this.ignoreSocials.includes(social))
    },
    fromTemporaryEntry () {
      return window.location.search.includes('tep')
    },
    fromParentsToTeacher () {
      return window.location.search.includes('p2t')
    }
  },
  created() {},
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    async socialButtonClick(loginType) {
      this.triggerAnalyticsLogEvent({code: `analytics.login.${this.userType.toLowerCase()}.${loginType}`})
      this.setCallbackUrl(loginType)

      const path = this[loginType]

      // 애플 로그인
      if (loginType.indexOf('apple') > -1) {
        window.AppleID.auth.init({
          clientId: 'ios.com.iscreammedia.app.hiclass',
          scope: 'name email',
          redirectURI: `${path}?userType=${this.userType}`,
          state: 'STATE'
        })
        document.querySelector('#appleid-signin').click()
      } else {
        window.location.href = `${path}?userType=${this.userType}`
      }
    },
    setCallbackUrl(loginType) {
      const port = this.$comn.getLocationPort()
      const domainUrl = `${window.location.protocol}//${window.location.hostname}${port}`

      if (this.fromTemporaryEntry)
        return this.processTemporaryEntryCallback(domainUrl);

      if (this.fromParentsToTeacher)
        return this.processParentsToTeacherCallback(domainUrl);

      switch (loginType) {
        case 'iscream':
        case 'iscreammedia': {
          this.callbackUrl =
            process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
            domainUrl +
            process.env.VUE_APP_BASE_LOGIN_ISCREAM_CALLBACK_PARAMETER_SUFFIX_1
          break
        }
        default: {
          this.callbackUrl =
            process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
            domainUrl +
            process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_SUFFIX
        }
      }
    },
    processTemporaryEntryCallback(domainUrl) {
      this.callbackUrl =
          process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
          domainUrl + '/tep?step=3'
    },
    processParentsToTeacherCallback(domainUrl) {
      const p2tPath = decodeURIComponent(document.location.search.substring(1)).split('=')[0]
      const step = {
        'PARENTS': 1,
        'TEACHER': 3,
      }[this.userType]
      this.callbackUrl =
          process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX
          + `${domainUrl}/${p2tPath}?step=${step}`
    }
  },
}
</script>

<style lang="scss" scoped>
  .signin-button {
    display: none;
  }
  .page-login {
    .login-style {
      button::before {
        width: 20px;
        height: 20px;
        background-position: 0 -2px;
      }

      &.type-iscreammedia button {
        background:#f66a45;
        color:#fff;

        &:before {
          width: 10px;
        }
      }
    }
  }
</style>
