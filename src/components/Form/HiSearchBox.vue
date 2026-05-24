<!--
@File(Method): HiSearchBox.vue
@Description: 검색 입력 컴포넌트
-->
<template>
  <div class="hi-search-box">
    <!-- 검색 아이콘 -->
    <HiIcon v-if="autoSearch" name="ico-search-thin" size="20" class="ico-gray2" @click="clearInput"/>
    <HiInput
      type="text"
      :value="localValue"
      @input="onInput"
      @keyup.enter="onEnterKey"
      :placeholder="placeholder"
      :maxlength="maxlength"
      spellcheck="false"
      :autoSearch="autoSearch"
      :rounded="rounded"
      :size="size"
      :class="inputClass"
      :isFocused="isInputFocused"
    />
    <!-- 자동 검색이 아닌 경우에만 버튼 노출 -->
    <HiButton v-if="!autoSearch" color="link" @click="emitSearch">
      <HiIcon name="ico-search-thin" size="24" />
    </HiButton>
  </div>
</template>

<script>
import HiButton from '../Button/HiButton.vue';
import HiInput from './HiInput.vue';
import { debounce } from 'lodash';

export default {
  name: 'HiSearchBox',
  components: {
    HiInput,
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'md', // sm / md / lg 같은 것들
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
    rounded: {
      type: Boolean,
      default: false,
    },
    inputClass: {
      type: String,
      default: '',
    },
    isInputFocused: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localValue: this.value,
    };
  },
  created() {
    this.debouncedSearch = debounce((keyword) => {
      this.$emit('search', keyword);
    }, 200);
  },
  watch: {
    value(newVal) {
      this.localValue = newVal;
    },
  },
  methods: {
    onInput(e) {
      const keyword = typeof e === 'string' ? e : e && e.target ? e.target.value : '';
      this.localValue = keyword;
      if (this.autoSearch) {
        // 자동 검색 모드에서는 즉시 부모에 반영 및 검색
        this.$emit('input', keyword);
        this.debouncedSearch(keyword);
      }
    },
    onEnterKey() {
      if (!this.autoSearch) {
        this.emitSearch();
      }
    },
    emitSearch() {
      const keyword = (this.localValue || '').trim();
      // 수동 검색 모드: 부모 상태 갱신 후 검색 트리거
      this.$emit('input', keyword);
      this.$emit('search', keyword);
    },
    clearInput() {
      this.localValue = '';
      if (this.autoSearch) {
        this.$emit('input', '');
        this.$emit('search', '');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.hi-search-box {
  position: relative;
  display: flex;
  input[type='text'] {
    padding-right: 40px;
  }
  .hi-ico.ico-search-thin.ico-size-20 {
    position: absolute;
    left: 6px;
    top: 50%;
    z-index: 1;
    transform: translateY(-50%);
    
  }
  .btn-link{
    position: absolute;
    right: 6px;
    top: 50%;
    z-index: 1;
    transform: translateY(-50%);
    margin: 0;
    // i{
    //   padding-top: 2px;
    // }
  }
  .hi-input.rounded + .btn-link{
    right: 8px;
  }
}
</style>