<!--
@File(Method): RoomListItem.vue
@Description: 하이톡 > 대화목록 > 아이템
@Modified: 2025-03-26 - #73287 하이톡 내 플로팅 UI 공통화
-->
<template>
  <li class="position-room" :class="{selected : isSelectedRoom}"
    @click="isShowMulitpleReadLayer ? targetChange(roomItem.room) : connectRoom($event)"  
    @mousedown.right="showMoreLayer"
    @contextmenu.prevent>
    <div v-if="isShowMulitpleReadLayer" class="checkbox-position">
      <input
        type="checkbox"
        :id="`checkbox-${roomItem.room}`"
        :class="{ dis : !isReadFuncion || !isTeacher}"
        :disabled="!isReadFuncion || !isTeacher"
        :checked="multipleReadTargets.includes(roomItem.room)"
        @click="targetChange(roomItem.room)"
      >
      <label :for="`checkbox-${roomItem.room}`"></label>
    </div>
  
    <span v-if="isManage" class="class-administrator" :class="{'edit-mark': isShowMulitpleReadLayer}">administrator</span>
    <div class="profile-thumbnail-wrap">
      <div
        class="profile-thumbnail"
        :class="{'edit-image': isShowMulitpleReadLayer}"
      >
        <img class="profile-image" :src="roomItemProfileImage" @error="roomItemProfileImageReplace" alt="" />
      </div>
    </div>
    <div class="profile-text-wrap" :class="{'edit-text': isShowMulitpleReadLayer}">
      <div class="name" :class="{'profile-block': blocked}" >
        <GroupRoomIcon :roomItem="roomItem" />
        <span>{{ roomName }}</span>
        <span
          v-if="isShowRoomMemberCount"
          class="num"
        >
          {{ roomMemberCount }}
        </span>
        <span v-if="isShowPin" class="pinup"></span>
      </div>
      <div class="chating-time"><span>{{ messageTimestamp }}</span></div>
      <div class="school-info"><span>{{ className }}</span></div>
      <div class="chating-preview">
        <div class="chating-text">
          <p v-html="messageContent"></p>
        </div>
        <div
          v-if="messageCount > 0"
          class="chating-count"
        >
          <span>{{ messageCount }}</span>
        </div>
        <div class="failed-icon" v-if='messageCount == 0 && hasPendingMessage'></div>
      </div>
    </div>
    <!-- #73287 플로팅 레이어 공통 css 적용-->
    <div v-if="isShowMoreLayer" class="float-layer-wrap">
      <div class="float-layer" v-click-outside="hideMoreLayer">
        <button v-if="isTeacher && isReadFuncion" @click="openConfirmDialolg" @contextmenu.prevent><span>읽음 처리</span></button>
        <button @click="roomTopFixed" @contextmenu.prevent><span>{{ pinFixedMeunText }}</span></button>
      </div>
    </div>
    <!-- <div v-if="isShowMoreLayer" class="more-layer-wrap">
      <div class="more-layer-popup-wrap" v-click-outside="hideMoreLayer">
        <template>
          <button v-if="isTeacher && isReadFuncion" class="copy-btn" @click="openConfirmDialolg" @contextmenu.prevent><span>읽음 처리</span></button>
          <button class="copy-btn" @click="roomTopFixed" @contextmenu.prevent><span>{{ pinFixedMeunText }}</span></button>
        </template>
      </div>
    </div> -->

    <confirm-dialog 
      v-if="confirmDialog.isShow" 
      :title="confirmDialog.title" 
      :description="confirmDialog.description"
      :isAlert="confirmDialog.isAlert"
      @closeConfirmDialog="closeConfirmDialog"
    />
  </li>
</template>

<script>
import {URLProps} from "@/enums";
import {mapActions, mapMutations, mapState} from "vuex";
import ConfirmDialog from '@/apps/hitalk/components/popup/ConfirmDialog';
import { useRoomChaingingContext, isExpiredRoom } from '@/apps/hitalk/utils';
import GroupRoomIcon from "../../common/GroupRoomIcon.vue";
import { EXTERNAL_LINKS } from '@/constants/externalAssets';

