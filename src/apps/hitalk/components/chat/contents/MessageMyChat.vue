<!--
@File(Method): MessageMyChat.vue
@Description: 하이톡 > 채팅창 > 나의 채팅 영역
@Modified: 2025-03-26 - #73287 하이톡 내 플로팅 UI 공통화
-->
<template>
  <div
    @mousedown.right="toggleMoreLayer"
    @contextmenu.prevent
    v-if="!isDeleted"
    class="chatting-bubble-wrap my-chatting"
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
    <div class="chatting-bubble-etc-wrap" @mouseover="showReactionOpenButton" @mouseleave="hideReactionOpenButton">
      <div v-if="isPendingMessage" class="more-btn-wrap" style="z-index:1000">
          <button class="resending-btn" @click="onClickResendPendingMessage(message)"></button>
          <button class="delete-btn" @click="onClickDeletePendingMessage(message)"></button>
      </div>
      <!-- <div class="dot-more-btn-wrap">
        <div class="more-popup-wrap" :class="{'on' : isShowMoreLayer}" v-click-outside="hideMoreLayer">
          <button class="reaction-btn" @click="toggleReactionSelection"><span>반응하기</span></button>
          <template v-if="isShowMoreCopyButton">
            <div class="bar"></div>
            <button class="copy-btn" @click="copyMessage(message)"><span>복사</span></button>
          </template>
          <template v-if="!isDeleted && isGroup">
            <div class="bar"></div>
            <button class="receipt-btn" @click="showReadMembers"><span>메시지 수신확인</span></button>
          </template>
          <div class="bar"></div>
          <button class="del-btn" @click="showLayerPopupConfirm('deleteMessage')"><span>삭제</span></button>
        </div>
      </div> -->
      <div v-if="unReadCount>0 && !isShowReactionOpenButton && isValidMessage" :style="isShowMoreLayer ? {display: 'block'} : {}" class="reading-check-wrap">{{ unReadCount }}</div>
      <div v-if="!isHideTime && !isShowReactionOpenButton && isValidMessage" class="time" :style="isShowMoreLayer ? {display: 'block'} : {}">{{ $comn.convertTimestamp2HourTime(message.insertedTimestamp) }}</div>
      <button v-if="isShowReactionOpenButton" class="hitalk-reaction-btn" @click="toggleReactionSelection">
        <i class="reaction"></i>
      </button>      
      <!-- #73287 플로팅 레이어 공통 css 적용-->
      <div v-if="isShowMoreLayer" class="float-layer-wrap">
        <div class="float-layer" v-click-outside="hideMoreLayer">
          <button @click="toggleReactionSelection"><span>반응하기</span></button>
          <button v-if="isShowMoreCopyButton" @click="copyMessage(message)"><span>복사</span></button>    
          <button v-if="!isDeleted && isGroup" @click="showReadMembers"><span>메시지 수신확인</span></button>    
          <button v-if="!isVoteMessage" class="txt-warning" @click="showLayerPopupConfirm('deleteMessage')"><span>삭제</span></button>
        </div>
      </div>
      <div v-if="isSendingMessage" class="loading"><img src="@/assets/img/loading.gif"></div>
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
        <span class="period">유효기간: {{ message.id ? `~ ${$moment(message.expiredTimestamp).format('YYYY.M.DD')}` : '' }}</span>
      </button>
    </div>
    <div v-if="isImageMessage" class="chatting-bubble" @mouseover="showReactionOpenButton" @mouseleave="hideReactionOpenButton" @click="openImageView">
      <p v-if="!isExpired && file.fileOriginalPath">
        <button type="button">
          <img :src="file.fileOriginalPath" alt=""/>
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
          @click="openImageViewWithFiles(files, index);"
        >
          <img v-if="!isExpired && file.fileOriginalPath" :src="file.fileOriginalPath" alt=""/>
          <div v-else class="cover-empty">
            <div class="expired-img-icon"><span></span></div>
          </div>
        </button>
      </p>
    </div>
    <div v-if="isVideoMessage" class="chatting-bubble" @click="showVideoFileViewer" @mouseover="showReactionOpenButton" @mouseleave="hideReactionOpenButton">
      <div v-if="isShowDefaultThumbnail || isExpired" class="img-video-view-wrap">
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
          <img :src="thumbnailImagePath" @error="showDefaultThumbnail" loading="lazy" alt=""/>
        </div>
      </div>
    </div>

    <message-share v-if="isShareMessage" :share-content="shareContent" @showReactionOpenButton="showReactionOpenButton" @hideReactionOpenButton="hideReactionOpenButton" @openClassRoomReport="openClassRoomReport"/>
    <message-vote v-if="isVoteMessage" :message="message" @open="openVote"/>
    <div class="hitalk-reaction-wrap">
      <span 
        v-for="(reaction, index) of message.reactions" 
        :key="index"
        :class="{selected: reaction.isReaction}"
        @click="sendReactionMessage(reaction.iconId.charAt(reaction.iconId.length - 1))"
      >
        <i :class="getIcon(reaction.iconId)"></i>{{ reaction.count }}
      </span>
      <span v-if="message.reactions" @click="openReactionListModal"><i class="reaction-user"></i></span>
      <div class="reaction-select-wrap" v-if="isOpenReactionSelection" v-click-outside="hideReactionSelection">
        <div class="reaction-select">
          <span :class="{my: checkReaction ? checkReaction.isReaction : false}" @click="sendReactionMessage('1')">
            <lottie :options="reactionAnimationDataCheck" :width="36" :height="36" />
          </span>
          <span :class="{my: okReaction ? okReaction.isReaction : false}" @click="sendReactionMessage('2')">
            <lottie :options="reactionAnimationDataOk" :width="36" :height="36"  />
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
    class="chatting-bubble-wrap my-chatting"
  >
    <div class="chatting-bubble-etc-wrap">
      <div v-if="unReadCount>0" class="reading-check-wrap" style="display: block;">{{ unReadCount }}</div>
      <div v-if="!isHideTime" class="time" style="display: block;">{{ $comn.convertTimestamp2HourTime(message.insertedTimestamp) }}</div>
    </div>
    <div class="chatting-bubble">
      <p class="msg-del">삭제된 메시지 입니다.</p>
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
import { unreadCountOf, useTmpVideoThumbnailManager } from "@/apps/hitalk/utils";
import reactionAnimationDataJoy from "@/assets/img/icon/joy.json";
import reactionAnimationDataSad from "@/assets/img/icon/sad.json";
import reactionAnimationDataSurprise from "@/assets/img/icon/surprise.json";

