<template>
  <div id="mainBodySchools">
    <layer-item positionType="WEB_POPUP_SCHOOL"></layer-item>

    <main-body-schools-header
      v-if="schools.currentId"
      :schoolUri="schoolUri"
      :schoolUuid="schoolUuid"
      :schools="schools"
      :user="user"
      :userUri="userUri"
      :isSubscribe="isSubscribe"
      :subscribeUuid="subscribeUuid"
      :joinType="joinType"
      :isDisabledSubscribeButton="isDisabledSubscribeButton"
    ></main-body-schools-header>

    <div class="cont-box-inner clfix">
      <banner-item
        v-if="isVisibleForm"
        :key="$store.state.bannerTimestamp"
        positionType="WEB_BANNER_QUICK"
        isQuickClass="class-page"
        :banners="$store.state.banner.WEB_BANNER_QUICK"
      ></banner-item>

      <main-body-schools-lnb
        v-if="schools.currentId"
        ref="lnbCurrent"
        :schoolUuid="schoolUuid"
        :schools="schools"
        @initCurSchoolSearchQuery="initCurSchoolSearchQuery"
        @initInfinityScroll="initInfinityScroll"
      ></main-body-schools-lnb>

      <main-body-schools-body
        v-if="isVisibleForm && schools.currentId"
        :curForm="curForm"
        :schoolUri="schoolUri"
        :schoolUuid="schoolUuid"
      ></main-body-schools-body>

<!--

      :posts="posts"
      :contentKeyword="contentKeyword"
      :isInitComp="isInitComp"
      :isBusy="isBusy"
      @updateKeyword="updateKeyword"
      v-infinite-scroll="doBoardSearch"
      :infinite-scroll-disabled="isBusy"
      :infinite-scroll-distance="scrollLimit"
      :searchKeyword="searchKeyword"
      :alarmPlusQuery="alarmPlusQuery"-->

      <main-body-schools-rnb
        v-if="isVisibleForm"
        ref="search"
        :schools="schools"
        :parentUri="[this.schoolUri]"
        :user="user"
      ></main-body-schools-rnb>

    </div>

  </div>
</template>

<script>
import {eventBus} from "@/main";
import {mapFields} from "vuex-map-fields";
import {mapGetters, mapMutations} from "vuex";

import LayerItem from "@/components/Banner/LayerItem";
import BannerItem from "@/components/Banner/BannerItem";
import MainBodySchoolsLnb from "@/apps/main/schools/MainBodySchoolsLnb";
import MainBodySchoolsHeader from "@/apps/main/schools/MainBodySchoolsHeader";
import MainBodySchoolsBody from "@/apps/main/schools/MainBodySchoolsBody";
import MainBodySchoolsRnb from "@/apps/main/schools/MainBodySchoolsRnb";

