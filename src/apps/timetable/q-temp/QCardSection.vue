<template>
  <div class="custom-card-section" :class="$attrs.class" :style="$attrs.style">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'QCardSection',
  inheritAttrs: false,
}
</script>

<style scoped>
.custom-card-section {
  padding: 16px;
}
</style>
