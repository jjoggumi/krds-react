<!--
@File(Method): Records.vue
@Author: -
@Date Created: -
@Description: 학급기록 > 행동기록
@Modified: 2024-10-18 - #69171 [WEB] 학급기록 > 행동기록 기록 유형 중 녹음 버튼 히든
-->
<template>
    <div class="behavior-wrapper__body__content">
        <div class="record">
            <!-- 좌측 영역 -->
            <div class="record-list">
                <!-- 행동 기록 검색 필터 영역 -->
                <recordings-header 
                    @search="getBehaviorRecordings" 
                    :isGet="isRefresh"
                    :classroomId="classroomId" 
                />                
                <!-- 행동기록 목록 영역 -->
                <div ref="recordingListArea" class="record-list__list">
                    <div class="info">
                        <p class="count">
                            <span v-if="params.keywordString" class="keyword">{{ `‘${params.keywordString}’` }}</span>
                            <span>{{ totalElements }}</span>
                        </p>
                        <p class="menu">
                            <span v-if="isVisibleFileView" class="cursor-pointer" @click="changeCardViewMode">
                                <i :class="{'bh-icon-filter-grid-20': !isFiles, 'bh-icon-filter-list-20': isFiles}"></i>
                                {{ isFiles ? '리스트 보기' : '파일 모아보기' }}
                            </span>
                            <span 
                                @click="toggleSorting" 
                                v-click-outside="closeSortingBox"
                                class="cursor-pointer" 
                                style="position: relative;"
                            >
                                <i class="bh-icon-drawnup-20"></i>{{ isRegistration ? '오래된 순' : '최근 기록 순' }}
                                <span v-if="isOpenSort" class="sort-box">
                                    <span :class="{on: !isRegistration}" @click.prevent="toggleSortingItem('latest')">최근 기록 순</span>
                                    <span :class="{on: isRegistration}" @click.prevent="toggleSortingItem('registration')">오래된 순</span>
                                </span>
                            </span>
                        </p>
                    </div>
                    <!-- 목록 카드 -->
                    <template v-if="!isFiles">
                        <template v-if="isRecordings">
                            <div 
                                class="card-group"
                                v-for="group of recordGroupDates"
                                :key="group"
                            > 
                                <div class="card-group__date">
                                    <span>{{getRecordGroupTitle(group)}}</span>
                                </div>
                                <div class="card-group__list">
                                    <recording-card 
                                        v-for="record of recordGroupData[group]"
                                        :key="record.recordId"
                                        :classroomId="classroomId"
                                        :addNewId="addNewId"
                                        :recording="record"
                                        :selectedId="selectedRecordingId"
                                        :keyword="params.keyword"
                                        @click="toggleRecordingItem(record.recordId)" 
                                    />
                                </div>
                            </div>
                        </template>
                        <div v-else class="nodata-bg">
                            <div class="nodata">
                                <i class="bh-icon-warning-circle-fill-52"></i>
                                <span>{{ noDataText }}</span>  
                            </div>
                        </div>
                    </template>
                    <!-- 목록 파일 모아보기 -->
                    <template v-else>
                        <div v-if="fileGroupDates.length !== 0" class="photo-wrap">
                            <div class="top">
                                <input :disabled="this.recordingFiles.length === 0" :checked="isFilesAllChecked" type="checkbox" id="photo-check-all" @click="clickAllFilesCheck"/>
                                <label for="photo-check-all">
                                    <span>전체선택</span>
                                </label>
                                <div class="btn-wrap">
                                    <button
                                        class="file-download"
                                        :disabled="!isActiveFileFunctions"
                                        :class="{act: isActiveFileFunctions}"
                                        @click="fileDownload"
                                    >
                                        파일 다운로드
                                    </button>
                                </div>
                            </div>
                            <div class="photo-wrap__content">
                                <file-group-item
                                    v-for="(name, index) of fileGroupDates"
                                    :key="`${name}-${index}`"
                                    :groupName="name"
                                    :items="fileGroupData[name]"
                                    :selected="selectedFileIds"
                                    :classroomId="classroomId"
                                    @toggleItem="clickFileItem"
                                    @toggleGroup="clickGroupItem"
                                />
                            </div>
                        </div>
                        <div v-else class="nodata-bg">
                            <div class="nodata">
                                <i class="bh-icon-warning-circle-fill-52"></i>
                                <span>{{ noDataText }}</span>  
                            </div>
                        </div>
                    </template>
                    <div ref="scrollListAccess"></div>
                    <!-- 플로팅 버튼 -->
                    <div class="list-float-wrap-bottom-right">
                        <div ref="scrollTop" class="scroll-top" @click="moveScrollTop">
                            <i class="bh-icon-arrowup-32"></i>
                        </div>

                        <div 
                            class="card-add add cursor-pointer" 
                            :class="{add : !isFloatingMenuView, del: isFloatingMenuView}"
                            @click="viewCardAddList"
                            v-click-outside="closeFloating"
                        >
                            <i 
                                class="cursor-pointer" 
                                :class="{'bh-icon-plus-transparent-24': !isFloatingMenuView, 'bh-icon-close-32': isFloatingMenuView}">
                            </i>
                            <div v-if="isFloatingMenuView" style="display: block;" class="card-add-list">
                                <ul>
                                    <li @click="addPage('ADD_PHOTO')"><i class="bh-icon-image-fill-52"></i><span>사진</span></li>
                                    <li @click="addPage('ADD_VIDEO')"><i class="bh-icon-video-fill-52"></i><span>동영상</span></li>
                                    <!-- #69171 <li @click="addPage('ADD_AUDIO')"><i class="bh-icon-record-fill-52"></i><span>녹음</span></li> -->
                                    <li @click="openWhoWriteModal(true)"><i class="bh-icon-mn-whorecord-52"></i><span>누가기록</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 우측 영역 (메뉴 아이콘) -->
            <div class="record-write">
                <div class="title">
                    <h2>기록 작성하기</h2>
                </div>

                <div class="write">
                    <div class="write-card photo cursor-pointer" @click="addPage('ADD_PHOTO')">
                        <div class="top-l" >
                            <i class="bh-icon-image-fill-52"></i>
                            <span>사진</span>
                        </div>
                        <div class="bottom-r">
                            <i class="bh-icon-plus-28"></i>
                        </div>
                    </div>
                    <div class="write-card video cursor-pointer" @click="addPage('ADD_VIDEO')">
                        <div class="top-l">
                            <i class="bh-icon-video-fill-52"></i>
                            <span>동영상</span>
                        </div>
                        <div class="bottom-r">
                            <i class="bh-icon-plus-28"></i>
                        </div>
                    </div>
                    <!-- #69171 <div class="write-card record cursor-pointer" @click="addPage('ADD_AUDIO')">
                        <div class="top-l">
                            <i class="bh-icon-record-fill-52"></i>
                            <span>녹음</span>
                        </div>
                        <div class="bottom-r">
                            <i class="bh-icon-plus-28"></i>
                        </div>
                    </div> -->
                    <div class="write-card who cursor-pointer" @click="openWhoWriteModal(true)">
                        <div class="top-l">
                            <i class="bh-icon-mn-whorecord-52"></i>
                            <span>누가기록</span>
                        </div>
                        <div class="bottom-r">
                            <i class="bh-icon-plus-28"></i>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 우측영역 (레어이 팝업: 상세, 등록) --> 
            <div class="record-recording" :class="{open: isContentLayerOpen}">
                <!-- 우측 레이어 팝업 바디 부분 -->
                <!-- 기록 등록 페이지들 -->
                <add-photo-record 
                    v-if="isContentLayerOpen && screen === 'ADD_PHOTO'" 
                    @change="changeCardList"
                    @close="closeContentLayer" 
                />
                <add-memo-record 
                    v-if="isContentLayerOpen && screen === 'ADD_MEMO'" 
                    @change="changeCardList" 
                    @close="closeContentLayer" 
                />
                <add-video-record 
                    v-if="isContentLayerOpen && screen === 'ADD_VIDEO'" 
                    @change="changeCardList" 
                    @close="closeContentLayer" 
                />
                
                <!-- 기록 상세 페이지들 -->
                <photo-record-detail 
                    v-if="isContentLayerOpen && screen === 'PHOTO'"
                    :detail="recording"
                    @change="changeCardList"
                    @close="closeContentLayer" 
                />
                <video-record-detail
                    v-if="isContentLayerOpen && screen === 'VIDEO'"
                    :detail="recording"
                    @change="changeCardList"
                    @close="closeContentLayer" 
                />
                <audio-record-detail 
                    v-if="isContentLayerOpen && screen === 'AUDIO'" 
                    :detail="recording"
                    @change="changeCardList"
                    @close="closeContentLayer" 
                />
                <memo-record-detail
                    v-if="isContentLayerOpen && screen === 'MEMO'"
                    :detail="recording"
                    @change="changeCardList"
                    @close="closeContentLayer" 
                />
            </div>
        </div>
        <behavior-viewer 
            v-if="behaviorViewerOptions.isOpen"
            @delete="deleteRecording"
        />
        <confirm-modal
            v-if="confirmModal.isOpen"
            :title="confirmModal.title"
            :description="confirmModal.description"
            :isAlert="confirmModal.isAlert"
            @closeConfirmDialog="closeConfirmModal"
        />
        <behavior-file-modal 
            v-if="isFileAllSelectedModal"
            :progress="page"
            @close="closeFileSelectModal"
        />
        <who-write-modal 
            v-if="isOpenWhoWriteModal"
            :mode="mode"
            :item="recording"
            :studentList="studentList"
            @close="closeWhoWriteModal"
            @closeSubmit="whoWriteFinish"
        />  
    </div>
