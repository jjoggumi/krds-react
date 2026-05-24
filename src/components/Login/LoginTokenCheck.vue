<template>
  <div></div>
</template>

<script>
export default {
  name: "login-token-check",
  data() {
    return {
      callbackUrl: '',
    }
  },
  created() {
    const userId = localStorage.getItem('uuid')
    /**
     * 강제 로그아웃 처리할 선생님의 userIds
     */
    const forceLogoutUserIds = [
      '13bf9eee-c966-4571-8a4b-d54da6fe467b', // [dev] hiclass39 userId
      '647a7f64-079c-46a1-bc47-7fa3a2ad789e', // [stage] hiclass39 userId
      '8ea1fc75-ec19-4ab4-80e3-94ca6335f253', // [production] hiclass39 userId
      '4d558919-a7c2-4d6a-bfba-f1574a2640c4', // [production] 강제 로그아웃할 선생님의 userId (1)
    ]
    if (forceLogoutUserIds.includes(userId)) {
      this.setCallbackUrl()
      this.getMemberInfo()
    }
  },
  methods: {
    // get 아이스크림 교사 학교 정보
    getMemberInfo() {
      let queryParam = this.$authentication.load()

      const userInfoUrl =
        process.env.VUE_APP_BASE_LOGIN_URI + process.env.VUE_APP_BASE_INFO_PATH
      this.$axios({
        method: 'get',
        url: userInfoUrl,
        headers: {
          Authorization: 'Bearer ' + queryParam.idToken
        }
      })
        .then(result => {
          this.$log.debug(
            `${this.$options.name} getMemberInfo result : `,
            result
          )

          if (queryParam.clientRegistrationId.toUpperCase() === 'ISCREAM') {
            const iat = result.data.claims.iat
            const loginDate = this.$moment(iat)
            const forceLogoutDate = this.$moment('2022-03-29 18:00:00')
            const expiredSeconds = forceLogoutDate.diff(loginDate, 'second')

            this.$log.debug(`getMemberInfo() expiredSeconds => `, "" + expiredSeconds)
            this.$log.debug(`getMemberInfo() loginDate.valueOf() => `, loginDate.valueOf())

            if (expiredSeconds !== undefined
              && !Number.isNaN(expiredSeconds)
              && expiredSeconds > 0)
            {
              this.logoutTeacher()
            }

          }

        })
        .catch(error => {
          this.$log.debug(`${this.$options.name} getMemberInfo error : `, error)
        })
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