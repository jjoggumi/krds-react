<!--
@File(Method): MemberClassUserItem.vue
@Description: 하이콜 > 대화상대 > 아이템
@Modified: 2025-03-26 - #73287 하이톡 내 플로팅 UI 공통화
-->

<template>
  <li @click="startChat" @mousedown.right="showContextPopup" @contextmenu.prevent>
    <div class="profile-thumbnail">
      <img class="profile-image" :src="profileImage" @error="profileImageReplace" alt="" />
    </div>
    <div class="profile-info-wrap">
      <div 
        v-show="member.userType !== 'TEACHER'" 
        class="profile-order-wrap-n"
        :class="sortedKind(member.memberClassNumber, member.userType)">
        <template v-if="member.memberClassNumber !== 999">
          {{member.memberClassNumber}}
        </template>
      </div>
      <div class="profile-text-wrap" :class="{'single-name' : isParents}">      
        <div class="name" :class="{'profile-block': blocked === true}">
          <span>{{ userName }}</span>
        </div>
        <div v-show="isTeacher" class="time"><span>{{ userChatDateTime }}</span></div>
        <div v-show="isTeacher" class="call"><span>{{ userCallDateTime }}</span></div>
        <div :class="{'msg': blocked, 'info': !blocked}" v-if="blocked || member.tags">
          <span v-if="member.userType !== 'TEACHER' && member.tags">{{ member.tags.map(t => t.tagName).join(', ')}}</span>          
          <template v-if="blocked"><br><span>차단됨</span></template>
        </div>
      </div>
    </div>
    <context-popup v-if="blockable && isTeacherLogged" class="float-layer-wrap" :popupId="'htk-mem-clsusr-' + member.userType + '-' + member.clazz.classId + '-' + member.userId" ref="popup">
      <button v-if="blocked" @click="showBlockDeleteConfirm" @contextmenu.prevent>
        <span>차단해제</span>
      </button>
      <button v-else @click="showBlockConfirm" @contextmenu.prevent>
        <span>차단하기</span>
      </button>
    </context-popup>
  </li>
</template>

<script>
import {URLProps, UserLevel} from "@/enums";
import {mapActions, mapGetters, mapState} from "vuex";
import ContextPopup from "@/apps/hitalk/components/popup/ContextPopup";
import _ from "lodash";
import {userNameOfMember} from "./stringUtils";
import { formatChatTime } from "@/apps/hitalk/utils";

export default {
  name: "MemberClassUserItem",
  components: { ContextPopup },
  props: {
    member: Object,
    blockable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapGetters('storeHitalk', {
      getDayName: 'getDayName'
    }),
    ...mapState('storeHitalk', [
      'blockedUsers'
    ]),
    ...mapState([
      'user'
    ]),
    blocked() {
      return this.user.userType === 'TEACHER' &&
        this.blockedUsers.find(user => user.userId === this.member.userId && user.clazzSubscribes.some(c => c.classId === this.member.clazz.classId)) !== undefined;
    },
    isTeacherLogged: function() {
      return (this.user || {}).userType === 'TEACHER';
    },
    profileImage() {
      return this.member.user.userPhoto || URLProps.DEFAULT_PROFILE_IMAGE_URL;
    },
    isStudent() {
      return this.member.userType === UserLevel.STUDENT;
    },
    isTeacher() {
      return this.member.userType === UserLevel.TEACHER;
    },
    isParents() {
      return this.member.userType === UserLevel.PARENTS;
    },
    userName() {
      return userNameOfMember(this.member);
    },
    userChatDateTime() {
      if (!this.member.user.isUseChat) return '하이톡을 사용하지 않습니다.'
      if (!this.member.user.userChatDay) return '지금은 상담 가능 시간이 아닙니다.';
      if (this.member.userType !== UserLevel.TEACHER) return '';
      return formatChatTime(this.member.user, true)
    },
    userCallDateTime() {
      if (!this.member.user.isUseCall) return '하이콜을 사용하지 않습니다.'
      if (!this.member.user.userCallDay) return '지금은 상담 가능 시간이 아닙니다.';
      if (this.member.userType !== UserLevel.TEACHER) return '';
      return formatChatTime(this.member.user, true, 'Call')
    },
  },
  methods:{
    ...mapActions("storeHitalk", [
      "callCheckExistRoom",
      "callUserTime",
    ]),
    async startChat() {
      // 상담 시간 가능 확인 및 채팅방 옵션 값 (void 타입)
      this.$emit('closeShareReportHistoryDetail');
      
      await this.callUserTime({userId: this.member.userId, userType: this.member.userType, memberRole: this.member.memberRole, isSetUserTime: true})
      // 채팅 연결
      this.callCheckExistRoom({
        roomType: "PERSON",
        classId: this.member.clazz.classId,
        content: this.member.user.userId
      });
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
    profileImageReplace(e) {
      e.target.src = URLProps.DEFAULT_PROFILE_IMAGE_URL
    },
    showContextPopup(e) {
      this.$refs.popup.toggle();
    },
    showBlockConfirm(e) {
      e.stopPropagation();
      this.$emit('blockRequested', this.member);
      this.$refs.popup.hide();
    },
    showBlockDeleteConfirm(e) {
      e.stopPropagation();
      this.$emit('blockDeleteRequested', this.member);
      this.$refs.popup.hide();
    }
  }
}
</script>

<style scoped lang="scss">
.float-layer-wrap{
  ::v-deep .float-layer{
    right: 16px;
    button {
      width:145px;
      color: #333;
    }
  }
}
// .popup-menu {
//   position: absolute;
//   border-radius: 4px;
//   background-color: white;
//   box-shadow: 0 4px 12px 0 rgba(0, 0, 0, .2);
//   top: 50%;
//   right: 20px;
//   z-index: 100;
// }

// .popup-menu button {
//   width: 146px;
//   height: 44px;
//   padding: 0 16px;
//   font-size: 15px;
//   text-align: left;
//   font-weight: 400;
// }

img.profile-image {
  transform: translate3d(0,0,0);
}
</style>