</template>

<script>
import {mapActions, mapState, mapMutations} from 'vuex'
import axios from 'axios'
import jszip from 'jszip'
import RecordingsHeader from '@/apps/behavior/components/layout/RecordingsHeader.vue'
import RecordingCard from '@/apps/behavior/components/list/RecordingCard.vue'
import FileGroupItem from '@/apps/behavior/components/list/FileGroupItem.vue'
import AudioRecordDetail from './AudioRecordDetail.vue'
import PhotoRecordDetail from './PhotoRecordDetail.vue'
import VideoRecordDetail from './VideoRecordDetail.vue'
import MemoRecordDetail from './MemoRecordDetail.vue'
import AddPhotoRecord from './AddPhotoRecord.vue'
import AddVideoRecord from './AddVideoRecord.vue'
import AddMemoRecord from './AddMemoRecord.vue'
import BehaviorViewer from '@/apps/behavior/components/popup/BehaviorViewer.vue'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
import BehaviorFileModal from '@/apps/behavior/components/popup/BehaviorFileModal.vue'
import WhoWriteModal from '@/apps/behavior/components/popup/WhoWriteModal.vue'
export default {
    name: 'records',
    components: {
        RecordingsHeader, 
        RecordingCard, 
        AudioRecordDetail, 
        PhotoRecordDetail,
        VideoRecordDetail,
        MemoRecordDetail,
        AddPhotoRecord,
        AddVideoRecord,
        AddMemoRecord,
        FileGroupItem,
        BehaviorViewer,
        ConfirmModal,
        BehaviorFileModal,
        WhoWriteModal
    },
    data() {
        return {
            isRefresh: false,
            isOpenWhoWriteModal: false,
            isFileAllSelectedModal: false,
            isOpenSort: false,
            isContentLayerOpen: false,
            selectedRecordingId: null,
            isFloatingMenuView: false,
            isFiles: false,
            screen: null,
            recording: null,
            recordings: [],
            recordingFiles: [],
            selectedFileIds: [],
            studentList: [],
            params: {
                action: 'get',
                sort: 'latest',
                recordType: ['PHOTO', 'VIDEO', 'AUDIO', 'NUGA']
            },
            page: {},
            obsRef: null,
            observer: null,
            confirmModal: {
                isOpen: false,
                action: 'exit',
                title: '작성 중인 내용이 있습니다.',
                description: '작성을 중단하시겠습니까?',
                isAlert: false,
                id: null
            },
            axiosCancel: null,
            addNewId: ""
        }
    },
    computed: {
        ...mapState('storeBehavior', {
            curClassroom: 'curClassroom',
            behaviorViewerOptions: 'behaviorViewerOptions',
            isWritingRecord: 'isWritingRecord'
        }),
        classroomId: function() {
            return this.curClassroom.classroomId
        },
        totalElements: function() {
            return this.params.action === 'get' ? `총 ${this.page.totalElements}개` : `검색결과 ${this.page.totalElements}건`
        },
        fileGroupDates: function() {
            return this.params.sort === 'latest' 
                ? Object.keys(this.fileGroupData).sort((a, b) => parseInt(b) - parseInt(a)) 
                : Object.keys(this.fileGroupData).sort((a, b) => parseInt(a) - parseInt(b)) 
        },
        mode: function() {
            return this.recording === null ? 'write' : 'update'
        },
        recordGroupDates: function() {
            return this.params.sort === 'latest' 
                ? Object.keys(this.recordGroupData).sort((a, b) => parseInt(b) - parseInt(a)) 
                : Object.keys(this.recordGroupData).sort((a, b) => parseInt(a) - parseInt(b)) 
        },
        isFilesAllChecked: function() {
            let groups = [] 
            Object.values(this.fileGroupData).forEach(group => groups = [...groups, ...group])

            return this.selectedFileIds.length === groups.length && groups.length > 0
        },
        isActiveFileFunctions: function() {
            return this.selectedFileIds.length > 0
        },
        isDownloadActive: function() {
            return this.recording && (this.recording.files || []).length > 0
        },
        isVisibleFileView: function() {
            return this.params.recordType.length === 1 && ['PHOTO', 'VIDEO'].includes(this.params.recordType[0])
        },
        isRecordings: function() {
            return this.recordings.length > 0
        },
        isRegistration: function() {
            return this.params.sort === 'registration'
        },
        recordGroupData: function() {
            const dates = this.recordings.map(r => this.$moment(r.recordTimestamp).format('YYYYMMDD'))
            const set = new Set(dates)
            const groupKeys = [...set]
            let groupData = {}
            groupKeys.forEach(key => {
                groupData = {...groupData, [key]: this.recordings.filter(r => this.$moment(r.recordTimestamp).format('YYYYMMDD') === key)}
            })
            return groupData
        },
        fileGroupData: function() {
            const dates = this.recordingFiles.map(r => this.$moment(r.recordTimestamp).format('YYYYMMDD'))
            const set = new Set(dates)

            const groupKeys = [...set]
            let groupData = {}
            groupKeys.forEach(key => {
                groupData = {...groupData, [key]: this.recordingFiles.filter(r => this.$moment(r.recordTimestamp).format('YYYYMMDD') === key)}
            })
            
            return groupData
        },
        noDataText: function() {
            return this.params.action === 'get' ? '내역이 없습니다.' : '검색결과가 없습니다.'
        }
    },
    watch:{
        classroomId: {
            handler: async function (newVal, oldVal) {
                if(newVal && newVal !== oldVal){
                    this.params = {
                        action: 'get',
                        sort: 'latest',
                        recordType: ['PHOTO', 'VIDEO', 'AUDIO', 'NUGA']
                    }
                    await this.getBehaviorRecordings() 
                    this.closeContentLayer()
                }
            }
        }
    },
    methods: {
        ...mapActions({
            download: 'download'
        }),
        ...mapActions('storeBehavior', {
            getClassroomRecordings: 'getClassroomRecordings',
            getClassroomRecordingsSearch: 'getClassroomRecordingsSearch',
            getClassroomRecordingDetail: 'getClassroomRecordingDetail',
            deleteClassroomRecording: 'deleteClassroomRecording',
            getBehaviorFiles: 'getBehaviorFiles'
        }),
        ...mapMutations({
            setIsFileLoading: 'setIsFileLoading'
        }),
        ...mapMutations('storeBehavior', {
            setIsWritingRecord: 'setIsWritingRecord'
        }),
        getRecordGroupTitle: function(group) {
            const date = this.$moment(group, 'YYYYMMDD', true).format('M월 D일')
            const day = this.getDay(this.$moment(group, 'YYYYMMDD', true).day())
            return `${date} (${day})`
        }, 
        getDay: function(dayNumber) {
            switch(dayNumber) {
                case 0:
                    return '일'
                case 1:
                    return '월'
                case 2:
                    return '화'
                case 3:
                    return '수'  
                case 4:
                    return '목'
                case 5:
                    return '금'
                case 6:
                    return '토'              
            }
        }, 
        deleteRecording: async function(recordId) {
            const params = {
                classroomId: this.classroomId,
                recordId
            }
            await this.deleteClassroomRecording(params)
            this.changeCardList({action: 'delete', id: recordId})
        },
        toggleSorting: function() {
            this.isOpenSort = !this.isOpenSort
        },
        toggleSortingItem: function(sort) {
            this.getBehaviorRecordings({sort})
        },
        closeSortingBox: function() {
            if(this.isOpenSort) {
                this.isOpenSort = false
            }
        },
        addPage: function(page) {
            if(page === 'ADD_AUDIO') {
                this.confirmModal = {
                    isOpen: true,
                    action: 'alert',
                    title: '준비중 입니다.',
                    description: '',
                    isAlert: true,
                    id: null
                }
            } else {
                this.screen = page
                this.openContentLayer()
            }
        },
        closeConfirmModal: function(isConfirm) {
            if(isConfirm && this.confirmModal.action === 'exit') {
                this.setIsWritingRecord(false)
                this.toggleRecordingItem(this.confirmModal.id)
            }
            this.confirmModal.isOpen = false
        },
        getBehaviorRecordings: async function(params) {
            this.addNewId = ""
            this.selectedFileIds = []
            this.params = {...this.params, ...params}
            if(this.params.action !== 'get') {
                this.closeContentLayer()
            }
            if(!this.isVisibleFileView) {
                this.isFiles = false
            }
            if(!this.isFiles) {
                const response = this.params.action === 'get' 
                    ? await this.getClassroomRecordings({
                        classroomId: this.classroomId,
                        ...this.removeEmptyValue(this.params)
                    })
                    : await this.getClassroomRecordingsSearch({
                        classroomId: this.classroomId,
                        ...this.removeEmptyValue(this.params)
                    })
                this.setRecordings(response)
            } else {
                const response = await this.getBehaviorFiles({
                    classroomId: this.classroomId, 
                    ...this.removeEmptyValue({
                        ...this.params, 
                        recordType: null, 
                        recordTypes: this.params.recordType,
                        studentIds: this.params.studentId ? [this.params.studentId] : ''
                    })
                })
                this.setRecordingsFiles(response)
            }
        },
        recordingsPageSearch: async function(page) {
            if(!this.isFiles) {
                const response = this.params.action === 'get' 
                    ? await this.getClassroomRecordings({
                        classroomId: this.classroomId,
                        ...this.removeEmptyValue(this.params), page
                    })
                    : await this.getClassroomRecordingsSearch({
                        classroomId: this.classroomId,
                        ...this.removeEmptyValue(this.params), page
                    })
                this.setRecordings(response)
            } else {
                const response = await this.getBehaviorFiles({
                    classroomId: this.classroomId, 
                    ...this.removeEmptyValue({...this.params, recordType: null, recordTypes: this.params.recordType}), page
                })
                this.setRecordingsFiles(response)
            }
            
        },
        removeEmptyValue: function(params) {
            if(!params) return {}

            const returnParams = {}

            Object.keys(params).forEach(key => {
                if (params[key] !== '' && key !== 'page') {
                    returnParams[key] = params[key]
                }
            })
            
            return returnParams
        },
        setRecordings: function(response) {
            const {_embedded, page} = response
            if(page.number === 0) {
                this.page = page
            } 
            const length = this.params.action === 'get' ? _embedded.records.length : _embedded.classroomContents.length
            if(length > 1) {
                this.page = page
            }
            
            const orgIds = this.recordings.map(r => r.recordId)
            if(this.params.action === 'get') {
                this.recordings = page.number === 0 ? 
                _embedded.records : 
                [
                    ...this.recordings,
                    ..._embedded.records.filter(n => !orgIds.includes(n.recordId))
                ]
            } else {
                this.recordings = page.number === 0 ? 
                _embedded.classroomContents : 
                [
                    ...this.recordings,
                    ..._embedded.classroomContents.filter(n => !orgIds.includes(n.recordId))
                ]
            }
        },
        setRecordingsFiles: function(response) {
            const {_embedded, page} = response
            if(page.number === 0) {
                this.page = page
            } else {
                if(page.totalElements > 1) {
                    this.page = page
                }
            }
            const orgIds = this.recordingFiles.map(f => f.fileId)
            
            this.recordingFiles = page.number === 0 
                ? _embedded.files : 
                [
                    ...this.recordingFiles,
                    ..._embedded.files.filter(n => !orgIds.includes(n.files))
                ]
        },
        openContentLayer: function() {
            if(!this.isContentLayerOpen) {
                this.isContentLayerOpen = true
            }
        },
        closeContentLayer: function() {
            this.isContentLayerOpen = false
            this.selectedRecordingId = null
            this.recording = null
            this.screen = null
        },
        changeCardList: async function(params) {
            this.addNewId = ""
            switch(params.action) {
                case 'delete': 
                    if(this.isFiles) {
                        this.page.totalElements = this.page.totalElements - (this.recordingFiles.filter(r => r.recordId === params.id).length)
                        this.page.totalPages = Math.ceil(this.page.totalElements / 20)
                        this.recordingFiles = this.recordingFiles.filter(r => r.recordId !== params.id)
                    } else {
                        this.page.totalElements = this.page.totalElements -1
                        this.page.totalPages = Math.ceil(this.page.totalElements / 20)
                        this.recordings = this.recordings.filter(r => r.recordId !== params.id)
                    }
                    
                    this.closeContentLayer()
                    break
                case 'message': {
                        const orgRecodings = [...this.recordings]
                        const updateidx = orgRecodings.findIndex(r => r.recordId === params.id)
                        orgRecodings[updateidx].message = params.message
                        this.recordings = [...orgRecodings]
                        break
                    }
                case 'target': {
                        const orgRecodings = [...this.recordings]
                        const updateidx = orgRecodings.findIndex(r => r.recordId === params.id)
                        orgRecodings[updateidx].targetNames = params.targetNames
                        this.recordings = [...orgRecodings]
                        break
                    }
                case 'style': {
                        const orgRecodings = [...this.recordings]
                        const updateidx = orgRecodings.findIndex(r => r.recordId === params.id)
                        orgRecodings[updateidx].recordStyle = params.recordStyle
                        this.recordings = [...orgRecodings]
                        break
                    }
                case 'file': {

                        const orgRecodings = [...this.recordings]
                        const updateidx = orgRecodings.findIndex(r => r.recordId === params.id)
                        orgRecodings[updateidx].fileCount = params.fileCount
                        orgRecodings[updateidx].fileThumbnailPath = params.fileThumbnailPath
                        this.recordings = [...orgRecodings]
                        break
                    }
                case 'add': {                       
                        this.$store.commit('setIsDimLoading', true)
                        setTimeout(async() => {
                            this.params = {
                                action: 'get',
                                sort: 'latest',
                                recordType: ['PHOTO', 'VIDEO', 'AUDIO', 'NUGA']
                            }
                            this.isRefresh = true
                            await this.getBehaviorRecordings()
                            if(this.recordings.filter(r => r.recordId === params.recordId).length === 0) {
                                const records = [
                                    {
                                        fileCount: params.fileCount,
                                        fileThumbnailPath: params.fileThumbnailPath,
                                        message: params.message,
                                        recordId: params.recordId,
                                        recordTimestamp: params.recordTimestamp,
                                        recordType: params.recordType,
                                        targetNames: params.targetNames,
                                        recordStyle: params.recordStyle,
                                        filePalyTime: params.filePlayTime ? params.filePlayTime : null
                                    },
                                    ...this.recordings                             
                                ]
                                this.recordings = records
                            }
                            this.addNewId = params.recordId
                            this.closeContentLayer()
                            this.isRefresh = false
                            this.$store.commit('setIsDimLoading', false)
                        }, 1000)
                        break
                    }
            }
        },
        toggleRecordingItem: async function(id) {
            if(this.isWritingRecord) {
                this.confirmModal = {
                    isOpen: true,
                    action: 'exit',
                    title: '작성 중인 내용이 있습니다.',
                    description: '작성을 중단하시겠습니까?',
                    isAlert: false,
                    id
                }
                return
            }
            const res = await this.getClassroomRecordingDetail({
                classroomId: this.classroomId,
                recordId: id,
                isIncludeTargets: true
            })
            if(res.status === 428) {
                this.$hiClass.alert('삭제된 기록입니다.', 'error')
                this.changeCardList({action: 'delete', id})
                return 
            }
            this.addNewId = ""
            if(res.recordType !== 'NUGA') {
                this.recording = res
                this.screen = this.recording.recordType
                this.selectedRecordingId = id
                this.openContentLayer()
            } else {
                this.closeContentLayer()
                this.recording = res
                this.studentList = res.targets.map(t => {
                    return {
                        checked:true,
                        isHidden:false,
                        point:0,
                        studentCharacter: t.targetPhoto,
                        studentId: t.targetId,
                        studentName: t.targetName,
                        studentNo: t.studentNo,
                    }
                })
                this.openWhoWriteModal(false)
            }
            
        },
        openWhoWriteModal: function(isCloseLayer) {
            if(isCloseLayer) {
                this.closeContentLayer()
            }
            this.isOpenWhoWriteModal = true
        },
        closeWhoWriteModal: function() {
            this.studentList = []
            this.recording = null
            this.selectedRecordingId = null
            this.isOpenWhoWriteModal = false
        },
        whoWriteFinish: async function(data) {
            if(data.action !== 'add') {
                const updateData = {
                    message: data.recordContent,
                    recordId: data.recordId,
                    recordTimestamp: data.recordTimestamp,
                    recordType: data.recordType,
                    tags: data.tags,
                    targetNames: data.targets.map(t => t.targetName)
                }
                const orgRecodings = [...this.recordings]
                const updateidx = orgRecodings.findIndex(r => r.recordId === data.recordId)
                orgRecodings[updateidx] = updateData
                this.recordings = [...orgRecodings]
            } else {
                this.params = {    
                    action: 'get',
                    sort: 'latest',
                    recordType: ['PHOTO', 'VIDEO', 'AUDIO', 'NUGA']
                }
                this.isRefresh = true
                await this.getBehaviorRecordings()
                this.addNewId = data.recordId
                this.isRefresh = false
            }
            this.closeWhoWriteModal()
        },
        clickFileItem: function(id) {
            if(this.selectedFileIds.includes(id)) {
                this.selectedFileIds = this.selectedFileIds.filter(i => i !== id)
            } else {
                this.selectedFileIds.push(id)
            }
        },
        clickGroupItem: function(params) {
            const targets = this.fileGroupData[params.group].map(t => t.fileId)
            targets.forEach(id => {
                if(params.check) {
                    if(!this.selectedFileIds.includes(id)) {
                        this.selectedFileIds.push(id)
                    }
                } else {
                    if(this.selectedFileIds.includes(id)) {
                        this.selectedFileIds = this.selectedFileIds.filter(s => s !== id)
                    }
                }
            })
        },
        clickAllFilesCheck: async function() {
            if(this.isFilesAllChecked) {
                this.selectedFileIds = []
            } else {
                if(this.page.totalElements === this.recordingFiles.length) {
                    let groups = [] 
                    Object.values(this.fileGroupData).forEach(group => groups = [...groups, ...group])

                    this.selectedFileIds = groups.map(o => o.fileId)
                } else {
                    const axiosSource = axios.CancelToken.source();
                    this.axiosCancel = { cancel: axiosSource.cancel };
                    this.isFileAllSelectedModal = true
                    const pageCount = this.page.totalPages - (this.page.number + 1)
                    const pages = [...Array(pageCount).keys()].map(p => p + (this.page.number + 1))
                    
                    if(pages.length > 0) {
                        for await (const page of pages) {
                            await this.recordingsPageSearch(page)
                        }
                    }
                    let groups = [] 
                    Object.values(this.fileGroupData).forEach(group => groups = [...groups, ...group])

                    this.selectedFileIds = groups.map(o => o.fileId)
                    this.isFileAllSelectedModal = false
                    this.axiosCancel = null
                }
            }
        },
        fileDownload: async function() {
            const files = this.recordingFiles.filter(file => this.selectedFileIds.includes(file.fileId))
            this.setIsFileLoading(true)

            try {
                if (files.length === 1) {
                    const file = files[0]
                    const payload = {
                        src: file.fileTranscodePath || file.fileOriginalPath,
                        name: file.fileName
                    }
                    await this.download(payload)
                        .then(() => this.$hiClass.alert('파일 다운로드가 완료되었습니다.', 'success'))
                        .catch(() => this.$hiClass.alert('파일 다운로드를 실패하였습니다.', 'error'))
                        .finally(() => {
                            this.setIsFileLoading(false)
                            this.selectedFileIds = []
                        })

                } else if (files.length > 1) {
                    const zip = new jszip()
                    const archiveFileName = `파일일괄다운로드_${this.$moment().format('YYYYMMDD_HHmmss')}`
                    const requests = []
                    let fileCount = 0

                    for (const file of files) {
                        const url = file.fileTranscodePath || file.fileOriginalPath
                        const request = axios({
                            method: 'get',
                            url: url,
                            responseType: 'blob',
                            headers: '',
                            fileName: file.fileName
                        })
                        requests.push(request)
                    }

                    Promise.all(requests)
                        .then(responses => {
                            responses.map((res, index) => {
                                const fileName = `${index + 1}_${(res.config.fileName || files[index].fileName)}`
                                const blob = new Blob([res.data], {
                                    type: 'application/octet-stream'
                                })

                                zip.file(fileName, blob)
                                fileCount++

                                if (files.length === fileCount) {
                                    zip
                                        .generateAsync({type: 'blob'})
                                        .then(function (blob) {
                                            saveAs(blob, archiveFileName)
                                        })
                                        .finally(() => {
                                            this.setIsFileLoading(false)
                                            this.selectedFileIds = []
                                            this.$hiClass.alert('파일 일괄 다운로드가 완료되었습니다.', 'success')
                                        })
                                }
                            })
                        })
                        .catch(() => {
                            this.setIsFileLoading(false)
                            this.$hiClass.alert('파일 일괄 다운로드를 실패하였습니다.', 'error')
                        })
                }
            } catch (err) {
                this.$log.debug(this.$options.name, `downloadArchiveFile() err => `, err)
                this.setIsFileLoading(false)
            }
        },
        closeFileSelectModal: function() {
            this.axiosCancel.cancel()
            this.isFileAllSelectedModal = false
            this.axiosCancel = null
        },
        changeCardViewMode: async function() {
            this.selectedFileIds = []
            this.isFiles = !this.isFiles
            await this.getBehaviorRecordings()
        },
        viewCardAddList: function() {
            this.isFloatingMenuView = !this.isFloatingMenuView
        },
        closeFloating: function() {
            if(this.isFloatingMenuView) {
                this.isFloatingMenuView = false
            }
        },
        moveScrollTop: function() {
            this.$refs.recordingListArea.scrollTo({top: 0, behavior: 'smooth'})
        },
        scrollObserver: function() {
            this.$nextTick(function() {
                const option = {
                    root: null,
                    rootMargin: '0px',
                    threshold: 1
                }

                const callback = async([entry]) => {
                    if (entry.isIntersecting) {
                        this.recordingsPageSearch(this.page.number + 1)
                    }
                };

                this.observer = new IntersectionObserver(callback, option);
                this.observer.observe(this.obsRef)
            })
        },
        visibleScrollTopButton: function() {
            const recordListEl = this.$refs.recordingListArea
            const recordListScrollTopEl = this.$refs.scrollTop
            recordListEl.addEventListener('scroll', (e) => {
                if(e.target.scrollTop > 30) {
                    recordListScrollTopEl.style.display = 'flex'
                } else {
                    recordListScrollTopEl.style.display = 'none'
                }
            })
        }
    },
    async created() {
        this.setIsWritingRecord(false)
        await this.getBehaviorRecordings() 
        this.scrollObserver()
        this.visibleScrollTopButton()
    },
    mounted() {
        this.obsRef = this.$refs.scrollListAccess
    },
    beforeDestroy() {
        this.setIsWritingRecord(false)
    }
}
</script>

<style scoped>
span.keyword {
    color: #FF8737 !important;
    max-width: 251px !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>