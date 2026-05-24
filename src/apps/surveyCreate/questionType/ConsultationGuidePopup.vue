<template>
  <div class="floating-guide-popup" id="guidePopup" v-if="!isNotToday">
    <div class="inner">
      <div class="top">
        <a href="javascript:;" @click="openPdfViewer">
          <img src="@/assets/img/guide_popup_survey.png">
        </a>
      </div>
      <div class="bottom">
        <span class="checkbox"></span>
        <button
          type="button"
          class="btn-close"
          @click="setConsultationGuideNotToDay(true)"
        >
          오늘 다시 보지 않음
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "consultation-guide-popup",
  data() {
    return {
      isNotToday: false
    }
  },
  computed: {
    today() {
      return this.$moment().format('YYYYMMDD')
    }
  },
  methods: {
    initConsultationGuideNotToDay() {
      const storage = JSON.parse(localStorage.getItem('consultationGuideNotToDay'))

      if (storage && storage[this.today]) {
        this.isNotToday = storage[this.today]
      } else {
        this.setConsultationGuideNotToDay(false)
      }
    },
    setConsultationGuideNotToDay(flag) {
      const item = {}
      item[this.today] = flag
      this.isNotToday = flag
      localStorage.setItem('consultationGuideNotToDay', JSON.stringify(item))
    },
    openPdfViewer() {
      const consultationGuideUrl = 'https://download.hiclass.net/static/document/survey_consultation_guide.pdf'
      window.open(consultationGuideUrl, 'consultation-guide', 'width=900, height=888, scrollbars= 0, resizable=0');
    }
  },
  mounted() {
    this.initConsultationGuideNotToDay()
  }
}
</script>

<style scoped>

</style>