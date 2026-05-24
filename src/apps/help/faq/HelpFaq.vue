<template>
  <div class="right-cont-wrap">
    <div class="contetns-title-wrap">
      <div class="title">{{ $t('help.faq.title') }}</div>
    </div>
    <div class="customer-faq-cont-wrap">
      <div class="faq-search-wrap">
        <div class="input-box-wrap round-search-box search-box-wrap">
          <input
            type="text"
            placeholder="검색"
            v-model="searchForm._keyword"
            @keydown.enter.prevent.stop="getSearch()"
          />
          <button class="search-btn" @click="getSearch()"></button>
          <button class="input-text-delete-btn"></button>
        </div>
      </div>
      <!-- on 추가시 검색 텍스트 보임 -->
      <div
        v-if="option.isSearchResult"
        class="faq-search-result"
        :class="{ on: true }"
      >
        {{ label.searchResult }}
      </div>
      <div class="faq-select-category-wrap">
        <ul class="clfix">
          <li
            v-for="item of items.categories"
            :class="{ on: item.currentId === option.tabIndex }"
            :key="item.currentId"
            @click="setFaqCategoriId(item)"
          >
            <span>{{ item.categoryTitle }}</span>
          </li>
        </ul>
      </div>
      <div class="faq-category-answer-wrap mt-30">
        <div class="faq-category-answer on">
          <div class="accordion-wrap boundary-box">
            <div
              v-for="(item, i) of items.faqs"
              class="accordion-item"
              :class="{ on: item.currentId === option.itemIndex }"
              :key="item.currentId"
            >
              <div
                class="accordion-title-wrap"
                @click="setFaqId(item.currentId)"
              >
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

              <transition name="slide-fade">
                <div
                  v-if="item.currentId === option.itemIndex"
                  class="accordion-cont-wrap"
                >
                  <div class="accordion-cont-inner">
                    <div class="accordion-cont" v-html="item.faqContent"></div>
                  </div>
                </div>
              </transition>
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
  name: 'help-faq',
  components: {
    TableColumnIndex
  },
  props: {
    isLogin: Boolean
  },
  data: () => ({
    option: {
      tabIndex: 0,
      itemIndex: '',
      isSearchResult: false
    },
    label: {
      searchResult: ''
    },
    searchForm: {
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
  }),
  computed: {
    currentFaqId() {
      return this.option.itemIndex
    }
  },
  watch: {
    currentFaqId(val) {
      if (val && !this.readFaqIds.includes(val)) {
        this.$log.debug(this.$options.name, 'currentFaqId', val)
        const faqId = val
        this.increaseHelpFaqsReadCount({ faqId })
        this.readFaqIds.push(val)
      }
    },
  },
  created() {
    if (!this.isLogin) {
      alert('권한이 없습니다.')
      this.$router.push('/', () => {})
    }
  },
  async mounted() {
    await this.getFaqCategories()

    if (this.$route.query.category) {
      const item = this.items.categories.find(c => c.categoryTitle === this.$route.query.category);
      this.setFaqCategoriId(item);
    }
  },
  methods: {
    ...mapActions({
      increaseHelpFaqsReadCount: 'increaseHelpFaqsReadCount',
    }),
    setFaqCategoriId(item) {
      this.option.tabIndex = item.currentId
      this.option.itemIndex = ''
      this.searchForm._keyword = null
      this.searchForm._helpFaqCategory = item._links.self.href
      this.getFaqList()
    },
    setFaqId(currentId) {
      if (this.option.itemIndex === currentId) {
        this.option.itemIndex = ''
      } else {
        this.option.itemIndex = currentId
      }
    },
    getSearch() {
      this.option.tabIndex = 0
      this.option.itemIndex = ''
      this.searchForm._helpFaqCategory = null

      this.getFaqList()
    },
    async getFaqCategories() {
      await this.$hiClass.helpFaqCategories
        .search({
          _used: true,
          size: 100
        })
        .then(res => {
          this.items.categories = res.data._embedded.helpFaqCategories || []
          if (this.option.tabIndex === 0) {
            const item = this.items.categories[0]
            this.option.tabIndex = item.currentId || 0
            this.searchForm._helpFaqCategory = item._links.self.href
          }

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
            this.label.searchResult = `‘${this.searchForm._keyword}’ 검색 결과 총 ${this.items.faqsLimit}건`
          }
        })
        .catch(err => {
          this.$log.debug(this.$options.name, ' getFaqList() error => ', err)
        })
    }
  }
}
</script>

<style>
/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>
