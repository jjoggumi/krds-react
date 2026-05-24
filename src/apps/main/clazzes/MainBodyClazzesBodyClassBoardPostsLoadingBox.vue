<!--
@File(Method): MainBodyClazzesBodyClassBoardPostsLoadingBox.vue
@Author: -
@Date Created: -
@Description: 
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
@ETC : 23개월전 수정된 파일로 현재 사용하는지 여부 알수 없음. 
-->

<template>
  <div class="loading-cont-wrap page-class-loading">
    <ul>
      <li v-for="i of 5" :key="i">
        <div class="loading-box">
          <div class="loading-text-wrap">
            <div class="loading-text text1"></div>
            <div class="loading-text text2"></div>
          </div>
          <div class="loading-text-wrap">
            <div class="loading-text text3"></div>
            <div class="loading-text text4"></div>
            <div class="loading-text text5"></div>
            <div class="loading-text text6"></div>
            <div class="loading-text text7"></div>
            <div class="loading-text text8"></div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "main-body-clazzes-body-class-board-posts-loading-box",
  data: () => ({}),
  components: {},
  methods: {},
  created: function() {}
};
</script>

<style scoped>
.loading-cont-wrap .loading-box {position:relative;border-radius:8px;background:#fff;border:1px solid #e0e0e0;box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.05);}
.loading-cont-wrap .loading-text {width:100%;height:16px;background:#f5f5f5;}
.loading-cont-wrap .loading-text + .loading-text {margin:5px 0 0 0;}

.loading-cont-wrap.page-class-loading ul li .loading-box {width:100%;height:324px;padding:25px;}
.loading-cont-wrap.page-class-loading ul li + li {margin:20px 0 0 0;}
.loading-cont-wrap.page-class-loading ul li .loading-text-wrap + .loading-text-wrap {margin:30px 0 0 0;}
.loading-cont-wrap.page-class-loading ul li .loading-text.text1 {width:90%;}
.loading-cont-wrap.page-class-loading ul li .loading-text.text2 {width:200px;}
.loading-cont-wrap.page-class-loading ul li .loading-text.text3 {width:389px;}
.loading-cont-wrap.page-class-loading ul li .loading-text.text4 {width:337px;}
.loading-cont-wrap.page-class-loading ul li .loading-text.text5 {width:378px;}
.loading-cont-wrap.page-class-loading ul li .loading-text.text6 {width:425px;}
.loading-cont-wrap.page-class-loading ul li .loading-text.text7 {width:369px;}
.loading-cont-wrap.page-class-loading ul li .loading-text.text8 {width:200px;}
</style>
