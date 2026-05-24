<!--
@File(Method): ClazzApplicationFormUpload.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 학교 양식 신청서 > 사용중인 양식 > 작성하기 > 증빙서류
@Modified: 2024-11-19 - #69550 디자인 시스템 버튼 컴포넌트 적용
-->
<template>
  <li>
    <div class="title">{{ title }}</div>
    <div class="text">
      <div
        class="new-upload-file-wrap"
        v-for="(item, index) of fileData"
        :key="item.fileOriginalPath"
      >
        <div class="attaching-file">
          <span
            @click="fileOpen(item, index)"
          >
            {{ item.fileName }}
          </span>
          <!-- #69550 디자인 시스템 버튼 적용 -->
          <HiButton class="delete-btn" v-if="!readonly" size="sm" color="link" @click="fileDelete(item)" title="파일삭제"></HiButton>
        </div>
      </div>

      <!-- 파일 업로드 로딩 -->
      <div
        v-if="visible.fileUploadLoading"
        class="loading-infinite-scroll-wrap"
      >
        <div class="icon"></div>
      </div>
      <!-- // 파일 업로드 로딩 -->

      <input
        v-if="!readonly"
        type="file"
        ref="attach"
        @change="upload"
        multiple
        style="display:none"
      />
      <!-- #69550 디자인 시스템 버튼 / 아이콘 적용 -->
      <HiButton v-if="!readonly" class="ml-10" size="sm" color="primary" outline @click="upload(null)">
        <HiIcon name="ico-plus2" color="primary" size="14"></HiIcon> 파일추가
      </HiButton>
    </div>
  </li>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";

