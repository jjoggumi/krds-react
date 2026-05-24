<!--
@File(Method): TargetList.vue
@Author: -
@Date Created: -
@Description: 하이콜 > 대화상대 > 일괄메시지 작성 > 발송대상 리스트
@Modified: 2025-01-09 - #69560 구성원 관리 태그 추가 - 검색영역 태그, 필터 추가 
-->
<template>
  <div class="select-target__list">
    <div
        class="select-target__item n"
        v-for="user of filteredUsers"
        :key="user.userId"
        @click="isDisabled(user) ? isDisabledMessage(user) : clickTargetCheckBox($event, user)"
    >
      <input
          type="checkbox"
          :id="`checkbox-${user.userId}`"
          :disabled="isDisabled(user)"
          v-model="sendMessageItem.targets"
          :value="user.userId"
      >
      <label :for="`checkbox-${user.userId}`">
        <span class="image" >
          <img :src="chatUserPhoto(user.thumbnailPath)" @error="chatUserPhotoReplace" alt="">
        </span>
            <span 
              v-if="user.userType !== 'TEACHER'"
              :class="sortedKind(user.memberClassNumber, user.userType)"
            >
              <template v-if="user.memberClassNumber !== 999">
                {{ user.memberClassNumber }}
              </template>
            </span>
            <span class="name" 
              :class="{
                t: target ==='target' && sortedKind(user.memberClassNumber, user.userType) !== 'num-no', 
                t2: target ==='target' && sortedKind(user.memberClassNumber, user.userType) === 'num-no', 
                n: target !=='target' && sortedKind(user.memberClassNumber, user.userType) !== 'num-no',
                n2: target !== 'target' && sortedKind(user.memberClassNumber, user.userType) === 'num-no',
                'profile-block': blocked(user)
              }"
            >{{ userNameWithType(user) }}</span>
      </label>
    </div>    
    <div class="hi-nodata" v-if="filteredUsers.length === 0">
      <p>
      검색결과가 없습니다.
      </p>
    </div>
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex";
import {URLProps} from "@/enums";
import {checkTeacherChatTime} from "@/apps/hitalk/utils";

