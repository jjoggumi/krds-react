<template>
  <div>
    <input
      type="file"
      ref="fileUpload"
      @change="addFile"
      style="display:none"
    >

    <!-- before upload -->
    <div
      v-if="sheetMedias.length === 0 && !isUploadingData"
      class="worksheet-form-file-wrap"
      @dragover.prevent="onDragOver"
      @dragenter.prevent
      @dragleave.prevent="onDragLeave"
      @drop.prevent="addFile"
      :style="uploadFileWrapStyle"
    >
      <div
        class="file-drag-area-wrap"
        @click="addFile(null)"
      >
        <p class="file-drag-area">드래그 앤 드롭 또는 클릭하여 파일을 추가하세요.
          <br>( {{ compatibleExtensions.join(', ') }} 사용가능 ) 최대 200MB 등록 가능
        </p>
        <!-- <input type="file"> -->
      </div>
    </div>

    <template v-else-if="isUploadingData">
      <div class="worksheet-form-file-wrap">
        <div class="file-drag-area-wrap">
          <p class="file-drag-area">파일 업로드 중입니다. 잠시만 기다려 주세요.</p>
          <div class="loading-infinite-scroll-wrap">
            <div class="icon"></div>
          </div>
        </div>
      </div>
    </template>

    <!-- after upload -->
    <div
      v-else
      class="worksheet-form-file-wrap"
    >
      <div class="upload-file">
        <template v-if="sheetMediaUpFiles.length > 0">
          <span
            :key="`${sheetMediaUpFiles[0].filePath}-file-name`"
            class="file-name"
          >
            {{ sheetMediaUpFiles[0].realFileName }}
          </span>
        </template>
        <button
          v-if="!isDisabledUpload"
          class="btn-bg-w" @click="addFile(null)"
        >
          변경
        </button>

        <div class="checkbox-wrap">
          <template v-if="!isDisabledUpload">
            <input
              type="checkbox"
              id="ck-all"
              @change="selectAll"
              v-model="option.allSelected"
            >
            <label for="ck-all"><span>전체 선택</span></label>
          </template>
        </div>

        <div class="file-list">
          <div
            v-for="(sheetMediaImage, index) of sheetMediaImages"
            :key="`${sheetMediaImage.filePath}-item`"
            class="item"
          >
            <template v-if="isDisabledUpload">
              <input
                type="checkbox"
                :id="`checkWorksheet-${index}`"
                :disabled="isDisabledUpload"
                v-model="sheetMediaImage.useYn"
                true-value="Y"
                false-value="N"
              >
            </template>
            <template v-else>
              <input
                type="checkbox"
                :id="`checkWorksheet-${index}`"
                :disabled="isDisabledUpload"
                :value="sheetMediaImage.filePath"
                @change="select"
                v-model="option.selected"
              >
            </template>

            <label
              :class="{
                hidden: isDisabledUpload
              }"
              :for="`checkWorksheet-${index}`"
            ></label>
            <img :src="sheetMediaImage.filePath" alt="">
          </div>
        </div>
      </div>
    </div>

  </div>

