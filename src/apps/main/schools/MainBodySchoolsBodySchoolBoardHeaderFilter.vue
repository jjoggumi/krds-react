<template>
  <div
    class="board__filter board__filter-fixed"
    :class="[ { 'is-fixed': getIsFixed() } ]"
  >
    <div class="filter-fixed__area">
      <div class="filter-fixed__inner">
        <div
          class="hi-searchbox"
          :class="{
            'is-active': focus.keyword  // 포커스 처리
          }"
        >

          <!-- TODO: 검색 옵션 추가
          <div class="searchbox__select">
            <button class="selected">전체</button>
            <div class="option__layer">
              <button>전체</button>
              <button>작성자</button>
              <button>작성일</button>
            </div>
          </div>
          -->

          <div class="searchbox__input">
            <input
              ref="searchQueryKeyword"
              type="text"
              placeholder="게시글 검색"
              maxlength="100"
              @focus="focus.keyword = true"
              @blur="focus.keyword = false"
              v-model="searchQuery.keyword"
              @keyup.enter="setSearchQuery"
            >
            <button
              v-if="searchQuery.keyword"
              class="btn-delete"
              @click="clearSearchQueryKeyword"
            ></button>
            <button
              class="btn-search"
              @click="onClickSearchButton"
            ></button>
          </div>

        </div>

      </div>
    </div>

  </div>

</template>

<script>
import {eventBus} from "@/main";
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";

export default {
  name: "main-body-schools-body-school-board-header-filter",
  data() {
    return {
      // 요청 딜레이 flag
      isBusy: false,
      focus: {
        keyword: false,
      },
      searchQuery: {
        // 검색엔진 키워드 검색 (제목,내용,파일명)
        keyword: null,
        // 검색엔진 키워드 검색 댓글 포함 여부 default:true (댓글내용,파일명)
        // keywordCommentUsed: false,
        // 검색엔진 작성자 아이디로 조회
        // insertedUser: null,
        // 검색엔진 게시일로 조회
        // dayOfPosted: null
      },
      // 이전 query 요청
      prevSearchQuery: null
    }
  },
  computed: {
    ...mapState({
      curSchoolSearchQuery: 'curSchoolSearchQuery',
      curClassTabCode: 'curClassTabCode',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      getIsFixed: 'getIsFixed',
    }),
  },
  methods: {
    ...mapMutations({
      setCurSchoolSearchQueryAttr: 'setCurSchoolSearchQueryAttr',
    }),
    ...mapActions({
      initCurSchoolSearchQuery: 'initCurSchoolSearchQuery',
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    onClickSearchButton() {
      this.triggerAnalyticsLogEvent({ code: 'analytics.class.click.button.search' });
      this.setSearchQuery()
    },
    async setSearchQuery() {
      // 이미 검색한 query 인 경우 검색 중단
      // if (this.duplicatedSearchQuery()) return false

      if (!this.isBusy) {
        this.isBusy = true

        // 기존 필터 초기화
        this.initCurSchoolSearchQuery()

        // 검색어에 불필요한 좌우 공백 제거
        this.searchQuery.keyword =
          this.searchQuery.keyword ? this.searchQuery.keyword.trim() : null

        // vuex store 에 query 저장
        this.setCurSchoolSearchQueryAttr({
          keyword: this.searchQuery.keyword,
        })

        // 게시글 목록만 new query 로 새로고침
        eventBus.$emit('refresh-school-board-posts')

        // 요청한 query 임시 저장
        this.prevSearchQuery = Object.assign({}, this.searchQuery)

        // 검색 딜레이 300ms 후 초기화
        setTimeout(() => {
          this.isBusy = false

          // 최상단으로 이동
          this.$hiClass.documentBodyScrollToTop(this)
        }, 300)
      }
    },
    clearSearchQueryKeyword() {
      this.searchQuery.keyword = null
      this.focusSearchQueryKeyword()
    },
    focusSearchQueryKeyword() {
      if (this.$refs.searchQueryKeyword)
        this.$refs.searchQueryKeyword.focus()
    },
  }
}
</script>

<style scoped>

</style>