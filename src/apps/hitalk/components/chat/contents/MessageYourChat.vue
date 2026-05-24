<!--
@File(Method): MessageYourChat.vue
@Description: 하이톡 > 채팅창 > 상대방 채팅 영역
@Modified: 2025-03-26 - #73287 하이톡 내 플로팅 UI 공통화
-->
<template>
  <div
    @mousedown.right="toggleMoreLayer"
    @contextmenu.prevent
    v-if="!isDeleted"
    class="chatting-bubble-wrap your-chatting"
    :class="{
      'file' : isFileMessage,
      'image' : isImageMessage || isPhotoMultiMessage,
      'video' : isVideoMessage,
      'emoticon' : isStickerMessage,
      'group': isPhotoMultiMessage,
      'share': isShareMessage,
      'vote': isVoteMessage,
    }"
  >
    <div
      v-if="isShowProfile"
      class="chatting-profile-wrap"
    >
      <!-- <div class="profile-thumbnail"
           :style="profileImage"></div> -->
      <div class="profile-thumbnail">
        <img class="profile-image" :src="profileImage" @error="profileImageReplace" alt="" />
      </div>
      <div class="profile-name">{{ contactUserName }}</div>
    </div>
    <div v-if="isChatMessage" class="chatting-bubble" @mouseover="showReactionOpenButton" @mouseleave="hideReactionOpenButton">
      <p v-autolinker:[options]="messageContent"></p>
    </div>
    <div v-if="isStickerMessage" class="chatting-bubble" @mouseover="showReactionOpenButton" @mouseleave="hideReactionOpenButton">
      <p><button><img :src="stickerUrl" alt=""></button></p>
      <p class="msg" v-if="stickerMessage" v-autolinker:[options]="stickerMessage"></p>
    </div>
    <div v-if="isFileMessage" class="chatting-bubble" @mouseover="showReactionOpenButton" @mouseleave="hideReactionOpenButton">
      <button class="message-file" @click="openDocView">
        <span class="name">{{ fileName }}</span>
        <span class="period">유효기간: ~ {{ $moment(message.expiredTimestamp).format('YYYY.M.DD') }}</span>
      </button>
    </div>
    <div v-if="isImageMessage" class="chatting-bubble" @mouseover="showReactionOpenButton" @mouseleave="hideReactionOpenButton" @click="openImageView">
      <p v-if="!isExpired && file.fileOriginalPath">
        <button type="button">
          <img
            :src="file.fileOriginalPath"
            alt=""
            @load="onLoadImage"
          />
        </button>
      </p>
      <div v-else class="cover-empty">
        <div class="expired-img-icon"><span></span></div>
      </div>
    </div>
    <div v-if="isPhotoMultiMessage" class="chatting-bubble" @mouseover="showReactionOpenButton" @mouseleave="hideReactionOpenButton">
      <p>
        <button
          v-for="(file, index) of files"
          :key="`${file.fileOriginalPath}-${index}`"
          type="button"
          @click="openImageViewWithFiles(files, index)"
        >
          <img
            v-if="!isExpired && file.fileOriginalPath"
            :src="file.fileOriginalPath"
            alt=""
            @load="onLoadPhotoMulti(index)"
          />
          <div v-else class="cover-empty">
            <div class="expired-img-icon"><span></span></div>
          </div>
        </button>
      </p>
    </div>
    <div v-if="isVideoMessage" class="chatting-bubble" @click="showVideoFileViewer" @mouseover="showReactionOpenButton" @mouseleave="hideReactionOpenButton">

      <div v-if="thumbnailImagePath === '' || isExpired" class="img-video-view-wrap">
        <div v-if="isExpired" class="cover-empty">
          <div class="expired-video-icon"><span></span></div>
        </div>
        <div v-else ref="thumbnail" class="cover-video">
          <div class="video-icon01"><span></span></div>
        </div>
      </div>
      <div v-else class="img-video-view-wrap">
        <div ref="thumbnail" class="cover-video">
          <div class="video-icon01"><span></span></div>
        </div>
        <div class="img">
          <img
            :src="thumbnailImagePath"
            loading="lazy"
            alt=""
            @load="onLoadImage"
          />
        </div>
      </div>
    </div>

    <message-share v-if="isShareMessage" :share-content="shareContent" @mouseover="showReactionOpenButton" @mouseleave="hideReactionOpenButton" @openClassRoomReport="openClassRoomReport"/>
    <message-vote v-if="isVoteMessage" :message="message" @open="openVote"/>

    <div class="chatting-bubble-etc-wrap" @mouseover="showReactionOpenButton" @mouseleave="hideReactionOpenButton">      
      <!-- <div class="dot-more-btn-wrap" v-if="!isDeleted">
        <div class="more-popup-wrap" :class="{'on' : isShowMoreLayer}" v-click-outside="hideMoreLayer">
          <template v-if="isShowMoreCopyButton">
            <button class="reaction-btn" @click="toggleReactionSelection"><span>반응하기</span></button>
            <button class="copy-btn" @click="copyMessage(message)"><span>복사</span></button>
            <button v-if="isShowReadMoreMenu" class="copy-btn" @click="openConfirmDialolg(message)"><span>읽음 처리</span></button>
          </template>
          <template v-else>
            <button class="reaction-btn" @click="toggleReactionSelection"><span>반응하기</span></button>
            <button v-if="isShowReadMoreMenu" class="copy-btn" @click="openConfirmDialolg"><span>읽음 처리</span></button>
          </template>
          <template v-if="isGroupChatRoom && isTeacher">
            <button class="del-btn" @click="showLayerPopupConfirm('deleteYourMessage')"><span>삭제</span></button>
          </template>
        </div>
      </div> -->
      <div v-if="unReadCount>0 && !isShowReactionOpenButton" :style="isShowMoreLayer ? {display: 'block'} : {}" class="reading-check-wrap">{{ unReadCount }}</div>
      <div v-if="!isHideTime && !isShowReactionOpenButton" :style="isShowMoreLayer ? {display: 'block'} : {}" class="time">{{ $comn.convertTimestamp2HourTime(message.insertedTimestamp) }}</div>
      <button v-if="isShowReactionOpenButton" class="hitalk-reaction-btn" @click="toggleReactionSelection">
        <i class="reaction"></i>
      </button>
      <!-- #73287 플로팅 레이어 공통 css 적용-->
      <div v-if="!isDeleted" class="float-layer-wrap">
        <div class="float-layer" v-click-outside="hideMoreLayer" v-if="isShowMoreLayer">
          <template v-if="isShowMoreCopyButton">
            <button @click="toggleReactionSelection"><span>반응하기</span></button>
            <button @click="copyMessage(message)"><span>복사</span></button>
            <button v-if="isShowReadMoreMenu" @click="openConfirmDialolg(message)"><span>읽음 처리</span></button>
          </template>
          <template v-else>
            <button @click="toggleReactionSelection"><span>반응하기</span></button>
            <button v-if="isShowReadMoreMenu" @click="openConfirmDialolg"><span>읽음 처리</span></button>
          </template>
          <template v-if="isGroupChatRoom && isTeacher && !isVoteMessage">
            <button class="txt-warning" @click="showLayerPopupConfirm('deleteYourMessage')"><span>삭제</span></button>
          </template>
        </div>
      </div>
    </div>
    <div class="hitalk-reaction-wrap other-user">
      <span 
        v-for="(reaction, index) of message.reactions" 
        :key="index"
        :class="{selected: reaction.isReaction}"
        @click="sendReactionMessage(reaction.iconId.charAt(reaction.iconId.length - 1))"
      >
        <i :class="getIcon(reaction.iconId)"></i>{{ reaction.count }}
      </span>
      <span v-if="message.reactions" @click="openReactionListModal"><i class="reaction-user"></i></span>
      <div class="reaction-select-wrap other-user" v-if="isOpenReactionSelection" v-click-outside="hideReactionSelection">
        <div class="reaction-select">
          <span :class="{my: checkReaction ? checkReaction.isReaction : false}" @click="sendReactionMessage('1')">
            <lottie :options="reactionAnimationDataCheck" :width="36" :height="36" />
          </span>
          <span :class="{my: okReaction ? okReaction.isReaction : false}" @click="sendReactionMessage('2')">
            <lottie :options="reactionAnimationDataOk" :width="36" :height="36" />
          </span>
          <span :class="{my: noReaction ? noReaction.isReaction : false}" @click="sendReactionMessage('3')">
            <lottie :options="reactionAnimationDataNo" :width="36" :height="36" />
          </span>
          <span :class="{my: likeReaction ? likeReaction.isReaction : false}" @click="sendReactionMessage('4')">
            <lottie :options="reactionAnimationDataLike" :width="36" :height="36" />
          </span>
          <span :class="{my: heartReaction ? heartReaction.isReaction : false}" @click="sendReactionMessage('5')">
            <lottie :options="reactionAnimationDataHeart" :width="36" :height="36" />
          </span>
          <span :class="{my: joyReaction ? joyReaction.isReaction : false}" @click="sendReactionMessage('6')">
            <lottie :options="reactionAnimationDataJoy" :width="36" :height="36" />
          </span>
          <span :class="{my: sadReaction ? sadReaction.isReaction : false}" @click="sendReactionMessage('7')">
            <lottie :options="reactionAnimationDataSad" :width="36" :height="36" />
          </span>
          <span :class="{my: surpriseReaction ? surpriseReaction.isReaction : false}" @click="sendReactionMessage('8')">
            <lottie :options="reactionAnimationDataSurprise" :width="36" :height="36" />
          </span>
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    class="chatting-bubble-wrap your-chatting"
  >
    <div
      v-if="isShowProfile"
      class="chatting-profile-wrap"
    >
      <!-- <div class="profile-thumbnail"
           :style="profileImage"></div> -->
      <div class="profile-thumbnail">
        <img :src="profileImage" @error="profileImageReplace" alt="" />
      </div>
      <div class="profile-name">{{ contactUserName }}</div>
    </div>
    <div class="chatting-bubble">
      <p class="msg-del">삭제된 메시지 입니다.</p>
    </div>
    <div class="chatting-bubble-etc-wrap">
      <div v-if="unReadCount>0" class="reading-check-wrap check" style="display: block;">{{ unReadCount }}</div>
      <div v-if="!isHideTime" class="time" style="display: block;">{{ $comn.convertTimestamp2HourTime(message.insertedTimestamp) }}</div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {MessageStatus, URLProps} from "@/enums";
