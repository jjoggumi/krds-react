<template>
  <div class="survey-view__content webview">
    <div class="survey-create__box">
      <div class="survey__heading">
        <strong class="heading-sub">{{ curQuestionTitle }}</strong>
      </div>
      <div class="survey__stats">
        <div class="hi-selectbox">
          <button class="selected" @click="selectBoxOpen()">{{ selectedTitle }}</button>
          <div class="option__layer">
            <button
                :class="selectedCssStyle(questionItem)"
                v-for="questionItem in curQuestionItemList"
                :key="`mobileStatistics-item-${questionItem.itemId}`"
                @click="selectQuestionItem(questionItem)"
            >
              {{optionTitle(questionItem)}}
            </button>
          </div>
        </div>
        <div
          class="result__list"
          v-infinite-scroll="getRespondentAnswers"
          :infinite-scroll-disabled="infiniteScroll.isBusy"
          :infinite-scroll-distance="infiniteScroll.distance"
        >
          <div
            class="result__item"
            v-for="userItemReply in answerList"
            :key="`mobileStatistics-userAnswer-${userItemReply.answerId}`"
          >
            <div v-if="!isAnonymous" class="info">
              <span v-if="userItemReply.classNumber" class="num">
                {{ userItemReply.classNumber }}
              </span>
              <span class="name">
                {{ getRespondentName(userItemReply) }}
              </span>
              <span class="date">
                {{ answeredTimestamp(userItemReply.answeredTimestamp) }}
              </span>
            </div>
            <div v-if="isEtcAnswer" class="data">
              <span>{{ userItemReply.answerText }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";
import {
  getRespondentNameWithUserType,
  timestampToDateTime,
  getClassGradeBan
} from '@/plugins/utils'

export default {
  name: "mobile-survey-report-statistics-respondent",
  props: {
    isAnonymous: {
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
    curQuestion() {
      return this.surveyReport.statistics.replyPopup.curQuestion
    },
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
    selectedItemType() {
      return this.surveyReport.statistics.replyPopup.selectedItemType
    },
    selectedTitle() {
      switch (this.selectedItemType) {
        case 'STAR':
          return `${this.selectedItem.itemWeight}점`
        default:
          return this.selectedItem.itemTitle
      }
    },
    selectedCssStyle() {
      return (questionItem) => {
        return this.selectedItem.itemId === questionItem.itemId ? 'option is-selected' : 'option'
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
    isEtcAnswer() {
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
    answeredTimestamp() {
      return (answeredTimestamp) => {
        return this.timestampToDateTime(answeredTimestamp)
      }
    },
    historyCount() {
      return this.surveyReport.respondent.historyCount
    }
  },
  methods: {
    ...mapActions({
      initInfiniteScroll: 'initInfiniteScroll'
    }),
    ...mapActions('storeSurvey', {
      getAnswersPopupSelectedItem: 'getAnswersPopupSelectedItem',
      getRespondentAnswers: 'getRespondentAnswers',
      setHistoryCount: 'setHistoryCount',
      initHistoryCount: 'initHistoryCount'
    }),
    selectBoxOpen() {
      let target = document.querySelector('.hi-selectbox')
      target.className === 'hi-selectbox' ? target.className = 'hi-selectbox is-opened' : target.className = 'hi-selectbox'
    },
    selectQuestionItem(questionItem) {
      // 선택지 선택할때마다 뒤로가기용 히스토리 -1
      this.setHistoryCount()
      const mobileUrl = `/mobile/survey-report/${this.surveyReport.curSurveyId}/${this.curQuestion.questionId}?itemId=${questionItem.itemId}&type=respondent`
      this.$router.push(mobileUrl)
    },
    timestampToDateTime(timestamp) {
      return timestampToDateTime(timestamp)
    },
    getChoiceItemAndAnswerList() {
      const payload = {
        questionId: this.$route.params.questionId,
        itemId: this.$route.query.itemId
      }

      this.getAnswersPopupSelectedItem(payload)
        .then(selectedItem => {
          this.infiniteScroll.isBusy = false
          this.getRespondentAnswers(selectedItem)
            .then(res => {
              switch (res) {
                case 200:
                  break
                case 204:
                  this.$hiClass.alert('응답자가 없습니다.').then(() => {
                    window.history.go(this.historyCount)
                  })
                  break
              }
            })
        })
    },
    getRespondentName(userItem) {
      const classGradeBan = getClassGradeBan(userItem.classGrade, userItem.classBan)
      const respondentName = getRespondentNameWithUserType(userItem.respondentName, userItem.userType)
      const subjectName = userItem.subjectName ? `(${userItem.subjectName})` : ''
      return `${classGradeBan} ${respondentName} ${subjectName}`
    }
  },
  created() {
    // id값 undefined일때 무한스크롤 동작하면서 api 호출에러발생 방지
    this.infiniteScroll.isBusy = true
  },
  mounted() {
    if (!this.answerList.length > 0) {
      this.getChoiceItemAndAnswerList()
    }
    this.initHistoryCount()
  },
  watch: {
    $route() {
      this.initInfiniteScroll()
      this.infiniteScroll.isBusy = true
      this.getChoiceItemAndAnswerList()
      this.selectBoxOpen()
    }
  },
}
</script>

<style scoped>

</style>