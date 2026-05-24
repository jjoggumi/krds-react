<template>
  <div class="hi-modal-common modal-flex" style="display: block;">
      <div class="modal__dim"></div>
      <div class="behavior-modal01">
          <div class='behavior-modal-student-alert03'>
              <div class="title-wrap">
                  <h2 v-html="getTitle"></h2>
              </div>
              <div v-if="isDescription" class="message-wrap" v-html="getDescription"></div>
              <div v-if="classes.length > 0" class="modify-box-wrap">
                <div class="checkbox-wrap">                
                    <template v-for="(clazz, i) of classes">
                       <div class="checkbox">
                            <input 
                            type="radio" 
                            :id="`class-${i}`" 
                            :name="`class-${i}`" 
                            :value="clazz.classSeq" 
                            v-model="selectedClassSeq" 
                            :key="`clazz-${i}-input`"
                            >
                            <label :for="`class-${i}`" :key="`clazz-${i}-label`"><span>{{ clazz.className }}</span></label>
                        </div>
                    </template>
                </div>
              </div>
              <div class="btn">
                  <button v-if="!isAlert" class="btn01" @click="cancelConfirm">{{ cancelText }}</button>
                  <button :disabled="!selectedClassSeq" class="btn02" :class="{on: selectedClassSeq !== null}" @click="submitConfirm">{{ confirmText }}</button>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'iscream-class-confirm-modal',
  props: {
      title: String,
      description: String,
      cancelButtonText: String,
      confirmButtonText: String,
      confirmButtonColor: String,
      isAlert: {
          type: Boolean,
          default: false
      },
      classes: Array
  },
  data() {
    return {
      selectedClassSeq: null
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
          this.$emit("closeConfirmDialog", {result: true, selectedClassSeq: this.selectedClassSeq})
      },
      cancelConfirm: function () {
          this.$emit("closeConfirmDialog", {result: false})
      },
      updateSelectedClassSeq(classSeq) {
        this.selectedClassSeq = classSeq;
      }
  }
}

</script>

<style>
</style>