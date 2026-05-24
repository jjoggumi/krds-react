<template>
  <div class="survey-create__box">
    <survey-report-question-label :question="question"></survey-report-question-label>
    <survey-report-question-title :question="question"></survey-report-question-title>
    <survey-report-question-description
      v-if="question.questionDescription"
      :question-description="question.questionDescription"
    >
    </survey-report-question-description>
    <div class="survey__stats">
      <div class="survey__tab type-button">
        <button
          class="hi-btn btn-md"
          v-for="classItem of classArr"
          :key="classItem.itemId"
          :class="{'is-active': classItem.itemId === selectedAfterSchool.itemId}"
          @click="setSelectedAfterSchool(classItem)"
        >
          {{ classItem.itemTitle }}
        </button>
      </div>

      <div class="fcfs__list">
        <after-school-item
          :after-school-item="selectedAfterSchool"
          :is-mobile="isMobile"
          :question="question"
          :cur-survey-id="curSurveyId"
        >
        </after-school-item>
      </div>

      <div class="survey__tab type-tab">
        <button
          :class="{'is-active': currentListTab === 'COMPLETE'}"
          @click="setCurrentListTab('COMPLETE')"
        >
          신청내역 ({{ limitTotalCount }}명)
        </button>
        <button
          :class="{'is-active': currentListTab === 'WAIT'}"
          @click="setCurrentListTab('WAIT')"
        >
          대기자 신청내역 ({{ limitWaitCount }}명)
        </button>
      </div>
      <after-school-applicant-list
        :after-school-apply-list="applyList"
        :selected-after-school="selectedAfterSchool"
        :current-list-tab="currentListTab"
      >
      </after-school-applicant-list>
    </div>
  </div>
</template>

<script>
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";
import SurveyReportQuestionDescription from "@/apps/surveyReport/components/common/SurveyReportQuestionDescription";
import AfterSchoolApplicantList from "@/apps/surveyReport/components/statistics/chart/AfterSchoolApplicantList";
import AfterSchoolItem from "@/apps/surveyReport/components/statistics/chart/AfterSchoolItem";
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  name: "after-school",
  data() {
    return {
      selectedAfterSchool: {},
      selectedAfterSchoolTimeTables: {},
      currentListTab: 'COMPLETE',
      afterSchoolApplyList: []
    }
  },
  props: {
    curSurveyId: {
      type: String
    },
    question: {
      type: Object
    },
    questionType: {
      type: String
    },
    isAnonymous: {
      type: Boolean
    },
    isUsedUrl: {
      type: Boolean
    },
    isMobile: {
      type: Boolean
    }
  },
  components: {
    SurveyReportQuestionLabel,
    SurveyReportQuestionTitle,
    AfterSchoolApplicantList,
    AfterSchoolItem,
    SurveyReportQuestionDescription
  },
  computed: {
    ...mapState('storeSurvey', ['surveyReport']),
    classArr() {
      return this.question.itemList
    },
    limitTotalCount() {
      return this.selectedAfterSchool.limitCount.limitTotalCount
    },
    limitWaitCount() {
      return this.selectedAfterSchool.limitCount.limitWaitCount
    },
    activeTagIds() {
      return this.surveyReport.statistics.activeTagIds
    },
    applyList() {
      return this.activeTagIds.length > 0 ?
          this.afterSchoolApplyList.filter(r => r.tags && r.tags.some(tag => this.activeTagIds.includes(tag.tagId))) :
          this.afterSchoolApplyList
    }
  },
  created() {
    this.setSelectedAfterSchool(this.classArr[0])
  },
  methods: {
    ...mapActions('storeSurvey', {
      getAfterSchoolLimitCount: 'getAfterSchoolLimitCount'
    }),
    ...mapMutations('storeSurvey', ['setReplyPopupSelectedItem']),
    async setSelectedAfterSchool(selectedAfterSchool) {
      this.selectedAfterSchool = selectedAfterSchool
      await this.getAfterSchoolApplyList(this.selectedAfterSchool.itemId,{ page: 0, size: 20 })
      const res = await this.getAfterSchoolLimitCount(this.selectedAfterSchool.itemId)
      this.setAfterSchoolLimitCount(res.data)
      this.setReplyPopupSelectedItem(this.selectedAfterSchool)
    },
    setAfterSchoolLimitCount(limitCount) {
      this.selectedAfterSchool.limitCount.limitTotalCount = limitCount.totalCount
      this.selectedAfterSchool.limitCount.limitTotalMax = limitCount.totalMax
      this.selectedAfterSchool.limitCount.limitWaitCount = limitCount.waitCount
      this.selectedAfterSchool.limitCount.limitWaitMax = limitCount.waitMax
    },
    setCurrentListTab(tab) {
      this.currentListTab = tab
    },
    async getAfterSchoolApplyList(itemId, paging) {
      try {
        const { data } = await this.$axios.post(`/surveys/report/${this.curSurveyId}/answers/${itemId}/popup`, paging)
        const answers = data._embedded?.surveyReportPopUpAnswerDtoes

        if (answers) {
          paging.page === 0 ?
              this.afterSchoolApplyList = answers :
              this.afterSchoolApplyList.push(...answers)

          const { totalPages, number } = data.page
          if (totalPages > number + 1) {
            paging.page++
            await this.getAfterSchoolApplyList(itemId, paging)
          }
        } else {
          this.afterSchoolApplyList = []
        }
      } catch (err) {
        this.$log.debug(err)
      }
    }
  },
  watch: {
    classArr: {
      handler: function (newVal) {
        if (newVal.findIndex(c => c.itemId === this.selectedAfterSchool.itemId) > -1) {
          this.selectedAfterSchool = newVal[newVal.findIndex(c => c.itemId === this.selectedAfterSchool.itemId)]
        }
      },
      deep: true
    }
  }
}
</script>