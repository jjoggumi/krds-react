<template>
<div>
    <recording-detail-header 
        :isDetail="false" 
        :isDownload="false"
        :isSubmit="isSubmitEnable"
        :isAudio="false"
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
                        <label class="search" @click="labelClickStop">
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
                                <input 
                                    type="text" 
                                    :placeholder="isInputTargets"
                                    ref="studentName"
                                    @input="changeStudentName"
                                    @blur="autoInputFocusChange(false, $event)"
                                    @focus="autoInputFocusChange(true, $event)" 
                                    @keyup.enter="onEnter"
                                />
                            </div>
                            <i class="bh-icon-user-fill-24 user"
                                :class="{
                                    empty: !(targets.length > 0)
                                }"
                            ></i>
                            <span @click="toggleAddTargetButton" class="btn-r"
                                :class="{
                                    empty: !(targets.length > 0)
                                }"
                            >
                                <span class="bh-icon-plus-20-gray cursor-pointer add" v-click-outside="closeTargetLayer">
                                    <!-- 학생 추가 레이어 팝업 -->
                                    <add-target-layer-popup
                                        v-if="isOpenTargetLayer"
                                        :students="filterStudents"
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
                    <div class="title">
                        <label>
                            <input 
                                ref="description"
                                contenteditable="true" 
                                @input="checkLength($event, 50)"
                                placeholder="설명 추가"
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
                <p 
                    class="video-wrap"
                    v-for="file of files"
                    :key="file.fileOriginalPath"
                    :class="{on: file.fileOriginalPath === selectedFile}"
                >
                    <video @click="toggleVideo(file.fileOriginalPath, $event)" controls="true">
                        <source :src="file.fileOriginalPath" :type="file.fileContentType">
                    </video>
                    <span @click="deleteFile(file)" class="del">
                        <i class="bh-icon-close-white-18"></i>
                    </span>
                </p>
                <div v-if="!isSubmitEnable" class="content-add" @click="openFileExplorer">
                    <input
                        type="file"
                        id="file"
                        ref="file"
                        accept=".mp4, .webm, .ogg, .ogv"
                        @change="handleFileUpload"
                        style="display:none"
                    />
                    <p class="default-img">
                        <i class="bh-icon-video-add01"></i>
                    </p>
                    <span class="title">동영상 추가</span>
                    <span class="message">동영상을 업로드해주세요.</span>
                </div>
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
import {mapActions, mapState, mapMutations} from 'vuex'
import RecordingDetailHeader from '@/apps/behavior/components/layout/RecordingDetailHeader.vue'
import AddTargetLayerPopup from '@/apps/behavior/components/popup/AddTargetLayerPopup.vue'
import TargetAutoCompleteList from '@/apps/behavior/components/popup/TargetAutoCompleteList.vue'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
export default {
    name: 'add-video-record',
    components: {AddTargetLayerPopup, TargetAutoCompleteList, RecordingDetailHeader, ConfirmModal},
    data() {
        return {
            isUploadedCount: 0,
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
        classroomId: function() {
            return this.curClassroom.classroomId
        },
        title: function() {
            return `${this.$moment().format('M월 D일')} 동영상`
        },
        selectedIds: function() {
            return this.targets.map(t => t.targetId)
        },
        isSubmitEnable: function() {
            return this.files.length > 0
        },
        isInputTargets: function() {
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
        protect: function(e) {
            e.preventDefault()
            return false
        },
        labelClickStop: function(e) {
            e.preventDefault()
        },
        toggleVideo: function(id, e) {
            e.preventDefault()
            this.selectedFile = id
        },
        toggleAddTargetButton: function(e) {
            e.preventDefault()
            this.filterStudents = this.students.filter(s => !this.selectedIds.includes(s.studentId))
            if(this.filterStudents.length === 0) {
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
        closeTargetLayer: function() {
            this.isOpenTargetLayer = false
        },
        autoInputFocusChange: function(val, e) {
            e.preventDefault()
            this.filterStudents = this.students.filter(s => !this.selectedIds.includes(s.studentId))
            this.$refs.studentName.value = ''
            
            this.isFocus = val
        },
        closeAutoComplete: function(student) {
            this.addTarget([student])
            this.$refs.studentName.blur()
        },
        changeStudentName: function(e) {
            if(e.target.value) {
                this.filterStudents = this.students.filter(
                    o => o.studentName.indexOf(e.target.value) > -1 && !this.selectedIds.includes(o.studentId)
                )
            } else {
                this.filterStudents = this.students.filter(s => !this.selectedIds.includes(s.studentId))
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
        checkLength(e, length) {
            if (e.target.value.length > length) {
                e.target.value = e.target.value.substr(0, length)
            }
        },
        deleteFile: async function(file) {
            await this.$hiClass.multipart.delete(file)
            this.files = this.files.filter(f => f.fileOriginalPath !== file.fileOriginalPath)
            this.isUploadedCount = 0
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

            if(this.files.length > 0) {
                this.confirmModal = {
                    isOpen: true,
                    action: 'file',
                    title: '동영상추가는 최대 1개 까지 가능합니다.',
                    description: null,
                    isAlert: true
                }
                this.isDragging = false
                return false
            }

            const files = Array.from(event.dataTransfer.files)

            if(files.length === 0) {
                this.isDragging = false
                return false;
            }

            if(this.validateFiles(files)) {
                await this.uploadFiles(files)
            }
        },
        handleFileUpload: async function() {
            const files = Array.from(this.$refs.file.files)
        
            if(this.validateFiles(files)) {
                await this.uploadFiles(files)
            }
        },
        validateFiles(files) {
            this.$refs.file.value = ''
            //const videoExtensions = this.$store.state.videoExtensions
            const videoExtensions = ['mp4', 'webm', 'ogg', 'ogv']
            const isVideo = files.every(f => f.type.startsWith('video'))
            const isExtensions = files.every(f => f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase())
            const maxFileSize = this.$store.state.upload.chat.video.size * 1024 * 1024
            
            const isVideoExtensions = files.every(f => videoExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))

            if(!isVideo || !isExtensions || !isVideoExtensions) {
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
                    `file.upload.error.size.over.video`,
                    {
                    sizeStr: this.$store.state.upload.class.video.sizeStr
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
        async uploadFiles(files) {
            const screen = this
            const url = window.URL || window.webkitURL
            const video = document.createElement('video')
            video.preload = 'metadata'
            video.onloadedmetadata = async function() {
                if(screen.isUploadedCount > 0) {
                    screen.confirmModal = {
                        isOpen: true,
                        action: 'file',
                        title: '동영상추가는 최대 1개 까지 가능합니다.',
                        description: null,
                        isAlert: true
                    }
                    return false
                }
                screen.isUploadedCount = screen.isUploadedCount + 1
                url.revokeObjectURL(video.src)
                var duration = Math.floor(video.duration)
                
                const response = await screen.$hiClass.multipart.upload(files[0])
                const item = response.data
                const add = {
                    fileCategory: 'VIDEO',
                    fileName: item.filename.replace(/^.*[\\/]/, ''),
                    fileContentType: item.contentType,
                    fileSize: item.size,
                    fileOriginalPath: item._links.original.href,
                    filePlayTime: duration
                }
                screen.files.push(add)
                url.revokeObjectURL(video.src)
            }
            video.src = url.createObjectURL(files[0])
        },
        createRecording: async function() {
            const params = {
                classroomId: this.classroomId,
                recordType: 'VIDEO',
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
                    fileThumbnailPath: null,
                    message: res.recordContent ? res.recordContent : this.title,
                    recordId: res.recordId,
                    recordTimestamp: res.recordTimestamp,
                    recordType: res.recordType,
                    targetNames: this.targets.map(t => t.targetName)
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
                    this.setIsWritingRecord(false)
                    this.$emit('close')
                }
            }
        }
    },
    async created() {
        await this.getClassroomStudents({classroomId: this.classroomId, isHidden: false})
        this.$nextTick(() => this.openFileExplorer())
    }
}
</script>

<style>

</style>