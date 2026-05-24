<template>
  <!-- TODO: 2022-09-26 footer & 플로팅 버튼 교차 삭제 확인 -->
  <fragment>
    <button
      :class="{
        [likeClass]: true,
        'on': isFloatingMode && isLike,
        'is-active': !isFloatingMode && isLike,
      }"
      :disabled="isReadOnly"
      :style="isReadOnly ? 'cursor:default' : ''"
      @click="setLike"
    >
      {{ !isFloatingMode ? '좋아요' : '' }}
    </button>
    <!-- <span 
      v-if="!isFloatingMode && likeCountView > 0" 
      class="like-count" 
      @click.stop="openLikeList"
    >
      {{ likeCountView }}
    </span> -->
    <button
      v-if="!isFloatingMode && likeCountView > 0"
      class="btn-likeit-num"
      @click.stop="openLikeList"
    >
      <span>{{ likeCountView }}</span>
    </button> 
    <!-- like-count-num -->

    <div v-if="isFloatingMode" class="btn-tooltip">{{ $t('main.text.like') }}</div>
  </fragment>
</template>

<script>
import {eventBus} from "@/main";

export default {
  name: 'like-button',
  components: {},
  props: {
    like: {
      type: Boolean,
      default() {
        return false
      }
    },
    likeCount: {
      type: Number,
      default() {
        return 0
      }
    },
    postItem: {
      type: Object,
      required: true
    },
    isFloatingMode: {
      type: Boolean,
      default() {
        return false
      }
    },
    isReadOnly: {
      type: Boolean,
      default() {
        return false
      }
    },
    isSync: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      isLoading: false,
      cLike: false,
      clikeCount: 0,
      userLikeId: null  // setLike() 이후 생성되는 고유 id
    }
  },
  computed: {
    likeClass() {
      return this.isFloatingMode ? 'floating-up' : 'btn-likeit'
    },
    pLike: {
      get() {
        return this.like
      },
      set(val) {
        this.$emit('update:like', val)
      }
    },
    plikeCount: {
      get() {
        return this.likeCount
      },
      set(val) {
        this.$emit('update:likeCount', val)
      }
    },
    isLike() {
      return this.isSync ? this.pLike : this.cLike
    },
    likeCountView() {
      return this.isSync ? +this.plikeCount : +this.clikeCount
    },
    isClassPost() {
      const clazzPostArr = ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK']
      let postType = this.postItem.postType
      return clazzPostArr.includes(postType)
    }
  },
  mounted() {
    // this.getLike()
  },
  methods: {
    async getLike() {
      try {
        const res = await this.$hiClass.posts.read(this.postItem)

        if (res) {
          this.cLike = res.data.isLike
          this.clikeCount = res.data.likeCount
          this.pLike = res.data.isLike
          this.plikeCount = res.data.likeCount
        }
      } catch (err) {
        this.$log.debug(this.$options.name, ' getLike() error => ', err)
      }
    },
    async setLike() {
      if (this.isLoading) {
        this.$hiClass.alert('처리 중입니다.<br>잠시 후 다시 시도해 주세요.', 'info')
        return false
      }

      this.isLoading = true

      if (!this.isLike) {
        try {
          const res = await this.$hiClass.userLikes.create({
            post: this.postItem._links.self.href,
            user: this.$store.state.userUri
          });
          this.cLike = true
          this.clikeCount++
          this.pLike = true
          this.plikeCount++

          if (res.data && res.data.currentId) this.userLikeId = res.data.currentId
        } catch (err) {
          switch (err.response.status) {
            case 404: {
              this.$hiClass.alert('삭제된 게시글입니다.', 'warning')
                  .then(() => {
                    eventBus.$emit('refresh-class-board-posts')
                  })
              break
            }
          }
          this.$log.debug(this.$options.name, ' setLike() error => ', err)
        } finally {
          this.isLoading = false
        }
      } else {
        try {
          const deleteUrl = this.userLikeId
          ? `/userLikes/${this.userLikeId}`
          : `${this.postItem._links.self.href}/like`

          await this.$hiClass.userLikes.delete(deleteUrl)

          this.cLike = false
          this.clikeCount--
          this.pLike = false
          this.plikeCount--

          // 좋아요 id 초기화
          this.userLikeId = null
        } catch (err) {
          this.$log.debug(this.$options.name, ' setLike() error => ', err)
        } finally {
          this.isLoading = false
        }
      }
    },
    openLikeList() {
      if (this.likeCountView > 0) {
        this.getLike()

        this.$store.commit('setCurPostLike', {
          isOpen: true,
          isClassPost: this.isClassPost,
          postId: this.postItem.currentId
        })
      }
    }
  }
}
</script>

<style scoped>
.like-count {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  font-size: 15px;
  font-weight: 500;
  color: var(--primary);
  padding-left: 4px;
  margin-left: -20px;
  margin-right: 20px;
  cursor: pointer;
}
</style>