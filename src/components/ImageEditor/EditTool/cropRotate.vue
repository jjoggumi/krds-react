<template>
  <div class="section-wrap cut" :class="{'on': editMode.cropRotate}">
    <div class="area">
      <p class="title">회전</p>
      <div class="action-wrap">
        <div class="action" @click="rotate">
          <span class="icon ic-edit-rotate"></span>
          <span class="text">회전</span>
        </div>
        <div class="action" @click="flip('X')">
          <span class="icon ic-edit-rotate-lr"></span>
          <span class="text">좌우반전</span>
        </div>
        <div class="action" @click="flip('Y')">
          <span class="icon ic-edit-rotate-tb"></span>
          <span class="text">상하반전</span>
        </div>
      </div>
    </div>
    <div class="area">
      <p class="title">자르기</p>
      <div class="action-wrap">
        <div class="action" :class="{'active': editOption.cropRotate.cropTargetMode === 'O'}" @click="changeCropTarget('O')">
          <span class="icon ic-edit-cut-thum-ori"></span>
          <span class="text">원본</span>
        </div>
        <div class="action" :class="{'active': editOption.cropRotate.cropTargetMode === 'F'}" @click="changeCropTarget('F')">
          <span class="icon ic-edit-cut-thum-free"></span>
          <span class="text">자유롭게</span>
        </div>
        <div class="action" :class="{'active': editOption.cropRotate.cropTargetMode === '1'}" @click="changeCropTarget('1')">
          <span class="icon ic-edit-cut-thum-square"></span>
          <span class="text">1:1</span>
        </div>
      </div>
    </div>

    <div class="btn-wrap">
      <button @click="changeCropTarget('O')">재설정</button>
      <button @click="setCrop">적용</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "image-editor-crop-rotate",
  props: {
    imageEditor: {
      type: Object
    },
    editMode: {
      type: Object
    },
    curEditImage: {
      type: Object
    },
    editOption: {
      type: Object
    },
  },
  methods: {
    rotate() {
      this.imageEditor._tools.rotate.rotate()
    },
    flip(type) {
      this.imageEditor._tools.flip.flip(type)
    },
    changeCropTarget(type) {
      this.editOption.cropRotate.cropTargetMode = type
      this.imageEditor._tools.cropTarget.changeCropTarget(type)
    },
    async setCrop() {
      const croppedSrc = await this.imageEditor._tools.crop.setCrop()

      this.curEditImage.thumbnailDataUrl = croppedSrc
      this.curEditImage.editDataUrl = croppedSrc
      this.editMode.cropRotate = false

      this.imageEditor.setBackgroundImage(croppedSrc)
      this.$emit('setCropRotateIsChange', true)
    }
  }
}
</script>

<style scoped>

</style>