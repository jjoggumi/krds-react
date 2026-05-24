<template>
  <div class="survey-create__box">
    <survey-report-question-label :question="question"></survey-report-question-label>
    <survey-report-question-title :question="question"></survey-report-question-title>
    <survey-report-question-description
      v-if="question.questionDescription"
      :question-description="question.questionDescription"
    >
    </survey-report-question-description>
    <div class="survey__stats">
      <div class="statsbox piechart">
        <Pie
            v-if="hasSelectedCount"
            :chart-options="chartOptions"
            :chart-data="chartData"
            :chart-id="chartId"
            :dataset-id-key="datasetIdKey"
            :plugins="plugins"
            :css-classes="cssClasses"
            :styles="styles"
            :width="width"
            :height="height"
        />
        <span v-else class="nodata">응답자가 없습니다.</span>

        <div class="legend__list">
          <div
            class="legend__item"
            v-for="questionItem of questionItemList"
            :key="questionItem.itemId"
          >
            <span :class="questionItemClassStyle(questionItem)">{{ questionItemTitle(questionItem) }}</span>
            <button
              type="button"
              class="count"
              @click="openSurveyReportReplyPopup(questionItem)"
            >
              {{ questionItem.selectedCount }}명
            </button>
            <span class="percent">{{ questionItem.selectedPercent }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Pie } from 'vue-chartjs/legacy'
import {mapActions} from "vuex";
import SurveyReportQuestionLabel from "@/apps/surveyReport/components/common/SurveyReportQuestionLabel";
import SurveyReportQuestionTitle from "@/apps/surveyReport/components/common/SurveyReportQuestionTitle";
import SurveyReportQuestionDescription from "@/apps/surveyReport/components/common/SurveyReportQuestionDescription";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, ChartDataLabels)

export default {
  name: "pie-chart",
  components: {
    Pie,
    SurveyReportQuestionLabel,
    SurveyReportQuestionTitle,
    SurveyReportQuestionDescription
  },
  data() {
    return {
      chartColorArr: ['#FC88AA', '#43CCB5', '#6499DC'],
      chartData: {
        labels: [],
        datasets: [
          {
            backgroundColor: ['#FC88AA', '#43CCB5', '#6499DC'],
            data: [],
            selectedCount: []
          }
        ]
      },
      chartOptions: {
        hover: false,
        borderWidth: 0,
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            filter: function (e) {
              return e.parsed < 10
            },
            callbacks: {
              label: function(tooltipItem) {
                const currentIndex = tooltipItem.dataIndex
                const selectedCount = tooltipItem.dataset.selectedCount[currentIndex]
                return `${tooltipItem.raw}% (${selectedCount}명)`
              }
            }
          },
          datalabels: {
            color: '#fff',
            font: {
              family: 'Pretendard Variable',
              weight: '400',
              size: '14'
            },
            formatter: function (value) {
              let sum = 0;
              let valueArr = this.chartData.datasets[0].data;
              for (var i in valueArr) {
                sum += parseInt(valueArr[i]);
              }
              const selectCount = this.questionItemList.find(item => item.selectedPercent === value).selectedCount
              let result = `${value}%\n(${selectCount}명)`;
              return value < 10 ? '' : result;
            }.bind(this)
          },
        },
      }
    }
  },
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
    },
    chartId: {
      type: String,
      default: 'pie-chart'
    },
    datasetIdKey: {
      type: String,
      default: 'label'
    },
    width: {
      type: Number,
      default: 280
    },
    height: {
      type: Number,
      default: 280
    },
    cssClasses: {
      default: '',
      type: String
    },
    styles: {
      type: Object,
      default: () => {}
    },
    plugins: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    questionItemList() {
      return this.question.itemList
    },
    questionItemClassStyle() {
      return (questionItem) => {
        return questionItem.del ? 'label deleted' : 'label'
      }
    },
    questionItemTitle() {
      return (questionItem) => {
        return questionItem.del ? `${questionItem.itemTitle} (삭제)` : questionItem.itemTitle
      }
    },
    hasSelectedCount() {
      return this.questionItemList.some(questionItem => questionItem.selectedCount > 0)
    },
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
    setPieChartData() {
      this.chartData.labels = []
      this.chartData.datasets[0].data = []
      this.chartData.datasets[0].selectedCount = []

      this.questionItemList.forEach(questionItem => {
        this.chartData.labels.push(questionItem.itemTitle)
        this.chartData.datasets[0].data.push(questionItem.selectedPercent)
        this.chartData.datasets[0].selectedCount.push(questionItem.selectedCount)
      })
    },
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
    }
  },
  mounted() {
    if (this.hasSelectedCount) {
      this.setPieChartData()
    }
  },
  watch: {
    questionItemList() {
      this.setPieChartData()
    }
  }
}
</script>