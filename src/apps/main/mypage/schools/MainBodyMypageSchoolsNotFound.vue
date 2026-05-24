<template>
  <div class="cont-empty-wrap">
    <div class="img-wrap">
      <img src="@/assets/img/icon_cont_empty_face2_108.png" alt="" />
    </div>
    <div class="text-wrap">
      <p>구독 중인 학교 목록이 없습니다.</p>
      <p v-if="!isHideSearchButton">
        우리 아이 학교를 검색해서 소식을 받아보세요.
      </p>
    </div>
    <div
      v-if="!isHideSearchButton"
      class="btn-wrap"
    >
      <button
        class="btn-bg-w2"
        @click="goPage('/main/search?searchType=class_school')"
      >
        학교 찾기
      </button>
    </div>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "main-body-mypage-schools-not-found",
  computed: {
    ...mapGetters({
      isEmptyClassSubscriptionAndTempStudent: 'isEmptyClassSubscriptionAndTempStudent'
    }),
    isHideSearchButton() {
      return this.isEmptyClassSubscriptionAndTempStudent
    }
  },
  methods: {
    goPage(path) {
      this.$router.push(path);
    }
  },
  created() {}
};
</script>

<style scoped></style>
