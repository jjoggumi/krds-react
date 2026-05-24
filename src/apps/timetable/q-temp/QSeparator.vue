<template>
  <div
    :class="separatorClasses"
    :style="separatorStyle"
    role="separator"
    aria-orientation="horizontal"
  ></div>
</template>

<script>
export default {
  name: 'QSeparator',
  props: {
    vertical: {
      type: Boolean,
      default: false
    },
    inset: {
      type: Boolean,
      default: false
    },
    spaced: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: '1px' // Default thickness of the separator
    }
  },
  computed: {
    separatorClasses() {
      return {
        'q-separator': true,
        'q-separator--vertical': this.vertical,
        'q-separator--horizontal': !this.vertical,
        'q-separator--inset': this.inset,
        'q-separator--spaced': this.spaced,
        [`bg-${this.color}`]: this.color
      };
    },
    separatorStyle() {
      return {
        width: this.vertical ? this.size : '100%',
        height: this.vertical ? '100%' : this.size
      };
    }
  }
};
</script>

<style scoped>
.q-separator {
  background-color: #e0e0e0;
  flex-shrink: 0;
}

.q-separator--horizontal {
  width: 100%;
  height: 1px;
}

.q-separator--vertical {
  width: 1px;
  height: 100%;
}

.q-separator--inset {
  margin-left: 16px;
  margin-right: 16px;
}

.q-separator--spaced {
  margin-top: 8px;
  margin-bottom: 8px;
}
</style>