<template>
  <li>
    <member-title-bar title="공지하기" v-on:toggle="toggleList"/>
    <div class="list-cont-wrap" ref="notice-list">
      <ul class="notice-list-wrap">
        <member-notice-item
          v-for="classItem in noticeSortedClassList"
          :key="`${classItem.classId}-noticeClass`"
          :classItem="classItem"
        />
      </ul>
    </div>
  </li>
</template>

<script>
import MemberNoticeItem from "@/apps/hitalk/components/tabs/member/MemberNoticeItem";
import MemberTitleBar from "@/apps/hitalk/components/tabs/member/MemberTitleBar";
import {mapGetters} from "vuex";

export default {
  name: "MemberNoticeList",
  components: {MemberTitleBar, MemberNoticeItem},
  data: () => ({
    toggleFlag: false,
  }),
  computed: {
    ...mapGetters('storeHitalk',[
      'noticeSortedClassList' // #74447
    ]),
  },
  methods: {
    toggleList: function () {
      this.toggleFlag = !this.toggleFlag;
      if (this.toggleFlag) {
        $(this.$refs["notice-list"]).slideUp(200);
      } else {
        $(this.$refs["notice-list"]).slideDown(200);
      }
    },
  }
}
</script>

<style scoped>
.slide-up, .slide-down {
  --parent-height: 100vh;
  overflow: hidden;
}

.slide-up > div, .slide-down > div {
  margin-top: 0;
  transition: margin-top 0.5s ease-in-out;
}

.slide-up > div {
  margin-top: calc(-4 * var(--parent-height));
}
</style>