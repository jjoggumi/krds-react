<template>
  <div
    class="modal"
    :class="[classList.modal]"
    :name="modalName"
  >
    <div
      v-click-outside="vcoConfig"
      ref="modal"
      class="modal-cont-wrap"
      :class="[classList.modalContWrap]"
      :style="modalStyleObj"
    >
      <div
        class="modal-cont"
        :class="[classList.modalCont]"
      >
        <div class="modal-cont-inner">
          <!-- SLOT : modal-cont-inner -->
          <slot name="modalContInner"></slot>

        </div>

        <slot name="modalClose">
          <div
            class="modal-close-btn modal-close-icon"
            @click="modalClose"
          ></div>
        </slot>

      </div>
    </div>
  </div>

</template>

<script>
export default {
  name: "modal-layout",
  props: {
    modalName: {
      type: String,
    },
    classList: {
      type: Object,
      default() {
        return {}
      }
    },
  },
  data() {
    return {
      m_height: 0,
      m_width: 0,
      vcoConfig: {
        handler: this.handler,
        middleware: this.middleware,
        events: ['click'],
        // Note: The default value is true, but in case you want to activate / deactivate
        //       this directive dynamically use this attribute.
        isActive: true
      },
    }
  },
  computed: {
    modalStyleObj() {
      return {
        "margin-top": -this.m_height + "px",
        "margin-left": -this.m_width + "px"
      };
    },
  },
  mounted() {
    if (this.$refs.modal) {
      const positionObj = this.getModalPosition(this.$refs.modal);
      this.m_height = positionObj.m_height;
      this.m_width = positionObj.m_width;
    }
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    modalClose() {
      this.$emit('modal-close')
    },
    getModalPosition(modal) {
      return {
        m_height: modal.clientHeight / 2,
        m_width: modal.clientWidth / 2
      }
    },
    initModalPosition() {
      const positionObj = this.getModalPosition(this.$refs.modal);
      this.m_height = positionObj.m_height;
      this.m_width = positionObj.m_width;
    },

    /**
     * v-click-outside
     */
    handler() {
      if (this.vcoConfig.isActive) this.modalClose()
    },
    // Note: The middleware will be executed if the event was fired outside the element.
    //       It should have only sync functionality and it should return a boolean to
    //       define if the handler should be fire or not
    middleware(/*event*/) {
      const modals = document.getElementsByClassName('modal')
      const sweetAlerts = document.querySelectorAll('.swal2-container')
      this.vcoConfig.isActive = modals.length < 2 && sweetAlerts.length < 1;

      for (const modal of modals) {
        if (modal.classList.contains('register-temp-student-modal') ||
          modal.classList.contains('guide-register-temp-student-modal')) {
          this.vcoConfig.isActive = false
        }
      }
      this.$log.debug(`middleware this.vcoConfig.isActive => ${this.vcoConfig.isActive}`)
      return this.vcoConfig.isActive
    },
    /**
     * // v-click-outside
     */
  }
}
</script>

<style lang="scss" scoped>
  .modal {
    display: block;
  }
</style>