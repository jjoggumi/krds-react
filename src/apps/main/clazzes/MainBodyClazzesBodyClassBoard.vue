<template>
  <div>
    <main-body-clazzes-body-class-board-header-title
      :post-type="curForm"
    />

    <!-- 고정 필터 (탭 그룹, 게시글 검색) -->
    <main-body-clazzes-body-class-board-header-filter
      :is-manager="isManager"
      :cur-form="curForm"
      @getUser="getUser"
    />

    <!-- 파일 모아보기 콘텐츠 필터 -->
    <main-body-clazzes-body-class-board-header-file-filter
      v-if="isVisiblePostFiles"
      :cur-form="curForm"
    />

    <!-- 게시글 상태 필터 -->
    <main-body-clazzes-body-class-board-header-status-filter
      v-if="isVisiblePostStatusFilter"
      :cur-form="curForm"
      :is-manager="isManager"
    />

    <!-- 게시글 키워드 검색 결과 -->
    <main-body-clazzes-body-class-board-header-search-result
      v-if="isVisibleSearchResult"
      :userName="userName"
    />

    <!-- 상단 고정 게시글 목록 -->
    <main-body-clazzes-body-class-board-post-top
      v-show="isVisiblePostTop"
      :key="`${curForm}-${curBoardId}`"
      :post-type="curForm"
    />

    <!-- 게시글 목록 (리스트) -->
    <main-body-clazzes-body-class-board-clazz-posts
      v-if="isVisiblePosts"
      :cur-form="curForm"
    />
    
    <!-- 게시글 목록 (리스트) 없음 -->
    <main-body-clazzes-body-item-empty
      v-if="isVisiblePosts && isCurClazzesPostsEmpty"
      :isFirst="true"
    />

    <!-- 파일 모아보기 -->
    <main-body-clazzes-body-class-board-clazz-post-files
      v-if="isVisiblePostFiles"
      :cur-form="curForm"
    />

    <!-- 무한스크롤 목록 요청 로딩 -->
    <main-loading-scroll v-if="infiniteScroll.isBusy" />
  </div>

</template>

<script>
import {eventBus} from "@/main";
import {mapGetters, mapMutations, mapState} from "vuex";

import MainBodyClazzesBodyClassBoardHeaderTitle from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardHeaderTitle";
import MainBodyClazzesBodyClassBoardHeaderFilter from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardHeaderFilter";
import MainBodyClazzesBodyClassBoardClazzPosts from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardClazzPosts";
import MainBodyClazzesBodyClassBoardPostTop from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardPostTop";
import MainBodyClazzesBodyItemEmpty from "@/apps/main/clazzes/MainBodyClazzesBodyItemEmpty";
import MainBodyClazzesBodyClassBoardHeaderStatusFilter
  from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardHeaderStatusFilter";
import MainBodyClazzesBodyClassBoardClazzPostFiles
  from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardClazzPostFiles";
import MainBodyClazzesBodyClassBoardHeaderSearchResult
  from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardHeaderSearchResult";
import MainBodyClazzesBodyClassBoardHeaderFileFilter
  from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardHeaderFileFilter";
import MainLoadingScroll from "@/apps/main/MainLoadingScroll";

