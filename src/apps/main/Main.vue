<template :key="componentKey">
  <div v-if="isLoadComplete && $store.state.user.currentId">
    <div v-show="!isShowFullScreenContent">
      <main-top-banner ref="mainTopBanner" @banner-toggle="onBannerToggle" />
      <div
        id="wrap"
        :class="[
          mainWrapClassName,
          { 'has-top-banner': hasTopBanner },
        ]"
        ref="main"
      >
        <div id="cont-wrap">
          <!-- 메인 헤더 -->
          <MainHeader
            v-if="isShowMainHeader"
            ref="header"
            :user="user"
            :isTempStudent="isTempStudent"
            :clazzes="clazzes"
            :variant="headerVariant"
            :isUsingAlarmPlus="isUsingAlarmPlus"
            :isTimetableMenuVisible="isTimetableMenuVisible"
            @checkInviteCards="checkInviteCards"
            @doReloadMain="doReloadMain"
          ></MainHeader>

          <!-- 메인 사이드 메뉴 -->
          <MainSlb v-if="isTeacher" :variant="headerVariant" :hasTopBanner="hasTopBanner"></MainSlb>

          <!-- variant 구분 삭제 : 구분의 요지가 메뉴에 따라  메뉴바의 높이를 분기하는 class 인데 둘다 같은 사이즈의 메뉴 사용하면서 구분이 필요없어짐-->
          <div id="cont-box-wrap">
            <!-- main-body-home || other route components (main children) -->
            <router-view
              v-if="$store.state.user.currentId"
              :user="user"
              :isTempStudent="isTempStudent"
              :isLoadComplete="isLoadComplete"
            ></router-view>
          </div>

          <!-- 최상단으로 이동 버튼 -->
          <transition name="fade">
            <MainToTopBtn v-if="isShowMainToTopBtn"></MainToTopBtn>
          </transition>
        </div>
        <!-- 외부 팝업 open -->
        <open-popup
          v-if="$store.state.openPopup.path"
          :windowId="$store.state.openPopup.id"
          :key="`open-popup-${$store.state.openPopup.path}`"
          :path="$store.state.openPopup.path"
          :type="$store.state.openPopup.type"
          :size="$store.state.openPopup.size"
          :params="$store.state.openPopup.params"
        />
      </div>
      <hc-footer />
    </div>
    <full-screen-post-homework-status
      v-if="$store.state.curClazzHomework.status.isOpen"
    />
    <worksheet-share-list
      v-if="worksheetShareList.isOpen"
      :isViewOnly="worksheetShareList.isViewOnly"
      :schoolId="worksheetShareList.schoolId"
    />
  </div>
  <!-- 새 탭 로딩 -->
  <loading-new-tab v-else />
</template>

<script>
// 로그인되었을 경우에만 plugin 로드
import Vue from 'vue'
import print from '../../plugins/print.js' // vue custom print plugin
import printjs from 'print-js' // Print.js <> https://printjs.crabbly.com/
import masonry from 'masonry-layout'
import VueMasonry from 'vue-masonry-css'
import objectFitImages from 'object-fit-images'

import MainHeader from './MainHeaderV2.vue'
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {mapFields} from "vuex-map-fields";

import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";
import WorksheetShareList from "@/components/Popup/WorksheetShareList";
import MainTopBanner from "@/apps/main/MainTopBanner";
import FullScreenPostHomeworkStatus from "@/components/FullScreen/FullScreenPostHomeworkStatus";
import {eventBus} from "@/main";
import { getIsEducationLetterManager, getIsEducationLetterSchools, getDailyUserConsentsAgreement } from '@hiclass/core';
import { firebaseAnalytics } from '@/plugins/firebase'

