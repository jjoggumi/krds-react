<template>
<div>
    <recording-detail-header 
        :isDetail="false" 
        :isDownload="false"
        :isAudio="false"
        :isSubmit="isSubmitEnable"
        @submit="createRecording" 
        @close="closeLayer" 
    />    
    <div class="record-recording__content mode2">
        <div class="record-recording__content__mode2">
            <div class="top">
                <div class="title">
                    <h2>{{ title }}</h2>
                </div>
                <div class="input-wrap">
                    <div class="search">
                        <label class="search">
                            <div class="add-list" @click.stop="protect($event)"
                                :class="{
                                    empty: !(targets.length > 0)
                                }"
                            >
                                <p
                                    v-for="target of targets"
                                    :key="target.targetId"
                                >
                                    {{ `${target.studentNo}. ${target.targetName}`}}
                                    <button @click.stop="deleteTarget(target.targetId, $event)">
                                        <i class="bh-icon-close-8"></i>
                                    </button>
                                </p>
                            </div>
                            <input 
                                type="text" 
                                placeholder="학생명 입력"
                                ref="studentName"
                                @input="changeStudentName"
                                @blur="autoInputFocusChange(false, $event)"
                                @focus="autoInputFocusChange(true, $event)" 
                                @keyup.enter="onEnter"
                            />
                            <i class="bh-icon-user-fill-24 user"></i>
                            <span @click="toggleAddTargetButton" class="btn-r" 
                                :class="{
                                    empty: !(targets.length > 0)
                                }"
                            >
                                <span class="bh-icon-plus-20-gray cursor-pointer add" v-click-outside="closeTargetLayer">
                                    <!-- 학생 추가 레이어 팝업 -->
                                    <add-target-layer-popup
                                        v-if="isOpenTargetLayer"
                                        :students="students"
                                        :selected="selectedIds"
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
                    <div class="memo">
                        <label @click="protect($event)">
                            <i class="bh-icon-palette-fill-24 palette"></i>
                            <div class="select">
                                <p @click="changeColor('white', $event)" class="white" :class="getSelectedColor('white')">
                                    <span></span>
                                </p>
                                <p @click="changeColor('yellow', $event)" class="yellow" :class="getSelectedColor('yellow')">
                                    <span></span>
                                </p>
                                <p @click="changeColor('orange', $event)" class="orange" :class="getSelectedColor('orange')">
                                    <span></span>
                                </p>
                                <p @click="changeColor('blue', $event)" class="blue" :class="getSelectedColor('blue')">
                                    <span></span>
                                </p>
                                <p @click="changeColor('pink', $event)" class="pink" :class="getSelectedColor('pink')">
                                    <span></span>
                                </p>
                                <p @click="changeColor('blue_green', $event)" class="blue-green" :class="getSelectedColor('blue_green')">
                                    <span></span>
                                </p>
                                <p @click="changeColor('red', $event)" class="red" :class="getSelectedColor('red')">
                                    <span></span>
                                </p>
                                <p @click="changeColor('purple', $event)" class="purple" :class="getSelectedColor('purple')">
                                    <span></span>
                                </p>
                                <p @click="changeColor('green', $event)" class="green" :class="getSelectedColor('green')">
                                    <span></span>
                                </p>
                                <p @click="changeColor('gray', $event)" class="gray" :class="getSelectedColor('gray')">
                                    <span></span>
                                </p>
                            </div>
                            <span v-if="isUploadAble" class="btn-r">
                                <button @click="openFileExplorer">
                                    <i class="bh-icon-image-20"></i>
                                    사진추가
                                </button>
                            </span>
                        </label>
                        <input
                            type="file"
                            id="file"
                            ref="file"
                            multiple
                            accept="image/*"
                            @change="handleFileUpload"
                            style="display:none"
                        />
                    </div>
                </div>
            </div>

            <div 
                class="content-wrap memo" 
                :class="selectedColor"
                @dragenter="onDragEnter"
                @dragleave="onDragLeave"
                @dragover="onDragover"
                @drop="onDrop"
            >
                <div
                    ref="description" 
                    class="content-text" 
                    contenteditable="true"
                    @input="changeMemo" 
                    placeholder="내용을 입력하세요."    
                >
                </div>
                <p class="img-wrap"
                    v-for="file of files"
                    :key="file.fileOriginalPath"
                    :class="{on: file.fileOriginalPath === selectedFile}"
                >
                    <img @click="togglePhoto(file.fileOriginalPath, $event)" :src="file.fileOriginalPath" />
                    <span @click="deleteFile(file)" class="del">
                        <i class="bh-icon-close-white-18"></i>
                    </span>
                </p>
            </div>
        </div>
    </div>
    <confirm-modal
        v-if="confirmModal.isOpen"
        :title="confirmModal.title"
        :description="confirmModal.description"
        :isAlert="confirmModal.isAlert"
        @closeConfirmDialog="closeConfirmModal"
    />
