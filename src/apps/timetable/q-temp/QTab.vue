<template>
  <div
    class="q-tab"
    :class="{ active: isActive }"
    @click="onClick"
  >
    {{ label }}
  </div>
</template>

<script>
export default {
  name: 'QTab',
  inject: ['qTabsActive', 'selectTab'],
  props: {
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  computed: {
    isActive() {
      return this.name === this.qTabsActive
    }
  },
  methods: {
    onClick() {
      this.selectTab(this.name)
    }
  }
}
</script>

<style scoped>
.q-tab {
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;
}

.q-tab:hover {
  background-color: #f5f5f5;
}

.q-tab.active {
  border-bottom: 2px solid #1976d2;
  color: #1976d2;
}
</style>
