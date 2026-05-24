<template>
  <div class="q-card-actions" :class="alignmentClass">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'QCardActions',
  props: {
    align: {
      type: String,
      default: 'right', // 기본 정렬: 오른쪽
      validator: (value) => ['left', 'center', 'right', 'between'].includes(value)
    }
  },
  computed: {
    alignmentClass() {
      switch (this.align) {
        case 'left':
          return 'q-card-actions--align-left';
        case 'center':
          return 'q-card-actions--align-center';
        case 'right':
          return 'q-card-actions--align-right';
        case 'between':
          return 'q-card-actions--align-between';
        default:
          return '';
      }
    }
  }
};
</script>

<style scoped>
.q-card-actions {
  display: flex;
  padding: 8px;
  border-top: 1px solid #e0e0e0;
}

.q-card-actions--align-left {
  justify-content: flex-start;
}

.q-card-actions--align-center {
  justify-content: center;
}

.q-card-actions--align-right {
  justify-content: flex-end;
}

.q-card-actions--align-between {
  justify-content: space-between;
}
</style>