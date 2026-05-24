<template>
  <div
    class="upload-file-wrap"
    @dragover.prevent
    @dragenter.prevent
    @drop.prevent="addFile"
  >
    <input
      type="file"
      ref="fileUpload"
      multiple
      @change="addFile"
      style="display:none"
    />
    <div class="before-upload" v-if="files.length === 0 && !isUploadingData">
      <div class="file-drag-area-wrap">
        <div class="file-drag-area" @click="addFile(null)"></div>
      </div>
      <p>파일을 여기 끌어다 놓거나, (+) 버튼을 선택하세요</p>
    </div>
    <div class="after-upload" v-else>
      <div class="attaching-img-wrap">
        <ul>
          <template>
            <li
              v-for="file in $comn.isImage(files, 'both')"
              :key="file.currentId"
            >
              <template>
                <template v-if="file.fileContentType.indexOf('image') > -1">
                  <div class="attaching-img">
                    <div class="img-wrap">
                      <img
                        :src="file.fileOriginalPath"
                        :key="file.currentId"
                        alt
                      />
                    </div>
                    <button
                      class="delete-btn"
                      @click="fileDelete(file)"
                    ></button>
                  </div>
                </template>
                <template v-else>
                  <div class="attaching-img">
                    <div class="img-wrap">
                      <img
                        :src="file.fileThumbnailPath"
                        :key="file.currentId"
                        alt
                      />
                    </div>
                    <button class="play-btn"></button>
                    <button
                      class="delete-btn"
                      @click="fileDelete(file)"
                    ></button>
                  </div>
                </template>
              </template>
            </li>
            <li v-if="isUploadingData">
              <div class="attaching-img">
                <div class="img-wrap-loading">
                  <div class="icon"></div>
                </div>
                <div class="img-loading-txt">
                  <p>{{ progress.percent }}%</p>
                </div>
              </div>
            </li>
            <li v-if="!isUploadingData">
              <div class="file-drag-area-wrap">
                <div class="file-drag-area" @click="addFile(null)"></div>
              </div>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: 'hc-clazzes-upload',
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
    uploadType: {
      type: String
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
      }
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
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
    inCompatibleExtensions() {
      return this.$store.state.inCompatibleExtensions || []
    }
  },
  methods: {
    ...mapActions({
      increaseFileUploadCount: 'increaseFileUploadCount'
    }),
    async addFile(e) {
      if (e === null) {
        this.$refs.fileUpload.value = ''
        this.$refs.fileUpload.click()
      } else {
        if (this.isUploadingData) {
          return
        }
        const files = Array.from(e.target.files || e.dataTransfer.files)

        if (this.param !== undefined) {
          for (let i = 0; i < files.length; i++) {
            let bool = false
            // 파일확장자 체크
            if (
              this.param.compatibleExtensions !== undefined &&
              this.param.compatibleExtensions.includes(
                this.$comn.split(files[i].name, '.')
              )
            ) {
              bool = true
            }
            // 파일 컨텐츠타입 체크
            if (this.param.compatibleContentType !== undefined) {
              this.param.compatibleContentType.forEach(element => {
                if (files[i].type.indexOf(element) !== -1) {
                  bool = true
                }
              })
            }

            // 미지원 파일확장자 체크
            const extension = this.$comn.split(files[i].name, '.')
            if (this.isInCompatibleExtensions(extension)) return false
            // -- 미지원 파일확장자 체크

            if (!bool) {
              alert('지원하지 않는 파일형식입니다.')
              this.$refs.fileUpload.value = ''
              return false
            }
          }
        } else {          
          // 미지원 파일확장자 체크
          for (let i = 0; i < files.length; i++) {
            const extension = this.$comn.split(files[i].name, '.')
            if (this.isInCompatibleExtensions(extension)) return false
          }
          // -- 미지원 파일확장자 체크
        }
        const isNotAllowExtensions = this.$store.state.isNotAllowExtensions
        if(files.some(f => isNotAllowExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))) {
          this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
          return;
        }
        // 기 등록된 첨부파일 정보 체크
        let imageCount = 0
        let videoCount = 0
        this.fileData.map(item => {
          if (item.fileContentType.indexOf('video') !== -1) {
            videoCount++
          } else if (item.fileContentType.indexOf('image') !== -1) {
            imageCount++
          }
        })

        let isChk = true
        const postApi = []
        for (let i = 0; i < files.length; i++) {
          if (files[i].type.indexOf('video') !== -1) {
            if (videoCount > 0) {
              alert('영상 파일은 최대 1개 까지 첨부 가능합니다.')
              isChk = false
              i = files.length
            } else if (files[i].size > this.option.fileMb * this.$store.state.upload.class.video.size) {
              alert(
                `영상 파일은 최대 ${this.$store.state.upload.class.video.sizeStr} 까지 첨부 가능합니다.`
              )
              isChk = false
              i = files.length
            } else {
              videoCount++
            }
          } else if (files[i].type.indexOf('image') !== -1) {
            if (imageCount < 50) {
              imageCount++
            } else {
              alert('이미지 파일은 최대 50개 까지 첨부 가능합니다.')
              isChk = false
              i = files.length
            }
          } else if (files[i].size > this.option.fileMb * this.$store.state.upload.class.etc.size) {
            const fileUploadErrorMessage = this.$t(
              'file.upload.error.size.over.etc',
              {
                sizeStr: this.$store.state.upload.class.etc.sizeStr
              }
            )
            alert(fileUploadErrorMessage)
            isChk = false
            i = files.length
          }

          if (isChk) {
            // 이미지일 경우 업로드 전 리사이즈 처리 추가
            const convertedFile = await this.$hiClass.getConvertedFile(files[i])

            this.progress.total++
            postApi.push(
              this.$hiClass.multipart.upload(convertedFile, {
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

                let fileConvertPath = null
                let fileThumbnailPath = null

                try {
                  if (item._links.convert && item._links.convert.href)
                    fileConvertPath = item._links.convert.href
  
                  if (item._links.thumbnail && item._links.thumbnail.href)
                    fileThumbnailPath = item._links.thumbnail.href
                  
                } catch (error) {
                  this.$log.debug(error)
                }

                let fileInfo = {
                  fileName: item.filename.replace(/^.*[\\/]/, ''),
                  fileSize: item.size,
                  fileOriginalPath: item._links.original.href,
                  fileContentType: item.contentType
                }

                if (fileConvertPath !== null)
                  fileInfo.fileConvertPath = fileConvertPath

                if (item.contentType.indexOf('video') > -1) {
                  fileInfo.fileThumbnailPath = this.$store.state.videoThumbnailDefault
                }
  
                if (fileThumbnailPath !== null) {
                  fileInfo.fileThumbnailPath = fileThumbnailPath
                } else if (item.contentType.indexOf('video') > -1) {
                  fileInfo.fileThumbnailPath = this.$store.state.videoThumbnailDefault
                }

                this.fileData.push(fileInfo)

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
    fileDelete(file) {
      this.fileData = this.fileData.filter(item => {
        return item.fileOriginalPath !== file.fileOriginalPath
      })
    },
    isInCompatibleExtensions(extension) {      
      if (this.inCompatibleExtensions.includes(extension)) {
        alert(`미지원하는 파일의 형식 : ${extension}`)
        this.$refs.fileUpload.value = ''
        return true
      } else {
        return false
      }
    }
  }
}
</script>
