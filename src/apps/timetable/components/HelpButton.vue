<template>
  <button
    type="button"
    class="btn btn-link btn-help"
    :class="[{ 'help-on': active }, { 'help-text': hasSlot } ]"
    @click.stop="handleClick"
    :aria-pressed="active ? 'true' : 'false'"
    :aria-label="computedAriaLabel"
  >
    <slot>
      <span class="sr-only">도움말</span>
    </slot>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'HelpButton',
  props: {
    id: { type: String, required: true },
    active: { type: Boolean, required: true }
  },
  inject: {
    openHelp: { from: 'openHelp', default: null },
    closeHelp: { from: 'closeHelp', default: null },
    deactivateHelp: { from: 'deactivateHelp', default: null }
  },
  mounted() {
    document.addEventListener('click', this.handleDocumentClick as EventListener)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleDocumentClick as EventListener)
  },
  methods: {
    handleClick(): void {
      if (this.active) return
      const openHelp = (this as any).openHelp as null | ((id: string) => void)
      openHelp && openHelp(this.id)
    },
    handleDocumentClick(e: MouseEvent): void {
      if (!this.active) return

      const el = this.$el as HTMLElement;

      const panelEl = document.querySelector('.help-panel') as HTMLElement; 
      if (panelEl && panelEl.contains(e.target as Node)) return; 

      if (el && el.contains(e.target as Node)) return

      const deactivate = (this as any).deactivateHelp as null | ((id: string) => void)
      if (deactivate) {
        deactivate(this.id)
      } else {
        const closeHelp = (this as any).closeHelp as null | (() => void)
        closeHelp && closeHelp()
      }
    }
  }
  ,computed: {
    hasSlot(): boolean {
      return !!this.$slots.default;
    },
    computedAriaLabel(): string {
      if (this.hasSlot) {
        const node = this.$slots.default && this.$slots.default[0];
        const txt = (node && (node.text || (node.children && node.children[0] && node.children[0].text))) || '도움말';
        return txt.trim() || '도움말';
      }
      return '도움말';
    }
  }
})
</script>

<style scoped lang="scss">
.btn-help.help-text {
  width: auto;
  height: auto;
  padding: 0 4px;
  line-height: 1.4;
  font-size: 13px;
  font-weight: 600;
  text-decoration: underline;
  box-shadow: none !important;
  &::after {
    display: none;
  }
}
</style>
