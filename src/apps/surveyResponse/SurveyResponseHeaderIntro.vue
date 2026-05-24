<template>
  <div class="survey-intro__header">
    <div class="header__inner">
      <h1 class="heading">{{ title }}</h1>
      <p class="desc">{{ description }}</p>
      <button
        class="btn-close"
        @click="onClickClose"
      ></button>
    </div>
  </div>

</template>

<script>
import {mapActions, mapState, mapGetters} from "vuex";

export default {
  name: "survey-response-header-intro",
  props: {
    doNotGoBack: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    survey_type_exceptions: {
      SURVEY: '설문ㆍ투표',
      VOTE: '설문ㆍ투표'
    },
    descriptions: {
      FCFS: '신청을 원하시는 경우 선착순 내 응답해 주세요.',
      DRAW: '추첨을 통해 담첨자를 선정합니다.',
      default: '아래 설문조사 내용을 확인 후 시작해주세요.',
    },
  }),
  computed: {
    ...mapGetters(['CONSTANTS']),
    ...mapState('storeSurvey', {
      surveys: 'surveys',
      afterSchoolStatus: 'afterSchoolStatus',
      consultationStatus: 'consultationStatus',
      isSimulation: 'isSimulation'
    }),
    title() {
      return {
        ...this.CONSTANTS.SURVEY_TYPE_NAME,
        ...this.survey_type_exceptions}[this.surveys.surveyType]
        + (this.isSimulation ? ' 미리보기' : '')
    },
    description() {
      return this.isSimulation
        ? `${this.CONSTANTS.SURVEY_TYPE_NAME[this.surveys.surveyType]} 응답 화면을 미리보기로 확인할 수 있습니다.`
        : this.descriptions[this.surveys.surveyType] || this.descriptions.default
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      goRouteSurveyList: 'goRouteSurveyList'
    }),
    onClickClose() {
      this.$emit('close');
      if(!this.doNotGoBack) this.goRouteSurveyList();
    }
  }
}
</script>

<style scoped>

</style>