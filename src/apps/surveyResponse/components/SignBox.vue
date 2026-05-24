<template>
  <div>
    <div class="esignbox">
      <div class="esign">
        <signature-pad-v2
          ref="signaturePadV2"
          :files.sync="answerFiles"
          :is-required="question.isRequired"
          :question="question"
          @set-is-retry-sign="setIsRetrySign"
        />
      </div>

      <div
        v-if="existsSign"
        class="group-btn"
      >
        <button
          class="hi-btn btn-md btn-line"
          @click="clearSign"
        >
          다시하기
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import SignaturePadV2 from "@/components/SignaturePad/SignaturePadV2.vue";
import {eventBus} from "@/main";
import {mapActions, mapGetters, mapMutations} from "vuex";

export default {
  name: "survey-response-sign-box",
  components: {SignaturePadV2},
  props: {
    question: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isRetrySign: false,
      componentKey: 0,
      signatureDataUrl: null,
      answerFiles: [],
      answerId: null,
    }
  },
  computed: {
    surveyId() {
      return this.curSurveyAnswer().surveyId
    },
    respondentId() {
      return this.curSurveyAnswer().respondentId
    },
    existsSign() {
      const validFile = this.answerFiles.length > 0 && this.answerFiles.find(file => !file.isDel)
      return this.isRetrySign || validFile
    },
  },
  watch: {
    answerFiles() {
      if (this.answerFiles.length > 0) {
        this.answerFiles.forEach(answerFile => {
          // 신규 업로드 파일 data set
          if (answerFile && !answerFile.fileId) {
            answerFile['surveyId'] = this.surveyId
            answerFile['respondentId'] = this.respondentId

            answerFile['questionId'] = this.question['questionId']

            answerFile['itemId'] = null
            answerFile['sortNo'] = this.question['sortNo'] || 1

            answerFile['fileTargetType'] = 'ANSWER'
            answerFile['fileCategory'] = 'SIGN'
            answerFile['fileAlign'] = 'LEFT'
          }
        })
        this.setAnswerFiles(this.answerFiles)
      } else {
        this.setAnswerFiles([])
      }
    },
  },
  mounted() {
    eventBus.$on(`survey-response-save-sign-by-question-id|${this.question.questionId}`,processFn => {
      this.saveSign(processFn)
    })

    if (Object.keys(this.curSurveyAnswer()).length > 0) {
      this.curSurveyAnswer().answers.forEach(answer => {
        if(this.question.questionId === answer.questionId){
          this.answerFiles.splice(0)
          this.answerFiles.push(...answer.files)
          this.answerId = answer.answerId
        }
      })
    }
  },
  beforeDestroy() {
    eventBus.$off(`survey-response-save-sign-by-question-id|${this.question.questionId}`)
  },
  methods: {
    ...mapGetters('storeSurvey', {
      curSurveyAnswer: 'curSurveyAnswer',
      curQuestionsByPageId: 'curQuestionsByPageId',
    }),
    ...mapMutations('storeSurvey', {
      setSignCount: 'setSignCount'
    }),
    clearSign() {
      const answerFiles = this.answerFiles.map(answerFile => {
        answerFile.isDel = true
        return answerFile
      })
      this.answerFiles.splice(0)
      this.answerFiles.push(...answerFiles)
      this.$refs.signaturePadV2.clearSignature()
      this.setIsRetrySign(false)
    },
    async saveSign(validateFn) {
      const result = await this.$refs.signaturePadV2.saveSignature(this.question.questionId)
      if (result !== null) {
        this.setSignCount(this.$store.state.storeSurvey.signCount + 1)
        await validateFn(result)
      }
    },
    setIsRetrySign(flag) {
      this.isRetrySign = flag
    },
    setAnswerFiles(answerFiles) {
      this.curQuestionsByPageId().forEach(question => {
        if (question.questionId === this.question.questionId) {
          question.answerFiles = answerFiles

          if (this.answerId) {
            question.answerId = this.answerId
          }
        }
      }) // end questions
    },
  }
}
</script>

<style scoped>
</style>