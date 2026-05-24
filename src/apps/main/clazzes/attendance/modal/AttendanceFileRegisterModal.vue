<!--
@File(Method): AttendanceFileRegisterModal.vue
@Author: -
@Date Created: -
@Description: 
@Modified: 2025-02-07 - #71768 출결 알리기 > 제출내역 > 첨부파일 목록, 등록 팝업 UI 수정   :  Himodal로 변경
-->
<template>
  <HiModal type="type01" size="sm" @close="close" id="attendanceFileRegisterModal">
    <template v-slot:heading>첨부파일 {{ attendanceFileMode === 'update' ? "관리" : "등록" }}</template>
    <template v-slot:content> 
      <confirm-dialog 
        v-if="confirmDialog.isShow"
        :isOtherUse="true"
        :isNeis="true"
        :isAlert="confirmDialog.isAlert" 
        :title="confirmDialog.title" 
        :description="confirmDialog.description"
        @closeConfirmDialog="closeConfirmDialog"
      /> 
      <div class="attendance-model-file">
        <div class="list-wrap">
          <template v-if="!(visibleFiles.length > 0)">
            <div class="attach-info-message" :style="styleInfoMessage">
              첨부하실 파일을 선택해주세요.
              <template v-if="isTeacherUpdate === false">
                <br/>(이미지, 문서 각 3개씩)
              </template>
            </div>
          </template>
          <template v-else>
            <div class="attaching-file-atd" v-for="(file, index) in visibleFiles" :key="`${index}-file`">
              <span class="file-icon"></span>
              <span class="file-text">
                {{ file.name }}
              </span>
              <button class="delete-icon" @click="deleteFile(file)"></button>
            </div>
          </template>
          <div v-if="isUploading" class="loading-infinite-scroll-wrap">
            <div class="icon"></div>
          </div>
        </div>
        <div class="add-wrap">
          <input class="file-hidden" id="file" ref="fileUpload" type="file" @change="fileChange" />
          <button class="btn-input-file" @click="openFile">
            <i class="plus"></i>
            <span>파일추가</span>
          </button>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <HiButton color="line-default" size="lg" @click="close">취소</HiButton>
      <HiButton color="primary" size="lg" :disabled="!isSubmit" @click="submit">{{ isTeacher ? attendanceFileMode === 'update' ? "완료" : "등록" : "제출"}}
      </HiButton>          
    </template>
  </HiModal>
</template>

<script>
import {mapActions, mapState, mapGetters, mapMutations} from 'vuex'
import ConfirmDialog from '@/apps/hitalk/components/popup/ConfirmDialog'

