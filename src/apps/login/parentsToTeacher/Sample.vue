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
            <button>
              <span>
                5초만에 계정 전환하기 >
              </span>
            </button>
          </div>    
        </div>
      </div>
    </div>
    <!-- 학부모 → 선생님 전환하기 ①  -->
    <div class="login-box-wrap boundary-box">
      <div class="login-box-inner">
        <div class="login-start-text">학부모 → 선생님 전환하기 ① </div>
        <div class="login-style-wrap mt-15">
          <div class="login-style type-site">
            <p>본인 확인을 위해 기존에 이용하시는 <br>
              학부모 계정으로 로그인해주세요. </p>
          </div>
          <div class="login-style type-kakao">
            <button class="icon">
              <span>카카오톡으로 시작하기</span>
            </button>
          </div>
          <div class="login-style type-naver">
            <button class="icon">
              <span>네이버로 시작하기</span>
            </button>
          </div>  
        </div>
      </div>
    </div>
    <!-- 학부모 → 선생님 전환하기②  -->
    <div class="login-box-wrap boundary-box">
      <div class="login-box-inner">
        <div class="login-start-text">학부모 → 선생님 전환하기② </div>
        <div class="login-style-wrap mt-15">
          <div class="login-style type-site">
            <p>선생님 회원은 <span>아이스크림, 구글, 애플</span> <br>계정으로만 로그인이 가능합니다. </p>
            <p class="pt-00">선생님 로그인시 이용할 계정을 <br>선택해주세요. </p>
          </div>
          <div class="login-style type-iscreammedia">
            <button>
              <span>
                i-Scream 아이디로 시작하기
              </span>
            </button>
          </div>           
          <div class="login-style type-google">
            <button class="icon">
              <span>
                구글로 시작하기
              </span>
            </button>
          </div>
          <div class="login-style type-apple">
            <button class="icon">
              <span>
                애플로 시작하기
              </span>
            </button>
          </div>   
        </div>
      </div>
    </div>

    <HiButton class="mr-10" color="primary" size="md" @click="messageAlert(`종료된 이벤트 입니다.<br>해당 페이지를 이용할 수 없습니다.`, 'warning')">
      종료알림
    </HiButton>

    <HiButton class="mr-10" color="primary" size="md" @click="messageAlert(`교사·교직원 재직서류 인증이 완료된<br>학부모 회원만 참여가 가능합니다.`, 'info')">
      안내알림
    </HiButton>
    <HiButton class="mr-10" color="primary" size="md" @click="confirmModal = true">
      완료모달
    </HiButton>

    <HiModal type="type01" size="sm" v-if="confirmModal" @close="confirmModal = false">
      <template v-slot:heading>선생님 회원 전환이 완료되었습니다</template>
      <template v-slot:content> 
        <p class="desc">
        안전한 사용을 위해 모든 기기에서<br> 로그아웃이 진행됩니다.
        </p>
        <p class="desc mt-05">
        앞으로는 선생님 계정으로 로그인해주세요!
        </p>
        <p class="desc mt-15">
        문의 : 1811-0910  
        </p>
      </template>
      <template v-slot:footer>
        <HiButton color="primary" size="lg" >확인</HiButton>
      </template>
    </HiModal>
  </div>
</template>
<script>

export default {
  name: "EventLink",
  data() {
    return {      
      confirmModal:false
    };
  },
  methods: {    
    messageAlert(msg, ico, btn) {
      this.$hiClass.alert(msg, ico, btn);
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