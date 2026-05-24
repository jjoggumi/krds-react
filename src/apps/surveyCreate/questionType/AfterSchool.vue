<template>
  <!-- 방과후 신청 타입 -->
  <div class="survey-create__box">

    <survey-create-body-question-tag />
    <survey-create-body-question-title />
    <survey-create-body-question-description />
    <survey-create-body-question-upload />

    <!-- 방과후 신청 (목록) -->
    <survey-create-question-type-after-school-list />

    <!-- 방과후 신청 (신규 등록 편집 모드) -->
    <survey-create-question-type-after-school-edit
      v-for="(item, itemIndex) of initItems"
      :key="itemIndex"
      :prop-item="item"
      :mode="'CREATE'"
      @is-close="closeNewItem"
      @is-cancel="closeNewItem"
      @is-submit="submitNewItem"
    />

    <button
      v-if="initItems.length === 0"
      class="hi-btn btn-xl mt-30"
      @click="addItem"
    >
      새 수업 추가
    </button>

  </div>


</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";

import SurveyCreateBodyQuestionTitle from "@/apps/surveyCreate/SurveyCreateBodyQuestionTitle.vue";
import SurveyCreateBodyQuestionUpload from "@/apps/surveyCreate/SurveyCreateBodyQuestionUpload.vue";
import SurveyCreateQuestionTypeAfterSchoolEdit from "@/apps/surveyCreate/questionType/AfterSchoolEdit.vue";
import SurveyCreateQuestionTypeAfterSchoolList from "@/apps/surveyCreate/questionType/AfterSchoolList.vue";
import SurveyCreateBodyQuestionDescription from "@/apps/surveyCreate/SurveyCreateBodyQuestionDescription.vue";
import SurveyCreateBodyQuestionTag from "@/apps/surveyCreate/SurveyCreateBodyQuestionTag.vue";

export default {
  name: "survey-create-question-type-after-school",
  components: {
    SurveyCreateBodyQuestionTag,
    SurveyCreateBodyQuestionDescription,
    SurveyCreateQuestionTypeAfterSchoolList,
    SurveyCreateQuestionTypeAfterSchoolEdit,
    SurveyCreateBodyQuestionUpload,
    SurveyCreateBodyQuestionTitle
  },
  data() {
    return {
      // isDrag: false,
      pageModel: {
        linkPage: {
          pageId: undefined,
          pageName: undefined,
          sortNo: undefined
        }
      },
      questionModel: {
        isValidated: undefined,
        isLinkedPage: undefined,
        questionType: undefined,
        questionTitle: undefined,
      }
    };
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyEditQuestions: 'surveyEditQuestions',
      surveyEditPages: 'surveyEditPages',
    }),
    initItems() {
      return this.surveyEditQuestions.items.filter(item => !item.itemId && !item.isCopiedItem)
    },
  },
  watch: {
    surveyEditQuestions: {
      async handler() {
        this.setIsChangedSurveyEditQuestions(true)

        const surveyEditQuestions = this.surveyEditQuestions
        this.questionModel.isValidated = await this.getIsValidatedByStateSurveyEditQuestions()
        this.questionModel.isLinkedPage = surveyEditQuestions.isLinkedPage
        this.questionModel.questionType = surveyEditQuestions.questionType
        this.questionModel.questionTitle = surveyEditQuestions.questionTitle

        this.pageModel.linkPage.pageId = surveyEditQuestions.linkPageId
      },
      deep: true
    },
    questionModel: {
      handler() {
        const pageId = this.surveyEditQuestions.pageId
        const questionId = this.surveyEditQuestions.questionId
        // lnbPages.question 매핑 후 수정
        const curPage = this.surveyEditPages.find(page => page.pageId === pageId)
        if (curPage) {
          const curQuestion = curPage.questions.find(question => question.questionId === questionId)
          if (curQuestion) {
            curQuestion.isValidated = this.questionModel.isValidated
            curQuestion.isLinkedPage = this.questionModel.isLinkedPage
            curQuestion.questionType = this.questionModel.questionType
            curQuestion.questionTitle = this.questionModel.questionTitle
          }
        }
      },
      deep: true
    },
    pageModel: {
      handler() {
        const pageId = this.surveyEditQuestions.pageId
        // lnbPages 매핑 후 수정
        const curPage = this.surveyEditPages.find(page => page.pageId === pageId)
        if (curPage) {
          if (curPage.linkPage) {
            curPage.linkPage.pageId = this.pageModel.linkPage.pageId
          } else {
            this.$set(curPage, 'linkPage', this.pageModel.linkPage)
          }
        }
      },
      deep: true
    },
  },
  mounted() {
    this.surveyEditQuestions.items.length === 0
      ? this.addItem()
      : this.savePublishedQuestionItemIds({ items: this.surveyEditQuestions.items })
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setIsChangedSurveyEditQuestions: 'setIsChangedSurveyEditQuestions'
    }),
    ...mapActions('storeSurvey', {
      getIsValidatedByStateSurveyEditQuestions: 'getIsValidatedByStateSurveyEditQuestions',
      addSurveyEditQuestionsItem: 'addSurveyEditQuestionsItem',
      temporarilySaveSurvey: 'temporarilySaveSurvey',
      getSurveyEditQuestions: 'getSurveyEditQuestions',
      savePublishedQuestionItemIds: 'savePublishedQuestionItemIds'
    }),
    async addItem() {
      await this.addSurveyEditQuestionsItem({ isTempItem: true })
    },
    closeNewItem() {
      const foundIndex = this.surveyEditQuestions.items.findIndex(item => !item.itemId)
      if (foundIndex > -1) {
        this.surveyEditQuestions.items.splice(foundIndex, 1)
      }
    },
    async submitNewItem(itemId, itemIndex, item) {
      this.setIsChangedSurveyEditQuestions(true)

      const foundIndex = this.surveyEditQuestions.items.findIndex(item => !item.itemId)
      if (foundIndex > -1) {
        item.isTempItem = false
        this.surveyEditQuestions.items[foundIndex] = item
      }

      // 수업 저장
      await this.temporarilySaveSurvey({})

      // 수업 목록 갱신
      await this.getSurveyEditQuestions()

      this.setIsChangedSurveyEditQuestions(false)
    },
  }
}
</script>

<style scoped>

</style>

<style lang="scss">
</style>