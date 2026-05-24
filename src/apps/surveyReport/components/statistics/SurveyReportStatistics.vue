<template>
  <div class="survey__content">
    <div class="column-content">
      <div class="survey-view__content all">
        <survey-info v-if="hasInfo"></survey-info>
        <div class="form-select">
          <div class="filter-box">
            <label>
              <span class="select-txt">학반(태그) 선택</span>
            </label>    
            <HiSelectBox
              class="opt-default"
              :class="activeTags.length === 0 ? null : 'tag-selected'"
              :items="tagIdNameList"
              :value="activeTags"
              empty-title="학반(태그)"
            >
              <template #btnType>
                학반(태그)
                <span class="txt-primary">
                  {{ activeTags.length === 0 ? '' : `(${activeTags.length})` }}
                </span>
              </template>
              <template #custom-option>
                <div class="option-list type02">
                  <HiButton color="link">
                    학반(태그) 선택
                  </HiButton>
                  <ul>
                    <li
                      v-for="item in tagIdNameList"
                      :key="item.value"
                    >
                      <input
                        type="checkbox"
                        :id="`check-${item.value}`"
                        :value="item.value"
                        v-model="activeTags"
                      />
                      <label :for="`check-${item.value}`">
                        <span>{{ item.title }}</span>
                      </label>
                    </li>
                    <li
                      v-if="tagIdNameList.length === 0"
                      class="hi-nodata sm"
                    >
                      <p>등록된 태그가 없습니다.</p>
                    </li>
                  </ul>
                </div>
              </template>
            </HiSelectBox>
          </div>
          <div class="txt-right">
            <div class="checkbox">
              <input type="checkbox" id="show-del-question" v-model="isShowDelQuestion">
              <label for="show-del-question"><span>삭제된 질문 보기</span></label>
            </div>
          </div>
        </div>
        <component
          v-for="question of questions"
          :key="`${question.questionType}-${question.questionId}`"
          :is="selectComponent(question)"
          :cur-survey-id="curSurveyId"
          :question="question"
          :question-type="question.questionType"
          :is-anonymous="isAnonymous"
          :is-used-url="isUsedUrl"
          :is-mobile="isMobile"
        >
        </component>
      </div>
    </div>

    <!-- 응답자 모달-->
    <survey-report-statistics-respondent-modal
      v-if="isModalOpen"
      :is-anonymous="isAnonymous"
    >
    </survey-report-statistics-respondent-modal>
  </div>
</template>

<script>
import SurveyInfo from "@/apps/surveyReport/components/common/SurveyInfo";
import PieChart from "@/apps/surveyReport/components/statistics/chart/PieChart";
import BarChart from "@/apps/surveyReport/components/statistics/chart/BarChart";
import DropDown from "@/apps/surveyReport/components/statistics/chart/DropDown";
import Subjective from "@/apps/surveyReport/components/statistics/chart/Subjective";
import AfterSchool from "@/apps/surveyReport/components/statistics/chart/AfterSchool";
import Consultation from "@/apps/surveyReport/components/statistics/chart/Consultation";
import SurveyReportStatisticsRespondentModal from "@/apps/surveyReport/components/statistics/modal/SurveyReportStatisticsRespondentModal";
import {mapActions, mapState, mapMutations} from "vuex";

export default {
  name: "survey-report-statistics",
  components: {
    SurveyInfo,
    PieChart,
    BarChart,
    DropDown,
    Subjective,
    AfterSchool,
    Consultation,
    SurveyReportStatisticsRespondentModal
  },
  data() {
    return {
      isShowDelQuestion: false,
      isMobile: false,
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
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport',
    }),
    ...mapState('storeClazzTag', ['clazzTags']),
    tagIdNameList() {
      return this.clazzTags.map(tag => ({ value: tag.tagId, title: tag.tagName }))
    },
    statistics() {
      return this.surveyReport.statistics
    },
    isModalOpen() {
      return this.statistics.isReplyPopupOpen
    },
    hasInfo() {
      return Object.keys(this.surveyReport.curSurveyReportInfo).length > 0
    },
    questions() {
      return this.statistics.curStatisticsItems
    },
    selectComponent() {
      return (question) => {
        if (question.isDel && !this.isShowDelQuestion) {
          return false
        }
        switch (question.questionType) {
          case 'CHOICE':
            if (question.itemList.length > 3) {
              return 'BarChart'
            } else if (question.itemList.length < 4) {
              return 'PieChart'
            }
            break
          case 'DROPDOWN':
            return 'DropDown'
          case 'STAR':
            return 'BarChart'
          case 'SUBJECTIVE':
          case 'SIGN':
          case 'ATTACHMENTS':
            return 'Subjective'
          case 'AFTER_SCHOOL':
            return 'AfterSchool'
          case 'CONSULTATION':
            return 'Consultation'
        }
      }
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      getSurveyReportStatisticsItems: 'getSurveyReportStatisticsItems',
      clearStatistics: 'clearStatistics',
      getCurSurveyReportInfo: 'getCurSurveyReportInfo',
      updateSurveyReport: 'updateSurveyReport'
    }),
    ...mapMutations('storeSurvey', [
      'setSurveyReportActiveTagIds'
    ])
  },
  mounted() {
    const payload = {
      surveyId: this.curSurveyId
    }
    this.updateSurveyReport(payload)
      .then(res => {
        this.getCurSurveyReportInfo(payload)
          .then(res => {
            this.getSurveyReportStatisticsItems(payload)
          })
          .catch(err => {})
      })
      .catch(err => {
      console.error('getCurSurveyReportInfo error', err)
    })
  },
  beforeDestroy() {
    this.clearStatistics()
  },
  watch: {
    activeTags(newTagIds) {
      this.setSurveyReportActiveTagIds(newTagIds)
      this.getSurveyReportStatisticsItems({surveyId: this.curSurveyId})
    }
  }
}
</script>

<style lang="scss" scoped>
  .survey-create__box {
    margin-bottom: 32px;
  }
  .form-select {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0 16px 0;
    margin-bottom: 18px;
    border-bottom: 1px solid #DDD;
  }
  .filter-box {
    display: flex;
    align-items: center;
    gap: 16px;
    label {
      .select-txt {
        display: inline-block;
        font-size: 15px;
        font-weight: 700;
        line-height: 23px;
        color: #222;
      }
    }
    .hi-selectbox {
      width: 200px;
      margin-right: 0;
      &.is-opened {
        ::v-deep .selected {
          border-color: #4267B2;
        }
      }
      ::v-deep .selected {
        color: #222;
        padding-left: 10px;
      }
      ::v-deep .option__layer{
        width: 200px;
        right: 0;
        left:auto;
        .hi-btn.btn-link{
          font-size: 14px;
          font-weight: 600;
          padding: 10px 15px;          
        }
      }
      ::v-deep.is-active .selected {
        border: solid 1px var(--primary);
      }
    }
  }
</style>