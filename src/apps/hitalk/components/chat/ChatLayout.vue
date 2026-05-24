<!--
@File(Method): ChatLayout.vue
@Author: -
@Date Created: -
@Description: 하이톡 > 대화목록 > 채팅방
@Modified: 2025-06-23 - #72346 하이톡 투표하기 - 글쓰기내 attach 영역 버튼들 정렬 수정 및 hover, disabled 스타일 추가
-->
<template>
  <div class="chatting-box-wrap">
    <confirm-dialog
      v-if="confirmDialog.isShow"
      :title="confirmDialog.title"
      :description="confirmDialog.description"
      :imageFile="confirmDialog.paste ? confirmDialog.paste.files[0] : null"
      :confirmButtonName="confirmDialog.paste ? '전송' : '확인'"
      @closeConfirmDialog="closeConfirmDialog"
      @closeConfirmDialogNoAction="closeConfirmDialogNoAction"
    />
    <div class="chatting-top-wrap">
      <div class="chatting-opponent-info-wrap">
        <div class="chatting-opponent-info">
          <div class="profile-thumbnail" :style="currentRoomProfileImage"></div>
          <p :class="{'profile-block': blocked}">
            {{ currentRoomName }}
          </p>
          <div
            v-if="thisRoomChatTime"
            class="available-time info"
          >
            <span>{{ thisRoomChatTime }}</span>
          </div>
          <div v-if="connectRoomItem.roomType === 'GROUP' && connectRoomItem.groupType === 'LIMIT'"
            class="end-time info" :class="{off: isExpiredLimitGroupRoom}"
          >
            <span>종료일 : {{ limitTimestampString }}{{ isExpiredLimitGroupRoom ? ' 종료' : '' }}</span>
          </div>
          <p class="ft-14">{{ currentRoomClassName}}<span>({{ currentRoomMemberCount }})</span></p>
        </div>
        <button v-if="checkPermitSaveMessage()" class="btn-download" @click="onClickDownloadMessageFile">
          <span>대화 저장하기</span>
        </button>
        <div v-if="connectRoomItem.roomType !== 'GROUP' || !isClassMember" id="chat-room-more-btn" class="dot-more-btn-wrap">
          <button class="more-btn" @click="showRoomSettingLayout">
            <span class="more-btn-dot"></span>
            <span>더보기</span>
          </button>
        </div>
      </div>
    </div>
    <div class="chatting-cont-wrap">
      <div class="chatting-list-wrap" ref="chatListWrap">
        <div class="scrollbar-outer" ref="messageArea" @scroll="onScroll(preventScrollEventFlag)">
          <template v-for="(message, index) of messageArrayList">
            <message-date
              v-if="isShowMessageDate(index)"
              :key="`${message.currentId}-Date-${index}`"
              :message="message"
              :roomType="connectRoomItem.roomType"
            />
            <template v-if="message.contentType === 'KICK'" >
              <message-ejection
                :key="`${message.currentId}-ejection-${index}`"
                :message="message"
              />
            </template>
            <template v-else-if="message.contentType === 'INVITE'" >
              <message-invite
                :key="`${message.currentId}-invite-${index}`"
                :message="message"
              />
            </template>
            <template v-else>
              <message-my-chat
                v-if="isMyMessage(message.sender)"
                :key="`${message.currentId || message.tempId}-my-message-${index}`"
                :message="message"
                :messageSender="connectCurRoomMembers[message.sender]"
                :nextMessage="index < messageArrayList.length - 1 ? messageArrayList[index + 1] : null"
                @scrollToElement="scrollToElement"
                @openVote="openVote"
                @openClassRoomReport="openClassRoomReport"
              />
              <message-your-chat
                v-else
                :key="`${message.currentId}-your-message-${index}`"
                :message="message"
                :messageSender="connectCurRoomMembers[message.sender]"
                :isTeacher="!isReadOnlyMember"
                :prevMessage="index - 1 > 0 ? messageArrayList[index - 1] : null"
                :nextMessage="index < messageArrayList.length - 1 ? messageArrayList[index + 1] : null"
                @callRead="openConfirmDialolg"
                @scrollToElement="scrollToElement"
                @openVote="openVote"
                @openClassRoomReport="openClassRoomReport"
              />
            </template>
          </template>
          <div v-if="isNewPersonRoom">
            <div class="chatting-date-wrap">
              <div class="date">{{ $comn.convertTimestamp2DateByFormat($moment(), "-", "ko") }}</div>
            </div>
            <div class="chatting-msg-wrap">
              <div class="invite">대화 시 서로 존중하는 마음으로 이용해 주세요.<br>욕설, 비방, 허위 내용 등의 불쾌감을 주거나 명예훼손의 내용은 작성할 수 없습니다.</div>
            </div>
          </div>
          <div v-if="isExpiredLimitedRoom">
            <div class="chatting-msg-wrap">
              <div class="invite">{{ connectRoomItem.roomName }}이 종료 되었습니다. 개설자 선생님만 채팅방 진입이 가능하며,<br>다른 구성원의 대화 목록에서는 숨김 처리 되었습니다.</div>
            </div>
          </div>
        </div>
        <div class="chatting-vote-float-wrap" v-if="ready && isGroupRoom && connectRoomItem.isVote && showVoteFloat">
          <hitalk-vote-float-room :room="connectRoomItem.roomId" @open="({detail}) => openVote(detail)"></hitalk-vote-float-room>
        </div>
      </div>
      <div class="chatting-input-wrap" ref="chatInputWrap">
        <div
            class="reservation-notice-wrap"
            role="button"
            @click="setTabReservation"
            v-if="currentRoomReservationCount > 0"
        >
          <p>{{ currentRoomReservationCount }}건의 예약 메시지가 있습니다.</p>
        </div>
        <div class="add-attach">
          <input type="file" id="file" ref="file" @change="handleFileUpload()" style="display:none" />
          <button
            class="btn-image"
            title="사진"
            :disabled="isReadOnlyMember"
            :class="{dis: isReadOnlyMember}"
            @mousedown.passive="prefetchTeacherPermission"
            @touchstart.passive="prefetchTeacherPermission"
            @click="fileUploadOpen('image')"
          >
            <i></i>
          </button>
          <button
            class="btn-video"
            title="영상"
            :disabled="isReadOnlyMember"
            :class="{dis: isReadOnlyMember}"
            @mousedown.passive="prefetchTeacherPermission"
            @touchstart.passive="prefetchTeacherPermission"
            @click="fileUploadOpen('video')"
          >
            <i></i>
          </button>
          <button
            class="btn-file"
            title="문서"
            :disabled="isReadOnlyMember"
            :class="{dis: isReadOnlyMember}"
            @mousedown.passive="prefetchTeacherPermission"
            @touchstart.passive="prefetchTeacherPermission"
            @click="fileUploadOpen('*')"
          >
            <i></i>
          </button>
          <sticker-layout
          :clReadOnlyMember="isReadOnlyMember"/>
          <div
              v-if="isShowReservationBtn"
              class="add-reservation"
              @click="() => !isReadOnlyMember && reservationMessage()"
          >
            <button title="예약메시지" class="btn-reservation" :class="{dis: isReadOnlyMember}"></button>
          </div>
          <div v-if="isGroupRoom && !isClassMember" class="vote-button-wrap">
            <button title="투표만들기" class="btn-vote" :class="{dis: isReadOnlyMember || isExpiredLimitGroupRoom}" @click="onClickBtnVote"></button>
          </div>
        </div>
        <div
          class="input-box-wrap"
          :class="{
            dis: isReadOnlyMember || isDimLoading,
            focus: isMessageFocus,
            dragging: isDraggAble
          }"
        >
          <div class="textarea-wrap">
            <div
              @dragenter="onDragEnter"
              @dragleave="onDragLeave"
              @dragover="onDragover"
              @drop="onDrop"
            >
              <div
                ref="message"
                class="text-input-area"
                :contenteditable="!isReadOnlyMember && !isDimLoading"
                :placeholder="messagePlaceholder"
                @keypress="event => onKeyPress(event)"
                @keyup="event => onKeyUp(event)"
                @focus="isMessageFocus = true"
                @blur="isMessageFocus = false"
                @paste="onPaste"
              ></div>
            </div>
          </div>
          <div v-show="isSelectedSticker" class="attach-file-wrap">
            <div class="attaching-img">
              <div class="img-wrap hitalk-sticker">
                <img :src="selectedStickerItem.stickerUrl" alt="">
              </div>
              <button class="delete-btn" @click="deleteStickerItem"></button>
            </div>
          </div>
          <!-- 이동  <sticker-layout
          :clReadOnlyMember="isReadOnlyMember"/> -->
        </div>
        <div class="send-btn-wrap">
          <button
            class="btn-bg-c"
            :class="{ dis: isReadOnlyMember }"
            :disabled="isReadOnlyMember"
            @click="sendMessage"
          >
            {{ $t("chat.send") }}
          </button>
        </div>
        <chat-floating-message
            v-if="isNewLastMessageFlag"
            @scrollDownWithHideFloatingMsg="scrollDownWithHideFloatingMsg"
        >
        </chat-floating-message>
        <transition name="fade">
          <button class="btn-scrollBottom" @click="scrollToBottom" v-if="showScrollBottomBtn && !isNewLastMessageFlag" />
        </transition>
      </div>
    </div>
    <hitalk-vote-portal v-if='showVotePortal'
      :vote='selectedVoteMessageId'
      @close='onCloseVote'
      @change='onChangeVote'
      style="z-index: 100000"/>
    <!-- #84959 파일 비밀번호 확인 모달 -->
    <HiModal type="type01" modalLayerStyle="width:480px;" size="md" @close="isPasswordConfirmModalOpen=false" v-if="isPasswordConfirmModalOpen">
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
import MessageEjection from "@/apps/hitalk/components/chat/contents/MessageEjection";
import MessageInvite from "@/apps/hitalk/components/chat/contents/MessageInvite";
import MessageMyChat from "@/apps/hitalk/components/chat/contents/MessageMyChat";
import MessageYourChat from "@/apps/hitalk/components/chat/contents/MessageYourChat";
import MessageDate from "@/apps/hitalk/components/chat/contents/MessageDate";
import ChatFloatingMessage from "@/apps/hitalk/components/chat/ChatFloatingMessage";
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import StickerLayout from "@/apps/hitalk/components/popup/sticker/StickerLayout";
import ConfirmDialog from '@/apps/hitalk/components/popup/ConfirmDialog';

