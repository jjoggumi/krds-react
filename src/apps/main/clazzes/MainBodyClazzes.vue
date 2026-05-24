<!--
@File(Method): MainBodyClazzes.vue
@Author: -
@Date Created: -
@Description: 클래스 메인
@Modified: 2024-12-26 - #69560 구성원 관리 태그 추가 : 구성원관리 페이지 rnb 비활성화
-->

<template v-model="watchRouter" :key="componentKey">
  <div>
    <layer-item positionType="WEB_POPUP_CLASS" />

    <main-body-clazzes-header v-if="isLoadClazz"/>

    <div class="cont-box-inner clfix">
      <banner-item
        v-if="isVisibleForm"
        :key="$store.state.bannerTimestamp + '-' + curForm"
        positionType="WEB_BANNER_QUICK_CLASS"
        isQuickClass="class-page"
        :banners="$store.state.banner.WEB_BANNER_QUICK_CLASS"
      />

      <main-body-clazzes-lnb
        :clazzesCurrentTab="clazzesCurrentTab"
        @onChangeTab="changeTab"
      />

      <main-body-clazzes-body
        v-if="isVisibleForm
          && curClassItem.currentId
          && clazzes.currentId
          && clazzSubscribeViews.length > 0
          && isInitBoardComplete
          && isSubscribe"
        :key="curForm"
        :curForm="curForm"
        :posts="posts"
        :userUri="user"
        :uuid="clazzUUID"
        :clazzes="clazzes"
        :clazzMemberRole="clazzMemberRole"
        :clazzSubscribesUri="clazzSubscribesUri"
        :isManager="isManager"
        :isClassActivated="isClassActivated"
        :isBusy="isBusy"
        @setCurForm="setCurForm"
      />
<!--      :isInitComp="isInitComp"-->

      <main-body-clazzes-rnb
          :parentUri="parentUri"
          v-if="isVisibleForm
          && !isDisabledRnb
          && curClassItem.currentId
          && clazzes.currentId
          && clazzSubscribeViews.length > 0
          && isInitBoardComplete"
      />

    </div>

    <class-year-remind
      v-if="clazzes.currentId
        && isManager
        && clazzes.classYear
        && clazzSubscribeViews.length > 0"
      :key="`class-year-remind-${clazzes.currentId}-${isManager}`"
      :clazz="clazzes"
    />

    <attendance-no-use-modal v-if="attendance.modal.isShowNoUseModal"/>
    <attendance-confirm-use-modal1 v-if="attendance.modal.isShowConfirmUseModal1"/>
    <attendance-confirm-use-modal2 v-if="attendance.modal.isShowConfirmUseModal2"/>
    <attendance-student-register-modal v-if="attendance.modal.isShowStudentRegisterModal"/>
    <attendance-student-register-complete-modal v-if="attendance.modal.isShowStudentRegisterCompleteModal"/>

    <main-body-class-created-new v-if="isClassCreatedNew"
      @close="closeClassCreatedNewFloating"
    />
  </div>
</template>

<script>
import MainBodyClazzesHeader from './MainBodyClazzesHeader.vue'
import MainBodyClazzesBody from './MainBodyClazzesBody.vue'
import MainBodyClazzesLnb from './MainBodyClazzesLnb.vue'
import MainBodyClazzesRnb from './MainBodyClazzesRnb.vue'
import MainBodyClassCreatedNew from './MainBodyClassCreatedNew.vue'
import LayerItem from '../../../components/Banner/LayerItem'
import BannerItem from '../../../components/Banner/BannerItem'

import { eventBus } from '@/main'
import ClassYearRemind from "@/components/Popup/ClassYearRemind";
import {mapFields} from "vuex-map-fields";
import {mapActions, mapGetters, mapMutations, mapState} from 'vuex'

import AttendanceNoUseModal from "@/apps/main/clazzes/attendance/modal/AttendanceNoUseModal";
import AttendanceConfirmUseModal1 from "@/apps/main/clazzes/attendance/modal/AttendanceConfirmUseModal1";
import AttendanceConfirmUseModal2 from "@/apps/main/clazzes/attendance/modal/AttendanceConfirmUseModal2";
import AttendanceStudentRegisterModal from "@/apps/main/clazzes/attendance/modal/AttendanceStudentRegisterModal";
import AttendanceStudentRegisterCompleteModal
  from "@/apps/main/clazzes/attendance/modal/AttendanceStudentRegisterCompleteModal";

