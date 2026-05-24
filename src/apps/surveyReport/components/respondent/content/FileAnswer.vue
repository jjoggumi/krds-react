<template>
  <div>
    <survey-report-question-label
      :question="question"
      :has-question-user-answer="hasQuestionUserAnswer"
      :is-respondent-answer="true"
    >
    </survey-report-question-label>
    <survey-report-question-title :question="question"></survey-report-question-title>
    <div class="uploadbox" v-if="hasQuestionUserAnswer">
      <ul class="group-file">
        <li v-for="file in fileList" :key="`fileAnswer-${file.fileId}`">
          <div class="file" role="button" @click="openFileViewer(file)">
            <span>{{ file.fileName }}</span>
          </div>
        </li>
      </ul>
    </div>

    <template v-else>
      <strong class="text-notice">첨부 파일은 최대 5개까지 등록 가능합니다.</strong>
      <div class="uploadbox">
        <div class="dragfile">
          <span class="btn-upload" role="button"></span>
          <input type="file">
          <p class="heading">이미지, 문서 파일</p>
          <p class="desc">파일을 여기다 끌어다 놓거나 [+] 버튼을 선택하세요</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import {mapActions} from "vuex";
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";

export default {
  name: "file-answer",
  props: {
    question: Object,
    questionUserAnswer: Array
  },
  components: {
    SurveyReportQuestionLabel,
    SurveyReportQuestionTitle
  },
  computed: {
    hasQuestionUserAnswer() {
      return this.questionUserAnswer.length > 0 &&
        this.questionUserAnswer.some(answer => answer.answerType === 'ANSWER')
    },
    hasFileList() {
      return this.questionUserAnswer[0].files.length > 0
    },
    fileList() {
      return this.hasFileList ? this.questionUserAnswer[0].files : []
    }
  },
  methods: {
    ...mapActions({
      openAttachFilesViewer: 'openAttachFilesViewer'
    }),
    openFileViewer(file) {
      let payload

      if (file.fileContentType.startsWith('image') || file.fileContentType.startsWith('video')) {
        payload = {
          items: {file},
          contentType: file.fileContentType
        }
      } else {
        payload = {
          item: file,
          contentType: file.fileContentType
        }
      }
      this.openAttachFilesViewer(payload)
    }
  }
}
</script>

<style scoped>

</style>