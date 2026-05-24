<template>
  <div class="q-btn-dropdown">
    <!-- 버튼 -->
    <button
      class="q-btn-dropdown__button"
      @click="toggleDropdown"
    >
      <span>{{ label }}</span>
      <span class="q-btn-dropdown__icon">▼</span>
    </button>

    <!-- 드롭다운 메뉴 -->
    <div
      v-if="isOpen"
      class="q-btn-dropdown__menu"
    >
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'QBtnDropdown',
  props: {
    label: {
      type: String,
      default: ''
    },
    flat: {
      type: Boolean,
      default: false
    },
    unelevated: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: ''
    },
    textColor: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      isOpen: false
    };
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    }
  }
};
</script>

<style scoped>
.q-btn-dropdown {
  position: relative;
  display: inline-block;
}

.q-btn-dropdown__button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: var(--q-btn-bg, #f5f5f5);
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.q-btn-dropdown__button:hover {
  background-color: #e0e0e0;
}

.q-btn-dropdown__icon {
  margin-left: 8px;
}

.q-btn-dropdown__menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 100%;
}
</style>