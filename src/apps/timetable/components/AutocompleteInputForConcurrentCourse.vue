<!--
@File(Method): AutocompleteInput.vue
@Description: input 자동완성
@Modified: 2025-05-14 
-->
<template>
  <div class="autocomplete-wrap">
    <div class="input-wrap">
      <input
        ref="inputField"
        type="text"
        :value="value"
        @input="updateValue($event.target.value)"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        :placeholder="placeholder"
        :class="{ 'error': isError }"
        :disabled="disabled"
        spellcheck="false"
      />
      <button v-if="onReset && value" type="button" class="btn btn-link" @click="updateValue('')">
        <i class="ico ico-close-circle-fill ico-size-20 ico-gray"></i>
      </button>
    </div>
    <div v-if="showList" class="autocomplete-list custom-scr">
      <template v-if="$scopedSlots['custom-option']">
        <slot name="custom-option" :items="filteredSubjects" :value="value" :select-item="selectSubject"></slot>
      </template>
      <template v-else>
        <div class="item"
          v-for="subject in filteredSubjects"
          :key="subject"
          @mousedown.prevent="selectSubject(subject)"
        >
          {{ subject }}
        </div>
        <div v-if="filteredSubjects.length === 0" class="hi-nodata sm">
          <p>{{ nodata }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
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
    hasAddedOption : {
      type: Boolean,
      default: false
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
    disabled: {
      type: Boolean,
      default: false
    },
    // 초기화(지우기) 버튼 노출 여부
    onReset: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showList: false
    };
  },
  computed: {
    filteredSubjects() {
      // console.log('Filtering subjects with value:', this.value);
      
      if (!this.value) return this.options;

      return this.options.filter(subject => 
        Object.keys(subject.value).some(key => {
          return this.hasAddedOption 
            ? subject.value[key].includes(this.value) || subject.value[key] === '' 
            : subject.value[key].includes(this.value);
        })
      );
    }
  },
  methods: {
    focus() {
      this.$refs.inputField.focus();
    },
    handleFocus() {
      this.showList = true;
      this.$emit('list-open');
      this.onFocus && this.onFocus();
    },
    handleBlur() {
      this.onBlur && this.onBlur();
      setTimeout(() => {
        if (!this.$el.contains(document.activeElement)) {
          this.showList = false;
          this.$emit('list-close');
        }
        // this.showList = false;
        // this.$emit('list-close');
      }, 100);      
    },
    handleKeydown(event) {
      this.onKeydown && this.onKeydown(event);

      if (event.key === 'Enter') {
        this.showList = false;
        this.$emit('list-close');
      }
    },
    updateValue(val) {
      this.$emit('input', val);
      /*
      if (val === '') {
        this.showList = false;
        this.$emit('list-close');
      } else {
        this.showList = true;
        this.$emit('list-open');
      }
      */
      this.showList = true;
      this.$emit('list-open');
    },
    selectSubject(subject) {
      this.$emit('select', subject);
      this.showList = false;
      this.$emit('list-close');
    }
  }
};
</script>
<style scoped lang="scss">
.autocomplete-wrap {
  height: 100%;
  position: relative;
  .input-wrap {
    border: 0;
    position: relative;
    .btn-link{
      position: absolute;
      top: 50%;
      right: 8px;
      transform: translateY(-50%);
      cursor: pointer;
    }
  }
  .autocomplete-list{
    top: calc(100% + 4px);
    left: 0;
    transform: none;
  }
}
</style>