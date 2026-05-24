<template>
  <div
    class="modal join-code-modal normal-modal"
    style="display:block"
    v-if="isExisContent"
  >
    <div
      class="modal-cont-wrap"
      ref="modal"
      :style="modalStyleObj"
      v-click-outside="closePopupDialog"
    >
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="icon-title-wrap">
            <!-- <div class="icon-wrap">
              <img src="@/assets/img/icon_school_78.png" alt />
            </div>-->
            <template v-if="isExistTitle">
              <div class="text-wrap">{{ popupDialogObj.title }}</div>
            </template>
            <p v-html="popupDialogObj.contentHtml"></p>
          </div>
          <div class="confirm-btn-wrap">
            <button class="btn-bg-c" @click="closePopupDialog">완료</button>
          </div>
        </div>
        <div
          class="modal-close-btn modal-close-icon"
          @click="closePopupDialog"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainPopupDialog',
  props: {
    popupDialogObj: Object
  },
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
    },
    isExistTitle() {
      if (
        this.popupDialogObj.title !== undefined &&
        this.popupDialogObj.title !== null &&
        this.popupDialogObj.title !== ''
      )
        return true
      else return false
    },
    isExisContent() {
      if (
        this.popupDialogObj.contentHtml !== undefined &&
        this.popupDialogObj.contentHtml !== null &&
        this.popupDialogObj.contentHtml !== ''
      )
        return true
      else return false
    }
  },
  methods: {
    closePopupDialog() {
      const action = false
      this.$emit('closePopupDialog', action)
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

<style scoped></style>
