<template>
  <div class="btn-floating-chat" role="button" @click="scrollDownWithHideFloatingMsg">
    <div class="info">
      <span class="image"><img :src="lastSenderProfileImg" alt=""></span>
      <span class="name">{{ lastSenderName }}</span>
    </div>
    <div class="chat">
      <p>{{ lastMessageContent }}</p>
    </div>
    <span class="arrow"></span>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";

export default {
  name: "ChatFloatingMessage",
  data: () => ({
    shareTypeCode: {
      NOTE: '알림장을',
      ALBUM: '앨범을',
      BOARD: '자유게시글을',
      HOMEWORK: '과제를',
      ALARM: '가정통신문을',
      MEAL: '급식을',
      NOTICE: '학교 공지를',
      CP_BOARD: '게시글을',
      CLASS_APPLY: '학교 신청서를',
      SHEET: '학교 신청서를',
      CLASSROOM: '학생 리포트를',
    }
  }),
  computed: {
    ...mapState('storeHitalk', [
      'connectRoomMembers'
    ]),
    ...mapGetters('storeHitalk',[
      'isNewLastMessageFlag',
      'messageArrayList',
      'newLastMessageList'
    ]),
    lastSenderName: function () {
      const lastSender = this.connectRoomMembers.find(m => m.userId === this.messageArrayList[this.messageArrayList.length - 1].sender)
      return lastSender.name
    },
    lastSenderProfileImg: function () {
      const lastSender = this.connectRoomMembers.find(m => m.userId === this.messageArrayList[this.messageArrayList.length - 1].sender)
      return lastSender.photo
    },
    lastMessageContent: function () {
      let lastMessage = this.messageArrayList[this.messageArrayList.length - 1]
      let lastMessageType = lastMessage.contentType
      const message = lastMessage.content || ''

      switch (lastMessageType) {
        case 'CHAT':
          return lastMessage.content
        case 'FILE':
          return JSON.parse(lastMessage.content).fileName
        case 'PHOTO':
          return '사진을 보냈습니다.'
        case 'PHOTOMULTI': {
          let files = []
          try {
            files = JSON.parse(lastMessage.content)
            // eslint-disable-next-line
          } catch (e) {}
          const fileCount = files.length || 0
          return `사진 ${fileCount}장을 보냈습니다.`
        }
        case 'VOTE':
          return '투표를 보냈습니다.'
        case 'VIDEO':
          return '영상을 보냈습니다.'
        case 'STICKER':
          return '스티커를 보냈습니다.'
        case 'KICK':
        case 'INVITE':
          return lastMessage.noticeMessage
        case 'SHARE': {
          let shareContent = {}
          let shareTypeStr = ''
          try {
            shareContent = JSON.parse(lastMessage.content)
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
            case 'CLASSROOM':
              shareTypeStr = this.shareTypeCode[shareContent.shareType]
              break
          }
          return `${shareTypeStr} 공유하였습니다.`
        }
        default:
          return 'unknown message'
      }
    }
  },
  methods: {
    ...mapMutations('storeHitalk',[
      'setIsNewLastMessageFlag',
      'clearNewLastMessageList'
    ]),
    // 플로팅 메시지 버튼 클릭
    scrollDownWithHideFloatingMsg() {
      this.$emit("scrollDownWithHideFloatingMsg", true)
      this.clearNewLastMessageList()
    }
  }
}
</script>

<style scoped>

</style>