<template>
  <div class="survey__heading">
    <textarea
      ref="questionTitleTextarea"
      placeholder="질문을 입력하세요"
      v-model="surveyEditQuestions.questionTitle"
      @input="inputQuestionTitle($event)"
    ></textarea>
    <span class="bar"></span>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "survey-create-body-question-title",
  data() {
    return {
      prevQuestionTitle: ''
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyEditQuestions: 'surveyEditQuestions'
    }),
  },
  watch: {
    'surveyEditQuestions.questionId'() {
      setTimeout(() => {
        if (this.$refs.questionTitleTextarea) {
          this.$hiClass.textareaAutoResize(this.$refs.questionTitleTextarea, 30)
        }
      }, 50)
    }
  },
  mounted() {
    this.prevQuestionTitle = this.surveyEditQuestions.questionTitle
    setTimeout(() => {
      if (this.$refs.questionTitleTextarea) {
        this.$hiClass.textareaAutoResize(this.$refs.questionTitleTextarea, 30)
      }
    }, 50)
  },
  methods: {
    inputQuestionTitle(e) {
      let value = e.target.value
      if ([...value].length > 250) {
        value = this.prevQuestionTitle
      }

      this.surveyEditQuestions.questionTitle = value
      this.prevQuestionTitle = value

      this.$hiClass.textareaAutoResize(this.$refs.questionTitleTextarea, 30)
    }
  }
}
</script>

<style scoped>

</style>