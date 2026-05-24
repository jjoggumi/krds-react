<template>
  <div>
    <survey-report-question-label :question="question"></survey-report-question-label>
    <survey-report-question-title :question="question"></survey-report-question-title>

    <p class="counsel__text">{{ consultationPeriod }}</p>

    <div class="counsel__box">
      <div class="counsel__date">
        <div class="heading-box">1. 상담 날짜를 선택하세요.</div>
        <div class="inputbox counsel">
          <input
            type="text"
            placeholder="상담 날짜 선택"
            readonly="readonly"
            :value="consultationDate"
          >
        </div>
      </div>
    </div>

    <div class="counsel__box">
      <div class="heading-box">2. 상담 시간과 상담유형을 선택하세요.</div>

      <div class="counsel__time">
        <p class="heading-box-sub">상담 시간 선택</p>

        <div class="time__list">
          <div class="time__item" v-for="item of consultationItems" :key="item.itemId">
            <input type="radio" name="time" id="time0">
            <label for="time0">
              <span class="time">{{ `${item.itemTimeStart} ~ ${item.itemTimeEnd}` }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="counsel__type">
        <p class="heading-box-sub">상담 유형 선택</p>
        <div class="type__list">
          <div class="type__item" v-if="isPhone">
            <input type="radio" name="type" id="chk-022">
            <label for="chk-022"><span>전화</span><span class="m-hide">상담</span></label>
          </div>
          <div class="type__item" v-if="isVisit">
            <input type="radio" name="type" id="chk-033">
            <label for="chk-033"><span>방문</span><span class="m-hide">상담</span></label>
          </div>
          <div class="type__item" v-if="isRemote">
            <input type="radio" name="type" id="chk-044">
            <label for="chk-044"><span>원격</span><span class="m-hide">상담</span></label>
          </div>
        </div>
      </div>
    </div>
    <span v-if="this.index !== this.questions.length-1" class="groupbar"></span>
  </div>
</template>

<script>
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";

export default {
  name: "survey-recommend-template-preview-consultation",
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
    consultationPeriod() {
      const startDate = this.$moment(this.question.consultation.dateStart).format('MM월 DD일')
      const endDate = this.$moment(this.question.consultation.dateEnd).format('MM월 DD일')
      return `상담기간 : ${startDate} ~ ${endDate}`
    },
    consultationDate() {
      return Object.keys(this.question.consultation.items)[0]
    },
    consultationItems() {
      return this.question.consultation.items[this.consultationDate]
    },
    isPhone() {
      return this.question.consultation.isPhone
    },
    isRemote() {
      return this.question.consultation.isRemote
    },
    isVisit() {
      return this.question.consultation.isVisit
    }
  }
}
</script>

<style scoped>

</style>