<template>
  <div v-if="isActive">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "HiTab",
  props: {
    label: {
      type: String,
      required: true,
    },
    onActive: {
      type: Boolean,
      default: false,
    },
    onNew: { 
      type: Boolean,
      default: false,
    },
    ico:{
      type: String,
      default: null
    },
    curTab: {
      type: String
    }
  },
  data() {
    return {
      isActive: this.onActive, 
      isNew: this.onNew, 
      isIco: this.ico,
      curTabName: this.curTab
    };
  },
  watch: {
    onActive() {
      this.isActive = this.onActive;
    }
  },
  mounted() {
    this.$parent.addTab(this);
  },
};
</script>
