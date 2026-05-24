<!--
@File(Method): MainBodyClazzesLnb.vue
@Author: -
@Date Created: -
@Description: 클래스 lnb
@Modified: 2025-07-21 - #80732 폰트수정 (pretendrad) -투명 스크롤 class 추가
-->
<template>
  <div
    :key="isCurClassOwnerOrManager"
    class="column-lnb"
  >
    <div class="column__inner transparent-scr">
      <div class="hi-lnb">

        <h2 class="heading-board">
          {{ $t('main.clazzes.lnb.heading1') }}
          <button
            v-if="isCurClassOwnerOrManager"
            class="btn-setting"
            @click="onClickBoardManagement"
          >
            관리
          </button>
          <transition name="fade">
            <div
                class="hi-tooltip"
                v-if="isCurClassOwnerOrManager && isShowTooltip"
            >
              <span>게시판 추가, 변경이<br>가능해요.</span>
            </div>
          </transition>
        </h2>

        <ul class="lnb__list">
          <li
            v-for="(item, i) of lnbListBoard"
            :key="`${item.boardId}-${i}-${reRender.uncheckRequestCount}`"
            class="lnb__item"
            :class="{
              'is-active': getIsActive(item),
              'new': item.hasNewPost,
              'is-toggle': item.folderCount > 0 && item.isUsedFolder,
              'is-opened': openedBoardIds.includes(item.boardId),
            }"
          >
            <span
              role="button"
              @click="lnbListTabOnClazzes(item.postType, item.boardId, item.folderList, item.folderCount > 0 && item.isUsedFolder)"
            >
              <HiIcon name="ico-group-fill" color="gray" size="18" class="board-type-group" v-if="item.boardType === 'SECRET'" />
              {{ item.boardName }}
            </span>
            <!-- 
            <span
              role="button"
              @click="lnbListTabOnClazzes(item.postType, item.boardId, item.folderList, item.folderCount > 0 && item.isUsedFolder)"
              :class="{'secret': item.boardType === 'SECRET'}"
            >
              <span class="secret-ico"></span>
              {{ item.boardName }}
            </span>
            -->
            <ul
              v-show="openedBoardIds.includes(item.boardId)"
              class="folder__list"
            >
              <li
                v-for="(folder, folderIndex) of item.folderList"
                class="folder__item"
                :class="{
                  'is-active' : folder.folderId === selectedFolderId,
                  'new': folder.hasNewPost
                }"
                :key="`${folder.folderId}-${folderIndex}`"
              >
                <span
                  role="button"
                  @click="lnbListTabOnClazzesFolder(item.postType, item.boardId, folder.folderId)"
                >
                  <span
                    class="icon-color"
                    :style="{ 'background-color': folder.color }"
                  >
                    </span><span>{{ folder.folderName }}
                  </span>
                </span>

              </li>
            </ul>

          </li>
        </ul>

        <template v-if="classManagementList.length > 0">
          <div class="heading-admin">
            {{ $t('main.clazzes.lnb.heading2') }}
            <button
              v-if="isCurClassOwnerOrManager"
              class="btn-setting"
              @click="onClickClassManagement"
            >
              설정
            </button>
          </div>
          <ul class="lnb__list">
            <li
              v-for="(item, i) of classManagementList"
              :key="`${item.postType}-${i}`"
              class="lnb__item"
              :class="{
                'is-active': isCurrentTab(item.postType),
                new: getIsNew(item.postType) && item.postType !== 'SURVEY'
              }"
              @click="lnbListTabOnClazzes(item.postType, item.boardId)"
            >
              <span role="button">{{ item.text }}
                <span
                    v-if="item.postType === 'FORM' && (curClassItem.school.schoolType === 'KINDERGARTEN' || curClassItem.className.includes('유치원'))"
                    class="tooltip-ani type01"
                >
                  <span>투약의뢰서</span>
                </span>
              </span>
            </li>
          </ul>
        </template>

        <template v-if="manageClassList.length > 0">
          <div class="heading-admin">{{ isCurClassOwnerOrManager ? '관리자 메뉴' : '클래스 정보' }}</div>
          <ul class="lnb__list">
            <li
              v-for="(item, i) of manageClassList"
              :key="`${item.postType}-${i}`"
              class="lnb__item"
              :class="{
                'is-active': isCurrentTab(item.postType),
                new: item.postType === 'SURVEY' ? isNewSurveysExist : false
              }"
              @click="lnbListTabOnClazzes(item.postType, item.boardId)"
            >
              <span role="button">{{ item.text }}</span>
            </li>
          </ul>
        </template>

      </div>
    </div>
    <add-classroom
      v-if="isAddClassroom"
      @close="closeAddClassroomModal"
    />
  </div>
