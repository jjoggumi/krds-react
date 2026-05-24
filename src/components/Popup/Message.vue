<!--
@File(Method): Message.vue
@Author: -
@Date Created: -
@Description: 메세지 모달
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
@ETC : 3년전 수정된 파일로 현재 사용하는지 여부 알수 없음. 
-->
<template>
  <div class="modal common-alert-modal">
    <div
      v-click-outside="close"
      ref="messageModal"
      class="modal-cont-wrap"
     :style="modalStyle"
    >
      <div class="modal-cont boundary-box">
        <!-- alert modal -->
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <p
              v-if="title"
              class="title"
              :inner-html.prop="title"
            ></p>
            <p
              class="text"
              :inner-html.prop="message"
            ></p>
          </div>

          <div
            v-if="isAlertMessage"
            class="btn-wrap no-line"
          >
            <button class="btn-bg-c modal-close-btn" @click="close">{{ $t('main.text.confirm') }}</button>
          </div>

          <div
            v-else-if="isConfirmMessage"
            class="btn-wrap no-line"
          >
            <button
              class="btn-bg-w modal-close-btn"
              @click="close"
            >{{ $t('main.text.cancel') }}
            </button>
            <button
              v-if="action"
              class="btn-bg-c modal-close-btn" @click="doAction"
            >{{ $t('main.text.confirm') }}</button>
          </div>

        </div>

        <!-- // alert modal -->
        <div class="modal-close-btn modal-close-icon" @click="close"></div>
      </div>
    </div>
  </div>
</template>

<script>
import {eventBus} from "@/main";

export default {
  name: "message",
  props: {
    message: String,
    type: String,
    default() {
      return 'alert'
    },
    action: Object,
    title: {
      type: String,
      default() {
        return null
      }
    },
  },
  data() {
    return {
      modalPosition: {}
    }
  },
  computed: {
    modalStyle() {
      if (this.modalPosition.m_height) {
        return {
          'margin-top': -this.modalPosition.m_height + 'px',
          'margin-left': -this.modalPosition.m_width + 'px'
        }
      } else return {}
    },
    isAlertMessage() {
      return this.type === null || this.type === 'alert'
    },
    isConfirmMessage() {
      return this.type === 'confirm'
    },
  },
  mounted() {
    this.modalPosition = this.$comn.getModalPosition(this.$refs.messageModal)
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    close() {
      const popupMessage = {
        isOpen: false,
        message: null,
        type: null,
        action: null
      }
      this.$store.commit('setPopupMessage', popupMessage)
    },
    doAction() {
      if (this.action.type
        && this.action.type === 'eventBus'
        && this.action.event
      ) {
        if (this.action.params)
          eventBus.$emit(this.action.event, this.action.params)
        else
          eventBus.$emit(this.action.event)

        this.close()
      }
    }
  }
}
</script>

<style scoped>
  .modal {
    display: block;
  }
  .modal.common-alert-modal .modal-cont-wrap {padding: 0;}
  .modal.common-alert-modal .modal-cont-wrap .boundary-box {width: 400px;padding: 50px 0 40px;}
  .modal.common-alert-modal .modal-close-icon {position:absolute;top: 16px;right:16px;background-image:url('../../assets/img/icon_modal_close_24.png');} 
  .modal.common-alert-modal .modal-title-wrap .title {font-size: 20px;font-weight:bold;line-height: 1.4;padding: 0 20px;}
  .modal.common-alert-modal .modal-title-wrap .text {font-size: 16px;line-height: 150%;transform: skew(0.2deg);color: #2e2e2e;padding: 0 20px;}
  .modal.common-alert-modal .modal-title-wrap .title + .text {padding-top: 15px;}
  .modal.common-alert-modal .btn-wrap {display: -webkit-box;display: -ms-flexbox;display: flex;-webkit-box-pack: center;-ms-flex-pack: center;justify-content: center;padding: 28px 0 0;border-top: 1px solid #ebebeb;margin-top: 28px;}
  .modal.common-alert-modal .btn-wrap button {width: 180px;height: 36px;border-radius: 18px;font-size: 14px;margin: 0 4px;}
  .modal.common-alert-modal .btn-wrap.no-line {border-top: 0;margin-top: 0;}
</style>