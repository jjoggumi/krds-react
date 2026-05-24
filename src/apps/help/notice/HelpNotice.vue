<template>
  <div class="right-cont-wrap">
    <div class="contetns-title-wrap">
      <div class="title">{{ $t('help.notice.title') }}</div>
    </div>
    <div class="customer-notice-cont-wrap">
      <div
        v-infinite-scroll="getNotices"
        :infinite-scroll-disabled="isInfiniteScrollDisable"
        :infinite-scroll-distance="option.scrollLimit"
        class="accordion-wrap boundary-box"
      >
        <div
          v-for="(item, i) in items.notices"
          :key="item.currentId"
          class="accordion-item"
        >
          <div class="accordion-title-wrap" @click="openDetailItem(item)">
            <div class="title-wrap notice">
              <div class="title-text-wrap">
                <div class="title">
                  <strong>{{ item.postTitle }}</strong>
                </div>
                <div class="date">
                  {{ $moment(item.posted).format('YYYY.MM.DD') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'helpNotice',
  props: {
    isLogin: Boolean
  },
  data() {
    return {
      option: {
        currentId: '',
        scrollBusy: false,
        scrollLimit: parseInt(
          process.env.VUE_APP_BASE_INFINITE_SCROLL_DISTANCE,
          10
        )
      },
      searchForm: {
        _postedLte: '',
        _postStatus: 'COMPLETE',
        _postLand: 'TIMELINE',
        _postType: ['HINOTICE'],
        page: parseInt(process.env.VUE_APP_BASE_PAGE_START, 10),
        size: parseInt(process.env.VUE_APP_BASE_PAGE_SIZE, 10),
        sort: 'posted,desc'
      },
      items: {
        notices: [],
        noticesLimit: 0,
        totalElements: null
      }
    }
  },
  computed: {
    isLast() {
      if (this.items.notices.length === 0) {
        return false
      }
      return this.items.notices.length >= this.items.noticesLimit
    },
    userType() {
      return this.$store.state.user.userType || ''
    },
    isInfiniteScrollDisable() {
      return this.isLast || this.option.scrollBusy
    }
  },
  created() {
    if (!this.isLogin) {
      alert('권한이 없습니다.')
      this.$router.push('/', () => {
      })
    }
  },
  mounted() {
    this.searchForm._postedLte = this.$moment().valueOf()
  },
  methods: {
    getNotices() {
      if (!this.option.scrollBusy) {
        this.option.scrollBusy = true

        if (this.isLast) {
          return false
        }
        this.searchForm._userType = this.userType

        this.$hiClass.posts.search(this.searchForm)
          .then(res => {
            res.data._embedded.posts.map(item => {
              this.items.notices.push(item)
            })
            this.searchForm.page++
            this.items.noticesLimit = res.data.page.totalElements || 0
            this.items.totalElements = this.items.noticesLimit
          })
          .catch(err => {
            this.$log.debug(this.$options.name, ' getNotices() error => ', err)
          })
          .finally(() => {
            this.option.scrollBusy = false

            let noScrollbar = false
            if ($(document).height() === $(window).height())
              noScrollbar = true

            if (!this.isLast && noScrollbar && this.items.totalElements > 0) this.getNotices()
          })
      }
    },
    openDetailItem(item) {
      let obj = {
        item: item,
        list: this.items.notices,
        totalElements: this.items.noticesLimit,
        pagePerSize: process.env.VUE_APP_BASE_PAGE_SIZE || 20,
      }
      this.$store.commit('setItemDetailObj', obj)
      this.$store.commit('setIsShowDetailPostLayer', true)
    }
  }
}
</script>
