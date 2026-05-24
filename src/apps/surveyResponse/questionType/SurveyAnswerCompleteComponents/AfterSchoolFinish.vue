<template>
  <div>
    <div class="survey__heading"><strong class="heading-sub">방과후 수업 신청내역</strong></div>
    <after-school-complete-contents :items="list" />
  </div>
</template>

<script>
import AfterSchoolCompleteContents from "@/apps/surveyResponse/questionType/SurveyAnswerCompleteComponents/AfterSchoolCompleteContents";
import {mapState} from "vuex";

export default {
  name: "survey-response-question-type-after-finish",
  components:{
    AfterSchoolCompleteContents,
  },
  props: {
    completeList: {
      type: Array
    },
  },
  data() {
    return {
      list: []
    }
  },
  mounted(){
    if(!this.isSimulation()){
      this.list = this.completeList
    }
  },
  methods: {
    ...mapState('storeSurvey', {
      isSimulation: 'isSimulation'
    })
  }
}
</script>

<style scoped>

</style>