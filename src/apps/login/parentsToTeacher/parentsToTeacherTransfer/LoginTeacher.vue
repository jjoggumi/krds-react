
<template>
  <div class="event-link page-login">
    <div class="logo-wrap">
      <a href="#"><img src="/img/logo_login.png" alt="하이클래스" /></a>
    </div>
    <div class="login-box-wrap boundary-box">
      <div class="login-box-inner">
        <div class="login-start-text">학부모 → 선생님 전환하기② </div>
        <div class="login-style-wrap mt-15">
          <div class="login-style type-site">
            <p>선생님 회원은 <span>아이스크림, 구글, 애플</span> <br>계정으로만 로그인이 가능합니다. </p>
            <p class="pt-00">선생님 로그인시 이용할 계정을 <br>선택해주세요. </p>
          </div>
          <div class="login-style type-iscreammedia">
            <button @click='onClickIScream'>
              <span>
                i-Scream 아이디로 시작하기
              </span>
            </button>
          </div>           
          <div class="login-style type-google">
            <button class="icon" @click='onClickGoogle'>
              <span>
                구글로 시작하기
              </span>
            </button>
          </div>
          <div class="login-style type-apple">
            <button class="icon" @click='onClickApple'>
              <span>
                애플로 시작하기
              </span>
            </button>
            <div
              id="appleid-signin"
              class="signin-button"
              data-type="sign in"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  name: "LoginTeacher",
  methods: {    
    onClickIScream() {
      this.go(process.env.VUE_APP_BASE_LOGIN_ISCREAMMEDIA_PATH)
    },
    onClickGoogle() {
      this.go(process.env.VUE_APP_BASE_LOGIN_GOOGLE_PATH)
    },
    onClickApple() {
      sessionStorage.setItem('exceptionalLoginCallback', JSON.stringify({
        redirectURI: `${window.location.pathname}?step=4`
      }))
      window.AppleID.auth.init({
        clientId: 'ios.com.iscreammedia.app.hiclass',
        scope: 'name email',
        redirectURI: `${process.env.VUE_APP_BASE_LOGIN_URI + process.env.VUE_APP_BASE_LOGIN_APPLE_PATH}?userType=TEACHER`,
        state: 'STATE'
      })
      document.querySelector('#appleid-signin').click()
    },
    urlOf(path) {
      const port = this.$comn.getLocationPort()
      const domainUrl = `${window.location.protocol}//${window.location.hostname}${port}`
      const p2tPath = window.location.pathname

      return process.env.VUE_APP_BASE_LOGIN_URI + path
        + process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX
        + `${domainUrl}/${p2tPath}?step=4`
    },
    go(path) {
      window.location.href = this.urlOf(path) + '?userType=TEACHER';
    }
  }
};
</script>
<style lang="scss" scoped>
.event-link{  
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  .login-box-wrap{
    max-width:520px;
    width:90%;
    margin-bottom:15px;
  }
  .hi-modal-common::v-deep .modal__layer{
    width:95%;
    max-width: 400px;
  }
}
.signin-button {
  display: none;
}
</style>