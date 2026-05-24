<template>
  <div class="cont-box-inner clfix">
    <banner-item
      :key="$store.state.bannerTimestamp"
      positionType="WEB_BANNER_QUICK"
      :banners="$store.state.banner.WEB_BANNER_QUICK"
    />

    <div class="join-class-cont-wrap">
      <!-- 검색페이지 타이틀-->
      <div class="contetns-title-wrap">
        <div class="title">{{ searchType === 'post' ? '통합검색' : '클래스/학교 찾기' }}</div>
      </div>
      <!-- 검색페이지 타이틀-->

      <!-- 검색어 input-->
      <div class="new-search-wrap">
        <hc-input-search-box
          :key="`hc-input-search-box-${$route.query.searchKeyword || $route.query.searchDate}`"
          ref="inputSearchBox"
          :searchKeyword.sync="searchKeyword"
          :isNavSearchBar="false"
        />
      </div>
      <!-- 검색어 input-->

      <!-- 검색결과 문구-->
      <div
          v-if="(searchType === 'class_school' && $route.query.searchKeyword) || searchType === 'post'"
          class="search-result-count-2"
      >
        <template v-if="$route.query.searchKeyword">
          <span>{{ $route.query.searchKeyword }}</span>{{ searchType === 'post' ? ` 검색 결과` : ` 검색 결과 총 ${totalCount}건` }}
        </template>
        <template v-else-if="$route.query.searchDate">
          <span>{{ $moment($route.query.searchDate).format('YYYY년 MM월 DD일') }}</span>
          <span class="text-blue"> 에 작성한 게시글</span> 검색 결과
        </template>
      </div>
      <!-- 검색결과 문구-->

      <!-- 통합검색 검색 필터-->
      <div class="search-filter-container" v-if="$route.query.searchType === 'post'">
        <div class="input-button-wrap">
          <button class="filter-btn" :class="{'on': searchPosts.requestParams.searchScope === null}" @click="setSearchScope(null)">전체</button>
          <button class="filter-btn" :class="{'on': searchPosts.requestParams.searchScope === 'school'}" @click="setSearchScope('school')">학교</button>
          <button class="filter-btn" :class="{'on': searchPosts.requestParams.searchScope === 'class'}" @click="setSearchScope('class')">클래스</button>
        </div>
        <div class="input-radio-wrap">
          <template v-if="$route.query.searchKeyword">
            <input type="radio" name="select-sort" id="sort-related" :value="null" v-model="searchPosts.requestParams.searchSort">
            <label class="select-sort"  for="sort-related"><span>관련도 높은순</span></label>
          </template>
          <input type="radio" name="select-sort" id="sort-new" value="latest" v-model="searchPosts.requestParams.searchSort">
          <label class="select-sort"  for="sort-new"><span>최신순</span></label>
          <input type="radio" name="select-sort" id="sort-inserted" value="registration" v-model="searchPosts.requestParams.searchSort">
          <label class="select-sort"  for="sort-inserted"><span>등록순</span></label>
        </div>
      </div>
      <!-- 통합검색 검색 필터-->

      <!-- 검색결과 영역-->
      <div class="cont-wrap">
        <div class="cont-inner">
          <!-- 학교/클래스 탭-->
          <div
              v-if="searchType === 'class_school' && totalCount > 0"
              class="tab-nav-wrap"
          >
            <ul>
              <li
                  v-for="(name, i) in searchTab"
                  v-bind:key="name.currentId"
                  v-on:click="clickTab(i)"
                  v-bind:class="{ on: i === current }"
              >
                {{ name }}
                <span>({{ totalCntByTabs(i) }})</span>
              </li>
            </ul>
          </div>
          <!-- 학교/클래스 탭-->

          <!-- 통합검색 검색결과-->
          <MainPostsSearchBody
              v-if="searchType === 'post'"
              :searchPosts="searchPosts"
          />
          <!-- 통합검색 검색결과-->

          <!-- 학교/클래스 검색결과-->
          <MainSearchBody
              v-if="searchType === 'class_school'"
              :user="user"
              :isTempStudent="isTempStudent"
              :isSearch="isSearch"
              :clazzes="clazzes"
              :schools="schools"
              :count="count"
              :showBytab="showBytab"
              :paging="paging"
              @updateClazzes="updateClazzes"
          />
          <!-- 학교/클래스 검색결과-->
        </div>
      </div>
      <!-- 검색결과 영역-->
    </div>
  </div>
