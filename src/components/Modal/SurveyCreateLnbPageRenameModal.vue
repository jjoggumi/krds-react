<template>
  <div class="hi-modal-common modal-message">
    <div class="modal__dim"></div>

    <div class="modal__layer">
      <div class="modal__header">
        <h2 class="heading">페이지명 변경</h2>
        <button
          class="btn-close"
          @click="closeModal"
        ></button>
      </div>
      <div class="modal__content">
        <div class="inputbox">
          <input
            ref="pageName"
            type="text"
            placeholder="페이지명 입력"
            maxlength="10"
            v-model="model.pageName"
          >
        </div>
      </div>
      <div class="modal__footer">
        <button
          class="hi-btn btn-md btn-line"
          @click="closeModal"
        >
          취소
        </button>
        <button
          class="hi-btn btn-md"
          @click="submit"
        >
          저장
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";

export default {
  name: "survey-create-lnb-page-rename-modal",
  data() {
    return {
      model: {
        pageId: null,
        pageName: null
      }
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyCreateLnbPageRenameModal: 'surveyCreateLnbPageRenameModal',
    }),
  },
  watch: {
    $route() {
      this.closeSurveyCreateLnbPageRenameModal()
    }
  },
  mounted() {
    Object.entries(this.surveyCreateLnbPageRenameModal).forEach(([key, value]) => {
      if (Object.keys(this.model).includes(key)) {
        this.model[key] = value
      }
    })
    this.$nextTick(() => {
      if (this.$refs.pageName) {
        this.$refs.pageName.focus()
      }
    })
  },
  methods: {
    ...mapActions('storeSurvey', {
      renameSurveyEditPage: 'renameSurveyEditPage',
      closeSurveyCreateLnbPageRenameModal: 'closeSurveyCreateLnbPageRenameModal'
    }),
    closeModal() {
      this.closeSurveyCreateLnbPageRenameModal()
    },
    async submit() {
      this.$store.state.isLoading = true
      const payload = {
        pageId: this.model.pageId,
        pageName: this.model.pageName
      }
      try {
        await this.renameSurveyEditPage(payload)
        // 정상 처리 시 콜백함수 실행 ( 페이지 목록 갱신 )
        await this.surveyCreateLnbPageRenameModal.submitCallback()

        this.$store.state.isLoading = false
        this.closeModal()
      } catch (e) {
        this.$log.error(e)
        this.$hiClass.alert('페이지명 변경이 정상 처리되지 않았습니다.', 'warning')
        this.$store.state.isLoading = false
      }
    },
  }
}
</script>

<style scoped>
.hi-modal-common.modal-message {
  display: block;
}
</style>