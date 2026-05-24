<script>
export default {
  name: 'LoginFreesms',
  created() {
    if (!this.$route.query.idToken) {
      let loginCheckUrl =
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_ISCREAMMEDIA_PATH +
        process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
        window.location.protocol +
        '//' +
        window.location.hostname +
        this.$comn.getLocationPort() +
        '/hiclassFreesms?userType=TEACHER'

      window.location.replace(loginCheckUrl)
    } else {
      this.$authentication.save(this.$route.query)

      // 하이클래스 가입 여부 체크
      let uuid = this.$route.query.uuid
      this.$hiClass.users
        .read(`${process.env.VUE_APP_BASE_API_URI}/users/${uuid}`)
        .then(res => {
          const user = res.data

          if (user.userStatus === 'ACTIVATE') {
            // 정상 회원
            this.$router.push('/main')
            const loginId = user.loginId

            // start jsonp
            this.$jsonp(
              `${process.env.VUE_APP_BASE_FREESMS_URI}?memberId=${loginId}`,
              {
                param: 'callbackData',
                timeout: 5000
              },
              (err, data) => {
                if (err) {
                  this.$log.warn(err)
                  alert('무료문자 서비스를 이용할 수 없습니다.')
                } else {
                  let jsonData = data
                  if (jsonData.resultcode == '200') {
                    let popUrl = jsonData.popUrl
                    popUrl = popUrl.replace('http://', 'https://')

                    window.open(
                      `${popUrl}?memberId=${loginId}`,
                      'popInfo',
                      `width=${jsonData.popWidth}, height=${jsonData.popHeight}, resizable=no, scrollbars=no, status=no`
                    )
                  } else {
                    alert('무료문자 서비스를 이용할 수 없습니다.')
                  }
                }
              }
            )
            // -- end jsonp
          } else {
            // alert('회원 정보를 가져올 수 없습니다.')
            this.$router.push('/main')
          }
        })
        .catch(() => {
          // this.setStorage()
          this.$router.push('/login/auth/phone')
        })
    }
  },
  methods: {
    // setStorage() {
    //   sessionStorage.setItem('iscream-noteopen', true)
    // }
  }
}
</script>
