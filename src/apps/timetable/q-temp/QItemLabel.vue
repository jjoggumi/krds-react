<template>
  <div
    class="q-item-label"
    :class="{ 'q-item-label--caption': caption }"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'QItemLabel',
  props: {
    caption: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.q-item-label {
  font-size: 16px;
  color: #333;
}

.q-item-label--caption {
  font-size: 12px;
  color: #999;
}
</style>