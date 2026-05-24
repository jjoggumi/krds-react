<template>
  <div id="loginBodyResetPwBodySetting">
    <!-- 안의 내용이 바뀝니다. -->
    <p class="sub-start-text">
      새로운 비밀번호를 설정합니다.
      <br>(영문 + 숫자 조합 6자리 이상)
    </p>
    <div class="resetPW-cont-wrap input-confirm-wrap step2">
      <div class="input-box-wrap input-id">
        <input type="password" placeholder="새로운 비밀번호 입력">
      </div>
      <p class="input-validation-text error-text">6자 이상의 영문+숫자를 조합하여 입력해주세요.</p>
      <div class="input-box-wrap input-pw">
        <input type="password" placeholder="새로운 비밀번호 확인">
      </div>
      <p class="input-validation-text error-text">비밀번호가 일치하지 않습니다.</p>
      <div class="confirm-btn-wrap">
        <button class="btn-bg-c" v-on:click="click()">확인</button>
      </div>
    </div>
    <!-- 안의 내용이 바뀝니다. -->
  </div>
</template>

<script>
export default {
  name: "loginBodyResetPwBodySetting",
  methods: {
    click() {
      this.$router.push("./result");
    }
  }
};
</script>

<style scoped></style>