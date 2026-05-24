<template>
  <div class="survey__froala" v-html="questionDescription">
  </div>
</template>

<script>
export default {
  name: "survey-report-question-description",
  props: {
    questionDescription: {
      type: String
    }
  }
}
</script>

<style scoped>

</style>