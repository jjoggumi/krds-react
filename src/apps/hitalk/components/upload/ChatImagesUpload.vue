<template>
  <div
    class="upload-file-wrap"
    @dragover.prevent="onDragOver"
    @dragenter.prevent
    @dragleave.prevent="onDragLeave"
    @drop.prevent="addFile"
    :style="uploadFileWrapStyle"
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
            v-for="file of imagePackFiles"
            :key="file.currentId"
          >
            <div class="attaching-img">
              <div class="img-wrap">
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
import {mapActions, mapGetters, mapState} from "vuex";

export default {
  name: "chat-images-upload",
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
    loadingObj: {
      type: Object
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
    ...mapGetters(['CONSTANTS']),
    fileData: {
      get() {
        return this.files
      },
      set(val) {
        this.$emit('update:files', val)
      }
    },
    imagePackFiles() {
      return this.files.filter(f => { return f.fileContentType.startsWith('image') && f.fileFlag === 'IMAGE_PACK' }) || []
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
      return 'image/gif, image/jpeg, image/png'
    },
    compatibleExtensions() {
      return ['gif', 'jpg', 'jpeg', 'png']
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

  mounted() {},

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
        const files = Array.from(e.target.files || e.dataTransfer.files)

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
            return false
          }
        }

        const isNotAllowExtensions = this.$store.state.isNotAllowExtensions
        if(files.some(f => isNotAllowExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))) {
          this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
          return;
        }

        let isChk = true
        const postApi = []

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

        // if (convertedFiles.length > 0) {
        //   postApi.push(
        //     this.$hiClass.multiparts.upload(convertedFiles, {
        //       onUploadProgress: progressEvent => {
        //         if (progressEvent.loaded === progressEvent.total) {
        //           this.progress.current++
        //         }
        //
        //         this.progress.files[`file`] =
        //           (progressEvent.loaded * 100) / progressEvent.total
        //         let totalPercent = this.progress.files
        //           ? Object.values(this.progress.files).reduce(
        //             (sum, num) => sum + num,
        //             0
        //           )
        //           : 0
        //         this.progress.percent = parseInt(
        //           Math.round(totalPercent / this.progress.total)
        //         )
        //       }
        //     })
        //   )
        // }

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

                this.fileData.push(fileInfo)

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
      }
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

      if (thumbnailPath === null) {
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

  }

}
</script>

<style scoped>

</style>