export default {
  name: 'main-body-clazzes',
  props: {},
  data() {
    return {
      // isInitComp: false,
      initializedForm: 'ALL',
      curForm: 'ALL',
      posts: [],
      clazzUUID: '',
      userUUID: '',
      clazzesArr: ['ALL'],
      clazzUrl: '',
      classOwner: '',
      clazzMemberRole: '',    // 클래스 구독 권한 여부 확인!
      clazzSubscribesUri: '',
      clazzes: {},
      curPage: process.env.VUE_APP_BASE_PAGE_START,
      curSize: process.env.VUE_APP_BASE_PAGE_MIN_SIZE,
      count: 0,
      initScroll: false,
      clazzesCurrentTab: 0, // 초기에 전체 탭 활성
      refreshToGoSearch: false,
      componentKey: 0,
      isInitBoardComplete: false,
      isSubscribe: false, // 구독상태일때만 class body v-if
      isLoadClazz: false
    }
  },
  components: {
    ClassYearRemind,
    MainBodyClazzesHeader,
    MainBodyClazzesBody,
    MainBodyClazzesLnb,
    MainBodyClazzesRnb,
    LayerItem,
    BannerItem,
    AttendanceNoUseModal,
    AttendanceConfirmUseModal1,
    AttendanceConfirmUseModal2,
    AttendanceStudentRegisterModal,
    AttendanceStudentRegisterCompleteModal,
    MainBodyClassCreatedNew
  },
  computed: {
    ...mapFields({
      curWindow: 'curWindow',
      isCurClassManager: 'isCurClassManager',
      isDimLoading: 'isDimLoading',
      infiniteScroll: 'infiniteScroll'
    }),
    ...mapState({
      curClassItem: 'curClassItem',
      clazzSubscribeViews: 'clazzSubscribeViews',
      user: 'user',
      isClassCreatedNew: 'isClassCreatedNew',
    }),
    ...mapState('storeBoard', {
      curBoardList: 'curBoardList'
    }),
    ...mapState('storeHome', {
      joinWithInviteCodeSubscribe: 'joinWithInviteCodeSubscribe'
    }),
    ...mapState('storeClazzes', {
      attendance: 'attendance'
    }),
    ...mapGetters({
      getIsFixed: "getIsFixed",
    }),

    isVisibleForm() {
      return this.initializedForm === this.curForm
    },
    isDisabledRnb() {      
      return this.curForm === 'FORM' || this.curForm === 'SURVEY' || this.curForm === 'ATTENDANCE' || this.curForm === 'MEMBER' // #69560 구성원 관리 태그 추가 : 구성원관리 페이지 rnb 비활성화
    },
    isManager() {
      return this.clazzMemberRole === 'OWNER' || this.clazzMemberRole === 'MANAGER'
    },
    isParents() {
      return this.clazzMemberRole === 'MEMBER' && this.user.userType !== 'STUDENT'
    },
    isStudent() {
      return this.clazzMemberRole === 'MEMBER' && this.user.userType === 'STUDENT'
    },
    isClassActivated() {
      return this.clazzes.classStatus === 'ACTIVATE'
    },
    fiveYearsAgoDate() {
      return this.$moment()
        .subtract(5, 'year')
        .valueOf()
    },
    isBusy() {
      return this.$store.state.infiniteScroll.isBusy
    },
    parentUri() {
      const schoolUrl = `${this.$apiUrl}/schools/${this.curClassItem.school.currentId}`
      return [this.clazzUrl, schoolUrl]
    }
  },
  watch: {
    $route(to, from) {
      // this.$log.debug(`${this.$options.name} watch $route from => `, from)

      // 클래스 내에서 classId 변경 시 > 클래스 메인 페이지 리로드
      if (
        to.params.id !== undefined &&
        from.params.id !== undefined &&
        to.params.id !== from.params.id
      ) {
        this.doReloadClass()
        const curForm = to.params.board ? to.params.board.toUpperCase() : 'ALL'
        this.refreshCurForm(curForm)
        return false
      }
      // -- 클래스 내에서 classId 변경 시 > 클래스 메인 페이지 리로드

      if (to.params.board !== undefined) {
        // 상세레이어 팝업에서 같은 클래스 내의 다른 메뉴에 접근 할 경우 처리
        if (
          document.getElementsByClassName('modal').length > 0 &&
          to.params.id === from.params.id &&
          to.fullPath !== from.fullPath
        ) {
          this.doReloadClass()
          const curForm = to.params.board ? to.params.board.toUpperCase() : 'ALL'
          this.refreshCurForm(curForm)
          return false
        }
      }

      // 게시판 변경
      if (from.params.board !== to.params.board) {
        const curForm = to.params.board ? to.params.board.toUpperCase() : 'ALL'
        this.refreshCurForm(curForm)
        return false
      }

      if (to.fullPath.includes('calendarClassPosted')) {
        // 페이지 리로드
        this.doReloadClass()
        return false
      }

      if (
        to.query.refreshTime &&
        to.query.refreshTime !== from.query.refreshTime
      ) {
        this.$router.go(0)
        return false
      }
    },
    user: function (value, oldValue) {
      this.$log.debug(`oldValue => `, oldValue, `value => `, value)
      let isChanged = false
      if (value !== oldValue) isChanged = true

      try {
        if (isChanged && value._links.self.href !== undefined)
          this.checkCurUserClassSubscribe()

      } catch (e) {
        this.$log.warn(e)
      }
    },
    'clazzes.currentId'() {
      this.setCurClassItem(this.clazzes)
    },
    'isManager'() {
      this.isCurClassManager = this.isManager
    },
    curForm() {
      this.$scrollTo("body", { duration: 0 })
      this.initializedForm = this.curForm
    },
  },
  methods: {
    ...mapMutations(['setCurClassItem', 'setIsClassCreatedNew']),
    ...mapMutations('storeClazzes', [
      'setIsShowAttendanceConfirmUseModal2',
      'setIsShowAttendanceStudentRegisterModal',
      'setClassUser'
    ]),
    ...mapActions([
      'initInfiniteScroll',
      'initCurClassSearchQuery',
      'triggerAnalyticsLogEvent',
    ]),
    ...mapActions('storeBoard', ['initCurBoardList', 'clearCurBoardList']),
    ...mapActions('storeClazzTag', ['fetchTags', 'resetClazzTagState']),
    refreshCurForm(curForm) {
      if (curForm) {
        this.setCurForm('')
        this.$nextTick(() => this.setCurForm(curForm))
      }
    },
    init() {
      this.clazzUUID = this.$route.params.id
      this.clazzUrl = `${this.$apiUrl}/clazzes/${this.clazzUUID}`
      this.userUUID = this.$store.state.user.currentId
      this.isLoadClazz = false

      // 클래스 LNB 메뉴 초기화
      this.clazzesArr.push(...['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK'])

      if (this.$route.params.board) {
        this.curForm = this.$route.params.board.toUpperCase()
      }
      this.checkCurUserClassSubscribe()

      if (
        sessionStorage.getItem('iscream-noteopen') === '1'
      ) {
        const params = {
          userUUID: this.userUUID,
          classUUID: this.clazzUUID,
          type: 'c',
          version: this.$store.state.postVersionDefault
        }
        window.open(
          '/main/clazzes/note/newboard'.concat(
            this.$comn.jsonToQueryString(params)
          ),
          'createNote',
          `height=${screen.availHeight -
            this.$store.state.TASKBAR_HEIGHT},width=${screen.availWidth -
            this.$store.state
              .NOTEBOARD_MARGIN_WIDTH},top=0,left=0,resizable,scrollbars=1`
        )
      }
      sessionStorage.removeItem('iscream-noteopen')
    },
    async getClassInfo() {
      if (this.clazzUUID !== undefined) {
        this.isDimLoading = true

        // 클래스 정보 가져오기
        try {
          const result = await this.$hiClass.clazzes.read(`/clazzes/${this.clazzUUID}`)
          this.clazzes = result.data
          this.$store.commit('storeClazzes/setClazzes', result.data)
          this.clazzUrl = `${process.env.VUE_APP_BASE_API_URI}/clazzes/${result.data.currentId}`
          this.classOwner = result.data.classOwner.userName === undefined ? '' : result.data.classOwner.userName
          this.isLoadClazz = true

        } finally {
          this.isDimLoading = false
        }

        // LNB 목록 갱신
        await this.initCurBoardList({classId: this.clazzUUID})
        setTimeout(()=>{
          this.isInitBoardComplete = true
          // lnb 레드닷
          eventBus.$emit('init-lnb-red-dot', {lnbList: this.curBoardList})
        },500)
      }
    },
    setCurForm(val) {
      this.curForm = val
    },
    async checkCurUserClassSubscribe() {
      if (this.user.currentId === undefined || this.user.currentId === '')
        return false

      const classId = this.clazzUUID

      const inviteCodeSubscribeItem = this.joinWithInviteCodeSubscribe.find(subscribe => {
        return subscribe.clazz.currentId === classId
      })

      await this.$hiClass
        .getAcceptSubscribeClassByClassIdAndUserId(this, classId)
        .then(clazzSubscribeViews => {
          if (clazzSubscribeViews && clazzSubscribeViews.length > 0) {
            const clazzSubscribeView = clazzSubscribeViews[0]
            this.clazzMemberRole = clazzSubscribeView.memberRole
            this.$store.commit('storeClazzes/setClazzMemeberRole', clazzSubscribeView.memberRole);
            this.setClassUser(clazzSubscribeView)
            this.clazzSubscribesUri = `${this.$apiUrl}/clazzSubscribes/${clazzSubscribeView.currentId}`

            const subscribeClass = this.$store.state.clazzSubscribeViews.find(item => {
              return item.currentId === clazzSubscribeView.currentId
            })
            // 직접 생성한 클래스인 경우 구독 정보를 store 추가
            if (!subscribeClass) {
              const newClazzSubscribeViews = this.$store.state.clazzSubscribeViews
              newClazzSubscribeViews.push(clazzSubscribeView)
              this.$store.commit('setClazzSubscribeViews', newClazzSubscribeViews)
            }
            this.isSubscribe = true

          } else {
            // 슬레이브 DB 지연으로 초대코드 가입직후 구독정보 없음으로 나오는 경우 방지
            if (inviteCodeSubscribeItem) {
              this.clazzMemberRole = inviteCodeSubscribeItem.memberRole
              this.clazzSubscribesUri = inviteCodeSubscribeItem._links.clazzSubscribe.href
              this.isSubscribe = true
            } else {
              // 미구독 클래스인 경우
              this.$hiClass.alert('미구독 클래스입니다.')
                  .then(() => this.$router.push('/main', () => {}))
            }
          }
        })
        .catch(err => {
          this.$log.debug(this.$options.name + ' checkCurUserClassSubscribe() err => ', err)
          this.$router.push('/main')
        })
    },
    changeTab(param) {
      if (param.index === -1) {
        this.clazzesCurrentTab = -1
      } else if (param.domain === 'clazzes') {
        this.clazzesCurrentTab = param.index
      }
      // this.isInitComp = false
      this.initScroll = false
    },
    forceRerender() {
      this.componentKey++
    },
    doReloadClass() {
      // data init
      Object.assign(this.$data, this.$options.data())
      this.initCurClassSearchQuery()

      // 신규 렌더링
      this.forceRerender()

      this.init()
      this.refreshToGoSearch = true
      this.getClassInfo()

      this.resetClazzTagState()
      this.fetchTags(this.clazzUUID)

      // this.isInitComp = false
    },
    closeClassCreatedNewFloating() {
      this.setIsClassCreatedNew(false)
    }
  },
  async created() {
    await this.init()

    this.refreshToGoSearch = true
    await this.getClassInfo()

    eventBus.$on('do-reload-class', () => {
      this.doReloadClass()
    })

    eventBus.$on('clazzes-init-posts-search', () => {
      this.doBoardSearch()
    })

    eventBus.$on('clazzes-set-initScroll', flag => {
      this.initScroll = flag
    })

    eventBus.$emit('clazzes-init-lnb-menu')

    eventBus.$on('refresh-cur-form', () => {
      this.refreshCurForm(this.curForm)
    })

    this.setIsShowAttendanceConfirmUseModal2(false)
    this.setIsShowAttendanceStudentRegisterModal(false)

    await this.fetchTags(this.clazzUUID)
  },
  mounted() {
    this.curWindow.scrollTop = 0
    this.curWindow.scrollLeft = 0

    // if s.s  note open
    // this.isInitComp = false

    this.triggerAnalyticsLogEvent({ code: 'analytics.class.loadPage' })
    // 페이지 body 에 bg-white 스타일 지양
    // this.$hiClass.toggleBodyClass('add', 'bg-white')
  },
  beforeDestroy() {
    this.setIsClassCreatedNew(false)
    eventBus.$off('do-reload-class')
    eventBus.$off('clazzes-init-posts-search')
    eventBus.$off('clazzes-set-initScroll')

    this.initCurClassSearchQuery()
    this.clearCurBoardList()

    this.setCurClassItem({})
    this.resetClazzTagState()
    this.isCurClassManager = false

    // this.$hiClass.toggleBodyClass('remove', 'bg-white')
  },
  destroyed() {
  },
}
</script>
<style lang="scss" scoped>
.cont-wrap-fixed {
  min-height: calc(100vh - 100px);
}
</style>
