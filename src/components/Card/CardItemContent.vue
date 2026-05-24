<template>
  <div class="board__content">

    <!-- TODO: WIP 2022-09-02 작업 중 -->
    <post-homework-status
      v-if="isPostTypeHomework && !isLetterTypeTkBell"
      :is-manager="isManager"
      :post-item="postItem"
      :post-item-type="postItemType"
      :class-name="className"
    ></post-homework-status>

    <span v-if="isManager" class="target">
      {{ $t('main.text.receiving.target') }}: {{ pushTargetNames }}
    </span>

    <div
      v-if="isPostVersionV2"
      class="class-editor-view"
    >
      <post-content
        :isManager="isManager"
        :post-item="postItem"
        :post-item-type="postItemType"
      ></post-content>

      <!-- 구 첨부파일 컴포넌트 -->
      <!-- <attach-content :item="item" /> -->

      <post-image-pack-files
        :post-item="postItem"
        :post-item-type="postItemType"
      ></post-image-pack-files>

      <post-doc-files
        :post-item="postItem"
        :post-item-type="postItemType"
      ></post-doc-files>

      <post-safe-content 
        v-if="!postItem.postOptions === false && postItem.board.postType === 'NOTE'"
        :postOptions="postItem.postOptions"></post-safe-content>
    </div>

    <div v-else-if="isPostVersionV1">

      <post-content-v1
        :post-item="postItem"
        :post-item-type="postItemType"
      ></post-content-v1>

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
        ></post-image-file-v1>

        <post-video-file-v1
          v-for="(videoFile, index) of videoFiles"
          :key="`${videoFile.fileOriginalPath}-${index}`"
          :video-file="videoFile"
          :index="index"
          :post-item="postItem"
          :post-item-type="postItemType"
          @open-cur-video-viewer="openCurVideoViewer"
        ></post-video-file-v1>
      </div>

      <post-other-files-v1
        v-if="otherFiles.length > 0"
        :other-files="otherFiles"
      ></post-other-files-v1>

    </div>

    <note-edit-button-layer
      v-if="isParentActivated && isPostTypeNote && isManager"
      :is-manager="isManager"
      :post-item="postItem"
      :post-item-type="postItemType"
      :school-type="schoolType"
      @is-post="emitIsPost"
    ></note-edit-button-layer>

  </div>

</template>

<script>
import {mapActions, mapGetters} from "vuex";
import PostHomeworkStatus from "@/components/Card/content/PostHomeworkStatus";
import PostContent from "@/components/Card/content/PostContent";
import PostImagePackFiles from "@/components/Card/content/PostImagePackFiles";
import PostDocFiles from "@/components/Card/content/PostDocFiles";
import NoteEditButtonLayer from "@/components/Card/content/NoteEditButtonLayer";
import PostContentV1 from "@/components/Card/content/v1/PostContentV1";
import PostOtherFilesV1 from "@/components/Card/content/v1/PostOtherFilesV1";
import PostImageFileV1 from "@/components/Card/content/v1/PostImageFileV1";
import PostVideoFileV1 from "@/components/Card/content/v1/PostVideoFileV1";
import PostSafeContent from "@/components/Card/content/PostSafeContent"

export default {
  name: "card-item-content",
  components: {
    PostVideoFileV1,
    PostImageFileV1,
    PostOtherFilesV1,
    PostContentV1, NoteEditButtonLayer, PostDocFiles, PostImagePackFiles, PostContent, PostHomeworkStatus,
    PostSafeContent
  },
  props: {
    isParentActivated: {
      type: Boolean,
    },
    isManager: {
      type: Boolean,
    },
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
    schoolType: {
      type: String,
    },
    className: {
      type: String,
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    isPostTypeNote() {
      return this.postItem.postType === this.CONSTANTS.POST_TYPE.NOTE
    },
    isPostTypeHomework() {
      return this.postItem.postType === this.CONSTANTS.POST_TYPE.HOMEWORK
    },
    isPostVersionV2() {
      return this.postItem.version === this.CONSTANTS.POST_VERSION.V2
    },
    isPostVersionV1() {
      return this.postItem.version === this.CONSTANTS.POST_VERSION.V1
        || !this.postItem.version
    },
    isLetterTypeTkBell() {
      return this.postItem.letterType === 'TKBELL'
    },
    existsImageVideoFiles() {
      return this.imageFiles.length > 0 || this.videoFiles.length > 0
    },
    pushTargetNames() {
      let arr = ['선생님']
      switch (this.postItem.pushTarget) {
        case 'ALL': {
          arr.push('학부모')
          arr.push('학생')
          break
        }
        case 'PARENTS': {
          arr.push('학부모')
          break
        }
        case 'STUDENT': {
          arr.push('학생')
          break
        }
      }
      return arr.toString()
    },
    imageFiles() {
      return Array.isArray(this.postItem.files)
        ? this.postItem.files.filter(file =>
            file.fileContentType &&
            file.fileContentType.startsWith('image') &&
            file.fileFlag === 'FILE'
          ).sort((a, b) => a.seq - b.seq)
        : []
    },
    videoFiles() {
      return Array.isArray(this.postItem.files)
        ? this.postItem.files.filter(file =>
            file.fileContentType &&
            file.fileContentType.startsWith('video') &&
            file.fileFlag === 'FILE'
          ).sort((a, b) => a.seq - b.seq)
        : []
    },
    otherFiles() {
      return Array.isArray(this.postItem.files)
        ? this.postItem.files.filter(file =>
            file.fileContentType &&
            !file.fileContentType.startsWith('image') &&
            !file.fileContentType.startsWith('video') &&
            file.fileFlag === 'FILE'
          ).sort((a, b) => a.seq - b.seq)
        : []
    },
  },
  methods: {
    ...mapActions({
      openAttachFilesViewer: "openAttachFilesViewer",
    }),
    emitIsPost(value) {
      this.$emit('is-post', value)
    },
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
  },
  mounted() {
    // console.log("postItem", this.postItem)
  }
}
</script>

<style scoped>

</style>