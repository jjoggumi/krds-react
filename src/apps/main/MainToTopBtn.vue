<!--
@File(Method): MainToTopBtn.vue
@Description: top 플로팅 버튼
@Modified: css scope 처리
-->
<template>
  <div
    class="page-scrollTop-btn"
    :style="{
      'margin-left': calcMarginLeft
    }"
  >
    <button class="icon" @click="scrollToTop">
      <span>TOP</span>
    </button>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "mainToTopBtn",
  components: {},
  data: () => ({}),
  computed: {
    ...mapGetters({
      isMobile: 'isMobile'
    }),
    calcMarginLeft() {
      return this.isMobile ? '300px' : '540px'
    }
  },
  methods: {
    scrollToTop() {
      this.$scrollTo("body");
    }
  },
  created: function() {}
};
</script>

<style scoped lang="scss">
.page-scrollTop-btn {
  z-index: 1;
  position: fixed;
  bottom: 50px;
  left: 50%;
  margin-left: 540px;

  button {
    width: 84px;
    height: 36px;
    border-radius: 18px;
    border: 2px solid #fff;
    background: rgba(255, 255, 255, 0.8);
    font-size: 0;
    box-shadow: 0px 4px 12px 0 rgba(7, 43, 71, 0.24);

    &:hover {
      background: #fff;
    }
    &:before {
      content: "";
      display: inline-block;
      width: 24px;
      height: 24px;
      margin: 0 3px 0 0;
      background: url('~@/assets/img/icon_scroll_top_24.png');
      vertical-align: middle;
    }
    span {
      font-size: 16px;
      font-weight: 400;
    }
  }
}
</style>
