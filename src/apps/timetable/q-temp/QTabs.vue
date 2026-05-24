<template>
  <div class="q-tabs">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'QTabs',
  props: {
    value: {
      type: String,
      required: true
    }
  },
  provide() {
    return {
      qTabsActive: this.value,
      selectTab: this.selectTab
    }
  },
  watch: {
    value(val) {
      this.qTabsActive = val
    }
  },
  methods: {
    selectTab(name) {
      this.$emit('input', name)
    }
  }
}
</script>

<style scoped>
.q-tabs {
  display: flex;
  border-bottom: 2px solid #ccc;
}
</style>