const LoadingNewTab = () => ({
  component: import('./MainLoadingNewTab'),
  error: ErrorLoadFailAsyncComponent,
})
const MainSlb = () => ({
  component: import('./MainSlb.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const MainToTopBtn = () => ({
  component: import('./MainToTopBtn.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const HcFooter = () => ({
  component: import('@/components/Form/HcFooter'),
  error: ErrorLoadFailAsyncComponent,
})
const OpenPopup = () => ({
  component: import('../../components/Popup/openPopup'),
  error: ErrorLoadFailAsyncComponent,
})

Vue.prototype.$printjs = printjs
Vue.prototype.$masonry = masonry
Vue.prototype.$objectFitImages = objectFitImages

Vue.use(print)
Vue.use(VueMasonry)
// -----------------------------

export default {
  name: 'main.vue',
  data() {
    return {
      className: '',
      clazzes: {},
      user: [],
      isLoadCount: 0,
      isScroll: false,
      windowTop: 0,
      lastScrollTop: window.pageYOffset,
      componentKey: 0,
      hasTopBanner: true, // 배너가 보일 때 true
      isUsingAlarmPlus: false,
      isTimetableMenuVisible: false
    }
  },
  components: {
    FullScreenPostHomeworkStatus,
    MainTopBanner,
    WorksheetShareList,
    MainHeader,     // 메인 헤더
    LoadingNewTab,  // 새 탭 로딩
    MainSlb,        // 메인 사이드 메뉴
    MainToTopBtn,   // 최상단으로 이동 버튼
    HcFooter,       // 메인 푸터
    OpenPopup,      // 외부 팝업 open
  },  
  watch: {
    '$refs.mainTopBanner.isShow': function(val) {
      this.setHeaderTopByBanner()
    },
    $route(to, from) {
      if (this.user.currentId !== localStorage.uuid) {
        this.$router.go(0)
        return
      }

      // this.$log.debug(this.$options.name, 'route to.path: ', to.path)
      this.init(to.path)

      // 페이지 이동 후 최상단으로 이동
      if (to.path !== from.path) {
        this.$nextTick(() => {
          window.scrollTo(0, 0)
        })
      }
      if (
        to.path === '/main/home' ||
        to.path === '/main/education/info' ||
        to.path === '/main/mypage/info' ||
        to.path === '/main/mypage/clazzes' ||
        to.path === '/main/mypage/schools'
      ) {
        this.loginCheck()
      } else if (this.user.userType === "TEACHER") {
        if (
          /^\/main\/alarmplus\/schools\/[^/]+\/my-timetable$/.test(to.path) ||
          /^\/main\/alarmplus\/schools\/[^/]+\/school-post$/.test(to.path) ||
          /^\/main\/text\/schools\/[^/]+\/send$/.test(to.path)
        ) {
          this.loginCheck();
        }
      }

      if (to.path !== '/main/home') {
        this.setIsShowMarketingConsentPopup(false)
      } else {
        this.checkAlarmPlusManager(false);
        this.checkMarketingNotificationPopup()
      }

      const bannerTimestamp = this.$store.state.bannerTimestamp
      if (
          bannerTimestamp !== null &&
          this.$moment().diff(bannerTimestamp, 'minutes') >= 10
      ) {
        // this.getBannerList()
        this.getMainBanners()
      }

      this.checkMarketingNotificationPopup()

    },
    user(newUser, oldUser) {
      // oldUser 에는 없던 유저 정보가 newUser 에 생겼을 경우 == 사용자 User가 최초 InIt
      if (!oldUser.currentId && newUser.currentId && this.isTeacher) {
        this.checkAlarmPlusManager(true);
        this.loadTextAuthorities();
      } else if (!oldUser.currentId && newUser.currentId) {
        // 선생님이 아닐 경우 요청을 보내지 않고 false
        firebaseAnalytics.setIsEducationLetterManager(false)
      }

      // 기존 로직 유지
      this.getMainBanners()
      // this.getBannerList()
    }
  },
  computed: {
    ...mapState({
      stateUser: 'user',
      clazzSubscribeViews: 'clazzSubscribeViews'
    }),
    ...mapFields({
      curWindow: 'curWindow',
    }),
    ...mapFields('storeWorksheet', {
      worksheetShareList: 'worksheetShareList'
    }),
    ...mapGetters({
      getIsFixed: "getIsFixed",
      isShowFullScreenContent: 'isShowFullScreenContent',
      isCurUserTempStudent: 'isCurUserTempStudent'
    }),
    headerIgnorePaths() {
      return ['/', '/main', '/help']
    },
    isShowMainHeader() {
      return !(this.headerIgnorePaths.find(path => path === this.$route.path))
    },
    isShowMainToTopBtn() {
      const isAlarmPlus = this.$route.path.includes('/main/alarmplus')
      return this.windowTop > 0 && !isAlarmPlus;
    },
    isTempStudent() {
      return this.user.userType !== undefined &&
        this.user.userSns !== undefined &&
        this.user.userType === 'STUDENT' &&
        this.user.userSns.toUpperCase() === 'HICLASS';
    },
    isTeacher() {
      return this.user.userType !== undefined &&
        this.user.userType !== null &&
        this.user.userType.toUpperCase() === 'TEACHER';
    },
    isLoadComplete() {
      return this.isLoadCount > 1
    },
    // isAlarmplus() {
    //   return !!this.$route.path.includes('/main/alarmplus')
    // },
    mainWrapClassName() {
      return this.$route.meta.class ? this.$route.meta.class : 'page-school-class'
    },
    headerVariant() {
      if ((this.$route.path.includes('/main/alarmplus') || this.$route.path.includes('/main/text')) && this.isUsingAlarmPlus) return 'alarmplus'
      return 'default'
    }
  },
  methods: {
    ...mapActions({
      getBanners: 'getBanners',
      getCalenderHolidays: 'getCalenderHolidays'
    }),
    ...mapActions('storeHome', [
      'openJoinWithInviteCodeParents',
      'openJoinWithInviteCodeStudent'
    ]),
    ...mapActions('storeSchool', ['loadTextAuthorities']),
    ...mapMutations({
      setIsShowMarketingConsentPopup: 'setIsShowMarketingConsentPopup'
    }),
    ...mapMutations('storeHome', [
      'setJoinWithInviteCodeData'
    ]),
    ...mapMutations('storeSchool', ['setAlarmPlusSchools']),
    init(path) {
      if (!this.$authentication.isAuthenticated())
        this.logout()

      if (
        this.user &&
        this.user.userUri !== undefined &&
        this.user.userUri !== null &&
        this.user.userUri !== ''
      ) {
        this.initAfterLoad(path)
      } else {
        this.getUser(path)
      }
    },
    initAfterLoad(path) {
      if (path.includes('/main/search')) {
        this.getCurUserAllSubscribes()
      }
      if (path === '/main' || path === '/main/home') {
        this.isLoadCount = 0
        this.getCurUserAllSubscribes()
        this.isLoadCount++
        this.checkInviteCards(true)
      } else {
        this.isLoadCount = 2
      }
    },
    getUser(path) {
      const userId = localStorage.uuid
      const url = `/users/${userId}`

      if (userId === undefined || userId === 'undefined') {
        this.logout()
        return false
      }

      this.$hiClass.users.read(url)
        .then(async res => {
          const user = res.data
          if (user.userStatus === 'ACTIVATE') {
            await this.setUser(user)

            this.$nextTick(() => {
              this.initAfterLoad(path)
            })
          }
        })
        .catch(error => {
          this.$log.debug(error)
          this.logout()
        })
    },
    async setUser(user) {
      const userUri = user._links.self.href
      const userType = user.userType

      // 회원정보 local 저장
      user.userUri = userUri

      // 회원정보 갱신 시 반응형 데이터 유지
      if (this.user.currentId) {
        for (const key of Object.keys(this.user))
          this.user[key] = user[key]
      } else {
        this.user = user
      }

      // 회원정보 store 저장
      this.$store.commit('setUserUri', userUri)
      this.$store.commit('setUserType', userType)
      this.$store.commit('setUser', user)

      if (this.$route.path === '/login/agreement') return;

      try {
        const isAgreed = await getDailyUserConsentsAgreement();
        if (isAgreed === false) {
          this.$router.push('/login/agreement', () => {})
        }
      } catch (e) {
        this.$log.debug('getUserConsentsAgreement() err :', e)
      }
    },
    getCurUserAllSubscribes() {
      Promise.all([
        this.$hiClass.clazzSubscribeViews.search({
          userId: this.$store.state.user.currentId,
          size: 500,
          // 정렬 우선 순위: 최신 구독순 (20200408 정책 변경)
          sort: 'insertedTimestamp,desc'
        }),          
        this.$hiClass.schoolSubscribeViews.search({
          userId: this.$store.state.user.currentId,
          size: 500,
          sort: 'insertedTimestamp,desc'
        }),
        /*this.$hiClass.informations.search({
          size: 500,
          _infoStatus: 'ACTIVATE'
        })*/
      ])
        .then(r => {
          // this.$comn.log(this, "getCurUserAllSubscribes() r => ", r);
          const clazzSubscribeViews = r[0].data._embedded.clazzSubscribeViews
          const schoolSubscribeViews = r[1].data._embedded.schoolSubscribeViews
          
          this.$store.commit('setClazzSubscribeViews', clazzSubscribeViews)
          this.$store.commit('setSchoolSubscribeViews', schoolSubscribeViews)
        })
        .catch(e => {
          this.$comn.log(this, 'getCurUserAllSubscribes() e => ', e)
        })
        .finally(() => {
          this.isLoadCount++
        })
    },
    logout() {
      this.$router.push('/logout', () => {})
    },
    async checkInviteCards(isChangedPath) {
      if (!this.$comn.isEmpty(this.user.currentId) && (!this.isLoadComplete || isChangedPath)) {
        const res = await this.$axios.get(`/clazzInviteCards/${this.user.currentId}/invite`)
        if (res.data._embedded && res.data._embedded.cards.length > 0) {
          const card = res.data._embedded.cards[0]

          const { data: clazz } = await this.$hiClass.clazzes.read(`/clazzes/${card.classId}`)

          this.setJoinWithInviteCodeData({
            invitedClassObj: clazz,
            invitedSchoolUri: `${this.$apiUrl}/schools/${clazz.school.currentId}`
          })
          this.user.userType === 'STUDENT' ?
              this.openJoinWithInviteCodeStudent() :
              this.openJoinWithInviteCodeParents()

          this.$axios.delete(`/clazzInviteCards/${this.user.currentId}/invite/${card.classId}`)
        }
      }
    },
    onScroll(/* e */) {
      if (
        this.$route.path.includes('/main/clazzes/') ||
        this.$route.path.includes('/main/schools/')
      ) {
        this.windowTop = window.pageYOffset
        this.curWindow.scrollTop = window.pageYOffset
        this.curWindow.scrollLeft = window.pageXOffset
      } else {
        this.windowTop = window.pageYOffset
      }

      if (!this.isScroll) {
        this.isScroll = true
        this.lastScrollTop = this.$comn.floatingHeader(this.lastScrollTop)
        setTimeout(() => {
          this.isScroll = false
        }, 50)
      }
    },
    onResize(/* e */) {
      if (
        this.$route.path.includes('/main/clazzes/') ||
        this.$route.path.includes('/main/schools/')
      ) {
        this.windowTop = window.pageYOffset
        this.curWindow.scrollTop = window.pageYOffset
        this.curWindow.scrollLeft = window.pageXOffset
      }

      // clazzes, schools LNB/RNB fixed
      this.getIsFixed()
    },
    forceRerender() {
      this.componentKey += 1
    },
    doReloadMain() {
      window.removeEventListener('scroll', this.onScroll)
      window.removeEventListener('resize', this.onResize)

      // data init
      Object.assign(this.$data, this.$options.data())

      // 신규 렌더링
      this.forceRerender()

      // created
      const queryParam = this.$authentication.load()
      if (queryParam.clientRegistrationId === 'STUDENT')
        Object.assign(this.$axios.defaults, { headers: '' })
      this.init(this.$route.path)

      // mounted
      window.addEventListener('scroll', this.onScroll)
      window.addEventListener('resize', this.onResize)
      this.$objectFitImages(null, { watchMQ: true }) // for the auto mode
    },
    async loginCheck() {
      const uuid = localStorage.getItem('uuid')

      if (uuid === undefined || uuid === null) {
        this.logout()
        return false
      }

      try {
        const res = await this.$axios({
          method: 'get',
          url: '/users/' + uuid
        })

        const userInfo = res.data
        if (userInfo.userStatus === 'ACTIVATE') {
          await this.setUser(userInfo)
        } else {
          // alert("탈퇴된 계정입니다.");
          this.logout()
        }
      } catch (e) {
        this.$log.debug(this.$options.name + ' loginCheck() err :', e)
        // alert("로그인 정보를 찾을 수 없습니다.");
        this.logout()
      }
    },
    // 게시물 상세 팝업
    setItemDetailObj(item) {
      if (item) {
        let paramObj = {
          item: item,
          list: [item],
          totalElements: 1,
          pagePerSize: 1
        }
        this.$store.commit('setItemDetailObj', paramObj)
        setTimeout(() => {
          this.$store.commit('setIsShowDetailPostLayer', true)
        }, 200)
      } else {
        this.$store.commit('setItemDetailObj', {})
        this.$store.commit('setIsShowDetailPostLayer', false)
      }
    },
    /**
     * function that gets triggered when message event is triggered
     *
     * 알림장 수정 팝업 등의 윈도우 팝업과 데이터를 교환하기 위한 인터페이스
     */
    receiveMessage(event) {
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      const port = this.$comn.getLocationPort()
      const domainUrl = protocol + '//' + hostname + port

      if (
        event.origin === domainUrl &&
        event.data === 'routeMainHome' &&
        event.data.length === 'routeMainHome'.length &&
        typeof event.data === 'string'
      ) {
        this.$router.push('/main/home')
      } else if (
        event.origin === domainUrl &&
        event.data &&
        typeof event.data === 'string'
      ) {
        try {
          if (event.data.includes('routeMainClazzesNote')) {
            const classId = event.data.split('|')[1]
            const params = this.$qs.parse(event.data.split('|')[2])
            let routePath = `/main/clazzes/${classId}/note/${params.boardId}`
            if (params.folderId) {
              routePath += `/${params.folderId}`
            }

            const routeObj = {
              path: routePath,
              query: {
                refreshTime: this.$moment().valueOf()
              }
            }
            let navMethod = 'push'
            if (this.$route.path === routePath) navMethod = 'replace'
            this.$router[navMethod](routeObj)
            this.$router.go(0)
          }
        } catch (err) {
          this.$log.debug(`receiveMessage() err => `, err)
        }
      }

      /**
       * store user 사용자 정보 갱신
       * 1. 전자서명이 수정되었을 경우
       * ...
       */
      if (
        event.data !== undefined && event.data !== null
          && event.data !== ''
          && typeof event.data === 'string'
      ) {
        if (event.data.includes('changeUserSign|') || event.data.includes('changeUserApprovalSign|')) {
          this.$hiClass.users.read(`/users/${this.$store.state.user.currentId}`)
            .then(res => {
              const user = res.data

              // 1. 전자서명이 수정되었을 경우
              if (event.data.includes('changeUserSign|')) {
                user.userSignImagePath = this.$comn.split(event.data, '|') || null
              } else if (event.data.includes('changeUserApprovalSign|')) {
                user.userApprovalSignImagePath = this.$comn.split(event.data, '|') || null
              }

              this.$store.commit('setUser', user)
            })
            .finally(() => {
              // TODO: 서명 정보 저장 각 컴포넌트에 전파
              // this.userSign = userSignPath
            })
        }

      }
    },

    /**
     * 배너 일괄 가져오기
     */
    /**
    getBannerList() {
      if (this.user.currentId) {
        // 메인 페이지 배너는 사용자가 로그인한 경우에만 가져옴
        let bannerListAppendParams = {
          bannerType: 'BANNER',
          positionType: [
            'WEB_BANNER_HOME_FEED',
            'WEB_BANNER_QUICK',
            'WEB_BANNER_QUICK_CLASS',
            'WEB_BANNER_LNB',
            'WEB_BANNER_RNB'
          ]
        }
        this.$hiClass.getBannerList(bannerListAppendParams, this)
      }
    },
     */

    getMainBanners() {
      const requestParams = {
        deviceType: 'WEB',
        positionType: [
            // 'WEB_BANNER_HOME_FEED',
            'WEB_BANNER_QUICK',
            'WEB_BANNER_QUICK_CLASS',
            // 'WEB_BANNER_LNB',
            'WEB_BANNER_RNB',
            // 'BANNER_TOP',
            // 'BANNER_A',
            // 'BANNER_B',
            // 'BANNER_C',
            'NOTIFICATION_BOX',
            'BANNER_MORE_FEED'
        ]
      }
      this.getBanners(requestParams)
    },

    checkMarketingNotificationPopup() {
      // 임시학생은 노출 안함
      if (this.isCurUserTempStudent) return false

      // 홈에서만 노출
      const popupOpenPath = ['/main/home']
      if (!popupOpenPath.includes(this.$route.path)) {
        return false
      }

      let curTimestamp = this.$moment().valueOf()
      let isOpenPopup = false
      let isTarget = false

      // 1. 동의자
      if (this.user.userMarketingUsed) {
        const userMarketingTimestampDiff = curTimestamp - this.user.userMarketingTimestamp
        if (userMarketingTimestampDiff > 670 * 86400000) { // 동의한지 2년이 경과한자 중
          if (!this.user.consentNotificationTimestamp) { // 광고성 정보 수신을 받지 않았거나
            isTarget = true
          } else {
            const notificationTimestampDiff = curTimestamp - this.user.consentNotificationTimestamp
            if (notificationTimestampDiff > 737 * 86400000) { // 광고성 정보 수신을 받은지 737일 경과한 자
              isTarget = true
            }
          }
        }

      } else { // 2. 미동의자
        let lastDisagreeTimestamp = null
        if (localStorage.getItem('marketingPopup')) {
          const marketingPopup = JSON.parse(localStorage.getItem('marketingPopup'))
          if (Object.keys(marketingPopup).includes('lastDisagreeTimestamp')) {
            lastDisagreeTimestamp = marketingPopup.lastDisagreeTimestamp
          }
        }

        // localStorage 에 마지막 미동의일시가 없다면 user.userMarketingTimestamp 로 판단
        const lastMarketingDisagreeTimestamp = lastDisagreeTimestamp || this.user.userMarketingTimestamp
        if (curTimestamp - parseInt(lastMarketingDisagreeTimestamp) > 30 * 86400000) { // 미동의한 후 30일 부터
          isTarget = true
        }
      }

      if (isTarget) {
        let lastPopupOpenTimestamp = null
        let marketingPopup = {}
        if (localStorage.getItem('marketingPopup')) {
          marketingPopup = JSON.parse(localStorage.getItem('marketingPopup'))
          if (Object.keys(marketingPopup).includes('lastPopupOpenTimestamp')) {
            lastPopupOpenTimestamp = marketingPopup.lastPopupOpenTimestamp
          }
        }

        if (!lastPopupOpenTimestamp) { // 팝업이 뜬적 없는 사람
          isOpenPopup = true
        } else {
          const popupOpenTimestampDiff = this.$moment().valueOf() - parseInt(lastPopupOpenTimestamp)
          if (popupOpenTimestampDiff > 30 * 86400000) { // 팝업이 뜨고 30일이 경과한 사람
            isOpenPopup = true
          }
        }
      }

      if (isOpenPopup) {
        this.setIsShowMarketingConsentPopup(true)
      }
    },
    setHeaderTopByBanner() {
      // #wrap의 클래스와 body 클래스 동기화
      if (this.hasTopBanner) {
        document.body.classList.add('has-top-banner')
      } else {
        document.body.classList.remove('has-top-banner')
      }
    },
    onBannerToggle(val) {
      this.hasTopBanner = !!val;
      // 즉시 body 클래스도 동기화
      this.setHeaderTopByBanner();
    },

    async checkAlarmPlusManager(setGA) {
      const { isManager } = await getIsEducationLetterManager();

      if (setGA) {
        // GA 사용자 속성 - 학교 알리미 사용 여부 조회 후 Firebase SET
        firebaseAnalytics.setIsEducationLetterManager(isManager);
      }

      this.isUsingAlarmPlus = isManager;

      if (!this.isUsingAlarmPlus) {
        this.isTimetableMenuVisible = true;
        return;
      }

      const { _embedded: { elSchools } } = await getIsEducationLetterSchools();
      this.setAlarmPlusSchools(elSchools);
      const deniedType = ['KINDERGARTEN', 'ELEMENTARY'];
      this.isTimetableMenuVisible = elSchools.some(school => !deniedType.includes(school.schoolType));
    }
  },
  created: function() {
    this.windowTop = 0
    this.curWindow.scrollTop = 0
    this.curWindow.scrollLeft = 0

    // temp student axios header init
    const queryParam = this.$authentication.load()
    if (queryParam.clientRegistrationId === 'STUDENT')
      Object.assign(this.$axios.defaults, { headers: '' })

    this.init('/main')
    // vue router push - new promise api : https://github.com/vuejs/vue-router/issues/2872
    if (this.$route.path === '/main')
      this.$router.push(this.$route.path, () => {})
  },
  async mounted() {
    window.addEventListener('scroll', this.onScroll)
    window.addEventListener('resize', this.onResize)

    // event listener for message event
    window.addEventListener('message', this.receiveMessage, false)

    await this.loginCheck()

    this.$nextTick(() => {
      // object fit polyfill
      this.$objectFitImages(null, { watchMQ: true }) // for the auto mode

      // mounted postId check
      if (this.$route.query.postId) {
        this.$hiClass.posts
          .read(`/posts/${this.$route.query.postId}`)
          .then(res => {
            this.setItemDetailObj(res.data)
            this.$router.replace(this.$route.path, () => {})
          })
          .catch(err => {
            this.$log.debug(
              this.$options.name + ' created postId check err => ',
              err
            )
          })
      }

      // mounted healthCheckFreeSms check
      if (this.$route.query.healthCheckFreeSms) {
        this.$store.commit('setHealthCheckFreeSms', {
          isOpen: true
        })
      }

      this.getCalenderHolidays({ year: this.$moment().year() })

      // 마케팅 재동의 팝업
      this.checkMarketingNotificationPopup()
    })

    eventBus.$on('main-set-user', () => {
      this.user = {...this.stateUser}
    })

    // 마운트 시 mainTopBanner(ref)가 있으면 초기 상태 동기화
    this.$nextTick(() => {
      const ref = this.$refs.mainTopBanner
      if (ref && typeof ref.isShow !== 'undefined') {
        this.hasTopBanner = !!ref.isShow
      } else {
        // DOM 레벨로도 확인: l-top-banner 존재 여부
        this.hasTopBanner = !!document.querySelector('.l-top-banner')
      }
      this.setHeaderTopByBanner()
    })

    // DOM 변경을 감지하여 .l-top-banner 요소의 추가/제거가 있으면 hasTopBanner 동기화
    this._bannerObserver = new MutationObserver(() => {
      const exists = !!document.querySelector('.l-top-banner')
      if (this.hasTopBanner !== exists) {
        this.hasTopBanner = exists
        this.setHeaderTopByBanner()
      }
    })
    this._bannerObserver.observe(document.body, { childList: true, subtree: true })
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('message', this.receiveMessage, false)

    eventBus.$off('main-set-user')

    this.setIsShowMarketingConsentPopup(false)

    // 메인 화면에서 벗어날 경우 무료 문자 팝업 닫기
    this.$store.commit('setHealthCheckFreeSms', {
      isOpen: false
    })

    // MutationObserver 해제
    if (this._bannerObserver) {
      this._bannerObserver.disconnect()
      this._bannerObserver = null
    }
  }
}
</script>

<style lang="scss" scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

  /* 탑배너가 있을 때 헤더 위치 조정 */
  #wrap { 
    &.has-top-banner {
      ::v-deep #header-content-wrap {
        top: 50px;
      }
      ::v-deep #cont-wrap {
        position: relative;
        top: 50px;
      }
      ::v-deep .right-menu-cont-wrap {
        top: 111px;
        height: calc(100% - 111px);
      }
      ::v-deep .mypage-wrap .user-name .dropdown-layer{
        top: 111px;
      }
    }
  }  

  @media (max-width: 768px) {
    #wrap {
      &.has-top-banner {
        #cont-wrap {
          top: 0;
        }
        ::v-deep #header-content-wrap {
          top: 0;
        }
        ::v-deep .mypage-wrap .user-name .dropdown-layer{
          top: 59px;
        }
      }
    }
  }
</style>

<style>
  #nprogress .bar {
    background: #3867c6 !important;
  }

  #nprogress .peg {
    box-shadow: 0 0 10px #3867c6, 0 0 5px #3867c6 !important;
  }

  #nprogress .spinner-icon {
    border-top-color: #3867c6 !important;
    border-left-color: #3867c6 !important;
  }
</style>
