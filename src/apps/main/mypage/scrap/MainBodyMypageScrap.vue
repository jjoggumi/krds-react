<template>
  <div class="scrap-cont-wrap clfix">
    <LeftWrap
      :userScraps="userScraps"
      :filteredUserScraps="filteredUserScraps"
      :isChkRnbSearchForm="isChkRnbSearchForm"
      :isInitComp="isInitComp"
      :isBusy="isBusy"
      v-infinite-scroll="getUserScraps"
      :infinite-scroll-disabled="isBusy"
      :infinite-scroll-distance="scrollLimit"
      @compScrap="compScrap"
    ></LeftWrap>

    <div class="right-wrap" v-if="isChkRnbSearchForm">
      <div class="input-box-wrap round-search-box search-box-wrap">
        <input
          type="text"
          placeholder="검색"
          maxlength="100"
          :value="keyword"
          @input="keyword = $event.target.value"
          @keydown.enter.prevent.stop="
            setKeyword(keyword)
            saveKeyword()
            getUserScraps()
          "
        />
        <button
          class="search-btn"
          @click.self="
            setKeyword(keyword)
            saveKeyword()
            getUserScraps()
          "
        ></button>
        <button
          class="input-text-delete-btn"
          v-if="keyword"
          :style="{ display: 'inline-block' }"
          @click="keyword = ''"
        ></button>
      </div>
      <div class="hashtag-wrap">
        <div
          class="hashtag"
          v-for="item in scrapSearchKeywords"
          :key="item.currentId"
        >
          <span
            @click="
              setKeyword(item)
              getUserScraps()
            "
          >
            <a>{{ item }}</a>
          </span>
          <button
            class="delete-hashtag-btn"
            @click.self="deleteKeyword(item)"
          ></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LeftWrap from './MainBodyMypageScrapBody'
