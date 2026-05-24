<template>
  <component
    v-bind:is="curForm"
    :searchUserMobile="searchUserMobile"
    :userType="userType"
    :isRecertification="isRecertification"
    @setSearchUserMobile="setSearchUserMobile"
  ></component>
</template>

<script>
import Search from "./search/LoginBodyFindSnsBodyItemSearch";
import Result from "./result/LoginBodyFindSnsBodyItemResult";
import NotFound from "./notFound/LoginBodyFindSnsBodyItemNotFound";
export default {
  name: "loginBodyFindSnsBody",
  data: () => ({ curForm: "", searchUserMobile: "", userType: "", isRecertification: false }),
  components: { Search, Result, NotFound },
  watch: {
    $route() {
      this.setComponent();
    }
  },
  methods: {
    setComponent() {
      let id = this.$route.params.id;
      if (this.$route.query.userType !== undefined)
        this.userType = this.$route.query.userType;
      if (this.$route.query.recertification !== undefined)
        this.isRecertification = this.$route.query.recertification;

      this.curForm = id.replace(/^./, id[0].toUpperCase());

      document.title = "findSns-" + this.curForm;
    },
    setSearchUserMobile(str) {
      this.searchUserMobile = str;
    }
  },
  created() {
    this.setComponent();
  }
};
</script>

<style scoped></style>