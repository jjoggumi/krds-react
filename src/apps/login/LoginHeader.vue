<template>
  <div id="loginHeader">
    <div class="logo-wrap">
      <a href="#" @click.prevent="goIndex">
        <img src="@/assets/img/logo_login.png" alt />
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "loginHeader",
  methods: {
    goIndex() {
      this.$router.push("/logout", () => {});
    }
  },
  created() {}
};
</script>

<style></style>
