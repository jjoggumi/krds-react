<!--
@File(Method): CommentReactionList.vue
@Author: -
@Date Created: -
@Description:  댓글 > 반응한 이모티콘 hover > 반응한 사람들 
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
-->
<template>
  <div
      class="modal normal-modal slick-modal view-main-detail-modal ofy"
      id="reactionModalListModal"
      style="display: block"
  >
    <div class="modal-cont-wrap" ref="scrollArea">
      <div class="modal-cont">
        <div class="modal-cont-inner">
          <div class="reaction-modal-list">
            <div class="container">
              <div class="title-wrap">
                <h2>반응한 사람들</h2>
              </div>

              <div class="search-wrap" 
                :class="{
                  'no-total': getSearchListAll === false
                }"  
              >
                <span class="total" 
                  :class="{
                    selected: this.search.iconId === ''
                  }"
                  @click="getSearch('total')">
                  <span>전체 {{ count.total }}</span>
                </span>
                <span class="check" 
                  v-if="count.check > 0"
                  :class="{
                    selected: this.search.iconId === reactionIds[0]
                  }"
                  @click="getSearch(reactionIds[0])">
                  <span :class="{'my':isMyReaction.check }">
                    <i class="reaction-check"></i>{{ count.check }}
                  </span>
                </span>
                <span class="ok" 
                  v-if="count.ok > 0"
                  :class="{
                    selected: this.search.iconId === reactionIds[1]
                  }"
                  @click="getSearch(reactionIds[1])">
                  <span :class="{'my':isMyReaction.ok }">
                    <i class="reaction-ok"></i>{{ count.ok }}
                  </span>
                </span>
                <span class="no" 
                  v-if="count.no > 0"
                  :class="{
                    selected: this.search.iconId === reactionIds[2]
                  }"
                  @click="getSearch(reactionIds[2])">
                  <span :class="{'my':isMyReaction.no }">
                    <i class="reaction-no"></i>{{ count.no }}
                  </span>
                </span>
                <span class="like" 
                  v-if="count.like > 0"
                  :class="{
                    selected: this.search.iconId === reactionIds[3]
                  }"
                  @click="getSearch(reactionIds[3])">
                  <span :class="{'my':isMyReaction.like }">
                    <i class="reaction-like"></i>{{ count.like }}
                  </span>
                </span>
                <span class="heart" 
                  v-if="count.heart > 0"
                  :class="{
                    selected: this.search.iconId === reactionIds[4]
                  }"
                  @click="getSearch(reactionIds[4])">
                  <span :class="{'my':isMyReaction.heart }">
                    <i class="reaction-heart"></i>{{ count.heart }}
                  </span>
                </span>
                <span class="joy"
                      v-if="count.joy > 0"
                      :class="{
                    selected: this.search.iconId === reactionIds[5]
                  }"
                      @click="getSearch(reactionIds[5])">
                  <span :class="{'my':isMyReaction.joy }">
                    <i class="reaction-joy"></i>{{ count.joy }}
                  </span>
                </span>
                <span class="sad"
                      v-if="count.sad > 0"
                      :class="{
                    selected: this.search.iconId === reactionIds[6]
                  }"
                      @click="getSearch(reactionIds[6])">
                  <span :class="{'my':isMyReaction.sad }">
                    <i class="reaction-sad"></i>{{ count.sad }}
                  </span>
                </span>
                <span class="sad"
                      v-if="count.surprise > 0"
                      :class="{
                    selected: this.search.iconId === reactionIds[7]
                  }"
                      @click="getSearch(reactionIds[7])">
                  <span :class="{'my':isMyReaction.surprise }">
                    <i class="reaction-surprise"></i>{{ count.surprise }}
                  </span>
                </span>
              </div>

              <div class="list-wrap">
                <div class="list-data" 
                  v-for="(item, index) of list"
                  :key="`${item.iconId}-${index}`"  
                >
                  <span class="profile">
                    <img :src="userPhoto(item.userPhoto)" @error="userPhotoReplace" alt="">
                  </span>
                  <span class="reaction">
                    <i :class="{
                      'reaction-check': item.iconId === reactionIds[0], 
                      'reaction-ok': item.iconId === reactionIds[1],
                      'reaction-no': item.iconId === reactionIds[2],
                      'reaction-like': item.iconId === reactionIds[3],
                      'reaction-heart': item.iconId === reactionIds[4],
                      'reaction-joy': item.iconId === reactionIds[5],
                      'reaction-sad': item.iconId === reactionIds[6],
                      'reaction-surprise': item.iconId === reactionIds[7],
                    }"></i>
                  </span>
                  <span v-if="item.userId === user.currentId" 
                    class="my">나</span>
                  <span class="user">{{ getName(item) }}</span>
                </div>
                
                <div ref="scrollListAccess"></div>
              </div>
              
              <div class="btn-wrap">
                <button class="hi-btn btn-lg" @click="close">확인</button>
              </div>

              <div class="modal-close-btn" @click="close"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import {UserLevel, URLProps} from "@/enums";

