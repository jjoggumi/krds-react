<!--
@File(Method): CommentFileUpload.vue
@Author: -
@Date Created: -
@Description: 게시글 상세 댓글 (파일 업로드 영역)
@Modified: 2024-10-11 - #68852 영상변환 요청 결과 반영 개선
@ETC :
-->

<template>
  <div>
    <button
      class="btn-attachment"
      @click.stop="selectFile('click')"
    >
      <ul class="file-select" 
        v-if="isSelectFile" 
        v-click-outside="selectFile"
        @mouseover="offVco"
        @mouseleave="onVco"
      >
        <li @click="selectedFile('image', $event)"><i class="attach-file-image"></i>이미지</li>
        <li @click="selectedFile('video', $event)"><i class="attach-file-video"></i>동영상</li>
        <li @click="selectedFile('doc', $event)"><i class="attach-file-doc"></i>문서</li>
      </ul>
    </button>
    <input ref="commentFileUpload" type="file" @change="addFile" style="display: none;" />

    <input ref="commentFileImageUpload" type="file" @change="addImageFile" accept="image/*" style="display: none;" multiple />
    <input ref="commentFileVideoUpload" type="file" @change="addVideoFile" accept="video/*" style="display: none;" />
    <input ref="commentFileDocUpload" type="file" @change="addDocFile" style="display: none;" multiple />
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";
import {checkAndConvertHEIC, validatePDF} from "@/plugins/utils";
import {mapFields} from "vuex-map-fields";

