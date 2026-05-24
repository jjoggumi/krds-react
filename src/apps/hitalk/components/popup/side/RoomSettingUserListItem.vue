<!--
@File(Method): RoomSettingUserListItem.vue
@Description: 하이톡 > 대화목록 > 더보기(설정) > 멤버 리스트
@Modified: 2025-05-19 - #74553 [하이톡] 쌍방향 단체톡 베타오픈 : 채팅 중지 아이콘 색상 변경
-->
<template>
  <li :class="{dis: isConnectRoomExpired && !isLoginUser}">
    <div class="profile-thumbnail">
      <img :src="profileImage" @error="profileImageReplace" alt="" />
    </div>
    <div class="profile-text-wrap">
      <div class="name" :class="{ 'my-name': isLoginUser }">
        <span v-show="isLoginUser" class="label"> 나 </span>
        <span>{{ userName }}</span>
      </div>
    </div>
    <div class="check-mem">
      <HiButton
        v-if="isGroupChatRoom && isRoomMaster && !isShowEjectionView && !connectRoomItem.isEnding"
        class="no-chat" :color="user.chatUsed !== false ? 'disabled' : 'warning'" size="sm"
        :disabled="isConnectRoomExpired"
        @click="onClickNoChat"
        >
        <HiIcon name="ico-no-chat-thin" color="white" size="20"/>
      </HiButton>
      <div class="checkbox-wrap" v-show="isShowEjectionView">
        <input
          :class="{ dis : isDisabledCheckBox}"
          type="checkbox"
          :id="user.userId"
          :value="user.userId"
          :disabled="isDisabledCheckBox"
          v-model="ejectionTargetUserIdList"
          @change="toggleTargetUser"
        >
        <label :for="user.userId"></label>
      </div>
    </div>
  </li>
</template>

<script>
import {mapGetters, mapMutations, mapState, mapActions} from "vuex";
import {URLProps} from "@/enums";

export default {
  props: {
    user: Object
  },
  computed: {
    ...mapState('storeHitalk', [
      'isShowEjectionView',
      'noticeTargetUserJSONList',
      'connectRoomItem'
    ]),
    ...mapGetters('storeHitalk', [
      'currentRoomMaster',
      'isConnectRoomExpired'
    ]),
    isLoginUser: function () {
      return this.user.userId === localStorage.uuid;
    },
    isRoomMaster: function () {
      return localStorage.uuid === this.currentRoomMaster.userId;
    },
    isDisabledCheckBox: function () {
      return (this.user.userId === localStorage.uuid)
        || this.user.userId === this.currentRoomMaster.userId;
    },
    ejectionTargetUserIdList: {
      get(){
        return this.noticeTargetUserJSONList ? Object.keys(this.noticeTargetUserJSONList)
          .map(key => {
            return this.noticeTargetUserJSONList[key]
          }) : [];
      },
      set(){}
    },
    profileImage: function () {
      return this.user.photo || URLProps.DEFAULT_PROFILE_IMAGE_URL;
    },
    userName() {
      return this.user.name
    },
    isGroupChatRoom() {
      return this.connectRoomItem.roomType === 'GROUP' && this.connectRoomItem.groupType !== 'NOTICE';
    },
    //colorOfNoChat() {
    //  return this.user.chatUsed ? 'white' : 'warning'; 
    //}
  },
  methods: {
    ...mapMutations("storeHitalk", [
      'showNoticeCustomLayout',
      'hideNoticeCustomLayout',
      'addNoticeTargetUser',
      'deleteNoticeTargetUser',
    ]),
    ...mapActions("storeHitalk", [
      'toggleBlockGroupChat',
    ]),
    toggleTargetUser: function () {
      if (this.isDisabledCheckBox) return;
      if (this.noticeTargetUserJSONList[this.user.userId]) {
        this.deleteNoticeTargetUser(this.user);
      } else {
        this.addNoticeTargetUser(this.user);
      }
    },
    profileImageReplace(e) {
      e.target.src = URLProps.DEFAULT_PROFILE_IMAGE_URL;
    },
    async onClickNoChat() {
      if (localStorage.uuid !== this.currentRoomMaster.userId) return;
      const status = this.user.chatUsed !== false ? '중지' : '활성화';
      await this.toggleBlockGroupChat({
        userId: this.currentRoomMaster.userId,
        roomId: this.connectRoomItem.roomId,
        member: this.user
      });
      this.$toasted.show(`${this.user.name}의 채팅 기능이 ${status} 되었습니다.`, {duration: 1500});
    }
  },
}
</script>
<style lang="scss" scoped>
.profile-text-wrap{
  .name.my-name{
    .label{    
      width: 18px;
      height: 18px;
      display: inline-flex  ;
      align-items: center;
      justify-content: center;
      background: rgba(51, 51, 51, 1);
      border-radius: 50%;
      color: #fff;
      font-size: 12px;
      margin-right: 3px;
    }
  }
}
.check-mem .no-chat{
  pointer-events: auto;
  cursor: pointer;
}
</style>