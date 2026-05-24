<template>
  <div
    class="loading-infinite-scroll-wrap loading-attach"
    v-if="visible.fileUploadLoading"
  >
    <div class="icon"></div>
  </div>
</template>

<script>
export default {
  name: 'hiClass_Help_Upload_Loading',
  props: {
    visible: {
      type: Object
    }
  }
}
</script>
<style scoped>
.loading-attach {padding:20px 0 0 200px;} 
</style>