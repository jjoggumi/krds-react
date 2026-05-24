<!--
@File(Method): MainHeaderNotibox.vue
@Author: -
@Date Created: -
@Description: 공통 헤더 (알림함)
@Modified: 2024-10-08 - #69034 알림함에 레드닷이 없을 때 알림함을 클릭 시, 현재상태 재조회하여 레드닷 해제를 요청
-->
<template>
  <div class="alarm-popup-wrap" v-click-outside="hideAlarm">
    <div class="alarm-popup-box">
      <!-- top -->
      <div class="title-wrap">
        <div class="title">전체 알림</div>
      </div>
      <!-- top -->

      <!-- content -->
      <div class="cont-wrap">
        <!-- jquery scrollbar plugin 사용한 html 소스 -->
        <div class="scrollbar-outer">
          <ul
            v-infinite-scroll="getNotificationBoxes"
            :infinite-scroll-disabled="paging.isBusy"
            :infinite-scroll-distance="paging.scrollLimit"
          >
            <!-- noti item -->
            <MainHeaderNotiboxItem
              v-for="item in notificationBoxes"
              :key="item.currentId"
              :item="item"
              :user="user"
              @setIsShow="setIsShow"
              @hideAlarm="hideAlarm"
              @setIsOpenMemberApproval="setIsOpenMemberApproval"
            ></MainHeaderNotiboxItem>
            <!-- // noti item -->

            <MainLoadingScroll v-if="paging.isBusy"></MainLoadingScroll>

            <li
              v-if="isEmptyNoti"
              class="type-etc"
            >
              <div class="text-cont-full">
                <p class="nodata">최근 2주간 수신된 알림이 없습니다.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- content -->
    </div>
    <!-- :parentUriList="[]" -->
  </div>
</template>

<script>
import MainHeaderNotiboxItem from './MainHeaderNotiboxItem.vue'
import MainLoadingScroll from './MainLoadingScroll.vue'

export default {
  name: 'MainHeaderNotibox',
  props: {
    user: Object,
    isUnreadNotiAlarm: Boolean
  },
  components: {
    MainHeaderNotiboxItem,
    MainLoadingScroll
  },
  data: () => ({
    notificationBoxes: [],
    isLoadComplete: false,
    paging: {
      nextUri: '',
      isBusy: false,
      isListEnd: false,
      curPage: process.env.VUE_APP_BASE_PAGE_START,
      scrollLimit: process.env.VUE_APP_BASE_INFINITE_SCROLL_DISTANCE,
      curSize: process.env.VUE_APP_BASE_PAGE_SIZE
    },
    popup: {
      isOpen: false
    },
    curItem: {},
    readCount: 0,
    isOpenMemberApproval: false
  }),
  computed: {
    isEmptyNoti() {
      return this.isLoadComplete && this.notificationBoxes.length === 0;
    }
  },
  watch: {
    $route(to, from) {
      if (to.fullPath !== from.fullPath) {
        // alert(
        //   `to.fullPath => ${to.fullPath} <> from.fullPath => ${from.fullPath}`
        // )
        this.hideAlarm()
      }
    }
  },
  methods: {
    hideAlarm(event) {
      if (event && event.target.className && event.target.className.includes('swal2')) {
        return false
      }
      if (this.isOpenMemberApproval) {
        return false
      }

      if (this.popup.isOpen) this.popup.isOpen = false
      else this.$emit('hideAlarm')
    },
    setIsShow(obj) {
      // this.$emit("setIsShow", obj);
      if (obj.val) {
        let paramObj = {
          item: obj.item,
          list: [obj.item],
          totalElements: 1,
          // parentUriList: this.parentUriList,
          pagePerSize: 1
        }
        this.$store.commit('setItemDetailObj', paramObj)
        this.$store.commit('setIsShowDetailPostLayer', true)
        this.popup.isOpen = true
      } else if(obj.attendance) {
        this.popup.isOpen = true
      }
    },
    setIsOpenMemberApproval(isOpenMemberApproval) {
      this.isOpenMemberApproval = isOpenMemberApproval
    },
    async getNotificationBoxes() {
      if (this.paging.isListEnd) return false
      if (this.paging.isBusy) return false

      let params = {
        page: this.paging.curPage,
        size: this.paging.curSize,
        sort: 'timestamp,desc'
      }

      this.paging.isBusy = true

      try {
        const res = await this.$axios({
          method: "GET",
          url: `/notificationBoxes/user/${this.user.currentId}`,
          params: params
        })

        this.$log.debug(this.$options.name + ' getNotificationBoxes() result : ', res)
        this.paging.curPage++

        if (res.data.page.totalPages > this.paging.curPage) {
          this.paging.isListEnd = false
        } else {
          this.paging.isListEnd = true
        }
        this.paging.isBusy = false
        this.isLoadComplete = true

        if (res.data.page.totalElements > 0) {
          for (const item of res.data._embedded.notificationBoxes) {
            this.notificationBoxes.push(item)
          }
        }
      } catch (e) {
        this.$log.debug(this.$options.name + ' getNotificationBoxes() result : ', e)
        this.isLoadComplete = true
      }
    }
  },
  async created() {
    await this.getNotificationBoxes()

    let isForceUpdate = false

    if (!this.isUnreadNotiAlarm) { // 레드닷이 없을때
      try {
        const res = await this.$hiClass.notificationBadges.search({
          _user: this.user._links.self.href,
          _badgeCheck: false,
          size: 1
        })

        if (!res.data.badgeCheck) {
          isForceUpdate = true
        }
      } catch (error) {
        this.$log.debug(`${this.$options.name} notificationBadges() error: ${error}`)
      }
    }

    this.$emit('updateNotificationBadges', isForceUpdate)
  },
  mounted() {
    // this.$hiClass.toggleBodyClass('add', 'hidden')

    this.$nextTick(() => {
      this.$jqueryUtil.scrollbar()
    })
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  }
}
</script>

<style scoped>
#thumb1 {
  background-image: url('../../assets/img/profile_thumbnail/profile_thumbnail_1.png');
}
#thumb2 {
  background-image: url('../../assets/img/profile_thumbnail/profile_thumbnail_2.png');
}
#thumb3 {
  background-image: url('../../assets/img/profile_thumbnail/profile_thumbnail_3.png');
}
#thumb4 {
  background-image: url('../../assets/img/profile_thumbnail/profile_thumbnail_4.png');
}
#thumb5 {
  background-image: url('../../assets/img/profile_thumbnail/profile_thumbnail_5.png');
}
#thumb6 {
  background-image: url('../../assets/img/profile_thumbnail/profile_thumbnail_6.png');
}
</style>
