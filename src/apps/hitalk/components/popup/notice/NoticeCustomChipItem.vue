<template>
  <div class="mem-noti-peo">
    <span>
      {{userName}}
    </span>
    <button
        class="delete-btn"
        tabindex="0"
        @click="deleteNoticeCustomChip"
    ></button>
  </div>
</template>

<script>
import {mapMutations} from "vuex";

export default {
  props: {
    user: Object
  },
  computed: {
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
  },
  methods: {
    ...mapMutations("storeHitalk",[
      "deleteNoticeTargetUser",
    ]),
    deleteNoticeCustomChip: function () {
      this.deleteNoticeTargetUser(this.user);
    },
  },
}
</script>

<style scoped></style>
