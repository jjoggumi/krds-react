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
        @paste="handlePaste"
        :placeholder="placeholder"
        :class="{ 'error': isError, [size]: size, 'error-border': isErrorTypeBorder }"
        :disabled="disabled"
        :maxlength="maxLength || undefined"
        spellcheck="false"
      />
    </div>
    <div v-if="showList" class="autocomplete-list custom-scr">
      <template v-if="$scopedSlots['custom-option']">
        <slot name="custom-option" :items="filteredSubjects" :value="value" :select-item="selectSubject"></slot>
      </template>
      <template v-else>
        <div class="item"
          v-for="(subject, index) in filteredSubjects"
          :key="`${subject}-${index}`"
          :class="{ focused: index === focusedIndex }"
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
    isError: {
      type: Boolean,
      default: false
    },
    isErrorTypeBorder: {
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
    onPaste: {
      type: Function,
    },
    onValueUpdated: {
      type: Function,
    },
    // 선택 시 { text, value }를 전달받는 선택 콜백 (옵션)
    onSelect: {
      type: Function,
    },
    disabled: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'md' // 'sm', 'md', 'lg'
    },
    maxLength: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      showList: false,
      focusedIndex: -1,
      isPasteTable: false
    };
  },
  computed: {
    normalizedOptions() {
      const opts = this.options || [];
      return opts
        .map((o) => {
          if (typeof o === 'string') {
            return { text: o, value: o, disabled: false };
          }
          if (o && typeof o === 'object') {
            const text = o.text != null ? String(o.text) : String(o.value ?? '');
            const value = o.value != null ? String(o.value) : text;
            const disabled = !!(o.options && o.options.disabled);
            return { text, value, disabled };
          }
          const text = String(o);
          return { text, value: text, disabled: false };
        })
        // 기존 AutocompleteInput은 disabled 개념이 없었으므로, 기본적으로 숨김 처리
        .filter((o) => !o.disabled);
    },
    filteredSubjects() {
      // 문자열 배열로 부모 호환 유지
      const items = this.normalizedOptions;
      if (!this.value) return items.map((i) => i.text);
      const q = this.value;
      return items.filter((i) => i.text.includes(q)).map((i) => i.text);
    }
  },
   watch: {
    value() {
      this.resetFocusedIndex();
    },
    options: {
      handler() {
        this.resetFocusedIndex();
      },
      deep: true
    },
    showList(val) {
      if (val) this.resetFocusedIndex();
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
      // table(엑셀) 붙여넣기 시 상위 컴포넌트에서 일괄 저장을 위해 blur 이벤트 무시
      if (this.isPasteTable) {
        this.isPasteTable = false;
        return;
      }

      this.onBlur && this.onBlur();
      setTimeout(() => {
        this.showList = false;
        this.$emit('list-close');
      }, 150);      
    },
    handleKeydown(event) {
      this.onKeydown && this.onKeydown(event);

      if (!this.showList) return;

      const len = this.filteredSubjects.length;

      if (event.key === 'ArrowDown') {
        if (len === 0) return;
        this.focusedIndex = this.focusedIndex < 0 ? 0 : (this.focusedIndex + 1) % len;
        event.preventDefault();
      } else if (event.key === 'ArrowUp') {
        if (len === 0) return;
        this.focusedIndex = this.focusedIndex < 0 ? (len - 1) : (this.focusedIndex - 1 + len) % len;
        event.preventDefault();
      } else if (event.key === 'Enter') {
        if (this.focusedIndex >= 0 && len > 0) {
          this.selectSubject(this.filteredSubjects[this.focusedIndex]);
        } else {
          this.showList = false;
          this.$emit('list-close');
        }
      }
    },
    handlePaste(event) {
      if (!this.onPaste) return;

      const parser = new DOMParser();
      const textHtml = event.clipboardData?.getData('text/html');
      const doc = parser.parseFromString(textHtml, 'text/html');
      const table = doc.body.querySelector('table');

      if (!table) return; // 텍스트 붙여넣기시 input 이벤트에서 처리

      // 셀 1개 선택 시 텍스트 붙여넣기 처리
      const rows = Array.from(table.querySelectorAll('tr'));
      if (rows.length === 1 && rows[0].querySelectorAll('td').length === 1) return;

      event.preventDefault();
      this.onPaste(event); // 상위 컴포넌트에서 붙여넣기 처리
      this.isPasteTable = true;
    },
    updateValue(val) {
      if (this.maxLength && val.length > this.maxLength) {
        val = val.slice(0, this.maxLength);
      }
      this.$emit('input', val);
      this.showList = true;
      this.$emit('list-open');
      this.onValueUpdated && this.onValueUpdated(val);
    },
    selectSubject(subject) {
      if (this.maxLength && subject.length > this.maxLength) {
        subject = subject.slice(0, this.maxLength);
      }
      // v-model 호환: 표시 텍스트 그대로 전달
      this.$emit('input', subject);

      // value도 함께 전달: text 매칭으로 value 조회
      const matched = (this.normalizedOptions || []).find(o => o.text === subject);
      const payload = { text: subject, value: matched ? matched.value : subject };
      this.$emit('select', payload);
      // 이벤트로 받기 <AutocompleteInput v-model="name" :options="opts" @select="({ text, value }) => { selectedId = value }" />
      this.onSelect && this.onSelect(payload);
      // 콜백 prop으로 받기 <AutocompleteInput v-model="name" :options="opts" :on-select="({ text, value }) => { selectedId = value }" />

      this.showList = false;
      this.$emit('list-close');
    },    
    resetFocusedIndex() {
      // 목록이 열릴 때 또는 값/옵션 변경 시 초기 포커스는 없음
      this.focusedIndex = -1;
    }
  },
};
</script>
<style scoped lang="scss">
.autocomplete-wrap {
  //z-index: 4;
  height: 100%;
  position: relative;
  .input-box-wrap {
    border: 0;
  }
  .autocomplete-list{
    top: calc(100% + 4px);
    left: 0;
    transform: none;
    z-index: 6;
  }
}
</style>