<template>
  <component
    :is="surveyCreateBodyComponentName"
  ></component>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import SETTING from "@/apps/surveyCreate/SurveyCreateBodySetting";
import QUESTION from "@/apps/surveyCreate/SurveyCreateBodyQuestion";

export default {
  name: "survey-create-body",
  components: {
    SETTING,
    QUESTION
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyCreateBodyComponentName: 'surveyCreateBodyComponentName',
      publishedQuestionIds: 'publishedQuestionIds',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    ...mapGetters('storeSurvey', {
      isCurSurveyPublished: 'isCurSurveyPublished',
      curSurveyId: 'curSurveyId'
    })
  },
  watch: {
    async isCurSurveyPublished(val) {
      if (val) {
        if (this.publishedQuestionIds.length === 0) {
          const surveyEditQuestionsSimple = await this.getSurveyEditQuestionsSimple({
            surveyId: this.curSurveyId
          })
          if (surveyEditQuestionsSimple.length > 0) {
            const questionIds = surveyEditQuestionsSimple.map(question => question.questionId)
            this.setPublishedQuestionIds(questionIds)
          }
        }
      }
    }
  },
  async created() {
    const querySurveyType = this.$route.query.surveyType
    const surveyType = this.CONSTANTS.SURVEY_TYPE[querySurveyType]
      ? this.CONSTANTS.SURVEY_TYPE[querySurveyType]
      : this.CONSTANTS.SURVEY_TYPE.SURVEY
    await this.initCurSurveyEdit({ surveyType })
    this.setSurveyCreateBodyComponentName('SETTING')
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setSurveyCreateBodyComponentName: 'setSurveyCreateBodyComponentName',
      setPublishedQuestionIds: 'setPublishedQuestionIds'
    }),
    ...mapActions('storeSurvey', {
      initCurSurveyEdit: 'initCurSurveyEdit',
      getSurveyEditQuestionsSimple: 'getSurveyEditQuestionsSimple',
    })
  }
}
</script>

<style scoped>

</style>