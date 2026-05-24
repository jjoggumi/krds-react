<template>
  <div class="survey-create__box">
    <survey-report-question-label :question="question"/>
    <survey-report-question-title :question="question"/>
    <survey-report-question-description
      v-if="question.questionDescription"
      :question-description="question.questionDescription"
    />

    <div class="survey__stats" @click="handleClick($event)">
      <div v-if="hasRespondentList" class="result__list">
        <div
          class="result__item"
          v-for="respondent in respondentList"
          :key="`mobileSubjective-${respondent.answerId}`"
        >
          <div class="info" v-if="!isAnonymous">
            <span
              class="num"
              v-if="respondent.classNumber"
            >
              {{ respondent.classNumber }}
            </span>
            <span class="name">
              {{ getRespondentName(respondent) }}
            </span>
            <span class="date">
              {{ answeredTimestamp(respondent.answeredTimestamp) }}
            </span>
          </div>
          <div class="data" v-html="respondentAnswer(respondent)"></div>
        </div>
      </div>
      <div v-else class="hi-nodata">
        <p>응답자가 없습니다.</p>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";
import SurveyReportQuestionDescription from "@/apps/surveyReport/components/common/SurveyReportQuestionDescription";
import {getClassGradeBan, getRespondentNameWithUserType, replaceMobile} from "@/plugins/utils";

export default {
  name: "subjective",
  props: {
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
    SurveyReportQuestionDescription
  },
  computed: {
    ...mapState('storeSurvey', {
      statistics: 'statistics'
    }),
    questionTitleClassStyle() {
      return this.question.isDel ? 'heading-sub deleted' : 'heading-sub'
    },
    questionTitle() {
      return this.question.isDel ? `(삭제된 질문) ${this.question.questionTitle}` : this.question.questionTitle
    },
    hasRespondentList() {
      return this.question.respondentList.length > 0
    },
    respondentList() {
      return this.hasRespondentList ? this.question.respondentList : []
    },
    isRequired() {
      return this.question.isRequired
    },
    answeredTimestamp() {
      return (answeredTimestamp) => {
        return this.timestampToDateTime(answeredTimestamp)
      }
    },
    classNumber() {
      return (classNumber) => {
        if (this.isAnonymous) {
          return '***'
        } else {
          return classNumber
        }
      }
    },
    respondentName() {
      return (classGrade, classBan, respondentName, userType, subjectName) => {
        const classGradeBan = `${classGrade[classGrade.length - 1]}학년 ${classBan}반`
        if (this.isAnonymous) {
          return '***'
        } else {
          switch (userType) {
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
    subjectName() {
      return (subjectName) => {
        if (this.isAnonymous) {
          return '***'
        } else {
          return this.isUsedUrl ? '-' : subjectName
        }
      }
    },
    respondentPhone() {
      return (respondentPhone, userType) => {
        if (this.isAnonymous) {
          return '***'
        } else {
          return userType === 'STUDENT' && respondentPhone === null ? '-' : this.replaceMobile(respondentPhone)
        }
      }
    },
    respondentAnswer() {
      return (respondent) => {
        switch (this.questionType) {
          case 'SUBJECTIVE':
            return respondent.answerText ? `<span>${respondent.answerText}</span>` : `<span class="nodata">미응답</span>`
          case 'SIGN':
            return respondent.signed ? `<span>서명완료</span>` : `<span class="nodata">미응답</span>`
          case 'ATTACHMENTS': {
            let span = ''
            if (respondent.fileList.length > 0) {
              respondent.fileList.forEach(file => {
                span += `<span role="button" class="open-respondent-file" data-answer-id="${respondent.answerId}" data-file-id="${file.fileId}">${file.fileName}</span>`
              })
              return span
            } else {
              return `<span class="nodata">미응답</span>`
            }
          }
        }
      }
    }
  },
  methods: {
    ...mapActions({
      openAttachFilesViewer: 'openAttachFilesViewer'
    }),
    replaceMobile(mobile) {
      return replaceMobile(mobile)
    },
    timestampToDateTime(timestamp) {
      return this.$moment(timestamp).format('YY.MM.DD HH:mm:ss')
    },
    checkLastFile(lastIndex, curIndex, fileName) {
      return lastIndex === curIndex ? `${fileName}` : `${fileName}, `
    },
    handleClick(e) {
      const handleImages = [ 'span' ]
      const selector = handleImages.join(',')
      if (e.target.matches(selector)) {
        switch (e.target.className) {
          case 'open-respondent-file': {
            const answerId = e.target.dataset.answerId
            const fileId = e.target.dataset.fileId
            const fileItem = this.findFileItem(answerId, fileId)

            this.openFile(fileItem)
            break
          }
        }
      }
    },
    findFileItem(targetAnswerId, targetFileId) {
      return this.respondentList.find(respondent => {
        return respondent.answerId === targetAnswerId
      }).fileList.find(file => {
        return file.fileId === targetFileId
      })
    },
    openFile(fileItem) {
      try {
        this.$comn.downloadForDoc(fileItem.fileOriginalPath, fileItem.fileName)
      } catch (error) {
        this.$log.debug('download error => ', error)
      }
    },
    getRespondentName(userItem) {
      const classGradeBan = getClassGradeBan(userItem.classGrade, userItem.classBan)
      const respondentName = getRespondentNameWithUserType(userItem.respondentName, userItem.userType)
      const subjectName = userItem.subjectName ? `(${userItem.subjectName})` : ''
      return `${classGradeBan} ${respondentName} ${subjectName}`

    }
  }
}
</script>

<style scoped>

</style>