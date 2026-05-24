<template>
  <main-loading-new-tab />
</template>

<script>
import MainLoadingNewTab from "../main/MainLoadingNewTab.vue";

export default {
  name: "logoutOfferwallCallback",
  components: {
    MainLoadingNewTab
  },
  data: () => ({}),
  created() {
    localStorage.removeItem('companyId');
    localStorage.removeItem('companyName');
    this.$authentication.clear();
    this.$router.push("/");
  }
};
</script>

<style scoped></style>
