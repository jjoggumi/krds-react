<template>
  <div class="image-editor-container-wrap" :class="{'hitalk': isHitalkMode}">
    <div class="image-editor-container">
      <image-editor-header :imageEditor="imageEditor" :editOption="editOption" @prevImage="prevImage" @nextImage="nextImage"/>

      <nav>
        <button class="cut" :class="{'on': editMode.cropRotate}" @click="setMode('cropRotate')">
          <span>자르기,회전</span>
        </button>
        <button class="sticker" :class="{'on': editMode.sticker}" @click="setMode('sticker')">
          <i class="ai"></i>
          <span>스티커</span>
        </button>
        <button class="text" :class="{'on': editMode.text}" @click="setMode('text')">
          <span>텍스트</span>
        </button>
        <button class="painting" :class="{'on': editMode.draw}" @click="setMode('draw')">
          <span>그리기</span>
        </button>
      </nav>

      <section class="image-edit-section" :class="{'on': isSectionOpen, 'off': !isSectionOpen}">
        <image-editor-crop-rotate
            :imageEditor="imageEditor"
            :editMode="editMode"
            :curEditImage="curEditImage"
            :editOption="editOption"
            @setCropRotateIsChange="setCropRotateIsChange"
        />
        <image-editor-sticker
            :imageEditor="imageEditor"
            :editMode="editMode"
            :editOption="editOption"
            :isShowToastMsg="isShowToastMsg"
            @setStickerIsChange="setStickerIsChange"
            @setCurToastMsgType="setCurToastMsgType"
        />
        <image-editor-textbox
            :imageEditor="imageEditor"
            :editMode="editMode"
            :editOption="editOption"
            :isShowToastMsg="isShowToastMsg"
            @setTextboxIsChange="setTextboxIsChange"
            @setCurToastMsgType="setCurToastMsgType"
        />
        <image-editor-free-drawing
            :imageEditor="imageEditor"
            :editMode="editMode"
            :editOption="editOption"
            @setDrawIsChange="setDrawIsChange"
        />
      </section>

      <div class="image-editor-container__canvas" :class="{'on': isSectionOpen}">
        <div ref="imageSelect" class="image-select" :class="{'zoom-in': isZoom, 'zoom-out': !isZoom, 'full-height': isSingleMode}">

          <div ref="imageWrap" class="image-wrap" v-show="editImages.length > 0">
            <canvas id="editCanvas" style="position: relative;"></canvas>
          </div>
          <div class="image-no-wrap" v-show="editImages.length === 0">
            <span class="info-msg">편집중인 이미지가 없습니다.</span>
          </div>

          <transition name="fade">
            <div class="toast-wrap" id="sticker-ai-toast" v-if="isShowToastMsg" :class="{'on': isShowToastMsg}">
              <i v-if="curToastMsgType === 'aiSticker'"></i>
              <span>{{ toastMsg }}</span>
            </div>
          </transition>
        </div>
        <image-editor-image-list v-if="!isSingleMode"
            :imageEditor="imageEditor"
            :curEditImage="curEditImage"
            :editMode="editMode"
            @changeImage="changeImage"
            @prevImage="prevImage"
            @nextImage="nextImage"
            @setMode="setMode"
        />
      </div>

      <image-editor-footer
          :imageEditor="imageEditor"
          :curEditImage="curEditImage"
          :isZoom="isZoom"
          :editMode="editMode"
          :isSectionOpen="isSectionOpen"
          @closeAll="closeAll"
      />
    </div>
  </div>
</template>

<script>
import ImageEditor from "@/plugins/imageEditor/imageEditor";
import {mapMutations, mapState} from "vuex";
import ImageEditorHeader from "@/components/ImageEditor/Header";
import ImageEditorCropRotate from "@/components/ImageEditor/EditTool/cropRotate";
import ImageEditorSticker from "@/components/ImageEditor/EditTool/Sticker";
import ImageEditorTextbox from "@/components/ImageEditor/EditTool/Textbox";
import ImageEditorFreeDrawing from "@/components/ImageEditor/EditTool/FreeDrawing";
import ImageEditorFooter from "@/components/ImageEditor/Footer";
import ImageEditorImageList from "@/components/ImageEditor/ImageList";

