<!--
@File(Method): HiSelectBox.vue
@Author: 김은영
@Date Created: 2024-10-17
@Description: 셀렉트박스 컴포넌트
@Modified: 2025-05-15 : readonly 속성 추가
-->
<template>
  <div
    v-click-outside="closeSelectBox"
    class="hi-selectbox"
    :class="{
      'is-opened': isOpen,
      //'time': this.selectBoxType === 'time'
      [selectBoxType]: selectBoxType,
    }"
  >
    <button class="selected" :class="{ 'default': value === null, 'readonly' : readonly === true }" :disabled="disabled"  @click="toggleSelectBox">
      <template v-if="$scopedSlots['btnType']">
        <slot name="btnType" :value="value"></slot>
      </template>
      <template v-else>
        <slot name="selected" :value="value"></slot>
        {{ getValueTitle(value) }}
      </template>
    </button>

    <div v-if="isOpen" class="option__layer" style="display: block">
      <template v-if="$scopedSlots['custom-option']">
        <slot name="custom-option" :items="dividedItems" :value="value" :select-item="selectItem"></slot>
      </template>
      <template v-else>
        <button
          v-if="isUseAll"
          class="option"
          @click="selectAll"
        >
        {{ emptyTitle }}
        </button>
        <button
          v-for="item of dividedItems"
          :key="item.value"
          :ref="`hi-select-box-${item.value}`"
          class="option"
          :class="{
            'is-selected': item.value === value
          }"
          @click="selectItem(item)"
        >
          <slot name="list" :item="item"></slot>
          {{ item.title }}
          <span v-if='item.description' v-html="item.description"></span>
        </button>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "hi-select-box",
  props: {
    value: {
      type: [String, Number, Array, Boolean],
    },
    defaultValue: {
      type: [String, Number, Array],
    },
    items: {
      type: Array
    },
    divide: {
      type: Number
    },    
    isUseAll: {
      type: Boolean,
      default() {
        return false
      }
    },
    selectBoxType: {
      type: String
    },
    disabled: {
      type: Boolean
    },
    readonly: {
      type: Boolean
    },
    emptyTitle: {
      type: String
    },
    clickInjector: {
      type: Function,
      default: () => true
    },
    disableClose: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isOpen: false
    }
  },
  computed: {
    dividedItems() {
      return this.divide
        ? this.items.filter(item => parseInt(item.value, 10) % this.divide === 0)
        : this.items
    }
  },
  watch: {
    isOpen(val) {
      if (val) {
        const ref = `hi-select-box-${this.value}`
        this.doFocus(ref)
        this.$emit('open')
      }
    }
  },
  mounted() {
    if (!this.value && this.defaultValue) {
      this.$emit('update:value', this.defaultValue)
    }
  },
  methods: {
    // MemberSearch.vue 에서 사용
    close() {
      this.isOpen = false;
    },
    closeSelectBox(event) {
      if (this.disableClose) return
      if (this.isOpen) {
        this.close();
        if (event) {
          event.preventDefault();
        }
        this.$emit("clickOutside");
      }
    },
    async toggleSelectBox(event) {
      if (!await this.clickInjector()) return;
      this.isOpen = !this.isOpen;
      if (event) {
        event.preventDefault();
      }
      if (!this.isOpen) {
        this.$emit("clickOutside");
      } else {
        this.$emit('openSelectBox');
      }
    },
    getValueTitle(val) {
      const foundItem = this.dividedItems.find(item => item.value === val)
      return foundItem
        ? foundItem.title
        : (this.emptyTitle || '선택해주세요.')
    },
    selectItem(item) {
      this.$emit('update:value', item.value)
      this.closeSelectBox()
    },
    selectAll() {
      this.$emit('update:value', null)
      this.closeSelectBox()
    },
    doFocus(ref) {
      this.$nextTick(() => {
        if (this.$refs[ref] && this.$refs[ref][0]) {
          this.$refs[ref][0].focus()
        }
      })
    }
  }
}
</script>

<style scoped>

</style>