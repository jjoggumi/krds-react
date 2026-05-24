<template>
  <div>
    <recording-detail-header
        :isAudio="false"
        :isDetail="false"
        :isDownload="false"
        :isSubmit="isSubmitEnable"
        @close="closeLayer"
        @submit="createRecording"
    />
    <div class="record-recording__content mode2">
      <div class="record-recording__content__mode2">
        <div class="top">
          <div class="title">
            <h2>{{ title }}</h2>
          </div>
          <div class="input-wrap">
            <div class="search">
              <label class="search" @click="labelClickStop">
                <div :class="{
                                    empty: !(targets.length > 0)
                                }" class="add-list"
                     @click.stop="protect($event)"
                >
                  <p
                      v-for="target of targets"
                      :key="target.targetId"
                  >
                    {{ `${target.studentNo}. ${target.targetName}` }}
                    <button @click.stop="deleteTarget(target.targetId, $event)">
                      <i class="bh-icon-close-8"></i>
                    </button>
                  </p>
                  <input
                      ref="studentName"
                      :placeholder="isInputTargets"
                      type="text"
                      @blur="autoInputFocusChange(false, $event)"
                      @focus="autoInputFocusChange(true, $event)"
                      @input="changeStudentName"
                      @keyup.enter="onEnter"
                  />
                </div>
                <i :class="{
                                    empty: !(targets.length > 0)
                                }"
                   class="bh-icon-user-fill-24 user"
                ></i>
                <span :class="{
                                    empty: !(targets.length > 0)
                                }" class="btn-r"
                      @click="toggleAddTargetButton"
                >
                                <span v-click-outside="closeTargetLayer"
                                      class="bh-icon-plus-20-gray cursor-pointer add">
                                    <!-- 학생 추가 레이어 팝업 -->
                                    <add-target-layer-popup
                                        v-if="isOpenTargetLayer"
                                        :selected="selectedIds"
                                        :students="filterStudents"
                                        @close="closeAddTargetLayer"
                                    />
                                </span>
                            </span>
                <!-- 인풋 박스 포커스시 나오는 목록 -->
                <target-auto-complete-list
                    v-if="isFocus"
                    :students="filterStudents"
                    @close="closeAutoComplete"
                />
              </label>
            </div>
            <div class="title">
              <label>
                <input
                    ref="description"
                    contenteditable="true"
                    placeholder="설명 추가"
                    @input="checkLength($event, 50)"
                >
                <i class="bh-icon-desc-add-24 add"></i>
              </label>
            </div>
          </div>
        </div>

        <div
            class="content-wrap"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @dragover="onDragover"
            @drop="onDrop"
        >
          <p v-for="(file, idx) of files"
             :key="file.fileOriginalPath"
             :class="{on: file.fileOriginalPath === selectedFile}"
             class="img-wrap"
          >
            <img :src="file.fileOriginalPath" @click="togglePhoto(file.fileOriginalPath, $event)"/>
            <span class="del" @click="deleteFile(file)">
                        <i class="bh-icon-close-white-18"></i>
                    </span>
            <span v-if="file.fileOriginalPath === selectedFile" class="image-edit"
                  @click="editImages(files, null, idx)"></span>
          </p>
          <div v-if="isUploadAble" class="content-add" @click="openFileExplorer">
            <input
                id="file"
                ref="file"
                accept="image/*"
                multiple
                style="display:none"
                type="file"
                @change="handleFileUpload"
            />
            <p class="default-img">
              <i class="bh-icon-photo-add01"></i>
            </p>
            <span class="title">사진 추가</span>
            <span class="message">사진(최대 10장)을 업로드해주세요.</span>
          </div>
        </div>
      </div>
    </div>
    <confirm-modal
        v-if="confirmModal.isOpen"
        :description="confirmModal.description"
        :isAlert="confirmModal.isAlert"
        :title="confirmModal.title"
        @closeConfirmDialog="closeConfirmModal"
    />
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from 'vuex'
import RecordingDetailHeader from '@/apps/behavior/components/layout/RecordingDetailHeader.vue'
import AddTargetLayerPopup from '@/apps/behavior/components/popup/AddTargetLayerPopup.vue'
import TargetAutoCompleteList from '@/apps/behavior/components/popup/TargetAutoCompleteList.vue'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
import {eventBus} from "@/main";
import {checkAndConvertHEIC} from "@/plugins/utils";
import {mapFields} from "vuex-map-fields";

