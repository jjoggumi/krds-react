<!--
@File(Method): ShareReportHistoryDetail.vue
@Date Created: 2025-12-08
@Description: 하이톡 > 대화목록 > 공유메세지 [shareType: CLASSROOM, classRoomType: REPORT]
@Modified: -
-->
<template>
  <div class="report-history-detail-wrap" style="display: block">
    <div class="title-area">
      <p>포인트 리포트</p>
      <button @click="closeReportHistoryDetail"><HiIcon name="ico-close" size="24" /></button>
    </div>
    <ReportHistoryDetailContent :reportId="reportId" :classroomId="classroomId" viewType="hitalk" />
  </div>
</template>

<script>
import ReportHistoryDetailContent from '@/apps/behavior/pages/records/ReportHistoryDetailContent.vue';
export default {
  name: 'share-report-history-detail',
  components: { ReportHistoryDetailContent },
  props: {
    reportId: String,
    classroomId: String,
  },
  methods: {
    // 리포트 상세 팝업 닫기
    closeReportHistoryDetail() {
      this.$emit('closeShareReportHistoryDetail');
    },
  },
};
</script>

<style scoped lang="scss">
.report-history-detail-wrap {
  overflow: hidden;
  z-index: 1000;
  position: absolute;
  right: 0;
  top: 0;
  width: calc(100% - 411px);
  height: 100vh;
  background-color: #fff;
  .title-area {
    height: 70px;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 25px;
    p {
      font-size: 20px;
      font-weight: 600;
      line-height: 150%;
      color: #222;
    }
    button {
    }
  }
}
</style>
