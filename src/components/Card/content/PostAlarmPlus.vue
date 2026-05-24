<template>
  <div class="board__content">

    <div
      v-if="endTimestamp"
      class="box-deadline"
    >
      <div class="deadline">
        <strong class="heading"><i class="icon-eletter"></i>회신기한 : </strong>
        <span :class="{ end: isExpiredEndTimestamp }">{{ endTimestampToStr }}</span>
      </div>
    </div>

    <span class="target">{{ target }}</span>

    <div
      class="eletter-wrap"
      v-autolinker:[$className]="contents"
    ></div>

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
        @open-cur-video-viewer="openCurVideoViewer"
      />
      <post-other-files-v1
        v-if="otherFiles.length > 0"
        :other-files="otherFiles"
      />

    </div>

    <div class="group-btn">
      <button
        class="hi-btn btn-md"
        :class="[buttonClass]"
        @click="openAlarmPlusDetailPop({ post: postItem })"
      >
        {{ buttonTitle }}
      </button>
    </div>

  </div>

</template>

<script>
import PostImageFileV1 from "@/components/Card/content/v1/PostImageFileV1";
import PostVideoFileV1 from "@/components/Card/content/v1/PostVideoFileV1";
import PostOtherFilesV1 from "@/components/Card/content/v1/PostOtherFilesV1";
import {mapActions} from "vuex";
export default {
  name: "post-alarm-plus",
  components: {PostOtherFilesV1, PostVideoFileV1, PostImageFileV1},
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
    alarmPlus: {
      type: Object,
      required: true
    }
  },
  computed: {
    contents() {
      return this.alarmPlus.contents || ''
    },
    target() {
      return `수신대상: ${this.studentNameArray}`
    },
    studentNameArray() {
      return this.alarmPlus
        ? this.alarmPlus.studentNameArray || ''
        : ''
    },
    isExpiredReply() {
      return this.isExpiredEndTimestamp || this.alarmPlus.letterStatus === 'END'
    },
    isExpiredEndTimestamp() {
      const endTimestamp = this.endTimestamp
      const expiredTime = this.$moment(endTimestamp)
      const overSeconds = this.$moment().diff(expiredTime, 'seconds')

      return overSeconds >= 0
    },
    endTimestamp() {
      return this.alarmPlus.endTimestamp
    },
    endTimestampToStr() {
      if (this.isExpiredEndTimestamp) return '기간이 만료되었습니다.'

      const endTimestamp = this.endTimestamp

      if (endTimestamp) {
        let dateFormat = 'M[월] D[일] (ddd) HH:mm:ss'
        const nowYear = this.$moment().year()
        const paramYear = this.$moment(endTimestamp).year()

        if (nowYear - paramYear > 0)
          dateFormat = `YYYY[년] ${dateFormat}`

        return this.$moment(endTimestamp).format(dateFormat) + ' 까지'
      } else {
        return '회신기한 없음'
      }
    },

    files() {
      return this.postItem.files || []
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
    buttonTitle() {
      return this.alarmPlus.replyYnText
    },
    buttonClass() {
      let buttonClass = ''

      const letterType = this.alarmPlus.letterType
      switch (letterType) {
        case 'CONSULTATION':
        case 'AFTER_SCHOOL':
        case 'QUESTIONNAIRE': {
          if (this.alarmPlus.replyYn === 'Y')
            buttonClass = 'btn-line'

          if (this.isExpiredReply)
            buttonClass = 'btn-end'
          break
        }
      }
      return buttonClass
    },

  },
  methods: {
    ...mapActions({
      openAlarmPlusDetailPop: 'openAlarmPlusDetailPop',
      openAttachFilesViewer: 'openAttachFilesViewer',
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