<!--
@File(Method): AutocompleteInput.vue -> AutocompleteInputWithValue.vue
@Description: input 자동완성
@Modified: 2025-05-27
@Variation: 단순 텍스트만이 아닌 value도 관리
-->
<template>
  <div class="autocomplete-wrap">
    <div class="input-wrap">
      <input v-if="!value"
        ref="inputField"
        type="text"
        :value="keyword"
        @input="updateValue"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        :placeholder="placeholder"
        class="clickable"
        :class="{ 'error': isError, [size]: size }"
        :readonly="readonly"
        :disabled="disabled"
        spellcheck="false"      
      />
      <div v-else class="text-box-wrap">
        <div class="text-box" :class="{ 'txt-warning': isError }">
          {{ value }}
          <button @mousedown.prevent="handleRemoveValue" class="del-btn btn btn-ghost">
            <HiIcon name="ico-close" color="gray" size="14"/>
          </button>
        </div>
      </div>
    </div>
    <div v-if="showList"  class="autocomplete-list custom-scr">
      <template 
        v-for="item in filteredItems"
      >
        <div
          :key="`item-${item.value}`"
          @mousedown.prevent="selectItem(item)"
          v-if="!item.options?.disabled"
          class="item" :class="{ 'disabled-class': item.options?.disabled, 'clickable': !item.options?.disabled }"
        >
          {{ item.text }}
        </div>
      </template>
      <div v-if="filteredItems.length === 0" class="hi-nodata sm">
        <p>{{ nodata }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { size } from 'lodash';

export default {
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '항목 입력'
    },
    nodata: {
      type: String,
      default: '일치하는 항목이 없습니다.'
    },
    options: {
      type: Array,
    },
    isError: {
      type: Boolean,
      default: false
    },
    onFocus: {
      type: Function,
    },
    onBlur: {
      type: Function,
    },
    onKeydown: {
      type: Function,
    },
    onUpdate: {
      type: Function,
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    onRemoveValue: {
      type: Function,
      default: () => {}
    },
    size: {
      type: String,
      default: 'md' // 'sm', 'md', 'lg'
    },
    onClickWhenReadonly: {
      type: Function,
      default: () => {}
    },
  },
  data() {
    return {
      showList: false,
      keyword: '',
    };
  },
  computed: {
    filteredItems() {      
      if (!this.keyword) return this.options;

      return this.options.filter(item => 
        item.text.includes(this.keyword)
      );
    },
    isShowDeleteButton() {
      return this.value;
    }
  },
  methods: {
    focus() {
      this.$refs.inputField.focus();
    },
    handleFocus() {
      // if(this.value) {
      //   return;
      // }
      this.showList = true;      
      this.onFocus && this.onFocus();
    },
    handleBlur() {
      this.onBlur && this.onBlur();
      setTimeout(() => {
        this.showList = false;
      }, 150);
    },
    handleKeydown(event) {
      this.onKeydown && this.onKeydown(event);

      if (event.key === 'Enter') {
        this.showList = false;
      }
    },   
    updateValue(val) {
      // this.$emit('input', val);
      this.keyword = val.target.value;
    },
    selectItem(item) {
      // if(item.options?.disabled) {
      //   console.log('Selected item is disabled:', item);
      //   return;
      // }
      this.keyword = '';
      this.$emit('input', item.text);
      this.showList = false;
      this.onUpdate && this.onUpdate(item.value);

      // console.log('Selected item:', item);
    },
    handleRemoveValue() {
      this.$emit('input', '');
      this.keyword = '';
      this.onRemoveValue && this.onRemoveValue(); 
    },
    handleClick() {
      // console.log('Input clicked. Disabled:', this.disabled);
      if(this.disabled) {
        this.onClickWhenDisabled && this.onClickWhenDisabled();
      }
    },
    resetValue() {
      this.$emit('input', '');
      this.keyword = '';
    }
  },
};
</script>
<style scoped lang="scss">
.autocomplete-wrap {
  height: 100%;
  position: relative;
  .input-box-wrap {
    border: 0;
  }
  .autocomplete-list{
    top: calc(100% + 4px);
    left: 0;
    transform: none;
  }
  .del-btn {
    padding: 1px;
    margin-left: 4px;
  }
}

.disabled-class {
  color: #ccc;
  cursor: not-allowed;
}

// .bg-white {
//   background-color: #fff !important;  
// }

.clickable {
  cursor: pointer;
}

.text-box-wrap {
  display: flex;
  justify-content: center;
  height: 100%;

  .text-box {
    display: inline-flex;
    align-items: center;
  }  
}

</style>