<template>
  <div class="component-main-adver">
    <div class="main-adver-banner__slide">
      <div class="slide">
        <Slick
          ref="slide"
          :options="groupMainSlickOptions"
          @init="handleMainSlideInit"
        >
          <a
              href="javascript:void(0);"
              v-for="(groupMainContent, index) of groupMainContents"
              :key="index"
              @click="callHomeContentStoreFocus(groupMainContent)"
          >
            <div class="banner">
              <img
                  v-if="groupMainContent.file !== null && groupMainContent.file.fileOriginalPath !== null"
                  :src="groupMainContent.file.fileOriginalPath"
                  alt=""
                  v-observe-visibility="
                  isLoadedMainSlide
                    ? {
                        callback: mainVisibilityChanged,
                        intersection: {
                          threshold: 0.1
                        },
                        once: true
                      }
                    : false
                  "
              >
            </div>
            <span class="heading">{{ groupMainContent.title }}</span>
            <span class="heading-sub">{{ groupMainContent.titleSub }}</span>
          </a>
        </Slick>
      </div>
    </div>

    <div class="main-adver-goods__heading">{{ groupListTitle }}</div>
    <div class="main-adver-goods__slide">
      <Slick
        ref="slide"
        :options="groupListSlickOptions"
        @init="handleSubSlideInit"
      >
        <div class="slide" v-for="(groupListContent, index) of groupListContents" :key="index">
          <a
              href="javascript:void(0);"
              v-for="(content, contentIndex) of groupListContent"
              :key="contentIndex"
              @click="callHomeContentStoreSub(content)"
          >
            <div class="thumb">
              <span class="category" v-if="content.titlePoint !== ''">{{ content.titlePoint }}</span>
              <img
                  v-if="content.file !== null && content.file.fileOriginalPath !== null"
                  :src="content.file.fileOriginalPath"
                  alt=""
                  v-observe-visibility="
                  isLoadedSubSlide
                    ? {
                        callback: subVisibilityChanged,
                        intersection: {
                          threshold: 0.0
                        },
                        once: true
                      }
                    : false
                  "
              >
            </div>
            <div class="info">
              <strong class="heading">{{ content.title }}</strong>
              <span class="text">{{ content.titleSub }}</span>
            </div>
          </a>
        </div>
      </Slick>
    </div>
  </div>
</template>

<script>
import Slick from "vue-slick";
import {mapActions} from "vuex";
import {ObserveVisibility} from 'vue-observe-visibility'

export default {
  name: "section-type-group",
  components: {
    Slick
  },
  directives: {
    ObserveVisibility
  },
  props: {
    section: {
      type: Object,
      required: true
    },
    tabIndex: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      isLoadedMainSlide: false,
      isLoadedSubSlide: false,
      groupMainSlickOptions: {
        dots: true,
        arrows: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        speed: 1000
      },
      groupListSlickOptions: {
        dots: false,
        arrows: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        speed: 1000
      }
    }
  },
  computed: {
    groupMain() {
      return this.section.groups.find(contentObj => contentObj.type === 'GROUP_MAIN')
    },
    groupMainContents() {
      return this.groupMain ? this.groupMain.contents : []
    },
    groupList() {
      return this.section.groups.find(contentObj => contentObj.type === 'GROUP_LIST')
    },
    groupListTitle() {
      return this.groupList ? this.groupList.title : ''
    },
    // 4개씩 보여주기 위해 groupListContents 4개씩 나누기
    groupListContents() {
      let groupListObj = {}
      let groupContentArr = []
      let num = 0
      const contentList = this.groupList ? this.groupList.contents : []

      contentList.forEach((content, idx) => {
        if (idx % 4 === 0 && idx !== 0) {
          groupListObj[num] = groupContentArr
          num++
          groupContentArr = []
        }
        groupContentArr.push(content)
        if (contentList.length === idx + 1) {
          groupListObj[num] = groupContentArr
        }
      })

      return groupListObj
    }
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions('storeHome', {
      callHomeContentsLink: 'callHomeContentsLink'
    }),
    callHomeContentStoreFocus(content) {
      this.triggerAnalyticsLogEvent({ code: 'analytics.home.store.focus.item.click' })
      this.callHomeContentsLink(content)
    },
    callHomeContentStoreSub(content) {
      this.triggerAnalyticsLogEvent({ code: 'analytics.home.store.sub.item.click' })
      this.callHomeContentsLink(content)
    },
    handleMainSlideInit(event, slick) {
      this.$log.debug('handleMainSlideInit', event, slick);
      this.isLoadedMainSlide = true
    },
    handleSubSlideInit(event, slick) {
      this.$log.debug('handleSubSlideInit', event, slick);
      this.isLoadedSubSlide = true
    },
    mainVisibilityChanged(isVisible) {
      if (isVisible) {
        this.triggerAnalyticsLogEvent({code: 'analytics.home.store.focus.item.show'})
      }
    },
    subVisibilityChanged(isVisible) {
      if (isVisible) {
        this.triggerAnalyticsLogEvent({code: 'analytics.home.store.sub.item.show'})
      }
    }
  }
}
</script>

<style scoped>

</style>