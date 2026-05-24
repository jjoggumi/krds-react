<template>
  <li>
    <div class="profile-thumbnail" :style="profileImage"></div>
    <div class="profile-text-wrap">
        <div class="name"><span>{{ userName }}</span></div>
        <div class="status" :class="{on: isReadFlag}" >{{ isReadText }}</div>
    </div>
  </li>
</template>

<script>
import {mapState} from "vuex";
import { isRead } from "@/apps/hitalk/utils";

export default {
  data: () => ({}),
  props: {
    user: Object
  },
  computed: {
    ...mapState("storeHitalk", ['connectRoomMembers', 'readTargetMessage']),
    isLoginUser:function(){
      return this.user.userId === localStorage.uuid;
    },
    isReadFlag:function() {
      return isRead(this.readTargetMessage, this.user);
    },
    isReadText:function(){
      return this.isReadFlag ? "확인" : "미확인";
    },
    profileImage: function () {
      if (this.user.photo) {
        return `background-image: url(${this.user.photo})`;
      } else {
        return `background-image: url(${this.$store.state.userProfileDefault})`;
      }

    },
    userName: function () {
      return this.user.name
    }
  },
  methods: {},
  mounted() {
    this.$nextTick(() => {
      this.$jqueryUtil.scrollbar();
    });

  },
}
</script>

<style scoped></style>
