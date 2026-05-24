<!--
@File(Method): TargetTop.vue
@Author: -
@Date Created: -
@Description: 하이콜 > 대화상대 > 일괄메시지 작성 > 리슽트 상단
              하이톡 > 대화상대 > 단체 버튼 클릭 > 리스트 상단
@Modified: 2025-01-09 - #69560 구성원 관리 태그 추가 - 검색영역 태그, 필터 추가 
-->
<template>
  <div v-if='shown' class="group-checkbox d-flex j-between a-middle">
    <div>
      <input
          type="checkbox"
          id="checkAll"
          @click="changeCheckbox($event, 'ALL')"
          :checked="getIsChecked('ALL')"
          :disabled="checkableUser.length === 0"
      >
      <label for="checkAll"><span>전체</span></label>
      <input
          type="checkbox"
          id="checkParents"
          @change="changeCheckbox($event, 'PARENTS')"
          :checked="getIsChecked('PARENTS')"
          :disabled="checkableUser.filter(u => u.userType === 'PARENTS').length === 0"
      >
      <label for="checkParents"><span>학부모</span></label>
      <input
          type="checkbox"
          id="checkStudent"
          @change="changeCheckbox($event, 'STUDENT')"
          :checked="getIsChecked('STUDENT')"
          :disabled="checkableUser.filter(u => u.userType === 'STUDENT').length === 0"
      >
      <label for="checkStudent"><span>학생</span></label>    
    </div>
    <!-- 부모 컴포넌트로 이동<span class="count" v-if="sendMessageItem.roomType === 'GROUP'">
      <span class="ft-blue">{{ sendMessageItem.targets.length }}</span>{{ `/${sendMessageItem.classSubscribes.length}명` }}
    </span> 
    <span class="count" v-if="sendMessageItem.roomType === 'BATCH'">
      <span class="ft-blue">{{ sendMessageItem.targets.length }}</span>{{ `/${sendMessageItem.classSubscribes.length}명` }}
    </span> -->
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex";
import {checkTeacherChatTime} from "@/apps/hitalk/utils";
import redrawable from "@/mixins/redrawable";

export default {
  name: "TargetTop",
  mixins: [redrawable],
  props: {
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
  watch: {
    groupType () {
      if (this.sendMessageItem.targets.length > this.maximumTargets) {
        this.showLimitAlert(true)
      }
    }
  },
  computed: {
    ...mapState({
      user: 'user'
    }),
    ...mapState('storeHitalk', {
      sendMessageItem: 'sendMessageItem'
    }),
    searchedUsers() {
      if (this.memberSearchItem.searchType) {
        if (this.memberSearchItem.searchType === 'KEYWORD') {
          return this.sendMessageItem.classSubscribes.filter(u =>
              u.userName.includes(this.memberSearchItem.searchValue) || (u.memberChildName || '').includes(this.memberSearchItem.searchValue)
          )

        } else if (this.memberSearchItem.searchType === 'TAG') {
          return this.sendMessageItem.classSubscribes.filter(u => (u.tags || []).map(t => t.tagId).includes(this.memberSearchItem.searchValue))

        } else if (this.memberSearchItem.searchType === 'TAG_MULTI') {
          return this.sendMessageItem.classSubscribes.filter(u => this.memberSearchItem.searchValue
              .some(tagId => (u.tags || []).map(t => t.tagId).includes(tagId))
          )

        } else {
          return this.sendMessageItem.classSubscribes
        }
      } else {
        return this.sendMessageItem.classSubscribes
      }
    },
    checkableUser() {
      return this.searchedUsers
          .filter(u => {
            if (u.userType !== 'TEACHER') { return true }
            if (!this.isUseTime) { return true }
            return u.isUseChat && checkTeacherChatTime(u.isOverChat, {
              ...u.chatTime,
              isUseChat: u.isUseChat
            });
          })
    },
    shouldExceptMe() {
      return this.groupType === 'NOTICE'
    },
    maximumTargets() {
      return this.groupType === 'LIMIT' ? 50 : 100
    },
    getIsChecked() {
      return (type) => this.checkableUser.filter(u => u.userType === type || type === 'ALL').length > 0 &&
          this.checkableUser
              .filter(u => u.userType === type || type === 'ALL')
              .map(u => u.userId)
              .every(userId => this.sendMessageItem.targets.includes(userId))
    }
  },
  methods: {
    ...mapMutations('storeHitalk', [
      'setSendMessageItem',
    ]),

    /**
     * 필터 체크박스 클릭
     */
    async changeCheckbox(event, type) {
      let targets = []
      const filteredUserIds = this.checkableUser.filter(u => u.userType === type || type === 'ALL').map(u => u.userId)
      const maximumTargets = this.maximumTargets
      const isGroupRoom = this.sendMessageItem.roomType === 'GROUP'

      if (event.target.checked) {
        if (this.sendMessageItem.targets.length + filteredUserIds.length > maximumTargets && isGroupRoom) {
          this.showLimitAlert(true)
          return
        }
        targets = _.uniq([...this.sendMessageItem.targets, ...filteredUserIds])
      } else {
        targets = this.sendMessageItem.targets.filter(userId => !filteredUserIds.includes(userId))
      }

      this.setSendMessageItem({targets})
    },
    async showLimitAlert(unselect) {
      await this.$hiClass.alert( `단체방은 최대 ${this.maximumTargets}명까지 가능합니다.`)
      if (unselect) {
        this.setSendMessageItem({targets: []})
        this.redraw()
      }
    }
  }
}
</script>

<style scoped>

</style>