export default {
  name: "attendance-file-register-modal",
  components: {ConfirmDialog},
  props: {
    attendanceId: String,
    clazzMemberRole: String,
    attendanceFileMode: String
  },
  data() {
    return {
      option: {
          fileMb: 1024 * 1024
      },
      progreses: {},
      files: [],
      uploadingFiles: [],
      confirmDialog : {
        isShow: false,
        isAlert: false,
        title: '',
        description: '',
        changeValiable: ''
      },
      isTeacherUpdate: false,
      unusedFiles: []
      // isConfirmed: false
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
    fileList() {
      const preUpload = Object.values(this.progreses)

      return [
      ...this.files.map((f, i) => {
          return {name: f.fileName, type: f.fileContentType, isNew: false, fileOriginalPath: f.fileOriginalPath, seq: f.seq, fileConvertPath: f.fileConvertPath, fileThumbnailPath: f.fileThumbnailPath}}),
      ...preUpload.map((f, i) => {
          return {name: f.fileName, type: f.fileContentType, isNew: false, fileOriginalPath: null, seq: null, fileConvertPath: null, fileThumbnailPath: null}}),
      ...this.uploadingFiles.map((f, i) => {
          return {name: f.fileName, type: f.fileContentType, isNew: true, fileOriginalPath: f.fileOriginalPath, seq: null, fileConvertPath: f.fileConvertPath, fileThumbnailPath: f.fileThumbnailPath}})
      ]
    },
    visibleFiles: function() {
      return this.fileList.filter(f => f.fileOriginalPath)
    },
    isUploading: function() {
      return this.fileList.filter(f => !f.fileOriginalPath).length > 0
    },
    isSubmit: function() {
      return !((this.visibleFiles.length > 0 === false && this.attendanceFileMode !== 'update') || this.isUploading === true)
    },
    isTeacher: function() {
      return ['OWNER', 'MANAGER'].includes(this.clazzMemberRole)
    },
    styleInfoMessage() {
      if(this.isTeacherUpdate === true) {
        return {
          'line-height': '33.75px'
        }
      } else {
        return {
          'line-height': '22.5px'
        }
      }
    },
    uploadedImageFiles() {
      return this.fileList
          .filter(file => file.type.startsWith('image'))
          .map(file => {
            return {
              ...file,
              fileName: file.name
            }
          })
    }
  },
  methods: {
    ...mapActions({
      increaseFileUploadCount: 'increaseFileUploadCount',
    }),
    ...mapActions('storeClazzes',[
      'callAttendanceById',
    ]),
    ...mapMutations('storeImageEditor', {
      clearDeleteImages: 'clearDeleteImages'
    }),
    async getList() {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/attendances/files/${this.attendanceId}`
        })
        
        const list = res.data._embedded.attendanceFiles
        this.files = [...list]
      } catch (err) {
          this.$log.debug('fileRegisterModal getList error => ', err)
      }
    },
    openFile(e) {
      e.preventDefault()
      this.$refs.fileUpload.value = ''
      this.$refs.fileUpload.click()
    },
    async fileChange(e) {
      e.preventDefault()
      const files = e.target.files || e.dataTransfer.files
      const isNotAllowExtensions = this.$store.state.isNotAllowExtensions
      const extension = files[0].name.substring(files[0].name.lastIndexOf('.') + 1, files[0].name.length).toLowerCase()
      
      if(isNotAllowExtensions.includes(extension)) {
        this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
        return;
      }

      if(files[0].type.indexOf('video') !== -1 || files[0].type.indexOf('audio') !== -1) {
          this.$hiClass.alert('비디오, 오디오 파일은 등록할 수 없습니다.')
          return;
      }

      if(this.isTeacherUpdate === true) {
        if(this.fileList.length >= 50) {
            this.$hiClass.alert('최대 50개 까지 가능합니다.')
            return;
        }
      } else {
        if(this.fileList.length === 6) {
            this.$hiClass.alert('첨부파일은 최대 6개까지 첨부하실 수 있습니다.')
            return;
        }
    
        const image = this.fileList.filter(f => f.type.startsWith('image')).length
        const doc = this.fileList.filter(f => !f.type.startsWith('image')).length

        if(files[0].type.startsWith('image')) {
            if(image === 3) {
                this.$hiClass.alert('이미지는 최대 3개까지만 첨부 가능합니다.')
                return;
            }
            if(files[0].size > this.option.fileMb * this.$store.state.upload.class.image.size) {
                const fileUploadErrorMessage = this.$t(
                    'file.upload.error.size.over.image',
                    {
                        sizeStr: this.$store.state.upload.class.image.sizeStr
                    }
                )
                this.$hiClass.alert(fileUploadErrorMessage)
                return;
            }
        }

        if(!files[0].type.startsWith('image')) {
          if(doc === 3) {
              this.$hiClass.alert('문서는 최대 3개까지만 첨부 가능합니다.')
              return;
          }
          if(files[0].size > this.option.fileMb * this.$store.state.upload.class.etc.size) {
              const fileUploadErrorMessage = this.$t(
                  'file.upload.error.size.over.etc',
                  {
                      sizeStr: this.$store.state.upload.class.etc.sizeStr
                  }
              )
              this.$hiClass.alert(fileUploadErrorMessage)
              return;
          }
        }
      }

      const uploadFile = files[0].type.indexOf('image') !== -1
          ? await this.$hiClass.getConvertedFile(files[0])
          : files[0]
      const key = this.$moment().toString()
      this.progreses = {
          ...this.progreses,
          [key]: {fileName: uploadFile.name, fileContentType: uploadFile.type, progress: 0}
      }
      
      this.$hiClass.multipart.upload(uploadFile, {
        onUploadProgress: progressEvent => {
            this.progreses = {
                ...this.progreses,
                [key]: {
                    ...this.progreses[key],
                    progress: Math.round((progressEvent.loaded * 100) / progressEvent.total)
                }
            }
        }
      }).then(result => {
        const uploaded = this.returnFileData(result.data)
        this.uploadingFiles.push(uploaded)
        delete this.progreses[key]
      })

      this.$refs.fileUpload.value = ''
    },
    returnFileData: function(item) {
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

      // 완료 후 파일업로드 위치 GA 호출
      this.increaseFileUploadCount({ uploadLocation: this.CONSTANTS.UPLOAD_LOCATION.CLASS })
      return fileInfo
    },
    getTargetIdx(targetFile) {
      const idx = this.uploadedImageFiles.findIndex(file => file.fileOriginalPath === targetFile.fileOriginalPath)
      return idx > -1 ? idx : 0
    },
    deleteFile(file) {
      if (file.seq) {
        this.unusedFiles.push(file)
        this.files = [...this.files.filter(item => item.seq !== file.seq)]
      } else {
        this.uploadingFiles = [...this.uploadingFiles.filter(item => item.fileOriginalPath !== file.fileOriginalPath)]
        this.$hiClass.multipart.delete(file)
      }
    },
    openConfirmDialolg: function (changeValiable) {
      let title = ''
      let description = ''
      let isAlert = false
      switch(changeValiable) {
          case 'deleted': {
              title = '삭제된 내역입니다.'
              isAlert = true
              break;
          }
          case 'attendanceOff': {
              title = '출결알리기 사용이 OFF 되었습니다.'
              isAlert = true
              break;
          }
      }
      const modal = {
          changeValiable,
          title,
          description,
          isShow: true,
          isAlert
      }
      this.confirmDialog = {...modal}
    },
    closeConfirmDialog(isConfirm) {
      if(isConfirm) {
        this.$emit('fileAddRegister', this.attendanceId)
        this.close()
      }

      this.confirmDialog = {
        isShow: false,
        isAlert: false,
        title: '',
        description: '',
        changeValiable: ''
      }
    },
    async submit() {
      let toastMsg = "첨부 파일 제출을 완료하였습니다."
      if(this.attendanceFileMode === "update") {

        try {
          const res = await this.$axios({
            method: 'PATCH',
            url: `/attendances/files/${this.attendanceId}`,
            data: {
              files: [...this.files, ...this.uploadingFiles]
            }
          })

          toastMsg = "첨부 파일 수정을 완료하였습니다."
        } catch (err) {
          this.$log.debug('file patch submit error => ', err)

          if(err.response.status === 417) {
            this.openConfirmDialolg('attendanceOff')
          } else if(err.response.status === 428) {
            this.openConfirmDialolg('deleted')
          }
          return
        }
      } else {
        try {
          const res = await this.$axios({
            method: 'PUT',
            url: `/attendances/files/${this.attendanceId}`,
            data: {
              files: this.uploadingFiles
            }
          })

          if(this.isTeacher) toastMsg = "첨부 파일 등록을 완료하였습니다."
        } catch (err) {
          this.$log.debug('file put submit error => ', err)

          if(err.response.status === 417) {
            this.openConfirmDialolg('attendanceOff')
          } else if(err.response.status === 428) {
            this.openConfirmDialolg('deleted')
          }
          return
        }
      }

      this.deleteUnusedFiles()
      
      this.$emit('fileAddRegister', this.attendanceId)
      this.close()

      this.$toasted.clear()
      const options = { duration: 5000 }
      this.$toasted.show(toastMsg, options)
    },
    close() {
      this.$emit("openFileRegister")
    },
    deleteUnusedFiles() {
      let deleteApi = []
      this.unusedFiles.forEach(file => {
        deleteApi.push(this.$hiClass.multipart.delete(file))
      })
      Promise.allSettled(deleteApi)
    },
  },
  mounted() {
    if(this.attendanceFileMode === "update") {
      this.getList()
      this.isTeacherUpdate = true
      // this.getItem()
    }
  }
}
</script>

<style lang="scss" scoped>
.hi-modal-common {
  ::v-deep .modal__layer {
    max-width: 440px;
  }
}
.file-hidden {
  display: none;
}

.updateConfirmed {
  line-height: 33.75;
}
#attendanceFileRegisterModal {
  background: rgba(0,0,0,0.7);  
  .attendance-model-file{  
    background: #FAFAFA;
  }
  .modal-cont-wrap {
    overflow-y: auto;
  }
  .modal-cont {
    height: auto;
    min-height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>