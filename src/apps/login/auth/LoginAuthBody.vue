<template>
  <component v-bind:is="curForm"></component>
</template>

<script>
import Phone from "./phone/LoginAuthBodyPhone";
import Result from "./result/LoginAuthBodyResult";
export default {
  name: "loginAuthBody",
  data: () => ({
    curForm: ""
  }),
  components: { Phone, Result },
  watch: {
    $route() {
      this.setComponent();
    }
  },
  created() {
    this.init();
    this.setComponent();
  },
  methods: {
    init: function() {
      this.reqBtnName = this.$t("main.text.request");
    },
    reRequestButtonClick: function() {
      this.reqBtnName = this.$t("main.text.re_request");
      this.isAuthSuccess = true;
      this.isPhoneNum = false;
      this.isDisableBtn = false;
      this.isDisableClass = false;
    },
    onSubmit: function() {
      this.$router.push({ path: "/main" });
    },
    setComponent() {
      let id = this.$route.params.id;
      this.curForm = id.replace(/^./, id[0].toUpperCase());

      document.title = "Sns Auth-" + this.curForm;
    }
  }
};
</script>
<style scoped>
</style>