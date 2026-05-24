<!--
@File(Method): CourseSelect.vue
@Description: 과목 선택 컴포넌트
@Modified: 2025-05-09 
-->
<template>
  <div class="course-select" v-click-outside="resetInput">
    <label :for="`inputTag` + index" class="selected-tags" :class="{ isError }"  >
      <!-- 선택된 태그 표시 -->
      <!-- <HiTag
        v-for="tag in selected"
        :key="`selected-tag-${tag.courseId}`"
        :tag="tag.displayedTitle + ' (' +  tag.periodCount + ')'"
        :is-error="false"
        @remove="removeTag(tag)"
      />  UI 검수에서 시수 삭제 요청 반영 -->
      <HiTag
        v-for="tag in selected"
        :key="`selected-tag-${tag.courseBaseId}`"
        :tag="tag.displayedTitle"
        
        :is-error="false"
        @remove="removeTag(tag)"
      />    
      <span class="autocomplete-wrap">
        <!-- 드롭다운 태그 목록 -->
        <div class="autocomplete-list custom-scr" v-if="isDropdownVisible">
          <button type="button" class="item" 
            v-for="tag in filteredTags"
            :key="`dropdown-${tag.courseBaseId}`"          
            @click="addTag(tag)">
              {{ tag.displayedTitle }}({{ tag.standardCourseTitle }})
              <!-- <span class="txt-primary">({{ tag.periodCount }})</span>   UI 검수에서 시수 삭제 요청 반영 -->
          </button>
          <div
              v-if="inputValue && !isExistsTag(inputValue) && !isValidTag(inputValue) && filteredTags.length === 0"
              class="hi-nodata sm"
          >
            <p>등록된 과목명이 없습니다.</p>
          </div>
          <div class="hi-nodata sm" v-if="(!inputValue && filteredTags.length === 0) || (inputValue && isValidTag(inputValue))" >
            <p v-if="!inputValue && filteredTags.length === 0">등록된 과목이 없습니다.</p>
          </div>
        </div>
      </span>
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
        :readonly="readonly"
        autocomplete="off" 
        :disabled="disabled"
        spellcheck="false"
      />
    </label>
  </div>
</template>

<script>
import HiTag from '@/components/Tag/HiTag.vue';

export default {
  name: "CourseSelect",  
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
    index: {
      type: Number,
      default: null,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    isError: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      inputValue: "",
      // filteredTags: [...this.tags],
      selected: [...this.selectedTags],
      isInputFocused: false,
      inputWidth: 20, // 초기 너비
    };
  },
  computed: {
    isDropdownVisible() {
      return this.isInputFocused || this.inputValue.trim() !== "";
    },
    filteredTags() {
      const keyword = this.inputValue.trim().toLowerCase();
      const selectedIds = this.selected.map(tag => tag.courseBaseId);

      // 1) 이미 선택된 태그는 항상 리스트에서 제거
      const available = this.tags.filter(tag => !selectedIds.includes(tag.courseBaseId));

      // 2) 입력값이 없으면 그대로 반환
      if (!keyword) return available;

      this.resizeInput();

      // 3) 입력값이 있으면 과목명/표시명에 포함되는 항목만 필터링
      return available.filter(tag => {
        const standard = (tag.standardCourseTitle || "").toLowerCase();
        const displayed = (tag.displayedTitle || "").toLowerCase();
        return standard.includes(keyword) || displayed.includes(keyword);
      });
    },
    /*
    filteredTags() {
      // 태그 목록을 필터링하여 반환
      return this.tags.filter((tag) => {
        return !this.selectedTags.some((selectedTag) => selectedTag.courseId === tag.courseId);
      });
    },
    */
  },
  methods: {
    // @input 
    filterTags(e) {
      const sanitized = e.target.value
        .toLowerCase()
        .replaceAll(/[^0-9a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣\-_/&,.()]/g, '')
        .substring(0, 10);
      
      this.inputValue = sanitized

      // // input 입력값에 따라 태그 필터링
      // this.filteredTags = input
      //   ? this.tags.filter((tag) => tag.standardCourseTitle.toLowerCase().includes(input) || tag.displayedTitle.toLowerCase().includes(input))
      //   : [...this.tags];
        
      // 입력값에 따라 input 너비 조정
      this.resizeInput();
    },   

    resizeInput() {
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
    
    // 태그가 존재하는지 확인
    isExistsTag(tag) {
      return this.tags.map(tag => tag.standardCourseTitle).includes(tag);
    },

  },
  watch: {
    selectedTags(newVal) {
      console.log(">>> selectedTags watch:", newVal);
      this.selected = [...newVal];
    },
    tags(newVal) {
      // this.filterTags = [...newVal];
      // console.log("tags watch:", newVal);
      // this.filteredTags = [...newVal];
    },
    isDropdownVisible(newVal) {
      console.log("isDropdownVisible watch:", newVal);
      if (newVal) {
        this.inputValue = ''
        // this.filteredTags = [...this.tags]
      }
    }
  }
};
</script>

<style scoped lang="scss">
.course-select {
  position: relative;
  height: 100%;

  .selected-tags{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
    border: 0;
    padding:0px 10px;
    background: #fff;  
    height: 100%;  
    width:calc(100% - 1px);
    
    &:hover{border: 0;box-shadow: 0 0 0 1px #8EA4D1;}
    &:focus-within{border: 0;box-shadow: 0 0 0 1px #8EA4D1;background: #F1F4FC;}  
    &.isError{
      box-shadow: 0 0 0 1px #F37079;color:var(--warning);
      &:hover{border: 0;box-shadow: 0 0 0 1px #F37079;color:var(--warning);}
      &:focus-within{border: 0;box-shadow: 0 0 0 1px #F37079;background: #FDE4E6;color:var(--font-color);}
      input::placeholder{color:var(--warning);}
    }  
    
    .hi-tag::v-deep{
      border:1px solid var(--gray-06);
      background-color: #fff;
      font-size: 14px;
      color: var(--font-color);
      line-height: 160%;
      padding: 0 8px;
      border-radius: 4px;
      height: 28px;
      .remove-btn{
        display: block;  
        margin-right: -5px;
        i{
          background-color: transparent !important;
          &::after{
            background-color:var(--gray-07) !important;
          }
        }
      }
      &:hover{
        border-color:var(--gray-07);
        background-color: var(--gray-02);
      }
      &.isError{
        border:1px solid #F37079;
        color:var(--warning);
        &:hover{
          background-color: #FFF3F4;

        }
      }
    }

    &:hover{
      border-color: rgba(66, 103, 178, 0.6);
    }
    input[type=text] {
      border: none;
      outline: none;
      background: transparent;
      flex-grow: 1;
      height: 40px;
      &[readonly]{ z-index: 0;}
      &:hover:not(:disabled),
      &:focus:not(:disabled) {
        border: none;
      }
    }
  }
  .autocomplete-wrap {
    position: relative;
    z-index: 2;
    .autocomplete-list {
      top: calc(100% - 4px);
      left: 5px;
      transform: none;
      width: 280px;
    }
  }
}
</style>