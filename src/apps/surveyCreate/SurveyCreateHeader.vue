<template>
  <div
    v-if="surveyCreateComplete.isVisible"
    :key="`survey-create-header-${surveyCreateComplete.isVisible}`"
    class="survey__header"
  >
    <div class="header__inner">
      <button
        class="btn-close"
        @click="closeSurveyCreateComplete"
      ></button>
    </div>
  </div>

  <div
    v-else
    :key="`survey-create-header-${surveyCreateComplete.isVisible}`"
    class="survey__header is-fixed"
  >
    <div class="header__inner">
      <h1 class="heading">
        {{ title }}
        <span
          v-if="surveyEditPagesQuestionsTotalCount > 0"
        >
          ({{ surveyEditPagesQuestionsTotalCount }}문항)
        </span>
      </h1>

      <button
        class="btn-guide"
        @click="routeSurveyWriteGuide"
      >
        설문 작성가이드
      </button>

      <div class="group-btn">
        <span
          v-if="isShowReserveText"
          class="text-reserve"
        >
          {{ getSurveyPostedStr(curSurveyEdit.surveyPosted) }} 예약 설문
        </span>
        <button
          v-if="!isCurSurveyPosted"
          class="hi-btn btn-md"
          @click="onClickTemporary"
        >
          임시저장
        </button>
        <button
          class="hi-btn btn-md"
          @click="onPreview"
        >
          미리보기
        </button>
        <button
          class="hi-btn btn-md btn-submit"
          :disabled="isDisabledSubmit"
          @click="onClickSubmit"
        >
          {{ validateSaveSurveyButtonTitle }}
        </button>
      </div>
      <button
        class="btn-close"
        @click="closeSurveyCreate"
      ></button>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";

export default {
  name: "survey-create-header",
  data() {
    return {
      isWait: false
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      curSurveyEdit: 'curSurveyEdit',
      surveyCreateComplete: 'surveyCreateComplete'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    ...mapGetters('storeSurvey', {
      isCurSurveyPublished : 'isCurSurveyPublished',
      isCurSurveyPosted: 'isCurSurveyPosted',
      isCurSurveyEditValidated: 'isCurSurveyEditValidated',
      surveyEditPagesQuestionsTotalCount: 'surveyEditPagesQuestionsTotalCount',
    }),
    isWaiting: function() {
      return this.isWait
    },
    title() {
      const surveyTypeName = this.CONSTANTS.SURVEY_TYPE_NAME[this.curSurveyEdit.surveyType]
        ? this.CONSTANTS.SURVEY_TYPE_NAME[this.curSurveyEdit.surveyType]
        : this.CONSTANTS.SURVEY_TYPE_NAME.SURVEY

      return this.isCurSurveyPublished
        ? `${surveyTypeName} 수정하기`
        : `${surveyTypeName} 만들기`
    },
    isShowReserveText() {
      return this.curSurveyEdit.isReservation
        && this.curSurveyEdit.surveyStatus === this.CONSTANTS.SURVEY_STATUS.COMPLETE
        && !this.isCurSurveyPosted
    },
    validateSaveSurveyButtonTitle() {
      return this.isCurSurveyPublished ? '수정하기' : '발행하기'
    },
    isDisabledSubmit() {
      return !this.curSurveyEdit
    },
  },
  methods: {
    ...mapActions('storeSurvey', {
      temporarilySaveSurvey: 'temporarilySaveSurvey',
      previewSurvey: 'previewSurvey',
      validateSaveSurvey: 'validateSaveSurvey',
      validateTempItems: 'validateTempItems',
      validateItems: 'validateItems',
      deleteSurveyEdit: 'deleteSurveyEdit'
    }),
    closeSurveyCreate() {
      const confirmMessage = `작성 중인 내용이 있습니다.<br>작성을 중단하시겠습니까?`
      const opt = { reverseButtons: true }

      this.$hiClass.confirm(confirmMessage, null, opt)
        .then(async () => {
          const surveyId = this.curSurveyEdit.surveyId
          const goRouteClazzesSurvey = () => {
            const routeObj = {
              path: `/main/clazzes/${this.curSurveyEdit.classId}/survey`,
              query: { tabCode: this.$route.query.tabCode }
            }
            setTimeout(() => {
              this.$router.replace(routeObj, () => {})
            }, 50)
          }
          // surveyId 발급 완료
          if (!surveyId) {
            goRouteClazzesSurvey()
            return false
          }
          try {
            const result = await this.deleteSurveyEdit(surveyId)
            // 편집 데이터 삭제 성공
            if (result) {
              goRouteClazzesSurvey()
            }
          } catch (e) {
            // 편집 데이터 삭제 실패
            this.$hiClass.alert('데이터 수정 중 오류가 발생했습니다.<br>잠시 후 다시 시도해주세요.')
          }
        })
    },
    closeSurveyCreateComplete() {
      const classId = this.curSurveyEdit.classId
      const location = classId ? `/main/clazzes/${classId}/survey` : '/main'
      this.$router.push(location, () => {})
    },
    getSurveyPostedStr(surveyPosted) {
      return this.$moment(surveyPosted).format('M월 D일 HH:mm')
    },
    async onClickTemporary() {
      if(!this.isWaiting) {
        this.isWait = true
        try {
          await this.validateTempItems()
          await this.temporarilySaveSurvey({
              isApply: true, skipInitializeItems: true
          })
          this.isWait = false
        } catch (e) {
          this.$log.warn(e)
          this.isWait = false
        }
      }
    },
    async onPreview() {
      if(!this.isWaiting) {
        this.isWait = true
        try {
          await this.validateTempItems()
          await this.temporarilySaveSurvey({
            isApply: true, quiet: true, skipInitializeItems: true
          })
          await this.previewSurvey()
          this.isWait = false
        } catch (e) {
          this.$log.warn(e)
          this.isWait = false
        }
      }
    },
    async onClickSubmit() {
      if(!this.isWaiting) {
        this.isWait = true
        try {
          await this.validateTempItems()
          if (this.curSurveyEdit.surveyType === this.CONSTANTS.SURVEY_TYPE.CONSULTATION && !this.$store.state.storeSurvey.useSurvey) {
            const payload = { message: '학부모 상담 달력을 생성해주세요.' }
            await this.validateItems(payload)
          }
          await this.validateSaveSurvey()
          this.isWait = false
        } catch (e) {
          this.$log.warn(e)
          this.isWait = false
        }
      }
      
    },
    routeSurveyWriteGuide() {
      const url = this.$store.state.surveyWriteGuideUrl
      window.open(url)
    },
  }
}
</script>

<style scoped>

</style>