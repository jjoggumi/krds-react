<template>
  <div class="q-list">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'QList'
};
</script>

<style scoped>
.q-list {
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  list-style: none;
}
</style>