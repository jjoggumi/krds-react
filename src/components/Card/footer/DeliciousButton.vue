<template>
  <fragment>
    <button 
      :class="{
        [likeClass]: true,
        'on': isFloatingMode && isLike,
        'is-active': !isFloatingMode && isLike,
      }"
      @click="setLike"
    >
      {{ !isFloatingMode ? '맛있어요' : '' }}
    </button>
    <span
      v-if="isFloatingMode !== true"
      class="like-count"
    >
      {{ likeCountView }}
    </span>

    <div v-if="isFloatingMode" class="btn-tooltip">{{ $t('main.text.delicious') }}</div>
  </fragment>
</template>

<script>
export default {
  name: "delicious-button",
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
      userLikeId: null
    }
  },
  computed: {
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
    likeClass() {
      return this.isFloatingMode ? 'floating-delicious' : 'btn-delicious'
    },
    isClassPost() {
      return true
    }
  },
  mounted() {
    // this.isLike = this.postItem.isLike
    // this.likeCount = this.postItem.likeCount || 0
  },
  methods: {
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
        }
      } else {
        try {
          const deleteUrl = this.userLikeId
            ? `/userLikes/${this.userLikeId}`
            : `${this.postItem._links.self.href}/like`

          await this.$hiClass.userLikes.delete(deleteUrl)

          this.plikeCount--
        } catch(err) {
          this.$log.debug(this.$options.name, ' setLike() error => ', err)
        }
      }

      this.isLoading = false
      this.pLike = !this.pLike
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
  font-weight: 400;
  color: #222;
  padding-left: 4px;
  margin-left: -20px;
  margin-right: 20px;
}
</style>