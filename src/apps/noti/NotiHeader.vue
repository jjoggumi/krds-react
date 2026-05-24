<template>
  <div id="header-cont-wrap">
    <div class="header-cont-inner">
      <div class="header-logo-wrap">
        <h1>
          <router-link to="/main">
            <img src="@/assets/img/header_logo.png" alt />
          </router-link>
        </h1>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "mainHeader",
  data: () => ({}),
  methods: {
    logout() {
      this.$router.push("/logout");
    },
    goPage(path) {
      this.$router.push(path);
    }
  },
  created() {},
  mounted() {}
};
</script>

<style></style>
