<template>
  <header
    v-if="visible"
    class="l-header-index"
  >
  
    <!-- <div class="header-index-top__inner">
      <div class="m-text">
        <div class="text">
          <span>하이클래스는 학교와 가정을 위해 <em class="highlight01">언제나 무료</em>로 제공됩니다.</span>
          <span>선생님, 학부모, 학생, 학교관계자, 교육기관 <em class="highlight02">누구나 모든 서비스를 무료로 이용</em>하세요.</span>
          <span>하이클래스는 학교와 가정을 위해 <em class="highlight01">언제나 무료</em>로 제공됩니다.</span>
          <span>선생님, 학부모, 학생, 학교관계자, 교육기관 <em class="highlight02">누구나 모든 서비스를 무료로 이용</em>하세요.</span>
          <span>하이클래스는 학교와 가정을 위해 <em class="highlight01">언제나 무료</em>로 제공됩니다.</span>
          <span>선생님, 학부모, 학생, 학교관계자, 교육기관 <em class="highlight02">누구나 모든 서비스를 무료로 이용</em>하세요.</span>
        </div>
        <div class="text">
          <span>하이클래스는 학교와 가정을 위해 <em class="highlight01">언제나 무료</em>로 제공됩니다.</span>
          <span>선생님, 학부모, 학생, 학교관계자, 교육기관 <em class="highlight02">누구나 모든 서비스를 무료로 이용</em>하세요.</span>
          <span>하이클래스는 학교와 가정을 위해 <em class="highlight01">언제나 무료</em>로 제공됩니다.</span>
          <span>선생님, 학부모, 학생, 학교관계자, 교육기관 <em class="highlight02">누구나 모든 서비스를 무료로 이용</em>하세요.</span>
          <span>하이클래스는 학교와 가정을 위해 <em class="highlight01">언제나 무료</em>로 제공됩니다.</span>
          <span>선생님, 학부모, 학생, 학교관계자, 교육기관 <em class="highlight02">누구나 모든 서비스를 무료로 이용</em>하세요.</span>
        </div>
      </div>
      <div class="pc-text">
        <div class="text">하이클래스는 학교와 가정을 위해 <em class="highlight01">언제나 무료</em>로 제공됩니다.</div>
        <div class="text">선생님, 학부모, 학생, 학교관계자, 교육기관 <em class="highlight02">누구나 모든 서비스를 무료로 이용</em>하세요.</div>
      </div>
    </div> -->

    <div class="header-index__inner">
      <h1 class="logo"><a href="javascript:void(0);" @click="goIndex()">HiClass</a></h1>

      <div
        v-if="isMobile"
        class="m-group-btn"
      >
        <a :href="appLink" class="m-btn-app">APP으로 시작하기</a>
      </div>

      <div
        v-else
        class="app-download"
        :class="{
          'is-opened': appDownload.isOpened
        }"
        v-click-outside="closeAppDownload"
      >
        <button
          type="button"
          class="btn-toggle"
          @click="toggleAppDownload"
        >APP 다운로드</button>
        <div
          v-show="appDownload.isOpened"
          class="app-download__layer"
          :class="{
            'is-animated': appDownload.isAnimated
          }"
        >
          <a :href="mobileAppDownloadUri.android" class="link-google">Google Play</a>
          <a :href="mobileAppDownloadUri.ios" class="link-app">App Store</a>
        </div>
      </div>

    </div>
  </header>
</template>

<script>
import {mapGetters, mapState} from "vuex";

export default {
  name: 'hc-app-link',
  props: {},
  data() {
    return {
      appDownload: {
        isOpened: false,
        isAnimated: false
      },
      currentPath: null,
      whiteList: [
        '/mobile/help/notice',
        '/mobile/help/question',
        '/mobile/help/faq',
        '/mobile/invite/clazzInviteCard',
        '/mobile/terms/privacy',
        '/mobile/terms/service'
      ]
    }
  },
  computed: {
    ...mapState({
      isMobileObj: 'isMobileObj',
      mobileIntentUri: 'mobileIntentUri',
      mobileAppDownloadUri: 'mobileAppDownloadUri',
    }),
    ...mapGetters({
      isMobile: 'isMobile',
    }),

    visible() {
      return this.isWhiteList !== null && this.isWhiteList === false
    },
    isWhiteList() {
      return this.whiteList.includes(this.currentPath)
    },
    appLink() {
      let link = this.mobileAppDownloadUri.android

      // 모바일 기기인 경우
      if (this.isMobile) {
        if (this.isMobileObj.apple.device)
          link = this.mobileAppDownloadUri.ios
        else if (this.isMobileObj.android.device)
          link = this.mobileAppDownloadUri.android

      // 모바일 기기가 아닌경우
      } else {
        if (this.isMobileObj.apple.device)
          link = this.mobileAppDownloadUri.ios
      }

      return link
    }
  },
  watch: {
    $route(to) {
      this.currentPath = to.path
    },
    'appDownload.isOpened': {
      handler(val) {
        setTimeout(() => {
          this.appDownload.isAnimated = val
        }, 100)
      }
    }
  },
  mounted() {
    this.currentPath = this.$route.path
  },
  methods: {
    toggleAppDownload() {
      this.appDownload.isOpened = !this.appDownload.isOpened
    },
    closeAppDownload() {
      this.$nextTick(() => {
        this.appDownload.isOpened = false
      })
    },
    goIndex() {
      location.replace('/')
    }

  }
}
</script>
