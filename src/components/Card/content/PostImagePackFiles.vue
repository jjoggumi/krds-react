<template>
  <div
    v-if="imagePackFiles.length > 0"
    class="img-list"
  >
    <div class="img-list-inner">
      <a
        v-for="(imagePackFile, i) of imagePackFiles"
        :key="`${imagePackFile.fileOriginalPath}-${i}`"
        href="javascript:"
        @click="openAttachFilesViewer({
          items: [...imageFiles, ...imagePackFiles],
          index: imageFiles.length + i,
          contentType: imagePackFile.fileContentType
        })"
      >
        <img
          :src="getThumbnail(imagePackFile)"
          alt=""
        >
      </a>
    </div>
  </div>

  <div v-else></div>
</template>

<script>
import {mapActions, mapState} from "vuex";

export default {
  name: 'post-image-pack-files',
  components: {},
  props: {
    /**
     * props: post item object
     * ( post | clazzesPost | schoolsPost )
     */
    postItem: {
      type: Object,
      required: true
    },
    /**
     * props: post item type
     * ( POST | CLAZZES_POST | SCHOOLS_POST )
     */
    postItemType: {
      type: String,
      required: true
    },
  },
  data() {
    return {}
  },
  computed: {
    ...mapState({
      imagePackResize: 'imagePackResize'
    }),
    imagePackFiles() {
      return this.postItem.files ? this.postItem.files.filter(file =>
        file.fileContentType.indexOf('image') > -1 && 
        file.fileFlag === 'IMAGE_PACK' &&
        !file.fileOriginalPath === false
      ) : []
    },
    imageFiles() {
      return this.postItem.files ? this.postItem.files.filter(file =>
        file.fileContentType.indexOf('image') > -1 && 
        file.fileFlag === 'FILE' &&
        !file.fileOriginalPath === false
      ) : []
    }
  },
  created() {},
  mounted() {},
  methods: {
    ...mapActions({
      openAttachFilesViewer: "openAttachFilesViewer",
    }),
    getThumbnail(imagePackFile) {
      const replaceNewResizePolicy = () => {
        // 묶음 사진 이미지일 경우 썸네일 주소 생성
        return imagePackFile.fileOriginalPath.replace('//download', '//image')
          .concat(`?width=${this.imagePackResize.THUMBNAIL_MAX_WIDTH}`)
          .concat(`&height=${this.imagePackResize.THUMBNAIL_MAX_HEIGHT}`)
      }
      let thumbnailPath = imagePackFile.fileThumbnailPath

      if (thumbnailPath === null) {
        return replaceNewResizePolicy()

      } else {
        try {
          const query = thumbnailPath.split('?')[1]
          const parsedQuery = this.$qs.parse(query)
          const lessNewResizePolicyWidth = parseInt(parsedQuery.width || '0', 10) <= parseInt(this.imagePackResize.THUMBNAIL_MAX_WIDTH, 10)
          const lessNewResizePolicyHeight = parseInt(parsedQuery.height || '0', 10) <= parseInt(this.imagePackResize.THUMBNAIL_MAX_HEIGHT, 10)

          if (lessNewResizePolicyWidth || lessNewResizePolicyHeight)
            thumbnailPath = replaceNewResizePolicy()

        } catch (e) {
          thumbnailPath = replaceNewResizePolicy()
        }
      }

      return thumbnailPath
    }
  },
}
</script>

<style scoped></style>
