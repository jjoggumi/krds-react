<template>
  <div class="survey__floating is-fixed">
    <div class="floating__inner">
      <div class="group-btn">
        <button class="btn-download" @click="excelDownload">
          <i class="icon-excel"></i>
          <span>EXCEL<br>다운로드</span>
        </button>
<!--        3차-->
<!--        <button class="btn-download">-->
<!--          <i class="icon-pdf"></i>-->
<!--          <span>PDF<br>다운로드</span>-->
<!--        </button>-->
<!--        <button class="btn-print">인쇄</button>-->
      </div>
      <button class="btn-top" @click="moveTop">top</button>
    </div>
  </div>
</template>

<script>
import {mapActions, mapState, mapGetters} from "vuex";
import XLSX from "xlsx";
import {getClassGrade, getConsultType, timestampToDateTime, replaceMobile} from "@/plugins/utils";

export default {
  name: "survey-report-statistics-floating-button",
  data() {
    return {
      headerKeyList: []
    }
  },
  computed: {
    ...mapGetters(['CONSTANTS']),
    ...mapState('storeSurvey', ['surveyReport']),
    surveyTitle() {
      return this.surveyReport.curSurveyReportInfo.surveyTitle
    },
    isAnonymous() {
      return this.surveyReport.curSurveyReportInfo.anonymous
    },
    isFcfsType() {
      return this.surveyReport.curSurveyReportInfo.surveyType === this.CONSTANTS.SURVEY_TYPE.FCFS
    },
    activeTagIds() {
      return this.surveyReport.statistics.activeTagIds
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      getSurveyReportRespondentExcelList: 'getSurveyReportRespondentExcelList'
    }),
    initHeaderKeyList() {
      this.headerKeyList = [
        {
          key: 'answeredTimestamp',
          name: '제출일시'
        },
        {
          key: 'classGrade',
          name: '학년'
        },
        {
          key: 'classBan',
          name: '클래스명'
        },
        {
          key: 'classNumber',
          name: '번호'
        },
        {
          key: 'tags',
          name: '학반(태그)'
        },
        {
          key: 'respondentName',
          name: '응답자명'
        },
        {
          key: 'subjectName',
          name: '학생명'
        },
        {
          key: 'respondentPhone',
          name: '전화번호'
        }
      ]
    },
    excelDownload() {
      this.initHeaderKeyList()
      this.getSurveyReportRespondentExcelList().then(res => {
        const questions = res.data.questions
        const respondents = this.activeTagIds.length > 0 ?
            res.data.respondents.filter(r => r.tags && r.tags.some(tag => this.activeTagIds.includes(tag.tagId))) :
            res.data.respondents

        // 삭제되지않은 질문만 문항 배열에 추가
        questions.forEach(question => {
          if (!question.isDel) {
            this.headerKeyList.push({
              key: 'questionId',
              questionId: question.questionId,
              name: question.questionTitle
            })
          }
        })

        if (this.isFcfsType) {
          this.headerKeyList.push({
            key: 'waitStatus',
            name: '선착순'
          })
        }

        // 항목용 배열 
        let headerNameList = []
        this.headerKeyList.forEach(headerItem => {
          Object.keys(headerItem).forEach(item => {
            if (item === 'name') {
              headerNameList.push(headerItem[item])
            }
          })
        })

        // 응답데이터로 엑셀데이터
        let excelData = []
        excelData.push(headerNameList)
        respondents.forEach(respondent => {
          let row = []

          this.headerKeyList.forEach(header => {
            switch (header.key) {
              case 'answeredTimestamp':
                row.push(this.isAnonymous ? '***' : timestampToDateTime(parseInt(respondent.answeredTimestamp)))
                break
              case 'classGrade':
                row.push(this.isAnonymous ? '***' : getClassGrade(respondent.classGrade) || '-')
                break
              case 'classBan':
                row.push(this.isAnonymous ? '***' : respondent.classBan || '-')
                break
              case 'tags':
                row.push(this.isAnonymous ? '***' : (respondent.tags || []).map(t => t.tagName).join(', ') || '-')
                break
              case 'classNumber':
                row.push(this.isAnonymous ? '***' : respondent.classNumber || '-')
                break
              case 'respondentName':
                row.push(this.isAnonymous ? '***' : respondent.respondentName || '-')
                break
              case 'subjectName':
                row.push(this.isAnonymous ? '***' : respondent.subjectName || '-')
                break
              case 'respondentPhone':
                row.push(this.isAnonymous ? '***' : replaceMobile(respondent.respondentPhone))
                break
              case 'waitStatus':
                row.push(respondent.waitStatus === 'COMPLETE' ? '당첨' : '대기')
                break
              // 질문별 응답
              case 'questionId': {
                const answers = respondent.answers.filter(answer => answer.questionId === header.questionId)
                if (answers.length > 0) {
                  switch (answers[0].questionType) {
                    // 객관식은 다중선택이 가능함
                    case 'CHOICE': {
                      let choiceReply = ''
                      answers.forEach((answer, idx) => {
                        choiceReply += answer.isEtcAnswer ? answer.answerText : answer.itemTitle || '미 응답'
                        if (idx < answers.length - 1) {
                          choiceReply += ','
                        }
                      })
                      row.push(choiceReply)
                      break
                    }
                    case 'SUBJECTIVE':
                      row.push(answers[0].answerText || '미 응답')
                      break
                    case 'SIGN':
                      row.push(answers[0].isSign ? '서명완료' : '미 응답')
                      break
                    case 'DROPDOWN':
                      break
                    case 'STAR':
                      break
                    case 'ATTACHMENTS':
                      break
                    case 'CONSULTATION': {
                      let choiceReply = ''
                      answers.forEach((answer, idx) => {
                        if (answer.isDel) {
                          choiceReply += '상담취소'
                        } else {
                          choiceReply += `${answer.itemDate} ${answer.itemTimeStart} ~ ${answer.itemTimeEnd} ${getConsultType(answer.consultType)}`
                        }
                        if (idx < answers.length - 1) {
                          choiceReply += ','
                        }
                      })
                      row.push(choiceReply)
                      break
                    }
                    case 'AFTER_SCHOOL': {
                      let choiceReply = ''
                      answers.forEach((answer, idx) => {
                        const waitStatus = answer.waitStatus === 'COMPLETE' ? '신청완료' : '대기'
                        choiceReply += `${answer.itemTitle}(${waitStatus})`
                        if (idx < answers.length - 1) {
                          choiceReply += ','
                        }
                      })
                      row.push(choiceReply)
                      break
                    }
                    case 'VOTE':
                      break
                  }

                } else {
                  row.push('미 응답')
                }
                break
              } // end case 'questionId'
            }
          })

          excelData.push(row)
        })

        const workSheet = XLSX.utils.aoa_to_sheet(excelData)
        const workBook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workBook, workSheet)
        XLSX.writeFile(workBook, `${this.$moment().format('YY-MM-DD')}_${this.surveyTitle}.xlsx`)
      })
    },
    moveTop() {
      const modal = document.querySelector('.fullscreen-modal');
      if (modal) {
        modal.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    }
  }
}
</script>

<style scoped>

</style>