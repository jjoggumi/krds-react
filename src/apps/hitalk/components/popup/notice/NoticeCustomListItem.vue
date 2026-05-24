<!--
@File(Method): NoticeCustomListItem.vue
@Author: -
@Date Created: -
@Description: 하이톡 > 대화상대 > 단체방 > 더보기 > 공지대상 추가 > 대상 선택하기 팝업 > 리스트
@Modified: 2025-01-09 - #69560 구성원 관리 태그 추가 - 검색영역 태그, 필터 추가 
-->
<template>
  <li class="select-target__item"
      @click="toggleTargetUser($event)"
  >
    <input
        :class ="{ dis : isInvited}"
        type="checkbox"
        :id="user.user.userId"
        :value="user.user.userId"
        v-model="noticeTargetUserIdList"
        :disabled="isInvited"
    >
    <label :for="user.user.userId">
      <span class="image">
        <img :src="profileImage" @error="profileImageReplace" alt="" />
      </span>
      <span class="name" :class="{'profile-block': blocked}" :title="userName">{{ userName }}</span>
    </label>
  </li>
</template>

<script>
import {mapMutations, mapState} from "vuex";

export default {
  props: {
    user: Object
  },
  computed: {
    ...mapState('storeHitalk',[
      "noticeTargetUserJSONList",
      "noticeCategory",
      'connectRoomMembers',
      'currentClassItem',
      'blockedUsers'
    ]),
    isInvited:function(){
      if(this.noticeCategory === "invite"){
        for(let roomUserItem of this.connectRoomMembers){
          if(roomUserItem.userId === this.user.user.userId) return true;
        }
      }
      return false;
    },
    noticeTargetUserIdList:function(){
      let noticeTargetUserIdList = [];
      
      for(let userId in this.noticeTargetUserJSONList){
        noticeTargetUserIdList.push(userId);
      }
      return noticeTargetUserIdList;
    },
    profileImage: function () {
      // if (this.user.user.userPhoto) {
      //   return `background-image: url(${this.user.user.userPhoto})`;
      // } else {
      //   return `background-image: url(${this.$store.state.userProfileDefault})`;
      // }

      return this.user.user.userPhoto || this.$store.state.userProfileDefault;
    },
    userName: function () {
      switch (this.user.userType) {
        case "TEACHER": {
          return this.user.user.userName + this.$t("chat.type.teacher");
        }
        case "PARENTS": {
          return this.user.memberChildName + this.$t("chat.type.parent") + "(" + this.user.user.userName + ")";
        }
        case "STUDENT": {
          return this.user.memberChildName + this.$t("chat.type.student");
        }
        default: {
          return this.user.sortName;
        }
      }
    },
    blocked() {
      return ['OWNER', 'MANAGER'].includes(this.currentClassItem.memberRole) &&
        this.blockedUsers.some(o => o.userId === this.user.userId)
    }
  },
  methods: {
    ...mapMutations("storeHitalk",[
      'showNoticeTargetLayout',
      'hideNoticeTargetLayout',
      'clearNoticeTargetUserList',
      'addNoticeTargetUser',
      'deleteNoticeTargetUser',
    ]),
    toggleTargetUser(e) {
      e.preventDefault() // 체크박스 클릭시 input, label 중복 클릭됨.

      if (this.isInvited) return
      if (this.noticeTargetUserJSONList[this.user.user.userId]) {
        this.deleteNoticeTargetUser(this.user)
      } else {
        this.addNoticeTargetUser(this.user)
      }
    },
    profileImageReplace(e) {
      e.target.src = this.$store.state.userProfileDefault
    }
  }
}
</script>