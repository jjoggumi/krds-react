<template>
<div>    
    <recording-detail-header 
        :isDetail="true" 
        :isDownload="isDownloadAble"
        :isAudio="false"
        :isSubmit="false"
        @download="fileDownload"
        @delete="openConfirmModal"
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
                            <i class="bh-icon-user-fill-24 user"
                                :class="{
                                    empty: !(targets.length > 0)
                                }"
                            ></i>
                            <span @click.prevent="toggleAddTargetButton" class="btn-r"
                                :class="{
                                    empty: !(targets.length > 0)
                                }"
                            >
                                <span class="bh-icon-plus-20-gray cursor-pointer add" v-click-outside="closeTargetLayer">
                                    <!-- 학생 추가 레이어 팝업 -->
                                    <add-target-layer-popup
                                        v-if="isOpenTargetLayer"
                                        :students="studentList"
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
                    @input="changeDescription" 
                    @paste="onPaste"
                    class="content-text" 
                    contenteditable="true" 
                    placeholder="내용을 입력하세요."
                    v-html="textContent"    
                >
                </div>
                <p 
                    v-for="(file, index) of files"
                    :key="file.fileId"
                    class="img-wrap"
                    @click="openViewer(index)"
                >
                    <img :src="file.fileOriginalPath" />
                    <span class="del">
                        <i class="bh-icon-close-white-18"></i>
                    </span>
                </p>
            </div>
        </div>
    </div>
    <confirm-modal
        v-if="confirmModal.isOpen"
        :title="confirmModal.title"
        :isAlert="confirmModal.isAlert"
        @closeConfirmDialog="closeConfirmModal"
    />
</div>
</template>

