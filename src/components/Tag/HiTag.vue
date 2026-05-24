<!--
@File(Method): HiTag.vue
@Author: -
@Date Created: -
@Description: 태그 컴포넌트
@Modified: 2025-01-06 - #69560 구성원 관리 태그 추가 : 태그 컴포넌트 추가
-->
<template>
   <span
    class="hi-tag"
    :class="{ isActive , isEdit, isError }"
  >
    {{ includeHash ? `#${tag}` : tag }}
    <button @mousedown.prevent="onRemoveTag" class="remove-btn hi-btn btn-link">
      <HiIcon name="ico-close" color="white" bgColor="default" rounded="rounded" size="18"/>
    </button>
  </span>
</template>
<script>
export default {
  name: "HiTag",
  props: {
    tag: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    isError: {
      type: Boolean,
      default: false,
    },
    includeHash: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    onRemoveTag() {
      this.$emit("remove", this.tag);
    },
  },
};
</script>

<style scoped lang="scss">
.hi-tag {
  background-color: #EBEEF4;  
  border: 1px solid #EBEEF4;
  padding: 0px 10px 0px;
  border-radius: 50px;
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  color:#616161;
  white-space: nowrap;
  z-index: 1;
  height: 28px;

  .remove-btn{
    margin-left: 5px;
    cursor: pointer;
    display: none;
    i {
      width: 12px;
      height: 12px;
      min-width: 12px;
      min-height: 12px;
      padding: 1px;    
      background-color: #9e9e9e !important;
    }
  }

  &.isActive{
    background-color: rgba(71, 120, 222, 0.20);
    color: var(--primary);
    border-color: var(--primary);
    .remove-btn{
      color: var(--primary);
      i {
        background-color: var(--primary) !important;
      }
    }
  }

  &.isError{
    background-color: rgba(#EC1F2D, 0.20);
    color: #EC1F2D;
    border-color: #EC1F2D;
    .remove-btn{
      color: #EC1F2D;
      i {
        background-color: #EC1F2D !important;
      }
    }
  }

  &.isEdit{
    padding-right:5px;
    .remove-btn{
      display: block;
    }
  }  
}
</style>