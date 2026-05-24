<!--
@File(Method): MainHeader.vue
@Description: 공통 헤더
@Modified: 공통 헤더 리뉴얼
-->
<template>
  <fragment>
    <div
      id="header-content-wrap"
      ref="renewalHeaderWrap"
      :class="['renew-header-content-wrap', 'variant-' + variant]"
    >
      <div class="header-content-inner">
        <div class="header-left-area">
          <main-header-logo :logo-type="mainHeaderLogoType" @doReloadMain="$router.go(0)" :variant="variant" />
          <div class="header-gnb-wrap">
            <a href="javascript:void(0)" :class="{ on: curTab === 'class' }" @click="onClickButton('class')">
              {{ $t('main.header.clazzes') }}
            </a>
            <a
              href="javascript:void(0)"
              :class="{
                on: curTab === 'chat',
                'new-dot': chatUncheckedMessage.count > 0,
              }"
              @click="onClickButton('hitalk')"
              v-if="showMenus.hitalk"
            >
              {{ $t('main.header.chat') }}
            </a>
            <a
              v-if="isTeacher && showMenus.behavior"
              href="javascript:void(0)"
              :class="{
                on: curTab === 'behavior',
              }"
              class="behavior"
              @click="onClickButton('behavior')"
            >
              {{ $t('main.header.behavior') }}
              <!-- <span class="behavior__new-info">
                <em>선생님 ONLY</em>
              </span> -->
            </a>
            <a v-if="isShowAlarmPlus" id="alarmplusTab" href="javascript:void(0)" :class="{ on: curTab === 'alarmplus' }" @click="onClickButton('alarmplus')">
              {{ $t('main.header.alarmplus') }}

              <!-- <div class="new-banner-container">
                <div class="powerful-banner">
                </div>
              </div> -->
            </a>
            <!-- <span v-if="curTab === 'alarmplus'" class="tooltip" style="display: block">
              <span>{{ $t('tooltip.main.header.alarmplus') }}<span>{{ $t('tooltip.main.header.alarmplus.suffix') }}</span></span>
            </span> -->
            <a
              v-if="isTeacher && isTimetableMenuVisible"
              href="javascript:void(0)"
              :class="{ on: curTab === 'timetable' }"
              @click="onClickButton('timetable')"
            >
              {{ $t('main.header.timetable') }}
            </a>
            <a
              v-if="isTeacher"
              href="javascript:void(0)"
              :class="{ on: curTab === 'text' }"
              @click="onClickButton('text')"
            >
              {{ $t('main.header.text') }}
            </a>
          </div>
        </div>
        <div class="header-right-area">
          <div class="header-right-wrap">
            <div class="header-talk-wrap">
              <!-- :class="{ on: isShowTalk }" 삭제 -->
              <div class="badge-item" @mouseenter="onTooltipEnter('talk')" @mouseleave="onTooltipLeave('talk')">
                <button type="button" id="talkBtn" class="badge-talk" @click="onClickButton('hitalk')">
                  <HiIcon name="ico-talk" :color="variant === 'alarmplus' ? 'white' : 'black'" size="24" />
                  <span class="badge-count" v-if="talkCount > 0">
                    <span class="count">{{ talkCount }}</span>
                  </span>
                
                </button>
                <!-- <HiTooltip v-if="isShowTalkTooltip" isActive ico="none" position="bottom" class="hi-tooltip-wrap" :title-html="`하이톡`" /> -->
              </div>
            </div>
            <div class="header-board-wrap" v-if="isTeacher">
              <div class="badge-item" :class="{ on: isShowBoard }" @mouseenter="onTooltipEnter('board')" @mouseleave="onTooltipLeave('board')">
                <button type="button" id="boardBtn" class="badge-board" @click="onClickButton('behavior')">
                  <HiIcon name="ico-board" :color="variant === 'alarmplus' ? 'white' : 'black'" size="24" />
                </button>
                <!-- <HiTooltip v-if="isShowBoardTooltip" isActive ico="none" position="bottom" class="hi-tooltip-wrap" :title-html="`학급기록`" /> -->
              </div>
            </div>
            <div class="header-badge-wrap">
              <div
                class="badge-item"
                :class="{ on: isShowAlarm, 'new-dot': isUnreadNotiAlarm }"
                @mouseenter="onTooltipEnter('alarm')"
                @mouseleave="onTooltipLeave('alarm')"
              >
                <button type="button" id="alarmBtn" class="badge-alarm" @mousedown.stop @touchstart.stop @click="toggleAlarmCore">
                  <HiIcon name="ico-bell" :color="variant === 'alarmplus' ? 'white' : 'black'" size="24" />
                  <span class="badge-count" v-if="alarmCount > 0">
                    <span class="count">{{ alarmCount }}</span>
                  </span>
                </button>
                <!-- <HiTooltip v-if="isShowAlarmTooltip" isActive ico="none" class="hi-tooltip-wrap" position="bottom" :title-html="`알림`" /> -->
                <!-- notibox -->
                <!-- <MainHeaderNotibox
                  v-if="isShowAlarm"
                  :user="user"
                  :isUnreadNotiAlarm="isUnreadNotiAlarm"
                  @hideAlarm="hideAlarm"
                  @updateNotificationBadges="updateNotificationBadges"
                /> -->
              </div>
            </div>
            <div class="header-search-wrap">
              <div
                class="badge-item"
                :class="{ active: isShowSearchLayer }"
                @mouseenter="onTooltipEnter('search')"
                @mouseleave="onTooltipLeave('search')"
              >
                <button v-if="!isHideSearchButton" id="searchBtn" class="badge-search" @mousedown.stop @touchstart.stop @click="toggleSearchCore">
                  <HiIcon name="ico-input-search" :color="variant === 'alarmplus' ? 'white' : 'black'" size="24" />
                </button>
                <!-- <HiTooltip v-if="isShowSearchTooltip" isActive ico="none" class="hi-tooltip-wrap" position="bottom" :title-html="`검색`" /> -->
              </div>
              <!-- <transition name="fade">
                <main-header-search-layer v-if="isShowSearchLayer" @hide-search-layer="hideSearchLayer" />
              </transition> -->
            </div>
          </div>
          <div class="header-right-mypage">
            <main-header-mypage :user="user" :variant="variant" />
          </div>
        </div>
      </div>
    </div>
    <!-- 헤더 스크롤 영역 밖에 렌더링되는 전역 오버레이 -->
    <!-- 툴팁 -->
    <div
      v-if="isShowTalkTooltip"
      class="header-global-overlay tooltip-overlay"
      :class="{ 'alarmplus-theme': variant === 'alarmplus' }"
      :style="tooltipStyle('talkTooltip')"
    >
      <HiTooltip isActive ico="none" position="bottom" class="hi-tooltip-wrap" :title-html="`하이톡`" />
    </div>
    <div
      v-if="isShowBoardTooltip"
      class="header-global-overlay tooltip-overlay"
      :class="{ 'alarmplus-theme': variant === 'alarmplus' }"
      :style="tooltipStyle('boardTooltip')"
    >
      <HiTooltip isActive ico="none" position="bottom" class="hi-tooltip-wrap" :title-html="`학급기록`" />
    </div>
    <div
      v-if="isShowAlarmTooltip && !isMobile"
      class="header-global-overlay tooltip-overlay"
      :class="{ 'alarmplus-theme': variant === 'alarmplus' }"
      :style="tooltipStyle('alarmTooltip')"
    >
      <HiTooltip isActive ico="none" position="bottom" class="hi-tooltip-wrap" :title-html="`알림`" />
    </div>
    <div
      v-if="isShowSearchTooltip && !isMobile"
      class="header-global-overlay tooltip-overlay"
      :class="{ 'alarmplus-theme': variant === 'alarmplus' }"
      :style="tooltipStyle('searchTooltip')"
    >
      <HiTooltip isActive ico="none" position="bottom" class="hi-tooltip-wrap" :title-html="`검색`" />
    </div>

    <!-- 알림함 팝업 -->
    <div
      v-if="isShowAlarm"
      :class="['header-global-overlay alarm-overlay', { 'center-alarm-popup': shouldCenterAlarm() }]"
      :style="popupStyle('alarmPopup')"
    >
      <MainHeaderNotibox
        :user="user"
        :isUnreadNotiAlarm="isUnreadNotiAlarm"
        @hideAlarm="hideAlarm"
        @updateNotificationBadges="updateNotificationBadges"
      />
    </div>

    <!-- 검색 레이어 팝업 -->
    <transition name="fade">
      <div
        v-if="isShowSearchLayer"
        class="header-global-overlay search-overlay"
        :style="popupStyle('searchPopup')"
      >
        <main-header-search-layer @hide-search-layer="hideSearchLayer" />
      </div>
    </transition>

    <!-- 알리미 탭 안내 배너 (헤더 스크롤 영역 밖) -->
    <div
      v-if="curTab === 'alarmplus'"
      class="header-global-overlay tooltip-overlay tip-content"
      :class="{ 'alarmplus-theme': variant === 'alarmplus' }"
      :style="tooltipStyle('alarmplusTip')"
    >
      <span>
        {{ $t('tooltip.main.header.alarmplus') }}
        <span>{{ $t('tooltip.main.header.alarmplus.suffix') }}</span>
      </span>
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
    <alarm-plus-detail-popup v-if="isVisibleAlarmPlus && alarmPlusDetail.eLetterId" />
    <!-- 가정통신문 플러스 초대장 팝업 -->
    <alarm-plus-invite-card-popup v-if="isVisibleAlarmPlus && alarmPlusInviteSchool.currentId" />
    <print-viewer v-if="printView.isOpen"></print-viewer>
    <!-- 건강상태 자가진단 무료 문자 팝업 -->
    <health-check-free-sms v-if="healthCheckFreeSms.isOpen" />
    <!-- 학생 건강상태 자가진단 팝업 -->
    <!-- <student-health-check v-if="studentHealthCheck.isOpen" /> -->
    <student-health-check2 v-if="studentHealthCheck.isOpen" />
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
    <clazz-remind-push-modal v-if="clazzRemindPushModal.isOpen" />
    <!-- 클래스 RNB 우리반 일정 팝업 -->
    <main-body-clazzes-rnb-calendar-schedule
      v-if="clazzCalendarSchedule.isOpen"
      :clazzes="clazzCalendarSchedule.clazzes"
      :curItem="clazzCalendarSchedule.curItem"
      :selectedDate="clazzCalendarSchedule.clickedDate"
    />
    <!-- 토스트 메시지 -->
    <Toast v-if="isShowToast" />
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

    <join-with-invite-code-process />

    <post-terms v-if="curPostTerms.isOpen" />

    <post-terms-detail v-if="curPostTerms.isOpenDetail" />

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
    <add-classroom v-if="isAddClassroom" @close="closeAddClassroomModal" />
    <portal-target name="member-approval" />
  </fragment>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