</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "sheet-upload",
  components: {},
  props: {
    sheetMedias: {
      type: Array
    },
    isUploading: {
      type: Boolean
    },
    isDisabledUpload: {
      type: Boolean
    }
  },
  data() {
    return {
      option: {
        fileMb: 1024 * 1024,
        allSelected: false,
        selected: [],
      },
      progress: {
        current: 0,
        percent: 0,
        total: 0,
        files: {}
      },
      dragStyle: null
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    fileData: {
      get() {
        return this.sheetMedias
      },
      set(val) {
        this.$emit('update:sheetMedias', val)
      }
    },
    sheetMediaUpFiles() {
      return this.sheetMedias.filter(d => d.mediaCd === this.CONSTANTS.WORKSHEET_MEDIA.MEDIA_CD.UPFILE)
    },
    sheetMediaImages() {
      return this.sheetMedias.filter(d => d.mediaCd === this.CONSTANTS.WORKSHEET_MEDIA.MEDIA_CD.ISIMG)
    },
    isUploadingData: {
      get() {
        return this.isUploading
      },
      set(val) {
        this.$emit('update:isUploading', val)
      }
    },
    compatibleExtensions() {
      return ['jpg', 'jpeg', 'png', 'hwp', 'hwpx', 'doc', 'docx', 'ppt', 'pptx', 'pdf']
    },
    uploadFileWrapStyle() {
      if (this.dragStyle) {
        return {
          backgroundColor: this.dragStyle,
          opacity: 0.8
        }
      } else {
        return {
          backgroundColor: '#f9f9f9',
          opacity: 1
        }
      }
    }
  },

  watch: {
    /**
     * selected 배열 증감 감시
     * on change event
     */
    'option.selected'() {
      for (const sheetMediaImage of this.sheetMediaImages) {
        if (this.option.selected.includes(sheetMediaImage.filePath))
          sheetMediaImage.useYn = 'Y'
        else
          sheetMediaImage.useYn = 'N'
      }
    }
  },

  mounted() {
    if (this.sheetMediaImages.length > 0) {
      this.option.allSelected = true
      this.$nextTick(() => {
        this.selectAll()
      })
    }
  },

  methods: {
    ...mapActions({
      increaseFileUploadCount: 'increaseFileUploadCount'
    }),

    /**
     * 전체 선택 체크박스 클릭 / 언클릭
     * on change event
     */
    selectAll() {
      this.$log.debug(`selectAll() this.option.allSelected => `, this.option.allSelected)
      this.option.selected = []

      if (this.option.allSelected) {
        for (const sheetMediaImage of this.sheetMediaImages) {
          this.option.selected.push(sheetMediaImage.filePath)
        }
      }
    },
    /**
     * 개별 체크박스 클릭 / 언클릭
     * on change event
     */
    select() {
      this.option.allSelected = this.option.selected.length === this.sheetMediaImages.length
    },
    changeFile() {
      if (this.isUploadingData) {
        return
      }
      this.fileData = []
      this.$refs.fileUpload.value = ''
      this.option.allSelected = false
      this.option.selected.splice(0)
    },
    async addFile(e) {
      if (e === null) {
        this.changeFile()
        this.$refs.fileUpload.click()
      } else {
        if (this.isUploadingData) {
          return
        }
        const files = e.target.files || e.dataTransfer.files

        let isChk = true
        const postApi = []

        for (let i = 0; i < files.length; i++) {
          if (files[i].size > this.option.fileMb * 200) {
            this.$hiClass.alert('파일은 최대 200MB 까지 첨부 가능합니다.')
            isChk = false
            i = files.length
          } else {
            // 지원 파일확장자 체크
            const extension = this.$comn.split(files[i].name, '.')
            if (!this.isCompatibleExtensions(extension)) {
              isChk = false
              i = files.length
            }
          }

          if (isChk) {
            // 이미지일 경우 업로드 전 리사이즈 처리 추가
            const convertedFile = await this.$hiClass.getConvertedFile(files[i])

            this.progress.total++

            postApi.push(
                this.$hiClass.multipartSheet.upload(convertedFile, {
                  onUploadProgress: progressEvent => {
                    if (progressEvent.loaded === progressEvent.total) {
                      this.progress.current++
                    }

                    this.progress.files[`file${i}`] =
                        (progressEvent.loaded * 100) / progressEvent.total
                    let totalPercent = this.progress.files
                        ? Object.values(this.progress.files).reduce(
                            (sum, num) => sum + num,
                            0
                        )
                        : 0
                    this.progress.percent = parseInt(
                        Math.round(totalPercent / this.progress.total)
                    )
                  }
                })
            )

          }
        }

        if (isChk && !this.isUploadingData) {
          this.isUploadingData = true

          Promise.all(postApi)
              .then(res => {
                res.map(item => {
                  item = item.data

                  // let fileConvertPath = null
                  let fileThumbnailPaths = []

                  try {
                    // if (item._links.convert && item._links.convert.href)
                    //   fileConvertPath = item._links.convert.href

                    if (item._links.thumbnail && item._links.thumbnail.length > 0)
                      fileThumbnailPaths = item._links.thumbnail.map(t => t.href)
                    else if (item._links.thumbnail)
                      fileThumbnailPaths = [ item._links.thumbnail.href ]
                    else
                      fileThumbnailPaths = [ item._links.original.href ]

                  } catch (error) {
                    this.$log.debug(error)
                  }

                  const mediaFileName = item.filename.replace(/^.*[\\/]/, '')
                  const mediaTitle = this.$comn.split(mediaFileName, '.', 0)
                  const mediaFileExt = this.$comn.split(mediaFileName, '.')

                  const uploadFileInfo = {
                    mediaTitle : mediaTitle,
                    fileSize : item.size,
                    mediaCd : this.CONSTANTS.WORKSHEET_MEDIA.MEDIA_CD.UPFILE,
                    filePath : item._links.original.href,
                    sortNum : 0,
                    useYn : 'N',
                    saveFileName : mediaFileName,
                    realFileName : mediaFileName,
                    fileExt : mediaFileExt
                  }

                  // 원본 파일 정보 추가
                  this.fileData.push(uploadFileInfo)

                  let fileCount = 0

                  fileThumbnailPaths.forEach(fileThumbnailPath => {
                    const mediaFileName = item.filename.replace(/^.*[\\/]/, '')
                    const mediaTitle = this.$comn.split(mediaFileName, '.', 0)
                    const fileThumbnailExt = this.$comn.split(fileThumbnailPath, '.')

                    const fileInfo = {
                      mediaTitle : mediaTitle,  // TODO: 썸네일의 파일명 (확장자 제외)
                      fileSize : item.size,     // TODO: 썸네일의 파일 용량 필요
                      mediaCd : this.CONSTANTS.WORKSHEET_MEDIA.MEDIA_CD.ISIMG,
                      filePath : fileThumbnailPath,
                      sortNum : ++fileCount,
                      useYn : 'N',
                      saveFileName : `${mediaTitle}.${fileThumbnailExt}`,   // TODO: 썸네일의 파일명
                      realFileName : `${mediaTitle}.${fileThumbnailExt}`,   // TODO: 썸네일의 파일명
                      fileExt : fileThumbnailExt    // TODO: 썸네일의 파일 확장자
                    }

                    // 원본 또는 변환된 썸네일 파일 정보 추가
                    this.fileData.push(fileInfo)
                  })

                  // 완료 후 파일업로드 위치 GA 호출
                  this.increaseFileUploadCount({ uploadLocation: this.CONSTANTS.UPLOAD_LOCATION.CLASS })
                })
              })
              .catch(err => {
                this.$log.debug(this.$options.name, ' upload() error => ', err)
                alert('파일 업로드가 실패되었습니다. 다시 시도해 주세요.')
              })
              .finally(() => {
                this.$refs.fileUpload.value = ''
                this.isUploadingData = false
                this.progress = {
                  current: 0,
                  percent: 0,
                  total: 0,
                  files: {}
                }
              })
        } else {
          this.$refs.fileUpload.value = ''
        }
      }
    },
    // fileDelete(file) {
    //   if(!this.isUploadingData) {
    //     this.fileData = this.fileData.filter(item => {
    //       return item.fileOriginalPath !== file.fileOriginalPath
    //     })
    //   }
    // },
    isCompatibleExtensions(extension) {
      const extensionLowerCase = extension ? extension.toLowerCase() : extension
      if (this.compatibleExtensions.includes(extensionLowerCase)) {
        return true
      } else {
        this.$hiClass.alert('업로드를 지원하지 않는 파일형식입니다.')
        this.$refs.fileUpload.value = ''
        return false
      }
    },

    onDragOver() {
      this.dragStyle = 'ghostwhite'
    },
    onDragLeave() {
      this.dragStyle = '#f9f9f9'
    },

  }

}
</script>

<style lang="scss" scoped>
.file-list label.hidden {
  display: none !important;
}
</style>