export default {
  name: "main-body-clazzes-body-class-board",
  components: {
    MainLoadingScroll,
    MainBodyClazzesBodyClassBoardHeaderFileFilter,
    MainBodyClazzesBodyClassBoardHeaderSearchResult,
    MainBodyClazzesBodyClassBoardClazzPostFiles,
    MainBodyClazzesBodyClassBoardHeaderStatusFilter,
    MainBodyClazzesBodyItemEmpty,
    MainBodyClazzesBodyClassBoardPostTop,
    MainBodyClazzesBodyClassBoardClazzPosts,
    MainBodyClazzesBodyClassBoardHeaderFilter,
    MainBodyClazzesBodyClassBoardHeaderTitle
  },
  props: {
    curForm: {
      type: String
    },
    isManager: {
      type: Boolean
    },
  },
  data() {
    return {
      initializedSearchQueryString: null,
      searchQueryStringRefreshCount: 0,
      userName: null
    }
  },
  computed: {
    ...mapState({
      curClazzesPosts: 'curClazzesPosts',
      curClassSearchQuery: 'curClassSearchQuery',
      curClassPostFileSearchQuery: 'curClassPostFileSearchQuery',
      curClassTabCode: 'curClassTabCode',
      infiniteScroll: 'infiniteScroll',
      curClassItem: 'curClassItem'
    }),
    ...mapState('storeBoard', {
      curBoardId: 'curBoardId'
    }),
    ...mapState('storeClazzes', {
      classUser: 'classUser'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    isCurClazzesPostsEmpty() {
      return Array.isArray(this.curClazzesPosts)
        && this.curClazzesPosts.length === 0
    },
    isVisiblePostStatusFilter() {
      let flag = false

      switch (this.curForm) {
        case this.CONSTANTS.POST_TYPE.NOTE:
        case this.CONSTANTS.POST_TYPE.ALBUM:
        case this.CONSTANTS.POST_TYPE.BOARD: {
          if (this.isManager) flag = true
          break
        }
        case this.CONSTANTS.POST_TYPE.HOMEWORK: {
          flag = true
          break
        }
      }

      if (this.existsKeyword || this.isVisiblePostFiles) flag = false

      return flag
    },
    isVisiblePostTop() {
      return !this.existsKeyword && !this.isVisiblePostFiles
    },
    isVisiblePosts() {
      return this.initializedSearchQueryString === this.curClassSearchQueryString
        && this.curClassTabCode === 'LIST'
    },
    isVisiblePostFiles() {
      return this.curClassTabCode === 'FILE'
    },
    isVisibleSearchResult() {
      return this.existsKeyword
    },
    existsKeyword() {
      return !!(this.curClassSearchQuery.keyword || this.curClassSearchQuery.insertedUser || this.curClassSearchQuery.dayOfPosted)
    },
    curClassSearchQueryString() {
      return this.$qs.stringify(this.curClassSearchQuery)
        + this.searchQueryStringRefreshCount
    },
    classId() {
      return this.curClassItem.currentId
    }
  },
  watch: {
    $route() {
      this.initBoardIdAndFolderId()
    },
    curClassSearchQueryString() {
      this.$nextTick(() => {
        this.setInitializedSearchQueryString()
        this.initBoardIdAndFolderId()
      })
    },
  },
  created() {
    this.setInitializedSearchQueryString()
  },
  mounted() {
    if(this.classUser.userType === "STUDENT") {
      this.checkProfileChange()
    }
    this.initBoardIdAndFolderId()

    eventBus.$on('refresh-class-board-posts', () => {
      this.searchQueryStringRefreshCount++
      this.$nextTick(() => this.setInitializedSearchQueryString())
    })
  },
  beforeDestroy() {
    this.clearBoardIdAndFolderId()

    eventBus.$off('refresh-class-board-posts')
  },
  methods: {
    ...mapMutations('storeBoard', {
      setCurBoardId: 'setCurBoardId',
      setCurBoardFolderId: 'setCurBoardFolderId',
    }),
    ...mapMutations('storeClazzes', {
      setClassUser: 'setClassUser'
    }),
    setInitializedSearchQueryString() {
      this.initializedSearchQueryString
        = this.$qs.stringify(this.curClassSearchQuery) + this.searchQueryStringRefreshCount
    },
    initBoardIdAndFolderId() {
      const boardId = this.$route.params.boardId || null
      const folderId = this.$route.params.folderId || null

      this.setCurBoardId(boardId)
      this.setCurBoardFolderId(folderId)

      // rootState
      this.curClassSearchQuery.boardId = boardId
      this.curClassSearchQuery.folderId = folderId
      this.curClassPostFileSearchQuery.boardId = boardId
      this.curClassPostFileSearchQuery.folderId = folderId
    },
    clearBoardIdAndFolderId() {
      this.setCurBoardId(null)
      this.setCurBoardFolderId(null)

      // rootState
      this.curClassSearchQuery.boardId = null
      this.curClassSearchQuery.folderId = null
      this.curClassPostFileSearchQuery.boardId = null
      this.curClassPostFileSearchQuery.folderId = null
    },
    getUser(data) {
      this.userName = data
    },
    async checkProfileChange() {
      await this.$hiClass
        .getAcceptSubscribeClassByClassIdAndUserId(this, this.classId)
        .then(clazzSubscribeViews => {
          const clazzSubscribeView = clazzSubscribeViews[0]
          this.setClassUser({
            ...this.classUser,
            memberChildName: clazzSubscribeView.memberChildName,
            profileId: clazzSubscribeView.profileId,
            userName: clazzSubscribeView.userName,
            userPhoto: clazzSubscribeView.userPhoto
          })
        })
    }
  }
}
</script>

<style scoped>

</style>