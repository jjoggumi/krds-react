<template>
  <button
    class="btn-secret"
    :class="{
      'is-active': model.secret
    }"
    @click="toggleSecret"
  ></button>
</template>

<script>
export default {
  name: 'comment-secret',
  props: {
    model: {
      type: Object,
      required: true
    },
    isDisabled: {
      type: Boolean
    },
    isClassPost: {
      type: Boolean,
    },
  },
  data() {
    return {
      isBusy: false,
      secretCommentOnceCheckMsg: 'userSecretCommentUsed'
    }
  },
  computed: {
    parentCommentId() {
      return this.model.parentCommentId || ''
    }
  },
  created() {},
  methods: {
    /**
     * 비밀 댓글 최초 사용 시 flag : userSecretCommentUsed
     */
    toggleSecret() {
      if (this.isDisabled) {
        this.$hiClass.alert('댓글 비밀여부는 변경이 불가합니다.', 'warning')
        return false
      }

      if(!this.model.secret) {
        let message = '선생님만 볼 수 있는 비밀 댓글로 작성합니다.'
        if(this.isClassPost === false) message = '운영자만 볼 수 있는 비밀 댓글로 작성합니다.'

        this.$hiClass.confirm(message, 'info')
          .then(() => {
            // this.onceChecks(this.secretCommentOnceCheckMsg)
            this.$store.commit('setOnceChecksUserSecretCommentUsed', true)
            this.model.secret = true
          })
      } else {
        this.$store.commit('setOnceChecksUserSecretCommentUsed', false)
        this.model.secret = false
        this.isRequireSecret()
      }

      // if (!this.$store.state.onceChecks.userSecretCommentUsed) {
      //   const message = '선생님만 볼 수 있는 비밀 댓글로 작성합니다.'
      //   this.$hiClass.confirm(message, 'info')
      //     .then(() => {
      //       this.onceChecks(this.secretCommentOnceCheckMsg)
      //     })
      // } else {
      //   this.model.secret = !this.model.secret
      //   this.isRequireSecret()
      // }
    },
    isRequireSecret() {
      if (
        this.parentCommentId !== '' &&
        this.model.parentCommentSecret &&
        !this.model.secret
      ) {
        this.model.secret = true
        this.$hiClass.alert('비밀댓글에는 비밀답글만 작성할 수 있습니다.', 'warning')
      }
    },
    async onceChecks(flag) {
      if (!this.isBusy) {
        try {
          this.isBusy = true
          let isExist = false

          await this.searchOnceChecks(flag)
            .then(res => {
              if (res.data.page.totalElements > 0) isExist = true
            })
            .catch(() => {
              this.isBusy = false
            })

          if (!isExist) {
            await this.postOnceChecks(flag)
              .then(() => {
                this.$store.commit('setOnceChecksUserSecretCommentUsed', true)
                this.model.secret = true
              })
              .catch(() => {
                this.isBusy = false
              })
          }

          this.isBusy = false
        } catch (error) {
          this.$log.warn(error)
          this.isBusy = false
        }
      }
    },
    async searchOnceChecks(flag) {
      const userUri = this.$store.state.user._links.self.href
      const params = {
        _user: userUri,
        _flag: flag
      }
      return this.$hiClass.onceChecks.search(params)
    },
    async postOnceChecks(flag) {
      const userUri = this.$store.state.user._links.self.href
      const params = {
        user: userUri,
        flag
      }
      return this.$hiClass.onceChecks.create(params)
    }
  }
}
</script>

<style scoped></style>
