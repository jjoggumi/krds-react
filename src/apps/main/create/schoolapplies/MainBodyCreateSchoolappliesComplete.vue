<template>
  <div class="modal join-code-modal normal-modal" style="display:block">
    <div class="modal-cont-wrap" ref="modal" :style="modalStyleObj">
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="icon-title-wrap">
            <div class="icon-wrap">
              <img src="@/assets/img/icon_school_78.png" alt />
            </div>
            <div class="text-wrap">신규학교 추가 신청</div>
            <p>
              신규학교 추가 신청이 완료되었습니다.
              <br />신규학교가 추가되면 알림 메시지로 안내드리겠습니다.
            </p>
          </div>
          <div class="confirm-btn-wrap">
            <button class="btn-bg-c" @click="close">완료</button>
          </div>
        </div>
        <div class="modal-close-btn modal-close-icon" @click="close"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'mainBodyCreateSchoolappliesComplete',
  data: () => ({
    m_height: 0,
    m_width: 0
  }),
  computed: {
    modalStyleObj() {
      const styleObj = {
        'margin-top': -this.m_height + 'px',
        'margin-left': -this.m_width + 'px'
      }
      return styleObj
    }
  },
  methods: {
    close() {
      this.$parent.isMainBodyCreateSchoolappliesComplete = false
      // this.$parent.init();
      this.$router.push('/main', () => {})
    }
  },
  created() {},
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
