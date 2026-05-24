<template>
  <!-- main-body-home || other route components (main children) -->
  <router-view
    v-if="$store.state.user.currentId"
    :user="user"
    :isTempStudent="isTempStudent"
    :isLoadComplete="isLoadComplete"
  />
</template>

<script>
export default {
  name: "main-body",
  props: {
    user: {
      type: Object
    },
    isTempStudent: {
      type: Boolean
    },
    isLoadComplete: {
      type: Boolean
    },
  }
}
</script>

<style scoped>

</style>