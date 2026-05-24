<template>
  <!-- 주관식 타입 -->
  <div>
    <div class="group-label">
      <span
        v-if="isShowRequiredLabel"
        class="label required"
      >
        {{ firstLabelName }}
      </span>
    </div>

    <div class="survey__heading">
      <strong class="heading-sub">{{ questionTitle }}</strong>
    </div>
    <question-description :question="question" />
    <question-img :question="question" />
    <survey-response-textarea-box
      :is-read-only="false"
      :question="question"
      :isRecommendTemplate="isRecommendTemplate"
    />
    <span v-if="this.index !== this.questions.length-1" class="groupbar"></span>
  </div>
</template>

<script>
import SurveyResponseTextareaBox from "@/apps/surveyResponse/components/TextareaBox";
import QuestionImg from "@/apps/surveyResponse/questionType/components/QuestionImg";
import QuestionDescription from "@/apps/surveyResponse/questionType/components/Description";

export default {
  name: "survey-response-question-type-subjective",
  components: {
    SurveyResponseTextareaBox,
    QuestionDescription,
    QuestionImg
  },
  props: {
    question: {
      type: Object,
      required: true
    },
    questions: {
      type: Array,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    isRecommendTemplate: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isShowRequiredLabel() {
      return this.question.isRequired
    },
    firstLabelName() {
      return '필수응답'
    },
    questionTitle() {
      return this.question.questionTitle
    },
    questionFiles() {
      return this.question.files
    },
  }
}
</script>

<style scoped>

</style>