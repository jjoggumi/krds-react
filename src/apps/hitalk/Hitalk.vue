<!--
@File(Method):  Hitalk.vue
@Date Created: 
@Description: 하이톡 
@Modified: 2025-12-09 - 리포트 상세 공유 팝업 적용
-->
<template>
  <div>
    <confirm-layout v-if="isShowConfirmLayout" />
    <hitalk-notice-layout v-if="isShowHitalkNoticeLayout" />
    <div class="window-popup-atten type2">
      <div class="normal-modal hitalk-modal" style="display: block">
        <div class="modal-cont-wrap hitalk-cont-wrap">
          <div class="modal-cont boundary-box">
            <div class="ooo-conversation-cont-wrap boundary-box">
              <div class="ooo-conversation-cont-inner">
                <!-- 대화상대 및 채팅방 리스트 -->
                <left-layout 
                  @closeShareReportHistoryDetail="isShowShareReportHistoryDetail = false"/>
                <!-- 채팅방 채팅창 -->
                <right-layout
                  @openClassRoomReport="openClassRoomReport" />
                <!-- 채팅방 세팅 : -->
                <room-setting-layout v-if="isShowRoomSettingLayout" />
                <!-- 리포트 상세 공유 팝업 -->
                <share-report-history-detail
                  v-if="isShowShareReportHistoryDetail"
                  :reportId="selectedClassroomReport.reportId"
                  :classroomId="selectedClassroomReport.classroomId"
                  @closeShareReportHistoryDetail="isShowShareReportHistoryDetail = false"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <notice-target-layout v-if="isShowNoticeTargetLayout" />
    <notice-personal-message-layout v-if="isShowNoticePersonalMessageLayout" />
    <notice-custom-layout v-if="isShowNoticeCustomLayout" />
    <time-setting-layout v-if="isShowTimeSetting" />
    <image-view-layout v-if="isShowImageViewLayout" />
    <hitalk-pdf-viewer v-if="isShowDocumentViewLayout" />
    <video-view-layout v-if="isShowVideoViewLayout" />
    <read-members v-if="isShowReadMemberLayout" />
    <guide-layout v-if="isShowGuidePopup" />

    <batch-popup v-if="batchPopup.isOpen"></batch-popup>
    <send-target-popup v-if="targetPopup.isOpen" @closeShareReportHistoryDetail="isShowShareReportHistoryDetail = false"></send-target-popup>
    <person-group-popup v-if="personGroupPopup.isOpen"></person-group-popup>
    <confirm-dialog
      v-if="isLogout"
      :title="confirmDialog.title"
      :description="confirmDialog.description"
      :isAlert="true"
      @closeConfirmDialog="allLogout"
    />
    <hitalk-reaction-list-modal v-if="hitalkReactionListPopup.isOpen" :messageId="hitalkReactionListPopup.messageId" />
    <hitalk-vote-editor-modal
      v-if="isShowVoteEditor"
      :room="connectRoomItem.roomId"
      :vote="selectedVoteMessageId"
      @close="hideVoteEditor"
      interceptFileUpload="true"
    />
    <hitalk-onboarding-modal ref="onboardingModal" />
  </div>
</template>

<script>
/**
 * import chat css
 */
import '@/assets/css/hitalk.css';

import { mapActions, mapMutations, mapState } from 'vuex';
import RoomSettingLayout from '@/apps/hitalk/components/popup/side/RoomSettingLayout';
import ConfirmLayout from '@/apps/hitalk/components/popup/ConfirmLayout';
import HitalkNoticeLayout from '@/apps/hitalk/components/popup/HitalkNoticeLayout';
import ImageViewLayout from '@/apps/hitalk/components/popup/ImageViewLayout';
import HitalkPdfViewer from '@/apps/hitalk/components/popup/HitalkPDFViewer.vue';
import NoticeTargetLayout from '@/apps/hitalk/components/popup/notice/NoticeTargetLayout';
import NoticePersonalMessageLayout from '@/apps/hitalk/components/popup/notice/NoticePersonalMessageLayout';
import NoticeCustomLayout from '@/apps/hitalk/components/popup/notice/NoticeCustomLayout';
import VideoViewLayout from '@/apps/hitalk/components/popup/VideoViewLayout';
import ReadMembers from '@/apps/hitalk/components/popup/side/ReadMembers';
import GuideLayout from '@/apps/hitalk/components/popup/GuideLayout';
import BatchPopup from '@/apps/hitalk/components/popup/batch/BatchPopup';
import SendTargetPopup from '@/apps/hitalk/components/popup/sendTarget/SendTargetPopup';
import personGroupPopup from '@/apps/hitalk/components/popup/personGroup/personGroupPopup';
import ConfirmDialog from '@/apps/hitalk/components/popup/ConfirmDialog';
import HitalkReactionListModal from '@/apps/hitalk/components/popup/HitalkReactionListModal';
import { useElectronController } from '@/apps/hitalk/utils';
import { setupVoteEventHandlers } from '@/apps/hitalk/components/vote/voteEventHandlers';
import ShareReportHistoryDetail from './components/popup/side/ShareReportHistoryDetail.vue';
import HitalkOnboardingModal from '@/apps/hitalk/components/popup/HitalkOnboardingModal.vue';
import { 
  getClassroomReportStudents,
} from '@hiclass/core';
const electronController = useElectronController();

