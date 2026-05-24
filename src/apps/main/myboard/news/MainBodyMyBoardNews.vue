<template>
  <div class="scrap-cont-wrap clfix">
    <div
      v-infinite-scroll="searchSectionMainMore"
      :infinite-scroll-disabled="infiniteScroll.isBusy"
      :infinite-scroll-distance="infiniteScroll.distance"
      class="left-wrap"
    >
      <!-- TODO: test transition
        <transition name="fade" mode="in-out"></transition>
      -->

      <template v-if="contents.length === 0">
        <main-body-mypage-scrap-no-item
          v-if="infiniteScroll.isListEnd"
          :text="'최근 3개월간 업데이트 된 소식이 없습니다.'"
        />
        <main-body-clazzes-body-class-board-loading-item v-else />
      </template>

      <component
        v-for="(post, index) of contents"
        :is="getComponentName(post.postType)"
        :key="post.currentId"
        :post="post"
        :posts="contents"
        :index="index"
        :school-type="post.parent ? post.parent.schoolType || (post.parent.school ?  post.parent.school.schoolType : '') : ''"
        :class-name="post.parent ? post.parent.className || '' :''"
        :is-show-folder-name="false"
      ></component>

      <!--
      <components
        v-for="(item, i) of contents"
        :item="item"
        :posts="contents"
        :key="item.currentId"
        :i="i"
        :is="getPostType(item)"
        :postUri="$axios.defaults.baseURL + '/posts/' + item.currentId"
        :parent="item.parent"
        :isClassActivated="isClassActivated(item.parent)"
        :isManager="isManagedPost(item)"
        @compScrap="compScrap"
      >
        <template
          v-if="item.postType === 'EVENT'"
          slot="headerTitle">
          <span>이벤트</span>
        </template>
      </components>
      -->

      <main-loading-scroll v-if="infiniteScroll.isBusy" />
    </div>

  </div>
</template>

<script>
import {mapActions, mapState, mapGetters, mapMutations} from "vuex";
import {mapFields} from "vuex-map-fields";

import MainLoadingScroll from "@/apps/main/MainLoadingScroll";
import MainBodyMypageScrapNoItem from "@/apps/main/mypage/scrap/MainBodyMypageScrapNoItem";
import MainBodyClazzesBodyClassBoardLoadingItem from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardPostsLoadingBox";
import CardItem from "@/components/Card/CardItem";
import CardAlarmPlus from "@/components/Card/CardAlarmPlus";

export default {
  name: "main-body-my-board-news",
  components: {
    CardAlarmPlus,
    CardItem,
    MainBodyClazzesBodyClassBoardLoadingItem,
    MainBodyMypageScrapNoItem,
    MainLoadingScroll,
  },
  computed: {
    ...mapState('storeHome', {
      sectionMainMore: 'sectionMainMore',
      sectionMainMoreSectionId: 'sectionMainMoreSectionId'
    }),
    ...mapGetters('storeHome', {
      getSectionsBySectionType: 'getSectionsBySectionType'
    }),
    ...mapFields({
      infiniteScroll: 'infiniteScroll',
    }),
    contents() {
      return this.sectionMainMore && this.sectionMainMore.contents
        ? this.sectionMainMore.contents
        : []
    },
    /**
     * get current sectionId (news)
     * @returns {*|null|undefined}
     */
    getSections() {
      return this.getSectionsBySectionType({ sectionType: 'TAB' })
    },
    section() {
      return this.getSections.length > 0 ? this.getSections[0] : {}
    },
    tabs() {
      return this.section.tabs ? this.section.tabs.filter(tab => tab.isFeedType) : []
    },
    tab() {
      return this.tabs.length > 0 ? this.tabs[0] : {}
    },
    sectionId() {
      return this.tab ? this.tab.sectionId : null
    },
  },
  watch: {
    sectionMainMoreSectionId: {
      handler(val) {
        if (val) {
          this.searchSectionMainMore()
        } else {
          this.initInfiniteScroll()
          this.removeSectionMainMoreOnly()
        }
      }
    },
    sectionId: {
      handler(val) {
        if (val)
          this.setSectionMainMoreSectionId({ sectionId: val })
      }
    },
  },
  created() {
    this.setInfiniteScroll({
      isListEnd: false,
      isBusy: false,
      page: 0      
    })
  },
  mounted() {
    if (this.sectionMainMoreSectionId) {
      this.searchSectionMainMore()
    } else {
      this.getSectionMains()
    }
  },
  beforeDestroy() {
    this.initInfiniteScroll()
    this.removeSectionMainMoreOnly()
  },
  methods: {
    ...mapMutations({
      setInfiniteScroll: 'setInfiniteScroll'
    }),
    ...mapMutations('storeHome', {
      setSectionMainMoreSectionId: 'setSectionMainMoreSectionId'
    }),
    ...mapActions({
      isManagedPost: 'isManagedPost',
      initInfiniteScroll: 'initInfiniteScroll'
    }),
    ...mapActions('storeHome', {
      getSectionMains: 'getSectionMains',
      searchSectionMainMore: 'searchSectionMainMore',
      removeSectionMainMoreOnly: 'removeSectionMainMoreOnly'
    }),
    getComponentName(postType) {
      return postType === 'ALARM_PLUS'
        ? 'CardAlarmPlus'
        : 'CardItem'
    },
    compScrap(obj) {
      this.$emit('compScrap', obj)
      if (typeof obj === 'object') {
        this.contents[obj.index].isScrap = obj.isVal
      }
    },
    isClassActivated(parent) {
      return parent.classStatus !== undefined && parent.classStatus === 'ACTIVATE';
    },
    isManagedPost(post) {
      let flag = false
      // 클래스 관리자인 경우
      const postTypes = ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK']
      if (postTypes.includes(post.postType)) {
        const parentUri = post.parentUri
        let managedClassList = this.$store.state.clazzSubscribeViews.filter(
          d => {
            return d.memberRole === 'OWNER' || d.memberRole === 'MANAGER'
          }
        )
        managedClassList = managedClassList.filter(d => {
          return parentUri.includes(d.classId)
        })
        if (managedClassList.length > 0) flag = true
      }
      return flag
    },
    getPostType(post) {
      return post.postType === 'ALARM_PLUS' ? 'ALARM' : post.postType
    },
  }
}
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0.3;
}
</style>