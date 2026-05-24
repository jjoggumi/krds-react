<!--
@File(Method): MobileHelpSearchAndCategory.vue
@Author: 권영준
@Date Created: 2024-12-17
@Description: 자주 묻는 질문 > 카테고리 컴포넌트
-->

<template>
  <div class="m-category">
    <HiButton class="item" color="default" size="sm" outline
      v-for="item of items.categories"
      :key="item.currentId"
      :class="{ selected: item.currentId === option.faqCategoriCurrentId }"
      @click="setFaqCategoriId(item)">
      <span>{{ item.categoryTitle }}</span>
    </HiButton>
  </div>
</template>               

<script>
export default {
  name: "MobileHelpSearchAndCategory",
  props: {
    items: Object,
    option: {
      type: Object,
      default: () => ({})
    },
  },
  methods: {
    setInit() {
      this.$emit('setInit');
    },
    setFaqCategoriId(item) {
      this.$emit('setFaqCategoriId', item);
    },
  },
}
</script>
<style lang="scss" scoped>

</style>