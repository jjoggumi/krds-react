<!--
@File(Method): RoomSettingUserListItem.vue
@Author: -
@Date Created: -
@Description: 하이톡 > 대화목록 > 더보기(설정) > 채팅방 내보내기 모달
@Modified: 2025-01-20 - #69577 쌍방향 채팅방 - 내용 변경 및 himodal 적용 
#72405 하이톡 알럿 문구 폰트 확인(상용과 UI가 달라 수정 요함)
-->

<template>
    <!--#72405 modal__content가 없는 상태로 modal__header만으로 알림 모달뜰때 컨텐츠영역 여백 없애는 class 추가 :class="{'n' : !isEjection}" -->
    <!--#72405 X 닫기 버튼 삭제 -->
    <HiModal type="type01" size="sm" closeSkip @close="hideConfirmLayout" :modalLayerStyle="{width: '430px', 'max-width': '430px'}" :class="{'n' : !isEjection}">
      <!--#72405 modal__content에 있던 알림 txt를 modal__header로 이동후 isEjection 여부에 따라 분기 처리 -->
      <template v-slot:heading v-if="isEjection">
          아래의 구성원을 내보내겠습니까?
          <p class="desc">내보내기 된 사용자는 단체 공지방에<br> 접속할 수 없습니다.</p>
      </template>
      <template v-slot:heading v-else>
        <h2 class="heading" v-html="layerPopupText"></h2>
      </template>
      <template v-slot:content> 
        <div class="textbox" v-if="isEjection">     
          <div class="desc txt-left" v-html="formattedUserNameString"></div> 
        </div>
      </template>
      <template v-slot:footer>
        <HiButton color="gray" size="lg"  @click="hideConfirmLayout">
          {{ $t("chat.cancel") }}</HiButton>
          <HiButton v-if="confirmCategory !== 'leaveGroupRoom'" color="primary" size="lg" @click="submitConfirm">{{ $t("chat.confirm") }}</HiButton>   
          <HiButton v-else color="warning" size="lg" @click="submitConfirm">종료 후 삭제</HiButton>        
      </template>
    </HiModal>
</template>
<script>
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  props: {},
  computed: {
    ...mapState('storeHitalk',[
      'confirmCategory',
      'userNameString',
      'messageArrayList',
      'currentRoomReservationCount',
      'connectRoomItem'
    ]),
    isEjection: function(){
      return this.confirmCategory === 'ejection';
    },
    layerPopupText: function(){
      const isDeleteReservation = this.currentRoomReservationCount > 0
      switch (this.confirmCategory){
        case "leaveRoom":{
          return !isDeleteReservation 
            ? this.$t("chat.leave.alert") 
            : (
                this.connectRoomItem.roomType !== 'GROUP' 
                ? this.$t("chat.leave.reservation.alert") 
                : this.$t('chat.leave.group.reservation.alert') 
              )
        }
        case "leaveGroupRoom":{
          return this.$t("chat.leave.group.alert").replace(/\n/g, '<br>')
        }
        case "deleteYourMessage":{
          return this.$t("chat.delete.your.alert");
        }
        case "deleteMessage":{
          return this.$t("chat.delete.alert");
        }
        default:{
          return "";
        }
      }
    },
    formattedUserNameString() {
      return this.userNameString
        .split(",")
        .map(name => `<span class='txt-ellipsis' style='display: block; line-height: 2;'>${name}</span>`)
        .join("");
      }
  },
  methods: {
    ...mapMutations("storeHitalk",[
      'setShowConfirmLayout',
      'hideConfirmLayout',
      'setReservationCount'
    ]),
    ...mapActions("storeHitalk",[
      "leaveChatRoom",
      "sendStompDeleteMessage",
      "sendStompKickMessage",
    ]),
    submitConfirm: function () {
      switch (this.confirmCategory){
        case "leaveRoom":{
          this.leaveChatRoom();
          return;
        }
        case "leaveGroupRoom":{
          this.leaveChatRoom();
          return;
        }
        case "deleteYourMessage":{
          this.sendStompDeleteMessage();
          return;
        }
        case "deleteMessage":{
          this.sendStompDeleteMessage();
          return;
        }
        case "ejection":{
          this.sendStompKickMessage();
          return;
        }
        default:{
          return;
        }
      }

    }
  }
}
</script>

<style scoped lang="scss">

.text-wrap {
  min-width: 300px;
}
.hitalk-alert-modal.modal .modal-cont .icon-title-wrap .text-wrap span {
  font-weight: inherit;
  font-family: inherit;
  word-break: normal;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
.textbox{
  height: 125px;
  overflow: auto;
  padding: 0 20px;
  .desc{
    line-height: 2.1;
  }
}
</style>
