<template>
  <div class="hi-modal-common modal-message" id="modal01" style="display: block; z-index: 99999">
    <div class="modal__dim" @click="closeInitAnswerConfirmModal"></div>
    <div class="modal__layer">
      <div class="modal__header">
        <h2 class="heading">응답을 초기화 하시겠습니까?</h2>
        <button class="btn-close" @click="closeInitAnswerConfirmModal"></button>
      </div>
      <div class="modal__content">
        <p class="desc">응답자가 처음부터 다시 설문이 가능합니다.<br>단, 이전 응답내역은 삭제되어 복원이 불가능합니다.</p>
      </div>
      <div class="modal__footer">
        <button class="hi-btn btn-md btn-line" @click="closeInitAnswerConfirmModal">취소</button>
        <button class="hi-btn btn-md" @click="initAnswer">확인</button>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";

export default {
  name: "init-answer-confirm-modal",
  computed: {
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport'
    })
  },
  methods: {
    ...mapActions('storeSurvey', {
      closeInitAnswerConfirmModal: 'closeInitAnswerConfirmModal',
      deleteRespondent: 'deleteRespondent',
    }),
    initAnswer() {
      this.deleteRespondent({respondentId: this.surveyReport.respondent.initAnswerRespondent})
    }
  }
}
</script>

<style scoped>

</style>