export default {
  name: 'mainBodyMypageScrap',
  data() {
    return {
      items: {
        userScraps: [],
        userScrapsLimit: 0,
        totalElements: null
      },
      userScraps: [],
      keyword: '',
      scrapSearchKeywords: [],
      isChkRnbSearchForm: false,
      isInitComp: false,
      isBusy: false,
      isListEnd: false,
      scrollLimit: process.env.VUE_APP_BASE_INFINITE_SCROLL_DISTANCE,
      curPage: process.env.VUE_APP_BASE_PAGE_START,
      curSize: process.env.VUE_APP_BASE_PAGE_MIN_SIZE
    }
  },
  props: ['user'],
  components: { LeftWrap },
  computed: {
    /**
     * 20210521 폐쇄된 클래스의 게시물과 클래스 설정 > 미사용 처리된 게시물의 스크랩은
     * userScraps search API 호출 시 서버에서 제외 처리됨
     */
    filteredUserScraps() {
      const classPostTypes = ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK']
      const schoolPostTypes = ['ALARM', 'MEAL', 'NOTICE']
  
      return this.userScraps.filter(d => {
        if (classPostTypes.includes(d.post.postType)) {
          /**
           * 클래스 게시물 스크랩 노출 process
           * 1. 게시판 사용 여부
           * 2. 게시글 접근 권한 확인 (배포된 게시글)
           */
          if (
            d.post.isScrap === true
            && d.post.del === false
            && this.isManagedOrAccepted(d.post)
          ) {
            return true
          }
        } else if (schoolPostTypes.includes(d.post.postType) && d.post.del === false) {
          return d.post.isScrap === true && d.post.parent.schoolStatus === 'ACTIVATE'
      
        } else {
          return d.post.isScrap === true && d.post.del === false
        }
      })
    }
  },
  watch: {
    // userScraps: function(val, oldVal) {
    //   if (val !== oldVal) {
    //     this.isInitComp = false
    //   }
    // }
  },
  created() {},
  mounted() {
    this.getUserScraps()
    this.scrapSearchKeywords = JSON.parse(
      localStorage.getItem('scrapSearchKeyword')
    )
  },
  methods: {
    getUserScraps() {
      if (!this.isBusy && !this.isListEnd) {
        this.isBusy = true

        let params = {
          _user: this.user._links.self.href,
          page: this.curPage,
          size: this.curSize,
          sort: 'post.posted,desc'
        }

        // 키워드 세팅
        if (
          this.keyword !== undefined &&
          this.keyword !== null &&
          this.keyword !== ''
        ) {
          params._keyword = this.keyword
        }

        this.$hiClass.userScraps
          .search(params)
          .then(res => {
            this.$log.debug(
              this.$options.name + ' getUserScraps() res : ',
              res
            )
            // TODO: test auto reload
            res.data._embedded.userScraps.map(item => {
              this.items.userScraps.push(item)
            })
            this.items.userScrapsLimit = res.data.page.totalElements || 0
            this.items.totalElements = this.items.userScrapsLimit
            // -- test auto reload

            if (this.curPage === 0) this.userScraps.splice(0)

            for (const userScrap of res.data._embedded.userScraps) {
              const post = userScrap.post
              post._links = {
                self: {
                  href:
                    this.$apiUrl + '/posts/' + post.currentId
                }
              }
              this.userScraps.push(userScrap)
            }

            if (this.userScraps.length > 0 && !this.isChkRnbSearchForm)
              this.isChkRnbSearchForm = true

            if (res.data._embedded.userScraps.length > 0) this.curPage++
            else this.isListEnd = true

            this.$nextTick(() => {
              setTimeout(() => {
                this.isInitComp = true
              }, 50)
            })
          })
          .catch(error => {
            this.$log.debug(
              this.$options.name + ' getUserScraps() error : ',
              error
            )

            this.$nextTick(() => {
              setTimeout(() => {
                this.isInitComp = true
              }, 50)
            })
          })
          .finally(() => {
            this.isBusy = false

            // TODO: test auto reload 2
            let noScrollbar = false
            if ($(document).height() === $(window).height())
              noScrollbar = true

            if (!this.isListEnd && noScrollbar && this.items.totalElements > 0) this.getUserScraps()
            // -- test auto reload 2
          })
      }
    },
    initUserScraps() {
      this.userScraps.splice(0)
      this.curPage = 0
      this.isListEnd = false
    },
    setKeyword(keyword) {
      this.initUserScraps()
      this.keyword = keyword !== undefined ? keyword.trim() : keyword
    },
    deleteKeyword(keyword) {
      let delIdx = this.scrapSearchKeywords.indexOf(keyword)
      this.scrapSearchKeywords.splice(delIdx, 1)
      localStorage.setItem(
        'scrapSearchKeyword',
        JSON.stringify(this.scrapSearchKeywords)
      )
      this.$log.debug(this.scrapSearchKeywords)
    },
    saveKeyword() {
      if (
        this.keyword !== undefined &&
        this.keyword !== null &&
        this.keyword !== ''
      ) {
        let arr = localStorage.getItem('scrapSearchKeyword')
        let isKeywordDuplicate = false
        if (arr === null) arr = []
        else arr = JSON.parse(arr)

        for (let str of arr) {
          if (str.trim() === this.keyword.trim()) {
            isKeywordDuplicate = true
            break
          }
        }

        if (!isKeywordDuplicate) {
          if (arr.length === 6) {
            arr.splice(5, 1)
          }
          arr.unshift(this.keyword)
          this.scrapSearchKeywords = arr
          localStorage.setItem('scrapSearchKeyword', JSON.stringify(arr))
        }
      }
    },
    compScrap(obj) {
      // 스크랩 삭제
      if (this.userScraps.length > 0 && !obj.isVal) {
        this.userScraps.splice(obj.index, 1)

        // 스크랩 삭제 완료 후 스크랩한 리스트가 없다면, 키워드 검색 여부 초기화
        if (this.userScraps.length === 0) {
          this.isChkRnbSearchForm = false
          this.isInitComp = true
        }
      }
    },
    /**
     * 해당 게시물 클래스의 관리자 여부 확인
     */
    isManagedPost(clazz) {
      let flag = false

      try {
        const classId = clazz.currentId
        let managedClasses = this.$store.state.clazzSubscribeViews.filter(d => {
          return (
            d.classId === classId &&
            (d.memberRole === 'OWNER' || d.memberRole === 'MANAGER')
          )
        })
        if (managedClasses.length > 0) flag = true
        // this.$log.debug(`isManagedPost => `, flag)
      } catch (err) {
        this.$log.warn(`isManagedPost() err => `, err)
      }

      return flag
    },
    /**
     * 게시물 접근 권한 확인 (클래스 설정)
     */
    isMemberUsed(clazz, postType) {
      let flag = false

      try {
        let userType = this.$store.state.user.userType.toLowerCase()
        userType = userType.replace(/^./, userType[0].toUpperCase())

        if (userType !== 'Student') userType = 'Parents'

        flag = clazz[`${postType}${userType}Used`]
      } catch (err) {
        this.$log.warn(`isMemberUsed() err => `, err)
      }

      return flag
    },
    /**
     * 게시물 접근 권한 확인 (배포된 게시물)
     */
    isManagedOrAccepted(post) {
      return this.isManagedPost(post.parent)
        ? true
        : this.isAcceptedPost(post)
    },
    isAcceptedPost(post) {
      const userTypeArr = post.userType
      const myUserType = this.$store.state.user.userType === 'STUDENT'
        ? this.$store.state.user.userType
        : 'PARENTS'

      return !!userTypeArr.includes(myUserType);
    },
  }
}
</script>
