<template>
<div class="m-search-area">
  <div class="m-top-search">
    <input
      type="search"
      placeholder="궁금한 점을 검색해보세요"
      v-model="searchForm._keyword"
      @keydown.enter.prevent.stop="getSearch()"
    />
    <button
      v-if="!option.isSearchResult"
      class="m-btn-search"
      @click="getSearch()"
    >
      검색
    </button>
    <!-- <button v-else class="m-btn-delete-c" @click="setInit()">삭제</button> -->
    <HiButton v-else color="link" @click="setInit()" title="삭제" class="m-btn-delete">
      <HiIcon name="ico-close3" color="white" bgColor="default" size="10" rounded="rounded"/>
    </HiButton>
  </div>
</div>
</template>

<script>
export default {
  data() {
    return {
      searchForm: {
        _userType: this.$route.query.userType || 'TEACHER',
        _helpFaqCategory: null,
        _keyword: '',
        _used: true,
        page: parseInt(process.env.VUE_APP_BASE_PAGE_START, 10),
        size: 100,
        sort: 'priority,desc'
      },
    }
  },
}
</script>