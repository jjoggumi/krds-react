<template>
  <div class="tip-wrap">
    <button class="tip-header" @click="toggle">
      <slot name="header"></slot>
      <span class="icon" :class="{ open: isOpen }">
        <i class="ico ico-arrow-down ico-size-20" ></i>
      </span>
    </button>

    <transition name="tip-slide">
      <div v-show="isOpen" class="tip-body">
        <slot name="content"></slot>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "TimetableTip",
  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
    }
  }
};
</script>

<style scoped>
.tip-wrap {
  border-radius: 8px;
  background: var(--gray-02);
  margin-bottom: 16px;
}

/* 헤더 */
.tip-header {
  width: 100%;
  padding: 16px 20px;
  border: none;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 15px;
  color: var(--navy);
  font-weight: var(--font-strong);

}

/* 화살표 */
.icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  border-radius: 50px;
  background: #fff;
  transition: 0.3s ease-in-out;
}
.icon.open {
  transform: rotate(180deg);
}

/* 내용 */
.tip-body {
  padding: 0 24px 20px 24px;
}

/* 펼쳐질 때 애니메이션 */
.tip-slide-enter-active,
.tip-slide-leave-active {
  transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.tip-slide-enter,
.tip-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
  padding-bottom: 0;
  border-top-width: 0;
}
.tip-slide-enter-to,
.tip-slide-leave {
  opacity: 1;
  transform: translateY(0);
  max-height: 500px;
  padding-bottom: 20px;
  border-top-width: 1px;
}
</style>
