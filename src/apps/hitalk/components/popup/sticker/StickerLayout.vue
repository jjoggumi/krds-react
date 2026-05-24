<!--
@File(Method): StickerLayout.vue
@Author: -
@Date Created: -
@Description: 하이톡 대화창 스티커 버튼
@Modified: 2025-06-23 - #72346 하이톡 투표하기 - 글쓰기내 attach 영역 스티커 컴포넌트 css scope
-->
<template>
  <div class="write-comment-btm-wrap">
    <div class="add-emoticon-wrap">
      <button title="이모티콘" :class="{dis: clReadOnlyMember}" class="add-emoticon-btn" @click="toggleEmoticon"></button>
      <!--
        TODO: 하이클래스 댓글에서 사용 중인 공통 스티커팩 팝업
      -->
      <sticker-popup
        v-if="isShowStickerMessageBox"
        :read-only="clReadOnlyMember"
        @closePopup="closeStickerPopup"
        @setStickerItem="setStickerItem"
      />

    </div>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState, mapGetters} from "vuex";
import StickerPopup from "@/components/Sticker/StickerPopup.vue";

export default {
  name: 'sticker-layout',
  props: {
    clReadOnlyMember: {
      type: Boolean,
      default: false
    }
  },  
  components: {
    StickerPopup
  },
  computed: {
    ...mapState([
      'isDimLoading',
      'user'
    ]),
    ...mapState('storeHitalk', [
      'isShowStickerMessageBox',
      'connectRoomItem',
      'connectRoomMembers'
    ]),
    ...mapGetters('storeHitalk',[
      'currentRoomName', //현재 채팅방 이름
      'connectCurRoomMembers'
    ]),
    roomMaster: function () {
      return this.connectRoomMembers.find(m => m.isMaster);
    },
    roomMembers: function () {
      let roomMemberJsonList = {};
      for (let roomMember of this.connectRoomMembers) {
        this.$set(roomMemberJsonList, roomMember.userId, roomMember);
      }
      return roomMemberJsonList;
    },
  },
  mounted() {
  },
  methods: {
    ...mapMutations("storeHitalk", [
      'toggleStickerMessageBox',
      'hideStickerMessageBox',
      'setSelectedStickerItem',
    ]),
    ...mapActions("storeHitalk", ['callUserTime']),
    async toggleEmoticon() {
      if(this.clReadOnlyMember) return;
      if(this.connectRoomItem.roomType !== 'GROUP') {
        const member = this.connectRoomMembers.find(m => m.userId !== localStorage.uuid)
        if(member.userType === 'TEACHER') {
          const res = await this.callUserTime({userId: member.userId, userType: member.userType, memberRole: member.role, isSetUserTime: true})
          if(!res.isUseChat) {
            return false;
          }
        }
      }
      this.toggleStickerMessageBox();
    },
    closeStickerPopup() {
      this.hideStickerMessageBox();
    },
    setStickerItem(stickerItem) {
      this.setSelectedStickerItem(stickerItem);
      this.hideStickerMessageBox();
    }
  },

}
</script>

<style scoped lang="scss">
.write-comment-btm-wrap{
  button.dis {
    background-position:-30px 0;
  }
  .add-emoticon-wrap {
    display:inline-block;
    position:relative;
    width:30px;
    height:30px;
    vertical-align:middle;

    .add-emoticon-btn {
      margin:0;
      width: 100%;
      height: 100%;
      &::before {
          content: "";
          display: inline-block;
          width: 22px;
          height: 22px;
          background: url("~@/assets/img/icon/icons_hitalk.png") -75px -50px/200px auto no-repeat;
          vertical-align: middle;
      }
      &:hover,
      &.dis {
          opacity: .6;
      }
      &.new::after {
          content: "";
          position: absolute;
          right: 0px;
          top: 4px;
          display: block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #ff6a6a;
      }
    }

    .emoticon-select-popup{
      left: -40px;
      bottom: 45px;
      right: auto;
       &::after {
        content: "";
        right: auto;
        left: 45px;
      }
    }
  }
}




</style>