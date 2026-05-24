<template>
  <div>
    <!-- 안의 내용이 바뀝니다. -->
    <div class="input-login-cont-wrap input-confirm-wrap type-start">
      <div class="input-box-wrap input-id">
        <input type="text" placeholder="아이스크림 아이디" @keydown.enter.prevent.stop >
      </div>
      <div class="input-box-wrap input-pw">
        <input type="password" placeholder="비밀번호" @keydown.enter.prevent.stop >
      </div>
      <div class="keep-login-wrap">
        <input type="checkbox" id="keep-login">
        <label for="keep-login">
          <span class="f-ns-b">로그인 상태 유지</span>
        </label>
      </div>
      <div class="confirm-btn-wrap">
        <button class="btn-bg-c">로그인</button>
      </div>
    </div>
    <div class="btm-link-wrap">
      <a href="#" class="type-text" v-on:click="doFindId()">아이디 찾기</a>
      <span class="bar"></span>
      <a href="#" class="type-text" v-on:click="doResetPw()">비밀번호 재설정</a>
    </div>
    <!-- 안의 내용이 바뀝니다. -->
  </div>
</template>

<script>
export default {
  name: "login-iscream-body-teacher-item",
  methods: {
    doFindId() {
      this.$router.push("/login/findId/search");
    },
    doResetPw() {
      this.$router.push("/login/resetPw/reset");
    }
  }
};
</script>

<style scoped></style>