<script>
import { debounce } from 'lodash'
import {mapActions, mapState, mapMutations} from 'vuex'
import RecordingDetailHeader from '@/apps/behavior/components/layout/RecordingDetailHeader.vue'
import AddTargetLayerPopup from '@/apps/behavior/components/popup/AddTargetLayerPopup.vue'
import TargetAutoCompleteList from '@/apps/behavior/components/popup/TargetAutoCompleteList.vue'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
export default {
    name: 'memo-record-detail',
    components: {AddTargetLayerPopup, TargetAutoCompleteList, RecordingDetailHeader, ConfirmModal},
    props: {
        detail: Object
    },
    data() {
        return {
            isDragging: false,
            isOpenTargetLayer: false,
            isFocus: false,
            record: {},
            targets: [],
            filterStudents: [],
            confirmModal: {
                isOpen: false,
                action: 'delete',
                title: '기록을 삭제하시겠습니까?',
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
            return `${this.$moment(this.record.recordTimestamp).format('M월 DD일')} 메모`
        },
        files: function() {
            return this.record.files || []
        },
        textContent: function() {
            return this.record.recordContent.replace(/(?:\r\n|\r|\n)/g, '<br />')
        },
        selectedColor: function () {
            return this.record.recordStyle.toLowerCase()
                .replace(/_/g, '-')
                .replace(/([A-Z])/g, '-$1')
                .replace(/^-/, '')
        },
        selectedIds: function() {
            return this.targets.map(t => t.targetId)
        },
        isDownloadAble: function() {
            return this.files.length > 0
        },
        isUploadAble: function() {
            return this.files.length < 10
        },
        studentList: function() {
            const isNotHiddenIds = this.students.map(s => s.studentId)
            const hiddens = this.targets.filter(h => !isNotHiddenIds.includes(h.targetId))
            const studentList = [...this.students, ...hiddens.map(h => {
                return {
                    checked:false,
                    isHidden:false,
                    studentCharacter: h.targetPhoto,
                    studentId: h.targetId,
                    studentName: h.targetName,
                    studentNo: h.studentNo
                }
            })]
            return studentList.sort((a, b) => a.studentNo - b.studentNo)
        }
    },
    watch: {
        detail: {
            handler: async function (newVal, oldVal) {
                if(newVal && newVal !== oldVal){
                    this.record = newVal
                    this.targets = newVal.targets || []
                }
            }
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            getClassroomStudents: 'getClassroomStudents',
            addRecoringTargets: 'addRecoringTargets',
            deleteRecordingTargets: 'deleteRecordingTargets',
            patchRecordingTargets: 'patchRecordingTargets',
            patchRecordingDescription: 'patchRecordingDescription',
            patchRecordingStyle: 'patchRecordingStyle',
            addRecordingFiles: 'addRecordingFiles',
            deleteClassroomRecording: 'deleteClassroomRecording'
        }),
        ...mapMutations('storeBehavior', {
            setBehaviorViewerOptions: 'setBehaviorViewerOptions'
        }),
        protect: function(e) {
            e.preventDefault()
            return false
        },
        openViewer: function(index) {   
            this.setBehaviorViewerOptions({
                isOpen: true,
                files: this.files.map(f => {
                    return {
                        ...f, 
                        recordId: this.record.recordId,
                        recordContent: this.record.recordContent,
                        recordTimestamp: this.record.recordTimestamp,
                        targets: this.targets
                    }
                }),
                currentIndex: index
            })
        },
        toggleAddTargetButton: function() {
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
                const params = {
                    classroomId: this.classroomId,
                    recordId: this.record.recordId,
                    studentIds: data.map(s => s.studentId)
                }
                await this.patchRecordingTargets(params)
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
            this.$emit(
                'change', 
                {
                    action: 'target',
                    id: this.record.recordId, 
                    targetNames: this.targets.map(t => t.targetName)
                }
            )
            this.isOpenTargetLayer = false
        },
        addTarget: async function(students) {
            const params = {
                classroomId: this.classroomId,
                recordId: this.record.recordId,
                studentIds: students.map(s => s.studentId)
            }
            await this.addRecoringTargets(params)
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
            this.$emit(
                'change', 
                {
                    action: 'target',
                    id: this.record.recordId, 
                    targetNames: this.targets.map(t => t.targetName)
                }
            )
        },
        deleteTarget: async function(id, e) {
            e.preventDefault()
            const params = {
                classroomId: this.classroomId,
                recordId: this.record.recordId,
                studentIds: [id]
            }
            await this.deleteRecordingTargets(params)
            this.targets = this.targets.filter(t => t.targetId !== id)
            this.$emit(
                'change', 
                {
                    action: 'target',
                    id: this.record.recordId, 
                    targetNames: this.targets.map(t => t.targetName)
                }
            )
        },
        onPaste: function(e) {
            e.preventDefault()
            const clipboardData = e.clipboardData || window.clipboardData
            const paste = clipboardData.getData('text')
            
            if(paste) {
                window.document.execCommand('insertHTML', false, paste)
            }
        },
        changeDescription: debounce(async function() {
            const params = {
                classroomId: this.classroomId,
                recordId: this.record.recordId,
                recordContent: this.$refs.description.innerText
            }
            const decription = await this.patchRecordingDescription(params)
            this.record = {...this.record, recordContent: this.$refs.description.innerText}
            this.$emit('change', {action: 'message', id: this.record.recordId, message: decription.message})
        }, 500),
        changeColor: async function(color, e) {
            e.preventDefault()
            const params = {
                classroomId: this.classroomId,
                recordId: this.record.recordId,
                recordStyle: color.toUpperCase()
            }
            await this.patchRecordingStyle(params)
            this.record.recordStyle = color.toUpperCase()
            this.$emit('change', {action: 'style', id: this.record.recordId, recordStyle: this.record.recordStyle})
        },
        getSelectedColor: function(color) {
            return this.record.recordStyle.toLowerCase() === color ? 'on' : ''
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
            this.$refs.file.value = '';
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
                        const params = {
                            classroomId: screen.classroomId,
                            recordId: screen.record.recordId,
                            files: uploadFileInfomation
                        }
                        const addFileInfo = await screen.addRecordingFiles(params)
                        screen.record = {...screen.record, files: [...addFileInfo]}
                        screen.$emit(
                            'change', 
                            {
                                action: 'file', 
                                id: screen.record.recordId,
                                fileCount: addFileInfo.length,
                                fileThumbnailPath: addFileInfo[0].fileOriginalPath
                            }
                        )
                    }
                }
                img.src = url.createObjectURL(file)
            })
        },
        async multiDownload() {
            try {
                this.$store.commit('setIsDimLoading', true)
                
                const zip = new jszip()
                const archiveFileName = `묶음사진_전체저장_${ this.$moment().format('YYYY-MM-DD_HHmmss')}.zip`

                const result = new Promise(async (resolve, reject) => {
                    for (const [index, file] of this.files.entries()) {
                        await axios({
                            method: 'get',
                            url: file.fileOriginalPath,
                            responseType: 'blob',
                            headers: ''
                        })
                        .then(async res => {
                            let blob = new Blob([res.data], {
                                type: 'application/octet-stream'
                            })
                        
                            zip.file(`${index + 1}_${file.fileName}`, blob)

                            if (this.files.length === (index + 1)) {
                                await zip
                                    .generateAsync({ type: 'blob' })
                                    .then(function(blob) {
                                        // 모음 zip 파일 이름
                                        saveAs(blob, archiveFileName)
                                    })
                                    .catch(() => reject(false))
                                    .finally(() => {})
                            }
                        })
                        .catch(() => reject(false))
                    }

                    resolve(true)
                })

                result
                    .then(() => {
                        this.$hiClass.alert('묶음사진 전체저장이 완료되었습니다.', 'success')
                    })
                    .catch(() => {
                        this.$hiClass.alert('묶음사진 전체저장이 실패하였습니다.', 'error')
                    })
                    .finally(() => {
                        this.$store.commit('setIsDimLoading', false)
                    })

            } catch (err) {
                this.$log.debug(`fileDownload() err => `, err)
                this.$store.commit('setIsDimLoading', false)
            }
        },
        fileDownload: function() {
            if(this.files.length > 1) {
                this.multiDownload()
            } else {
                const file = this.files[0]
                this.$comn.download(file.fileOriginalPath, file.fileName)
            }
        },
        openConfirmModal: function() {
            this.confirmModal = {
                isOpen: true,
                action: 'delete',
                title: '기록을 삭제하시겠습니까?',
                isAlert: false
            }
        },
        closeConfirmModal: function(isConfirm) {
            this.confirmModal.isOpen = false
            if(isConfirm) {
                if(this.confirmModal.action === 'delete') {
                    this.deleteRecording()
                }
            }
        },
        deleteRecording: async function() {
            const params = {
                classroomId: this.classroomId,
                recordId: this.record.recordId
            }
            await this.deleteClassroomRecording(params)
            this.$emit('change', {action: 'delete', id: this.record.recordId})
        },
        closeLayer: function() {
            this.$emit('close')
        }
    },
    async created() {
        this.record = this.detail
        this.targets = this.record.targets || []
        
        await this.getClassroomStudents({classroomId: this.classroomId, isHidden: false})
        await this.$nextTick()
    }
}
</script>

<style>

</style>