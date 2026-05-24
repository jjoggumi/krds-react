<template>
  <div class="hi-modal-common modal-progressbar" style="display: block">
    <div class="modal__dim"></div>
    <div class="modal__layer">
      <div class="modal__header">
        <slot name="title">
          <h2 class="heading">잠시만 기다려주세요.</h2>
        </slot>
      </div>
      <div class="modal__content">
        <p>{{`${current}/${total}`}}</p>
        <div class="progressbar">
          <span class="bar" :style="{'width': percent + '%'}"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MainBodyClazzesFileModal",
  data() {
    return {
      loadingProgress : 0,
      filesCount: 0,
    }
  },
  props: {
    total: {
      type: Number,
      required: true
    },
    current: {
      type: Number,
      required: true
    }
  },
  computed: {
    percent() {
      return this.current / this.total * 100;
    }
  }
}
</script>

<style scoped>

</style>