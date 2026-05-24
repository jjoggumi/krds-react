<!--
@File(Method): MobileHelpFaq.vue
@Date Created: -
@Description: 자주 묻는 질문
@Modified: 2024-12-17 - #70648 자주 묻는 질문 > 검색 및 카테고리 컴포넌트 분기
-->

<template>
  <div class="faq-wrap">
    <div class="m-wrap">
      <!-- #70648 header 추가 -->
      <header class="m-header">
        <HiButton class="m-btn-left" color="link" @click="showMain">
          <HiIcon name="ico-prev" size="24" class="p-05"/>
        </HiButton>
        <h1>자주 묻는 질문</h1>
      </header>
      <div class="m-container">
        <!-- #70648 카테고리 컴포넌트 -->
        <div class="m-search-area">
          <div class="m-top-search">
            <input
              ref="search"
              type="search"
              placeholder="궁금한 점을 검색해보세요"
              v-model="searchForm._keyword"
              @keyup="e => setSearchKeyword(e.target.value)"
              @keydown.enter.prevent.stop="getSearch()"
            />
            <button              
              class="m-btn-search"
              @click="getSearch()"
            >
              검색
            </button>
            <!-- <button v-else class="m-btn-delete-c" @click="setInit()">삭제</button> -->
            <HiButton v-if="searchForm._keyword" color="link" @click="setInit()" title="삭제" class="m-btn-delete">
              <HiIcon name="ico-close3" color="white" bgColor="default" size="10" rounded="rounded"/>
            </HiButton>
          </div>
        </div>
        <div :class="['m-category-area', { fixed: isFixed }]" v-if="!option.isSearchResult" >   
          <div class="tit">질문유형</div> 
          <div class="m-category-wrap">
            <mobile-help-search-and-category 
            :items="items" 
            :option="option" 
            @setInit="setInit"
            @setFaqCategoriId="setFaqCategoriId"
            />
          </div>
        </div>
        <!-- #70648 카테고리 컴포넌트 분기 전   
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
        </div> -->

        <div class="m-area-list">
          <div class="faq-category-answer-wrap">
            <div
              class="faq-category-answer"
              :class="{ on: true }"
            >
              <div class="accordion-wrap" >
                <transition-group
                  name="accordion-item-fade"
                  tag="div"
                  class="accordion-list"
                >

                <div
                  class="accordion-item"
                  v-for="(item, i) of items.faqs"
                  :class="{ on: item.currentId === option.faqCurrentId }"
                  :key="item.currentId"
                  @click="setFaqId(item.currentId)"
                  :style="{ transitionDelay: `${i * 0.1}s` }" 
                >
                  <div class="accordion-title-wrap">
                    <div class="title-wrap">
                      <!-- #70648 검색결과 total count 삭제
                      <div class="title-num-wrap">
                        <table-column-index :total="items.faqsLimit" :index="i" />
                      </div> -->
                      <div class="title-text-wrap">{{ item.faqTitle }}</div>
                    </div>
                    <div class="accordion-oc-btn-wrap">
                      <button></button>
                    </div>
                  </div>
                  <div
                    class="accordion-cont-wrap"
                    :style="{
                        height: item.currentId === option.faqCurrentId
                          ? contentHeights[item.currentId] + 'px'
                          : '0px',
                      }"
                      :ref="'accordion-' + item.currentId"
                  >
                  <!-- <div
                    v-if="item.currentId === option.faqCurrentId"
                    class="accordion-cont-wrap"
                  > -->
                    <div class="accordion-cont-inner">
                      <div
                        class="accordion-cont"
                        v-autolinker:[$className]="item.faqContent"
                     ></div>
                    </div>
                  </div>
                </div>  
                </transition-group>              
              </div>
            </div>
          </div>
          <!-- #70648 검색결과 nodata 추가 -->
          <div class="hi-nodata" v-if="items.requested && items.faqs.length === 0">            
            <p class="strong">'{{searchForm._keyword}}' 검색결과</p>
            <p>검색 결과가 없습니다.</p>
            <p>다른 키워드로 다시 검색해보세요.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TableColumnIndex from '@/components/TableColumns/TableColumnIndex.vue'
import MobileHelpSearchAndCategory from './MobileHelpSearchAndCategory.vue';
import {mapActions} from "vuex";

