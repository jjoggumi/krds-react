<template>
  <div>
    <signature-pad
      :width="`${option.width}px`"
      :height="`${option.height}px`"
      :options="options"
      :customStyle="customStyle"
    ></signature-pad>

    <!-- init 로딩 -->
    <loading-overlay
      :active.sync="$store.state.isLoading"
      :can-cancel="false"
      :is-full-page="true"
      :color="'#4275df'"
      :backgroundColor="'rgba(90,90,90,0.5)'"
    />
  </div>
</template>

<script>

// vue-signature-pad : 20201126 ie 11 호환되지 않음
// import VueSignaturePad from 'vue-signature-pad';
// Vue.use(VueSignaturePad);

import SignaturePad from '@/components/SignaturePad/SignaturePad.vue'

import loadingOverlay from 'vue-loading-overlay'

export default {
  name: "signature-area",
  components: {
    SignaturePad,
    loadingOverlay,
  },
  props: {
    option: {
      type: Object,
      default() {
        return {
          width: 352,
          height: 150,
          isTips: true
        }
      }
    }
  },
  data() {
    return {
      userId: null,
      options: {}
    }
  },
  computed: {
    customStyle() {
      let customStyle = {
        background: `#f5f4f4 url(/files/img/img_sign.png) center center no-repeat`
      }

      if (!this.option.isTips) {
        customStyle.background = `#f5f4f4`
      }

      return customStyle
    }
  },
  created() {
    this.userId = localStorage.uuid

    if (!this.userId) {
      window.close()
    }

    this.options.onBegin = this.onBegin
    this.options.onEnd = this.onEnd
  },
  mounted() {
    window.onstorage = () => {
      if (!localStorage.uuid || localStorage.uuid !== this.userId) {
        this.$hiClass.alert('로그인 정보가 변경되었습니다.<br>창을 닫습니다.', 'info')
          .then(() => {
            window.close()
          })
      }
    }
  },
  destroyed() {},
  methods: {
    onBegin() {
      this.$log.debug('=== Begin ===');
      this.$emit('hide-tips')
    },
    onEnd() {
      this.$log.debug('=== End ===');
    },

  }
}
</script>

<style scoped></style>