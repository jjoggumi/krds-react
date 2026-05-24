<!--
@File(Method): MyNews.vue
@Description: 메인페이지 내소식
@Modified: 2025-03-06 - #72670 비밀게시판 명칭 변경 > 그룹게시판 - 그룹 아이콘 삭제
-->
<template>
  <div class="component-main-news">
    <h2 class="heading-main">내 소식</h2>

    <div
      v-if="isSubscriptionExists"
      class="group-link"
    >
      <a
        href="javascript:void(0);"
        class="link"
        @click="callSectionMainMore"
      >
        {{ tab.title }} 더보기
      </a>
    </div>

    <ul
      v-if="isSubscriptionExists && contents.length > 0"
      class="main-text__list"
    >
      <li
        v-for="(content, index) of contents"
        class="main-text__item"
        :key="`${content.contents}-${index}`"
      >
        <a href="javascript:void(0);" @click="callHomeContent(content)">
          <span class="category ">{{ content.titlePoint }}</span>
          <!-- 
          <span class="category " :class="{'secret': content.boardType === 'SECRET'}">{{ content.titlePoint }}</span>
          -->
          <span class="heading" :inner-html.prop="getReplaceContentTitle(content)"></span>
        </a>
      </li>
    </ul>

    <div
      v-else-if="!isSubscriptionExists"
      class="nodata"
    >
      <p>나의 학교/클래스를 구독하고<br>다양한 소식을 받아보세요.</p>
      <div class="group-link">
        <a href="javascript:void(0);" class="link" @click="openSearchLayer">학교/클래스 찾기</a>
      </div>
    </div>

  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import {eventBus} from "@/main";

export default {
  name: "main-body-home-my-news",
  data() {
    return {
      params: {
        sectionType: 'TAB'
      },
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      isSubscriptionExists: 'isSubscriptionExists'
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
    tabs() {
      return this.section.tabs ? this.section.tabs.filter(tab => tab.isFeedType) : []
    },
    tab() {
      return this.tabs.length > 0 ? this.tabs[0] : {}
    },
    contents() {
      return this.tab.contents || []
    }
  },
  watch: {
    contents(val) {
      if (val.length > 0)
        this.setSectionMainMoreSectionId({ sectionId: this.tab.sectionId })
    }
  },
  created() {},
  mounted() {},
  methods: {
    ...mapMutations('storeHome', ['setSectionMainMoreSectionId']),
    ...mapActions(['triggerAnalyticsLogEvent']),
    ...mapActions('storeHome', ['callHomeContentsLink']),
    openSearchLayer() {
      const searchType = 'class_school'
      const path = '/main/search'
      const query = { searchType }
      this.$router.push({ path, query }, () => {})
    },
    callHomeContent(content) {
      this.triggerAnalyticsLogEvent({ code: 'analytics.home.myNews.item.click' })
      this.callHomeContentsLink(content)
    },
    callSectionMainMore() {
      this.triggerAnalyticsLogEvent({ code: 'analytics.home.myNews.more.click' })
      this.$router.push('/main/myboard/news', () => {})
    },
    getReplaceContentTitle(content) {
      let title = content.title
      if(content.postType === "NOTE" && !title === true) {
        return this.$moment(content.insertedTimestamp).format(`M월 D일 (ddd) ${content.titlePoint}`)
      }
      return title ? title.replaceAll('>', '&gt;').replaceAll('<', '&lt;') : title
    }
  }
}
</script>

<style scoped>

</style>