<template>
  <div class="modal talk-view-attached-file-modal has-top-btn-wrap" style="display: block">
    <div class="modal-cont-wrap">
      <div class="modal-cont">
        <div class="modal-cont-inner">
          <div class="modal-top-btn-wrap">
            <div class="right-wrap">
              <button :disabled="isDownloading" class="download-btn" @click="download"><span>{{ downloadButtonName }}</span></button>
              <div class="modal-close-btn modal-close-icon" @click="hideVideoViewLayout"></div>
            </div>
          </div>

          <!-- 2021-01-15 HcVideo.vue 파일 참고해주세요 -->
          <div class="video-view-wrap">
            <video ref="video" id="vjs_video" class="video-js vjs-theme-forest"></video>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapMutations, /*mapGetters,*/ mapState, mapActions} from "vuex";
// basic js, css
import videojs from 'video.js'
import 'video.js/dist/video-js.min.css'

// Forest theme
import '@videojs/themes/dist/forest/index.css'


export default {
  data: () => ({
    player: null,
  }),
  props: {},
  computed: {
    ...mapState("storeHitalk",[
      "isShowVideoViewLayout",
      "videoFileContent"
    ]),
    ...mapState([
      "downloadStatus",
      "hitalkDownloadStatus"
    ]),
    isDownloading: function () {
      return this.hitalkDownloadStatus[this.videoFileContent.fileOriginalPath] || this.hitalkDownloadStatus[this.videoFileContent.fileTranscodePath]
    },
    downloadButtonName: function () {
      //const status = this.downloadStatus[this.videoFileContent.fileOriginalPath] || this.downloadStatus[this.videoFileContent.fileTranscodePath]
      //return status && status.isDownloading ? `다운중(${status.percentCompleted}%)` : '다운로드' 
      return this.isDownloading ? '다운중' : '다운로드'
    }
  },
  watch:{
    isShowVideoFileViewer: {
      handler: function () {
        this.loadVideo();
      }
    },
  },
  methods: {
    ...mapMutations("storeHitalk",[
      'showVideoViewLayout',
      'hideVideoViewLayout',
    ]),
    ...mapActions({
      downloadVideoFile: 'downloadVideoFile',
      downloadHitalkVideoFile: 'downloadHitalkVideoFile'
    }),
    loadVideo() {
      if (this.player) this.player.dispose();

      const orgSrc = this.videoFileContent.fileOriginalPath
        .replace('https://download.hiclass.net', 'https://streaming.hiclass.net')

      let transSrc = ""
      if(this.videoFileContent.fileTranscodePath) {  
        transSrc = this.videoFileContent.fileTranscodePath
          .replace('https://download.hiclass.net', 'https://streaming.hiclass.net')
      } else {
        transSrc = this.videoFileContent.fileConvertPath
        .replace('https://download.hiclass.net', 'https://streaming.hiclass.net')
      }

      this.player = videojs(this.$refs.video, {
        sources: [
          { src: transSrc },  // 인코딩 완료 파일이 있는 경우 재생
          { src: orgSrc },
        ],
        poster: this.videoFileContent.fileThumbnailPath,
        // autoplay: true,
        controls: true,
        playsinline: true,
        // muted: true,
        preload: "metadata",
        controlBar: {
          playToggle: true,
          pictureInPictureToggle: true,
          remainingTimeDisplay: true,
          progressControl: true,
        }
      });

      const callToastMessage = () => {
        this.$toasted.clear()
        const options = { duration: 3000 }
        this.$toasted.show('동영상 재생까지 수 초 이상 소요될 수 있습니다.', options)
      }
      this.player.bigPlayButton.on('click', function() {
        callToastMessage()
      });

      // lang ko
      const koJson = require('video.js/dist/lang/ko.json')
      videojs.addLanguage('ko', koJson)
    },
    download() {
      this.downloadHitalkVideoFile({ file: this.videoFileContent })
    },
  },
  mounted() {
    this.loadVideo();
    this.$nextTick(() => {
      this.$jqueryUtil.scrollbar();
    });

  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose()
    }
    this.hideVideoViewLayout();
  }
}
</script>

<style scoped></style>
