<!--
@File(Method): SurveyReportStatisticsRespondentModal.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 설문·투표 > 통계 및 개별 조회 > 통계 탭 > 상세 모달
@Modified: 2025-02-24 - #71977 학교양식신청서 및 설문 > 학반(태그) 추가 
-->
<template>
  <div class="hi-modal-common modal-survey-stats" style="display: block;" id="modal05">
    <div class="modal__dim" @click="changeAnswersPopupFlag(false)"></div>
    <div class="modal__layer">
      <div class="modal__header">
        <button class="btn-close" @click="changeAnswersPopupFlag(false)"></button>
      </div>
      <div class="modal__content">
        <strong class="heading">{{ curQuestionTitle }}</strong>

        <div class="hi-selectbox" ref="selectBox">
          <button class="selected" @click="selectBoxOpen()">{{ selectedTitle }}</button>
          <div class="option__layer">
            <button
                :class="selectedCssStyle(questionItem)"
                v-for="questionItem in curQuestionItemList"
                :key="`select-option-${questionItem.itemId}`"
                @click="selectQuestionItem(questionItem)"
            >
              {{ optionTitle(questionItem) }}
            </button>
          </div>
        </div>

        <div class="group-btn">
          <button class="btn-download" @click="excelDownload">엑셀 다운로드</button>
        </div>

        <div
          class="scrollbox"
          v-infinite-scroll="getRespondentAnswers"
          :infinite-scroll-disabled="infiniteScroll.isBusy"
          :infinite-scroll-distance="infiniteScroll.distance"
        >
          <table class="hi-tbl">
            <colgroup>
              <col style="width: 50px;">
              <col v-if="!isAnonymous" style="width: 150px;">
              <col v-if="!isAnonymous" style="width: 100px;">
              <col v-if="!isAnonymous" style="width: 50px;">
              <col v-if="!isAnonymous" style="width: 200px;">
              <col v-if="!isAnonymous" style="width: 120px;">
              <col v-if="!isAnonymous && hasEtcAnswer" style="width: 130px;">
              <col :style="answerContentStyle">
            </colgroup>
            <thead>
            <tr id="table-tr" class="respondentModalTableHeader">
              <th id="respondentNum">구분</th>
              <th v-if="!isAnonymous" id="answeredTimestamp">제출일시</th>
              <th v-if="!isAnonymous" id="classGrade">학년</th> <!-- #71977 학년/반 >> 학년 으로 변경 -->
              <th v-if="!isAnonymous" id="classNumber">번호</th>
              <th v-if="!isAnonymous" id="respondentName">응답자명</th>
              <th v-if="!isAnonymous" id="subjectName">학생명</th>
              <th v-if="!isAnonymous" id="respondentPhone">전화번호</th>
              <th v-if="hasEtcAnswer" id="answerText">응답내용</th>
            </tr>
            </thead>
            <tbody class="respondentModalTableBody">
            <tr v-for="(userItemReply, idx) in answerList" :key="`statisticsAnswer-${userItemReply.answerId}`">
              <td>{{ idx + 1 }}</td>
              <td v-if="!isAnonymous">{{ answeredTimestamp(userItemReply.answeredTimestamp) }}</td>
              <td v-if="!isAnonymous">{{ classGrade(userItemReply.classGrade) }}</td>
              <td v-if="!isAnonymous">{{ classNumber(userItemReply.classNumber) }}</td>
              <td v-if="!isAnonymous">{{ respondentName(userItemReply.respondentName, userItemReply.userType) }}</td>
              <td v-if="!isAnonymous">{{ userItemReply.subjectName }}</td>
              <td v-if="!isAnonymous">{{ respondentPhone(userItemReply.respondentPhone) }}</td>
              <td class="txt-left" v-if="hasEtcAnswer">{{ userItemReply.answerText }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getRespondentNameWithUserType,
  replaceMobile,
  timestampToDateTime,
  getClassGrade
} from '@/plugins/utils'
import {mapActions, mapState} from "vuex";
import XLSX from "xlsx";

