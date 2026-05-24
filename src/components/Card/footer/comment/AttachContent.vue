<template>
  <fragment>
    <div v-if="isImage || isVideo" class="img-vedio-view-wrap">
      <div class="img-vedio-view-inner">
        <div v-if="isImage" class="img-view-wrap">
          <div
            v-for="(img, i) in imageFiles.slice(0, 2)"
            :key="img.fileOriginalPath"
            :class="getImageLayerClass(i)"
            :style="getImageMainLayerStyle()"
            @click="openAttachFilesViewer({
              items: imageFiles,
              index: i,
              contentType: img.fileContentType
            })"
          >
            <a v-if="imageFiles.length === 1" href="javascript:">
              <img-crop
                :src="img.fileOriginalPath"
                :width="$store.state.classImgCrop1.width"
                :height="$store.state.classImgCrop1.height"
              />
            </a>
            <div v-else>
              <div class="cropBox" :style="getImageSubLayerStyle()">
                <img-crop
                  :src="img.fileOriginalPath"
                  :width="$store.state.classImgCrop2.width"
                  :height="$store.state.classImgCrop2.height"
                />
              </div>
              <div v-if="imageFiles.length > 2 && i === 1" class="cover-more">
                <div class="more-text">
                  <span>더보기</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <template v-for="video in videoFiles">
          <hc-video
            :key="`${video.fileOriginalPath}`"
            :item="item"
            :file="video"
            :options="$hiClass.setVideoOptions(video, 'classImgCrop1')"
          />
        </template>
      </div>
    </div>
    <div v-if="isAttach" class="text-wrap">
      <template v-for="file of attachFiles">
        <button
          :key="file.currentId"
          class="attached-file btn-bg-cg"
          @click="openAttachFilesViewer({
            item: file,
            contentType: file.fileContentType
          })"
        >
          {{ file.fileName }}
        </button>
      </template>
    </div>

  </fragment>
</template>

<script>
import imgCrop from '../../../../apps/main/MainBodyItemImageCropper'
import HcVideo from '@/components/Form/HcVideo'
import {mapActions} from "vuex";

export default {
  name: 'AttachContent',
  components: {
    HcVideo,
    imgCrop
  },
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      imageView: {
        visible: false,
        index: 0
      }
    }
  },
  computed: {
    isImage() {
      return this.imageFiles.length > 0
    },
    isVideo() {
      return this.videoFiles.length > 0
    },
    isAttach() {
      return this.attachFiles.length > 0
    },
    imageFiles() {
      return this.item.files.filter(item => {
        return item.fileContentType.indexOf('image') !== -1
      }, {})
    },
    videoFiles() {
      return this.item.files.filter(item => {
        return item.fileContentType.indexOf('video') !== -1
      }, {})
    },
    attachFiles() {
      return this.item.files.filter(item => {
        return (
          item.fileContentType.indexOf('image') === -1 &&
          item.fileContentType.indexOf('video') === -1
        )
      }, {})
    }
  },
  mounted() {
  },
  methods: {
    ...mapActions({
      openAttachFilesViewer: "openAttachFilesViewer",
    }),
    getImageLayerClass(index) {
      if (this.imageFiles.length > 1) {
        return index === 0 ? 'left-wrap' : 'right-wrap'
      } else {
        return 'cropBox'
      }
    },
    getImageMainLayerStyle() {
      let styles = {
        cursor: 'pointer',
        'text-align': 'center'
      }

      if (this.imageFiles.length === 1) {
        styles = Object.assign(
          {
            width: this.$store.state.classImgCrop1.width,
            height: this.$store.state.classImgCrop1.height
          },
          styles
        )
      }

      return styles
    },
    getImageSubLayerStyle() {
      return {
        width: this.$store.state.classImgCrop2.width,
        height: this.$store.state.classImgCrop2.height,
        'text-align': 'center'
      }
    },
  }
}
</script>

<style scoped></style>
