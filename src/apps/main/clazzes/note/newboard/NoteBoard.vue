<!--
@File(Method): PostEdit.vue
@Author: -
@Date Created: -
@Description: 판서로 쓰기 (게시글 에디터)
@Modified: 2024-10-11 - #68852 영상변환 요청 결과 반영 개선
-->

<template>
  <div
    v-show="isShowNoteBoard"
    ref="contents"
    class="note-edit-wrap"
    :class="{
      on: option.isZoom
    }"
  >
    <!-- common / confirm modal -->
    <component
      :is="option.modalComponent"
      :option="option"
      :model="model"
      :isSendComplete="isSendComplete"
      :isReserve="isReserve"
      :isSelectedReserve="isSelectedReserve"
      @closeModal="closeModal"
      @setPost="setPost"
    />

    <div class="note-edit-inner">
      <div ref="title" class="title-wrap">
        <note-board-title
          :subComponent="subComponent"
          :option="option"
          :items="items"
          :board="board"
          :boardId="boardId"
          :isUsedFolder="isUsedFolder"
          :model="model"
          :isSendComplete="isSendComplete"
          :isReserve="isReserve"
          :isNoteOptionReadOnly="isNoteOptionReadOnly"
          :isSelectedReserve="isSelectedReserve"
          :clazzSettingPushTarget="clazzSettingPushTarget"
          :addedFiles="addedFiles"
        />
        <div class="info-video-message">동영상 1개씩 삽입(최대 10개)</div>
      </div>

      <div
        class="note-cont-wrap"
        :class="{
          type2 : modelFiles.length > 0  // 첨부파일이 있는 경우에만 추가
        }"
      >
        <!-- 2020 신규 에디터 -->
        <hc-editor
          :model="model"
          type="BLACKBOARD"
          :addedFiles="addedFiles"
        />

        <div
          v-if="(option.isUpload || modelFiles.length > 0) && !option.isZoom"
          ref="file"
          class="attaching-file-list-wrap type-long"
          :class="{
            'attaching-file-margin-top': !$comn.isIE() && model.version === 'V2'
          }"
        >
          <component
            :is="noteUploadList"
            :files.sync="model.files"
            :addedFiles="addedFiles"
          />
        </div>
      </div>

      <div ref="footer" class="footer-wrap">
        <note-board-footer
          ref="note_board_footer"
          :option="option"
          :items="items"
          :model="model"
          :currentId="model.currentId"
          :postContentCode="postContentCode"
          :isOverPostContent="isOverPostContent"
          :isReserve="isReserve"
          :isTemporary="isTemporary"
          :isSendComplete="isSendComplete"
          :isSave="isSave"
          @setPost="setPost"
        />
      </div>

      <note-board-zoom :model="model" />
    </div>

    <!-- (알림장 판서) 이미지 상세보기 -->
    <image-view
      v-if="imageView.isOpen"
      :item="$comn.isImage(imageView.items, 'both')"
      :imgIndex="imageView.index"
      @closeAttach="closeAttach"
    />

    <!-- 묶음 사진 관리 -->
    <note-board-image-pack
      v-if="noteBoardImagePack.isOpen"
      :model="model"
      :option="option"
      :addedFiles="addedFiles"
    />

    <!-- 에디터 copy & paste 로딩 // 로딩 백그라운드 투명 처리 -->
    <!-- <loading-overlay
      :active.sync="isEditorLoading"
      :can-cancel="false"
      :is-full-page="true"
      :color="'#4275df'"
      :backgroundColor="'rgba(90,90,90,0)'"
    /> -->

    <!-- 에디터 init 로딩 -->
    <loading-overlay
      :active.sync="isEditorInitLoading"
      :can-cancel="false"
      :is-full-page="true"
      :color="'#4275df'"
      :backgroundColor="'rgba(90,90,90,0.5)'"
    />
  </div>
</template>

<script>
// 에디터 초기화 로딩
import LoadingOverlay from 'vue-loading-overlay'

import NoteBoardTitle from '@/apps/main/clazzes/note/newboard/NoteBoardTitle.vue'
import NoteBoardFooter from '@/apps/main/clazzes/note/newboard/NoteBoardFooter.vue'
import NoteBoardConfirmModal from '@/apps/main/clazzes/note/newboard/subcomponents/NoteBoardConfirmModal.vue'
import NoteBoardCommonModal from '@/apps/main/clazzes/note/newboard/subcomponents/NoteBoardCommonModal.vue'
import NoteBoardImagePack from "@/apps/main/clazzes/note/newboard/subcomponents/NoteBoardImagePack.vue"

import HcEditor from '@/components/Editor/HcEditor.vue'
import NoteUploadListV1 from '@/components/Upload/Note/NoteUploadList.vue'
import NoteUploadListV2 from '@/components/Upload/Note/NoteUploadListV2.vue'

import { eventBus } from '@/main'
import {mapActions, mapMutations, mapState} from "vuex"
import { mapFields } from "vuex-map-fields"

import '@/assets/css/note.css'

import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent.vue"
import {isEmpty} from "lodash";

