<template>

  <div class="scrap-cont-wrap clfix">

    <div class="select-view-style-wrap">
      <template v-for="(tab, i) of tabList">
        <button
          :key="`button-${i}`"
          :class="{ on: i === curTabIdx }"
          @click="tabClick((curTabIdx = i))"
        >
          <span>{{ tab.name }}</span>
        </button>
        <div :key="i" v-if="tabList.length - 1 !== i" class="bar"></div>
      </template>
    </div>

    <div
      v-infinite-scroll="searchPostNotReplies"
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
          :text="tabList[curTabIdx].emptyMsg"
        />
        <main-body-clazzes-body-class-board-loading-item v-else />
      </template>

      <card-alarm-plus
        v-for="(post, index) of contents"
        :key="`${post.currentId}-${index}`"
        :schools-post="post"
        :schools-posts="contents"
        :index="index"
      />

      <main-loading-scroll v-if="infiniteScroll.isBusy" />
    </div>

</div>

</template>

<script>
import {mapActions, mapState} from "vuex";
import {mapFields} from "vuex-map-fields";

import MainLoadingScroll from "@/apps/main/MainLoadingScroll";
import MainBodyMypageScrapNoItem from "@/apps/main/mypage/scrap/MainBodyMypageScrapNoItem";
import MainBodyClazzesBodyClassBoardLoadingItem from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardPostsLoadingBox";
import CardAlarmPlus from "@/components/Card/CardAlarmPlus";

export default {
  name: "main-body-my-board-alarm-plus",
  components: {
    CardAlarmPlus,
    MainBodyClazzesBodyClassBoardLoadingItem,
    MainBodyMypageScrapNoItem,
    MainLoadingScroll,
  },
  data() {
    return {
      tabList: [
        { name: '미회신', param: 'NONE', emptyMsg: '미회신한 설문이 없습니다.' },
        { name: '회신완료', param: 'YES', emptyMsg: '회신완료된 설문이 없습니다.' },
      ],
      curTabIdx: 0,
    }
  },
  computed: {
    ...mapState('storeMyBoard', {
      postNotReplies: 'postNotReplies',
    }),
    ...mapFields({
      infiniteScroll: 'infiniteScroll',
    }),
    ...mapFields('storeMyBoard', {
      searchPostNotRepliesQuery: 'searchPostNotRepliesQuery'
    }),
    contents() {
      return this.postNotReplies && this.postNotReplies.posts
        ? this.postNotReplies.posts
        : []
    }
  },
  created() {},
  mounted() {
    this.searchPostNotReplies()
  },
  beforeDestroy() {
    this.searchPostNotRepliesQuery.reply = this.tabList[0].param
    this.initInfiniteScroll()
    this.removePostNotReplies()
  },
  methods: {
    ...mapActions({
      initInfiniteScroll: 'initInfiniteScroll'
    }),
    ...mapActions('storeMyBoard', {
      searchPostNotReplies: 'searchPostNotReplies',
      removePostNotReplies: 'removePostNotReplies',
    }),
    compScrap(obj) {
      this.$emit('compScrap', obj)
    },
    isClassActivated(parent) {
      return parent.classStatus !== undefined && parent.classStatus === 'ACTIVATE';
    },
    getPostType(post) {
      return post.postType === 'ALARM_PLUS' ? 'ALARM' : post.postType
    },
    tabClick(idx) {
      this.searchPostNotRepliesQuery.reply = this.tabList[idx].param
      this.initInfiniteScroll()
      this.removePostNotReplies()
      this.searchPostNotReplies()
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

.select-view-style-wrap {margin: 32px 0 0 0; padding:0 0 20px 0;}
.select-view-style-wrap:first-child {margin: 10px 0 0;}
.select-view-style-wrap .bar {width:2px;height:18px;margin:0 12px;background:rgba(0,0,0,0.1);}
.select-view-style-wrap > * {display:inline-block;vertical-align:middle;}

.select-view-style-wrap {
  button:before {display:inline-block;content:'';/*width:24px;*/ height:24px;margin:0 0 0 0;vertical-align:middle;}
  button:hover:before {background-position:-24px 0;}
  button.dis:before {background-position:-48px 0;}
  button span {display:inline-block;font-size:16px;vertical-align:middle;font-weight: 700;color: #606164;transform: skew(0.2deg);}
  button:hover span {color:#3867c6;}
  button.on span {color:#3867c6;}
  button.on:before {background-position:-24px 0;}
}
</style>