<template>
  <!-- 서명 타입 -->
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
    <div v-if="isShowSignBox">
      <survey-response-sign-box
        :question="question"
      />
    </div>
    <span v-if="this.index !== this.questions.length-1" class="groupbar"></span>
  </div>
</template>

<script>
import SurveyResponseSignBox from "@/apps/surveyResponse/components/SignBox";
import QuestionImg from "@/apps/surveyResponse/questionType/components/QuestionImg";
import QuestionDescription from "@/apps/surveyResponse/questionType/components/Description";

import {mapGetters} from "vuex";
export default {
  name: "survey-response-question-type-sign",
  components: {
    SurveyResponseSignBox,
    QuestionDescription,
    QuestionImg,
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
    }
  },
  computed: {
    ...mapGetters('storeSurvey', {
      curSurveyAnswer: 'curSurveyAnswer',
    }),
    isShowRequiredLabel() {
      return this.question.isRequired
    },
    isShowSignBox() {
      return this.$store.state.storeSurvey.isSimulation ? true :
        this.curSurveyAnswer && Object.keys(this.curSurveyAnswer).length > 0
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