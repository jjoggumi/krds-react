<!--
@File(Method): MainHeader.vue
@Description: 공통 헤더
@Modified: header v2 적용으로 파일 미사용중
-->
<template>
  <fragment>
    <div
      id="header-cont-wrap"
      ref="renewalHeaderWrap"
      class="renew-header-cont-wrap"
    ><!-- 2021-06-29 클래스 추가 -->
      <div class="header-top-cont-inner">
        <!-- 2021-06-29 더보기 메뉴 위치 이동 -->
        <main-header-mypage
          :user="user"
        />
        <!-- //2021-06-29 더보기 메뉴 위치 이동 -->
      </div>

      <div class="header-cont-inner">
        <main-header-logo
          :logo-type="mainHeaderLogoType"
          @doReloadMain="$router.go(0)"
        />

        <div class="header-gnb-wrap">
          <a
            href="javascript:void(0)"
            :class="{ on: curTab === 'class' }"
            @click="onClickButton('class')"
          >
            {{ $t('main.header.clazzes') }}
          </a>
          <a
            href="javascript:void(0)"
            :class="{
              on: curTab === 'chat',
              'new-dot': chatUncheckedMessage.count > 0
            }"
            @click="onClickButton('hitalk')"
          >
            {{ $t('main.header.chat') }}
          </a>
          <a
            v-if="isTeacher"
            href="javascript:void(0)"
            :class="{
              on: curTab === 'behavior',
            }"
            class="behavior"
            @click="onClickButton('behavior')"
          >
            {{ $t('main.header.behavior') }}
            <span class="behavior__new-info">
              <em>선생님 ONLY</em>
            </span>
          </a>
          <a
            v-if="isShowAlarmPlus"
            href="javascript:void(0)"
            :class="{ on: curTab === 'alarmplus' }"
            @click="onClickButton('alarmplus')"
          >
            {{ $t('main.header.alarmplus') }}
          </a>
          <span
            v-if="curTab === 'alarmplus'"
            class="tooltip"
            style="display:block;"
          >
            <!-- prettier-ignore -->
            <span>{{ $t('tooltip.main.header.alarmplus') }}<span>{{ $t('tooltip.main.header.alarmplus.suffix') }}</span></span>
          </span>

        </div>
        <div class="header-right-wrap clfix">
          <div class="header-badge-wrap">
            <div
              class="badge-item"
              :class="{
                on: isShowAlarm,
                'new-dot': isUnreadNotiAlarm
              }"
            >
              <!--   -->
              <button
                type="button"
                id="alarmBtn"
                class="badge-alarm"
                @click="clickNotiBox"
              ></button>

              <!-- notibox -->
              <MainHeaderNotibox
                v-if="isShowAlarm"
                :user="user"
                :isUnreadNotiAlarm="isUnreadNotiAlarm"
                @hideAlarm="hideAlarm"
                @updateNotificationBadges="updateNotificationBadges"
              ></MainHeaderNotibox>
              <!-- notibox -->
            </div>
          </div>
          <div class="header-search-wrap">
            <button
              v-if="!isHideSearchButton"
              class="badge-search"
              :class="{
                on: isShowSearchLayer
              }"
              @click="isShowSearchLayer = !isShowSearchLayer"
            ></button> <!-- 2021-06-29 검색 토글 버튼 -->

            <!-- search result popup area -->
            <!-- // search result popup area -->
          </div>
        </div>
      </div>

      <!-- 2021-06-29 검색 레이어 추가 -->
      <transition name="fade">
        <main-header-search-layer
          v-if="isShowSearchLayer"
          @hide-search-layer="hideSearchLayer"
        />
      </transition>
      <!-- //2021-06-29 검색 레이어 추가 -->
    </div>

    <!-- 카드UI 상세 레이어 팝업 -->
    <detail-post-item
      v-if="isShowDetailPostLayer"
      :key="`detail-post-item-${itemDetailObj.item.currentId}`"
      :item="itemDetailObj.item"
      :postsList="itemDetailObj.list"
      :totalElements="itemDetailObj.totalElements"
      :parentUriList="itemDetailObj.parentUriList"
      :pagePerSize="itemDetailObj.pagePerSize"
      :path="$comn.split($route.path, '/')"
      @close-layer="closeAndReadDetailPostLayer"
    />

    <!-- 가정통신문 플러스 상세 팝업 -->
    <alarm-plus-detail-popup
      v-if="isVisibleAlarmPlus && alarmPlusDetail.eLetterId"
    />

    <!-- 가정통신문 플러스 초대장 팝업 -->
    <alarm-plus-invite-card-popup
      v-if="isVisibleAlarmPlus && alarmPlusInviteSchool.currentId"
    />

    <print-viewer
      v-if="printView.isOpen"
    ></print-viewer>

    <!-- 건강상태 자가진단 무료 문자 팝업 -->
    <health-check-free-sms v-if="healthCheckFreeSms.isOpen"/>

    <!-- 학생 건강상태 자가진단 팝업 -->
    <!-- <student-health-check v-if="studentHealthCheck.isOpen" /> -->
    <student-health-check2 v-if="studentHealthCheck.isOpen"/>

    <!--  클래스 신청서 등록/수정 팝업  -->
    <clazz-application-form
      v-if="clazzApplicationForm.isOpen"
      :isManager="clazzApplicationForm.isManager"
      :clazz="clazzApplicationForm.clazz"
      :formName="clazzApplicationForm.formName"
      :mode="clazzApplicationForm.mode"
      :clazzApply="clazzApplicationForm.clazzApply"
      :userId="clazzApplicationForm.userId"
    />

    <!--  클래스 신청서 학생 선택 팝업  -->
    <clazz-application-user
      v-if="clazzApplicationUser.isOpen"
      :formName="clazzApplicationUser.formName"
      :acceptParentList="clazzApplicationUser.acceptParentList"
    />

    <!-- 클래스 신청서 > 학생별 현황 > 제출내역 팝업 -->
    <clazz-apply-list
      v-if="clazzApplyList.isOpen"
      :class-id="clazzApplyList.classId"
      :user-id="clazzApplyList.userId"
      :apply-type="clazzApplyList.applyType"
      :total-elements="clazzApplyList.totalElements"
    />

    <clazz-remind-push-modal
      v-if="clazzRemindPushModal.isOpen"
    />

    <!-- 클래스 RNB 우리반 일정 팝업 -->
    <main-body-clazzes-rnb-calendar-schedule
      v-if="clazzCalendarSchedule.isOpen"
      :clazzes="clazzCalendarSchedule.clazzes"
      :curItem="clazzCalendarSchedule.curItem"
      :selectedDate="clazzCalendarSchedule.clickedDate"
    />

    <!-- 토스트 메시지 -->
    <Toast v-if="isShowToast"/>

    <!-- 좋아요 리스트 팝업 -->
    <like-list-popup
      v-if="curPostLike.isOpen"
      :key="`like-list-popup-${curPostLike.postId}`"
      :postId="curPostLike.postId"
      :isClassPost="curPostLike.isClassPost"
      :kind="curPostLike.kind"
    >
      <template slot="title">
        <template v-if="curPostLike.kind !== 'deli'">'좋아요'한 사람들</template>
        <template v-else>'맛있어요'한 사람들</template>
      </template>
    </like-list-popup>

    <join-with-invite-code-process/>

    <post-terms
      v-if="curPostTerms.isOpen"
    />

    <post-terms-detail
      v-if="curPostTerms.isOpenDetail"
    />

    <!-- message modal -->
    <message
      v-if="popupMessage.isOpen"
      :message="popupMessage.message"
      :type="popupMessage.type"
      :action="popupMessage.action"
      :title="popupMessage.title"
    />

    <!-- 출결 알리미 팝업 -->
    <attendance-detail-modal
      v-if="attendanceModal.isShowDetailModal"
      :id="attendanceModal.id"
      :classId="attendanceModal.classId"
      :isNeis="true"
      :clazzMemberRole="attendanceModal.clazzMemberRole"
      @close="closeAttendanceDetailModal"
    />
    <attendance-register-modal 
      v-if="attendanceModal.isShowRegisterModal"
      :id="attendanceModal.id"
      :classId="attendanceModal.classId"
      :isNeis="true"
      :clazzMemberRole="attendanceModal.clazzMemberRole"
      :isConfirmMode="attendanceModal.isConfirmdMode"
      @close="closeAttendanceRegisterModal" 
    />
    <confirm-dialog 
      v-if="isLogout" 
      :title="confirmDialog.title" 
      :description="confirmDialog.description"
      :isOtherUse="true"
      :isAlert="true"
      @closeConfirmDialog="allLogout"
    />
    <add-classroom
      v-if="isAddClassroom"
      @close="closeAddClassroomModal"
    />
  </fragment>
