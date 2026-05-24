<template>
  <div
    class="worksheet-container"
    :class="{
      'add-top-attachment': curClazzApply.model.files.length > 0
    }"
  >
    <worksheet-submit-body
      v-if="curClazzApply.model.sheetId && isRenderSubmitBody"
      :worksheetApplyViewType="CONSTANTS.WORKSHEET_APPLY.DETAIL"
      :isPC="true"
    />
  </div>
</template>

<script>
import '@/assets/css/worksheets.scss';

import {mapFields} from "vuex-map-fields";
import {eventBus} from "@/main";
import {mapActions, mapGetters, mapState} from "vuex";
import WorksheetSubmitBody from '@/apps/worksheetSubmit/WorksheetSubmitBody'
import {updateClazzApplyStatus, updateMedicationOrderStatus} from "@hiclass/core";

export default {
  name: "worksheet-apply-detail",
  props: {
  },
  components: {WorksheetSubmitBody},
  data() {
    return {
      // submitbody를 다시 렌더시키기위한 플래그
      isRenderSubmitBody: true,
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      getApplyTypeNameByCode: "getApplyTypeNameByCode",
    }),
    ...mapFields({
      isDimLoading: 'isDimLoading'
    }),
    ...mapFields('storeWorksheet', {
      curClazzApply: 'curClazzApply'
    }),
    ...mapState({
      user: 'user',
    }),
  },
  created() {
    if (!this.curClazzApply.model.sheetId) {
      this.$hiClass.alert('잘못된 요청입니다.')
        .then(() => {
          this.$router.back()
        })
    }
  },
  mounted() {
    eventBus.$on('refresh-worksheet', this.reRenderIframe)
    window.addEventListener('message', this.handleWorksheetIframeTask)
  },
  beforeDestroy() {
    eventBus.$off('refresh-worksheet', this.reRenderIframe)
    window.removeEventListener('message', this.handleWorksheetIframeTask)
  },
  destroyed() {
  },
  methods: {
    ...mapActions('storeWorksheet', {
      initCurClazzApply: 'initCurClazzApply',
    }),
    async reRenderIframe() {
      this.isRenderSubmitBody = false;
      await new Promise(resolve => setTimeout(resolve, 100))
      this.isRenderSubmitBody = true;
    },
    async handleWorksheetIframeTask(e) {
      if (e.data !== null && e.data !== undefined && e.data !== '') {
        if (e.data.command === 'toggle-download-loading') {
          this.isDimLoading = e.data.value
        }
      }
    },
    // 부모 컴포넌트(WorksheetApply) 에서 refs 로 호출, 확인요청 상태일때 담임의견 작성쪽에서 실행 한다.
    async save() {
      try {
        await updateClazzApplyStatus(this.curClazzApply.model.id, 'REJECT')

        this.$toasted.clear()
        this.$toasted.show('저장되었습니다.')
        // 워크시트 새로고침
        await this.reRenderIframe()
        // 담임의견 부분 새로고침
        eventBus.$emit('refresh-apply-rejects')
      } catch (e) {
        console.log(e)
        this.$hiClass.alert(`상태 변경에 실패하였습니다. 다시 시도해주세요.`, "error")
      }
    },
  },



}
</script>

<style scoped>
.worksheet-form-title .required::after {
  content: "*";
  color: #ff6a6a;
}
</style>