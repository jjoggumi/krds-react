<!--
@File(Method): MobileHelpQuestionNotFound.vue
@Date Created: -
@Description: 1:1문의하기 > nodata
@Modified: 2024-12-17 - #70648 1:1문의하기 웹뷰 
-->

<template>
  <div class="m-wrap">
     <!-- #70648 header 추가 -->
     <header class="m-header">
      <HiButton class="m-btn-left" color="link" @click="$emit('close')">
        <HiIcon name="ico-prev" size="24" class="p-05"/>
      </HiButton>
      <h1>나의 문의 이력</h1>
      <HiButton class="m-btn-right" color="link" @click="$emit('is-Write')">문의하기</HiButton>
    </header>
    <div class="m-container">
      <div class="m-area-list">
        <div class="hi-nodata">
          <p>문의 이력이 없습니다.</p>
        </div>
      </div>
    </div>
    <!--  #70648 header로 이동  <button class="m-new-write" @click="$emit('is-Write')">새글쓰기</button> -->
  </div>
</template>

<script>
export default {
  name: "MobileHelpQuestionNotFound"
};
</script>