</template>

<script>
import MainSearchBody from './MainSearchBody.vue'
import MainPostsSearchBody from "@/apps/main/search/MainPostsSearchBody";
import BannerItem from '../../../components/Banner/BannerItem'
import HcInputSearchBox from "@/components/Form/HcInputSearchBox";
import {mapGetters} from "vuex";

export default {
  name: 'MainSearch',
  props: ['user', 'isTempStudent'],
  data: () => ({
    isSearch: false,
    current: 0,
    searchTab: ['클래스', '학교'],
    searchKeyword: '',
    prevSearchKeyword: '',
    clazzes: [],
    schools: [],
    count: {
      clazzes: 0,
      schools: 0
    },
    paging: {
      clazzes: {
        isBusy: false,
        isListEnd: false,
        curPage: process.env.VUE_APP_BASE_PAGE_START
      },
      schools: {
        isBusy: false,
        isListEnd: false,
        curPage: process.env.VUE_APP_BASE_PAGE_START
      },
      scrollLimit: process.env.VUE_APP_BASE_INFINITE_SCROLL_DISTANCE,
      curSize: process.env.VUE_APP_BASE_PAGE_SIZE
    },
    searchType: '',
    searchPosts: {
      requestParams: {
        dayOfPosted: null,
        searchScope: null,
        searchSort: null
      },
      posts: [],
      paging: {
        number: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0
      },
      scrollOption: {
        isBusy: false,
        isSearchEnd: false,
        scrollLimit: 400
      }
    }
  }),
  components: {
    HcInputSearchBox,
    MainSearchBody,
    MainPostsSearchBody,
    BannerItem
  },
  computed: {
    ...mapGetters({
      isEmptyClassSubscriptionAndTempStudent: 'isEmptyClassSubscriptionAndTempStudent'
    }),
    showBytab: function() {
      return this.current
    },
    totalCount() {
      return this.count.clazzes + this.count.schools
    }
  },
  watch: {
    $route() {
      this.initSearchPostsPaging()
      this.setParams()
      this.doSearch()
    },
    'searchPosts.requestParams.searchSort'(newVal) {
      const path = '/main/search'
      const query = {...this.$route.query}
      if (newVal) {
        query.searchSort = newVal
      } else {
        delete query.searchSort
      }
      this.$router.replace({ path, query }, () => {})
    },
  },

  created() {
    this.setParams()
    this.doSearch()
  },
  mounted() {
    if (this.isEmptyClassSubscriptionAndTempStudent) {
      const goRouteMain = () => this.$router.push('/main', () => {})
      this.$hiClass.alert('권한이 없습니다.')
        .then(goRouteMain)
    }
    // 페이지 body 에 bg-white 스타일 지양
    // this.$hiClass.toggleBodyClass('add', 'bg-white')
  },
  beforeDestroy() {
    // this.$hiClass.toggleBodyClass('remove', 'bg-white')
  },
  methods: {
    setParams() {
      this.searchKeyword = this.$route.query.searchKeyword ? this.$route.query.searchKeyword : ''
      this.searchType = this.$route.query.searchType
      this.searchPosts.requestParams.searchSort = this.$route.query.searchSort ? this.$route.query.searchSort : null
      this.searchPosts.requestParams.searchScope = this.$route.query.searchScope ? this.$route.query.searchScope : null
      this.searchPosts.requestParams.dayOfPosted = this.$route.query.searchDate ? this.$route.query.searchDate : null
    },
    initSearchPostsPaging() {
      this.searchPosts.posts = []
      this.searchPosts.scrollOption = {
        isBusy: false,
        isSearchEnd: false,
        scrollLimit: 400
      }
      this.searchPosts.paging = {
        number: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0
      }
    },
    setSearchScope(scope) {
      this.searchPosts.requestParams.searchScope = scope

      const path = '/main/search'
      const query = {...this.$route.query}
      if (scope) {
        query.searchScope = scope
      } else {
        delete query.searchScope
      }
      this.$router.replace({ path, query }, () => {})
    },
    getSearchList() {
      if (
        this.searchKeyword === '' ||
        this.searchKeyword === undefined
      ) {
        return false
      }

      this.paging.clazzes.isBusy = true
      this.paging.schools.isBusy = true

      Promise.all([this.initReqClazz(), this.initReqSchool()])
        .then(result => {
          const clazzResult = result[0].data
          const schoolResult = result[1].data

          // *************
          // clazzResult
          // *************

          this.$log.debug(
            `${this.$options.name} getSearchList() clazzResult => `,
            clazzResult
          )

          this.clazzes.splice(0)
          this.count.clazzes = clazzResult.page.totalElements
          this.paging.clazzes.curPage = process.env.VUE_APP_BASE_PAGE_START
          this.paging.clazzes.curPage++

          if (this.paging.clazzes.curPage < clazzResult.page.totalPages) {
            this.paging.clazzes.isListEnd = false
          } else {
            this.paging.clazzes.isListEnd = true
          }
          this.paging.clazzes.isBusy = false

          if (clazzResult.page.totalElements > 0) {
            this.$nextTick(() => {
              for (const item of clazzResult._embedded.clazzes) {
                this.clazzes.push(item)
              }
            })
          }

          // *************
          // schoolResult
          // *************

          this.$log.debug(
            `${this.$options.name} getSearchList() schoolResult => `,
            schoolResult
          )

          // 배열 0번 인덱스 이후 전체 삭제
          this.schools.splice(0)
          this.count.schools = schoolResult.page.totalElements
          this.paging.schools.curPage = process.env.VUE_APP_BASE_PAGE_START
          this.paging.schools.curPage++

          if (this.paging.schools.curPage < schoolResult.page.totalPages) {
            this.paging.schools.isListEnd = false
          } else {
            this.paging.schools.isListEnd = true
          }
          this.paging.schools.isBusy = false

          if (schoolResult.page.totalElements > 0) {
            this.$nextTick(() => {
              for (const item of schoolResult._embedded.schools) {
                this.schools.push(item)
              }
            })
          }

          this.initTab()
        })
        .catch(error => {
          this.$log.debug(
            `${this.$options.name} getSearchList() error => `,
            error
          )
        })
    },
    async getSearchPosts() {
      if (this.searchPosts.scrollOption.isBusy || this.searchPosts.scrollOption.isSearchEnd) {
        return false
      }

      const requestParams = {
        page: this.searchPosts.paging.number,
        size: this.searchPosts.paging.size
      }
      if (this.$route.query.searchKeyword) {
        requestParams.keyword = this.searchKeyword
      }
      if (this.$route.query.searchDate) {
        requestParams.dayOfPosted = this.searchPosts.requestParams.dayOfPosted
      }
      if (this.$route.query.searchScope) {
        requestParams.scope = this.searchPosts.requestParams.searchScope
      }
      if (this.$route.query.searchSort) {
        requestParams.sort = this.searchPosts.requestParams.searchSort
      }

      try {
        this.searchPosts.scrollOption.isBusy = true
        const res = await this.$hiClass.postsSearch.search(requestParams)
        this.searchPosts.posts.push(...res.data._embedded.posts)
        this.searchPosts.paging = res.data.page

        if (this.searchPosts.paging.number === this.searchPosts.paging.totalPages - 1 || this.searchPosts.paging.totalPages === 0) {
          this.searchPosts.scrollOption.isSearchEnd = true
        }
        this.searchPosts.paging.number++
      } catch (e) {
        this.$log.error(e)
        this.$hiClass.alert('검색결과를 불러오지못했습니다.<br>다시 시도해주세요.')
      } finally {
        this.searchPosts.scrollOption.isBusy = false
      }
    },
    totalCntByTabs: function(index) {
      let count = 0
      if (index === 0) count = this.count.clazzes
      else if (index === 1) count = this.count.schools

      return count
    },
    clickTab(i) {
      this.current = i
      // this.initForm();
    },
    initForm() {
      this.paging.clazzes.isListEnd = false
      this.paging.clazzes.curPage = 0
      this.count.clazzes = 0
      this.clazzes.splice(0)

      this.paging.schools.isListEnd = false
      this.paging.schools.curPage = 0
      this.count.schools = 0
      this.schools.splice(0)
    },
    initReqClazz() {
      let param = {
        _className: this.searchKeyword,
        _classStatus: 'ACTIVATE',
        page: 0,
        size: this.paging.curSize
      }
      return this.$hiClass.clazzes.search(param)
    },
    initReqSchool() {
      let param = {
        _schoolName: this.searchKeyword,
        page: 0,
        size: this.paging.curSize
      }
      return this.$hiClass.schools.search(param)
    },
    getClazzList() {
      if (
        !this.paging.clazzes.isListEnd &&
        !this.paging.clazzes.isBusy &&
        this.showBytab === 0
      ) {
        this.paging.clazzes.isBusy = true
        if (
          this.searchKeyword === '' ||
          this.searchKeyword === undefined
        ) {
          return false
        }

        let url = 'clazzes/!q'
        let param = {}
        let axiosParam = {
          method: 'post'
        }
        param = {
          _className: this.searchKeyword,
          _classStatus: 'ACTIVATE',
          page: this.paging.clazzes.curPage,
          size: this.paging.curSize
        }
        axiosParam.params = param
        axiosParam.url = url

        this.$axios(axiosParam)
          .then(result => {
            this.$log.debug(
              `${this.$options.name} getClazzesList() result => `,
              result
            )

            // 배열 변경 감지를 위해 추가
            if (this.clazzes.length > 0 && this.paging.clazzes.curPage === 0) {
              // 배열 0번 인덱스 이후 전체 삭제
              this.clazzes.splice(0)
            }
            this.count.clazzes = result.data.page.totalElements
            this.paging.clazzes.curPage++

            if (this.paging.clazzes.curPage < result.data.page.totalPages) {
              this.paging.clazzes.isListEnd = false
            } else {
              this.paging.clazzes.isListEnd = true
            }
            this.paging.clazzes.isBusy = false
            this.clazzes.push(...result.data._embedded.clazzes)
          })
          .catch(error => {
            this.$log.debug(error)
            this.search = error
          })
      }
    },
    getSchoolList() {
      if (
        !this.paging.schools.isListEnd &&
        !this.paging.schools.isBusy &&
        this.showBytab === 1
      ) {
        this.paging.schools.isBusy = true
        if (
          this.$route.query.searchKeyword === '' ||
          this.$route.query.searchKeyword === undefined
        ) {
          return false
        }

        let url = 'schools/!q'
        let param = {}
        let axiosParam = {
          method: 'post'
        }
        param = {
          _schoolName: this.searchKeyword,
          page: this.paging.schools.curPage,
          size: this.paging.curSize
        }
        axiosParam.params = param
        axiosParam.url = url

        this.$axios(axiosParam)
          .then(result => {
            this.$log.debug(
              `${this.$options.name} getSchoolList() result => `,
              result
            )

            // 배열 변경 감지를 위해 추가
            if (this.schools.length > 0 && this.paging.schools.curPage === 0) {
              // 배열 0번 인덱스 이후 전체 삭제
              this.schools.splice(0)
            }
            this.count.schools = result.data.page.totalElements
            this.paging.schools.curPage++

            if (this.paging.schools.curPage < result.data.page.totalPages) {
              this.paging.schools.isListEnd = false
            } else {
              this.paging.schools.isListEnd = true
            }
            this.paging.schools.isBusy = false
            this.schools.push(...result.data._embedded.schools)
          })
          .catch(error => {
            this.$log.debug(error)
            this.search = error
          })
      }
    },
    initTab() {
      if (!this.isSearch) {
        if (this.count.clazzes === 0 && this.count.schools > 0)
          this.clickTab(1)
        else
          this.clickTab(0)

        this.isSearch = true
      }
    },

    async doSearch() {
      if (this.searchType === 'post') {
        await this.getSearchPosts()
      } else {
        if (this.searchKeyword !== this.prevSearchKeyword) {
          this.initForm()
          await this.getSearchList()
          this.prevSearchKeyword = this.searchKeyword
        }
      }
    },

    updateClazzes(classId) {
      this.clazzes = this.clazzes.filter(v => v.classId !== classId)
      this.count.clazzes = this.count.clazzes - 1
    }
  },
}
</script>

<style scoped></style>
