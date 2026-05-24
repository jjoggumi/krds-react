<template>
  <button
    class="custom-btn"
    :class="[
      flat ? 'btn--flat' : '',
      unelevated ? 'btn--unelevated' : '',
      round ? 'btn--round' : '',
      disabled ? 'disabled' : '',
      ...colorClasses,
      $attrs.class
    ]"
    :style="$attrs.style"
    v-on="$listeners"
  >
    <slot>
      {{ label }}
    </slot>
  </button>
</template>

<script>

export default {
  name: 'QBtn',
  inheritAttrs: false,
  props: {
    label: {
      type: String,
      default: ''
    },
    color: {
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
    round: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    colorClasses() {
      if (!this.color) return [];

      return this.color.split(' ').map(cls => `${cls}`);
    }
  }
}
</script>

<style >
.custom-btn {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 8px 16px;
  font-size: 14px;
  transition: background-color 0.2s, box-shadow 0.2s;
  background-color: #1976d2;
  color: white;
}

.custom-btn:hover {
  opacity: 0.9;
}

/* Flat: no bg */
.btn--flat {
  background-color: transparent !important;
  box-shadow: none !important;
  color: inherit;
}

/* Unelevated: no shadow */
.btn--unelevated {
  box-shadow: none !important;
}

/* Round shape */
.btn--round {
  border-radius: 50%;
  padding: 12px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

/* Disabled state */
.disabled {
  background-color: #e0e0e0 !important;
  color: #b0b0b0 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
}

</style>
