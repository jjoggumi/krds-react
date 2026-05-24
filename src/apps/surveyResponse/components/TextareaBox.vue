<template>
  <div>
    <textarea
        ref="etcAnswerTextarea"
        class="textareabox subjective count-textarea"
        placeholder="내용을 입력해주세요."
        :disabled="disabledTextArea"
        :value="answerText"
        @input="inputEvent($event)"
    />
    <div class="count-word">
      <span :class="answerText ? 'count is-active' : 'count'">{{ answerTextCount}}</span> <!-- 1 이상이면 .is-active 추가 -->
      <span>/10,000</span>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";
import {isEmpty} from "lodash";

export default {
  name: "survey-response-textarea-box",
  props: {
    isReadOnly: {
      type: Boolean
    },
    question: {
      type: Object,
      required: true
    },
    isRecommendTemplate: {
      type: Boolean
    }
  },
  computed: {
    answers() {
      return this.$store.state.storeSurvey.curSurveyAnswer
    },
    answerTextCount() {
      return this.answerText ? this.$stringUtil.addCommas([...this.answerText].length) : 0
    }
  },
  watch: {
    answerText(e) {
      this.setAnswerText(e)
    },
    answers() {
      if (!isEmpty(this.curSurveyAnswer().answers) && !this.isRecommendTemplate) {
        this.curSurveyAnswer().answers.forEach(answer => {
          if (this.question.questionId === answer.questionId) {
            this.question.answerText = answer.answerText
            this.answerText = answer.answerText
          }
        })
      }
    }
  },
  data() {
    return {
      answerText: '',
      etcAnswerTextarea: '',
      disabledTextArea: false
    }
  },
  async mounted() {
    if(isEmpty(this.curSurveyAnswer().answers) && !this.isRecommendTemplate) {
      await this.getSurveyAnswer()
    } else {
      if (!this.isRecommendTemplate) {
        this.curSurveyAnswer().answers.forEach(answer => {
          if (this.question.questionId === answer.questionId) {
            this.question.answerText = answer.answerText
            this.answerText = answer.answerText
            this.prevAnswerText = answer.answerText
          }
        })
      }
    }
  },
  methods: {
    ...mapGetters('storeSurvey', {
      curQuestionsByPageId: 'curQuestionsByPageId',
      curSurveyAnswer: 'curSurveyAnswer'
    }),
    ...mapActions('storeSurvey', {
      getSurveyAnswer: 'getSurveyAnswer',
    }),
    setAnswerText(e) {
      this.curQuestionsByPageId().forEach(question => {
        if (this.question.questionId === question.questionId) {
          question.answerText = e
        }
      })
    },
    inputEvent(event) {
      this.$hiClass.textareaAutoResize(this.$refs[`etcAnswerTextarea`], 100)
      this.checkTextLength(event)
    },
    checkTextLength(event) {
      let value = event.target.value

      if ([...value].length > 10000) {
        if (this.$toasted.toasts.length === 0) { // 토스트 메시지가 없을때
          this.$toasted.show('10,000자까지 가능합니다.')
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