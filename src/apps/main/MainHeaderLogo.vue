<!--
@File(Method): MainHeaderLogo.vue
@Author: - 
@Date Created: -
@Description: 메인페이지 header logo 
@Modified: 2024-12-17 - #70706 스노우 트리 로고 변경 
-->

<template>
  <div
    class="header-logo-wrap"
    :class="{
      snow: isSnowTree
    }"
  >
    <h1>
      <a
        href="javascript:"
        @click="
          triggerAnalyticsLogEvent({ code: 'analytics.home.bi.click' })
          goRoute('/main/home')
        "
      >
      <!-- #70706 로티 애니메이션 로고 -->
        <div class="snow-tree" v-if="isSnowTree">        
          <lottie :options="snowTree" />
        </div>
        <!-- #70706 기존 스노우 로고<img
          v-if="isSnowTree"
          src="@/assets/img/header_logo2x_tree_01.png"
          alt
        /> -->
        <!-- v2 로고 -->        
        <img
          v-else-if="isNewLogo && isAlarmplusVariant"
          src="@/assets/img/header_logo_v2_white.svg"
          alt="v2 Logo White"
        />
        <img
          v-else-if="isNewLogo"
          src="@/assets/img/header_logo_v2_black.svg"
          alt="v2 Logo Black"
        />
        <img
          v-else-if="isDevelopmentUI"
          src="@/assets/img/header_logo2x_dev.png"
          alt
        />
        <img
          v-else-if="isStageUI"
          src="@/assets/img/header_logo2x_stage.png"
          alt
        />
        <img
          v-else
          src="@/assets/img/header_logo2x.png"
          alt
        />
      </a>
    </h1>
  </div>
</template>

<script>
import {mapState, mapActions} from "vuex";
// #70706 lottie, data import
import Lottie from "@/components/Lottie/Lottie";
import snowTree from '@/assets/img/logo/snow-tree.json';

export default {
  name: "main-header-logo",
  // #70706 lottie 컴포넌트 등록
  components: {
    Lottie
  },
  props: {
    logoType: {
      type: String
    },
    variant: {
      type: String,
      default: 'default'
    }
  },
  data() {
    return { 
      // #70706 lottie 옵션
      snowTree: {
        animationData: snowTree,
        loop: true,
        autoplay: true
      }     
    }
  },
  computed: {
    ...mapState({
      isDevelopmentUI: 'isDevelopmentUI',
      isStageUI: 'isStageUI'
    }),
    isSnowTree() {
      return this.logoType === 'SNOW_TREE'
    },
    isNewLogo() {
      return this.logoType === 'NEW_LOGO'
    },
    isAlarmplusVariant() {
      return this.variant === 'alarmplus'
    }
  },
  created() {},
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
      isAllDeviceLogout: 'isAllDeviceLogout'
    }),
    async goRoute(path) {
      const res = await this.isAllDeviceLogout(false)
      if(res) {
        this.$router.push('/logout', () => {})
      } else {
        if (path === this.$route.path) {
          path === '/main' || path === '/main/home'
            ? this.$emit('doReloadMain')
            : this.$router.go(0)
        } else {
          this.$router.push(path, () => {})
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.header-logo-wrap {
  position: relative;
  display: inline-block;
  vertical-align: top;
  img {
    height: 46px;
    max-width: 100px;
  }
  &.snow {
    height: 100%;
    // background-image: url("../img/icon/snow.png"), url("../img/icon/snow3.png"), url("../img/icon/snow2.png");
    background-size: 500px 500px, 400px 400px, 300px 300px;
    animation: snow 15s linear infinite;
    -webkit-animation: snow 15s linear infinite;
  }
  .snow-tree {
    width: 136px;
    height: 48px;
  }
}
</style>