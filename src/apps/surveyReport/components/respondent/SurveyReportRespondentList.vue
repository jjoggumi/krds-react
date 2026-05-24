<!--
@File(Method): SurveyReportRespondentList.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 설문·투표 > 통계 및 개별 조회 > 응답자 개별 조회 
@Modified: 2025-02-24 - #71977 학교양식신청서 및 설문 > 학반(태그) 추가 
-->
<template>
  <div class="respondent">
    <div class="respondent__heading">
      <div>
        <div class="heading">응답자 현황</div>
        <span class="count">{{ respondentCount }}</span>
      </div>
      <!-- #71977 학교양식신청서 및 설문 > 학반(태그) 필터추가 -->
      <HiSelectBox 
        class="opt-default"
        :class="{'is-active': activeTags.length > 0}"
        :items="clazzTags" 
        :value="activeTags" 
        empty-title="학반(태그)"
        >
        <template #btnType>
          학반(태그)
          <span v-if="activeTags.length > 0">(<span style="color:var(--primary)">{{ activeTags.length }}</span>)</span>
        </template>

        <template #custom-option>
          <div class="option-list type02">
          <HiButton color="link"> 학반(태그)선택 </HiButton>
          <ul>
              <li v-for="tag in clazzTags" :key="tag.tagId">
              <input type="checkbox" :id="`check-${tag.tagId}`" :value="tag.tagName" v-model="activeTags"/>
              <label :for="`check-${tag.tagId}`">
                  <span>{{ tag.tagName }}</span>
              </label>
              </li>
              <li v-if="clazzTags.length === 0" class="hi-nodata sm">
              <p>등록된 태그가 없습니다.</p>
              </li>
          </ul>
          </div>
        </template>
      </HiSelectBox>
    </div>
    <div class="respondent__list">
      <table class="hi-tbl">
        <colgroup>
          <col style="width: 78px;">
          <col style="width: 100px;">
          <col style="width: 50px;">
          <col style="width: auto;">
          <col style="width: 90px;">
          <col style="width: 140px;">
        </colgroup>
        <thead>
        <tr>
          <th>
            <span
              :class="statusFilterClass"
              role="button"
              @click="openStatusFilter"
            >
              진행상태
            </span>
            <div
              class="layer"
              style="display: block;"
              v-if="statusFilter"
              v-click-outside="closeStatusFilter"
            >
              <div class="layer__item">
                <input type="checkbox" id="isTemporaryCheckBox" v-model="isTemporaryCheckBox">
                <label for="isTemporaryCheckBox"><span>진행중</span></label>
              </div>
              <div v-if="!isFcfsType" class="layer__item">
                <input type="checkbox" id="isCompleteCheckBox" v-model="isCompleteCheckBox">
                <label for="isCompleteCheckBox">
                  <span>{{ surveyType === 'SURVEY' ? '설문완료' : '신청완료' }}</span>
                </label>
              </div>
              <div v-if="isFcfsType" class="layer__item">
                <input type="checkbox" id="isApplyCheckBox" v-model="isApplyCheckBox">
                <label for="isApplyCheckBox">
                  <span>당첨</span>
                </label>
              </div>
              <div v-if="isFcfsType" class="layer__item">
                <input type="checkbox" id="isWaitCheckBox" v-model="isWaitCheckBox">
                <label for="isWaitCheckBox">
                  <span>대기</span>
                </label>
              </div>
            </div>
          </th>
          <th>
            <span
              :class="gradeClassFilterClass"
              role="button"
              style="display: block;"
              @click="openGradeClassFilter"
            >
              학년 <!-- #71977 학년/반 >> 학년 으로 변경 -->
            </span>
            <div
              class="layer"
              style="display: block;"
              v-if="gradeClassFilter"
              v-click-outside="closeGradeClassFilter"
            >
              <div 
                class="layer__item" 
                v-for="grade of gradeBanList" 
                :Key="`${grade.classGrade}`"
              >
                <input 
                  type="checkbox" 
                  :id="`${grade.classGrade}`" 
                  v-model="selectedGradeBanFilter" 
                  :value="grade"
                >
                <label 
                  :for="`${grade.classGrade}`"
                >
                  <span>
                    {{ `${grade.classGrade[grade.classGrade.length - 1]}학년`}}
                  </span>
                </label>
              </div>
            </div>
          </th>
          <th>
            <span
                :class="sortClass('isSortClassNumber')"
                role="button"
                @click="clickSort('isSortClassNumber', 'classNumber')"
            >
              번호
            </span>
          </th>
          <th>
            <span
                :class="sortClass('isSortRespondentName')"
                role="button"
                @click="clickSort('isSortRespondentName', 'respondentName')"
            >
              응답자명
            </span>
          </th>
          <th>
            <span
                :class="sortClass('isSortSubjectName')"
                role="button"
                @click="clickSort('isSortSubjectName', 'subjectName')"
            >
              학생명
            </span>
          </th>
          <th>
            <span
                :class="sortClass('isSortAnsweredTimestamp')"
                role="button"
                @click="clickSort('isSortAnsweredTimestamp', 'answeredTimestamp')"
            >
              제출일시
            </span>
          </th>
        </tr>
        </thead>
        <tbody>
        <template v-if="curRespondentList.length > 0">
          <tr v-if="activeTags.length > 0 && filteredCurRespondentList.length === 0">
            <td colspan="6"> 태그가 적용된 구성원이 없습니다. </td>
          </tr>
          <tr
            role="button"
            v-for="(respondent, idx) in curRespondentList.filter(r => this.activeTags.length === 0 || (r.tags || []).map(t => t.tagName).some(t => this.activeTags.includes(t)))"
            :key="`respondent-${idx}-${respondent.respondentId}`"
            @click="selectRespondent(respondent)"
            :class="{'is-active': isSelected(respondent)}"
            v-show="isActiveFilter(respondent.classGrade, respondent.classBan)"
          >
            <td>{{ answerStatus(respondent) }}</td>
            <td>{{ classGrade(respondent.classGrade) }}</td>
            <td>{{ classNumber(respondent.classNumber) }}</td>
            <td>{{ respondentName(respondent.respondentName, respondent.userType) }}</td>
            <td>{{ subjectName(respondent.subjectName) }}</td>
            <td>{{ answeredTimestamp(respondent.answeredTimestamp, respondent.answerStatus) }}</td>
          </tr>
        </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import {mapActions, mapState, mapGetters} from "vuex";