</template>

<script>
import {eventBus} from '@/main'
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {mapFields} from "vuex-map-fields";

import MainHeaderLogo from '@/apps/main/MainHeaderLogo.vue'
import MainHeaderMypage from '@/apps/main/MainHeaderMypageV2.vue'
import MainHeaderNotibox from '@/apps/main/MainHeaderNotibox.vue'
import MainHeaderSearchLayer from '@/apps/main/MainHeaderSearchLayerV2.vue'
import MainBodyClazzesRnbCalendarSchedule from '@/apps/main/clazzes/MainBodyClazzesRnbCalendarSchedule.vue'
import ErrorLoadFailAsyncComponent from '@/apps/error/ErrorLoadFailAsyncComponent.vue'

import DetailPostItem from '@/components/DetailPost/DetailPostItem.vue'
import ClazzApplyList from '@/components/Popup/ClazzApplyList.vue'
import ClazzApplicationUser from '@/components/Popup/ClazzApplicationUser.vue'
import JoinWithInviteCodeProcess from '@/components/Popup/JoinWithInviteCode'
import Message from '@/components/Popup/Message.vue'
import PostTerms from '@/components/Popup/PostTerms.vue'
import ClazzRemindPushModal from "@/components/Modal/ClazzRemindPushModal";
import PrintViewer from "@/components/Viewer/PrintViewer";
import AttendanceRegisterModal from "@/apps/main/clazzes/attendance/modal/AttendanceRegisterModal";
import AttendanceDetailModal from "@/apps/main/clazzes/attendance/modal/AttendanceDetailModal";
import ConfirmDialog from '@/apps/hitalk/components/popup/ConfirmDialog'
import AddClassroom from '@/apps/behavior/components/popup/AddClassroom.vue'
import {openPopup} from "@/plugins/utils";
import CONSTANTS from '@/plugins/constants';

