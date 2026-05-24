<!--
@File(Method): - 퍼블용 페이지
@Author: -
@Date Created: -
@Description: 이벤트 링크
-->
<template>
  <div class="event-link page-login">
    <div class="logo-wrap">
      <a href="#"><img src="/img/logo_login.png" alt="하이클래스" /></a>
    </div>
    <div class="login-box-wrap boundary-box">
      <div class="login-box-inner">
        <div class="login-start-text">학부모 → 선생님 전환하기 ① </div>
        <div class="login-style-wrap mt-15">
          <div class="login-style type-site">
            <p>본인 확인을 위해 기존에 이용하시는 <br>
              학부모 계정으로 로그인해주세요. </p>
          </div>
          <div class="login-style type-kakao">
            <button class="icon" @click='onClickKakao'>
              <span>카카오톡으로 시작하기</span>
            </button>
          </div>
          <div class="login-style type-naver">
            <button class="icon" @click='onClickNaver'>
              <span>네이버로 시작하기</span>
            </button>
          </div>  
        </div>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  name: "LoginParents",
  methods: {    
    onClickKakao() {
      this.go(process.env.VUE_APP_BASE_LOGIN_KAKAO_PATH)
    },
    onClickNaver() {
      this.go(process.env.VUE_APP_BASE_LOGIN_NAVER_PATH)
    },
    go(path) {
      const port = this.$comn.getLocationPort()
      const domainUrl = `${window.location.protocol}//${window.location.hostname}${port}`
      const p2tPath = window.location.pathname

      window.location.href = process.env.VUE_APP_BASE_LOGIN_URI + path
        + process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX
        + `${domainUrl}/${p2tPath}?step=2`
        + '?userType=PARENTS';
    }
  },  
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
</style>