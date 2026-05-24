<template>
  <div class="gray-box02 use-detail">
    <h2>
      <button v-if="isShowPrev" @click="goPrev" class="btn-prev">이전</button>
      <span>{{ curIndex === 0 ? '2025년 7월 이전' : $moment(targetMonth).format('YYYY년 MM월')}}</span>
      <button v-if="isShowNext" @click="goNext" class="btn-next">다음</button>
    </h2>
    <div class="table-wrap" v-html="content"></div>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";

export default {
  name: "TermsPrivacyUseDetail",
  data() {
    return {
      content: '',
      targetMonth: ''
    }
  },
  props: {
    propsTargetMonth: { type: String, required: false }
  },
  computed: {
    ...mapState(['termsRecord']),
    ...mapGetters(['getRecentPrivacyUseDetailRecord']),
    curIndex() {
      return this.termsRecord.privacyUseDetailRecord.findIndex(r => r.toString() === this.targetMonth)
    },
    isShowPrev() {
      return this.termsRecord.privacyUseDetailRecord.findIndex(r => r.toString() === this.targetMonth) > 0
    },
    isShowNext() {
      return this.termsRecord.privacyUseDetailRecord.findIndex(r => r.toString() === this.targetMonth) < this.termsRecord.privacyUseDetailRecord.length - 1
    }
  },
  mounted() {
    this.targetMonth = this.propsTargetMonth || this.getRecentPrivacyUseDetailRecord
    this.getPrivacyUseDetail()
  },
  methods: {
    async getPrivacyUseDetail() {
      const detailRes = await this.$terms.getPrivacyUseDetail(this.targetMonth)
      this.content = this.$terms.parsingHtml(detailRes.data)
      const head = this.$terms.parsingHtmlGetHead(detailRes.data)
      document.title = head.getElementsByTagName('title')[0].textContent || '광고사업자 자세히보기'
    },
    goPrev() {
      if (this.curIndex > 0) {
        this.targetMonth = this.termsRecord.privacyUseDetailRecord[this.curIndex - 1].toString()
        this.getPrivacyUseDetail()
      }
    },
    goNext() {
      if (this.curIndex < this.termsRecord.privacyUseDetailRecord.length - 1) {
        this.targetMonth = this.termsRecord.privacyUseDetailRecord[this.curIndex + 1].toString()
        this.getPrivacyUseDetail()
      }
    }
  }
}
</script>
<style scoped>
</style>