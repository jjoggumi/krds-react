<template>
  <div class="survey-view__content all">
    <template v-if="isComplete || isTemporary">
      <survey-info
        v-if="hasInfo"
        :is-complete="isComplete"
        :is-temporary:="isTemporary"
      >
      </survey-info>
      <div class="survey-create__box" v-for="page in curRespondentAnswerPage" :key="page.pageId">
        <template v-for="(question, idx) in page.questions">
          <component
            :key="`respondentAnswer-${question.questionId}`"
            :is="selectComponent(question)"
            :question="question"
            :question-user-answer="questionUserAnswer(question)"
          >
          </component>
          <template v-if="idx !== page.questions.length - 1">
            <span class="groupbar" :key="`${page.pageId}-${idx}-groupbar`"></span>
          </template>
        </template>
      </div>
    </template>

    <template v-else-if="isReject">
      <div class="respondent__nodata">
        <div class="noanswer">
          <p>‘참여안함’으로 응답하였습니다.</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import SurveyInfo from "@/apps/surveyReport/components/common/SurveyInfo";
import ChoiceAnswer from "@/apps/surveyReport/components/respondent/content/ChoiceAnswer";
import SubjectiveAnswer from "@/apps/surveyReport/components/respondent/content/SubjectiveAnswer";
import DropdownAnswer from "@/apps/surveyReport/components/respondent/content/DropdownAnswer";
import StarAnswer from "@/apps/surveyReport/components/respondent/content/StarAnswer";
import SignAnswer from "@/apps/surveyReport/components/respondent/content/SignAnswer";
import FileAnswer from "@/apps/surveyReport/components/respondent/content/FileAnswer";
import Description from "@/apps/surveyReport/components/respondent/content/Description";
import AfterSchoolAnswer from "@/apps/surveyReport/components/respondent/content/AfterSchoolAnswer";
import ConsultationAnswer from "@/apps/surveyReport/components/respondent/content/ConsultationAnswer";

import {mapState} from "vuex";

export default {
  name: "survey-report-respondent-answer",
  props: {
    isAnonymous: {
      type: Boolean
    },
    isComplete: {
      type: Boolean
    },
    isReject: {
      type: Boolean
    },
    isTemporary: {
      type: Boolean
    }
  },
  components: {
    SurveyInfo,
    ChoiceAnswer,
    DropdownAnswer,
    StarAnswer,
    SubjectiveAnswer,
    SignAnswer,
    FileAnswer,
    Description,
    AfterSchoolAnswer,
    ConsultationAnswer
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport'
    }),
    hasInfo() {
      return Object.keys(this.surveyReport.curSurveyReportInfo).length > 0
    },
    curRespondentAnswerPage() {
      return this.surveyReport.respondent.curSurveyContentsPages
    },
    selectComponent() {
      return (question) => {
        switch (question.questionType) {
          case 'CHOICE':
            return 'ChoiceAnswer'
          case 'SUBJECTIVE':
            return 'SubjectiveAnswer'
          case 'SIGN':
            return 'SignAnswer'
          // TODO 2순위 방과후신청, 학부모상담
          // TODO 3순위 드롭다운,첨부파일, 별점, 설명
          case 'DROPDOWN':
            return 'DropdownAnswer'
          case 'STAR':
            return 'StarAnswer'
          case 'ATTACHMENTS':
            return 'FileAnswer'
          case 'DESCRIPTION':
            return 'Description'
          case 'AFTER_SCHOOL':
            return 'AfterSchoolAnswer'
          case 'CONSULTATION':
            return 'ConsultationAnswer'
        }
      }
    },
    userAnswer() {
      return this.surveyReport.respondent.curSurveySelectedRespondentAnswer
    },
    questionUserAnswer() {
      return (question) => {
        return Object.values(this.userAnswer).filter(answer => answer.questionId === question.questionId)
      }
    }
  }

}
</script>

<style scoped>

</style>