<template>
  <!-- POPUP 약관 동의 체크 -->
  <div class="modal event-agreement-modal common-modal">
    <div
      ref="modal"
      class="modal-cont-wrap"
      :style="modalStyleObj"
    >
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">이벤트 참여를 위해<br>아래 약관에 동의 해주세요.</div>
          </div>

          <div class="checkbox-wrap">
            <input type="checkbox" id="check1" :value="curPostTerms.postId" v-model="checkbox.terms">
            <label for="check1"><span>{{ termsTitle }}</span></label>
            <button @click="openDetail">보기</button>
          </div>
          <div class="btn-wrap">
            <button
              class="btn-bg-c"
              :class="{
                dis: !isReadySubmit
              }"
              :disabled="!isReadySubmit"
              @click="onClickSubmit"
            >동의하고 이벤트 참여하기</button>
          </div>
        </div>
        <div class="modal-close-btn modal-close-icon" @click="closeTerms"></div>
      </div>
    </div>
  </div>

</template>

<script>
import {mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";

export default {
  name: "post-terms",
  data() {
    return {
      m_height: 0,
      m_width: 0,
      checkbox: {
        terms: []
      }
    }
  },
  computed: {
    ...mapState({
      acceptedTermsPostIdList: 'acceptedTermsPostIdList',
      curPostTerms: 'curPostTerms',
    }),
    isReadySubmit() {
      return this.checkbox.terms.length > 0
    },
    modalStyleObj() {
      return {
        'margin-top': -this.m_height + 'px',
        'margin-left': -this.m_width + 'px'
      }
    },
    termsTitle() {
      return this.curPostTerms.postOptions.find(o => o.name === 'termsTitle').value || ''
    },
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    const modal = this.$refs.modal
    const positionObj = this.$comn.getModalPosition(modal)
    this.m_height = positionObj.m_height
    this.m_width = positionObj.m_width
  },
  methods: {
    ...mapMutations({
      setAcceptedTermsPostIdList: 'setAcceptedTermsPostIdList',
      setCurPostTerms: 'setCurPostTerms',
    }),
    closeTerms() {
      const payload = {
        isOpen: false,
        postId: null,
        postOptions: []
      }
      this.setCurPostTerms(payload)
    },
    openDetail() {
      const payload = { isOpenDetail: true }
      this.setCurPostTerms(payload)
    },
    onClickSubmit() {
      // TODO: 약관 동의 여부 임시 저장
      const postId = this.curPostTerms.postId
      const list = this.acceptedTermsPostIdList
      list.push(postId)
      this.setAcceptedTermsPostIdList(list)

      // TODO: 약관 동의한 댓글 자동 작성
      this.$nextTick(() => {
        eventBus.$emit(`set-comment-by-post-id|${postId}`)

        // TODO: 약관 동의 팝업 닫기
        this.closeTerms()
      })
    },
  }
}
</script>

<style scoped>
.modal {
  display: block;
}
</style>