import {eventBus} from "@/main";

import { checkTeacherChatTime, formatChatTime, UnintendedScrollObserver,
  formatChatLimitTimestamp, useTmpVideoThumbnailManager } from "@/apps/hitalk/utils";
import {checkAndConvertHEIC, validatePDF} from "@/plugins/utils";
import {mapFields} from "vuex-map-fields";
import { remoteConfig } from "@/plugins/firebase";
import needBrowserUpdate from "@/mixins/needBrowserUpdate";

const THRESHOLDS_TERM = 300;
const tmpVideoThumbnailManager = useTmpVideoThumbnailManager();

export default {
  name: "ChatLayout",
  mixins: [needBrowserUpdate],
  components: {StickerLayout, MessageDate, MessageYourChat, MessageMyChat, MessageInvite, MessageEjection, ChatFloatingMessage, ConfirmDialog},
  data: () => ({
    selectedUploadType: '*',
    progress: {
      current: 0,
      percent: 0,
      total: 0,
      files: {}
    },
    isMessageFocus:false,
    preventScrollEventFlag: false,
    chatInputHeight: 0,
    confirmDialog : {
      isShow: false,
      title: '',
      description: '',
      action: '',
      files: [],
      paste: null
    },
    isDragging: false,
    showScrollBottomBtn: false,
    loadingNextMessageList: false,
    lastSentMessage: 0,
    selectedVoteMessageId: null,
    showVotePortal: false,
    ready: false,
    showVoteFloat: true,
    isPasswordConfirmModalOpen: false,
    password: ''
  }),
  computed:{
    ...mapState([
      'user',
      'imagePackResize',
      'versionData'
    ]),
    ...mapFields([
      'isDimLoading',
    ]),
    ...mapState('storeHitalk',[
      'isLastMessagePageIndex',
      'selectedStickerItem',
      'connectRoomItem',
      'connectRoomMembers',
      'messageListPageIndex',
      'tempChatMessages',
      'selectedTab',
      'isScrolledBottom',
      'currentRoomReservationCount',
      'userTime',
      'isChatRoomLoad',
      'blockedUsers',
      'classJSONList',
      'userTimeForNotification'
    ]),
    ...mapGetters([ 'CONSTANTS' ]),
    ...mapGetters('storeHitalk',[
      'currentRoomName',
      'currentRoomClassName',
      'currentRoomMemberCount',
      'currentRoomProfileImage',
      'connectCurRoomMembers',
      'messageArrayList',
      'isNewLastMessageFlag',
      'newLastMessageList',
      'currentRoomTargetMember',
      'currentRoomMaster',
      'isConnectRoomExpired',
      'isBlockedInChatRoom',
      'isMasterInCurrentRoom',
    ]),
    uploadingVideoFiles : function() {
      return Object.values(this.uploading).filter(o => o.roomId === this.roomId) || []
    },
    isScrollBottom:{
      get(){
        return this.isScrolledBottom;
      },
      set(value){
        this.setIsScrolledBottom(value);
      }
    },
    isUseChat: function() {
      return this.userTime.isUseChat || (
        this.connectRoomItem.roomType === 'PERSON' &&
        this.connectRoomMembers.find(m => m.userId != localStorage.uuid).role === 'MEMBER'
      )
    },
    isOverChat: function() {
      return !this.userTime.isOverChat ? !this.checkTeacherChatTime() : false
    },
    isSelectedSticker: function () {
      return !!this.selectedStickerItem.stickerUrl;
    },
    roomId: function () {
      return this.connectRoomItem.roomId;
    },
    roomMaster: function () {
      return this.connectRoomMembers.find(m => m.isMaster)
    },
    lastMessageId: function () {
      return this.messageArrayList[this.messageArrayList.length - 1].currentId;
    },
    roomMembers: function () {
      let roomMemberJsonList = {};
      for (let roomMember of this.connectRoomMembers) {
        this.$set(roomMemberJsonList, roomMember.userId, roomMember);
      }
      return roomMemberJsonList;
    },
    isBlockedByVersionData: function () {
      const hitalkVersion = this.versionData.hitalk || {};
      return this.connectRoomItem.roomType === 'GROUP' && ['GENERAL', 'LIMIT'].includes(this.connectRoomItem.groupType) &&
        !(
          (hitalkVersion.groupRoomMessage || false) &&
          (this.connectRoomItem.groupType === 'LIMIT' && (hitalkVersion.groupRoomLimit || false)) ||
          (this.connectRoomItem.groupType === 'GENERAL' && (hitalkVersion.groupRoomGeneral || false))
        )
    },
    isReadOnlyMember: function () {
      if (this.currentRoomName === '알수없음' || this.isBlockedByVersionData || this.isConnectRoomExpired || this.isBlockedInChatRoom) {
        return true;
      }
      let roomMaster = this.roomMaster;

      switch (this.connectRoomItem.roomType) {
        case "GROUP": {
          if(!this.connectCurRoomMembers[localStorage.uuid]) return true;
          return !(
            ['GENERAL', 'LIMIT'].includes(this.connectRoomItem.groupType)
            || (roomMaster && (roomMaster.userId === localStorage.uuid ))
            || this.connectCurRoomMembers[localStorage.uuid].role === "MANAGER"
            || this.connectCurRoomMembers[localStorage.uuid].role === "OWNER");
        }
        case "PERSON": {
          for (let member of this.connectRoomMembers) {
              /*
               if (member.userId !== localStorage.uuid) {
                return !this.isUseChat || this.isOverChat;
               }
              */
              if (member.userId === localStorage.uuid ) {
                  const isAvailable = this.checkTeacherChatTime();

                  // 채팅 사용할 경우
                  if(this.isUseChat){
                    // 상담 시간이 아닐 경우
                    if (!isAvailable && this.isOverChat) {
                        return true;
                    }
                    // 상담 시간일 경우
                    if (isAvailable && !this.isOverChat) {
                        return false;
                    }
                    // 상담 시간이 아닐 경우
                    if (!isAvailable && !this.isOverChat) {
                        return false;
                    }
                    // 상담 시간 && 메시지 받기
                    if (isAvailable && this.isOverChat) {
                        return false;
                    }
                  // 채팅 미사용할 경우
                  }else if(!this.isUseChat){
                    return true;
                  }
              }
          }
          return false;
        }
        default: {
          return false;
        }
      }
    },
    classRole() {
      return (this.classJSONList[this.connectRoomItem.classId] || {}).memberRole
    },
    isClassMember() {
      return this.classRole === 'MEMBER'
    },
    blocked() {
      return ['OWNER', 'MANAGER'].includes(this.classRole) &&
        this.user.userType === 'TEACHER' && this.connectRoomItem.roomType === 'PERSON' &&
        this.blockedUsers.some(b => Object.values(this.connectRoomMembers).some(m => m.userId === b.userId))
    },
    messagePlaceholder() {
      if(this.isGroupRoom && (this.connectRoomItem.groupType || 'NOTICE') === 'NOTICE')
        return this.isReadOnlyMember
          ? this.$t("chat.input.placeholder.teacheronly")
          : this.$t("chat.input.placeholder");

      if(this.isGroupRoom && this.connectRoomItem.groupType !== 'NOTICE')
        return this.isReadOnlyMember
          ? this.$t(this.isExpiredLimitGroupRoom ? "chat.input.placeholder.withdrawal" : "chat.input.placeholder.blocked")
          : this.$t("chat.input.placeholder");

      if(this.currentRoomName === '알수없음')
        return this.$t("chat.input.placeholder.withdrawal")

      const isAvailable = this.checkTeacherChatTime();
      return !this.isUseChat ? '선생님만 작성할 수 있습니다.'
      : !isAvailable && this.isOverChat ? '지금은 상담 가능 시간이 아닙니다.' : this.$t("chat.input.placeholder");
    },
    isMaster() {
      return this.roomMaster.userId === localStorage.uuid;
    },
    isNewPersonRoom: function() {
      const max = this.$moment(Math.max(...this.messageArrayList.map(m => m.insertedTimestamp || m.timestamp || 0)))
      return this.connectRoomItem.roomType !== 'GROUP' && (this.messageArrayList.length === 0 || parseInt(max.format('YYYYMMDD')) < parseInt(this.$moment().format('YYYYMMDD')))
    },
    isExpiredLimitedRoom: function() {
      return this.isGroupRoom && this.connectRoomItem.groupType === 'LIMIT' && this.connectRoomItem.isEnding
    },
    // 채팅창 > 예약메시지 아이콘 활성화/비활성화 처리
    isShowReservationBtn() {
      if (this.currentRoomName === '알수없음') return false
      return true
    },
    otherUser: function() {
      const user = this.connectRoomMembers.find(m => m.userId !== localStorage.uuid)
      return user
    },
    thisRoomChatTime: function() {

      if(this.currentRoomName === '알수없음'){
        return '';
      }

      if (!this.currentRoomMaster) return '';
      if (this.connectRoomItem.roomType !== "PERSON") return '';
      if (this.currentRoomTargetMember.userType !== 'TEACHER') return '';

      const userId = Object.keys(this.connectCurRoomMembers).find(chatMemberUserId => {
        return chatMemberUserId !== this.user.currentId
      })

      if (this.userTime.userChatDay === null && this.connectCurRoomMembers[userId].userType !== "TEACHER") return '';
      if (!this.userTime.userChatDay) return '지금은 상담 가능 시간이 아닙니다.';

      const chatTime = this.userTime;

      if (    this.roomMembers[localStorage.uuid].userType === 'TEACHER'
           && this.roomMembers[localStorage.uuid].role === 'OWNER'
           && !chatTime.userChatDay) return '';
      if (!this.userTime.isUseChat) return '해당 학급에서는 하이톡을 사용하지 않습니다.';

      return '하이톡 : ' + formatChatTime(chatTime);
    },
    isDraggAble: function() {
      return this.isDragging && !this.isReadOnlyMember
    },
    isExpiredLimitGroupRoom: function() {
      return this.isGroupRoom
        && this.connectRoomItem.groupType === 'LIMIT'
        && this.connectRoomItem.limitTimestamp < new Date().getTime()
    },
    limitTimestampString: function() {
      return formatChatLimitTimestamp(new Date(this.connectRoomItem.limitTimestamp || new Date('9999-12-31').getTime()))
    },
    isGroupRoom () {
      return this.connectRoomItem.roomType === 'GROUP';
    },
    isPersonRoom () {
      return this.connectRoomItem.roomType === 'PERSON';
    },
  },
  watch:{
    isPasswordConfirmModalOpen(val) {
      if (val) {
        this.password = crypto.randomUUID().replaceAll('-', '');;
      }
    },
    // version 1.5.32 추가
    isChatRoomLoad: {
      deep: true,
      handler: async function(newVal, oldVal) {
        if (newVal && !oldVal) { // 대화방 열리면
          await this.syncUserTime()
          // this.setRoomReservationCount() //1.5.36 version 삭제 주석
          const isAvailable = this.checkTeacherChatTime()
          if (!isAvailable && this.isUseChat && this.currentRoomName != '알수없음') {
            this.confirmChatTime()
          }
          await this.validateVoteData()
          this.ready = true;
        }
        setTimeout(function () {
          (document.querySelector('li.position-room.selected') || {click: () => {}}).click();
        }, 100);
      }
    },
    isReadOnlyMember: {
      handler: function (newVal) {
        if (newVal) {
          this.setTempChatMessages({
            roomId: this.roomId,
            message: this.$refs.message.innerText
          })
          this.$refs.message.innerText = '';
        }
      }
    },
    messageArrayList: {
      handler: async function (newVal, oldVal) {
        if (newVal.length > 0 && oldVal.length > 0) {
          let newLastMessage = newVal[newVal.length - 1]
          let oldLastMessage = oldVal[oldVal.length - 1]

          if(!this.isScrollBottom && newLastMessage.currentId !== oldLastMessage.currentId) {
            if(newLastMessage.sender === this.user.currentId) {
              await this.$nextTick()
              this.scrollToBottom()
            }
            this.setIsNewLastMessageFlag(true)
          }
        }
        if (this.isScrollBottom) this.lazyScrollToBottom(1)
      }
    },
    isScrolledBottom: {
      handler: function (newVal) {
        if (newVal) {
          this.clearNewLastMessageList()
        }
      }
    },
    connectRoomItem: {
      deep: true,
      handler: async function (newVal, oldVal) {
        this.ready = false;
        if (newVal && oldVal && this.roomId) {
          setTimeout(() => {
            this.initChatInputHeight()
          }, 200)
          this.showVotePortal = false;
          this.resetUnintendedScrollObserver();
          this.setRoomReservationCount();
          this.hideStickerMessageBox();
          this.setSelectedStickerItem({});
          this.hideRoomSettingLayout();
          this.hideConfirmLayout();
          this.preventScrollEventFlag = false;
          this.$refs.message.innerText = this.isReadOnlyMember ? "" : this.tempChatMessages[this.roomId] || "";
          if (this.messageListPageIndex === 0) {
            const messageList = await this.callMessageList();
            const isTeacher = this.checkPermitSaveMessage()
            if(!isTeacher && newVal.roomType === 'GROUP' && messageList.length === 0) {
              this.$hiClass.alert("유효하지 않은 방입니다.", 'warning');
              this.callChatRooms()
            }
          } else {
            this.setMessageListPageIndex(0);
          }
        }
        await this.$nextTick();
        this.initChatInputHeight();
        this.scrollToBottom();
        this.processSendingReadMulti();
      },
      immediate: true
    },
    'selectedStickerItem.currentId': {
      handler: function () {
        const chatArea = this.getInitializedChatArea()
        chatArea.init();
      }
    },
    currentRoomReservationCount: {
      handler: function () {
        setTimeout(() => {
          this.initChatInputHeight()
        }, 0)
      }
    }
  },
  methods:{
    ...mapMutations(['setIsDimLoading']),
    ...mapMutations('storeHitalk',[
      'hideStickerMessageBox',
      'hideRoomSettingLayout',
      'hideConfirmLayout',
      'setSelectedStickerItem',
      'setMessageListPageIndex',
      'setTempChatMessages',
      'setRoomListPageIndex',
      'hideChatLayout',
      'showRoomSettingLayout',
      'setIsScrolledBottom',
      'setIsNewLastMessageFlag',
      'clearNewLastMessageList',
      'setTabReservation',
      'setPersonGroupPopupIsOpen',
      'setCurrentRoomReservationCount',
      'setSendMessageItem',
      'patchConnectRoomItem',
      'setTabVote'
    ]),
    ...mapActions(['increaseFileUploadCount']),
    ...mapActions('storeHitalk',[
      'callMessageList',
      'sendStompChatMessage',
      "callChatMessageDownloadSecure",
      'getReservationCount',
      'callUserTime',
      'sendStompReadMultiMessage',
      'sendStompPersonalMessageFiles',
      'callChatRooms',
      'callRoomDetail',
      'fetchReadMultiConnectRoomAndCurrentUser',
      'patchLimitTimestamp'
    ]),
    ...mapActions('storeImageEditor', ['openImageEditorAndWait']),
    scrollToElement(id) {
      const index = this.messageArrayList.findIndex(o => o.currentId === id)

      if(index === 0 || this.isNewPersonRoom) return
      setTimeout(() => {
        if(index === this.messageArrayList.length -1) {
          this.scrollToBottom()
        }
      }, 300)
    },
    openConfirmDialolg(action, files = [], uploadFileInfo) {
      let title = ''
      switch (action) {
        case 'read' :
          title = '대화방의 모든 메시지를\n읽음 처리 하시겠습니까?'
          break;
        case 'image' :
          title = `사진 ${files.length}개를 전송하시겠습니까?`
          break;
        case 'paste' :
          title = '클립보드 전송하기'
          break;
        case 'video' :
          title = '동영상을 전송하시겠습니까?'
          break;
        case 'doc' :
          title = '파일을 전송하시겠습니까?'
          break;
      }
      const description = ''
      const modal = {
        title,
        description,
        isShow: true,
        action,
        files: files,
        paste: action === 'paste' ? uploadFileInfo : null
      }
      this.confirmDialog = {...modal}
    },
    async closeConfirmDialog(isConfirm) {
      if(!isConfirm) {
        if (this.confirmDialog.action === 'paste') {
          await this.$hiClass.multipart.delete(this.confirmDialog.paste.files[0])
        }
        this.confirmDialog = {
          isShow: false,
          title: '',
          description: '',
          action: '',
          files: [],
          paste: null
        }
        this.isDragging = false
        return false
      }

      this.confirmDialog.isShow = false
      switch(this.confirmDialog.action) {
        case 'read' :
          this.sendStompReadMultiMessage({message: this.messageArrayList.filter(o => o.id).slice(-1).shift()})
          break;
        case 'image' :
          this.sendStompPersonalMessageFiles(await this.uploadFiles(this.confirmDialog.files, 'image'))
          break;
        case 'paste' :
          this.sendStompPersonalMessageFiles(this.confirmDialog.paste)
          break;
        case 'video' :
          this.sendStompPersonalMessageFiles(await this.uploadFiles(this.confirmDialog.files, 'video'))
          break;
        case 'doc' :
          this.sendStompPersonalMessageFiles(await this.uploadFiles(this.confirmDialog.files, 'doc'))
          break;
      }

      this.confirmDialog = {
        isShow: false,
        title: '',
        description: '',
        action: '',
        files: [],
        paste: null
      }
      this.scrollToBottom()
    },
    closeConfirmDialogNoAction() {
      this.confirmDialog.isShow = false
    },
    isMyMessage: function(messageSenderId){
      return messageSenderId === localStorage.uuid;
    },
    isShowMessageDate: function(index){
      if (index === 0 && (this.isLastMessagePageIndex || this.messageArrayList.length < 20)) return true;
      if (index < 1 || this.messageArrayList.length < 2) return false;
      const timestampOf = m => m.insertedTimestamp || m.timestamp;
      if (!timestampOf(this.messageArrayList[index])) return false;
      const messageDateOf = m => this.$comn.convertTimestamp2DateByFormat(timestampOf(m), "-", "ko");
      let currentMessageDate = messageDateOf(this.messageArrayList[index]);
      let previousMessageDate = messageDateOf(this.messageArrayList[index-1]);
      if(currentMessageDate !== previousMessageDate) return currentMessageDate;
      return false;
    },
    deleteStickerItem: function () {
      this.setSelectedStickerItem({});
    },
    processDownButton() {
      const textH = 25;
      const y = this.$refs.messageArea.scrollTop
      const maxScroll = this.$refs.messageArea.scrollHeight - this.$refs.messageArea.clientHeight
      if(y >= maxScroll - (textH * 2)) {
        this.showScrollBottomBtn = false
      } else {
        this.showScrollBottomBtn = true
      }
    },
    onScroll(preventScrollEventFlag) {
      this.isScrollBottom
        = Math.floor(this.$refs.messageArea.scrollTop) + 1 >= Math.floor(this.$refs.messageArea.scrollHeight - this.$refs.messageArea.clientHeight);

      // 스크롤 최하단에 있는 상태에서 새메시지가 오면
      if (this.isScrollBottom && this.isNewLastMessageFlag) {
        this.scrollDownWithHideFloatingMsg(false)
      }

      this.processDownButton()

      if (!preventScrollEventFlag) {
        this.preventScrollEventFlag = true;
        return;
      }
      if (this.$refs.messageArea.scrollTop > 10) return;
      if (this.isLastMessagePageIndex) return;
      this.loadNextMessageList();
    },
    onKeyUp() {
      if (this.$refs.message.innerText.length > 3000) {
        this.$refs.message.innerText = this.$refs.message.innerText.substring(0, 3000);
        this.$refs.message.blur();
        this.$hiClass.alert("3000자 이하로만 전송가능합니다.")
      }
      this.setTempChatMessages({
        roomId: this.roomId,
        message: this.$refs.message.innerText
      })
    },
    onKeyPress(event) {
      if (event.keyCode === 13) {
        if (!event.shiftKey) {
          event.preventDefault();
          this.sendMessage();
        }
      }
    },
    base64toFile(dataurl, filename) {
      let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[arr.length - 1]),
        n = bstr.length,
        u8arr = new Uint8Array(n)
      while(n--){
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], filename, {type:mime});
    },
    async _externalImageUpload(imgSrc) {
      const roomId = this.connectRoomItem.roomId
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
          roomId,
          files: [
            {
              'fileName' : res.data.filename,
              'fileSize' : res.data.size,
              'fileOriginalPath' : res.data._links.original.href,
              'fileContentType' : fileContentType,
              'fileFlag': 'IMAGE_PACK'
            }
          ]
        }
      } catch (e) {
        this.$log.warn(e)
        throw new Error(e)
      }
    },
    deletetag(input, allow){
      var regExp;
      if(allow.length !=0)
        regExp = "<\\/?(?!(" + allow.join('|') + "))\\b[^>]*>";
      else
        // eslint-disable-next-line no-useless-escape
        regExp = "<\/?[^>]*>";

      return input.replace(new RegExp(regExp, "gi"), "");
    },
    async onPaste(event) {
      event.preventDefault()

      if(this.isReadOnlyMember) return;

      const clipboardData = event.clipboardData || window.clipboardData
      const items = clipboardData.items
      const item = items[0]

      if (item.type.indexOf('image') === 0) {
        const imageFile = item.getAsFile()
        const maxFileSize = this.$store.state.upload.chat.etc.size * 1024 * 1024

        if(imageFile.size > maxFileSize) {
          const fileUploadErrorMessage = this.$t(
            `file.upload.error.size.over.etc`,
            {
              sizeStr: this.$store.state.upload.class.etc.sizeStr
            }
          )
          this.$hiClass.alert(fileUploadErrorMessage)
          return;
        }

        this.openConfirmDialolg('paste', [], await this.uploadFiles([imageFile], 'image'))
      } else if(item.type === 'text/html') {
        // eslint-disable-next-line no-useless-escape
        const regExp = /<img[^>]+src=[\"']?([^>\"']+)[\"']?[^>]*>/g
        const tag = clipboardData.getData('text/html')

        if(tag.indexOf('<img') === -1) return

        const imageResource = regExp.exec(tag)[1]

        let imageFileInfo = []
        if(imageResource.indexOf('http') === -1) {
          imageFileInfo = await this.uploadFiles([this.base64toFile(imageResource, this.$moment().valueOf().toString())], 'image')
        } else {
          imageFileInfo = await this._externalImageUpload(decodeURIComponent(decodeURIComponent(imageResource)))
        }

        if(imageFileInfo.length === 0) return;

        this.openConfirmDialolg('paste', [], imageFileInfo)
      } else {
        const paste = clipboardData.getData('text')
          .replaceAll(/&/g, '&amp;')
          .replaceAll('>', '&gt;')
          .replaceAll('<', '&lt;')
          .replace(/(?:\r\n|\r|\n)/g, '<br />')

        if(paste) {
          window.document.execCommand('insertHTML', true,  this.deletetag(paste, ['br']))
        }
      }
    },
    clearEdit() {
      this.$refs.message.innerHTML = ''
    },
    prefetchTeacherPermission() {
      if (this.connectRoomItem.roomType === 'GROUP') return
      const member = this.otherUser
      if (member?.userType !== 'TEACHER') return
      this._permCheck = this.callUserTime({userId: member.userId, userType: member.userType, memberRole: member.role, isSetUserTime: true})
      this._permCheck.then(res => { this._permResult = res })
    },
    async fileUploadOpen(type) {
      if(this.connectRoomItem.roomType !== 'GROUP') {
        const member = this.otherUser

        if(member.userType === 'TEACHER') {
          let res
          if (this._permResult) {
            res = this._permResult
          } else {
            res = await (this._permCheck || this.callUserTime({userId: member.userId, userType: member.userType, memberRole: member.role, isSetUserTime: true}))
          }
          this._permResult = null
          this._permCheck = null
          if(!res.isUseChat) {
            return false;
          }
        }
      }
      if (this.isReadOnlyMember) return;

      const videoExtensions = '.wmv, .mpg, .webm .ogv, .mov, .mpeg, .mp4, .m4v, .avi'
      this.selectedUploadType = type
      this.$refs.file.multiple = type === 'image'
      this.$refs.file.accept = type !== 'video' ? `${type}/*` : videoExtensions
      this.$refs.file.click();
    },
    async getConvertImageFiles(files) {
      return await Promise.all(
        files.map(file => {
          return this.$hiClass.getConvertedFile(file)
        })
      )
    },
    async uploadFiles(files, fileType) {
      const isNotAllowExtensions = this.$store.state.isNotAllowExtensions
      if(files.some(f => isNotAllowExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))) {
        this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
        this.$refs.file.value = '';
        this.isDragging = false
        return;
      }
      const roomId = this.connectRoomItem.roomId
      const uploadFileList = fileType === 'image' ? await this.getConvertImageFiles(files) : files
      this.progress.total = files.length
      this.showLoading()
      const responses = await Promise.all(uploadFileList.map(async (file, i) => {
        if (file.type.indexOf('video') >= 0)
          await tmpVideoThumbnailManager.addThumbnailOfVideoFile(roomId, file)
        return this.$hiClass.multipart.upload(file, {
          onUploadProgress: progressEvent => {
            if (progressEvent.loaded === progressEvent.total) {
              this.progress.current++
            }

            this.progress.files[`file${i}`] = (progressEvent.loaded * 100) / progressEvent.total

            let totalPercent = this.progress.files
              ? Object.values(this.progress.files).reduce(
                  (sum, num) => sum + num,
                  0
                )
              : 0
            this.progress.percent = parseInt(
              Math.round(totalPercent / this.progress.total)
            )
          }
        })
      }))
      this.hideLoading()
      let uploadFileInfomation = []

      if(fileType === 'image') {
        uploadFileInfomation = responses.map(res => {
          const item = res.data
          return {
            fileName: item.filename.replace(/^.*[\\/]/, ''),
            fileSize: item.size,
            fileOriginalPath: item._links.original.href,
            fileContentType: item.contentType,
            fileConvertPath: item._links.convert && item._links.convert.href ? item._links.convert.href : null,
            fileFlag: 'IMAGE_PACK'
          }
        })
      } else if(fileType === 'video') {
        uploadFileInfomation = responses.map(res => {
          const item = res.data
          return {
            fileName: item.filename.replace(/^.*[\\/]/, ''),
            fileSize: item.size,
            fileOriginalPath: item._links.original.href,
            fileContentType: item.contentType,
            fileConvertPath: item._links.convert && item._links.convert.href ? item._links.convert.href : '',
          }
        })
      } else {
        uploadFileInfomation = responses.map(res => {
          const item = res.data
          return {
            fileName: item.filename.replace(/^.*[\\/]/, ''),
            fileSize: item.size,
            fileOriginalPath: item._links.original.href,
            fileContentType: item.contentType,
            fileConvertPath: item._links.convert && item._links.convert.href ? item._links.convert.href : null,
            fileThumbnailPath: item._links.thumbnail && item._links.thumbnail.href ? item._links.thumbnail.href : null
          }
        })
      }
      this.isDragging = false
      this.increaseFileUploadCount({ uploadLocation: this.CONSTANTS.UPLOAD_LOCATION.HITALK })
      return {
        roomId,
        files: uploadFileInfomation
      }
    },
    onDragEnter (event) {
      event.preventDefault()
      event.stopPropagation()
      this.isDragging = true
    },
    onDragLeave (event) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = false
    },
    onDragover (event) {
      event.preventDefault()
      if (event.dataTransfer.files) {
        this.isDragging = true
      }
    },
    async onDrop (event) {
      event.preventDefault()
      event.stopPropagation()

      if(this.isReadOnlyMember) {
        this.isDragging = false
        return false;
      }

      const files = []

      this.isDimLoading = true;
      for (const file of Array.from(event.dataTransfer.files)) {
        // file HEIC 체크 및 Jpeg 변환
        files.push(await checkAndConvertHEIC(file))
      }
      this.isDimLoading = false;

      if(files.length === 0) {
        this.isDragging = false
        return false;
      }

      //const videoExtensions = this.$store.state.videoExtensions;
      const videoExtensions = ['wmv', 'mpg', 'webm', 'ogv', 'mov', 'mpeg', 'mp4', 'm4v', 'avi']
      const imageExtensions = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'bmp', 'heic']
      const acceptExtension = ['pdf', 'hwp', 'hwpx', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

      const isImage = files.every(f => f.type.startsWith('image'))
      const isVideo = files.every(f => f.type.startsWith('video'))
      const isText = files.every(f => f.type.startsWith('text'))
      const isAudio = files.every(f => f.type.startsWith('audio'))
      const isApplication = files.every(f => f.type.startsWith('application') || acceptExtension.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()));
      const isExtensions = files.every(f => f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase())
      const maxFileSize = this.$store.state.upload.chat[isVideo ? 'video' : 'etc'].size * 1024 * 1024

      if(!isImage && !isVideo && !isText && !isAudio && !isApplication) {
        this.$hiClass.alert('이미지/영상/문서 중 1개의 유형만 전송이 가능합니다.')
        this.isDragging = false
        return;
      }

      if(isImage) {
        // 이미지 파일 업로드
        const isImageExtensions = files.every(f => imageExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))

        if(files.length > 30) {
          this.$hiClass.alert('최대 30장까지 첨부 가능합니다.')
          this.isDragging = false
          return;
        }

        if(!isImage || !isExtensions || !isImageExtensions) {
          this.$hiClass.alert(this.$t("chat.upload.invalid.alert"))
          this.isDragging = false
          return;
        }

        if(files.filter(f => f.size > maxFileSize).length > 0) {
          const fileUploadErrorMessage = this.$t(
            `file.upload.error.size.over.etc`,
            {
              sizeStr: this.$store.state.upload.class.etc.sizeStr
            }
          )
          this.$hiClass.alert(fileUploadErrorMessage)
          this.isDragging = false
          return;
        }
        // this.openConfirmDialolg('image', files)
        await this.editImages(files)
      } else if(isVideo) {
        if(files.length > 1) {
          this.$hiClass.alert('동영상은 1개만 첨부 가능합니다.')
          this.isDragging = false
          return;
        }

        const isVideoExtensions = files.every(f => videoExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))

        if(!isVideo || !isExtensions || !isVideoExtensions) {
          this.$hiClass.alert(this.$t("chat.upload.invalid.alert"))
          this.isDragging = false
          return;
        }

        if(files.filter(f => f.size > maxFileSize).length > 0) {
          const fileUploadErrorMessage = this.$t(
            `file.upload.error.size.over.video`,
            {
              sizeStr: this.$store.state.upload.class.video.sizeStr
            }
          )
          this.$hiClass.alert(fileUploadErrorMessage)
          this.isDragging = false
          return;
        }
        this.openConfirmDialolg('video', files)
      } else {
        if(files.length > 1) {
          this.$hiClass.alert('문서는 1개만 첨부 가능합니다.')
          this.isDragging = false
          return;
        }

        const isFileExtensions = files.every(f => acceptExtension.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))
        if (!(isText || isApplication || isAudio)) {
          if(!isFileExtensions || !isExtensions) {
            this.$hiClass.alert(this.$t("chat.upload.invalid.alert"))
            this.isDragging = false
            return;
          }
        }

        if(files.filter(f => f.size > maxFileSize).length > 0) {
          const fileUploadErrorMessage = this.$t(
            `file.upload.error.size.over.etc`,
            {
              sizeStr: this.$store.state.upload.class.etc.sizeStr
            }
          )
          this.$hiClass.alert(fileUploadErrorMessage)
          this.isDragging = false
          return;
        }

        if (files[0].name.substring(files[0].name.lastIndexOf('.') + 1, files[0].name.length).toLowerCase() === 'pdf') {
          // 어자피 하나밖에 안들어옴
          const message = await validatePDF(files[0])
          if (message === 'ERROR-2') {
            this.$hiClass.alert('손상된 PDF 파일입니다. 확인 후 다시 업로드 해 주세요.')
            this.isDragging = false
            return;
          }
        }

        this.openConfirmDialolg('doc', files)
      }
    },
    async handleFileUpload(roomId = this.connectRoomItem.roomId) {
      const files = []
      this.isDimLoading = true;
      for (const file of Array.from(this.$refs.file.files)) {
        // heic 체크하여 jpeg 변환
        files.push(await checkAndConvertHEIC(file))
      }
      this.isDimLoading = false;
      this.$refs.file.value = '';
      const videoExtensions = this.$store.state.videoExtensions;
      const imageExtensions = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'bmp']
      const acceptExtension = ['pdf', 'hwp', 'hwpx', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

      const isImage = files.every(f => f.type.startsWith('image'))
      const isVideo = files.every(f => f.type.startsWith('video'))
      const isText = files.every(f => f.type.startsWith('text'))
      const isAudio = files.every(f => f.type.startsWith('audio'))
      const isApplication = files.every(f => f.type.startsWith('application'))
      const isExtensions = files.every(f => f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase())
      const maxFileSize = this.$store.state.upload.chat[isVideo ? 'video' : 'etc'].size * 1024 * 1024

      // 이미지 업로드 일 경우
      if(this.selectedUploadType === 'image') {
        const isImageExtensions = files.every(f => imageExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))

        if(files.length > 30) {
          this.$hiClass.alert('최대 30장까지 첨부 가능합니다.')
          this.isDragging = false
          return;
        }

        if(!isImage || !isExtensions || !isImageExtensions) {
          this.$hiClass.alert(this.$t("chat.upload.invalid.alert"))
          this.isDragging = false
          return;
        }

        if(files.filter(f => f.size > maxFileSize).length > 0) {
          const fileUploadErrorMessage = this.$t(
            `file.upload.error.size.over.etc`,
            {
              sizeStr: this.$store.state.upload.class.etc.sizeStr
            }
          )
          this.$hiClass.alert(fileUploadErrorMessage)
          this.isDragging = false
          return;
        }
        await this.editImages(files)

        // this.sendStompPersonalMessageFiles(await this.uploadFiles(files, 'image'))
        //this.openConfirmDialolg('image', files)
      } else if (this.selectedUploadType === 'video') {
        const isVideoExtensions = files.every(f => videoExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))

        if(!isVideo || !isExtensions || !isVideoExtensions) {
          this.$hiClass.alert(this.$t("chat.upload.invalid.alert"))
          this.isDragging = false
          return;
        }

        if(files.filter(f => f.size > maxFileSize).length > 0) {
          const fileUploadErrorMessage = this.$t(
            `file.upload.error.size.over.video`,
            {
              sizeStr: this.$store.state.upload.class.video.sizeStr
            }
          )
          this.$hiClass.alert(fileUploadErrorMessage)
          this.isDragging = false
          return;
        }
        this.sendStompPersonalMessageFiles(await this.uploadFiles(files, 'video'))
        //this.openConfirmDialolg('video', files)
      } else {
        const isFileExtensions = files.every(f => acceptExtension.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))
        if (!(isText || isApplication || isAudio)) {
          if(!isFileExtensions || !isExtensions) {
            this.$hiClass.alert(this.$t("chat.upload.invalid.alert"))
            this.isDragging = false
            return;
          }
        }

        const pdfFiles = files.filter(f => (f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase() === 'pdf'))

        if (pdfFiles.length > 0) {
          for (const file of pdfFiles) {
            const message = await validatePDF(file)
            if (message === 'ERROR-2') {
              this.$hiClass.alert('손상된 PDF 파일입니다. 확인 후 다시 업로드 해 주세요.')
              return;
            }
          }
        }

        if(files.filter(f => f.size > maxFileSize).length > 0) {
          const fileUploadErrorMessage = this.$t(
            `file.upload.error.size.over.etc`,
            {
              sizeStr: this.$store.state.upload.class.etc.sizeStr
            }
          )
          this.$hiClass.alert(fileUploadErrorMessage)
          this.isDragging = false
          return;
        }
        this.sendStompPersonalMessageFiles(await this.uploadFiles(files, 'doc'))
        //this.openConfirmDialolg('doc', files)
      }
      this.lazyScrollToBottom();
    },
    async checkExpiration() {
      if (this.connectRoomItem.groupType !== 'LIMIT'
        || this.connectRoomItem.limitTimestamp > new Date().getTime()
      ) return false;
      const ensureExpiration = () => new Promise(resolve => {
        this.callRoomDetail(this.connectRoomItem.roomId).then(() =>
          resolve(this.connectRoomItem.limitTimestamp > new Date().getTime()));
      })
      if (await ensureExpiration()) return false;
      this.$hiClass.alert("채팅방 기간이 종료되었습니다.", 'warning');
      if (!this.currentRoomMaster || this.currentRoomMaster.userId !== localStorage.uuid) {
        this.hideChatLayout();
      } else {
        this.$refs.message.innerText = '';
        this.patchConnectRoomItem({isEnding: true})
      }
      return true;
    },
    filterHighFreq() {
      const now = new Date().getTime();
      if (this.lastSentMessage > 0 && this.lastSentMessage + THRESHOLDS_TERM > now) {
        return true;
      }
      this.lastSentMessage = now;
      return false;
    },
    async sendMessage() {
      if (this.filterHighFreq()) return;
      if (await this.checkExpiration()) return;
      if (this.$refs.message.innerText.length > 3000) {
        this.$hiClass.alert("3000자 이하로만 전송가능합니다.")
        return;
      }
      this.sendStompChatMessage({
        message: this.$refs.message.innerText,
        roomItem: this.connectRoomItem,
        messageRef: this.$refs.message,
      });
      this.$nextTick(() => {
        // 메시지 전송 완료 시 현재 메시지 초기화
        // this.$refs.message.innerText = '';
        this.hideStickerMessageBox();
        this.$refs.message.focus();
      });
      this.setRoomListPageIndex(0);
      this.scrollToBottom();
      await this.$nextTick();
      this.getInitializedChatArea().init();
    },
    // 플로팅메시지 가리기 + 스크롤 내리기
    scrollDownWithHideFloatingMsg(flag) {
      this.setMessageListPageIndex(0);
      this.setIsNewLastMessageFlag(flag)
      if (flag) this.scrollToBottom()
    },
    lazyScrollToBottom(delay) {
      setTimeout(() => this.scrollToBottom(), delay || 300)
    },
    scrollToBottom() {
      this.$refs.messageArea.scrollTop = this.$refs.messageArea.scrollHeight;
    },
    getInitializedChatArea() {
      // 채팅 입력영역 자동 높이 조절
      let chatListWrap = document.getElementsByClassName('chatting-list-wrap')[0];
      let chatInputWrap = document.getElementsByClassName('chatting-input-wrap')[0];
      let chatTopWrapH =  document.getElementsByClassName('chatting-top-wrap')[0].clientHeight;
      let textH = 25;
      let maxRows = textH * 10;

      const that = this;
      let chatArea = {
        init: function () {
          /* textarea max height value */
          document.getElementsByClassName('textarea-wrap')[0].style.maxHeight = maxRows + 'px';

          chatArea.addResizingEventListener();
        },
        addResizingEventListener: function () {
          setTimeout(function () {
            chatListWrap.style.height = document.getElementsByClassName('tab-nav-wrap')[0].clientHeight - (chatInputWrap.clientHeight + chatTopWrapH) + 'px';
          }, 0);

          chatArea.detectScrollToBottom(); // 스크롤이 최하단에 위치해있는 동시에 textarea 리사이징이 될 때 스크롤 하단으로 이동
        },
        detectScrollToBottom : function() {
          if (!$('.chatting-list-wrap .scroll-scrolly_visible').length > 0) return;
          let messageArea = chatListWrap.getElementsByClassName('scroll-scrolly_visible')[0];
          let scrollBottom = messageArea.scrollHeight - messageArea.clientHeight;
          let currentScroll = messageArea.scrollTop;

          setTimeout(function () {
            if (currentScroll >= scrollBottom - textH) {
              that.scrollToBottom();
            }
          }, 300);
        }
      }

      return chatArea
    },
    checkPermitSaveMessage() {
      const me = this.connectRoomMembers.find(m => m.userId === localStorage.uuid)
      if(!me) {
        return false
      }
      return ['OWNER', 'MANAGER'].includes(me.role)
    },

    async reservationMessage() {
    console.log('reservationMessage, ', this.isBlockedInChatRoom, this.isExpiredLimitGroupRoom, this.connectRoomItem.roomType, this.otherUser.userType)
      if (this.isBlockedInChatRoom) return;
      if (this.isExpiredLimitGroupRoom) return false;
      if(this.connectRoomItem.roomType !== 'GROUP') {
        if(this.otherUser.userType === 'TEACHER') {
          const res = await this.callUserTime({userId: this.otherUser.userId, userType: this.otherUser.userType, memberRole: this.otherUser.role, isSetUserTime: true})
          if(!res.isUseChat) {
            return false;
          }
        }
      }

      const targetArr = this.isGroupRoom
        ? Object.keys(this.connectCurRoomMembers)
        : Object.keys(this.connectCurRoomMembers)
            .filter(invitedMember => invitedMember !== this.user.currentId)

      const sendMessageItem = {
        roomId: this.roomId,
        roomType: this.connectRoomItem.roomType,
        classId: this.connectRoomItem.classId,
        sendType: 'RESERVATION',
        mode: 'CREATE',
        targets: targetArr,
        roomName: this.currentRoomName,
        roomClassName: this.currentRoomClassName
      }

      this.setSendMessageItem(sendMessageItem)
      this.setPersonGroupPopupIsOpen({isOpen: true, from: 'CHAT'})
    },

    setRoomReservationCount() {
      this.getReservationCount({
        userId: this.user.currentId,
        roomId: this.roomId
      })
          .then(res => {
            this.setCurrentRoomReservationCount(res.data.count)
          })
    },

    syncUserTime() {
      const userId = Object.keys(this.roomMembers).find(chatMemberUserId => {
        return chatMemberUserId !== this.user.currentId
      })
      return this.callUserTime({userId, userType: 'TEACHER', memberRole:'OWNER', isSetUserTime:true})
    },

    /**
     * 선생님 상담시간 체크
     * @returns {boolean}
     */
    checkTeacherChatTime() {

      if(this.currentRoomName === '알수없음'){
        return '';
      }

      if (this.isGroupRoom) {
        return true
      }

      const userId = Object.keys(this.connectCurRoomMembers).find(chatMemberUserId => {
        return chatMemberUserId !== this.user.currentId
      })
      if (this.connectCurRoomMembers[userId] && this.connectCurRoomMembers[userId].userType !== 'TEACHER') {
        return true
      }

      if(this.userTime && this.userTime.userChatDay ){
        return checkTeacherChatTime(false, this.userTime)
      }else{
        return '';
      }
    },

    /**
     * 상담시간 알럿
     */
    confirmChatTime() {
      const msg = `지금은 상담 가능 시간이 아니므로<br>선생님께서 메시지 확인이 어렵습니다.`
      const opts = {
        cancelButtonText: '확인',
        confirmButtonText: '예약 메시지 발송',
        reverseButtons: true
      }

      this.$hiClass.confirm(msg, '', opts)
        .then(() => { // 예약 메시지 발송
          this.reservationMessage()
        })
        .catch(() => {}) // 확인
    },

    /**
     * 대화 스크롤영역 계산
     */
    initChatInputHeight() {
      let chatListWrap = document.getElementsByClassName('chatting-list-wrap')[0] // 대화내용 스크롤영역
      let chatInputWrap = document.getElementsByClassName('chatting-input-wrap')[0] // 하단 채팅 입력 영역
      let chatTopWrapH =  document.getElementsByClassName('chatting-top-wrap')[0].clientHeight // 상단 대화방 정보 영역
      let tabBarHeight = document.getElementsByClassName('tab-nav-wrap')[0].clientHeight // 하이톡 탭 영역

      chatListWrap.style.height = `${tabBarHeight - (chatInputWrap.clientHeight + chatTopWrapH)}px`;
    },

    async editImages(files) {
      if (this.isDragging) {
        this.isDragging = false
      }

      const uploadFileList = await this.openImageEditorAndWait({
        uploadedFiles: null,
        inputFiles: files,
        imageLimitCount: 30,
        componentKey: 'hitalk-chat-layout',
        targetIdx: 0,
        parentComponent: 'hitalkChatLayout'
      })
      if (uploadFileList.length === 0) {
        return;
      }
      await this.sendStompPersonalMessageFiles(await this.uploadFiles(uploadFileList.map(uploadFile => uploadFile.file), 'image'))
      this.lazyScrollToBottom();

    },
    async loadNextMessageList() {
      if (this.loadingNextMessageList) {
        return
      }
      this.loadingNextMessageList = true;
      let beforeScrollHeightMinusTop
          = this.$refs.messageArea.scrollHeight - this.$refs.messageArea.scrollTop;

      this.setMessageListPageIndex(this.messageListPageIndex + 1);
      await this.callMessageList();

      this.$refs.messageArea.scrollTop
          = this.$refs.messageArea.scrollHeight - beforeScrollHeightMinusTop;
      this.loadingNextMessageList = false;
    },
    setScrollHeightObserver() {
      const observer = new UnintendedScrollObserver(this.$refs.messageArea, () => {
        this.scrollToBottom();
      });

      this.$once('hook:beforeDestroy', () => {
        observer.disconnect();
      });

      this.unintendedScrollObserver = observer;
    },
    resetUnintendedScrollObserver() {
      if (this.unintendedScrollObserver) {
        this.unintendedScrollObserver.resetScrollCount();
      }
    },
    processSendingReadMulti () {
      if (this.isClassMember || checkTeacherChatTime(false, this.userTimeForNotification)) {
        this.fetchReadMultiConnectRoomAndCurrentUser()
      }
    },
    handleVisibilityChange() {
      if (!document.hidden) {
        this.processSendingReadMulti()
      }
    },
    showLoading() { this.setIsDimLoading(true) },
    hideLoading() { this.setIsDimLoading(false) },
    onClickBtnVote() {
      if (this.isExpiredLimitGroupRoom) return;
      eventBus.$emit('openVoteEditor', {roomId: this.roomId, roomType: this.connectRoomItem.roomType})
    },
    async openVote(messageId) {
      if (typeof messageId !== 'string') {
        this.browserCheckAndUpdateAlert(81)
        this.setTabVote();
        return
      }
      this.selectedVoteMessageId = messageId
      this.showVotePortal = true
      await this.$nextTick()
      await this.$comn.asyncWaitFor(() =>
        document.querySelector('hitalk-vote-portal')
      )
      document.querySelector('hitalk-vote-portal > div').style.zIndex = 1000
    },
    onChangeVote({detail}) {
      if (!this.selectedVoteMessageId) return;
      eventBus.$emit('onChangeVotePortal', {
        detail,
        onCompleted: () => {
          this.selectedVoteMessageId = null
          this.showVotePortal = false
        }
      })
    },
    onCloseVote() {
      this.showVotePortal = false
      this.refreshVoteFloat()
    },
    async refreshVoteFloat() {
      this.showVoteFloat = false
      await this.$nextTick()
      this.showVoteFloat = true
    },
    async validateVoteData() {
      if (!this.isExpiredLimitGroupRoom || !this.connectRoomItem.isVote) return;
      await this.$axios.delete(`/hitalks/${this.roomId}/votes`)
      this.patchConnectRoomItem({isVote: false})
    },
    onClickDownloadMessageFile() {
      this.isPasswordConfirmModalOpen = true;
    },
    onConfirmPassword() {
      this.onClickDownloadMessageFileConfirm(this.password);
    },
    onCopyPassword() {
      navigator.clipboard.writeText(this.password).then(() => {
        this.$toasted.show('비밀번호가 복사되었습니다.');
      });
    },
    async onClickDownloadMessageFileConfirm(password) {
      this.isDimLoading = true;
      try {
        this.onCopyPassword();
        await this.callChatMessageDownloadSecure(password);
      } catch(error) {
        this.$hiClass.alert("다운로드에 실패하였습니다.<br>다시 시도해주세요.")
      } finally {
        this.isDimLoading = false;
        this.isPasswordConfirmModalOpen = false;
      }
    },
    openClassRoomReport(payload) {
        this.$emit('openClassRoomReport', payload);
    },
  },
  created() {
    remoteConfig.fetchAndActivate()
  },
  async mounted() {
    const textH = 25;
    const chatArea = this.getInitializedChatArea()
    chatArea.init();

    let textarea = document.getElementsByClassName('text-input-area')[0];

    textarea.addEventListener('keyup', function () {
      chatArea.addResizingEventListener();
    });

    $(document).on('click', '.attach-file-wrap .delete-btn', chatArea.addResizingEventListener);

    window.addEventListener('resize', function(){
      chatArea.addResizingEventListener();
    });

    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    setTimeout(function () {
      (document.querySelector('li.position-room.selected') || {click: () => {}}).click();
    }, 1200);

    await this.$comn.asyncWaitFor(() =>
      this.$refs.messageArea &&
      this.$refs.messageArea.children.length > 1
    )
    $('.chatting-list-wrap .scrollbar-outer').scrollbar();
    this.scrollToBottom();
    this.setRoomReservationCount()
    this.setScrollHeightObserver()
  },
  beforeDestroy() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}
