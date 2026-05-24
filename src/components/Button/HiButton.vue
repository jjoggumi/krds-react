<template>
  <button :class="classList" :style="[styleList]" @click="(e) => { e.stopPropagation(); $emit('click') }" :disabled="disabled">
    <slot></slot>
  </button>
</template>
<script>
export default {
  name: "HiButton",
  props: {
    color: String,
    outline: Boolean,
    bitrounded: Boolean,
    square: Boolean,
    size: String,
    padding: Number,
    width: Number,
    block: Boolean,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    classList() {
      const className = ["hi-btn"];
      this.color ? className.push(this.outline ? `btn-line-${this.color}` : `btn-${this.color}`) : null;
      this.bitrounded ? className.push("btn-bitrounded") : null;
      this.square ? className.push("btn-square") : null;
      this.size ? className.push(`btn-${this.size}`) : null;
      this.block ? className.push("btn-block") : null;
      return className.join(" ");
    },
    styleList() {
      const styles = [];
      this.padding ? styles.push(`padding: 0 ${this.paddingVertical / 10}rem`) : null;
      this.width ? styles.push(`width: ${this.width / 10}rem`) : null;
      return styles.join("; ");
    },
  },
};
</script>

<style lang="scss"></style>
