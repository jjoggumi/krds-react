<template>
  <div
      class="upload-file-wrap"
      @dragover.prevent="onDragOver"
      @dragenter.prevent
      @drop.prevent="addFile"
  >
    <input
        type="file"
        ref="fileUpload"
        accept="video/*"
        @change="addFile"
        style="display:none"
    />

    <div
        v-if="videoFiles.length === 0 && !isUploadingData"
        class="before-upload"
        style="display: block;"
    >
      <div class="file-drag-area-wrap">
        <div class="file-drag-area" @click="addFile(null)"></div>
      </div>
      <p><span class="type">영상 파일</span>영상을 여기 끌어다 놓거나, [+] 버튼을 선택하세요</p>
    </div>

    <div
        v-else
        class="after-upload"
    >
      <div class="attaching-file-list-wrap" style="display: block;">
        <div class="attaching-file-list">
          <template v-for="file of videoFiles">
            <div
                :key="file.currentId"
                class="attaching-file"
            >
              <span>{{ file.fileName }}</span>
              <button
                  class="delete-btn"
                  @click="fileDelete(file)"
              ></button>
            </div>
          </template>

          <template v-if="isUploadingData">
            <div class="loading-infinite-scroll-wrap">
              <div class="icon"></div>
            </div>
          </template>
          <template v-else>
            <div class="file-drag-area-wrap">
              <div
                  class="file-drag-area"
                  @click="addFile(null)"
              ></div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex';

export default {
  name: 'upload-video',
  props: {
    files: {
      type: Array
    },
    param: {
      type: Object
    },
    isUploading: {
      type: Boolean
    },
    loadingObj: {
      type: Object
    },
    unusedFiles: {
      type: Array
    }
  },
  data() {
    return {
      option: {
        fileMb: 1024 * 1024
      },
      progress: {
        current: 0,
        percent: 0,
        total: 0,
        files: {}
      },
      dragStyle: null,
      thumbnailImage: ''
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    fileData: {
      get() {
        return this.files
      },
      set(val) {
        this.$emit('update:files', val)
      }
    },
    isUploadingData: {
      get() {
        return this.isUploading
      },
      set(val) {
        this.$emit('update:isUploading', val)
      }
    },
    isTotalLoadingData: {
      get() {
        const isNotLoading = (value) => value === false
        return !Object.values(this.loadingObj).every(isNotLoading)
      }
    },
    videoFiles() {
      return this.files.filter(f => {
        return f.fileContentType && (f.fileContentType.startsWith('video'))
      }) || []
    },
    imagePackFiles() {
      return this.files.filter(f => { return f.fileContentType.startsWith('image') && f.fileFlag === 'IMAGE_PACK' }) || []
    },
    docFiles() {
      return this.files.filter(f => {
        return f.fileContentType && (!f.fileContentType.startsWith('image') && !f.fileContentType.startsWith('video'))
      }) || []
    },
    uploadFileWrapStyle() {
      if (this.dragStyle) {
        return {
          backgroundColor: this.dragStyle
        }
      } else {
        return null
      }
    }
  },
  methods: {
    ...mapActions({
      increaseFileUploadCount: 'increaseFileUploadCount'
    }),
    async addFile(e) {
      this.onDragLeave()

      const validate = new Promise((resolve, reject) => {
        // 기 등록된 첨부파일 정보 체크
        const imageCount = this.imagePackFiles.length
        const docCount = this.docFiles.length
        const videoCount = this.videoFiles.length
        let errorMessage = null

        if (imageCount > 0 || docCount > 0) {
          errorMessage = '첨부파일은 1개만 추가 가능합니다.'
        } else if (videoCount >= 1) {
          errorMessage = '최대 1개까지 첨부 가능합니다.'
        } else if (this.isTotalLoadingData) {
          errorMessage = '파일 업로드 중입니다. 잠시만 기다려 주세요.'
        }

        if (errorMessage) {
          this.$hiClass.alert(errorMessage)
          reject(false)
        } else {
          resolve(true)
        }
      })

      await validate
          .then(async () => await this.addFileProc(e))
          .catch(() => false)
    },
    async addFileProc(e) {
      let videoCount = this.videoFiles.length
      
      if (e === null) {
        this.$refs.fileUpload.click()

      } else {
        const files = e.target.files || e.dataTransfer.files
        
        let isChk = true
        const postApi = []

        for (let i = 0; i < files.length; i++) {
          if (!files[i].type.startsWith('video')) {
            this.$hiClass.alert('업로드를 지원하지 않는 파일형식입니다.')
            isChk = false

          } else if (files[i].size > this.option.fileMb * this.$store.state.upload.chat.video.size) {
            const fileUploadErrorMessage = this.$t(
                'file.upload.error.size.over.video',
                {
                  sizeStr: this.$store.state.upload.class.video.sizeStr
                }
            )
            this.$hiClass.alert(fileUploadErrorMessage)
            isChk = false
            i = files.length

          } else if (videoCount < 1) {
            videoCount++

          } else if (videoCount >= 1) {
            this.$hiClass.alert('최대 1개까지 첨부 가능합니다.')
            isChk = false
            i = files.length
          }

          if (isChk) {
            this.progress.total++
  
            postApi.push(
                this.$hiClass.uploadVideoFile(files[i], {
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
                  this.fileData.push(item)

                  // 완료 후 파일업로드 위치 GA 호출
                  this.increaseFileUploadCount({ uploadLocation: this.CONSTANTS.UPLOAD_LOCATION.HITALK })
                })
              })
              .catch(err => {
                this.$log.debug(this.$options.name, ' upload() error => ', err)
                this.$hiClass.alert('파일 업로드가 실패되었습니다. 다시 시도해 주세요.')
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
    fileDelete(file) {
      if(!this.isUploadingData) {
        this.fileData = this.fileData.filter(item => {
          return item.fileOriginalPath !== file.fileOriginalPath
        })
        this.unusedFiles.push(file)
      }
    },
    onDragOver() {
      this.dragStyle = 'whitesmoke'
    },
    onDragLeave() {
      this.dragStyle = '#FFFFFF'
    }
  }
}
</script>

<style scoped>

</style>