import { mapFields } from 'vuex-map-fields';

import MainHeaderLogo from '@/apps/main/MainHeaderLogo.vue';
import MainHeaderMypage from '@/apps/main/MainHeaderMypageV2.vue';
import MainHeaderNotibox from '@/apps/main/MainHeaderNotibox.vue';
import MainHeaderSearchLayer from '@/apps/main/MainHeaderSearchLayerV2.vue';
import MainBodyClazzesRnbCalendarSchedule from '@/apps/main/clazzes/MainBodyClazzesRnbCalendarSchedule.vue';
import ErrorLoadFailAsyncComponent from '@/apps/error/ErrorLoadFailAsyncComponent.vue';

import DetailPostItem from '@/components/DetailPost/DetailPostItem.vue';
import ClazzApplyList from '@/components/Popup/ClazzApplyList.vue';
import ClazzApplicationUser from '@/components/Popup/ClazzApplicationUser.vue';
import JoinWithInviteCodeProcess from '@/components/Popup/JoinWithInviteCode';
import Message from '@/components/Popup/Message.vue';
import PostTerms from '@/components/Popup/PostTerms.vue';
import ClazzRemindPushModal from '@/components/Modal/ClazzRemindPushModal';
import PrintViewer from '@/components/Viewer/PrintViewer';
import AttendanceRegisterModal from '@/apps/main/clazzes/attendance/modal/AttendanceRegisterModal';
import AttendanceDetailModal from '@/apps/main/clazzes/attendance/modal/AttendanceDetailModal';
import ConfirmDialog from '@/apps/hitalk/components/popup/ConfirmDialog';
import AddClassroom from '@/apps/behavior/components/popup/AddClassroom.vue';
import { openPopup } from '@/plugins/utils';
import CONSTANTS from '@/plugins/constants';
import HiTooltip from '@/components/Tooltip/HiTooltip';

