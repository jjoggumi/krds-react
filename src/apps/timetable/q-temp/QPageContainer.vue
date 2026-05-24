<template>
  <div class="q-page-container">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'QPageContainer'
}
</script>

<style scoped>
.q-page-container {
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  font-size: 16px;
}
</style>
