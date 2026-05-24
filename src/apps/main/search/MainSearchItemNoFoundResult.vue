<template>
  <div class="search-result-empty">
    <p class="text-result">{{ titleMsg }}</p>
    <p v-if="searchKeyword">{{ resultText }}</p>
  </div>
</template>

<script>
export default {
  name: "MainSearchItemNoFoundResult",
  data: () => ({
    isShowIcon: false,
    resultText: "",
    searchKeyword: ''
  }),
  watch: {
    $route() {
      this.init();
    }
  },
  methods: {
    init() {
      this.searchKeyword = this.$route.query.searchKeyword || null;
      const hasSearchKeyword = this.searchKeyword !== undefined && this.searchKeyword !== null

      if (hasSearchKeyword) {
        this.resultText = "검색어를 확인해주세요.";
      }
    }
  },
  computed: {
    titleMsg() {
      if (this.$route.query.searchType === 'class_school' && !this.searchKeyword) {
        return "클래스나 학교에 가입하시려면 상단 검색필드에 클래스/학교 명으로 검색해보세요."
      } else {
        return this.searchKeyword ? `'${this.searchKeyword}' 에 대한 검색결과가 없습니다.` : `등록된 게시물이 없습니다.`
      }
    }
  },
  created() {
    this.init();
  }
};
</script>

<style scoped></style>