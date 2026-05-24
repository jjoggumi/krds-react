<template>
<div
    class="modal talk-view-attached-file-modal has-top-btn-wrap slick-modal"
    style="display: block"
>
    <div 
        class="modal-cont-wrap"
        @mouseover="onMouseOver"
        @mouseleave="onMouseLeave"
    >
        <div class="modal-cont">
            <div class="modal-cont-inner">
                <div class="modal-top-btn-wrap">
                    <div class="view-title">{{ recordDate }}</div>
                    <div class="right-wrap">
                        <div class="viewer-btn" :class="{on: isShowTargetList}" @click="toggleTargetBtn">
                            <i class="user"></i>
                            <span v-if="targetCount !== 0" class="user-count">{{ targetCount }}</span>
                        </div>
                        <div class="search-student-list" v-if="isShowTargetList" v-click-outside="closeTargetList">
                            <ul>
                                <template v-if="recordTargets.length !== 0">
                                    <li
                                        v-for="target of recordTargets"
                                        :key="target.targetId"
                                    >
                                        <span class="image">
                                            <img :class="{'is-photo': isPhoto(target)}" :src="selectedImageSrc(target)" />
                                        </span>
                                        <span class="num">{{ target.studentNo }}</span>
                                        <span class="name">{{ target.targetName }}</span>
                                    </li>
                                </template>
                                <template v-else>
                                    <li><span class="name">대상이 없습니다.</span></li>
                                </template>
                            </ul>
                            <!--p v-else class="target-no-data">대상이 없습니다.</p-->
                        </div>
                        <div class="viewer-btn ml-24" :class="{on: isShowMoreMenu}" @click="toggleMoreBtn">
                            <i class="more"></i>
                        </div>
                        <div class="more-select" v-if="isShowMoreMenu" v-click-outside="closeMoreMenu">
                            <span role="button" @click="download">{{ fileSaveString }}</span>
                            <span v-if="isArrayFileContent && isMultiDown" role="button" @click="multiDownload">전체 저장하기</span>
                            <span class="del" role="button" @click="openConfirmModal">기록 삭제하기</span>
                        </div>
                        <div class="viewer-btn ml-24" @click="closeViewer">
                            <i class="close"></i>
                        </div>
                    </div>
                </div>
                <div class="viewer-desc" v-if="isOverMouse && recordContent">
                    {{ recordContent }}
                </div>

                <template v-if="isArrayFileContent">
                    <div class="slide-wrap">
                        <div class="prev"></div>
                        <div class="slider-for">
                            <div
                                v-for="file of fileContent"
                                class="slide"
                                :key="`${file.fileOriginalPath}-for`"
                            >
                                <div class="single-wrap">
                                    <img v-if="file.fileCategory === 'PHOTO'" :src="file.fileOriginalPath" alt="">
                                    <video-viewer-item v-else :file="file" />
                                </div>
                            </div>
                            <!--div class="slide">
                                <div class="single-wrap">
                                    <video 
                                        ref="videoPlayer"  id="vjs_video"
                                        class="video-js vjs-theme-forest" />
                                </div>
                            </div-->
                            
                        </div>
                        <div class="next"></div>

                        <div class="slide-count" v-if="isOverMouse">
                            <span class="current">{{ curPage }}</span>/<span class="total">{{ totalPage }}</span>
                        </div>
                    </div>

                    <div class="slide-nav-wrap" :style="{display: isOverMouse ? 'block' : 'none'}">
                        <div class="slider-nav">
                            <div
                                v-for="file of fileContent"
                                class="slide"
                                :key="`${file.fileOriginalPath}-nav`"
                            >
                                <img :src="file.fileCategory === 'PHOTO' ? file.fileOriginalPath : file.fileThumbnailPath" alt="">
                            </div>
                            <!--div class="slide">
                                <img src="https://download.hiclass.net/7e70/8970/a570/c370/bdd23d26-c249-405b-be91-50c63b0b6026.gif" />
                            </div-->
                        </div>
                    </div>
                </template>

                <template v-else>
                    <div class="slide-wrap">
                        <div class="slider-for">
                            <div class="slide">
                                <div class="single-wrap">  
                                    <img 
                                        v-if="fileContent[0].fileCategory === 'PHOTO'" 
                                        style="position: absolute;" 
                                        :src="fileContent[0].fileOriginalPath" alt=""
                                    >
                                    <video 
                                        v-if="fileContent[0].fileCategory === 'VIDEO'" 
                                        ref="videoPlayer"  id="vjs_video"
                                        class="video-js vjs-theme-forest" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

            </div>
        </div>
    </div>
    <confirm-modal
        v-if="confirmModal.isOpen"
        :title="confirmModal.title"
        @closeConfirmDialog="closeConfirmModal"
    />
