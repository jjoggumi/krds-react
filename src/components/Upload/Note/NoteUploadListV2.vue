<template>
  <div class="attaching-file-list" style="height:100%">
    <slick :options="slick" ref="slide">
      <template v-for="item of docFilesAndLoadingBars">
        <div class="attaching-file btn-bg-w2" :key="item.fileOriginalPath" v-if="!item.isLoadingBar">
          <span
            @click="openAttachFile(item)"
          >
            {{item.fileName}}
          </span>
          <button @click="fileDelete(item)" class="delete-btn"></button>
        </div>
        <div class="loading-infinite-scroll-wrap" :key="`${item.fileOriginalPath}-loadingBar`" v-else>
          <div class="icon"></div>
        </div>
      </template>
    </slick>
  </div>
</template>

<script>
import Slick from "vue-slick"
import "../../../../node_modules/slick-carousel/slick/slick.css"

export default {
  name: 'note-upload-list-v2',
  components: { 
    Slick
  },
  props: {
    files: {
      type: Array
    },
    addedFiles: {
      type: Array
    }
  },
  data() {
    return { 
      slick: {
        speed: 300,
        variableWidth: true,
        cssEase: "linear",
        infinite: false,
        slidesToShow: 3
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
    docFiles() {
      return this.files.filter(f => {
        return f.fileContentType && (!f.fileContentType.startsWith('image') && !f.fileContentType.startsWith('video'))
      }) || []
    },
    loadingBars() {
      return this.files.filter(f => f.isLoadingBar) || []
    },
    docFilesAndLoadingBars() {
      return this.docFiles.concat(this.loadingBars)
    }
  },
  mounted() {

  },
  watch: {
    fileData (newModel) {
      if (newModel.length > 0) {
        if (this.$refs.slide) {
          let currIndex = this.$refs.slide.currentSlide()
          this.$refs.slide.destroy()

          this.$nextTick(() => {
            this.$refs.slide.create()
            this.$refs.slide.goTo(currIndex, true)
          })
        }
      }
    }
  },
  methods: {
    fileDelete(file) {
      this.fileData = this.fileData.filter(item => {
        return item.fileOriginalPath !== file.fileOriginalPath
      })
    },
    openAttachFile(file) {
      if (this.$comn.isImage([file], true).length > 0) {
        this.$store.commit('setImageView', {
          isOpen: true,
          items: [file],
          index: 0
        })
      } else {
        this.$store.commit('setDocView', {
          isOpen: true,
          item: file
        })
      }
    },
  }
}
</script>
