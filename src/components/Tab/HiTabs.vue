<template>
  <div class="hi-tabs">
    <div :class="classList">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :class="{ 
          'is-active': tab.isActive,
          'is-new': tab.isNew,
         }"
         :style="'min-width:' + minWidth + 'px'"
        @click="selectTab(tab)"
      >
      <i :class="`hi-ico ` + tab.ico" v-if="tab.ico"></i>
        {{ tab.label }}
      </button>
    </div>
    <div class="hi-tab-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "HiTabs",
  props: {
    block: { type: Boolean, default: false },
    type: { type: String, default: null },
    size: { type: String, default: null },
    align: { type: String, default: null },
    minWidth: { type: String, default: 'auto' },
  },
  data() {
    return {
      tabs: [],
    };
  },
  methods: {
    addTab(tab) {
      this.tabs.push(tab);
      if (tab.isActive) {
        this.selectTab(tab);
      }
    },
    selectTab(selectedTab) {
      this.tabs.forEach((tab) => {
        tab.isActive = tab === selectedTab;
        if (tab.isActive) this.$emit('setCurTab', tab)
      });
    },
  },
  computed: {
    classList() {
      const className = ["hi-tab"];
      this.type ? className.push(this.type) : null;
      this.size ? className.push(`tab-${this.size}`) : null;
      this.align === 'center' ? className.push('j-center') :
      this.align === 'left' ? null :
      this.align === 'right' ? className.push('j-right') :
      null;
      this.block ? className.push("tab-block") : null;
      return className.join(" ");
    },    
  },
};
</script>