export default {
  name: 'Hitalk',
  props: {
    chatUserId: {
      type: String,
      default: '',
      required: false,
    },
    chatUserClassId: {
      type: String,
      default: '',
      required: false,
    },
    chatUserType: {
      type: String,
      default: '',
      required: false,
    },
    chatUserMemberRole: {
      type: String,
      default: '',
      required: false,
    },
  },
  components: {
    HitalkReactionListModal,
    ConfirmDialog,
    HitalkNoticeLayout,
    personGroupPopup,
    SendTargetPopup,
    BatchPopup,
    GuideLayout,
    ReadMembers,
    VideoViewLayout,
    NoticeCustomLayout,
    NoticePersonalMessageLayout,
    NoticeTargetLayout,
    HitalkPdfViewer,
    ImageViewLayout,
    ConfirmLayout,
    RoomSettingLayout,
    ShareReportHistoryDetail,
    HitalkOnboardingModal,
    RightLayout: () => import('@/apps/hitalk/components/common/RightLayout'),
    LeftLayout: () => import('@/apps/hitalk/components/common/LeftLayout'),
    TimeSettingLayout: () => import('@/apps/hitalk/components/popup/TimeSettingLayout'),
  },
  data: () => ({
    confirmDialog: {
      title: '로그아웃 안내',
      description:
        '비밀번호 변경 또는 로그인 만료 등으로 인해\n로그아웃되었습니다.\n보안을 위해 <span style="color: #4778DE;">다시 로그인 해주세요.</span>',
    },
    isShowVoteEditor: false,
    selectedVoteMessageId: null,
    isShowShareReportHistoryDetail: false,
    selectedClassroomReport: {
      reportId: null,
      classroomId: null,
    },
  }),
  computed: {
    ...mapState(['user']),
    ...mapState('storeHitalk', [
      'isLogout',
      'isShowReadMemberLayout',
      'isShowNoticePersonalMessageLayout',
      'isShowNoticeCustomLayout',
      'isShowNoticeTargetLayout',
      'isShowDocumentViewLayout',
      'isShowVideoViewLayout',
      'isShowImageViewLayout',
      'isShowConfirmLayout',
      'isShowTimeSetting',
      'isShowRoomSettingLayout',
      'isShowChatLayout',
      'isShowGuidePopup',
      'batchPopup',
      'personGroupPopup',
      'targetPopup',
      'isShowHitalkNoticeLayout',
      'hitalkReactionListPopup',
      'connectRoomItem',
    ]),
  },
  watch: {
    isShowChatLayout: {
      handler: function (val) {
        if (
          !localStorage.getItem('hitalkBannerTimeStamp') ||
          new Date().getTime() - parseInt(localStorage.getItem('hitalkBannerTimeStamp')) > 24 * 3600 * 1000
        ) {
          this.setShowBanner(!val);
        }
      },
    },
  },
  methods: {
    ...mapActions(['triggerAnalyticsLogEvent', 'isAllDeviceLogout']),
    ...mapMutations('storeHitalk', [
      'setShowBanner',
      'setIsLogout',
      'setHitalkNoticePopup',
      'setConnectedRoomIdOnOtherSession',
      'setFileContent',
      'showImageViewLayout',
    ]),
    ...mapActions('storeHitalk', [
      'callLoginUser',
      'callChatUserMessageCount',
      'connectStompClient',
      'disconnectStompClient',
      'callCheckExistRoom',
      'prepareFcmServiceWorker',
      'restorePushEventListener',
      'tryConnectingToDesktopApplication',
      'callUserTime',
      'callUserTimeForNotification',
      'callChatRooms',
      'callChatWebToken',
      'onReceivedFcmMessage',
    ]),
    ...mapActions('storeImageEditor', ['openImageEditorAndWait']),
    ...mapMutations('storeImageEditor', ['setIsHitalkMode']),
    allLogout: function () {
      window.close();
      window.opener.location = '/logout';
    },
    toggleTimeSetting: function () {
      this.isShowTimeSetting = !this.isShowTimeSetting;
    },
    onKeyUpAfter: function (e) {
      switch (e.keyCode) {
        // ScrLk 키 입력 시 이벤트 처리
        case 145: {
          if (e.shiftKey) {
            this.$hiClass.confirm('웹소켓 연결 오류를 테스트하시겠습니까?<br>테스트 종료 시 하이톡 창을 닫아주세요.').then(() => {
              sessionStorage.webSocketErrorTest = '.test';
              window.location.reload();
            });
          } else {
            this.$hiClass.confirm('웹소켓 연결을 해제하시겠습니까?').then(this.disconnectStompClient);
          }
          break;
        }
      }
    },
    writeLocalServerPort(port) {
      electronController.setLocalServerPort(port);
    },
    quitApplication() {
      electronController.quit();
    },
    showVoteEditor(messageId) {
      this.selectedVoteMessageId = messageId;
      this.isShowVoteEditor = true;
    },
    hideVoteEditor() {
      this.isShowVoteEditor = false;
    },
    showImageOnImageViewLayout(fileContent) {
      this.setFileContent({
        fileContentType: 'image/png',
        fileFlag: 'IMAGE_PACH',
        fileName: 'Image',
        fileConvertPath: '',
        fileOriginalPath: '',
        ...fileContent,
      });
      this.showImageViewLayout(true);
    },
    async openClassRoomReport(payload) {
      if(payload.shareType === 'CLASSROOM') {
        try {
          await getClassroomReportStudents(payload.classroomId, payload.reportId, localStorage.uuid); 
          this.selectedClassroomReport.reportId = payload.reportId;
          this.selectedClassroomReport.classroomId = payload.classroomId;
          this.isShowShareReportHistoryDetail = true;
        } catch(error) {
          const status = error?.response.status;
          const errorCode = error?.response?.data?.error;
          if(status == 428 & errorCode === 'deleteReport') {
            this.$hiClass.alert('삭제된 리포트입니다.');
          } else {
            this.$hiClass.alert('요청 처리 중 오류가 발생했습니다.');
          }
        }
      }
    },
  },
  beforeCreate() {
    if (electronController.isUnderElectron() && (!localStorage.idToken || !sessionStorage.initialized)) {
      localStorage.clear();
      document.location = '/';
    }
  },
  async created() {
    const res = await this.isAllDeviceLogout();
    this.setIsLogout(res);
    await this.callLoginUser();
    this.callChatUserMessageCount();
    this.connectStompClient();
    this.callChatRooms();
    setupVoteEventHandlers(this);
    //this.setHitalkNoticePopup(+(localStorage.hitalkReactionNoticeCount || 0) < 5) 추후 알림 팝업 추가 할때 주석 해제.
  },
  async mounted() {
    document.title = '하이톡';
    this.setIsHitalkMode(true);
    await this.$comn.asyncWaitFor(() => this.user.currentId);
    if (this.chatUserId) {
      await this.callUserTime({ userId: this.chatUserId, userType: this.chatUserType, memberRole: this.chatUserMemberRole, isSetUserTime: true });
      this.callCheckExistRoom({
        roomType: 'PERSON',
        classId: this.chatUserClassId,
        content: this.chatUserId,
      });
    } else if (this.user.userType === 'TEACHER') {
      const myUserTime = await this.callUserTimeForNotification(true);

      if (!myUserTime?.isUseSetting) {
        this.$refs.onboardingModal?.open();
      }
    }
    const agent = navigator.userAgent.toLowerCase();
    const isIE = (navigator.appName === 'Netscape' && navigator.userAgent.search('Trident') !== -1) || agent.indexOf('msie') !== -1;
    if (!isIE && !electronController.isUnderElectron()) {
      this.tryConnectingToDesktopApplication();
      await this.prepareFcmServiceWorker();
      this.restorePushEventListener();
    }
    electronController.setReady(this);
    window.addEventListener('beforeunload', (event) => {
      if (window.opener) {
        window.opener.app.$store.dispatch('storeHitalk/pausePushEventListenerAccordingToUserTime');
      }
    });
    if (electronController.isUnderElectron()) {
      this.triggerAnalyticsLogEvent({ code: `analytics.hitalk.desktop.v${electronController.getAppVersion()}` });
    }
  },
  async destroyed() {
    this.disconnectStompClient();
  },
};
</script>
<style></style>
