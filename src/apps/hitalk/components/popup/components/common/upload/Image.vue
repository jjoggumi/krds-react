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
      <p><span class="type">사진 앨범</span>사진을 여기 끌어다 놓거나, [+] 버튼을 선택하세요</p>
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
              <div class="img-wrap" @click="editImages(fileData, null, idx)">
                <img :src="getThumbnail(file)" alt="">
              </div>
              <button
                  class="delete-btn"
                  @click="fileDelete(file)"
              ></button>
            </div>
          </li>

          <template v-if="isUploadingData">
            <li>
              <div class="loading-infinite-scroll-wrap">
                <div class="icon"></div>
              </div>
            </li>
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
import {createFileObjectFromApiResponse, checkAndConvertHEIC} from "@/plugins/utils";
import {mapFields} from "vuex-map-fields";

export default {
  name: "upload-image",
  components: {},
  props: {
    files: {
      type: Array
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
      dragStyle: null
    }
  },
  computed: {
    ...mapState(['imagePackResize']),
    ...mapState('storeImageEditor', ['deleteImages']),
    ...mapGetters(['CONSTANTS']),
    ...mapFields([
      'isDimLoading'
    ]),
    fileData: {
      get() {
        return this.files
      },
      set(val) {
        this.$emit('update:files', val)
      }
    },
    imagePackFiles() {
      return this.files.filter(f => { return f.fileContentType.startsWith('image')}) || []
    },
    docFiles() {
      return this.files.filter(f => {
        return f.fileContentType && (!f.fileContentType.startsWith('image') && !f.fileContentType.startsWith('video'))
      }) || []
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
    compatibleAccept() {
      return 'image/gif, image/jpeg, image/png, image/heic'
    },
    compatibleExtensions() {
      return ['gif', 'jpg', 'jpeg', 'png', 'heic']
    },
    compatibleContentType() {
      return ['image']
    }
  },
  methods: {
    ...mapActions({
      increaseFileUploadCount: 'increaseFileUploadCount'
    }),
    ...mapActions('storeImageEditor', {
      openImageEditorAndWait: 'openImageEditorAndWait',
      changeFilesSort: 'changeFilesSort'
    }),
    ...mapMutations('storeImageEditor', {
      clearDeleteImages: 'clearDeleteImages'
    }),
    async addFile(e) {
      this.onDragLeave()

      const validate = new Promise((resolve, reject) => {
        // 기 등록된 첨부파일 정보 체크
        const imageCount = this.imagePackFiles.length
        const docCount = this.docFiles.length
        let errorMessage = null

        if (docCount > 0) {
          errorMessage = '첨부파일은 1개만 추가 가능합니다.'
        } else if (imageCount >= 30) {
          errorMessage = '최대 30장까지 첨부 가능합니다.'
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
          .then(() => this.addFileProc(e))
          .catch(() => false)
    },
    async addFileProc(e) {
      let imageCount = this.imagePackFiles.length

      if (e === null) {
        this.$refs.fileUpload.value = ''
        this.$refs.fileUpload.click()

      } else {
        this.isUploadingData = true
        const files = []

        this.isDimLoading = true
        for (const file of Array.from(e.target.files || e.dataTransfer.files)) {
          files.push(await checkAndConvertHEIC(file))
        }
        this.isDimLoading = false

        for (let i = 0; i < files.length; i++) {
          let bool = false
          this.$log.debug(`확장자 체크 전 files[i] => `, files[i])

          // 파일확장자 체크
          if (
              this.compatibleExtensions !== undefined &&
              this.compatibleExtensions.includes(
                  this.$comn.split(files[i].name, '.')
              )
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
        if(files.some(f => isNotAllowExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))) {
          this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
          return;
        }
        
        let isChk = true
        const uploadRequests = []

        for (let i = 0; i < files.length; i++) {
          if (files[i].type.indexOf('image') !== -1) {
            if (imageCount < 30) {
              imageCount++
            } else {
              this.$hiClass.alert('최대 30장까지 첨부 가능합니다.')
              isChk = false
              i = files.length
            }
          } else if (files[i].size > this.option.fileMb * this.$store.state.upload.chat.image.size) {
            const fileUploadErrorMessage = this.$t(
                'file.upload.error.size.over.image',
                {
                  sizeStr: this.$store.state.upload.class.image.sizeStr
                }
            )
            this.$hiClass.alert(fileUploadErrorMessage)
            isChk = false
            i = files.length
          }

          if (isChk) {
            // 이미지일 경우 업로드 전 리사이즈 처리 추가
            const convertedFile = await this.$hiClass.getConvertedFile(files[i])
            this.progress.total++
            uploadRequests.push(this.uploadFileWithProgress(convertedFile, i))
          }
        }

        if (isChk) {
          const copiedFiles = JSON.parse(JSON.stringify(this.fileData))
          await this.uploadFiles(copiedFiles, uploadRequests)
        } else {
          this.isUploadingData = false
          this.$refs.fileUpload.value = ''
        }
      }
    },
    /**
     * 파일 업로드
     * @param copiedFiles fileData 를 복사한 배열
     * @param uploadRequests multipart upload 요청 배열
     * @returns {Promise<void>}
     */
    async uploadFiles(copiedFiles, uploadRequests) {
      let isAllSuccess = true
      try {
        const responses = await Promise.allSettled(uploadRequests)
        responses.forEach(res => {
          if (res.status === 'fulfilled' && res.value.status === 200) {
            const fileRes = res.value.data
            const previousFilePath = res.value.config.fileOriginalPath
            const uploadedFile = createFileObjectFromApiResponse(fileRes)

            if (previousFilePath) { // 이미지 편집기를 통해 추가 or 수정된 경우
              const targetIdx = copiedFiles.findIndex(file => file.fileOriginalPath === previousFilePath)
              if (targetIdx > -1) {
                copiedFiles.splice(targetIdx, 1, uploadedFile)
              }
            } else {
              copiedFiles.push(uploadedFile)
            }

            // 완료 후 파일업로드 위치 GA 호출
            this.increaseFileUploadCount({ uploadLocation: this.CONSTANTS.UPLOAD_LOCATION.HITALK })
          }
          isAllSuccess = responses.every(r => r.status === 'fulfilled')
        })
      } catch (err) {
        this.$hiClass.alert('파일 업로드가 실패되었습니다. 다시 시도해 주세요.')
      } finally {
        this.fileData = copiedFiles.filter(file => file.fileOriginalPath && file.fileOriginalPath.indexOf('download.hiclass.net') > -1)
        this.$refs.fileUpload.value = ''
        this.isUploadingData = false
        this.progress = { current: 0, percent: 0, total: 0, files: {} }
        if (!isAllSuccess) {
          this.$hiClass.alert('일부 사진이 업로드에 실패했습니다.<br>확인 후 다시 업로드해 주세요.')
        }
      }
    },
    fileDelete(file) {
      if (!this.isUploadingData) {
        this.fileData = this.fileData.filter(item => {
          return item.fileOriginalPath !== file.fileOriginalPath
        })
        this.unusedFiles.push(file)
      }
    },
    getThumbnail(imageFile) {
      if (imageFile.fileThumbnailPath) {
        return imageFile.fileThumbnailPath
      } else {
        return imageFile.fileOriginalPath.replace('//download', '//image')
            .concat(`?width=${this.imagePackResize.THUMBNAIL_MAX_WIDTH}`)
            .concat(`&height=${this.imagePackResize.THUMBNAIL_MAX_HEIGHT}`)
      }
    },
    onDragOver() {
      this.dragStyle = 'whitesmoke'
    },
    onDragLeave() {
      this.dragStyle = '#FFFFFF'
    },
    async editImages (uploadedFiles, inputFiles, targetIdx) {
      const editedFiles = await this.openImageEditorAndWait({
        uploadedFiles,
        inputFiles,
        imageLimitCount: 30,
        componentKey: 'hitalk-image-upload',
        targetIdx,
        parentComponent: 'hitalkImageUpload'
      })

      if (editedFiles.length === 0) return

      this.isUploadingData = true

      let copiedFiles = JSON.parse(JSON.stringify(this.fileData))

      // 편집기에서 삭제된 파일 삭제
      if (this.deleteImages.length > 0) {
        this.deleteImages.forEach(deleteImage => {
          const targetIdx = copiedFiles.findIndex(file => deleteImage.fileName === file.fileName)
          if (targetIdx > -1) {
            this.unusedFiles.push(copiedFiles[targetIdx])
            copiedFiles.splice(targetIdx, 1)
          }
        })
        this.clearDeleteImages()
      }

      let uploadRequests = []

      editedFiles.forEach((fileItem, idx) => {
        const fileToUpload = fileItem.file
        const previousFilePath = fileItem.fileOriginalPath || null
        const targetIdx = copiedFiles.findIndex(f => f.fileOriginalPath === previousFilePath && previousFilePath.indexOf('download.hiclass.net') > -1)
        if (targetIdx === -1) copiedFiles.push({ fileOriginalPath: fileItem.fileOriginalPath, fileName: fileToUpload.name.replace(/^.*[\\/]/, '') })
        uploadRequests.push(this.uploadFileWithProgress(fileToUpload, idx, previousFilePath))
      })

      // 정렬
      const sortedFiles = await this.changeFilesSort(copiedFiles)
      if (sortedFiles.length > 0) {
        copiedFiles = JSON.parse(JSON.stringify(sortedFiles))
      }

      // 업로드
      await this.uploadFiles(copiedFiles, uploadRequests)
    },
    uploadFileWithProgress(file, idx, previousFilePath = null) {
      return this.$hiClass.multipart.upload(file, {
        onUploadProgress: progressEvent => {
          if (progressEvent.loaded === progressEvent.total) {
            this.progress.current++
          }

          this.progress.files[`file${idx}`] = (progressEvent.loaded * 100) / progressEvent.total
          let totalPercent = this.progress.files
              ? Object.values(this.progress.files).reduce((sum, num) => sum + num, 0)
              : 0
          this.progress.percent = parseInt(Math.round(totalPercent / this.progress.total))
        },
        fileOriginalPath: previousFilePath
      }, true)
    }
  }
}
</script>

<style scoped>

</style>