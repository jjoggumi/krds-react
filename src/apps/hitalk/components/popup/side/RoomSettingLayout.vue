<!--
@File(Method): RoomSettingLayout.vue
@Author: -
@Date Created: -
@Description: 하이톡 > 대화목록 > 더보기(설정)
@Modified: 2025-01-20 - #69577 쌍방향 채팅방 - 종료일 수정, 단체방 이름변경, 비활성화, 채팅중지
-->
<template>
  <div class="noti-setting-wrap" style="display: block;">
    <div class="noti-function-wrap">      
      <div class="tit-noti">
        <p>설정</p>
        <div
            class="modal-close-btn modal-close-icon"
            @click="closeRoomSetting"
        />
      </div>
      <div class="funtion-list" v-show="isPermitSaveMessage">
        <div class="tit-noti-save" @click="isPasswordConfirmModalOpen=true">
          <p>대화 저장하기</p>
        </div>
        <div v-if='isMasterInCurrentRoom && isLimitedGroupChat && !isConnectRoomExpired' class="tit-period-edit" @click="periodEdit=true">
          <p>종료일 수정</p>
        </div>
        <div v-if='isMasterInCurrentRoom && isGroupChat && !isConnectRoomExpired' class="tit-name-edit" @click="showRoomnameModal">
          <p>단체방 이름 변경</p>
        </div>
      </div>
      <div class="tit-noti-mem" v-show="isShowMember">
        <p>구성원 목록</p>
        <div class="btn-wrap" v-show="isPermitManager">
          <HiButton color="primary" size="sm" rounded v-if="!isShowEjectionView" @click="showEjectionView" :disabled="isConnectRoomExpired">채팅방 내보내기</HiButton>
          <HiButton color="primary" size="sm" v-show="isShowEjectionView" @click="showLayerPopupConfirm('ejection')">확인</HiButton>
        </div>
      </div>
      <div class="all-noti-mem-thum-wrap slide-pop" v-show="isShowMember">
        <div class="scrollbar-outer" style="position: relative;">
          <ul>
            <li v-show="isPermitManager && !isShowEjectionView" >
              <button type="button" class="btn-add-mem" :disabled="isConnectRoomExpired" @click="addNoticeUser">구성원 추가</button>
            </li>
            <room-setting-user-list-item
                v-for="userItem in connectRoomMembers"
                :key="userItem.userId+'-roomSettingUserListItem'"
                :user="userItem"
            />
          </ul>
        </div>
      </div>      
    </div>
    <div class="funtion-list" v-show="isShowLeaveRoom">
      <p class="ico-out" @click="showLayerPopupConfirm('leave')">채팅방 {{isMasterInCurrentRoom ? '종료하기' : '나가기'}}</p>
    </div>
     <!-- #69577 쌍방향 채팅방 - 단체방 이름 변경 모달-->     
    <HiModal type="type01" size="sm" @close="chatNameEdit=false" v-if="chatNameEdit">
      <template v-slot:heading>
        <h2 class="heading">
          단체방 이름 변경
          <p class="desc">단체방 이름을 입력해주세요.</p>
        </h2>
      </template>
      <template v-slot:content> 
        <div class="input-box-wrap">
          <input type="text" v-model="chatName" ref='chatNameInput' @keyup='onKeyupChatNameInput' placeholder="단체방 이름 입력" maxlength="30">
        </div>
      </template>
      <template v-slot:footer>
        <HiButton color="gray" size="lg" @click='chatNameEdit=false'>취소</HiButton>
          <HiButton color="primary" size="lg" :disabled="chatName.trim() === ''" @click='onClickSaveRoomName'>저장</HiButton>           
      </template>
    </HiModal>
     <!-- #69577 쌍방향 채팅방 - 종료일 수정 모달-->     
    <HiModal type="type01" size="sm" @close="periodEdit=false" v-if="periodEdit">
      <template v-slot:heading>
        <h2 class="heading">
          종료일 수정
          <p class="desc">설정된 날짜가 지나면 개설자 선생님을 제외한<br>
            나머지 구성원은 자동으로 내보내기 됩니다.</p>
        </h2>
      </template>
      <template v-slot:content>
        <calendar-popup
          ref='limitPicker'
          :defaultSelectedDate="limitedDate"
          :notForReservation="true"
          :minutePadding="0"
          :defaultPaddingMinutes="60"
          :maxDateTimestamp="(connectRoomItem.insertedTimestamp || currentRoomMaster.joinTimestamp) + 1000 * 60 * 60 * 24 * 90"
        />
      </template>
      <template v-slot:footer>
        <HiButton color="gray" size="lg" @click='periodEdit=false'>취소</HiButton>
        <HiButton color="primary" size="lg" @click='onClickSaveLimitTimestamp' >저장</HiButton>           
      </template>
    </HiModal>
    <!-- #84959 문자 주소록 명단 다운로드 시, 암호화 파일 생성 요청 모달 -->
    <HiModal type="type01" :modalLayerStyle="{ width: '480px' }" size="md" @close="isPasswordConfirmModalOpen=false" v-if="isPasswordConfirmModalOpen">
      <template v-slot:heading>
        <h2 class="heading">
          파일 비밀번호 확인
          <p class="desc">비밀번호는 타인에게 공유하지 마시고,<br>업무 목적 달성 후 즉시 파기하여 주시기 바랍니다.</p>
        </h2>
      </template>
      <template v-slot:content>
        <div class="password-input-wrap">
          <div class="password-text">{{ password }}</div>
          <HiButton color="primary" size="xs" outline @click="onCopyPassword" class="copy-btn">복사</HiButton>
        </div>
      </template>
      <template v-slot:footer>
        <HiButton color="gray" size="lg" @click='isPasswordConfirmModalOpen=false'>취소</HiButton>
        <HiButton color="primary" size="lg" @click='onConfirmPassword'>확인</HiButton>           
      </template>
    </HiModal>
  </div>
