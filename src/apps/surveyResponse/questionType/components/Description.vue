<template>
  <div class="survey__froala" v-if="localDescription" v-html="localDescription" />
</template>

<script>
export default {
  name: "QuestionDescription",
  props: {
    question: {
      type: Object
    }
  },
  data() {
    return {
      localDescription: ''
    }
  },
  mounted() {
    if (this.question.questionDescription) {
      this.localDescription = this.question.questionDescription
    }
  }
}
</script>

<style scoped>

</style>