import MessageShare from "@/apps/hitalk/components/chat/contents/MessageShare";
import MessageVote from "@/apps/hitalk/components/chat/contents/MessageVote";
import Lottie from "@/components/Lottie/Lottie";
import reactionAnimationDataCheck from '@/assets/img/icon/check.json';
import reactionAnimationDataOk from '@/assets/img/icon/okHitalk.json';
import reactionAnimationDataNo from '@/assets/img/icon/noHitalk.json';
import reactionAnimationDataLike from '@/assets/img/icon/likeHitalk.json';
import reactionAnimationDataHeart from '@/assets/img/icon/heartHitalk.json';
import reactionAnimationDataJoy from '@/assets/img/icon/joy.json';
import reactionAnimationDataSad from '@/assets/img/icon/sad.json';
import reactionAnimationDataSurprise from '@/assets/img/icon/surprise.json';
import { unreadCountOf, useTmpVideoThumbnailManager } from "@/apps/hitalk/utils";

const tmpVideoThumbnailManager = useTmpVideoThumbnailManager()
export default {
  name: "MessageYourChat",
  components: {MessageShare, Lottie, MessageVote},
  props: {
    message: Object,
    messageSender : Object,
    prevMessage: Object,
    nextMessage: Object,
    isNotOnlyReadMember: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    fileName: "",
    file: null,
    files: [],
    filesTotalCount: 0,
    options:{
      truncate : 60
    },
    isScrolledBottomByCreated: false,
    reactionAnimationDataCheck: {animationData: reactionAnimationDataCheck.default || reactionAnimationDataCheck},
    reactionAnimationDataOk: {animationData: reactionAnimationDataOk.default || reactionAnimationDataOk},
    reactionAnimationDataNo: {animationData: reactionAnimationDataNo.default || reactionAnimationDataNo},
    reactionAnimationDataLike: {animationData: reactionAnimationDataLike.default || reactionAnimationDataLike},
    reactionAnimationDataHeart: {animationData: reactionAnimationDataHeart.default || reactionAnimationDataHeart},
    reactionAnimationDataJoy: {animationData: reactionAnimationDataJoy.default || reactionAnimationDataJoy},
    reactionAnimationDataSurprise: {animationData: reactionAnimationDataSurprise.default || reactionAnimationDataSurprise},
    reactionAnimationDataSad: {animationData: reactionAnimationDataSad.default || reactionAnimationDataSad},
    isOpenReactionSelection: false,
    isShowReactionOpenButton: false,
    unReadCount: 0,
    thumbnailImagePath: '',
  }),
  computed: {
    ...mapState('storeHitalk',[
      'isScrolledBottom',
      'connectRoomItem',
      'chatMoreLayerMessageId',
      'connectRoomMembers'
    ]),
    isTeacher: function() {
      const me = this.connectRoomMembers.find(m => m.userId === localStorage.uuid)
      return me && ['OWNER', 'MANAGER'].includes(me.role)
    },
    isGroupChatRoom: function() {
      return this.connectRoomItem.roomType === 'GROUP'
    },
    checkReaction: function() {
      return (this.message.reactions || []).find(r => r.iconId === '00000000-0000-0000-0000-000000000001')
    },
    okReaction: function() {
      return (this.message.reactions || []).find(r => r.iconId === '00000000-0000-0000-0000-000000000002')
    },
    noReaction: function() {
      return (this.message.reactions || []).find(r => r.iconId === '00000000-0000-0000-0000-000000000003')
    },
    likeReaction: function() {
      return (this.message.reactions || []).find(r => r.iconId === '00000000-0000-0000-0000-000000000004')
    },
    heartReaction: function() {
      return (this.message.reactions || []).find(r => r.iconId === '00000000-0000-0000-0000-000000000005')
    },
    joyReaction: function() {
      return (this.message.reactions || []).find(r => r.iconId === '00000000-0000-0000-0000-000000000006')
    },
    sadReaction: function() {
      return (this.message.reactions || []).find(r => r.iconId === '00000000-0000-0000-0000-000000000007')
    },
    surpriseReaction: function() {
      return (this.message.reactions || []).find(r => r.iconId === '00000000-0000-0000-0000-000000000008')
    },
    profileImage: function () {
      // if (!this.messageSender) return `background-image: url('${URLProps.DEFAULT_PROFILE_IMAGE_URL}')`;
      // return `background-image: url('${this.messageSender.user.userPhoto || URLProps.DEFAULT_PROFILE_IMAGE_URL}')`;
      if (!this.messageSender) return URLProps.DEFAULT_PROFILE_IMAGE_URL
      return this.messageSender.photo || URLProps.DEFAULT_PROFILE_IMAGE_URL
    },
    contactUserName: function () {
      if (!this.messageSender) return "(알수없음)";
      /*if (this.messageSender.memberStatusCheck === "CLASSLEAVE") {
        return this.messageSender.user.userName;
      }
      if (this.messageSender.userType === "TEACHER") {
        if(this.messageSender.memberRole ==="MEMBER"){
          return this.messageSender.memberChildName + this.$t("chat.type.parent") + "(" + this.messageSender.user.userName + ")";
        }else{
          return this.messageSender.user.userName + this.$t("chat.type.teacher");
        }
      } else if (this.messageSender.userType === "PARENTS") {
        return this.messageSender.memberChildName + this.$t("chat.type.parent") + "(" + this.messageSender.user.userName + ")";
      } else if (this.messageSender.userType === "STUDENT") {
        return this.messageSender.memberChildName + this.$t("chat.type.student");
      }*/
      return this.messageSender.name;
    },
    isShowReadMoreMenu: function() {
      const me = this.connectRoomMembers.find(m => m.userId === localStorage.uuid)
      return this.isTeacher && this.message.insertedTimestamp > me.readTimestamp 
    },
    stickerMessage : function(){
      if(!this.isStickerMessage) return "";
      return JSON.parse(this.message.content).msg.replaceAll('>', '&gt;').replaceAll('<', '&lt;').replace(/(\n|\r\n)/g, '<br>') || "";
    },
    stickerUrl : function(){
      if(!this.isStickerMessage) return "";
      return JSON.parse(this.message.content).stickerPath || "";
    },
    shareContent: function () {
      if(!this.isShareMessage) return "";
      return JSON.parse(this.message.content) || ""
    },

    messageContent: function(){
      return this.message.content 
        ? this.message.content
          .replace(/&/g, '&amp;')
          .replaceAll('>', '&gt;')
          .replaceAll('<', '&lt;')
          .replace(/(\n|\r\n)/g, '<br>')
          .replace(/ /g, '&nbsp;') 
        : "";
    },

    isDeleted: function () {
      return this.message && this.message.contentType ? this.message.contentType === MessageStatus.DELETE : false;
    },
    isChatMessage: function () {
      return this.message && this.message.contentType ? this.message.contentType === MessageStatus.CHAT : false;
    },
    isFileMessage: function () {
      return this.message && this.message.contentType ? this.message.contentType === MessageStatus.FILE : false;
    },
    isImageMessage: function () {
      return this.message && this.message.contentType ? this.message.contentType === MessageStatus.PHOTO : false;
    },
    isPhotoMultiMessage: function () {
      return this.message && this.message.contentType ? this.message.contentType === MessageStatus.PHOTOMULTI : false;
    },
    isVideoMessage: function () {
      return this.message && this.message.contentType ? this.message.contentType === MessageStatus.VIDEO : false;
    },
    isStickerMessage: function () {
      return this.message && this.message.contentType ? this.message.contentType === MessageStatus.STICKER : false;
    },
    isShareMessage: function () {
      return this.message && this.message.contentType ? this.message.contentType === MessageStatus.SHARE : false;
    },
    isVoteMessage: function () {
      return this.message && this.message.contentType ? this.message.contentType === MessageStatus.VOTE : false;
    },
    isShowMoreCopyButton: function () {
      return !!(this.pureTextMessage);
    },
    isShowMoreLayer: function () {
      return this.chatMoreLayerMessageId === this.message.currentId
    },
    isExpired: function () {
      switch (this.message.contentType) {
        case "VIDEO":
        case "PHOTO":
        case "FILE":
        case "PHOTOMULTI":
          return new Date().getTime() > this.message.expiredTimestamp;
        default:
          return false;
      }
    },
    isShowProfile() {
      try {
        const currentMessageSender = this.message.sender
        const prevMessageSender = this.prevMessage.sender
        const currentMessageTime = this.$comn.convertTimestamp2HourTime(this.message.insertedTimestamp)
        const prevMessageTime = this.$comn.convertTimestamp2HourTime(this.prevMessage.insertedTimestamp)
        const currentMessageContentType = this.message.contentType
        const prevMessageContentType = this.prevMessage.contentType
        const enabledContentTypes = [
          'CHAT',
          'DELETE',
          'STICKER',
          'VIDEO',
          'PHOTO',
          'FILE',
          'SHARE',
          'PHOTOMULTI'
        ]
        if(enabledContentTypes.includes(prevMessageContentType)) {
          return (currentMessageSender !== prevMessageSender
            || currentMessageTime !== prevMessageTime)
          && enabledContentTypes.includes(currentMessageContentType)
          && enabledContentTypes.includes(prevMessageContentType)
        } else {
          return true
        }
      } catch (e) {
        return true
      }
    },
    isHideTime() {
      try {
        const currentMessageSender = this.message.sender
        const nextMessageSender = this.nextMessage.sender
        const currentMessageTime = this.$comn.convertTimestamp2HourTime(this.message.insertedTimestamp)
        const nextMessageTime = this.$comn.convertTimestamp2HourTime(this.nextMessage.insertedTimestamp)
        const currentMessageContentType = this.message.contentType
        const nextMessageContentType = this.nextMessage.contentType
        const enabledContentTypes = [
          'CHAT',
          'DELETE',
          'STICKER',
          'VIDEO',
          'PHOTO',
          'FILE',
        ]
        return currentMessageSender === nextMessageSender
          && currentMessageTime === nextMessageTime
          && enabledContentTypes.includes(currentMessageContentType)
          && enabledContentTypes.includes(nextMessageContentType)

      } catch (e) {
        return false
      }
    },
    isGroup: function () {
      return this.connectRoomItem.roomType === "GROUP";
    },
    pureTextMessage() {
      let pureTextMessage;
      try {
        pureTextMessage =  this.isChatMessage ? this.message.content : JSON.parse(this.message.content).msg;
      } catch (e) {
        pureTextMessage = this.message.content;
      }
      return pureTextMessage;
    }
  },
  created() {
    if (this.message.contentType === "PHOTO"
      || this.message.contentType === "VIDEO"
      || this.message.contentType === "FILE"
    ) {
      let fileContent = JSON.parse(this.message.content);
      this.fileName = this.message.content ? fileContent.fileName : "파일없음";

      this.file = fileContent;
      this.filesTotalCount = this.file.length
    }
    
    if (this.message.contentType === "PHOTOMULTI") {
      try {
        this.files = JSON.parse(this.message.content)
        this.filesTotalCount = this.files.length
      } catch (e) {
        this.message.contentType = MessageStatus.CHAT
        this.message.content = '손상된 컨텐츠입니다.'
      }
    }

    this.isScrolledBottomByCreated = this.isScrolledBottom
  },
  beforeDestroy() {
    this.hideMoreLayer()
  },
  methods:{
    ...mapMutations('storeHitalk',[
      'showVideoViewLayout',
      'hideVideoViewLayout',
      'showConfirmLayout',
      'hideConfirmLayout',
      'setFileContent',
      'setCurrentFileContentIndex',
      'showImageViewLayout',
      'hideImageViewLayout',
      'showDocumentViewLayout',
      'hideDocumentViewLayout',
      'setEventMessage',
      'setShowConfirmLayout',
      'setVideoFileContent',
      'setChatMoreLayerMessageId',
      'setHitalkReactionListPopup'
    ]),
    ...mapActions('storeHitalk',[
      'callChatAreaScrollBottom',
      'sendStompReactionMessage',
      'sendStromReactionReadMessage'
    ]),
    showReactionOpenButton: function() {
      if(!this.isShowMoreLayer && !this.connectRoomItem.isEnding) {
        this.isShowReactionOpenButton = true
      }
    },
    hideReactionOpenButton: function() {
      this.isShowReactionOpenButton = false
    },
    openReactionListModal: function() {
      const params = {
        isOpen: true,
        messageId: this.message.currentId
      }
      this.setHitalkReactionListPopup(params)
    },
    hideReactionSelection: function() {
      if(this.isOpenReactionSelection) {
        this.isOpenReactionSelection = false
      }
    },
    toggleReactionSelection: function () {
      this.isOpenReactionSelection = !this.isOpenReactionSelection
      this.$emit('scrollToElement', this.message.currentId)
    },
    getIcon: function(iconId) {
      switch(iconId) {
        case '00000000-0000-0000-0000-000000000001':
          return 'reaction-check'
        case '00000000-0000-0000-0000-000000000002':
          return 'reaction-ok'
        case '00000000-0000-0000-0000-000000000003':
          return 'reaction-no'
        case '00000000-0000-0000-0000-000000000004':
          return 'reaction-like'
        case '00000000-0000-0000-0000-000000000005':
          return 'reaction-heart'
        case '00000000-0000-0000-0000-000000000006':
          return 'reaction-joy'
        case '00000000-0000-0000-0000-000000000007':
          return 'reaction-sad'
        case '00000000-0000-0000-0000-000000000008':
          return 'reaction-surprise'
      }
    },
    sendReactionMessage: function (id) {
      // TODO 나중에 ID가 10을 넘어가면 처리해줘야함
      const exist = (this.message.reactions || []).find(r => r.iconId === `00000000-0000-0000-0000-00000000000${id}`)
      const params = {
        iconId: `00000000-0000-0000-0000-00000000000${id}`,
        messageId: this.message.currentId,
        isCancel: exist && exist.isReaction
      }

      this.sendStompReactionMessage(params)
      this.hideReactionSelection()
      
      if(!this.isGroup && this.isTeacher && !params.isCancel) {
        this.sendStromReactionReadMessage({message: this.message})
      }

      this.$emit('scrollToElement', this.message.currentId)
    },
    toggleMoreLayer() {
      if (this.connectRoomItem.isEnding) return;
      this.chatMoreLayerMessageId === this.message.currentId
        ? this.hideMoreLayer()
        : this.openMoreLayer()

      this.hideReactionOpenButton()
      this.hideReactionSelection()
    },
    openMoreLayer() {
      this.setChatMoreLayerMessageId(this.message.currentId)
    },
    hideMoreLayer:function(){
      this.setChatMoreLayerMessageId(null)
    },
    openImageView() {
      if (this.isExpired) {
        this.showExpiredAlert();
        return;
      }
      this.setFileContent(JSON.parse(this.message.content));
      this.showImageViewLayout();
    },
    openImageViewWithFiles(files, index) {
      if (this.isExpired) {
        this.showExpiredAlert();
        return;
      }
      this.setFileContent(files);
      this.setCurrentFileContentIndex(index);
      this.showImageViewLayout();
    },
    openDocView() {
      if (this.isExpired) {
        this.showExpiredAlert();
        return;
      }
      this.setFileContent(JSON.parse(this.message.content));
      this.showDocumentViewLayout();
    },
    showLayerPopupConfirm: function (confirmCategory) {
      this.hideMoreLayer();
      this.setEventMessage(this.message);
      this.setShowConfirmLayout({
        isShowConfirmLayout: true,
        confirmCategory: confirmCategory
      });
    },
    copyMessage() {
      let tempElem = document.createElement('textarea');
      tempElem.value = this.pureTextMessage;
      document.body.appendChild(tempElem);

      tempElem.select();
      document.execCommand("copy");
      document.body.removeChild(tempElem);

      this.hideMoreLayer();
    },
    showVideoFileViewer: function () {
      if (this.isExpired) {
        this.showExpiredAlert();
        return;
      }
      const videoContent = JSON.parse(this.message.content)
      if(videoContent.fileName.split('.').pop() !== 'mp4' && !videoContent.fileTranscodePath) {
        this.$hiClass.alert('동영상 인코딩 중입니다.<br>재생까지 수 분 이상이 소요될 수 있습니다.');
        return;
      }
      this.setVideoFileContent(videoContent);
      this.showVideoViewLayout();
    },
    onLoadImage: function () {
      if (this.isScrolledBottomByCreated) this.callChatAreaScrollBottom()
    },
    onLoadPhotoMulti: function (index) {
      if (this.isScrolledBottomByCreated) {
        const lastIndex = index === this.filesTotalCount - 1
        if (lastIndex) this.callChatAreaScrollBottom()
      }
    },
    openConfirmDialolg(message) {
      this.$emit('callRead', 'read')
    },
    profileImageReplace(e) {
      e.target.src = URLProps.DEFAULT_PROFILE_IMAGE_URL
    },
    recalcUnReadCount() {
      this.unReadCount = unreadCountOf(this.message, this.connectRoomMembers)
    },
    async processTmpVideoThumbnail() {
      if (!this.isVideoMessage) return;
      const { roomId } = this.connectRoomItem
      const { fileThumbnailPath, fileOriginalPath } = JSON.parse(this.message.content)

      if (fileThumbnailPath) {
        this.thumbnailImagePath = fileThumbnailPath
        tmpVideoThumbnailManager.removeThumbnail(roomId, fileOriginalPath)
        return
      }
      this.thumbnailImagePath = tmpVideoThumbnailManager.getThumbnail(roomId, fileOriginalPath)
      if (this.thumbnailImagePath) return

      await tmpVideoThumbnailManager.addThumbnailOfVideoUrl(roomId, fileOriginalPath)
      this.thumbnailImagePath = tmpVideoThumbnailManager.getThumbnail(roomId, fileOriginalPath)
    },
    openVote (messageId) {
      this.$emit('openVote', messageId)
    },
    showExpiredAlert() {
      this.$hiClass.alert('원본파일이 만료되어 파일을 불러 올 수 없습니다.');
    },
    openClassRoomReport(payload) {
        this.$emit('openClassRoomReport', payload);
    },
  },
  watch: {
    isScrolledBottom: function (newVal) {
      this.isScrolledBottomByCreated = newVal
    },
    connectRoomMembers: {
      handler() {
        this.recalcUnReadCount()
      },
      deep: true
    }
  },
  mounted() {
    this.recalcUnReadCount()
    this.processTmpVideoThumbnail()
  }
}
</script>

<style scoped lang="scss">
.float-layer{
  left: 40px;
  bottom: 0px;
  button {
    justify-content: center;
    font-size:14px ;    
  }
}
.ooo-conversation-cont-wrap .chatting-bubble-wrap.video .chatting-bubble .img-video-view-wrap {
  background: #313538;
}

img.profile-image {
  transform: translate3d(0,0,0);
}
</style>