<!--
@File(Method): ClazzesHomeworkUserUpload.vue
@Author: -
@Date Created: -
@Description: 과제 제출 파일 업로드
@Modified: 2024-10-11 - #68852 영상변환 요청 결과 반영 개선
-->
<template>
  <fragment>
    <input
      type="file"
      ref="fileUpload"
      multiple
      @change="addFile"
      style="display:none"
    />

    <div
      v-if="emptyUploadFiles"
      class="upload-file-wrap"
      @dragover.prevent="onDragOver"
      @dragenter.prevent
      @dragleave.prevent="onDragLeave"
      @drop.prevent="addFile"
      :style="uploadFileWrapStyle"
    >
      <div class="before-upload">
        <div class="file-drag-area-wrap">
          <div class="file-drag-area" @click="addFile(null)"></div>
        </div>
        <p><span class="type">사진, 문서 첨부</span>사진, 문서를 여기 끌어다 놓거나, [+] 버튼을 선택하세요</p>
      </div>
    </div>

    <div
      v-if="existsImageVideoFiles || isUploadingData"
      class="upload-file-wrap"
      @dragover.prevent="onDragOver"
      @dragenter.prevent
      @dragleave.prevent="onDragLeave"
      @drop.prevent="addFile"
      :style="uploadFileWrapStyle"
    >
      <div class="after-upload">
        <div class="attaching-img-wrap">
          <ul>
            <template>
              <li
                v-for="file of imageVideoFiles"
                :key="file.currentId"
              >
                <!-- #68986 과제제출 > 사진 첨부, 삭제 시 수정
                <div
                    class="attaching-img"
                    :class="{'homework-image': file.fileContentType.startsWith('image')}"
                    @click="file.fileContentType.startsWith('image') ? editImages(imageFiles, null, getTargetIdx(file)) : false"
                >
                -->
                <div
                    class="attaching-img"
                >
                  <div
                      class="img-wrap"
                      :class="{'uneditable': !file.fileContentType.startsWith('image')}"
                      @click="file.fileContentType.startsWith('image') ? editImages(imageFiles, null, getTargetIdx(file)) : false"
                  >
                    <img
                        :src="getThumbnailPath(file)"
                        :key="file.currentId"
                        alt
                    />
                  </div>

                  <!-- <button
                      v-if="file.fileContentType.startsWith('video')"
                      class="play-btn"
                  ></button> -->

                  <button
                      class="delete-btn"
                      @click="fileDelete(file)"
                  ></button>
                </div>
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

    <!-- 기타 파일 영역 -->
    <div
      v-if="existsOtherFiles"
      class="upload-file-wrap"
      @dragover.prevent="onDragOver"
      @dragenter.prevent
      @dragleave.prevent="onDragLeave"
      @drop.prevent="addFile"
      :style="uploadFileWrapStyle"
    >
      <div class="after-upload">
        <div class="attaching-file-list-wrap" style="display: block;">
          <div class="attaching-file-list">
            <div
              v-for="otherFile of otherFiles"
              :key="otherFile.currentId"
              class="attaching-file"
            >
              <span>{{ otherFile.fileName }}</span>
              <button
                class="delete-btn"
                @click="fileDelete(otherFile)"
              ></button>
            </div>

            <div
              v-if="!isUploadingData"
              class="file-drag-area-wrap"
            >
              <div class="file-drag-area" @click="addFile(null)"></div>
            </div>

          </div>
        </div>
      </div>
    </div>

  </fragment>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";

