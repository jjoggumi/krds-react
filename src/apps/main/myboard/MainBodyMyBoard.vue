<template>
  <div class="cont-box-inner clfix">
    <banner-item
      :key="bannerTimestamp"
      positionType="WEB_BANNER_QUICK"
      :banners="banner.WEB_BANNER_QUICK"
    />

    <main-body-my-board-lnb />

    <div class="right-cont-wrap">
      <div class="contetns-title-wrap">
        <div class="title">{{ myBoardLnb.tabTitles[myBoardLnb.currentTabIndex] }}</div>
      </div>

      <router-view v-if="visibleMyBoard"></router-view>

    </div>
  </div>

</template>

<script>
import BannerItem from "@/components/Banner/BannerItem";
import MainBodyMyBoardLnb from "@/apps/main/myboard/MainBodyMyBoardLnb";
import {mapActions, mapState} from "vuex";

export default {
  name: "main-body-my-board",
  components: {MainBodyMyBoardLnb, BannerItem},
  computed: {
    ...mapState({
      banner: 'banner',
      bannerTimestamp: 'bannerTimestamp',
    }),
    ...mapState('storeMyBoard', {
      myBoardLnb: 'lnb',
      visibleMyBoard: 'visibleMyBoard'
    }),
  },
  watch: {
    'myBoardLnb.currentTabIndex'(val) {
      this.$log.debug('myBoardLnb.currentTabIndex:', val)
    },
  },
}
</script>

<style scoped>

</style>