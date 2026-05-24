<!--
@File(Method): ImageViewer.vue
@Author: -
@Date Created: -
@Description: 이미지 뷰어
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
-->
<template>
  <div
    class="modal slick-modal view-album-modal has-top-btn-wrap"
    style="display: block;"
  >
    <div class="modal-cont-wrap">
      <div class="modal-cont">
        <div
          class="modal-cont-inner"
          @click="handleModalInnerClick($event)"
        >
          <div class="modal-top-btn-wrap">
            <div v-if="items.length !== 1" class="page-conut-wrap">
              {{ curPage }} / {{ items.length }}
            </div>
            <div class="right-wrap">
              <button
                v-if="isAvailableDownload && isDownload"
                class="download-btn"
                @click="onClickDownload"
                :disabled="downloading === true"
              >
                <span>{{ downloadButtonName }}</span>
                <div 
                  v-if="isShowSelectDownload"
                  class="download-select"
                >
                  <span role="button" @click="downloadAll">묶음사진 전체 저장하기</span>
                  <span role="button" @click="download">이 사진만 저장하기</span>
                </div>
              </button>

              <button
                v-if="isShowPrintButton && isDownload"
                class="print-btn"
                @click="onClickPrint"
              >
                <span>인쇄</span>
              </button>
              <div class="modal-close-btn modal-close-icon" @click="close($event)"></div>
            </div>
          </div>
          <div class="slide-wrap">
            <button
              v-if="items.length !== 1"
              class="slick-next slick-arrow"
              :class="{ 'slick-disabled': isLastSlide }"
              ref="next"
              @click.stop
              @click="next()"
              aria-label="Next"
              type="button"
              style
            >
              Next
            </button>
            <button
              v-if="items.length !== 1"
              ref="prev"
              @click.stop
              @click="prev()"
              class="slick-prev slick-arrow"
              :class="{ 'slick-disabled': isFirstSlide }"
              aria-label="Previous"
              type="button"
              style
            >
              Previous
            </button>
            <Slick
              ref="slick"
              :options="setSlickOption()"
              @afterChange="handleAfterChange"
              @init="handleInit"
            >
              <template v-for="(file, i) in items">
                <template v-if="file.fileContentType.includes('image')">
                  <div
                    :key="file.fileOriginalPath"
                    :fileSrc="file.fileOriginalPath"
                    :fileName="file.fileName"
                    class="slide"
                    ref="img"
                  >
                    <div>
                      <img
                        v-if="curPage === i + 1"
                        :key="curPage"
                        :ref="'img' + curPage"
                        :id="'img' + curPage"
                        :src="file.fileOriginalPath"
                        alt
                        @click.stop
                        :style="setImgMaxHeight"
                      />
                      <p v-else>loading ... </p>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <hc-video
                    :key="
                      `${file.fileOriginalPath}-${i}-${file.fileTranscodePath}`
                    "
                    :item="items[i]"
                    :file="file"
                    :options="$hiClass.setVideoOptions(file, 'classImgCrop3')"
                    :isAutoPlay="isAutoPlay"
                  />
                </template>
              </template>
            </Slick>
          </div>
        </div>
      </div>
    </div>

    <GlobalEvents
      @keyup.esc="close"
      @keyup.left="prevSlide"
      @keyup.right="nextSlide"
    />
  </div>
</template>

<script>
import Slick from 'vue-slick'
import downloadjs from "downloadjs";
import {mapMutations, mapState, mapActions} from "vuex";

import hcVideo from '@/components/Form/HcVideo.vue'

// zip file archive download
import jszip from 'jszip'
import { saveAs } from 'file-saver'
import axios from 'axios'

