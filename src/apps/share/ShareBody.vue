<template>
  <div
    v-if="postItem.currentId"
    id="wrap"
    class="page-share"
  >
    <div id="cont-wrap">

      <!-- logo wrap -->
      <div class="logo-wrap">
        <img
          src="@/assets/img/logo_login.png"
          @click="link"
          style="cursor: pointer"
          alt
        />
      </div>

      <article
        :key="`detail-post-item-body-${postType}`"
        class="hi-board"
        :class="{
          'event-temp-item': isEvent
        }"
      >
        <!-- TOP -->
        <div class="board__top" style="display: none">
          <p class="link">{{ getPostParentName(postItem) }}&nbsp;</p>
        </div>

        <card-item-header
          :key="`card-item-header-${componentKey}`"
          :post-item="postItem"
          :post-title="postTitle"
          :post-type="postType"
          :post-type-name="postTypeName"
          :posted="posted"
          :write-user="writeUser"
          :board="board"
          :folder="folder"
        />

        <component
          :is="getComponentName(postType)"
          :key="`${getComponentName(postType)}-${componentKey}`"
          :post-item="postItem"
          :post-item-type="postItemType"
          @link="link"
        />

      </article>

      <div
        v-if="isShowMoreButton"
        class="more-educatioin-btn-wrap"
        style="display: block;"
      >
        <a
          href="javascript:"
          class="btn-bg-c"
          @click="link"
        >
          {{ moreButtonText }}
        </a>
      </div>

    </div>
  </div>
</template>

<script>
import MobileDetect from 'mobile-detect'
import validate from "uuid-validate"

import CardItemHeader from "@/components/Card/CardItemHeader";
import CardItemContent from "@/components/Card/CardItemContent";

import EVENT from "@/components/Card/content/PostEvent";
import MEAL from "@/components/Card/content/PostMeal";

import {mapGetters} from "vuex";
import EventMixin from "@/apps/events/mixins/EventMixin";