export default {
  name: "survey-report-statistics-respondent-modal",
  props: {
    isAnonymous: {
      type: Boolean
    },
    isUsedUrl: {
      type: Boolean
    }
  },
  computed: {
    ...mapState({
      infiniteScroll: 'infiniteScroll'
    }),
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport'
    }),
    curQuestionTitle() {
      return this.surveyReport.statistics.replyPopup.curQuestion.questionTitle
    },
    curQuestionItemList() {
      if (this.isAnonymous) {
        return this.surveyReport.statistics.replyPopup.curQuestionItemList.filter(curQuestionItem => {
          return curQuestionItem.etcAnswer
        })
      } else {
        return this.surveyReport.statistics.replyPopup.curQuestionItemList
      }
    },
    selectedItem() {
      return this.surveyReport.statistics.replyPopup.selectedItem
    },
    selectedItemId() {
      return this.surveyReport.statistics.replyPopup.selectedItemId
    },
    selectedItemType() {
      return this.surveyReport.statistics.replyPopup.selectedItemType
    },
    hasEtcAnswer() {
      return this.surveyReport.statistics.replyPopup.selectedItem.etcAnswer
    },
    activeTagIds() {
      return this.surveyReport.statistics.activeTagIds
    },
    answerList() {
      return this.activeTagIds.length > 0 ?
          this.surveyReport.statistics.replyPopup.answerList.filter(a => a.tags && a.tags.some(tag => this.activeTagIds.includes(tag.tagId))) :
          this.surveyReport.statistics.replyPopup.answerList
    },
    selectedCssStyle() {
      return (questionItem) => {
       return this.selectedItemId === questionItem.itemId ? 'option is-selected' : 'option'
      }
    },
    selectedTitle() {
      switch (this.selectedItemType) {
        case 'STAR':
          return `${this.selectedItem.itemWeight}점`
        default:
          return this.selectedItem.itemTitle
      }
    },
    optionTitle() {
      return (questionItem) => {
        switch (this.selectedItemType) {
          case 'STAR':
            return `${questionItem.itemWeight}점`
          default:
            return questionItem.itemTitle
        }
      }
    },
    answeredTimestamp() {
      return (answeredTimestamp) => {
        return timestampToDateTime(answeredTimestamp)
      }
    },
    classGrade() {
      return (classGrade) => {
        return getClassGrade(classGrade)
      }
    },
    classNumber() {
      return (classNumber) => {
        return classNumber ? classNumber : '-'
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
    respondentPhone() {
      return (respondentPhone) => {
        return respondentPhone ? replaceMobile(respondentPhone) : '-'
      }
    },
    answerContentStyle() {
      return this.isAnonymous ? 'width: 558px;' : 'width: auto'
    }
  },
  methods: {
    ...mapActions({
      initInfiniteScroll: 'initInfiniteScroll'
    }),
    ...mapActions('storeSurvey', {
      clearReplyPopup: 'clearReplyPopup',
      changeAnswersPopupFlag: 'changeAnswersPopupFlag',
      setAnswersPopupSelectedItem: 'setAnswersPopupSelectedItem',
      getRespondentAnswers: 'getRespondentAnswers',
      getRespondentAnswersExcel: 'getRespondentAnswersExcel'
    }),
    selectBoxOpen() {
      this.$refs.selectBox.className === 'hi-selectbox' ? this.$refs.selectBox.className = 'hi-selectbox is-opened' : this.$refs.selectBox.className = 'hi-selectbox'
    },
    selectQuestionItem(questionItem) {
      if (questionItem.selectedCount === 0) {
        this.$hiClass.alert('응답자가 없습니다.').then(() => {
          this.changeAnswersPopupFlag(false)
        })
        return
      }

      this.initInfiniteScroll()
      this.setAnswersPopupSelectedItem(questionItem)
      this.getRespondentAnswers().then(res => {
        switch (res) {
          case 200:
            this.selectBoxOpen()
            break
          case 204: {
            this.$hiClass.alert('응답자가 없습니다.').then(() => {
              this.changeAnswersPopupFlag(false)
            })
          }
          break
        }
      })
    },
    excelDownload() {
      this.getRespondentAnswersExcel()
        .then(res => {
          // 첫번째 열
          let headerArr = []
          document.querySelector('.respondentModalTableHeader').childNodes.forEach(th => {
            if (th.nodeName === 'TH') {
              headerArr.push({
                col: th.id,
                name: th.innerText
              })
            }
          })
          headerArr.splice(3, 0, { col: 'classBan', name: '클래스명'})
          headerArr.splice(5, 0, { col: 'tags', name: '학반(태그)' })

          // 응답 데이터
          let excelData = []
          const data = this.activeTagIds.length > 0 ?
              res.data.filter(a => a.tags && a.tags.some(tag => this.activeTagIds.includes(tag.tagId))) :
              res.data

          data.forEach((respondent, index) => {
            const row = {}
            headerArr.forEach(header => {
              switch (header.col) {
                case 'respondentNum':
                  row[header.name] = index + 1
                  break
                case 'answeredTimestamp':
                  row[header.name] = timestampToDateTime(respondent[header.col])
                  break
                case 'classGrade':
                  row[header.name] = `${respondent.classGrade.slice(-1)}학년`
                  break
                case 'classBan':
                  row[header.name] = respondent.classBan
                  break
                case 'tags':
                  row[header.name] = (respondent.tags || []).map(t => t.tagName).join(', ')
                  break
                case 'classNumber':
                  row[header.name] = respondent[header.col] || '-'
                  break
                case 'respondentName':
                  row[header.name] = this.respondentName(respondent[header.col], respondent.userType)
                  break
                case 'subjectName':
                  row[header.name] = respondent[header.col]
                  break
                case 'respondentPhone':
                  row[header.name] = respondent[header.col] ? replaceMobile(respondent[header.col]) : '-'
                  break
                case 'answerText':
                  row[header.name] = respondent[header.col]
                  break
              }
            })

            excelData.push(row)
          })

          const workSheet = XLSX.utils.json_to_sheet(excelData)
          const workBook = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(workBook, workSheet)
          XLSX.writeFile(workBook, '응답 내용.xlsx')
        })
        .catch(err => {
          console.error('getRespondentAnswersExcel error => ', err)
        })
    }
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  destroyed() {
    this.clearReplyPopup()
    this.initInfiniteScroll()
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  }
}
</script>

<style scoped>

</style>