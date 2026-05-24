<template>
  <div class="section-wrap sticker" :class="{'on': editMode.sticker}">
    <div class="area fullHeight">
      <p class="title">스티커</p>
      <div class="scroll-area">
        <div class="action-wrap">
          <div class="action">
            <span class="icon ic-edit-sticker-ai" @click="applyAiSticker"></span>
            <transition name="fade">
              <div class="ai-sticker-tooltip" v-if="isShowAiStickerTooltip">
                <p><span class="ft-blue">얼굴을 AI 자동인식</span>하여 스티커가 적용돼요.</p>
              </div>
            </transition>
          </div>
          <div class="action" @click="applyAiBlurSticker">
            <span class="icon ic-edit-sticker-ai-blur"></span>
          </div>
          <div class="action" @click="addMosaic">
            <span class="icon ic-edit-sticker-mosaic"></span>
          </div>
          <div class="action"
               v-for="sticker of stickerList"
               :key="sticker.url"
               @click="addSticker(sticker.url)"
          >
            <img class="icon" :src="sticker.url" alt=""/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "image-editor-sticker",
  data() {
    return {
      isShowAiStickerTooltip: false
    }
  },
  props: {
    imageEditor: {
      type: Object
    },
    editMode: {
      type: Object
    },
    editOption: {
      type: Object
    },
    isShowToastMsg: {
      type: Boolean
    }
  },
  computed: {
    toastMsgType: {
      get() {
        return this.curToastMsgType
      },
      set(type) {
       this.$emit('update:curToastMsgType', type)
      }
    },
    stickerList() {
      return this.imageEditor ? this.imageEditor._tools.sticker.stickerList : []
    },
    stickerCount() {
      return this.imageEditor ? this.imageEditor._tools.sticker.getStickerCount() : 0
    }
  },
  methods: {
    addSticker(sticker) {
      if (this.stickerCount < 50) {
        this.imageEditor._tools.sticker.addSticker(sticker)
      } else {
        this.showToastMsg()
      }
    },
    addMosaic() {
      if (this.stickerCount < 50) {
        this.imageEditor._tools.sticker.addMosaic()
      } else {
        this.showToastMsg()
      }
    },
    applyAiSticker() {
      const isApplyAiSticker = this.imageEditor.getObjects().some(obj => obj.type === 'aiSticker' || obj.type === 'aiBlurSticker')
      if (this.stickerCount < 50 || isApplyAiSticker) {
        this.$store.commit('setIsDimLoading', true)

        if (!this.isShowToastMsg) {
          this.$emit('setCurToastMsgType', 'aiSticker')
          setTimeout(() => {
            this.$emit('setCurToastMsgType', '')
          }, 3000)
        }

        setTimeout(async () => {
          await this.imageEditor._tools.sticker.applyAiSticker('aiSticker')
        }, 100)
      } else {
        this.showToastMsg()
      }
    },
    applyAiBlurSticker() {
      const isApplyAiSticker = this.imageEditor.getObjects().some(obj => obj.type === 'aiSticker' || obj.type === 'aiBlurSticker')
      if (this.stickerCount < 50 || isApplyAiSticker) {
        this.$store.commit('setIsDimLoading', true)
        setTimeout(async () => {
          await this.imageEditor._tools.sticker.applyAiSticker('aiBlurSticker')
        }, 100)
      } else {
        this.showToastMsg()
      }
    },
    showToastMsg() {
      if (!this.isShowToastMsg) {
        this.$emit('setCurToastMsgType', 'limitSticker')
        setTimeout(() => {
          this.$emit('setCurToastMsgType', '')
        }, 1200)
      }
    }
  },
  watch: {
    'editMode.sticker'(val) {
      if (val) {
        const lastViewTimestamp = localStorage.getItem('isViewAiStickerTooltip')

        if (!lastViewTimestamp || lastViewTimestamp === 'false') {
          this.isShowAiStickerTooltip = true
          setTimeout(() => {
            this.isShowAiStickerTooltip = false
            localStorage.setItem('isViewAiStickerTooltip', 'true')
          }, 5000)
        }
      }
    },
    'stickerCount'() {
      if (!this.editOption.sticker.isChange) {
        this.$emit('setStickerIsChange', true)
      }
    }
  }
}
</script>

<style scoped>
.fade-leave-from {
  opacity: 1;
}
.fade-leave-active {
  transition: all 0.3s;
}
.fade-leave-to {
  opacity: 0;
}
</style>