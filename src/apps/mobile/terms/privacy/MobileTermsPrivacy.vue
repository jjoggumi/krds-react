<template>
  <div
    :key="$moment().format('YYYY-MM-DD')"
    id="wrap"
    :class="['page-school-class', { 'with-mobile-header': showHeader }]"
  >
    <div v-if="showHeader" class="terms-detail-header">
      <HiButton v-if="showBackButton" class="terms-detail-back" color="link" @click="goBack">
        <HiIcon name="ico-prev" size="24" class="p-05"/>
      </HiButton>
      <h1>{{ resolvedHeaderTitle }}</h1>
    </div>
    <div class="modal normal-modal safety-num-modal" style="display: block;">
      <div class="modal-cont-wrap modal-agree">
        <div class="modal-cont boundary-box">
          <div class="modal-cont-inner">
            <div class="modal-title-wrap">
              <div v-html="title" class="title"></div>
            </div>
            <div
                v-html="parsingContent"
                @click="handleClick($event)"
                class="gray-box02"
            >
            </div>
          </div>
          <div class="modal-close-btn modal-close-icon"></div>
        </div>
      </div>
    </div>
    <div id="cont-wrap"></div>
  </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";

export default {
  name: 'mobile-terms-privacy',
  props: {
    showHeader: {
      type: Boolean,
      default: false
    },
    showBackButton: {
      type: Boolean,
      default: false
    },
    headerTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      title: '개인정보 처리 방침(필수)',
      parsingContent: ''
    }
  },
  computed: {
    ...mapState({
      termsRecord: 'termsRecord'
    }),
    ...mapGetters({
      getRecentPrivacyRecord: 'getRecentPrivacyRecord',
    }),
    currentPrivacyIndex() {
      return this.termsRecord.currentPrivacyIndex
    },
    resolvedHeaderTitle() {
      return this.headerTitle || this.title
    }
  },
  mounted() {
    // param이 있으면 해당 개정일의 약관을 보여주고, 없으면 가장 최신의 약관을 보여준다.
    if (this.$route.params.param) {
      this.findParamDateIndex(this.$route.params.param)
      this.setTerms(this.$route.params.param)
    } else {
      this.setInitCurrentPrivacyIndex()
      this.setTerms(this.getRecentPrivacyRecord)
    }
  },
  methods: {
    ...mapMutations({
      setInitCurrentPrivacyIndex: 'setInitCurrentPrivacyIndex',
      setTermsCurrentPrivacyIndex: 'setTermsCurrentPrivacyIndex',
      setTermsPrevPrivacyIndex: 'setTermsPrevPrivacyIndex'
    }),
    goBack() {
      this.$router.back()
    },
    setTerms(recordDate) {
      this.$terms.getPrivacy(recordDate).then(res => {
        this.parsingContent = ''
        setTimeout(() => {
          this.parsingContent = this.$terms.parsingHtml(res.data)
          const head = this.$terms.parsingHtmlGetHead(res.data)
          document.title = head.getElementsByTagName('title')[0].textContent || '개인정보 처리 방침(필수)'
        }, 50)
      }).catch(err => {
        this.$log.warn(`privacy_${recordDate} load error `, err)
      })
    },
    handleClick(e) {
      const handleEls = [ 'a' , 'button']
      const selector = handleEls.join(',')
      if (e.target.matches(selector)) {
        switch (e.target.id) {
          case 'go-to-old-privacy': {
            e.preventDefault()
            e.stopPropagation()

            let oldRecordDate = this.getPrevPrivacyDate()
            this.$router.push({
              path: `/mobile/terms/privacy/${oldRecordDate}`,
              query: this.$route.query
            })
            break
          }
          case 'go-terms-use-detail': {
            // 항상 최신 약관을 보여줌
            const targetMonth = this.termsRecord.privacyUseDetailRecord[this.termsRecord.privacyUseDetailRecord.length - 1].toString()
            this.$router.push({
              path: '/mobile/terms/privacyUseDetail',
              query: {
                ...this.$route.query,
                targetMonth
              }
            })
          }
        }
      }
    },
    /**
     * 현재 인덱스를 이전약관의 인덱스로 set, 이전약관을 가져온다.
     */
    getPrevPrivacyDate() {
      this.setTermsPrevPrivacyIndex()
      return this.termsRecord.privacyRecord[this.currentPrivacyIndex]
    },
    /**
     * param으로 받은 날짜가 개정날짜 배열에서 몇번째인지 찾은후 현재 인덱스로 set
     */
    findParamDateIndex(param) {
      let paramDateIndex = this.termsRecord.privacyRecord.findIndex(record => record === parseInt(param))
      this.setTermsCurrentPrivacyIndex(paramDateIndex)
    }
  },
  watch: {
    $route(from) {
      if (from.params.param) {
        this.setTerms(from.params.param)
      }
    }
  },
}
</script>

<style scoped>
#wrap {
  /* 모바일 기준 */
  min-width: 100%;
}

#wrap.with-mobile-header {
  padding-top: 52px;
}

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

#wrap.with-mobile-header .modal-cont-wrap.modal-agree .boundary-box {
  height: calc(100vh - 52px);
  padding-top: 62px;
}
</style>
