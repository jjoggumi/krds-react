<template>
  <div class="surveyvote__list">

    <!-- 로딩 -->
    <template v-if="surveys.length === 0 && !isContentEmpty">
      <div class="surveyvote__item loading"
           v-for="idx of loadingBoxLength"
           :key="`loading-${idx}`"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </template>

    <!-- 진행중 / 종료 / 임시저장 리스트 -->
    <main-body-clazzes-body-survey-contents-item
      v-for="survey of surveys"
      :key="survey.surveyId"
      :survey="survey"
      @onClickComplete="onClickComplete"
      @shareHitalk="shareHitalk"
      @clickStatistics="onClickStatistics"
      @clickPreview="onClickPreview"
    />

    <survey-answer-complete-modal :surveyId="surveyId" v-if="$store.state.storeSurvey.completePopup.flag" />
    <complete-modal
      v-if="completeModalFlag"
      :respondent-list="respondentList"
      @onClose="onCloseModal"
    />
    <!-- 하이톡 공유하기 모달 -->
    <hitalk-share-modal
        v-if="hitalkShareIsOpen"
        :post="hitalkShareSurvey"
        :postType="'SURVEY'"
        :shareBtnType="'survey'"
        @controlHitalkShareModal="controlHitalkShareModal"
    >
    </hitalk-share-modal>
    <div class='fullscreen-modal' v-if="selectedSurveyIdForStatistics">
      <survey-report :propsSurveyId="selectedSurveyIdForStatistics" @close="onCloseStatistics"/>
    </div>

    <div class='fullscreen-modal' v-if="selectedSurveyIdForPreview">
      <survey-response :propsSurveyId="selectedSurveyIdForPreview" :propsPreview="true" @close="onClosePreview"/>
    </div>
  </div>
</template>

<script>

import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";
import MainBodyClazzesBodySurveyContentsItem from "@/apps/main/clazzes/survey/MainBodyClazzesBodySurveyContentsItem";
import completeModal from "@/apps/main/clazzes/survey/MainBodyClazzesBodySurveyContentsCompleteModal";
import SurveyAnswerCompleteModal from "@/components/Modal/SurveyAnswerCompleteModal";
import HitalkShareModal from "@/components/HitalkShare/HitalkShareModal";
import SurveyReport from "@/apps/surveyReport/SurveyReport";
import SurveyResponse from "@/apps/surveyResponse/SurveyResponse";

const bodyScrollController = new function() {
  this.freezeBodyScroll = () => {
    document.body.style.overflow = 'hidden'
    window.addEventListener('popstate', () =>
      this.restoreBodyScroll(), { once: true })
  }

  this.restoreBodyScroll = () => {
    document.body.style.overflow = ''
  }
}

