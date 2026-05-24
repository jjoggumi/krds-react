<template>
  <div class="hitalk-share__left">
        <div class="hitalk-user__list">
          <div class="hitalk-user__item" 
            v-for="(roomItem, index) of filteredRoomList" 
            :key="`${roomItem.room}-chatRoom-${index}`"
            @click="isDisabled(roomItem) ? isDisabledMessage(roomItem.settings.members) : null"
          >
            <input
                type="checkbox"
                :id="roomItem.room"
                :value="roomItem.room"
                v-model="selectedChatRoomList"
                :disabled="isDisabled(roomItem)"
                :class="{ 'dis' : isDisabled2(roomItem)}"
                @click="selectRoom($event, roomItem)"
            >
            <label :for="roomItem.room" class="hitalk-user__inner">
              <i v-if="roomItem.roomType === 'GROUP' && getIsManager(roomItem)" class="icon-admin"></i>
              <div class="hitalk-user__image">
                <img :src="chatRoomImage(roomItem)" @error="chatRoomImageReplace" alt="">
              </div>
              <div class="hitalk-user__info">
                <div class="name">
                  <GroupRoomIcon :roomItem="roomItem"/>
                  <span class='room-name' :class="{'profile-block': blocked(roomItem)}">
                    {{ roomName(roomItem) }}
                  </span>
                  <span class="total" v-if="roomItem.roomType === 'GROUP'">{{ (roomItem.settings.members || []).length || roomItem.settings.memberCount }}</span>
                </div>
                <span class="text">{{ messageContent(roomItem) }}</span>
              </div>
            </label>
          </div>
        </div>
      </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";
import {URLProps, UserLevel} from "@/enums";
import {isExpiredRoom, checkTeacherChatTime} from "@/apps/hitalk/utils";
import GroupRoomIcon from "@/apps/hitalk/components/common/GroupRoomIcon.vue";
import { EXTERNAL_LINKS } from '@/constants/externalAssets';

