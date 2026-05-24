<template>
  <div class="top-attachment-wrap">
    <div class="slide top-attachment-inner">
      <!--      @afterChange="handleAfterChange"-->
      <!--      @init="handleInit"-->
      <Slick
        ref="slide"
        :options="option.slickOptions"
      >
        <div
          class="slick-slide"
          v-for="item of docImageFilesAndLoadingBars"
          :key="item.fileOriginalPath"
        >
          <div
            v-if="!item.isLoadingBar"
            :key="item.fileOriginalPath"
            class="item"
            role="button"
          > <!-- 버튼이면 role="button" 추가 -->
            <span @click="openAttachFile(item)">{{ item.fileName }}</span>
            <button
              v-if="!isReadonly"
              class="btn-del"
              @click="fileDelete(item)"
            ></button>
          </div>

          <div
            v-else
            class="loading-infinite-scroll-wrap loading-bar"
            :key="`${item.fileOriginalPath}-loadingBar`"
          >
            <div class="icon"></div>
          </div>

        </div>

      </Slick>
    </div>
  </div>

<!--    <div class="slick-slide">
      <div class="item" role="button"> &lt;!&ndash; 버튼이면 role="button" 추가 &ndash;&gt;
        <span>임시정부수립 100주년 안내.pdf</span><button class="btn-del"></button>
      </div>
    </div>

    <div class="slick-slide">
      <div class="item" role="button"> &lt;!&ndash; 버튼이면 role="button" 추가 &ndash;&gt;
        <span>임시정부수립 100주년 안내임시정부수립 100주년 안내.pdf</span><button class="btn-del"></button>
      </div>
    </div>-->

</template>

<script>
import Slick from 'vue-slick'
import 'slick-carousel/slick/slick.css'

export default {
  name: "worksheet-apply-upload-list",
  components: {
    Slick
  },
  props: {
    files: {
      type: Array
    },
    isReadonly: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      option: {
        slickOptions: {
          speed: 300,
          draggable: true,
          variableWidth: true,
          infinite: false,
          cssEase: 'linear'
        }
      },

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
    docImageFiles() {
      return this.files.filter(f => {
        return f.fileContentType && (!f.fileContentType.startsWith('video'))
      }) || []
    },
    loadingBars() {
      return this.files.filter(f => f.isLoadingBar) || []
    },
    docImageFilesAndLoadingBars() {
      return this.docImageFiles.concat(this.loadingBars)
    },
  },

  watch: {
    fileData(newModel) {
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

  mounted() {
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

<style scoped>
.loading-infinite-scroll-wrap.loading-bar {
  position: relative;
  height: 36px;
  padding: 0 36px 0 20px;
  margin: 14px 5px;
}
</style>