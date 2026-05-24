<!--
@File(Method): HitalkShareUserList.vue
@Author: -
@Date Created: -
@Description: 게시판 > 하이톡 공유 모달 > 대화 상대
@Modified: 2025-02-11 - #71877  [구성원태그] 하이톡 공유하기 > 검색 후 상단 체크박스 작동 오류
-->
<template>
  <div class="hitalk-share__left">
    <slot></slot>
    <div class="hitalk-user__list_div">
      <template v-if="classList.flatMap(c => c.users).length > 0">
        <div
            class="hitalk-user__list_area"
            v-for="chatClass in classList"
            :key="chatClass.classId"
            v-if="chatClass.users.length > 0"
        >
          <strong class="hitalk-user__heading">{{ chatClass.class.className }}</strong>
          <div class="hitalk-user__list">
            <div class="hitalk-user__item"
                 v-for="chatUser in chatClass.users"
                 :key="chatUser.user.userId"
                 @click="isDisabled(chatUser) ? isDisabledMessage(chatUser) : null"
            >
              <input
                  type="checkbox"
                  :id="chatUser.memberId"
                  :disabled="isDisabled(chatUser)"
                  :checked="hitalkShare.selectedUserList.some(u => u.content === chatUser.user.userId && u.classId === chatClass.classId)"
                  name="userCheckBox"
                  @change="changeUserCheckBox($event, chatClass, chatUser)"
              >
              <label :for="chatUser.memberId">
                <div class="hitalk-user__image">
                  <img :src="chatUserPhoto(chatUser)" @error="chatUserPhotoReplace" alt="">
                </div>
                <span
                    v-if="chatUser.userType !== 'TEACHER'"
                    :class="sortedKind(chatUser.memberClassNumber, chatUser.userType)"
                >
                <template v-if="chatUser.memberClassNumber !== 999">
                  {{ chatUser.memberClassNumber }}
                </template>
              </span>
                <div
                    class="hitalk-user__info"
                    :class="chatUser.userType !== 'TEACHER' ? 'n' : ''"
                >
                <span class="name" :class="{'profile-block': blocked(chatUser, chatClass)}">
                  {{ chatUserName(chatUser) }}
                </span>
                  <span class="text" v-if="chatUser.userType === 'TEACHER'">{{ teacherChatDay(chatUser.user) }}</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </template>

      <div class="hi-nodata" v-else>
        <p>검색결과가 없습니다.</p>
      </div>
    </div>
  </div>
</template>

<script>
import {mapMutations, mapState, mapGetters} from "vuex";
import { URLProps, UserLevel} from "@/enums";
import { checkTeacherChatTime, formatChatTime } from "@/apps/hitalk/utils";

export default {
  name: "hitalk-share-user-list",
  props: {
    classList: Array
  },
  computed: {
    ...mapState(['user', 'hitalkShare']),
    ...mapState('storeHitalk', ['classJSONList', 'blockedUsers']),
    ...mapGetters('storeHitalk', ['getDayName']),

    chatUserName() {
      return (chatUser) => {
        switch (chatUser.userType) {
          case UserLevel.TEACHER:
            return `${chatUser.user.userName} ${this.$t("chat.type.teacher")}`
          case UserLevel.PARENTS:
            return `${chatUser.memberChildName} ${this.$t("chat.type.parent")}(${chatUser.user.userName})`
          case UserLevel.STUDENT:
            return `${chatUser.memberChildName} ${this.$t("chat.type.student")}`
          default:
            return `${chatUser.user.userName}`
        }
      }
    },
    chatUserPhoto() {
      return (chatUser) => {
        return chatUser.user.userPhoto? chatUser.user.userPhoto : URLProps.DEFAULT_PROFILE_IMAGE_URL
     }
    },
    teacherChatDay() {  
      return (user) => {
        if (!user.isUseChat) return '하이톡을 사용하지 않습니다.'
        if(!user.userChatDay) return "지금은 상담 가능 시간이 아닙니다.";
        return formatChatTime(user, true)
      }
    }
  },
  methods: {
    ...mapMutations([
      'setHitalkShareSelectedUserList',
      'appendHitalkShareSelectedUserList',
      'spliceHitalkShareSelectedUserList',
      'clearHitalkShareSelectedUserList'
    ]),
    isDisabled(user) {
      if(user.userType === 'TEACHER' && ['OWNER', 'MANAGER'].includes(user.memberRole)) {
        return !user.user.isUseChat || !checkTeacherChatTime(user.user.isOverChat, user.user)
      } else {
        return false
      }
    },
    isDisabledMessage: function(user) {
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
    changeUserCheckBox(event, chatClass, chatUser) {
      if (event.target.checked) {
        if (chatClass.memberRole === 'MEMBER' && this.hitalkShare.selectedUserList.length > 0) {
          let isOtherChecked = !(this.hitalkShare.selectedUserList[0].content === chatUser.userId && this.hitalkShare.selectedUserList[0].classId === chatClass.classId)
          if (isOtherChecked) {
            const options = { duration: 700 }
            this.$toasted.show('1명만 선택 가능 합니다.', options)
            this.clearHitalkShareSelectedUserList()
          }
        }
        this.appendChatUser(chatUser)
      } else {
        this.deleteChatUser(chatUser)
      }
    },
    appendChatUser(chatUser) {
      if(this.isDisabled(chatUser)) {
        return false;
      }
      const sendUser = {
        roomType: 'PERSON',
        classId: chatUser.clazz.classId,
        content: chatUser.user.userId
      }
      const findIndex = this.hitalkShare.selectedUserList.findIndex(item => {
        return item.content === sendUser.content && item.classId === chatUser.clazz.classId
      })
      if (findIndex < 0) {
        this.appendHitalkShareSelectedUserList(sendUser)
      }
    },
    deleteChatUser(chatUser) {
      const findIndex = this.hitalkShare.selectedUserList.findIndex(item => {
        return item.content === chatUser.user.userId && item.classId === chatUser.clazz.classId
      })
      if (findIndex >= 0) {
        this.spliceHitalkShareSelectedUserList(findIndex)
      }
    },
    sortedKind(number, type) {
      if(number === 999 || type === "TEACHER") {
        return "num-no"
      }

      if(type === "PARENTS") {
        return "num"
      }
      
      return "num-std"
    },
    chatUserPhotoReplace(e) {
      e.target.src = URLProps.DEFAULT_PROFILE_IMAGE_URL
    },
    blocked(user, clazz) {
      return this.user.userType === 'TEACHER' && clazz.memberRole != 'MEMBER' &&
        this.blockedUsers.some(b => b.userId === user.user.userId)
    },
    syncDisabled() {
      const userOf = ({classId, content}) => {
        return this.classJSONList[classId].users.find(u => u.userId === content) || {}
      }
      this.setHitalkShareSelectedUserList(this.hitalkShare.selectedUserList.filter(s => !this.isDisabled(userOf(s))))
    }
  }
}
</script>

<style scoped>
.hi-nodata{padding:195px 0;}
</style>
