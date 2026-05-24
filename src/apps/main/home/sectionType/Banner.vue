<template>
  <div
    v-if="isLoadedContents"
    class="component-main-banner"
  >
    <div class="main-banner__slide">
      <Slick
          ref="bannerSlide"
          :options="slickOptions"
          @init="handleInit"
          @afterChange="handleAfterChange"
      >
        <div
            v-for="(content, index) of contents"
            :key="content.contents"
            class="slide"
        >
          <a href="javascript:void(0);" @click="callHomeContent(content)">
            <img
                :src="content.file.fileOriginalPath"
                :data-index="index"
                alt=""
                v-observe-visibility="
                  isLoadedSlide
                  ? {
                      callback: visibilityChanged,
                      intersection: {
                        threshold: 0.6,
                      },
                      once: true,
                    }
                  : false
                "
            >
          </a>
        </div>
      </Slick>
    </div>
    <div
        v-if="contents.length > 1"
        class="slide-count"
    >
      <span class="current">{{ currentSlideIndex + 1 }}</span>/<span class="total">{{ contents.length }}</span>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { ObserveVisibility } from 'vue-observe-visibility'

import Slick from "vue-slick";

export default {
  name: "section-type-banner",
  components: { Slick },
  directives: { ObserveVisibility },
  props: {
    sectionType: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      isLoadedContents: false,
      isLoadedSlide: false,
      slickOptions: {
        dots: true,
        arrows: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        speed: 1000
      },
      currentSlideIndex: 0,
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    ...mapGetters('storeHome', {
      getSectionsBySectionType: 'getSectionsBySectionType'
    }),
    getSections() {
      return this.getSectionsBySectionType({ sectionType: this.sectionType })
    },
    section() {
      return this.getSections.length > 0 ? this.getSections[0] : {}
    },
    contents() {
      return this.section.contents || []
    },
  },
  watch: {
    'contents.length'() {
      this.initComponent()
      // this.reInit()
    }
  },
  mounted() {
    this.initComponent()
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions('storeHome', {
      callHomeContentsLink: 'callHomeContentsLink',
      visibilityChangedByContent: 'visibilityChangedByContent',
    }),
    initComponent() {
      this.$nextTick(() => {
        switch (this.contents.length) {
          case 0:
            this.isLoadedContents = false
            break
          case 1:
            this.isLoadedContents = true
            break
          default:
            setTimeout(() => {
              this.isLoadedContents = true
              this.$log.warn(`${this.sectionType}, ${this.contents.length}`)
            }, 200)
        }
      })
    },
    handleInit(event, slick) {
      this.$log.debug('handleInit', event, slick);
      if (this.isLoadedSlide === false)
        setTimeout(() => this.isLoadedSlide = true, 300)
    },
    handleAfterChange(event, slick, currentSlideIndex) {
      this.$log.debug('handleAfterChange', event, slick, currentSlideIndex);
      this.currentSlideIndex = currentSlideIndex
    },
    reInit() {
      // Helpful if you have to deal with v-for to update dynamic lists
      this.$log.debug(this.$options.name, this.sectionType, 'reInit!')
      this.$nextTick(() => {
        this.$refs.bannerSlide.reSlick();
      });
    },
    callHomeContent(content) {
      const contentTitle = content.title
      let value1
      let value2 = contentTitle

      switch (this.sectionType) {
        case 'BANNER_A':
          value1 = '띠배너A'
          break
        case 'BANNER_B':
          value1 = '띠배너B'
          break
        case 'BANNER_C':
          value1 = '띠배너C'
          break
      }

      const logPayload = {
        code: 'analytics.home.banner.item.click',
        value1,
        value2
      }
      this.triggerAnalyticsLogEvent(logPayload)
      // 클릭 시 adWebId 증가 처리
      this.callHomeContentsLink(content)
    },
    visibilityChanged(isVisible, entry) {
      // 노출되었을 때 adWebId 증가 처리
      if (isVisible) {
        const dataset = entry.target.dataset
        const content = this.contents[dataset.index]  // content
        this.$log.debug(this.$options.name, 'visibilityChanged content:', content)
        this.visibilityChangedByContent({ content })
      }
    },

  }
}
</script>

<style scoped>

</style>