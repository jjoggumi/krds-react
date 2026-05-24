<template>
  <div
    class="column-left"
    :class="{
      'is-opened': isOpenedSideBar,
      'is-collapsed': !isOpenedSideBar,
      'is-editable': isEditable
    }"
  >
    <div class="column__inner">
      <button
        class="btn-column-left-toggle"
        @click="isOpenedSideBar = !isOpenedSideBar"
      ></button>

      <div class="is-fixed-top">
        <button
          class="btn-import"
          title="불러오기"
          @click="openRecommendTemplateModal"
        >
          불러오기
        </button>
        <button
          class="btn-add"
          title="새 페이지"
          @click="onclickNewSlide"
        >
          새 페이지
        </button>
      </div>

      <div class="survey__lnb">

        <div
          class="survey__setting"
          role="button"
          @click="selectSetting"
        >
          <div
            class="setting__box"
            :class="{
              'is-active': isSelectedSurveySetting
            }"
            :tabindex="-1"
          >
            <button class="btn-setting"></button>
            <span class="type">설문 설정</span>
            <span class="heading">{{ curSurveyEditTitle }}</span>
            <span
              v-if="!isCurSurveyEditValidated"
              class="icon-error"
            ></span>
          </div>
        </div>

        <template v-if="curSurveyEdit.surveyId">

          <survey-create-lnb-page
            ref="surveyCreateLnbPage"
            :is-editable="isEditable"
            @set-merge-ready-pages-count="setMergeReadyPagesCount"
          />

        </template>
      </div>

      <!--
      <div
        v-if="isEditable"
        class="is-fixed-bottom"
      >
        <p>한 페이지에 질문 구성하기</p>

        <div class="group-text">
          <span><em>{{ mergeReadyPagesCount || 0 }}개</em> 선택</span>
          <span
            v-if="mergeReadyPagesCount > 0"
            role="button"
            @click="onClickMergeDeSelect"
          >
            선택 해제
          </span>
        </div>

        <div class="group-btn">
          <button
            class="hi-btn btn-sm btn-line"
            @click="onClickMergeCancel"
          >
            취소
          </button>
          <button
            class="hi-btn btn-sm"
            :disabled="mergeReadyPagesCount < 2"
            @click="onClickMergeSubmit"
          >
            완료
          </button>
        </div>
      </div>

      <div
        v-else
        class="is-fixed-bottom"
      >
        <p class="text">한 페이지에 질문 구성하기</p>

        <div class="group-btn">
          <button
            class="hi-btn btn-sm"
            @click="isEditable = true"
          >
            편집
          </button>
        </div>
      </div>
      -->

    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import SurveyCreateLnbPage from "@/apps/surveyCreate/SurveyCreateLnbPage";

export default {
  name: "survey-create-lnb",
  components: {SurveyCreateLnbPage},
  data() {
    return {
      isOpenedSideBar: true,
      isEditable: false,
      mergeReadyPagesCount: 0
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      placeholderDefault: 'placeholderDefault',
      curSurveyEdit: 'curSurveyEdit',
      surveyCreateBodyComponentName: 'surveyCreateBodyComponentName',
    }),
    ...mapGetters('storeSurvey', {
      isSelectedSurveySetting: 'isSelectedSurveySetting',
      isCurSurveyEditValidated: 'isCurSurveyEditValidated',
    }),
    curSurveyEditTitle() {
      return this.curSurveyEdit.surveyTitle || this.placeholderDefault.surveyInfoTitle
    },
  },
  watch: {
    isEditable() {
      this.$refs.surveyCreateLnbPage.clearMergeReadyPages()
    }
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setSurveyCreateBodyComponentName: 'setSurveyCreateBodyComponentName'
    }),
    ...mapActions('storeSurvey', {
      importSurvey: 'importSurvey',
      createSlide: 'createSlide',
      temporarilySaveSurvey: 'temporarilySaveSurvey',
      initSurveyEditQuestions: 'initSurveyEditQuestions',
      openRecommendTemplateModal: 'openRecommendTemplateModal',
    }),
    async selectSetting() {
      const result = await this.temporarilySaveSurvey({})

      if (result) {
        this.setSurveyCreateBodyComponentName('SETTING')
        await this.initSurveyEditQuestions({})
      }
    },
    setMergeReadyPagesCount(count) {
      this.mergeReadyPagesCount = count
    },
    onClickMergeDeSelect() {
      this.$refs.surveyCreateLnbPage.clearMergeReadyPages()
    },
    onClickMergeSubmit() {
      this.$refs.surveyCreateLnbPage.mergePage()
    },
    onClickMergeCancel() {
      this.isEditable = false
    },
    onclickNewSlide() {
      this.createSlide()
    }
  }
}
</script>

<style scoped>

</style>