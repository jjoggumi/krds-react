<!--
@File(Method): AfterSchoolApplicantList.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 설문·투표(방과후) > 통계 및 개별 조회 > 통계 탭 > 신청 내역
@Modified: 2025-02-24 - #71977 학교양식신청서 및 설문 > 학반(태그) 추가 
-->
<template>
  <div class="survey__stats">
    <template v-if="afterSchoolApplyList.filter(a => a.waitStatus === currentListTab).length > 0">
      <div class="group-btn position-fcfs">
        <button class="btn-download" @click="excelDownload">다운로드</button>
        <button class="btn-push" @click="openApplicantModal">푸시 알림 보내기</button>
      </div>
      <div class="scrollbox">
        <table class="hi-tbl">
          <colgroup>
            <col style="width: 110px;">
            <col style="width: 80px;">
            <col style="width: 180px;">
            <col style="width: 180px;">
            <col style="width: 160px;">
            <col style="width: auto;">
          </colgroup>
          <thead>
          <tr>
            <th>학년</th> <!-- #71977 학년/반 >> 학년 으로 변경 -->
            <th>번호</th>
            <th>응답자명</th>
            <th>학생명</th>
            <th>전화번호</th>
            <th>신청일시</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="applyItem of afterSchoolApplyList.filter(a => a.waitStatus === currentListTab)" :key="applyItem.answerId">
            <td>{{ classGrade(applyItem.classGrade) }}</td>
            <td>{{ classNumber(applyItem.classNumber, applyItem.userType) }}</td>
            <td>{{ respondentName(applyItem.respondentName, applyItem.userType) }}</td>
            <td>{{ subjectName(applyItem.subjectName) }}</td>
            <td>{{ respondentPhone(applyItem.respondentPhone) }}</td>
            <td>{{ getAnsweredDateTime(applyItem.answeredTimestamp) }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-else>
      <div class="hi-nodata">
        <p>신청 내역이 없습니다.</p>
      </div>
    </template>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import XLSX from "xlsx";
import {
  getRespondentNameWithUserType,
  replaceMobile,
  timestampToDateTime,
  getClassGrade
} from '@/plugins/utils'

export default {
  name: "after-school-applicant-list",
  props: {
    afterSchoolApplyList: {
      type: Array
    },
    selectedAfterSchool: {
      type: Object
    },
    currentListTab: {
      type: String
    }
  },
  computed: {
    ...mapState('storeSurvey', ['surveyReport']),
    classGrade() {
      return (classGrade) => {
        return getClassGrade(classGrade)
      }
    },
    classNumber() {
      return (classNumber, userType) => {
        return userType === 'STUDENT' ?
          (classNumber !== null || classNumber !== '' ? classNumber : '-') :
          '-'
      }
    },
    respondentName() {
      return (respondentName, userType) => {
        return getRespondentNameWithUserType(respondentName, userType)
      }
    },
    subjectName() {
      return (subjectName) => {
        return subjectName === null || subjectName === '' ?
          '-' :
          subjectName
      }
    },
    respondentPhone() {
      return (respondentPhone) => {
        return respondentPhone === null || respondentPhone === '' ?
          '-' :
          replaceMobile(respondentPhone)
      }
    },
    activeTagIds() {
      return this.surveyReport.statistics.activeTagIds
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      openAfterSchoolPopup: 'openAfterSchoolPopup',
      getRespondentAnswersExcel: 'getRespondentAnswersExcel'
    }),
    ...mapMutations('storeSurvey', {
      setSurveyReportReplyPopupAnswerList: 'setSurveyReportReplyPopupAnswerList'
    }),
    async openApplicantModal() {
      this.setSurveyReportReplyPopupAnswerList(this.afterSchoolApplyList)
      await this.openAfterSchoolPopup()
    },
    excelDownload() {
      this.getRespondentAnswersExcel(this.selectedAfterSchool)
        .then(res => {
          // 첫번째 열
          let headerArr = [
            {
              col: 'classGrade',
              name: '학년'
            },
            {
              col: 'classBan',
              name: '클래스명'
            },
            {
              col: 'classNumber',
              name: '번호'
            },
            {
              col: 'tags',
              name: '학반(태그)'
            },
            {
              col: 'respondentName',
              name: '응답자명'
            },
            {
              col: 'subjectName',
              name: '학생명'
            },
            {
              col: 'respondentPhone',
              name: '전화번호'
            },
            {
              col: 'answeredTimestamp',
              name: '신청일시'
            },
            {
              col: 'waitStatus',
              name: '신청구분'
            },
          ]

          // 응답 데이터
          let excelData = []
          const data = this.activeTagIds.length > 0 ?
              res.data.filter(r => r.tags && r.tags.some(tag => this.activeTagIds.includes(tag.tagId))) :
              res.data
          data.forEach(respondent => {
            const row = {}

            headerArr.forEach(header => {
              switch (header.col) {
                case 'answeredTimestamp':
                  row[header.name] = timestampToDateTime(respondent[header.col])
                  break
                case 'classGrade':
                  row[header.name] = getClassGrade(respondent.classGrade) || '-'
                  break
                case 'classBan':
                  row[header.name] = respondent.classBan || '-'
                  break
                case 'classNumber':
                  row[header.name] = respondent[header.col] || '-'
                  break
                case 'tags':
                  row[header.name] = (respondent.tags || []).map(t => t.tagName).join(', ') || '-'
                  break
                case 'respondentName':
                  row[header.name] = this.respondentName(respondent[header.col], respondent.userType)
                  break
                case 'subjectName':
                  row[header.name] = respondent[header.col] || '-'
                  break
                case 'respondentPhone':
                  row[header.name] = respondent[header.col] ? replaceMobile(respondent[header.col]) : '-'
                  break
                case 'waitStatus':
                  row[header.name] = respondent[header.col] === 'COMPLETE' ? '신청완료' : '대기자'
                  break
              }
            })

            excelData.push(row)
          })

          const workSheet = XLSX.utils.json_to_sheet(excelData)
          const workBook = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(workBook, workSheet)
          XLSX.writeFile(workBook, '신청내역.xlsx')
        })
        .catch(err => {
          console.error('getRespondentAnswersExcel error => ', err)
        })
    },
    getAnsweredDateTime(answeredDateTimestamp) {
      return timestampToDateTime(answeredDateTimestamp)
    }
  }
}
</script>

<style scoped>

</style>