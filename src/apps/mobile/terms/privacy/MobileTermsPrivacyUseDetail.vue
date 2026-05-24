<template>
  <div>
    <div class="terms-detail-header">
      <HiButton class="terms-detail-back" color="link" @click="goBack">
        <HiIcon name="ico-prev" size="24" class="p-05"/>
      </HiButton>
      <h1>{{ resolvedHeaderTitle }}</h1>
    </div>
    <div class="modal normal-modal safety-num-modal" style="display: block;">
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
    </div>
  </div>
</template>

<script>
import TermsPrivacyUseDetail from "@/components/Terms/TermsPrivacyUseDetail.vue";
export default {
  name: "mobile-terms-privacy-use-detail",
  components: {TermsPrivacyUseDetail},
  data() {
    return {
      targetMonth: ''
    }
  },
  computed: {
    resolvedHeaderTitle() {
      return '광고사업자 자세히보기'
    }
  },
  created() {
    this.targetMonth = this.$route.query.targetMonth
  },
  methods: {
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.terms-detail-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 52px;
  padding: 0 18px;
  background: #ffffff;
}

.terms-detail-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  color: #111111;
}

.terms-detail-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  min-width: 24px;
  height: 24px;
}

.modal-cont-wrap.modal-agree .boundary-box {
  height: calc(100vh - 52px);
  padding-top: 62px;
}
</style>
