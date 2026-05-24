<template>
  <div
    class="pagination__layer"
    style="display: block"
  >
    <div class="pagination__heading">
      <strong>설문 목록</strong>
      <p>목록을 선택하면 해당 질문으로 이동합니다.</p>

      <button class="m-btn-close" @click="closeQuestionsPopup"></button> <!-- 시뮬레이션 화면에서 보임 -->

    </div>

    <div class="pagination__list">

      <survey-response-header-answer-questions-popup-item
        v-for="question of questionList"
        :key="question.questionId"
        :question="question"
        @popup-close="closeQuestionsPopup"
      />

    </div>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from "vuex";
import SurveyResponseHeaderAnswerQuestionsPopupItem
  from "@/apps/surveyResponse/SurveyResponseHeaderAnswerQuestionsPopupItem";
import {isEmpty} from "lodash";

export default {
  name: "survey-response-header-answer-questions-popup",
  components: {SurveyResponseHeaderAnswerQuestionsPopupItem},
  data() {
    return{
      questionList: []
    }
  },
  mounted() {
    this.setQuestionList()
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setSurveyAnswerQuestionsPopup: 'setSurveyAnswerQuestionsPopup'
    }),
    ...mapGetters('storeSurvey', {
      curAllQuestions: 'curAllQuestions',
      curSurveyAnswer: 'curSurveyAnswer',
      curAnswerPage: 'curAnswerPage',
      curQuestionsList: 'curQuestionsList'
    }),
    setQuestionList() {
      this.questionList = this.curQuestionsList().list
    },
    closeQuestionsPopup() {
      const payload = {
        isOpen: false
      }
      this.setSurveyAnswerQuestionsPopup(payload)
    }
  }
}
</script>

<style scoped>
</style>