<template>
  <div></div>
</template>

<script>
import { getUrlParams } from '@/plugins/utils'

export default {
  name: "login-sso-check",
  data() {
    return {
      callbackUrl: '',
    }
  },
  computed: {
    loginId() {
      return localStorage.getItem('principalName')
    }
  },
  created() {
    /**
     * 1. SSO login Check 위해 페이지 리다이렉트
     */
    if (!localStorage.getItem('isLoadingSsoLoginCheck'))
      this.getSsoUid()
  },
  mounted() {
    const isLoadingSsoLoginCheck = localStorage.getItem('isLoadingSsoLoginCheck')
    const ssoLoginCheckUid = localStorage.getItem('ssoLoginCheckUid') || null
    const curLoginId = this.loginId || null

    /**
     * 2. 리다이렉트 완료
     */
    if (isLoadingSsoLoginCheck) {

      /**
       * 아이스크림 SSO 로그인된 loginId 와 하이클래스 loginId 가 다르면 로그아웃 처리
       */
      if (ssoLoginCheckUid && !this.isSameSsoLoginId(curLoginId, ssoLoginCheckUid)) {
        this.changedUserAlert()
        this.setCallbackUrl()
        this.logoutTeacher()
      }

    }

    /**
     * 3. SSO check 파라미터 삭제
     */
    const LOADING_TIMEOUT = 60 * 1000

    setTimeout(() => {
      localStorage.removeItem('isLoadingSsoLoginCheck')
      localStorage.removeItem('ssoLoginCheckUid')
    }, LOADING_TIMEOUT)

  },
  destroyed() {},
  methods: {
    /**
     * 하이클래스를 이용중인 loginId 와 SSO 로그인된 loginId 가 동일한지 확인
     * @param curLoginId
     * @param ssoLoginCheckUid
     * @return {boolean}
     */
     isSameSsoLoginId(curLoginId, ssoLoginCheckUid) {
      curLoginId = curLoginId || null
      ssoLoginCheckUid = ssoLoginCheckUid || null

      /**
       * SSO loginId 값이 null 일 경우 logout 처리 하지 않음
       *
       * 1. 아이스크림 SSO 세션이 만료되었을 때
       * 2. SSO 서버가 동작하지 않을 때
       */
      if (curLoginId === null || ssoLoginCheckUid === null)
        return true

      return (curLoginId === ssoLoginCheckUid)
    },

    getSsoUid() {
      const ssoLoginCheckUrl = this.getSsoLoginCheckUrl()

      if (ssoLoginCheckUrl) {
        localStorage.setItem('isLoadingSsoLoginCheck', 'true')

        /**
         * sso login check 페이지로 리다이렉트
         */
        window.location.href = ssoLoginCheckUrl
      }

    },

    getSsoLoginCheckUrl() {
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      const port = this.$comn.getLocationPort()
      const domainUrl = protocol + '//' + hostname + port

      let ssoLoginCallbackUrl = domainUrl +  this.$route.path

      /**
       * 콜백 URL 설정 시 이전 uid 파라미터가 포함되지 않도록 함
       * @type {string}
       */
      const paramsQueryString =
          Object.entries(getUrlParams()).map(p => {
              if (encodeURIComponent(p[0]) === 'uid') return null
              return encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1])
            }
          ).join('&') || null

      this.$log.debug(`setSsoLoginCheckUrl() paramsQueryString => `, paramsQueryString)

      if (paramsQueryString)
        ssoLoginCallbackUrl += '?' + paramsQueryString

      return process.env.VUE_APP_BASE_ISCREAM_OAUTH2_URI
          + '/login/callback/check'
          + `?callback_url=${encodeURIComponent(ssoLoginCallbackUrl)}` || null
    },

    /**
     * 로그인 사용자 변경 알림
     */
    changedUserAlert() {
      const changedUserAlertMsg = '로그인 사용자가 변경되었습니다.\n로그인 계정을 다시 한번 확인해주세요.'
      const excludePaths = [
        '/login/callback/iscream2',
        '/login/callback',
        '/logout/callback',
      ]
      const curPath = window.location.href
      const isExcluded = excludePaths.find(path => curPath.includes(path))

      if (curPath !== '/' && !isExcluded) {
        this.$log.warn(`changedUserAlert() curPath => `, curPath)
        alert(changedUserAlertMsg)
      }
    },

    /**
     * 로그아웃 callBack url
     */
    setCallbackUrl() {
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      const port = this.$comn.getLocationPort()
      const domainUrl = protocol + '//' + hostname + port
      this.callbackUrl =
        domainUrl + process.env.VUE_APP_BASE_LOGOUT_CALLBACK_PARAMETER_SUFFIX
    },

    /**
     * 하이클래스 선생님 logout 처리
     */
    logoutTeacher() {
      window.location.href = process.env.VUE_APP_BASE_ISCREAM_OAUTH2_URI +
        process.env.VUE_APP_BASE_LOGIN_ISCREAM_SSO_LOGOUT_PATH +
        process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
        encodeURIComponent(this.callbackUrl)
    },

  }
}
</script>

<style scoped>

</style>