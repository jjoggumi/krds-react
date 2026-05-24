<template>
  <div
    v-infinite-scroll="getCurSchoolsPosts"
    :infinite-scroll-disabled="infiniteScroll.isBusy"
    :infinite-scroll-distance="infiniteScroll.distance"
  >
    <main-body-clazzes-body-class-board-posts-loading-box
      v-if="curSchoolsPosts === undefined"
    ></main-body-clazzes-body-class-board-posts-loading-box>

    <component
      v-for="(schoolsPost, index) of curSchoolsPosts"
      :is="getComponentName(schoolsPost.postType)"
      :key="`school-post-${schoolsPost.currentId}-${index}`"
      :index="index"
      :schools-post="schoolsPost"
      :schools-posts="curSchoolsPosts"
      :school-type="''"
    ></component>

  </div>

</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";

import MainBodyClazzesBodyClassBoardPostsLoadingBox
  from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardPostsLoadingBox";
import CardItem from "@/components/Card/CardItem";
import CardAlarmPlus from "@/components/Card/CardAlarmPlus";

export default {
  name: "main-body-schools-body-school-board-school-posts",
  components: {CardAlarmPlus, CardItem, MainBodyClazzesBodyClassBoardPostsLoadingBox},
  props: {
    curForm: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      isListEnd: false,
      initScroll: false,
      curPage: process.env.VUE_APP_BASE_PAGE_START,
      curSize: process.env.VUE_APP_BASE_PAGE_MIN_SIZE,
    }
  },
  computed: {
    ...mapState({
      curSchoolItem: 'curSchoolItem',
      curSchoolSearchQuery: 'curSchoolSearchQuery',
      curSchoolsPosts: 'curSchoolsPosts',
      infiniteScroll: 'infiniteScroll',
    }),
    ...mapGetters({
      // curClassSchoolType: 'curClassSchoolType',
      // curClassClassName: 'curClassClassName',
    }),
    schoolId() {
      return this.curSchoolItem.currentId
    },
  },
  watch: {
    curForm() {
      this.initCurSchoolsPosts()
    }
  },
  mounted() {
    this.getCurSchoolsPosts()
  },
  beforeDestroy() {
    this.initCurSchoolsPosts()
  },
  methods: {
    ...mapMutations({
      setCurSchoolsPosts: 'setCurSchoolsPosts',
    }),
    initCurSchoolsPosts() {
      this.isListEnd = false
      this.initScroll = false
      this.curSize = parseInt(process.env.VUE_APP_BASE_PAGE_START, 10)
      this.curSize = parseInt(process.env.VUE_APP_BASE_PAGE_MIN_SIZE, 10)
      this.setCurSchoolsPosts(undefined)
    },
    async getCurSchoolsPosts() {
      if (!this.infiniteScroll.isBusy && !this.isListEnd) {
        this.$store.commit('setInfiniteScrollIsBusy', true)

        const requestPostType = this.curForm
        const requestParams = {
          page: this.curPage,
          size: this.curSize,
          sort: 'posted,desc',
          postType: requestPostType,
          postStatus: 'COMPLETE',
          commentUsed: false,
        }
        if (this.curForm === 'ALARM')
          requestParams.postType = ['ALARM', 'ALARM_PLUS']

        for (const [key, value] of Object.entries(this.curSchoolSearchQuery)) {
          if (value !== null)
            requestParams[key] = value
        }

        // this.$hiClass.schoolsPosts
        //   .search(requestParams, this.schoolId)
        //   .then(res => {
        //     this.setCurSchoolsPosts(res.data._embedded.posts)

        //     const totalPages = res.data.page.totalPages
        //     const pageNumber = res.data.page.number

        //     if (totalPages > pageNumber + 1) {
        //       this.curPage++
        //       this.isListEnd = false
        //     } else {
        //       this.curPage = 0
        //       this.isListEnd = true
        //     }
        //     this.initScroll = false
        //   })
        //   .catch(error => {
        //     this.$log.debug(this.$options.name,'error:', error)
        //   })
        //   .finally(() => {
        //     this.$store.commit('setInfiniteScrollIsBusy', false)
        //   })

        try {
          const res = await this.$hiClass.schoolsPosts.search(requestParams, this.schoolId)
          this.setCurSchoolsPosts(res.data._embedded.posts)

          const totalPages = res.data.page.totalPages
          const pageNumber = res.data.page.number

          if (totalPages > pageNumber + 1) {
            this.curPage++
            this.isListEnd = false
          } else {
            this.curPage = 0
            this.isListEnd = true
          }
          this.initScroll = false
        } catch (error) {
          this.$log.debug(this.$options.name,'error:', error)
        } finally {
          this.$store.commit('setInfiniteScrollIsBusy', false)
        }
      }
    },
    getComponentName(postType) {
      return postType === 'ALARM_PLUS'
        ? 'CardAlarmPlus'
        : 'CardItem'
    },
  }
}
</script>

<style scoped>

</style>