export default {
  name: "target-list",
  props: {
    target: {
      type: String
    },
    isUseTime: {
      type: Boolean,
      default: false
    },
    memberSearchItem: {
      type: Object
    },
    groupType: {
      type: String,
      default: 'NOTICE'
    }
  }, 
  data() {
    return  {
      classSubscribes: []
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapState('storeHitalk', ['sendMessageItem', 'blockedUsers', 'classJSONList', 'apiVersionPrefix']),
    users() {
      const list = [
        ...this.sendMessageItem.classSubscribes.filter(v => v.userType === "TEACHER"),
        ...this.sendMessageItem.classSubscribes.filter(v => v.userType === "STUDENT"),
        ...this.sendMessageItem.classSubscribes.filter(v => v.userType === "PARENTS").map(userItem => {
            if(!userItem.memberClassNumber === true) userItem.memberClassNumber = 999
            return userItem
          }).sort((a, b) => a.memberClassNumber - b.memberClassNumber) 
      ]

      return list
    },
    filteredUsers() {
      if (this.memberSearchItem.searchType) {
        if (this.memberSearchItem.searchType === 'KEYWORD') {
          return this.users.filter(u =>
              u.userName.includes(this.memberSearchItem.searchValue) || (u.memberChildName || '').includes(this.memberSearchItem.searchValue)
          )

        } else if (this.memberSearchItem.searchType === 'TAG') {
          return this.users.filter(u => (u.tags || []).map(t => t.tagId).includes(this.memberSearchItem.searchValue))

        } else if (this.memberSearchItem.searchType === 'TAG_MULTI') {
          return this.memberSearchItem.searchValue.length > 0 ?
              this.users.filter(u => this.memberSearchItem.searchValue
                  .some(tagId => (u.tags || []).map(t => t.tagId).includes(tagId))
              ) :
              this.users

        } else {
          return this.users
        }
      } else {
        return this.users
      }
    },
    userNameWithType() {
      return (user) => {
        switch (user.userType) {
          case 'TEACHER':
            return `${user.userName} 선생님`
          case 'PARENTS':
            return `${user.memberChildName} 학부모 (${user.userName})`
          case 'STUDENT':
            return `${user.memberChildName} 학생`
          default:
            return user.userName
        }
      }
    },
    chatUserPhoto() {
      return (userPhoto) => {
        return userPhoto ? userPhoto : URLProps.DEFAULT_PROFILE_IMAGE_URL
      }
    },
    maximumTargets() {
      return this.groupType === 'LIMIT' ? 50 : 100
    }
  },
  methods: {
    ...mapMutations('storeHitalk', {
      setSendMessageItem: 'setSendMessageItem'
    }),
    isDisabled: function(user)  {
      if(this.isUseTime) {
        if(user.userType !== 'TEACHER') {
          return false
        } else {
          return !user.isUseChat || !checkTeacherChatTime(user.isOverChat, {...user, ...user.chatTime})
        }
      } else {
        return false
      }
    },
    isDisabledMessage: function(user) {
      this.$toasted.clear()
      const options = { duration: 1000 }    
      if(!user.isUseChat) {
        this.$toasted.show('선생님이 하이톡을 사용하지 않습니다.', options)
        return false;
      }
      if(!checkTeacherChatTime(user.isOverChat, user.chatTime)) {
        this.$toasted.show('지금은 상담 가능 시간이 아닙니다.', options)
        return false
      }
    },
    /**
     * 클래스 구독자 전체 조회
     * @returns {*}
     */
    async getClassSubscribes() {
      const result = await this.$axios({
        method: "get",
        url: `${this.apiVersionPrefix}/chatUsers`,
        params: {
          userId: localStorage.uuid,
          classId: this.sendMessageItem.classId
        }
      })
      const users = result.data._embedded.chatUsers.filter(o => o.userId !== localStorage.uuid)
      const teachers = users.filter(o => o.userType === 'TEACHER').map((member) => {
        return {
          memberId : member.memberId,
          userId : member.userId,
          userType : member.userType,
          memberStatus : member.memberStatus,
          memberRole : member.memberRole,
          memberChildName : member.memberChildName,
          memberClassNumber : member.memberClassNumber,
          userName : member.user.userName,
          thumbnailPath : member.user.userPhoto,
          isOverChat: member.user.isOverChat,
          isUseChat: member.user.isUseChat,
          chatTime: {
            userChatDay: member.user.userChatDay,
            userChatStartTime: member.user.userChatStartTime,
            userChatEndTime: member.user.userChatEndTime,
            userChatStartTime2: member.user.userChatStartTime2,
            userChatEndTime2: member.user.userChatEndTime2,
            userChatStartTime3: member.user.userChatStartTime3,
            userChatEndTime3: member.user.userChatEndTime3,
          },
          tags: member.tags
        }
      })
      const others = users.filter(o => o.userType !== 'TEACHER').map((member) => {
        return {
          memberId : member.memberId,
          userId : member.userId,
          userType : member.userType,
          memberStatus : member.memberStatus,
          memberRole : member.memberRole,
          memberChildName : member.memberChildName,
          memberClassNumber : member.memberClassNumber,
          userName : member.user.userName,
          thumbnailPath : member.user.userPhoto,
          tags: member.tags
        }
      })
      const classSubscribes = [...teachers, ...others]
      this.setSendMessageItem({isGetAllClassSubscribes: true, classSubscribes})
    },

    /**
     * 대상자 선택
     * @param e
     * @param user
     */
    clickTargetCheckBox(e, user) {
      e.preventDefault()
      const isChecked = document.getElementById(`checkbox-${user.userId}`).checked

      if (this.sendMessageItem.targets.length > (this.maximumTargets - 1) &&
          !isChecked &&
          this.sendMessageItem.roomType === 'GROUP'
      ) {
        this.$hiClass.alert(`단체방은 최대 ${this.maximumTargets}명까지 가능합니다.`)
        return false
      }

      const targets = _.cloneDeep(this.sendMessageItem.targets)
      const findIndex = _.findIndex(targets, (target) => {
        return target === user.userId
      })

      if (findIndex >= 0) { // 배열에 있으면 삭제
        targets.splice(findIndex, 1)
      } else { // 배열에 없으면 추가
        targets.push(user.userId)
      }

      this.setSendMessageItem({'targets': targets})
    },
    sortedKind(number, type) {
      if(number === 999) {
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
    blocked (user) {
      return this.user.userType === 'TEACHER' && this.blockedUsers.some(b => b.userId === user.userId)
    }
  },
  watch : {
    classJSONList: {
      handler: function() {
        this.getClassSubscribes()
      },
      deep: true
    }
  },
  created() {
    this.getClassSubscribes()
  }
}
</script>

<style scoped> 
/* .select-target-wrap{
  max-height: 340px;
} */
</style>