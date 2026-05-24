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
                            <span @click.prevent="toggleAddTargetButton" class="btn-r"
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
                                type="text"
                                @keyup="changeDescription"
                                @input="checkLength($event, 50)"
                                v-model="record.recordContent" 
                                contenteditable="true" 
                                maxlength="50"
                                placeholder="설명 추가"
                            />
                            <i class="bh-icon-desc-add-24 add"></i>
                        </label>
                    </div>
                </div>
            </div>

            <div class="content-wrap">
                <p class="img-wrap"
                    v-for="(file, index) of files"
                    :key="file.fileId"
                    @click="openViewer(index)"
                >
                    <img :src="file.fileOriginalPath" />
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
import jszip from 'jszip'
import { saveAs } from 'file-saver'
import axios from 'axios'
import {mapActions, mapState, mapMutations} from 'vuex'
import RecordingDetailHeader from '@/apps/behavior/components/layout/RecordingDetailHeader.vue'
import AddTargetLayerPopup from '@/apps/behavior/components/popup/AddTargetLayerPopup.vue'
import TargetAutoCompleteList from '@/apps/behavior/components/popup/TargetAutoCompleteList.vue'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
export default {
    name: 'photo-record-detail',
    components: {AddTargetLayerPopup, TargetAutoCompleteList, RecordingDetailHeader, ConfirmModal},
    props: {
        detail: Object
    },
    data() {
        return {
            isOpenTargetLayer: false,
            isFocus: false,
            record: {},
            targets: [],
            filterStudents: [],
            confirmModal: {
                isOpen: false,
                title: '기록을 삭제하시겠습니까?',
                action: 'delete',
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
            return `${this.$moment(this.record.recordTimestamp).format('M월 D일')} 사진`
        },
        files: function() {
            return this.record.files || []
        },
        selectedIds: function() {
            return this.targets.map(t => t.targetId)
        },
        isDownloadAble: function() {
            return this.files.length > 0
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
        },
        isInputTargets: function() {
            return this.targets.length > 0 ? "" : "학생명 입력"
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
            deleteClassroomRecording: 'deleteClassroomRecording'
        }),
        ...mapMutations('storeBehavior', {
            setBehaviorViewerOptions: 'setBehaviorViewerOptions'
        }),
        protect: function(e) {
            e.preventDefault()
            return false
        },
        labelClickStop: function(e) {
            e.preventDefault()
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
            this.filterStudents = this.students.filter(s => !this.selectedIds.includes(s.studentId))
            if(this.filterStudents.length === 0) {
                this.confirmModal = {
                    isOpen: true,
                    title: '추가할 학생이 없습니다.',
                    action: 'alert',
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
                const params = {
                    classroomId: this.classroomId,
                    recordId: this.record.recordId,
                    studentIds: [...this.selectedIds, ...data.map(s => s.studentId)]
                }
                await this.patchRecordingTargets(params)
                this.targets = [...this.targets, ...data.map(s => {
                    return {
                        studentNo: s.studentNo,
                        targetId: s.studentId,
                        targetName: s.studentName,
                        targetPhoto: s.studentCharacter,
                        studentPhoto: s.studentPhoto,
                        targetType: 'STUDENT'
                    }
                })]
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
                        studentPhoto: s.studentPhoto,
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
        checkLength(e, length) {
            if (e.target.value.length > length) {
                e.target.value = e.target.value.substr(0, length)
                this.record.recordContent = e.target.value.substr(0, length)
            }
        },
        changeDescription: debounce(async function() {
            const params = {
                classroomId: this.classroomId,
                recordId: this.record.recordId,
                recordContent: this.$refs.description.value
            }
            const decription = await this.patchRecordingDescription(params)
            this.$emit('change', {action: 'message', id: this.record.recordId, message: decription.message})
        }, 500),
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
                title: '기록을 삭제하시겠습니까?',
                action: 'delete',
                isAlert: false
            }
        },
        closeConfirmModal: function(isConfirm) {
            this.confirmModal.isOpen = false
            if(isConfirm && this.confirmModal.action === 'delete') {
                this.deleteRecording()
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
    }
}
</script>

<style>

</style>