<template>
  <div v-if="userInfo.userMobile">
    <div class="sub-start-text find-sns">
      <div v-if="userInfo.userSns !== 'APPLE' && userEmail !== '' && userEmail !== null" class="user-email">
        <strong>{{ userEmail }}</strong>
      </div>
      <p class="notice-text">{{ userInfo.userName }}({{ userType[userInfo.userType] }})님! {{ userSns[userInfo.userSns] }} 계정으로 회원 가입 이력이 있습니다.</p>
      <p v-if="userInfo.userSns === 'APPLE'" class="sub-notice-text">애플 계정으로 로그인해주세요.</p>
      <p v-else-if="userEmail !== '' && userEmail !== null" class="sub-notice-text">위의 이메일 주소로 가입된 {{ userSns[userInfo.userSns] }} 계정으로 로그인해주세요.</p>
    </div>
    <div class="findSnsId-cont-wrap" v-if="userInfo.userSns !== 'GNE'">
      <div class="login-style-wrap">
        <div
          class="login-style"
          :class="{
            [setClass(userInfo.userSns)]: true
          }"
        >
          <button class="icon" @click="socialButtonClick(userInfo.userSns)">
            <span>{{ snsButtons[userInfo.userSns] }}로 시작하기</span>
          </button>
        </div>
      </div>
    </div>
    <div id="appleid-signin" class="signin-button" data-type="sign in"></div>
  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: 'loginBodyFindIdItemResult',
  props: {
    isRecertification: Boolean,
  },
  data: () => ({
    userInfo: {},
    userEmail: '',
    userSns: {
      KAKAO: '카카오',
      NAVER: '네이버',
      GOOGLE: '구글',
      APPLE: '애플',
      GNE: '경남교육청',
      ISCREAM: '아이스크림',
      HICLASS: '하이클래스'
    },
    snsButtons: {
      KAKAO: '카카오',
      NAVER: '네이버',
      GOOGLE: '구글',
      APPLE: 'Apple',
      GNE: '경남교육청',
      ISCREAM: 'i-Scream 아이디',
      HICLASS: '하이클래스'
    },
    userType: { TEACHER: '선생님 또는 교직원', PARENTS: '학부모', STUDENT: '학생' },
    callbackUrl: '',
    query: {
      userMobile: '',
      id: ''
    }
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
    apple() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_APPLE_PATH
      )
    },
    gne() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_GNE_PATH +
        this.callbackUrl
      )
    },
    iscream() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_ISCREAMMEDIA_PATH +
        this.callbackUrl
      )
    }
  },
  created() {
    if (this.$route.query.id) {
      this.query.id = this.$route.query.id
    }
    if (this.$route.query.userMobile) {
      this.query.userMobile = this.$route.query.userMobile
    }
    this.$router.replace(this.$route.path, () => {})

    if (this.query.userMobile && this.query.id) {
      this.setCallbackUrl()
      this.searchUsers(this.query.userMobile)
      this.searchUserEmail()
    } else {
      this.$router.push('/logout', () => {})
    }
  },
  mounted() {},
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    socialButtonClick(userSns) {
      if (this.isRecertification) {
        this.triggerAnalyticsLogEvent({ code: `analytics.login.recertification.success` })
      }
      userSns = userSns.toLowerCase()
      const param = '?userType=' + this.userInfo.userType
      if (userSns === 'apple') {
        window.AppleID.auth.init({
          clientId: 'ios.com.iscreammedia.app.hiclass',
          scope: 'name email',
          redirectURI: this[userSns] + param,
          state: 'STATE'
        })
        document.querySelector('#appleid-signin').click()
      } else {
        location.href = this[userSns] + param
      }
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
    searchUsers(userMobile) {
      if (userMobile) {
        const requestParams = {
          userMobile: userMobile,
          userStatus: 'ACTIVATE',
        }
        this.$hiClass.userMobile.readUserStatus(requestParams)
          .then(res => {
            const findUser = res.data
            if (findUser && findUser.userType !== 'ADMIN') {
              this.userInfo = findUser
              this.userInfo.userSns = this.userInfo.userSns
                ? this.userInfo.userSns.toUpperCase()
                : this.userInfo.userSns
            } else {
              this.$router.push('/logout')
            }
          })
          .catch(err => {
            this.$log.debug(this.$options.name + ' searchUsers() err : ', err)
            this.$authentication.clear()

            switch (err.response.status) {
              case 404: {
                this.$hiClass.alert(`해당 휴대전화의 회원을 찾을 수 없습니다.<br>고객센터에 문의해주세요.`, 'warning')
                  .then(() => this.$router.push('/logout'))
                break
              }
              default: {
                this.$router.push('/logout')
              }
            }
          })
      }

    },
    async searchUserEmail() {
      try {
        const res = await this.$axios.post('/userEmail', {id: this.query.id})
        if (res.data.result === 'SUCCESS') {
          this.userEmail = res.data.userEmail
        } else {
          this.$router.push({ path: './notFound' }, () => {})
        }
      } catch (err) {
        this.$router.push({ path: './notFound' }, () => {})
      }
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
    &.type-apple,
    &.type-google {
      button {
        border: 1px solid #888;
      }
    }
    button {
      span {
        font-size: 17px;
        font-weight: 600;
        line-height: 21px;
        letter-spacing: -0.5px;
        font-family: var(--font-body);
      }

      &::before {
        background-position: 0 -2px;
      }
    }
    &.type-site2 {
      button {
        &::before {
          background-position: 0;
          width: 0;
          height: 0;
          margin-right: 0;
        }
      }
    }
  }
}

// .page-login .login-style.type-gne button {
//     background-color:#fff;
//     border:1px solid #00b3ed;
// }
// .page-login .login-style.type-gne button span {
//     font-size: 15px;
//     font-weight: 500;
// }
// .page-login .login-style.type-gne button:before {
//     background-image: url("../../../../../assets/img/icon/icon_login_gyeongnam.png");
//     background-size: cover;
// }
</style>
