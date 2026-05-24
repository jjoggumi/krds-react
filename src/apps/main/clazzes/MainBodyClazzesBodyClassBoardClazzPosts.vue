<template>
  <div
    v-infinite-scroll="getCurClazzesPosts"
    :infinite-scroll-disabled="infiniteScroll.isBusy"
    :infinite-scroll-distance="infiniteScroll.distance"
  >

    <!-- 게시글 목록 초기화 전 로딩 이미지 노출 -->
    <main-body-clazzes-body-class-board-loading-item
      v-if="curClazzesPosts === undefined"
    />
 
    <card-item 
      v-for="(clazzesPost, index) of curClazzesPosts"
      :key="`clazz-post-${clazzesPost.currentId}-${index}`"
      :clazzes-post="clazzesPost"
      :clazzes-posts="curClazzesPosts"
      :index="index"
      :school-type="curClassSchoolType"
      :class-name="curClassClassName"
      :is-class-list="true"
      :is-show-folder-name="false"
      :curForm="curForm"
      @delete-new-list="deleteNewList"
    />

  </div>
</template>

<script>
import MainBodyClazzesBodyClassBoardLoadingItem from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardPostsLoadingBox";
import CardItem from '@/components/Card/CardItem'

import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {eventBus} from '@/main'

export default {
  name: "main-body-clazzes-body-class-board-posts",
  components: {CardItem, MainBodyClazzesBodyClassBoardLoadingItem},
  props: {
    curForm: {
      type: String,
      required: true
    },
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapState({
      curClassItem: 'curClassItem',
      curClassSearchQuery: 'curClassSearchQuery',
      curClazzesPosts: 'curClazzesPosts',
      infiniteScroll: 'infiniteScroll'
    }),
    ...mapGetters({
      curClassSchoolType: 'curClassSchoolType',
      curClassClassName: 'curClassClassName',
    }),
    classId() {
      return this.curClassItem.currentId
    },
  },
  created() {
    this.getCurClazzesPosts(true)
  },
  mounted() { 
    eventBus.$on('init-cur-posts', () => this.getCurClazzesPosts(true))
    eventBus.$on('get-cur-posts', initFlag => this.getCurClazzesPosts(initFlag))
  },
  beforeDestroy() {
    this.destroyCurClazzesPosts()

    eventBus.$off('init-cur-posts')
    eventBus.$off('get-cur-posts')
  },
  methods: {
    ...mapMutations({
      setCurClazzesPosts: 'setCurClazzesPosts',
      setCurClazzesPostsAfterDelete : 'setCurClazzesPostsAfterDelete',
      setCurClassSearchQueryAttr: 'setCurClassSearchQueryAttr',
      setInfiniteScrollIsBusy: 'setInfiniteScrollIsBusy',
    }),
    ...mapActions({
      initCurClassSearchQuery: 'initCurClassSearchQuery',
      initInfiniteScroll: 'initInfiniteScroll',
    }),
    destroyCurClazzesPosts() {
      // 무한 스크롤 store 초기화
      this.initInfiniteScroll()
      this.setCurClazzesPosts(undefined)
    },
    async getCurClazzesPosts(initFlag) {
      if (initFlag) {
        this.initInfiniteScroll()
        this.setCurClazzesPosts(undefined)
      }

      // FIXME: searchQuery 변경으로 2회 마운트되어 2회 조회하는 버그 임시 조치
      if (this.curForm !== 'ALL' && !this.curClassSearchQuery.boardId) {
        return false
      }

      if (!this.infiniteScroll.isBusy && !this.infiniteScroll.isListEnd) {
        this.setInfiniteScrollIsBusy(true)

        const requestPostType = this.curForm
        const requestPostStatus = requestPostType === 'ALL' ? 'COMPLETE' : 'ALL'
        const requestParams = {
          page: this.infiniteScroll.page,
          size: 7,
          postType: requestPostType,
          postStatus: requestPostStatus,
          commentUsed: false,
        }

        if(this.curClassSearchQuery.keyword === null && this.curClassSearchQuery.insertedUser === null && this.curClassSearchQuery.dayOfPosted === null) {
          requestParams.sort = 'posted,desc'
        }

        for (const [key, value] of Object.entries(this.curClassSearchQuery)) {
          if (value !== null)
            requestParams[key] = value
        }

        // this.$hiClass.clazzesPosts
        //   .search(requestParams, this.classId)
        //   .then(res => {
        //     this.setCurClazzesPosts(res.data._embedded.posts)

        //     // 게시글 목록 최초 조회시 로컬스토리지에 게시판, 폴더 진입시간 set
        //     if (this.infiniteScroll.page === 0 && requestParams.postType !== 'ALL') {
        //       const boardId = this.curClassSearchQuery.boardId
        //       const folderId = this.curClassSearchQuery.folderId
        //       this.$hiClass.setLastEntryBoardAndFolderTimestamp(eventBus, boardId, folderId)
        //     }

        //     const totalPages = res.data.page.totalPages
        //     const pageNumber = res.data.page.number

        //     if (totalPages > pageNumber + 1) {
        //       this.infiniteScroll.page++
        //       this.infiniteScroll.isListEnd = false
        //     } else {
        //       this.infiniteScroll.page = 0
        //       this.infiniteScroll.isListEnd = true
        //     }
        //   })
        //   .catch(error => {
        //     this.$log.debug(this.$options.name,'error:', error)
        //   })
        //   .finally(() => {
        //     this.setInfiniteScrollIsBusy(false)
        //   })

        try {
          this.$log.debug("requestParams", requestParams)
          const list = await this.$hiClass.clazzesPosts.search(requestParams, this.classId)
          this.setCurClazzesPosts(list.data._embedded.posts)

          // 게시글 목록 최초 조회시 로컬스토리지에 게시판, 폴더 진입시간 set
          if (this.infiniteScroll.page === 0 && requestParams.postType !== 'ALL') {
            const boardId = this.curClassSearchQuery.boardId
            const folderId = this.curClassSearchQuery.folderId
            this.$hiClass.setLastEntryBoardAndFolderTimestamp(eventBus, boardId, folderId)
          }

          const totalPages = list.data.page.totalPages
          const pageNumber = list.data.page.number

          if (totalPages > pageNumber + 1) {
            this.infiniteScroll.page++
            this.infiniteScroll.isListEnd = false
          } else {
            this.infiniteScroll.page = 0
            this.infiniteScroll.isListEnd = true
          }
        } catch (error) {
          this.$log.debug(this.$options.name,'error:', error)
        } finally {
          this.setInfiniteScrollIsBusy(false)
        }
      }

    },
    deleteNewList(newArr) {
      this.setCurClazzesPostsAfterDelete(newArr)
    }
  }
}
</script>

<style scoped>

</style>