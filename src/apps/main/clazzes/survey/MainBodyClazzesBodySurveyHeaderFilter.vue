<!--
@File(Method): MainBodyClazzesBodySurveyHeaderFilter.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 설문·투표 > 설문목록 > 검색 필터 영역
@Modified: 2024-11-07 - #69524 설문 선착순/추첨 추가 : selectbox에서 선착순 · 추첨 추가
           2024-11-11 - #69524 HiButton 적용
-->

<template>
  <div class="surveyvote__filter">
    <div class="hi-tab tab-xl">
      <button
        v-for="(tab, index) of tabs"
        :key="`${tab.code}-${index}`"
        :class="{
          'is-active': activeTabCode === tab.code
        }"
        @click="changeActiveTab(tab.code)"
      >
        {{ tab.name }}
      </button>
    </div>
    <div
      class="filter-sub"
      v-if="
      isEmpty &&
      (activeTabCode === 'TEMPORARY' || activeTabCode === 'END')"
    >
      <div class="group-btn" v-click-outside="closeOption">
        <div class="hi-selectbox" :class="{'is-opened': showOption}">
          <button
            class="selected"
            @click="showOption = !showOption"
          >
            {{ filters.find(filter => filter.code === activeFilterCode).name }}
          </button>
          <div class="option__layer">
            <button
              v-for="(filter, index) of filters"
              :key="`${filter.code}-${index}`"
              class="option"
              :class="{'is-selected': activeFilterCode === filter.code}"
              @click="changeActiveFilter(filter.code)"
            >
              {{ filter.name }}
            </button>
          </div>
        </div>
      </div>
      <div class="group-btn" v-if="activeTabCode === 'TEMPORARY' && selectedTemporarySurveys.length > 0">
        <HiButton size="md" color="primary" outline  @click="deleteSurveys">삭제하기</HiButton>
        <span class="count">선택 {{ selectedTemporarySurveys.length }}개</span>
      </div>
      <div class="hi-searchbox">
        <div class="searchbox__input">
          <input
            type="text"
            placeholder="제목 2자 이상 검색"
            v-model="surveyTitle"
            @input="typing"
            @keyup.enter="searchSurveyTitle"
          >
          <button
            class="btn-delete"
            v-show="typingTitle.trim().length > 0"
            @click="removeInput"
          />
          <button
            class="btn-search"
            @click="searchSurveyTitle"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";
import {eventBus} from "@/main";
import HiButton from '@/components/Button/HiButton.vue';

export default {
  name: "main-body-clazzes-body-survey-header-filter",
  components: {HiButton},
  props: {
    isContentEmpty: {
      type: Boolean
    },
    isSearchSurveyTitle: {
      type: Boolean
    },
    isSearchSurveyType: {
      type: Boolean
    }
  },
  data() {
    return {
      surveyTitle: '',
      typingTitle: '',
      showOption: false
    }
  },
  computed: {
    ...mapState({
      isCurClassManager: 'isCurClassManager',
    }),
    ...mapState('storeSurvey', {
      surveySearchQuery: 'surveySearchQuery',
      selectedTemporarySurveys: 'selectedTemporarySurveys'
    }),
    tabs() {
      const tabs = []
      tabs.push({
        code: 'DOING',
        name: '진행중',
      })
      tabs.push({
        code: 'END',
        name: '종료',
      })
      if (this.isCurClassManager) {
        tabs.push({
          code: 'TEMPORARY',
          name: '임시저장',
        })
      }
      return tabs
    },
    filters() {
      const filters = []
      filters.push({
        code: '',
        name: '전체'
      })      
      // #69524 설문 선착순/추첨 추가 :  selectbox에 선착순 · 추첨 추가
      filters.push({
        code: 'FCFS',
        name: '선착순'
      })
      filters.push({
        code: 'DRAW',
        name: '추첨'
      })
      filters.push({
        code: 'SURVEY',
        name: '설문ㆍ투표'
      })
      filters.push({
        code: 'AFTER_SCHOOL',
        name: '방과후 신청'
      })
      filters.push({
        code: 'CONSULTATION',
        name: '학부모 상담'
      })
      return filters
    },
    activeTabCode() {
      return this.surveySearchQuery.surveyStatus
    },
    activeFilterCode() {
      return this.surveySearchQuery.surveyType
    },
    isEmpty() {
      if (!this.isContentEmpty) {
        return true
      } else {
        return this.isSearchSurveyTitle || this.isSearchSurveyType
      }
    }
  },
  created() {
    const foundTab = this.tabs.find(tab => tab.code === this.$route.query.tabCode)
    if (foundTab) {
      this.changeActiveTab(this.$route.query.tabCode)
      this.$router.replace(this.$route.path, () => {})
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      deleteSurveys: 'deleteSurveys'
    }),
    changeActiveTab(code) {
      this.surveySearchQuery.surveyStatus = code
      this.surveySearchQuery.surveyType = ''
      this.surveySearchQuery.surveyTitle = null

      if (code === 'TEMPORARY') {
        this.surveySearchQuery.sort = ['editedTimestamp,desc', 'updatedTimestamp,desc']
      } else {
        this.surveySearchQuery.sort = 'surveyPosted,desc'
      }

      eventBus.$emit('do-search-resource', true)
    },
    changeActiveFilter(code) {
      this.surveySearchQuery.surveyType = code
      eventBus.$emit('do-search-resource', true)
      this.$emit('set-is-search-survey-type', code)
      this.showOption = !this.showOption
    },
    searchSurveyTitle() {
      if (this.surveyTitle.trim() === '') {
        this.surveySearchQuery.surveyTitle = null
        this.$emit('set-is-search-survey-title', false)
      } else {
        this.surveySearchQuery.surveyTitle = this.surveyTitle
        this.$emit('set-is-search-survey-title', true)
      }

      eventBus.$emit('do-search-resource', true)
    },
    typing(e) {
      this.typingTitle = e.target.value
    },
    removeInput() {
      this.surveyTitle = ''
      this.typingTitle = ''
    },
    closeOption() {
      this.showOption = false
    },
  },
  beforeDestroy() {
    this.surveySearchQuery.surveyStatus = 'DOING'
    this.surveySearchQuery.surveyType = ''
    this.surveyTitle = ''
    this.surveySearchQuery.surveyTitle = null
  },
  watch: {
    activeTabCode: {
      handler: function () {
        this.surveyTitle = ''
        this.typingTitle = ''
        this.surveySearchQuery.surveyType = ''
        this.surveySearchQuery.surveyTitle = null
        this.showOption = false
        this.$emit('set-is-search-survey-title', false)
        this.$emit('set-is-search-survey-type', '')
      }
    }
  },
}
</script>

<style scoped>

</style>