<template>
  <div
    class="input-box-wrap round-search-box search-box-wrap"
    :class="{
      'focus': isFocuscontentKeyword
    }"
  >
    <input
      type="text"
      name="contentKeyword"
      v-model="contentKeyword"      
      @keydown.enter.prevent.stop="goSearch"
      :placeholder="$t('main.schools.rnb.searchKeyword.placeholder')"
      @focus="isFocuscontentKeyword = true"
      @blur="isFocuscontentKeyword = false"
    />
    <button class="search-btn" v-on:click="goSearch"></button>
    <button
      class="input-text-delete-btn"
      v-if="contentKeyword"
      :style="{ display : 'inline-block' }"
      @click="clearKeyword"
    ></button>
  </div>
</template>

<script>
export default {
  name: "mainBodySchoolsRnbSearchContent",
  props: ["schoolUuid"],
  data: () => ({
    isFocuscontentKeyword: false,
    contentKeyword: ""
  }),
  watch: {
    $route() {
      this.init();
    }
  },
  methods: {
    init: function() {
      if (this.$route.query.contentKeyword === undefined)
        this.contentKeyword = "";
      else this.contentKeyword = this.$route.query.contentKeyword;
    },
    goSearch: function() {
      if (this.contentKeyword === undefined || this.contentKeyword === "") {
        this.$log.debug(`this.contentKeyword => ${this.contentKeyword}`);
        alert("게시글 검색어를 입력해 주세요.");
        return false;
      }
      this.searchRoute();
    },
    clearKeyword() {
      this.contentKeyword = "";
      this.searchRoute();
    },
    searchRoute() {
      this.$router.push({
        path: "/main/schools/" + this.schoolUuid,
        query: { contentKeyword: this.contentKeyword }
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>