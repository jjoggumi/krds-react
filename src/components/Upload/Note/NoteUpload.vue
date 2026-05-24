<template>
  <div>
    <input
      type="file"
      ref="attach"
      @change="upload"
      multiple
      style="display:none"
    />
    <button
      class="attach-file-btn btn-bg-w icon"
      :class="{ dis: isUploading }"
      :disabled="isUploading"
      @click="upload(null, 'attachFile')"
    >
      <span>첨부파일</span>
    </button>
    <button
      class="weekly-schedule-btn btn-bg-w icon"
      :class="{ dis: isUploading }"
      :disabled="isUploading"
      @click="upload(null, 'weeklyScheduleFile')"
    >
      <span>주간학습계획</span>
    </button>
  </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: 'hiClass_Note_Upload',
  props: {
    files: {
      type: Array
    },
    isUpload: {
      type: Boolean
    }
  },
  data() {
    return {}
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
    isUploading: {
      get() {
        return this.isUpload
      },
      set(val) {
        this.$emit('update:isUpload', val)
      }
    },
    inCompatibleExtensions() {
      return this.$store.state.inCompatibleExtensions || []
    }
  },
  mounted() {},
  methods: {
    ...mapActions({
      increaseFileUploadCount: 'increaseFileUploadCount',
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    async upload(e, btnType) {
      if (btnType)
        this.triggerAnalyticsLogEvent({ code: `analytics.class.click.button.note.blackboard.${btnType}` })

      if (e === null) {
        this.$refs.attach.click()
      } else {
        this.isUploading = true
        this.fileData.push({
          fileOriginalPath: this.$moment().valueOf(),
          isLoadingBar: true
        })
        this.$emit('is-resize')

        this.$nextTick(async () => {
          const files = Array.from(e.target.files || e.dataTransfer.files)

          const isNotAllowExtensions = this.$store.state.isNotAllowExtensions
          if(files.some(f => isNotAllowExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))) {
            this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
            return;
          }

          // 기 등록된 첨부파일 정보 체크
          let imageCount = 0
          let videoCount = 0
          this.fileData.map(item => {
            if (!item.isLoadingBar) {
              if (item.fileContentType.indexOf('video') !== -1) {
                videoCount++
              } else if (item.fileContentType.indexOf('image') !== -1) {
                imageCount++
              }
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
              } else if (files[i].size > 1024 * 1024 * this.$store.state.upload.class.video.size) {
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
            } else {
              if (files[i].size > 1024 * 1024 * this.$store.state.upload.class.etc.size) {
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
            }

            // 미지원 파일확장자 체크
            const extension = this.$comn.split(files[i].name, '.')
            if (this.isInCompatibleExtensions(extension)) return false
            // 미지원 파일확장자 체크

            if (isChk) {
              // 이미지일 경우 업로드 전 리사이즈 처리 추가
              const convertedFile = await this.$hiClass.getConvertedFile(files[i])

              postApi.push(this.$hiClass.multipart.upload(convertedFile))
            }
          }

          if (isChk) {
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
                    fileContentType: item.contentType,
                    isLoadingBar: false
                  }

                  if (fileConvertPath !== null)
                    fileInfo.fileConvertPath = fileConvertPath
  
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
              })
              .finally(() => {
                this.$refs.attach.value = ''
                this.fileData = this.fileData.filter(item => {
                  return (item.isLoadingBar || false) === false
                })
                this.isUploading = false
                this.$emit('is-resize')
              })
          } else {
            this.$refs.attach.value = ''
            this.fileData = this.fileData.filter(item => {
              return (item.isLoadingBar || false) === false
            })
            this.isUploading = false
            this.$emit('is-resize')
          }
        })
      }
    },
    isInCompatibleExtensions(extension) {      
      if (this.inCompatibleExtensions.includes(extension)) {          
        alert(`미지원하는 파일의 형식 : ${extension}`)
        this.$refs.attach.value = ''
        this.fileData = this.fileData.filter(item => {
          return (item.isLoadingBar || false) === false
        })
        this.isUploading = false
        this.$emit('is-resize')
        return true
      } else {
        return false
      }
    }
  }
}
</script>
