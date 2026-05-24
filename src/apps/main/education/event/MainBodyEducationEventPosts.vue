<template>
  <div
    v-infinite-scroll="getPostList"
    :infinite-scroll-disabled="paging.postList.isBusy"
    :infinite-scroll-distance="paging.postList.scrollLimit"
    class="board-event__list"
  >
    <div v-for="item of postList" :key="item.currentId" class="board-event__item" role="button" @click="openDetailItem(item)">
      <div class="thumb">
        <img :src="item.thumbnailPath" alt="" />
        <div class="end-event" v-if="getItemDisplayStatus(item.displayStatus, item.isFinished) === 'CLOSED'">종료된 이벤트 입니다.</div>
      </div>

      <div class="info">
        <span class="label" :class="[getItemLabelClass(item.displayStatus, item.isFinished)]">
          {{ getItemLabelTitle(item.displayStatus, item.isFinished) }}
        </span>

        <strong class="heading">{{ item.postTitle }}</strong>
        <span class="date">{{ getEventDateStr(item.timestampStart, item.timestampEnd) }}</span>
      </div>
    </div>

    <main-loading-scroll v-if="paging.postList.isBusy" />

    <div v-if="isGetPostList && postList.length === 0" class="board__nodata">
      <p>등록된 게시물이 없습니다.</p>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';
import { eventBus } from '@/main';

import ErrorLoadFailAsyncComponent from '@/apps/error/ErrorLoadFailAsyncComponent';
import EventMixin from "@/apps/events/mixins/EventMixin";

const MainLoadingScroll = () => ({
  component: import('@/apps/main/MainLoadingScroll'),
  error: ErrorLoadFailAsyncComponent,
});