const tmpVideoThumbnailManager = useTmpVideoThumbnailManager();

export default {
  name: "MessageMyChat",
  components: {MessageShare, Lottie, MessageVote},
  props: {
    message: Object,
    messageSender : Object,
    nextMessage: Object,
  },
  data: () => ({
    fileName: "",
    file: null,
    files: [],
    isShowDefaultThumbnail: false,
    options:{
      truncate : 60
    },
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
    currentTime: new Date().getTime()
  }),
  computed: {
    ...mapState('storeHitalk',[
      'connectRoomItem',
      'chatMoreLayerMessageId',
      'connectRoomMembers'
    ]),
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
      if (!this.messageSender) return `background-image: url('${URLProps.DEFAULT_PROFILE_IMAGE_URL}')`;
      return `background-image: url('${this.messageSender.photo || URLProps.DEFAULT_PROFILE_IMAGE_URL}')`;
    },
    contactUserName: function () {
      if (!this.messageSender) return "";
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
    isGroup: function () {
      return this.connectRoomItem.roomType === "GROUP";
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
          'SHARE',
        ]
        return currentMessageSender === nextMessageSender
          && currentMessageTime === nextMessageTime
          && enabledContentTypes.includes(currentMessageContentType)
          && enabledContentTypes.includes(nextMessageContentType)

      } catch (e) {
        return false
      }
    },
    isValidMessage() {
      return this.message.id
    },
    unReadCount: function () {
      return unreadCountOf(this.message, this.connectRoomMembers)
    },
    thumbnailImagePath: function () {
      if(this.message.contentType !== 'VIDEO') return "";
      const { fileThumbnailPath, fileName, fileSize } = JSON.parse(this.message.content)
      if (fileThumbnailPath) {
        tmpVideoThumbnailManager.removeThumbnail(this.connectRoomItem.roomId, fileName, fileSize);
        return fileThumbnailPath;
      }
      return tmpVideoThumbnailManager.getThumbnail(this.connectRoomItem.roomId, fileName, fileSize);  
    },
    pureTextMessage() {
      let pureTextMessage;
      try {
        pureTextMessage =  this.isChatMessage ? this.message.content : JSON.parse(this.message.content).msg;
      } catch (e) {
        pureTextMessage = this.message.content;
      }
      return pureTextMessage
    },
    isTeacher: function () {
      const me = this.connectRoomMembers.find(m => m.userId === localStorage.uuid)
      return ['OWNER', 'MANAGER'].includes(me.role)
    },
    isPendingMessage: function () {
      return (this.message.tempId || false) && !this.message.id && this.currentTime - (this.message.timestamp || this.currentTime) > 3000
    },
    isSendingMessage: function () {
      return (this.message.tempId || false) && !this.message.id && !this.isPendingMessage
    }
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
      'setTargetReadMessage',
      'setFileContent',
      'setCurrentFileContentIndex',
      'showImageViewLayout',
      'hideImageViewLayout',
      'showDocumentViewLayout',
      'hideDocumentViewLayout',
      'setVideoFileContent',
      'showReadMemberLayout',
      'hideReadMemberLayout',
      'setEventMessage',
      'setShowConfirmLayout',
      'setChatMoreLayerMessageId',
      'setHitalkReactionListPopup'
    ]),
    ...mapActions('storeHitalk',[
      'sendStompReactionMessage',
      'sendStromReactionReadMessage',
      'resendPendingMessage',
      'deletePendingMessage',
      'reloadPendingMessages'
    ]),
    deletetag(input, allow){
      var regExp;
      if(allow.length !=0)
        regExp = "<\\/?(?!(" + allow.join('|') + "))\\b[^>]*>";
      else
        // eslint-disable-next-line no-useless-escape
        regExp = "<\/?[^>]*>";
        
      return input.replaceAll('>', '&gt;').replaceAll('<', '&lt;').replace(new RegExp(regExp, "gi"), "");
    },
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
    showDefaultThumbnail: function () {
      this.isShowDefaultThumbnail = true;
    },
    toggleMoreLayer() {
      if (!this.message.id || this.connectRoomItem.isEnding) return;
      this.chatMoreLayerMessageId === this.message.currentId
        ? this.hideMoreLayer()
        : this.openMoreLayer()

      this.hideReactionOpenButton()
      this.hideReactionSelection()
    },
    openMoreLayer() {
      this.setChatMoreLayerMessageId(this.message.currentId)
    },
    hideMoreLayer() {
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
    copyMessage() {
      let tempElem = document.createElement('textarea');
      tempElem.value = this.pureTextMessage;
      document.body.appendChild(tempElem);

      tempElem.select();
      document.execCommand("copy");
      document.body.removeChild(tempElem);

      this.hideMoreLayer();
    },
    showReadMembers() {
      this.setTargetReadMessage(this.message)
      this.showReadMemberLayout();
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
    showLayerPopupConfirm: function (confirmCategory) {
      this.hideMoreLayer();
      this.setEventMessage(this.message);
      this.setShowConfirmLayout({
        isShowConfirmLayout: true,
        confirmCategory: confirmCategory
      });
    },
    onClickResendPendingMessage(message) {
      this.$hiClass.confirm(
        '메시지를 재 전송 하시겠습니까?', '', {
        cancelButtonText: '취소',
        confirmButtonText: '전송',
        reverseButtons: true
      }).then(() => {
        this.resendPendingMessage(message)
        if (this.message.timestamp) {
          setTimeout(() => {
            this.currentTime = new Date().getTime()
            this.reloadPendingMessages()
          }, 3000)
        }
      })
    },
    onClickDeletePendingMessage(message) {
      this.$hiClass.confirm(
        '메시지를 삭제 하시겠습니까?', '', {
        cancelButtonText: '취소',
        confirmButtonText: '삭제',
        reverseButtons: true
      }).then(async () => {
        await this.deletePendingMessage({message, isMessageArrayListDelete: true})
        await this.reloadPendingMessages()
      })
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
  created() {
    if (this.message.contentType === "PHOTO"
      || this.message.contentType === "VIDEO"
      || this.message.contentType === "FILE"
    ) {
      let fileContent = JSON.parse(this.message.content);
      this.fileName = this.message.content ? fileContent.fileName : "파일없음";

      this.file = fileContent;
    }
    
    if (this.message.contentType === "PHOTOMULTI") {
      try {
        this.files = JSON.parse(this.message.content)
      } catch (e) {
        this.message.contentType = MessageStatus.CHAT
        this.message.content = '손상된 컨텐츠입니다.'
      }
    }

    if (this.message.timestamp) {
      setTimeout(() => {
        this.currentTime = new Date().getTime()
        this.reloadPendingMessages()
      }, 3000)
    }
  }
}
</script>

<style scoped lang="scss">
.float-layer{
  right: 40px;
  bottom: 0;
  button {
    justify-content: center;
    font-size:14px ;    
  }
}
.ooo-conversation-cont-wrap .chatting-bubble-wrap.video .chatting-bubble .img-video-view-wrap {
 background: #313538;
}
.loading {
  position: absolute;
  bottom:0px;
  width: 24px;
  height: 24px;
}

.loading img {
  width: 100%;
  height: 100%;
}
</style>