export default {
  name: 'clazz-application-form-upload',
  props: {
    files: {
      type: Array
    },
    param: {
      type: Object
    },
    title: {
      type: String,
      default() {
        return '증빙서류'
      }
    },
    readonly: {
      type: Boolean,
      default() {
        return false;
      }
    },
    unusedFiles: {
      type: Array
    },
    formName: {
      type: String
    }
  },
  data() {
    return {
      option: {
        fileMb: 1024 * 1024,
        fileStatus: Object.assign(
          {
            size: null,
            limit: null,
            accept: null
          },
          this.param
        )
      },
      visible: {
        fileUploadLoading: false
      }
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: "CONSTANTS"
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
    inCompatibleExtensions() {
      return this.$store.state.inCompatibleExtensions || []
    }
  },
  created() {
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
    async upload(e) {
      if (this.visible.fileUploadLoading) return

      if (e === null) {
        this.$refs.attach.value = ''
        this.$refs.attach.click()
      } else {
        const files = Array.from(e.target.files || e.dataTransfer.files)

        const isNotAllowExtensions = this.$store.state.isNotAllowExtensions

        if(files.some(f => isNotAllowExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))) {
          this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
          return;
        }

        if (this.option.fileStatus.limit) {
          if (
            files.length + this.fileData.length >
            this.option.fileStatus.limit
          ) {
            this.$hiClass.alert(`파일 추가는 최대 ${this.option.fileStatus.limit}개 까지 첨부 가능합니다.`)
            return
          }
        }

        let isChk = true
        const postApi = []
        for (let i = 0; i < files.length; i++) {
          if (this.option.fileStatus.size) {
            let maxSize = this.option.fileStatus.size * this.option.fileMb
            if (files[i].size > maxSize) {
              alert(
                `최대 ${this.option.fileStatus.size}MB 까지 허용 가능합니다.`
              )
              isChk = false
              i = files.length
            }
          }

          if (this.option.fileStatus.accept) {
            if (
              !(
                Array.isArray(this.option.fileStatus.accept) &&
                this.option.fileStatus.accept.includes(files[i].type)
              )
            ) {
              alert(
                `${this.option.fileStatus.accept.join(
                  ','
                )} 확장자만 등록 가능 합니다.`
              )
              isChk = false
              i = files.length
            }
          }

          // 미지원 파일확장자 체크
          const extension = this.$comn.split(files[i].name, '.')
          if (this.isInCompatibleExtensions(extension)) return false
          // -- 미지원 파일확장자 체크

          if (isChk) {
            // 이미지일 경우 업로드 전 리사이즈 처리 추가
            const convertedFile = await this.$hiClass.getConvertedFile(files[i])

            postApi.push(this.$hiClass.multipart.upload(convertedFile))
          }
        }

        if (isChk) {
          this.visible.fileUploadLoading = true
          this.$emit('fileUploadAct')
          this.fileUpload(postApi)
        }
      }
    },
    fileUpload(postApi, fileInfos = []) {
      let isAllSuccess = true
      Promise.allSettled(postApi)
          .then(res => {
            res.forEach((item, idx) => {
              if (item.status === 'fulfilled' && item.value.status === 200) {
                item = item.value.data

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

                if (fileThumbnailPath !== null) {
                  fileInfo.fileThumbnailPath = fileThumbnailPath
                }

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
            })
          })
          .catch(err => {
            this.$log.debug(this.$options.name, ' upload() error => ', err)
          })
          .finally(async () => {
            this.$refs.attach.value = ''
            if (!isAllSuccess) {
              this.fileData = this.fileData.filter(file => file.fileOriginalPath)
              this.$hiClass.alert('일부 파일이 업로드에 실패했습니다.<br>확인 후 다시 업로드해 주세요.')
            }
            this.visible.fileUploadLoading = false
            this.$emit('fileUploadAct')
          })
    },
    fileDelete(file) {
      this.unusedFiles.push(file)
      this.fileData = this.fileData.filter(item => {
        return item.fileOriginalPath !== file.fileOriginalPath
      })
    },
    async fileDownload(file) {
      if (!this.isBusy) {
        this.isBusy = true

        const fileDownload = file.fileOriginalPath
        const fileName = file.fileName

        await this.$comn.download(fileDownload, fileName)

        this.isBusy = false
      }
    },
    fileOpen(file, i) {
      if (file.fileContentType.startsWith('image')) {
        const uploadedImageFiles = this.fileData.filter(file => file.fileContentType.startsWith('image'))
        const idx = uploadedImageFiles.findIndex(uploadedFile => uploadedFile.fileOriginalPath === file.fileOriginalPath)

        if (this.readonly) {
          this.$store.commit('setImageView', {
            isOpen: true,
            items: uploadedImageFiles,
            index: idx || 0,
            post: { postType: this.formName }
          })
        } else {
          this.editImages(uploadedImageFiles, null, idx)
        }
      } else if (file.fileContentType.startsWith('video')) {
        const uploadedVideoFiles = this.fileData.filter(file => file.fileContentType.startsWith('video'))
        const idx = uploadedVideoFiles.findIndex(uploadedFile => uploadedFile.fileOriginalPath === file.fileOriginalPath)

        if (this.readonly) {
          if (file.fileTranscodePath) {
            this.$store.commit('setImageView', {
              isOpen: true,
              items: uploadedVideoFiles,
              index: idx || 0,
              post: { postType: this.formName }
            })
          } else {
            this.$hiClass.alert('동영상 인코딩 중입니다.<br/>재생까지 수 분 이상이 소요될 수 있습니다.', 'warning')
          }
        }
      } else {
        this.$store.commit('setDocView', {
          isOpen: true,
          item: file
          })
      }
    },
    isInCompatibleExtensions(extension) {
      if (this.inCompatibleExtensions.includes(extension)) {
        alert(`미지원하는 파일의 형식 : ${extension}`)
        this.$refs.attach.value = ''
        this.visible.fileUploadLoading = false
        return true
      } else {
        return false
      }
    },
    /*openAttachFile(file) {
      if (this.$comn.isImage([file], true).length > 0) {
        this.$store.commit('setImageView', {
          isOpen: true,
          items: [file],
          index: 0
        })
      } else {
        this.$store.commit('setDocView', {
          isOpen: true,
          item: file
        })
      }
    },*/
    async editImages(uploadedFiles, inputFiles, targetIdx) {
      const docFilesLength = this.fileData.filter(file => !file.fileContentType.startsWith('image')).length
      await this.openImageEditor({
        uploadedFiles,
        inputFiles,
        imageLimitCount: this.option.fileStatus.limit - docFilesLength,
        componentKey: this.$vnode.key,
        targetIdx,
        parentComponent: 'clazzApplicationUpload'
      })
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
      let postApi = []
      let fileInfos = []

      uploadFileList.forEach((uploadFile, idx) => {
        const addFile = uploadFileList[idx]
        let fileInfo = {
          fileContentType: addFile.file.type,
          fileName: addFile.file.name.replace(/^.*[\\/]/, ''),
          fileSize: addFile.file.size
        }

        postApi.push(this.$hiClass.multipart.upload(addFile.file))
        fileInfos.push(fileInfo)

        const targetIdx = this.fileData.findIndex(file => file.fileOriginalPath === addFile.fileOriginalPath)
        if (targetIdx > -1) {
          this.fileData.splice(targetIdx, 1, fileInfo)
        } else {
          this.fileData.push(fileInfo)
        }
      })

      // 정렬
      const sortedArr = await this.changeFilesSort(this.fileData)
      if (sortedArr.length > 0) {
        this.fileData = sortedArr
      }

      // 업로드
      if (postApi.length > 0) {
        this.visible.fileUploadLoading = true
        this.$emit('fileUploadAct')
        this.fileUpload(postApi, fileInfos)
      }
    })
  },
  beforeDestroy() {
    eventBus.$off(`imageEditor-${this.$vnode.key}`)
  }
}
</script>