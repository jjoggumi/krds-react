<template>
  <div>
    <p class="sub-start-text">
      <strong>{{ maskedUserMobile }}</strong>
      <br />
      {{ userInfo.userName }} ({{ userType[userInfo.userType] }}) 님!
      <br />
      {{ helloMsg }} 계정으로 회원가입 이력이 있습니다.
    </p>
    <div class="loginSns-cont-wrap input-confirm-wrap step3">
      <div class="login-style-wrap">
        <div
          class="login-style"
          :class="{
            [setClass(userInfo.userSns)]: true
          }"
        >
          <button class="icon" @click="socialButtonClick(userInfo.userSns)">
            <span>{{ userSns[userInfo.userSns] }}으로 시작하기</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'loginAuthBodyResult',
  data: () => ({
    userInfo: '',
    userAccountInfo: '',
    userSns: {
      KAKAO: '카카오톡',
      NAVER: '네이버',
      GOOGLE: '구글',
      APPLE: '애플',
      GNE: '경남교육청',
      ISCREAM: '아이스크림',
      HICLASS: '하이클래스'
    },
    userType: { TEACHER: '선생님', PARENTS: '학부모', STUDENT: '학생' },
    helloMsg: '',
    callbackUrl: ''
  }),
  computed: {
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
    gne() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_GNE_PATH +
        this.callbackUrl
      )
    },
    maskedUserMobile() {
      return (this.userInfo.userMobile === undefined && this.userInfo.userMobile === '')
        ? ''
        : this.$stringUtil.phoneFormatter(this.userInfo.userMobile, 1)
    },
    iscream() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_ISCREAMMEDIA_PATH +
        this.callbackUrl
      )
    }
  },
  methods: {
    socialButtonClick(userSns) {
      userSns = userSns.toLowerCase()
      const param = '?userType=' + this.userInfo.userType
      location.href = this[userSns] + param
    },
    // getLoginTypes() {
    //   let str = "";
    //   for (let i in this.userInfo) {
    //     str += this.userSns[this.userInfo[i].userSns];
    //     if (i === this.userInfo.length - 1) {
    //       str += "/";
    //     }
    //   }
    //   this.helloMsg = str;
    //   return this.helloMsg;
    // },
    getLoginType() {
      let str = ''
      let userSns = this.userInfo.userSns
      str += this.userSns[userSns]
      this.helloMsg = str
      return this.helloMsg
    },
    setClass(item) {
      if (item !== undefined && item.toLowerCase() === 'iscream')
        return 'type-' + 'site2'
      else if (item !== undefined) return 'type-' + item.toLowerCase()
    },
    goRoute(path) {
      this.$router.push(path)
    },
    setCallbackUrl() {
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      const port = this.$comn.getLocationPort()
      const domainUrl = protocol + '//' + hostname + port
      this.callbackUrl =
        process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
        domainUrl +
        process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_SUFFIX
    },
    searchUsers() {
      const requestParams = {
        _userMobile: this.$route.query.userMobile,
        _userStatus: 'ACTIVATE'
      }
      this.$hiClass.users.search(requestParams)
        .then(res => {
          const findUsers = res.data._embedded.users.filter(user => user.userType !== 'ADMIN')

          if (findUsers.length === 1) {
            this.userInfo = findUsers[0]
            this.userInfo.userSns = this.userInfo.userSns ? this.userInfo.userSns.toUpperCase() : this.userInfo.userSns
            this.$nextTick(() => this.getLoginType())
          } else {
            this.$router.push('/logout')
          }
        })
    }
  },
  created() {
    this.setCallbackUrl()
    this.searchUsers()
  }
}
</script>

<style scoped></style>
