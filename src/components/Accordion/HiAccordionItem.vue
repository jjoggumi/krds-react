<template>
  <div class="accordion__item" :class="{ 'accordion__item--open': isOpen }">
    <div
      class="accordion__header"
      :class="{ 'accordion__header--disabled': disabled }"
      role="button"
      :aria-expanded="isOpen.toString()"
      :aria-controls="`accordion-body-${uid}`"
      :tabindex="disabled ? -1 : 0"
      @click="handleToggle"
      @keydown.enter.prevent="handleToggle"
      @keydown.space.prevent="handleToggle"
    >
      <slot name="header" :isOpen="isOpen" />
      <slot name="arrow">
        <span class="accordion__arrow" :class="{ 'accordion__arrow--open': isOpen }"></span>
      </slot>
    </div>
    <transition v-if="accordionAnimate" name="accordion-body">
      <div
        v-show="isOpen"
        :id="`accordion-body-${uid}`"
        class="accordion__body"
        role="region"
      >
        <slot name="content" />
      </div>
    </transition>
    <div
      v-else
      v-show="isOpen"
      :id="`accordion-body-${uid}`"
      class="accordion__body"
      role="region"
    >
      <slot name="content" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'HiAccordionItem',
  inject: {
    accordion: { default: null },
    accordionAnimate: { default: true }
  },
  props: {
    uid: {
      type: [String, Number],
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isOpen() {
      return this.accordion ? this.accordion.isOpen(this.uid) : false;
    }
  },
  mounted() {
    if (!this.accordion) {
      console.warn('[HiAccordionItem] HiAccordion 컨텍스트 없이 사용되었습니다. HiAccordion으로 감싸주세요.');
    }
  },
  methods: {
    handleToggle() {
      if (!this.disabled && this.accordion) {
        this.accordion.toggle(this.uid);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.accordion__item {
  border: 1px solid #bdbdbd;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  background: #fff;

  &--open {
    border-color: #8ea4d1;
  }
}

.accordion__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 19px 15px;
  cursor: pointer;
  background: #fff;

  &--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.accordion__arrow {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  background-image: url('~@/assets/img/svg/ico-arrowdown.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transform: scaleY(1);
  transition: transform 0.2s;

  &--open {
    transform: scaleY(-1);
  }
}

.accordion__body {
  padding: 20px 16px;
  overflow-y: auto;
}

/* 열림/닫힘 애니메이션 */
.accordion-body-enter-active,
.accordion-body-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 1000px;
  opacity: 1;
}

.accordion-body-enter,
.accordion-body-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
