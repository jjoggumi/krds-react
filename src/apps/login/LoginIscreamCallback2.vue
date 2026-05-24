<template>
  <div>
    <!-- logon -->
    <MainLoadingNewTab v-if="isMainLoadingNewTab"></MainLoadingNewTab>
  </div>
</template>

<script>
import MainLoadingNewTab from "../main/MainLoadingNewTab.vue";

export default {
  name: "loginCallback",
  components: {
    MainLoadingNewTab
  },
  data: () => ({
    isMainLoadingNewTab: true,
    callbackUrl: ""
  }),
  methods: {
    socialButtonClick() {
      const queryParam = this.$authentication.load();
      this.$log.debug("queryParam => ", queryParam);

      let routePath =
        process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_SUFFIX +
        "?" +
        this.$qs.stringify(queryParam);

      this.$log.debug(routePath);
      window.location.href = routePath;
    }
  },
  created() {
    this.socialButtonClick();
  }
};
</script>

<style scoped></style>
