<template>
  <div
      class="search-post-result-list"
      v-infinite-scroll="$parent.doSearch"
      :infinite-scroll-disabled="searchPosts.paging.isBusy"
      :infinite-scroll-distance="searchPosts.paging.scrollLimit"
  >
    <template v-if="searchPosts.posts.length > 0">
      <MainPostsSearchItem
          v-for="post of searchPosts.posts"
          :key="post.currentId"
          :post="post"
      />
    </template>
    <div
        v-else-if="searchPosts.scrollOption.isSearchEnd"
        class="search-post-result-empty-wrap"
    >
      <MainSearchItemNoFoundResult/>
    </div>
  </div>
</template>

<script>
import MainPostsSearchItem from "@/apps/main/search/MainPostsSearchItem";
import MainSearchItemNoFoundResult from "@/apps/main/search/MainSearchItemNoFoundResult";
export default {
  name: "mainPostsSearchBody",
  components: {
    MainPostsSearchItem,
    MainSearchItemNoFoundResult
  },
  props: {
    searchPosts: {
      type: Object
    }
  }
}
</script>

<style scoped>

</style>