export default {
  name: 'main-body-schools',
  props: {
    user: Object
  },
  data() {
    return {
      isInitComp: false,
      isDisabledSubscribeButton: true,

      initializedForm: 'ALL',

      curForm: 'ALL',
      schools: {},
      schoolUri: '',
      schoolUuid: '',
      contentKeyword: '',
      posts: [],
      counter: 1,
      pageCount: 1,
      busy: false,
      schoolArr: [],
      schoolSearch: [],
      isBusy: false,
      isListEnd: false,
      scrollLimit: process.env.VUE_APP_BASE_INFINITE_SCROLL_DISTANCE,
      curPage: process.env.VUE_APP_BASE_PAGE_START,
      curSize: process.env.VUE_APP_BASE_PAGE_MIN_SIZE,
      initScroll: false,
      isSubscribe: false,
      subscribeUuid: '',
      joinType: '',
      alarmPlusQuery: {
        reply: null
      },
      // posts 요청 쿼리
      query: {}
    }
  },
  components: {
    MainBodySchoolsRnb,
    MainBodySchoolsBody,
    MainBodySchoolsHeader,
    MainBodySchoolsLnb,
    BannerItem,
    LayerItem
  },
  computed: {
    ...mapFields({
      curSchoolSearchQuery: 'curSchoolSearchQuery',
      curWindow: 'curWindow',
    }),
    ...mapGetters({
      getIsFixed: "getIsFixed",
    }),
    isVisibleForm() {
      return this.initializedForm === this.curForm
    },
    fiveYearsAgoDate() {
      return this.$moment()
        .subtract(5, 'year')
        .valueOf()
    },
    userUri() {
      return this.$store.state.user._links.self.href
    },
    userId() {
      return this.$store.state.user.currentId
    },
    searchKeyword() {
      return this.curSchoolSearchQuery.keyword || ''
    }
  },
  watch: {
    $route(to, from) {
      if (
        to !== from &&
        this.schoolArr.indexOf(this.$comn.split(to.path, '/').toUpperCase()) >
        -1
      ) {
        this.curForm = this.$comn.split(to.path, '/').toUpperCase()
      } else {
        this.curForm = 'ALL'
      }

      if (this.curForm === 'ALARM') {
        this.alarmPlusQuery.reply = null
      }
      this.initInfinityScroll(this.curForm, true)
      this.doBoardSearch()
    },
    /*posts: function(val, oldVal) {
      if (val !== oldVal) {
        this.isInitComp = false
      }
    },*/
    'schools.currentId'() {
      this.setCurSchoolItem(this.schools)
    },
    curForm() {
      this.$scrollTo("body", { duration: 0 })
      this.initializedForm = this.curForm
    }
  },
  async created() {
    const id = this.$route.params.id
    this.$comn.log(this, 'id', id)

    if (id !== undefined) {
      this.schoolUuid = id
    }
    if (
        this.schoolArr.indexOf(
            this.$comn.split(this.$route.path, '/').toUpperCase()
        ) > -1
    ) {
      this.curForm = this.$comn.split(this.$route.path, '/').toUpperCase()
    }
    await this.initSchoolsAndSubscribe()

    eventBus.$on('schools-init-infinity-scroll', curForm => {
      this.initInfinityScroll(curForm ? curForm : null, true)
    })

    eventBus.$on('schools-do-board-search', keyword => {
      this.doBoardSearch(keyword)
    })

    eventBus.$on('schools-do-force-update', () => {
      // this.doForceUpdate()
    })
  },
  mounted() {
    this.curWindow.scrollTop = 0
    this.curWindow.scrollLeft = 0

    // 페이지 body 에 bg-white 스타일 지양
    // this.$hiClass.toggleBodyClass('add', 'bg-white')

    eventBus.$on('refresh-cur-form', () => {
      const curForm = this.curForm
      this.setCurForm('')
      this.$nextTick(() => this.setCurForm(curForm))
    })
  },
  beforeDestroy() {
    eventBus.$off('schools-init-infinity-scroll')
    eventBus.$off('schools-do-board-search')
    eventBus.$off('schools-do-force-update')
    eventBus.$off('refresh-cur-form')

    this.initCurSchoolSearchQuery()

    // this.$hiClass.toggleBodyClass('remove', 'bg-white')
  },
  methods: {
    ...mapMutations({
      setCurSchoolItem: 'setCurSchoolItem',
    }),
    updateKeyword() {
      // const keyword = this.$route.query.contentKeyword
      // if (keyword === undefined) this.contentKeyword = ''
      // else this.contentKeyword = keyword
      const keyword = this.$route.query.contentKeyword
      if (keyword === undefined) this.contentKeyword = ''
      else this.contentKeyword = keyword
    },
    initCurSchoolSearchQuery() {
      Object.keys(this.curSchoolSearchQuery).forEach(key => {
        this.curSchoolSearchQuery[key] = null
      })
    },
    initInfinityScroll(curForm, flag) {
      this.isBusy = false
      this.isListEnd = false
      this.curPage = 0
      this.posts = []
      if (curForm) this.setCurForm(curForm)
      this.initScroll = flag
    },
    async initSchoolsAndSubscribe() {
      let schoolUri = `${process.env.VUE_APP_BASE_API_URI}/schools/${this.schoolUuid}`

      await this.$hiClass.schools
        .read(schoolUri)
        .then(result => {
          this.$log.debug(
            this.$options.name + ' initSchoolsAndSubscribe() result => ',
            result
          )
          this.schools = result.data
          this.schoolUri = result.data._links.self.href

          this.schoolArr = ['ALL', 'MEAL', 'NOTICE', 'ALARM']
          this.schoolSearch = ['MEAL', 'NOTICE', 'ALARM']
          if (this.$store.state.isVisibleAlarmPlus && this.schools.alarmPlusUsed) {
            this.schoolArr.push('ALARM_PLUS')
            this.schoolSearch.push('ALARM_PLUS')
          }

          if (this.schools.alarmEduOfficeUsed) {
            this.schoolArr.push('ALARM_EDU_OFFICE')
            this.schoolSearch.push('ALARM_EDU_OFFICE')
          }

          this.checkSubscribe()

          if (
              this.schoolArr.indexOf(this.$comn.split(this.$route.path, '/').toUpperCase()) >-1
          ) {
            this.curForm = this.$comn.split(this.$route.path, '/').toUpperCase()
          } else {
            this.curForm = 'ALL'
          }

          this.initInfinityScroll(this.curForm, true)

          this.doBoardSearch()
        })
        .catch(error => {
          this.$log.debug(
            this.$options.name + ' initSchoolsAndSubscribe() error => ',
            error
          )
        })
    },
    doBoardSearch(keyword) {
      /*// 학교 관련 postType ( ["ALL", "ALARM", "MEAL", "NOTICE"] ) 일때만 실행됨.
      if (!this.schoolArr.includes(this.curForm)) {
        return false
      }

      if (keyword || keyword === '') {
        // 게시글 목록 초기화
        this.initInfinityScroll(this.curForm, false)
      }

      if (!this.isBusy && !this.isListEnd) {
        this.isBusy = true

        this.resetQuery()

        if (this.curForm === 'ALL') {
          // 전체란에서 검색 할 때에는  _postType 검색조건 제외
          this.query._postType = this.schoolSearch
        } else if (this.curForm === 'ALARM') {
          this.query._postType.push('ALARM')

          // 가정통신문 확인
          if (this.$store.state.isVisibleAlarmPlus && this.schools.alarmPlusUsed)
            this.query._postType.push('ALARM_PLUS')

        } else {
          this.query._postType = this.curForm
        }

        // 급식을 포함하여 검색할 경우에는 오늘까지 발행된 게시글만 노출
        if (this.query._postType.includes('MEAL')) {
          const todayStr = this.$moment().format('YYYY-MM-DD')
          this.query._postedLte = this.$moment(todayStr).add('1', 'day').valueOf() - 1000
        }

        this.$hiClass.posts
          .search(this.query)
          .then(result => {
            let searchList = result.data
            for (const post of searchList._embedded.posts) {
              this.posts.push(post)
            }

            if (result.data._links.next !== undefined) {
              this.curPage++
              this.isListEnd = false
            } else {
              this.curPage = 0
              this.isListEnd = true
            }
          })
          .catch(error => {
            this.$log.debug(
              this.$options.name + ' doBoardSearch() error => ',
              error
            )
          })
          .finally(() => {
            this.isBusy = false
            this.initScroll = false

            this.$nextTick(() => {
              setTimeout(() => {
                this.isInitComp = true
              }, 50)
            })
          })
      }*/
    },
    setCurForm(val) {
      this.curForm = val
    },
    checkSubscribe() {
      if (this.schoolUri === undefined || this.schoolUri === '') return false

      for (const subscribe of this.$store.state.schoolSubscribeViews) {
        if (this.schoolUuid === subscribe.schoolId) {
          this.subscribeUuid = subscribe.currentId
          this.joinType = subscribe.joinType
          this.isSubscribe = true
          break
        }
      }

      this.isDisabledSubscribeButton = false
    },
    resetQuery() {
      this.query = {
        _parentUri:
          this.$apiUrl +
          this.$comn.split(this.$route.path, '/', 2, 3),
        _postType: [],
        _reply: this.alarmPlusQuery.reply,
        page: this.curPage,
        size: this.curSize,
        sort: 'posted,desc'
      }

      for (const [key, value] of Object.entries(this.curSchoolSearchQuery)) {
        if (value !== null)
          this.query[key] = value
      }
    },
    doForceUpdate() {
      this.$log.debug('doForceUpdate')
      this.$forceUpdate()
      this.initCurSchoolSearchQuery()
      this.doBoardSearch()
    }
  }
}
</script>
<style lang="scss" scoped>
.cont-wrap-fixed {
  min-height: calc(100vh - 100px);
}
</style>
