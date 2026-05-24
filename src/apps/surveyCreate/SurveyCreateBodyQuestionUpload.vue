<template>
  <div class="survey__upload">
    <div class="group-btn">
      <survey-upload
        key="surveyUploadQuestion"
        :ref="`surveyUploadQuestion`"
        :files.sync="surveyEditQuestions.files"
        :is-readonly="false"
        :btn-class="'btn-image'"
        :file-category="'IMAGE'"
        :file-target-type="'QUESTION'"
        :file-align="'LEFT'"
      />
    </div>

    <div
      v-if="surveyEditQuestions.files.length > 0"
      class="attachment__list"
    >
      <div class="attachment__item">
        <div
          class="alignbox"
          :class="[
              surveyEditQuestions.files[0].fileAlign
                ? surveyEditQuestions.files[0].fileAlign.toLowerCase()
                : ''
            ]"
        >
          <div class="image">
            <img :src="surveyEditQuestions.files[0].fileOriginalPath" alt="">

            <!--
            <span class="btn-move"></span>
            -->

            <survey-attachment-more
              v-if="surveyEditQuestions.files[0].fileOriginalPath"
              :file="surveyEditQuestions.files[0]"
              @set-file-align="setFileAlign"
              @replace-file="replaceFile('surveyUploadQuestion')"
              @delete-file="deleteFile(surveyEditQuestions.files[0])"
              @edit-image="editImage(surveyEditQuestions.files, 'survey-upload-file-surveyUploadQuestion')"
            />

          </div>
        </div>
      </div>

    </div>
  </div>

</template>

<script>
import {mapActions, mapState} from "vuex";

import SurveyUpload from "@/components/Upload/Survey/SurveyUpload";
import SurveyAttachmentMore from "@/components/MorePopup/SurveyAttachmentMore";

export default {
  name: "survey-create-body-question-upload",
  components: {
    SurveyAttachmentMore,
    SurveyUpload
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyEditQuestions: 'surveyEditQuestions'
    }),
  },
  methods: {
    ...mapActions('storeImageEditor', {
      openImageEditor: 'openImageEditor'
    }),
    setFileAlign(file, value) {
      file.fileAlign = value
    },
    replaceFile(uploadRef) {
      // ref 대상이 복수의 vue component 인 경우 0번 index 확인
      // this.$log.debug(this.$options.name, `replaceFile() this.$refs[uploadRef][0]`, this.$refs[uploadRef][0])
      if (this.$refs[uploadRef]) {
        this.$refs[uploadRef].changeFile()
      }
    },
    deleteFile(file) {
      switch (file.fileTargetType) {
        case 'SURVEY': {
          break
        }
        case 'QUESTION': {
          this.surveyEditQuestions.files = this.surveyEditQuestions.files.filter(item => {
            return item.fileOriginalPath !== file.fileOriginalPath
          })
          break
        }
        case 'ITEM': {
          break
        }
        case 'ANSWER': {
          break
        }
        default: {
          this.surveyEditQuestions.files = this.surveyEditQuestions.files.filter(item => {
            return item.fileOriginalPath !== file.fileOriginalPath
          })
        }
      }
    },
    async editImage(files, key = this.$vnode.key) {
      await this.openImageEditor({
        uploadedFiles: files,
        inputFiles: null,
        imageLimitCount: 1,
        componentKey: key,
        targetIdx: 0,
        parentComponent: 'surveyQuestionUpload'
      })
    }
  }
}
</script>

<style scoped>

</style>