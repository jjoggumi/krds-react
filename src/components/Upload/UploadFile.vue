<template>
  <input
    type="file"
    ref="attach"
    :accept="accept"
    :disabled="disabled"
    :multiple="multiple"
    @change="onChangeFiles"
  >
</template>

<script>
/**
 * 파일 업로드 컴포넌트. 2022-10-26 현재 단일 파일만 지원.
 */
import {mapActions, mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";

export default {
  name: "upload-file",
  props: {
    accept: {
      type: String,
      default() {
        return ''
      }
    },
    allowedTypes: {
      type: Array,
      default() {
        return []
      }
    },
    disabled: {
      type: Boolean,
      default() {
        return false
      }
    },
    errorMessage: {
      type: String,
      default() {
        return '지원되지 않는 파일 형식입니다.'
      }
    },
    multiple: {
      type: Boolean,
      default() {
        return false
      }
    },
  },
  computed: {
    ...mapState({
      isLoading: 'isLoading',
      isFileLoading: 'isFileLoading'
    }),
    inCompatibleExtensions() {
      return this.$store.state.inCompatibleExtensions || []
    },
  },
  methods: {
    ...mapMutations({
      setIsLoading: 'setIsLoading',
      setIsFileLoading: 'setIsFileLoading'
    }),
    ...mapActions('storeImageEditor', {
      openImageEditor: 'openImageEditor'
    }),
    clickAttach() {
      this.$refs.attach.click()
    },
    clearAttach() {
      this.$refs.attach.value = ''
    },
    alertErrorMessage() {
      this.$hiClass.alert(this.errorMessage)
    },
    isInCompatibleExtensions(extension) {
      if (this.inCompatibleExtensions.includes(extension)) {
        this.alertErrorMessage()
        this.clearAttach()
        return true
      } else {
        return false
      }
    },
    isAllowedTypes(contentType) {
      // 타입 제한 없음
      if (this.allowedTypes.length === 0) return true

      const type = this.$comn.split(contentType,"/", 0)
      if (this.allowedTypes.includes(type)) {
        return true
      } else {
        this.alertErrorMessage()
        this.clearAttach()
        return false
      }
    },
    async onChangeFiles(e) {
      if (e === null) {
        this.clearAttach()
        this.$refs.attach.click()

      } else {
        const files = Array.from(e.target.files || e.dataTransfer.files)
        const postApi = []
        let isChk = true

        const isNotAllowExtensions = this.$store.state.isNotAllowExtensions
        if(files.some(f => isNotAllowExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))) {
          this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
          return;
        }

        for (const file of files) {
          if (file.type.startsWith('image')) {
            continue
          }

          const extension = this.$comn.split(file.name, '.')
          const contentType = file.type

          // 미지원 파일확장자 체크
          if (this.isInCompatibleExtensions(extension))
            return false

          // 미지원 파일타입 체크
          if (!this.isAllowedTypes(contentType))
            return false

          if (!isChk) {
            this.alertErrorMessage()
            this.clearAttach()
            return false
          }

          if (isChk) {
            postApi.push(this.$hiClass.multipart.upload(file))
          }
        } // end for

        const imageFiles = files.filter(file => file.type.startsWith('image'))
        if (imageFiles.length > 0) {
          await this.openImageEditor({
            uploadedFiles: null,
            inputFiles: imageFiles,
            imageLimitCount: 1,
            componentKey: this.$vnode.key,
            targetIdx: 0,
            parentComponent: 'surveyFileUpload'
          })
        }

        if (isChk && postApi.length > 0) {
          this.setIsLoading(true)
          this.fileUpload(postApi)
        } else {
          this.clearAttach()
        }
      }
    },
    fileUpload(postApi) {
      this.setIsLoading(true)
      Promise.all(postApi)
          .then(responses => {
            const uploadedFiles = responses.map(response => {
              const item = response.data

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

              const fileInfo = {
                fileName: item.filename.replace(/^.*[\\/]/, ''),
                fileSize: item.size,
                fileOriginalPath: item._links.original.href,
                fileContentType: item.contentType,
              }

              if (fileConvertPath !== null)
                fileInfo.fileConvertPath = fileConvertPath

              if (fileThumbnailPath !== null) {
                fileInfo.fileThumbnailPath = fileThumbnailPath
              } else if (item.contentType.indexOf('video') > -1) {
                fileInfo.fileThumbnailPath = this.$store.state.videoThumbnailDefault
              }

              // TODO: 완료 후 파일업로드 위치 GA 호출
              // this.increaseFileUploadCount({ uploadLocation: this.CONSTANTS.UPLOAD_LOCATION.CLASS })
              this.$log.warn('fileInfo', fileInfo)

              return fileInfo
            })

            // 업로드 완료된 files 를 부모 컴포넌트에 전달
            this.$emit('set-uploaded-files', uploadedFiles)
          })
          .catch(err => {
            this.$log.debug(this.$options.name, ' upload() error => ', err)
            this.alertErrorMessage()
          })
          .finally(() => {
            this.clearAttach()
            this.setIsLoading(false)
          })
    }
  },
  mounted() {
    eventBus.$on(`imageEditor-${this.$vnode.key}`,async uploadFileList => {
      let postApi =[]
      for (let i = 0; i < uploadFileList.length; i++) {
        postApi.push(this.$hiClass.multipart.upload(uploadFileList[i].file))
      }
      this.fileUpload(postApi)
    })
  },
  beforeDestroy() {
    eventBus.$off(`imageEditor-${this.$vnode.key}`)
  }
}
</script>

<style scoped>
input[type="file"] {
  display: none;
}
</style>