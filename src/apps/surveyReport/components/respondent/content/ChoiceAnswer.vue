<template>
  <div>
    <survey-report-question-label
      :question="question"
      :has-question-user-answer="hasQuestionUserAnswer"
      :is-respondent-answer="true"
    />
    <survey-report-question-title :question="question"/>
    <survey-report-question-description
      v-if="question.questionDescription"
      :question-description="question.questionDescription"
    />
    <survey-report-question-image
      v-if="question.files.length > 0"
      :question-files="question.files"
    />

    <div class="objective__list">
      <div
        class="objective__item"
        v-for="questionItem in questionItems"
        :key="`choiceAnswer-${questionItem.itemId}`"
      >
        <div class="objective__box">
          <div :class="questionItemClassStyle(questionItem)">
            <input
              type="checkbox"
              :id="questionItem.itemId"
              :checked="isSelected(questionItem)"
              disabled
            >
            <label
              :for="questionItem.itemId"
            >
              <span>
                {{ questionItemTitle(questionItem) }}
              </span>
              <div :class="fileAlign(questionItem.files[0])" v-if="hasFile(questionItem.files)">
                <div class="image">
                  <img :src="questionItem.files[0].fileOriginalPath" alt="">
                  <button class="btn-view" @click="showOriginalImage(questionItem.files[0])"></button>
                </div>
              </div>
            </label>
          </div>
        </div>
        <textarea
          v-if="questionItem.isEtcAnswer"
          class="textareabox"
          placeholder="내용을 입력해주세요."
          :value="answerText(questionItem)"
          readonly
        >
        </textarea>
      </div>
    </div>
  </div>
</template>

<script>
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";
import SurveyReportQuestionDescription from "@/apps/surveyReport/components/common/SurveyReportQuestionDescription";
import SurveyReportQuestionImage from "@/apps/surveyReport/components/common/SurveyReportQuestionImage";
import {mapActions} from "vuex";

export default {
  name: "choice-answer",
  props: {
    question: Object,
    questionUserAnswer: Array
  },
  components: {
    SurveyReportQuestionLabel,
    SurveyReportQuestionTitle,
    SurveyReportQuestionDescription,
    SurveyReportQuestionImage
  },
  computed: {
    hasQuestionUserAnswer() {
      return this.questionUserAnswer.length > 0 &&
        this.questionUserAnswer.some(answer => answer.answerType === 'ANSWER')
    },
    questionItems() {
      return this.question.items
    },
    questionItemClassStyle() {
      return (questionItem) => {
        return questionItem.isDel ?  'checkbox deleted' : 'checkbox'
      }
    },
    questionItemTitle() {
      return (questionItem) => {
        return questionItem.isDel ? `(삭제)${questionItem.itemTitle}` : questionItem.itemTitle
      }
    },
    isSelected() {
      return (questionItem) => {
        return this.hasQuestionUserAnswer ? this.questionUserAnswer.find(answer => {
          return answer.itemId === questionItem.itemId
        }) : false
      }
    },
    answerText() {
      return (questionItem) => {
        return this.questionUserAnswer.find(answer => answer.itemId === questionItem.itemId) ?
          this.questionUserAnswer.find(answer => answer.itemId === questionItem.itemId).answerText : ''
      }
    },
    hasFile() {
      return (files) => {
        return files.length > 0
      }
    },
    fileAlign() {
      return (file) => {
        return `alignbox ${file.fileAlign.toLowerCase()}`
      }
    }
  },
  methods: {
    ...mapActions({
      openAttachFilesViewer: 'openAttachFilesViewer'
    }),
    showOriginalImage(file) {
      const payload = {
        items: {fileItem: file},
        contentType: file.fileContentType
      }

      this.openAttachFilesViewer(payload)
    }
  }
}
</script>

<style scoped>

</style>