<template>
  <div
    class="modal talk-view-attached-file-modal has-top-btn-wrap"
    :class="{ 'slick-modal': isArrayFileContent }"
    style="display: block"
  >
    <div class="modal-cont-wrap">
      <div class="modal-cont">
        <div class="modal-cont-inner">
          <div class="modal-top-btn-wrap">
            <div class="right-wrap">
              <button
                class="download-btn"
                @click="onClickDownload"
              >
                <span>다운로드</span>
              </button>
              <div
                v-if="isShowDownload"
                class="download-select"
                v-click-outside="closeDownloadPopup"
              >
                <span role="button" @click="downloadAll">묶음사진 전체 저장하기</span>
                <span role="button" @click="download">이 사진만 저장하기</span>
              </div>
              <div
                class="modal-close-btn modal-close-icon"
                @click="hideImageViewLayout"
              ></div>
            </div>
          </div>

          <template v-if="isArrayFileContent">
            <div class="slide-wrap">
              <div class="slider-for">
                <div
                  v-for="file of fileContent"
                  class="slide"
                  :key="`${file.fileOriginalPath}-for`"
                >
                  <img :src="file.fileOriginalPath" alt="">
                </div>
              </div>

              <div class="slide-count">
                <span class="current">{{ curPage }}</span>/<span class="total">{{ totalPage }}</span>
              </div>
            </div>

            <div class="slide-nav-wrap">
              <div class="slider-nav">
                <div
                  v-for="file of fileContent"
                  class="slide"
                  :key="`${file.fileOriginalPath}-nav`"
                >
                  <img :src="file.fileOriginalPath" alt="">
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="slide-wrap">
              <div class="slider-for">
                <div class="slide">
                  <img :src="fileContent.fileOriginalPath" alt="">
                </div>
              </div>
            </div>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import Slick from 'vue-slick'

// zip file archive download
import jszip from 'jszip'
import { saveAs } from 'file-saver'
import axios from 'axios'

import {mapMutations, mapState, mapActions} from "vuex"

export default {
  name: "image-view-layout",
  data() {
    return {
      isShowDownload: false,
      curPage: 0,
      totalPage: 0,
    }
  },
  computed: {
    ...mapState('storeHitalk', [
      'isShowImageViewLayout',
      'fileContent',
      'currentFileContentIndex',
    ]),
    isArrayFileContent() {
      return Array.isArray(this.fileContent)
    },
    fileContentTotalLength() {
      return this.isArrayFileContent ? this.fileContent.length : 1
    },
  },
  mounted() {
    this.triggerAnalyticsLogEvent({code: 'analytics.hitalk.viewer'})
    this.$nextTick(() => {
      if (this.isArrayFileContent)
        this.initSlick()
    })
  },
  methods: {
    ...mapMutations('storeHitalk', [
      'showImageViewLayout',
      'hideImageViewLayout',
    ]),
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    closeDownloadPopup() {
      this.isShowDownload = false
    },
    onClickDownload() {
      this.isArrayFileContent
        ? this.isShowDownload = true
        : this.download()
    },
    download() {
      const file = this.isArrayFileContent ? this.fileContent[this.curPage - 1] : this.fileContent
      // let fileDownload = file.fileConvertPath || file.fileOriginalPath
      let fileDownload = file.fileOriginalPath || file.fileConvertPath
      let fileName = file.fileName
      this.$comn.download(fileDownload, fileName)
    },
    async downloadAll() {
      const files = this.fileContent

      try {
        this.$store.commit('setIsDimLoading', true)
        this.closeDownloadPopup()

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
              url: file.fileTranscodePath || file.fileOriginalPath,
              responseType: 'blob',
              headers: ''
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
    initSlick() {
      const $sliderFor = $('.slick-modal .slider-for')
      const $sliderNav = $('.slick-modal .slider-nav')
      const sliderForOption = {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: false,
        speed: 300,
        fade: true,
        asNavFor: '.slider-nav',
        dots: false,
        draggable: false,
        autoplay: false,
      }
      const sliderNavOption = {
        slidesToShow: 9,
        slidesToScroll: 9,
        asNavFor: '.slider-for',
        centerMode: false,
        focusOnSelect: true,
        dots: false,
        arrows: false,
        infinite: false
      }

      if (this.fileContentTotalLength >= 9) {
        sliderNavOption.centerMode = true
        sliderNavOption.speed = 300
        sliderNavOption.draggable = true
      }

      if(this.fileContentTotalLength === 9 && this.currentFileContentIndex > -1) {
        sliderNavOption.slidesToShow = 8
      }

      if (this.currentFileContentIndex > -1) {
        sliderForOption.initialSlide = this.currentFileContentIndex
        sliderNavOption.initialSlide = this.currentFileContentIndex
      }

      $sliderFor.on('init reInit', (event, slick) => {
        this.curPage = (this.currentFileContentIndex || 0) + 1
        this.totalPage = slick.slideCount

      })
      $sliderFor.on('afterChange', (event, slick, currentSlide) => {
        //currentSlide is undefined on init -- set it to 0 in this case (currentSlide is 0 based)
        this.curPage = (currentSlide || 0) + 1
        this.totalPage = slick.slideCount
      })
      $sliderNav.on('setPosition', (event, slick) => {
        this.$log.debug('$sliderNav setPosition: event, slick', event, slick)
        if (this.currentFileContentIndex > -1 && this.fileContentTotalLength < 9) {
          $('.slider-nav .slick-list .slick-track').css('transform', 'translate3d(0, 0, 0)')
        }
      })

      $sliderFor.slick(sliderForOption)
      $sliderNav.slick(sliderNavOption)
    }
  }
}
</script>

<style scoped>

</style>