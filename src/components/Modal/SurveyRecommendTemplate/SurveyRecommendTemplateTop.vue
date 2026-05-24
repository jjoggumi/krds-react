<!--
@File(Method): SurveyRecommendTemplateTop.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 설문·투표 > 설문목록 > 추천 템플릿
@Modified: 2024-11-07 - #69524 설문 선착순/추첨 추가 : 전체유형 selectbox
-->
<template>
  <div class="top-survey-recommend">
    <div class="group-checkbox">
      <input
        type="checkbox"
        id="recommend"
        :checked="searchQuery.recommend"
        @click="searchQuery.recommend = !searchQuery.recommend"
      >
      <label for="recommend"><span>추천</span></label>
      <input
        type="checkbox"
        id="sharedByMe"
        :checked="searchQuery.sharedByMe"
        @click="searchQuery.sharedByMe = !searchQuery.sharedByMe"
      >
      <label for="sharedByMe"><span>내가 공유한 설문</span></label>
    </div>

    <div class="hi-searchbox">
      <div class="searchbox__select">
        <button
          class="selected"
          @click="isOptionOpen = !isOptionOpen"
        >
          {{ searchSurveyType }}
        </button>
        <div
          class="option__layer"
          style="display: block;"
          v-if="isOptionOpen"
          v-click-outside="closeOption"
        >
          <button @click="setSearchSurveyType(null)">전체 유형</button>
          <button @click="setSearchSurveyType('FCFS')">선착순</button>
          <button @click="setSearchSurveyType('DRAW')">추첨</button>
          <button @click="setSearchSurveyType('SURVEY')">설문ㆍ투표</button>
          <button @click="setSearchSurveyType('CONSULTATION')">학부모상담</button>
          <button @click="setSearchSurveyType('AFTER_SCHOOL')">방과후신청</button>
        </div>
      </div>

      <div class="searchbox__input">
        <input
          type="text"
          placeholder="제목 검색"
          v-model="searchQuery._surveyTitle"
          @input="typing"
          @keyup.enter="searchKeyword"
        />
        <button
          class="btn-delete"
          v-show="inputKeyword.trim().length > 0"
          @click="removeInput"
        />
        <button
          class="btn-search"
          @click="searchKeyword"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";

export default {
  name: "survey-recommend-template-top",
  data() {
    return {
      inputKeyword: '',
      isOptionOpen: false
    }
  },
  computed: {
    ...mapState({
      infiniteScroll: 'infiniteScroll'
    }),
    ...mapState('storeSurvey', {
      searchQuery: 'recommendTemplateSearchQuery',
      recommendTemplates: 'recommendTemplates'
    }),
    searchSurveyType() {
      return {
        'FCFS': '선착순',
        'DRAW': '추첨',
        'SURVEY': '설문',
        'CONSULTATION': '학부모상담',
        'AFTER_SCHOOL': '방과후신청'
      }[this.searchQuery.surveyType] || '전체 유형';
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      searchRecommendShareTemplate: 'searchRecommendShareTemplate'
    }),
    initScroll() {
      this.infiniteScroll.page = 0
      this.infiniteScroll.isListEnd = false
    },
    searchKeyword() {
      this.initScroll()
      this.searchRecommendShareTemplate()
    },
    typing(e) {
      this.inputKeyword = e.target.value
    },
    removeInput() {
      this.inputKeyword = ''
      this.searchQuery._surveyTitle = ''
    },
    setSearchSurveyType(surveyType) {
      this.searchQuery.surveyType = surveyType
      this.isOptionOpen = false
    },
    closeOption() {
      this.isOptionOpen = false
    }
  },
  watch: {
    'searchQuery.sharedByMe': {
      handler: function (newVal) {
        this.initScroll()
        this.searchRecommendShareTemplate()
      }
    },
    'searchQuery.recommend': {
      handler: function (newVal) {
        this.initScroll()
        this.searchRecommendShareTemplate()
      }
    }
  }
}
</script>

<style scoped>

</style>