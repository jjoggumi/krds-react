<template>
  <div
    class="modal normal-modal note-notice-modal note-notice-edit-modal"
    style="display: block;"
  >
    <div
      class="modal-cont-wrap"
      style="margin-top: -194px; margin-left: -193px;"
      v-click-outside="close"
    >
      <div class="modal-cont boundary-box-386">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap popup-tit mb-00">
            <div class="title"><slot name="title">팝업 타이틀</slot></div>
          </div>
          <div
            class="scrollbar-outer c-member-wrap like-mem scroll-content scroll-scrolly_visible"
            style="height: auto; margin-bottom: 0px; margin-right: 0px; max-height: 420px;"
            v-infinite-scroll="getUserLikes"
            :infinite-scroll-disabled="paging.userLikes.isBusy"
            :infinite-scroll-distance="paging.userLikes.scrollLimit"
          >
            <ul>
              <like-list-popup-item
                v-for="userLike of userLikes"
                :key="userLike.currentId"
                :writeUser="userLike.writeUser"
                :isClassPost="isClassPost"
              />
            </ul>
          </div>
        </div>
        <div class="modal-close-btn modal-close-icon" @click="close"></div>
      </div>
    </div>
  </div>
</template>

<script>
import LikeListPopupItem from './LikeListPopupItem'

export default {
  name: 'like-list-popup',
  components: {
    LikeListPopupItem
  },
  props: {
    postId: String,
    isClassPost: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      userLikes: [],
      paging: {
        userLikes: {
          isBusy: false,
          isListEnd: false,
          isGetUserLikes: false,
          curPage: process.env.VUE_APP_BASE_PAGE_START,
          curSize: process.env.VUE_APP_BASE_PAGE_SIZE,
          scrollLimit: process.env.VUE_APP_BASE_INFINITE_SCROLL_DISTANCE,
          nextUri: ''
        }
      }
    }
  },
  computed: {},
  methods: {
    close() {
      this.$store.commit('setCurPostLike', {
        isOpen: false,
        postId: null
      })
    },
    initForm() {
      this.paging.userLikes.isListEnd = false
      this.paging.userLikes.curPage = 0
      this.paging.userLikes.isGetUserLikes = false

      this.userLikes.splice(0)
    },
    async getUserLikes() {
      let type = 'userLikes'

      if (this.paging[type].isListEnd === true) {
        return
      }

      if (!this.paging[type].isBusy && !this.paging[type].isListEnd) {
        this.paging[type].isBusy = true

        let params = {
          postId: this.postId,
          page: this.paging[type].curPage,
          size: this.paging[type].curSize,
          sort: 'insertedTimestamp,desc'
        }

        // this.$hiClass.userLikes
        //   .search(params)
        //   .then(res => {
        //     this.$log.debug(this.$options.name + ' getUserLikes() res => ', res)

        //     this.userLikes.push(...res.data._embedded.userLikeSearches)

        //     this.paging[type].isGetUserLikes = true
        //     this.paging[type].isBusy = false

        //     try {
        //       if (res.data._links.next) {
        //         this.paging[type].nextUri = res.data._links.next.href
        //         this.paging[type].curPage++
        //       } else {
        //         this.paging[type].nextUri = ''
        //         this.paging[type].isListEnd = true
        //       }
        //     } catch (error) {
        //       this.$log.debug(error)
        //       this.paging[type].nextUri = ''
        //       this.paging[type].isListEnd = true
        //     }
        //   })
        //   .catch(error => {
        //     this.$log.debug(
        //       this.$options.name + ' getUserLikes() error => ',
        //       error
        //     )
        //   })

        try {
          const res = await this.$hiClass.userLikes.search(params)

          this.$log.debug(this.$options.name + ' getUserLikes() res => ', res)
          
          this.userLikes.push(...res.data._embedded.userLikeSearches)

          this.paging[type].isGetUserLikes = true
          this.paging[type].isBusy = false

          try {
            // if (res.data._links.next) {
            //   this.paging[type].nextUri = res.data._links.next.href
            //   this.paging[type].curPage++
            // } else {
            //   this.paging[type].nextUri = ''
            //   this.paging[type].isListEnd = true
            // }

            if(res.data.page.number + 1 === res.data.page.totalPages) {
              this.paging[type].isListEnd = true
              this.paging[type].nextUri = ''
            } else {
              this.paging[type].curPage++
              this.paging[type].nextUri = res.data._links.self.href
            }
          } catch (error) {
            this.$log.debug(error)
            this.paging[type].nextUri = ''
            this.paging[type].isListEnd = true
          }
        } catch (error) {
          this.$log.debug(
            this.$options.name + ' getUserLikes() error => ',
            error
          )
        }
      }
    }
  },
  created() {
    this.initForm()

    this.getUserLikes()
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    this.$nextTick(() => {
      this.$jqueryUtil.scrollbar()
    })
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  }
}
</script>

<style lang="scss" >
.popup-tit{ border-bottom:1px solid #e0e0e0; }
.c-member-wrap {
  border-radius: 0 0 20px 20px;
  height: 420px;

  &.student-wrap {
    height: 72px;
  }
}
</style>
