<template>
  <div class="survey__froala">

    <hc-survey-editor
      placeholder="설명을 입력하세요."
      :prop-value.sync="surveyEditQuestions.questionDescription"
      @inputDescription="inputDescription"
    />

  </div>
</template>

<script>
import {mapState,mapMutations} from "vuex";
import HcSurveyEditor from "@/components/Editor/HcSurveyEditor.vue";

export default {
  name: "survey-create-body-question-description",
  components: {HcSurveyEditor},
  computed: {
    ...mapState('storeSurvey', {
      surveyEditQuestions: 'surveyEditQuestions',
      surveyEditQuestionsEditDescription: 'surveyEditQuestionsEditDescription'
    })
  },
  watch: {
  },
  mounted() {
    this.setSurveyEditQuestionsEditDescription(this.surveyEditQuestions.questionDescription)
  },
  beforeDestroy() {
    this.setSurveyEditQuestionsEditDescription(null)
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setSurveyEditQuestionsEditDescription: 'setSurveyEditQuestionsEditDescription'
    }),
    inputDescription(v) {
      this.setSurveyEditQuestionsEditDescription(v)
    }
  }
}
</script>

<style scoped></style>