export default {
  name: "hitalk-share-chat-list",
  components: { GroupRoomIcon },
  data() {
    return {
      selectedChatRoomList: [],
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
    }
  },
  props: {
    shareBtnType: String,
    roomList: Array
  },
  computed: {
    ...mapState(['user', 'versionData']),
    ...mapGetters(['curClassId']),
    ...mapState('storeHitalk', ['classJSONList', 'roomArrayList', 'blockedUsers']),
    filteredRoomList() {
      const hitalkVersion = this.versionData.hitalk || {}
      const blockedByVersionData = room => room.roomType === 'GROUP' &&
          ['GENERAL', 'LIMIT'].includes(room.groupType) &&
          !(hitalkVersion.groupRoomMessage || false)
      const expiredLimitGroupRoom = room => room.roomType === 'GROUP'
          && room.groupType === 'LIMIT'
          && room.limitTimestamp < new Date().getTime()
      const isOwnerOrManager = (this.classJSONList[this.curClassId] || {}).memberRole !== 'MEMBER'
      return this.roomList.filter(r => !blockedByVersionData(r) && !expiredLimitGroupRoom(r)
          && (isOwnerOrManager || r.roomType !== 'GROUP'))
    },
    roomName() {
      return (roomItem) => {
        let chatMember = this.getChatMemberOf(roomItem)

        switch (roomItem.roomType) {
          case 'PERSON':
            if (chatMember.memberStatusCheck === 'CLASSLEAVE') {
              return '(알수없음)'
            }
            switch (chatMember.userType) {
              case UserLevel.TEACHER:
                return `${chatMember.user.userName} ${this.$t("chat.type.teacher")}`
              case UserLevel.PARENTS:
                return `${chatMember.memberChildName} ${this.$t("chat.type.parent")}(${chatMember.user.userName})`
              case UserLevel.STUDENT:
                return `${chatMember.memberChildName} ${this.$t("chat.type.student")}`
            }
            break
          case 'GROUP':
            return roomItem.personRoomName || roomItem.roomName || '단체방'
          default:
            return ''
        }
      }
    },
    messageContent() {
      return (roomItem) => {
        if(!roomItem.settings.user.lastChatMessage) return "";
        const message = roomItem.settings.user.lastChatMessage.content

        switch (roomItem.settings.user.lastChatMessage.contentType) {
          case "CHAT":
            return message
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
      }
    },
    chatRoomImage() {
      return (roomItem) => {
        if (roomItem.roomType === 'PERSON') {
          const members = roomItem.settings.members
          for (const chatMember of members) {
            if (chatMember.user.currentId !== localStorage.uuid) {
              return chatMember.user.userPhoto || URLProps.DEFAULT_PROFILE_IMAGE_URL;
            }
          }
        } else if ((roomItem.roomType === 'GROUP')) {
          return roomItem.settings.clazz.classImagePath || EXTERNAL_LINKS.IMAGES.DEFAULT_CLASS;
        }
      }
    }
  },
  methods: {
    ...mapMutations({
      setHitalkShareSelectedUserList: 'setHitalkShareSelectedUserList'
    }),
    isDisabled(roomItem) {
      const users = roomItem.settings.members
      const roomType = roomItem.roomType
      const user = (users || []).find(u => u.user.currentId !== localStorage.uuid) || {}
      
      if(roomType !== 'GROUP' && user && user.userType === 'TEACHER' && ['OWNER', 'MANAGER'].includes(user.memberRole))
      return !user.user.isUseChat || !checkTeacherChatTime(user.user.isOverChat, user.user)

      if(isExpiredRoom(roomItem) || !roomItem.chatUsed) {
        return true
      }
      
      return false
    },
    isDisabled2(roomItem) { // 단체방 선택 권한 
      const member = (roomItem.settings.members || []).find(chatMember => {
        return chatMember.user.currentId === this.user.currentId
      }) || {}

      if (member.memberRole === 'MEMBER' && roomItem.roomType === 'GROUP') {
        return true
      }

      return false
    },
    isDisabledMessage: function(users) {
      const user = users.find(u => u.user.currentId !== localStorage.uuid)
      this.$toasted.clear()
      const options = { duration: 1000 }    
      if(!user.user.isUseChat) {
        this.$toasted.show('선생님이 하이톡을 사용하지 않습니다.', options)
        return false;
      }
      if(!checkTeacherChatTime(user.user.isOverChat, user.user)) {
        this.$toasted.show('지금은 상담 가능 시간이 아닙니다.', options)
        return false
      }
    },
    selectRoom(event, roomItem) {
      const member = (roomItem.settings.members || []).find(chatMember => {
        return chatMember.user.currentId === this.user.currentId
      }) || {}

      if (member.memberRole === 'MEMBER') {
        const options = { duration: 700 }

        if (roomItem.roomType === 'GROUP') {
          this.$toasted.show('단체방은 선택할 수 없습니다.', options)
          event.target.checked = false;
        } else {

          if (this.selectedChatRoomList.length > 0) {
            let checked = this.selectedChatRoomList[0] === event.target.value ? false : true
            if (checked) {
              this.selectedChatRoomList = []
              this.$toasted.show('대화방 1개만 선택 가능 합니다.', options)
              event.target.checked = checked;
            } else {
              event.target.checked = checked;
            }
          }
        }
      }
    },
    chatRoomImageReplace(e) {
      e.target.src = URLProps.DEFAULT_PROFILE_IMAGE_URL
    },
    getIsManager(roomItem) {
      const {memberRole} = (roomItem.settings.members || []).find(member => member.user.currentId === this.user.currentId) || {memberRole: ''}
      return memberRole === 'OWNER' || memberRole === 'MANAGER'
    },
    getChatMemberOf(roomItem) {
      return roomItem.roomType === 'PERSON' ? (roomItem.settings.members || []).find(member => member.user.currentId !== localStorage.uuid ) || {memberStatusCheck: 'CLASSLEAVE'}: {}
    },
    isLeftChatRoom(roomItem) {
      return this.getChatMemberOf(roomItem).memberStatusCheck === 'CLASSLEAVE'
    },
    blocked(roomItem) {
      return !this.isLeftChatRoom(roomItem) && this.classJSONList[roomItem.classId].memberRole != 'MEMBER' &&
        this.user.userType === 'TEACHER' && roomItem.roomType === 'PERSON' &&
        this.blockedUsers.some(b => roomItem.settings.members.some(m => m.user.currentId === b.userId))
    },
    syncDisabled() {
      this.selectedChatRoomList = this.selectedChatRoomList.filter(s => {
        const roomItem = this.roomList.find(r => r.room === s)
        return !this.isDisabled(roomItem)
      })
    }
  },

  watch: {
    selectedChatRoomList: {
      handler: function () {
        this.setHitalkShareSelectedUserList(this.selectedChatRoomList)
      }
    }
  }
}
</script>

<style scoped>
.hitalk-share__left {
  overflow: auto;
}

.name {
  display: flex;
}

.name .total {
  margin-left: 5px;
}

.name span.room-name {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>