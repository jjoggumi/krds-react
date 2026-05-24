<template>
  <fragment>
    <!-- <button
      class="btn-emoticon"
      :class="{
        dis: disabled,
        'is-active': option.isOpenPopup
      }"
      :disabled="disabled"
      @click="togglePopup"
    ></button> -->
    <button
      class="btn-emoticon"
      :class="{
        'is-active': option.isOpenPopup
      }"
      @click="togglePopup"
    ></button>
    <sticker-popup
      v-if="option.isOpenPopup"
      @closePopup="closePopup"
      @setStickerItemUrl="setStickerItemUrl"
    />
  </fragment>
</template>

<script>
import StickerPopup from './StickerPopup'

export default {
  name: 'sticker-button',
  components: {
    StickerPopup
  },
  props: {
    files: {
      type: Array
    },
    isStickerClosePopup: Boolean
    // disabled: {
    //   type: Boolean,
    //   default() {
    //     return false
    //   }
    // }
  },
  data() {
    return {
      option: {
        isOpenPopup: false
      }
    }
  },
  computed: {
    fileData: {
      get() {
        return this.files
      },
      set(val) {
        this.$emit('update:files', val)
      }
    },
    imageFileList() {
      return this.fileData.filter(v => v.fileContentType.startsWith('image'))
    },
    videoFileList() {
      return this.fileData.filter(v => v.fileContentType.startsWith('video'))
    },
    docFileList() {
      return this.fileData.filter(v => v.fileContentType.startsWith('image') === false && v.fileContentType.startsWith('video') === false)
    },
  },
  methods: {
    openPopup() {
      this.option.isOpenPopup = true
    },
    closePopup() {
      this.option.isOpenPopup = false
    },
    togglePopup() {
      this.option.isOpenPopup = !this.option.isOpenPopup
    },
    setStickerItemUrl(url) {
      if(this.imageFileList.length > 0 || this.videoFileList.length > 0 || this.docFileList.length > 0) {
        this.$hiClass.confirm('기존 첨부 파일을 모두 삭제하고<br/>스티커를 등록하시겠습니까?', 'warning')
          .then(() => {
            this.fileData = []
            this.$emit('setStickerItemUrl', url)
          })
          .catch(() => {})
      } else {
        this.$emit('setStickerItemUrl', url)
      }
    }
  },
}
</script>

<style></style>
