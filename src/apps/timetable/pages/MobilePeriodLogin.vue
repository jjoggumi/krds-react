<!--
@File(Method): MobilePeriodLogin.vue
@Description: 미가입 교사 로그인 (모바일 반응형)
@Modified: 2025-06-18 
-->
<template>
  <div class="time-table-wrap webview">
    <header class="logo">
      <img src="@/assets/img/logo_login.png" alt="hiclass" />
    </header>
    <main class="login">
      <div class="tit">
        <h2>하이 고등학교 시수표 작성</h2>
        <p class="desc">시간표에 입력할 시수표를 작성합니다. <br />전달받으신 학교코드와 이름을 입력하신 후 입장해 주세요.</p>
      </div>
      <div class="con">
        <div class="form-group">
          <label>학교 코드</label>
          <div class="form-ctr">
            <input type="text" placeholder="코드 입력" class="xl" spellcheck="false"/>
          </div>
        </div>
        <div class="form-group">
          <label>교사명</label>
          <div class="form-ctr">
            <input type="text" placeholder="이름 입력" class="xl" spellcheck="false"/>
          </div>
        </div>
        <button type="button" class="btn btn-primary btn-lg w100 mt-30">작성하기</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import '@/assets/css/timetable/common.scss';
</script>
<style lang="scss" scoped>
.time-table-wrap {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  header {
    background: #fff;
    height: 80px;
    padding: 10px 20px;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    img {
      width: 120px;
    }
  }
  .login {
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
    padding: 40px;
    border-radius: 10px;
    background: #fff;
    .tit {
      text-align: center;
      h2 {
        font-size: 24px;
        font-weight: 800;
        line-height: 150%;
        margin-bottom: 8px;
      }
      p {
        font-size: 14px;
        line-height: 150%;
        color: #888;
      }
    }
    .con {
      margin: 40px auto 0;
    }
  }
}
@media (max-width: 768px) {
  .time-table-wrap {
    background: #fff;
    header{
      position: static;  
      height: 80px;
      padding: 10px 20px;    
    }
    .login{
      padding: 10px 30px;
    }
    input[type=text].lg, .time-table-wrap input[type=number].lg{
      height:48px;
    }
  }
}
</style>
