<template>
  <div
    id="wrap"
    :class="[wrapClass]"
    :key="componentKey"
  >
    <survey-create-header
      :key="`create-header-${curSurveyKey}`"
    />

    <survey-create-complete
      v-if="surveyCreateComplete.isVisible"
    />
    <template
      v-else
    >
      <div class="survey__content">
        <survey-create-lnb />
        <survey-create-body />
      </div>
    </template>
  </div>
</template>

<script>
import SurveyCreateHeader from "@/apps/surveyCreate/SurveyCreateHeader";
import SurveyCreateLnb from "@/apps/surveyCreate/SurveyCreateLnb";
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import SurveyCreateBody from "@/apps/surveyCreate/SurveyCreateBody";
import SurveyCreateComplete from "@/apps/surveyCreate/SurveyCreateComplete";

export default {
  name: "survey-create",
  components: {
    SurveyCreateComplete,
    SurveyCreateBody,
    SurveyCreateLnb,
    SurveyCreateHeader
  },
  data() {
    return {
      componentKey: 0
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      curSurveyEdit: 'curSurveyEdit',
      surveyCreateComplete: 'surveyCreateComplete'
    }),
    ...mapGetters('storeSurvey', {
      curSurveyId: 'curSurveyId',
      curSurveyKey: 'curSurveyKey'
    }),
    wrapClass() {
      return this.surveyCreateComplete.isVisible
        ? 'l-page-survey-responsive'
        : 'l-page-survey'
    }
  },
  watch: {
    async 'curSurveyEdit.classId'(val) {
      if (val) {
        const result = await this.existsClassManagerByClassId(val)
        if (!result) {
          this.$hiClass.alert('권한이 없습니다.')
            .then(() => this.$router.push('/main', () => {}))
        }
      }
    },
    $route(to, from) {
      if (from.params.surveyId !== undefined && to.params.surveyId !== from.params.surveyId) {
        this.componentKey++
      }
    }
  },
  async created() {
    await this.initCurRouteParams()

    // check class manager
    await this.initUser()
  },
  mounted() {},
  beforeDestroy() {
    setTimeout(() => {
      this.clearCurSurveyEdit()
      this.clearSurveyEditQuestions()
      this.clearSurveyEditPages()
      this.clearCurRouteParams()
      this.clearSurveyCreate()
      this.hideSurveyCreateComplete()
      this.setIsUsedTemplate(false)
    }, 100)
  },
  methods: {
    ...mapActions({
      initUser: 'initUser',
      existsClassManagerByClassId: 'existsClassManagerByClassId'
    }),
    ...mapActions('storeSurvey', {
      initCurRouteParams: 'initCurRouteParams',
      clearCurSurveyEdit: 'clearCurSurveyEdit',
      clearSurveyEditQuestions: 'clearSurveyEditQuestions',
      clearSurveyEditPages: 'clearSurveyEditPages',
      clearCurRouteParams: 'clearCurRouteParams',
      clearSurveyCreate: 'clearSurveyCreate',
      hideSurveyCreateComplete: 'hideSurveyCreateComplete',
    }),
    ...mapMutations('storeSurvey', {
      setIsUsedTemplate: 'setIsUsedTemplate'
    }),
  }
}
</script>

<style scoped>
</style>