export default {
  name: 'add-photo-record',
  components: {AddTargetLayerPopup, TargetAutoCompleteList, RecordingDetailHeader, ConfirmModal},
  data() {
    return {
      isDragging: false,
      isOpenTargetLayer: false,
      isFocus: false,
      selectedFile: null,
      files: [],
      targets: [],
      filterStudents: [],
      confirmModal: {
        isOpen: false,
        action: 'exit',
        title: '작성 중인 내용이 있습니다.',
        description: '작성을 중단하시겠습니까?',
        isAlert: false
      }
    }
  },
  computed: {
    ...mapState('storeBehavior', {
      curClassroom: 'curClassroom',
      students: 'students'
    }),
    ...mapState('storeImageEditor', {
      deleteImages: 'deleteImages'
    }),
    ...mapFields([
      'isDimLoading',
    ]),
    classroomId: function () {
      return this.curClassroom.classroomId
    },
    title: function () {
      return `${this.$moment().format('M월 D일')} 사진`
    },
    selectedIds: function () {
      return this.targets.map(t => t.targetId)
    },
    isSubmitEnable: function () {
      return this.files.length > 0
    },
    isUploadAble: function () {
      return this.files.length < 10
    },
    isInputTargets: function () {
      return this.targets.length > 0 ? "" : "학생명 입력"
    }
  },
  methods: {
    ...mapActions('storeBehavior', {
      getClassroomStudents: 'getClassroomStudents',
      addClassroomRecording: 'addClassroomRecording'
    }),
    ...mapMutations('storeBehavior', {
      setIsWritingRecord: 'setIsWritingRecord'
    }),
    ...mapMutations('storeImageEditor', {
      clearDeleteImages: 'clearDeleteImages'
    }),
    ...mapActions('storeImageEditor', {
      openImageEditor: 'openImageEditor',
      changeFilesSort: 'changeFilesSort'
    }),
    protect: function (e) {
      e.preventDefault()
      return false
    },
    labelClickStop: function (e) {
      e.preventDefault()
    },
    togglePhoto: function (id, e) {
      e.preventDefault()
      this.selectedFile = id
    },
    toggleAddTargetButton: function (e) {
      e.preventDefault()
      this.filterStudents = this.students.filter(s => !this.selectedIds.includes(s.studentId))
      if (this.filterStudents.length === 0) {
        this.confirmModal = {
          isOpen: true,
          action: 'alert',
          title: '추가할 학생이 없습니다.',
          description: '',
          isAlert: true
        }
        return
      }
      this.isOpenTargetLayer = !this.isOpenTargetLayer
    },
    closeTargetLayer: function () {
      this.isOpenTargetLayer = false
    },
    autoInputFocusChange: function (val, e) {
      e.preventDefault()
      this.filterStudents = this.students.filter(s => !this.selectedIds.includes(s.studentId))
      this.$refs.studentName.value = ''

      this.isFocus = val
    },
    closeAutoComplete: function (student) {
      this.addTarget([student])
      this.$refs.studentName.blur()
    },
    changeStudentName: function (e) {
      if (e.target.value) {
        this.filterStudents = this.students.filter(
            o => o.studentName.indexOf(e.target.value) > -1 && !this.selectedIds.includes(o.studentId)
        )
      } else {
        this.filterStudents = this.students.filter(s => !this.selectedIds.includes(s.studentId))
      }
    },
    onEnter: function () {
      if (this.filterStudents.length < 2) {
        if (this.filterStudents.length === 1) {
          this.addTarget(this.filterStudents)
        }
        this.$refs.studentName.blur()
      }
    },
    closeAddTargetLayer: async function (data) {
      if (data) {
        this.targets = [...this.targets, ...data.map(s => {
          return {
            studentNo: s.studentNo,
            targetId: s.studentId,
            targetName: s.studentName,
            targetPhoto: s.studentCharacter,
            targetType: 'STUDENT'
          }
        })]
      }
      this.isOpenTargetLayer = false
    },
    addTarget: async function (students) {
      this.targets = [
        ...this.targets,
        ...students.map(s => {
          return {
            studentNo: s.studentNo,
            targetId: s.studentId,
            targetName: s.studentName,
            targetPhoto: s.studentCharacter,
            targetType: 'STUDENT'
          }
        })
      ]
    },
    deleteTarget: async function (id, e) {
      e.preventDefault()
      this.targets = this.targets.filter(t => t.targetId !== id)
    },
    checkLength(e, length) {
      if (e.target.value.length > length) {
        e.target.value = e.target.value.substr(0, length)
      }
    },
    deleteFile: async function (file) {
      await this.$hiClass.multipart.delete({...file})
      this.files = this.files.filter(f => f.fileOriginalPath !== file.fileOriginalPath)
    },
    openFileExplorer: function () {
      this.$refs.file.click()
    },
    onDragEnter(event) {
      event.preventDefault()
      event.stopPropagation()
      this.isDragging = true
    },
    onDragLeave(event) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = false
    },
    onDragover(event) {
      event.preventDefault()
      if (event.dataTransfer.files) {
        this.isDragging = true
      }
    },
    async onDrop(event) {
      event.preventDefault()
      event.stopPropagation()

      const files = []
      this.isDimLoading = true
      for (const file of Array.from(event.dataTransfer.files)) {
        files.push(await checkAndConvertHEIC(file))
      }
      this.isDimLoading = false

      if (files.length === 0) {
        this.isDragging = false
        return false
      }

      if (this.validateFiles(files)) {
        await this.uploadFiles(files)
      }
    },
    validateFiles(files) {

      this.$refs.file.value = '';
      const fileCount = this.files.length + files.length
      if (fileCount > 10) {
        this.confirmModal = {
          isOpen: true,
          action: 'file',
          title: '사진은 10개까지 선택 가능합니다.',
          description: null,
          isAlert: true
        }
        return false
      }
      const imageExtensions = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'bmp']

      const isImage = files.every(f => f.type.startsWith('image'))
      const isExtensions = files.every(f => f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase())
      const maxFileSize = this.$store.state.upload.chat.etc.size * 1024 * 1024

      const isImageExtensions = files.every(f => imageExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))

      if (!isImage || !isExtensions || !isImageExtensions) {
        this.confirmModal = {
          isOpen: true,
          action: 'file',
          title: this.$t("chat.upload.invalid.alert"),
          description: null,
          isAlert: true
        }
        return false
      }

      if (files.filter(f => f.size > maxFileSize).length > 0) {
        const fileUploadErrorMessage = this.$t(
            `file.upload.error.size.over.etc`,
            {
              sizeStr: this.$store.state.upload.class.etc.sizeStr
            }
        )
        this.confirmModal = {
          isOpen: true,
          action: 'file',
          title: fileUploadErrorMessage,
          description: null,
          isAlert: true
        }
        return false
      }
      return true
    },
    handleFileUpload: async function () {
      const files = []

      this.isDimLoading = true
      for (const file of Array.from(this.$refs.file.files)) {
        files.push(await checkAndConvertHEIC(file))
      }
      this.isDimLoading = false

      if (this.validateFiles(files)) {
        await this.editImages(this.files, files, this.files.length)
      }

    },
    async getConvertImageFiles(files) {
      return await Promise.all(
          files.map(file => {
            return this.$hiClass.getConvertedFile(file)
          })
      )
    },
    async uploadFiles(uploadFileList, fileInfos = []) {
      const screen = this
      const url = window.URL || window.webkitURL
      const sizeInfo = []
      const postApis = []
      uploadFileList.forEach(file => {
        const img = new Image()
        img.onload = async function () {
          sizeInfo.push({width: img.width, height: img.height})
          postApis.push(screen.$hiClass.multipart.upload(file))
          url.revokeObjectURL(img.src)

          if (uploadFileList.length === sizeInfo.length) {
            let isAllSuccess = true
            await Promise.allSettled(postApis)
                .then(res => {
                  for (let i = 0; i < res.length; i++) {
                    if (res[i].status === 'fulfilled' && res[i].value.status === 200) {
                      const item = res[i].value.data
                      const fileInfo = {
                        fileCategory: 'PHOTO',
                        fileName: item.filename.replace(/^.*[\\/]/, ''),
                        fileContentType: item.contentType,
                        fileSize: item.size,
                        fileOriginalPath: item._links.original.href,
                        fileWidth: sizeInfo[i].width,
                        fileHeight: sizeInfo[i].height
                      }
                      if (fileInfos.length > 0) {
                        const targetIdx = screen.files.findIndex(file => file === fileInfos[i])
                        if (targetIdx > -1) {
                          screen.files.splice(targetIdx, 1, fileInfo)
                        }
                      } else {
                        screen.files.push(fileInfo)
                      }
                    }
                    isAllSuccess = res.every(r => r.status === 'fulfilled')
                  }
                })
                .finally(() => {
                  if (!isAllSuccess) {
                    screen.files = screen.files.filter(file => file.fileOriginalPath)
                    screen.$hiClass.alert('일부 사진이 업로드에 실패했습니다.<br>확인 후 다시 업로드해 주세요.')
                  }
                })
          }
        }
        img.src = url.createObjectURL(file)
      })
    },
    async editImages(uploadedFiles, inputFiles, targetIdx) {
      await this.openImageEditor({
        uploadedFiles,
        inputFiles,
        imageLimitCount: 10,
        componentKey: 'add-photo-record',
        targetIdx,
        parentComponent: 'behaviorPhotoRecord'
      })
    },
    createRecording: async function () {
      const params = {
        classroomId: this.classroomId,
        recordType: 'PHOTO',
        recordContent: this.$refs.description.value,
        files: this.files,
        targets: {
          studentIds: this.targets.map(t => t.targetId).filter(v => v !== null)
        }
      }
      const res = await this.addClassroomRecording(params)

      this.$emit(
          'change',
          {
            action: 'add',
            fileCount: res.files.length,
            fileThumbnailPath: res.files[0].fileOriginalPath,
            message: res.recordContent ? res.recordContent : this.title,
            recordId: res.recordId,
            recordTimestamp: res.recordTimestamp,
            recordType: res.recordType,
            targetNames: this.targets.map(t => t.targetName)
          }
      )
    },
    closeLayer: function () {
      if (this.isSubmitEnable) {
        this.confirmModal = {
          isOpen: true,
          action: 'exit',
          title: '작성 중인 내용이 있습니다.',
          description: '작성을 중단하시겠습니까?',
          isAlert: false
        }
      } else {
        this.$emit('close')
      }
    },
    closeConfirmModal: async function (isConfirm) {
      this.confirmModal.isOpen = false

      if (isConfirm) {
        if (this.confirmModal.action === 'exit') {
          this.setIsWritingRecord(false)
          this.$emit('close')
        }
      }
    }
  },
  async created() {
    await this.getClassroomStudents({classroomId: this.classroomId, isHidden: false})
    this.$nextTick(() => this.openFileExplorer())
  },
  mounted() {
    eventBus.$on(`imageEditor-add-photo-record`, async uploadFileList => {
      // 편집기에서 삭제된 파일 삭제
      if (this.deleteImages.length > 0) {
        this.deleteImages.forEach(deleteImage => {
          const targetIdx = this.files.findIndex(file => deleteImage.fileOriginalPath === file.fileOriginalPath)
          if (targetIdx > -1) {
            this.deleteFile(this.files[targetIdx])
          }
        })
        this.clearDeleteImages()
      }

      // 신규 파일 추가
      let files = []
      let fileInfos = []
      uploadFileList.forEach((uploadFile, idx) => {
        const addFile = uploadFileList[idx]
        let fileInfo = {
          fileContentType: addFile.file.type,
          fileName: addFile.file.name.replace(/^.*[\\/]/, ''),
          fileSize: addFile.file.size
        }

        const targetIdx = this.files.findIndex(file => file.fileOriginalPath === addFile.fileOriginalPath)
        if (targetIdx > -1) {
          this.files.splice(targetIdx, 1, fileInfo)
        } else {
          this.files.push(fileInfo)
        }

        files.push(uploadFile.file)
        fileInfos.push(fileInfo)
      })

      // 정렬
      const sortedArr = await this.changeFilesSort(this.files)
      if (sortedArr.length > 0) {
        this.files = sortedArr
      }

      // 업로드
      if (files.length > 0) {
        await this.uploadFiles(files, fileInfos)
      }
    })
  },
  beforeDestroy() {
    eventBus.$off(`imageEditor-add-photo-record`)
  }
}
</script>

<style>

</style>