export default {
  name: 'share-body',
  components: {
    MEAL,
    EVENT,

    CardItemContent,
    CardItemHeader,
  },
  mixins: [EventMixin],
  data() {
    return {
      postId: null,
      option: {},
      codes: {
        postType: {
          EDUCATION: '추천정보',
          EVENT: '이벤트',
          HINOTICE: '공지사항',
          CP_BOARD: 'CP게시글'
        }
      },
      post: {},

      componentKey: 0
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    isEducation() {
      return this.postType === this.CONSTANTS.POST_TYPE.EDUCATION
    },
    isEvent() {
      return this.postType === this.CONSTANTS.POST_TYPE.EVENT
    },
    isHinotice() {
      return this.postType === this.CONSTANTS.POST_TYPE.HINOTICE
    },
    isCpBoard() {
      return this.postType === this.CONSTANTS.POST_TYPE.CP_BOARD
    },
    isMeal() {
      return this.postType === this.CONSTANTS.POST_TYPE.MEAL
    },
    isMobile() {
      const userAgent = navigator.userAgent
      const md = new MobileDetect(userAgent)
      return md.mobile()
    },
    isShowMoreButton() {
      if (this.postId === '9b0871de-2a72-4bf2-9900-0879846038f2') {
        return false
      }

      let flag = true
      const userAgent = navigator.userAgent
      const md = new MobileDetect(userAgent)
      const mobileType = md.os()
      // 공지사항 > 출석부 종료 게시글 ID 하드코딩
      const hiddenIds = [
        'e9465b8d-9b73-46da-9491-965de04d0d1b', // 개발: 하이클래스 출석부 기능 종료 안내(~22.12.31)
        'cf4e06c5-6727-4292-a441-3b16ced4de5c', // 스테이지: 하이클래스 개인정보처리방침 변경안내 (2022/10/27)
        '6c61a7ab-be19-408b-89ef-1f23f40d8c48', // 상용: 하이클래스 출석부 기능 종료 안내(~22.12.31)
      ]
      if (mobileType === 'AndroidOS' && hiddenIds.includes(this.postId)) {
        flag = false
      }
      return flag
    },
    moreButtonText() {
      return `${this.mainCategoryName} ${this.$t('mobile.share.button.text')}`
    },
    mainCategoryName() {
      if (!this.postType) {
        return this.postTypeName
      } else {
        const mainCategoryList = this.codes.postType
        if (this.postType === 'CP_BOARD' && this.postItem.category && this.postItem.category.name) {
          mainCategoryList.CP_BOARD = this.postItem.category.name
        }
        return mainCategoryList[this.postType]
      }
    },
    mainCategoryList() {
      const mainCategoryList = {
        NOTE: '알림장',
        ALBUM: '앨범',
        BOARD: '자유게시판',
        HOMEWORK: '과제',
        ALARM: '가정통신문',
        MEAL: '급식',
        NOTICE: '학교공지',
        EDUCATION: '추천정보',
        EVENT: '이벤트',
        HINOTICE: '공지사항',
        CP_BOARD: 'CP게시글'
      }
      if (this.postItem.parent != null && this.postItem.parent.schoolType != null) {
        mainCategoryList.NOTE =
          this.getPostTypeNameByCode({
            code: 'NOTE',
            type: this.postItem.parent.schoolType
          })
      }
      if (this.postType === 'CP_BOARD' && this.postItem.category && this.postItem.category.name) {
        mainCategoryList.CP_BOARD = this.postItem.category.name
      }
      return mainCategoryList
    },
    postItem() {
      return this.post
    },
    postItemType() {
      return 'POST'
    },
    postType() {
      return this.postItem.postType || ''
    },
    postTypeName() {
      return this.mainCategoryList[this.postType]
    },
    postTitle() {
      return this.postItem.postTitle
    },
    posted() {
      return this.post.posted || null
    },
    writeUser() {
      return this.postItem.writeUser || {}
    },
    board() { return this.post.board || null },
    folder() { return this.post['folder'] || null },
  },
  mounted() {
    this.postId = this.$route.params.id

    this.getUrlMap()

    if (!this.postId || !validate(this.postId)) {
      this.goIndex()
      return false
    }

    this.getPost()
  },
  methods: {
    goIndex() {
      this.$router.push('/', () => {})
    },
    getPost() {
      const url = `${this.$apiUrl}/posts/${this.postId}`
      this.$hiClass.posts
        .read(url)
        .then(res => this.post = res.data)
        .catch(err => {
          this.$log.debug(this.$options.name, ' getPost() error => ', err)
          this.goIndex()
        })
    },
    link() {
      if (this.urlMap[this.postId]) {
        window.location.href = this.urlMap[this.postId]
        return
      }

      const userAgent = navigator.userAgent
      const md = new MobileDetect(userAgent)

      if (md.mobile()) {
        let mobileType = md.os()
        const routeObj = {
          path: '/appLoading',
          query: {
            osType: mobileType,
            appUrl: `hiclass.net/post/detail?id=${this.postId}&type=${this.postType}`
          }
        }
        this.$router.push(routeObj, () => {})

      } else {
        if (this.$authentication.isAuthenticated()) {
          if (this.isEducation) {
            this.$router.push('/main/education/info')
          } else if (this.isEvent) {
            this.$router.push({
              path: '/main/education/event',
              query: {
                postId: this.postId
              }
            })
          } else if (this.isHinotice) {
            this.$router.push('/help/notice')
          } else if (this.isCpBoard) {
            this.$router.push({
              path: '/main',
              query: {
                postId: this.postId
              }
            })
          } else {
            this.$router.push('/', () => {})
          }

        } else {
          this.$router.push('/', () => {})
        }
      }
    },
    getMainCategory(postItem) {
      return this.mainCategoryList[postItem.postType]
    },
    getSubCategory(postItem) {
      if (postItem.postType === 'EVENT') {
        return postItem.displayStatus === 'CLOSED'
          ? this.$t('main.education.event.end') : postItem.displayStatus === 'EXPECTED' ?
            this.$t('main.education.event.pre') : this.$t('main.education.event.ing')
      } else {
        return postItem.parent ? postItem.parent.infoTitle : postItem.postTitle
      }
    },
    getPostParentName(postItem) {
      let postParentName = ''

      switch (postItem.postType) {
        case 'NOTE':
        case 'ALBUM':
        case 'BOARD':
        case 'HOMEWORK':
          postParentName = postItem.parent.className
          break
        case 'NOTICE':
        case 'MEAL':
        case 'ALARM':
        case 'ALARM_PLUS':
          postParentName = postItem.parent.schoolName
          break
        case 'EDUCATION':
        case 'EVENT':
          postParentName = this.getSubCategory(postItem)
          break
        case 'HINOTICE':
          postParentName = this.getMainCategory(postItem)
          break
        default:
          postParentName = this.getMainCategory(postItem)
      }

      return postParentName
    },
    getComponentName(postType) {
      const componentNames = [
        this.CONSTANTS.POST_TYPE.MEAL,
        this.CONSTANTS.POST_TYPE.EVENT,
      ]
      return componentNames.includes(postType)
        ? postType
        : 'CardItemContent'
    },
  }
}
</script>

<style scoped></style>
