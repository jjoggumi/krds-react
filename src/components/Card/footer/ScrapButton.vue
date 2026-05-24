<template>
  <!-- TODO: 2022-09-26 footer & 플로팅 버튼 교차 삭제 확인 -->
  <fragment>
    <button
      :class="{
      [scrapClass]: true,
      'on': isFloatingMode && isScrap,
      'is-active': !isFloatingMode && isScrap,
    }"
      :disabled="isDisabledScrapBtn"
      :style="setDefaultCursorStyle"
      @click="setScrap"
    >
      {{ !isFloatingMode ? $t('main.text.scrap') : '' }}
    </button>

    <div v-if="isFloatingMode" class="btn-tooltip">{{ $t('main.text.scrap') }}</div>
  </fragment>
</template>

<script>
import {eventBus} from "@/main";

export default {
  name: 'scrap-button',
  data() {
    return {
      isLoading: false,
      cScrap: false,
      userScrapId: null,  // setScrap() 이후 생성되는 고유 id
    }
  },
  props: [
    'isSync',
    'isClassActivated',
    'isFloatingMode',
    'scrap',
    'postItem',
  ],
  computed: {
    isMyScrapPath() {
      return this.$route.path.includes('/mypage/scrap')
    },
    isDisabledScrapBtn() {
      return this.isClassActivated === false && !this.isMyScrapPath
    },
    setDefaultCursorStyle() {
      return this.isDisabledScrapBtn ? 'cursor:default' : ''
    },
    scrapClass() {
      return this.isFloatingMode ? 'floating-scrap' : 'btn-scrap'
    },
    isScrap() {
      return this.isSync ? this.pScrap : this.cScrap
    },
    isClassPost() {
      const clazzPostArr = ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK']
      let postType = this.postItem.postType
      return clazzPostArr.includes(postType)
    },
    pScrap: {
      get() {
        return this.scrap
      },
      set(val) {
        this.$emit('update:scrap', val)
      }
    },
  },
  created() {
  },
  mounted() {
  },
  methods: {
    // 스크랩 처리 방식 변경
    setScrap() {
      if (this.isLoading) {
        this.$hiClass.alert('처리 중입니다.<br>잠시 후 다시 시도해 주세요.', 'info')
        return false
      }

      this.isLoading = true

      if (!this.isScrap) {
        const params = {
          post: this.postItem._links.self.href,
          user: this.$store.state.userUri
        }
        this.$hiClass.userScraps
          .create(params)
          .then(res => {
            this.cScrap = true
            this.pScrap = true

            if (res.data && res.data.currentId)
              this.userScrapId = res.data.currentId
          })
          .catch(err => {
            switch (err.response.status) {
              case 404: {
                this.$hiClass.alert('삭제된 게시글입니다.', 'warning')
                    .then(() => {
                      eventBus.$emit('refresh-class-board-posts')
                    })
                break
              }
            }
            this.$log.debug(this.$options.name, ' setScrap() error => ', err)
          })
          .finally(() => {
            this.isLoading = false
          })
      } else {
        const deleteUrl = this.userScrapId
          ? `/userScraps/${this.userScrapId}`
          : `${this.postItem._links.self.href}/scrap`

        this.$hiClass.userScraps
          .delete(deleteUrl)
          .then(() => {
            this.cScrap = false
            this.pScrap = false

            // 스크랩 id 초기화
            this.userScrapId = null
          })
          .catch(err => {
            this.$log.debug(this.$options.name, ' setScrap() error => ', err)

            // 스크랩 id 초기화
            this.userScrapId = null
          })
          .finally(() => {
            this.isLoading = false
          })
      }
    },
  }
}
</script>

<style scoped></style>
