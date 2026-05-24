<template>
  <div class="survey-recommend__right">

    <div class="survey-view__content all" v-if="hasSurveyContents"> <!-- .all > 전체 보기 (max-height: 100%;) -->
      <div class="survey-create__box">
        <div class="survey__heading required">
          <strong class="heading">{{ surveyContents.surveyTitle }}</strong>
        </div>
        <div
            class="survey__desc"
            v-if="surveyContents.surveyDescription !== ''"
            v-html="surveyContents.surveyDescription"
        />
        <div class="survey__image" v-if="surveyContents.files.length > 0">
          <div class="image">
            <img :src="surveyContents.files[0].fileOriginalPath" alt="">
          </div>
        </div>
      </div>

      <div v-for="page of pages" :key="page.pageId" class="survey-create__box">
        <component
          v-for="(question, index) of page.questions"
          :is="question.questionType"
          :key="`${question.questionId}-${index}`"
          :index="index"
          :question="question"
          :questions="page.questions"
          :isRecommendTemplate="true"
        />
      </div>
    </div>

    <div class="nodata" v-else><p>설문 목록을 선택해주세요</p></div>

  </div>
</template>

<script>
import CHOICE from "@/apps/surveyResponse/questionType/Choice";
import SUBJECTIVE from "@/apps/surveyResponse/questionType/Subjective";
import SIGN from "@/components/Modal/SurveyRecommendTemplate/SurveyRecommendTemplatePreviewSign";
import CONSULTATION from "@/components/Modal/SurveyRecommendTemplate/SurveyRecommendTemplatePreviewConsultation";
import AFTER_SCHOOL
  from "@/components/Modal/SurveyRecommendTemplate/SurveyRecommendTemplatePreviewAfterSchool";

import {mapState} from "vuex";

export default {
  name: "survey-recommend-template-preview",
  components: {
    CHOICE,
    SUBJECTIVE,
    SIGN,
    CONSULTATION,
    AFTER_SCHOOL
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyContents: 'surveyContents'
    }),
    hasSurveyContents() {
      return Object.keys(this.surveyContents).length > 0
    },
    pages() {
      return this.surveyContents.pages
    }
  }
}
</script>

<style scoped>

</style>