const Toast = () => ({
  component: import('@/apps/main/MainPopupToast.vue'),
  error: ErrorLoadFailAsyncComponent,
})

const AlarmPlusDetailPopup = () => ({
  component: import('@/components/AlarmPlus/AlarmPlusDetailPopup.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const AlarmPlusInviteCardPopup = () => ({
  component: import('@/components/AlarmPlus/AlarmPlusInviteCardPopup.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const LikeListPopup = () => ({
  component: import('@/components/Popup/LikeListPopup.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const HealthCheckFreeSms = () => ({
  component: import('@/components/Popup/HealthCheckFreeSms.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const StudentHealthCheck2 = () => ({
  component: import('@/components/Popup/StudentHealthCheck2.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const ClazzApplicationForm = () => ({
  component: import('@/components/Popup/ClazzApplicationForm.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const PostTermsDetail = () => ({
  component: import('@/components/Popup/PostTermsDetail.vue'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: 'main-header',
  components: {
    ConfirmDialog,
    PrintViewer,
    ClazzRemindPushModal,
    PostTermsDetail,
    PostTerms,
    MainHeaderLogo,
    ClazzApplyList,
    MainHeaderSearchLayer,
    MainBodyClazzesRnbCalendarSchedule,
    ClazzApplicationUser,
    Message,
    MainHeaderNotibox,
    MainHeaderMypage,
    DetailPostItem,                     // 게시물 상세 레이어 팝업
    JoinWithInviteCodeProcess,

    Toast,                              // 토스트 메시지 팝업
    LikeListPopup,                      // 좋아요 리스트 레이어 팝업
    AlarmPlusDetailPopup,               // 가정통신문 플러스 상세 팝업
    AlarmPlusInviteCardPopup,           // 가정통신문 플러스 초대장 팝업
    HealthCheckFreeSms,                 // 건강상태 자가진단 무료 문자 팝업
    StudentHealthCheck2,                // 학생 건강상태 자가진단 팝업
    ClazzApplicationForm,               // 클래스 신청서 등록/수정 팝업
    AttendanceRegisterModal,
    AttendanceDetailModal,
    AddClassroom
  },
  props: {
    isTempStudent: Boolean,
    clazzes: Object
  },
  data() {
    return {
      isAddClassroom: false,
      isShowSearchLayer: false,
      isShowPostLayer: false,
      isShowAlarm: false,
      isUnreadNotiAlarm: false,
      isFocus: {
        alarmplus: false
      },
      curTab: '',
      key: '',
      item: '',
      postsList: [],
      badgeData: null,
      confirmDialog : {
        title: '로그아웃 안내',
        description: '비밀번호 변경 또는 로그인 만료 등으로 인해\n로그아웃되었습니다.\n보안을 위해 <span style="color: #4778DE;">다시 로그인 해주세요.</span>'
      }
    }
  },
  computed: {
    ...mapState({
      isLogout: 'isLogout',
      isShowDetailPostLayer: 'isShowDetailPostLayer',
      isShowToast: 'isShowToast',
      isVisibleAlarmPlus: 'isVisibleAlarmPlus',
      alarmPlusDetail: 'alarmPlusDetail',
      alarmPlusInviteSchool: 'alarmPlusInviteSchool',
      chatUncheckedMessage: 'chatUncheckedMessage',
      clazzApplicationForm: 'clazzApplicationForm',
      clazzApplicationUser: 'clazzApplicationUser',
      clazzApplyList: 'clazzApplyList',
      clazzCalendarSchedule: 'clazzCalendarSchedule',
      clazzRemindPushModal: 'clazzRemindPushModal',
      curClazzHomework: 'curClazzHomework',
      curPostLike: 'curPostLike',
      curPostTerms: 'curPostTerms',
      healthCheckFreeSms: 'healthCheckFreeSms',
      itemDetailObj: 'itemDetailObj',
      onceChecks: 'onceChecks',
      popupMessage: 'popupMessage',
      studentHealthCheck: 'studentHealthCheck',
      printView: 'printView',
      eventLogoExpiredTime: 'eventLogoExpiredTime',
    }),
    ...mapState('storeHome', {
      joinWithInviteCode: 'joinWithInviteCode',
      joinWithInviteCodeParents: 'joinWithInviteCodeParents',
      joinWithInviteCodeStudent: 'joinWithInviteCodeStudent',
    }),
    ...mapGetters({
      isEmptyClassSubscriptionAndTempStudent: 'isEmptyClassSubscriptionAndTempStudent',
      isExpired: 'isExpired',
    }),
    ...mapFields({
      isNewTabLoading: 'isNewTabLoading',
    }),
    ...mapState('storeClazzes', {
      attendanceModal: 'attendanceModal'
    }),
    user() {
      return this.$store.state.user
    },
    isTeacher() {
      return this.user.userSns !== undefined &&
        this.user.userType !== undefined &&
        this.user.userType.toUpperCase() === 'TEACHER';
    },
    isShowAlarmPlus() {
      return this.isTeacher
    },
    isHideSearchButton() {
      return this.isEmptyClassSubscriptionAndTempStudent
    },
    mainHeaderLogoType() {
      return !this.isExpired({expiredTime: this.eventLogoExpiredTime})
        ? 'SNOW_TREE'
        : null
    }
  },
  watch: {
    $route() {
      this.init()
      this.checkNotificationBadges()
      this.alarmPlusTeacherSubscribeCheck()
    },
  },
  async created() {
    this.init()
    this.checkNotificationBadges()

    // 1회성 알림 플래그 정보 set - 비밀 댓글 사용 확인
    if (!this.onceChecks.userSecretCommentUsed) {
      this.searchOnceChecks('userSecretCommentUsed').then(res => {
        if (res.data.page && res.data.page.totalElements > 0) {
          this.setOnceChecksUserSecretCommentUsed(true)
        }
      })
    }
    const res = await this.isBlockUserCheck(true)
    if(res) {
      this.confirmDialog = {
        title: '이용이 제한된 계정입니다.',
        description: '안전한 서비스 운영정책에 따라\n일정 기간 동안 이용이 제한되었습니다.\n운영정책에 위반된 행위를 계속할 경우\n영구 이용 제한될 수 있습니다.'
      }
      // 이곳에 블락 처리 메시지 뿌려주기.
      //this.$router.push('/logout', () => {})
    }
  },
  methods: {
    ...mapMutations({
      setAlarmPlusInviteSchool: 'setAlarmPlusInviteSchool',
      setIsShowDetailPostLayer: 'setIsShowDetailPostLayer',
      setItemDetailObj: 'setItemDetailObj',
      setOnceChecksUserSecretCommentUsed: 'setOnceChecksUserSecretCommentUsed',
    }),
    ...mapActions({
      alarmPlusTeacherSubscribeCheck: "alarmPlusTeacherSubscribeCheck",
      initChatUncheckedMessage: "initChatUncheckedMessage",
      openHitalkPopup: 'openHitalkPopup',
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
      isAllDeviceLogout: 'isAllDeviceLogout',
      isBlockUserCheck: 'isBlockUserCheck',
      openBehaviorRecordPopup: 'openBehaviorRecordPopup'
    }),
    ...mapActions('storeBehavior', {
      getClassrooms: 'getClassrooms',
    }),
    ...mapMutations('storeClazzes',{
      setAttendanceModal: 'setAttendanceModal'
    }),
    moveHome: function() {
      this.$emit('doReloadMain')
    },
    allLogout: function () {
      window.close()
      this.$router.push('/logout', () => {})
    },
    closeAttendanceRegisterModal: async function(id) {
      this.$hiClass.toggleBodyClass('remove', 'hidden')
      this.setAttendanceModal({id: null, classId: null, isShowRegisterModal: false, isShowDetailModal: false, isConfirmdMode: false, clazzMemberRole: null})
    },
    closeAttendanceDetailModal: async function(value) {
      this.$hiClass.toggleBodyClass('remove', 'hidden')
      this.setAttendanceModal(
        {
          ...this.attendanceModal,
          id: value.id, 
          isShowRegisterModal: value.id ? true: false, 
          isShowDetailModal: false, 
          isConfirmdMode: value.isConfirm
      })
    },
    // 학생 행동기록 팝업 열기
    openStudentActionRecordPopup: async function() {
      const classrooms = await this.getClassrooms({isUsed: true})
      if(classrooms.page.totalElements > 0) {
        // this.openBehaviorRecordPopup(null) //openPopup으로 전환
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
    onClickButton(name) {
      switch (name) {
        case 'class':
          this.goRoute('/main/home')
          break
        case 'hitalk':
          this.triggerAnalyticsLogEvent({code: 'analytics.chat.click'})
          //this.openHitalkPopup(null) //openPopup으로 전환
          this.initChatUncheckedMessage()
          openPopup(CONSTANTS.POPUP.HI_TALK)
          break
        case 'alarmplus':
          this.triggerAnalyticsLogEvent({code: 'analytics.alarmplus.click'})
          this.goRoute('/main/alarmplus')
          break
        case 'behavior':
          this.triggerAnalyticsLogEvent({code: 'analytics.behavior.click'})
          //this.openStudentActionRecordPopup()
          //this.openBehaviorRecordPopup(null) //openPopup으로 전환
          openPopup(CONSTANTS.POPUP.BEHAVIOR_RECORD)
          break 
      }
    },
    goRoute(path) {
      if (path === this.$route.path) {
        path === '/main' || path === '/main/home'
          ? this.$emit('doReloadMain')
          : this.$router.go(0)
      } else {
        this.$router.push(path, () => {
        })
      }
    },
    init: function () {
      let curPath = this.$route.path
      if (curPath.includes('/main/home') || curPath.includes('/main/clazzes'))
        this.curTab = 'class'
      else if (curPath.includes('/main/chat')) this.curTab = 'chat'
      else if (curPath.includes('/main/education')) this.curTab = 'education'
      else if (curPath.includes('/main/alarmplus')) this.curTab = 'alarmplus'
      else this.curTab = ''
    },
    goPage(path) {
      this.$router.push(path, () => {
      })
    },
    hideSearchLayer() {
      this.isShowSearchLayer = false
    },
    hideAlarm() {
      this.isShowAlarm = false
    },
    async checkNotificationBadges() {
      const userUri = this.user._links.self.href
      let params = {
        _user: userUri,
        _badgeCheck: false,
        size: 1
      }

      try {
        const result = await this.$hiClass.notificationBadges.search(params)
        this.isUnreadNotiAlarm = !result.data.badgeCheck
        this.badgeData = { badgeCheck: result.data.badgeCheck }
      } catch (error) {
        this.$log.debug(this.$options.name + ' checkNotificationBadges() error : ', error)
      }
    },
    updateNotificationBadges(isForceUpdate = false) {
      try {
        if ((this.isUnreadNotiAlarm && !this.badgeData.badgeCheck) || isForceUpdate) {
          this.badgeData.badgeCheck = true

          this.$hiClass.notificationBadges
            .update(this.badgeData)
            .then(() => {
              this.isUnreadNotiAlarm = false
            })
            .catch(error => {
              this.$log.debug(
                this.$options.name + ' updateNotificationBadges() error : ',
                error
              )
            })
        }
      } catch (error) {
        this.$log.warn(
          this.$options.name + ' updateNotificationBadges() error : ',
          error
        )
      }
    },
    /**
     * 1회성 알림 플래그 정보 search
     */
    searchOnceChecks(_flag) {
      const _user = this.user._links.self.href
      const params = {
        _user,
        _flag
      }
      return this.$hiClass.onceChecks.search(params)
    },
    closeAndReadDetailPostLayer() {
      this.setIsShowDetailPostLayer(false)
      this.setItemDetailObj({})
    },

    getReplayData() {
      return {
        NOTTODAY:
          (JSON.parse(localStorage.NOTTODAY || null) || {})[
            this.$moment().format('YYYYMMDD')
            ] || null,
        ANYMORE: JSON.parse(localStorage.ANYMORE || null)
      }
    },

    handleItemClass(itemName) {
      let flag = false

      try {
        if (itemName === 'alarmplus') {

          const replayData = this.getReplayData()
          const replayType = 'NOTTODAY'
          const itemId = 'main-header-alarmplus-cursor-pointer'

          let replayItem = (replayData[replayType] || []).filter(rep => {
            return rep.currentId === itemId
          }, {})

          // 0인 경우 노출 처리
          if (replayItem.length === 0) {
            flag = true

            // 노출처리하면서 오늘 다시 노출되지 않도록 처리
            const itemId = 'main-header-alarmplus-cursor-pointer'
            this.setNotToDay(itemId)
          }

        }

      } catch (e) {
        return flag
      }

      this.isFocus[itemName] = flag
    },

    setNotToDay(itemId) {
      let toDay = this.$moment().format('YYYYMMDD')
      let storage = JSON.parse(localStorage.NOTTODAY || null) || {},
        replay = storage[toDay] || null

      if (replay) {
        if (!replay.find(item => item.currentId === itemId)) {
          replay.push({currentId: itemId})

          localStorage.NOTTODAY = JSON.stringify(storage)
        }
      } else {
        replay = {}
        replay[toDay] = [{currentId: itemId}]

        localStorage.NOTTODAY = JSON.stringify(
          Object.assign(storage, replay)
        )
      }
    },
    async clickNotiBox() {
      this.triggerAnalyticsLogEvent({ code: 'analytics.home.click.button.notification' })
      this.isShowAlarm = !this.isShowAlarm
    }

  }
}
</script>

<style lang="scss" scoped>
.header-cont-inner .header-right-wrap .header-badge-wrap .badge-item > button.hitalk.icon{
    position:relative;
    font-size: 15px;
    width:30px;
    height:30px;
}
.header-cont-inner .header-right-wrap .header-badge-wrap .badge-item > button.hitalk.icon:before {
    width:30px;
    height:30px;
    content: '';
    display: inline-block;
    background-image:url('../img/icon_header_talk_30.png');
    background-size: cover;
}
.header-cont-inner .header-right-wrap .header-badge-wrap .badge-item > button.hitalk.icon.alarm:after {
    position: absolute;
    width: 10px;
    height: 10px;
    left: 19px;
    top: 2px;
    content: '';
    background: #ff6a6a;
    border-radius: 10px;
}
.tooltip span {
  white-space: pre;
}

.fade-leave-active {
  transition: opacity 0.1s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
{
  opacity: 0;
}
</style>
