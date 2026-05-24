<template>
  <div class="m-wrap">
    <div class="m-container">
      <div class="m-area-list m-write-list">
        <p class="m-question-empty">문의 이력이 없습니다.</p>
      </div>
    </div>
    <button class="m-new-write" @click="$emit('is-Write', true)">새글쓰기</button>
  </div>
</template>

<script>
export default {
  name: "MobileHelpQuestionNotFound"
};
</script>
<!--<style scoped src="../../../../assets/css/m-customer.css" />-->