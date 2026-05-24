<template>
   <div class="login-cont-wrap">
      <div class="login-style-wrap">
      </div>
   </div>
</template>
<script>
export default {
   name: "mobile-identity-verification",
   created() {
      const idToken = this.$route.query.idToken;

      this.$nextTick(async () => {
         window.open(`/popup/identity-verification?idToken=${idToken}`,"_blank");
      });
   },
};
</script>

<style scoped>
#wrap {
  /* 모바일 기준 */
   min-width: 100%;
}
</style>

