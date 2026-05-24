<template>
<div class="select-all-checker">
  <input ref="checkbox" type="checkbox" :id="selectorId" @change="onChange" :disabled="disabled" :checked="allSelected" />
  <label :for="selectorId" style="user-select: none;">
    <slot>
      <span>전체 선택</span>
    </slot>
  </label>
</div>
</template>

<script>
export default {
  name: 'SelectAllChecker',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    isAllSelected: {
      type: Function,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    beforeChange: {
      type: Function,
      default: () => () => true
    }
  },
  computed: {
    allSelected: {
      get() {
        return this.disabled ? false : this.isAllSelected == null
          ? this.value.length > 0 && this.value.every(i => i.selected)
          : this.isAllSelected()
      },
      set(v) {
        this.$emit('input', {value: v, targets: this.value.map(i => ({ ...i, selected: v }))})
      }
    },
    selectorId() {
      return `select-all-${this.randomId}`
    }
  },
  data: () => ({
    randomId: Math.random().toString(36)
  }),
  methods: {
    async onChange(event) {
      if (event.target.checked) {
        if (!(await this.beforeChange())) {
          event.target.checked = false
          return
        }
        this.allSelected = true
      } else {
        this.allSelected = false
      }
    }
  }
}
</script>

<style scoped>
.select-all-checker {
  display: inline-block
}
</style>