<template>
  <component v-bind:is="curForm"></component>
</template>

<script>
import Search from "./search/LoginBodyFindIdBodyItemSearch";
import Result from "./result/LoginBodyFindIdBodyItemResult";
import NotFound from "./notFound/LoginBodyFindIdBodyItemNotFound";
export default {
  name: "loginBodyFindIdBody",
  data: () => ({ curForm: "" }),
  components: { Search, Result, NotFound },
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

      document.title = "findId-" + this.curForm;
    }
  }
};
</script>

<style scoped></style>