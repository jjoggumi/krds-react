<template>
  <div class="stats__details">
    <div class="tab">
      <button
        :class="{'is-active': currentTab === 'COMPLETE'}"
        @click="setCurrentTab('COMPLETE')"
      >
        신청완료
      </button>
      <button
        :class="{'is-active': currentTab === 'WAIT'}"
        @click="setCurrentTab('WAIT')"
      >
        대기자 신청
      </button>
    </div>
    <div class="content" v-if="applicantList.length > 0">
      <span class="total">총 {{ applicantCount }}명</span>
      <div
        class="respondent__list"
      >
        <div
          class="respondent__item"
          v-for="applicant of applicantList"
          :key="applicant.respondentId"
        >
          <div class="info">
            <span class="num" v-if="applicant.classNumber">
              {{ applicant.classNumber }}
            </span>
            <span class="name">
              {{ applicantName(applicant) }}
            </span>
          </div>
          <div>
            <span class="date">
              {{ timestampToDateTime(applicant.answeredTimestamp) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="content" style="display: block;" v-else>
      <div class="hi-nodata">
        <p>신청내역이 없습니다.</p>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";

export default {
  name: "mobile-after-school-applicant-list",
  data() {
    return {
      currentTab: 'COMPLETE',
      questionId: '',
      itemId: '',
      afterSchoolApplyList: []
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport'
    }),
    activeTagIds() {
      return this.surveyReport.statistics.activeTagIds
    },
    applicantList() {
      return this.activeTagIds.length > 0 ?
          this.afterSchoolApplyList.filter(a => a.tags && a.tags.some(tag => this.activeTagIds.includes(tag.tagId))) :
          this.afterSchoolApplyList
    },
    currentQuestionItem() {
      const currentQuestion = this.surveyReport.statistics.curStatisticsItems.find(item => item.questionId === this.questionId)
      if (!currentQuestion) return null
      const currentQuestionItem = currentQuestion.itemList.find(item => item.itemId === this.itemId)
      return currentQuestionItem ? currentQuestionItem : null
    },
    applicantCount() {
      if (this.currentQuestionItem === null) {
        return this.surveyReport.statistics.replyPopup.answerCount
      }
      return this.currentTab === 'COMPLETE' ?
          this.currentQuestionItem.limitCount.limitTotalCount :
          this.currentQuestionItem.limitCount.limitWaitCount
    },
    applicantName() {
      return (applicant) => {
        const classGradeBan = `${applicant.classGrade.substring(1,2)}학년 ${applicant.classBan}반`
        const respondentName = applicant.respondentName
        const subjectName = applicant.subjectName

        switch (applicant.userType) {
          case 'TEACHER':
            return `${classGradeBan} ${respondentName} 선생님`
          case 'PARENTS':
            return `${classGradeBan} ${respondentName} 학부모 (${subjectName})`
          case 'STUDENT':
            return `${classGradeBan} ${respondentName} 학생 (${subjectName})`
          case 'NONMEMBER':
            return `${classGradeBan} ${respondentName} (${subjectName})`
        }
      }
    }
  },
  methods: {
    async getAfterSchoolApplyList(paging = { page: 0, size: 20, waitStatus: this.currentTab }) {
      try {
        const { data } = await this.$axios.post(`/surveys/report/${this.surveyReport.curSurveyId}/answers/${this.itemId}/popup`, paging)
        const answers = data._embedded?.surveyReportPopUpAnswerDtoes

        if (answers) {
          paging.page === 0 ?
              this.afterSchoolApplyList = answers :
              this.afterSchoolApplyList.push(...answers)

          const { totalPages, number } = data.page
          if (totalPages > number + 1) {
            paging.page++
            await this.getAfterSchoolApplyList(paging)
          }
        } else {
          this.afterSchoolApplyList = []
        }
      } catch (err) {
        this.$log.debug(err)
      }
    },
    timestampToDateTime(timestamp) {
      return this.$moment(timestamp).format('YY.MM.DD HH:mm:ss')
    },
    setCurrentTab(tab) {
       this.currentTab = tab
    },
  },
  mounted() {
    this.questionId = this.$route.params.questionId
    this.itemId = this.$route.query.itemId
    this.getAfterSchoolApplyList()
  },
  watch: {
    currentTab: {
      handler: function () {
        this.getAfterSchoolApplyList()
      }
    }
  }
}
</script>

<style scoped>

</style>