</template>

<script>
import {mapMutations, mapActions, mapState, mapGetters} from "vuex";
import RoomSettingUserListItem from "@/apps/hitalk/components/popup/side/RoomSettingUserListItem";
import CalendarPopup from "@/components/CalendarPopup/Calendar";
import {ymdhm, buildLimitTimestampFromDateJson} from '@/apps/hitalk/utils'

export default {
  components: {
    RoomSettingUserListItem,
    CalendarPopup
  },
  data: () => ({
    chatNameEdit: false,  // 단체방 이름수정
    chatName: '',
    periodEdit: false,  // 종료일 수정
    isPasswordConfirmModalOpen: false,  // #84959 파일 비밀번호 확인 모달
    password: '',
  }),
  watch: {
    isPasswordConfirmModalOpen(val) {
      if (val) {
        this.password = crypto.randomUUID().replaceAll('-', '');
      }
    }
  },
  computed: {
    ...mapState('storeHitalk',[
      "loginUser",
      "connectRoomItem",
      'connectRoomMembers',
      "isShowRoomSettingLayout",
      "classJSONList",
      "noticeTargetUserJSONList",
      "noticeTargetUserArrayList",
      "noticeCategory",
      "isShowEjectionView",
      "currentClassItem",
      "selectedUserIdString"
    ]),
    ...mapGetters('storeHitalk',[
      "isMasterInCurrentRoom", 'isConnectRoomExpired'
    ]),
    isShowMember: function () {
      return this.connectRoomItem.roomType === 'GROUP';
    },
    isPermitManager: function () {
      if(!this.roomMembers[localStorage.uuid]) return false;
      return this.connectRoomItem.roomType === 'GROUP'
          && (this.roomMembers[localStorage.uuid].role === "MANAGER"
              || this.roomMembers[localStorage.uuid].role === "OWNER");

    },
    isPermitSaveMessage: function () {
      if(!this.roomMembers[localStorage.uuid]) return false;
      return (this.roomMembers[localStorage.uuid].role === "MANAGER"
              || this.roomMembers[localStorage.uuid].role === "OWNER");

    },
    isShowLeaveRoom: function () {
      if (this.connectRoomItem.roomType === "GROUP") {
        // 현재 user의 클래스 memberRole
        const currentUserRole = this.connectRoomMembers.find(roomMember => {
          return roomMember.userId === this.loginUser.currentId
        }).role

        // 일반 멤버면 미노출
        if (currentUserRole === 'MEMBER') {
          return false
        }
      }
      return true
    },
    roomMembers: function () {
      let roomMemberJsonList = {};
      for (let roomMember of this.connectRoomMembers) {
        this.$set(roomMemberJsonList, roomMember.userId, roomMember);
      }
      return roomMemberJsonList;
    },
    selectedUserIdString: function () {
      return this.noticeTargetUserArrayList.map(n => n.userId).join(',')
    },
    selectedUserNameString: function () {
      return this.noticeTargetUserArrayList.map(n => n.name).join(',')
    },
    isGroupChat: function () {
      return this.connectRoomItem.roomType === 'GROUP';
    },
    isLimitedGroupChat: function () {
      return this.connectRoomItem.roomType === 'GROUP' && this.connectRoomItem.groupType === 'LIMIT';
    },
    limitedDate: function () {
      return this.isLimitedGroupChat ? (d => ({
        year: d.getFullYear(),
        month: d.getMonth(),
        day: d.getDate(),
        hour: d.getHours(),
        minute: d.getMinutes()
      }))(new Date(this.connectRoomItem.limitTimestamp)) : {};
    },
    maximumMemberCount() {
      return this.isLimitedGroupChat ? 51 : Number.MAX_SAFE_INTEGER;
    }
  },
  methods: {
    ...mapMutations(['setIsDimLoading']),
    ...mapMutations("storeHitalk",[
      'showConfirmLayout',
      'hideConfirmLayout',
      'showEjectionView',
      'hideEjectionView',
      'showRoomSettingLayout',
      'hideRoomSettingLayout',
      'showNoticeCustomLayout',
      'hideNoticeCustomLayout',
      'setUserNameString',
      'setCurrentClassItem',
      'setNoticeCategory',
      'setShowConfirmLayout',
      'setSelectedUserIdString',
      'clearNoticeTargetUserList'
    ]),
    ...mapActions("storeHitalk",[
      "callChatMessageDownloadSecure",
      'patchLimitTimestamp',
      'patchRoomName'
    ]),
    showLayerPopupConfirm: function (confirmCategory) {
      switch (confirmCategory) {
        case "leave" :{
          this.closeRoomSetting();
          const me = this.connectRoomMembers.find(m => m.userId === localStorage.uuid)
          const confirmCategoryMsg = 
          me && me.isMaster &&
          this.connectRoomItem.roomType === "GROUP" ? "leaveGroupRoom" : "leaveRoom"
          this.setShowConfirmLayout({
            isShowConfirmLayout: true,
            confirmCategory: confirmCategoryMsg
          });
          break;
        }
        case "ejection" :{
          if(!this.selectedUserIdString){
            this.hideEjectionView();
            return;
          }
          this.setSelectedUserIdString(this.selectedUserIdString);
          this.setUserNameString(this.selectedUserNameString);
          this.hideEjectionView();
          this.hideRoomSettingLayout();
          this.setShowConfirmLayout({
            isShowConfirmLayout: true,
            confirmCategory: "ejection"
          });
          break;
        }
      }
      setTimeout(() => {
        this.pageScrollBottom();
      }, 700)
    },
    pageScrollBottom : function () {
      let chatListWrap = document.getElementsByClassName('chatting-list-wrap')[0];
      let chatArea = {
        scrollToBottom: function() {
          try {
            let messageArea = chatListWrap.getElementsByClassName('scroll-scrolly_visible')[0];
            // 신규대화방일때 스크롤영역이 생성되지않아서 messageArea undefined 에러 발생
            if (messageArea) {
              messageArea.scrollTop = messageArea.scrollHeight;
            }
          } catch (e) { Vue.$log.error(e) }
        },
      }

      setTimeout(function () {
        chatArea.scrollToBottom();
      }, 500);
    },
    addNoticeUser: function () {
      if (this.connectRoomMembers.length >= this.maximumMemberCount) {
        this.$hiClass.alert(`단체 채팅방 구성원은 최대 ${this.maximumMemberCount - 1}명까지만 가능합니다.`);
        return;
      }
      this.setCurrentClassItem(this.classJSONList[this.connectRoomItem.classId]);
      if(this.currentClassItem.users.length === this.connectRoomMembers.length-1){
        this.$hiClass.alert("추가할 대상이 없습니다.");
        return;
      }
      this.setNoticeCategory("invite");
      this.showNoticeCustomLayout();
      this.hideRoomSettingLayout();
    },
    closeRoomSetting: function () {
      this.clearNoticeTargetUserList();
      this.hideEjectionView();
      this.hideRoomSettingLayout();
    },
    async onClickSaveLimitTimestamp () {
      const limitTimestamp = buildLimitTimestampFromDateJson(this.$refs.limitPicker.selected)
      if (ymdhm(new Date(limitTimestamp)) <= ymdhm(new Date())) {
        this.$hiClass.alert('종료일을 다시 설정해 주세요.')
        return
      }
      await this.patchLimitTimestamp({roomId: this.connectRoomItem.roomId, userId: localStorage.uuid, limitTimestamp})
      this.periodEdit = false
    },
    async onClickSaveRoomName () {
      await this.patchRoomName({roomId: this.connectRoomItem.roomId, userId: localStorage.uuid, roomName: this.chatName.trim()})
      this.chatNameEdit = false
    },
    showRoomnameModal () {
      this.chatName = this.connectRoomItem.roomName;
      this.chatNameEdit = true;
    },
    onKeyupChatNameInput (e) {
      this.chatName = this.$refs.chatNameInput.value
    },
    showLoading() { this.setIsDimLoading(true) },
    hideLoading() { this.setIsDimLoading(false) },

    onConfirmPassword() {
      this.onClickDownloadMessageFile(this.password);
    },

    onCopyPassword() {
      navigator.clipboard.writeText(this.password).then(() => {
        this.$toasted.show('비밀번호가 복사되었습니다.');
      });
    },

    async onClickDownloadMessageFile(password) {
      this.showLoading();
      try {
        this.onCopyPassword();
        await this.callChatMessageDownloadSecure(password);
      } catch(error) {
        this.$hiClass.alert("다운로드에 실패하였습니다.<br>다시 시도해주세요.")
      } finally {
        this.hideLoading();
        this.isPasswordConfirmModalOpen = false;
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$jqueryUtil.scrollbar();
    });
  },
  beforeDestroy() {
    this.closeRoomSetting();
  }
}
</script>

<style scoped lang="scss">
.note-calendar-popup{
  position: static;
  &::v-deep {
    .popup-calendar-wrap{width: 100%;}
    .note-resev-opt{
      padding-bottom: 20px;
      input{
        font-size: 14px;
      }
      .option-val{
        font-size: 14px;
      }
      .option-item{
        padding-left: 10px;
      }
    }
    .btn-wrap{
      display: none;
    }    
  }
}
// 채팅방 종료하기  noti-function-wrap 가 flex로 구성되어 있어서 ico-out의 absolute 설정 삭제 
// .ico-out {
//   position: absolute;
//   bottom: 0px;
// }

// #84959 파일 비밀번호 확인 모달 스타일
.password-input-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding: 11px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #eee;
  
  .password-text {
    flex: 1;
    font-size: 15px;
    color: #222;
    text-align: left;
  }
}
</style>
