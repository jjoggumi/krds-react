<template>
  <div>
    <!-- 안의 내용이 바뀝니다. -->
    <p class="sub-start-text">
      가입한 휴대폰번호로 본인인증 후
      <br>비밀번호를 재설정합니다.
    </p>
    <div class="resetPW-cont-wrap input-confirm-wrap step1">
      <div class="confirm-btn-wrap">
        <button class="btn-bg-c" v-on:click="click()">휴대폰 인증</button>
      </div>
    </div>
    <!-- 안의 내용이 바뀝니다. -->
  </div>
</template>

<script>
export default {
  name: "loginBodyResetPwBodyPw",
  methods: {
    click() {
      this.$router.push("./setting");
    }
  }
};
</script>

<style scoped></style>