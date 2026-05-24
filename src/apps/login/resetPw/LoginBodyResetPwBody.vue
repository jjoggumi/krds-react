<template>
  <component v-bind:is="curForm"></component>
</template>

<script>
import Reset from "./pw/LoginBodyResetPwBodyPw";
import Setting from "./setting/loginBodyResetPwBodySetting";
import Result from "./result/LoginBodyResetPwBodyResult";
export default {
  name: "loginBodyResetPwBody",
  data: () => ({ curForm: "" }),
  components: { Reset, Setting, Result },
  watch: {
    $route() {
      this.setComponent();
    }
  },
  created() {
    this.setComponent();
  },
  methods: {
    setComponent() {
      let id = this.$route.params.id;
      this.curForm = id.replace(/^./, id[0].toUpperCase());

      document.title = "resetPw-" + this.curForm;
    }
  }
};
</script>

<style scoped></style>