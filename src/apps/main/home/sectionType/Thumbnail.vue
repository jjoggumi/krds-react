<template>
  <div
    v-if="thumbnailType === 'A'"
    class="component-main-thumb"
  >
    <div :class="[titleThumbClassByUserType]">
      <h2 class="heading-main">{{ section.title || '' }}</h2>
      <slot name="description">
        <p class="desc" :inner-html.prop="titleDescriptionByUserType"></p>
      </slot>
    </div>

<!--    <div
      v-if="moreRoutePath[tabIndex]"
      class="group-link"
    >
      <a
        href="javascript:void(0);"
        class="link"
        @click="$router.push(moreRoutePath[tabIndex])"
      >
        {{ section.title }} 더보기
      </a>
    </div>-->

    <div
      v-if="contents.length > 0"
      class="main-thumb__list"
    >
      <div
        v-for="content of contents"
        class="main-thumb__item"
        :key="content.contents"
      >
        <a href="javascript:void(0);" @click="callHomeContent(content)">
          <div class="thumb">
            <span class="category">{{ content.titlePoint }}</span>
            <img v-if="content.file" :src="content.file.fileOriginalPath" alt="">
          </div>
          <span class="heading" :inner-html.prop="content.title"></span>
        </a>
      </div>

    </div>
  </div>


  <div
    v-else-if="thumbnailType === 'B'"
    class="component-main-adver"
  >
    <template v-if="contentsFocus.contents">
      <div
        v-if="contentsFocus.file"
        class="main-adver__thumb"
        role="button"
        @click="callHomeContentStoreFocus(contentsFocus)"
      >
        <img :src="contentsFocus.file.fileOriginalPath" alt="">
      </div>
      <div class="main-adver__thumbinfo">
        <span
          class="heading-sub"
          role="button"
          @click="callHomeContentStoreFocus(contentsFocus)"
        >
          {{ contentsFocus.titlePoint }}
        </span>
        <strong
          class="heading"
          role="button"
          @click="callHomeContentStoreFocus(contentsFocus)"
        >
          {{ contentsFocus.title }}
        </strong>
        <span
          class="text"
          role="button"
          @click="callHomeContentStoreFocus(contentsFocus)"
        >
          {{ contentsFocus.titleSub }}
        </span>
        <div class="group-link">
          <a href="javascript:void(0);" class="link" @click="callHomeContentStoreFocus(contentsFocus)">자세히 보기</a>
        </div>
      </div>
    </template>

    <div
      v-if="contentsOthers.length > 0"
      class="main-adver__list"
    >
      <div
        v-for="(contentsOther, index) of contentsOthers"
        :key="index"
        class="main-adver__item"
      >
        <a href="javascript:void(0);" @click="callHomeContentStoreSub(contentsOther)">
          <div
            v-if="contentsOther.file"
            class="thumb"
          >
            <img :src="contentsOther.file.fileOriginalPath" alt="">
          </div>
          <div class="info">
            <strong class="heading">
              <span v-if="contentsOther.titlePoint" class="category">{{ contentsOther.titlePoint }}</span>
              {{ contentsOther.title }}
            </strong>
            <span class="text">{{ contentsOther.titleSub }}</span>
          </div>
        </a>
      </div>
    </div>

  </div>

</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "section-type-thumbnail",
  props: {
    section: {
      type: Object,
      required: true
    },
    tabIndex: {
      type: Number,
      required: true
    },
    thumbnailType: {  // A: list, B: Advertise
      type: String,
      required: true
    },
  },
  data() {
    return {
      moreRoutePath: [
        // '/main/education/info'
      ]
    }
  },
  computed: {
    ...mapGetters({
      isCurUserTypeTeacher: 'isCurUserTypeTeacher',
      isCurUserTypeParents: 'isCurUserTypeParents',
      isCurUserTypeStudent: 'isCurUserTypeStudent',
      shuffle: 'shuffle',
    }),
    ...mapGetters('storeHome', {
    }),
    displayCount() {
      return this.section.displayCount || 0 // 4개 제한
    },
    displayRule() {
      return this.section.displayRule || 'ORDERLY' // 'ORDERLY' or 'RANDOM'
    },
    contents() {
      return this.section.contents || []
    },
    contentsFocus() {
      return this.contents[0] || {}
    },
    contentsOthers() {
      // 0번 아이템 제외하고 복사
      const array = this.contents.slice(1)

      // displayRule 랜덤일 경우 shuffle 처리
      const shuffledArray = this.displayRule === 'RANDOM'
        ? this.shuffle({ array })
        : array

      // 5개 이상 설정되어 있어도 하단에는 3개만 표시
      return shuffledArray.slice(0, this.displayCount - 1)
    },
    titleThumbClassByUserType() {
      let value = 'main-thumb__text-common'

      if (this.isCurUserTypeTeacher)
        value = 'main-thumb__text-teacher'
      else if (this.isCurUserTypeParents)
        value = 'main-thumb__text-parents'
      else if (this.isCurUserTypeStudent)
        value = 'main-thumb__text-student'

      return value
    },
    titleDescriptionByUserType() {
      let value = '학급운영부터 교직실무<br>까지 필수 연수 모음'

      if (this.isCurUserTypeTeacher)
        value = '학급운영부터 교직실무<br>까지 필수 연수 모음'
      else if (this.isCurUserTypeParents)
        value = '엄마들이 알고 싶은<br>자녀 학교생활'
      else if (this.isCurUserTypeStudent)
        value = '친구들이 출제한<br>재미있는 퀴즈'

      return value
    }
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
        code: 'analytics.home.thumbnail.item.click',
        value1: this.section.title
      }
      this.triggerAnalyticsLogEvent(logPayload)
      this.callHomeContentsLink(content)
    },
    callHomeContentStoreFocus(content) {
      this.triggerAnalyticsLogEvent({ code: 'analytics.home.store.focus.item.click' })
      this.callHomeContentsLink(content)
    },
    callHomeContentStoreSub(content) {
      this.triggerAnalyticsLogEvent({ code: 'analytics.home.store.sub.item.click' })
      this.callHomeContentsLink(content)
    },
  }
}
</script>

<style scoped>

</style>