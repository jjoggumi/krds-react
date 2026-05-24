<template>
  <div
    v-infinite-scroll="getSearchList"
    :infinite-scroll-disabled="infiniteScrollDisabled"
    :infinite-scroll-distance="infiniteScrollDistance"
    class="column-content"
    :class="{ 'column-full': false }"
  >
    <main-body-schools-body-school-board
      v-if="isShowSchoolBoard && !refreshFlag"
      :key="`${curForm}-${curFormRefreshCount}`"
      :cur-form="curForm"
    ></main-body-schools-body-school-board>
  </div>

<!--  <MainBodyClazzesBodyClassBoardLoadingItem
    v-if="!isInitComp && isLoadingView && posts.length > 0"
  ></MainBodyClazzesBodyClassBoardLoadingItem>-->


<!--  <div class="school-class-cont-left-wrap">
    <template v-else-if="isInitComp || !isLoadingView">
      &lt;!&ndash; 학교 게시글 검색 결과 (상단) &ndash;&gt;
      <main-body-schools-body-search-result-top
        v-if="curSchoolSearchQuery.keyword"
      />

      &lt;!&ndash; 설문 회신 여부 탭 &ndash;&gt;
      <main-body-schools-body-top
        :curForm="curForm"
        :alarmPlusQuery="alarmPlusQuery"
      />

      <component
        v-if="isExistPosts"
        :is="curForm"
        :key="curForm"
        :posts="posts"
        :schoolURI="schoolUri"
      ></component>

      <MainLoadingScroll v-if="isBusy && isExistPosts"></MainLoadingScroll>

      <MainBodySchoolsBodyEmpty
        :searchKeyword="searchKeyword"
        :text="$t('main.text.post.notFound')"
        v-else-if="!isExistPosts"
      ></MainBodySchoolsBodyEmpty>
    </template>
  </div>-->

</template>

<script>
import {mapFields} from "vuex-map-fields";

import MainBodySchoolsBodySchoolBoard from "@/apps/main/schools/MainBodySchoolsBodySchoolBoard";
import {mapState} from "vuex";
import {eventBus} from "@/main";

export default {
  name: 'mainBodySchoolsBody',
  props: [
    'curForm',

    'schoolUri',
    'schoolUuid',
    'contentKeyword',
    'posts',
    'searchKeyword',
    'isInitComp',
    'isBusy',
    'alarmPlusQuery'
  ],
  components: {
    MainBodySchoolsBodySchoolBoard,
  },
  data() {
    return {
      // isExistPosts: false,

      refreshFlag: false,
      curFormRefreshCount: 0,
    }
  },
  computed: {
    ...mapState({
      infiniteScroll: 'infiniteScroll',
    }),

    /*...mapFields({
      curSchoolSearchQuery: 'curSchoolSearchQuery'
    }),*/

    /*isLoadingView() {
      let flag = false
      let arr = ['ALL', 'MEAL', 'NOTICE', 'ALARM', 'ALARM_PLUS']

      if (arr.indexOf(this.curForm) > -1) {
        flag = true
      }
      return flag
    },*/
    isShowSchoolBoard() {
      return [
        'ALL',
        'ALARM',
        'ALARM_PLUS',
        'MEAL',
        'NOTICE',
        'ALARM_EDU_OFFICE'
      ].includes(this.curForm)
    },
    infiniteScrollDisabled() {
      return this.infiniteScroll.isBusy
    },
    infiniteScrollDistance() {
      return this.infiniteScroll.distance
    },
  },
  watch: {
    /*posts(val) {
      this.isExistPosts = val.length !== undefined && val.length > 0;
    }*/
  },
  created() {},
  mounted() {
    eventBus.$on('increase-cur-form-refresh-count', () => {
      this.refreshFlag = true
      this.curFormRefreshCount++
      this.$nextTick(() => this.refreshFlag = false)
    })
  },
  beforeDestroy() {
    eventBus.$off('increase-cur-form-refresh-count')
  },
  methods: {
    getSearchList() {
      if (!this.infiniteScroll.isBusy
        && !this.infiniteScroll.isListEnd
        && this.infiniteScroll.page > 0
      ) {
        this.$log.debug(
          this.curForm,
          'this.infiniteScroll.isBusy => ',
          this.infiniteScroll.isBusy,
          'this.infiniteScroll.isListEnd => ',
          this.infiniteScroll.isListEnd
        )
        // get form list
        eventBus.$emit('do-search-resource', false)

        // if (this.isUseInfiniteScrollPostFiles) {
        //   // get post files
        //   eventBus.$emit('get-cur-post-files')
        // }
      }
    },
  }
}
</script>
