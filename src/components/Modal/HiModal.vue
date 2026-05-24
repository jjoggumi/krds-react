<!--
@File(Method): HiModal.vue
@Author: 김은영
@Date Created: 2024-11-25
@Description: 모달 컴포넌트
@Modify : #71970 출결알리기 > 학반(태그) 추가 -  dim 클릭시 모달 해제 케이스 추가
-->
<template>
  <div :class="classList" style="display: block">
    <div class="modal__dim " @click="dimClose && closeModal()"></div>
    <div class="modal__layer" :style="modalLayerStyle">
      <div class="modal__header">
        <h2 class="heading" v-if="$scopedSlots['heading']"><slot name="heading"></slot></h2>
        <button class="btn-close" @click="closeModal"></button>
      </div>
      <div class="modal__content" :class="$scopedSlots['content'] ? null : 'n'"> <!-- content slot 이 없을때 n 클래스(기존에 사용하던 class)를 추가하여 공백 제거 -->
        <slot name="content"></slot>
      </div>
      <template v-if="$scopedSlots['footer']">
        <div class="modal__footer">
          <slot name="footer"></slot>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "HiModal",
  props: {
    type: { type: String, default: null },
    size: { type: String, default: null },
    titleLine: { type: Boolean, default: false },
    closeSkip: { type: Boolean, default: false },
    modalLayerStyle: { type: Object, default: () => ({}) },
    dimClose: { type: Boolean, default: false }
  },
  data() {
    return {};
  },
  computed: {
    classList() {
      const className = ["hi-modal-common"];
      this.type === 'type01' ? className.push(`modal-message`) : 
      this.type === 'main' ? className.push(`main-popup`) : // 메인페이지에서 사용하는 모달타입 추가
      this.type ===  null ? null : 
      className.push(`modal-${this.type}`) ;
      this.size ? className.push(`modal-${this.size}`) : null;
      this.titleLine ? className.push("title-line") : null;
      this.closeSkip ? className.push("title-close-skip") : null;
      return className.join(" ");
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
      if (this.type !== 'main') {
        this.updateBodyClass();
      }
    },
    updateBodyClass() {
      const modalElements = document.querySelectorAll('.hi-modal-common, .modal');
        // HiModal 를 사용하지 않는 일반 모달(.modal)을 포함하기위한 선택자 추가
      if (modalElements.length > 0) {
        // 하나 이상의 'hi-modal-common'이 있는 경우에만 'hidden' 클래스를 추가
        document.body.classList.add('hidden');
      } else {
        // 'hi-modal-common' 클래스가 더 이상 없다면 'hidden' 클래스를 제거
        document.body.classList.remove('hidden');
      }
    }
  },
  mounted() {
    if (this.type !== 'main') {
      this.updateBodyClass(); // 모달이 열릴 때 'hidden' 클래스 적용
    }
  },
  beforeDestroy() {    
    if (this.type !== 'main') {
      this.updateBodyClass(); // 모달이 닫힐 때 'hidden' 클래스 제거
    }
  }
};
</script>
