<template>
  <div class="m-wrap version-1">
    <!-- ::end.header-->
    <div class="m-container">
      <div class="m-search-area">
        <div class="m-top-search">
          <input
            type="search"
            placeholder="검색"
            v-model="searchForm._keyword"
            @keydown.enter.prevent.stop="getSearch()"
          />
          <button
            v-if="!option.isSearchResult"
            class="m-btn-search"
            @click="getSearch()"
          >
            검색
          </button>
          <button v-else class="m-btn-delete-c" @click="setInit()">삭제</button>
        </div>
      </div>

      <div
        v-if="!option.isSearchResult"
        class="m-tab-box"
      >
        <ul class="m-tab-half">
          <li
            v-for="item of items.categories"
            :key="item.currentId"
            :class="{ selected: item.currentId === option.faqCategoriCurrentId }"
            @click="setFaqCategoriId(item)"
          >
            <span>{{ item.categoryTitle }}</span>
          </li>
        </ul>
      </div>

      <div
        v-if="option.isSearchResult"
        class="m-total-result"
      >
        <p>
          <span class="m-ft-blue">{{ items.faqsLimit }}개</span>의 검색 결과
        </p>
      </div>

      <div class="m-area-list">
        <div class="faq-category-answer-wrap mt-30">
          <div
            class="faq-category-answer"
            :class="{ on: true }"
          >
            <div class="accordion-wrap boundary-box">
              <div
                class="accordion-item"
                v-for="(item, i) of items.faqs"
                :class="{ on: item.currentId === option.faqCurrentId }"
                :key="item.currentId"
                @click="setFaqId(item.currentId)"
              >
                <div class="accordion-title-wrap">
                  <div class="title-wrap">
                    <div class="title-num-wrap">
                      <table-column-index :total="items.faqsLimit" :index="i" />
                    </div>
                    <div class="title-text-wrap">{{ item.faqTitle }}</div>
                  </div>
                  <div class="accordion-oc-btn-wrap">
                    <button></button>
                  </div>
                </div>
                <div
                  v-if="item.currentId === option.faqCurrentId"
                  class="accordion-cont-wrap"
                >
                  <div class="accordion-cont-inner">
                    <div
                      class="accordion-cont"
                      v-autolinker:[$className]="item.faqContent"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TableColumnIndex from '@/components/TableColumns/TableColumnIndex.vue'
import {mapActions} from "vuex";

export default {
  name: 'mobile-help-faq',
  components: {
    TableColumnIndex
  },
  data() {
    return {
      option: {
        faqCategoriCurrentId: '',
        faqCurrentId: '',
        isSearchResult: false
      },
      label: {
        searchResult: ''
      },
      searchForm: {
        _userType: this.$route.query.userType || 'TEACHER',
        _helpFaqCategory: null,
        _keyword: null,
        _used: true,
        page: parseInt(process.env.VUE_APP_BASE_PAGE_START, 10),
        size: 100,
        sort: 'priority,desc'
      },
      items: {
        categories: [],
        faqs: [],
        faqsLimit: 0
      },
      readFaqIds: [],      
      autolist: [] // #70486 자동완성 제안 목록
    }
  },
  computed: {},
  watch: {
    'option.faqCurrentId'(val) {
      if (val && !this.readFaqIds.includes(val)) {
        this.$log.debug(this.$options.name, 'option.faqCurrentId', val)
        const faqId = val
        this.increaseHelpFaqsReadCount({ faqId })
        this.readFaqIds.push(val)
      }
    },
  },
  mounted() {
    this.getFaqCategories()
  },
  methods: {
    ...mapActions({
      increaseHelpFaqsReadCount: 'increaseHelpFaqsReadCount',
    }),
    getFaqCategories() {
      const keys = ['uuid', 'idToken', 'refreshToken']
      this.setQuery(keys)

      this.$hiClass.helpFaqCategories
        .search({
          _used: true,
          size: 100
        })
        .then(res => {
          this.items.categories = res.data._embedded.helpFaqCategories || []
          const item = this.items.categories[0]
          this.option.faqCategoriCurrentId = item.currentId || 0
          this.searchForm._helpFaqCategory = item._links.self.href

          this.getFaqList()
        })
        .catch(err => {
          this.$log.debug(
            this.$options.name,
            ' getFaqCategories() error => ',
            err
          )
        })
    },
    getFaqList() {
      this.$hiClass.helpFaqs
        .search(this.searchForm)
        .then(res => {
          this.items.faqs = []
          res.data._embedded.helpFaqs.map(item => {
            if (item.helpFaqCategory.used) {
              this.items.faqs.push(item)
            }
          })
          this.items.faqsLimit = this.items.faqs.length || 0
          // this.items.faqs = res.data._embedded.helpFaqs || []
          // this.items.faqsLimit = res.data.page.totalElements || 0

          this.option.isSearchResult = false
          if ((this.searchForm._keyword || null) != null) {
            this.option.isSearchResult = true
            //this.label.searchResult = `‘${this.searchForm._keyword}’ 검색 결과 총 ${this.items.faqsLimit}건`
          }
        })
        .catch(err => {
          this.$log.debug(this.$options.name, ' getFaqList() error => ', err)
        })
    },
    setFaqCategoriId(item) {
      this.option.faqCategoriCurrentId = item.currentId
      this.option.faqCurrentId = ''
      this.searchForm._keyword = null
      this.searchForm._helpFaqCategory = item._links.self.href
      this.getFaqList()
    },
    setFaqId(currentId) {
      if (this.option.faqCurrentId === currentId) {
        this.option.faqCurrentId = ''
      } else {
        this.option.faqCurrentId = currentId
      }
    },
    getSearch() {
      this.option.faqCategoriCurrentId = ''
      this.option.faqCurrentId = ''
      this.searchForm._helpFaqCategory = null

      this.getFaqList()
    },
    setInit() {
      const item = this.items.categories[0]
      this.option.faqCategoriCurrentId = item.currentId || 0
      this.searchForm._helpFaqCategory = item._links.self.href
      this.searchForm._keyword = null

      this.getFaqList()
    },
    setQuery(keys) {
      for (const key of keys) {
        if (this.$route.query[key] !== undefined)
          localStorage.setItem(key, this.$route.query[key])
      }
    },   
    // #70486 자동완성 제안목록 업데이트
    updateAutolist() {    
      const keywords = ['검색어1', '검색어2', '검색어3'];
      this.autolist = keywords.filter(keyword => keyword.includes(this.searchForm._keyword));
    },
    // #70486 자동완성 제안목록 클릭 함수
    selectAutolist(autolist) {
      this.searchForm._keyword = autolist;
      this.autolist = [];
      this.getSearch();
    },
  }
}
</script>
<style scoped>
input::-ms-clear,
input::-ms-reveal{
	display:none;width:0;height:0;
}
input::-webkit-search-decoration,
input::-webkit-search-cancel-button,
input::-webkit-search-results-button,
input::-webkit-search-results-decoration {
	display:none;
}
</style>
