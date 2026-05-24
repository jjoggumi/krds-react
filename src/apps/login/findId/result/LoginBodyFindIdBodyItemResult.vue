<template>
  <div id="loginBodyFindIdItemResult">
    <!-- 안의 내용이 바뀝니다. -->
    <p class="sub-start-text">[홍길동:2019년 1월 1일]로 검색된 아이디</p>
    <div class="findId-cont-wrap input-confirm-wrap step2">
      <div class="findId-result">ssemt***</div>
      <div class="confirm-btn-wrap">
        <button class="btn-bg-c" v-on:click="click()">로그인</button>
      </div>
    </div>
    <!-- 안의 내용이 바뀝니다. -->
  </div>
</template>

<script>
export default {
  name: "loginBodyFindIdItemResult",
  methods: {
    click() {
      this.$router.push("/login/findId/notFound");
    }
  }
};
</script>

<style scoped></style>