<template>
  <component
    :is="curForm"
    v-bind="componentProps"
    @closeLayer="handleCloseLayer"
  ></component>
</template>

<script>
import TermsView from "@/components/Terms/TermsView.vue";
import PrivacyUseDetail from '@/apps/mobile/terms/privacy/MobileTermsPrivacyUseDetail.vue'

export default {
  name: "MobileTerms",
  components: {
    TermsView,
    PrivacyUseDetail,
  },
  data() {
    return {
      curForm: '',
      componentProps: {}
    }
  },
  watch: {
    $route() {
      this.setComponent();
    }
  },
  methods: {
    getLayerType() {
      return this.$route.query.layerType || ''
    },
    getRouteId() {
      if (this.$route.params.id) {
        return this.$route.params.id
      }

      if (this.$route.path.startsWith('/mobile/terms/sensitive')) {
        return 'sensitive'
      }

      return ''
    },
    handleCloseLayer() {
      window.history.back()
    },
    setComponent() {
      const id = this.getRouteId();
      if (!id) {
        return
      }

      this.componentProps = {}

      const param = this.$route.params.param
      const layerType = this.getLayerType()

      switch (id) {
        case 'privacy':
        case 'privacyPolicy':
        case 'collectionPersonalInfo':
          if (param === 'preview') {
            this.curForm = 'TermsView'
            this.componentProps = {
              layerType: layerType || 'collectionPersonalInfoPreview',
              userType: this.$route.query.userType
            }
          } else {
            this.curForm = 'TermsView'
            this.componentProps = {
              layerType: layerType || 'privacyPolicy'
            }
          }
          break
        case 'privacy/preview':
          this.curForm = 'TermsView'
          this.componentProps = {
            layerType: layerType || 'collectionPersonalInfoPreview',
            userType: this.$route.query.userType
          }
          break
        case 'sensitive':
          if (!this.$route.params.param) {
            this.$router.replace({
              path: '/mobile/terms/sensitive/allergy',
              query: this.$route.query
            })
            break
          }

          if (this.$route.params.param === 'allergy') {
            this.curForm = 'TermsView'
            this.componentProps = {
              layerType: layerType || 'allergyRecord'
            }
          } else if (this.$route.params.param === 'healthy') {
            this.curForm = 'TermsView'
            this.componentProps = {
              layerType: layerType || 'medicationRecord'
            }
          } else {
            this.$router.replace({
              path: '/mobile/terms/sensitive/allergy',
              query: this.$route.query
            })
          }
          break
        case 'service':
        case 'serviceRecord':
        case 'terms':
          this.curForm = 'TermsView'
          this.componentProps = {
            layerType: layerType || 'serviceRecord'
          }
          break
        case 'privacyUseDetail':
          this.curForm = 'PrivacyUseDetail'
          this.componentProps = {}
          break
      }

      // query에 modalClass가 있으면 TermsView prop으로 전달
      if (this.curForm === 'TermsView' && this.$route.query.modalClass) {
        this.componentProps = {
          ...this.componentProps,
          modalClass: this.$route.query.modalClass
        }
      }

      document.title = {
        'privacy': '개인정보 처리 방침(필수)',
        'service': '서비스 이용약관',
        'privacyUseDetail': '광고사업자 자세히보기',
        'sensitive': '민감정보 수집 및 이용 동의'
      }[id] || '개인정보 처리방침'
    },
  },
  created() {
    this.setComponent()
  }
};
</script>

<style scoped lang="scss">
#wrap {
  /* 모바일 기준 */
  min-width: 100%;
}
</style>
