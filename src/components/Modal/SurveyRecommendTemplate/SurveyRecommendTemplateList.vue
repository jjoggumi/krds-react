<template>
  <div class="survey-recommend__left">
    <div class="bottom"
         v-infinite-scroll="searchRecommendShareTemplate"
         :infinite-scroll-disabled="infiniteScroll.isBusy"
         :infinite-scroll-distance="infiniteScroll.distance"
    >
      <div class="filter">
        <button
          class="btn-sort"
          :class="activeSortType('INSERTED')"
          @click="setSearchSort('INSERTED', $event)"
        >
          등록일
        </button>
        <button
          class="btn-sort"
          :class="activeSortType('USED')"
          @click="setSearchSort('USED', $event)"
        >
          사용순
        </button>
        <button
          class="btn-bookmark"
          :class="{'is-active': searchQuery.myFavorite}"
          @click="searchQuery.myFavorite = !searchQuery.myFavorite"
        />
      </div>

      <div class="survey__list">
        <template v-if="recommendTemplates.length > 0">
          <survey-recommend-template-list-item
            v-for="template of recommendTemplates"
            :key="template.surveyId"
            :template="template"
          />
        </template>
        <div class="hi-nodata" v-else>
          <p>검색 결과가 없습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SurveyRecommendTemplateListItem
  from "@/components/Modal/SurveyRecommendTemplate/SurveyRecommendTemplateListItem";
import {mapActions, mapState} from "vuex";

export default {
  name: "survey-recommend-template-list",
  data() {
    return {
      // 등록일: INSERTED, 사용순: USED
      sortType: 'INSERTED'
    }
  },
  components: {
    SurveyRecommendTemplateListItem
  },
  computed: {
    ...mapState({
      infiniteScroll: 'infiniteScroll'
    }),
    ...mapState('storeSurvey', {
      recommendTemplates: 'recommendTemplates',
      searchQuery: 'recommendTemplateSearchQuery'
    }),
    activeSortType() {
      return (sortType) => {
        if (this.sortType === sortType) {
          const arr = this.searchQuery.sort.split('_')
          return arr[1].toLowerCase()
        }
      }
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
    setSearchSort(sortType, event) {
      if (event.target.classList[1] === undefined || event.target.classList[1] === 'asc') {
        this.searchQuery.sort = `${sortType}_DESC`
      } else {
        this.searchQuery.sort = `${sortType}_ASC`
      }
      this.initScroll()
      this.searchRecommendShareTemplate()
      this.sortType = sortType
    }
  },
  watch: {
    'searchQuery.myFavorite': {
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