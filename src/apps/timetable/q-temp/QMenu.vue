<template>
  <div>
    <!-- 메뉴 트리거 -->
    <slot name="trigger" :open="openMenu" />

    <!-- 메뉴 -->
    <div
      v-if="modelValue"
      class="q-menu-backdrop"
      @click.self="closeMenu"
    >
      <div
        class="q-menu"
        :style="menuStyle"
        ref="menu"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QMenu',
  props: {
    value: {
      type: Boolean,
      required: true // v-model을 통해 메뉴의 열림/닫힘 상태를 제어
    },
    anchor: {
      type: String,
      default: 'bottom left' // 메뉴가 열릴 기준 위치
    },
    self: {
      type: String,
      default: 'top left' // 메뉴의 기준 위치
    },
    target: {
      type: [String, HTMLElement],
      required: false, // 메뉴가 열릴 기준이 되는 DOM 요소
      default: null
    },
    persistent: {
      type: Boolean,
      default: false // true일 경우, backdrop 클릭으로 메뉴가 닫히지 않음
    }
  },
  computed: {
    modelValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val); // Vue 2.7에서 v-model은 input 이벤트를 사용
      }
    }
  },
  data() {
    return {
      menuStyle: {} // 메뉴의 위치 스타일
    };
  },
  watch: {
    modelValue(newValue) {
      if (newValue) {
        // console.log('menu opened');
        this.calculatePosition();
        return;
      }
      // console.log('menu closed');
    },
    target() {
      // console.log('target changed:', this.target);
      this.calculatePosition();
    }
  },
  methods: {
    openMenu() {
      this.modelValue = true;
      this.calculatePosition();
    },
    closeMenu() {
      if (!this.persistent) {
        this.modelValue = false;
      }
    },
    calculatePosition() {
      const target = typeof this.target === 'string' ? document.querySelector(this.target) : this.target;

      // console.log('target:', target);
      // console.log('menu:', this.$refs.menu);
      // console.log('menuStyle:', this.menuStyle);

      if (!target || !this.$refs.menu) return;

      const targetRect = target.getBoundingClientRect();
      const menuRect = this.$refs.menu.getBoundingClientRect();

      let top = 0;
      let left = 0;

      // Anchor 기준 위치 계산
      if (this.anchor.includes('bottom')) {
        top = targetRect.bottom;
      } else if (this.anchor.includes('top')) {
        top = targetRect.top;
      }

      if (this.anchor.includes('left')) {
        left = targetRect.left;
      } else if (this.anchor.includes('right')) {
        left = targetRect.right;
      }

      // Self 기준 위치 계산
      if (this.self.includes('top')) {
        top -= menuRect.height;
      } else if (this.self.includes('bottom')) {
        top += 0; // 기본적으로 bottom은 추가 계산이 필요 없음
      }

      if (this.self.includes('left')) {
        left -= menuRect.width;
      } else if (this.self.includes('right')) {
        left += 0; // 기본적으로 right은 추가 계산이 필요 없음
      }

      // 메뉴 스타일 업데이트
      this.menuStyle = {
        top: `${top}px`,
        left: `${left}px`
      };
    },
    handleClickOutside(event) {
      if (
        this.$refs.menu &&
        !this.$refs.menu.contains(event.target) &&
        !this.persistent
      ) {
        this.closeMenu();
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
    window.addEventListener('resize', this.calculatePosition);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('resize', this.calculatePosition);
  }
};
</script>

<style scoped>
.q-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 1000;
}

.q-menu {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  min-width: 200px;
  padding: 8px;
}
</style>