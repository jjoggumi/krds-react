<!--
@File(Method): NoticeCustomLayout.vue
@Author: -
@Date Created: -
@Description: 하이톡 > 대화상대 > 단체방 > 더보기 > 공지대상 추가 > 대상 선택하기 팝업
@Modified: 2025-01-09 - #69560 구성원 관리 태그 추가 - 검색영역 태그, 필터 추가 / HiModal 컴포넌트로 변경
-->
<template>
  <HiModal type="type01" size="lg" @close="closeNoticeCustomSelectBox" class="hitalk">
    <template v-slot:heading>대상 선택하기</template>
    <template v-slot:content> 
      <div class="hi-row sm-gutters a-stretch">
        <div class="col-sm-7">          
          <div class="box-border pb-00">
            <div class="tit-h4 fst">
              발송 대상  
              <span class="num">
                <span class="ft-blue">
                  {{ goingToSelectCount }}
                </span>
                / {{ currentClassItem.users.length }}명
              </span>
            </div>
            <div class="select-target-wrap">
              <MemberPicker v-model="pickedMembers"
                ref="memberPicker"
                :classId="currentClassItem.classId"
                :excludeMe='true'
                :showSelected="false"
                :borderless='true'
                :selectAllFlags="{ TEACHER: false, PARENTS: true, STUDENT: true }"
                :showCounts="true"
                :disableUsers="connectRoomMembers"
                :blockedIds="blockedIds"
                :onBeforeCheckEach="onBeforeCheckEach"
                :onBeforeCheckAll="onBeforeCheckAll"
              />
            </div>
          </div>
        </div>
        <div class="col-sm-5">
          <div class="mem-noti-list box-border p-00">
            <div class="mem-noti-peo" v-for="user in pickedMembers"
              :key="user.userId">
              <ProfileItem :user="user" :inline="true"
              />
              <button class="delete-btn" tabindex="0"  @click="unpickUser(user)"></button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <HiButton color="line-default" size="lg" @click="closeNoticeCustomSelectBox">취소</HiButton>
      <HiButton color="primary" size="lg" @click="submitNoticeCustom" :disabled="!isSelectedItem">확인</HiButton>  
    </template>
  </HiModal>
</template>

<script>
import {mapMutations, mapActions, mapState} from "vuex";
import MemberPicker from "@/apps/main/clazzes/components/MemberPicker";
import ProfileItem from '@/components/Profile/List/Item.vue'