import {
  getRespondentNameWithUserType,
  timestampToDateTime,
  getClassGrade
} from '@/plugins/utils'

export default {
  name: "survey-report-respondent-list",
  data() {
    return {
      statusFilter: false,
      gradeClassFilter: false,
      isTemporaryCheckBox: false,
      isCompleteCheckBox: true,
      isApplyCheckBox: true,
      isWaitCheckBox: true,
      isSortClassNumber: false,
      isSortRespondentName: false,
      isSortSubjectName: false,
      isSortAnsweredTimestamp: true,
      selectedGradeBanFilter: [],
      gradeBanList: [],
      activeTags: []
    }
  },
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
  computed: {
    ...mapGetters(['CONSTANTS']),
    ...mapState('storeSurvey', ['surveyReport']),
    ...mapState('storeClazzTag', ['clazzTags']),
    surveyType() {
      return this.surveyReport.curSurveyReportInfo.surveyType
    },
    isFcfsType() {
      return this.surveyType === this.CONSTANTS.SURVEY_TYPE.FCFS
    },
    isTemporary() {
      return (answerStatus) => answerStatus === 'TEMPORARY'
    },
    allRespondentList() {
      return this.surveyReport.respondent.curSurveyRespondentList
    },
    curRespondentList() {
      let respondentList = this.allRespondentList

      if (!this.isCompleteCheckBox) {
        respondentList = respondentList.filter(respondent => {
          return respondent.answerStatus !== 'COMPLETE' && respondent.answerStatus !== 'REJECT'
        })
      }
      if (!this.isTemporaryCheckBox) {
        respondentList = respondentList.filter(respondent => {
          return respondent.answerStatus !== 'TEMPORARY'
        })
      }
      if (!this.isApplyCheckBox) {
        respondentList = respondentList.filter(respondent => {
          return respondent.waitStatus !== 'COMPLETE'
        })
      }
      if (!this.isWaitCheckBox) {
        respondentList = respondentList.filter(respondent => {
          return respondent.waitStatus !== 'WAIT'
        })
      }
      return respondentList
    },
    statusFilterClass() {
      return this.statusFilter || this.isCompleteCheckBox || this.isTemporaryCheckBox ? 'btn-filter is-active' : 'btn-filter'
    },
    gradeClassFilterClass() {
      return this.gradeClassFilter ? 'btn-filter is-active' : 'btn-filter'
    },
    sortClass() {
      return (sortName) => {
        return this[sortName] ? 'btn-sort is-active' : 'btn-sort'
      }
    },
    answerStatus() {
      return (respondent) => {
        const completeWords = {
          SURVEY: () => '설문완료',
          FCFS: () => respondent.waitStatus === 'COMPLETE' ? '당첨' : '대기',
          default: () => '신청완료'
        }
        switch (respondent.answerStatus) {
          case 'COMPLETE':
          case 'REJECT':
            return (completeWords[this.surveyType] || completeWords.default)()
          case 'TEMPORARY':
            return '진행중'
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
    answeredTimestamp() {
      return (answeredTimestamp, answerStatus) => {
        if (this.isAnonymous) {
          return '***'
        } else if (this.isTemporary(answerStatus)) {
          return '-'
        } else {
          return timestampToDateTime(answeredTimestamp)
        }
      }
    },
    temporaryCount() {
      return this.allRespondentList.filter(respondent => respondent.answerStatus === 'TEMPORARY')
    },
    completeCount() {
      return this.allRespondentList.filter(respondent => respondent.answerStatus === 'COMPLETE' || respondent.answerStatus === 'REJECT')
    },
    respondentCount() {
      let allRespondentCount = this.allRespondentList.length > 0 ? this.allRespondentList.length : 0
      let temporaryCount = this.temporaryCount.length > 0 ? this.temporaryCount.length : 0
      let completeCount = this.completeCount.length > 0 ? this.completeCount.length : 0
      return `총 ${allRespondentCount}명 (진행중 : ${temporaryCount}명, 설문완료 : ${completeCount}명)`
    },
    isSelected() {
      return (respondent) => {
        return this.surveyReport.respondent.curSurveySelectedRespondent.respondentId === respondent.respondentId
      }
    },
    isActiveFilter() {
      return (classGrade, classBan) => {
        return this.selectedGradeBanFilter.find(filter => {
          return filter.classGrade === classGrade && filter.classBan === classBan
        })
      }
    },
    filteredCurRespondentList() {
      return this.curRespondentList.filter(r => this.activeTags.length === 0 || (r.tags || []).map(t => t.tagName).some(t => this.activeTags.includes(t)))
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      getCurSurveySelectedRespondentAnswer: 'getCurSurveySelectedRespondentAnswer',
      clearCurSurveyReportSelectedRespondent: 'clearCurSurveyReportSelectedRespondent',
      changeFilteredSurveyRespondentList: 'changeFilteredSurveyRespondentList'
    }),
    timestampToDateTime(timestamp) {
      return this.$moment(timestamp).format('YY.MM.DD HH:mm:ss')
    },
    openStatusFilter() {
      this.statusFilter = true
    },
    openGradeClassFilter() {
      if (this.isAnonymous) {
        return false
      }
      this.gradeClassFilter = true
    },
    closeStatusFilter() {
      this.statusFilter = false
    },
    closeGradeClassFilter() {
      this.gradeClassFilter = false
    },
    selectRespondent(respondent) {
      const payload = {
        surveyId: this.curSurveyId,
        respondent: respondent,
        respondentId: respondent.respondentId
      }
      this.getCurSurveySelectedRespondentAnswer(payload)

      window.scrollTo(0,0)
    },
    clickSort(sortName, fieldName) {
      this[sortName] = !this[sortName]
      switch (fieldName) {
        case 'classNumber':
          this.sortingNumberField(sortName, fieldName)
          break
        case 'respondentName':
        case 'subjectName':
        case 'answeredTimestamp':
          this.sortingStringField(sortName, fieldName)
          break
      }
    },
    sortingNumberField(sortName, fieldName) {
      if (this[sortName]) {
        this.curRespondentList.sort((a, b) => parseInt(a[fieldName]) - parseInt(b[fieldName]))
      } else {
        this.curRespondentList.sort((a, b) => parseInt(a[fieldName]) - parseInt(b[fieldName]))
          .reverse()
      }
    },
    sortingStringField(sortName, fieldName) {
      if (this[sortName]) {
        this.curRespondentList.sort((a, b) => a[fieldName] > b[fieldName] ? 1 : -1)
      } else {
        this.curRespondentList.sort((a, b) => a[fieldName] > b[fieldName] ? 1 : -1).reverse()
      }
    },
    makeGradeBanList() {
      let arr = []
      this.allRespondentList.forEach(respondent => {
        arr.push({classGrade: respondent.classGrade, classBan: respondent.classBan})
      })
      if (this.gradeBanList.length === 0) {
        this.selectedGradeBanFilter = [...new Set(arr.map(JSON.stringify))].map(JSON.parse)
      }
      this.gradeBanList = [...new Set(arr.map(JSON.stringify))].map(JSON.parse)
    },
  },
  mounted() {
    this.makeGradeBanList()
    this.sortingStringField('isSortAnsweredTimestamp', 'answeredTimestamp')
  },
  watch: {
    curRespondentList: {
      handler: function (newVal) {
        this.changeFilteredSurveyRespondentList(newVal)
        if (newVal.length === 0) {
          // 리스트에 목록이 모두 사라지면 현재 응답데이터가 안보이도록
          this.clearCurSurveyReportSelectedRespondent({})
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.hi-selectbox {
  width:205px;
  margin-right: 0;
  ::v-deep .option__layer{
    right: 0;
    left:auto;
    .hi-btn.btn-link{
      padding: 10px 15px;
    }
  }
  ::v-deep.is-active .selected {
    border: solid 1px var(--primary);
  }
}
</style>