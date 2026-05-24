<!--
@File(Method): HiInput.vue
@Description: 입력 컴포넌트
-->
<template>
  <div class="hi-input " :class="[{ 'auto-search': autoSearch },{ rounded: !!rounded }]">
    <input
      ref="hiInput"
      :type="type"
      :value="currentValue"
      @input="onInput"
      v-on="$listeners"
      :placeholder="placeholder"
      :maxlength="maxlength"
      spellcheck="false"
      v-bind="$attrs"
      :class="[size,  { error: !!errorMsg }, { success: !!successMsg }]"
    />
    <HiIcon v-if="hasValue" name="ico-close-circle-fill" size="24"  color="gray"  @click.native="onClear" />
    <div :class="['msg', { rounded: !!rounded }, { success: !!successMsg }]" v-if="errorMsg || successMsg">
      {{ errorMsg }}
      {{ successMsg }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'HiInput',
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number],
      default: '',
    },
    size: {
      type: String,
      default: 'md',
    },
    autoSearch: {
      type: Boolean,
      default: false,
    },
    maxlength: {
      type: Number,
      default: 50,
    },
    placeholder: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    errorMsg: {
      type: String,
      default: '',
    },
    successMsg: {
      type: String,
      default: '',
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    isFocused: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentValue: this.value,
    };
  },
  mounted() {
    if (this.isFocused) {
      this.$refs.hiInput && this.$refs.hiInput.focus();
    }
  },
  computed: {
    hasValue() {
      return this.currentValue !== null && this.currentValue !== undefined && String(this.currentValue).length > 0;
    },
  },
  methods: {
    onInput(e) {
      const next = e && e.target ? e.target.value : e;
      this.currentValue = typeof next === 'string' || typeof next === 'number' ? next : '';
      this.$emit('input', this.currentValue);
    },
    onClear() {
      this.currentValue = '';
      this.$emit('input', '');
    },
  },
  watch: {
    value(newVal) {
      this.currentValue = newVal;
    },
  },
};
</script>

<style lang="scss" scoped>
.hi-input {
  position: relative;
  input {
    &[type='text'],
    &[type='number'] {
      height: var(--md-height);
      border-radius: var(--md-radius);
      font-size: var(--md-font);
      padding: 0px 35px 0px 12px;
      border: 1px solid var(--gray-06);
      background: #fff;
      color: var(--gray-10);
      font-weight: 400;
      line-height: 150%;
      width: 100%;
      &::placeholder {
        color: var(--gray-07);
      }
      &:hover:not(:disabled) {
        border: 1px solid #8ea4d1;
      }
      &:focus:not(:disabled) {
        border: 1px solid #8ea4d1;
        background: #f1f4fc;
      }
      &:disabled {
        border: 1px solid var(--gray-06);
        background: var(--gray-04);
        color: var(--gray-07);
      }
      &:read-only:not(:disabled) {
        border: 1px solid var(--gray-06);
        background: var(--gray-04);
        color: var(--gray-10);
      }
      + .msg {
        position: absolute;
        top: 100%;
        font-size: 12px;
        margin-top: 8px;
        span {
          display: block;
        }
      }
      &.error {
        border: 1px solid #f37079;
        color: var(--warning);
        &:hover:not(:disabled) {
          border: 1px solid #f37079;
          color: var(--warning);
        }
        &:focus:not(:disabled) {
          border: 1px solid #f37079;
          background: #fff7f8;
          color: var(--font-color);
        }

        + .msg span {
          color: var(--warning);
        }
      }
      &.success {
        + .msg span {
          color: var(--success);
        }
      }
      &.xs {
        padding: 0px 35px 0px 12px;
        height: var(--xs-height);
        border-radius: var(--xs-radius);
        font-size: var(--xs-font);
      }
      &.sm {
        padding: 0px 35px 0px 12px;
        height: var(--sm-height);
        border-radius: var(--sm-radius);
        font-size: var(--sm-font);
      }
      &.md {
        padding:0px 35px 0px 12px;
        height: var(--md-height);
        border-radius: var(--md-radius);
        font-size: var(--md-font);
      }
      &.lg {
        padding: 0px 35px 0px 12px;
        height: var(--lg-height);
        border-radius: var(--lg-radius);
        font-size: var(--lg-font);
      }
      &.xl {
        padding: 0px 35px 0px 16px;
        height: var(--xl-height);
        border-radius: var(--xl-radius);
        font-size: var(--xl-font);
      }
    }
  }
  .hi-ico.ico-close-circle-fill {
    position: absolute;    
    top: 50%;
    right: 30px;
    z-index: 1;
    transform: translateY(-50%);
    cursor: pointer;
  }
  &.auto-search{
    input {
      &[type='text'],
      &[type='number']{
        padding-left: 35px;
      }
    }
    .hi-ico.ico-close-circle-fill {
      right: 6px;
    }
  }
  
  &.rounded {
    input {
      &[type='text'],
      &[type='number']{
        border-radius: 100px;
        padding-right: 60px;
      }
    }
     .hi-ico.ico-close-circle-fill {
      right: 30px;
    }
    &.auto-search{
      input {
        &[type='text'],
        &[type='number']{
          padding-left: 36px;
        }
      }
    }
    // .hi-ico.ico-close-circle-fill {
    //   right: 30px;
    // }
    &.auto-search 
      {.hi-ico.ico-close-circle-fill {
        right: 3px;
      }
    }
  }
}
</style>
