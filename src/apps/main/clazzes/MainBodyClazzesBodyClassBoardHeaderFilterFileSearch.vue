.<template>
  <div
    class="hi-searchbox"
    :class="{
      'is-active': focus.keyword  // 포커스 처리
    }"
  >
    <div class="searchbox__input">
      <input
        ref="searchQueryKeyword"
        type="text"
        placeholder="파일명 검색"
        maxlength="100"
        v-model="searchQuery.keyword"
        @focus="focus.keyword = true"
        @blur="focus.keyword = false"
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
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";

export default {
  name: "main-body-clazzes-body-class-board-header-filter-file-search",
  data() {
    return {
      // 요청 딜레이 flag
      isBusy: false,
      focus: {
        keyword: false,
      },
      searchQuery: {
        // 검색엔진 키워드 검색 (파일명)
        keyword: null
      },
      // 이전 query 요청
      prevSearchQuery: null
    }
  },
  computed: {
    ...mapState({
      curClassPostFileSearchQuery: 'curClassPostFileSearchQuery'
    }),
  },
  watch: {
    'curClassPostFileSearchQuery.keyword'(val) {
      this.$log.warn('curClassPostFileSearchQuery.keyword', val)
      if (!val) {
        this.searchQuery.keyword = null
      }
    }
  },
  beforeDestroy() {
    this.setCurClassPostFileSearchQueryAttr({
      keyword: null
    })
  },
  methods: {
    ...mapMutations({
      setInfiniteScroll: 'setInfiniteScroll',
      setCurClassPostFileSearchQueryAttr: 'setCurClassPostFileSearchQueryAttr',
    }),
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    // duplicatedSearchQuery() {
    //   return _.isEqual(this.prevSearchQuery, this.searchQuery)
    // },
    doSearchByKeyword() {
      // 이미 검색한 query 인 경우 검색 중단
      // if (this.duplicatedSearchQuery()) return false

      if (!this.isBusy) {
        this.isBusy = true

        this.setInfiniteScroll({
          isListEnd: false,
          page: 0,
        })
        this.setCurClassPostFileSearchQueryAttr({
          keyword: this.searchQuery.keyword
        })

        // 선택한 체크박스 초기화
        // this.checkBoxes.splice(0)

        this.$nextTick(() => {
          eventBus.$emit('get-cur-post-files', true)
        })

        setTimeout(() => { this.isBusy = false }, 300)
      }
    },

    async setSearchQuery() {
      if (!this.isBusy) {
        this.isBusy = true

        // 검색 결과 페이지 초기화
        this.setInfiniteScroll({
          isListEnd: false,
          page: 0,
        })

        // 검색어에 불필요한 좌우 공백 제거
        this.searchQuery.keyword =
          this.searchQuery.keyword ? this.searchQuery.keyword.trim() : null

        // vuex store 에 query 저장
        this.setCurClassPostFileSearchQueryAttr({
          keyword: this.searchQuery.keyword
        })

        // 선택한 체크박스 초기화
        eventBus.$emit('clear-check-boxes')

        // 검색 query 요청
        this.$nextTick(() => {
          eventBus.$emit('get-cur-post-files', true)
        })

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
    onClickSearchButton() {
      this.triggerAnalyticsLogEvent({ code: 'analytics.class.click.button.search' });
      this.setSearchQuery()
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
.board__filter .hi-searchbox { width: 252px; }
</style>