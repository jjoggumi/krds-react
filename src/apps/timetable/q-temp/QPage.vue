<template>
  <div class="custom-page">
    <slot />
  </div>
</template>

<script setup>
// 아무 로직 없음, 기본 wrapper 역할
</script>

<style scoped>
.custom-page {
  flex: 1 1 auto;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: auto;
  font-size: 16px;
}
</style>