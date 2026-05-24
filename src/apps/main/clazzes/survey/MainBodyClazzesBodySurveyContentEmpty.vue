<template>
  <div class="hi-nodata">
    <p>{{ title }}</p>
  </div>
</template>

<script>

import {mapGetters, mapState} from "vuex";

export default {
  name: 'main-body-clazzes-body-survey-content-empty',
  props: {
    clazzes: {
      type: Object
    },
    isSearchSurveyTitle: {
      type: Boolean
    },
    isSearchSurveyType: {
      type: Boolean
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveySearchQuery: 'surveySearchQuery'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    title() {
      let title
      switch (this.surveySearchQuery.surveyStatus) {
        case this.CONSTANTS.SURVEY_STATUS.DOING: {
          title = '진행중인 설문/투표가 없습니다.'
          break
        }
        case this.CONSTANTS.SURVEY_STATUS.END: {
          title = this.isSearchSurveyTitle || this.isSearchSurveyType ? '검색결과가 없습니다.' : '종료된 설문/투표가 없습니다.'
          break
        }
        case this.CONSTANTS.SURVEY_STATUS.TEMPORARY: {
          title = this.isSearchSurveyTitle || this.isSearchSurveyType ? '검색결과가 없습니다.' : '임시저장한 설문/투표가 없습니다.'
          break
        }
      }
      return title
    }
  },
}
</script>

<style>
</style>