const Toast = () => ({
  component: import('@/apps/main/MainPopupToast.vue'),
  error: ErrorLoadFailAsyncComponent,
});
const AlarmPlusDetailPopup = () => ({
  component: import('@/components/AlarmPlus/AlarmPlusDetailPopup.vue'),
  error: ErrorLoadFailAsyncComponent,
});
const AlarmPlusInviteCardPopup = () => ({
  component: import('@/components/AlarmPlus/AlarmPlusInviteCardPopup.vue'),
  error: ErrorLoadFailAsyncComponent,
});
const LikeListPopup = () => ({
  component: import('@/components/Popup/LikeListPopup.vue'),
  error: ErrorLoadFailAsyncComponent,
});
const HealthCheckFreeSms = () => ({
  component: import('@/components/Popup/HealthCheckFreeSms.vue'),
  error: ErrorLoadFailAsyncComponent,
});
const StudentHealthCheck2 = () => ({
  component: import('@/components/Popup/StudentHealthCheck2.vue'),
  error: ErrorLoadFailAsyncComponent,
});
const ClazzApplicationForm = () => ({
  component: import('@/components/Popup/ClazzApplicationForm.vue'),
  error: ErrorLoadFailAsyncComponent,
});
const PostTermsDetail = () => ({
  component: import('@/components/Popup/PostTermsDetail.vue'),
  error: ErrorLoadFailAsyncComponent,
});

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
    DetailPostItem, // 게시물 상세 레이어 팝업
    JoinWithInviteCodeProcess,

    Toast, // 토스트 메시지 팝업
    LikeListPopup, // 좋아요 리스트 레이어 팝업
    AlarmPlusDetailPopup, // 가정통신문 플러스 상세 팝업
    AlarmPlusInviteCardPopup, // 가정통신문 플러스 초대장 팝업
    HealthCheckFreeSms, // 건강상태 자가진단 무료 문자 팝업
    StudentHealthCheck2, // 학생 건강상태 자가진단 팝업
    ClazzApplicationForm, // 클래스 신청서 등록/수정 팝업
    AttendanceRegisterModal,
    AttendanceDetailModal,
    AddClassroom,
    HiTooltip,
  },
  props: {
    isTempStudent: Boolean,
    clazzes: Object,
    variant: {
      type: String,
      default: 'default'
    },
    isUsingAlarmPlus: Boolean,
    isTimetableMenuVisible: Boolean
  },
  data() {
    return {
      isMobile: false,
      isShowTalkTooltip: false,
      isShowBoardTooltip: false,
      isShowAlarmTooltip: false,
      isShowSearchTooltip: false,
      isAddClassroom: false,
      isShowSearchLayer: false,
      isShowPostLayer: false,
      isShowAlarm: false,
      isUnreadNotiAlarm: false,
      isFocus: {
        alarmplus: false,
      },
      curTab: '',
      key: '',
      item: '',
      postsList: [],
      badgeData: null,
      confirmDialog: {
        title: '로그아웃 안내',
        description:
          '비밀번호 변경 또는 로그인 만료 등으로 인해\n로그아웃되었습니다.\n보안을 위해 <span style="color: #4778DE;">다시 로그인 해주세요.</span>',
      },
      isShowTalk: false,
      isShowBoard: false,
      talkCount: null,
      alarmCount: null,
      showMenus: {
        hitalk: true,
        behavior: true,
      },
      overlayPositions: {
        talkTooltip: { left: 0, top: 0 },
        boardTooltip: { left: 0, top: 0 },
        alarmTooltip: { left: 0, top: 0 },
        searchTooltip: { left: 0, top: 0 },
        alarmPopup: { left: 0, top: 0 },
        searchPopup: { left: 0, top: 0 },
        alarmplusTip: { left: 0, top: 0, transform: 'translateX(-50%)' },
      },      
      recalcTimers: []
    };
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
      versionData: 'versionData'
    }),
    ...mapState('storeHome', {
      joinWithInviteCode: 'joinWithInviteCode',
      joinWithInviteCodeParents: 'joinWithInviteCodeParents',
      joinWithInviteCodeStudent: 'joinWithInviteCodeStudent',
    }),
    ...mapState('storeSchool', ['alarmPlusSchools', 'textAuthorities']),
    ...mapGetters('storeSchool', ['getFirstPermissibleSchool']),
    ...mapGetters({
      isEmptyClassSubscriptionAndTempStudent: 'isEmptyClassSubscriptionAndTempStudent',
      isExpired: 'isExpired',
    }),
    ...mapFields({
      isNewTabLoading: 'isNewTabLoading',
    }),
    ...mapState('storeClazzes', {
      attendanceModal: 'attendanceModal',
    }),
    user() {
      return this.$store.state.user;
    },
    isTeacher() {
      return this.user.userSns !== undefined && this.user.userType !== undefined && this.user.userType.toUpperCase() === 'TEACHER';
    },
    isShowAlarmPlus() {
      return this.isTeacher;
    },
    isHideSearchButton() {
      return this.isEmptyClassSubscriptionAndTempStudent;
    },
    mainHeaderLogoType() {
      //return 'NEW_LOGO';
      if (this.variant === 'alarmplus') {
        return 'NEW_LOGO';
      }
      return !this.isExpired({expiredTime: this.eventLogoExpiredTime})
        ? 'SNOW_TREE'
        : 'NEW_LOGO'
      // return 'SNOW_TREE';
    },
    headerVariant() {
      // side-navi-menu가 보이면 alarmplus, 아니면 default
      return document.querySelector('.main-slb, .MainSlb') ? 'alarmplus' : 'default';
    }
  },
  watch: {
    $route() {
      this.$forceUpdate();
      this.init();
      this.checkNotificationBadges();
      this.checkHitalkUnreadMessage();
      this.alarmPlusTeacherSubscribeCheck();
      // 라우트 변경으로 탭이 알리미가 되면 팁 위치를 즉시 계산
      this.$nextTick(() => {
        if (this.curTab === 'alarmplus') {
          this.updateAlarmplusTipPos();
        }
      });
    },
    isShowTalkTooltip(val) {
      if (val) this.updateTooltipPos('talkTooltip', 'talkBtn');
    },
    isShowBoardTooltip(val) {
      if (val) this.updateTooltipPos('boardTooltip', 'boardBtn');
    },
    isShowAlarmTooltip(val) {
      if (val) this.updateTooltipPos('alarmTooltip', 'alarmBtn');
    },
    isShowAlarm(val) {
      if (val) this.updateAlarmPopupPos();
    },
    isShowSearchLayer(val) {
      if (val) this.updateSearchLayerPos();
    },
    isShowSearchTooltip(val) {
      if (val) this.updateTooltipPos('searchTooltip', 'searchBtn');
    },
    // 탭 변경 시 알리미 활성화 시 위치를 여러 번 재계산하여 안정화
    curTab(val) {
      if (val === 'alarmplus') {
        this.recalcAlarmplusTipSoon();
      }
    },
  },
  async created() {
    this.init();
    this.checkNotificationBadges();

    // 1회성 알림 플래그 정보 set - 비밀 댓글 사용 확인
    if (!this.onceChecks.userSecretCommentUsed) {
      this.searchOnceChecks('userSecretCommentUsed').then((res) => {
        if (res.data.page && res.data.page.totalElements > 0) {
          this.setOnceChecksUserSecretCommentUsed(true);
        }
      });
    }
    const res = await this.isBlockUserCheck(true);
    if (res) {
      this.confirmDialog = {
        title: '이용이 제한된 계정입니다.',
        description:
          '안전한 서비스 운영정책에 따라\n일정 기간 동안 이용이 제한되었습니다.\n운영정책에 위반된 행위를 계속할 경우\n영구 이용 제한될 수 있습니다.',
      };
      // 이곳에 블락 처리 메시지 뿌려주기.
      //this.$router.push('/logout', () => {})
    }
  },
  mounted() {
    if (this.isiPad()) {
      document.body.classList.add('ios');
    }
    const ua = navigator.userAgent || '';
    if (/Android/i.test(ua)) {
      document.body.classList.add('android-hide-scrollbars');
    }
    this.$nextTick(() => {
      this.updateAllOverlayPositions();
    });
    window.addEventListener('resize', this.updateAllOverlayPositions);
    window.addEventListener('scroll', this.updateAllOverlayPositions);
    if (this.$refs.renewalHeaderWrap) {
      this.$refs.renewalHeaderWrap.addEventListener('scroll', this.updateAllOverlayPositions);
    }
    this.checkWindowSize();
    this.checkHitalkUnreadMessage();
    window.addEventListener('resize', this.checkWindowSize);
    if (this.curTab === 'alarmplus') {
      this.recalcAlarmplusTipSoon();
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkWindowSize);
    window.removeEventListener('resize', this.updateAllOverlayPositions);
    window.removeEventListener('scroll', this.updateAllOverlayPositions);
    if (this.$refs.renewalHeaderWrap) {
      this.$refs.renewalHeaderWrap.removeEventListener('scroll', this.updateAllOverlayPositions);
    }
    if (this.recalcTimers && this.recalcTimers.length) {
      this.recalcTimers.forEach((t) => clearTimeout(t));
      this.recalcTimers = [];
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
      alarmPlusTeacherSubscribeCheck: 'alarmPlusTeacherSubscribeCheck',
      initChatUncheckedMessage: 'initChatUncheckedMessage',
      openHitalkPopup: 'openHitalkPopup',
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
      isAllDeviceLogout: 'isAllDeviceLogout',
      isBlockUserCheck: 'isBlockUserCheck',
      openBehaviorRecordPopup: 'openBehaviorRecordPopup',
    }),
    ...mapActions('storeBehavior', {
      getClassrooms: 'getClassrooms',
    }),
    ...mapActions('storeSchool', ['loadTextAuthorities']),
    ...mapMutations('storeClazzes', {
      setAttendanceModal: 'setAttendanceModal',
    }),
    moveHome: function () {
      this.$emit('doReloadMain');
    },
    allLogout: function () {
      window.close();
      this.$router.push('/logout', () => {});
    },
    closeAttendanceRegisterModal: async function (id) {
      this.$hiClass.toggleBodyClass('remove', 'hidden');
      this.setAttendanceModal({
        id: null,
        classId: null,
        isShowRegisterModal: false,
        isShowDetailModal: false,
        isConfirmdMode: false,
        clazzMemberRole: null,
      });
    },
    closeAttendanceDetailModal: async function (value) {
      this.$hiClass.toggleBodyClass('remove', 'hidden');
      this.setAttendanceModal({
        ...this.attendanceModal,
        id: value.id,
        isShowRegisterModal: value.id ? true : false,
        isShowDetailModal: false,
        isConfirmdMode: value.isConfirm,
      });
    },
    // 학생 행동기록 팝업 열기
    openStudentActionRecordPopup: async function () {
      const classrooms = await this.getClassrooms({ isUsed: true });
      if (classrooms.page.totalElements > 0) {
        // this.openBehaviorRecordPopup(null) //openPopup으로 전환
        openPopup(CONSTANTS.POPUP.BEHAVIOR_RECORD, { connectedClassId: this.curClassId });
      } else {
        this.isAddClassroom = true;
      }
    },
    closeAddClassroomModal: function (classroom) {
      this.isAddClassroom = false;
      if (classroom) {
        // this.openBehaviorRecordPopup({connectedClassId: this.curClassId}) //openPopup으로 전환
        openPopup(CONSTANTS.POPUP.BEHAVIOR_RECORD, { connectedClassId: this.curClassId });
      }
    },
    async onClickButton(name) {
      switch (name) {
        case 'class':
          this.goRoute('/main/home');
          break;
        case 'hitalk':
          this.triggerAnalyticsLogEvent({ code: 'analytics.chat.click' });
          //this.openHitalkPopup(null) //openPopup으로 전환
          this.initChatUncheckedMessage();
          openPopup(CONSTANTS.POPUP.HI_TALK);
          break;
        case 'alarmplus':
          this.triggerAnalyticsLogEvent({ code: 'analytics.alarmplus.click' });
          !this.isUsingAlarmPlus ?
            this.goRoute('/main/alarmplus/index?tab=alarmplus') :
            this.goRoute(`/main/alarmplus/schools/${this.alarmPlusSchools[0].schoolId}/school-post`);
          break;
        case 'behavior':
          this.triggerAnalyticsLogEvent({ code: 'analytics.behavior.click' });
          //this.openStudentActionRecordPopup()
          //this.openBehaviorRecordPopup(null) //openPopup으로 전환
          openPopup(CONSTANTS.POPUP.BEHAVIOR_RECORD);
          break;
        case 'timetable': {
          this.triggerAnalyticsLogEvent({ code: 'analytics.timetable.click' });
          const deniedType = ['KINDERGARTEN', 'ELEMENTARY'];
          const filteredSchools = this.alarmPlusSchools.filter(s => !deniedType.includes(s.schoolType));
          !this.isUsingAlarmPlus ?
            this.goRoute(`/main/alarmplus/index?tab=timetable`) :
            filteredSchools.length === 0 ?
              this.goRoute(`/main/alarmplus/schools/${this.alarmPlusSchools[0].schoolId}/school-post`) :
              this.goRoute(`/main/alarmplus/schools/${filteredSchools[0].schoolId}/school-timetable`);
          break;
        }
        case 'text': {
          await this.loadTextAuthorities();
          if (this.textAuthorities.length === 0) {
            this.goRoute(`/main/text/index`)
          } else {
            const authority = this.getFirstPermissibleSchool('send');
            if (authority) {
              this.goRoute(`/main/text/schools/${authority.schoolId}/send`);
            } else {
              this.goRoute(`/main/text/schools/${this.textAuthorities[0].schoolId}/send`);
            }
          }
          break;
        }
      }
    },
    goRoute(path) {
      // if (path === this.$route.path) {
      //   path === '/main' || path === '/main/home' ? this.$emit('doReloadMain') : this.$router.go(0);
      // } else {
      //   this.$router.push(path, () => {});
      // }
      const isSamePath = path === this.$route.path;
      if (isSamePath) {
        // 현재 경로가 동일하면서 쿼리가 남아있으면 쿼리 제거해서 이동
        const hasQuery = this.$route.query && Object.keys(this.$route.query).length > 0;
        if (hasQuery) {
          this.$router.push({ path }, () => {});
          return;
        }
        path === '/main' || path === '/main/home' ? this.$emit('doReloadMain') : this.$router.go(0);
      } else {
        this.$router.push(path, () => {});
      }
    },
    init: function () {
      let curPath = this.$route.path;
      let curQuery = this.$route.query;
      if (curPath.includes('/main/home') || curPath.includes('/main/clazzes')) this.curTab = 'class';
      else if (curPath.includes('/main/chat')) this.curTab = 'chat';
      else if (curPath.includes('/main/education')) this.curTab = 'education';
      else if (curPath.includes('/main/alarmplus') && (curPath.includes('/my-timetable') || curPath.includes('/school-timetable') || curQuery.tab === 'timetable')) this.curTab = 'timetable';
      else if (curPath.includes('/main/alarmplus')) this.curTab = 'alarmplus';
      else if (curPath.includes('/main/text')) this.curTab = 'text';
      else this.curTab = '';
    },
    goPage(path) {
      this.$router.push(path, () => {});
    },
    hideSearchLayer() {
      this.isShowSearchLayer = false;
      this.isShowSearchTooltip = false;
      const btn = document.getElementById('searchBtn');
      if (btn) btn.blur();
    },
    hideAlarm() {
      this.isShowAlarm = false;
      // tooltip hover state 동기화 (외부 클릭 시 hover 상태가 남지 않도록)
      this.isShowAlarmTooltip = false;
      const ref = this.$refs.renewalHeaderWrap;
      if (ref) ref.classList.remove('on');
    },
    async checkNotificationBadges() {
      const userUri = this.user._links.self.href;
      let params = {
        _user: userUri,
        _badgeCheck: false,
        size: 1,
      };
      try {
        const result = await this.$hiClass.notificationBadges.search(params);
        this.isUnreadNotiAlarm = !result.data.badgeCheck;
        this.badgeData = { badgeCheck: result.data.badgeCheck };
      } catch (error) {
        this.$log.debug(this.$options.name + ' checkNotificationBadges() error : ', error);
      }
    },
    async checkHitalkUnreadMessage() {
      const res = await this.$axios.get(`/v2/chatUserMsgCnt/${localStorage.uuid}`);
      // this.talkCount = res.data.count || 0
    },
    updateNotificationBadges(isForceUpdate = false) {
      try {
        if ((this.isUnreadNotiAlarm && !this.badgeData.badgeCheck) || isForceUpdate) {
          this.badgeData.badgeCheck = true;

          this.$hiClass.notificationBadges
            .update(this.badgeData)
            .then(() => {
              this.isUnreadNotiAlarm = false;
            })
            .catch((error) => {
              this.$log.debug(this.$options.name + ' updateNotificationBadges() error : ', error);
            });
        }
      } catch (error) {
        this.$log.warn(this.$options.name + ' updateNotificationBadges() error : ', error);
      }
    },
    /**
     * 1회성 알림 플래그 정보 search
     */
    searchOnceChecks(_flag) {
      const _user = this.user._links.self.href;
      const params = {
        _user,
        _flag,
      };
      return this.$hiClass.onceChecks.search(params);
    },
    closeAndReadDetailPostLayer() {
      this.setIsShowDetailPostLayer(false);
      this.setItemDetailObj({});
    },
    getReplayData() {
      return {
        NOTTODAY: (JSON.parse(localStorage.NOTTODAY || null) || {})[this.$moment().format('YYYYMMDD')] || null,
        ANYMORE: JSON.parse(localStorage.ANYMORE || null),
      };
    },
    handleItemClass(itemName) {
      let flag = false;
      try {
        if (itemName === 'alarmplus') {
          const replayData = this.getReplayData();
          const replayType = 'NOTTODAY';
          const itemId = 'main-header-alarmplus-cursor-pointer';

          let replayItem = (replayData[replayType] || []).filter((rep) => {
            return rep.currentId === itemId;
          }, {});

          // 0인 경우 노출 처리
          if (replayItem.length === 0) {
            flag = true;

            // 노출처리하면서 오늘 다시 노출되지 않도록 처리
            const itemId = 'main-header-alarmplus-cursor-pointer';
            this.setNotToDay(itemId);
          }
        }
      } catch (e) {
        return flag;
      }
      this.isFocus[itemName] = flag;
    },

    setNotToDay(itemId) {
      let toDay = this.$moment().format('YYYYMMDD');
      let storage = JSON.parse(localStorage.NOTTODAY || null) || {},
        replay = storage[toDay] || null;

      if (replay) {
        if (!replay.find((item) => item.currentId === itemId)) {
          replay.push({ currentId: itemId });

          localStorage.NOTTODAY = JSON.stringify(storage);
        }
      } else {
        replay = {};
        replay[toDay] = [{ currentId: itemId }];

        localStorage.NOTTODAY = JSON.stringify(Object.assign(storage, replay));
      }
    },
    toggleTalk() {
      this.isShowTalk = !this.isShowTalk;
    },
    toggleBoard() {
      this.isShowBoard = !this.isShowBoard;
    },
    // 포인터 이벤트로 알림창 토글 처리 (모바일/데스크톱 공통)
    onTooltipEnter(key) {
      if (this.isMobile) return;
      if (key === 'alarm') this.isShowAlarmTooltip = true;
      else if (key === 'search') this.isShowSearchTooltip = true;
      else if (key === 'talk') this.isShowTalkTooltip = true;
      else if (key === 'board') this.isShowBoardTooltip = true;
    },
    onTooltipLeave(key) {
      if (this.isMobile) return;
      if (key === 'alarm') this.isShowAlarmTooltip = false;
      else if (key === 'search') this.isShowSearchTooltip = false;
      else if (key === 'talk') this.isShowTalkTooltip = false;
      else if (key === 'board') this.isShowBoardTooltip = false;
    },
    toggleSearchCore() {
      if (this.versionData.web.useClassSearchInHeader !== undefined && this.versionData.web.useClassSearchInHeader === false) {
        this.$router.push('/main/search?searchType=class_school');
        return;
      }

      this.isShowSearchLayer = !this.isShowSearchLayer;
      // 알림이 열려있으면 닫아 중복 팝업 방지
      if (this.isShowSearchLayer) this.isShowAlarm = false;
    },
    toggleAlarmCore() {
      this.triggerAnalyticsLogEvent({ code: 'analytics.home.click.button.notification' });
      this.isShowAlarm = !this.isShowAlarm;
      // 검색 레이어가 열려있으면 닫아 중복 팝업 방지
      if (this.isShowAlarm) this.isShowSearchLayer = false;
      // header wrapper 'on' 클래스 동기화
      const ref = this.$refs.renewalHeaderWrap;
      if (ref) {
        if (this.isShowAlarm) ref.classList.add('on');
        else ref.classList.remove('on');
      }
    },
    isiPad() {
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
      const isMacTouchDevice = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
      return (isIOS && /iPad/.test(ua)) || isMacTouchDevice;
    },
    checkWindowSize() {
      const width = window.innerWidth;
      const show = width >= 1024;
      this.showMenus.hitalk = show;
      this.showMenus.behavior = show;
      this.isMobile = width <= 768;
    },
    getAnchorRectById(id) {
      const el = document.getElementById(id);
      return el ? el.getBoundingClientRect() : null;
    },
    updateTooltipPos(key, anchorId) {
      const rect = this.getAnchorRectById(anchorId);
      if (!rect) return;
      this.overlayPositions[key] = {
        left: rect.left + rect.width / 2,
        top: rect.bottom,
      };
    },
    updateAlarmPopupPos() {
      const rect = this.getAnchorRectById('alarmBtn');
      if (!rect) return;
      const width = 428;
      const left = Math.max(rect.right - width, 0);
      this.overlayPositions.alarmPopup = {
        left,
        top: rect.bottom + 12,
      };
    },
    updateSearchLayerPos() {
      const rect = this.getAnchorRectById('searchBtn');
      if (!rect) return;
      const popupWidth = 428; // 검색 팝업의 예상 너비(px)
      let left = rect.left + rect.width / 2;
      let transform = 'translateX(-50%)';
      // 오른쪽이 잘릴 경우
      if (left + popupWidth / 2 > window.innerWidth - 12) {
        left = window.innerWidth - popupWidth / 2 - 40;
        transform = 'translateX(-50%)';
      }
      // 왼쪽이 잘릴 경우
      if (left - popupWidth / 2 < 12) {
        left = popupWidth / 2 + 40;
        transform = 'translateX(-50%)';
      }
      this.overlayPositions.searchPopup = {
        left,
        top: rect.bottom + 12,
        transform,
      };
    },
    updateAlarmplusTipPos() {
      const rect = this.getAnchorRectById('alarmplusTab');
      if (!rect) return;
      const left = rect.left + rect.width + 25;
      const top = rect.bottom + 17;
      this.overlayPositions.alarmplusTip = {
        left,
        top,
        transform: 'translateX(-50%)',
      };
    },
    shouldCenterAlarm() {
      try {
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
        return vw <= 660;
      } catch (e) {
        return false;
      }
    },
    // 레이아웃/폰트 로드로 위치가 살짝 변할 수 있어 짧은 간격으로 여러 번 재계산
    recalcAlarmplusTipSoon() {
      this.updateAlarmplusTipPos();
      this.$nextTick(() => this.updateAlarmplusTipPos());
      this.recalcTimers.push(setTimeout(() => this.updateAlarmplusTipPos(), 0));
      this.recalcTimers.push(setTimeout(() => this.updateAlarmplusTipPos(), 250));
    },
    updateAllOverlayPositions() {
      if (this.isShowTalkTooltip) this.updateTooltipPos('talkTooltip', 'talkBtn');
      if (this.isShowBoardTooltip) this.updateTooltipPos('boardTooltip', 'boardBtn');
      if (this.isShowAlarmTooltip) this.updateTooltipPos('alarmTooltip', 'alarmBtn');
      if (this.isShowSearchTooltip) this.updateTooltipPos('searchTooltip', 'searchBtn');
      if (this.isShowAlarm) this.updateAlarmPopupPos();
      if (this.isShowSearchLayer) this.updateSearchLayerPos();
      if (this.curTab === 'alarmplus') this.updateAlarmplusTipPos();
    },
    tooltipStyle(key) {
      const pos = this.overlayPositions[key] || { left: 0, top: 0 };
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const z = key === 'alarmplusTip' ? 12000 : 11000;
      const base = { position: 'fixed', top: pos.top + 'px', zIndex: z, pointerEvents: 'none' };

      if (vw <= 480) {
        // alarmplusTip: 뷰포트 전체 너비로 중앙 고정
        if (key === 'alarmplusTip') {
          return { ...base, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 16px)', maxWidth: '640px' };
        }
        // 아이콘 툴팁: 해당 버튼 중심 기준 정렬, 가장자리 클램핑
        const half = 40;
        const leftPx = Math.max(half + 8, Math.min(Number(pos.left) || vw / 2, vw - half - 8));
        return { ...base, left: leftPx + 'px', transform: 'translateX(-50%)' };
      }

      return { ...base, left: pos.left + 'px', ...(pos.transform ? { transform: pos.transform } : {}) };
    },
    popupStyle(key) {
      const pos = this.overlayPositions[key] || { left: 0, top: 0 };
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const base = { position: 'fixed', top: pos.top + 'px', zIndex: 9999 };
      const sideGap = 8;

      // alarmPopup(maxW 428) / searchPopup(maxW 640): <=660에서 중앙 정렬, 초과 시 클램핑
      const maxWidths = { alarmPopup: 428, searchPopup: 640 };
      if (key in maxWidths) {
        if (vw <= 660) {
          // searchPopup: 좌우 여백을 동일하게 유지하려면 left/right 지정
          if (key === 'searchPopup') {
            return { ...base, left: sideGap + 'px', right: sideGap + 'px' };
          }
          const popupW = Math.min(maxWidths[key], vw - sideGap * 2);
          return { ...base, left: Math.round((vw - popupW) / 2) + 'px', width: popupW + 'px' };
        }
        const leftVal = Math.max(sideGap, Math.min(Number(pos.left) || 0, vw - sideGap));
        return { ...base, left: leftVal + 'px' };
      }

      // 그 외: 클램핑만 적용
      const leftVal = Math.max(sideGap, Math.min(Number(pos.left) || 0, vw - sideGap));
      return { ...base, left: leftVal + 'px' };
    }
  },
};
</script>

