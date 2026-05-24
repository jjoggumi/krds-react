<!--
@File(Method): LoginBottomEducationOffice.vue
@Description: 교육청 계정으로 시작하기 로그인 안내페이지
@Modified: 2024-11-25 - #70004 경남교육청 계정 SNS 변경 및 로그인 제거
-->
<template>
  <div class="login-style">
    <!-- 경남교육청 -->
    <div class="login-style type-gyeongnam">
      <p>{{ $t('login.gne.comment1') }}<br>{{ $t('login.gne.comment2') }}</p>
      <a
        href="javascript:void(0);"
        class="icon"
        @click="socialButtonClick(gne)"
      >
        <span>{{ $t('login.gne')}}</span>
      </a>
    </div>
    <!-- #70004 경남교육청 계정 SNS 변경 및 로그인 제거 - 안내 추가 -->
    <div class="important-notice">
      <div class="noti">
        <HiIcon name="ico-warning-circle-fill" color="noti" size="24"></HiIcon>
        꼭 읽어주세요!
      </div>
      <div class="tit">경남교육청 로그인 서비스 종료 안내</div>
      <div class="con">
        <p>
          웨일 스페이스의 로그인 연동 중지 결정에 따라,<br>
          <span class="txt-primary">24년 12월 12일까지만 경남교육청 계정으로 하이클래스를 <br>이용</span>하실 수 있습니다.
        </p>
        <p>
          기존 교육청 계정에서 사용 중인 클래스 정보를 그대로 이용하시려면, SNS 계정으로 변경하기 후에 이용 부탁드립니다.
        </p>
        <p class="step">
          <strong>[SNS 계정 변경 방법]</strong><br>
            <ol>
              <li>교육청 계정 로그인</li>
              <li>안내 화면의 ‘SNS계정으로 시작하기’ 선택</li>
              <li>원하는 SNS계정으로 로그인 하기</li>
            </ol>
        </p>
        <p>
          계정 변경에 대해 어려움이 있으신 경우 하이클래스 고객센터<br>(1811-0910)로 연락 부탁드립니다.
        </p>
      </div>
    </div>  
  </div>
</template>

<script>
export default {
  name: 'loginBottomEducationOffice',
  data: () => ({
    callbackUrl: '',
    path: ''
  }),
  computed: {
    gne() {
      return (
          process.env.VUE_APP_BASE_LOGIN_URI +
          process.env.VUE_APP_BASE_LOGIN_GNE_PATH +
          this.callbackUrl
      )
    }
  },
  methods: {
    socialButtonClick(loginType) {
      this.path = this.$comn.split(this.$route.path, '/').toUpperCase()
      // ### 교육청 로그인의 경우 userType parameter는 서버에서 직접 추가한다 ###
      window.location.href = loginType
    },
    setCallbackUrl() {
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      const port = this.$comn.getLocationPort()
      const domainUrl = `${protocol}//${hostname}${port}`

      this.callbackUrl =
        process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
        domainUrl +
        process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_SUFFIX
    }
  },
  created() {
    this.setCallbackUrl()
  }
}
</script>
<style scoped lang="scss">
// #70004 경남교육청 계정 SNS 변경 및 로그인 제거  - css 추가
.page-login  .login-style {
  margin-top:-20px;
  p{
    padding: 0px 0 30px;
  }
}
.important-notice {  
  margin-top: 30px;
  padding: 0;
  border-radius: 7px;
  text-align: left;
  border:1px solid #ddd;
  overflow: hidden;

  .noti {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.9px;
    color: #FF6A6A;    
    font-family: var(--font-body);
    background: rgba(255, 106, 106, 0.1);
    padding: 6px;
    display: flex;
    align-items: center;
  }

  .tit {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.6px;
    color: #333;
    font-family: var(--font-body);
    padding: 23px 20px 16px;
  }

  .con {
    color: #333;
    letter-spacing: -0.6px;
    line-height: 1.5;
    padding: 0 20px;

    p{      
      margin-bottom:10px;
      padding:0;
      color: #333;
      font-size: 13px;
      letter-spacing: -0.6px;
      line-height: 1.6;
    }
    p.step{
      background: #FAFAFA;
      padding:16px;
      margin-top: 12px;      
      font-size: 12px;
      strong{
        font-weight:500;
      }
    }

    ol {
      margin-top: 10px;
      padding-left: 20px;

      li {
        font-size: 12px;
        color:#616161;
        margin-bottom: 5px;
        list-style: auto;
      }
    }
  }
}
</style>