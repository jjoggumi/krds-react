<template>
  <div class="survey__complete">
    <div class="survey-complete__box">
      <h1 class="heading">{{ title }}</h1>

      <div class="group-btn-complete">
        <button
          class="btn-preview"
          @click="previewSurvey"
        >
          설문 미리보기
        </button>
        <button
          class="btn-edit"
          @click="doSurveyUpdate"
        >
          설문 수정
        </button>
        <button
          class="btn-list"
          @click="routeSurveyList"
        >
          설문 목록
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";

export default {
  name: "survey-create-complete",
  computed: {
    ...mapState('storeSurvey', {
      curSurveyEdit: 'curSurveyEdit',
      surveyCreateComplete: 'surveyCreateComplete'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    surveyType() {
      return this.curSurveyEdit.surveyType
    },
    title() {
      const suffix = this.surveyType === this.CONSTANTS.SURVEY_TYPE.VOTE ? '가' : '이'
      const surveyTypeName = this.CONSTANTS.SURVEY_TYPE_NAME[this.surveyType]
        ? this.CONSTANTS.SURVEY_TYPE_NAME[this.surveyType]
        : this.CONSTANTS.SURVEY_TYPE_NAME.SURVEY
      let title

      switch (this.surveyCreateComplete.mode) {
        case 'CREATE': {
          title = `${surveyTypeName}${suffix} 등록되었습니다.`
          break
        }
        case 'UPDATE': {
          title = `${surveyTypeName}${suffix} 수정되었습니다.`
          break
        }
      }
      return title
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      previewSurvey: 'previewSurvey'
    }),
    routeSurveyList() {
      const classId = this.curSurveyEdit.classId
      const location = classId ? `/main/clazzes/${classId}/survey` : '/main'
      this.$router.push(location, () => {})
    },
    doSurveyUpdate() {
      this.$router.go(0)
    },
  }
}
</script>

<style scoped>

</style>