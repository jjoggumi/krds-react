<template>
  <div class="event-link page-login">
    <div class="logo-wrap">
      <a href="#"><img src="/img/logo_login.png" alt="하이클래스" /></a>
    </div>
    <!-- 선생님 계정 전환 안내 페이지 -->
    <div class="login-box-wrap boundary-box">
      <div class="login-box-inner">
        <div class="login-start-text">선생님 계정 전환 안내 페이지</div>
        <div class="login-style-wrap mt-15">
          <div class="login-style">
            <p>재직증명서를 통해 교사 또는 교직원임을 확인한 학부모님께 보내드리는 선생님 계정 전환 링크입니다.</p>
            <p class="pt-00">선생님 계정으로 전환하셔도, 기존 학부모 회원 계정에서 이용하시던 클래스 정보는 그대로 유지됩니다.</p>
          </div>
          <div class="login-style type-site">
            <button @click="goParentLogin">
              <span>
                5초만에 계정 전환하기 >
              </span>
            </button>
          </div>    
        </div>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  name: "Announcement",
  methods: {    
    goParentLogin() {
      localStorage.clear();
      window.location.href = window.location.pathname + "?step=1";
    },
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