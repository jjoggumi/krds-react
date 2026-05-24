<!--
@File(Method): MemberSearch.vue
@Author: -
@Date Created: -
@Description: 멤버검색 및 태그필터 컴포넌트
@Modified: 2025-01-09 - #69560 구성원 관리 태그 추가 - 검색영역 태그, 필터 추가 / HiModal 컴포넌트로 변경
-->
<template>
  <div class="search-box">
    <div class="input-box-wrap round-search-box">
      <HiTag
          v-if="selectedTag.tagId"
          :tag="selectedTag.tagName"
          :is-edit="true"
          :includeHash="true"
          @remove="clearSelectedTag(true)"
      />
      <input
          type="text"
          :placeholder="selectedTag.tagId ? '' : placeholder"
          v-model="keyword"
          @input="onInput($event.target.value)"
          @blur="hideAutocomplete"
          @keyup.enter="searchEnter"
          :disabled="!isAllowMulti && selectedTag.tagId"
      >
      <HiButton v-if="keyword && !selectedTag.tagId" color="link" size="md" class="btn-delete" @click="clearSearch(true)">
        <HiIcon name="ico-close3" size="14"  color="white" bgColor="gray" rounded="rounded"/>
      </HiButton>
      <HiButton color="link" size="md" class="btn-search" @click="search">
        <HiIcon name="ico-search-thin" size="24" color="default"/>
      </HiButton>
    </div>
    <ul v-if="isAutocompleteVisible" class="auto-keyword-list">
      <template v-if="filteredSuggestions.length > 0">
        <li
            v-for="(suggestion, index) in filteredSuggestions"
            :key="index"
            @mousedown.prevent="selectSuggestion(suggestion)"
        >
          {{ suggestion.tagName }}
        </li>
      </template>
      <template v-else>
        <li>일치하는 태그가 없습니다.</li>
      </template>
    </ul>
  </div>
</template>

<script>
export default {
  name: "member-search-input",
  data() {
    return {
      filteredSuggestions: [],
      isAutocompleteVisible: false,
      keyword: '',
      selectedTag: {}
    };
  },
  props: {
    tags: {
      type: Array
    },
    isAllowMulti: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: '이름, #태그 검색'
    },
    useTag: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    // 입력값에 따라 추천 목록 필터링
    onInput(value) {
      value = value.substring(0, 20)
      this.keyword = value
      if (!this.useTag) return
      this.isAutocompleteVisible = value.trim().startsWith('#')
      if (this.isAutocompleteVisible) {
        this.filteredSuggestions = this.tags.filter(tag =>
            tag.tagName.includes(this.keyword.replace('#', ''))
        );
      }
    },
    // 추천 항목 선택 시 입력 필드에 반영
    selectSuggestion(suggestion) {
      this.selectedTag = suggestion;
      this.keyword = '';
      this.isAutocompleteVisible = false;
      this.search();
    },
    // blur 시 약간의 지연 후 자동완성 숨김
    hideAutocomplete() {
      setTimeout(() => {
        this.isAutocompleteVisible = false;
      }, 100);
    },
    // 검색어 초기화
    // MemberSearch.vue 에서 호출
    clearSearch(isSearch) {
      this.keyword = '';
      this.filteredSuggestions = [];
      if (isSearch) this.$emit('search', { searchType: 'NONE', searchValue: '' });
    },
    search() {
      let searchType = this.selectedTag.tagId ? 'TAG' : 'KEYWORD';
      let searchValue = this.selectedTag.tagId ? this.selectedTag.tagId : this.keyword;
      if (searchValue.length === 0) {
        searchType = 'NONE'
        searchValue = ''
      }
      this.$emit('search', { searchType, searchValue });
    },
    searchEnter() {
      if (!this.keyword.trim().startsWith('#')) {
        this.search();
        return
      }
      if (this.filteredSuggestions.length === 1) {
        this.selectSuggestion(this.filteredSuggestions[0]);
      }
    },
    // MemberSearch.vue 에서 호출
    clearSelectedTag(isSearch) {
      this.selectedTag = {};
      if (isSearch) this.search();
    }
  },
}
</script>

<style lang="scss" scoped>
.input-box-wrap > input {
  width: 100%;
  padding-right: 60px;
}

.member-search{
  background-color: #f8f9fc;
  padding: 10px 16px;
  border-bottom:1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 4px;
}
.search-box{
  flex-grow: 1;
  position:relative;
  .round-search-box{
    padding: 0 0 0 4px;
    display: flex;
    align-items: center;
  }
  .auto-keyword-list{
    left:0;
    z-index: 3;
  }
}
.filter-box{
  .hi-selectbox::v-deep.dropdown {
    .selected{
      padding: 0;
      border-radius: 50px;
      border-color: #dbdbdb;
      i{
        width: 22px;
        height: 22px;
        min-width: 22px;
        min-height: 22px;
        &::after{
          background-color: #222;
        }
      }
      &:hover{
        i::after{
          background-color: var(--primary);
        }
      }
    }
    .option__layer{
      width: 215px;
      max-height: 310px;
      left: auto;
      right: 0;
      .option-list{
        >button{
          min-height: 48px;
          font-size: 14px;
          font-weight: 600;
          padding: 0 15px;
          text-align: left;
          width: 100%;
        }
        ul{max-height: 200px;}
        .btns{
          padding: 6px 6px 16px 6px;
          text-align: center;
          display: flex ;
          justify-content: center;
          gap: 8px;
          button {
            width: 70px;
          }
        }
      }
    }
  }
}

</style>