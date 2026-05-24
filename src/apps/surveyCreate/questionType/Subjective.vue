<template>
  <!-- 주관식 타입 -->
  <div class="survey-create__box">

    <survey-create-body-question-tag />
    <survey-create-body-question-title />
    <survey-create-body-question-description />
    <survey-create-body-question-upload />

    <textarea
      class="textareabox subjective"
      placeholder="응답자가 직접 입력하는 영역입니다."
      disabled
    ></textarea>

  </div>

</template>

<script>
import SurveyCreateBodyQuestionTitle from "@/apps/surveyCreate/SurveyCreateBodyQuestionTitle";
import SurveyCreateBodyQuestionUpload from "@/apps/surveyCreate/SurveyCreateBodyQuestionUpload";
import {mapActions, mapMutations, mapState} from "vuex";
import SurveyCreateBodyQuestionDescription from "@/apps/surveyCreate/SurveyCreateBodyQuestionDescription.vue";
import SurveyCreateBodyQuestionTag from "@/apps/surveyCreate/SurveyCreateBodyQuestionTag.vue";

export default {
  name: "survey-create-question-type-subjective",
  components: {
    SurveyCreateBodyQuestionTag,
    SurveyCreateBodyQuestionDescription,
    SurveyCreateBodyQuestionUpload,
    SurveyCreateBodyQuestionTitle
  },
  data() {
    return {
      pageModel: {
        linkPage: {
          pageId: undefined,
          pageName: undefined,
          sortNo: undefined
        }
      },
      questionModel: {
        isValidated: undefined,
        questionType: undefined,
        questionTitle: undefined,
      }
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyEditQuestions: 'surveyEditQuestions',
      surveyEditPages: 'surveyEditPages',
    }),
  },
  watch: {
    surveyEditQuestions: {
      async handler() {
        this.setIsChangedSurveyEditQuestions(true)

        const surveyEditQuestions = this.surveyEditQuestions
        this.questionModel.isValidated = await this.getIsValidatedByStateSurveyEditQuestions()
        this.questionModel.questionType = surveyEditQuestions.questionType
        this.questionModel.questionTitle = surveyEditQuestions.questionTitle

        this.pageModel.linkPage.pageId = surveyEditQuestions.linkPageId
      },
      deep: true
    },
    questionModel: {
      handler() {
        const pageId = this.surveyEditQuestions.pageId
        const questionId = this.surveyEditQuestions.questionId
        // lnbPages.question 매핑 후 수정
        const curPage = this.surveyEditPages.find(page => page.pageId === pageId)
        if (curPage) {
          const curQuestion = curPage.questions.find(question => question.questionId === questionId)
          if (curQuestion) {
            curQuestion.isValidated = this.questionModel.isValidated
            curQuestion.questionType = this.questionModel.questionType
            curQuestion.questionTitle = this.questionModel.questionTitle
          }
        }
      },
      deep: true
    },
    pageModel: {
      handler() {
        const pageId = this.surveyEditQuestions.pageId
        // lnbPages 매핑 후 수정
        const curPage = this.surveyEditPages.find(page => page.pageId === pageId)
        if (curPage) {
          if (curPage.linkPage) {
            curPage.linkPage.pageId = this.pageModel.linkPage.pageId
          } else {
            this.$set(curPage, 'linkPage', this.pageModel.linkPage)
          }
        }
      },
      deep: true
    },
  },
  mounted() {
    this.setIsChangedSurveyEditQuestions(false)
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setIsChangedSurveyEditQuestions: 'setIsChangedSurveyEditQuestions'
    }),
    ...mapActions('storeSurvey', {
      getIsValidatedByStateSurveyEditQuestions: 'getIsValidatedByStateSurveyEditQuestions'
    })
  }
}
</script>

<style scoped>

</style>