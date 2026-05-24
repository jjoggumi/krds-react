<template>
  <div class="modal join-code-modal common-modal join-info join-finish" style="display:block">
    <div class="modal-cont-wrap" ref="modal" :style="modalStyleObj">
      <div class="modal-cont">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">클래스 가입 요청</div>
            <p class="desc">가입 신청이 완료되었습니다.<br>선생님의 승인을 기다려주세요.</p>
          </div>

          <div class="join-class-info-wrap">
            <div class="confirm-btn-wrap">
              <button class="btn-bg-c" @click="complete">확인</button>
            </div>
          </div>

          <!-- <div class="btn-wrap">
            <button class="btn-bg-c" @click="complete">완료</button>
          </div> -->
        </div>
        <div class="modal-close-btn modal-close-icon" @click="close"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainSearchJoinComp',
  data: () => ({
    m_height: 0,
    m_width: 0
  }),
  computed: {
    modalStyleObj() {
      return {
        'margin-top': -this.m_height + 'px',
        'margin-left': -this.m_width + 'px'
      }
    }
  },
  methods: {
    close: function() {
      this.$emit('comp-evnt', false)
    },
    complete: function() {
      this.$emit('comp-evnt', false)
      // this.$router.go(-1);
    }
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    const modal = this.$refs.modal
    const positionObj = this.$comn.getModalPosition(modal)
    this.m_height = positionObj.m_height
    this.m_width = positionObj.m_width
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  }
}
</script>

<!-- <style scoped>
.join-code-modal.common-modal .modal-cont-wrap .boundary-box { width:400px; height: 240px; min-height: 240px; }
.common-modal .btn-wrap { bottom: 5px; }

.common-modal .btn-wrap button { width: 280px; height: 44px; border-radius: 24px; font-size: 15px; font-weight: 700; margin: 20px; }
</style> -->