const roomChaingingContext = useRoomChaingingContext();

export default {
  name: "RoomListItem",
  components: {ConfirmDialog, GroupRoomIcon},
  props: {
    roomItem: Object,
    toggleRoomItem: Object,
    multipleReadTargets: Array,
    isShowMulitpleReadLayer: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      toggleFlag: false,
      shareTypeCode: {
        NOTE: '알림장을',  // 학급공지를
        ALBUM: '앨범을',
        BOARD: '자유게시글을',
        HOMEWORK: '과제를',
        ALARM: '가정통신문을',
        MEAL: '급식을',
        NOTICE: '학교 공지를',
        CP_BOARD: '게시글을',
        CLASS_APPLY: '학교 신청서를',
        SHEET: '학교 신청서를',
        SURVEY: '설문을',
        CLASSROOM: '학생 리포트를',
      },
      confirmDialog : {
        isShow: false,
        title: '',
        description: ''
      }
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapState('storeHitalk', [
      'connectRoomItem',
      'classJSONList',
      'blockedUsers',
      'pendingMessages'
    ]),
    blocked() {
      return this.user.userType === 'TEACHER' && this.roomItem.roomType === 'PERSON' &&
        this.personalChatUser &&
        this.blockedUsers.find(o => o.userId === this.personalChatUser.user.currentId && o.clazzSubscribes.some(c => c.classId === this.personalChatUser.clazz.currentId)) !== undefined
    },
    isReadFuncion: function () {
      return this.messageCount > 0
    },
    isSelectedRoom: function () {
      return this.connectRoomItem.roomId === this.roomItem.room;
    },
    personalChatUser: function () {
      if (this.roomItem.roomType === "GROUP") return "";
      if(!this.roomItem.settings.members) return "";
      let mem = this.roomItem.settings.members;
      for (const memTemp of mem) {
        if (memTemp.user.currentId !== localStorage.uuid) {
          memTemp.clazz = this.roomItem.settings.clazz;
          return memTemp;
        }
      }
      return "";
    },
    roomName: function () {
      switch (this.roomItem.roomType) {
        case "PERSON": {
          if(!this.personalChatUser) return "";

          if (this.personalChatUser.memberStatusCheck === "CLASSLEAVE") {
            return this.personalChatUser.user.userName;
          }
          switch (this.personalChatUser.userType) {
            case "TEACHER": {
              return this.personalChatUser.user.userName + this.$t("chat.type.teacher");
            }
            case "PARENTS": {
              return this.personalChatUser.memberChildName + this.$t("chat.type.parent") + "(" + this.personalChatUser.user.userName + ")";
            }
            case "STUDENT": {
              return this.personalChatUser.memberChildName + this.$t("chat.type.student");
            }
            default: {
              return null;
            }
          }
        }

        case "GROUP": {
          return this.roomItem.roomName || this.roomItem.personRoomName || '단체방';
        }

        default: {
          return "";
        }
      }
    },
    isShowPin: function() {
      return this.roomItem.isPin
    },
    pinFixedMeunText: function() {
      return this.roomItem.isPin ? '채팅방 상단 해제' : '채팅방 상단 고정'
    },
    isShowRoomMemberCount: function() {
      return this.roomItem.roomType === 'GROUP'
    },
    roomMemberCount: function() {
      return this.roomItem.settings.memberCount || 0
    },
    roomItemProfileImage: function () {
      const defaultUserPhoto = URLProps.DEFAULT_PROFILE_IMAGE_URL
      const defaultClassPhoto = EXTERNAL_LINKS.IMAGES.DEFAULT_CLASS

      if (this.roomItem.roomType === "GROUP") {
        const classPhoto = this.roomItem.settings.clazz
          ? this.roomItem.settings.clazz.classImagePath || defaultClassPhoto
          : defaultClassPhoto
        return classPhoto
      }

      if(!this.personalChatUser) {
        return defaultUserPhoto
      }

      return this.personalChatUser.user.userPhoto || defaultUserPhoto
    },
    messageTimestamp: function () {
      return this.getMessageTime(this.roomItem.settings.user.lastChatMessage.insertedTimestamp);
    },
    messageContent: function () {
      if(!this.roomItem.settings.user.lastChatMessage) return "";
      const message = this.roomItem.settings.user.lastChatMessage.content

      switch (this.roomItem.settings.user.lastChatMessage.contentType) {
        case "CHAT":
          return message.replaceAll('>', '&gt;').replaceAll('<', '&lt;')
        case "FILE":
          return JSON.parse(message).fileName;
        case "PHOTO":
          return "사진을 보냈습니다.";
        case "PHOTOMULTI": {
          let files = []
          try {
            files = JSON.parse(message)
            // eslint-disable-next-line
          } catch (e) {}
          const fileCount = files.length || 0
          return `사진 ${fileCount}장을 보냈습니다.`;
        }
        case "DELETE":
          return this.$t("chat.message.delete");
        case "VIDEO":
          return "영상을 보냈습니다.";
        case "STICKER":
          return "스티커를 보냈습니다.";
        case "VOTE":
          return message.startsWith('{') ? `투표 : ${(JSON.parse(message).questions || [{question: ''}])[0].question}` : message;
        case "SHARE": {
          let shareContent = {}
          let shareTypeStr = ''
          try {
            shareContent = JSON.parse(message)
            // eslint-disable-next-line
          } catch (e) {}

          switch (shareContent.shareType) {
            case 'NOTE': {
              shareTypeStr = this.shareTypeCode[shareContent.shareType]
              if (shareContent.schoolType && !['KINDERGARTEN', 'ELEMENTARY'].includes(shareContent.schoolType)) {
                shareTypeStr = '공지를'
              }
              break
            }
            case 'ALBUM':
            case 'BOARD':
            case 'HOMEWORK':
            case 'ALARM':
            case 'MEAL':
            case 'NOTICE':
            case 'CP_BOARD':
            case 'CLASS_APPLY':
            case 'SHEET':
            case 'SURVEY':
            case 'CLASSROOM':
              shareTypeStr = this.shareTypeCode[shareContent.shareType]
              break
          }
          return `${shareTypeStr} 공유하였습니다.`
        }
        default: {
          try {
            return typeof JSON.parse(message) === 'object' ? '지원되지 않는 메시지 입니다.' : message
            // eslint-disable-next-line
          } catch (e) {
            return message
          }
        }
      }
    },
    messageCount() {
      return this.roomItem.settings.user['messageCount']
    },
    className() {
      return this.roomItem.settings.clazz ? this.roomItem.settings.clazz.className : "";
    },
    isTeacher() {
      const {memberRole} = this.classJSONList[this.roomItem.classId]
      return memberRole === 'OWNER' || memberRole === 'MANAGER'
    },
    isManage() {
      const {memberRole} = this.classJSONList[this.roomItem.classId]
      return this.roomItem.roomType === 'GROUP' && (memberRole === 'OWNER' || memberRole === 'MANAGER')
    },
    isShowMoreLayer() {
      return this.toggleRoomItem && this.toggleRoomItem.room === this.roomItem.room
    },
    hasPendingMessage() {
      return this.pendingMessages.find(o => o.roomId === this.roomItem.room && o.sender === localStorage.uuid)
    },
    isExpiredRoom() {
      return isExpiredRoom(this.roomItem)
    }
  },
  methods: {
    ...mapMutations('storeHitalk',[
      'showChatLayout',
      'setTimeSetting',
      'setCurrentClassItem',
      'setIsNewLastMessageFlag',
      'clearNewLastMessageList',
      'clearChatMessageList'
    ]),
    ...mapActions('storeHitalk',[
      'connectChatRoom',
      'disconnectChatRoom',
      'callChatRooms',
      'callUserTime',
      'fetchReadMulti',
      'callPinSave',
      'callMessageList',
      'doCallChatRooms'
    ]),
    getMessageTime(pMessageTime) {
      let nowTimestamp = new Date().getTime();
      let chatTimestamp = parseInt(pMessageTime, 10);
      let diffTime = nowTimestamp - chatTimestamp;
      let returnTime = '';
      const isSameYear = this.$moment(nowTimestamp).isSame(pMessageTime, "years")
      
      if(!isSameYear) {
        return this.$moment(pMessageTime).format('YY.M.D')
      }

      if (diffTime < 1000) {
        returnTime = 1 + this.$t("chat.settings.ago.second");
      } else if (diffTime / 1000 / 60 < 1) {
        returnTime = Math.floor(diffTime / 1000) + this.$t("chat.settings.ago.second");
      } else if (diffTime / 1000 / 60 / 60 < 1) {
        returnTime = Math.floor(diffTime / 1000 / 60) + this.$t("chat.settings.ago.minute");
      } else if (diffTime / 1000 / 60 / 60 / 24 < 1) {
        returnTime = Math.floor(diffTime / 1000 / 60 / 60) + this.$t("chat.settings.ago.hour");
      } else if (diffTime / 1000 / 60 / 60 / 24 > 8) {
        let tempDate = new Date(chatTimestamp);
        returnTime = (tempDate.getMonth() + 1) + this.$t("chat.settings.month") + " " + tempDate.getDate() + this.$t("chat.settings.day");
      } else {
        returnTime = Math.floor(diffTime / 1000 / 60 / 60 / 24) + this.$t("chat.settings.ago.day");
      }
      return returnTime;
    },
    async connectRoom(e) {
      e.preventDefault()
      if (roomChaingingContext.busy) return;
      roomChaingingContext.busy = true;
      await this.doConnectRoom(e);
      roomChaingingContext.busy = false;
    },
    async doConnectRoom(e) {
      if(this.isShowMulitpleReadLayer) return;
      if(this.isShowMoreLayer) return
      if(this.roomItem.room === this.connectRoomItem.roomId) return;
      if(this.roomItem.roomType === 'PERSON') {
        const member = (this.classJSONList[this.roomItem.classId] || {}).me
        await this.callUserTime({userId: member.user.currentId || member.user.userId, userType: member.user.userType, memberRole: member.memberRole, isSetUserTime: member.user.userType === 'TEACHER'})
      }

      try {
        const response = await this.doCallChatRooms({ roomId: this.roomItem.room });      
        if (response.data._embedded.chatMessages.length === 0 && this.roomItem.settings.user.lastChatMessage.contentType !== 'RESERVATION') {
          this.$hiClass.alert("유효하지 않은 방입니다.", 'warning');
          this.callChatRooms();
          return;
        } else {
          this.setIsNewLastMessageFlag(false)
          this.clearNewLastMessageList()
          if(this.roomItem.room === this.connectRoomItem.roomId) return;

          const me = (this.classJSONList[this.roomItem.classId] || {}).me
          const userTime = await this.callUserTime({...me, isSetUserTime: false})

          if(this.connectRoomItem.roomId){
            this.disconnectChatRoom();
            this.clearChatMessageList();
          }
          this.setCurrentClassItem(this.classJSONList[this.roomItem.classId]); // version 1.3.52 connerctChatRoom 아래서 위로 위치 변경
          await this.connectChatRoom({roomId: this.roomItem.room, userTime});
          //this.showChatLayout();      // version 1.3.52
          this.setTimeSetting(60 * 60 * 5);
          this.$emit('closeShareReportHistoryDetail');
          if (this.roomItem.roomType === 'GROUP' 
            || (userTime.isUseChat && userTime.isChatTime && !userTime.isHoliday && !this.blocked)
          ) {
            await this.fetchReadMulti(this.roomItem);
          }  
        }
      } catch (error) {
        console.error(" callCheckExistRoom error => ", error);
      }
    },
    showMoreLayer(e) {
      if(this.isShowMulitpleReadLayer || this.isExpiredRoom) return;
      this.$emit('showMoreLayer', this.roomItem)
    },
    hideMoreLayer: function(isReload) {
      this.$emit('hideMoreLayer', isReload === true)
    },
    roomMessageRead: async function() {
      await this.fetchReadMulti(this.roomItem);
      this.hideMoreLayer(true);
    },
    roomTopFixed: async function(e) {
      e.preventDefault()
      const res = await this.callPinSave({roomId: this.roomItem.room, isPin: !this.roomItem.isPin})
      
      if(res === 428) {
        this.$hiClass.alert('최대 5개까지 상단 고정할 수 있습니다.');
        return;
      }
      this.$toasted.clear()
      const options = { duration: 2000 }  
      this.$toasted.show(this.roomItem.isPin ? '상단 고정이 해제되었습니다.' : '상단 고정 되었습니다.', options)
      this.hideMoreLayer(true)
    },
    targetChange: function(id) {
      if(this.isReadFuncion && this.isTeacher) {
        this.$emit('setMultipleTargets', id)
      }
    },
    openConfirmDialolg: function() {
      const title = '대화방의 모든 메시지를\n읽음 처리 하시겠습니까?'
      const description = ''
      const modal = {
        title,
        description,
        isShow: true
      }
      this.confirmDialog = {...modal}
    },
    closeConfirmDialog: async function(isConfirm) {
      if(isConfirm) {
        await this.roomMessageRead()
      }

      this.confirmDialog = {
        isShow: false,
        title: '',
        description: ''
      }
    },
    roomItemProfileImageReplace(e) {
      e.target.src = URLProps.DEFAULT_PROFILE_IMAGE_URL
    }
  }
}
</script>

