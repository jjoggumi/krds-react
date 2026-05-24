<template>
  <!-- dis 클래스 붙이면 비활성화 -->
  <div
    class="font-size-range"
    :class="{
      dis: false
    }"
  ></div>
</template>

<script>
import { eventBus } from '@/main'

export default {
  name: 'note-board-zoom',
  props: {
    model: {
     type: Object
    }
  },
  data() {
    return {}
  },
  computed: {
    postVersion() {
      return this.model.version || 'V1'
    },
    sliderOption() {
      const ZOOM_RATE = this.$store.state.storeEditor.edit.initZoomValueV2

      return {
        value: this.postVersion === 'V2' ? 100 * ZOOM_RATE : 100,
        min: this.postVersion === 'V2' ? 100 * ZOOM_RATE : 100,
        max: this.postVersion === 'V2' ? 200 * ZOOM_RATE : 200,
        step: this.postVersion === 'V2' ? 10 * ZOOM_RATE : 10,
      }
    }
  },
  mounted() {
    // 폰트 일괄 처리 slider
    this.$nextTick(() => {
      this.editorFontRange()

      eventBus.$on('editor-set-slider-value', value => {
        $('.font-size-range').slider('value', value)
      })
    })
  },
  beforeDestroy() {
    eventBus.$off('editor-set-slider-value')
  },
  methods: {
    editorFontRange() {
      $('.font-size-range').slider({
        value: this.sliderOption.value,
        min: this.sliderOption.min,
        max: this.sliderOption.max,
        step: this.sliderOption.step,
        orientation: 'horizontal',
        range: 'min',
        animate: true,
        slide: function(event, ui) {
          let rate = parseInt(ui.value, 10) / 100

          eventBus.$emit('editor-set-content-zoom', { zoom: rate })
        }
      })
    }
  }
}
</script>

<style scoped></style>
