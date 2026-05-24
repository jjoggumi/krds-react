<template>
  <button
    :class="{
      dis: $store.state.isFileLoading,
      'btn-homework-send': !isSendComplete,
      'edit-btn': isSendComplete
    }"
    :disabled="$store.state.isFileLoading"
    @click="upload(null)"
  >
    <slot></slot>

    <input
      type="file"
      ref="attach"
      @change="upload"
      :multiple="false"
      style="display: none;"
    />
  </button>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: 'homework-upload',
  props: {
    files: {
      type: Array
    },
    isSendComplete: {
      type: Boolean
    }
  },
  components: {},
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
    inCompatibleExtensions() {
      return this.$store.state.inCompatibleExtensions || []
    }
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
        this.$store.commit('setIsFileLoading', true)

        this.fileData.push({
          fileOriginalPath: this.$moment().valueOf(),
          isLoadingBar: true
        })

        const files = Array.from(e.target.files || e.dataTransfer.files)

        const isNotAllowExtensions = this.$store.state.isNotAllowExtensions
        if(files.some(f => isNotAllowExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))) {
          this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
          return;
        }

        let compatibleExtensions = [
          'doc',
          'docx',
          'hwp',
          'hwpx',
          'txt',
          'pdf',
          'ppt',
          'pptx',
          'xls',
          'xlsx',
          'zip'
        ]
        let mediaTypeCount = 0
        let compatibleExtensionCount = 0

        let isChk = true
        const postApi = []

        for (let i = 0; i < files.length; i++) {
          if (files[i].type.includes('video')) {
            if (files[i].size > 1024 * 1024 * this.$store.state.upload.class.video.size) {
              alert(
                `영상 파일은 최대 ${this.$store.state.upload.class.video.sizeStr} 까지 첨부 가능합니다.`
              )
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

          try {
            /**
             * 단일 파일 업로드 확장자 체크
             */
            // alert(`files[i].filename => ` + files[i].filename)
            // alert(`files[i].name => ` + files[i].name)

            if (
              compatibleExtensions.includes(
                this.$comn.split(files[i].name, '.')
              )
            ) {
              compatibleExtensionCount++
            }

            if (
              files[i].type.includes('image') ||
              files[i].type.includes('video')
            )
              mediaTypeCount++

            if (mediaTypeCount === 0 && compatibleExtensionCount === 0) {
              alert('지원하지 않은 파일 형식입니다.')
              this.$refs.attach.value = ''
              this.fileData = this.fileData.filter(item => {
                return (item.isLoadingBar || false) === false
              })
              this.$store.commit('setIsFileLoading', false)
              return false
            }

            // 미지원 파일확장자 체크
            const extension = this.$comn.split(files[i].name, '.')
            if (this.isInCompatibleExtensions(extension)) return false
            // 미지원 파일확장자 체크

            if (isChk) {
              // IE 브라우저 파일경로 포함 제거
              if (files[i].name.includes('\\'))
                files[i].name = this.$comn.split(files[i].name, '\\')

              // 이미지일 경우 업로드 전 리사이즈 처리 추가
              const convertedFile = await this.$hiClass.getConvertedFile(files[i])

              postApi.push(this.$hiClass.multipart.upload(convertedFile))
            }
          } catch (error) {
            this.$log.debug(error)
            this.$store.commit('setIsFileLoading', false)
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
                  fileName: (item.name || item.filename).replace(
                    /^.*[\\/]/,
                    ''
                  ),
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

                // 단일 파일 업로드로 변경
                this.fileData = [fileInfo]

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
              this.$store.commit('setIsFileLoading', false)
              this.$emit('is-complete')
            })
        } else {
          this.$refs.attach.value = ''
          this.fileData = this.fileData.filter(item => {
            return (item.isLoadingBar || false) === false
          })
          this.$store.commit('setIsFileLoading', false)
          this.$emit('is-fail')
        }
      }
    },
    isInCompatibleExtensions(extension) {      
      if (this.inCompatibleExtensions.includes(extension)) {          
        alert(`미지원하는 파일의 형식 : ${extension}`)
        this.$refs.attach.value = ''
        this.fileData = this.fileData.filter(item => {
          return (item.isLoadingBar || false) === false
        })
        this.$store.commit('setIsFileLoading', false)
        this.$emit('is-fail')
        return true
      } else {
        return false
      }
    }
  },
  created() {},
  mounted() {}
}
</script>
<style scoped>
button.btn-homework-send{
    top: 12px;
    display: block;
    transform: skew(0.2deg);
    padding: 0 28px;
    color: #fff;
    font-size: 13px!important;
    margin-left: 4px;
    height: 30px;
    line-height: 30px!important;
   background: #3867c6;
}
</style>