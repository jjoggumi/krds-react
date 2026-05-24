<template>
  <div class="scrap-cont-wrap clfix">
    <div class="left-wrap">
      <div class="search-result-empty">
        <div class="img-wrap">
          <img src="@/assets/img/icon_join_class_no_result_72.png" alt />
        </div>
        <div class="text-wrap">
          <p>{{ text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MainBodyMypageScrapNoSearchItem",
  props: {
    text: String
  }
};
</script>

<style scoped></style>