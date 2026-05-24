<template>
  <div
    v-if="isLoadedContents"
    class="component-main-soar"
  >
    <div class="main-soar__slide">
      <Slick
        ref="textBarSlide"
        :options="slickOptions"
        @afterChange="handleAfterChange"
      >
        <div
          v-for="content of contents"
          :key="content.contents"
          class="slide"
        >
          <a href="javascript:void(0);" @click="callHomeContent(content)">
            <span class="category">{{ content.titlePoint }}</span>
            <span class="heading" :inner-html.prop="content.title"></span>
          </a>
        </div>
      </Slick>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

import Slick from "vue-slick";

export default {
  name: "section-type-text-bar",
  components: { Slick },
  data() {
    return {
      params: {
        sectionType: 'TEXT_BAR'
      },
      isLoadedContents: false,
      slickOptions: {
        dots: false,
        arrows: false,
        vertical: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        verticalSwiping: true,
        autoplay: true,
        speed: 1000
      },
      currentSlideIndex: 0,
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
    }
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
      callHomeContentsLink: 'callHomeContentsLink'
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
              this.$log.debug(this.$options.name, `${this.params.sectionType}, ${this.contents.length}`)
            }, 200)
        }
      })
    },
    handleAfterChange(event, slick, currentSlideIndex) {
      // this.$log.debug('handleAfterChange', event, slick, currentSlideIndex);
      this.currentSlideIndex = currentSlideIndex
    },
    reInit() {
      // Helpful if you have to deal with v-for to update dynamic lists
      this.$log.debug(this.$options.name, this.params.sectionType, 'reInit!')
      this.$nextTick(() => {
        this.$refs.textBarSlide.reSlick();
      });
    },
    callHomeContent(content) {
      this.triggerAnalyticsLogEvent({ code: 'analytics.home.textBar.item.click' })
      this.callHomeContentsLink(content)
    },
  }
}
</script>

<style scoped>

</style>