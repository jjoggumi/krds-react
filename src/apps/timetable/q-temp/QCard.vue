<template>
  <div class="custom-card" :class="$attrs.class" :style="$attrs.style">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'QCard',
  inheritAttrs: false,
}
</script>

<style scoped>
.custom-card {
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background: white;
  /* overflow: hidden; */
}
</style>
