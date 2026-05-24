<template>
  <div class="attachment__list" v-if="imgFlag">
    <div class="attachment__item" v-for="file of questionFiles"  :key="file.fileId">
      <survey-response-file-box
        :file="file"
      />
    </div>
  </div>
</template>

<script>
import {isEmpty} from "lodash";
import SurveyResponseFileBox from "@/apps/surveyResponse/components/FileBox";

export default {
  name: "QuestionImg",
  components: { SurveyResponseFileBox },
  props: {
    question: {
      type: Object
    }
  },
  data() {
    return {
      imgFlag: false,
      questionFiles: []
    }
  },
  mounted() {
    if (!isEmpty(this.question.files)) {
      this.questionFiles = this.question.files
      this.imgFlag = true
    }
  }
}
</script>

<style scoped>

</style>