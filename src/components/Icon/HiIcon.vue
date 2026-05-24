<template>
  <i :class="classList"></i>
</template>
<script>
export default {
  props: {
    name: String,
    size: String,
    color: String,
    bgColor: String,
    rounded: String,
    outline: Boolean,
  },
  computed: {
    classList() {
      const className = ["hi-ico"];
      this.color
        ? className.push(this.outline ? `ico-line-${this.color}` : `ico-${this.color}`)
        : className.push(this.outline ? `ico-line-primary` : null);
      this.bgColor ? className.push(`ico-bg-${this.bgColor}`) : null;
      this.size ? className.push(`ico-size-${this.size}`) : null;
      this.rounded ? className.push(`ico-${this.rounded}`) : null;
      this.name ? className.push(`${this.name}`) : null;
      return className.join(" ");
    },
  },
};
</script>
<style scoped lang="scss"></style>
