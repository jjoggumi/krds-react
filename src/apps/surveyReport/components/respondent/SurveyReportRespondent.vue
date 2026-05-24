<template>
  <div class="survey__content">
    <div class="column-left">
      <survey-report-respondent-list
        v-if="hasList"
        :cur-survey-id="curSurveyId"
        :is-anonymous="isAnonymous"
        :is-used-url="isUsedUrl"
      />
      <survey-report-respondent-list-empty
        v-else
      />
    </div>
    <div class="column-content">
      <template v-if="!hasList || Object.keys(selectedRespondent).length === 0">
        <div class="survey-view__content all">
          <div class="respondent__nodata">
            <div :class="noDataClass">
              <p>{{ noDataMsg }}</p>
            </div>
          </div>
        </div>
      </template>

      <template v-if="hasList && Object.keys(selectedRespondent).length !== 0">
        <survey-report-respondent-info
          :is-anonymous="isAnonymous"
          :is-complete="isComplete"
          :is-reject="isReject"
          :is-temporary="isTemporary"
        >
        </survey-report-respondent-info>
        <survey-report-respondent-answer
          :is-anonymous="isAnonymous"
          :is-complete="isComplete"
          :is-reject="isReject"
          :is-temporary="isTemporary"
        >
        </survey-report-respondent-answer>
      </template>
    </div>

    <div class="survey__floating is-fixed stats-respondent">
      <div class="floating__inner">
        <button class="btn-top" @click="moveTop">top</button>
      </div>
    </div>
    </div>
</template>

<script>
import SurveyReportRespondentList from "@/apps/surveyReport/components/respondent/SurveyReportRespondentList";
import SurveyReportRespondentListEmpty from "@/apps/surveyReport/components/respondent/SurveyReportRespondentListEmpty";
import SurveyReportRespondentInfo from "@/apps/surveyReport/components/respondent/SurveyReportRespondentInfo";
import {mapActions, mapState} from "vuex";
import SurveyReportRespondentAnswer from "@/apps/surveyReport/components/respondent/SurveyReportRespondentAnswer";
export default {
  name: "survey-report-respondent",
  props: {
    curSurveyId: {
      type: String
    },
    isAnonymous: {
      type: Boolean
    },
    isUsedUrl: {
      type: Boolean
    }
  },
  components: {
    SurveyReportRespondentListEmpty,
    SurveyReportRespondentAnswer,
    SurveyReportRespondentInfo,
    SurveyReportRespondentList
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport'
    }),
    isComplete() {
      return this.surveyReport.respondent.curSurveySelectedRespondent.answerStatus === 'COMPLETE'
    },
    isReject() {
      return this.surveyReport.respondent.curSurveySelectedRespondent.answerStatus === 'REJECT'
    },
    isTemporary() {
      return this.surveyReport.respondent.curSurveySelectedRespondent.answerStatus === 'TEMPORARY'
    },
    hasList() {
      return this.surveyReport.respondent.curSurveyRespondentList.length > 0
    },
    filteredSurveyRespondentList() {
      return this.surveyReport.respondent.filteredSurveyRespondentList
    },
    selectedRespondent() {
      return this.surveyReport.respondent.curSurveySelectedRespondent
    },
    noDataClass() {
      if (this.hasList) {
        return 'initial'
      } else {
        return 'hi-nodata'
      }
    },
    noDataMsg() {
      if (this.hasList) {
        return '응답자를 선택해주세요.'
      } else {
        return '응답자가 없습니다.'
      }
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      getCurSurveyContentsPages: 'getCurSurveyContentsPages',
      getSurveyReportRespondentList: 'getSurveyReportRespondentList',
      clearSurveyReportRespondent: 'clearSurveyReportRespondent'
    }),
    moveTop() {
      const modal = document.querySelector('.fullscreen-modal');
      if (modal) {
        modal.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    }
  },
  mounted() {
    this.getSurveyReportRespondentList(this.curSurveyId)
    this.getCurSurveyContentsPages(this.curSurveyId)
  },
  beforeDestroy() {
    this.clearSurveyReportRespondent()
  }
}
</script>

<style scoped>

</style>