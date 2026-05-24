<!--
@File(Method): ReportHistoryDetailPdfTemplate.vue
@Date Created: 2025-12-11
@Description: 학급기록 > 학생 리포트 > 리포트 내역 > PdfDownload 용 히든 컴포넌트
-->

<template>
  <div class="report-history-detail-wrap">
    <ReportHistoryDetailContent
      :classroomId="classroomId"
      :reportId="reportId"
      @reportHistoryDetailReady="onReportHistoryDetailReady"
      viewType="pdf"
    />
  </div>
</template>

<script>

import ReportHistoryDetailContent from '@/apps/behavior/pages/records/ReportHistoryDetailContent.vue';

export default {
  name: 'report-history-detail-pdf-template',
  components: { ReportHistoryDetailContent },

  props: {
    reportId: String,
    classroomId: String,
  },

  data() {
    return {};
  },

  methods: {
    onReportHistoryDetailReady() {
      this.$emit('reportHistoryDetailReady');
    }
  },
};
</script>