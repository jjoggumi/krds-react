<template>
  <footer :class="{'on': isSectionOpen}">
    <!-- <div class="dis"> -->
    <div class="refresh" :class="{'dis': isShowRefresh}"  @click="resetCanvas(editImages[targetIdx].fileOriginalPath, true)">
      <i></i>
      <span>원본으로 초기화</span>
    </div>

    <div class="zoom">
      <i class="in" :class="{'dis': isZoom || this.editMode.cropRotate || isOriginalSize}" id="btn-zoom-in" @click="zoomIn"></i>
      <i class="out" :class="{'dis': !isZoom || this.editMode.cropRotate || isOriginalSize}" id="btn-zoom-out" @click="zoomOut"></i>
    </div>
  </footer>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "image-editor-footer",
  props: {
    imageEditor: {
      type: Object
    },
    curEditImage: {
      type: Object
    },
    isZoom: {
      type: Boolean
    },
    editMode: {
      type: Object
    },
    isSectionOpen: {
      type: Boolean
    }
  },
  computed: {
    ...mapState('storeImageEditor', {
      editImages: 'editImages',
      targetIdx: 'targetIdx'
    }),
    isShowRefresh() {
      return this.curEditImage.fileOriginalPath === this.curEditImage.thumbnailDataUrl &&
          this.imageEditor && this.imageEditor.getObjects().filter(obj => obj.type !== 'backgroundImage').length === 0
    },
    isOriginalSize() {
      return this.imageEditor ? this.imageEditor.getIsOriginalSize() : false
    }
  },
  methods: {
    zoomIn() {
      if (this.editMode.cropRotate || this.isOriginalSize) return
      this.imageEditor.setIsZoom(true)
      this.imageEditor.zoom(this.curEditImage.thumbnailDataUrl, true)
    },
    async zoomOut() {
      if (this.editMode.cropRotate || this.isOriginalSize) return
      await this.imageEditor.zoom(this.curEditImage.thumbnailDataUrl, false)
      this.imageEditor.setIsZoom(false)
    },
    resetCanvas(dataUrl, reset) {
      if (reset) {
        this.editImages[this.targetIdx].thumbnailDataUrl = dataUrl
        this.editImages[this.targetIdx].editDataUrl = dataUrl
      }
      this.$emit('closeAll')
      this.imageEditor.resetCanvas(dataUrl)
    }
  }
}
</script>

<style scoped>

</style>