export default {
  name: "comment-file-upload",
  props: {
    files: {
      type: Array
    },
    isAddFiles: {
      type: Boolean
    },
    isAddSticker: {
      type: Boolean
    },
    isClassPostPossbile: {
      type: Boolean
    },
    model: Object,
    isNotHiNotice: {
      type: Boolean,
      default() {
        return false
      }
    },
    fileList: Array,
    emoticonPath: String,
    isUpdate: String,
    unusedFiles: {
      type: Array
    }
  },
  data() {
    return {
      option: {
        fileMb: 1024 * 1024
      },
      isSelectFile: false,
      isSelectFileOn: false,
      isAttachFileOn: false,
      fileCount: 0,
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: "CONSTANTS"
    }),
    ...mapFields(['isDimLoading']),
    ...mapState('storeImageEditor', {
      deleteImages: 'deleteImages'
    }),
    fileData: {
      get() {
        return this.files
      },
      set(val) {
        this.$emit('update:files', val)
      }
    },
    attachedFileList() {
      return this.fileData.filter(v => v.fileOriginalPath)
    },
    imageFileList() {
      return this.fileData.filter(v => v.fileContentType.startsWith('image'))
    },
    videoFileList() {
      return this.fileData.filter(v => v.fileContentType.startsWith('video'))
    },
    docFileList() {
      return this.fileData.filter(v => v.fileContentType.startsWith('image') === false && v.fileContentType.startsWith('video') === false)
    },
    // isAttachDisabled() {
    //   return this.isAddSticker === true && this.isClassPostPossbile === false
    // }
  },
  methods: {
    ...mapActions({
      increaseFileUploadCount: 'increaseFileUploadCount'
    }),
    ...mapActions('storeImageEditor', {
      openImageEditor: 'openImageEditor',
      changeFilesSort: 'changeFilesSort'
    }),
    ...mapMutations('storeImageEditor', {
      clearDeleteImages: 'clearDeleteImages'
    }),
    async addFile(e) {
      if (this.isAddSticker) {
        return false
      }

      if (e === null) {
        if (this.isAddFiles) {
          this.$hiClass.alert('첨부파일은 1개만 등록 가능합니다.', 'info')
          return false
        }

        this.$refs.commentFileUpload.click() // 파일객체가 없을경우 탐색기 열기

      } else if (e.target.files[0] !== null) {
        /* ie Change 중복 실행으로 e.target.files[0] 객체 확인 */
        const files = e.target.files || e.dataTransfer.files

        // 타입이 video 일경우 업로드 제외
        if (files[0].type.indexOf('video') > -1) {
          this.$hiClass.alert('비디오 파일은 등록할 수 없습니다', 'info')
          e.target.value = ''
          return false
        } else {
          if (files[0] !== undefined) {
            let fileInfo = {
              fileName: files[0].name.replace(/^.*[\\/]/, ''),
              fileContentType: files[0].type,
              progress: 0
            }
            this.fileData.push(fileInfo)

            let formData = new FormData()
            formData.append('file', files[0], files[0].name)

            this.upload(formData)
          }
        }
      }
    },
    upload(formData) {
      let config = {
        onUploadProgress: function(progressEvent) {
          this.$nextTick(function() {
            this.fileData[0].progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
          })
        }.bind(this)
      }

      this.$axios.post(this.$apiFileUrl, formData, config)
        .then(response => {
          this.$log.debug(this.$options.name, 'upload', response)

          let fileConvertPath = null

          try {
            if (response._links && response._links.convert && response._links.convert.href)
              fileConvertPath = response._links.convert.href
          } catch (error) {
            this.$log.debug(error)
          }

          let fileInfo = {
            fileName: response.data.filename.replace(/^.*[\\/]/, ''),
            fileSize: response.data.size + '',
            fileOriginalPath: response.data._links.original.href,
            fileContentType: response.data.contentType,
          }
          if (fileConvertPath !== null)
            fileInfo.fileConvertPath = fileConvertPath

          // 타입이 video 일경우
          if (response.data.contentType.indexOf('video') > -1) {
            fileInfo.fileThumbnailPath = this.$store.state.videoThumbnailDefault
          }

          this.$nextTick(() => {
            this.fileData.push(fileInfo)
          })

          // 완료 후 파일업로드 위치 GA 호출
          if (this.isNotHiNotice)
            this.increaseFileUploadCount({ uploadLocation: this.CONSTANTS.UPLOAD_LOCATION.CLASS_COMMENT })
        })
        .catch(error => {
          this.$hiClass.alert(this.$t('main.text.error.upload'), 'error')
          this.$log.debug(this.$options.name, 'upload error', error)
        })
        .finally(() => {
          this.$refs.commentFileUpload.value = ''

          this.$nextTick(() => {
            if (this.fileData[0].progress)
              this.fileData.splice(0, 1)
          })
        })
    },
    selectFile(data = null) {
      if(this.isAttachFileOn === true) {
        this.isSelectFile = true
        this.isAttachFileOn = false
        return
      }

      if(this.isSelectFileOn === true && this.isAttachFileOn === true) {
        this.isSelectFile = true
      } else {
        this.isSelectFile = !this.isSelectFile
      }

      if(data === 'click') this.$emit("stickerClosePopup")
    },
    onVco() {
      // this.isSelectFileOn = true

      const sweetAlerts = document.querySelectorAll('.swal2-container')
      if (sweetAlerts.length >= 1) {
        this.isSelectFileOn = true
      } else {
        this.isSelectFileOn = false
      }
    },
    offVco() {
      this.isSelectFileOn = true
    },
    selectedFile(data, e) {
      e.stopPropagation();

      if(data === "image") {
        if(this.videoFileList.length > 0 || this.docFileList.length > 0) {
          this.$hiClass.confirm('기존 첨부 파일을 모두 삭제하고 이미지를 등록하시겠습니까?', null, {reverseButtons: true})
            .then(() => {
              this.unusedFiles.push(...this.fileData)
              this.fileData = []
              this.$refs.commentFileImageUpload.click()
              this.isAttachFileOn = true
              this.isSelectFile = true
            })
            .catch(() => {
              this.isAttachFileOn = true
            })
        } else {
          this.isAttachFileOn = true
          this.$refs.commentFileImageUpload.click()
        }
      } else if(data === "video") {
        if(this.imageFileList.length > 0 || this.docFileList.length > 0) {
          this.$hiClass.confirm('기존 첨부 파일을 모두 삭제하고 동영상을 등록하시겠습니까?', null, {reverseButtons: true})
            .then(() => {
              this.unusedFiles.push(...this.fileData)
              this.fileData = []
              this.$refs.commentFileVideoUpload.click()
              this.isAttachFileOn = true
              this.isSelectFile = true
            })
            .catch(() => {
              this.isAttachFileOn = true
            })
        } else {
          this.isAttachFileOn = true
          this.$refs.commentFileVideoUpload.click()
        }
      } else if(data === "doc") {
        if(this.imageFileList.length > 0 || this.videoFileList.length > 0) {
          this.$hiClass.confirm('기존 첨부 파일을 모두 삭제하고 문서를 등록하시겠습니까?', null, {reverseButtons: true})
            .then(() => {
              this.unusedFiles.push(...this.fileData)
              this.fileData = []
              this.$refs.commentFileDocUpload.click()
              this.isAttachFileOn = true
              this.isSelectFile = true
            })
            .catch(() => {
              this.isAttachFileOn = true
            })
        } else {
          this.isAttachFileOn = true
          this.$refs.commentFileDocUpload.click()
        }
      }
    },
    async addImageFile(e) {
      //this.isSelectFile = true
      const files = e.target.files || e.dataTransfer.files

      if(this.fileData.length + files.length > 10) {
        this.$hiClass.alert('이미지는 최대 10개까지 등록 가능합니다.', 'info')
        this.resetInputFile()
        return;
      }

      //fileList는 조작이 안되므로 DataTransfer를 이용하여 새로운 files를 만든다.
      const dataTransfer = new DataTransfer();

      //HEIC 변환이 시간이 걸릴 수 있으므로 로딩 사용
      this.isDimLoading = true;

      for(let i = 0; i< files.length; i++) {
        const originFile = files[i] // 원본 파일

        //HEIC 파일 체크와 변환
        const file = await checkAndConvertHEIC(files[i])

        if(file.type.startsWith("image") === false) {
          this.$hiClass.alert('업로드를 지원하지 않는 파일입니다.')
          this.resetInputFile()
          return;
        }

        // 파일 용량 체크는 원본 파일로 한다.
        if(originFile.size > this.option.fileMb * this.$store.state.upload.class.image.size) {
          this.$hiClass.alert(`이미지는 ${this.$store.state.upload.class.image.sizeStr}까지 첨부 가능합니다.`)
          this.resetInputFile()
          return;
        }

        dataTransfer.items.add(file)
      }

      this.isDimLoading = false;

      await this.openImageEditor({
        uploadedFiles: this.files,
        inputFiles: dataTransfer.files,
        imageLimitCount: 10,
        componentKey: this.$vnode.key,
        targetIdx: this.files.length,
        parentComponent: 'commentFileUpload'
      })
    },
    addVideoFile(e) {
      //this.isSelectFile = true
      const files = e.target.files || e.dataTransfer.files
      
      if(this.fileData.length >= 1) {
        this.$hiClass.alert('동영상은 1개만 등록 가능합니다.', 'info')
        this.resetInputFile()
        return;
      }

      if(files[0].type.startsWith("video") === false) {
        this.$hiClass.alert('업로드를 지원하지 않는 파일입니다.')
        this.resetInputFile()
        return;
      }

      if(files[0].size > this.option.fileMb * this.$store.state.upload.class.video.size) {
        this.$hiClass.alert(`동영상은 ${this.$store.state.upload.class.video.sizeStr}까지 첨부 가능합니다.`, 'info')
        this.resetInputFile()
        return;
      }

      this.addFiles(e.target.files)
    },
    async addDocFile(e) {
      //this.isSelectFile = true
      const files = e.target.files || e.dataTransfer.files

      if(this.fileData.length + files.length > 10) {
        this.$hiClass.alert('문서는 최대 10개까지 등록 가능합니다.', 'info')
        this.resetInputFile()
        return;
      }
      
      for(let i = 0;i<files.length;i++) {
        if(files[i].type.startsWith("video") || files[i].type.startsWith("image")) {
          this.$hiClass.alert('업로드를 지원하지 않는 파일입니다.')
          this.resetInputFile()
          return;
        }

        if (files[i].name.substring(files[i].name.lastIndexOf('.') + 1, files[i].name.length).toLowerCase() === 'pdf') {
          const message = await validatePDF(files[i])
          if (message === 'ERROR-2') {
            this.$hiClass.alert('손상된 PDF 파일입니다. 확인 후 다시 업로드 해 주세요.')
            return;
          }
        }

        if(files[i].size > this.option.fileMb * this.$store.state.upload.class.etc.size) {
          this.$hiClass.alert(`문서는 ${this.$store.state.upload.class.etc.sizeStr}까지 첨부 가능합니다.`)
          this.resetInputFile()
          return;
        }
      }

      await this.addFiles(e.target.files)
    },
    async addFiles(files) {
      this.isSelectFile = false
      this.$emit("removeS")

      const convertedFiles = []
      const fileInfos = []
      const postApi = []
      for(let i = 0;i<files.length;i++) {
        const convertedFile = await this.$hiClass.getConvertedFile(files[i])
        this.$log.debug("file", convertedFile)
        let fileInfo = {
          fileName: convertedFile.name.replace(/^.*[\\/]/, ''),
          fileContentType: convertedFile.type,
          progress: 0
        }
        this.fileData.push(fileInfo)
        fileInfos.push(fileInfo)
        convertedFiles.push(convertedFile)
      }

      this.uploads(convertedFiles, fileInfos)
    },
    uploads(files, fileInfos) {
      this.$log.debug("uploads", files, fileInfos)

      for (let i = 0; i < files.length; i++) {
        const isVideo = files[i].type.startsWith('video')
        let formData = new FormData()
        formData.append('file', files[i], files[i].name)
        formData.append('encode', !isVideo);

        let config = {
          onUploadProgress: function(progressEvent) {
            this.$nextTick(function() {
              fileInfos[i].progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              )
            })
          }.bind(this)
        }

        this.$axios.post(this.$apiFileUrl, formData, config)
        .then(response => {
          this.$log.debug("response", response, i)
          const fileInfo = this.makeFileInfo(response)

          // 타입이 video 일경우
          // if (response.data.contentType.indexOf('video') > -1) {
          //   fileInfo.fileThumbnailPath = this.$store.state.videoThumbnailDefault
          // }

          this.$nextTick(() => {
            this.$log.debug("fileInfo", fileInfo, i)

            if (fileInfos.length > 0) {
              const targetIdx = this.fileData.findIndex(file => file === fileInfos[i])
              if (targetIdx > -1) {
                this.fileData.splice(targetIdx, 1, fileInfo)
              }
            } else {
              this.fileData.push(fileInfo)
            }
          })

          // 완료 후 파일업로드 위치 GA 호출
          if (this.isNotHiNotice)
            this.increaseFileUploadCount({ uploadLocation: this.CONSTANTS.UPLOAD_LOCATION.CLASS_COMMENT })
        })
        .catch(error => {
          this.$hiClass.alert(this.$t('main.text.error.comment'), 'error')
          this.fileData = this.fileData.filter(item => item !== fileInfos[i]).filter(item => item.fileOriginalPath)
          this.$log.debug(this.$options.name, 'upload error', error, i)
        })
        .finally(async () => {
          this.$log.debug("finally", i, this.fileData)
          this.resetInputFile()
        })
      }
    },
    makeFileInfo(response) {
      let fileConvertPath = null
      let fileThumbnailPath = null
      let requestId = null

      try {
        if (response.data._links && response.data._links.convert && response.data._links.convert.href)
          fileConvertPath = response.data._links.convert.href

        if (response.data._links && response.data._links.thumbnail && response.data._links.thumbnail.href)
          fileThumbnailPath = response.data._links.thumbnail.href

        if (response.data && response.data.requestId)
          requestId = response.data.requestId
      } catch (error) {
        this.$log.debug(error)
      }

      let fileInfo = {
        fileName: response.data.filename.replace(/^.*[\\/]/, ''),
        fileSize: response.data.size + '',
        fileOriginalPath: response.data._links.original.href,
        fileContentType: response.data.contentType
      }
      if (fileConvertPath)
        fileInfo.fileConvertPath = fileConvertPath

      if (fileThumbnailPath)
        fileInfo.fileThumbnailPath = fileThumbnailPath

      if (requestId) {
        fileInfo.requestId = requestId
      }

      return fileInfo
    },
    resetInputFile() {
      this.$refs.commentFileImageUpload.value = ''
      this.$refs.commentFileVideoUpload.value = ''
      this.$refs.commentFileDocUpload.value = ''
    }
  },
  mounted() {
    eventBus.$on(`imageEditor-${this.$vnode.key}`,async uploadFileList => {
      // 편집기에서 삭제된 파일 삭제
      if (this.deleteImages.length > 0) {
        this.deleteImages.forEach(deleteImage => {
          const targetIdx = this.fileData.findIndex(file => deleteImage.fileOriginalPath === file.fileOriginalPath)
          if (targetIdx > -1) {
            this.unusedFiles.push(this.fileData[targetIdx])
            this.fileData.splice(targetIdx, 1)
          }
        })
        this.clearDeleteImages()
      }

      // 신규 파일 추가
      const convertedFiles = []
      const fileInfos = []

      uploadFileList.forEach((uploadFile, idx) => {
        const addFile = uploadFileList[idx]
        if (addFile) {
          let fileInfo = {
            fileContentType: addFile.file.type,
            fileName: addFile.file.name.replace(/^.*[\\/]/, ''),
            fileSize: addFile.file.size,
            progress: 0
          }

          const targetIdx = this.fileData.findIndex(file => file.fileOriginalPath === addFile.fileOriginalPath)
          if (targetIdx > -1) {
            this.fileData.splice(targetIdx, 1, fileInfo)
          } else {
            this.fileData.push(fileInfo)
          }

          fileInfos.push(fileInfo)
          convertedFiles.push(addFile.file)
        }
      })

      // 정렬
      const sortedArr = await this.changeFilesSort(this.fileData)
      if (sortedArr.length > 0) {
        this.fileData = sortedArr
      }

      this.$emit("removeS")

      // 업로드
      if (fileInfos.length > 0) {
        this.uploads(convertedFiles, fileInfos)
      }
    })
  },
  beforeDestroy() {
    eventBus.$off(`imageEditor-${this.$vnode.key}`)
  }
}
</script>

<style scoped>
</style>