</div>
</template>

<script>
import {mapActions, mapState} from 'vuex'
import RecordingDetailHeader from '@/apps/behavior/components/layout/RecordingDetailHeader.vue'
import AddTargetLayerPopup from '@/apps/behavior/components/popup/AddTargetLayerPopup.vue'
import TargetAutoCompleteList from '@/apps/behavior/components/popup/TargetAutoCompleteList.vue'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
export default {
    name: 'add-memo-record',
    components: {AddTargetLayerPopup, TargetAutoCompleteList, RecordingDetailHeader, ConfirmModal},
    data() {
        return {
            isDragging: false,
            isOpenTargetLayer: false,
            isFocus: false,
            selectedFile: null,
            memo: '',
            files: [],
            targets: [],
            recordStyle: 'WHITE',
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
        classroomId: function() {
            return this.curClassroom.classroomId
        },
        title: function() {
            return `${this.$moment().format('M월 DD일')} 메모`
        },
        selectedIds: function() {
            return this.targets.map(t => t.targetId)
        },
        selectedColor: function () {
            return this.recordStyle.toLowerCase()
                .replace(/_/g, '-')
                .replace(/([A-Z])/g, '-$1')
                .replace(/^-/, '')
        },
        isSubmitEnable: function () {
            return this.files.length > 0 || this.memo.length > 0
        },
        isUploadAble: function() {
            return this.files.length < 10
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            getClassroomStudents: 'getClassroomStudents',
            addClassroomRecording: 'addClassroomRecording'
        }),
        protect: function(e) {
            e.preventDefault()
            return false
        },
        changeMemo: function() {
            this.memo = this.$refs.description.innerText.trim()
        },
        togglePhoto: function(id, e) {
            e.preventDefault()
            this.selectedFile = id
        },
        toggleAddTargetButton: function(e) {
            e.preventDefault()
            this.isOpenTargetLayer = !this.isOpenTargetLayer
        },
        closeTargetLayer: function() {
            this.isOpenTargetLayer = false
        },
        autoInputFocusChange: function(val, e) {
            e.preventDefault()
            this.filterStudents = this.students
            this.$refs.studentName.value = ''
            
            this.isFocus = val
        },
        closeAutoComplete: function(student) {
            this.addTarget([student])
            this.$refs.studentName.blur()
        },
        changeStudentName: function(e) {
            if(e.target.value) {
                this.filterStudents = this.students.filter(o => o.studentName.indexOf(e.target.value) > -1)
            } else {
                this.filterStudents = this.students
            }
        },
        onEnter: function() {
            if(this.filterStudents.length < 2) {
                if(this.filterStudents.length === 1) {
                    this.addTarget(this.filterStudents)
                }
                this.$refs.studentName.blur()
            }
        },
        closeAddTargetLayer: async function(data) {
            if(data) {
                this.targets = data.map(s => {
                    return {
                        studentNo: s.studentNo,
                        targetId: s.studentId,
                        targetName: s.studentName,
                        targetPhoto: s.studentCharacter,
                        targetType: 'STUDENT'
                    }
                })
            }
            this.isOpenTargetLayer = false
        },
        addTarget: async function(students) {
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
        deleteTarget: async function(id, e) {
            e.preventDefault()
            this.targets = this.targets.filter(t => t.targetId !== id)
        },
        changeColor: async function(color, e) {
            e.preventDefault()
            this.recordStyle = color.toUpperCase()
        },
        getSelectedColor: function(color) {
            return this.recordStyle.toLowerCase() === color ? 'on' : ''
        },
        deleteFile: async function(file) {
            await this.$hiClass.multipart.delete(file)
            this.files = this.files.filter(f => f.fileOriginalPath !== file.fileOriginalPath)
        },
        openFileExplorer: function() {
            this.$refs.file.click()
        },
        onDragEnter (event) {
            event.preventDefault()
            event.stopPropagation()
            this.isDragging = true
        },
        onDragLeave (event) {
            event.preventDefault();
            event.stopPropagation();
            this.isDragging = false
        },
        onDragover (event) {
            event.preventDefault()
            if (event.dataTransfer.files) {
                this.isDragging = true
            }
        },
        async onDrop (event) {
            event.preventDefault()
            event.stopPropagation()

            const files = Array.from(event.dataTransfer.files)

            if(files.length === 0) {
                this.isDragging = false
                return false
            }

            if(this.validateFiles(files)) {
                await this.uploadFiles(files)
            }
        },
        validateFiles(files) {
            this.$refs.file.value = ''

            const fileCount = this.files.length + files.length
            if(fileCount > 10) {
                this.confirmModal = {
                    isOpen: true,
                    action: 'file',
                    title: '사진은 10개까지 선택 가능합니다.',
                    description: null,
                    isAlert: true
                }
                this.isDragging = false
                return false
            }
            const imageExtensions = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'bmp']
            
            const isImage = files.every(f => f.type.startsWith('image'))
            const isExtensions = files.every(f => f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase())
            const maxFileSize = this.$store.state.upload.chat.etc.size * 1024 * 1024
            
            const isImageExtensions = files.every(f => imageExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))
                                
            if(!isImage || !isExtensions || !isImageExtensions) {
                this.confirmModal = {
                    isOpen: true,
                    action: 'file',
                    title: this.$t("chat.upload.invalid.alert"),
                    description: null,
                    isAlert: true
                }
                this.isDragging = false
                return false
            }

            if(files.filter(f => f.size > maxFileSize).length > 0) {
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
                this.isDragging = false
                return false
            }

            return true
        },
        handleFileUpload: async function() {
            const files = Array.from(this.$refs.file.files)
            
            if(this.validateFiles(files)) {
                await this.uploadFiles(files)
            }
        },
        async getConvertImageFiles(files) {
            return await Promise.all(
                files.map(file => {
                    return this.$hiClass.getConvertedFile(file)
                })
            )
        },
        async uploadFiles(files) {
            const screen = this
            const url = window.URL || window.webkitURL
            const uploadFileList = await this.getConvertImageFiles(files)
            const sizeInfo = []
            const postApis = []
            uploadFileList.forEach(file => {
                const img = new Image()
                img.onload = async function() {
                    sizeInfo.push({width: img.width, height: img.height})
                    postApis.push(screen.$hiClass.multipart.upload(file))
                    url.revokeObjectURL(img.src)

                    if(uploadFileList.length == sizeInfo.length) {
                        const respones = await Promise.all(postApis)
                        const uploadFileInfomation = respones.map((res, i) => {
                            const item = res.data
                            return {
                                fileCategory: 'PHOTO',
                                fileName: item.filename.replace(/^.*[\\/]/, ''),
                                fileContentType: item.contentType,
                                fileSize: item.size,
                                fileOriginalPath: item._links.original.href,
                                fileWidth : sizeInfo[i].width,
                                fileHeight : sizeInfo[i].height
                            }
                        })
                        screen.files = [...screen.files, ...uploadFileInfomation]
                    }
                }
                img.src = url.createObjectURL(file)
            })
        },
        createRecording: async function() {
            const params = {
                classroomId: this.classroomId,
                recordType: 'MEMO',
                recordContent: this.$refs.description.innerText,
                recordStyle: this.recordStyle,
                files: this.files,
                targets: {
                    studentIds: this.targets.map(t => t.targetId)
                }
            }
            const res = await this.addClassroomRecording(params)
            this.$emit(
                'change',
                {
                    action: 'add',
                    fileCount: res.files.length,
                    fileThumbnailPath: this.files.length > 0 ? this.files[0].fileOriginalPath : '',
                    message: res.recordContent ? res.recordContent : this.title,
                    recordId: res.recordId,
                    recordTimestamp: res.recordTimestamp,
                    recordType: res.recordType,
                    targetNames: this.targets.map(t => t.targetName),
                    recordStyle: res.recordStyle
                } 
            )
        },
        closeLayer: function() {
            if(this.isSubmitEnable) {
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
        closeConfirmModal: async function(isConfirm) {
            this.confirmModal.isOpen = false
            
            if(isConfirm) {
                if(this.confirmModal.action === 'exit') {
                    this.$emit('close')
                }
            }
        }
    },
    async created() {
        await this.getClassroomStudents({classroomId: this.classroomId, isHidden: false})
        await this.$nextTick()
    }
}
</script>

<style>

</style>