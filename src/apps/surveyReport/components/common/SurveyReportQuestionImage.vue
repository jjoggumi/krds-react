<template>
  <div class="attachment__list">
    <div class="attachment__item" v-for="file in questionFiles" :key="file.fileId">
      <div class="alignbox" :class="file.fileAlign.toLowerCase()">
        <div class="image">
          <img :src="file.fileOriginalPath">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "survey-report-question-image",
  props: {
    questionFiles: {
      type: Array
    }
  }
}
</script>

<style scoped>

</style>