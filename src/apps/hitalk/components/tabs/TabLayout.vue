<template>
  <div class="tab-cont-wrap">
    <member-layout v-if="isMemberTab" @closeShareReportHistoryDetail="onCloseShareReportHistoryDetail"/>
    <room-layout v-if="isRoomTab" @closeShareReportHistoryDetail="onCloseShareReportHistoryDetail"/>
    <reservation-layout v-if="isReservationTab"/>
    <div class="vote-layout" v-if="isVoteTab">
      <hitalk-vote-manager @change="onChangeVote"/>
    </div>
  </div>
</template>

<script>
import MemberLayout from "@/apps/hitalk/components/tabs/member/MemberLayout";
import RoomLayout from "@/apps/hitalk/components/tabs/room/RoomLayout";
import {TabStatus} from "@/enums";
import {mapState} from "vuex";
import ReservationLayout from "@/apps/hitalk/components/tabs/reservation/ReservationLayout";
import {eventBus} from "@/main";

export default {
  name: "TabLayout",
  components: {ReservationLayout, RoomLayout, MemberLayout},
  computed:{
    ...mapState('storeHitalk', ['selectedTab']),
    isMemberTab:function(){
      return this.selectedTab === TabStatus.MEMBER;
    },
    isRoomTab:function(){
      return this.selectedTab === TabStatus.ROOM;
    },
    isReservationTab: function () {
      return this.selectedTab === TabStatus.RESERVATION;
    },
    isVoteTab: function () {
      return this.selectedTab === TabStatus.VOTE;
    }
  },
  methods: {
    onChangeVote({detail}) {
      if (detail?.type === 'openVoteEditor') eventBus.$emit('openVoteEditor');

      eventBus.$emit('onChangeVotePortal', {
        detail
      })
    },
    onCloseShareReportHistoryDetail() {
      this.$emit('closeShareReportHistoryDetail');
    },
  },
}
</script>

<style scoped>
.vote-layout {
  height: 100vh;
}
</style>