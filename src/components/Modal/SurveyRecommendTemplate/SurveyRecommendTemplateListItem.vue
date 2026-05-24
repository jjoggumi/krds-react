<!--
@File(Method): SurveyRecommendTemplateListItem.vue
@Author: -
@Date Created: -
@Description: 설문 투표 > 추천 템플릿 > 템플릿 리스트 
@Modified: 2024-11-12 - #69464 캐밥 메뉴 디자인 시스템 적용
-->
<template>
  <div
    class="survey__item"
    :class="{'is-active': isSelected}"
    role="button"
    @click="selectSurveyItem"
  >
    <div class="group-label">
      <span
        class="label"
        :class="{'recommend': template.rankScore > 0}"
        v-if="template.rankScore > 0"
      >
        추천
      </span>
      <span class="label">{{ surveyType }}</span>
    </div>
    <strong class="heading">{{ template.surveyTitle }}</strong>
    <div class="info">
      <span>사용하기: {{ template.usedCount }}회</span>
      <span
        class="bookmark"
        @click="setSurveyFavorite(template, $event)"
      >
        <button
          class="btn-bookmark"
          :class="{'is-active': template.isMyFavorite}"
        />
        <span class="count">{{ template.favoriteCount }}</span>
      </span>
    </div>
    <!-- #69464 캐밥 메뉴 디자인 시스템 적용 -->
    <HiKebab v-if="template.isSharedByMe">        
        <button
          class="btn-delete"
          @click="clickCancelSurveyShare($event)"
        >
          공유취소
        </button>
    </HiKebab>     
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";
import HiKebab from "@/components/Kebab/HiKebab.vue";

export default {
  name: "survey-recommend-template-list-item",
  components: { HiKebab},
  data() {
    return {
      // isShowKebabMenu: false  // #69464 캐밥 메뉴 디자인 시스템 적용
    }
  },
  props: {
    template: {
      type: Object
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyContents: 'surveyContents'
    }),
    surveyType() {
      return {
        'SURVEY': '설문ㆍ투표',
        'AFTER_SCHOOL': '방과후 신청',
        'CONSULTATION': '학부모 상담',
        'FCFS': '선착순',
        'DRAW': '추첨',
      }[this.template.surveyType] || '';
    },
    isSelected() {
      return this.template.surveyId === this.surveyContents.surveyId
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      getSurveyContents: 'getSurveyContents',
      createSurveyFavorite: 'createSurveyFavorite',
      deleteSurveyFavorite: 'deleteSurveyFavorite',
      cancelSurveyShare: 'cancelSurveyShare'
    }),
    setSurveyFavorite(template, e) {
      e.stopPropagation()
      const surveyId = template.surveyId
      template.isMyFavorite ?
        this.deleteSurveyFavorite(surveyId) :
        this.createSurveyFavorite(surveyId)
    },
    // #69464 캐밥 메뉴 디자인 시스템 적용
    // openKebabMenu(e) {
    //   e.stopPropagation()
    //   this.isShowKebabMenu = !this.isShowKebabMenu
    // },
    clickCancelSurveyShare(e) {
      e.stopPropagation()
      this.cancelSurveyShare(this.template.surveyId)
    },
    selectSurveyItem() {
      this.getSurveyContents({
        surveyId: this.template.surveyId,
        surveyStatus: 'SHARE'
      }).then(res => {
        document.querySelector('.survey-recommend__right').scrollTo(0,0)
      })
    }
  }
}
</script>

<style scoped>

</style>