<template>
  <!-- <div
    class="toast-popup copy-invite-code-toast"
    style="text-align : center; z-index:100"
  >{{ $store.state.toastMsg }}</div>-->
  <div></div>
</template>

<script>
export default {
  name: "MainPopupToast",
  props: {},
  data: () => ({}),
  computed: {},
  methods: {
    hideToast() {
      this.$store.commit("setIsShowToast", false);
      this.$store.commit("setToastMsg", "");
    }
  },
  created() {
    // this.$store.commit("setToastMsg", "준비 중인 기능입니다.");
  },
  mounted() {
    this.$toasted.show(this.$store.state.toastMsg);

    setTimeout(() => {
      this.hideToast();
    }, 3000);
  }
};
</script>

<style scoped></style>
