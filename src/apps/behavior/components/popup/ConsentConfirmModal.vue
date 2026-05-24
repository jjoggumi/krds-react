<template>
  <div class="hi-modal-common modal-flex" style="display: block;">
      <div class="modal__dim"></div>
      <div class="behavior-modal01">
          <div :class="{'behavior-modal-student-alert02' : isDescription, 'behavior-modal-student-alert': !isDescription}">
              <div class="title-wrap">
                  <h2 v-html="getTitle"></h2>
              </div>
              <div v-if="isDescription" class="message-wrap" v-html="getDescription"></div>
              <div class="btn">
                  <button v-if="!isAlert" class="btn01" @click="cancelConfirm">{{ cancelText }}</button>
                  <button class="btn02" :style="confirmColor" @click="submitConfirm">{{ confirmText }}</button>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'consent-confirm-modal',
  props: {
      title: String,
      description: String,
      cancelButtonText: String,
      confirmButtonText: String,
      confirmButtonColor: String,
      isAlert: {
          type: Boolean,
          default: false
      }
  },
  computed: {
      cancelText: function() {
          return this.cancelButtonText ? this.cancelButtonText : '취소'
      },
      confirmText: function() {
          return this.confirmButtonText ? this.confirmButtonText : '확인'
      },
      confirmColor: function() {
          return this.confirmButtonColor ? `background: ${this.confirmButtonColor};` : ''
      },
      getTitle: function() {
          return this.title.replace(/(?:\r\n|\r|\n)/g, '<br />')
      },
      getDescription: function() {
          return this.description.replace(/(?:\r\n|\r|\n)/g, '<br />')
      },
      isDescription: function() {
          return this.description ? true : false
      }
  },
  methods: {
      submitConfirm: function () {
          this.$emit("closeConfirmDialog", true)
      },
      cancelConfirm: function () {
          this.$emit("closeConfirmDialog", false)
      }
  }
}

</script>

<style scoped>
.behavior-modal-student-alert02 {
    width: 400px;
}
</style>