export default {
  name: 'main-body-clazzes-body-survey-contents',
  components: {
    MainBodyClazzesBodySurveyContentsItem,
    completeModal,
    SurveyAnswerCompleteModal,
    HitalkShareModal,
    SurveyReport,
    SurveyResponse
  },
  props: {
    isContentEmpty: {
      type: Boolean
    },
  },
  data() {
    return {
      surveys: [],
      surveyId: '',
      loadingBoxLength: 4,
      respondentList: [],
      completeModalFlag: false,
      modalType: '',
      hitalkShareIsOpen: false,
      hitalkShareSurvey: {},
      selectedSurveyIdForStatistics: null,
      selectedSurveyIdForPreview: null
    }
  },
  computed: {
    ...mapState({
      infiniteScroll: 'infiniteScroll',
      curClassItem: 'curClassItem',
    }),
    ...mapState('storeSurvey', {
      surveySearchQuery: 'surveySearchQuery',
      isRecommendTemplateOpen: 'isRecommendTemplateOpen',
      mySurveyHistory: 'mySurveyHistory',
    }),
    ...mapState('storeClazzes', {
      clazzMemberRole: 'clazzMemberRole'
    }),
    ...mapGetters({
      isCurClassOwnerOrManager: 'isCurClassOwnerOrManager',
      curClassId: 'curClassId',
      curSchoolId: 'curSchoolId',
    }),
  },
  created() {},
  mounted() {
    this.initSurveys()
    this.getSurveys()
    eventBus.$on('do-search-resource', flag => this.getSurveys(flag))
    eventBus.$on('updateSurveyList', () => {
      this.getSurveys(true)
    })
  },
  updated(){
    // this._unitTest()
  },
  beforeDestroy() {
    eventBus.$off('do-search-resource')
    eventBus.$off('updateSurveyList')
  },
  methods: {
    ...mapActions('storeHitalk', {
      connectStompClient:'connectStompClient',
      disconnectStompClient: 'disconnectStompClient',
      callChatUserList: 'callChatUserList',
      callChatRooms: 'callChatRooms'
    }),
    ...mapActions({
      initInfiniteScroll: 'initInfiniteScroll'
    }),
    ...mapActions('storeSurvey', {
      getRespondentList: 'getRespondentList'
    }),
    ...mapMutations('storeSurvey', {
      setCompletePopup: 'setCompletePopup'
    }),
    async onClickComplete(param) {
      this.modalType = param.surveyType
      this.surveyId = param.surveyId
      this.respondentList = await this.getRespondentList({surveyId: param.surveyId})
      if (this.respondentList.length === 1) {
        this.onCloseModal(this.respondentList[0])
      } else if(this.respondentList.length === 0){
        this.surveyId = ''
        this.setCompletePopup({
          flag: true,
          respondentId: '',
          questionType: this.modalType,
          item: {}
        })
      } else {
        this.completeModalFlag = true
      }
    },
    onCloseModal(item) {
      this.completeModalFlag = false
      if(item) {
        setTimeout(() => {
          this.setCompletePopup({
            flag: true,
            respondentId: item.respondentId,
            questionType: this.modalType,
            item: item
          }, 100)
        })
      }
    },
    initSurveys() {
      this.infiniteScroll.isListEnd = false
      this.infiniteScroll.page = parseInt(process.env.VUE_APP_BASE_PAGE_START, 10)
      this.infiniteScroll.size = parseInt(process.env.VUE_APP_BASE_PAGE_SIZE, 10)
      this.surveys.splice(0)
    },
    getSurveys(flag) {
      this.$emit('set-is-content-empty', false)
      if (flag)
        this.initSurveys()

      if (!this.infiniteScroll.isBusy && !this.infiniteScroll.isListEnd) {
        this.$store.commit('setInfiniteScrollIsBusy', true)

        const requestParams = {
          page: this.infiniteScroll.page,
          size: this.infiniteScroll.size,
          // sort: 'surveyPosted,desc',
          classId: this.curClassId,
        }

        // 학부모, 학생인 경우 파라미터 변경
        // TODO: 새 설문 작성 중 뒤로가기로 목록 진입 시 isManager 정보 동기화가 늦는 문제가 있음
        if (this.isCurClassOwnerOrManager) {
          requestParams.viewType = 'ALL'
          requestParams.surveyStatus = 'DOING'
        } else {
          requestParams.viewType = 'TARGET'
          requestParams.surveyStatus = 'DOING'
        }

        this.surveySearchQuery.classStatus = this.curClassItem.classStatus

        for (const [key, value] of Object.entries(this.surveySearchQuery)) {
          if (value !== null)
            requestParams[key] = value
        }

        this.$axios({
          method: 'GET',
          url: '/surveys',
          params: requestParams
        })
          .then(res => {
            const _embedded = res.data._embedded
            if (_embedded && _embedded.surveys) {
              this.surveys.push(..._embedded.surveys)
            } else {
              this.surveys.splice(0)
            }

            this.$emit('set-is-content-empty', this.surveys.length === 0)

            const totalPages = res.data.page.totalPages
            const pageNumber = res.data.page.number

            if (totalPages > pageNumber + 1) {
              this.infiniteScroll.page++
              this.infiniteScroll.isListEnd = false
            } else {
              this.infiniteScroll.page = 0
              this.infiniteScroll.isListEnd = true
            }
          })
          .catch(error => {
            this.$log.debug(this.$options.name,'error:', error)
          })
          .finally(() => {
            this.$store.commit('setInfiniteScrollIsBusy', false)
          })
      }
    },
    shareHitalk(survey) {
      this.hitalkShareSurvey = survey
      this.controlHitalkShareModal(true)
    },
    onClickStatistics(surveyId) {
      this.selectedSurveyIdForStatistics = surveyId
      bodyScrollController.freezeBodyScroll()
    },
    onCloseStatistics() {
      this.selectedSurveyIdForStatistics = null
      bodyScrollController.restoreBodyScroll()
    },
    onClickPreview(surveyId) {
      this.selectedSurveyIdForPreview = surveyId
      bodyScrollController.freezeBodyScroll()
    },
    onClosePreview() {
      this.selectedSurveyIdForPreview = null
      bodyScrollController.restoreBodyScroll()
    },
    async controlHitalkShareModal(flag) {
      if (flag) {
        await this.connectStompClient()
        await this.callChatUserList()
        await this.callChatRooms({ force: true })

        this.hitalkShareIsOpen = flag

      } else {
        await this.disconnectStompClient()
        this.hitalkShareIsOpen = flag
      }
    },
    _unitTest(){
      this.$log.debug('======================== #57376 설문 목록 unit test ========================')
      this.$log.debug('======================== 나의 설문내역 확인 && 설문하기 ========================')
      this.$log.debug('응답자조회 : SurveyRespondentModal.vue ', this.$store.state.storeSurvey.isCurSurveyRespondentModalOpen)
      this.$log.debug('설문 유형인 경우 - SURVEY : ' , this.surveys[0].surveyType)
      this.$log.debug('응답을 완료한 내역이 1건 이상 있는 경우 : ', this.surveys[0].respondentCount)
      this.$log.debug('종료된 설문 - END : ', this.surveys[0].surveyStatus)
      this.$log.debug('종료된 설문에서도 - COMPLETE: ', this.surveys[0].answerStatus, '응답을 완료한 내역이 있으면 노출 - 1 ', this.surveys[0].respondentCount)
      this.$log.debug('관리자가 응답 내역을 모두 초기화 했을 경우 [설문하기]로 표시 : ', this.surveys[0].respondentCount)
      this.$log.debug('관리자가 응답 내역을 일부 초기화 하여 응답 내역이 1개 이상 있을 경우 [설문 내역 확인] 버튼으로 노출 : ', this.surveys[0].respondentCount)
      this.$log.debug('======================== 미리보기 ========================')
      this.$log.debug('클래스 선생님', this.clazzMemberRole)
      this.$log.debug('설문 대상에 포함되지 않은 경우 : false?', this.surveys[0].isTarget)
      this.$log.debug('======================== 신청내역 확인 및 변경 ========================')
      this.$log.debug('방과후 신청, 학부모 상담 유형이고 ', this.surveys[0].surveyType)
      this.$log.debug('신청완료 내역이 1개 이상 있는 경우', this.surveys[0].respondentCount)
      this.$log.debug('[나의 신청 내역] 팝업',  this.$store.state.storeSurvey.isCurSurveyRespondentModalOpen)
      this.$log.debug('종료된 설문', this.surveys[0].surveyStatus)
      this.$log.debug('응답을 완료한 내역이 있으면 노출', this.surveys[0].answerStatus)
      this.$log.debug('======================== 설문 종료 케이스 ========================')
      this.$log.debug('======================== 나의 설문내역 확인 ========================')
      this.$log.debug('설문 유형이면 상시 노출', this.surveys[0].surveyType)
      this.$log.debug('나의 설문내역 확인 팝업 노출' , this.$store.state.storeSurvey.isCurSurveyRespondentModalOpen)
    },
  },
  watch: {
    isRecommendTemplateOpen: {
      handler: function (newVal) {
        if (!newVal) { // 추천템플릿 모달 닫을때
          this.getSurveys(true)
        }
      }
    }
  }
}
</script>

<style scoped>
.fullscreen-modal {
  position: fixed;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
    overflow: scroll;
}
</style>