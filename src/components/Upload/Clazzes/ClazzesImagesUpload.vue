<template>
  <div
    class="upload-file-wrap"
    @dragover.prevent="onDragOver"
    @dragenter.prevent
    @dragleave.prevent="onDragLeave"
    @drop.prevent="addFile"
    :style="uploadFileWrapStyle"
  >
    <div class="image-edit-msg-wrap" v-if="isShowImagePackTooltip">
      이미지 편집 기능이 추가 되었습니다.
    </div>

    <input
      type="file"
      ref="fileUpload"
      multiple
      :accept="compatibleAccept"
      @change="addFile"
      style="display:none"
    />

    <div
      v-if="imagePackFiles.length === 0 && !isUploadingData"
      class="before-upload"
      style="display: block;"
    >
      <div class="file-drag-area-wrap">
        <div class="file-drag-area" @click="addFile(null)"></div>
        <!-- <input type="file"> -->
      </div>
      <p><span class="type">묶음 사진올리기 (앨범)</span>사진을 여기 끌어다 놓거나, [+]버튼을 선택하세요</p>
    </div>

    <div
      v-else
      class="after-upload"
    >
      <div class="attaching-img-wrap">
        <ul>
          <li
            v-for="(file, idx) of imagePackFiles"
            :key="file.currentId"
          >
            <div class="attaching-img">
              <div class="img-wrap" @click="editImages(imagePackFiles, null, idx)">
                <img :src="getThumbnail(file)" alt="">
              </div>
              <button
                class="delete-btn"
                @click="fileDelete(file)"
              ></button>
            </div>
          </li>

          <template v-if="isUploadingData">
            <div class="loading-infinite-scroll-wrap">
              <div class="icon"></div>
            </div>
          </template>
          <template v-else>
            <li>
              <div class="file-drag-area-wrap">
                <div
                  class="file-drag-area"
                  @click="addFile(null)"
                ></div>
              </div>
            </li>
          </template>

        </ul>
      </div>
    </div>

  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";
import {checkAndConvertHEIC} from "@/plugins/utils";

