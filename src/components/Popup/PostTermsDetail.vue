<template>
  <!-- POPUP 약관 -->
  <div class="modal normal-modal safety-num-modal">
    <div
      v-click-outside="closeDetail"
      class="modal-cont-wrap modal-agree"
    >
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">{{ termsTitle }}</div>
          </div>
          <div class="gray-box02" v-html="termsHtml"></div>
        </div>
        <div class="modal-close-btn modal-close-icon" @click="closeDetail"></div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex";

import axios from 'axios'

export default {
  name: "post-terms-detail",
  data() {
    return {
      termsHtml: null
    }
  },
  computed: {
    ...mapState({
      curPostTerms: 'curPostTerms',
    }),
    termsTitle() {
      return this.curPostTerms.postOptions.find(o => o.name === 'termsTitle').value || ''
    },
    termsUrl() {
      return this.curPostTerms.postOptions.find(o => o.name === 'termsUrl').value || ''
    },
  },
  created() {
    if (this.termsUrl)
      this.getTermsContent()
  },
  methods: {
    ...mapMutations({
      setCurPostTerms: 'setCurPostTerms',
    }),
    closeDetail() {
      const payload = { isOpenDetail: false }
      this.setCurPostTerms(payload)
    },
    getTermsContent() {
      const prefix = this.termsUrl.includes('?') ? '&' : '?'
      axios({
        method: 'GET',
        url: this.termsUrl + prefix + 'timestamp=' + this.$moment().valueOf(),
        responseType: 'blob',
        headers: ''
      })
        .then(async res => {
          this.$log.debug(this.$options.name, 'getPrevTermsContent() res:', res)
          let blob = new Blob([res.data], { type: 'text/html' });
          if (blob) {
            this.termsHtml = await blob.text()
          }
        })
        .catch(err => {
          this.$hiClass.alert('유효하지 않은 약관 파일 URL 입니다.<br>다시 한번 확인해주세요.', 'warning')
          this.$log.error(this.$options.name, 'getPrevTermsContent() err:', err)
        })
    },
  }
}
</script>

<style lang="scss" scoped>
.modal {
  display: block;

  .gray-box02 ::v-deep * {
    font-size: 15px;
    font-family:  var(--font-body);
    font-weight: 400;
    color: #222222;
    line-height: 1.7 !important;

    strong {
      font-weight: 600;
    }
  }
}
@media screen and (max-width: 640px) {
  .modal .modal-agree .modal-cont .modal-cont-inner .modal-title-wrap {
    display: block !important;
    padding-bottom: 0.3em;
  }
  .modal .modal-close-btn.modal-close-icon {
    display: block !important;
  }
}
</style>