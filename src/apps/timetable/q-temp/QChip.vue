<template>
  <div
    class="custom-chip"
    :class="colorClass"
    :style="$attrs.style"
  >
    <slot>
      {{ label }}
    </slot>
    <button
      v-if="removable"
      class="close-btn"
      @click="$emit('remove')"
      aria-label="Remove"
    >
      &times;
    </button>
  </div>
</template>

<script>
export default {
  name: 'QChip',
  inheritAttrs: false,
  props: {
    label: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: 'grey'
    },
    removable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    colorClass() {
      return `bg-${this.color}`;
    }
  }
}
</script>

<style scoped>
.custom-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 16px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  margin-left: 8px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

</style>
