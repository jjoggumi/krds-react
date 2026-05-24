<!--
@File(Method): MainHeaderSearchLayer.vue
@Description: 검색 레이어
@Modified: header v2 적용으로 파일 미사용중
-->
<template>
  <div
    class="header-search-layer show"
    style="display: block;"
  >
    <hc-input-search-box
        :searchKeyword.sync="model.searchKeyword"
        :isNavSearchBar="true"
        @close-layer="closeLayer"
    />
    <div class="dim" @click="closeLayer"></div>
  </div>
</template>

<script>
import HcInputSearchBox from "@/components/Form/HcInputSearchBox";
export default {
  name: "main-header-search-layer",
  components: {HcInputSearchBox},
  data() {
    return {
      model: {
        searchKeyword: ''
      }
    }
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    closeLayer() {
      this.$emit('hide-search-layer')
    },
  }
}
</script>

<style scoped>

</style>