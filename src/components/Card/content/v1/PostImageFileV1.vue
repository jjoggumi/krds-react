<template>
  <div
    v-if="imageFile.fileOriginalPath"
    role="button"
    class="image"
    @click="$emit('open-cur-image-viewer', index)"
  >
    <img :src="imageFile.fileOriginalPath" alt="">
  </div>
</template>

<script>
export default {
  name: "post-image-file-v1",
  props: {
    imageFile: {
      type: Object
    },
    index: {
      type: Number
    }
  }
}
</script>

<style scoped>

</style>