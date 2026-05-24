<!--
@File(Method): MainBodyClazzesBodySurveyHeaderTop.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 설문·투표 > 상단 설문 생성버튼
@Modified: 2024-11-11 - #69524 설문 선착순/추첨 추가 : 선착순/추첨 설문 생성버튼 추가
-->
<template>
  <div class="surveyvote__top">

    <button
      class="btn-more"
      @click="clickGuideButton"
    >
      설문 만들기 가이드
    </button>

    <div class="group-btn-create-v2">
      <!-- <p class="desc">작성하려는 <em>설문</em>을 선택해주세요.</p> -->
      <!-- #69524 선착순/추첨 설문 생성버튼 추가 -->
      <div
        class="btn-create-fstcom"
        role="button"
        @click="routeNewSurvey(CONSTANTS.SURVEY_TYPE.FCFS)"
      >
        <span class="icon"></span>
        <span>선착순ㆍ추첨</span>
      </div>
      <div
        class="btn-create-survey"
        role="button"
        @click="routeNewSurvey(CONSTANTS.SURVEY_TYPE.SURVEY)"
      >
        <span class="icon"></span>
        <span>설문ㆍ투표</span>
      </div>
      <div
        class="btn-create-counsel"
        role="button"
        @click="routeNewSurvey(CONSTANTS.SURVEY_TYPE.CONSULTATION)"
      >
        <span class="icon"></span>
        <span>학부모/학생 상담</span>
      </div>
      <div
        class="btn-create-fcfs"
        role="button"
        @click="routeNewSurvey(CONSTANTS.SURVEY_TYPE.AFTER_SCHOOL)"
      >
        <span class="icon"></span>
        <span>방과후 신청</span>
      </div>
      <div
        class="btn-create-temp"
        role="button"
        @click="openRecommendTemplateModal()"
      >
        <span class="icon"></span>
        <span>추천 템플릿</span>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState } from "vuex";

export default {
  name: "main-body-clazzes-body-survey-header-top",
  computed: {
    ...mapState({
      curClassItem: 'curClassItem'
    }),
    ...mapState('storeSurvey', {
      surveySearchQuery: 'surveySearchQuery'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    classId() {
      return this.curClassItem.currentId
    },
    schoolId() {
      return this.curClassItem.school.currentId
    },
    activeTabCode() {
      return this.surveySearchQuery.surveyStatus
    },
    isActivateClass() {
      return this.curClassItem.classStatus === 'ACTIVATE'
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      openRecommendTemplateModal: 'openRecommendTemplateModal'
    }),
    routeNewSurvey(surveyType) {
      surveyType = surveyType || this.CONSTANTS.SURVEY_TYPE.SURVEY

      if (this.isActivateClass) {
        const routeObj = {
          path: '/survey-create',
          query: {
            classId: this.classId,
            schoolId: this.schoolId,
            surveyType: surveyType,
            tabCode: this.activeTabCode
          }
        }
        this.$router.push(routeObj,() => {})
      } else {
        const surveyTypeName = this.CONSTANTS.SURVEY_TYPE_NAME[surveyType]
          ? this.CONSTANTS.SURVEY_TYPE_NAME[surveyType]
          : this.CONSTANTS.SURVEY_TYPE_NAME.SURVEY
        this.$hiClass.alert(`비공개 상태에서는 ${surveyTypeName} 만들기가 불가합니다.`)
      }
    },
    clickGuideButton() {
      const url = this.$store.state.surveyWriteGuideUrl
      window.open(url)
    }
  }
}
</script>

<style scoped>

</style>