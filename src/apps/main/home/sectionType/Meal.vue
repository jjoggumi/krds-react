<template>
  <div class="component-main-meal">

    <!-- 급식: 학교 구독 중 -->
    <div
      v-if="contents.length > 0"
      class="main-meal__slide"
      :key="contents.length"
    >
      <!-- 학교별 급식데이터: exist data -->
      <Slick :options="slickOptions" ref="mealSlide">
        <div
          v-for="content of contents"
          :key="content.contents"
          class="slide"
        >
          <h2 class="heading-main">{{ title }}</h2>
          <span class="name">{{ getContentByParams({ titlePoint: content.titlePoint }) }}</span>
          <pre>{{ getContentByParams({ title: content.title }) }}</pre>

          <button
            v-if="content.contentsType === 'POST'"
            class="btn-more"
            @click="openMealMore({ postId: content.contents })"
          >
            더보기
          </button>

          <!-- 급식 이미지 -->
          <div
            v-if="existThumbnail(content.file)"
            class="image"
          >
            <img
              :src="content.file.fileOriginalPath"
              alt=""
              role="button"
              @click="openMealMore({ postId: content.contents })"
            >
          </div>
          <!-- 급식 기본 이미지 -->
          <div
            v-else
            class="image"
          ></div>
        </div>
      </Slick>
    </div>

<!--    <template v-else-if="contents.length === 0">
      <h2 class="heading-main">오늘의 급식</h2>
      <div class="nodata">
        <p>데이터 로딩 중...</p>
      </div>
    </template>-->

    <!-- 급식: 학교 구독 전 -->
    <template v-else>
      <h2 class="heading-main">오늘의 급식</h2>
      <div class="nodata">
        <p>우리 학교를 검색하여 구독하면<br>매일 맛있는 급식 소식을 받으실 수<br>있어요.</p>
        <div class="group-link">
          <a href="javascript:" class="link" @click="openSearchLayer">우리학교 찾기</a>
        </div>
      </div>
    </template>

  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";

import Slick from "vue-slick";

import { eventBus } from '@/main'

export default {
  name: "section-type-meal",
  components: { Slick },
  data() {
    return {
      params: {
        sectionType: 'MEAL'
      },
      slickOptions: {
        arrows: true,
        slidesToShow: 1,
        adaptiveHeight: true,
        infinite: true,
        speed: 500,
        fade: true,
        swipe: false,
      }
    }
  },
  computed: {
    ...mapState({
      currentTimestamp: 'currentTimestamp'
    }),
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
    title() {
      return this.nextMeal  ? '다음 급식 예고' : '오늘의 급식'
    },
    nextMeal() {
      return this.$moment(this.currentTimestamp).hour() >= 18
    }
  },
  watch: {
    nextMeal(val, oldVal) {
      this.$log.debug(`nextMeal val: ${val}, oldVal: ${oldVal}`)
      this.getSectionMains()
    },
    'contents.length'() {
      this.reInit()
    }
  },
  created() {},
  mounted() {},
  methods: {
    ...mapActions({
      openPostDetailByPostId: 'openPostDetailByPostId',
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions('storeHome',{
      getSectionMains: 'getSectionMains',
      callHomeContentsLink: 'callHomeContentsLink',
    }),
    existThumbnail(file) {
      return file && file.fileOriginalPath
    },
    getContentByParams(params) {
      const key = Object.keys(params)[0]
      const value = params[key]
      let result

      switch (key) {
        case 'titlePoint': {
          result = value ? value : '학교명이 없습니다.'
          break
        }
        case 'title': {
          result = value ? value : '학교 급식 정보가 <br>없습니다.'
          break
        }
      }
      return result
    },
    openMealMore(content) {
      this.triggerAnalyticsLogEvent({ code: 'analytics.home.meal.more.click' })
      this.openPostDetailByPostId(content)
    },
    openSearchLayer() {
      const searchType = 'class_school'
      const path = '/main/search'
      const query = { searchType }
      this.$router.push({ path, query }, () => {})
    },
    reInit() {
      // Helpful if you have to deal with v-for to update dynamic lists
      this.$log.debug(this.$options.name, this.params.sectionType, 'reInit!')
      this.$nextTick(() => {
        this.$refs.mealSlide.reSlick();
      });
    },
  }
}
</script>

<style lang="scss">
/* slick 더보기 버튼을 클릭할 수 없는 버그 수정 */
/* eslint-disable-next-line */
div.slick-slide.slick-active.slick-current {
  z-index: 999;
}
</style>