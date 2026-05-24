<template>
  <div class="infinite-scroll-container" @scroll="handleScroll">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'InfiniteScrollContainer',
  props: {
    bottomPadding: {
      type: Number,
      default: 10
    }
  },
  methods: {
    handleScroll(event) {
      const container = event.target;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      if (scrollTop === 0) {
        this.$emit('scroll-top');
      } else if (scrollTop + clientHeight + this.bottomPadding >= scrollHeight) {
        this.$emit('scroll-bottom');
      }
    },
    minimizeHeight() {
      const childMax = Math.max(...[...this.$el.childNodes].map(e => e.offsetTop + e.offsetHeight))
      this.$el.style.height = Math.min(
        this.$el.parentElement.clientHeight,
        childMax
      ) + 'px'
    },
    maximizeHeight() {
      this.$el.style.height = this.$el.parentElement.clientHeight
    }
  }
}
</script>

<style scoped>
.infinite-scroll-container {
  overflow-y: auto;
}
</style>