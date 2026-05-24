<template>
  <!-- 객관식 타입 -->
  <div>
    <div class="group-label">
      <span
        v-if="isShowRequiredLabel"
        class="label required"
      >
        {{ firstLabelName }}
      </span>
      <span class="label">
        {{ secondLabelName }}
      </span>
    </div>

    <div class="survey__heading">
      <strong class="heading-sub">{{ questionTitle }}</strong>
    </div>
    <question-description :question="question" />
    <question-img :question="question" />
    <div class="objective__list">

      <survey-response-question-type-choice-item
        v-for="questionItem of questionItems"
        :key="questionItem.itemId"
        :question-item="questionItem"
        :is-multiple-answer="isMultipleAnswer"
        :question="question"
        :is-read-only="false"
        @onSelectedItems="onSelectedItems"
        :validation.sync="validation"
        :selected-item-ids.sync="selectedItemIds"
      />
    </div>

    <!-- group 일 경우 추가 = TODO: nextItem 이 있는 경우 -->
    <!--
    <span class="groupbar"></span>
    -->
    <span v-if="this.index !== this.questions.length-1" class="groupbar"></span>
  </div>
</template>

<script>
import SurveyResponseQuestionTypeChoiceItem from "@/apps/surveyResponse/questionType/ChoiceItem";
import {mapFields} from "vuex-map-fields";
import {isEmpty} from "lodash";
import {mapGetters, mapMutations} from "vuex";
import QuestionDescription from "@/apps/surveyResponse/questionType/components/Description";
import QuestionImg from "@/apps/surveyResponse/questionType/components/QuestionImg";

export default {
  name: "survey-response-question-type-choice",
  components: {
    SurveyResponseQuestionTypeChoiceItem,
    QuestionDescription,
    QuestionImg
  },
  props: {
    question: {
      type: Object,
      required: true
    },
    questions: {
      type: Array,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    isRecommendTemplate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      choiceList: [],
      validation: ''
    }
  },
  computed: {
    ...mapFields('storeSurvey', {
      selectedItemIds: 'selectedItemIds'
    }),
    isShowRequiredLabel() {
      return this.question.isRequired
    },
    isMultipleAnswer() {
      return this.question.isMultipleAnswer
    },
    firstLabelName() {
      return '필수응답'
    },
    secondLabelName() {
      return this.isMultipleAnswer
        ? this.questionAnswerLimit ? `복수선택 ${this.questionAnswerLimit}개` : `복수선택`
        : '단일선택'
    },
    questionTitle() {
      return this.question.questionTitle
    },
    questionFiles() {
      return this.question.files
    },
    questionAnswerLimit() {
      return this.question.answerLimit
    },
    questionItems() {
      return this.question.items
    }
  },
  mounted() {
    // 기존 선택 아이템 초기화
    this.selectedItemIds.splice(0)
    //객관식리스트
    this.setChoiceList()
  },
  beforeDestroy() {
    this.setSurveyAnswerFinish(false)
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setSurveyAnswerFinish: 'setSurveyAnswerFinish',
      setSelectedItemIds: 'setSelectedItemIds',
      // setLinkPageId: 'setLinkPageId',
      setSurveyContentsSelected: 'setSurveyContentsSelected'
    }),
    ...mapGetters('storeSurvey', {
      curQuestionsByPageId: 'curQuestionsByPageId'
    }),
    setChoiceList() {
      this.questions.forEach(question => {
        if(question.questionType === 'CHOICE'){
          question.selected = []
        }
      })
      this.choiceList = this.questions
    },
    onSelectedItems(v) {
      this.choiceList.forEach(question => {
          if(question.questionType === 'CHOICE'){
            question.selected = []
          }
      })
      if (!isEmpty(v)) {
        v.forEach(selected => {
          this.choiceList.forEach(question => {
            if(question.questionType === 'CHOICE'){
              question.items.forEach(item => {
                if (item.itemId === selected) {
                  item.questionId = question.questionId
                  question.selected.push(item)
                }
              })
            }
          })
        })
        this.onCheckValidation()
      }
      this.onChangeFinishButton()
    },
    onCheckValidation() {
      this.choiceList.forEach(question => {
        if(question.questionType === 'CHOICE'){
          if (!question.isMultipleAnswer && question.selected.length > 1) {
            question.selected = [question.selected.shift()]
            this.selectedItemIds = this.selectedItemIds.filter(selected => {
              return selected !== question.selected[0].itemId
            })
          } else if (question.answerLimit && question.answerLimit < question.selected.length) {
            this.$hiClass.alert(`최대 ${question.answerLimit}개까지 선택 가능합니다.`)
              .then(() => {
                question.selected = question.selected.slice(0, -1)
                this.selectedItemIds = this.selectedItemIds.slice(0, -1)
              })
          }
        }
      })
      this.setSurveyContentsSelected(this.choiceList)
    },
    onChangeFinishButton() {
      if(!isEmpty(this.selectedItemIds)){
        const lastSelect = this.selectedItemIds[this.selectedItemIds.length -1]
        this.choiceList.forEach(list => {
          if(list.questionType === 'CHOICE'){
            list.selected.forEach(select => {
              if(select.itemId === lastSelect) {
                if(select.linkPageId === '00000000-0000-0000-0000-000000000000') {
                  this.setSurveyAnswerFinish(true)
                } else {
                  // if(select.linkPageId) {
                  //   this.setLinkPageId(select.linkPageId)
                  // } else {
                  //   this.setLinkPageId('')
                  // }
                  this.setSurveyAnswerFinish(false)
                }
              }
            })
          }
        })
      } else {
        this.setSurveyAnswerFinish(false)
      }
    }
  }
}
</script>

<style scoped>

</style>