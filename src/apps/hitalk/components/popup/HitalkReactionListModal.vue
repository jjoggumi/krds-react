<template>
  <div class="hi-modal-common modal-flex" style="display: block;">
    <div class="modal__dim"></div>
    <div class="modal__layer">
      <div class="reaction-modal-list">
        <div class="container">
          <div class="title-wrap">
            <h2>반응한 사람들</h2>
          </div>

          <div class="search-wrap" :class="{'no-total': reactionCounts.length !== 5}">
            <span
                @click="toggleTab(null)"
                class="total"
                :class="{selected: params.iconId === null}"
            >
                <span>전체 {{totalCount}}</span>
            </span>
            <span
                v-if="getReactionCount('1').count > 0"
                @click="toggleTab('00000000-0000-0000-0000-000000000001')"
                class="check"
                :class="{selected: params.iconId === '00000000-0000-0000-0000-000000000001'}"
            >
              <span :class="{my: getReactionCount('1').isReaction}">
                <i class="reaction-check"></i>{{ getReactionCount('1').count }}
              </span>
            </span>
            <span
                v-if="getReactionCount('2').count > 0"
                @click="toggleTab('00000000-0000-0000-0000-000000000002')"
                class="ok"
                :class="{selected: params.iconId === '00000000-0000-0000-0000-000000000002'}"
            >
              <span :class="{my: getReactionCount('2').isReaction}">
                <i class="reaction-ok"></i>{{ getReactionCount('2').count }}
              </span>
            </span>
            <span
                v-if="getReactionCount('3').count > 0"
                @click="toggleTab('00000000-0000-0000-0000-000000000003')"
                class="no"
                :class="{selected: params.iconId === '00000000-0000-0000-0000-000000000003'}"
            >
              <span :class="{my: getReactionCount('3').isReaction}">
                  <i class="reaction-no"></i>{{ getReactionCount('3').count }}
              </span>
            </span>
            <span
                v-if="getReactionCount('4').count > 0"
                @click="toggleTab('00000000-0000-0000-0000-000000000004')"
                class="like"
                :class="{selected: params.iconId === '00000000-0000-0000-0000-000000000004'}"
            >
              <span :class="{my: getReactionCount('4').isReaction}">
                <i class="reaction-like"></i>{{ getReactionCount('4').count }}
              </span>
            </span>
            <span
                v-if="getReactionCount('5').count > 0"
                @click="toggleTab('00000000-0000-0000-0000-000000000005')"
                class="heart"
                :class="{selected: params.iconId === '00000000-0000-0000-0000-000000000005'}"
            >
              <span :class="{my: getReactionCount('5').isReaction}">
                <i class="reaction-heart"></i>{{ getReactionCount('5').count }}
              </span>
            </span>
            <span
                v-if="getReactionCount('6').count > 0"
                @click="toggleTab('00000000-0000-0000-0000-000000000006')"
                class="joy"
                :class="{selected: params.iconId === '00000000-0000-0000-0000-000000000006'}"
            >
              <span :class="{my: getReactionCount('6').isReaction}">
                <i class="reaction-joy"></i>{{ getReactionCount('6').count }}
              </span>
            </span>
            <span
                v-if="getReactionCount('7').count > 0"
                @click="toggleTab('00000000-0000-0000-0000-000000000007')"
                class="sad"
                :class="{selected: params.iconId === '00000000-0000-0000-0000-000000000007'}"
            >
              <span :class="{my: getReactionCount('7').isReaction}">
                <i class="reaction-sad"></i>{{ getReactionCount('7').count }}
              </span>
            </span>
            <span
                v-if="getReactionCount('8').count > 0"
                @click="toggleTab('00000000-0000-0000-0000-000000000008')"
                class="surprise"
                :class="{selected: params.iconId === '00000000-0000-0000-0000-000000000008'}"
            >
              <span :class="{my: getReactionCount('8').isReaction}">
                <i class="reaction-surprise"></i>{{ getReactionCount('8').count }}
              </span>
            </span>
          </div>

          <div class="list-wrap">
            <template v-for="(reaction, index) of reactionList">
              <div class="list-data" :key="`${reaction.iconId}-${reaction.userId}-${index}`">
                <span class="profile">
                    <img :src="userPhoto(reaction.userPhoto)" @error="userPhotoReplace" alt="">
                </span>
                <span class="reaction">
                    <i :class="`reaction-${getIcon(reaction.iconId)}`"></i>
                </span>
                <span v-if="getIsMe(reaction.userId)" class="my">나</span>
                <span class="user">{{ getName(reaction) }}</span>
              </div>
            </template>
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
</template>

