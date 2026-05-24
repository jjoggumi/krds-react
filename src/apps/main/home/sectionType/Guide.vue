<template>
  <div
    v-if="contents.length > 0"
    class="component-main-guide"
  >
    <h2 class="heading-main">하이클래스 이용가이드</h2>

    <!-- links 세팅한 경우 -->
    <template v-if="links.length > 0">
      <div class="group-link">
        <a
          :href="link.contents"
          class="link"
          :target="link.linkType === 'EXTERNAL' ? '_blank' : '_self'"
          @click="onClickGuideShortcut"
        >{{ link.title }}</a>
      </div>
    </template>

    <!-- 가이드 동영상 영역 -->
    <!--
    <div
      v-if="isShowGuideVideo"
      class="main-guide__video" role="button" @click="onClickGuideVideo">
      <img src="https://image.hiclass.net/7e50/8850/9650/db50/4b0ba496-51c8-4afc-95d0-ca8e4542d675.png" alt="">
    </div>
    -->

    <ul class="main-text__list">
      <li
        v-for="content of contents"
        class="main-text__item"
        :key="content.contents"
      >
        <a href="javascript:void(0);" @click="callHomeContent(content)">
          <span class="category">{{ content.titlePoint }}</span>
          <span class="heading" :inner-html.prop="content.title"></span>
        </a>
      </li>
    </ul>

  </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "section-type-guide",
  data() {
    return {
      params: {
        sectionType: 'GUIDE'
      },
      isShowGuideVideo: true
    }
  },
  computed: {
    ...mapGetters('storeHome', {
      getSectionsBySectionType: 'getSectionsBySectionType'
    }),
    getSections() {
      return this.getSectionsBySectionType(this.params)
    },
    section() {
      return this.getSections.length > 0 ? this.getSections[0] : {}
    },
    contents() {
      return this.section.contents || []
    },
    links() {
      return this.section.links || []
    },
    link() {
      return this.links[0] || {}
    },
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions('storeHome', {
      callHomeContentsLink: 'callHomeContentsLink'
    }),
    onClickGuideShortcut() {
      this.triggerAnalyticsLogEvent({ code: 'analytics.home.guide.shortcut.click' })
    },
    onClickGuideItem() {
        this.triggerAnalyticsLogEvent({ code: 'analytics.home.guide.item.click' })
    },
    onClickGuideMovie() {
      this.triggerAnalyticsLogEvent({ code: 'analytics.home.guide.movie.click' })
    },
    onClickGuideVideo() {
      this.$hiClass.alert('가이드 동영상 비활성화 시 가이드 섹션', 'info')
        .then(() => {
          this.isShowGuideVideo = false
        })
    },
    callHomeContent(content) {
      this.onClickGuideItem()
      this.callHomeContentsLink(content)
    },
  }
}
</script>

<style scoped>

</style>