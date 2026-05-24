<template>
  <div
    v-if="user.currentId"
    class="cont-box-inner clfix"
  >
    <div class="column-left">
      <!-- 나의 클래스/학교 -->
      <home-my-class />

      <!-- 다운로드 영역 -->
      <home-download />

      <!-- 내 소식 -->
      <home-my-news />

      <!-- 오늘의 급식 -->
      <section-type-meal />

      <!-- 하이클래스 이용가이드 -->
      <section-type-guide />

      <!-- 추천정보 -->
      <main-body-home-recommended-information />

      <!-- 추천 연수 과정 -->
      <main-body-home-recommended-training-course />

    </div>

    <div class="column-right">
      <!-- 급상승 -->
      <section-type-text-bar />

      <!-- 배너 -->  <!-- TODO: 띠배너 A 는 사용하지 않음? -->
      <!-- 띠배너 B -->
      <home-type-banner
        :key="'BANNER_B'"
        section-type="BANNER_B"
      />

      <!-- 바로가기 -->
      <home-type-quick-menu />

      <!-- 배너 -->
      <!-- 띠배너 C -->
      <home-type-banner
        :key="'BANNER_C'"
        section-type="BANNER_C"
      />

      <!-- 스토어 & 광고 -->
      <home-advertisement />

    </div>

    <layer-item positionType="WEB_POPUP_HOME" />

    <!-- 2022년 7월 31일 까지 IE 브라우저에서 레이어 팝업 노출 -->
    <layer-item
      v-if="$comn.isIE()
        && $comn.split($store.state.InternetExplorerExpireGuide, '/')
        && !isExpired({ expiredTime: '2022-08-31 23:59:59' })
      "
      positionType=""
      :item="{
        currentId: $comn.split($store.state.InternetExplorerExpireGuide, '/'),
        locationX: 600,
        locationY: 250,
        link: $store.state.InternetExplorerExpireGuideLink,
        linkType: 'EXTERNAL',
        popupType: 'LAYER',
        replayType: 'NOTTODAY',
        thumbnailPath: `${$store.state.InternetExplorerExpireGuide}?ver=${currentVersion}`,
      }"
    />

    <banner-item
      :key="$store.state.bannerTimestamp"
      positionType="WEB_BANNER_QUICK"
      :banners="$store.state.banner.WEB_BANNER_QUICK"
    />
  </div>

</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";

import HomeMyClass from "@/apps/main/home/subcomponents/MyClass";
import HomeMyNews from "@/apps/main/home/subcomponents/MyNews";
import HomeDownload from "@/apps/main/home/subcomponents/Download";
import HomeAdvertisement from "@/apps/main/home/subcomponents/Advertisement";

import SectionTypeMeal from "@/apps/main/home/sectionType/Meal";
import SectionTypeGuide from "@/apps/main/home/sectionType/Guide";
import SectionTypeTextBar from "@/apps/main/home/sectionType/TextBar";

import HomeTypeBanner from "@/apps/main/home/sectionType/Banner";
import HomeTypeQuickMenu from "@/apps/main/home/sectionType/QuickMenu";

import MainBodyHomeRecommendedInformation from "@/apps/main/home/subcomponents/RecommendedInformation";
import MainBodyHomeRecommendedTrainingCourse from "@/apps/main/home/subcomponents/RecommendedTrainingCourse";

import LayerItem from "@/components/Banner/LayerItem";
import BannerItem from "@/components/Banner/BannerItem";

import { mapFields } from "vuex-map-fields";
import { version } from '@/../package.json'

export default {
  name: "main-body-home",
  components: {
    BannerItem,
    LayerItem,
    MainBodyHomeRecommendedTrainingCourse,
    MainBodyHomeRecommendedInformation,

    HomeMyClass,
    HomeMyNews,
    HomeDownload,
    HomeAdvertisement,

    SectionTypeMeal,
    SectionTypeGuide,
    SectionTypeTextBar,

    HomeTypeBanner,
    HomeTypeQuickMenu,
  },
  computed: {
    ...mapState({
      user: 'user',
    }),
    ...mapState('storeHome', {
      sectionMains: 'sectionMains'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      isExpired: 'isExpired',
    }),
    ...mapFields({
      isNewTabLoading: 'isNewTabLoading',
    }),
    currentVersion() {
      return version || this.$moment().format('YYYYMMDD')
    }
  },
  created() {
    this.isNewTabLoading = false
    this.checkRoute()

    this.getSectionMains()
  },
  mounted() {
    // 페이지 body 에 bg-white 스타일 지양
    // this.$hiClass.toggleBodyClass('add', 'bg-white')

    this.triggerAnalyticsLogEvent({ code: 'analytics.home.loadPage' })
  },
  beforeDestroy() {
    this.removeSectionMains()
    this.clearSectionMainAdsView()

    // this.$hiClass.toggleBodyClass('remove', 'bg-white')
  },
  destroyed() {},
  methods: {
    ...mapMutations('storeHome', {
      clearSectionMainAdsView: 'clearSectionMainAdsView',
    }),
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions('storeHome', {
      getSectionMains: 'getSectionMains',
      removeSectionMains: 'removeSectionMains',
    }),
    // checkBeforeLoginPath(){
    //   const path = sessionStorage.getItem('initBeforeLoginPath');
    //   if(path === "/help/question"){
    //     this.$router.push(path, () => {})
    //   }
    // }, 
    checkRoute() {
      const isRouteAlarmPlus = sessionStorage.getItem('routeAlarmPlus') === 'true'

      if (sessionStorage.getItem('routeAlarmPlus'))
        sessionStorage.removeItem('routeAlarmPlus')

      if (isRouteAlarmPlus && this.user.userType === this.CONSTANTS.USER_TYPE.TEACHER) {
        this.isNewTabLoading = true
        this.$router.push('/main/alarmplus', () => {})
        return;
      }

      const path = sessionStorage.getItem('initBeforeLoginPath');
      sessionStorage.removeItem('initBeforeLoginPath')
      if(path === "/help/question"){
        this.$router.push(path, () => {})
        return;
      }

      // URL 파라미터를 제외한 path
      if (this.$route.path === '/main')
          this.$router.replace('/main/home', () => {})
    }
  }
}
</script>

<style scoped>

</style>
