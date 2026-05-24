<template>
  <div>
    <main-body-schools-body-school-board-header-title
      :post-type="curForm"
    />

    <!-- 고정 필터 (탭 그룹, 게시글 검색) -->
    <main-body-schools-body-school-board-header-filter
      v-if="showPostSearchInSchool"
    />

    <!-- 게시글 키워드 검색 결과 -->
    <main-body-schools-body-school-board-header-search-result
      v-if="isVisibleSearchResult"
    />

    <!-- 게시글 목록 (리스트) -->
    <main-body-schools-body-school-board-school-posts
      v-if="isVisiblePosts"
      :cur-form="curForm"
    />

    <!-- 게시글 목록 (리스트) 없음 -->
    <main-body-schools-body-item-empty
      v-if="isVisiblePosts && isCurSchoolsPostsEmpty"
      :isFirst="true"
    />

    <!-- 무한스크롤 목록 요청 로딩 -->
    <main-loading-scroll v-if="infiniteScroll.isBusy" />
  </div>

</template>

<script>
import {mapGetters, mapState} from "vuex";
import {eventBus} from "@/main";

import MainBodySchoolsBodySchoolBoardSchoolPosts from "@/apps/main/schools/MainBodySchoolsBodySchoolBoardSchoolPosts";
import MainBodySchoolsBodySchoolBoardHeaderTitle from "@/apps/main/schools/MainBodySchoolsBodySchoolBoardHeaderTitle";
import MainBodySchoolsBodySchoolBoardHeaderFilter from "@/apps/main/schools/MainBodySchoolsBodySchoolBoardHeaderFilter";
import MainBodySchoolsBodyItemEmpty from "@/apps/main/schools/MainBodySchoolsBodyItemEmpty";
import MainBodySchoolsBodySchoolBoardHeaderSearchResult
  from "@/apps/main/schools/MainBodySchoolsBodySchoolBoardHeaderSearchResult";
import MainLoadingScroll from "@/apps/main/MainLoadingScroll";

export default {
  name: "main-body-schools-body-school-board",
  components: {
    MainLoadingScroll,
    MainBodySchoolsBodySchoolBoardHeaderSearchResult,
    MainBodySchoolsBodyItemEmpty,
    MainBodySchoolsBodySchoolBoardHeaderFilter,
    MainBodySchoolsBodySchoolBoardHeaderTitle,
    MainBodySchoolsBodySchoolBoardSchoolPosts
  },
  props: {
    curForm: {
      type: String
    },
  },
  data() {
    return {
      initializedSearchQueryString: null,
      searchQueryStringRefreshCount: 0
    }
  },
  computed: {
    ...mapState({
      curSchoolsPosts: 'curSchoolsPosts',
      curSchoolSearchQuery: 'curSchoolSearchQuery',
      infiniteScroll: 'infiniteScroll',
      versionData: 'versionData'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    isCurSchoolsPostsEmpty() {
      return Array.isArray(this.curSchoolsPosts)
        && this.curSchoolsPosts.length === 0
    },
    isVisiblePosts() {
      return this.initializedSearchQueryString === this.curSchoolSearchQueryString
    },
    isVisibleSearchResult() {
      return this.existsKeyword
    },
    existsKeyword() {
      return !!(this.curSchoolSearchQuery.keyword)
    },
    curSchoolSearchQueryString() {
      return this.$qs.stringify(this.curSchoolSearchQuery)
        + this.searchQueryStringRefreshCount
    },
    showPostSearchInSchool() {
      if (this.versionData.web.showPostSearchInSchool === undefined) {
        return true;
      }
      return this.versionData.web.showPostSearchInSchool;
    }
  },
  created() {
    this.setInitializedSearchQueryString()
  },
  mounted() {
    eventBus.$on('refresh-school-board-posts', () => {
      this.searchQueryStringRefreshCount++
      this.$nextTick(() => this.setInitializedSearchQueryString())
    })
  },
  beforeDestroy() {
    eventBus.$off('refresh-school-board-posts')
  },
  methods: {
    setInitializedSearchQueryString() {
      this.initializedSearchQueryString
        = this.$qs.stringify(this.curSchoolSearchQuery) + this.searchQueryStringRefreshCount
    }

  }
}
</script>

<style scoped>

</style>