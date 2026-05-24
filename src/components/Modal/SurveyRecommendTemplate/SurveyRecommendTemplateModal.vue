<template>
  <div class="hi-modal-common modal-survey-recommend" style="display: block;">
    <div class="modal__dim" @click="closeRecommendTemplateModal()"></div>
    <div class="modal__layer">
      <div class="modal__header">
        <h2 class="heading">추천 템플릿</h2>
        <button class="btn-close" @click="closeRecommendTemplateModal()"></button>
      </div>
<!--      TODO 3순위 내가 만든 설문 탭 적용때 활용-->
<!--      <div class="modal__tab">-->
<!--        <button-->
<!--          type="button"-->
<!--          :class="{'is-active': activeTab === 'RECOMMEND_SHARE'}"-->
<!--          @click="changeTab('RECOMMEND_SHARE')"-->
<!--        >-->
<!--          추천 & 공유 설문-->
<!--        </button>-->
<!--        <button-->
<!--          type="button"-->
<!--          :class="{'is-active': activeTab === 'MY_SURVEY'}"-->
<!--          @click="changeTab('MY_SURVEY')"-->
<!--        >-->
<!--          내가 만든 설문-->
<!--        </button>-->
<!--      </div>-->
      <div class="modal__content">
        <survey-recommend-template-top/>

        <div class="area-survey-recommend">
          <survey-recommend-template-list/>
          <survey-recommend-template-preview/>
          <div class="survey-recommend__bottom">
            <button
              class="hi-btn btn-xl"
              :disabled="!hasSurveyContents"
              @click="useSurvey"
            >
              설문 사용하기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SurveyRecommendTemplateList from "@/components/Modal/SurveyRecommendTemplate/SurveyRecommendTemplateList";
import SurveyRecommendTemplatePreview from "@/components/Modal/SurveyRecommendTemplate/SurveyRecommendTemplatePreview";
import SurveyRecommendTemplateTop from "@/components/Modal/SurveyRecommendTemplate/SurveyRecommendTemplateTop";
import {mapActions, mapMutations, mapState} from "vuex";
export default {
  name: "SurveyRecommendTemplateModal",
  components: {
    SurveyRecommendTemplatePreview,
    SurveyRecommendTemplateList,
    SurveyRecommendTemplateTop
  },
  created() {
    this.initSurveyContents()
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
    this.initInfiniteScroll()
    this.searchRecommendShareTemplate()
  },
  computed: {
    ...mapState({
      infiniteScroll: 'infiniteScroll',
      user: 'user',
      curClassItem: 'curClassItem',
      isLoading: 'isLoading',
    }),
    ...mapState('storeSurvey', {
      activeTab: 'recommendTemplateActiveTab',
      surveyContents: 'surveyContents',
      curSurveyEdit: 'curSurveyEdit'
    }),
    hasSurveyContents() {
      return Object.keys(this.surveyContents).length > 0
    },
    isSurveyCreatePage() {
      return this.$route.path.includes('/survey-create')
    }
  },
  methods: {
    ...mapMutations({
      setIsLoading: 'setIsLoading'
    }),
    ...mapMutations('storeSurvey', {
      setIsUsedTemplate: 'setIsUsedTemplate'
    }),
    ...mapActions({
      initInfiniteScroll: 'initInfiniteScroll'
    }),
    ...mapActions('storeSurvey', {
      changeTab: 'changeRecommendTemplateTab',
      closeRecommendTemplateModal: 'closeRecommendTemplateModal',
      searchRecommendShareTemplate: 'searchRecommendShareTemplate',
      initRecommendTemplateSearchQuery: 'initRecommendTemplateSearchQuery',
      initRecommendTemplates: 'initRecommendTemplates',
      initSurveyContents: 'initSurveyContents',
      copySurveyCreateEdit: 'copySurveyCreateEdit',
      appendSurveyCreate: 'appendSurveyCreate',
    }),
    async useSurvey() {
      // 설문 만들기 페이지에서 호출
      this.$store.state.storeSurvey.useSurvey = true //추천템플릿 사용여부
      if (this.isSurveyCreatePage) {
        if (!this.isLoading) {
          this.setIsLoading(true)

          const useSurveyType = this.surveyContents.surveyType
          const editSurveyType = this.curSurveyEdit.surveyType

          let msg = ``

          if (useSurveyType === 'SURVEY') { // 설문 유형 사용하기시 이어서 불러오기
            const requestBody = {
              surveyEditType: this.curSurveyEdit.surveyType,
              readyMadeSurveyId: this.surveyContents.surveyId,
              readyMadeSurveyStatus: this.activeTab === 'RECOMMEND_SHARE' ? 'SHARE' : 'KEEP',
              readyMadeSurveyType: this.surveyContents.surveyType
            }
            await this.appendSurveyCreate(requestBody)
            await this.closeRecommendTemplateModal()
            this.setIsUsedTemplate(true)

          } else { // 방과후, 학부모 유형 사용하기시 새로열기
            if (editSurveyType === useSurveyType) {
              msg = `선택하신 탬플릿으로 변경하여 새로 여시겠습니까?</br>작성중인 내용은 저장되지 않습니다.`
              this.$hiClass.confirm(msg).then(() => {
                this.copySurveyEdit()
              })
            } else {
              msg = `설문 유형 변경 시 작성중인 내용은 저장되지 않습니다.</br>변경하시겠습니까?`
              this.$hiClass.confirm(msg).then(() => {
                this.copySurveyEdit()
              })
            }
          }

          this.setIsLoading(false)
        }
      } else {
        // 추천템플릿에서 사용하기
        this.copySurveyEdit()
      }
    },
    copySurveyEdit() {
      const requestBody = {}
      requestBody.surveyId = this.surveyContents.surveyId
      requestBody.userId = this.user.currentId
      requestBody.schoolId = Object.keys(this.curClassItem).length > 0 ?
        this.curClassItem.school.currentId :
        this.curSurveyEdit.schoolId
      requestBody.classId = Object.keys(this.curClassItem).length > 0 ?
        this.curClassItem.currentId :
        this.curSurveyEdit.classId
      requestBody.originSurveyStatus = this.activeTab === 'RECOMMEND_SHARE' ? 'SHARE' : 'KEEP'

      this.copySurveyCreateEdit(requestBody)
      this.setIsUsedTemplate(true)
    }
  },
  beforeDestroy() {
    this.initInfiniteScroll()
    this.initRecommendTemplateSearchQuery()
    this.initRecommendTemplates()
    this.initSurveyContents()
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  watch: {
    $route() {
      this.closeRecommendTemplateModal()
    }
  }
}
</script>

<style scoped>

</style>