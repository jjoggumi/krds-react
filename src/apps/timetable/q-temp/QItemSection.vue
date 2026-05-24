<template>
  <div class="q-item-section">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'QItemSection'
};
</script>

<style scoped>
.q-item-section {
  font-size: 14px;
  color: #333;
}
</style>