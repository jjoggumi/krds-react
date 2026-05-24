<template>
  <div class="survey-view__content webview">
    <survey-info v-if="hasInfo"></survey-info>
    <div class="form-select">
      <div class="filter-box">
        <HiSelectBox
            class="opt-default"
            :class="surveyReport.statistics.activeTagIds.length === 0 ? null : 'tag-selected'"
            :items="tagIdNameList"
            :value="surveyReport.statistics.activeTagIds"
            empty-title="학반(태그)"
        >
          <template #btnType>
            학반(태그)
            <span class="txt-primary">
              {{ surveyReport.statistics.activeTagIds.length === 0 ? '' : `(${surveyReport.statistics.activeTagIds.length})` }}
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
                      v-model="activeTagIds"
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
    </div>
    <template v-if="curSurveyId">
      <component
        v-for="question of questions"
        :key="`mobileStatistics-${question.questionType}-${question.questionId}`"
        :is="selectComponent(question)"
        :cur-survey-id="curSurveyId"
        :question="question"
        :question-type="question.questionType"
        :is-anonymous="isAnonymous"
        :is-used-url="isUsedUrl"
        :is-mobile="isMobile"
      >
      </component>
    </template>
    <div class="survey__floating is-fixed">
      <div class="floating__inner">
        <button class="btn-top" @click="goTop">top</button>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import SurveyInfo from "@/apps/surveyReport/components/common/SurveyInfo";
import PieChart from "@/apps/surveyReport/components/statistics/chart/PieChart";
import BarChart from "@/apps/surveyReport/components/statistics/chart/BarChart";
import DropDown from "@/apps/surveyReport/components/statistics/chart/DropDown";
import MobileSubjective from "@/apps/mobile/surveyReport/statistics/chart/MobileSubjective";
import MobileAfterSchool from "@/apps/mobile/surveyReport/statistics/chart/MobileAfterSchool";
import Consultation from "@/apps/surveyReport/components/statistics/chart/Consultation";

export default {
  name: "mobile-survey-report-statistics",
  components: {
    SurveyInfo,
    PieChart,
    BarChart,
    DropDown,
    MobileSubjective,
    MobileAfterSchool,
    Consultation
  },
  data() {
    return {
      isShowDelQuestion: false,
      isMobile: true
    }
  },
  props: {
    isAnonymous: {
      type: Boolean
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport'
    }),
    ...mapState('storeClazzTag', ['clazzTags']),
    curSurveyId() {
      return this.surveyReport.curSurveyId
    },
    isUsedUrl() {
      return this.surveyReport.curSurveyReportInfo.usedUrl
    },
    hasInfo() {
      return Object.keys(this.surveyReport.curSurveyReportInfo).length > 0
    },
    statistics() {
      return this.surveyReport.statistics
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
            return 'MobileSubjective'
          case 'AFTER_SCHOOL':
            return 'MobileAfterSchool'
          case 'CONSULTATION':
            return 'consultation'
        }
      }
    },
    tagIdNameList() {
      return this.clazzTags.map(tag => ({ value: tag.tagId, title: tag.tagName }))
    },
    activeTagIds: {
      get() {
        return this.surveyReport.statistics.activeTagIds
      },
      set(newTagIds) {
        this.setSurveyReportActiveTagIds(newTagIds)
      }
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      getSurveyReportStatisticsItems: 'getSurveyReportStatisticsItems'
    }),
    ...mapActions('storeClazzTag', ['fetchTags']),
    ...mapMutations('storeSurvey', ['setSurveyReportActiveTagIds']),
    goTop() {
      window.scrollTo(0,0)
    }
  },
  mounted() {
    this.getSurveyReportStatisticsItems({ surveyId: this.curSurveyId })
    this.fetchTags(this.surveyReport.curSurveyReportInfo.classId)
  },
  watch: {
    activeTagIds() {
      this.getSurveyReportStatisticsItems({ surveyId: this.curSurveyId })
    }
  }
}
</script>

<style lang="scss" scoped>
.survey-view__content.webview {
  .form-select {
    margin: 1.714rem 1.143rem;
    .hi-selectbox {
      width: 100%;
      .option__layer {
        .option-list {
          button.hi-btn {
            font-size: 14px;
            font-weight: 600;
            padding: 10px 15px;
          }
        }
      }
    }
  }
}
</style>