</div>
</template>

<script>
// zip file archive download
import jszip from 'jszip'
import videojs from 'video.js';
import { saveAs } from 'file-saver'
import axios from 'axios'
import 'video.js/dist/video-js.min.css'

import '@videojs/themes/dist/forest/index.css'

import {mapMutations, mapState, mapActions} from "vuex"
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
import VideoViewerItem from '@/apps/behavior/components/common/VideoViewerItem.vue'
export default {
    name: "behavior-viewer",
    components: {ConfirmModal, VideoViewerItem},
    data() {
        return {
            isShowMoreMenu: false,
            isShowTargetList: false,
            isOverMouse: true,
            curPage: 0,
            totalPage: 0,
            player: null,
            confirmModal: {
                isOpen: false,
                title: '기록을 삭제하시겠습니까?'
            }
        }
    },
    computed: {
        ...mapState('storeBehavior', {
            curClassroom: 'curClassroom',
            behaviorViewerOptions: 'behaviorViewerOptions'
        }),
        classroomId: function() {
            return this.curClassroom.classroomId
        },
        isArrayFileContent: function() {
            return this.behaviorViewerOptions.files.length > 1
        },
        fileContentTotalLength: function() {
            return this.behaviorViewerOptions.files.length
        },
        fileContent: function() {
            return this.behaviorViewerOptions.files
        },
        recordTargets: function() {
            const targets = this.isArrayFileContent && this.curPage > 0
                ? this.fileContent[this.curPage -1].targets
                : this.fileContent[0].targets

            return targets
        },
        recordDate: function() {
            const date = this.isArrayFileContent && this.curPage > 0
                ? this.fileContent[this.curPage -1].recordTimestamp
                : this.fileContent[0].recordTimestamp

            return this.$moment(date).format('YYYY. MM. DD. HH:mm')
        },
        recordContent: function() {
            const content = this.isArrayFileContent && this.curPage > 0
                ? this.fileContent[this.curPage -1].recordContent
                : this.fileContent[0].recordContent

            return content
        },
        recordId: function() {
            const recordId = this.isArrayFileContent && this.curPage > 0
                ? this.fileContent[this.curPage -1].recordId
                : this.fileContent[0].recordId

            return recordId
        },
        targetCount: function() {
            return this.recordTargets.length
        },
        isMultiDown: function() {
            return this.fileContent.every(o => o.fileCategory === 'PHOTO')
        },
        fileSaveString: function() {
            return this.fileContent.every(o => o.fileCategory === 'PHOTO') ? '이 사진만 저장하기' : '저장하기'
        }
    },
    methods: {
        ...mapMutations('storeBehavior', {
            setBehaviorViewerOptions: 'setBehaviorViewerOptions'
        }),
        ...mapActions('storeBehavior', {
            getClassroomRecordingDetail: 'getClassroomRecordingDetail',
        }),
        isPhoto: function(student) {
            return student.studentPhoto !== null
        },
        selectedImageSrc: function(student) {
            return this.isPhoto(student) 
                ? student.studentPhoto
                : `https://download.hiclass.net/static/classroom/student/${student.targetPhoto}_head.png`
        },
        onMouseOver: function() {
            this.isOverMouse = true
        },
        onMouseLeave: function() {
            this.isOverMouse = false
        },
        closeViewer: function() {
            this.setBehaviorViewerOptions({
                isOpen: false,
                currentIndex: 0,
                files: []
            })
        },
        toggleMoreBtn: function() {
            this.isShowMoreMenu = !this.isShowMoreMenu
        },
        closeMoreMenu: function() {
            if(this.isShowMoreMenu) {
                this.isShowMoreMenu = false
            }
        }, 
        toggleTargetBtn: function() {
            this.isShowTargetList = !this.isShowTargetList
        },
        closeTargetList: function() {
            if(this.isShowTargetList) {
                this.isShowTargetList = false
            }
        }, 
        download: function() {
            const file = this.isArrayFileContent ? this.fileContent[this.curPage - 1] : this.fileContent[0]
            let fileDownload = file.fileTranscodePath || file.fileOriginalPath
            let fileName = file.fileName
            this.$comn.download(fileDownload, fileName)
        },
        multiDownload: async function() {
            try {
                this.$store.commit('setIsDimLoading', true)
                    
                const zip = new jszip()
                const archiveFileName = `묶음사진_전체저장_${ this.$moment().format('YYYY-MM-DD_HHmmss')}.zip`

                const result = new Promise(async (resolve, reject) => {
                    for (const [index, file] of this.fileContent.entries()) {
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

                            if (this.fileContent.length === (index + 1)) {
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
        openConfirmModal: function() {
            this.confirmModal.isOpen = true
        },
        closeConfirmModal: function(isConfirm) {
            this.confirmModal.isOpen = false
            if(isConfirm) {
                this.deleteRecord()
            }
        },
        deleteRecord: function() {
            this.$emit('delete', this.recordId)
            this.closeViewer()
        },
        initSlick: function() {
            const $sliderFor = $('.slick-modal .slider-for')
            const $sliderNav = $('.slick-modal .slider-nav')
            const sliderForOption = {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: false,
                speed: 300,
                fade: true,
                asNavFor: '.slider-nav',
                dots: false,
                draggable: false,
                autoplay: false,
                prevArrow: $('.prev'),
                nextArrow: $('.next'),
            }
            const sliderNavOption = {
                slidesToShow: 9,
                slidesToScroll: 9,
                asNavFor: '.slider-for',
                centerMode: false,
                focusOnSelect: true,
                dots: false,
                arrows: false,
                infinite: false
            }

            if (this.fileContentTotalLength >= 9) {
                sliderNavOption.centerMode = true
                sliderNavOption.speed = 300
                sliderNavOption.draggable = true
            }

            if(this.behaviorViewerOptions.currentIndex > -1 && this.fileContentTotalLength === 9) {
                sliderNavOption.slidesToShow = 8
            }

            if (this.behaviorViewerOptions.currentIndex > -1) {
                sliderForOption.initialSlide = this.behaviorViewerOptions.currentIndex
                sliderNavOption.initialSlide = this.behaviorViewerOptions.currentIndex
            }

            $sliderFor.on('init reInit', (_, slick) => {
                this.curPage = (this.behaviorViewerOptions.currentIndex || 0) + 1
                this.totalPage = slick.slideCount
            })
            $sliderFor.on('afterChange', async (_, slick, currentSlide) => {
                if(this.fileContent[currentSlide].recordId !== this.recordId) {
                    const detail = await this.getClassroomRecordingDetail({
                        classroomId: this.classroomId,
                        recordId: this.fileContent[currentSlide].recordId,
                        isIncludeTargets: true
                    })
                    this.setBehaviorViewerOptions({
                        ...this.behaviorViewerOptions,
                        files: this.fileContent.map(f => {
                            return {
                                ...f, 
                                recordContent: f.recordId === detail.recordId ? detail.recordContent : null,
                                targets: f.recordId === detail.recordId ? detail.targets : []
                            }
                        })
                    })
                    //console.log('newRecordId', this.fileContent[currentSlide].recordId)
                } else {
                    //console.log('this.recordId', this.recordId)
                }
                this.curPage = (currentSlide || 0) + 1
                this.totalPage = slick.slideCount
            })
            $sliderNav.on('setPosition', () => {
                if (this.behaviorViewerOptions.currentIndex > -1 && this.fileContentTotalLength < 9) {
                    $('.slider-nav .slick-list .slick-track').css('transform', 'translate3d(0, 0, 0)')
                }
            })

            $sliderFor.slick(sliderForOption)
            $sliderNav.slick(sliderNavOption)
        }
    },
    mounted() {
        this.$nextTick(() => {
            if (this.isArrayFileContent) {
                this.initSlick()
            } else {
                if(this.fileContent[0].fileCategory === 'VIDEO') {
                    const playSrc = (this.fileContent[0].fileTranscodePath || this.fileContent[0].fileOriginalPath)
                        .replace('https://download.hiclass.net', 'https://streaming.hiclass.net')
                    const options = {
                        autoplay: false,
                        controls: true,
                        sources: [
                            {
                                src: playSrc,
                                type: this.fileContent[0].fileContentType
                            }
                        ],
                        width: '720px',
                        height: '480px'
                    }
                    this.player = videojs(this.$refs.videoPlayer, options, () => {
                        this.player.log('onPlayerReady', this);
                    })
                }
            }
        })
    }
}
</script>

<style scoped>
.modal.slick-modal .slick-arrow {
    display:block;
    position:absolute;
    top:0;
    bottom:0;
    margin:auto 0;
    width: 100px;
    height: 100px;
    background-position:0;
    font-size:0;
    z-index:1000;
    overflow:hidden;
}
.modal.slick-modal .slick-arrow:hover {
    opacity:0.8;
    cursor: pointer;
}
.modal.slick-modal .slick-arrow.slick-disabled {
    cursor:default;
    opacity:1;
}
.modal.slick-modal .prev {
    left:30px;
    background: url(../../../../assets/img/icon/frame-left.svg) no-repeat;
    background-size: cover;
}
.modal.slick-modal .next {
    right:30px;
    background: url(../../../../assets/img/icon/frame-right.svg) no-repeat;
    background-size: cover;
}
.modal.slick-modal .prev.slick-disabled {
     background: url(../../../../assets/img/icon/frame-left-dis.svg) no-repeat;
}
.modal.slick-modal .next.slick-disabled {
    background: url(../../../../assets/img/icon/frame-right-dis.svg) no-repeat;
}
.modal-top-btn-wrap {
    padding: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000; 
    height: 68px;
}
.modal-cont-inner .modal-top-btn-wrap .view-title{
    font-size: 18px;
    font-weight: 700;
    line-height: 18px;
    color: #FFF;
    background-color: #000; 
}
.modal-top-btn-wrap .right-wrap {
    top: 15px;
}
.viewer-btn {
    position: static;
    display: inline-block;
    width: 40px;
    height: 40px;
    padding: 4px;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
}
.ml-24 {
    margin-left: 24px;
}
.viewer-btn:hover {
    background-color: var(--web-Text-Gray-10, #222);
}
.viewer-btn.on {
    background-color: var(--web-Text-Gray-10, #222);
}
.viewer-btn .user {
    cursor: pointer;
    width: 32px;
    height: 32px;
    background: url(../../../../assets/img/icon/ic_user_fill_32.svg) 0/32px no-repeat;
    display: inline-block;
}
.viewer-btn .user-count {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: -5px;
    left: 27px;
    width: 20px;
    height: 20px;
    color: #fff;
    font-size: 12px;
    font-weight: 500;
    line-height: 12px;
    background: url(../../../../assets/img/ellipse.svg) 0/20px no-repeat;
}
.viewer-btn .more {
    cursor: pointer;
    width: 32px;
    height: 32px;
    background: url(../../../../assets/img/icon/ic_morevert_32.png) 0/32px no-repeat;
    display: inline-block;
}
.viewer-btn .close {
    cursor: pointer;
    width: 32px;
    height: 32px;
    background: url(../../../../assets/img/icon/icon_modal_close_w_32.png) 0/32px no-repeat;
    background-size: cover;
    display: inline-block;
}
.viewer-desc {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 68px;
    background-color: rgba(0, 0, 0, 0.62);
    height: 54px;
    width: 100%;
    font-size: 16px;
    font-weight: 400;
    line-height: 16px;
    color: #FFF;
    z-index: 3;
}
.right-wrap .search-student-list {
    position: absolute;
    top: calc(100% + 5px);
    left: -200px;
    width: 250px;
    height: auto;
    max-height: 320px;
    border: 1px solid #222;
    border-radius: 10px;
    box-shadow: 0px 5px 10px 0px #0000001F;
    z-index: 3;
    background: #222;
    overflow: auto;
}
.right-wrap .search-student-list::-webkit-scrollbar {
    width: 10px;
}
.right-wrap .search-student-list::-webkit-scrollbar-track {
    background: transparent;
}
.right-wrap .search-student-list::-webkit-scrollbar-thumb {
    background: #D3D1CB;
    background-clip: padding-box;
    border: 2px solid transparent;
    border-radius: 50px;
    border-top: 0;
    border-bottom: 0;
}
.right-wrap .search-student-list ul {
    padding: 9px 0;
}
.right-wrap .search-student-list ul li {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 15px;
    cursor: pointer;
}
.right-wrap .search-student-list ul li:hover {
    background: #2E2E2E;
}
.right-wrap .search-student-list ul li span.image {
    display: inline-flex;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #C4C4C4;
    overflow: hidden;
    margin-right: 10px;
    margin-right: 0;
    justify-content: center;
    align-items: flex-end;
}
.right-wrap .search-student-list ul li span.image img {
    width: 32px;
    height: 32px;
    -o-object-fit: cover;
    object-fit: cover;
    image-rendering: auto;
}
.right-wrap .search-student-list ul li span.image img.is-photo {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
}
.right-wrap .search-student-list ul li span.num {
    display: inline-block;
    width: auto;
    min-width: 28px;
    max-width: 58px;
    height: 18px;
    border-radius: 20px;
    border: 1px solid #BDBDBD;
    font-size: 12px;
    font-weight: 500;
    color: #BDBDBD;
    text-align: center;
    line-height: 16px;
    margin-left: 8px;
    margin-right: 6px;
    padding-left: 2px;
    padding-right: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
}
.right-wrap .search-student-list ul li span.name {
    display: inline-block;
    font-size: 14px;
    line-height: 14px;
    font-weight: 400;
    color: #FFF;
    text-align: left;
    max-width: 202px;
    width: calc(100% - 90px);
    vertical-align: middle;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.right-wrap .search-student-list .target-no-data {
    color: #fff;
    font-size: 14px;
    font-weight: 400;
    display: flex;
    padding-top: 10px;
    padding-left: 10px;
}
.right-wrap .more-select {
    position: absolute;
    left: -70px;
    top: calc(100% + 5px);
    padding: 9px 1px 9px 1px;
    border-radius: 10px;
    border: rgba(0,0,0,.2);
    border: 1px solid var(--web-Text-Gray-10, #222);
    background: #222;
    box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.12);
}
.right-wrap .more-select span {
    display: flex;
    width: 178px;
    height: 40px;
    padding: 13px 47px 12px 15px;
    align-items: center;
    color: var(--web-black-white-white, #FFF);
    font-size: 15px;
    font-weight: 400;
    line-height: 15px;
}
.right-wrap .more-select span:hover {
    background: #2E2E2E;
}
.right-wrap .more-select span.del {
    color: var(--web-State-Red-01, #F04F59);
}
.right-wrap .more-select span.del:hover {
    background: #412325;
}
.talk-view-attached-file-modal.slick-modal .slider-nav {
    display: inline-block;
    width: 756px;
}
.talk-view-attached-file-modal.slick-modal .slider-nav .slide.slick-slide.slick-current::after, /* 퍼블리싱 산출물 slick */
.talk-view-attached-file-modal.slick-modal .slider-nav .slick-current .slide::after { /* 개발 slick */
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 4px solid var(--web-Main-Orange, #FF8737);
    box-sizing: border-box;
}
.single-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
}
.talk-view-attached-file-modal .modal-cont-inner .slide-wrap .single-wrap img,
.talk-view-attached-file-modal .modal-cont-inner .slide-wrap .single-wrap .video-js {
    position: absolute;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    -webkit-transform: -webkit-translateY(-50%);
    transform: -webkit-translateY(-50%);
    max-width: 60%;
    max-height: 100%;
}
.slider-nav .slick-track{
  left: 0 !important;
}
</style>