<template>
  <div class="customer-notice-cont-wrap">
    <div class="school-class-cont-top mt-30">
      <button class="new-btn btn-bg-c icon" @click="$emit('is-Write', true)">
        <span>문의 작성하기</span>
      </button>
    </div>
    <div class="cont-empty-wrap">
      <div class="img-wrap">
        <img src="@/assets/img/icon_cont_empty_face_108.png" alt />
      </div>
      <div class="text-wrap">
        <p>문의 이력이 없습니다..</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HelpQuestionNotFound"
};
</script>
