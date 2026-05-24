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

<!--    신청완료-->
    <template v-if="completeAnswers.length > 0">
      <div class="survey__result">
        <div class="result">
          <span class="num">{{ `신청완료 (${completeAnswers.length})` }}</span>
        </div>
      </div>
      <div class="fcfs__list">
        <div class="fcfs__item is-opened" v-for="completeAnswer of completeAnswers" :key="completeAnswer.answerId">
          <div class="fcfs__content">
            <div class="fcfs__heading">
              <strong class="heading" :class="{'deleted': getIsCanceled(completeAnswer.itemId)}">
                {{ getTitle(completeAnswer.itemId) }}
              </strong>
            </div>
            <div class="fcfs__info">
              <p>
                <span>일정</span>
                <span>
                  <template
                    v-for="(timeTableGroup, idx) of groupByTimeTable(completeAnswer.itemId)"
                  >
                    <span class="schedule" :key="`completeTimeTable-${idx}`">
                      {{ timeTableItWeekTime(timeTableGroup) }}
                    </span>
                  </template>
                </span>
              </p>
              <p><span>정원</span><span>{{ getApplyCount(completeAnswer.itemId) }}</span></p>
              <p><span>대상</span><span>{{ getTargets(completeAnswer.itemId) }}</span></p>
              <p v-if="getTuition(completeAnswer.itemId)"><span>수강료</span><span>{{ `${getTuition(completeAnswer.itemId)}원` }}</span></p>
              <p v-if="getInstructorName(completeAnswer.itemId)"><span>강사명</span><span>{{ getInstructorName(completeAnswer.itemId) }}</span></p>
            </div>
            <div class="fcfs__desc">
              <p>{{ getDescription(completeAnswer.itemId) }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>

<!--    대기자 신청-->
    <template v-if="waitAnswers.length > 0">
      <div class="survey__result">
        <div class="result">
          <span class="num">{{ `대기자 신청 (${waitAnswers.length})` }}</span>
        </div>
      </div>
      <div class="fcfs__list">
        <div class="fcfs__item is-opened" v-for="waitAnswer of waitAnswers" :key="waitAnswer.answerId">
          <div class="fcfs__content">
            <div class="fcfs__heading">
              <strong class="heading">{{ getTitle(waitAnswer.itemId) }}</strong>
            </div>
            <div class="fcfs__info">
              <p>
                <span>일정</span>
                <span>
                  <template
                    v-for="(timeTableGroup, idx) of groupByTimeTable(waitAnswer.itemId)"
                  >
                    <span class="schedule" :key="`waitTimeTable-${idx}`">
                      {{ timeTableItWeekTime(timeTableGroup) }}
                    </span>
                  </template>
                </span>
              </p>
              <p><span>정원</span><span>{{ getApplyCount(waitAnswer.itemId) }}</span></p>
              <p><span>대상</span><span>{{ getTargets(waitAnswer.itemId) }}</span></p>
              <p v-if="getTuition(waitAnswer.itemId)"><span>수강료</span><span>{{ `${getTuition(waitAnswer.itemId)}원` }}</span></p>
              <p v-if="getInstructorName(waitAnswer.itemId)"><span>강사명</span><span>{{ getInstructorName(waitAnswer.itemId) }}</span></p>
            </div>
            <div class="fcfs__desc">
              <p>{{ getDescription(waitAnswer.itemId) }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>

<!--    신청내역 없음-->
    <template v-if="completeAnswers.length === 0 && waitAnswers.length === 0">
      <div class="survey__result">
        <div class="result">
          <span class="text-answer">신청 내역이 없습니다.</span>
        </div>
      </div>
    </template>

  </div>
</template>

<script>
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";
import SurveyReportQuestionDescription from "@/apps/surveyReport/components/common/SurveyReportQuestionDescription";
import SurveyReportQuestionImage from "@/apps/surveyReport/components/common/SurveyReportQuestionImage";
import { getAfterSchoolTargets } from '@/plugins/utils'

export default {
  name: "after-school-answer",
  data() {
    return {
      completeAnswers: [],
      waitAnswers: []
    }
  },
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
    timeTableItWeekTime() {
      return (timetableGroup) => {
        let days = ''

        timetableGroup.forEach((timeTable, idx) => {
          days += this.parseDayOfWeek(timeTable.dayOfWeek)
          if (timetableGroup.length > idx + 1) {
            days += ','
          }
        })

        return `${days} ${timetableGroup[0].timeStart} ~ ${timetableGroup[0].timeEnd}`
      }
    },
  },
  methods: {
    groupByTimeTable(answerItemId) {
      const timeTableGroup = this.questionItems.find(item => item.itemId === answerItemId).timetables
      return _.groupBy(timeTableGroup, (timeTable) => {
        return [timeTable['timeStart'], timeTable['timeEnd']];
      })
    },
    groupByAnswersWaitStatus() {
      this.completeAnswers = []
      this.waitAnswers = []
      const statusGroup = _.groupBy(this.questionUserAnswer, 'waitStatus')
      if (statusGroup.hasOwnProperty('COMPLETE')) {
        this.completeAnswers = _.groupBy(this.questionUserAnswer, 'waitStatus').COMPLETE
      }
      if (statusGroup.hasOwnProperty('WAIT')) {
        this.waitAnswers = _.groupBy(this.questionUserAnswer, 'waitStatus').WAIT
      }
    },
    parseDayOfWeek(dayOfWeek) {
      switch (dayOfWeek) {
        case 1:
          return '월'
        case 2:
          return '화'
        case 3:
          return '수'
        case 4:
          return '목'
        case 5:
          return '금'
        case 6:
          return '토'
        case 7:
          return '일'
      }
    },
    getTitle(answerItemId) {
      const title = this.questionItems.find(item => item.itemId === answerItemId).itemTitle
      return this.getIsCanceled(answerItemId) ? `(폐강) ${title}` : title
    },
    getApplyCount(answerItemId) {
      const limitCount = this.questionItems.find(item => item.itemId === answerItemId).limit
      if (limitCount) {
        const applyTotal = limitCount.totalCount + limitCount.waitCount
        const completeCount = limitCount.totalCount
        const completeMax = limitCount.totalMax
        const waitCount = limitCount.waitCount
        const waitMax = limitCount.waitMax

        return `${applyTotal}명 (신청: ${completeCount}/${completeMax} , 대기 : ${waitCount}/${waitMax})`
      } else {
        return ''
      }

    },
    getTargets(answerItemId) {
      const targets = this.questionItems.find(item => item.itemId === answerItemId).targets
      return getAfterSchoolTargets(targets)
    },
    getTuition(answerItemId) {
      return this.questionItems.find(item => item.itemId === answerItemId).tuition
    },
    getIsCanceled(answerItemId) {
      return this.questionItems.find(item => item.itemId === answerItemId).isCanceled
    },
    getInstructorName(answerItemId) {
      return this.questionItems.find(item => item.itemId === answerItemId).instructorName
    },
    getDescription(answerItemId) {
      return this.questionItems.find(item => item.itemId === answerItemId).itemDescription
    }
  },
  watch: {
    questionUserAnswer: {
      handler: function () {
        this.groupByAnswersWaitStatus()
      }
    }
  }
}
</script>

<style scoped>

</style>