<!--
@File(Method): MemberSearch.vue
@Author: -
@Date Created: -
@Description: 멤버검색 및 태그필터 컴포넌트
@Modified: 2025-02-20 - #71977 학교양식신청서 및 설문 > 학반(태그) 추가
-->
<template>
<div class="member-search">
  <HiTooltip v-if="useTag" ico="none" position="top" ani="fade" isActive class="hi-tooltip-wrap"
    :title-html="`
    <i class='hi-ico ico-white ico-size-20 ico-search-thin p-00'></i> 입력시 태그 검색 가능 &nbsp;  /   &nbsp;
    <i class='hi-ico ico-white ico-size-20 ico-filter-thin p-00'></i>학반 태그 필터`"
  />
  <slot name="check-box"></slot>
  <member-search-input ref="memberSearchInput" :tags="clazzTags" :isAllowMulti="false" :placeholder="inputPlaceholder" :useTag="useTag" @search="search"/>
  <div class="filter-box">    
    <HiSelectBox
        v-if="useTag"
        ref="hiSelectBox"
        class="opt-default"
        :items="clazzTags.map(tag => ({ title: tag.tagName, value: tag.tagId }))"
        :value="selectedTagIds"
        empty-title="학반(태그)"
        selectBoxType="dropdown"
        @openSelectBox="openSelectBox"
        @clickOutside="closeSelectBox"
        @close="closeSelectBox"
      >          
      <template #btnType>
        <HiIcon name="ico-filter-thin"/>
      </template>
      <template #custom-option>
        <div class="option-list type02">
          <div class="tit">학반(태그)선택</div>
          <ul>
            <li v-for="tag in clazzTags" :key="tag.tagId">
              <input 
                type="checkbox" 
                :id="'check-' + tag.tagId"
                :value="tag.tagId"
                v-model="selectedTagIds"
              />
              <label :for="'check-' + tag.tagId">
                <span>{{ tag.tagName }}</span>
              </label>
            </li>
            <li v-if="clazzTags.length === 0" class="hi-nodata sm">
              <p>등록된 태그가 없습니다. </p>
            </li>
          </ul>
          <div class="btns" v-if="clazzTags.length > 0">
            <HiButton color="primary" outline size="sm" @click="closeSelectBox">취소</HiButton>
            <HiButton
                color="primary"
                size="sm"
                @click="search({
                  searchType: selectedTagIds.length > 0 ? 'TAG_MULTI' : 'NONE',
                  searchValue: selectedTagIds.length > 0 ? selectedTagIds : ''
                })"
            >
              확인
            </HiButton>
          </div>
        </div>
      </template>
    </HiSelectBox>
  </div>
</div>
</template>

<script>
import MemberSearchInput from "@/components/Search/MemberSearchInput";
export default {
  name: "member-search",
  components: {MemberSearchInput},
  data() {
    return {
      filteredSuggestions: [],
      isAutocompleteVisible: false,
      oldSelectedTagIds: [],
      selectedTagIds: []
    };
  },
  props: {
    clazzTags: {
      type: Array
    },
    inputPlaceholder: {
      type: String,
      default: '이름, #태그 검색'
    },
    useTag: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    openSelectBox() {
      this.oldSelectedTagIds = [...this.selectedTagIds];
    },
    closeSelectBox() {
      this.selectedTagIds = [...this.oldSelectedTagIds];
      this.$refs.hiSelectBox.close();
    },
    search({ searchType, searchValue }) {
      if (searchType === 'TAG_MULTI') {
        this.$refs.memberSearchInput.clearSearch(false);
        this.$refs.memberSearchInput.clearSelectedTag(false);
      } else {
        this.selectedTagIds = [];
      }
      this.$refs.hiSelectBox && this.$refs.hiSelectBox.close();
      this.$emit('search', { searchType, searchValue });
    },
  },
}
</script>

<style lang="scss">
.member-search{
  .hi-tooltip-wrap{
    right:50%;
    transform: translate(0, -50%);
    top: 16px;
    position: absolute;
    .hi-tooltip{
      padding: 3px 10px 1px;
      background-color: rgba(61, 70, 85, 0.8);
      &::before{
        border-bottom: 5px solid rgba(61, 70, 85, 0.8);
        bottom: -5px !important;
      }
    }
  } 
}

//하이톡 > 일괄메시지 작성
//하이톡 > 대상선택하기
//하이톡 > 단체방
.hitalk{
  .select-target-wrap{
    overflow: visible;
  }
}   

//하이톡 공유
.area-hitalk-share{
  .select-target-wrap{overflow: visible;}
  .hi-tooltip-wrap{
    top: 16px;
    z-index: 1;
  }
}

//응답자 명단 
.area-remind-push{
  .select-target-wrap{
    overflow: visible;
    .member-search .hi-tooltip-wrap{right:155px;}
    .member-search.full .hi-tooltip-wrap{right:265px;}
  }
}

// 리마인드 푸시보내기
.modal-remind-push{
  .member-search .hi-tooltip-wrap{display: none;}
}

//설문 > 설문 대상 선택
.hi-modal-common.modal-select-target.modal-add-guide{
  .select-target-wrap{overflow: visible;}
}
          
//읽기 권한 추가/해제
.admin-option__box .readable_manage{  
  .select-target-wrap{overflow: visible;}
  .hi-tooltip-wrap{
    left: 183px;
    top: 16px;
    position: absolute;
    width: 0;
    height: 0;
    &:hover{
      background: none;
      width: 0;
      height: 0;
    }
    .hi-tooltip{
      padding: 3px 10px 1px;
      left:auto;
      &:hover{
        transform: translate(-50%, 0);
        top: auto;
        bottom: calc(100% + 15px);
        left: 50%;
        padding: 3px 10px 1px;
      }
    }
  } 
}

// 출결 알리기
.attendance-search-group{
 .member-search .hi-tooltip-wrap {
    top: 3px;
    z-index: 2;
  }
}

// 학교양식신청서
.form-managemnet-cont-wrap{
  .member-search{
    .hi-tooltip-wrap{
      top: 8px;
      z-index: 1;
    }
  }
}

</style>
<style lang="scss" scoped>
.member-search{
  background-color: #f8f9fc;
  padding: 10px 16px;
  border-bottom:1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  border-radius: 4px 4px 0 0;

  // 2025-02-20 - #71977 학교양식신청서 및 설문 > 학반(태그) 추가  타입 추가
  &.type01{
    background: none;
    border-bottom:0;
    padding:0;
  }
}
.search-box{
  flex-grow: 1;
  position:relative;
  .auto-keyword-list{
    left:0;
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
        .tit{
          font-size: 14px;
          font-weight: 600;
          padding: 14px 15px;
          text-align: left;
          width: 100%;
          color:#222;    
          margin-bottom: 0px;
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
        .hi-nodata{padding-bottom:10px;}
      }
    }  
  }
}

</style>