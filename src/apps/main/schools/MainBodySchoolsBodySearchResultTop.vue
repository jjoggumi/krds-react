<template>
  <div class="search-result-wrap">
    <span>{{ curSchoolSearchQuery.keyword }}</span> 검색 결과
  </div>
</template>

<script>
import {mapFields} from "vuex-map-fields";

export default {
  name: "main-body-schools-body-search-result-top",
  computed: {
    ...mapFields({
      curSchoolSearchQuery: 'curSchoolSearchQuery'
    }),
  }
}
</script>

<style scoped>

</style>