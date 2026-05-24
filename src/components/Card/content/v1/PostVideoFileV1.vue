<template>
  <div
    v-if="isEncoding"
    @click="checkVideo"
  >
    <div class="class-fr-editor">
      <span class="fr-video"><span class="thumb-default"></span></span>
    </div>
  </div>

  <div
    v-else
    role="button"
    class="video-image"
    @click="emitOpenCurVideoViewer"
  >
    <img :src="fileThumbnailPath" alt="">
  </div>
</template>

<script>
export default {
  name: "post-video-file-v1",
  props: {
    videoFile: {
      type: Object
    },
    index: {
      type: Number
    },
    /**
     * props: post item object
     * ( post | clazzesPost | schoolsPost | postHomeworkUsers )
     */
    postItem: {
      type: Object
    },
    /**
     * props: post item type
     * ( POST | CLAZZES_POST | SCHOOLS_POST | POST_HOMEWORK_USERS )
     */
    postItemType: {
      type: String
    },
    workId: {
      type: [String, null]
    },
  },
  data() {
    return {
      isBusy: false
    }
  },
  computed: {
    /**
     * TODO: 2022-09-15 검색엔진 게시글 목록 API 요청 시
     * 외부 스케줄러로 변경된 사항은 검색엔진 DB 에 반영되지 않아 인코딩 상태가 지속될 수 있음. (처리 예정)
     * @returns {boolean}
     */
    isEncoding() {
      return !this.videoFile.fileTranscodePath
    },
    isIscreamStreamFile() {
      return this.videoFile.fileOriginalPath.includes('rtmp.i-scream.co.kr')
    },
    isPlayableType() {
      return (
        this.videoFile.fileContentType.includes('video/mp4') ||
        this.isIscreamStreamFile
      )
    },
    fileThumbnailPath() {
      return this.videoFile.fileThumbnailPath
    },
  },
  methods: {
    checkVideo() {
      if (this.isPlayableType) {
        this.emitOpenCurVideoViewer()
        return false
      }

      if (this.isBusy) {
        return false
      }

      this.isBusy = true

      // 과제 분기 처리 (차후 리팩토링 예정)
      let subParam = ''
      let readObj = null

      if (this.postItemType === 'POST_HOMEWORK_USERS') {
        subParam = 'postHomeworkUsers'
        readObj = `/postHomeworkUsers/${this.workId}`
      } else {
        subParam = 'posts'
        readObj = this.postItem
      }

      this.$hiClass[subParam]
        .read(readObj)
        .then(res => {
          const renewVideoFile = res.data.files.find(file =>
            file.fileOriginalPath === this.videoFile.fileOriginalPath)

          if (renewVideoFile && renewVideoFile.fileTranscodePath) {
            this.replaceVideoFile(renewVideoFile)
            this.emitOpenCurVideoViewer()

          } else {
            this.$hiClass.alert('동영상 인코딩 중입니다.<br>완료된 후 확인하실 수 있습니다.')
          }
        })
        .catch(err => {
          this.$log.debug(this.$options.name, ' checkVideo() error => ', err)
        })
        .finally(() => {
          this.isBusy = false
        })
    },
    replaceVideoFile(renewVideoFile) {
      for (const [key, value] of Object.entries(renewVideoFile)) {
        this.videoFile[key] = value
      }
    },
    emitOpenCurVideoViewer() {
      this.$emit('open-cur-video-viewer', this.index)
    }
  }
}
</script>

<style scoped>

</style>