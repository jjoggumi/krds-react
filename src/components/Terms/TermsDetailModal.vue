<template>
  <div class="modal-cont-wrap modal-agree detail-modal">
    <div class="modal-cont boundary-box">
      <div class="modal-cont-inner">
        <div class="modal-title-wrap">
          <div class="title">광고사업자 자세히보기</div>
        </div>
        <div>
          <TermsPrivacyUseDetail :props-target-month="targetMonth"/>
        </div>
        <div class="modal-close-btn modal-close-icon detail-modal-close-btn" @click="$emit('close')"></div>
      </div>
    </div>
  </div>
</template>

<script>
import TermsPrivacyUseDetail from "@/components/Terms/TermsPrivacyUseDetail.vue";
export default {
  name: "TermsDetailModal",
  components: {TermsPrivacyUseDetail},
  props: {
    targetMonth: { required: true }
  }
}
</script>
<style scoped>
</style>