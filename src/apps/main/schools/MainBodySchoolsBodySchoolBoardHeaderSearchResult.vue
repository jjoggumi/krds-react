<template>
  <div class="board__filter">
    <div class="group-filter-sub">
      <p class="text-search-result">
        <span>{{ curSchoolSearchQuery.keyword }}</span>검색결과</p>
    </div>

    <!-- TODO: 2022-09-20 최신순으로 정렬 토글
    <div class="group-filter-latest">
      <input type="checkbox" id="latest">
      <label for="latest"><span>최신순</span></label>
    </div>
    -->

  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "main-body-schools-body-school-board-header-search-result",
  props: {
  },
  computed: {
    ...mapState({
      curSchoolSearchQuery: 'curSchoolSearchQuery',
    })
  }
}
</script>

<style scoped>

</style>