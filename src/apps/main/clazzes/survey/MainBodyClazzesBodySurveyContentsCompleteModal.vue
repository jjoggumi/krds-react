<template>
  <!-- modal : 응답내역 선택 -->
  <div class="hi-modal-common modal-select-target" style="display: block; z-index: 10000">
    <div class="modal__dim"></div>
    <div class="modal__layer">
      <div class="modal__header">
        <h2 class="heading">응답내역을 선택해주세요.</h2>
        <button class="btn-close" @click="onClose('close')"></button>
      </div>
      <div class="modal__content">
        <div class="select-target__list">
          <div class="select-target__item" v-for="(item, index) in respondentList" :key="`list_${index}`">
            <input type="radio" :id="`nn${index}`" name="r" @click="onClickList(item)">
            <label :for="`nn${index}`">
              <span class="image"><img
                :src="item.userPhoto" alt=""></span>
              <span class="text">
              <span class="name">{{ respondentNameHtml(item) }}</span>
              <span class="info">{{ item.className }}</span>
            </span>
            </label>
          </div>
        </div>
        <button class="hi-btn btn-lg" :disabled="disabled" @click="onClose('submit')">선택 완료</button>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";
import {isEmpty} from "lodash";

export default {
  name: "MainBodyClazzesBodySurveyContentsCompleteModal",
  props: {
    respondentList: {
      type: Array
    }
  },
  data() {
    return {
      item: {},
      disabled: true
    }
  },
  watch: {
    item(v) {
      this.disabled = isEmpty(v)
    }
  },
  methods: {
    onClickList(item) {
      this.item = item
    },
    onClose(type) {
      if(type === 'submit') {
        this.$emit('onClose', this.item)
      } else {
        this.$emit('onClose', null)
      }
    },
    respondentNameHtml(item) {
      let html = `${item.respondentName}`
      const type = item.userType === 'PARENTS' ? '학부모' :
        item.userType === 'TEACHER' ? '선생님' :
          item.userType === 'STUDENT' ? '학생' : null

      if (item.userType === 'TEACHER') {
        html = `${html} ${type}`
        if (item.subjectName) {
          html = `${html} (${item.subjectName})`
        }
      } else {
        html = `${item.subjectName} ${type ? type : ''} (${item.respondentName})`
      }
      return html
    },
  }
}
</script>