export default {
  name: 'image-viewer',
  props: {},
  components: { Slick, hcVideo },
  data() {
    return {
      slickOptions: {},
      curPage: 1,
      isLastSlide: false,
      isFirstSlide: false,
      isDownload: true,
      isShowSelectDownload: false,
      downloadProgress: 0,
      downloading: false
    }
  },
  computed: {
    ...mapState({
      clazzSubscribeViews: 'clazzSubscribeViews',
      imageView: 'imageView',
      downloadStatus: 'downloadStatus'
    }),
    isShowPrintButton() {
      return !!(this.$print) && this.curItemContentType !== 'VIDEO'
    },
    isAvailableDownload() {
      let flag = false
      switch (this.curItemContentType) {
        case 'IMAGE': {
          flag = true
          break
        }
        case 'VIDEO': {
          flag = this.isAvailableVideoDownload
          break
        }
        default:
          flag = true
      }

      return flag
    },
    isAvailableVideoDownload() {
      let flag = false

      // 클래스 게시글 동영상 다운로드 정책 반영
      switch (this.postType) {
        case 'NOTE':
        case 'ALBUM':
        case 'BOARD':
        case 'HOMEWORK':
        case 'ABSENT':
        case 'FIELD_STUDY': {
          flag = true
          break
        }
      }

      return flag
    },
    isAutoPlay() {
      return this.items.length === 1
    },
    isManager() {
      return this.memberRole === 'OWNER' || this.memberRole === 'MANAGER'
    },

    post() {
      return this.imageView.post || {}
    },
    writeUserId() {
      return this.imageView.userId || null
    }, 
    postType2() {
      return this.imageView.postType || null
    }, 
    items() {
      return this.$comn.isImage(this.imageView.items, 'both')
    },
    imgIndex() {
      return this.imageView.index || 0
    },
    /**
     * store 에 저장된 클래스 구독정보를 기준으로 클래스 관리자 여부 확인
     * @returns {*|string}
     */
    memberRole() {
      const classId = this.post.parent
          ? this.post.parent.classId || this.post.parent.currentId || ''
          : ''
      const foundSubscribe = this.clazzSubscribeViews.find(d => d.classId === classId)

      return foundSubscribe ? foundSubscribe.memberRole : ''
    },
    postType() {
      return this.post.postType || null
    },

    setImgMaxHeight() {
      return `max-height: 900px`
    },
    curItem() {
      return this.items[this.curPage - 1]
    },
    curItemContentType() {
      let contentType = 'ETC'
      if (this.curItem && this.curItem.fileContentType) {
        const fileContentType = this.curItem.fileContentType
        if (fileContentType.indexOf('video') === 0) contentType = 'VIDEO'
        else if (fileContentType.indexOf('video') === 0) contentType = 'IMAGE'
      }

      return contentType
    },
    isAvailableSelectDownload() {
      return this.items.length > 1 ? this.items.findIndex(v => v.fileContentType.indexOf('video') > -1) > -1 ? false : true : false
    },
    downloadButtonName() {
      return this.downloading === true ? `다운중(${this.downloadProgress}%)` : "다운로드"
    }
  },
  created() {
    const {name, params} = this.$route
    let code = 'analytics.hiclass.viewer'
    if(name) {
      if(name.indexOf('schools') > -1) {
        if(['schools-notice', 'schools-meal', 'schools-alarm'].includes(name)) {
          code += `.${name}`
        } else {
          code += '.schools'
        }
      } else if(['mainHome', 'clazzes', 'myboard-news'].includes(name)) {
        code += `.${name}`
        if(name === 'clazzes' && params.board) {
          code += `.${params.board}`
        }
      }
    }
    this.triggerAnalyticsLogEvent({code})

    this.curPage = this.imgIndex !== undefined ? this.imgIndex + 1 : 1
    this.isFirstSlide = this.imgIndex === 0
    this.isLastSlide = this.imgIndex + 1 === this.items.length

    if(this.postType2 === "EVENT" && this.writeUserId !== this.$store.state.user.currentId) {
      this.isDownload = false
    }
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  beforeDestroy() {},
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
    this.$emit('closeAttach')
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapMutations({
      setImageView: 'setImageView',
    }),
    next() {
      this.$refs.slick.next()
    },
    prev() {
      this.$refs.slick.prev()
    },
    // Events listeners
    handleAfterChange(event, slick, currentSlide) {
      this.isFirstSlide = currentSlide <= 0
      this.isLastSlide = currentSlide === slick.slideCount - 1
      this.curPage = currentSlide + 1
    },
    handleInit(event, slick) {
      if (slick.slideCount === 1) this.isLastSlide = true
      slick.currentSlide = this.imgIndex
    },
    onClickDownload(e) {
      this.isAvailableSelectDownload ? this.isShowSelectDownload = true : this.download(e)
    },
    async download(e) {
      e.stopPropagation()
      let curPage = this.curPage - 1
      let curItem = this.items[curPage]

      let fileDownload = curItem.fileTranscodePath || curItem.fileOriginalPath
      let fileName = curItem.fileName
      this.downloading = true
      // this.$comn.download(fileDownload, fileName)

      axios({
        method: 'get',
        url: fileDownload,
        responseType: "blob",
        headers: "",
        onDownloadProgress: (progressEvent) => {
          let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          this.downloadProgress = percentCompleted
        }
      })
      .then((res) => {
        const blob = new Blob([res.data], { type: 'application/octet-stream' });
        downloadjs(blob, fileName, "text/plain");
      })
      .catch(() => {
        alert('파일 다운로드를 실패했습니다.\r잠시 후 다시 시도해주세요.')
      })
      .finally(() => {
        this.downloading = false
      })

      this.closeShowSelectDownload()
    },
    async downloadAll(e) {
      e.stopPropagation()
      this.closeShowSelectDownload()
      const files = this.items

      try {
        this.$store.commit('setIsDimLoading', true)
        // this.closeDownloadPopup()

        let zip = new jszip()
        let fileCount = 0
        let archiveFileName = '묶음사진_전체저장_'
          + this.$moment().format('YYYY-MM-DD_HHmmss')
          + '.zip'

        const result = new Promise(async (resolve, reject) => {
          // zip 파일 압축
          for (const file of files) {

            await axios({
              method: 'get',
              url: !file.fileTranscodePath === false ? file.fileTranscodePath.split("?")[0] : file.fileOriginalPath.split("?")[0],
              responseType: 'blob',
              headers: '',
            })
              .then(async res => {
                let blob = new Blob([res.data], {
                  type: 'application/octet-stream'
                })
                // 파일 이름
                await zip.file(`${fileCount + 1}_${file.fileName}`, blob)
                fileCount++

                if (files.length === fileCount) {
                  await zip
                    .generateAsync({ type: 'blob' })
                    .then(function(blob) {
                      // 모음 zip 파일 이름
                      saveAs(blob, archiveFileName)
                    })
                    .catch(() => reject(false))
                    .finally(() => {})
                }
              })
              .catch(() => reject(false))
              .finally(() => {})
          }

          resolve(true)
        })

        result
          .then(() => {
            this.$hiClass.alert('묶음사진 전체저장이 완료되었습니다.', 'success')
          })
          .catch(() => {
            this.$hiClass.alert('묶음사진 전체저장이 실패하였습니다.', 'error')
          })
          .finally(() => {
            this.$store.commit('setIsDimLoading', false)
          })

      } catch (err) {
        this.$log.debug(`fileDownload() err => `, err)
        this.$store.commit('setIsDimLoading', false)
      }
    },
    setSlickOption() {
      return (this.slickOptions = {
        arrows: false,
        prevArrow: this.$refs.prev,
        nextArrow: this.$refs.next,
        speed: 10,
        cssEase: 'linear',
        fade: true,
        infinite: false,
        draggable: false,
        slidesToShow: 1
      })
    },
    close(e) {
      e.stopPropagation()
      this.setImageView({
        isOpen: false,
        post: {},
        items: [],
        index: 0
      })
    },
    closeShowSelectDownload() {
      this.isShowSelectDownload = false
    },
    handleModalInnerClick(e) {
      const closeSelector = '.modal-cont-inner, .modal-cont-inner .slide-wrap div:not(.vjs-control)'

      try {
        if (e.target.matches(closeSelector)) {
          this.$log.debug(`e.target.matches(closeSelector): e.target => `, e.target)
          this.close(e)
        }
      } catch (err) {
        this.$log.warn(`e.target.matches(closeSelector): err => `, err)
      }
    },
    nextSlide() {
      if (this.$refs.next)
        this.$refs.next.click()
    },
    prevSlide() {
      if (this.$refs.prev)
        this.$refs.prev.click()
    },
    onClickPrint() {
      const printPageIndex = this.curPage - 1
      if (this.$refs.img && this.$refs.img[printPageIndex]) {
        const printObj = this.$refs.img[printPageIndex]
        this.$print(printObj)
      } else {
        this.$hiClass.alert('인쇄 중 오류가 발생했습니다.', 'error')
      }
    },
  }
}
</script>

<style lang="scss" scoped>
@media print {
  .no-print,
  .no-print * {
    display: none !important;
  }
}
</style>