<style lang="scss" scoped>
  .tip-content {
    position: relative;
    display: inline-block;
    min-width: 254px;
    max-width: 254px;
    background-color: rgba(71, 120, 222, 0.9);
    color: #fff;
    padding: 8px 10px;
    border-radius: 5px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    animation: hideTooltip 0.5s ease-out 1 forwards;
    animation-delay: 10s;
    span {
      font-size: 14px;
      vertical-align: middle;
      span {
        display: block;
        font-size: 12px;
        line-height: 1.4;
      }
    }
    &::before {
      content: '';
      position: absolute;
      top: -6px;
      left: 58px;
      transform: translateX(-50%);
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 0;
      border-bottom: 6px solid rgba(71, 120, 222, 0.9);
    }
    @media (max-width: 768px) {
      display: none;
    }
  }
  .fade-leave-active {
    transition: opacity 0.1s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
  #header-content-wrap {
    z-index: 12;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    // transition: top 0.3s ease-in-out;
    // -webkit-transition: top 0.3s ease-in-out;  
    &.variant-default {    
      border-bottom: 1px solid #eee;
      box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.06);
      background: #fff;
      .header-content-inner {
        height: 65px;
        background: #fff;
      }
      @media (max-width: 1060px) and (min-width: 768px) {
        .header-content-inner {
          .header-gnb-wrap {
            gap: 20px;
          }
        }
      }
      @media (max-width: 1200px) {
        .header-content-inner {
          .header-gnb-wrap {
            gap: 20px;
          }
        }
      }
    }
    &.variant-alarmplus {
      box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.06);
      background: #1D304B;
      .header-content-inner {
        height: 65px;
        background: #1D304B;
        .header-gnb-wrap {
          a {
            font-size: 17px;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.70);
            &.on {
              color: #6998F9;
              font-weight: 600;
            }
            &:hover {
              color: #6998F9;
              font-weight: 600;
            }
          }
        }
        .header-right-area {
          .header-right-wrap {
            .header-badge-wrap {
              .badge-item {
                &.on {
                  > button {
                    &.badge-alarm {
                      background: transparent;
                    }
                  }
                }
              }
            }
            .badge-item {            
              &.on {
                background: rgba(71, 120, 222, 0.30);
              }
              @media (hover: hover) {
                &:hover {
                  background: rgba(71, 120, 222, 0.30);
                }
              }
              .badge-talk,
              .badge-board,
              .badge-alarm,
              .badge-search {
                transition: background 0.18s ease-in-out;
                &.on {
                  background: transparent;
                }
                @media (hover: hover) {
                  &:hover {
                    background: transparent;
                  }
                }
              }
              .hi-tooltip-wrap {
                &.tooltip-bottom {
                  ::v-deep .hi-tooltip {                  
                    background-color: #fff;
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.20);
                    span {
                      color: #1A2A41;
                    }
                    &::before {
                      border-bottom-color: #fff;
                    }
                  }
                }
              }
            }
            .header-search-wrap {
              .badge-item {
                &.active {
                  background: rgba(71, 120, 222, 0.30);
                }
              }
            }
          }
        }    
      }
    }
    // .header-top-cont-inner {
    //   height: 34px;
    //   background-color: #fff;
    //   .mypage-wrap {
    //     text-align: right;        
    //     min-width: 768px;
    //     max-width: 1240px;
    //     width: auto;
    //     padding: 0 20px;
    //     margin: 0 auto;
    //     box-sizing: border-box;
    //     ul {
    //       font-size: 0;
    //     }
    //     li {
    //       display: inline-block;
    //       vertical-align: middle;
    //       a {
    //         display: inline-block;
    //         font-size: 12px;
    //       }
    //       &:not(.user-name) {
    //         margin-left: 9px;
    //         padding-left: 9px;
    //         border-left: 1px solid #ddd;
    //         a {
    //           color: #888;
    //           font-weight: 400;
    //           &:hover {
    //             text-decoration: underline;
    //           }
    //         }
    //       }
    //       &.user-name {
    //         margin: 9px 0;
    //         a {
    //           display: flex;
    //           align-items: center;
    //           color: #222;
    //           font-weight: 500;
    //           cursor: default;
    //           span:not(.photo) {
    //             padding-left: 4px;
    //           }
    //         }
    //         .photo {
    //           display: inline-block;
    //           width: 22px;
    //           height: 22px;
    //           background-size: cover;
    //           background-position: center center;
    //           background-repeat: no-repeat;
    //           border: 1px solid #ddd;
    //           border-radius: 50%;
    //           margin-right: 4px;
    //           position: relative;
    //           overflow: hidden;
    //           img {
    //             position: absolute;
    //             left: 50%;
    //             top: 50%;
    //             width: auto;
    //             min-width: 100%;
    //             height: 100%;
    //             transform: translate(-50%, -50%);
    //             object-fit: cover;
    //             image-rendering: auto;
    //             border-radius: 50%;
    //             z-index: 1;
    //           }
    //         }
    //       }
    //     }
    //   }
    // }  
    .header-content-inner {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 70px;
      padding: 0 35px 0 40px;
      background-color: #fff;
      gap: 10px;

      .header-gnb-wrap {
        position: relative;
        display: flex;
        padding-top: 8px;
        align-items: center;
        gap: 42px;
        #alarmplusTab {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        a {
          position: relative;
          font-family: var(--font-body);
          font-size: 18px;
          color: #000;
          line-height: 1;
          font-weight: 500;
          letter-spacing: -0.5px;
          transition: color 0.18s cubic-bezier(0.4,0,0.2,1), font-weight 0.18s cubic-bezier(0.4,0,0.2,1);
          &.on {
            color: var(--primary);
            font-weight: 700;
          }
          &:hover {
            font-weight: 700;
            color: var(--primary);
          }
          &.beta::after {
            content: 'Beta';
            position: absolute;
            top: -15px;
            right: -17px;
            height: 12px;
            background-color: #999;
            color: #fff;
            font-size: 10px;
            line-height: 12px;
            padding: 0 5px;
            border-radius: 12px;
          }
          &.event::after,
          &.new::after {
            content: 'EVENT';
            position: absolute;
            top: -17px;
            right: -17px;
            height: 12px;
            background-color: #ff6a6a;
            color: #fff;
            font-size: 11px;
            line-height: 12px;
            padding: 2px 5px 1px;
            border-radius: 12px;
          }
          &.new-dot::after {
            content: '';
            position: absolute;
            top: -1px;
            right: -7px;
            width: 4px;
            height: 4px;
            background-color: #ff6a6a;
            border-radius: 50%;
          }
          &.hand::before {
            content: '';
            position: absolute;
            left: 50%;
            margin-left: -18px;
            bottom: -36px;
            width: 30px;
            height: 37px;
            // background: url("../img/finger.svg") no-repeat;
            background-size: cover;
            animation: hand 12s 1 forwards;
          }
          &.behavior {
            .behavior__new-info {
              position: absolute;
              top: 50%;
              right: -64px;
              transform: translateY(-50%);
              display: inline-flex;
              height: 20px;
              background: #ff8737;
              padding: 0 3px;
              line-height: 20px;
              border-radius: 3px;
              animation: topBehaviorNewOpenClear 0.1s ease-in 10s forwards;
              &:after {
                content: '';
                position: absolute;
                top: 50%;
                left: 0;
                border: 4px solid transparent;
                border-right-color: #ff8737;
                border-left: 0;
                margin-left: -4px;
                transform: translateY(-50%);
              }
              em {
                font-family: 'NanumSquareRound';
                font-size: 10px;
                font-weight: 700;
                color: #fff;
                line-height: 20px;
                opacity: 1;
                animation: topBehaviorNewOpen 1s ease-in-out infinite;
              }
            }
          }
        }
      }
      .header-left-area {
        display: flex;
        align-items: center;
        gap: 60px;
      }
      .header-right-area {
        display: flex;
        align-items: center;
        gap: 40px;
        .header-right-wrap {
          position: relative;
          display: flex;
          align-items: center;
          gap: 20px;
          .badge-item {
            position: relative;
            .badge-count {
              position: absolute;
              top: -4px;
              right: -5px;
              min-width: 16px;
              height: 16px;
              padding: 0 5px;
              background-color: #ff5c5c;
              border-radius: 8px;
              // box-shadow: 0 0 0 1px #fff;
              .count {
                display: inline-block;
                color: #fff;
                font-family: var(--font-body);
                font-size: 11px;
                font-weight: 500;
                line-height: 14px;
                text-align: center;
              }
            }
            .hi-ico {
              padding: 4px;
            }
            &.on {
              border-radius: 12px;
              background: #ebeef4;
            }
            @media (hover: hover) {
              &:hover {
                border-radius: 12px;
                background: #ebeef4;
              }
            }
            .hi-tooltip-wrap {
              display: contents;
              ::v-deep .hi-tooltip {
                border-radius: 20px;
                span {
                  font-size: 14px;
                  font-weight: 500;
                  line-height: 160%;
                }
              }
              &.tooltip-bottom {
                ::v-deep .hi-tooltip {
                  background-color: #323742;
                  left: 50%;
                  padding: 4px 15px;
                  opacity: 0;
                  top: 0;
                  transform: translate(-50%, 0);
                  -webkit-transform: translate(-50%, 0);
                  animation: tooltipSlideDown 0.3s ease forwards;
                  &::before {
                    border-bottom-color: #323742;
                  }
                }
              }
            }
            .badge-talk,
            .badge-board,
            .badge-alarm,
            .badge-search {
              width: 36px;
              height: 36px;
              padding: 0;
              border: none;
              background: none;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;

              img {
                width: 24px;
                height: 24px;
                vertical-align: middle;
                display: inline-block;
              }

              &.on {
                border-radius: 12px;
                background: #ebeef4;
              }
              @media (hover: hover) {
                &:hover {
                  border-radius: 12px;
                  background: #ebeef4;
                }
              }
            }
          }
          .header-search-wrap {
            position: relative;
            float: left;
            width: auto;
            .badge-item {
              &.active {
                display: flex;
                width: 36px;
                height: 36px;
                border-radius: 12px;
                background: #ebeef4;
              }
            }
            // .badge-search {
            //   width: 24px;
            //   height: 24px;
            //   background: url("../../assets/img/icon/icons_header.png") -80px 0 / 240px auto no-repeat;
            //   vertical-align: middle;
            // }
          }
          .header-badge-wrap {
            float: left;
            font-size: 0;
            .badge-item {
              > button.badge-alarm {
                position: relative;
                width: 36px;
                height: 36px;
                // background: url("../../assets/img/icon/icons_header.png") 0 0 / 250px auto no-repeat;
              }
              &.on > button.badge-alarm {
                border-radius: 12px;
                background: #ebeef4;
                // background: url("../../assets/img/icon/icons_header.png") -40px 0 / 250px auto no-repeat;
              }
              // &.new-dot > button.badge-alarm::after {
              //   content: "";
              //   position: absolute;
              //   top: 0;
              //   right: 0;
              //   width: 4px;
              //   height: 4px;
              //   background-color: #ff6a6a;
              //   border-radius: 50%;
              // }
            }
          }
        }
      }
      .header-loading-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: #ecf3ff;
        overflow: hidden;
        .loading-progress {
          height: 100%;
          background: #3867c6;
        }
      }
    }
    @media (max-width: 1340px) {
      .header-content-inner {
        padding: 0 20px;        
      }
    }
    @media (max-width: 1200px) {
      .header-content-inner {
        padding: 0 20px;
        .header-left-area {
          gap: 40px;
        }        
        .header-gnb-wrap {
          gap: 22px;
        }
        .header-right-area {
          gap: 20px;
        }
      }
    }
    @media (max-width: 1060px) and (min-width: 768px) {
      .header-content-inner {
        padding: 0 20px;
        .header-left-area {
          gap: 40px;
        }        
        .header-gnb-wrap {
          gap: 22px;
        }
        .header-right-area {
          gap: 20px;
        }
      }
    }
  }
  @media (max-width: 768px) {
    #header-content-wrap {  
      .header-content-inner {
        overflow-x: auto;
        user-select: none;
        touch-action: pan-x;
        gap: 40px;
        &::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        &::-webkit-scrollbar-thumb {
          background: #8b8b8b;
          border-radius: 4px;
        }
        &::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 6px;
        }
        /* 상하 화살표 버튼 숨기기 */
        &::-webkit-scrollbar-button {
          display: none;
          height: 0;
          width: 0;
        }
        .header-right-area {
          .header-right-wrap {
            .badge-item {
              .hi-ico {
                min-width: 22px;
                min-height: 22px;
                width: 22px;
                height: 22px;
              }
            }
          }
        }
      }
    }
  }
  // Animation keyframes
  @keyframes snow {
    0% {
      background-position: 0 0, 0 0, 0 0;
    }
    100% {
      background-position: 500px 1000px, 400px 400px, 300px 300px;
    }
  }
  @keyframes hand {
    2%,
    17%,
    32%,
    47%,
    62%,
    77% {
      transform: translateY(-2px);
    }
    6%,
    21%,
    36%,
    51%,
    66%,
    81% {
      transform: translateY(-6px) matrix(1, 0, 0, 0.8, 0, 0);
    }
    10%,
    15%,
    25%,
    30%,
    40%,
    45%,
    55%,
    60%,
    70%,
    75%,
    85%,
    90% {
      transform: translateY(0) matrix(1, 0, 0, 1, 0, 0);
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  @keyframes topBehaviorNewOpenClear {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  @keyframes topBehaviorNewOpen {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0.4;
    }
  }
  @keyframes hideTooltip {
    0% {
      opacity: 1;
      visibility: visible;
    }
    100% {
      opacity: 0;
      visibility: hidden;
    }
  }
  .alarm-popup-wrap {
    // display: none;
    z-index: 1;
    position: relative;
    // top: 41px;
    right: -44px;
    width: 428px;
    font-size: 13px;
    opacity: 0;
    transform: translateY(-10px);
    -webkit-transform: translateY(-10px);
    animation: alarmSlideDown 0.3s ease forwards;
    ::v-deep .alarm-popup-box {
      border-radius: 12px;
      border: 1px solid #ccd0d7;
      background: #fff;
      box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 0.08), 0px 0px 30px 0px rgba(0, 0, 0, 0.08);
      box-sizing: border-box;
      &::after,
      &::before {
        display: none;
      }
    }
  }

  /* 부모 오버레이에 `.center-alarm-popup`가 있으면 내부 오프셋을 덮어씁니다 */
  .center-alarm-popup {
    ::v-deep .alarm-popup-wrap {
      right: auto !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      margin: 0 !important;
      width: calc(100% - 16px) !important;
      max-width: 428px !important;
      box-sizing: border-box !important;
    }
    
  }
  // 알리미(variant-alarmplus)에서 전역 툴팁은 흰색 배경 사용
  .tooltip-overlay.alarmplus-theme {
    .hi-tooltip-wrap {
      &.tooltip-bottom {
        ::v-deep .hi-tooltip {
          background-color: #fff;
          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.20);
          span {
            color: #1A2A41;
          }
          &::before {
            border-bottom-color: #fff;
          }
        }
      }
    }
  }
  .renew-header-content-wrap {  
    &.on .alarm-popup-wrap {
      display: block;
    }
  }
  /* 헤더 스크롤 클리핑을 피하기 위한 전역 오버레이 컨테이너 */
  .header-global-overlay {
    &.tooltip-overlay {
      ::v-deep .hi-tooltip {
        border-radius: 20px;
        background-color: #323742;
        padding: 4px 15px;
        opacity: 0;
        top: 3px;
        left: 50%;
        transform: translate(-50%, -10px);
        animation: tooltipSlideDown 0.3s ease forwards;
      }
    }
    ::v-deep .hi-tooltip {
      span {
        font-size: 14px;
        font-weight: 500;
        line-height: 160%;
      }    
    }
    &.alarm-overlay {
      animation: alarmSlideDown 0.3s ease forwards;
    }
    &.search-overlay {
      .header-search-layer {
        position: absolute;
        top: 0;
        left: 50%;
        border-radius: 12px;
        z-index: 100;
        width: fit-content;
        background: white;
        border: 1px solid #ccd0d7;
        background: #fff;
        box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 0.08), 0px 0px 30px 0px rgba(0, 0, 0, 0.08);
        padding: 25px;
        box-sizing: border-box;
        opacity: 0;
        animation: tooltipSlideDown 0.3s ease forwards;
        &.show {          
          .search-title {
            color: #1d1d1d;
            font-family: var(--font-body);
            font-size: 16px;
            font-weight: 700;
            line-height: 24px;
          }
          @media (max-width: 480px) {
            width: 100%;
            min-width: 350px;
          }
        }
        // &.calendar-open {
        //   padding-bottom: 348px;
        // }
      }
    }
  }
  .ios {
    #header-content-wrap {
      .header-content-inner {
        padding: 0 14px 0 20px;
        width: 100vw;
        .header-gnb-wrap {
          gap: 20px;
        }
        .header-right-area {
          gap: 20px;
          .header-right-wrap {
            gap: 10px;
            .badge-item {
              .badge-count {
                .count {
                  position: relative;
                  top: 0;
                  font-weight: bold;
                }
              }
            }
          }
        }
        .header-left-area {
          gap: 40px;
        }
      }
    }
  }

  .new-dot > button.badge-alarm::after {
    content: '';
    position: absolute;
    top: 3px;
    right: 3px;
    width: 5px;
    height: 5px;
    background-color: #ff6a6a;
    border-radius: 50%;
  }

  /* 시간표 배너 컨테이너 */
  .new-banner-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    overflow: visible;
  }

  /* 강렬하게 펼쳐지는 배너 */
  .powerful-banner {
    display: inline-flex;
    background: url(../../assets/img/timetable/banner-new-timetable.svg) no-repeat;
    background-size: 88px;
    width: 88px;
    height: 28px;
    animation: powerfulUnfold 7s ease-in-out 2;
    animation-fill-mode: forwards;
    position: relative;
    overflow: hidden;
    border-radius: 16px;
  }

  /* 강렬한 펼침 애니메이션 */
  @keyframes powerfulUnfold {
    0% {
      opacity: 0;
    }
    7.5%,
    100% {
      opacity: 1;
    }
  }
  /* 강렬한 빛 효과 */
  .powerful-banner::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.7) 50%, transparent 100%);
    animation: powerfulShine 7s ease-in-out 2;
    animation-fill-mode: forwards;
    border-radius: 16px;
    z-index: 1;
  }

  @keyframes powerfulShine {
    0%,
    100% {
      transform: translateX(-120%);
      opacity: 0;
    }
    12.5%,
    15% {
      transform: translateX(-120%);
      opacity: 0;
    }
    17.5% {
      opacity: 1;
    }
    25% {
      transform: translateX(250%);
      opacity: 0.8;
    }
    35% {
      transform: translateX(250%);
      opacity: 0;
    }
    50%,
    100% {
      transform: translateX(250%);
      opacity: 0;
    }
  }

  /* 폭발 효과 입자 */
  .new-banner-container::after {
    content: '✨';
    position: absolute;
    font-size: 15.6px;
    animation: particleExplode 9.33s ease-out 2;
    animation-fill-mode: forwards;
    pointer-events: none;
  }

  @keyframes particleExplode {
    0%,
    100% {
      opacity: 0;
      transform: translate(0, 0) scale(0);
    }
    7.5% {
      opacity: 1;
      transform: translate(30px, -15px) scale(1.5) rotate(180deg);
    }
    12.5%,
    100% {
      opacity: 0;
      transform: translate(60px, -30px) scale(0) rotate(360deg);
    }
  }

  @keyframes tooltipSlideDown {
    0% {
      opacity: 0;
      transform: translate(-50%, -10px);
      -webkit-transform: translate(-50%, -10px);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, 0);
      -webkit-transform: translate(-50%, 0);
    }
  }

  @keyframes alarmSlideDown {
    0% {
      opacity: 0;
      transform: translateY(-10px);
      -webkit-transform: translateY(-10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
      -webkit-transform: translateY(0);
    }
  }
  .android-hide-scrollbars {
    .header-content-inner {
      scrollbar-width: none;
    }
  }
</style>