<script>
import {mapActions, mapMutations} from 'vuex';
import {URLProps, UserLevel} from '@/enums';

export default {
  name: 'hitalk-reaction-list-modal',
  props: {
    messageId: String
  },
  data: () => ({
    params: {
      iconId: null,
      messageId: null,
      page: 0,
      sort: 'reactionTimestamp,desc'
    },
    reactionCounts: [],
    reactionList: [],
    obsRef: null,
    observer: null
  }),
  computed: {
    totalCount: function () {
      return this.reactionCounts.map(c => c.count).reduce((p, a) => p + a, 0)
    }
  },
  methods: {
    ...mapMutations('storeHitalk', [
      'setHitalkReactionListPopup'
    ]),
    ...mapActions('storeHitalk', [
      'callHitalkReactionCount',
      'callHitalkReactionList'
    ]),
    toggleTab: async function (iconId) {
      this.params = {...this.params, iconId, page: 0}
      this.reactionCounts = await this.callHitalkReactionCount(this.messageId)
      this.reactionList = await this.callHitalkReactionList(this.params)
    },
    getReactionCount: function (iconId) {
      const targetIconId = `00000000-0000-0000-0000-00000000000${iconId}`
      const reaction = this.reactionCounts.find(r => r.iconId === targetIconId)
      return reaction ? reaction : {count: 0, iconId: targetIconId, isReaction: false}
    },
    userPhoto: function (photo) {
      return photo ? photo : URLProps.DEFAULT_PROFILE_IMAGE_URL
    },
    userPhotoReplace(e) {
      e.target.src = URLProps.DEFAULT_PROFILE_IMAGE_URL
    },
    getIcon: function (iconId) {
      switch (iconId) {
        case '00000000-0000-0000-0000-000000000001': {
          return 'check'
        }
        case '00000000-0000-0000-0000-000000000002': {
          return 'ok'
        }
        case '00000000-0000-0000-0000-000000000003': {
          return 'no'
        }
        case '00000000-0000-0000-0000-000000000004': {
          return 'like'
        }
        case '00000000-0000-0000-0000-000000000005': {
          return 'heart'
        }
        case '00000000-0000-0000-0000-000000000006': {
          return 'joy'
        }
        case '00000000-0000-0000-0000-000000000007': {
          return 'sad'
        }
        case '00000000-0000-0000-0000-000000000008': {
          return 'surprise'
        }
        default: {
          return ''
        }
      }
    },
    getIsMe: function (id) {
      return id === localStorage.uuid
    },
    getName: function (item) {
      switch (item.userType) {
        case UserLevel.TEACHER:
          return `${item.userName} ${this.$t("chat.type.teacher")}`
        case UserLevel.PARENTS:
          return `${item.memberChildName ? item.memberChildName + " " : ""} ${this.$t("chat.type.parent")} (${item.userName})`
        case UserLevel.STUDENT:
          return `${item.memberChildName ? item.memberChildName + " " : ""} ${this.$t("chat.type.student")} (${item.userName})`
        default:
          return '(알수없음)'
      }
    },
    scrollObserver: function () {
      this.$nextTick(function () {
        const option = {
          root: null,
          rootMargin: '0px',
          threshold: 1
        }

        const callback = async ([entry]) => {
          if (entry.isIntersecting) {
            this.params.page = (this.params.page + 1)
            const addList = await this.callHitalkReactionList(this.params)

            this.reactionList = [...this.reactionList, ...addList]
          }
        };

        this.observer = new IntersectionObserver(callback, option);
        this.observer.observe(this.obsRef)
      })
    },
    close: function () {
      const params = {
        isOpen: false,
        messageId: null
      }
      this.setHitalkReactionListPopup(params)
    }
  },
  mounted() {
    this.obsRef = this.$refs.scrollListAccess
  },
  async created() {
    this.params = {...this.params, messageId: this.messageId}
    this.reactionCounts = await this.callHitalkReactionCount(this.messageId)
    this.reactionList = await this.callHitalkReactionList(this.params)
    this.scrollObserver()
  }
}
</script>

<style scoped>
</style>