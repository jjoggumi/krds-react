<template>
  <div class="hitalk-banner-modal modal">
    <div class="banner">
      <img src="@/assets/img/banner/hitalk_211207.png" alt="Banner">
    </div>
    <div class="modal-close-btn modal-close-icon" @click="closeBanner"></div>
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex";

export default {
  computed: {
    ...mapState('storeHitalk',[
      'isShowBanner',
    ]),
  },
  methods: {
    ...mapMutations("storeHitalk",[
      'setShowBanner',
    ]),
    closeBanner() {
      this.setShowBanner(false);
      localStorage.setItem("hitalkBannerTimeStamp", new Date().getTime().toString());
    },
  }
}
</script>

<style scoped></style>
