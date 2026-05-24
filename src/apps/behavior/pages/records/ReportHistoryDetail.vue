<!--
@File(Method): ReportHistory.vue
@Date Created: 2025-12-02
@Description: 학급기록 > 학생 리포트 > 리포트 내역 > 상세 모달
-->

<template>
  <div class="report-history-detail-wrap">
    <div class="record-recording__top">
      <div class="close" @click="closeLayer">
        <i class="bh-icon-arrowright-24 cursor-pointer"></i>
        <span>내용 접기</span>
      </div>
      <div class="more" v-click-outside="closeMoreLayer">
        <i class="bh-plus-morevert-32 cursor-pointer" @click="toggleMoreLayer"></i>
        <ul v-if="isOpenMoreLayer" style="display: block">
          <li v-if="mode === 'view'" @click="onClickPdfDownloadMenu">PDF 다운로드</li>
          <li v-if="mode === 'view'" @click="onClickHitalkShareMenu">하이톡 공유</li>
          <li @click="onClickDeleteMenu" class="del">리포트 삭제하기</li>
        </ul>
      </div>
    </div>

    <ReportHistoryDetailContent
      :classroomId="classroomId"
      :reportId="reportId"
      @start-edit="startEdit"
      @cancel-edit="cancelEdit"
      @close="closeLayer"
      @tempReportHistory="onTempReportHistory"
      @save="saveReportHistory"
    />

    <confirm-modal
      v-if="confirmModal.isOpen"
      :title="confirmModal.title"
      :description="confirmModal.description"
      :confirmButtonText="confirmModal.confirmButtonText"
      :confirmButtonColor="confirmModal.confirmButtonColor"
      @closeConfirmDialog="closeConfirmModal"
    />
    <!--  pdf 다운로드일때는  :viewType="pdf"  props 추가 -->
  </div>
</template>

<script>
import ReportHistoryDetailContent from './ReportHistoryDetailContent.vue';
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue';
import { eventBus } from '@/main';
import { 
  deleteClassroomReportStudents,
 } from '@hiclass/core';

export default {
  name: 'report-history-detail',
  components: { ReportHistoryDetailContent, ConfirmModal },

  props: {
    reportId: String,
    classroomId: String,
    targetStudent: Object,
  },

  data() {
    return {
      reportHistory: {},
      isOpenMoreLayer: false,
      mode: 'view',
      confirmModal: {
        isOpen: false,
        title: '',
        description: '',
        confirmButtonText: '',
        confirmButtonColor: '#F04F59',
        params: null,
        action: '',
      },
    };
  },

  methods: {
    // detail 모달 닫기
    closeLayer() {
      this.$emit('close');
    },

    // detail 모달 더보기 토글
    toggleMoreLayer() {
      this.isOpenMoreLayer = !this.isOpenMoreLayer;
      console.log(this.isOpenMoreLayer);
    },

    // detail 모달 더보기 닫기
    closeMoreLayer() {
      if (this.isOpenMoreLayer) {
        this.isOpenMoreLayer = false;
      }
    },

    onClickPdfDownloadMenu() {
      eventBus.$emit("pdfdownload-reportHistoryDetail",this.reportHistory);
    },

    onClickHitalkShareMenu() {
      this.$emit('close');
      eventBus.$emit("share-reportHistoryDetail",this.reportHistory);
    },

    onClickDeleteMenu() {
      this.confirmModal.title = '리포트를 삭제하시겠습니까?<br>삭제된 내역은 복원이 불가합니다.';
      this.confirmModal.action = 'delete';
      this.confirmModal.isOpen = true;
    },

    closeConfirmModal: async function (isConfirm) {
      if(isConfirm) {
        if(this.confirmModal.action === 'delete') {
          await deleteClassroomReportStudents(this.classroomId, this.reportId);
          eventBus.$emit("delete-reportHistoryDetail",{ reportId: this.reportId });
          this.closeLayer();
        } 
      }
      this.confirmModal = {
        ...this.confirmModal,
        isOpen: false,
      };
    },

    onTempReportHistory(data) {
      this.reportHistory = data;
    },

    saveReportHistory(payload) {
      this.mode = 'view';
      this.$emit("saveReportHistory", payload);
    },
    cancelEdit(payload) {
      this.mode = 'view';
      this.$emit("cancelEdit", payload);
    },
    startEdit(payload) {
      this.mode = 'update';
      this.$emit("startEdit", payload);
    },
  },
};
</script>

