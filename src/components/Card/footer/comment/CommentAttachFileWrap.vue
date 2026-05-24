<template>
  <div>
    <!-- <template v-for="file in files">
      <div
        v-if="file.fileContentType.indexOf('image') > -1"
        :key="file.currentId"
        class="photo"
        role="button"
        @click="imageView(file, true, 0)"
      >
        <img :src="$comn.isImage(files, true)[0].fileOriginalPath" alt="">
      </div>
      <button
        v-else
        :key="file.currentId"
        class="btn-file"
        @click="docView(file)"
      >
        <span>{{ file.fileName }}</span>
      </button>
    </template> -->


    <div class="photo" role="button" v-if="imageFiles.length > 0">
      <template v-for="(file, index) of imageFiles">
        <span class="img" 
          :key="`${file.fileOriginalPath}-${index}`" 
          @click="openAttachFilesViewer({
            items: [...imageFiles],
            index: index,
            contentType: file.fileContentType
          })"
          :style="getThumbnail(file)"
        >
        </span>
      </template>
    </div>
    
    <div class="btn-file" role="button" v-if="docFiles.length > 0">
      <template v-for="(file, index) of docFiles">
        <span class="file"
          :key="`${file.fileOriginalPath}-${index}`"
          @click="docView(file)"
        >
          <span>{{ file.fileName }}</span>
          <button class="btn-delete"></button>
        </span>
      </template>
    </div>

    <div class="video" role="button" v-if="videoFiles.length > 0">
      <template v-for="(file, index) of videoFiles">
        <span class="thumb" 
          :class="{
            encoded: file.fileThumbnailPath
          }"
          :key="`${file.fileOriginalPath}-${index}`"
          @click="openAttachFile(file)"
        >
          <template v-if="file.fileThumbnailPath">
            <img :src="file.fileThumbnailPath">
            <button></button>
          </template>

          <template v-else>
            <button></button>
          </template>
        </span>
      </template>
    </div>
  </div>
</template>
<script>
import { mapMutations, mapState, mapActions } from "vuex";

export default {
  name: 'comment-attach-file-wrap',
  components: {},
  props: {
    files: {
      type: Array,
      required: true
    },
    userId: String,
    postType: String,
  },
  data() {
    return {
      isImgView: false,
      commentFiles: []
    }
  },
  computed: {
    ...mapState({
      classImgCrop1: 'classImgCrop1',
      imagePackResize: 'imagePackResize'
    }),
    imageFiles() {
      return this.files.filter(v => v.fileContentType.startsWith('image'))
    },
    videoFiles() {
      return this.files.filter(v => v.fileContentType.startsWith('video'))
    },
    docFiles() {
      return this.files.filter(v => v.fileContentType.startsWith('image') === false && v.fileContentType.startsWith('video') === false)
    },
  },
  methods: {
    ...mapActions({
      openAttachFilesViewer: "openAttachFilesViewer",
    }),
    ...mapMutations({
      setImageView: 'setImageView',
      setDocView: 'setDocView',
    }),
    imageView(file, bool, i) {
      this.commentFiles = []
      this.commentFiles.push(file)
      this.isImgView = bool
      this.imgIndex = i

      this.setImageView({
        isOpen: this.isImgView,
        items: [file],
        index: this.imgIndex,
        userId: this.userId, 
        postType: this.postType
      })
    },
    openAttachFile(file) {
      this.$store.commit('setImageView', {
        isOpen: true,
        items: [file],
        index: 0,
        post: {
          postType: 'BOARD'
        }
      })
    },
    docView(fileOrFiles) {
      // if(this.postType !== "EVENT") {
      //   this.setDocView({
      //     isOpen: true,
      //     item: fileOrFiles
      //   })
      // } else {
      //   if(this.userId === this.$store.state.user.currentId) {
      //     this.setDocView({
      //       isOpen: true,
      //       item: fileOrFiles
      //     })
      //   }
      // }
      if((this.userId === this.$store.state.user.currentId && this.postType === "EVENT") || this.postType !== "EVENT") {
        this.setDocView({
          isOpen: true,
          item: fileOrFiles
        })
      }
    },
    getThumbnail(file) {
      let thumbnailPath = ""
      if (file.fileThumbnailPath){
        thumbnailPath = file.fileThumbnailPath
      } else {
        thumbnailPath = file.fileOriginalPath.replace('//download', '//image')
            .concat(`?width=${this.imagePackResize.THUMBNAIL_MAX_WIDTH}`)
            .concat(`&height=${this.imagePackResize.THUMBNAIL_MAX_HEIGHT}`)
      }

      return `background-image: url(${thumbnailPath})`;
    }
  },
  mounted() {
    // console.log("mounted => ", this.files)

    // console.log("docFiles", this.docFiles)
  }
}
</script>

<style></style>
