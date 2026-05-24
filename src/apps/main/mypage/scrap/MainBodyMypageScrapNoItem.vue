<template>
  <div class="cont-empty-wrap">
    <div class="img-wrap">
      <img src="@/assets/img/icon_cont_empty_face2_108.png" alt />
    </div>
    <div class="text-wrap">
      <p>{{ text }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "main-body-mypage-scrap-no-item",
  props: {
    text: String
  }
};
</script>

<style scoped></style>