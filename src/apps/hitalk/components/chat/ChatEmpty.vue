<template>
  <div class="explanation-cont-wrap empty-wrap">
    <div class="draggable-area"></div>
    <div class="img-wrap">
      <img src="@/assets/img/cov_ex_new.png" alt="">
    </div>
    <div class="text-wrap">
      <p>모두의 개인정보를 보호하면서 선생님과 가정에서<br>간편하게 소통할 수 있는 하이톡(채팅), 하이콜(전화)를 이용해 보세요.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChatEmpty"
}
</script>

<style scoped>

.draggable-area {
  position: absolute;
  width: 100%;
  height: 15px;
  top: 0px;
  -webkit-app-region: drag;
  z-index: 100;
  display: none;
}
</style>