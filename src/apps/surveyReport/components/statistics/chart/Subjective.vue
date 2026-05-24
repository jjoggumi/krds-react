<!--
@File(Method): Subjective.vue
@Author: -
@Date Created: -
@Description: 설문투표(주관식) > 통계 및 개별 조회 > 통계 탭 
@Modified: 2024-10-14 - 테이블  hi-tbl-col  >>  hi-tbl 로 변경
-->
<template>
  <!-- 설문 유형 - 주관식 -->
  <div class="survey-create__box">
    <survey-report-question-label :question="question"></survey-report-question-label>
    <survey-report-question-title :question="question"></survey-report-question-title>
    <survey-report-question-description
      v-if="question.questionDescription"
      :question-description="question.questionDescription"
    >
    </survey-report-question-description>
    <div class="survey__stats" @click="handleClick($event)">
        <div class="group-btn">
          <button class="btn-download" @click="excelDownload">엑셀 다운로드</button>
        </div>
        <div class="scrollbox">
          <table class="hi-tbl">
            <colgroup>
              <col style="width: 160px;">
              <col style="width: 100px;">
              <col style="width: 50px;">
              <col style="width: 120px;">
              <col style="width: 100px;">
              <col style="width: 130px;">
              <col style="width: auto">
            </colgroup>
            <thead>
            <tr :id="`respondentTableHeader-${question.questionId}`">
              <th>제출일시</th>
              <th>학년</th>
              <th class="hide">클래스명</th>
              <th>번호</th>
              <th class="hide">학반(태그)</th>
              <th>응답자명</th>
              <th>학생명</th>
              <th>전화번호</th>
              <th>응답내용</th>
            </tr>
            </thead>
            <tbody :id="`respondentTableBody-${question.questionId}`">
            <template v-if="hasRespondentList">
              <tr v-for="(respondent, idx) in respondentList" :key="`subjective-${respondent.answerId}-${idx}`">
                <td>{{ answeredTimestamp(respondent.answeredTimestamp) }}</td>
                <td>{{ classGrade(respondent.classGrade) }}</td>
                <td class="hide">{{ respondent.classBan }}</td>
                <td>{{ classNumber(respondent.classNumber) }}</td>
                <td class="hide">{{ (respondent.tags || []).map(t => t.tagName).join(', ') }}</td>
                <td>{{ respondentName(respondent.respondentName, respondent.userType) }}</td>
                <td>{{ subjectName(respondent.subjectName) }}</td>
                <td>{{ respondentPhone(respondent.respondentPhone) }}</td>
                <td class="txt-left" v-html="respondentAnswer(respondent, false)"></td>
              </tr>
            </template>
            </tbody>
          </table>
        </div>
        <div class="hi-nodata" v-if="!hasRespondentList">
          <p>응답자가 없습니다.</p>
        </div>
    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";
import SurveyReportQuestionDescription from "@/apps/surveyReport/components/common/SurveyReportQuestionDescription";
import XLSX from "xlsx";
import {
  getRespondentNameWithUserType,
  replaceMobile,
  timestampToDateTime,
  getClassGrade
} from '@/plugins/utils'

export default {
  name: "subjective",
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
    SurveyReportQuestionDescription
  },
  computed: {
    questionTitle() {
      return this.question.isDel ? `(삭제된 질문) ${this.question.questionTitle}` : this.question.questionTitle
    },
    hasRespondentList() {
      return this.question.respondentList.length > 0
    },
    respondentList() {
      return this.hasRespondentList ? this.question.respondentList : []
    },
    answeredTimestamp() {
      return (answeredTimestamp) => {
        if (this.isAnonymous) {
          return '***'
        } else {
          return timestampToDateTime(answeredTimestamp)
        }
      }
    },
    classGrade() {
      return (classGrade) => {
        if (this.isAnonymous) {
          return '***'
        } else {
          return getClassGrade(classGrade)
        }
      }
    },
    classNumber() {
      return (classNumber) => {
        if (this.isAnonymous) {
          return '***'
        } else {
          return classNumber ? classNumber : '-'
        }
      }
    },
    respondentName() {
      return (respondentName, userType) => {
        if (this.isAnonymous) {
          return '***'
        } else {
          return getRespondentNameWithUserType(respondentName, userType)
        }
      }
    },
    subjectName() {
      return (subjectName) => {
        if (this.isAnonymous) {
          return '***'
        } else {
          return subjectName || '-'
        }
      }
    },
    respondentPhone() {
      return (respondentPhone) => {
        if (this.isAnonymous) {
          return '***'
        } else {
          return respondentPhone ? replaceMobile(respondentPhone) : '-'
        }
      }
    },
    respondentAnswer() {
      return (respondent, isExcelData) => {
        let noDate = isExcelData ? '미응답' :`<span class="nodata">미응답</span>`

        switch (this.questionType) {
          case 'SUBJECTIVE':
            return respondent.answerText ? respondent.answerText : noDate
          case 'SIGN':
            return respondent.signed ? '서명완료' : noDate
          case 'ATTACHMENTS': {
            let span = ''
            if (respondent.fileList.length > 0) {
              respondent.fileList.forEach((file, fileIdx) => {
                span += isExcelData ?
                  this.checkLastFile(respondent.fileList.length - 1, fileIdx, file.fileName) :
                  `<span role="button" class="open-respondent-file" data-answer-id="${respondent.answerId}" data-file-id="${file.fileId}">${file.fileName}</span>`
              })
              return span
            } else {
              return noDate
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

            this.openFileViewer(fileItem)
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
    openFileViewer(fileItem) {
      let payload

      if (fileItem.fileContentType.startsWith('image') || fileItem.fileContentType.startsWith('video')) {
        payload = {
          items: {fileItem},
          contentType: fileItem.fileContentType
        }
      } else {
        payload = {
          item: fileItem,
          contentType: fileItem.fileContentType
        }
      }
      this.openAttachFilesViewer(payload)
    },
    excelDownload() {
      // 첫번째 열
      let headerArr = []
      document.querySelector(`#respondentTableHeader-${this.question.questionId}`).childNodes.forEach(th => {
        headerArr.push(th.innerText)
      })

      // 응답 데이터
      let excelData = []
      document.querySelector(`#respondentTableBody-${this.question.questionId}`).childNodes.forEach(tr => {
        const row = {}
        tr.childNodes.forEach((td, idx) => {
          row[headerArr[idx]] = td.innerText
        })
        excelData.push(row)
      })

      const workSheet = XLSX.utils.json_to_sheet(excelData)
      const workBook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workBook, workSheet)
      XLSX.writeFile(workBook, '응답 내용.xlsx');
    }
  }
}
</script>

<style scoped>
.hide {
  display: none;
}

</style>