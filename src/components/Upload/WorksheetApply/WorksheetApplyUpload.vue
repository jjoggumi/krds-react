<template>
  <fragment>
    <button
      v-if="!isReadonly"
      class="btn-bg-w2 btn-attachment"
      :class="{ dis: isUploading }"
      :disabled="isUploading || isReadonly"
      @click="upload(null)"
    >
      {{ title }}
    </button>
    <input
      type="file"
      ref="attach"
      @change="upload"
      multiple
      :disabled="isReadonly"
      style="display:none"
    />
  </fragment>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "worksheet-apply-upload",
  props: {
    files: {
      type: Array
    },
    isUpload: {
      type: Boolean
    },
    isReadonly: {
      type: Boolean,
      default() {
        return false
      }
    },
    title: {
      type: String,
      default() {
        return '첨부파일'
      }
    }
  },
  data() {
    return {
      option: {
        fileMb: 1024 * 1024,
      },
      message: {
       inCompatible: `이미지와 문서만 첨부하실 수 있습니다.`
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
    },
    inCompatibleType() {
      return ['video']
    },
  },
  mounted() {
  },
  methods: {
    ...mapActions({
      increaseFileUploadCount: 'increaseFileUploadCount'
    }),
    async upload(e) {
      if (e === null) {
        this.$refs.attach.value = ''
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
          // eslint-disable-next-line no-unused-vars
          let imageCount = 0
          // eslint-disable-next-line no-unused-vars
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

            // 미지원 파일확장자 체크
            const extension = this.$comn.split(files[i].name, '.')
            if (this.isInCompatibleExtensions(extension)) return false
            // 미지원 파일확장자 체크

            // 미지원 파일타입 체크
            const contentType = files[i].type
            if (this.isInCompatibleType(contentType)) return false
            // -- 미지원 파일타입 체크

            if (!isChk) {
              // this.$hiClass.alert('지원하지 않는 파일형식입니다.')
              this.$hiClass.alert(this.message.inCompatible)
              this.$refs.attach.value = ''
              return false
            }

            if (isChk) {
              postApi.push(this.$hiClass.multipart.upload(files[i]))
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
        // this.$hiClass.alert(`미지원하는 파일의 형식 : ${extension}`)
        this.$hiClass.alert(this.message.inCompatible)
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
    },

    isInCompatibleType(contentType) {
      const type = this.$comn.split(contentType,"/", 0)
      if (this.inCompatibleType.includes(type)) {
        this.$hiClass.alert(this.message.inCompatible)
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
    },

    /*
    $('.btn-attachment').on('click', function() {
      $(this).next('input').trigger('click');
      $('.top-attachment-wrap').show();
      $('.worksheet-container').addClass('add-top-attachment'); // 첨부파일 영역 추가됐을 때 .add-top-attachment 추가
    });
    */
  }
}
</script>

<style scoped>

</style>