export default {
  name: 'main-body-education-event-posts',
  components: {
    MainLoadingScroll,
  },
  mixins: [EventMixin],
  data() {
    return {
      isLoaded: false,
      isGetPostList: false,
      isShow: false,
      category: {
        status: null,
      },
      curSelectedCategory: null,
      informations: [],
      post: {},
      postList: [],
      paging: {
        postList: {
          isBusy: false,
          isListEnd: false,
          curPage: process.env.VUE_APP_BASE_PAGE_START,
          curSize: process.env.VUE_APP_BASE_PAGE_SIZE,
          // scrollLimit: process.env.VUE_APP_BASE_INFINITE_SCROLL_DISTANCE
          scrollLimit: 500,
        },
      },
    };
  },
  created() {
    this.getFullScreenEvents()
    this.getInformationList();
  },
  mounted() {
    this.getPostList(true);

    eventBus.$on('set-event-category-status', (categoryStatus) => {
      this.setEventCategoryStatus(categoryStatus);
    });
    eventBus.$on('get-event-post-list', (initFlag) => {
      this.getPostList(initFlag);
    });
  },
  beforeDestroy() {
    eventBus.$off('set-event-category-status');
    eventBus.$off('get-event-post-list');
  },
  methods: {
    ...mapMutations({
      setIsShowDetailPostLayer: 'setIsShowDetailPostLayer',
      setItemDetailObj: 'setItemDetailObj',
    }),
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    getPostList(initFlag) {
      let type = 'postList';

      if (initFlag) this.initForm();

      if (this.paging[type].isListEnd === true) {
        return;
      }

      if (!this.paging[type].isBusy && !this.paging[type].isListEnd) {
        this.paging[type].isBusy = true;

        // 서버 시간으로 변경 필요
        let currentTimestamp = this.$moment().valueOf();
        let that = this;
        let params = {
          postStatus: 'COMPLETE',
          postType: ['EVENT'],
          postedLte: currentTimestamp, // postedRange 미사용 시 필요
          userType: this.$store.state.user.userType || '',
          page: this.paging[type].curPage,
          size: this.paging[type].curSize,
          sort: 'posted,desc',
        };
        params.mode = 'MAIN';

        if (this.category.status !== null) {
          params.displayStatus = this.category.status.split(',');
        }

        this.$hiClass.postMains
          .search(params)
          .then((res) => {
            this.$log.debug(this.$options.name + ' getPostList() res => ', res);

            let filteredList = res.data._embedded.postViews.filter(function (d) {
              return !that.$hiClass.isReserved(d.posted);
            });
            if (filteredList.length > 0) {
              this.postList.push(...filteredList);

              this.paging[type].curPage++;
            } else {
              this.paging[type].isListEnd = true;
            }

            this.isGetPostList = true;
            this.paging[type].isBusy = false;
          })
          .catch((error) => {
            this.$log.debug(this.$options.name + ' getPostList() error => ', error);
          });
      }
    },
    initForm() {
      this.paging.postList.isListEnd = false;
      this.paging.postList.curPage = 0;
      this.isGetPostList = false;

      this.postList.splice(0);
    },
    getInformationList() {
      const params = {
        _infoType: 'EVENT',
        _infoStatus: 'ACTIVATE',
        sort: 'posted,desc',
      };
      this.$hiClass.informations.search(params).then((result) => {
        this.informations = result.data._embedded.informations;
      });
    },
    createParentUriList(informations) {
      let arr = [];
      for (let idx in informations) {
        let obj = {
          type: 'eduInfo',
          uri: informations[idx]._links.self.href,
          orgName: informations[idx].infoTitle,
        };
        arr.push(obj);
      }
      return arr;
    },
    getEventDateStr(timestampStart, timestampEnd) {
      const dateFormat = 'YYYY.MM.DD';
      const startDate = timestampStart ? this.$moment(timestampStart).format(dateFormat) : '';
      const endDate = timestampEnd ? this.$moment(timestampEnd).format(dateFormat) : '';
      return `${startDate} ~ ${endDate}`;
    },
    getItemDisplayStatus(displayStatus, isFinished) {
      return isFinished ? 'CLOSED' : displayStatus;
    },
    getItemLabelClass(displayStatus, isFinished) {
      const itemDisplayStatus = this.getItemDisplayStatus(displayStatus, isFinished);
      let itemLabelClass = '';
      switch (itemDisplayStatus) {
        case 'CLOSED':
          itemLabelClass = 'end';
          break;
        case 'PROGRESSING':
          itemLabelClass = 'ing';
          break;
        case 'EXPECTED':
          itemLabelClass = 'waiting';
          break;
      }
      return itemLabelClass;
    },
    getItemLabelTitle(displayStatus, isFinished) {
      const itemDisplayStatus = this.getItemDisplayStatus(displayStatus, isFinished);
      let itemLabelTitle = '';
      switch (itemDisplayStatus) {
        case 'CLOSED':
          itemLabelTitle = '종료';
          break;
        case 'PROGRESSING':
          itemLabelTitle = '진행중';
          break;
        case 'EXPECTED':
          itemLabelTitle = '진행예정';
          break;
      }
      return itemLabelTitle;
    },
    openDetailItem(item) {
      if (this.getEventName(item.currentId) !== '') {
        window.open(`/event/${this.getEventName(item.currentId)}`);
        return;
      }

      if (item.postType === 'EDUCATION' || item.postType === 'EVENT' || item.postType === 'HINOTICE') {
        this.triggerAnalyticsLogEvent({ code: `analytics.information.${item.postType.toLowerCase()}.click.contentDetail` });
      }

      this.$axios({
        method: 'get',
        url: `/posts/${item.currentId}`,
      }).then((res) => {
        const post = res.data;
        const obj = {
          item: post,
          list: this.postList,
          parentUriList: this.createParentUriList(this.informations),
          pagePerSize: this.paging.postList.curSize,
        };

        this.setItemDetailObj(obj);
        this.setIsShowDetailPostLayer(true);
      });
    },

    setEventCategoryStatus(CategoryStatus) {
      this.category.status = CategoryStatus;
    },
  },
};
</script>

<style scoped>
.thumb .end-event {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 400;
}
</style>