export default {
  components: {
    MemberPicker,
    ProfileItem
  },
  props: {},
  data() {
    return {
      clazzTags: [],
      memberSearchItem: {
        searchType: 'NONE',
        searchValue: ''
      },
      pickedMembers: []
    }
  },
  computed: {
    ...mapState('storeHitalk',[
      'blockedUsers',
      'currentClassItem',
      'noticeTargetUserArrayList',
      'noticeCategory',
      'connectRoomMembers',
      'connectRoomItem'
    ]),
    selectedUserIdString: function () {
      return [...(this.noticeCategory === "invite" ? []: [localStorage.uuid]),
      ...this.noticeTargetUserArrayList.map(user => user.userId || user.user.userId )].join(',')
    },
    isSelectedItem: function () {
      return this.noticeTargetUserArrayList.length > 0
    },
    blockedIds() {
      return this.blockedUsers.map(u => u.userId)
    },
    hasBlockedUser() {
      return this.pickedMembers.map(m => m.userId).some(t => this.blockedIds.includes(t))
    },
    isGroupChat: function () {
      return this.connectRoomItem.roomType === 'GROUP';
    },
    isLimitedGroupChat: function () {
      return this.connectRoomItem.roomType === 'GROUP' && this.connectRoomItem.groupType === 'LIMIT';
    },
    maximumMemberCount() {
      return this.isGroupChat ? (this.isLimitedGroupChat ? 50 : 100) : Number.MAX_SAFE_INTEGER;
    },
    goingToSelectCount() {
      return this.noticeTargetUserArrayList.length + this.connectRoomMembers.length - 1;
    },
  },
  watch: {
    pickedMembers: {
      immediate: true,
      handler(value) {
        this.clearNoticeTargetUserList()
        value.forEach(user => {
          this.addNoticeTargetUser(user)
        })
      }
    },
    noticeTargetUserArrayList: {
      deep: true,
      handler: function (arrayList) {
        const selectedCount = arrayList.length

        if (this.noticeCategory === 'invite') {
          const invitedCount = this.connectRoomMembers.length
          const totalCount = selectedCount + invitedCount // 초대하려는 + 초대된 사용자수

          if (totalCount > 100 && selectedCount > 0) {
            this.$hiClass.alert('단체방은 최대 100명까지 가능합니다.')
            .then(() => {
              let deleteTargetList = []
              if (100 - invitedCount > 0) { // 100명 이하로 초대된 방
                for (let i = 100 - invitedCount; i < selectedCount; i++) {
                  deleteTargetList.push(arrayList[i])
                }
              } else { // 100명 제한 적용전에 이미 100명 이상 초대된 방
                for (let i = 0; i < selectedCount; i++) {
                  deleteTargetList.push(arrayList[i])
                }
              }
              this.deleteNoticeTargetUserList(deleteTargetList)
            })
          }
        }

        if (this.noticeCategory === 'group') {
          if (arrayList.length > 99) {
            this.$hiClass.alert('단체방은 최대 100명까지 가능합니다.')
            .then(() => {
              let deleteTargetList = []
              for (let i = 99; i < selectedCount; i++) {
                deleteTargetList.push(arrayList[i])
              }

              this.deleteNoticeTargetUserList(deleteTargetList)
            })
          }
        }
      }
    }
  },
  methods: {
    ...mapMutations("storeHitalk",[
      'hideNoticeCustomLayout',
      'clearNoticeTargetUserList',
      'addNoticeTargetUser',
      'deleteNoticeTargetUser',
      'deleteNoticeTargetUserList',
      'setSelectedUserIdString',
    ]),
    ...mapActions("storeHitalk",[
      "callCreateRoom",
      "callRoomInformation",
      "sendStompInviteMessage",
    ]),
    onChangeAllChecker(type, value) {
      this.toggleNoticeTarget({target: {checked: value}}, type)
    },
    toggleNoticeTarget: function (event, targetCategory) {
      const userArrayList = this[`${targetCategory}UserArrayList`];
      for (let userItem of userArrayList) {
        if (event.target.checked) {
          this.addNoticeTargetUser(userItem);
        } else {
          this.deleteNoticeTargetUser(userItem)
        }
      }
    },
    closeNoticeCustomSelectBox: function () {
      this.clearNoticeTargetUserList();
      this.hideNoticeCustomLayout();
    },
    async checkConsistentUserCount() {
      const lastMemberCount = this.$refs.memberPicker.counts.ALL
      const currentMemberCount = (await this.$refs.memberPicker.loadMembersCount()).ALL
      return lastMemberCount === currentMemberCount
    },
    async submitNoticeCustom() {
      if (this.goingToSelectCount > this.maximumMemberCount) {
        return this.$hiClass.alert(`단체방은 최대 ${this.maximumMemberCount}명까지 가능합니다.`)
      }
      if (!(await this.checkConsistentUserCount())) {
        this.$refs.memberPicker.initialize()
        this.pickedMembers = []
        return this.$hiClass.alert('클래스 구성원 목록이 변경되었습니다.<br>다시 선택해주세요.')
      }
      if (this.hasBlockedUser && !await this.confirmOfBlockedUsers()) return;
      if (!this.isSelectedItem) return;
      switch (this.noticeCategory) {
        case "personal": {
          await this.callRoomInformation({
            sender: localStorage.uuid,
            classId: this.currentClassItem.classId,
            receiver: this.selectedUserIdArrayList
          })
          break;
        }
        case "group": {
          this.callCreateRoom({
            roomType: "GROUP",
            memberType: "CUSTOM",
            classId: this.currentClassItem.classId,
            content: this.selectedUserIdString
          });
          break;
        }
        case "invite": {
          this.setSelectedUserIdString(this.selectedUserIdString);
          this.sendStompInviteMessage();
          break;
        }
      }
      setTimeout(() => {
        this.closeNoticeCustomSelectBox();
      }, 100)
      setTimeout(() => {
        this.pageScrollBottom();
      }, 700)
    },
    async confirmOfBlockedUsers() {
      try {
        await this.$hiClass.confirm(`
          메시지 발송이 차단된 구성원이<br>
          포함되어 있습니다.<br>
          단체 채팅방에 추가하시겠습니까?`.trim(), '', {
            confirmButtonText: '예',
            cancelButtonText: '아니오',
            reverseButtons: true
        })
        return true
      } catch (e) {
        return false
      }
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
    async getTags() {
      const res = await this.$axios.get(`/clazzes/${this.currentClassItem.classId}/tags`)
      if (res.data._embedded && res.data._embedded.clazzTags.length > 0) {
        this.clazzTags = res.data._embedded.clazzTags
      }
    },
    search({ searchType, searchValue }) {
      this.memberSearchItem = { searchType, searchValue }
    },
    getIsChecked(type) {
      return this[`${type}UserArrayList`].length > 0 &&
          this[`${type}UserArrayList`]
              .map(u => u.userId)
              .every(userId => this.noticeTargetUserArrayList.map(t => t.userId).includes(userId))
    },
    unpickUser(user) {
      this.$refs.memberPicker.removeMember(user)
    },
    async onBeforeCheckEach() {
      if (this.goingToSelectCount < this.maximumMemberCount) return true
      await this.$hiClass.alert(`단체방은 최대 ${this.maximumMemberCount}명까지 가능합니다.`)
      return false
    },
    async onBeforeCheckAll(users) {
      if (this.goingToSelectCount + users.length <= this.maximumMemberCount) return true
      await this.$hiClass.alert(`단체방은 최대 ${this.maximumMemberCount}명까지 가능합니다.`)
      return false
    }
  },
  mounted() {
    this.getTags()
  }
}
</script>

<style scoped>
.modal.normal-modal .modal-title-wrap span {
  display: inline;
  color: #ff6a6a;
}
.hi-nodata{padding:125px 0;}
.box-border{
  padding: 25px 20px;
  text-align: left;
}
.select-target-wrap{
  margin: 0 -20px;
}
.member-picker::v-deep .left-section .select-target-wrap .profile-list{
  height: 273px;
}
</style>