</template>

<script>
import {eventBus} from '@/main'
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import AddClassroom from '@/apps/behavior/components/popup/AddClassroom.vue'
import {openPopup} from "@/plugins/utils";
import CONSTANTS from "@/plugins/constants";
export default {
  name: 'main-body-clazzes-lnb',
  components: {
    AddClassroom
  },
  props: {
    clazzesCurrentTab: {
      type: Number
    }
  },
  data() {
    return {
      isLoading: false,
      isFindTab: false,
      isOpeningSurvey: false,
      isAddClassroom: false,
      reRender: {
        uncheckRequestCount: 0
      },
      lastPostByPostType: {},
      lastEntryBoardTimestamp: {},
      lastEntryFolderTimestamp: {},
      uncheck: {},
      surveyLastEntryTimestamp: 0,
      isNewSurveysExist: false,

      openedBoardIds: [],
      isShowTooltip: false,
      isUnconfirmedBusy: false,

      // 학교양식신청서 미확인 레드닷 (클래스 선생님일때만)
      isUnidentifiedClazzApplyExist: false
    }
  },
  computed: {
    ...mapState(['user', 'curClassItem', 'curClassSearchQuery', 'attendanceExpiredTime']),
    ...mapState('storeBoard', ['curBoardList', 'curBoardId', 'curBoardFolderId']),
    ...mapState('storeClazzes', ['attendance']),
    ...mapGetters(['isCurClassActivated', 'isCurClassOwnerOrManager', 'isExpired', 'curClassId', 'getIsFixed']),
    isMemberParents() {
      return !this.isCurClassOwnerOrManager && (this.user.userType === 'TEACHER' || this.user.userType === 'PARENTS')
    },
    isMemberStudent() {
      return !this.isCurClassOwnerOrManager && this.user.userType === 'STUDENT'
    },
    lnbListBoard() {
      let list = [
        {
          boardName: '최근 게시글',
          boardId: null,
          folder: [],
          postType: 'ALL',
          hasNewPost: false
        }
      ]

      if (Array.isArray(this.curBoardList) && this.curBoardList.length > 0) {
        const filteredList = this.curBoardList.filter(curBoard => {
          return this.isVisibleBoard(curBoard)
        })
        list.push(...filteredList)
      }

      return list
    },
    lnbList() {
      let list = []
      list.push(...this.lnbListBoard)
      list.push(...this.classManagementList)
      list.push(...this.manageClassList)

      return list
    },
    lnbListBoardByPosts() {
      const isPostTypes = ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK']
      return this.lnbListBoard.filter(d => isPostTypes.includes(d.postType))
    },

    classManagementList() {
      let list = []

      if (!this.isMemberStudent) {
        list.push({
          text: '출결 알리기',
          path: '/attendance',
          postType: 'ATTENDANCE'
        })
      }

      list.push({
        text: '설문·투표',
        path: '/survey',
        postType: 'SURVEY'
      })

      if (this.isUseMenuByClassPermission('apply')) {
        list.push({
          text: '학교 양식 신청서',
          path: '/form',
          postType: 'FORM'
        })
      }

      if (this.isCurClassOwnerOrManager) {
        list.push({
          text: '푸시 보내기',
          postType: 'PUSH'
        })
      }

      return list
    },

    manageClassList() {
      let list = []

      list.push({
        text: this.isCurClassOwnerOrManager ? '클래스 설정' : '클래스 정보',
        path: '/setting',
        postType: 'SETTING'
      })

      if (this.isCurClassOwnerOrManager) {
        list.push({
          class: 'lnb-permission',
          text: '게시판 관리',
          path: '/permission',
          postType: 'PERMISSION'
        })

        list.push({
          text: '구성원 관리',
          path: '/member',
          postType: 'MEMBER'
        })
      }

      if (this.isCurClassOwnerOrManager && this.isCurClassActivated) {
        list.push({
          text: '초대하기',
          path: '/invite',
          postType: 'INVITE'
        })
      }

      return list
    },

    selectedBoardId() {
      return this.curBoardId
    },
    selectedFolderId() {
      return this.curBoardFolderId
    }
  },
  watch: {
    lnbList(array, oldArray) {
      const key = b => `${b.boardId || b.boardName}${b.isUsedFolder || false}${b.folderCount || 0}`
      const arrayKeyString = array.map(key).join(',')
      const oldArrayKeyString = oldArray.map(key).join(',')
      if (array.length > 1) {
        if ((this.$route.params || {}).board === 'permission' && arrayKeyString !== oldArrayKeyString) {
          this.openedBoardIds = []
        }
        this.init()
      }
    },
    $route(from, to) {
      const prev = from.params.board
      const next = to.params.board

      if (prev !== next) this.init()
    },
    isCurClassOwnerOrManager(val) {
      if (val !== null) this.init()
    },
    'curClassItem.currentId'(val) {
      if (this.isCurClassOwnerOrManager && val) {
        if (this.$route.path.includes('/form')) {
          this.setIsUnIdentifiedClazzApplyExist(false)
          return
        }
        this.getIsUnidentifiedClazzApplyExist()
      }
    }
  },
  localStorage: {
    lastEntryBoardTimestamp: {
      type: Object,
      default: {},
    },
    lastEntryFolderTimestamp: {
      type: Object,
      default: {},
    },
    surveyLastEntryTimestamp: {
      type: Number,
      default: 0
    }
  },
  created() {
    eventBus.$on('clazzes-init-lnb-menu', () => {
      this.init()
    })
    eventBus.$on('set-last-entry-board-and-folder-timestamp', payload => {
      const folderList = this.lnbListBoard.find(boardItem => boardItem.boardId === payload.boardId).folderList
      const everyFolderHasNoNewPost = folderList.every(folderItem => !folderItem.hasNewPost)
      if (payload.boardId !== null && everyFolderHasNoNewPost) {
        this.setLastEntryBoardTimestamp(payload.boardId, this.curClassItem.currentId)
      }
      if (payload.folderId !== null) {
        this.setLastEntryFolderTimestamp(payload.folderId, this.curClassItem.currentId)
      }
    })
    eventBus.$on('set-is-unidentified-clazz-apply-exist', val => this.setIsUnIdentifiedClazzApplyExist(val))

    this.isOpeningSurvey = true
    setTimeout(() => {
      // 10초 후 new tag 숨김 처리
      this.isOpeningSurvey = false
    }, 10000)

    this.settingTooltip()
  },
  async mounted() {
    this.lastEntryBoardTimestamp = this.$localStorage.get('lastEntryBoardTimestamp')
    this.lastEntryFolderTimestamp = this.$localStorage.get('lastEntryFolderTimestamp')
    this.surveyLastEntryTimestamp = this.$localStorage.get('surveyLastEntryTimestamp')
    this.getHasNewSurveys(this.surveyLastEntryTimestamp)
      .then(res => this.isNewSurveysExist = res.data)

    eventBus.$on('call-lnb-list-tab-on-clazzes', payload => {
      const postType = payload.postType
      const boardId = payload.boardId
      const folderList = payload.folderList
      const existsFolder = payload.existsFolder
      const isAlwaysBoardOpen = payload.isAlwaysBoardOpen
      this.lnbListTabOnClazzes(postType, boardId, folderList, existsFolder, isAlwaysBoardOpen)
    })
    eventBus.$on('call-lnb-list-tab-on-clazzes-folder', payload => {
      const postType = payload.postType
      const boardId = payload.boardId
      const folderId = payload.folderId
      let changeFolderOff = false
      if(payload.changeFolderOff === true) changeFolderOff = payload.changeFolderOff
      this.lnbListTabOnClazzesFolder(postType, boardId, folderId, changeFolderOff)
    })
    eventBus.$on('init-lnb-red-dot', async payload => {
      await this.getUncheckPostsBoard(payload.lnbList)
      setTimeout(() => {
        this.initPostsCheckedTimestamp(payload.lnbList)
      }, 500)
    })

    // 게시판으로 직접 진입시 게시판 열림상태
    if (typeof this.$route.params.folderId !== 'undefined') {
      this.toggleFolder(this.$route.params.boardId)
    }

    setTimeout(async () => {
      // 레드닷 선생님만 표시
      if (this.isCurClassOwnerOrManager) {
        const isUnconfirmedAttendanceExist = await this.checkUnconfirmedAttendance({classId: this.$route.params.id})
        this.setAttendanceIsUnconfirmedAttendanceExist(isUnconfirmedAttendanceExist)
      }
    }, 100)
  },
  beforeDestroy() {
    eventBus.$off('clazzes-init-lnb-menu')
    eventBus.$off('set-last-entry-board-and-folder-timestamp')
    eventBus.$off('call-lnb-list-tab-on-clazzes-folder')
    eventBus.$off('init-lnb-red-dot')
    eventBus.$off('set-is-unidentified-clazz-apply-exist')

    this.setCurBoardId(null)
  },
  methods: {
    ...mapMutations(['setCurClazzesPosts', 'setClazzRemindPushModal']),
    ...mapMutations('storeBoard', ['setCurBoardId']),
    ...mapMutations('storeClazzes', [
      'setIsShowAttendanceNoUseModal',
      'setIsShowAttendanceConfirmUseModal1',
      'setIsShowAttendanceConfirmUseModal2',
      'setAttendanceApplyListSearchParams',
      'setAttendanceIsUnconfirmedAttendanceExist'
    ]),
    ...mapActions(['initCurClassSearchQuery', 'triggerAnalyticsLogEvent', 'openBehaviorRecordPopup']),
    ...mapActions('storeClazzes', ['checkUnconfirmedAttendance']),
    ...mapActions('storeSurvey', ['getHasNewSurveys']),
    ...mapActions('storeBehavior', ['getClassrooms']),
    async init() {
      await this.lnbTabSetting()
    },
    // 학생 행동기록 팝업 열기
    openStudentActionRecordPopup: async function() {
      const classrooms = await this.getClassrooms({isUsed: true})
      if(classrooms.page.totalElements > 0) {
        // this.openBehaviorRecordPopup({connectedClassId: this.curClassId}) //openPopup으로 전환
        openPopup(CONSTANTS.POPUP.BEHAVIOR_RECORD, {connectedClassId: this.curClassId})
      } else {
        this.isAddClassroom = true
      }
    },
    closeAddClassroomModal: function(classroom) {
      this.isAddClassroom = false
      if(classroom) {
        // this.openBehaviorRecordPopup({connectedClassId: this.curClassId}) //openPopup으로 전환
        openPopup(CONSTANTS.POPUP.BEHAVIOR_RECORD, {connectedClassId: this.curClassId})
      }
    },
    // 클래스 권한 참조
    isUseMenuByClassPermission(postType) {
      try {
        const postTypeLowerCase = postType.toLowerCase()
        const usedOnlyMenus = ['apply'] // 클래스 설정만 참조하는 메뉴

        if (usedOnlyMenus.includes(postTypeLowerCase)) {
          return this.curClassItem[`${postTypeLowerCase}Used`]
        } else {
          return false
        }

      } catch (e) {
        return false
      }
    },
    isVisibleBoard(board) {
      try {
        const isUsedBoard = board.boardStatus === 'ACTIVATE'
        // const isUsedFolder = board.isUsedFolder
        const exitsReadPermission = (this.isCurClassOwnerOrManager && (board.boardType !== 'SECRET' || ((board.boardPermission || {}).isReadable || false)))
          || (this.isMemberParents && board.isReadParents)
          || (this.isMemberStudent && board.isReadStudent)
          || ((board.boardPermission || {}).isReadable || false)

        return isUsedBoard && exitsReadPermission
      } catch (e) {
        return false
      }
    },
    async lnbListTabOnClazzes(postType, boardId, folderList, existsFolder, isAlwaysBoardOpen = false) {
      if (postType === 'NOTE' || postType === 'ALBUM' || postType === 'BOARD' || postType === 'HOMEWORK') {
        const hasRedDot = this.lnbListBoard.find(boardItem => boardItem.boardId === boardId).hasNewPost
        if (!existsFolder && hasRedDot) {
          this.lnbListBoard.find(boardItem => boardItem.boardId === boardId).hasNewPost = false
        }
      }

      if (this.isCurClassOwnerOrManager) {
        if (postType === 'FORM') {
          this.setIsUnIdentifiedClazzApplyExist(false)
        } else {
          // 학교양식신청서 에서 다른 메뉴로 이동 시에만 체크
          if (this.$route.path.includes('/form')) {
            await this.getIsUnidentifiedClazzApplyExist()
          }
        }
      }

      if (postType === 'PUSH') return this.showPushModal()

      // 폴더가 있는 게시판 클릭 시 토글만 처리
      if (existsFolder) {
        const isOpen = this.openedBoardIds.includes(boardId)
        if (!isOpen) { // 게시판이 열려있지 않을때만 새게시물 조회
          await this.getUncheckPostsFolder(boardId, folderList)
        }
        setTimeout(()=>{
          this.toggleFolder(boardId, isAlwaysBoardOpen)
        }, 100)
        return false
      }

      if (postType === 'SURVEY') {
        this.surveyLastEntryTimestamp = this.$moment().valueOf()
        this.isNewSurveysExist = false
      }

      if (postType === 'ATTENDANCE') {
        if (this.curClassItem.attendanceUsed === null) {
          this.$hiClass.alert('서비스 준비중입니다.', 'warning')
          return
        }

        let hasStudentList = false

        const res = await this.$axios({
          methods: 'GET',
          url: `/clazzStudents/clazz/${this.curClassId}/exists`
        })

        hasStudentList = res.data.exists

        // 사용여부 off일때
        if (!this.curClassItem.attendanceUsed) {
          if (this.isCurClassOwnerOrManager) { // 선생님
            if (hasStudentList) {
              this.setIsShowAttendanceConfirmUseModal1(true)
            } else {
              this.setIsShowAttendanceConfirmUseModal2(true)
            }
            return
          } else { // 학부모
            this.setIsShowAttendanceNoUseModal(true)
            return
          }
        } else {
          if (this.isCurClassOwnerOrManager) {
            if (!this.isUnconfirmedBusy) {
              try {
                this.isUnconfirmedBusy = true
                const isUnconfirmedAttendanceExist = await this.checkUnconfirmedAttendance({classId: this.$route.params.id})
                this.setAttendanceIsUnconfirmedAttendanceExist(isUnconfirmedAttendanceExist)
                this.isUnconfirmedBusy = false
              } catch (e) {
                this.isUnconfirmedBusy = false
              }
            }
          }
        }
      }

      if (!this.isLoading) {
        this.isLoading = true

        this.initCurClassSearchQuery()

        // TODO: 2022-09-20 파일 모아보기 숨김 처리
        eventBus.$emit('destroy-cur-post-files')

        const itemPath = postType === 'ALL' ? '' : postType.toLowerCase()
        let nextPath = `/main/clazzes/${this.$route.params.id}/${itemPath}`
        if (boardId) {
          nextPath += `/${boardId}`
        }
        const currentPath = this.$route.path

        // 최근 게시글 메뉴 클릭 시 100ms 지연이 없으면 true, false 조건이 둘 다 걸림
        if (nextPath === currentPath) {
          // TODO: 현재 게시판 새로 고침 (curClazzesPosts, postTop, Rnb)
          eventBus.$emit('refresh-cur-form')

        } else {
          this.$router.push(nextPath, () => {
          })
        }

        if (postType !== 'ALL') {
          let surfix = postType === 'SETTING' && !this.isCurClassOwnerOrManager ? '.member' : ''
          this.triggerAnalyticsLogEvent({code: `analytics.class.click.lnb.${postType.toLowerCase()}${surfix}`})
        }

        setTimeout(() => this.isLoading = false, 100)
      }
    },
    lnbListTabOnClazzesFolder(postType, boardId, folderId, changeFolderOff = false) {
      if (!this.isLoading && postType && boardId && folderId) {
        this.isLoading = true

        // 레드닷 제거
        const boardItem = this.lnbListBoard.find(lnbBoard => lnbBoard.boardId === boardId)
        const folderItem = boardItem.folderList.find(folderItem => folderItem.folderId === folderId)
        if (folderItem) {
          folderItem.hasNewPost = false
        }

        const isEveryFolderItemHasNoNewPost = boardItem.folderList.every(folder => !folder.hasNewPost)
        if (isEveryFolderItemHasNoNewPost) { // 게시판 하위 폴더들 모두 새로운 게시물이 없으면
          boardItem.hasNewPost = false
        }

        this.initCurClassSearchQuery()

        // TODO: 2022-09-20 파일 모아보기 숨김 처리
        eventBus.$emit('destroy-cur-post-files')

        let setfolderId = folderId
        if(changeFolderOff === true){
          setfolderId = ""
          this.openedBoardIds = [...this.openedBoardIds.filter(v => v !== boardId)]
        }

        const itemPath = postType.toLowerCase()
        const nextPath = `/main/clazzes/${this.$route.params.id}/${itemPath}/${boardId}/${setfolderId}`
        const currentPath = this.$route.path

        // 최근 게시글 메뉴 클릭 시 100ms 지연이 없으면 true, false 조건이 둘 다 걸림
        if (nextPath === currentPath) {
          // TODO: 현재 게시판 새로 고침 (curClazzesPosts, postTop, Rnb)
          eventBus.$emit('refresh-cur-form')
        } else {
          this.$router.push(nextPath, () => {
          })
        }

        setTimeout(() => this.isLoading = false, 100)
      }
    },
    lnbTabSetting() {
      this.isFindTab = false

      // 왼쪽 탭란 현재 url path에 따라 고정
      const path = this.$route.params.board ? `/${this.$route.params.board}` : ''

      let param = {}
      param.domain = 'clazzes'

      let boardIdx = this.lnbList
        .map(d => d['path'])
        .indexOf(path)
      if (boardIdx < 0) {
        param.domain = -1
        if (boardIdx < 0) param.index = 0

      } else {
        param.index = boardIdx
      }

      this.$emit('onChangeTab', param)
    },
    isCurrentTab(postType) {
      const curPath = this.$route.params.board ? `/${this.$route.params.board}` : ''
      const itemPath = postType === 'ALL' ? '' : `/${postType.toLowerCase()}`

      if (itemPath === curPath) {
        this.isFindTab = true
        return true
      } else {
        return false
      }
    },
    /**
     * 클래스 최초 진입 시 접근 가능한 모든 게시판 접근 시간 저장
     */
    initPostsCheckedTimestamp(lnbList) {
      const routeClassId = this.$route.params.id
      const classId = this.curClassItem.currentId || routeClassId

      for (const lnbItem of lnbList) {
        const boardId = lnbItem.boardId
        const folderList = lnbItem.folderList
        try {
          // 게시판 로컬스토리지 저장
          this.initLastEntryBoardTimestamp(boardId, classId)

          // 폴더 로컬스토리지 저장
          if (folderList.length > 0) {
            for (const folderItem of folderList) {
              const folderId = folderItem.folderId
              this.initLastEntryFolderTimestamp(folderId, classId)
            }
          }

        } catch (e) {
          this.$log.debug(e)
        }
      }
    },

    initLastEntryBoardTimestamp(boardId, classId) {
      if (typeof this.lastEntryBoardTimestamp[classId] === 'undefined') {
        this.lastEntryBoardTimestamp[classId] = {[boardId]: this.$moment().valueOf()}
      } else if (typeof this.lastEntryBoardTimestamp[classId][boardId] === 'undefined')
        this.lastEntryBoardTimestamp[classId][boardId] = this.$moment().valueOf()
      this.$localStorage.set('lastEntryBoardTimestamp', this.lastEntryBoardTimestamp)
    },

    initLastEntryFolderTimestamp(folderId, classId) {
      if (typeof this.lastEntryFolderTimestamp[classId] === 'undefined') {
        this.lastEntryFolderTimestamp[classId] = {[folderId]: this.$moment().valueOf()}
      } else if (typeof this.lastEntryFolderTimestamp[classId][folderId] === 'undefined')
        this.lastEntryFolderTimestamp[classId][folderId] = this.$moment().valueOf()
      this.$localStorage.set('lastEntryFolderTimestamp', this.lastEntryFolderTimestamp)
    },

    setLastEntryBoardTimestamp(boardId, classId) {
      try {
        this.lastEntryBoardTimestamp[classId][boardId] = this.$moment().valueOf()
      } catch (e) {
        this.lastEntryBoardTimestamp[classId] = {[boardId]: this.$moment().valueOf()}
      }
      this.$localStorage.set('lastEntryBoardTimestamp', this.lastEntryBoardTimestamp)
    },

    setLastEntryFolderTimestamp(folderId, classId) {
      try {
        this.lastEntryFolderTimestamp[classId][folderId] = this.$moment().valueOf()
      } catch (e) {
        this.lastEntryFolderTimestamp[classId] = {[folderId]: this.$moment().valueOf()}
      }
      this.$localStorage.set('lastEntryFolderTimestamp', this.lastEntryFolderTimestamp)
    },

    getUncheckPostsBoard(lnbList) {
      const classId = this.curClassItem.currentId
      let getApis = []

      for (const lnbItem of lnbList) {
        const boardId = lnbItem.boardId
        if (typeof this.lastEntryBoardTimestamp[classId] !== 'undefined' &&
          typeof this.lastEntryBoardTimestamp[classId][boardId] !== 'undefined') {
          const timestamp = this.lastEntryBoardTimestamp[classId][boardId]
          const requestUrl = `/clazzes/${classId}/boards/post/uncheck/${timestamp}`
          const getApi = this.$axios({
            method: 'get',
            url: requestUrl,
            params: {boardId: boardId}
          })
          getApis.push(getApi)
        }
      }

      Promise.all(getApis).then(responses => {
        responses.map(res => {
          if (res.data._embedded.boardList.length > 0) { // 새로운 게시물이 있으면
            const targetBoardId = res.data._embedded.boardList[0].boardId
            const targetBoard = this.lnbListBoard.find(board => board.boardId === targetBoardId)
            this.$set(targetBoard, 'hasNewPost', true) // 게시판 레드닷표시

            if (res.data._embedded.boardList[0].isUsedFolder) { // 게시판이 폴더를 사용하면
              this.getUncheckPostsFolder(targetBoardId, targetBoard.folderList)
            }

            // 클래스 최초진입시 새로운 글이 있는 게시판 열기 위함
            if (this.openedBoardIds.length === 0 && res.data._embedded.boardList[0].isUsedFolder) {
              this.toggleFolder(targetBoardId)
            }
          }
        })
      })
    },

    getUncheckPostsFolder(boardId, folderList) {
      const classId = this.curClassItem.currentId
      let getApis = []

      for (const folderItem of folderList) {
        const folderId = folderItem.folderId
        const timestamp = this.lastEntryFolderTimestamp[classId][folderId]
        const requestUrl = `/clazzes/${classId}/boardFolders/post/uncheck/${timestamp}`
        const getApi = this.$axios({
          method: 'get',
          url: requestUrl,
          params: {boardId: boardId, folderId: folderId}
        })
        getApis.push(getApi)
      }

      Promise.all(getApis).then(responses => {
        responses.map(res => {
          const exists = res.data.exists
          const targetFolderId = res.config.params.folderId
          const boardItem = this.lnbListBoard.find(lnbBoard => lnbBoard.boardId === boardId)
          const folderList = boardItem.folderList
          const folder = folderList.find(folderItem => folderItem.folderId === targetFolderId)

          this.$set(folder, 'hasNewPost', exists)
        })
      })
    },

    onClickBoardManagement() {
      const nextPath = `/main/clazzes/${this.$route.params.id}/permission`
      this.$router.push(nextPath, () => {
      })
    },

    onClickClassManagement() {
      const nextPath = `/main/clazzes/${this.$route.params.id}/class`
      this.$router.push(nextPath, () => {
      })
    },

    toggleFolder(boardId, isAlwaysBoardOpen = false) {
      const foundIndex = this.openedBoardIds.findIndex(closedBoardId => closedBoardId === boardId)
      if (foundIndex > -1) {
        if (!isAlwaysBoardOpen) {
          this.openedBoardIds.splice(foundIndex, 1)
        }
      } else {
        this.openedBoardIds.push(boardId)
      }
    },

    getIsActive(boardItem) {
      let flag = false

      // 클래스 게시판 이외의 메뉴가 활성화되어 있음
      if (this.isFindTab) {
        return false
      }
      
      const existsFolder = boardItem.folderCount > 0 && boardItem.isUsedFolder
      if (existsFolder) {
        flag = boardItem.boardId === this.selectedBoardId
      } else {
        flag = boardItem.boardId === this.selectedBoardId
          && !this.openedBoardIds.includes(boardItem.boardId)
      }

      return flag
    },

    /**
     * 로컬스토리지의 클래스 마지막 진입 날짜 체크하여 툴팁 표시
     */
    settingTooltip() {
      const routeClassId = this.$route.params.id
      const today = this.$moment().format('yyMMDD')

      // 로컬스토리지에 없으면
      if (!localStorage.getItem('classLastEntryDate')) {
        let classIdWithEntryDate = {}
        this.setLocalStorageAndShowTooltip(classIdWithEntryDate, routeClassId, today)
      }

      const lastEntryItem = JSON.parse(localStorage.getItem('classLastEntryDate'))
      // 로컬스토리지에 현재 클래스의 마지막 접속일이 있는데 오늘이 아니거나 현재 클래스의 마지막 접속일이 없을때
      if ((lastEntryItem[routeClassId] && lastEntryItem[routeClassId] !== today) || !lastEntryItem[routeClassId]) {
        this.setLocalStorageAndShowTooltip(lastEntryItem, routeClassId, today)
      }

      setTimeout(() => {
        this.isShowTooltip = false
      }, 4000)
    },

    /**
     * 툴팁 show true, 로컬스토리지에 현재 진입 정보 저장
     * @param lastEntryItem
     * @param routeClassId
     * @param today
     */
    setLocalStorageAndShowTooltip(lastEntryItem, routeClassId, today) {
      this.isShowTooltip = true
      lastEntryItem[routeClassId] = today
      localStorage.setItem('classLastEntryDate', JSON.stringify(lastEntryItem))
    },

    getIsNew(postType) {
      switch (postType) {
        case 'SURVEY': {
          return this.isNewSurveysExist
        }
        case 'ATTENDANCE': {
          return this.attendance.isUnconfirmedAttendanceExist
        }
        case 'FORM': {
          return this.isUnidentifiedClazzApplyExist
        }
        default: {
          return false
        }
      }
    },

    showPushModal() {
      this.setClazzRemindPushModal({
        isOpen: true,
        isGeneralType: true
      })
    },

    async getIsUnidentifiedClazzApplyExist() {
      const { data: { exists } } = await this.$axios.get(`/clazzApplies/unidentified/${this.curClassItem.currentId}`)
      this.setIsUnIdentifiedClazzApplyExist(exists)
    },
    setIsUnIdentifiedClazzApplyExist(val) {
      this.isUnidentifiedClazzApplyExist = val
    }
  }
}
</script>

<style scoped lang="scss">
.tooltip-ani{
  right: 36px; top: 5px;
}
.fade-leave-from {
  opacity: 1;
}
/* transition */
.fade-leave-active {
  transition: all 0.3s;
}
/* 끝 스타일 */
.fade-leave-to {
  opacity: 0;
}
.hi-lnb .lnb__item > span.secret {
    padding-left: 42px;
    &::after{
      display: none;
    }
}
.hi-lnb .lnb__item.new > span.secret {
    &::after{
      display: inline-block;
    }
}
</style>
