<template>
  <div></div>
</template>
<script>

import {openPopup} from "@/plugins/utils";
import CONSTANTS from "@/plugins/constants";

export default {
  name: 'login-behavior',
  data() {
    return {
      routeQuery: {
        clientRegistrationId: null,
        principalName: null,
        userType: null,
        uuid: null,
        name: null,
        idToken: null,
        refreshToken: null
      }
    }
  },
  computed: {
    loginUrl() {
      const login = `${process.env.VUE_APP_BASE_LOGIN_URI}${process.env.VUE_APP_BASE_LOGIN_ISCREAMMEDIA_PATH}`
      const callbackPrefix = process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX
      const callbackUrl = `${window.location.protocol}//${window.location.hostname}${this.$comn.getLocationPort()}/hiclassbehavior?userType=TEACHER`
      return `${login}${callbackPrefix}${callbackUrl}`
    }
  },
  created() {
    this.setRouteQuery()
  },
  async mounted() {
    if (
        this.routeQuery.principalName && this.$authentication.load().principalName &&
        this.routeQuery.principalName !== this.$authentication.load().principalName
    ) {
      this.$hiClass.alert('로그인 된 계정이 다릅니다.<br>확인 버튼을 눌러 재시도해주세요.', 'warning')
          .then(() => {
            this.$authentication.clear()
            window.location.href = process.env.VUE_APP_BASE_ISCREAMMEDIA_OAUTH2_URI +
                process.env.VUE_APP_BASE_LOGIN_ISCREAMMEDIA_LOGOUT_PATH +
                process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
                encodeURIComponent(this.loginUrl)
          })
      return false
    }

    const existsRouteQuery = await this.loginCheck()

    // 2nd Step Process
    if (existsRouteQuery) {
      try {
        // 기존 userType 저장 오류 예외 처리
        const oldAccountQuery = this.$authentication.load()
        const isWrongUserType = !['TEACHER', 'PARENTS', 'STUDENT',].includes(oldAccountQuery.userType)

        if (oldAccountQuery.userType && isWrongUserType) {
          this.serviceRefresh(false)
          return false
        }

        // 하이클래스에 로그인된 계정이 있는 경우 새 로그인 계정과 같은지 비교함
        const isSameAccount = await this.checkSameAccount()
        isSameAccount ? await this.loginProcess() : this.serviceRefresh(true)

      } catch (e) {
        this.$log.error(e)
        this.logout()
      }
    }
  },
  methods: {
    setRouteQuery() {
      // 중복 쿼리가 있는 경우 첫번째만 저장
      for (const [key, value] of Object.entries(this.$route.query)) {
        this.routeQuery[key] = Array.isArray(value) ? value[0] : value
      }
    },
    serviceRefresh(alertUsed) {
      const logoutAndRetry = () => {
        // 하이클래스 서비스만 로그아웃
        this.$authentication.clear()
        // 앱 재기동
        window.location.reload()
      }
      if (alertUsed) {
        this.$hiClass.alert('로그인 된 계정이 다릅니다.<br>확인 버튼을 눌러 재시도해주세요.', 'warning')
            .then(() => logoutAndRetry())

      } else {
        logoutAndRetry()
      }
    },
    logout() {
      this.$router.push('/logout', () => {})
    },
    async loginCheck() {
      if (
          this.routeQuery.idToken
          && this.routeQuery.clientRegistrationId
          && this.routeQuery.principalName
          && this.routeQuery.userType
          && this.routeQuery.uuid
      ) {
        // 2nd Step => idToken, uuid 인증 서버에서 가져오기 성공
        return true

      } else {
        // 1st Step => SSO 로그인된 계정의 idToken, uuid 인증 서버에서 가져오기 시도
        window.location.replace(this.loginUrl)
        return false
      }
    },
    checkSameAccount() {
      return new Promise((resolve, reject) => {
        let isSameAccount = true

        try {
          const oldAccountQuery = this.$authentication.load()
          if (
              (oldAccountQuery.clientRegistrationId && oldAccountQuery.clientRegistrationId !== this.routeQuery.clientRegistrationId)
              || (oldAccountQuery.principalName && oldAccountQuery.principalName !== this.routeQuery.principalName)
              || (oldAccountQuery.userType && oldAccountQuery.userType !== this.routeQuery.userType)
              || (oldAccountQuery.uuid && oldAccountQuery.uuid !== this.routeQuery.uuid)
          ) {
            isSameAccount = false
          }
          resolve(isSameAccount)

        } catch (e) {
          reject(e)
        }
      })
    },
    async loginProcess() {
      this.$authentication.save(this.routeQuery)

      // 하이클래스 가입 여부 체크
      try {
        const userUri = `${this.$apiUrl}/users/${this.routeQuery.uuid}`
        await this.$hiClass.users.read(userUri)
        this.$router.push('/main', () => {})
        this.openBehavior()
      } catch (err) {
        this.$router.push('/login/auth/phone', () => {})
      }
    },
    openBehavior() {
      const popup = openPopup(CONSTANTS.POPUP.BEHAVIOR_RECORD)

      if (!popup) {
        this.$hiClass.alert('팝업 차단을 해제해 주세요.')
      }
    }
  }
}
</script>
<style></style>