</script>

<style scoped lang="scss">
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
.add-attach {
  z-index: 1;
  left: calc(15px + 16px);
  bottom: calc(5px + 16px);
  top: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
  button {
    width: 32px;
    height: 32px;
    border: none;
    &.btn-image{
      margin-left: 0;
    }
    &.btn-image i {
      display: inline-block;
      width: 23px;
      height: 23px;
      background: url("~@/assets/img/icon/icons_hitalk.png") 0px -454px/230px auto no-repeat;
      filter: brightness(85%);
    }
    &.btn-video i {
      display: inline-block;
      width: 23px;
      height: 23px;
      background: url("~@/assets/img/icon/icons_hitalk.png") -23px -454px/230px auto no-repeat;
      filter: brightness(85%);
    }
    &.btn-file i {
      display: inline-block;
      width: 23px;
      height: 23px;
      background: url("~@/assets/img/icon/icons_hitalk.png") -46px -454px/230px auto no-repeat;
      filter: brightness(85%);
    }
    &:hover {
      opacity: .6;
    }
    &:hover::before {
      opacity: 1;
    }
    &.dis {
      cursor: default !important;
      opacity: .6 !important;
    }
  }
}

//예약메시지
.add-reservation{
  width: 32px;
  height: 32px;
  .btn-reservation {
    width: 100%;
    height: 100%;
    background: url("~@/assets/img/icon/icons_hitalk.png") -150px -330px/200px auto no-repeat;
    &:hover { opacity: .6; }
  }
}
// 투표하기
.vote-button-wrap {
  width: 32px;
  height: 32px;

  button {
    width: 100%;
    height: 100%;
    background-position: center;
    background-repeat: no-repeat;
    background-size: 100%;
    background-image: url(~@/assets/img/svg/ico-hitalk-vote.svg);
    filter: brightness(0.8) grayscale(1);

    &:hover {
      opacity: .6;
    }
  }
}


.dragging {
  border: solid 2px var(--primary) !important;
  background-color: rgba(229, 236, 250, 0.5) !important;
}
.btn-scrollBottom.hide {
  display: none;
}
.btn-scrollBottom.show {
  display: block;
}


.fade-leave-from {
  opacity: 1;
}
.fade-leave-active {
  transition: all 0.3s;
}
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.chatting-list-wrap {
  position: relative;
}

.chatting-vote-float-wrap {
  position: absolute;
  top: 0px;
  width: 100%;
}

</style>
