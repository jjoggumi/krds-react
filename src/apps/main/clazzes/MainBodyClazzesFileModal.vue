<template>
  <div class="hi-modal-common modal-progressbar" style="display: block">
    <div class="modal__dim"></div>
    <div class="modal__layer">
      <div class="modal__header">
        <h2 class="heading">전체 파일을 선택 중입니다.<br>잠시만 기다려주세요.</h2>
        <button class="btn-close" @click="onCloseModal"></button>
      </div>
      <div class="modal__content">
        <p>{{`${filesCount}/${totalCount}`}}</p>
        <div class="progressbar">
          <span class="bar" :style="{'width': loadingProgress + '%'}"></span>
        </div>
      </div>
      <div class="modal__footer">
        <div class="group-btn">
          <button class="btn-cancel" @click="onCloseModal">취소</button>
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
    count: {
      type: Number,
      required: true
    }
  },
  watch: {
    '$store.state.storeBoard.progress': {
    handler: 'handleProgressChange',
    immediate: true,
  },
  },
  computed: {
    totalCount() {
      return this.$store.state.storeBoard.boardFileTotalCount
    },
  },
  methods: {
    onCloseModal() {
      this.$emit('closeModal')
    },
    handleProgressChange(newVal) {
      this.loadingProgress = Math.floor(newVal);
      this.filesCount = Math.floor(this.totalCount/100 * this.loadingProgress);
    },
    getFileCount(){
      return this.totalCount/100 * this.loadingProgress;
    }
  }

}
</script>

<style scoped>

</style>