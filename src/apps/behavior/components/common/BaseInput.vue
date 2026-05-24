<template>
  <div class="base-input" :style="inputStyle" :class="{ 'error-input': error }">
    <input
      ref="input"
      :type="type"
      :value="value"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      @input="updateValue"
      :style="{ padding: `0 ${inputPaddingRight} 0 16px` }"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    />

    <!-- 삭제 아이콘 -->
    <i
      v-if="showDelete && value"
      class="input-btn-delete bh-icon-close-circle-fill-24 cursor-pointer"
      @click="clearInput"
      :style="{ right: deleteRight }"
    ></i>

    <!-- 글자수 카운터 -->
    <span v-if="showCounter && maxlength && type !== 'number'" class="input-counter" :style="{ right: counterRight }"
      >{{ currentLength }}/{{ maxlength }}</span
    >
  </div>
</template>

<script>
export default {
  name: 'BaseInput',
  props: {
    value: {
      type: [String, Number],
      default: '',
    },
    placeholder: {
      type: String,
      default: '입력해주세요',
    },
    width: {
      type: String,
      default: '300px',
    },
    height: {
      type: String,
      default: '44px',
    },
    type: {
      type: String,
      default: 'text',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    maxlength: {
      type: [Number, String],
      default: null,
    },
    showCounter: {
      type: Boolean,
      default: true,
    },
    showDelete: {
      type: Boolean,
      default: true,
    },
    deleteRight: {
      type: String,
      default: '48px',
    },
    error: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    inputStyle() {
      return {
        width: this.width,
        height: this.height,
        borderColor: this.error ? '#EC1F2D' : '#e0e0e0',
      };
    },
    currentLength() {
      return this.value !== null && this.value !== undefined && this.value !== '' ? this.value.toString().length : 0;
    },
    // padding-right 값은 타입과 아이콘/카운터 노출 여부에 따라 동적으로 결정
    inputPaddingRight() {
      if (this.type === 'number') {
        // 숫자 타입일 때는 maxlength가 적용되지 않으므로 공간을 거의 사용하지 않음
        return this.showDelete && this.value ? '40px' : '12px';
      }
      // 일반 텍스트 타입: 삭제 아이콘 + 카운터 공간을 기본으로 둠
      if (this.showDelete && this.showCounter && this.maxlength) return '80px';
      if (this.showDelete) return '48px';
      if (this.showCounter && this.maxlength) return '48px';
      return '12px';
    },
    counterRight() {
      // 카운터는 기본적으로 우측 끝(10px)에 노출, 숫자 타입이면 숨김 처리하므로 사용되지 않음
      return this.type === 'number' ? '48px' : '10px';
    },
  },
  methods: {
    updateValue(event) {
      if (this.maxlength && this.$refs.input.value.length > this.maxlength) {
        this.setInputValue();
        return;
      }
      const value = this.maxlength ? event.target.value.slice(0, this.maxlength) : event.target.value;

      this.$emit('input', value);
    },
    clearInput() {
      this.$emit('input', '');
    },
    setInputValue() {
      this.$refs.input.value = this.value;
    },
  },
};
</script>

<style lang="scss" scoped>
.base-input {
  position: relative;
  display: inline-block;
  width: 100%;
  &.error-input {
    input {
      border-color: #ec1f2d;
    }
  }
  input {
    width: 100%;
    height: 100%;
    padding: 0 80px 0 16px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 14px;
    color: #222;
    background-color: #fff;
    transition: all 0.2s ease;

    &::placeholder {
      color: #bdbdbd;
    }
    &:focus {
      outline: none;
      border-color: #8ea4d1;
    }
    &:disabled {
      background: #f5f5f5;
      color: #999;
      cursor: not-allowed;
    }
    &[type='number']::-webkit-outer-spin-button,
    &[type='number']::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    &[type='number'] {
      appearance: textfield;
      -moz-appearance: textfield;
    }
  }

  .input-btn-delete {
    position: absolute;
    right: v-bind('deleteRight');
    top: 50%;
    transform: translateY(-50%);
    font-size: 20px;
    color: #ccc;
    transition: color 0.2s;
    &:hover {
      color: #999;
    }
  }

  .input-counter {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 13px;
    color: #999;
    pointer-events: none;
  }
}
</style>
