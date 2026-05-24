<template>
  <div class="right-wrap" :class="{ 'dim-right-modal': isDimRightModal }">
    <div class="inner">
      <chat-layout v-if="isShowChatLayout" 
       @openClassRoomReport="openClassRoomReport"/>
      <chat-main-banner v-else-if="isShowChatMainBanner" />
    </div>
  </div>
</template>

<script>
import ChatMainBanner from '@/apps/hitalk/components/chat/ChatMainBanner';
import ChatLayout from '@/apps/hitalk/components/chat/ChatLayout';
import { mapState } from 'vuex';
export default {
  name: 'RightLayout',
  components: { ChatLayout, ChatMainBanner },
  computed: {
    ...mapState(['user']),
    ...mapState('storeHitalk', ['isShowChatLayout', 'isShowRoomSettingLayout', 'isShowReadMemberLayout']),
    isDimRightModal: function () {
      return this.isShowRoomSettingLayout || this.isShowReadMemberLayout;
    },
    isShowChatMainBanner: function () {
      return this.$store.state.bannerTimestamp;
    },
  },
  methods: {
    openClassRoomReport(payload) {
        this.$emit('openClassRoomReport', payload);
    },
  },
};
</script>

<style>
</style>