<style scoped lang="scss">
.float-layer{
  right: -42px;
  button {
    width: 145px;
    color: #333;
  }
}
// .more-layer-wrap {
//   position:absolute; margin:0; z-index: 100;
// }
// .more-layer-wrap .more-layer-popup-wrap {
//   display:block;
//   position:absolute;
//   border-radius:4px;
//   background:#fff;
//   box-shadow:0px 4px 12px 0 rgba(0, 0, 0, 0.2);
//   transform: translateX(70%);
// }
// .more-layer-wrap .more-layer-popup-wrap button {width: 146px;height: 44px;font-size: 0;text-align: left;padding: 0 16px;white-space: nowrap;}
// .more-layer-wrap .more-layer-popup-wrap button:hover {background:#dae4f8;}
// .more-layer-wrap .more-layer-popup-wrap button:not(:last-child) {border-bottom: 1px solid #e6e6e6;}
// .more-layer-wrap .more-layer-popup-wrap button span {
//   color: #333;
//   font-family: var(--font-body);
//   font-size: 15px;
//   font-style: normal;
//   font-weight: 400;
//   line-height: 150%; /* 22.5px */
//   letter-spacing: -0.2px;
// }
.checkbox-position {
  position: absolute;
  left: 15px;
  top: 24px;
}
.edit-image {
  left: 45px !important;
}
.edit-mark {
  left: 40px !important;
}
.edit-text {
  margin-left: 30px;
  max-width: calc(100% - 30px);
}
.pinup {
  margin-top: 5px; 
  margin-right: 0px !important;
  width: 30px;
  height: 16px;
  margin-right: 0px;
  min-width: 15px;
  background: url("../../../../../assets/img/ic_chat_pinup.svg") no-repeat;
  z-index: 1;
}
.ooo-conversation-cont-wrap .opponent-list-wrap.c-list-wrap .list-cont-wrap .profile-text-wrap .name {
  display: flex;
  align-items: stretch;
  padding-right: 5px;
}
.ooo-conversation-cont-wrap .opponent-list-wrap.c-list-wrap .list-cont-wrap .profile-text-wrap .name span{
  margin-right: 0px;
}
.ooo-conversation-cont-wrap .opponent-list-wrap.c-list-wrap .list-cont-wrap .profile-text-wrap .name .num{
  margin: 0 5px;
}
.ooo-conversation-cont-wrap .opponent-list-wrap .list-cont-wrap .profile-text-wrap .name span:not(.num) {  
  -webkit-line-clamp: none;
  max-height: 22px;
  white-space: nowrap;
  display: block;
}
.failed-icon {
  width: 20px;
  height: 20px;
  background: url("../../../../../assets/img/icon/ic_failed_to_send_message.svg") no-repeat;
  position: absolute;
  right: -45px;
  top: 3px;
  padding: 0 6px;
}

img.profile-image {
  transform: translate3d(0,0,0);
}
</style>