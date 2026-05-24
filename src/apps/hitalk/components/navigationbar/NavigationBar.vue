<template>
  <div class="tab-nav-wrap">
    <!-- <div class="electron-draggable-area top"></div> -->
    <button
        class="icon c-opponent"
        title="대화상대"
        :class="{'on' : isMemberActive}"
        @click="setTab('Member')"
    >
      <span>대화 상대</span>
    </button>
    <button
        class="icon c-list"
        title="대화목록"
        :class="{'on' : isRoomActive}"
        @click="setTab('Room')"
    >
      <span>대화 목록</span>
      <span class="list-count" v-show="isShowCountBadge">{{ totalUnReadMessageCount }}</span>
    </button>
    <button
        class="icon c-reservation"
        title="예약발송 목록"
        :class="{'on' : isReservationActive}"
        @click="setTab('Reservation')"
    >
      <span>예약 메시지 목록</span>
      <span class="list-count" v-if="reservation.count > 0">{{ reservation.count }}</span>
    </button>
    <button
        class="icon c-vote"
        title="투표 관리"
        :class="{'on' : isVoteActive}"
        @click="setTab('Vote')"
    >
      <span>투표 관리</span>
    </button>
    <button v-if="isTeacher && isUnderElectron" class="icon time-setting" @click="openTimeSetting"><span>상담 가능 시간 설정</span></button>
    <!-- <div class="electron-draggable-area mid"></div> -->
  </div>
</template>

<script>
import {TabStatus} from "/src/enums";
import {mapActions, mapMutations, mapState} from "vuex";
import {ElectronHandlable} from "@/apps/hitalk/mixins";
import {getBrowserVersion} from "@/plugins/firebase";
import needBrowserUpdate from "@/mixins/needBrowserUpdate";

export default {
  name: 'NavigationBar',
  mixins: [ElectronHandlable, needBrowserUpdate],
  computed: {
    ...mapState(['user']),
    ...mapState('storeHitalk', [
      'loginUser',
      'selectedTab',
      'totalUnReadMessageCount',
      'isShowCountBadge',
      'reservation',
      'isShowRoomSettingLayout',
      'connectRoomItem'
    ]),
    isMemberActive: function () {
      return this.selectedTab === TabStatus.MEMBER;
    },
    isRoomActive: function () {
      return this.selectedTab === TabStatus.ROOM;
    },
    isReservationActive: function () {
      return this.selectedTab === TabStatus.RESERVATION;
    },
    isVoteActive: function () {
      return this.selectedTab === TabStatus.VOTE;
    },
    isTeacher(){
      if(!this.loginUser) return false;
      return this.loginUser.userType === 'TEACHER';
    }
  },
  methods: {
    ...mapMutations('storeHitalk',[
      'setTabMember',
      'setTabRoom',
      'setTabReservation',
      'setTabVote',
      'setReservationCount',
      'hideRoomSettingLayout',
      'clearChatMessageList',
      'hideChatLayout',
      'toggleTimeSetting'
    ]),
    ...mapActions('storeHitalk',[
      'callChatUserMessageCount',
      'getReservationCount',
      'disconnectChatRoom'
    ]),
    /**
     * 탭 이동
     */
    setTab(tabType) {
      // 탭 이동시 대화방 설정 열려있으면
      if (this.isShowRoomSettingLayout) {
        this.hideRoomSettingLayout()
      }
      ({
        Member: () => this.setTabMember(),
        Room: () => this.setTabRoom(),
        Reservation: () => {
          this.$emit('closeShareReportHistoryDetail');
          if (this.connectRoomItem) {
            this.disconnectChatRoom();
            this.clearChatMessageList();
            this.hideChatLayout();
          }
          this.setTabReservation();
        },
        Vote: async () => {
          this.$emit('closeShareReportHistoryDetail');
          this.browserCheckAndUpdateAlert(81)
          this.setTabVote()
        }
      }[tabType]?.())
    },
    openTimeSetting() {
      this.toggleTimeSetting();
    }
  },
  created() {
    this.getReservationCount({
      userId: localStorage.getItem('uuid'), // 유저정보 불러오기전 호출됐을때 userId가 없는 경우가 있어서 로컬스토리지에 저장된 값 사용
    })
        .then(res => {
          this.setReservationCount(res.data.count)
        })
  }
}
</script>

<style>
/* 세팅 버튼 electron-exclusive.scss로 이동
 .left-wrap .tab-nav-wrap button.icon.time-setting::before {
  width: 29px;
  height: 29px;
  background: url(/img/icons_hitalk.2d663167.png) right -150px / 200px auto no-repeat;
  transform: scale(1.4);
} */
 
/* draggable 기능 삭제 
.left-wrap .tab-nav-wrap .electron-draggable-area {
  display: none;
  width: 100%;
  position: relative;
  height: 200px;
  top: -40px;
  -webkit-app-region: drag;
}
.left-wrap .tab-nav-wrap .electron-draggable-area.top {
  position: absolute;
  top: 0px;
  height: 40px;
}
.on-electron .left-wrap .tab-nav-wrap .electron-draggable-area {
  display: block;
} */
</style>