const NoteBoardZoom = () => ({
  component: import('@/apps/main/clazzes/note/newboard/subcomponents/NoteBoardZoom.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const ImageView = () => ({
  component: import('@/components/Viewer/ImageViewer.vue'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: 'note-board',
  components: {
    NoteBoardImagePack,
    LoadingOverlay,
    NoteBoardTitle,
    HcEditor,
    NoteBoardFooter,
    NoteUploadListV1,
    NoteUploadListV2,
    NoteBoardConfirmModal,
    NoteBoardCommonModal,
    NoteBoardZoom,
    ImageView,    // (알림장 판서) 이미지 미리보기
  },
  data() {
    return {
      board: {},
      defaultFolder: {},
      boardId: '',
      folderId: '',
      isUsedFolder: false,
      isShowNoteBoard: false,
      isSelectedReserve: false,   // 예약 후 예약버튼 상태 유지하기 위한 데이터
      subComponent: {
        calendarComponent: '',
        oftenComponent: ''
      },
      option: {
        postURI: '',
        isUpload: false,
        isZoom: false,
        isPushTeacher: true,
        isPushParents: false,
        isPushStudent: false,
        goMain: false,
        mode: '',
        button: '', // 'TEMPORARY' | 'WRITE'
        modalComponent: '',
        modalTitle: '',
        modalMode: '',
        disabled: {
          isPushParents: false,
          isPushStudent: false
        }
      },
      items: {
        user: {
          userId: ''
        },
        clazz: {
          currentId: '',
          item: []
        }
      },
      model: {
        parentUri: '',
        pushTarget: '',
        pushUsed: true,
        posted: '',
        postStatus: '',
        postMustRead: false,
        postPin: false,
        postType: 'NOTE',
        postTitle: null,
        postContent: '',
        files: [],
        filesRemoveQueue: [],
        postOptions: [],
        updatedTimestamp: null,
        version: this.$store.state.postVersionDefault
      },
      clazz: null,

      // 금칙어가 포함되었을 경우 이전 상태로 되돌림
      oldResource: {},
      // 신규로 추가된 파일. 저장안하고 창닫았을때 업로드된 파일 cdn에서 삭제하기 위함.
      addedFiles: [],
      // 게시글 수정시 이미 게시글내에 저장된 파일중 게시글내에서 삭제한 파일도 cdn에서 삭제하기 위함.
      savedFiles: []
    }
  },

  computed: {
    ...mapState({
      curClazzNote: 'curClazzNote',
      docView: 'docView',
      imageView: 'imageView',
      noteBoardImagePack: 'noteBoardImagePack',
      postVersionDefault: 'postVersionDefault'
    }),
    ...mapFields({
      isDimLoading: 'isDimLoading',
      isEditorInitLoading: 'isEditorInitLoading',
      currentTimestamp: 'currentTimestamp'
    }),
    ...mapFields('storeEditor', {
      storeEditorConfig: 'config',
      edit: 'edit',
      editorComponentKey: 'editorComponentKey',
    }),
    isUpdate() {
      return this.option.postURI
    },
    isCreate() {
      return !this.option.postURI
    },
    isOverPostContent() {
      return this.postContentCode.bytes > this.edit.maxByte
    },
    isNoteOptionReadOnly() {
      // 클래스, 발송대상, 필독 변경 여부
      return (
        this.model.postStatus === 'COMPLETE' ||
        (!this.isTemporary && Math.floor((this.currentTimestamp - this.model.posted) / 86400000) > 0)
      )
    },
    isTemporary() {
      // 임시저장 : 발송완료 제외
      return this.isSave && this.model.postStatus !== 'COMPLETE'
    },
    isSendComplete() {
      return this.model.postStatus === 'COMPLETE'
    },
    isComplete() {
      // 발송
      if (this.model.postStatus !== 'COMPLETE') {
        // 오늘만
        return (
          this.isSave &&
          Math.floor((this.currentTimestamp - this.model.posted) / 86400000) === 0
        )
      } else {
        return this.isSave
      }
    },
    isSave() {
      const postContent = this.model.postContent.trim() || ''
      const existContents = postContent.length > 0 || this.modelFiles.length > 0 || this.imagePackFiles.length > 0

      return !this.option.isUpload && !this.isDimLoading && existContents
    },
    isReserve() {
      const TEN_SECONDS = 10 * 1000  // this.currentTimestamp 10초 단위 갱신이므로
      return this.isSelectedReserve || !this.isSendComplete && (this.currentTimestamp + TEN_SECONDS < this.model.posted)
    },
    postContentCode() {
      let postContentCode = {
        html: '',
        bytes: 0
      }
      if (this.model.postContent.trim().length > 0) {
        postContentCode.html = this.replacePostContentEditor(this.model.postContent)
        postContentCode.bytes = (new TextEncoder()).encode(postContentCode.html).length
      }

      return postContentCode
    },
    imageFiles() {
      return this.model.files.filter(f => {
        return f.fileContentType.startsWith('image') && f.fileFlag === 'FILE'
      }) || []
    },
    videoFiles() {
      return this.model.files.filter(f => f.fileContentType.startsWith('video')) || []
    },
    docFiles() {
      return this.model.files.filter(f => {
        return f.fileContentType && (!f.fileContentType.startsWith('image') && !f.fileContentType.startsWith('video'))
      }) || []
    },
    loadingBars() {
      return this.model.files.filter(f => f.isLoadingBar) || []
    },
    docFilesAndLoadingBars() {
      return this.docFiles.concat(this.loadingBars)
    },
    imagePackFiles() {
      return this.model.files.filter(f => {
        return f.fileContentType.startsWith('image') && f.fileFlag === 'IMAGE_PACK'
      }) || []
    },
    modelFiles() {
      if (this.model.version === 'V2') return this.docFilesAndLoadingBars
      else if (this.model.version === 'V1') return this.model.files
      else return this.model.files
    },
    clazzSettingPushTarget() {
      let clazzSettingPushTarget = ''

      if (this.board !== null) {
        if (this.board.isReadParents && this.board.isReadStudent)
          clazzSettingPushTarget = 'ALL'

        else if (this.board.isReadParents)
          clazzSettingPushTarget = 'PARENTS'

        else if (this.board.isReadStudent)
          clazzSettingPushTarget = 'STUDENT'

        else
          clazzSettingPushTarget = 'TEACHER'
      }

      return clazzSettingPushTarget
    },
    noteUploadList() {
      return `noteUploadList${this.model.version}`
    },
  },

  watch: {
    'model.postContent'(val) {
      if (
        val !== undefined &&
        val !== null &&
        val !== '' &&
        val.length > 20000
      ) {
        if (!this.isEditorLoading && val) {
          this.setIsEditorLoading(true)

          setTimeout(() => {
            this.$nextTick(() => {
              if (this.isOverPostContent) {
                const editMaxByteWithCommas = this.$stringUtil.addCommas(
                  this.edit.maxByte
                )
                alert(
                  `${this.curClazzNote.name}${this.curClazzNote.suffix2} 최대 ${editMaxByteWithCommas} byte 까지 입력 가능 합니다.\n(한글 파일에서 복사-붙여넣기 할 경우, 실제 입력된 글자수보다 더 많이 입력된 것처럼 계산될 수 있습니다.)`
                )
              }
              this.setIsEditorLoading(false)
            })
          }, 300)
        }
      }
    },
    'items.clazz.currentId'(val) {
      this.$log.debug(`items.clazz.currentId => `, val)
      this.findCurClass()
    },
    isReserve(val) {
      if (val === true)
        this.isSelectedReserve = true
    }
  },

  async created() {
    // this.isEditorInitLoading = true
    this.currentTimestamp = this.$moment().valueOf()

    // 초기값 세팅
    this.items.user.userID = this.$route.query.userUUID
    this.items.clazz.currentId = this.$route.query.classUUID
    this.items.folderId = this.$route.query.folderId
    this.option.postURI = this.$route.query.postURI
    this.option.goMain = this.$route.query.goMain
    this.option.type = this.$route.query.type
    this.model.posted = this.currentTimestamp
    // set post version
    const version = this.$route.query.version || 'V1'
    this.model.version = version === 'null' ? 'V1' : version

    // 클래스 목록
    await this.getClass()

    // 클래스 정보 로딩
    await this.getClazz(this.items.clazz.currentId)
  },

  async mounted() {
    eventBus.$on('note-board-new', key => {
      this.changePosted({})
      setTimeout(() => {
        eventBus.$emit('note-board-confirm')
      })
    })
    eventBus.$on('note-board-change-class', () => {
      this.getClazz(this.items.clazz.currentId)
    })

    eventBus.$on('note-board-move-class', () => {
      this.moveClass()
    })

    // layer popup close for iframe
    eventBus.$on('editor-on-click-contents', () => {
      this.$refs.contents.click()
    })

    eventBus.$on('note-board-change-posted', item => {
      this.changePosted(item)
      this.setFolderId(item.folder.folderId)
    })

    eventBus.$on('note-board-change-folderId', id => {
      this.setFolderId(id)
    })

    eventBus.$on('froala-editor-init-complete', () => {
      this.$log.debug(`froala-editor-init-complete !!`)
      // this.isEditorInitLoading = false
      this.isShowNoteBoard = true
    })

    eventBus.$on('is-changed-class-settings', key => {
      this.reloadClazz(key)
    })

    eventBus.$on('note-board-set-is-selected-reserve', flag => {
      this.isSelectedReserve = flag
    })

    if (this.isUpdate) {
      await this.getPostInfo()
    } else {
      eventBus.$emit('safe-set', '', '')
    }
    // 메인 스크롤바 숨김 처리
    this.$hiClass.toggleBodyClass('add', 'hidden')
    document.body.style.paddingRight = 0
    // -- 메인 스크롤바 숨김 처리

    window.onstorage = () => {
      if (!localStorage.uuid || localStorage.uuid !== this.items.user.userID) {
        this.$hiClass.alert('로그인 정보가 변경되었습니다.<br>창을 닫습니다.', 'info')
          .then(() => {
            window.close()
          })
      }
    }
  },
  beforeDestroy() {
    eventBus.$off('note-board-new')
    eventBus.$off('note-board-change-posted')
    // use summernote
    // eventBus.$off('note-board-editor-resize')
    eventBus.$off('note-board-change-class')
    eventBus.$off('note-board-move-class')
    eventBus.$off('editor-on-click-contents')
    eventBus.$off('froala-editor-init-complete')
    eventBus.$off('is-changed-class-settings')
    eventBus.$off('note-board-set-is-selected-reserve')
    eventBus.$off('note-board-change-folderId')
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
    document.body.style = ''
  },
  methods: {
    ...mapMutations({
      setCurClazzNote: 'setCurClazzNote',
      setIsEditorLoading: 'setIsEditorLoading',
    }),
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions('storeEditor', {
      getBoardList: 'getBoardList'
    }),
    setFolderId(folderId) {
      this.folderId = folderId
    },
    async initPage(data) {
      const isReloadEditor = this.model.version !== data.version

      this.option.postURI = ''
      // this.option.isPushParents = false
      // this.option.isPushStudent = false
      this.model = {
        parentUri: '',
        pushTarget: '',
        pushUsed: true,
        posted: data.posted,
        postStatus: '',
        postMustRead: false,
        postPin: false,
        postType: 'NOTE',
        postContent: '',
        files: [],
        filesRemoveQueue: [],
        updatedTimestamp: null,
        version: data.version || 'V2',
        postOptions: []
      }
      eventBus.$emit('editor-set-code', '')

      if (isReloadEditor) {
        await this.reloadEditor()
      }
    },
    getClass() {
      this.items.clazz.item = []
      this.$hiClass.clazzSubscribeViews
        .search({
          userId: this.items.user.userID,
          memberStatus: 'ACCEPT',
          sort: ['classYear,desc', 'insertedTimestamp,desc'],
          size: 100
        })
        .then(res => {
          res.data._embedded.clazzSubscribeViews.map(clazzSubscribeView => {
            // 관리자/매니저/활성화 체크
            if (
              clazzSubscribeView.classStatus === 'ACTIVATE' &&
              (clazzSubscribeView.memberRole === 'OWNER' ||
                clazzSubscribeView.memberRole === 'MANAGER')
            ) {
              const value = clazzSubscribeView.classId
              const text = clazzSubscribeView.className + this.getClazzNameSuffix(clazzSubscribeView.classYear)
              const self = `${process.env.VUE_APP_BASE_API_URI}/clazzes/${clazzSubscribeView.classId}`
              const schoolType = clazzSubscribeView.schoolType

              this.items.clazz.item.push({
                value,
                text,
                self,
                schoolType
              })
            }
          }, []) || []

          return this.items.clazz.currentId
        })
        .then(() => {
          this.findCurClass()
        })
        .catch(err => {
          this.$log.debug(this.$options.name, ' getClass() error => ', err)
        })
    },
    getClazzNameSuffix(classYear) {
      return classYear && classYear !== 'ANY' ? ` [${classYear}]` : ''
    },
    async getPostInfo() {
      // this.$hiClass.posts
      //   .read(this.option.postURI)
      //   .then(res => {
      //     this.postSetting(res.data)
      //   })
      //   .catch(err => {
      //     this.$log.debug(this.$options.name, ' getPostInfo() error => ', err)
      //   })

      const res = await this.$hiClass.posts.read(this.option.postURI)
      this.postSetting(res.data)
    },
    postSetting(item) {
      const isReloadEditor = this.model.version !== item.version

      this.model.files = item.files || []
      this.model.filesRemoveQueue = []
      Object.assign(this.savedFiles, item.files)

      this.model.currentId = item.currentId
      this.model.posted = item.posted
      this.model.postTitle = item.postTitle || null
      this.model.postContent = this.getPostContentEditor(item.postContent)
      this.model.postMustRead = item.postMustRead
      this.model.postPin = item.postPin
      this.model.postStatus = item.postStatus
      this.model.pushTarget = item.pushTarget
      this.model.updatedTimestamp = item.updatedTimestamp

      this.model.postOptions = item.postOptions

      this.model.version = item.version

      this.model.folderId = item.folder.folderId
      this.model.boardId = item.boardId

      eventBus.$emit('editor-set-code', this.model.postContent)
      eventBus.$emit('safe-set', this.model.currentId, this.model.postOptions)
      // eventBus.$emit('safe-set-postOptions', this.model.postOptions)

      if (isReloadEditor) {
        this.reloadEditor()
      }

      this.checkPushTargetProc()
    },
    moveClass() {
      this.isAutoSave(
        '작성하신 내용을 임시저장하고 내 클래스로 이동하시겠습니까?',
        `수정된 내용이 있습니다.\n${this.curClazzNote.name}${this.curClazzNote.suffix1} 보내지않고 내 클래스로 이동하시겠습니까?`
      ).then(res => {
        if (res) {
          if (opener) {
            opener.location.href = `/main/clazzes/${this.items.clazz.currentId}/note`
            window.close()
          }
        }
      })
      .catch(err => {
        this.$log.warn(this.$options.name + ' isAutoSave() reject err => ', err)
        alert(this.$t('common.error.save'))
      })
    },
    isAutoSave(tempMassage, compMassage) {
      return new Promise((resolve, reject) => {
        let isPost = false

        if (this.isSave) {
          isPost = true
          let confirmMassage = tempMassage
          if (this.isUpdate && this.model.postStatus === 'COMPLETE') {
            confirmMassage = compMassage
            isPost = false
          }

          if (confirmMassage !== '') {
            if (!confirm(confirmMassage)) {
              return resolve(false)
            }
          }
        }

        this.model.postStatus = 'TEMPORARY'

        this.setPostProc('TEMPORARY', isPost)
          .then(res => {
            if (res.result) {
              return resolve(true)
            } else {
              return resolve(false)
            }
          })
          .catch(err => {
            return reject(err)
          })
      })
    },
    changePosted(item) {
      if (item.postURI) {
        // 기존 알림장
        this.initPageConfirm(`이전 ${this.curClazzNote.name}${this.curClazzNote.suffix1} 불러오시겠습니까?`, () => {
          this.option.postURI = item.postURI
          this.getPostInfo()
        })
      } else {
        // 특정 날짜 새알림장 쓰기
        this.initPageConfirm(`새 ${this.curClazzNote.name}${this.curClazzNote.suffix1} 작성하시겠습니까?`, () => {
          // set post version
          const posted = item.posted
          let version = 'V2'

          /**
           * 클래스 변경 없이 새 알림장 쓰기
           */
          this.initPage({ posted, version }).then(() => {
            // 오늘날짜로 재선택시 현재 시간으로 세팅
            if (
              this.$moment(item.posted).format('YYYYMMDD') ===
              this.$moment(this.currentTimestamp).format('YYYYMMDD')
            ) {
              this.model.posted = this.currentTimestamp
            }
            this.$nextTick(() => {
              eventBus.$emit(
                'note-board-calendar-set-sub-component',
                'NoteBoardCalendarReserve'
              )
            })
          })
        })
      }
    },
    initPageConfirm(addMsg, result) {
      if (this.isSave) {
        if (confirm(`작성 중인 내용이 저장되지 않습니다.\n${addMsg}`)) {
          result()
        }
      } else {
        result()
      }
    },
    closeModal() {
      this.option.modalComponent = ''
    },
    setPost(type) {
      if (type === 'COMPLETE' || type === 'RESERVE') {
        this.option.modalComponent = ''
      }

      // V2 analytics 추가
      if (this.model.version === 'V2') {
        const clickButton = type === 'TEMPORARY' ? type : 'COMPLETE'
        this.triggerAnalyticsLogEvent({ code: `analytics.class.click.button.note.post.write.${clickButton.toLocaleLowerCase()}` })
      }

      this.setPostProc(type, true)
        .then(res => {
          if (res.result) {
            try {
              this.goRouteOpener()

              if (this.model.postStatus === 'TEMPORARY') {
                if (res.data) {
                  this.model.updatedTimestamp = res.data.updatedTimestamp
                  this.model.currentId = res.data.currentId
                  this.option.postURI = res.data._links.self.href
                } else {
                  /**
                   * PATCH 업데이트 이후 response.data를 서버에서 리턴하지 않음
                   */
                  this.model.updatedTimestamp = this.$moment().valueOf()
                }
              } else {
                localStorage.setItem('remindClassMemberEmpty', 'true')
                window.close()
              }
            } catch (err) {
              this.$log.warn(this.$options.name + ' setPostProc() err => ', err)
              alert(this.$t('common.error.save'))
            }
          }
        })
        .catch(err => {
          this.$log.warn(this.$options.name + ' setPostProc() reject err => ', err)
          alert(this.$t('common.error.save'))
        })
    },
    setPostProc(type, isSave) {
      return new Promise(async (resolve, reject) => {
        if(this.$refs.note_board_footer.safeUseOn === true) {
          const message = this.$refs.note_board_footer.safeMessage
          const categoryId = this.$refs.note_board_footer.safeCategorySelect.categoryId
          if(message.trim() === "") {
            this.$hiClass.alert("안전 수칙 문구를 입력해주세요.", 'error')
            return;
          }

          const arr = [{
            name : "safetyRoles",
            value : message
          },{
            name : "categoryId",
            value : categoryId
          }]

          this.model.postOptions = [...this.model.postOptions.filter(v => v.name !== "safetyRoles" && v.name !== "categoryId"), ...arr]
        } else if (this.$refs.note_board_footer.safeUseOn === false) {
          const index = this.model.postOptions.findIndex(v => v.name === "safetyRoles")
          if(index > -1) {
            this.model.postOptions = this.model.postOptions.map(item => {
              if(item.name === "categoryId" || item.name === "safetyRoles") {
                return {
                  ...item,
                  value: ""
                }
              } else {
                return item
              }
            })
          }
        }

        if (isSave) {
          // 에디터 화면 컨텐츠 v-model 동기화
          // eventBus.$emit('editor-sync-content')
          if(type === 'RESERVE') {
            this.model.disclosureType = false
          }
          this.backupResource('model', this.model)

          if (this.postContentCode.bytes > this.edit.maxByte) {
            const editMaxByteWithCommas = this.$stringUtil.addCommas(
              this.edit.maxByte
            )
            alert(
              `${this.curClazzNote.name}${this.curClazzNote.suffix2} 최대 ${editMaxByteWithCommas} byte 까지 입력 가능 합니다.\n(한글 파일에서 복사-붙여넣기 할 경우, 실제 입력된 글자수보다 더 많이 입력된 것처럼 계산될 수 있습니다.)`
            )
            resolve({ result: false, data: null })
          } else {
            // 발송 대상
            this.setPushTarget()

            // 임시저장이거나 임시저장 상태에서 최초발송한 경우 현 시간으로 posted 세팅
            if (!this.isReserve && !this.isSendComplete)
              this.model.posted = new Date().getTime()

            this.model.parentUri = `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.items.clazz.currentId}`
            this.model.postStatus = type
            let method = 'create'
            if (this.isUpdate) {
              method = 'update'
            }

            // files 안에 있는 video 중 에디터 내에 없는 video 는 files 에서 삭제 처리
            if (this.videoFiles.length > 0) {
              await this.deleteUnUsedVideoFiles()
            }

            // 에디터내에서는 지워졌지만 파일서버에 업로드된 파일 삭제
            this.deleteUnusedFiles(method)

            try {
              await this.externalImageReplace()
            } catch (e) {
              this.option.isUpload = false
              return false
            }

            try {
              this.isDimLoading = true
              await this.encodingFiles()
            } catch (e) {
              this.$log.error(e)
            } finally {
              this.isDimLoading = false
              this.backupResource('model', this.model)
            }

            await this.orderFiles()

            // 기존 post.version 이 잘못 저장되었을 경우 강제 버전 변경
            if (this.model.version === null && this.$route.query.version) {
              this.model.version = this.$route.query.version
            }

            if (this.model.version === 'V2') {
              /**
               * set editor content
               */
              this.model.postContent = this.replacePostContentEditor(this.model.postContent)

              /**
               * set editor imagePack files
               */
              this.model.postContent = this.getPostContentImagePackFiles(this.model.postContent, this.imagePackFiles)

              /**
               * set editor doc files
               */
              this.model.postContent = this.getPostContentDocFiles(this.model.postContent, this.docFiles)

              /**
               * replaceAll color RGB to Hex (app editor compatible)
               */
              this.model.postContent = this.$stringUtil.replaceRgbToHex(this.model.postContent)

              let regex = new RegExp('귀하의 브라우저는 html5 video를 지원하지 않습니다.', "gi")
              this.model.postContent = this.model.postContent.replace(regex, "")
            }

            this.model.postContent = this.$replaceStrongToBTag(this.model.postContent)

            // postContent value 중 에디터에 표현되면 안 되는 태그가 포함되어 있으므로 화면이 갱신되기 전에 별도의 model로 요청을 보냄
            const postModel = Object.assign({}, this.model)
            // postContent 에디터 사양으로 초기화
            this.reloadPostContent()
            //폴터선택 2가지 추가(postModel)
            //boardId: 게시판 ID
            //categoryId: 폴더(카테고리) 아이디
            postModel.boardId = this.boardId
            postModel.categoryId = this.folderId ? this.folderId : this.defaultFolder.folderId

            if(postModel.pushTarget === 'ALL') {
              postModel.userType = ["TEACHER", "STUDENT", "PARENTS"]
            } else {
              postModel.userType = ["TEACHER", postModel.pushTarget]
            }

            this.$hiClass.posts[method](postModel, this.option.postURI)
              .then(res => {
                if (res) {
                  resolve({ result: true, data: res.data })
                } else {
                  resolve({ result: false, data: null })
                }

                if (this.model.postStatus === 'TEMPORARY')
                  this.toastMessageTemporaryPost()
              })
              .catch(err => {
                this.$log.debug(this.$options.name, ' setPost() error => ', err)
                this.restoreResource('model')
                reject(err)
              })
          }
        } else {
          resolve({ result: true, data: null })
        }
      })
    },

    setPushTarget() {
      let pushTarget = 'TEACHER'

      if (
        this.option.isPushTeacher &&
        this.option.isPushParents &&
        this.option.isPushStudent
      ) {
        pushTarget = 'ALL'
      } else if (this.option.isPushParents) {
        pushTarget = 'PARENTS'
      } else if (this.option.isPushStudent) {
        pushTarget = 'STUDENT'
      }

      this.model.pushTarget = pushTarget
    },

    checkPushTarget() {
      return new Promise(resolve => {
        resolve (
          ['isPushParents', 'isPushStudent'].filter(item =>
            // 수신 대상이 지정되었지만, 클래스 설정에서 읽기 권한이 없는 경우
            this.option[item] && this.option.disabled[item]
          )
        )
      })
    },

    checkPushTargetProc() {
      // 게시글의 수신대상 변경 체크
      if (this.isUpdate && this.model.postStatus !== 'COMPLETE') {
        this.$nextTick(async () => {
          try {
            const changedPushTargets = await this.checkPushTarget()
            if (changedPushTargets.length > 0) {
              this.$hiClass.alert('기존에 설정하신 수신대상이 변경되었습니다')
                .then(() => { changedPushTargets.forEach(item => this.option[item] = false) })
            } // end if
          } catch (e) {
            this.$log.error(e)
          }
        })
      }
    },

    goRouteOpener() {
      if (opener !== undefined) {
        this.$log.debug(`opener => `, opener)
        const protocol = window.location.protocol
        const hostname = window.location.hostname
        const port = this.$comn.getLocationPort()
        const domainUrl = protocol + '//' + hostname + port

        let parentControlMessage = ''

        if (this.option.goMain) {
          parentControlMessage = 'routeMainHome'

        } else {
          const params = {
            boardId: this.boardId
          }
          if (this.isUsedFolder) {
            params.folderId = this.folderId
          }
          parentControlMessage = `routeMainClazzesNote|${this.items.clazz.currentId}|${this.$qs.stringify(params)}`
        }

        opener.postMessage(parentControlMessage, domainUrl)
      }
    },
    toastMessage(message) {
      this.$toasted.show(message)
    },
    toastMessageTemporaryPost() {
      this.toastMessage('임시저장되었습니다.')
    },
    findCurClass() {
      const classId = this.items.clazz.currentId
      const curClass = this.items.clazz.item.find(d => d.value === classId)

      if (curClass) {
        const curClazzNote = {
          classId: curClass.value,
          schoolType: curClass.schoolType
        }

        if (this.$constants.SCHOOL_TYPE.notBlackBoard.includes(curClass.schoolType)) {
          curClazzNote.name = '공지'
          curClazzNote.suffix1 = '를'
          curClazzNote.suffix2 = '는'
          curClazzNote.suffix3 = '가'
        } else {
          curClazzNote.name = '알림장'
          curClazzNote.suffix1 = '을'
          curClazzNote.suffix2 = '은'
          curClazzNote.suffix3 = '이'
        }

        this.setCurClazzNote(curClazzNote)
      }
    },

    getPostContentEditor(postContent) {
      try {
        let domParser = new DOMParser()
        let postContentDocument = domParser.parseFromString(postContent, 'text/html')
        let editorElement = null
        const documentBody = postContentDocument.body

        if (documentBody)
          editorElement = documentBody.querySelector('.class-fr-editor')

        // editorElement.querySelectorAll('span.fr-video.fr-draggable')
        //   .forEach(node => node.classList.remove('fr-draggable'))

        // fixed no controls video
        if (editorElement) {
          const videos = editorElement.querySelectorAll('video')
          for (const video of videos) {
            video.controls = true

            const videoSrc = video.firstElementChild && video.firstElementChild.src
            const videoFile = this.model.files.find(d => d.fileOriginalPath === videoSrc)

            if(videoSrc && videoFile) {
              video.firstElementChild.src = videoFile.fileTranscodePath || videoFile.fileOriginalPath
            }

            if (videoSrc && videoFile && videoFile.fileThumbnailPath && videoFile.fileThumbnailPath !== '')
              video.poster = videoFile.fileThumbnailPath
          }

          const frVideoEls = editorElement.querySelectorAll('.fr-video')
          for (const frVideoEl of frVideoEls) {
            frVideoEl.setAttribute('contenteditable', 'false')
          }

          return editorElement.innerHTML
        } else {
          return postContent
        }

      } catch (e) {
        this.$log.error(`getPostContentEditor error => `, e)
        return postContent
      }

    },

    replacePostContentEditor(postContent) {
      let domParser = new DOMParser()
      let postContentDocument = domParser.parseFromString(postContent, 'text/html')
      let editorContentElement = null
      const documentBody = postContentDocument.body

      if (documentBody)
        editorContentElement = documentBody.querySelector('.class-fr-editor')

      if (editorContentElement === null) {
        let editorElement = postContentDocument.createElement('div')
        editorElement.className = 'class-fr-editor'
        editorElement.innerHTML = documentBody ? documentBody.innerHTML : ''
        return editorElement.outerHTML

      } else {
        return editorContentElement.innerHTML
      }
    },

    getPostContentDocFiles(postContent, docFiles) {
      let domParser = new DOMParser()

      let postContentDocument2 = domParser.parseFromString(postContent, 'text/html')
      if (docFiles.length > 0) {
        let filesDivElement = postContentDocument2.createElement('div')
        filesDivElement.className = 'file-list'

        for (const docFile of docFiles) {
          let filesAnchorElement = postContentDocument2.createElement('a')
          filesAnchorElement.href = 'javascript:void(0);'

          let filesSpanFileNameElement = postContentDocument2.createElement('span')
          filesSpanFileNameElement.className = 'attached-file-name'
          filesSpanFileNameElement.innerText = docFile.fileName

          let filesSpanPreViewElement = postContentDocument2.createElement('span')
          filesSpanPreViewElement.className = 'attached-preview'

          let filesImgPreViewElement = postContentDocument2.createElement('img')
          filesImgPreViewElement.src = docFile.fileThumbnailPath
          filesImgPreViewElement.alt = ""

          // span | img
          filesSpanPreViewElement.appendChild(filesImgPreViewElement)

          // a | span
          //   | span | img
          filesAnchorElement.appendChild(filesSpanFileNameElement)
          filesAnchorElement.appendChild(filesSpanPreViewElement)

          // div | a | span
          //         | span | img
          filesDivElement.appendChild(filesAnchorElement)

          // doc 썸네일이 없을 경우 썸네일 영역 삭제
          if (!docFile.fileThumbnailPath)
            filesSpanPreViewElement.remove()
        }

        postContentDocument2.body.appendChild(filesDivElement)

        this.$log.debug(`postContentDocument2.body.innerHTML : `, postContentDocument2.body.innerHTML)

        postContent = postContentDocument2.body.innerHTML
      }

      return postContent
    },

    getPostContentImagePackFiles(postContent, imagePackFiles) {
      const domParser = new DOMParser()

      const postContentDocument3 = domParser.parseFromString(postContent, 'text/html')

      if (imagePackFiles.length > 0) {
        const filesDivElement = postContentDocument3.createElement('div')
        filesDivElement.className = 'img-list'

        const filesDivElement2 = postContentDocument3.createElement('div')
        filesDivElement2.className = 'img-list-inner'

        for (const imagePackFile of imagePackFiles) {
          const filesAnchorElement = postContentDocument3.createElement('a')
          filesAnchorElement.href = 'javascript:void(0);'

          const filesImgThumbnailElement = postContentDocument3.createElement('img')
          // filesImgThumbnailElement.src = imagePackFile.fileThumbnailPath
          filesImgThumbnailElement.src = imagePackFile.fileOriginalPath
          filesImgThumbnailElement.alt = ""


          // a | img
          filesAnchorElement.appendChild(filesImgThumbnailElement)

          // div | a | img
          filesDivElement2.appendChild(filesAnchorElement)
        }
        // div | div | a | img
        filesDivElement.appendChild(filesDivElement2)

        postContentDocument3.body.appendChild(filesDivElement)

        this.$log.debug(`postContentDocument3.body.innerHTML : `, postContentDocument3.body.innerHTML)

        postContent = postContentDocument3.body.innerHTML
      }

      return postContent

    },

    getClazz(classId) {
      const url = `${this.$apiUrl}/clazzes/${classId}`

      return new Promise((resolve, reject) => {
        this.$hiClass.clazzes.read(url)
          .then(res => {
            this.clazz = res.data
            this.getBoardId(classId)
            return resolve(this.clazz)
          })
          .catch(error => {
            this.$hiClass.alertError()
            return reject(error)
          })
      })
    },

    getBoardId(classId) {
      const params = {postType: 'NOTE', includeDeactivate: true, classId, includeDefaultFolder: true}
      this.getBoardList(params).then(res => {
        if (!isEmpty(res)) {
          this.board = res[0]
          this.defaultFolder = res[0].folderList[0]
          this.boardId = res[0].boardId
          this.isUsedFolder = res[0].isUsedFolder
        }
      })
    },

    closeAttach() {
      this.$nextTick(() => {
        this.$hiClass.toggleBodyClass('add', 'hidden')
      })
    },

    async reloadEditor() {
      eventBus.$emit('editor-destroy')
      this.editorComponentKey++
    },
    reloadPostContent() {
      this.model.postContent = this.getPostContentEditor(this.model.postContent)
    },

    backupResource(key, resource) {
      this.oldResource[key] = Object.assign({}, resource)
    },
    restoreResource(...keys) {
      keys.forEach(key => {
        for (const [k, v] of Object.entries(this.oldResource[key])) {
          this[key][k] = v
        }
      })
    },

    async reloadClazz(key) {
      await this.getClazz(this.clazz.currentId)
      this.checkPushTargetProc()
      localStorage.removeItem(key)
    },

    // 파일 처리 ==========================================================================
    // 이미지 태그 src 치환, files 정보에 추가
    async externalImageReplace() {
      this.option.isUpload = true

      const parser = new DOMParser()
      const content = parser.parseFromString(this.model.postContent, 'text/html')
      const imgElements = content.getElementsByTagName('img')

      for (let imgElement of imgElements) {
        this._removeImgTagAttrs(imgElement) // 불필요한 태그 속성 제거
        const imgSrc = imgElement.getAttribute('src')

        if (!imgSrc.includes('download.hiclass.net') && !imgSrc.includes('base64')) { // 외부 이미지 주소이면 & base64 아니면
          try {
            const uploadFile = await this._externalImageUpload(imgSrc) // 이미지 업로드
            this.model.files.push(uploadFile) // files 추가
            imgElement.src = uploadFile.fileOriginalPath // img src 교체

          } catch (e) {
            this.$hiClass.alert('이미지 파일 중 업로드가 불가능한 파일이<br>포함되어 있어 자동 삭제됩니다.', 'warning')
            imgElement.remove() // postContent 내 el 삭제
            throw new Error(e)

          } finally {
            this.model.postContent = content.body.innerHTML
          }
        }
      }
      this.model.postContent = content.body.innerHTML
      this.option.isUpload = false
    },

    // 불필요한 element 속성값 삭제
    _removeImgTagAttrs(imgElement) {
      imgElement.getAttributeNames().forEach(attr => {
        if (attr !== 'src' && attr !== 'class' && attr !== 'style') {
          imgElement.removeAttribute(attr)
        }
      })
    },

    // 외부 이미지 업로드
    async _externalImageUpload(imgSrc) {
      try {
        const res = await this.$axios({
          method: 'POST',
          url: `${process.env.VUE_APP_BASE_FILE_URI}/multipart/external/image`,
          data: {file: imgSrc},
          headers: {'Content-Type': 'application/json'}
        })

        const ext = res.data.filename.split('.')[1]
        let fileContentType = ''
        switch (ext.toLowerCase()) {
          case 'jpeg':
          case 'jpg':
            fileContentType = 'image/jpeg'
            break
          case 'png':
          case 'gif':
            fileContentType = `image/${ext.toLowerCase()}`
            break
          default:
            fileContentType = res.data.fileContentType
        }

        return {
          'fileName' : res.data.filename,
          'fileSize' : res.data.size,
          'fileOriginalPath' : res.data._links.original.href,
          'fileContentType' : fileContentType
        }

      } catch (e) {
        this.$log.warn(e)
        throw new Error(e)
      }
    },

    // 미사용 영상 파일 삭제
    deleteUnUsedVideoFiles() {
      let modelFiles = _.cloneDeep(this.model.files)
      let filteredFiles = _.cloneDeep(this.model.files)

      try {
        const parser = new DOMParser()
        const content = parser.parseFromString(this.model.postContent, 'text/html')
        const videoEls = content.getElementsByTagName('video')

        const videoSrcArr = []
        for (let videoEl of videoEls) {
          const src = videoEl.firstElementChild && videoEl.firstElementChild.src
          if (src) {
            videoSrcArr.push(src)
          }
        }
        filteredFiles = modelFiles.filter(file => {
          if (file.fileContentType.startsWith('video')) {
            // 본문 내에 포함되어 있는 video 인지 체크
            return videoSrcArr.includes(file.fileOriginalPath) || videoSrcArr.includes(file.fileTranscodePath)
          } else {
            return true
          }
        })
      } finally {
        this.model.files = filteredFiles
      }
    },

    // 미사용 파일 삭제
    deleteUnusedFiles(mode) {
      const filePathArr = this.model.files.map(file => file.fileOriginalPath)
      let deleteFiles = []
      deleteFiles.push(...this.addedFiles.filter(addedFile => {
        if (!filePathArr.includes(addedFile.fileOriginalPath)) {
          return addedFile
        }
      }))
      if (mode === 'update') {
        deleteFiles.push(...this.savedFiles.filter(addedFile => {
          if (!filePathArr.includes(addedFile.fileOriginalPath)) {
            return addedFile
          }
        }))
      }

      let deleteApi = []
      deleteFiles.forEach(file => {
        deleteApi.push(this.$hiClass.multipart.delete(file))
      })
      Promise.allSettled(deleteApi)
    },

    // 파일 인코딩 시도
    async encodingFiles() {
      // 동영상 인코딩: 수정 시 기존에 등록되었던 동영상은 인코딩 요청 안함 (seq, fileTranscodePath 로 판단)
      // seq, fileTranscodePath and 조건 이유: 게시글 복사시에는 인코딩 된 동영상을 복사한 경우 seq는 없지만 fileTranscodePath는 있기때문에 (이미 인코딩된 상태이므로 요청 보낼 필요 없음)
      const newVideoFiles = this.model.files.filter(file => file.fileContentType.startsWith('video') && !file.seq && !file.fileTranscodePath && !file.requestId)

      if (newVideoFiles.length > 0) {
        const failFiles = []
        const wait = (timeToDelay) => new Promise((resolve) => setTimeout(resolve, timeToDelay))

        for (let i = 0; i < newVideoFiles.length; i++) {
          try {
            await this.callMultipartEncode(newVideoFiles[i])
          } catch (e) {
            failFiles.push(newVideoFiles[i])
          }
        }

        // 인코딩 실패한 동영상 재시도
        if (failFiles.length > 0) {
          await wait(1000)

          for (let i = 0; i < failFiles.length; i++) {
            try {
              await this.callMultipartEncode(failFiles[i])
            } catch (e) {
              this.$log.debug(`video encode error => `, e)
            }
          }
        }
      }
    },

    // 파일 인코딩 api 호출
    async callMultipartEncode(file) {
      const encodeRes = await this.$hiClass.multipart.encode({
        fileOriginalPath: file.fileOriginalPath
      })

      const requestId = encodeRes.data.requestId
      if (requestId) {
        file.requestId = requestId
      }
    },

    // 파일 순서 정렬
    async orderFiles() {
      let domParser = new DOMParser()
      let postContentDocument = domParser.parseFromString(this.model.postContent, 'text/html').body
      const elements = postContentDocument.querySelectorAll('img, source')
      let editorFiles = []
      const modelFiles = _.cloneDeep(this.model.files)

      for (let i = 0; i < elements.length; i++) {
        const src = elements[i].src
        let targetIdx = -1
        if (elements[i].tagName === 'SOURCE') { // 영상
          targetIdx = modelFiles.findIndex(file => file.fileOriginalPath === src || file.fileTranscodePath === src)
        } else { // 이미지
          targetIdx = modelFiles.findIndex(file => file.fileOriginalPath === src)
        }

        if (targetIdx > -1) {
          editorFiles.push(...modelFiles.splice(targetIdx, 1))
        }
      }

      let imagePackFiles = []
      for (let i = modelFiles.length - 1; i >= 0; i--) {
        if (modelFiles[i].fileFlag === 'IMAGE_PACK') {
          imagePackFiles.unshift(...modelFiles.splice(i, 1))
        }
      }

      this.model.files = [...editorFiles, ...imagePackFiles, ...modelFiles]
    },

  }
}
</script>

<style scoped>
.is-over-post-content > span {
  color: red;
}
.attaching-file-margin-top {
  margin-top: 50px;
}
.note-edit-wrap .title-wrap .info-video-message {
  visibility: hidden;
	position: absolute;
  bottom: -40px;
  left: 390px;
  width: auto;
  height: auto;
  background: rgba(71,120,222,.9);
  border-radius: 40px;
  text-align: center;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  padding: 8px 10px;
  z-index: 9999;
  line-height: 30px;
  /* animation: showout 1s ease-in-out 5s 1;
  animation-fill-mode: forwards; */

  animation: hideShowHideGuideText 16s ease-out 1 forwards;
  -webkit-animation: hideShowHideGuideText 16s ease-out 1 forwards;
  animation-delay: 1.8s;
  -webkit-animation-delay: 1.8s;
}

.note-edit-wrap .title-wrap .info-video-message:after {
  content: '';
	position: absolute;
	left: 0;
	top: 50%;
	width: 0;
	height: 0;
	border: 10px solid transparent;
	border-right-color: rgba(71,120,222,.9);
	border-left: 0;
	border-bottom: 0;
	margin-top: -5px;
	margin-left: -9px;
}

@keyframes showout {
  0% {
        opacity: 1;
    }
    25% {
        opacity: 0.75;
    }
    50% {
        opacity: 0.5;
    }
    75% {
        opacity: 0.25;
    }
    100% {
        opacity: 0;
    }
}
</style>

<style>
/*
  sweetAlert2 auto hieght fix
 */
body.hidden.swal2-shown.swal2-height-auto {
  height: inherit !important;
}
</style>

<style lang="scss" scoped>
  // 얼럿창뜰때 화면 100%안되는 현상 수정
  .swal2-shown {
    &.swal2-height-auto {
      .note-edit-inner {
        .note-cont-wrap {
          &.type2 {
            height: calc(100vh - 170px);
          }
        }
      }
    }
  }
</style>