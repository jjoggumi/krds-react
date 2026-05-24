<template>
  <div class="image-list">
    <draggable
        v-model="editImages"
        v-bind="dragOptions"
        @start="isDrag = true"
        @end="isDrag = false"
    >
      <transition-group type="transition" :name="!isDrag ? 'flip-list' : null">
        <div class="image-wrap" v-for="(editImage, idx) of editImages" :key="`editImage-${idx}`">
          <i class="delete" v-if="imageLimitCount > 1 && !isPostEditorMode" @click="deleteImage(editImage, idx)"></i>
          <div class="image" :class="{'on': targetIdx === idx}" @click="selectImage(idx)">
            <img :src="editImage.thumbnailDataUrl"  alt=""/>
          </div>
        </div>
      </transition-group>
    </draggable>

    <div class="image-wrap add" @click="uploadImages(null)" v-if="(imageLimitCount > editImages.length || imageLimitCount === null) && !isPostEditorMode">
      <i class="add"></i>
      <div class="image">
      </div>
      <form method="POST" onsubmit="return false;" enctype="multipart/form-data">
        <input type="file" ref='inputFile' style="display:none;" @change="uploadImages($event)" multiple accept="image/*"/>
      </form>
    </div>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import draggable from 'vuedraggable'

export default {
  name: "image-editor-image-list",
  components: {
    draggable
  },
  data() {
    return {
      isDrag: false,
      dragOptions: {
        animation: 200,
        disabled: false,
        forceFallback: true
      },
    }
  },
  props: {
    imageEditor: {
      type: Object
    },
    curEditImage: {
      type: Object
    },
    editMode: {
      type: Object
    }
  },
  computed: {
    ...mapState('storeImageEditor', {
      storeEditImages: 'editImages',
      imageLimitCount: 'imageLimitCount',
      targetIdx: 'targetIdx',
      isPostEditorMode: 'isPostEditorMode'
    }),
    editImages: {
      get() {
        return this.storeEditImages
      },
      set(value) {
        const curEditImagePath = this.curEditImage.fileOriginalPath
        this.setEditImages(value)
        const curEditIdx = this.editImages.findIndex(editImage => editImage.fileOriginalPath === curEditImagePath)
        this.setTargetIdx(curEditIdx)
      }
    }
  },
  mounted() {
    this.bindScrollEvent()
  },
  methods: {
    ...mapActions('storeImageEditor', {
      readFile: 'readFile',
      deleteEditImages: 'deleteEditImages'
    }),
    ...mapMutations('storeImageEditor', {
      appendEditImages: 'appendEditImages',
      appendDeleteImages: 'appendDeleteImages',
      setEditImages: 'setEditImages',
      setTargetIdx: 'setTargetIdx'
    }),
    async uploadImages(e) {
      if (e === null) {
        this.$refs.inputFile.click()
      } else {
        if (e.target.files.length + this.editImages.length > this.imageLimitCount) {
          this.$hiClass.alert(`${this.imageLimitCount}개 까지 첨부 가능.`)
          return false
        }
        for (let i = 0; i < e.target.files.length; i++) {
          if (!e.target.files[i].type.startsWith('image')) continue

          const fileName = e.target.files[i].name
          const { result } = await this.readFile(e.target.files[i])

          if (this.editImages.length === 0) {
            this.imageEditor.setBackgroundImage(result)
          }
          await this.appendEditImages({result, fileName})

          if (i === 0 && this.editImages.length > 1) {
            this.$emit('changeImage', this.editImages.length - 1)
          }
        }

        this.$refs.inputFile.value = ''
      }
    },
    selectImage(idx) {
      this.$emit('changeImage', idx)
    },
    async deleteImage(editImage, idx) {
      if (this.editMode.cropRotate) {
        this.imageEditor._tools.cropTarget.deleteCropTarget()
        this.$emit('setMode', 'cropRotate')
      }
      if (editImage.isUploaded) {
        this.appendDeleteImages(editImage)
      }
      const res = await this.deleteEditImages(idx)
      if (res) {
        if (this.editImages.length > 0) {
          this.imageEditor.setBackgroundImage(this.curEditImage.editDataUrl)
        }
      }
    },
    bindScrollEvent() {
      const imageListEl = document.querySelector(".image-list")
      let imageListDown = false
      let imageListStartX
      let imageListScrollLeft
      imageListEl.addEventListener('mousedown', e => {
        e.preventDefault()
        imageListDown = true
        imageListStartX = e.pageX - imageListEl.offsetLeft
        imageListScrollLeft = imageListEl.scrollLeft
      })
      imageListEl.addEventListener('mouseleave', () => {
        imageListDown = false
      })

      imageListEl.addEventListener('mouseup', () => {
        imageListDown = false
      })

      imageListEl.addEventListener('mousemove', e => {
        if (!imageListDown) return
        e.preventDefault()
        const x = e.pageX - imageListEl.offsetLeft
        const walk = x - imageListStartX
        imageListEl.scrollLeft = imageListScrollLeft - walk
      })

      imageListEl.addEventListener('wheel', e => {
        const direction = e.wheelDelta === 120 ? "up" : "down"
        const lastLeft = imageListEl.scrollWidth - imageListEl.offsetWidth
        if(direction === "down") {
          if(imageListEl.scrollLeft < lastLeft) {
            imageListEl.scrollLeft = imageListEl.scrollLeft + 20
          }
        } else {
          if(imageListEl.scrollLeft > 0) {
            imageListEl.scrollLeft = imageListEl.scrollLeft - 20
          }
        }
      })

      window.addEventListener('keydown', (e) => {
        if (e.keyCode === 37) {
          this.$emit('prevImage')
        }
        if (e.keyCode === 39) {
          this.$emit('nextImage')
        }
      })
    }
  }
}
</script>

<style scoped>

</style>