export default {
  name: "clazzes-images-upload",
  components: {},
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
    },
    addedFiles: {
      type: Array
    },
    parentComponent: {
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
      },
      dragStyle: null,
      isShowImagePackTooltip: false
    }
  },
  computed: {
    ...mapState({
      imagePackResize: 'imagePackResize'
    }),
    ...mapState('storeImageEditor', {
      deleteImages: 'deleteImages'
    }),
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
    imagePackFiles() {
      return this.files.filter(f => 
        f.fileContentType.startsWith('image') && 
        f.fileFlag === 'IMAGE_PACK' && 
        !f.fileOriginalPath === false  
      )
    },
    isUploadingData: {
      get() {
        return this.isUploading
      },
      set(val) {
        this.$emit('update:isUploading', val)
      }
    },
    compatibleAccept() {
      return 'image/gif, image/jpeg, image/png, image/heic'
    },
    compatibleExtensions() {
      return ['gif', 'jpg', 'jpeg', 'png', 'heic']
    },
    compatibleContentType() {
      return ['image']
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

  watch: {},

  methods: {
    ...mapActions({
      increaseFileUploadCount: 'increaseFileUploadCount',
    }),
    ...mapActions('storeImageEditor', {
      openImageEditor: 'openImageEditor',
      changeFilesSort: 'changeFilesSort'
    }),
    ...mapMutations('storeImageEditor', {
      clearDeleteImages: 'clearDeleteImages'
    }),
    async addFile(e) {
      this.onDragLeave()

      if (e === null) {
        this.$refs.fileUpload.value = ''
        this.$refs.fileUpload.click()
      } else {
        this.isUploadingData = true
        const files = Array.from(e.target.files || e.dataTransfer.files)

        for (let i = 0; i < files.length; i++) {
          let bool = false
          this.$log.debug(`확장자 체크 전 files[i] => `, files[i])
          // 파일체크전 HEIC는 jpeg로 변경
          files[i] = await checkAndConvertHEIC(files[i])

          // 파일확장자 체크
          if (
            this.compatibleExtensions !== undefined &&
            this.compatibleExtensions.includes(this.$comn.split(files[i].name, '.'))
          ) {
            bool = true
          }
          // 파일 컨텐츠타입 체크
          if (this.compatibleContentType !== undefined) {
            this.compatibleContentType.forEach(element => {
              if (files[i].type.indexOf(element) !== -1) {
                bool = true
              }
            })
          }

          if (!bool) {
            this.$hiClass.alert('업로드를 지원하지 않는 파일형식입니다.')
            this.$refs.fileUpload.value = ''
            this.isUploadingData = false
            return false
          }
        }

        const isNotAllowExtensions = this.$store.state.isNotAllowExtensions
        if (files.some(f => isNotAllowExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))) {
          this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
          this.isUploadingData = false
          return false
        }

        // 기 등록된 첨부파일 정보 체크
        let imageCount = this.imagePackFiles.length

        let isChk = true
        const postApi = []

        for (let i = 0; i < files.length; i++) {
          if (files[i].type.indexOf('image') !== -1) {
            if (imageCount < 100) {
              imageCount++
            } else {
              this.$hiClass.alert('최대 100장의 사진을 하나의 앨범모양으로 묶어 올릴 수 있습니다.')
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
            this.$hiClass.alert(fileUploadErrorMessage)
            isChk = false
            i = files.length
          }

          if (isChk) {
            const convertedFile = await this.$hiClass.getConvertedFile(files[i])
            this.progress.total++
            postApi.push(
                this.$hiClass.multipart.upload(convertedFile, {
                  onUploadProgress: progressEvent => {
                    if (progressEvent.loaded === progressEvent.total) {
                      this.progress.current++
                    }

                    this.progress.files[`file${i}`] = (progressEvent.loaded * 100) / progressEvent.total
                    let totalPercent = this.progress.files
                        ? Object.values(this.progress.files).reduce((sum, num) => sum + num, 0)
                        : 0
                    this.progress.percent = parseInt(Math.round(totalPercent / this.progress.total))
                  }
                })
            )
          } else {
            this.isUploadingData = false
            this.$refs.fileUpload.value = ''
            return false
          }
        }

        if (isChk) {
          this.fileUpload(postApi)
        }
      }
    },
    fileUpload(postApi, fileInfos = []) {
      this.isUploadingData = true
      let isAllSuccess = true
      Promise.allSettled(postApi)
          .then(res => {
            res.forEach((item, idx) => {
              if (item.status === 'fulfilled' && item.value.status === 200) {
                const fileInfo = this.makeFileInfo(item.value.data)

                if (fileInfos.length > 0) {
                  const targetIdx = this.fileData.findIndex(file => file === fileInfos[idx])
                  if (targetIdx > -1) {
                    this.fileData.splice(targetIdx, 1, fileInfo)
                  }
                } else {
                  this.fileData.push(fileInfo)
                }
                this.addedFiles.push(fileInfo)

                // 완료 후 파일업로드 위치 GA 호출
                this.increaseFileUploadCount({ uploadLocation: this.CONSTANTS.UPLOAD_LOCATION.CLASS })
              }
              isAllSuccess = res.every(r => r.status === 'fulfilled')
            })
          })
          .catch(err => {
            this.$log.debug(this.$options.name, ' upload() error => ', err)
            this.$hiClass.alert('파일 업로드가 실패되었습니다. 다시 시도해 주세요.')
          })
          .finally(async () => {
            this.$refs.fileUpload.value = ''
            if (!isAllSuccess) {
              this.fileData = this.fileData.filter(file => file.fileOriginalPath)
              this.$hiClass.alert('일부 사진이 업로드에 실패했습니다.<br>확인 후 다시 업로드해 주세요.')
            }
            this.isUploadingData = false
            this.progress = {
              current: 0,
              percent: 0,
              total: 0,
              files: {}
            }
          })
    },
    fileDelete(file) {
      if(!this.isUploadingData) {
        this.fileData = this.fileData.filter(item => {
          return item.fileOriginalPath !== file.fileOriginalPath
        })
      }
    },

    makeFileInfo(item) {
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
      }

      if (fileConvertPath !== null)
        fileInfo.fileConvertPath = fileConvertPath

      if (fileThumbnailPath !== null) {
        fileInfo.fileThumbnailPath = fileThumbnailPath
      } else if (item.contentType.indexOf('video') > -1) {
        fileInfo.fileThumbnailPath = this.$store.state.videoThumbnailDefault
      }

      if (item.contentType.indexOf('image') > -1) {
        fileInfo.fileFlag = 'IMAGE_PACK'
      }

      return fileInfo
    },

    // isInCompatibleExtensions(extension) {
    //   if (this.inCompatibleExtensions.includes(extension)) {
    //

    // isInCompatibleType(contentType) {
    //   const type = this.$comn.split(contentType,"/", 0)
    //   if (this.inCompatibleType.includes(type)) {
    //     alert(`지원하지 않는 파일 타입 : ${contentType}`)
    //     this.$refs.fileUpload.value = ''
    //     return true
    //   } else {
    //     return false
    //   }
    // },

    getThumbnail(imageFile) {
      let thumbnailPath = imageFile.fileThumbnailPath

      if (!thumbnailPath) {
        // 묶음 사진 이미지일 경우 썸네일 주소 생성
        thumbnailPath = imageFile.fileOriginalPath.replace('//download', '//image')
          .concat(`?width=${this.imagePackResize.THUMBNAIL_MAX_WIDTH}`)
          .concat(`&height=${this.imagePackResize.THUMBNAIL_MAX_HEIGHT}`)
      }

      return thumbnailPath
    },

    onDragOver() {
      this.dragStyle = 'whitesmoke'
    },
    onDragLeave() {
      this.dragStyle = '#FFFFFF'
    },
    async editImages(uploadedFiles, inputFiles, targetIdx) {
      await this.openImageEditor({
        uploadedFiles,
        inputFiles,
        imageLimitCount: 100,
        componentKey: `clazzes-images-upload`,
        targetIdx,
        parentComponent: 'clazzImagesUpload'
      })
    }
  },
  created() {
    if (!localStorage.getItem('isOnceShowImagePackTooltip') && this.parentComponent === 'postEdit') {
      this.isShowImagePackTooltip = true
      setTimeout(() => {
        this.isShowImagePackTooltip = false
        localStorage.setItem('isOnceShowImagePackTooltip', 'true')
      }, 5000)
    }
  },
  mounted() {
    eventBus.$on(`imageEditor-clazzes-images-upload`,async uploadFileList => {
      // 편집기에서 삭제된 파일 삭제
      if (this.deleteImages.length > 0) {
        this.deleteImages.forEach(deleteImage => {
          const targetIdx = this.fileData.findIndex(file => deleteImage.fileOriginalPath === file.fileOriginalPath)
          if (targetIdx > -1) {
            this.fileData.splice(targetIdx, 1)
          }
        })
        this.clearDeleteImages()
      }

      // 신규 파일 추가
      let postApi = []
      let fileInfos = []

      uploadFileList.forEach((uploadFile, idx) => {
        const addFile = uploadFileList[idx]
        let fileInfo = {
          fileContentType: addFile.file.type,
          fileName: addFile.file.name.replace(/^.*[\\/]/, ''),
          fileSize: addFile.file.size
        }

        this.progress.total++
        postApi.push(
            this.$hiClass.multipart.upload(addFile.file, {
              onUploadProgress: progressEvent => {
                if (progressEvent.loaded === progressEvent.total) {
                  this.progress.current++
                }
                this.progress.files[`file${idx}`] =
                    (progressEvent.loaded * 100) / progressEvent.total
                let totalPercent = this.progress.files
                    ? Object.values(this.progress.files).reduce((sum, num) => sum + num, 0)
                    : 0
                this.progress.percent = parseInt(
                    Math.round(totalPercent / this.progress.total)
                )
              }
            })
        )
        fileInfos.push(fileInfo)

        const targetIdx = this.fileData.findIndex(file => file.fileOriginalPath === addFile.fileOriginalPath)
        if (targetIdx > -1) {
          this.fileData.splice(targetIdx, 1, fileInfo)
        } else {
          this.fileData.push(fileInfo)
        }
      })

      // 정렬
      const imagePackFiles = this.fileData.filter(file => file.fileFlag !== 'FILE' && file.fileContentType.startsWith('image'))
      const notImagePackFiles = this.fileData.filter(file => file.fileFlag === 'FILE' || !file.fileContentType.startsWith('image'))

      const sortedArr = await this.changeFilesSort(imagePackFiles)
      if (sortedArr.length > 0) {
        this.$emit('update:files', [...sortedArr, ...notImagePackFiles])
      }

      // 업로드
      if (postApi.length > 0) {
        this.fileUpload(postApi, fileInfos)
      }
    })
  },
  beforeDestroy() {
    eventBus.$off(`imageEditor-clazzes-images-upload`)
  }

}
</script>

<style scoped>

</style>