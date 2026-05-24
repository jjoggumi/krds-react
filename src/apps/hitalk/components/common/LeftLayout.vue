<template>
  <div class="left-wrap" :class="{'full': ['reservation', 'vote'].includes(selectedTab)}">
    <div class="inner">
      <navigation-bar @closeShareReportHistoryDetail="onCloseShareReportHistoryDetail"/>
      <navigation-bar-bottom />
      <tab-layout @closeShareReportHistoryDetail="onCloseShareReportHistoryDetail"/>
    </div>
  </div>
</template>

<script>
import NavigationBar from "@/apps/hitalk/components/navigationbar/NavigationBar";
import NavigationBarBottom from "@/apps/hitalk/components/navigationbar/NavigationBarBottom";
import TabLayout from "@/apps/hitalk/components/tabs/TabLayout";
import {mapState} from "vuex";
export default {
  name: "LeftLayout",
  components: {TabLayout, NavigationBarBottom, NavigationBar},
  computed: {
    ...mapState('storeHitalk', ['selectedTab'])
  },
  methods: {
    onCloseShareReportHistoryDetail() {
      this.$emit('closeShareReportHistoryDetail');
    },
  }
}
</script>

<style>

</style>