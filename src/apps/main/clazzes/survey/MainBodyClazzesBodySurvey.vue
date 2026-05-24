<template>
  <div>
    <main-body-clazzes-body-survey-header-title />

    <main-body-clazzes-body-survey-header-top
      v-if="isCurClassOwnerOrManager"
    />

    <main-body-clazzes-body-survey-header-filter
      @set-is-search-survey-title="setIsSearchSurveyTitle"
      @set-is-search-survey-type="setIsSearchSurveyType"
      :is-content-empty="isContentEmpty"
      :is-search-survey-title="isSearchSurveyTitle"
      :is-search-survey-type="isSearchSurveyType"
    />

    <main-body-clazzes-body-survey-contents
      @set-is-content-empty="setIsContentEmpty"
      :is-content-empty="isContentEmpty"
    />

    <main-body-clazzes-body-survey-content-empty
      v-if="isContentEmpty"
      :is-search-survey-title="isSearchSurveyTitle"
      :is-search-survey-type="isSearchSurveyType"
    />
    <!-- [모달] 나의 설문 내역 -->
    <My-survey-history v-if="mySurveyHistory.isModalOpen" />
    <!-- [모달] 나의 신청 내역 -->
    <My-apply-history v-if="myApplyHistory.isModalOpen" />
  </div>

</template>

<script>

import MainBodyClazzesBodySurveyHeaderTop from "@/apps/main/clazzes/survey/MainBodyClazzesBodySurveyHeaderTop";
import MainBodyClazzesBodySurveyHeaderTitle from "@/apps/main/clazzes/survey/MainBodyClazzesBodySurveyHeaderTitle";
import MainBodyClazzesBodySurveyHeaderFilter from "@/apps/main/clazzes/survey/MainBodyClazzesBodySurveyHeaderFilter";
import MainBodyClazzesBodySurveyContents from "@/apps/main/clazzes/survey/MainBodyClazzesBodySurveyContents";
import MainBodyClazzesBodySurveyContentEmpty from "@/apps/main/clazzes/survey/MainBodyClazzesBodySurveyContentEmpty";
import MySurveyHistory from './modal/MySurveyHistory';
import MyApplyHistory from './modal/MyApplyHistory';
import {mapState, mapGetters} from "vuex";

export default {
  name: 'main-body-clazzes-body-survey',
  components: {
    MainBodyClazzesBodySurveyContentEmpty,
    MainBodyClazzesBodySurveyContents,
    MainBodyClazzesBodySurveyHeaderFilter,
    MainBodyClazzesBodySurveyHeaderTitle,
    MainBodyClazzesBodySurveyHeaderTop,
    MySurveyHistory,
    MyApplyHistory,
  },
  props: {
    clazzes: {
      type: Object
    }
  },
  data() {
    return {
      isContentEmpty: false,
      isSearchSurveyTitle: false,
      isSearchSurveyType: false,
    }
  },
  localStorage: {
    surveyLastEntryTimestamp: {
      type: Number,
      default: 0
    }
  },
  mounted() {
    this.$localStorage.set("surveyLastEntryTimestamp", `${this.$moment().valueOf()}`)
  },
  computed: {
    ...mapState('storeSurvey', {
      mySurveyHistory: 'mySurveyHistory', // 나의 설문내역 모달 STATE 정보
      myApplyHistory: 'myApplyHistory', // 나의 신청내역 모달 STATE 정보
    }),
    ...mapGetters({
      isCurClassOwnerOrManager: 'isCurClassOwnerOrManager'
    })
  },
  methods: {
    setIsContentEmpty(val) {
      this.isContentEmpty = val
    },
    setIsSearchSurveyTitle(val) {
      this.isSearchSurveyTitle = val
    },
    setIsSearchSurveyType(surveyType) {
      surveyType === '' ?
        this.isSearchSurveyType = false :
        this.isSearchSurveyType = true
    }
  }
}
</script>

<style>
</style>
