<template>
  <div class="objective__item">

    <div class="objective__box">
      <div class="checkbox">
        <input
            :type="inputType"
            :id="itemId"
            :name="inputType"
            :value="itemId"
            :disabled="isReadOnly"
            v-model="itemIdData"
        >
        <label
            :for="itemId"
        >
          <span>{{ itemTitle }}</span>

          <survey-response-file-box
              v-for="file of itemFiles"
              :key="file.fileId"
              :file="file"
          />
        </label>
      </div>
    </div>

    <template
        v-if="isEtcAnswer"
    >
      <textarea
          ref="etcAnswerTextarea"
          class="textareabox count-textarea"
          placeholder="내용을 입력해주세요."
          :disabled="disabledTextArea"
          @blur="setAnswerText"
          :value="answerText"
          @input="inputEvent($event)"
      ></textarea>
      <div class="count-word">
        <span
            class="count"
            :class="{
            'is-active': existsAnswerText
          }"
        >
          {{ answerTextCountStr }}
        </span>
        <span>/1,000</span>
      </div>
    </template>

  </div>
</template>

<script>
import SurveyResponseFileBox from "@/apps/surveyResponse/components/FileBox";
import {mapActions, mapGetters, mapMutations} from "vuex";

export default {
  name: "survey-response-question-type-choice-item",
  components: {
    SurveyResponseFileBox
  },
  props: {
    validation: {
      type: String
    },
    questionItem: {
      type: Object
    },
    isMultipleAnswer: {
      type: Boolean
    },
    isReadOnly: {
      type: Boolean
    },
    selectedItemIds: {
      type: Array
    },
    question: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      answerText: '',
      prevAnswerText: ''
    }
  },
  computed: {
    ...mapGetters('storeSurvey', {
      curSurveyAnswers: 'curSurveyAnswer'
    }),
    curSurveyAnswers() {
      return this.curSurveyAnswer()
    },
    itemIdData: {
      get() {
        return this.selectedItemIds
      },
      set(value) {
        this.$emit('update:selectedItemIds', value)
      }
    },
    itemId() {
      return this.questionItem.itemId
    },
    itemTitle() {
      return this.questionItem.itemTitle
    },
    itemFiles() {
      return this.questionItem.files
    },
    inputType() {
      return 'checkbox'
    },
    isEtcAnswer() {
      return this.questionItem.isEtcAnswer
    },
    answerTextCount() {
      return this.answerText ? [...this.answerText].length : 0
    },
    existsAnswerText() {
      return this.answerTextCount > 0
    },
    answerTextCountStr() {
      return (this.answerTextCount || 0).toLocaleString('ko-KR')
    },
    disabledTextArea() {
      return this.isReadOnly || !this.selectedItemIds.includes(this.itemId)
    }
  },
  watch: {
    curSurveyAnswers() {
      //문항선택값 셋팅
      this.answerText = null
      this.setData()
    },
    itemIdData(v) {
      this.$emit('onSelectedItems', v)
    }
  },
  mounted() {
    this.setData()
  },
  methods: {
    ...mapGetters('storeSurvey', {
      curAnswerPageQuestionNumber: 'curAnswerPageQuestionNumber',
      curSurveyAnswer: 'curSurveyAnswer',
      curQuestionsByPageId: 'curQuestionsByPageId'
    }),
    setData() {
      setTimeout(() => {
        //문항선택값 셋팅
        //서베이컨텐츠의 surveyType 설문 유형 (SURVEY:설문, VOTE:투표, AFTER_SCHOOL:방과후 신청, CONSULTATION:학부모 상담)
        if (this.curSurveyAnswer().answers) {
          for (let i = 0; i < this.curSurveyAnswer().answers.length; i++) {
            if (this.curSurveyAnswer().answers[i].itemId === this.questionItem.itemId) {
              if (this.selectedItemIds.length === 0) {
                this.itemIdData = this.inputType !== 'checkbox' ? this.curSurveyAnswer().answers[i].itemId : [this.curSurveyAnswer().answers[i].itemId]
              } else {
                if (typeof this.itemIdData !== 'string') {
                  this.itemIdData.push(this.curSurveyAnswer().answers[i].itemId)
                  this.itemIdData = [...new Set(this.itemIdData)]
                } else {
                  this.itemIdData = this.curSurveyAnswer().answers[i].itemId
                }
              }
              if (this.curSurveyAnswer().answers[i].answerText) {
                this.answerText = this.curSurveyAnswer().answers[i].answerText
                this.prevAnswerText = this.curSurveyAnswer().answers[i].answerText
                this.setAnswerText()
              }
            }
          }
        }
      })
    },
    setAnswerText() {
      this.curQuestionsByPageId().forEach(question => {
        question.items
            .forEach((item) => {
              if(item.itemId === this.itemId)item.answerText = this.answerText
            })
      })
    },
    inputEvent(event) {
      this.$hiClass.textareaAutoResize(this.$refs[`etcAnswerTextarea`], 24)
      this.checkTextLength(event)
    },
    checkTextLength(event) {
      let value = event.target.value

      if ([...value].length > 1000) {
        if (this.$toasted.toasts.length === 0) { // 토스트 메시지가 없을때
          this.$toasted.show('1,000자까지 가능합니다.')
        }
        value = this.prevAnswerText
      }

      this.answerText = value
      this.prevAnswerText = value
      this.$refs.etcAnswerTextarea.value = value
    }
  }
}
</script>

<style scoped>

</style>