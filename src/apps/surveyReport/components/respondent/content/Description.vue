<template>
  <div>
    <survey-report-question-title :question="question"></survey-report-question-title>
    <div class="survey__desc">
      <p>{{ question.questionDescription }}</p>
    </div>
    <div class="attachment__list">
      <div class="attachment__item" v-for="(file, idx) in fileList" :key="`descriptionFile-${idx}-${file.fileId}`">
        <div :class="`alignbox ${file.fileAlign.toLowerCase()}`">
          <div :class="fileType(file.fileContentType)">
            <img v-if="fileType(file.fileContentType) === 'image'" :src="file.fileOriginalPath">
            <video v-if="fileType(file.fileContentType) === 'video'" controls="" :src="file.fileOriginalPath"></video>
            <audio v-if="fileType(file.fileContentType) === 'audio'" controls="" :src="file.fileOriginalPath"></audio>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";

export default {
  name: "description",
  components: {
    SurveyReportQuestionTitle
  },
  props: {
    question: Object,
    questionUserAnswer: Array
  },
  computed: {
    hasQuestionUserAnswer() {
      return this.questionUserAnswer.length > 0
    },
    hasFileList() {
      return this.question.files.length > 0
    },
    fileList() {
      const list = [
        {
          fileId: '',
          questionId: '',
          itemId: '',
          answerId: '',
          sortNo: 1,
          fileCategory: 'IMAGE',
          fileLinkUrl: '',
          fileName: 'survey1.JPEG',
          fileContentType: 'image/jpeg',
          fileOriginalPath: 'https://download.hiclass.net/7e60/8760/a260/d260/280aec8a-4131-42c6-ac65-f94975a02dd3.JPEG',
          fileConvertPath: 'https://download.hiclass.net/7e60/8760/a260/d260/280aec8a-4131-42c6-ac65-f94975a02dd3.JPEG',
          fileTranscodePath: '',
          fileThumbnailPath: '',
          fileAlign: 'CENTER'
        },
        {
          fileId: '',
          questionId: '',
          itemId: '',
          answerId: '',
          sortNo: 2,
          fileCategory: 'VIDEO',
          fileLinkUrl: '',
          fileName: 'mov_bbb.mp4',
          fileContentType: 'video/mp4',
          fileOriginalPath: 'https://download.hiclass.net/7e40/8340/9240/ac40/2fd4f5d1-a076-4632-9286-d9306449a17b.mp4',
          fileConvertPath: '',
          fileTranscodePath: '',
          fileThumbnailPath: '',
          fileAlign: 'RIGHT'
        }
      ]
      // return this.question.files
      return list
    },
    fileType() {
      return (fileContentType) => {
        if (fileContentType.startsWith('image')) {
          return 'image'
        } else if (fileContentType.startsWith('video')) {
          return 'video'
        } else if (fileContentType.startsWith('audio')) {
          return 'audio'
        }
      }
    }
  }
}
</script>

<style scoped>

</style>