export default {
  name: "comment-reaction-list",
  props: {
    commentId: String,
    isClassPostForNameCheck: Boolean
  },
  data() {
    return {
      count: {
        total: 0,
        check: 0,
        ok: 0,
        no: 0,
        like: 0,
        heart: 0,
        joy: 0,
        sad: 0,
        surprise: 0,
      },
      search: {
        iconId: ""
      },
      list: [],
      searchParams: {
        page: 0,
        size: 40,
        iconId: '',
        sort: 'reactionTimestamp,desc'
      },
      isMyReaction: {
        check: false,
        ok: false,
        no: false,
        like: false,
        heart: false,
        joy: false,
        sad: false,
        surprise: false
      },
      loadFinish: false,
      obsRef: null,
      observer: null
    }
  },
  computed: {
    ...mapState({
      user: 'user',
      reactionIds: 'reactionIds'
    }),
    getSearchListAll() {
      return this.count.check > 0 && this.count.ok > 0 && this.count.no > 0 && this.count.like > 0 && this.count.heart > 0 && this.count.joy > 0 && this.count.sad > 0 && this.count.surprise > 0
    }
  },
  methods: {
    async getList() {
      try {
        // this.count.total = 0
        const cntRes = await this.$axios({
          method: 'GET',
          url: `/commentReactions/count/${this.commentId}`,
          params: {
            userId: this.user.currentId
          }
        })

        let total = 0
        const counts = cntRes.data._embedded.commentReactionCounts
        this.reactionMyInit()
        counts.forEach(item => {
          if(item.iconId === this.reactionIds[0]) {
            this.count.check = item.count
            if(item.isReaction === true) this.isMyReaction.check = true
          } else if(item.iconId === this.reactionIds[1]) {
            this.count.ok = item.count
            if(item.isReaction === true) this.isMyReaction.ok = true
          } else if(item.iconId === this.reactionIds[2]) {
            this.count.no = item.count
            if(item.isReaction === true) this.isMyReaction.no = true
          } else if(item.iconId === this.reactionIds[3]) {
            this.count.like = item.count
            if(item.isReaction === true) this.isMyReaction.like = true
          } else if(item.iconId === this.reactionIds[4]) {
            this.count.heart = item.count
            if(item.isReaction === true) this.isMyReaction.heart = true
          } else if(item.iconId === this.reactionIds[5]) {
            this.count.joy = item.count
            if(item.isReaction === true) this.isMyReaction.joy = true
          } else if(item.iconId === this.reactionIds[6]) {
            this.count.sad = item.count
            if(item.isReaction === true) this.isMyReaction.sad = true
          } else if(item.iconId === this.reactionIds[7]) {
            this.count.surprise = item.count
            if(item.isReaction === true) this.isMyReaction.surprise = true
          }
          total += item.count
        })
        this.count.total = total
      } catch (err) {
        this.$log.debug('commentReactions count GET() error => ', err)
      }

      try {
        this.searchParams.iconId = this.search.iconId

        const listRes = await this.$axios({
          method: 'GET',
          url: `/commentReactions/${this.commentId}`,
          params: this.searchParams
        })

        if(listRes.data.page.totalElements > 0) {
          const data = listRes.data._embedded.commentReactions
          if(data.length > 0) {
            this.list = [...this.list, ...data]
            if((this.list.length < listRes.data.page.totalElements)) this.loadFinish = true
            else this.loadFinish = false
          }
        } else {
          this.loadFinish = false
        }
        
      } catch(err) {
        this.$log.debug('commentReactions GET() error => ', err)
      }
    },
    getAddList() {
      this.$nextTick(function() {
        const option = {
          root: null, //viewport
          rootMargin: '0px',
          threshold: 1,
        }

        const callback = ([entry]) => {
          this.$log.debug("entry.isIntersecting", entry.isIntersecting, this.loadFinish)
          if (entry.isIntersecting && this.loadFinish === true) {
            this.loadFinish = false
            this.searchParams.page = (this.searchParams.page +1)
            this.getList()
            this.$log.debug("callback")
          }
        };

        this.observer = new IntersectionObserver(callback, option);
        this.observer.observe(this.obsRef)
      })
    },
    getSearch(data) {
      if(data === 'total') {
        this.search.iconId = ''
      } else {
        this.search.iconId = data
      }

      this.list = []
      this.searchParams.page = 0
      this.loadFinish = false
      this.getList()
    },
    getName(item) {
      if(!item.userName === true) return "(알수없음)"

      if(this.isClassPostForNameCheck === false) {
        return item.userName
      }
      switch(item.userType) {
        case UserLevel.TEACHER:
          return `${item.userName} ${this.$t("chat.type.teacher")}`
        case UserLevel.PARENTS:
          return `${item.userName} (${item.memberChildName ? item.memberChildName + " ": ""}${this.$t("chat.type.parent")})`
        case UserLevel.STUDENT:
          return `${item.userName} (${item.memberChildName} ${this.$t("chat.type.student")})`
      }
    },
    reactionMyInit() {
      this.isMyReaction.check = false
      this.isMyReaction.ok = false
      this.isMyReaction.no = false
      this.isMyReaction.like = false
      this.isMyReaction.heart = false
      this.isMyReaction.joy = false
      this.isMyReaction.sad = false
      this.isMyReaction.surprise = false
    },
    userPhoto(photo) {
      return photo ? photo : URLProps.DEFAULT_PROFILE_IMAGE_URL
    },
    userPhotoReplace(e) {
        e.target.src = URLProps.DEFAULT_PROFILE_IMAGE_URL
    },
    close() {
      this.$emit('close')
    }
  },
  mounted() {
    this.obsRef = this.$refs.scrollListAccess
  },
  created() {
    this.getList()
    this.getAddList()
  }
}
</script>


<style scoped>
.modal.ofy.slick-modal .modal-close-btn {
  right: 20px;
}
#reactionModalListModal {
  background: rgba(0, 0, 0, 0.7);
}
#reactionModalListModal .modal-cont-wrap {
  overflow-y: auto;
}
#reactionModalListModal .modal-cont {
  height: auto;
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