export default {
  name: 'hc-clazzes-homework-user-upload',
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
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
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
    },

    existsImageVideoFiles() {
      return this.imageVideoFiles.length > 0
    },
    existsOtherFiles() {
      return this.otherFiles.length > 0
    },
    emptyUploadFiles() {
      return !this.existsImageVideoFiles && !this.existsOtherFiles && !this.isUploadingData
    },
    imageFiles() {
      return this.fileData.filter(file => 
        file.fileContentType &&
        file.fileContentType.startsWith('image') && 
        !file.fileOriginalPath === false
      )
    },
    videoFiles() {
      return this.fileData.filter(file =>
        file.fileContentType &&
        file.fileContentType.startsWith('video') && 
        !file.fileOriginalPath === false
      )
    },
    imageVideoFiles() {
      return this.fileData.filter(file =>
        file.fileContentType &&
        (
          file.fileContentType.startsWith('image') ||
          file.fileContentType.startsWith('video')
        ) && 
        !file.fileOriginalPath === false
      )
    },

    otherFiles() {
      return this.fileData.filter(file =>
        file.fileContentType &&
        !file.fileContentType.startsWith('image') &&
        !file.fileContentType.startsWith('video') && 
        !file.fileOriginalPath === false
      )
    },

    uploadFileWrapStyle() {
      if (this.dragStyle) {
        return {
          backgroundColor: this.dragStyle
        }
      } else {
        return null
      }
    },
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
      this.onDragLeave()

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
              this.$refs.fileUpload.value = ''
              this.$hiClass.alert('지원하지 않는 파일형식입니다.')
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
            const encode = !convertedFile.type.startsWith('video')
            this.progress.total++

            postApi.push(
              this.$hiClass.multipart.upload(convertedFile, {
                onUploadProgress: progressEvent => {
                  if (progressEvent.loaded === progressEvent.total) {
                    this.progress.current++
                  }

                  this.progress.files[`file${i}`] = (progressEvent.loaded * 100) / progressEvent.total
                  let totalPercent = this.progress.files ?
                      Object.values(this.progress.files).reduce((sum, num) => sum + num, 0) :
                      0
                  this.progress.percent = parseInt(Math.round(totalPercent / this.progress.total))
                }
              }, encode)
            )
          }
        } // end for

        if (isChk && !this.isUploadingData && postApi.length > 0) {
          this.fileUpload(postApi)
        } else {
          this.$refs.fileUpload.value = ''
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

                // 완료 후 파일업로드 위치 GA 호출
                this.increaseFileUploadCount({ uploadLocation: this.CONSTANTS.UPLOAD_LOCATION.CLASS })
              }
              isAllSuccess = res.every(r => r.status === 'fulfilled')
            })
          })
          .catch(err => {
            this.$log.debug(this.$options.name, ' upload() error => ', err)
            alert('파일 업로드가 실패되었습니다. 다시 시도해 주세요.')
          })
          .finally(async () => {
            this.$refs.fileUpload.value = ''
            if (!isAllSuccess) {
              this.fileData = this.fileData.filter(file => file.fileOriginalPath)
              this.$hiClass.alert('일부 파일이 업로드에 실패했습니다.<br>확인 후 다시 업로드해 주세요.')
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
    makeFileInfo(item) {
      let fileConvertPath = null
      let fileThumbnailPath = null
      let requestId = null

      try {
        if (item._links.convert && item._links.convert.href)
          fileConvertPath = item._links.convert.href

        if (item._links.thumbnail && item._links.thumbnail.href)
          fileThumbnailPath = item._links.thumbnail.href

        if (item.requestId)
          requestId = item.requestId

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

      if (requestId) {
        fileInfo.requestId = requestId
      }

      return fileInfo
    },
    fileDelete(file) {
      this.unusedFiles.push(file)
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
    },
    getThumbnailPath(file) {
      if (file.fileContentType.startsWith('video'))
        return file.fileThumbnailPath || ''

      return file.fileOriginalPath
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
        imageLimitCount: 50,
        componentKey: this.$vnode.key,
        targetIdx: targetIdx,
        parentComponent: 'clazzHomeworkUpload'
      })
    },
    getTargetIdx(targetFile) {
      const idx = this.imageFiles.findIndex(file => file.fileOriginalPath === targetFile.fileOriginalPath)
      return idx > -1 ? idx : 0
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

      // 신규 파일 추가, api promise
      let postApi = []
      let fileInfos = []

      uploadFileList.forEach((uploadFile, idx) => {
        this.progress.total++
        const addFile = uploadFileList[idx]
        if (addFile) {
          let fileInfo = {
            fileContentType: addFile.file.type,
            fileName: addFile.file.name.replace(/^.*[\\/]/, ''),
            fileSize: addFile.file.size
          }

          postApi.push(
              this.$hiClass.multipart.upload(addFile.file, {
                onUploadProgress: progressEvent => {
                  if (progressEvent.loaded === progressEvent.total) {
                    this.progress.current++
                  }

                  this.progress.files[`file${idx}`] = (progressEvent.loaded * 100) / progressEvent.total
                  let totalPercent = this.progress.files
                      ? Object.values(this.progress.files).reduce((sum, num) => sum + num, 0)
                      : 0
                  this.progress.percent = parseInt(Math.round(totalPercent / this.progress.total))
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
        }
      })

      // 정렬
      const sortedArr = await this.changeFilesSort(this.fileData)
      if (sortedArr.length > 0) {
        this.fileData = sortedArr
      }

      // 업로드
      if (postApi.length > 0) {
        this.fileUpload(postApi, fileInfos)
      }
    })
  },
  beforeDestroy() {
    eventBus.$off(`imageEditor-${this.$vnode.key}`)
  }
}
</script>
