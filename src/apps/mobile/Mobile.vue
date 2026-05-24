<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: "Mobile",
  created() {
    document.body.className = "m-body";
  },
  destroyed() {
    document.body.className = "";
  }
};
</script>

<style src="../../assets/css/m-customer.css"  />