<template>
  <div>
    <survey-report-question-label :question="question"></survey-report-question-label>
    <survey-report-question-title :question="question"></survey-report-question-title>

    <div class="fcfs__list fcfs__details">
      <div
        class="fcfs__item"
        v-for="item of questionItems"
        :key="item.itemId"
      >
        <div class="fcfs__content">
          <div class="fcfs__heading">
            <strong class="heading">{{ item.itemTitle }}</strong>
            <div class="group-btn">
              <button class="hi-btn btn-md">신청</button>
            </div>
          </div>
          <div class="fcfs__infobox">
            <p class="num">정원 <span>{{ item.limit.totalMax }}</span>명</p>
            <p class="schedule" v-html="getTimetables(item.timetables)"/>
          </div>
          <div class="fcfs__info">
            <p><span>대상</span><span>{{ getTargets(item.targets) }}</span></p>
            <p><span>수강료</span><span>{{ tuition(item.tuition) }}</span></p>
            <p><span>강사명</span><span>{{ instructorName(item.instructorName) }}</span></p>
          </div>
          <div class="fcfs__desc"><p>{{ item.itemDescription }}</p></div>
          <button class="btn-toggle-fcfs"><span></span></button>
        </div>
      </div>
    </div>
    <span v-if="this.index !== this.questions.length-1" class="groupbar"></span>
  </div>
</template>

<script>
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";
import {getAfterSchoolTargets, getAfterSchoolTimetables} from "@/plugins/utils";

export default {
  name: "survey-recommend-template-preview-after-school",
  components: {
    SurveyReportQuestionLabel,
    SurveyReportQuestionTitle
  },
  props: {
    question: {
      type: Object,
      required: true
    },
    questions: {
      type: Array,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    isRecommendTemplate: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    questionItems() {
      return this.question.items
    },
    tuition() {
      return (tuition) => {
        return tuition ? `${tuition}원` : ''
      }
    },
    instructorName() {
      return (instructorName) => {
        return instructorName ? instructorName : ''
      }
    }
  },
  methods: {
    getTargets(targets) {
      return getAfterSchoolTargets(targets)
    },
    getTimetables(timeTables) {
      return getAfterSchoolTimetables(timeTables)
    }
  }
}
</script>

<style scoped>

</style>