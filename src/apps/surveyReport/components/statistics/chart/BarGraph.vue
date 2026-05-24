<template>
  <div class="bar__list">
    <div class="bar__item" v-for="(questionItem) in questionItemList" :key="`barGraphItem-${questionItem.itemId}`">
      <div class="legend">
        <span :class="questionItemClassStyle(questionItem)">
          {{ questionItemTitle(questionItem) }}
        </span>
        <button
            type="button"
            class="count"
            @click="openSurveyReportReplyPopup(questionItem)"
        >
          {{ questionItem.selectedCount }}명
        </button>
        <span class="percent">{{ questionItem.selectedPercent }}%</span>
      </div>

      <div class="bar">
        <span
            class="percent"
            :style="{'background-color': matchColor(questionItem.itemId), width: questionItem.selectedPercent + '%'}"
        >
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";

export default {
  name: "bar-graph",
  data() {
    return {
      chartColorArr: [
        '#00C73C',
        '#4778DE',
        '#FF6A6A',
        '#FFEB00',
        '#495060',
        '#FFA841',
        '#000000',
        '#44CFD4',
        '#955CC9',
        '#A27D6F',
        '#65CFA3',
        '#F197B1',
        '#FCB89D',
        '#8AC8CF',
        '#4EBCD0',
        '#6499DC',
        '#5E61D2',
        '#F69068',
        '#9DE477',
        '#AFB5CE'
      ],
      cloneQuestionItemList: []
    }
  },
  props: {
    curSurveyId: {
      type: String
    },
    question: {
      type: Object
    },
    questionItemList: {
      type: Array
    },
    questionType: {
      type: String
    },
    isAnonymous: {
      type: Boolean
    },
    isMobile: {
      type: Boolean
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport'
    }),
    questionItemClassStyle() {
      return (questionItem) => {
        return questionItem.del ? 'label deleted' : 'label'
      }
    },
    questionItemTitle() {
      return (questionItem) => {
        switch (this.questionType) {
          case 'CHOICE':
          case 'DROPDOWN':
            return questionItem.del ? `${questionItem.itemTitle} (삭제)` : questionItem.itemTitle
          case 'STAR':
            return `${questionItem.itemWeight}점`
        }
      }
    },
    matchColor() {
      return (itemId) => {
        return this.cloneQuestionItemList.length > 0 ?
          this.cloneQuestionItemList.find(item => item.itemId === itemId).colorCode :
          ''
      }
    }
  },
  methods: {
    ...mapActions({
      initInfiniteScroll: 'initInfiniteScroll'
    }),
    ...mapActions('storeSurvey', {
      getRespondentAnswers: 'getRespondentAnswers',
      initAnswersPopupInfo: 'initAnswersPopupInfo',
      setAnswersPopupSelectedItem: 'setAnswersPopupSelectedItem',
      changeAnswersPopupFlag: 'changeAnswersPopupFlag'
    }),
    openSurveyReportReplyPopup(questionItem) {
      this.$toasted.clear()

      if (questionItem.selectedCount === 0) {
        const options = { duration: 1500 }
        this.$toasted.show('응답자가 없습니다.', options)
        return
      }

      this.initAnswersPopupInfo(this.question)

      if (this.isAnonymous && !questionItem.etcAnswer) {
        this.$hiClass.alert('익명 설문은 상세 정보를 제공하지 않습니다.')
        return false
      }

      this.setAnswersPopupSelectedItem(questionItem)
      this.initInfiniteScroll()
      this.getRespondentAnswers(questionItem).then(res => {
        switch (res) {
          case 200: {
            if (this.isMobile) {
              const mobileUrl = `/mobile/survey-report/${this.curSurveyId}/${this.question.questionId}?itemId=${questionItem.itemId}&type=respondent`
              this.$router.push(mobileUrl)
            } else {
              this.changeAnswersPopupFlag(true)
            }
            break
          }
          case 204: {
            const options = { duration: 1500 }
            this.$toasted.show('응답자가 없습니다.', options)
            break
          }
        }
      })
    },
    cloneQuestionItemListAndSetColorCode() {
      this.cloneQuestionItemList = _.cloneDeep(this.questionItemList)
      this.cloneQuestionItemList.sort(function (a, b) {
        return b.selectedCount - a.selectedCount
      })

      let colorIdx = 0
      let colorCode = ''

      this.cloneQuestionItemList.forEach((questionItem, idx) => {
        colorCode = this.chartColorArr[colorIdx]
        if (idx < this.cloneQuestionItemList.length - 1) {
          questionItem.colorCode = colorCode
          questionItem.selectedCount === this.cloneQuestionItemList[idx + 1].selectedCount ? colorIdx : colorIdx++
        }

        if (idx === this.cloneQuestionItemList.length - 1) {
          questionItem.colorCode = colorCode
        }
      })
    }
  },
  mounted() {
    this.cloneQuestionItemListAndSetColorCode()
  }
}
</script>

<style scoped>

</style>