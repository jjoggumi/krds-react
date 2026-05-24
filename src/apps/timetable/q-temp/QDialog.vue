<template>
  <div v-if="value" class="q-dialog-backdrop" @click.self="close">
    <div class="q-dialog"
      :class="customClass"
      :style="customStyle"
    >
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'QDialog',
  props: {
    value: {
      type: Boolean,
      required: true
    },
    persistent: {
      type: Boolean,
      default: false // true일 경우, backdrop 클릭으로 다이얼로그가 닫히지 않음
    },
    customClass: {
      type: [String, Array, Object],
      default: ''
    },
    customStyle: {
      type: Object,
      default: () => ({})      
    }
  },
  methods: {
    close() {
      console.log('close');
      if(this.persistent) {
        return; // persistent가 true인 경우, 닫지 않음
      }
      this.$emit('input', false); // v-model을 통해 다이얼로그 닫기
    }
  },
  mounted() {
    
  },
  watch: {
    value(newValue) {
      if(!newValue) {
        console.log('watch --->', newValue);
        this.$emit('input', false);
      }       
    }
  }
};
</script>

<style scoped>
/* 배경 어둡게 처리 */
.q-dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 다이얼로그 스타일 */
.q-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  padding: 16px;
  max-width: 90%;
  /* width: 500px; */
  width: 100%;
  height: 100%;
  z-index: 1001;
}
</style>