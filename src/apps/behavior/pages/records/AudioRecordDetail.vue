<template>
<div>    
    <recording-detail-header 
        :isDetail="true" 
        :isDownload="isDownloadAble"
        :isAudio="true"
        :isSubmit="false"
        @download="fileDownload"
        @delete="openConfirmModal"
        @close="closeLayer" 
    />         
    <div class="record-recording__content">
        <div class="record-recording__content__audio">
            <div class="top">
                <div class="title">
                    <h2>{{ title }}</h2>
                </div>
                <!-- 대상 추가 -->
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
                </div>
                <!-- 여기까지 대상 추가 -->
            </div>

            <div class="audio">
                <div class="audio__top">
                    <span class="title">{{ fileName }}</span>
                    <button @click="addBookmark"><i class="bh-icon-bookmark-add-fill-24"></i>북마크 추가</button>
                </div>

                <div 
                    ref="progress" 
                    class="audio__progress" 
                    @click="clickProgress"
                    @mousemove="onMouseMove"
                    @mouseout="onMouseOut"
                >
                    <span ref="progressBar" class="progressing" :style="{ width : barWidth }"></span>
                    <p 
                        v-for="bookmark of bookmarks"
                        :key="bookmark.bookmarkId"
                        class="pointer" 
                        :style="{ left: getMarkPosition(bookmark.bookmarkTime) }"
                        @click.stop="clickBookmark(bookmark.bookmarkTime)"
                    >
                        <span class="bh-icon-bookmark-rhombus mark">
                            <span class="mark-time">{{ `${getTime(bookmark.bookmarkTime)} 북마크`}}</span>
                        </span>
                    </p>
                    <p 
                        v-if="timeTooltip.isShow" 
                        class="over" 
                        style="transform: translateX(-50%);"
                        :style="{left: timeTooltip.position}"
                    >
                        {{timeTooltip.time}}
                    </p>
                </div>

                <div class="audio__btn">
                    <button @click="secondChange(false)" class="prev"></button>
                    <button class="control" :class="{play: !isTimerPlaying, pause: isTimerPlaying}" @click="play"></button>
                    <button @click="secondChange(true)" class="next"></button>
                    <span class="time">
                        <em>{{ currentTime }}</em> / {{ duration }}
                    </span>
                </div>
            </div>

            <div class="list-wrap">
                <div class="menu">
                    <span class="on">북마크 목록</span>
                </div>
                <div class="list">
                    <ul v-if="isBookmarks">
                        <!-- 북마크 목록 아이템 -->
                        <bookmark-list-item
                            v-for="bookmark of bookmarks"
                            :key="bookmark.bookmarkId"
                            :bookmark="bookmark"
                            @move="clickBookmark"
                            @change="changeBookmarkMemo"
                            @delete="removeBookmark"
                        />
                    </ul>
                    <div v-else class="nodata">
                        <i class="bh-icon-warning-circle-fill-52"></i>
                        <span>중요한 위치에 북마크를 추가하세요.</span>  
                    </div> 
                </div>
            </div>
            <!-- 토스트 메시지 -->
            <div v-if="toastMessage" class="bookmark-toast">{{ toastMessage }}</div>
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
import {mapActions, mapState} from 'vuex'
import RecordingDetailHeader from '@/apps/behavior/components/layout/RecordingDetailHeader.vue'
import AddTargetLayerPopup from '@/apps/behavior/components/popup/AddTargetLayerPopup.vue'
import TargetAutoCompleteList from '@/apps/behavior/components/popup/TargetAutoCompleteList.vue'
import BookmarkListItem from '@/apps/behavior/components/list/BookmarkListItem.vue'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
export default {
    name: 'audio-record-detail',
    components: {BookmarkListItem, AddTargetLayerPopup, TargetAutoCompleteList, RecordingDetailHeader, ConfirmModal},
    props: {
        detail: Object
    },
    data() {
        return {
            audio: null,
            barWidth: null,
            duration: null,
            currentTime: null,
            isTimerPlaying: false,
            isOpenTargetLayer: false,
            isFocus: false,
            toastMessage: '',
            timeTooltip: {
                isShow: false,
                position: '0%',
                time: ''
            },
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
        fileName: function() {
            return this.record.files[0].fileName
        },
        bookmarks: function() {
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            return this.record.files[0].bookmarks.sort((pre, next) => {
                return pre.bookmarkTime - next.bookmarkTime
            })
        },
        title: function() {
            return `${this.$moment(this.record.recordTimestamp).format('M월 D일')} 녹음 ${this.duration}`
        },
        selectedIds: function() {
            return this.targets.map(t => t.targetId)
        },
        isDownloadAble: function() {
            return this.record.files.length > 0
        },
        isBookmarks: function() {
            return this.bookmarks.length > 0
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
                    if(this.isTimerPlaying) {
                        this.audio.pause()
                        this.isTimerPlaying = false
                    }
                    this.record = newVal
                    this.targets = newVal.targets || []
                    this.barWidth = 0
                    this.audio.currentTime = 0
                    this.audio.src = this.record.files[0].fileOriginalPath
                }
            }
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            addRecoringAudioBookmark: 'addRecoringAudioBookmark',
            patchRecoringAudioBookmark: 'patchRecoringAudioBookmark',
            deleteRecoringAudioBookmark: 'deleteRecoringAudioBookmark',
            getClassroomStudents: 'getClassroomStudents',
            addRecoringTargets: 'addRecoringTargets',
            deleteRecordingTargets: 'deleteRecordingTargets',
            patchRecordingTargets: 'patchRecordingTargets',
            deleteClassroomRecording: 'deleteClassroomRecording'
        }),
        protect: function(e) {
            e.preventDefault()
            return false
        },
        labelClickStop: function(e) {
            e.preventDefault()
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
        addBookmark: async function() {
            if(this.toastMessage) {
                this.toastMessage = null
            }

            const bookmarkTime = Math.floor(this.audio.currentTime  * 1000)
            const params = {
                classroomId : this.classroomId,
                recordId : this.record.recordId,
                bookmarkTime,
            }
            const bookmark = await this.addRecoringAudioBookmark(params)
            this.record.files[0].bookmarks.push(bookmark)
            this.toastMessage = `${this.getTime(bookmarkTime)} 북마크 되었습니다.`
        },
        changeBookmarkMemo: async function(params) {
            if(this.toastMessage) {
                this.toastMessage = null
            }

            const request = {
                classroomId: this.classroomId,
                recordId: this.record.recordId,
                bookmarkId: params.bookmarkId,
                bookmarkMemo: params.bookmarkMemo
            }
            const bookmark = await this.patchRecoringAudioBookmark(request)
            const updateBookmark = this.bookmarks
            const updateIdx = updateBookmark.findIndex(b => b.bookmarkId === params.bookmarkId)
            updateBookmark[updateIdx] = bookmark
            const updateFiles = this.record.files
            updateFiles[0].bookmarks = updateBookmark
            this.record = {...this.record, files: updateFiles}
            this.toastMessage = `${this.getTime(bookmark.bookmarkTime)} 북마크 메모가 변경되었습니다.`
        },
        removeBookmark: async function(bookmark) {
            if(this.toastMessage) {
                this.toastMessage = null
            }

            const request = {
                classroomId: this.classroomId,
                recordId: this.record.recordId,
                bookmarkId: bookmark.bookmarkId
            }

            await this.deleteRecoringAudioBookmark(request)
            const updateFiles = this.record.files
            updateFiles[0].bookmarks = this.bookmarks.filter(b => b.bookmarkId !== bookmark.bookmarkId)
            this.record = {...this.record, files: updateFiles}
            this.toastMessage = `${this.getTime(bookmark.bookmarkTime)} 북마크 삭제되었습니다.`
        },
        play: function() {
            if (this.audio.paused) {
                this.audio.play()
                this.isTimerPlaying = true
            } else {
                this.audio.pause()
                this.isTimerPlaying = false
            }
        },
        secondChange: function(isNext) {
            if(this.isTimerPlaying) {
                this.audio.pause()
            }
            const currentTime = this.audio.currentTime
            const change = isNext ? currentTime + 5 : currentTime -5
            const maxduration = this.audio.duration;
            let percentage = (100 / maxduration) * change
            
            if (percentage > 100) {
                percentage = 100
            }
            if (percentage < 0) {
                percentage = 0
            }
            this.barWidth = `${percentage}%`
            this.audio.currentTime = (maxduration * percentage) / 100
            if(this.isTimerPlaying) {
                this.audio.play()
            }
        },
        getMarkPosition: function(sec) {
            const left = (100 / this.audio.duration) * (sec / 1000)
            
            return sec === 0 ?  0 : `calc(${left}% - 10px)`
        },
        generateTime: function() {
            const width = (100 / this.audio.duration) * this.audio.currentTime
            this.barWidth = `${width}%`
            requestAnimationFrame(this.generateTime)
            const durmin = `${Math.floor(this.audio.duration / 60)}`.padStart(2, '0')
            const dursec = `${Math.floor(this.audio.duration - durmin * 60)}`.padStart(2, '0')
            const curmin = `${Math.floor(this.audio.currentTime / 60)}`.padStart(2, '0')
            const cursec = `${Math.floor(this.audio.currentTime - curmin * 60)}`.padStart(2, '0')
            
            this.duration = `${durmin}:${dursec}`
            this.currentTime = `${curmin}:${cursec}`
        },
        clickBookmark: function(sec) {
            if(this.isTimerPlaying) {
                this.audio.pause()
            }
            const maxduration = this.audio.duration;
            let percentage = (100 / maxduration) * (sec / 1000)
            
            if (percentage > 100) {
                percentage = 100
            }
            if (percentage < 0) {
                percentage = 0
            }
            this.barWidth = `${percentage}%`
            this.audio.currentTime = (maxduration * percentage) / 100
            
            if(this.isTimerPlaying) {
                this.audio.play()
            }
        },
        changePlayPosition: function(position) {
            let progress = this.$refs.progress
            let maxduration = this.audio.duration;
            let percentage = position / progress.offsetWidth * 100
            
            if (percentage > 100) {
                percentage = 100
            }

            if (percentage < 0) {
                percentage = 0
            }

            this.barWidth = `${percentage}%`
            this.audio.currentTime = (maxduration * percentage) / 100
            
            if(this.isTimerPlaying) {
                this.audio.play()
            }
        },
        clickProgress: function(e) {
            if(this.isTimerPlaying) {
                this.audio.pause()
            }
            this.changePlayPosition(e.offsetX)
        },
        getTime: function(mili) {
            const seconds = Math.floor(mili / 1000)
            const min = `${parseInt((seconds % 3600) / 60)}`.padStart(2, '0')
            const sec = `${seconds % 60}`.padStart(2, '0')
            return `${min}:${sec}`
        },
        onMouseMove: function(e) {
            if(e.target.classList.contains("mark") === false && e.target.classList.contains("pointer") === false) {
                let progress = this.$refs.progress
                let maxduration = this.audio.duration;
                let percentage = e.offsetX / progress.offsetWidth * 100

                const time = this.getTime((maxduration * percentage) / 100 * 1000)
                const position = `${percentage}%`
                this.timeTooltip = {
                    isShow: true,
                    position,
                    time
                }
            }
        },
        onMouseOut: function() {
            this.timeTooltip = {
                isShow: false,
                position: '0%',                
                time: ''
            }
        },
        fileDownload: function() {
            const file = this.record.files[0]
            this.$comn.download(file.fileOriginalPath, file.fileName)
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
        this.audio = new Audio(this.record.files[0].fileOriginalPath)
        
        const vm = this;
        this.audio.ontimeupdate = function() {
            vm.generateTime()
        }
        this.audio.onloadedmetadata = function() {
            vm.generateTime()
        }
        this.audio.onended = function() {
            vm.isTimerPlaying = false
        }
        
        await this.getClassroomStudents({classroomId: this.classroomId, isHidden: false})
        await this.$nextTick()
    }
}
</script>

<style scoped>
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-recording .record-recording__content .record-recording__content__audio .list-wrap .list .nodata {
    position: absolute;
    top: 150px;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    display: -webkit-box;
    display: -ms-flexbox;
    display: inline-flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
}
</style>