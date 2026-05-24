<template>
  <div class="find-my-sns-id">
    <button class="f-ns-b" v-on:click="click()">
      {{ $t("login.findid") }}
    </button>
  </div>
</template>

<script>
export default {
  name: "login-bottom-find-id",
  methods: {
    click() {
      this.$router.push({
        path: "/login/findSns/search",
        query: {
          userType: this.$route.params.userType
        }
      });
    }
  }
};
</script>

<style scoped></style>
