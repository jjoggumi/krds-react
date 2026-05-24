<template>
  <ul>
    <member-notice-list v-if="noticeClassList.length > 0 && !memberSearchItem.searchType.includes('TAG')" />
    <member-class-user-list
      v-for="classItem in sortedClassList"
      :key="`${classItem.classId}-class`"
      :classItem="classItem"
      :memberSearchItem="memberSearchItem"
      @closeShareReportHistoryDetail="onCloseShareReportHistoryDetail"
    />
  </ul>
</template>

<script>
import MemberNoticeList from "@/apps/hitalk/components/tabs/member/MemberNoticeList";
import MemberClassUserList from "@/apps/hitalk/components/tabs/member/MemberClassUserList";
import {mapGetters} from "vuex";

export default {
  name: "MemberClassList",
  components: {MemberClassUserList, MemberNoticeList},
  props: {
    memberSearchItem: {
      type: Object
    }
  },
  computed: {
    ...mapGetters('storeHitalk', [
      'noticeClassList',
      'sortedClassList' // #74447
    ]),
  },
  methods: {
    onCloseShareReportHistoryDetail() {
      this.$emit('closeShareReportHistoryDetail');
    },
  },
}
</script>

<style scoped>

</style>