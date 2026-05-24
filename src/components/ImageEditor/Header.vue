<template>
  <header>
    <div v-if='!isSingleMode' class="page-wrap" :class="{'none': editImages.length === 0}">
      <i
          class="prev"
          :class="{'dis': editImages.length === 0 || targetIdx === 0}"
          @click="prevImage"
      >
      </i>
      <span class="number">
          <em>{{ editImages.length > 0 ? targetIdx + 1 : 0 }}</em>&nbsp;/&nbsp;{{ editImages.length }}
        </span>
      <i
          class="next"
          :class="{'dis': editImages.length === 0 || targetIdx + 1 === editImages.length}"
          @click="nextImage"
      >
      </i>
    </div>
    <div class="btn-wrap">
      <button id="imageEditorCancelBtn" class="esc" @click="cancel">취소</button>
      <button id="imageEditorDoneBtn" @click="done">{{ customSendButtonLabel !== '' ? customSendButtonLabel : (isHitalkMode && parentComponent === 'hitalkChatLayout' ? '전송' : '완료') }}</button>
    </div>
  </header>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  name: "image-editor-header",
  props: {
    imageEditor: {
      type: Object
    },
    editOption: {
      type: Object
    }
  },
  computed: {
    ...mapState('storeImageEditor', [
      'editImages',
      'isHitalkMode',
      'isSingleMode',
      'targetIdx',
      'parentComponent',
      'customSendButtonLabel'
    ])
  },
  methods: {
    ...mapActions('storeImageEditor', {
      closeImageEditor: 'closeImageEditor',
      editDone: 'editDone',
      resetEditImages: 'resetEditImages'
    }),
    ...mapMutations('storeImageEditor', {
      clearDeleteImages: 'clearDeleteImages'
    }),
    prevImage() {
      this.$emit('prevImage')
    },
    nextImage() {
      this.$emit('nextImage')
    },
    cancel() {
      let noUploadComponent = ['clazzCreate', 'clazzSetting', 'myPageProfileImage', 'multiProfileImage', 'behaviorStudentProfileImage', 'hitalkChatLayout', 'ProfileImageEdit']
      if (noUploadComponent.includes(this.parentComponent)) {
        this.closeImageEditor(true)
        return
      }

      if (this.imageEditor.getObjects().filter(obj => obj.type !== 'cropTarget').length > 1 || this.editOption.cropRotate.isChange) {
        this.editImages[this.targetIdx].thumbnailDataUrl = this.imageEditor.getDataUrl()
      }

      const isChange = this.editImages.some(image => image.thumbnailDataUrl !== image.fileOriginalPath)
      if (isChange) {
        this.$hiClass.confirm('편집을 취소하시겠습니까?')
            .then(() => {
              this.clearDeleteImages()
              this.resetEditImages()
              this.editDone(true)
            })
            .catch(() => {})
      } else {
        this.clearDeleteImages()
        this.editDone(true)
      }
    },
    done() {
      if (
          this.imageEditor.getObjects().filter(obj => obj.type !== 'cropTarget').length > 1 ||
          this.editOption.cropRotate.isChange ||
          this.editOption.sticker.isChange ||
          this.editOption.textbox.isChange ||
          this.editOption.draw.isChange ||
          this.parentComponent === 'hitalkConfirmDialog'
      ) {
        this.editImages[this.targetIdx].thumbnailDataUrl = this.imageEditor.getDataUrl()
      }

      this.editDone()
    }
  }
}
</script>

<style scoped>

</style>