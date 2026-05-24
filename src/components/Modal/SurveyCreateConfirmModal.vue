<!--
@File(Method): SurveyCreateConfirmModal.vue
@Description: 설문 > 설문 생성 > 발행하기 모달
@Modified: 2025-03-28 - #73157 : webfront 개선 - #73181  알럿 버튼 공통화 추가 적용 요청 -  himodal 사용
-->
<template>
  <HiModal type="type01" size="sm" @close="closeModal">
    <template v-slot:heading>
      <div class="icon-submit-survey"></div>
      <p
        v-if="titleHtml"
        v-html="titleHtml"
      ></p>
    </template>
    <template v-slot:content> 
      <p
        v-if="reserveTimeHtml"
        class="text-em"
        v-html="reserveTimeHtml"
      ></p>
      <p
        v-if="descriptionHtml"
        class="text-refer"
        v-html="descriptionHtml"
      ></p>

      <div class="checkbox">
        <input
          type="radio"
          id="create-confirm-modal-chk-01"
          name="create-confirm-modal-chk-01"
          :value="false"
          v-model="isSendPush"
        >
        <label for="create-confirm-modal-chk-01"><span>푸시 보내지 않음</span></label>

        <input
          type="radio"
          id="create-confirm-modal-chk-02"
          name="create-confirm-modal-chk-02"
          :value="true"
          v-model="isSendPush"
        >
        <label for="create-confirm-modal-chk-02"><span>푸시 보내기</span></label>
      </div>
    </template>
    <template v-slot:footer>          
      <HiButton color="line-light-primary" size="lg" @click="onClickCancel">취소</HiButton>
      <HiButton color="primary" size="lg" @click="onClickSubmit">확인</HiButton>        
    </template>       
  </HiModal>
  <!-- <div class="hi-modal-common modal-message">

    <div
      class="modal__dim"
      @click="closeModal"
    ></div>

    <div class="modal__layer">

      <div class="modal__header">
        <div class="icon-submit-survey"></div>
        <h2
          v-if="titleHtml"
          class="heading"
          v-html="titleHtml"
        ></h2>
        <button
          class="btn-close"
          @click="closeModal"
        ></button>
      </div>

      <div class="modal__content">
        <p
          v-if="reserveTimeHtml"
          class="text-em"
          v-html="reserveTimeHtml"
        ></p>
        <p
          v-if="descriptionHtml"
          class="text-refer"
          v-html="descriptionHtml"
        ></p>

        <div class="checkbox">
          <input
            type="radio"
            id="create-confirm-modal-chk-01"
            name="create-confirm-modal-chk-01"
            :value="false"
            v-model="isSendPush"
          >
          <label for="create-confirm-modal-chk-01"><span>푸시 보내지 않음</span></label>

          <input
            type="radio"
            id="create-confirm-modal-chk-02"
            name="create-confirm-modal-chk-02"
            :value="true"
            v-model="isSendPush"
          >
          <label for="create-confirm-modal-chk-02"><span>푸시 보내기</span></label>
        </div>
      </div>

      <div class="modal__footer">
        <button
          class="hi-btn btn-md btn-line"
          @click="onClickCancel"
        >
          취소
        </button>
        <button
          class="hi-btn btn-md"
          @click="onClickSubmit"
        >
          확인
        </button>
      </div>

    </div>
  </div> -->

</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  name: "survey-create-confirm-modal",
  computed: {
    ...mapState('storeSurvey', {
      surveyCreateConfirmModal: 'surveyCreateConfirmModal'
    }),
    isSendPush: {
      get() {
        return this.surveyCreateConfirmModal.isSendPush
      },
      set(val) {
        this.surveyCreateConfirmModal.isSendPush = val
      }
    },
    titleHtml() {
      return this.surveyCreateConfirmModal.titleHtml
    },
    reserveTimeHtml() {
      return this.surveyCreateConfirmModal.reserveTimeHtml
    },
    descriptionHtml() {
      return this.surveyCreateConfirmModal.descriptionHtml
    },

  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  beforeDestroy() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setSurveyCreateConfirmModal: 'setSurveyCreateConfirmModal'
    }),
    ...mapActions('storeSurvey', {
      closeSurveyCreateConfirmModal: 'closeSurveyCreateConfirmModal',
      doSaveSurvey: 'doSaveSurvey'
    }),
    closeModal() {
      this.closeSurveyCreateConfirmModal()
    },
    onClickCancel() {
      this.closeModal()
    },
    async onClickSubmit() {
      this.$store.commit('setIsDimLoading', true)
      try {
        await this.doSaveSurvey()
        this.$store.commit('setIsDimLoading', false)
      } catch (e) {
        this.$store.commit('setIsDimLoading', false)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.hi-modal-common::v-deep {
  .heading p{
    word-break: keep-all;
    line-height: 1.3;
  }
}
</style>