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
export default {
  name: "mobile-terms-privacy-preview",
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
      title: '개인정보 수집 및 이용 동의',
      parsingContent: '',
      userType: ''
    }
  },
  computed: {
    resolvedHeaderTitle() {
      return this.headerTitle || this.title
    }
  },
  created() {
    document.title = '개인정보 수집 및 이용 동의'
  },
  mounted() {
    this.userType = this.$route.query.userType || ''
    this.setTerms()
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    async setTerms() {
      try {
        const res = ['TEACHER', 'PARENTS', 'STUDENT'].includes(this.userType) ?
            await this.$terms.getPrivacyPreviewByUserType(this.userType) :
            await this.$terms.getPrivacyPreview()
        this.parsingContent = this.$terms.parsingHtml(res.data)
      } catch (err) {
        this.$log.warn(`privacyPreview load error `, err)
      }
    },
    handleClick(e) {
      const handleImages = [ 'a' ]
      const selector = handleImages.join(',')
      if (e.target.matches(selector)) {
        switch (e.target.id) {
          case 'go-to-privacy': {
            e.preventDefault()
            e.stopPropagation()
            this.$router.push({
              path: '/mobile/terms/privacy',
              query: this.$route.query
            })
            break
          }
        }
      }
    },
  }
}
</script>

<style scoped>
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
