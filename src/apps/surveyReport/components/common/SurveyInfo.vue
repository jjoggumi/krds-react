<!--
@File(Method): SurveyInfo.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 설문·투표 > 설문목록 > 통계 및 개별 조회 > 통계 탭 >  통계 기본 정보
@Modified: 2024-11-07 - #69524 설문 선착순/추첨 추가 : 선착순, 추첨 정보 
-->
<template>
  <div class="survey-create__box"> 
    <div class="survey__heading required"> 
      <strong class="heading">{{ this.surveyTitle }}</strong>
      <span class="date">{{ this.surveyDate }}</span>
      <span class="fcfs-draw-additional-area" v-if="isFcfsType || isDrawType">
        <span class="info" v-if="isDrawType"><strong class="txt-gray">추첨</strong></span> 
        <span class="info" v-if="isFcfsType"><strong class="txt-gray">선착순</strong></span>
        <span class="info" v-if="currentTab">{{ this.surveyAnswerCountInfo }}</span>
        <span class="date pl-10" v-if="isFcfsType"> ( 정원  {{ surveyInfo.totalCount || 0 }} / {{ surveyInfo.totalMax || 0}} 
          <span class="pl-10" v-if="(surveyInfo.waitMax || 0) > 0">대기  {{ surveyInfo.waitCount || 0 }}/{{ surveyInfo.waitMax || 0}}</span> )
        </span>
      </span>
    </div>
    <div class="survey__desc" v-if="surveyDescription !== ''" v-html="surveyDescription">
    </div>
    <div class="survey__image" v-if="surveyInfo.files.length > 0">
      <div class="image">
        <img :src="surveyImage" alt="">
      </div>
    </div>
  </div>
</template>

<script>
import {mapState, mapGetters} from "vuex";

export default {
  name: "survey-info",
  computed: {
    ...mapGetters(['CONSTANTS']),
    ...mapState('storeSurvey', ['surveyReport']),
    surveyInfo() {
      return this.surveyReport.curSurveyReportInfo
    },
    surveyTitle() {
      return this.surveyInfo.surveyTitle
    },
    surveyDate() {
      const surveyStartTimestamp = this.surveyInfo.surveyStartTimestamp
      const surveyEndTimestamp = this.surveyInfo.surveyEndTimestamp
      return `${this.timestampToDateTime(surveyStartTimestamp)} ~ ${this.timestampToDateTime(surveyEndTimestamp)}`
    },
    surveyAnswerCountInfo() {
      const answerInfo = this.surveyInfo.answerCountInfo
      if (this.surveyInfo.rejectable) {
        return `응답자수 : 총 ${answerInfo.totalCount}명 (참여함: ${answerInfo.completeCount}명, 참여안함: ${answerInfo.rejectCount}명)`
      } else {
        return `응답자수 : 총 ${answerInfo.totalCount ? answerInfo.totalCount : 0}명`
      }
    },
    surveyDescription() {
      return this.surveyInfo.surveyDescription
    },
    surveyImage() {
      return this.surveyInfo.files.length > 0 ? this.surveyInfo.files[0].fileOriginalPath : ''
    },
    currentTab() {
      return this.surveyReport.currentTab === 'STATISTICS'
    },
    isFcfsType() {
      return this.surveyInfo.surveyType === this.CONSTANTS.SURVEY_TYPE.FCFS
    },
    isDrawType() {
      return this.surveyInfo.surveyType === this.CONSTANTS.SURVEY_TYPE.DRAW
    }
  },
  methods: {
    timestampToDateTime(timestamp) {
      return this.$moment(timestamp).format('MM월 DD일 HH:mm')
    },
  }
}
</script>

<style scoped>
</style>