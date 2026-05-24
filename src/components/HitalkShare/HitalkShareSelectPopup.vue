<template>
  <!-- 2022-06-28 modal : 공유 방식 선택 -->
  <div class="hi-modal-common" id="hitalkShareSelect" style="display: block;" v-if="hitalkShareSelectIsOpen">
    <div class="modal__dim" @click="closeSelectModal"></div>
    <div class="modal__layer">
      <div class="modal__header">
        <h2 class="heading">공유방법을 선택해주세요.</h2>
        <button class="btn-close" @click="closeSelectModal"></button>
      </div>
      <div class="modal__content">
        <div class="area-hitalk-share-select">
          <button class="btn-message is-active" @click="sendPersonalRoom">일괄메시지(1:1대화) 전송</button>
          <button class="btn-notice" @click="sendGroupRoom">단체방 공지로 전송</button>
        </div>
      </div>
      <div class="modal__footer">
        <div class="group-btn">
          <button class="btn-cancel" @click="closeSelectModal">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "hitalk-share-select-popup",
  props: {
    hitalkShareSelectIsOpen: Boolean,
  },
  methods: {
    closeSelectModal() {
      this.$emit('closeSelectModal', false)
    },
    sendPersonalRoom() {
      this.$emit("sendPersonalRoom")
      this.closeSelectModal()
    },
    sendGroupRoom() {
      this.$emit("sendGroupRoom")
      this.closeSelectModal()
    }
  }
}
</script>

<style scoped>

</style>