export default {
  name: 'mobile-help-faq',
  components: {
    TableColumnIndex, 
    MobileHelpSearchAndCategory //#70648 카테고리 컴포넌트
  },
  props: {
    parent: {
      type: Object,
      default: null
    }
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
        _keyword: '',
        _used: true,
        page: parseInt(process.env.VUE_APP_BASE_PAGE_START, 10),
        size: 100,
        sort: 'priority,desc'
      },
      items: {
        requested: false,
        categories: [],
        faqs: [],
        faqsLimit: 0
      },
      readFaqIds: [],
      
      isFixed: false,
      contentHeights: {},// 각 accordion의 높이 저장
      scrollTimeout: null, // 스크롤 디바운스용
      isScrolling: false, // 프로그래밍 방식 스크롤 중인지 여부
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
    this.items.requested = false
    this.getFaqCategories()

    const scrollTarget = this.$el.querySelector('.m-container');
    if (scrollTarget) {
      scrollTarget.addEventListener("scroll", this.handleScroll);
    }

    this.updateAccordionHeight(); // 처음 로드 시 높이 설정
  },
  beforeDestroy() {
    const scrollTarget = this.$el.querySelector('.m-container');
    if (scrollTarget) {
      scrollTarget.addEventListener("scroll", this.handleScroll);
    }
  },
  methods: {
    ...mapActions({
      increaseHelpFaqsReadCount: 'increaseHelpFaqsReadCount',
    }),
    showMain() {
      if (this.parent) {
        this.parent.back()
      } else {
        this.$emit('close')
      }
    },
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
      this.$refs.search.blur()
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
          this.option.isSearchResult = false
          if ((this.searchForm._keyword || null) != null) {
            this.option.isSearchResult = true
          }
          this.items.requested = true
        })
        .catch(err => {
          this.$log.debug(this.$options.name, ' getFaqList() error => ', err)
        })
    },
    async setFaqCategoriId(item) {
      await this.$comn.asyncWaitFor(() => this.items.categories.length > 0)
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
      this.updateAccordionHeight(); // 높이 업데이트
      
      // 아코디언이 열린 경우 스크롤 위치 조정
      if (this.option.faqCurrentId === currentId) {
        this.$nextTick(() => {
          this.scrollToFaq(currentId);
        });
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
    setFocus() {
      this.$refs.search.focus()
    },    
    handleScroll() {
      // 프로그래밍 방식 스크롤 중에는 무시
      if (this.isScrolling) return;
      
      const scrollTarget = this.$el.querySelector('.m-container');
      if (!scrollTarget) return;
      
      const scrollTop = scrollTarget.scrollTop;
      
      // 히스테리시스 적용: 올라갈 때와 내려갈 때 다른 임계값 사용
      // 내려가면서 fixed 되는 시점: 110px
      // 올라가면서 fixed 해제되는 시점: 90px
      if (!this.isFixed && scrollTop > 110) {
        this.isFixed = true;
      } else if (this.isFixed && scrollTop < 90) {
        this.isFixed = false;
      }
    },
    updateAccordionHeight() {
      this.$nextTick(() => {
        this.items.faqs.forEach((item) => {
          const refs = this.$refs[`accordion-${item.currentId}`];
          const element = Array.isArray(refs) ? refs[0] : refs;
          if (element) {
            this.$set(this.contentHeights, item.currentId, element.scrollHeight);
          }
        });
      });
    },
    scrollToFaq(currentId) {
      this.$nextTick(() => {
        const container = this.$el.querySelector('.m-container');
        const element = this.$el.querySelector(`#faq-item-${currentId}`);
        
        if (!container || !element) return;

        // 프로그래밍 방식 스크롤 시작
        this.isScrolling = true;

        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        // 동적으로 오프셋 계산
        const header = document.querySelector('.m-header');
        const categoryWrap = document.querySelector('.m-category-wrap');
        const bottomButtons = document.querySelector('.m-btns, .m-btn-send, .m-new-write');
        
        const headerHeight = header ? header.offsetHeight : 52;
        const categoryHeight = (categoryWrap && this.isFixed) ? categoryWrap.offsetHeight : 0;
        const footerHeight = bottomButtons ? bottomButtons.offsetHeight : 72;

        const topOffset = headerHeight + categoryHeight;
        const bottomOffset = footerHeight;

        // 컨테이너 기준 가시 영역
        const viewTop = containerRect.top + topOffset;
        const viewBottom = containerRect.bottom - bottomOffset;

        // fixed 경계 근처(90~110px) 체크
        const isNearFixedBoundary = container.scrollTop >= 80 && container.scrollTop <= 120;

        // 요소가 하단을 벗어나는 경우
        if (elementRect.bottom > viewBottom) {
          const scrollAmount = elementRect.bottom - viewBottom;
          let targetScroll = container.scrollTop + scrollAmount + 20; // 여유 20px
          
          // fixed 경계 근처라면 임계값을 넘기도록 조정
          if (isNearFixedBoundary && targetScroll < 130) {
            targetScroll = Math.max(targetScroll, 130); // fixed 상태로 확실히 전환
          }
          
          container.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });

          // 안드로이드 webview 대응: 레이아웃 안정화 후 재조정
          setTimeout(() => {
            const maxScroll = container.scrollHeight - container.clientHeight;
            if (container.scrollTop > maxScroll) {
              container.scrollTop = maxScroll;
            }
            
            // 추가: 경계 케이스 대응 - 스크롤이 거의 끝에 가까우면 강제로 끝까지
            if (container.scrollTop > maxScroll - 50) {
              container.scrollTop = maxScroll;
            }
            
            // 프로그래밍 방식 스크롤 종료
            this.isScrolling = false;
          }, 300); // 타이밍 증가
        }
        // 요소가 상단을 벗어나는 경우
        else if (elementRect.top < viewTop) {
          const scrollAmount = viewTop - elementRect.top;
          let targetScroll = container.scrollTop - scrollAmount - 10;
          
          // fixed 경계 근처에서 위로 스크롤할 때는 경계를 벗어나도록
          if (isNearFixedBoundary && targetScroll > 80) {
            targetScroll = Math.min(targetScroll, 80); // fixed 해제 상태로 확실히 전환
          }
          
          container.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: 'smooth'
          });

          setTimeout(() => {
            const maxScroll = container.scrollHeight - container.clientHeight;
            if (container.scrollTop > maxScroll) {
              container.scrollTop = maxScroll;
            }
            
            // 프로그래밍 방식 스크롤 종료
            this.isScrolling = false;
          }, 300);
        } else {
          // 스크롤 필요 없는 경우
          this.isScrolling = false;
        }
      });
    },
    setSearchKeyword(keyword) {
      this.searchForm._keyword = keyword;
    }
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

.accordion-item-fade-enter{
  opacity: 0;
  transform: translateY(5px);
}
.accordion-item-fade-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.accordion-item-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.accordion-item-fade-leave-active {transition-delay: 0s !important;}
</style>
