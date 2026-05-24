<template>
  <div
    class="confirmModal modal normal-modal note-notice-modal note-notice-comfirm-modal"
    style="display: block"
  >
    <div class="modal-cont-wrap" ref="confirmModal" :style="modalStyle">
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title" v-html="modalTitle"></div>
            <p>{{ modalContent }}</p>
          </div>
          <div class="btn-wrap">
            <div class="btn-group">
              <button
                class="btn-bg-w2 modal-close-btn"
                @click="$emit('closeModal')"
              >
                {{ cancelButtonLabel }}
              </button>
              <button
                v-if="isConfirmModal"
                class="btn-bg-c"
                @click="onClickConfirm"
              >
                {{ confirmButtonLabel }}
              </button>
            </div>
          </div>
        </div>
        <div
          class="modal-close-btn modal-close-icon"
          @click="$emit('closeModal')"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'note-board-common-modal',
  props: {
    option: {
      type: Object
    },
    model: {
      type: Object,
      required: true
    },
    isSendComplete: {
      type: Boolean,
      required: true
    },
    isReserve: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      modalPosition: {}
    }
  },
  computed: {
    cancelButtonLabel() {
      return this.isAlertModal ? '확인' : '취소'
    },
    confirmButtonLabel() {
      return '확인'
    },
    modalStyle() {
      if (this.modalPosition.m_height) {
        return {
          'margin-top': -this.modalPosition.m_height + 'px',
          'margin-left': -this.modalPosition.m_width + 'px'
        }
      } else return {}
    },
    modalTitle() {
      return this.option.modalTitle
    },
    modalContent() {
      return ''
    },
    modalMode() {
      return this.option.modalMode
    },
    isAlertModal() {
      return this.option.modalMode === 'alert'
    },
    isConfirmModal() {
      return this.option.modalMode === 'confirm'
    }
  },
  mounted() {
    this.modalPosition = this.$comn.getModalPosition(this.$refs.confirmModal)
  },
  beforeDestroy() {
    this.option.modalTitle = ''
    this.option.modalMode = ''
  },
  methods: {
    onClickConfirm() {
      let params = {
        posted: this.$moment().valueOf(),
        postStatus: 'TEMPORARY'
      }
      this.setModel(params)

      this.$emit('setPost', 'TEMPORARY')
      this.$emit('closeModal')
    },
    setModel(params) {
      for (const [key, value] of Object.entries(params)) {
        this.model[key] = value
      }
    }
  }
}
</script>

<style scoped></style>
