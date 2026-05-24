<template>
  <div class="component-main-thumb">
    <div class="main-thumb__text-common">
      <h2 class="heading-main">{{ tab.title }}</h2>
      <slot name="description">
        <!--
          <p class="desc">학교생활에 꼭 필요한<br>교육 정보 모음</p>
        -->
      </slot>
    </div>

    <div
      v-if="contents.length > 0"
      class="main-thumb__list"
    >
      <div
        v-for="(content, index) of contents"
        class="main-thumb__item"
        :key="`${content.contents}-${index}`"
      >
        <a href="javascript:void(0);" @click="callHomeContent(content)">
          <div
            v-if="content.file"
            class="thumb"
          >
            <span class="category">{{ content.titlePoint }}</span>
            <img :src="content.file.fileOriginalPath" alt="">
          </div>
          <span class="heading" :inner-html.prop="content.title"></span>
        </a>
      </div>
    </div>

  </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "section-type-tab-thumbnail",
  props: {
    tab: {
      type: Object,
      required: true
    },
    tabIndex: {
      type: Number,
      required: true
    },
  },
  data() {
    return {
      moreRoutePath: [
        '/main/education/info'
      ]
    }
  },
  computed: {
    ...mapGetters('storeHome', {
    }),
    contents() {
      return this.tab.contents || []
    },
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions('storeHome', {
      callHomeContentsLink: 'callHomeContentsLink'
    }),
    callHomeContent(content) {
      const logPayload = {
        code: 'analytics.home.tabThumbnail.item.click',
        value1: this.tab.title
      }
      this.triggerAnalyticsLogEvent(logPayload)
      this.callHomeContentsLink(content)

    },
  }
}
</script>

<style scoped>

</style>