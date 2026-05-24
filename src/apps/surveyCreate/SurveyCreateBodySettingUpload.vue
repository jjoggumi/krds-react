<template>
  <div class="survey__upload mb-00">
    <div class="group-btn">
      <survey-upload
        key="curSurveyEditUpload"
        :ref="`curSurveyEditUpload`"
        :files.sync="curSurveyEdit.files"
        :is-readonly="false"
        :btn-class="'btn-image'"
        :file-category="'IMAGE'"
        :file-target-type="'SURVEY'"
        :file-align="'LEFT'"
      />
    </div>

    <div
      v-if="curSurveyEdit.files.length > 0"
      class="attachment__list"
    >
      <div class="attachment__item">
        <div
          class="alignbox"
          :class="[
              curSurveyEdit.files[0].fileAlign
                ? curSurveyEdit.files[0].fileAlign.toLowerCase()
                : ''
            ]"
        >
          <div class="image">
            <img :src="curSurveyEdit.files[0].fileOriginalPath" alt="">

            <!--
            <span class="btn-move"></span>
            -->

            <survey-attachment-more
              v-if="curSurveyEdit.files[0].fileOriginalPath"
              :file="curSurveyEdit.files[0]"
              @set-file-align="setFileAlign"
              @replace-file="replaceFile('curSurveyEditUpload')"
              @delete-file="deleteFile(curSurveyEdit.files[0])"
              @edit-image="editImage(curSurveyEdit.files, 'survey-upload-file-curSurveyEditUpload')"
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
  name: "survey-create-body-setting-upload",
  components: {
    SurveyAttachmentMore,
    SurveyUpload
  },
  computed: {
    ...mapState('storeSurvey', {
      curSurveyEdit: 'curSurveyEdit'
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
          this.curSurveyEdit.files = this.curSurveyEdit.files.filter(item => {
            return item.fileOriginalPath !== file.fileOriginalPath
          })
          break
        }
        case 'QUESTION': {
          break
        }
        case 'ITEM': {
          break
        }
        case 'ANSWER': {
          break
        }
        default: {
          this.curSurveyEdit.files = this.curSurveyEdit.files.filter(item => {
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
        parentComponent: 'surveySettingUpload'
      })
    }
  }
}
</script>

<style scoped>

</style>