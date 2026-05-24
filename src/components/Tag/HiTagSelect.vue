<!--
@File(Method): HiTagSelect.vue
@Author: -
@Date Created: -
@Description: 태그 선택 컴포넌트
@Modified: 2025-01-06 - #69560 구성원 관리 태그 추가 : 태그 선택 컴포넌트 추가
-->
<template>
  <div class="hi-tag-select" v-click-outside="resetInput">
    <label :for="`inputTag` + index" class="selected-tags custom-scr">
      <!-- 선택된 태그 표시 -->
      <HiTag
        v-for="tag in selected"
        :key="`selected-tag-${tag.tagId}`"
        :tag="tag.tagName"
        :is-active="activeTags.includes(tag.tagId)"
        :is-edit="isInputFocused"
        :includeHash="false"
        @remove="removeTag(tag)"
      />
      <!-- 입력 박스 -->
      <input
        ref="tagInput"
        type="text"
        :id="`inputTag` + index"
        :value="inputValue"
        :placeholder="selected.length === 0 ? placeholder : ''"
        :style="{ width: inputWidth + 'px' }"
        @focus="isInputFocused = true"
        @input="filterTags($event)"
        @keydown="debouncedInput"
        :readonly="readonly"
      />
    </label>
    <!-- 드롭다운 태그 목록 -->
    <div class="tag-list-wrap custom-scr" v-if="isDropdownVisible">
      <ul class="tag-list">
        <li class="tag-item"
          v-for="tag in filteredTags"
          :key="`dropdown-${tag.tagId}`"
          @click="addTag(tag)"
        >
          {{ tag.tagName }}
        </li>
        <li
            v-if="enableCreate && inputValue && !isExistsTag(inputValue) && !isValidTag(inputValue) && filteredTags.length === 0"
            class="tag-item new-item"
            @click="createTag(inputValue)"
        >
          <span>'{{ inputValue }}'</span>
          <HiButton color="link">(새로만들기)</HiButton>
        </li>
        <li class="hi-nodata sm" v-if="(!inputValue && filteredTags.length === 0) || (enableCreate && inputValue && isValidTag(inputValue))" >
          <p v-if="!inputValue && filteredTags.length === 0">등록된 태그가 없습니다.</p>
          <p v-if="enableCreate && inputValue && isValidTag(inputValue)">등록 불가한 태그입니다.</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { debounce } from "lodash";
import HiTag from '@/components/Tag/HiTag.vue';

export default {
  name: "HiTagSelect",  
  components: {
    HiTag
  },  
  props: {
    tags: {
      type: Array,
      required: true,
    },
    selectedTags: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: "태그를 입력하세요",
    },
    enableCreate: {
      type: Boolean,
      default: true,
    },
    index: {
      type: Number,
      default: null,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    activeTags: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      inputValue: "",
      filteredTags: [...this.tags],
      selected: [...this.selectedTags],
      isInputFocused: false,
      inputWidth: 20, // 초기 너비
    };
  },
  computed: {
    isDropdownVisible() {
      return this.isInputFocused || this.inputValue.trim() !== "";
    },
  },
  methods: {
    // @input 
    filterTags(e) {
      const input = e.target.value.toLowerCase().replaceAll(/[^0-9a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣\-_/&,.()]/g, '').substring(0, 10);
      this.inputValue = input

      // input 입력값에 따라 태그 필터링
      this.filteredTags = input
        ? this.tags.filter((tag) => tag.tagName.toLowerCase().includes(input))
        : [...this.tags];
        
      // input에 임시 요소 생성 및 너비 계산
      const p = document.createElement("p");
      p.style.visibility = "hidden";
      p.style.position = "absolute";
      p.style.whiteSpace = "pre";
      p.style.font = window.getComputedStyle(this.$refs.tagInput).font;
      p.textContent = this.inputValue || this.$refs.tagInput.placeholder;

      document.body.appendChild(p);
      this.inputWidth = p.offsetWidth + 20; // 추가 여백 포함
      document.body.removeChild(p);
    },    

    // @keydown : 입력값 디바운스 - 한글 실시간 바인딩이 어려워 debounce 사용
    debouncedInput: debounce(function (e) {
      this.filterTags(e)
    }, 200),

    // @blur : 입력폼 초기화
    resetInput() {
      this.inputValue = "";
      this.$refs.tagInput.blur();
      this.isInputFocused = false;
    },

    // 선택태그 추가
    addTag(tag) {
      if (!this.selected.includes(tag)) {
        this.$emit("add:tags", tag);  // 부모 컴포넌트에 업데이트 전달
      }
      this.resetInput();
    },

    // 선택태그 삭제
    removeTag(tag) {
      this.$emit("remove:tags", tag);
      this.resetInput();
    },

    // 허용된 문자 외 입력 체크
    isValidTag(input) {
      const regex = /[^0-9a-zA-Z가-힣\-_/&,.()]/
      return regex.test(input)
    },

    //태그 생성
    createTag(tag) {
      if (tag.trim() && !this.isExistsTag(tag)) {
        this.$emit("create-tag", tag);  // 태그 생성 이벤트
      }
      this.resetInput();
    },

    // 태그가 존재하는지 확인
    isExistsTag(tag) {
      return this.tags.map(tag => tag.tagName).includes(tag);
    },

  },
  watch: {
    selectedTags(newVal) {
      this.selected = [...newVal];
    },
    tags(newVal) {
      this.filteredTags = [...newVal];
    },
    isDropdownVisible(newVal) {
      if (newVal) {
        this.inputValue = ''
        this.filteredTags = [...this.tags]
      }
    }
  }
};
</script>

<style scoped lang="scss">
.hi-tag-select {
  position: relative;

  .selected-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding:5px 10px;
    background: #fff;  
    max-height: 73px;
    overflow: auto;  

    &:hover{
      border-color: rgba(66, 103, 178, 0.6);
    }
    input {
      border: none;
      outline: none;
      flex-grow: 1;
      height: 28px;
      &[readonly]{ z-index: 0;}
    }
  }
}

.tag-list-wrap {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background: white;
  border: 1px solid #d6d6d6;  
  border-radius: 4px;
  box-shadow: 0px 5px 10px 0px #0000001f;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  z-index: 2;

  .tag-list{
    padding: 9px 0;

    .tag-item{
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0 15px;
      cursor: pointer;
      font-weight: 400;
      color:#222;

      &:hover {
        background-color: #F1F5FD;
      }
      
    }
    .hi-nodata{
      padding: 30px 0;
    }
  }
}
</style>