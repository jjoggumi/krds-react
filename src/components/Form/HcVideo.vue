<template>
  <div class="video-view-wrap">
    <!-- 인코딩 중 -->
    <div
      v-if="isEncoding || isError"
      class="img-vedio-view-wrap"
      :style="{
        width: options.width,
        height: options.height,
        cursor: 'pointer'
      }"
      @click.stop="isVideo"
    >
      <div class="img-vedio-view-inner">
        <div class="img-view-wrap">
          <div class="center-wrap">
            <div class="img">
              <div class="cover-empty">
                <div class="empty-icon01"><span></span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- video.js 테스트 -->
    <template v-else>
      <video
        v-if="isLoadVideo"
        ref="videoPlayer"
        class="video-js vjs-theme-forest"
        data-setup='{"language":"ko"}'
        @error="isErrorHandler"
      ></video>

      <div
        v-else
        class="img-vedio-view-wrap"
        :style="{
          width: options.width,
          height: options.height,
          cursor: 'pointer'
        }"
        @click.stop="loadVideo"
      >
        <div class="img-vedio-view-inner">
          <div class="img-view-wrap">
            <div class="center-wrap">
              <div class="cover-video">
                <div class="video-icon02"><span>재생</span></div>
              </div>
              <div class="img">
                <img
                  class="cropimg"
                  :src="options.poster"
                  :width="options.width"
                  :height="options.height"
                  loading="lazy"
                  alt="미리보기 이미지가 없습니다."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--  -->
    </template>
  </div>
</template>

<script>
// basic js, css
import videojs from 'video.js'
import 'video.js/dist/video-js.min.css'
import {mapMutations} from "vuex";
import {eventBus} from "@/main";

// Forest theme
import '@videojs/themes/dist/forest/index.css'

export default {
  name: 'HcVideo',
  props: {
    item: {
      type: Object,
      required: true
    },
    file: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default() {
        return {}
      }
    },
    isAutoPlay: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      video: this.file,
      isError: false,
      isLoadVideo: false,
      player: null
    }
  },
  computed: {
    isIscreamStreamFile() {
      return this.video.fileOriginalPath.includes('rtmp.i-scream.co.kr')
    },
    isPlayableType() {
      return (
        this.video.fileContentType.includes('video/mp4') ||
        this.isIscreamStreamFile
      )
    },
    isEncoding() {
      if (this.isPlayableType) return false

      return !this.video.fileTranscodePath
    }
  },
  mounted() {
    if (this.isAutoPlay) {
      let options = {
        autoplay: this.isAutoPlay
      }
      this.loadVideo(options)
    }
  },
  created() {
    this.$log.debug("created => ", this.isEncoding, this.isError)

    if(this.isEncoding === true || this.isError === true) {
      this.$hiClass.alert('동영상 인코딩 중입니다.<br/>재생까지 수 분 이상이 소요될 수 있습니다.', 'warning').then(() => {
        eventBus.$emit('refresh-class-board-posts')
      })
      this.setImageView({
        isOpen: false,
        post: {},
        items: [],
        index: 0
      })
    }
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose()
    }
  },
  methods: {
    ...mapMutations({
      setImageView: 'setImageView',
    }),
    loadVideo(options) {
      this.isLoadVideo = true
      this.$log.debug("loadVideo", options)
      this.$nextTick(() => {
        const vueInstance = this
        if (options !== undefined && options.autoplay === false)
          this.options.autoplay = options.autoplay

          try {
            this.player = videojs(
            this.$refs.videoPlayer,
            {...this.options, sources: this.options.sources.map(o => {
              return {...o, src: o.src.replace('https://download.hiclass.net', 'https://streaming.hiclass.net')}
            })},
            function onPlayerReady() {
              vueInstance.$log.debug('onPlayerReady', this)

              // 동영상 우클릭 다운로드 막기
              vueInstance.$refs.videoPlayer.oncontextmenu = () => { return false; }
            }
          )
          } catch(err) {
            vueInstance.$log.debug("videojs", err)
          }
      })
      // lang ko
      const koJson = require('video.js/dist/lang/ko.json')
      videojs.addLanguage('ko', koJson)
    },
    isVideo() {
      // 과제 분기 처리 (차후 리팩토링 예정)
      let subParam = ''
      let readObj = null
      if (
        String(this.item._links.self.href).indexOf('postHomeworkUserSearches') >
        -1
      ) {
        subParam = 'postHomeworkUsers'
        readObj = `/postHomeworkUsers/${this.item.currentId}`
      } else {
        subParam = 'posts'
        readObj = this.item
      }

      this.$hiClass[subParam]
        .read(readObj)
        .then(res => {
          if (res) {
            this.video = res.data.files.find(item => {
              return item.fileOriginalPath === this.video.fileOriginalPath
            })
            this.isError = false

            try {
              if (this.isEncoding) {
                alert(
                  '동영상 인코딩 중입니다.\n완료된 후 확인하실 수 있습니다.'
                )
              } else {
                const playSrc = (this.video.fileTranscodePath || this.video.fileOriginalPath)
                  .replace('https://download.hiclass.net', 'https://streaming.hiclass.net')

                videojs(this.$refs.videoPlayer, {
                  src: playSrc
                })

                this.player = null
                this.loadVideo()
              }
            } catch (error) {
              this.isErrorHandler()
            }
          }
        })
        .catch(err => {
          this.$log.debug(this.$options.name, ' isVideo() error => ', err)
          this.isErrorHandler()
        })
    },
    isErrorHandler() {
      this.$log.debug("isErrorHandler")

      if(!this.file.fileOriginalPath === false && !this.file.fileThumbnailPath === true) {
          this.$hiClass.alert('동영상 인코딩 중입니다.<br/>재생까지 수 분 이상이 소요될 수 있습니다.', 'warning').then(() => {
          eventBus.$emit('refresh-class-board-posts')
        })
        this.setImageView({
          isOpen: false,
          post: {},
          items: [],
          index: 0
        })
        this.isError = true
      }

      // alert(
      //   '비디오를 로드할 수 없습니다.\n서버 혹은 네트워크 오류 때문이거나\n지원되지 않는 형식 때문일 수 있습니다.'
      // )
    }
  }
}
</script>

<style>
.video-view-wrap .cropimg {
  object-fit: cover;
  object-position: 50% 50%;
  width: 100%;
  font-family: 'object-fit: cover; object-position: 50% 50%;';
}
</style>
