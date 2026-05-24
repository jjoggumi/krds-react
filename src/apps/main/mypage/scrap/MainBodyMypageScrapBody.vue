<template>
  <div class="left-wrap">
    <MainBodyClazzesBodyClassBoardLoadingItem
      v-if="!isInitComp && filteredUserScraps.length > 0"
    ></MainBodyClazzesBodyClassBoardLoadingItem>

    <template v-else-if="isInitComp && isExistPosts">

      <card-item
        v-for="(item, index) of filteredUserScraps"
        :key="item.currentId"
        :post="item.post"
        :posts="filteredUserScraps"
        :index="index"
        :school-type="getSchoolType(item)"
        :class-name="item.post.parent ? item.post.parent.className || '' :''"
        :is-show-folder-name="false"
      ></card-item>

      <!--
      <components
        v-for="(item, i) in filteredUserScraps"
        :item="item.post"
        :posts="filteredUserScraps"
        :key="item.currentId"
        :i="i"
        :is="getPostType(item.post)"
        :postUri="$axios.defaults.baseURL + '/posts/' + item.post.currentId"
        :parent="item.post.parent"
        :isClassActivated="isClassActivated(item.post.parent)"
        :isManager="isManagedPost(item.post)"
        @compScrap="compScrap"
      >
        <template
          v-if="item.post.postType === 'EVENT'"
          slot="headerTitle">
          <span>이벤트</span>
        </template>
      </components>
      -->

      <MainLoadingScroll v-if="isBusy" />
    </template>
    
    <template v-else-if="isChkRnbSearchForm && filteredUserScraps.length === 0">
      <!-- {{ $t('main.text.post.search.notFound') }} -->
      <NotResultForSearch
        :text="'검색 결과가 없습니다.'"
        :width="true"
      ></NotResultForSearch>
    </template>
    <template v-else-if="isInitComp && filteredUserScraps.length === 0">
      <!-- 스크랩한 게시물이 없습니다. -->
      <NotResult :text="'스크랩한 게시물이 없습니다.'"></NotResult>
    </template>
  </div>
</template>

<script>
import NotResultForSearch from './MainBodyMypageScrapNoSearchItem.vue'
import MainBodyClazzesBodyClassBoardLoadingItem from '../../clazzes/MainBodyClazzesBodyClassBoardPostsLoadingBox.vue'
import MainLoadingScroll from '../../MainLoadingScroll.vue'
import NotResult from './MainBodyMypageScrapNoItem.vue'
import CardItem from "@/components/Card/CardItem";

export default {
  name: 'main-body-mypage-scrap-body',
  components: {
    CardItem,

    NotResultForSearch,
    MainBodyClazzesBodyClassBoardLoadingItem,
    MainLoadingScroll,
    NotResult
  },
  props: {
    userScraps: {
      type: Array
    },
    filteredUserScraps: {
      type: Array
    },
    isChkRnbSearchForm: {
      type: Boolean
    },
    isInitComp: {
      type: Boolean
    },
    isBusy: {
      type: Boolean
    },
  },
  data() {
    return {
      isExistPosts: false
    }
  },
  computed: {},
  watch: {
    filteredUserScraps(val) {
      this.isExistPosts = val.length !== undefined && val.length > 0;
    }
  },
  methods: {
    compScrap(obj) {
      this.$emit('compScrap', obj)
    },
    isClassActivated(parent) {
      return parent && parent.classStatus !== undefined && parent.classStatus === 'ACTIVATE';
    },
    getPostType(post) {
      return post.postType === 'ALARM_PLUS' ? 'ALARM' : post.postType
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
    getSchoolType(item) {
      if (!item.post.parent) return ''
      if (item.post.parent.schoolType) return item.post.parent.schoolType
      return item.post.parent.school ? (item.post.parent.school.schoolType || '') : ''
    }
  },
}
</script>

<style scoped></style>
