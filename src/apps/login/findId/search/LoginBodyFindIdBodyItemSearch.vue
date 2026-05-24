<template>
  <div id="loginBodyFindIdBodyItemSearch">
    <!-- 안의 내용이 바뀝니다. -->
    <p class="sub-start-text">
      아이스크림 회원가입 시
      <br>등록한 이름과 생년월일 정보를 입력하세요.
    </p>
    <div class="findId-cont-wrap input-confirm-wrap step1">
      <div class="input-box-wrap input-id">
        <input type="text" placeholder="이름" @keydown.enter.prevent.stop >
      </div>
      <div class="input-box-wrap input-pw">
        <input type="password" placeholder="생년월일 (예:20190101)" @keydown.enter.prevent.stop>
      </div>
      <div class="confirm-btn-wrap">
        <button class="btn-bg-c" v-on:click="click()">확인</button>
      </div>
    </div>
    <!-- 안의 내용이 바뀝니다. -->
  </div>
</template>

<script>
export default {
  name: "loginBodyFindIdBodyItemSearch",
  methods: {
    click() {
      this.$router.push("/login/findId/result");
    }
  }
};
</script>

<style scoped></style>