<template>
  <div
    class="q-item"
    :class="classes"
    @click="handleClick"
  >
    <!-- Prepend 슬롯 -->
    <div v-if="$slots.prepend" class="q-item-section q-item-section--prepend">
      <slot name="prepend" />
    </div>

    <!-- Default 슬롯 -->
    <div class="q-item-section q-item-section--main">
      <slot />
    </div>

    <!-- Append 슬롯 -->
    <div v-if="$slots.append" class="q-item-section q-item-section--append">
      <slot name="append" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'QItem',
  props: {
    clickable: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: false
    },
    activeClass: {
      type: String,
      default: 'q-item--active'
    },
    dense: {
      type: Boolean,
      default: false
    },
    inset: {
      type: Boolean,
      default: false
    },
    closePopup: {
      type: Boolean,
      default: false // 클릭 시 팝업을 닫을지 여부
    }
  },
  emits: ['click', 'close-popup'],
  computed: {
    classes() {
      return {
        'q-item--clickable': this.clickable,
        [this.activeClass]: this.active,
        'q-item--dense': this.dense,
        'q-item--inset': this.inset
      };
    }
  },
  methods: {
    handleClick(event) {
      if (this.clickable) {
        this.$emit('click', event);
        if (this.closePopup) {
          this.$emit('close-popup'); // 부모 컴포넌트에서 팝업 닫기 처리
        }
      }
    }
  }
};
</script>

<style scoped>
.q-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: default;
  transition: background-color 0.2s, color 0.2s;
}

.q-item--clickable {
  cursor: pointer;
}

.q-item--clickable:hover {
  background-color: #f5f5f5;
}

.q-item--active {
  background-color: #e0f7fa;
  color: #00796b;
}

.q-item--dense {
  padding: 4px 12px;
}

.q-item--inset {
  padding-left: 32px;
}

.q-item-section {
  flex: 1;
}

.q-item-section--prepend {
  margin-right: 16px;
  flex: 0 0 auto;
}

.q-item-section--append {
  margin-left: 16px;
  flex: 0 0 auto;
}
</style>