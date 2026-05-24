<template>
  <div>
    <!-- 안의 내용이 바뀝니다. -->
    <p class="sub-start-text">[홍길동:2019년 1월 1일]로 검색된 아이디가 없습니다.</p>
    <div class="findId-cont-wrap">
      <div class="findId-result">
        정보를 다시 확인하시고 시도해주세요.
        <p>
          <span>i-Scream 고객센터</span>
          <img src="@/assets/img/icon_call_16.png" alt>
          <span>1234-5678</span>
        </p>
      </div>

      <div class="confirm-btn-wrap">
        <button class="btn-bg-w" v-on:click="goSearch()">다시 찾기</button>
        <button class="btn-bg-c" v-on:click="goLogin()">로그인</button>
      </div>
    </div>
    <!-- 안의 내용이 바뀝니다. -->
  </div>
</template>

<script>
export default {
  name: "loginBodyFindIdbodyItemNotFound",
  methods: {
    goSearch() {
      this.$router.push("/login/findId/search");
    },
    goLogin() {
      this.$router.push("/logout");
    }
  }
};
</script>

<style scoped></style>