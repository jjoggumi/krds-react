<!--
@File(Method): 
@Author: -
@Date Created: -
@Description: 공지사항 
@ETC : 서비스 제공 안되는 페이지 (삭제 요망) 
-->
<template>
  <div class="m-wrap">
    <div class="m-container">
      <div class="m-area-list">
        <div class="customer-notice-cont-wrap">
          <div
            class="accordion-wrap boundary-box"
            v-infinite-scroll="getNoices"
            :infinite-scroll-disabled="option.scrollBusy"
            :infinite-scroll-distance="option.scrollLimit"
          >
            <div
              class="accordion-item"
              v-for="(item, i) in items.notices"
              :key="item.currentId"
              :class="{ on: option.currentId == item.currentId }"
            >
              <div
                class="accordion-title-wrap"
                @click="setNoticeId(item.currentId)"
              >
                <div class="title-wrap">
                  <div
                    class="title-num-wrap"
                    :class="{ 'necessary-read': item.noticeMustRead }"
                  >
                    <table-column-index
                      :total="items.noticesLimit"
                      :index="i"
                    />
                  </div>
                  <div class="title-text-wrap">
                    <strong>{{ item.noticeTitle }}</strong>
                    <span class="date">{{
                      $moment(item.insertedTimestamp).format('YYYY.MM.DD')
                    }}</span>
                  </div>
                </div>
                <div class="accordion-oc-btn-wrap">
                  <button></button>
                </div>
              </div>
              <div
                v-if="option.currentId == item.currentId"
                class="accordion-cont-wrap"
              >
                <div class="accordion-cont-inner">
                  <div
                    class="accordion-cont"
                    v-autolinker:[$className]="item.noticeContent"
                  ></div>
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
import TableColumnIndex from '../../../../components/TableColumns/TableColumnIndex'

export default {
  name: 'MobileHelpNotice',
  components: {
    TableColumnIndex
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
        _userType: this.$route.query.userType || 'TEACHER',
        _postStatus: 'COMPLETE',
        _postedLte: null,
        page: parseInt(process.env.VUE_APP_BASE_PAGE_START, 10),
        size: parseInt(process.env.VUE_APP_BASE_PAGE_SIZE, 10),
        sort: 'posted,desc'
      },
      items: {
        notices: [],
        noticesLimit: 0
      }
    }
  },
  computed: {
    isLast() {
      if (this.items.notices.length == 0) {
        return false
      }
      return this.items.notices.length >= this.items.noticesLimit
    }
  },
  mounted() {},
  methods: {
    setNoticeId(currentId) {
      if (this.option.currentId == currentId) {
        this.option.currentId = ''
      } else {
        this.option.currentId = currentId
      }
    },
    getNoices() {
      if (this.searchForm._userType) {
        this.option.scrollBusy = true
        if (this.isLast) {
          return
        }

        this.searchForm._postedLte = this.$moment().valueOf()
        this.$hiClass.helpNotices
          .search(this.searchForm)
          .then(res => {
            res.data._embedded.helpNotices.map(item => {
              this.items.notices.push(item)
            })
            this.searchForm.page++
            this.items.noticesLimit = res.data.page.totalElements || 0
          })
          .catch(err => {
            this.$log.debug(this.$options.name, ' getNoices() error => ', err)
          })
          .finally(() => (this.option.scrollBusy = false))
      }
    }
  }
}
</script>

<!--<style scoped src="../../../../assets/css/m-customer.css" />-->
