<template>
  <div>
    <p class="sub-start-text type2">
      <strong>{{ maskedSearchUserMobile }}</strong>
      <br />{{ $t("login.findSns.notFound.title") }}
    </p>
    <div class="findSnsId-cont-wrap">
      <div class="login-style-wrap">
        <div class="confirm-btn-wrap">
          <button class="btn-bg-w" @click="goSearch">
            {{ $t("login.findSns.notFound.retry") }}
          </button>
          <button class="btn-bg-c" @click="goJoin">
            {{ $t("login.findSns.notFound.join") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "loginBodyFindIdbodyItemNotFound",
  props: {
    searchUserMobile: String,
    userType: String
  },
  computed: {
    maskedSearchUserMobile() {
      return (this.searchUserMobile === undefined && this.searchUserMobile === "")
        ? ""
        : this.$stringUtil.phoneFormatter(this.searchUserMobile, 1)
    }
  },
  methods: {
    goSearch() {
      let params = {};
      params.path = "/login/findSns/search";
      if (this.userType !== undefined && this.userType !== "") {
        params.query = {
          userType: this.userType
        };
      }

      this.$router.push(params, () => {});
    },
    goJoin() {
      let path = "/";
      if (this.userType !== undefined && this.userType !== "")
        path = "/login/" + this.userType;

      this.$router.push(path, () => {});
    }
  }
};
</script>

<style scoped></style>