export default {
  name: "image-editor-main",
  components: {
    ImageEditorHeader,
    ImageEditorCropRotate,
    ImageEditorSticker,
    ImageEditorTextbox,
    ImageEditorFreeDrawing,
    ImageEditorImageList,
    ImageEditorFooter
  },
  data() {
    return {
      imageEditor: null,

      /** 이미지 편집 **/
      editMode: {
        cropRotate: false,
        sticker: false,
        text: false,
        draw: false
      },
      editOption: {
        cropRotate: {
          cropTargetMode: 'O',
          isChange: false
        },
        sticker: {
          isChange: false
        },
        textbox: {
          isChange: false
        },
        draw: {
          brushSize: 10,
          brushColor: '#000000',
          isChange: false
        }
      },
      curToastMsgType: ''
    }
  },
  async mounted() {
    this.imageEditor = new ImageEditor()
    this.imageEditor.bindEvent()
    await this.imageEditor._tools.sticker.setStickerList()

    if (this.curEditImage) {
      this.imageEditor.setBackgroundImage(this.curEditImage.editDataUrl)
    }
  },
  beforeDestroy() {
    this.imageEditor._tools.cropTarget.deleteCropTarget()
    this.setIsPostEditorMode(false)
    localStorage.setItem('isViewAiStickerTooltip', 'false')
  },
  computed: {
    ...mapState('storeImageEditor', [
      'editImages',
      'isHitalkMode',
      'isSingleMode',
      'targetIdx'
    ]),
    isSectionOpen() {
      return this.editMode.cropRotate || this.editMode.sticker || this.editMode.text || this.editMode.draw
    },
    curEditImage() {
      return this.editImages[this.targetIdx]
    },
    isZoom() {
      return this.imageEditor ? this.imageEditor.getIsZoom() : false
    },
    isCropChange() {
      return this.imageEditor ? this.imageEditor._tools.crop.getIsChange() : false
    },
    isRotateChange() {
      return this.imageEditor ? this.imageEditor._tools.rotate.getIsChange() : false
    },
    isFlipChange() {
      return this.imageEditor ? this.imageEditor._tools.flip.getIsChange() : false
    },
    isShowToastMsg() {
      return this.curToastMsgType !== ''
    },
    toastMsg() {
      switch (this.curToastMsgType) {
        case 'aiSticker':
          return '버튼을 누를 때마다 스티커가 바뀝니다.'
        case 'limitSticker':
          return '스티커는 50개까지 적용 가능합니다.'
        case 'limitTextbox':
          return '텍스트는 50개까지 적용 가능합니다.'
        default:
          return ''
      }
    }
  },
  methods: {
    ...mapMutations('storeImageEditor', {
      setTargetIdx: 'setTargetIdx',
      setIsPostEditorMode: 'setIsPostEditorMode'
    }),
    changeImage(idx) {
      if (this.editMode.draw) {
        this.imageEditor._tools.freeDrawing.resetDrawHistory()
      }

      if (this.editMode.cropRotate) {
        if (this.isCropChange || this.isRotateChange || this.isFlipChange) {
          this.$hiClass.confirm('편집한 내용을 저장하시겠습니까?')
              .then(async () => {
                this.setCropRotateIsChange(true)
                const croppedSrc = await this.imageEditor._tools.crop.setCrop()
                this.curEditImage.thumbnailDataUrl = croppedSrc
                this.curEditImage.editDataUrl = croppedSrc
              })
              .catch(() => {
                this.imageEditor._tools.cropTarget.resetChange()
              })
              .finally(() => {
                this.cropRotateClose()
                this.setEditInfo()
                this.getEditInfo(idx)
              })
        } else {
          this.cropRotateClose()
          this.setEditInfo()
          this.getEditInfo(idx)
        }
      } else {
        this.setEditInfo()
        this.getEditInfo(idx)
      }
    },
    setEditInfo() {
      if (this.imageEditor.getObjects().length > 0) {
        this.curEditImage.objects = this.imageEditor.getObjects()
      }

      if (
          this.imageEditor.getObjects().filter(obj => obj.type !== 'cropTarget').length > 1 ||
          this.editOption.cropRotate.isChange ||
          this.editOption.sticker.isChange ||
          this.editOption.textbox.isChange ||
          this.editOption.draw.isChange
      ) {
        this.curEditImage.thumbnailDataUrl = this.imageEditor.getDataUrl()
        this.setCropRotateIsChange(false)
        this.setStickerIsChange(false)
        this.setTextboxIsChange(false)
        this.setDrawIsChange(false)
      }
    },
    async getEditInfo(idx) {
      this.setTargetIdx(idx)
      const res = await this.imageEditor.resetCanvas(this.curEditImage.editDataUrl)
      if (res) {
        this.curEditImage.objects.forEach(obj => {
          if (obj.type !== 'backgroundImage') {
            this.imageEditor.addObject(obj)
            this.imageEditor.canvas.bringToFront(obj)
          }
        })
        this.imageEditor._tools.sticker.setStickerCount()
        this.imageEditor._tools.textbox.setTextBoxCount()

        if (this.editMode.draw) {
          this.imageEditor._tools.freeDrawing.setBrushSize(this.editOption.draw.brushSize)
        }
      } else {
        this.$hiClass.alert('이미지를 불러오지 못했습니다.')
      }
    },
    setMode(mode) {
      let methodName
      if (this.editMode[mode]) {
        methodName = `${mode}Close`
        if (mode === 'text') {
          this.imageEditor._tools.textbox.initColor()
        }
      } else {
        if (this.editMode.draw) {
          this.imageEditor.setSelectMode()
        }
        if (this.editMode.text) {
          this.imageEditor._tools.textbox.initColor()
        }
        methodName = `${mode}Open`
      }

      if (this.editMode.cropRotate) {
        this.editOption.cropRotate.cropTargetMode = 'O'
        if (this.isCropChange || this.isRotateChange || this.isFlipChange) {
          this.$hiClass.confirm('편집한 내용을 저장하시겠습니까?')
              .then(async () => {
                const croppedSrc = await this.imageEditor._tools.crop.setCrop()
                this.curEditImage.thumbnailDataUrl = croppedSrc
                this.curEditImage.editDataUrl = croppedSrc
                this.imageEditor.setBackgroundImage(croppedSrc)
              })
              .catch(() => {
                this.imageEditor._tools.cropTarget.resetChange()
              })
              .finally(() => {
                this.imageEditor._tools.cropTarget.deleteCropTarget()
                this[methodName]()
              })
        } else {
          this.imageEditor._tools.cropTarget.deleteCropTarget()
          this[methodName]()
        }
      } else {
        this[methodName]()
      }
    },
    prevImage() {
      if (this.targetIdx > 0) {
        this.changeImage(this.targetIdx - 1)
      }
    },
    nextImage() {
      if (this.targetIdx < this.editImages.length - 1) {
        this.changeImage(this.targetIdx + 1)
      }
    },
    closeAll() {
      for (let key of Object.keys(this.editMode)) {
        this.editMode[key] = false
      }
    },
    cropRotateOpen() {
      this.$hiClass.confirm('자르기, 회전 시 이전의 적용된 내용은 수정 불가합니다. 진행하시겠습니까?')
          .then(async () => {
            if (this.imageEditor.getObjects().filter(obj => obj.type !== 'cropTarget').length > 1 || this.editOption.cropRotate.isChange) {
              const dataUrl = this.imageEditor.getDataUrl()
              this.curEditImage.thumbnailDataUrl = dataUrl
              this.curEditImage.editDataUrl = dataUrl
              this.imageEditor.resetCanvas(dataUrl)
            }
            this.imageEditor._tools.cropTarget.makeCropTarget()

            if (this.isZoom) {
              await this.imageEditor.zoom(this.curEditImage.thumbnailDataUrl, false)
              this.imageEditor.setIsZoom(false)
            }
            this.imageEditor.setSelectMode()

            this.closeAll()
            this.editMode.cropRotate = true
          })
          .catch(() => {})
    },
    cropRotateClose() {
      this.editOption.cropRotate.cropTargetMode = 'O'
      this.imageEditor._tools.cropTarget.deleteCropTarget()
      this.editMode.cropRotate = false
    },
    stickerOpen() {
      this.closeAll()
      this.editMode.sticker = true
    },
    stickerClose() {
      this.editMode.sticker = false
    },
    textOpen() {
      this.closeAll()
      this.editMode.text = true
    },
    textClose() {
      this.editMode.text = false
    },
    drawOpen() {
      this.editOption.draw.brushColor = '#000000'
      this.imageEditor._tools.freeDrawing.setIsEraserMode(false)
      this.imageEditor._tools.freeDrawing.setDrawingMode(this.editOption.draw)
      this.closeAll()
      this.editMode.draw = true
    },
    drawClose() {
      this.imageEditor._tools.freeDrawing.resetDrawHistory()
      this.imageEditor.setSelectMode()
      this.editMode.draw = false
    },
    setCropRotateIsChange(isChange) {
      this.editOption.cropRotate.isChange = isChange
    },
    setStickerIsChange(isChange) {
      this.editOption.sticker.isChange = isChange
    },
    setTextboxIsChange(isChange) {
      this.editOption.textbox.isChange = isChange
    },
    setDrawIsChange(isChange) {
      this.editOption.draw.isChange = isChange
    },
    setCurToastMsgType(type) {
      this.curToastMsgType = type
    }
  }
}
</script>

<style scoped>
.fade-leave-from {
  opacity: 1;
}
.fade-leave-active {
  transition: all 0.5s;
}
.fade-leave-to {
  opacity: 0;
}
.image-editor-container .image-select.full-height {
  height: 100%;
}
</style>