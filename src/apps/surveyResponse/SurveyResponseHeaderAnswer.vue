<!--
@File(Method): SurveyResponseHeaderAnswer.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 설문·투표 > 설문목록 > 설문하기 > 설문 응답
@Modified: 2024-11-07 - #69524 설문 선착순/추첨 추가 : 알림 추가
-->
<template>
  <div class="survey__header is-fixed">
    <div class="header__inner">
      <div class="heading">설문 응답</div>

      <div class="right">
        <!-- TODO: 모바일 시뮬레이션에서 back 버튼 노출 -->
        <button class="m-btn-prev" v-if="prevAnswerPageId" @click.prevent="onClickPrev"></button>

        <template v-if="isAnswerHeader && afterSchoolStatus !== 'finish' && consultationStatus !== 'resultPage'">
          <div
            :class="{'pagination' : !surveyAnswerQuestionsPopup.isOpen, 'pagination is-active' : surveyAnswerQuestionsPopup.isOpen}"
            role="button"
            @click="toggleQuestionsPopup"
            ref="questionsPopupButton"
          >
            <span class="current">{{ curAnswerPageQuestionNumber }}</span>
            <span>/</span>
            <span>{{ curAllQuestionsTotalCount }}</span><span>문항</span>
          </div>

          <survey-response-header-answer-questions-popup
            v-if="surveyAnswerQuestionsPopup.isOpen"
          />
        </template>

      </div>

      <button
        class="btn-close"
        @click="onClose"
      ></button>
    </div>
  </div>

</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import SurveyResponseHeaderAnswerQuestionsPopup from "@/apps/surveyResponse/SurveyResponseHeaderAnswerQuestionsPopup";

export default {
  name: "survey-response-header-answer",
  components: {SurveyResponseHeaderAnswerQuestionsPopup},
  props: {
    doNotGoBack: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      questionsPopup: {
        isOpen: false,
      }
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveys: 'surveys',
      afterSchoolStatus: 'afterSchoolStatus',
      consultationStatus: 'consultationStatus',
      surveyResponseBodyName: 'surveyResponseBodyName',
      surveyAnswerQuestionsPopup: 'surveyAnswerQuestionsPopup',
      surveyAnswerPageId: 'surveyAnswerPageId'
    }),
    ...mapGetters('storeSurvey', {
      prevAnswerPageId: 'prevAnswerPageId',
      curAnswerPageQuestionNumber: 'curAnswerPageQuestionNumber',
      curAllQuestionsTotalCount: 'curAllQuestionsTotalCount'
    }),
    isAnswerHeader() {
      return this.surveyResponseBodyName === 'ANSWER'
    }
  },
  watch: {
    surveyAnswerPageId() {
      //#54492 [WEB] 설문 목록이 지속적으로 노출되는 현상
      const payload = {
        isOpen: false
      }
      this.setSurveyAnswerQuestionsPopup(payload)
    }
  },
  created() {
    document.addEventListener('click', this.closePopup)
  },
  destroyed() {
    // important to clean up!!
    document.removeEventListener('click', this.closePopup)
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setSurveyAnswerQuestionsPopup: 'setSurveyAnswerQuestionsPopup'
    }),
    ...mapActions('storeSurvey', {
      closeAnswerPage: 'closeAnswerPage',
      goRouteSurveyList: 'goRouteSurveyList',
      checkValidation: 'checkValidation'
    }),
    ...mapGetters('storeSurvey', {
      curSurveyAnswer: 'curSurveyAnswer',
      getSurveyResponseBodyName: 'getSurveyResponseBodyName'
    }),
    closePopup(e) {
      if (this.$refs.questionsPopupButton && !this.$refs.questionsPopupButton.contains(e.target)) {
        const payload = {
          isOpen: false
        }
        this.setSurveyAnswerQuestionsPopup(payload)
      }
    },
    toggleQuestionsPopup() {
      const payload = {
        isOpen: !this.surveyAnswerQuestionsPopup.isOpen
      }
      this.setSurveyAnswerQuestionsPopup(payload)
    },
    onClickPrev() {
      const params = {
        disabled: false,
        type: 'prev'
      }
      this.checkValidation(params)
    },
    // onCloseAppView() {
    //   this.surveyAnswerQuestionsPopup.isOpen = !this.surveyAnswerQuestionsPopup.isOpen
    // },
    onClose() {
      if (this.getSurveyResponseBodyName() === 'FORM' || this.$store.state.storeSurvey.isSimulation) {
        this.$emit('close')
        if(!this.doNotGoBack) this.goRouteSurveyList()
      } else {
        this.$hiClass.confirm(`아직 설문을 완료하지 않았습니다.<br>나가시겠습니까?`)
          .then(() => {
            // if (this.$store.state.storeSurvey.surveys.surveyType === "CONSULTATION" || this.$store.state.storeSurvey.surveys.surveyType === "AFTER_SCHOOL") {
            //   this.goRouteSurveyList()
            // } else {
              this.closeAnswerPage({type: 'close'})
            // }
          })
          .catch(() => console.log('취소'))
      }
    },    

    // #69524 설문 선착순/추첨 추가 : 알림 추가
    noti(){
      this.$hiClass.alert('선착순 마감되어 신청되지 않았습니다. <br> 다시 확인해 주세요.', 'warning')
      .then(() => {
        console.log("확인");
      })
      this.$hiClass.alert('종료된 설문입니다.', 'warning')
      .then(() => {
        console.log("확인");
      })
    }
  }
}
</script>