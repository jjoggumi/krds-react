<template>
  <div class="noti-confirm-wrap">
    <div class="tit-noti">
      <p>메시지 수신확인</p>
      <div
          class="modal-close-btn modal-close-icon"
          @click="hideReadMemberLayout" />
    </div>
    <div class="tit-noti-receive">
      <p>수신확인</p>
      <span class="right"><span class="ft-blue">미확인 {{readMemberArrayList.length - readMemberArrayList.filter(r => r.isReadFlag).length}}명</span> / 전체 {{readMemberArrayList.length}}명</span>
    </div>
    <div class="all-noti-mem-thum-wrap slide-pop">
      <div class="scrollbar-outer">
        <ul>
          <read-members-user-item
              v-for="userItem in readMemberArrayList"
              :key="userItem.userId+'-confirmMessageUserItem'"
              :user="userItem"
          />
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex";
import {orderBy} from "lodash";
import ReadMembersUserItem from "@/apps/hitalk/components/popup/side/ReadMembersUserItem";

export default {
  components:{
    ReadMembersUserItem,
  },
  computed: {
    ...mapState("storeHitalk",[
      'connectRoomMembers',
      'readTargetMessage'
    ]),
    readMemberArrayList:function(){
      let userArrayList = this.connectRoomMembers.filter(userItem=>{
        return (
          userItem.userId !== localStorage.uuid &&
          this.readTargetMessage.insertedTimestamp >= userItem.joinTimestamp
        );
      });
      const members = userArrayList.map(m => {
        const isRead = m.readTimestamp >= this.readTargetMessage.insertedTimestamp;
        return { 
          ...m, 
          isReadFlag: isRead 
        };
      })
      // 1순위: isReadFlag 
      // 2순위: name (오름차순)
      return orderBy(members, ["isReadFlag", "name"], ["asc", "asc"]);
    },
  },
  methods: {
    ...mapMutations("storeHitalk",[
      'showReadMemberLayout',
      'hideReadMemberLayout',
    ]),
  },
  mounted() {
    this.$nextTick(() => {
      this.$jqueryUtil.scrollbar();
    });

  },
  beforeDestroy() {
    this.hideReadMemberLayout();
  }
}
</script>

<style scoped></style>
