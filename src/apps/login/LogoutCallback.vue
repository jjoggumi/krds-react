<template>
  <main-loading-new-tab />
</template>

<script>
import MainLoadingNewTab from "../main/MainLoadingNewTab.vue";

export default {
  name: "logoutCallback",
  components: {
    MainLoadingNewTab
  },
  data: () => ({}),
  created() {
    this.$authentication.clear();
    this.$router.push("/");
  }
};
</script>

<style scoped></style>
