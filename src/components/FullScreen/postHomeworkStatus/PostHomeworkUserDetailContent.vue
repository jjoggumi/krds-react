<template>
  <div class="board__content">
    <post-content-v1
      v-if="content"
      :post-item="postItem"
      :post-item-type="postItemType"
      :content="content"
    />

    <div
      v-if="existsImageVideoFiles"
      class="group-v1-image-video"
    >
      <post-image-file-v1
        v-for="(imageFile, index) of imageFiles"
        :key="`${imageFile.fileOriginalPath}-${index}`"
        :image-file="imageFile"
        :index="index"
        @open-cur-image-viewer="openCurImageViewer"
      />

      <post-video-file-v1
        v-for="(videoFile, index) of videoFiles"
        :key="`${videoFile.fileOriginalPath}-${index}`"
        :video-file="videoFile"
        :index="index"
        :post-item-type="postItemType"
        :work-id="workId"
        @open-cur-video-viewer="openCurVideoViewer"
      />

    </div>

    <post-other-files-v1
      v-if="otherFiles.length > 0"
      :other-files="otherFiles"
    />

  </div>
</template>

<script>
import PostContentV1 from "@/components/Card/content/v1/PostContentV1";
import PostOtherFilesV1 from "@/components/Card/content/v1/PostOtherFilesV1";
import PostImageFileV1 from "@/components/Card/content/v1/PostImageFileV1";
import postVideoFileV1 from "@/components/Card/content/v1/PostVideoFileV1";
import {mapActions} from "vuex";
export default {
  name: "post-homework-user-detail-content",
  components: {postVideoFileV1, PostImageFileV1, PostOtherFilesV1, PostContentV1},
  props: {
    postHomeworkUser: {
      type: Object,
      required: true
    },
  },
  computed: {
    postItem() {
      return this.postHomeworkUser.post
    },
    postItemType() {
      return 'POST_HOMEWORK_USERS'
    },
    content() {
      return this.postHomeworkUser.workContent
    },
    workId() {
      return this.postHomeworkUser.currentId
    },
    files() {
      return this.postHomeworkUser.files || []
    },
    existsImageVideoFiles() {
      return this.imageFiles.length > 0 || this.videoFiles.length > 0
    },
    imageFiles() {
      return this.files.filter(file =>
        file.fileContentType &&
        file.fileContentType.startsWith('image') &&
        file.fileFlag === 'FILE'
      )
    },
    videoFiles() {
      return this.files.filter(file =>
        file.fileContentType &&
        file.fileContentType.startsWith('video') &&
        file.fileFlag === 'FILE'
      )
    },
    otherFiles() {
      return this.files.filter(file =>
        file.fileContentType &&
        !file.fileContentType.startsWith('image') &&
        !file.fileContentType.startsWith('video') &&
        file.fileFlag === 'FILE'
      )
    },
  },
  methods: {
    ...mapActions({
      openAttachFilesViewer: 'openAttachFilesViewer'
    }),
    openCurImageViewer(index) {
      const imageFile = this.imageFiles[index]
      this.openAttachFilesViewer({
        items: this.imageFiles,
        index: index,
        contentType: imageFile.fileContentType
      })
    },
    openCurVideoViewer(index) {
      const videoFile = this.videoFiles[index]
      this.openAttachFilesViewer({
        items: this.videoFiles,
        index: index,
        contentType: videoFile.fileContentType
      })
    },
  }
}
</script>

<style scoped>

</style>