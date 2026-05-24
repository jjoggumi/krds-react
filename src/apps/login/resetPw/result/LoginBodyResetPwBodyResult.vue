<template>
  <div id="loginBodyResetPwBodyResult">
    <!-- 안의 내용이 바뀝니다. -->
    <p class="sub-start-text">
      새로운 비밀번호로 변경되었습니다.
      <br>다시 로그인 해주세요.
    </p>
    <div class="resetPW-cont-wrap input-confirm-wrap step3">
      <div class="confirm-btn-wrap">
        <button class="btn-bg-c" v-on:click="click()">로그인</button>
      </div>
    </div>
    <!-- 안의 내용이 바뀝니다. -->
  </div>
</template>

<script>
export default {
  name: "loginBodyResetPwBodyResult",
  methods: {
    click() {
      this.$router.push("/login/iScream/teacher");
    }
  }
};
</script>

<style scoped></style>